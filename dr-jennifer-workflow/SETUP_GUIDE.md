# Setup Guide: SMS Appointment Reminders Workflow

## Overview

This guide walks you through the complete setup process for the SMS Appointment Reminders automation, from creating a Twilio account to testing your first reminder.

**Estimated Setup Time**: 45-60 minutes

---

## Prerequisites

- ✅ n8n cloud account (izzydev.app.n8n.cloud) - **You have this**
- ✅ Google account for Google Sheets
- ⏳ Twilio account (we'll create this)
- 💳 Credit card for Twilio (initial $20-30 recommended)

---

## Part 1: Twilio Account Setup

### Step 1.1: Create Twilio Account

1. Go to [Twilio Sign Up](https://www.twilio.com/try-twilio)
2. Fill in your details:
   - Email
   - Password
   - Phone number (for verification)
3. Click **Start your free trial**
4. **Verify your phone number** with the code sent via SMS
5. Complete the onboarding questions:
   - Which Twilio product: **SMS**
   - What's your role: **Developer** or **IT Operations**
   - What are you building: **Appointment reminders**
   - Language: **Node.js** (or JavaScript)
6. Click **Get Started with Twilio**

### Step 1.2: Get a Twilio Phone Number

1. In the Twilio Console, go to **Phone Numbers → Manage → Buy a number**
2. Select your **country** (US recommended)
3. Check **SMS** capability
4. (Optional) Search for a local area code near your practice
5. Click **Search**
6. Choose a number and click **Buy**
7. Confirm purchase (trial accounts get $15 credit)

**Save this number** — it's your workflow's SMS sender
- Format: `+15551234567`

### Step 1.3: Get Twilio Credentials

1. Go to Twilio Console **Dashboard** (home page)
2. Find **Account Info** section
3. **Copy and save**:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "Show" to reveal)

**⚠️ IMPORTANT**: Keep these credentials secure. Never commit to git or share publicly.

### Step 1.4: Upgrade Account (Required for Production)

**Note**: Trial accounts can only send SMS to verified numbers. For production use with real patients:

1. Go to **Account → Upgrade Account**
2. Add billing information
3. Recommended initial budget: **$20-30/month**
   - Each SMS costs ~$0.0075-$0.01
   - 100 patients × 3 reminders = 300 SMS = ~$3
4. Set up **usage alerts**:
   - Go to **Account → Usage Alerts**
   - Set alert at $20 to avoid surprises

---

## Part 2: Google Sheets Setup

### Step 2.1: Create Your Appointment Schedule

Follow the **GOOGLE_SHEET_TEMPLATE.md** guide to create your Google Sheet with:
- **Appointments** tab (main schedule)
- **Waitlist** tab (for cancelled slots)

### Step 2.2: Get Google Sheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
3. **Copy the SHEET_ID** (the long alphanumeric string)

Example:
- URL: `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`
- Sheet ID: `1a2b3c4d5e6f7g8h9i0j`

**Save this ID** — you'll need it in n8n

### Step 2.3: Share Sheet with n8n

1. Click **Share** (top right)
2. Option A: **Anyone with the link** → Viewer (easiest)
3. Option B: Add your n8n service account email (more secure)
   - You'll get this email when connecting Google Sheets in n8n

---

## Part 3: Import Workflows into n8n

### Step 3.1: Import Outbound Reminders Workflow

1. Log in to [n8n cloud](https://izzydev.app.n8n.cloud)
2. Click **Workflows** (left sidebar)
3. Click **+ New Workflow** (top right)
4. Click the **⋮** (three dots menu) → **Import from File**
5. Select `appointment-reminders-workflow.json`
6. Workflow imported! Now configure it...

### Step 3.2: Import Inbound SMS Responses Workflow

1. Click **+ New Workflow** again
2. Click **⋮** → **Import from File**
3. Select `appointment-sms-responses-workflow.json`
4. Workflow imported!

---

## Part 4: Configure Credentials in n8n

### Step 4.1: Add Twilio Credentials

1. Open **either workflow** (credentials are shared across workflows)
2. Click on any **Twilio node** (e.g., "Send 48hr Reminder")
3. Click **Credential to connect with** dropdown
4. Click **+ Create New Credential**
5. Enter:
   - **Name**: `Twilio - Dr. Jennifer`
   - **Account SID**: `AC...` (from Part 1.3)
   - **Auth Token**: `...` (from Part 1.3)
6. Click **Save**
7. **Test the credential**:
   - The node should now show "Credentials set"

### Step 4.2: Add Google Sheets Credentials

1. Click on any **Google Sheets node** (e.g., "Get Appointments")
2. Click **Credential to connect with** dropdown
3. Click **+ Create New Credential**
4. Choose **OAuth2** authentication
5. Click **Connect my account**
6. **Sign in with Google** (use the account that owns the sheet)
7. **Grant permissions** to n8n
8. n8n redirects back, credential saved!
9. Click **Save**

---

## Part 5: Configure Workflows

### Step 5.1: Configure Outbound Reminders Workflow

**Open the "Dr. Jennifer - Appointment Reminders (Outbound)" workflow**

#### 5.1a: Configure "Get Appointments" Node

1. Click the **"Get Appointments"** node
2. **Document ID**: Click dropdown → Select your sheet by name (or paste Sheet ID)
3. **Sheet Name**: Select `Appointments`
4. Click **Execute Node** to test (should return your appointments)
5. ✅ Verify data loads correctly

#### 5.1b: Configure All Three "Update Sheet" Nodes

For **each** of these nodes:
- "Update Sheet (48hr)"
- "Update Sheet (24hr)"
- "Update Sheet (2hr)"

Do the following:
1. Click the node
2. **Document ID**: Select your sheet
3. **Sheet Name**: Select `Appointments`
4. Click **Save**

#### 5.1c: Add Environment Variables for Twilio Number

1. Go to **Settings** (gear icon, top right)
2. Click **Environment Variables**
3. Click **Add Variable**
4. **Name**: `TWILIO_PHONE_NUMBER`
5. **Value**: Your Twilio number (e.g., `+15551234567`)
6. Click **Save**

#### 5.1d: Update SMS Message Templates (Optional)

Want to customize the reminder messages?

1. Click any **Twilio SMS node** (e.g., "Send 48hr Reminder")
2. Edit the **Message** field to your liking
3. Keep the dynamic fields (e.g., `{{ $json.Patient_Name }}`)
4. Click **Save**

**Example customization:**
```
Hi {{ $json.Patient_Name }}! 👋

This is Dr. Jennifer's office reminding you:

📅 {{ $json.Date }} at {{ $json.Time }}
📍 {{ $json.Office_Address }}
👨‍⚕️ With {{ $json.Doctor_Name }}

Reply:
1️⃣ = Confirm
2️⃣ = Cancel
3️⃣ = Reschedule

See you soon!
```

---

### Step 5.2: Configure Inbound SMS Responses Workflow

**Open the "Dr. Jennifer - SMS Responses (Inbound)" workflow**

#### 5.2a: Activate Webhook

1. Click the **"Twilio Webhook"** node
2. Note the **Webhook URL** (e.g., `https://izzydev.app.n8n.cloud/webhook/appointment-sms-reply`)
3. **Copy this URL** — you'll add it to Twilio in Step 5.2c

#### 5.2b: Configure All Google Sheets Nodes

For **each** Google Sheets node in this workflow:
- "Find Patient Appointment"
- "Mark as Confirmed"
- "Mark as Cancelled"
- "Get Waitlist"

Do the following:
1. Click the node
2. **Document ID**: Select your sheet
3. **Sheet Name**: Select `Appointments` (or `Waitlist` for the waitlist node)
4. Click **Save**

#### 5.2c: Configure Twilio to Send Responses to n8n

1. Go to [Twilio Console → Phone Numbers → Manage → Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on **your Twilio phone number**
3. Scroll to **Messaging Configuration**
4. Under **"A MESSAGE COMES IN"**:
   - Select **Webhook**
   - Paste your **n8n webhook URL** (from Step 5.2a)
   - Method: **HTTP POST**
5. Click **Save**

**✅ Done!** Twilio will now forward all incoming SMS replies to your n8n workflow.

---

## Part 6: Testing the Workflows

### Step 6.1: Test Outbound Reminders (Manual Execution)

1. Open the **"Appointment Reminders (Outbound)"** workflow
2. **Add a test appointment** to your Google Sheet:
   - Date: Tomorrow
   - Time: 10:00 AM
   - Patient_Name: Test Patient
   - Phone: **Your own phone number** (in E.164 format: `+1XXXXXXXXXX`)
   - Fill in other required fields
   - Leave reminder flags blank
3. In n8n, click **"Execute Workflow"** (top right)
4. **Check your phone** — you should receive an SMS!

**Troubleshooting:**
- ❌ No SMS received?
  - Check Twilio console → **Logs → Messaging** for error messages
  - Verify phone number format: `+1XXXXXXXXXX` (no spaces, dashes, or parentheses)
  - Confirm Twilio account is upgraded (or phone is verified on trial)
- ❌ Workflow error?
  - Check Google Sheet credentials are connected
  - Verify sheet structure matches template
  - Check Twilio credentials

### Step 6.2: Test Inbound SMS Responses

1. **Reply to the test SMS** with: `1`
2. Go to n8n → **Executions** (left sidebar)
3. Find the **"SMS Responses (Inbound)"** workflow execution
4. Click to view — you should see:
   - Webhook received
   - Response parsed as "confirm"
   - Google Sheet updated (Confirmed = "Yes")
   - Confirmation SMS sent

**Check your Google Sheet** — the test appointment should now show:
- `Confirmed: Yes`
- `Confirmed_At: [timestamp]`

**Try other responses:**
- Reply `2` (cancel) — should mark as cancelled and notify waitlist
- Reply `3` (reschedule) — should send Calendly link

---

## Part 7: Activate Workflows for Production

### Step 7.1: Activate the Scheduled Workflow

1. Open **"Appointment Reminders (Outbound)"** workflow
2. Click **Active** toggle (top right) to turn it ON
3. The workflow will now run **every hour** automatically

**What happens:**
- Every hour, workflow checks for appointments needing reminders
- Sends 48hr reminders (47-49 hours before appt)
- Sends 24hr reminders (23-25 hours before, if not confirmed)
- Sends 2hr reminders (1.5-2.5 hours before)

### Step 7.2: Activate the Webhook Workflow

1. Open **"SMS Responses (Inbound)"** workflow
2. Click **Active** toggle to turn it ON
3. The workflow is now listening for patient SMS replies 24/7

---

## Part 8: Daily Operations

### Morning Routine (5 minutes)

1. **Open your Google Sheet**
2. **Check confirmations**:
   - Filter by `Confirmed = (blank)`
   - See which patients haven't confirmed
3. **Review no-shows**:
   - Patients with 48hr reminder sent but no response
   - Consider calling them
4. **Add today's appointments**:
   - Import from your EMR or add manually
   - Ensure all required fields are filled

### End of Day (2 minutes)

1. **Mark completed appointments**:
   - Change `Status` to `COMPLETED` for today's appointments
2. **Archive old appointments** (weekly):
   - Move past appointments to an "Archive" sheet

### Weekly Maintenance

1. **Import next week's appointments**
2. **Review waitlist** priority
3. **Check Twilio usage** (Console → Usage)
4. **Export backup** of Google Sheet

---

## Part 9: Monitoring & Analytics

### n8n Execution Logs

1. Go to **Executions** (left sidebar in n8n)
2. Filter by workflow name
3. Review successful/failed executions
4. **Set up error notifications** (optional):
   - Workflow Settings → Error Workflow
   - Send errors to Slack or email

### Twilio Message Logs

1. Go to [Twilio Console → Monitor → Logs → Messaging](https://console.twilio.com/us1/monitor/logs/sms)
2. See all sent/received messages
3. Check delivery status
4. Track costs

### Google Sheet Tracking

**Add these helper columns** (optional):

**Confirmation Rate**:
```excel
=COUNTIF(M:M,"Yes")/COUNTA(A:A)*100
```

**No-Show Prediction**:
```excel
=IF(AND(Q2="Yes", M2="", NOW()>A2-1), "⚠️ LIKELY NO-SHOW", "")
```

**Slots Filled from Waitlist** (manual counter):
- Track in a separate cell how many cancelled slots were filled

---

## Part 10: Troubleshooting

### Issue: Reminders Not Sending

**Possible Causes:**
1. ❌ Workflow not activated
   - **Fix**: Turn on "Active" toggle
2. ❌ Date/Time format incorrect
   - **Fix**: Use MM/DD/YYYY and HH:MM AM/PM
3. ❌ Reminder flags not blank
   - **Fix**: Clear `48hr_Reminder_Sent` columns for testing
4. ❌ Status not "SCHEDULED"
   - **Fix**: Set `Status = SCHEDULED`

### Issue: Duplicate Reminders

**Possible Causes:**
1. ❌ Reminder flag columns getting cleared
   - **Fix**: Don't manually clear these after workflow runs
2. ❌ Multiple workflows running
   - **Fix**: Check for duplicate workflows in n8n

### Issue: Patient Responses Not Working

**Possible Causes:**
1. ❌ Webhook not configured in Twilio
   - **Fix**: Re-add webhook URL in Twilio console
2. ❌ Inbound workflow not activated
   - **Fix**: Turn on "Active" toggle
3. ❌ Phone number mismatch
   - **Fix**: Ensure exact match (including +1 prefix)

### Issue: Google Sheets Not Updating

**Possible Causes:**
1. ❌ Credentials expired
   - **Fix**: Reconnect Google Sheets in n8n
2. ❌ Sheet permissions
   - **Fix**: Share sheet with n8n service account
3. ❌ Sheet ID changed
   - **Fix**: Update Document ID in all nodes

### Issue: High Twilio Costs

**Solutions:**
1. ✅ Set usage alerts in Twilio
2. ✅ Review message length (>160 chars = multiple SMS)
3. ✅ Optimize reminder timing (reduce unnecessary reminders)
4. ✅ Consider alternative providers (future enhancement)

---

## Part 11: HIPAA Compliance Considerations

⚠️ **IMPORTANT**: This workflow handles Protected Health Information (PHI).

### Required Safeguards

1. **Business Associate Agreement (BAA)**:
   - ✅ Twilio offers BAA (must request via support)
   - ✅ Google Workspace offers BAA (paid plans)
   - ✅ n8n self-hosted or enterprise (cloud may require BAA)

2. **Data Encryption**:
   - ✅ Twilio encrypts in transit (HTTPS)
   - ✅ Google Sheets encrypts at rest
   - ✅ n8n uses HTTPS for webhooks

3. **Access Controls**:
   - ✅ Limit Google Sheet access to essential staff only
   - ✅ Use strong passwords for all accounts
   - ✅ Enable 2FA on Twilio, Google, and n8n

4. **Audit Logs**:
   - ✅ n8n execution logs (review monthly)
   - ✅ Twilio message logs (review monthly)
   - ✅ Google Sheets version history

5. **Patient Consent**:
   - ✅ Obtain consent for SMS communications
   - ✅ Include opt-out instructions in messages
   - ⚠️ Add to your intake forms: "I consent to receive appointment reminders via SMS"

### Compliance Checklist

Before going live:
- [ ] Request BAA from Twilio (if handling PHI)
- [ ] Upgrade to Google Workspace with BAA (if using personal Gmail)
- [ ] Review n8n's HIPAA compliance (self-host or enterprise)
- [ ] Train staff on PHI handling
- [ ] Document data flows and safeguards
- [ ] Get compliance officer approval

**⚠️ Consult with your practice's compliance officer before deploying to production.**

---

## Part 12: Next Steps & Enhancements

### Immediate Next Steps

1. ✅ Complete setup steps above
2. ✅ Test with sample data
3. ✅ Run pilot with 5-10 real appointments
4. ✅ Gather feedback from staff
5. ✅ Refine message templates
6. ✅ Go live with full schedule

### Future Enhancements

**Phase 2: Add More Automations**
- Overnight insurance verification
- Digital intake forms
- Prescription refill AI
- Lab result notifications

**Workflow Improvements**
- **Multi-language support**: Detect patient language preference
- **Staff alerts**: Slack notifications for no-responses
- **Analytics dashboard**: Track metrics in real-time
- **Voice reminders**: Use Twilio Voice for phone calls
- **Email reminders**: Add email as backup to SMS

**Integration Ideas**
- **EMR integration**: Auto-sync appointments from Epic/Athenahealth
- **Payment reminders**: Include copay amounts in reminders
- **Feedback collection**: Send post-appointment survey via SMS
- **Birthday/annual checkup reminders**: Proactive outreach

---

## Support & Resources

### Documentation
- [n8n Docs](https://docs.n8n.io/)
- [Twilio SMS API Docs](https://www.twilio.com/docs/sms)
- [Google Sheets API Docs](https://developers.google.com/sheets/api)

### Community Support
- [n8n Community Forum](https://community.n8n.io/)
- [Twilio Support](https://support.twilio.com/)

### Professional Support
- n8n Enterprise Support (if using self-hosted)
- Twilio Premium Support (for high-volume use)

---

## Cost Breakdown

### Monthly Operating Costs

| Service | Cost | Notes |
|---------|------|-------|
| **Twilio Phone Number** | $1.15/month | One number |
| **Twilio SMS** | ~$3-5/month | 300-500 SMS/month |
| **Google Workspace** | $0 (personal) or $6/user (business w/ BAA) | If HIPAA required |
| **n8n Cloud** | Free (starter) or $20/month (pro) | Current: Free |
| **Total** | **$4-32/month** | Depending on scale |

**ROI Reminder**: Reducing one no-show ($150) pays for 3-5 months of operation.

---

## Questions?

If you encounter issues during setup:
1. Check **Part 10: Troubleshooting** above
2. Review **n8n execution logs** for specific errors
3. Check **Twilio message logs** for SMS delivery issues

---

## Success Metrics to Track

After 1 month of operation, measure:
- ✅ No-show rate (before vs. after)
- ✅ Confirmation rate (% of patients confirming via SMS)
- ✅ Waitlist fill rate (cancelled slots filled from waitlist)
- ✅ Staff time saved (hours/day)
- ✅ Revenue recovered (no-shows avoided × average appointment value)

**Example Results**:
- No-shows: 20% → 5% (15% improvement)
- 100 appointments/day × 15% × $150 = **$2,250/day saved**
- **$67,500/month** in recovered revenue

---

**🎉 Congratulations!** Your SMS Appointment Reminders workflow is now live!
