# Prescription Refill Automation - Setup Guide

## 🎯 Overview

This guide walks you through deploying the **Prescription Refill AI Assistant** automation. Follow these steps in order to ensure a smooth setup.

**Total Setup Time**: 2-3 hours
**Technical Level**: Intermediate (requires API configuration)
**Cost**: ~$300 setup + $50/month ongoing

---

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:

- [ ] n8n account (cloud or self-hosted)
- [ ] Google Workspace account with Sheets API enabled
- [ ] Twilio account (or ability to create one)
- [ ] Anthropic API account for Claude
- [ ] Slack workspace (for doctor approvals)
- [ ] Access to patient medication list (from EMR or manual export)
- [ ] **Doctor approval of clinical protocols** (see [REFILL_AI_PROTOCOL.md](REFILL_AI_PROTOCOL.md))

---

## PART 1: Google Sheets Setup (30-45 minutes)

### Step 1.1: Create New Sheets

1. Open your existing Google Sheets workbook (the one with "Appointments" sheet from Automations 1-3)
2. Create **two new sheets**:
   - Sheet name: `Refill_Requests` (exact spelling, case-sensitive)
   - Sheet name: `Medications` (exact spelling, case-sensitive)

### Step 1.2: Set Up Refill_Requests Sheet

**Add column headers in Row 1**:
```
A: Request_ID
B: Patient_Name
C: Patient_ID
D: Phone
E: Medication
F: Request_Text
G: Request_Date
H: Decision
I: AI_Reasoning
J: AI_Confidence
K: Pharmacy_Status
L: Patient_Notified
M: Processed_By
N: Flags
O: Notes
P: Processed_Date
```

**Add sample row in Row 2** (for testing):
```
A2: REFILL-TEST-001
B2: Test Patient
C2: PT-TEST
D2: +15555550000
E2: Lisinopril 10mg
F2: Test refill request
G2: 01/27/2026 14:30:00
H2: AUTO-APPROVE
I2: Test reasoning
J2: 0.95
K2: Sent
L2: Yes
M2: AI Auto-Approve
N2:
O2: Test note
P2: 01/27/2026 14:32:00
```

**Apply conditional formatting** (optional but recommended):
- Select column H (Decision)
- Format → Conditional formatting
- Rule 1: Text is exactly `AUTO-APPROVE` → Light green background
- Rule 2: Text is exactly `NEEDS-APPROVAL` → Light yellow background
- Rule 3: Text is exactly `ESCALATE` → Light red background

### Step 1.3: Set Up Medications Sheet

**Add column headers in Row 1**:
```
A: Medication_ID
B: Patient_ID
C: Patient_Name
D: Medication_Name
E: Dosage
F: Frequency
G: Last_Filled_Date
H: Refills_Remaining
I: Controlled_Substance
J: Schedule
K: Prescriber
L: Pharmacy
M: Pharmacy_NCPDP
N: Pharmacy_Phone
O: Status
P: Start_Date
Q: End_Date
R: Notes
```

**Add sample medications** (for testing):

**Row 2** (Auto-approve eligible):
```
A2: MED-TEST-001
B2: PT-TEST
C2: Test Patient
D2: Lisinopril
E2: 10mg tablet
F2: Once daily
G2: 12/28/2025
H2: 3
I2: No
J2: N/A
K2: Dr. Jennifer
L2: CVS Pharmacy #12345
M2: 1234567
N2: +18005551234
O2: Active
P2: 06/15/2024
Q2:
R2: For hypertension
```

**Row 3** (Controlled substance - will escalate):
```
A3: MED-TEST-002
B3: PT-TEST2
C3: Test Patient 2
D3: Oxycodone
E3: 5mg tablet
F3: Every 6 hours as needed
G3: 01/20/2026
H3: 1
I3: Yes
J3: II
K3: Dr. Jennifer
L3: CVS Pharmacy #12345
M3: 1234567
N3: +18005551234
O3: Active
P3: 01/05/2026
Q3:
R3: Post-surgical pain
```

### Step 1.4: Get Google Sheet ID

1. In your Google Sheet, look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/1abc123XYZ456/edit
   ```
2. Copy the ID between `/d/` and `/edit`: `1abc123XYZ456`
3. **Save this ID** - you'll need it for n8n environment variables

**Complete**: [REFILL_GOOGLE_SHEET_COLUMNS.md](REFILL_GOOGLE_SHEET_COLUMNS.md) has full details on sheet structure.

---

## PART 2: Twilio Setup (15 minutes)

### Step 2.1: Create Dedicated Refill Phone Number

**Option A: New Twilio Account**
1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for free trial ($15 credit)
3. Verify your email and phone

**Option B: Existing Twilio Account**
1. Log into Twilio console
2. Navigate to Phone Numbers → Buy a Number

### Step 2.2: Purchase Phone Number

1. Click "Buy a Number"
2. **Search criteria**:
   - Country: United States
   - Capabilities: SMS ✅
   - Type: Local (cheaper) or Toll-Free (more professional)
3. **Recommended**: Search for memorable number like `555-REFILLS` if available
4. Purchase number ($1/month for local, $2/month for toll-free)

### Step 2.3: Get Twilio Credentials

1. In Twilio console, navigate to **Account → Account Info**
2. Copy these values:
   - **Account SID**: (starts with `AC...`)
   - **Auth Token**: (click "View" to reveal)
3. **Save these** - you'll need them for n8n credentials

### Step 2.4: Configure Webhook (Later Step)

**Note**: We'll configure the webhook URL after importing workflows to n8n (Part 4). For now, just have the phone number ready.

**Cost Summary**:
- Phone number: $1-2/month
- SMS: $0.0075 per message (inbound + outbound)
- Estimated monthly: ~$10 for 40 requests/day (80 SMS/day)

---

## PART 3: Anthropic API Setup (10 minutes)

### Step 3.1: Create Anthropic Account

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up with email
3. Verify email address

### Step 3.2: Get API Key

1. Navigate to **API Keys** in console
2. Click **Create Key**
3. Name: `n8n-refill-automation`
4. Copy the API key (starts with `sk-ant-...`)
5. **Save securely** - you won't be able to see it again

### Step 3.3: Add Credits

1. Navigate to **Billing**
2. Add payment method
3. Set up billing:
   - **Pay-as-you-go** recommended for medical practice
   - **Budget alert**: Set to $100/month (should only use ~$20)

### Step 3.4: Request HIPAA BAA (Important!)

1. Email [privacy@anthropic.com](mailto:privacy@anthropic.com)
2. Subject: "HIPAA BAA Request for Medical Practice"
3. Body:
   ```
   Hello,

   I'm deploying Claude AI for prescription refill triage in a medical
   practice. We need a signed Business Associate Agreement (BAA) for
   HIPAA compliance.

   Organization: [Your Practice Name]
   Use Case: Prescription refill request triage
   Expected API usage: ~1,200 requests/month

   Please send BAA for review and signature.

   Thank you,
   [Your Name]
   ```
4. **Timeline**: BAA typically provided within 3-5 business days
5. **Do NOT go live with PHI until BAA is signed**

**Cost Summary**:
- API usage: ~$0.015 per request
- 40 requests/day = $18/month
- Model: Claude 3.5 Sonnet (best for medical reasoning)

---

## PART 4: n8n Workflow Import (20 minutes)

### Step 4.1: Import Workflows

1. Log into your n8n instance
2. Navigate to **Workflows** tab

**Import workflow 1**:
3. Click **+ New Workflow**
4. Click **⋮** (three dots) → **Import from File**
5. Select `refill-request-receiver.json`
6. Workflow imports successfully

**Import workflow 2**:
7. Repeat steps 3-5 with `refill-ai-triage.json`

**Import workflow 3**:
8. Repeat steps 3-5 with `refill-processor.json`

### Step 4.2: Get Workflow IDs

After importing, you need the workflow IDs for inter-workflow calls:

1. Open **refill-ai-triage** workflow
2. Look at URL:
   ```
   https://[your-n8n].app.n8n.cloud/workflow/abc123xyz
   ```
3. Copy the ID: `abc123xyz`
4. **Save as**: `REFILL_AI_TRIAGE_WORKFLOW_ID`

### Step 4.3: Enable Workflows

**Important**: Keep workflows INACTIVE for now. We'll activate after configuration is complete.

---

## PART 5: n8n Credentials Setup (30 minutes)

### Step 5.1: Google Sheets OAuth2

1. In n8n, go to **Credentials** → **+ Add Credential**
2. Select **Google Sheets OAuth2 API**
3. Click **Connect my account**
4. Sign in with your Google Workspace account
5. Grant permissions to n8n
6. Test connection → Should show ✅ "Connected"
7. **Save** credential

### Step 5.2: Twilio API

1. **Credentials** → **+ Add Credential**
2. Select **Twilio API**
3. Enter:
   - **Account SID**: (from Part 2.3)
   - **Auth Token**: (from Part 2.3)
4. Test connection → ✅
5. **Save** credential

### Step 5.3: Anthropic API

1. **Credentials** → **+ Add Credential**
2. Select **Anthropic API** (or create custom HTTP Auth if not available)
3. Enter:
   - **API Key**: (from Part 3.2)
4. **Save** credential

### Step 5.4: Slack API

1. First, create Slack app (see Part 6)
2. Then return here to add credential:
   - **Credentials** → **+ Add Credential**
   - Select **Slack OAuth2 API**
   - Enter **OAuth Access Token** (from Slack app)
   - Test connection → ✅
   - **Save**

---

## PART 6: Slack Integration Setup (45 minutes)

See complete guide: [REFILL_SLACK_INTEGRATION.md](REFILL_SLACK_INTEGRATION.md)

**Quick summary**:

### Step 6.1: Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. App Name: `Dr. Jennifer Refill Assistant`
4. Workspace: Select your practice's workspace

### Step 6.2: Configure Permissions

1. Navigate to **OAuth & Permissions**
2. Add **Bot Token Scopes**:
   - `chat:write`
   - `chat:write.public`
3. Click **Install to Workspace**
4. Copy **Bot User OAuth Token** (starts with `xoxb-...`)

### Step 6.3: Create Channels

1. In Slack, create two private channels:
   - `#refill-approvals` (for routine approvals)
   - `#urgent-refills` (for escalations)
2. Invite the bot to both channels: `/invite @Dr. Jennifer Refill Assistant`

### Step 6.4: Configure Interactive Messages (Optional - for Approve/Deny buttons)

This enables doctor to click buttons instead of manually processing:

1. In Slack App settings, go to **Interactivity & Shortcuts**
2. Toggle **Interactivity**: ON
3. **Request URL**: `https://[your-n8n].app.n8n.cloud/webhook/slack-refill-approval`
4. **Save Changes**

**Note**: This requires building a separate webhook workflow to handle button clicks. See [REFILL_SLACK_INTEGRATION.md](REFILL_SLACK_INTEGRATION.md) for details.

---

## PART 7: Environment Variables Setup (15 minutes)

### Step 7.1: Add Variables to n8n

In each workflow, set these environment variables:

1. Open **refill-request-receiver** workflow
2. Click **⋮** → **Settings** → **Environment Variables**
3. Add each variable:

| Variable Name | Example Value | Where to Get |
|---------------|---------------|--------------|
| `GOOGLE_SHEET_ID` | `1abc123XYZ456` | Part 1.4 |
| `TWILIO_REFILL_PHONE_NUMBER` | `+15555551234` | Part 2.2 (your purchased number) |
| `REFILL_AI_TRIAGE_WORKFLOW_ID` | `abc123xyz` | Part 4.2 |
| `PHARMACY_API_URL` | `https://mock-pharmacy-api.example.com/refill` | Part 8 (use mock for testing) |
| `PRESCRIBER_NPI` | `1234567890` | Dr. Jennifer's NPI number |
| `OFFICE_PHONE` | `+15555551234` | Practice main phone |
| `OFFICE_FAX` | `+15555551235` | Practice fax number |
| `DEFAULT_PHARMACY_NCPDP` | `1234567` | Default pharmacy 7-digit ID |
| `DEFAULT_PHARMACY_NAME` | `CVS Pharmacy #12345` | Default pharmacy name |
| `DEFAULT_PHARMACY_PHONE` | `+18005551234` | Default pharmacy phone |
| `SLACK_DOCTOR_CHANNEL` | `#refill-approvals` | Channel for routine approvals |
| `SLACK_URGENT_CHANNEL` | `#urgent-refills` | Channel for escalations |
| `STAFF_ALERT_PHONE` | `+15555559999` | Staff on-call phone for urgent alerts |

### Step 7.2: Repeat for Other Workflows

Copy the same environment variables to:
- **refill-ai-triage** workflow
- **refill-processor** workflow

**Tip**: n8n Cloud allows global environment variables. If available, set once instead of per-workflow.

---

## PART 8: Pharmacy API Setup (Mock for Testing)

### Option A: Use Mock API (Recommended for Initial Testing)

**For testing, use a mock endpoint that returns simulated success**:

1. Set `PHARMACY_API_URL` to: `https://webhook.site/unique-id`
2. Go to [webhook.site](https://webhook.site) to generate a unique test URL
3. Copy your unique URL
4. Use this in environment variable
5. When workflow sends to "pharmacy", you'll see the request in webhook.site dashboard

**Response simulation**: The mock just logs requests, doesn't send to real pharmacy.

### Option B: Surescripts Production API (After Testing Complete)

See complete guide: [REFILL_PHARMACY_INTEGRATION.md](REFILL_PHARMACY_INTEGRATION.md)

**Requirements**:
- Surescripts account ($500-1000/month base fee)
- Provider enrollment (30-60 days)
- DEA registration verification
- E-prescribing certification

**When ready for production**:
1. Contact Surescripts: [surescripts.com/contact](https://surescripts.com/contact)
2. Complete onboarding process
3. Get production API endpoint + credentials
4. Update `PHARMACY_API_URL` environment variable
5. Add Surescripts API credentials to n8n

---

## PART 9: Configure Twilio Webhook (10 minutes)

Now that workflows are imported, configure Twilio to send incoming SMS to n8n:

### Step 9.1: Get n8n Webhook URL

1. Open **refill-request-receiver** workflow in n8n
2. Click on the **Webhook** node (first node in workflow)
3. Click **Copy Webhook URL**
4. Example: `https://[your-n8n].app.n8n.cloud/webhook/refill-sms-receiver`

### Step 9.2: Configure Twilio Phone Number

1. Log into Twilio console
2. Navigate to **Phone Numbers** → **Manage** → **Active Numbers**
3. Click on your refill phone number
4. Scroll to **Messaging Configuration**
5. **A MESSAGE COMES IN**:
   - Webhook: Paste n8n webhook URL
   - HTTP Method: POST
6. **Save**

### Step 9.3: Test SMS Reception

1. Send test SMS to your Twilio refill number:
   ```
   Test message
   ```
2. Check n8n **Executions** tab
3. You should see a new execution with the SMS data
4. If error occurs, check:
   - Webhook URL is correct in Twilio
   - Workflow is ACTIVE in n8n
   - Phone number is correct

---

## PART 10: Testing (60 minutes)

### Step 10.1: Activate Workflows

1. Open each workflow in n8n
2. Toggle **Active** switch to ON:
   - refill-request-receiver ✅
   - refill-ai-triage ✅
   - refill-processor ✅

### Step 10.2: Test Scenario 1 - Auto-Approve

**Setup**:
1. Add test patient to Medications sheet (if not already there):
   - Patient_ID: `PT-TEST`
   - Patient_Name: `Test Patient`
   - Phone: Use YOUR phone number in E.164 format (`+1XXXXXXXXXX`)
   - Medication_Name: `Lisinopril`
   - Dosage: `10mg`
   - Refills_Remaining: `3`
   - Controlled_Substance: `No`
   - Status: `Active`

2. Also add test patient to Patients sheet (from Automation 1):
   - Patient_ID: `PT-TEST`
   - Patient_Name: `Test Patient`
   - Phone: Same as above
   - Last_Visit_Date: Today's date

**Test**:
3. Send SMS to Twilio refill number:
   ```
   I need a refill for my lisinopril
   ```

**Expected Result**:
4. Within 2 minutes, you should receive SMS:
   ```
   ✅ Refill approved!

   Your prescription for Lisinopril 10mg has been sent to your pharmacy.

   It should be ready in 1-2 hours. You'll receive a text from the
   pharmacy when it's ready for pickup.

   - Dr. Jennifer's Office
   ```

5. Check Google Sheets **Refill_Requests**:
   - New row added with Decision = `AUTO-APPROVE`
   - AI_Reasoning explains why approved

6. Check n8n Executions:
   - All 3 workflows executed successfully
   - No errors in execution log

**If test fails**, see Troubleshooting section below.

---

### Step 10.3: Test Scenario 2 - Needs Approval

**Setup**:
1. Modify test patient's medication:
   - Change Refills_Remaining to `0`

**Test**:
2. Send SMS:
   ```
   Can I get a refill on my lisinopril?
   ```

**Expected Result**:
3. Patient receives:
   ```
   We received your refill request for Lisinopril 10mg.

   Your prescription needs a new authorization. Dr. Jennifer
   will review this today and we'll get back to you within
   2-4 hours.

   - Dr. Jennifer's Office
   ```

4. Doctor receives Slack message in `#refill-approvals` with:
   - Patient details
   - AI reasoning
   - Approve/Deny buttons (if interactive messages configured)

5. Google Sheets shows Decision = `NEEDS-APPROVAL`

---

### Step 10.4: Test Scenario 3 - Escalate (Controlled Substance)

**Setup**:
1. Add controlled substance to test patient:
   - Medication_Name: `Oxycodone`
   - Dosage: `5mg`
   - Refills_Remaining: `1`
   - Controlled_Substance: `Yes`
   - Schedule: `II`
   - Status: `Active`

**Test**:
2. Send SMS:
   ```
   I need more oxycodone
   ```

**Expected Result**:
3. Patient receives:
   ```
   We received your refill request.

   Due to the nature of this medication, a staff member
   will call you within 15 minutes to verify your request.

   - Dr. Jennifer's Office
   ```

4. Staff receives urgent SMS at `STAFF_ALERT_PHONE`:
   ```
   🚨 URGENT REFILL ESCALATION

   Patient: Test Patient
   Phone: +1XXXXXXXXXX
   Request: "I need more oxycodone"

   ⚠️ CONTROLLED SUBSTANCE
   ⚠️ SCHEDULE II OPIOID

   Action: Call patient immediately
   ```

5. Slack alert sent to `#urgent-refills`

6. Google Sheets shows Decision = `ESCALATE` with Flags = `controlled-substance`

---

### Step 10.5: Test Scenario 4 - Patient Not Found

**Test**:
1. From a phone number NOT in Patients sheet, send:
   ```
   I need a refill
   ```

**Expected Result**:
2. SMS response:
   ```
   We couldn't find your patient record in our system.

   Please call the office at (555) 555-1234 to verify
   your phone number and request a refill.

   - Dr. Jennifer's Office
   ```

3. No row added to Refill_Requests (patient lookup failed)

---

## PART 11: Production Deployment (30 minutes)

### Step 11.1: Populate Real Patient Data

**Option A: Manual Entry**
1. Export medication list from EMR
2. Clean up data (standardize medication names, dosages)
3. Import to Medications sheet

**Option B: Athenahealth FHIR API Sync**
1. See [ATHENAHEALTH_API_INTEGRATION.md](../ATHENAHEALTH_API_INTEGRATION.md)
2. Build sync workflow to fetch MedicationStatement resources
3. Schedule nightly sync

**Recommended**: Start with 10-20 patients for soft launch.

### Step 11.2: Staff Training

**Train front desk staff** (30 minutes):
1. Show how to check Refill_Requests sheet
2. Explain three decision types (auto/approval/escalate)
3. Practice responding to escalations
4. Review HIPAA protocols

**Train doctor** (45 minutes):
1. Review clinical protocols (see [REFILL_AI_PROTOCOL.md](REFILL_AI_PROTOCOL.md))
2. Sign protocol approval checklist
3. Test Slack approval workflow
4. Practice weekly quality review process

### Step 11.3: Soft Launch (1-2 weeks)

**Week 1**:
1. Announce to 20-30 patients: "We now offer SMS refill requests! Text [number] anytime."
2. Monitor closely:
   - Check Google Sheets daily
   - Review AI decisions for accuracy
   - Respond to escalations within 15 minutes
3. Collect patient feedback

**Week 2**:
1. Expand to 50-100 patients
2. Doctor reviews first week's AUTO-APPROVE decisions
3. Adjust protocols if needed (see Part 12)

### Step 11.4: Full Launch

After successful 2-week soft launch:
1. Announce to all patients via:
   - Email blast
   - Front desk handout
   - Post in waiting room
2. Update practice website
3. Add to voicemail greeting: "For prescription refills, text [number]"

---

## PART 12: Ongoing Maintenance

### Weekly Tasks (Doctor - 15 minutes)

1. Review sample of AUTO-APPROVE decisions (10-20 random cases)
2. Check for errors: wrong medication, missed contraindications
3. If error rate >2%, pause automation and refine protocols

### Monthly Tasks (Staff - 30 minutes)

1. Review metrics:
   - Total requests, auto-approval rate, escalation rate
   - Average response time
   - Controlled substance compliance
2. Export Refill_Requests for compliance reporting
3. Check Medications sheet for outdated data

### Quarterly Tasks (Doctor - 60 minutes)

1. Full protocol review and update
2. Review patient satisfaction survey results
3. Calculate ROI: time saved, cost savings, no-show reduction
4. Update protocols based on learnings

### As Needed

**Update AI protocols**:
1. Edit system prompt in `refill-ai-triage.json`
2. Test with sample data
3. Deploy to n8n
4. Monitor for changes in approval rates

**Add high-risk medications**:
1. Add to NEEDS-APPROVAL criteria in AI prompt
2. Document in REFILL_AI_PROTOCOL.md
3. Train staff on new handling procedures

---

## 🔧 Troubleshooting

### Issue: Patient receives "not found" error but is in Google Sheets

**Diagnosis**:
- Phone number format mismatch

**Solution**:
1. Check Patients sheet phone format: Must be E.164 (`+1XXXXXXXXXX`)
2. No spaces, dashes, or parentheses
3. Update all phone numbers to E.164 format
4. Test again

---

### Issue: Workflow execution fails with "Sheet not found"

**Diagnosis**:
- Google Sheets ID incorrect or sheet name misspelled

**Solution**:
1. Verify `GOOGLE_SHEET_ID` environment variable
2. Check exact sheet names: `Medications`, `Refill_Requests` (case-sensitive)
3. Ensure Google Sheets credential is connected

---

### Issue: Claude AI returns "Invalid API key"

**Diagnosis**:
- Anthropic API key incorrect or expired

**Solution**:
1. Go to Anthropic console → API Keys
2. Regenerate key if needed
3. Update n8n credential with new key
4. Test workflow again

---

### Issue: Pharmacy API returns 404 error

**Diagnosis**:
- Pharmacy API URL incorrect or pharmacy not found

**Solution**:
1. If using **mock API**: Verify webhook.site URL is correct
2. If using **Surescripts**: Verify NCPDP pharmacy ID is correct (7 digits)
3. Check `PHARMACY_API_URL` environment variable
4. See [REFILL_PHARMACY_INTEGRATION.md](REFILL_PHARMACY_INTEGRATION.md)

---

### Issue: Controlled substances not escalating

**Diagnosis**:
- Controlled_Substance column not set to "Yes"

**Solution**:
1. Check Medications sheet
2. Ensure Controlled_Substance = "Yes" (exact spelling, case-sensitive)
3. For Schedule II-V drugs, also set Schedule column
4. Test with controlled substance refill request

---

### Issue: Slack messages not sending

**Diagnosis**:
- Slack credential not configured or bot not invited to channel

**Solution**:
1. Verify Slack OAuth token in n8n credentials
2. In Slack, invite bot to channels: `/invite @Dr. Jennifer Refill Assistant`
3. Check `SLACK_DOCTOR_CHANNEL` and `SLACK_URGENT_CHANNEL` variable spelling
4. Test Slack node manually in n8n

---

## 📊 Success Metrics

Track these KPIs to measure automation success:

**Primary Metrics**:
- Auto-approval rate (target: 80%)
- Average response time for auto-approvals (target: <2 minutes)
- Staff time saved per day (target: 1.67 hours)
- Controlled substance compliance (target: 100% escalated)

**Secondary Metrics**:
- Patient satisfaction with refill process (target: >90%)
- AI accuracy (doctor review finds <2% errors)
- Pharmacy transmission success rate (target: >98%)

**How to measure**:
1. Export Refill_Requests sheet monthly
2. Use formulas:
   - Auto-approval rate: `=COUNTIF(H:H,"AUTO-APPROVE")/COUNTA(H:H)`
   - Avg response time: `=AVERAGE(P:P - G:G)` (in minutes)
3. Survey patients quarterly

---

## 📞 Support

**For technical issues**:
- n8n support: [docs.n8n.io/support](https://docs.n8n.io/support)
- Twilio support: [support.twilio.com](https://support.twilio.com)
- Anthropic support: [support.anthropic.com](https://support.anthropic.com)

**For clinical protocol questions**:
- Review [REFILL_AI_PROTOCOL.md](REFILL_AI_PROTOCOL.md)
- Consult with Dr. Jennifer

---

## ✅ Go-Live Checklist

Before announcing to patients:

**Technical**:
- [ ] All 3 workflows active in n8n
- [ ] Test SMS received and processed successfully
- [ ] Auto-approve test completed
- [ ] Needs-approval test completed
- [ ] Escalate test completed
- [ ] Google Sheets logging working
- [ ] Slack notifications working
- [ ] Pharmacy API responding (mock or production)

**Compliance**:
- [ ] Anthropic HIPAA BAA signed
- [ ] Twilio HIPAA BAA signed
- [ ] Google Workspace HIPAA BAA signed
- [ ] Patient consent forms updated (SMS opt-in)
- [ ] Staff trained on HIPAA protocols
- [ ] Doctor approved clinical protocols

**Clinical**:
- [ ] Doctor reviewed and signed REFILL_AI_PROTOCOL.md
- [ ] High-risk medications identified and added to protocols
- [ ] Controlled substance escalation tested
- [ ] PDMP check process documented
- [ ] Weekly review process established

**Operational**:
- [ ] Staff trained (30 minutes)
- [ ] Doctor trained (45 minutes)
- [ ] Escalation phone coverage confirmed
- [ ] Patient communication templates approved
- [ ] Soft launch plan documented

---

**Setup Complete!** 🎉

You're ready to launch the Prescription Refill AI Assistant. Start with a soft launch to 20-30 patients, monitor closely for 1-2 weeks, then expand to full patient population.

**Estimated Impact**:
- **$6,000/month** in staff time savings
- **1.67 hours/day** freed up
- **80%** of refills processed in <2 minutes
- **Patient satisfaction** increase of +25 percentage points

---

**Document Version**: 1.0
**Last Updated**: January 27, 2026
**Estimated Setup Time**: 2-3 hours
