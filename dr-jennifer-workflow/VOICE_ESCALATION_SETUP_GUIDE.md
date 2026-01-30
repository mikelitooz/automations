# Voice Call Escalation Workflow - Setup Guide

**Workflows**:

1. `voice-call-escalation-workflow.json` - Initiates calls
2. `vapi-call-results-handler-workflow.json` - Processes outcomes (NEW)

**Purpose**: Automatically call patients who haven't confirmed appointments 20 hours before their scheduled time with structured outcome detection

**Platform**: Vapi.ai (Voice AI with Claude 3.5 Sonnet)

---

## Needed Vapi

```typescript
const headers = {
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
};

const data = {
  phoneNumberId: phoneNumberId,
  assistantId: assistantId,
  customer: {
    number: customerNumber,
  },
};
```

## Overview

This workflow acts as a **safety net** for unconfirmed appointments. If a patient hasn't confirmed after receiving the 24-hour email reminder, the system automatically calls them 4 hours later (20 hours before the appointment).

**NEW in v2.0:** Structured outcome detection with four outcomes: `confirmed`, `cancel`, `reschedule`, `unanswered`

**Escalation Path:**

```
48hr Email → 24hr Email → [WAIT 4 HOURS] → 20hr Voice Call → Structured Outcome → Auto-Update Sheet
```

**Architecture:** Two-workflow system for clean separation of concerns (see [VAPI_INTEGRATION_ARCHITECTURE.md](VAPI_INTEGRATION_ARCHITECTURE.md) for details)

---

## Prerequisites

### 1. **Vapi.ai Account Setup**

#### Step 1: Create Account

1. Go to https://vapi.ai
2. Sign up for an account
3. Choose a plan:
   - **Starter**: $0.40-0.50/min (recommended)
   - **Pro**: Volume discounts available

#### Step 2: Get API Key

1. Dashboard → Settings → API Keys
2. Click "Create New API Key"
3. Copy the key (starts with `vapi_...`)
4. Save in n8n environment variables as `VAPI_API_KEY`

#### Step 3: Get Phone Number

1. Dashboard → Phone Numbers → Buy Number
2. Select a US phone number (recommended: local to your practice area)
3. Copy the **Phone Number ID** (starts with `phoneNumber_...`)
4. Save in n8n environment variables as `VAPI_PHONE_NUMBER_ID`

#### Step 4: Configure Webhook (UPDATED for v2.0)

**Note:** The webhook URL is now configured **in the assistant configuration** via `serverUrl` parameter, not in Vapi dashboard.

The webhook will be: `https://your-n8n-instance.com/webhook/vapi-results`

This is automatically set in the HTTP Request node body - no manual Vapi dashboard configuration needed!

#### Step 5: HIPAA Compliance (IMPORTANT)

1. Email Vapi support: support@vapi.ai
2. Request HIPAA Business Associate Agreement (BAA)
3. Review and sign BAA
4. Confirm data encryption and retention policies
5. Document in compliance records

---

### 2. **Google Sheet Setup**

#### Add New Columns to Sheet1 (v2.0 UPDATED)

The workflow now requires **5 additional columns** for structured outcome tracking:

| Column Name                | Type    | Purpose                   | Example Values                            |
| -------------------------- | ------- | ------------------------- | ----------------------------------------- |
| `20hr_Voice_Call_Made`     | Boolean | Prevents duplicate calls  | TRUE, FALSE                               |
| `Voice_Call_Outcome`       | Text    | Structured outcome        | confirmed, cancel, reschedule, unanswered |
| `Voice_Call_Summary`       | Text    | AI-generated call summary | "Patient confirmed attendance"            |
| `Voice_Call_Recording_URL` | URL     | Link to call recording    | https://storage.vapi.ai/...               |
| `Voicemail_Left`           | Boolean | If call reached voicemail | TRUE, FALSE                               |
| `Needs_Reschedule_Link`    | Boolean | Trigger reschedule email  | TRUE, FALSE                               |

**Instructions:**

1. Open Google Sheet: https://docs.google.com/spreadsheets/d/1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y
2. Go to Sheet1 (Appointments tab)
3. Insert new columns (suggested location: after existing voice call columns)
4. Name them as listed above
5. Set default values: `FALSE` for booleans, leave text/URL columns empty

**Existing Columns Used:**

- `Patient_Phone` - Match patient for updates
- `Patient_Name` - Personalize greeting
- `Status` - Updated based on outcome
- `Confirmed_At`, `Confirmed_Via` - Set when confirmed
- `Cancelled_At`, `Cancelled_Via`, `Cancellation_Reason` - Set when cancelled
- `Rescheduled_At`, `Rescheduled_Via` - Set when rescheduling

---

### 3. **n8n Environment Variables**

Add these to your n8n instance:

```bash
# Vapi.ai Configuration
VAPI_API_KEY=your_vapi_api_key_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here

# n8n Webhook Base URL (NEW for v2.0)
N8N_WEBHOOK_URL=https://YOUR-INSTANCE.app.n8n.cloud

# Google Sheet (already configured)
GOOGLE_SHEET_ID=1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y

# Email (already configured)
USER_EMAIL=your-email@gmail.com
```

**How to Set in n8n:**

1. n8n Dashboard → Settings → Environments
2. Click "Add Variable"
3. Enter key and value
4. Save

**Important:** Do NOT include the trailing slash in `N8N_WEBHOOK_URL`

---

## Workflow Import & Configuration (v2.0 UPDATED)

### Part 1: Import Both Workflows

1. **Import Workflow 1 (Call Initiator):**

   - n8n Dashboard → Workflows → Import from File
   - Select: `voice-call-escalation-workflow.json`
   - Click "Import"

2. **Import Workflow 2 (Results Handler - NEW):**

   - n8n Dashboard → Workflows → Import from File
   - Select: `vapi-call-results-handler-workflow.json`
   - Click "Import"

3. **Reconnect Credentials (Both Workflows):**
   - HTTP Header Auth credential for Vapi API (create if doesn't exist)
     - Name: "Vapi API Key"
     - Header Name: `Authorization`
     - Header Value: `Bearer {{ $env.VAPI_API_KEY }}`
   - Google Sheets OAuth2 (already configured)
   - Gmail OAuth2 (already configured)

---

### Part 2: Configure Vapi Call Node (Workflow 1)

**Node**: "Initiate Vapi Call" (HTTP Request node)

**Configuration is already complete in the imported workflow!**

The node now includes:

- ✅ Inline assistant configuration (no dashboard setup needed)
- ✅ Structured data extraction with JSON schema
- ✅ Dynamic patient variables (name, date, time)
- ✅ Voicemail detection enabled
- ✅ Recording enabled
- ✅ Webhook URL configured via `serverUrl`

**Key Features:**

```json
{
  "assistant": {
    "model": {
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022"
    },
    "analysisPlan": {
      "structuredDataSchema": {
        "outcome": ["confirmed", "cancel", "reschedule", "unanswered"]
      }
    }
  },
  "serverUrl": "{{ $env.N8N_WEBHOOK_URL }}/webhook/vapi-results"
}
```

**Customization Options:**

- Change voice: Edit `voiceId` in the assistant configuration
- Adjust tone: Modify the system prompt message
- Change model: Use OpenAI instead of Claude if preferred

---

### Part 3: Activate Both Workflows

**Workflow 1 (Voice Call Escalation):**

1. Activate the workflow (toggle switch)
2. Verify schedule trigger is set (every 30 minutes)

**Workflow 2 (Vapi Results Handler - NEW):**

1. **IMPORTANT:** Activate this workflow FIRST before testing calls
2. Verify webhook trigger is active
3. Copy the webhook URL: `https://YOUR-INSTANCE.app.n8n.cloud/webhook/vapi-results`
4. This URL is automatically used by Workflow 1 via `N8N_WEBHOOK_URL` environment variable

**No manual Vapi dashboard webhook configuration needed!** The webhook URL is dynamically set in each API call.

---

## Structured Outcomes (NEW in v2.0)

### What Are Structured Outcomes?

Instead of manually parsing transcripts, Vapi's AI automatically extracts structured data from conversations based on a JSON schema.

### Four Outcome Types

| Outcome        | When It's Used                  | Google Sheet Update     | Follow-up Action                     |
| -------------- | ------------------------------- | ----------------------- | ------------------------------------ |
| **confirmed**  | Patient confirms they'll attend | Status → "Confirmed"    | None - patient confirmed             |
| **cancel**     | Patient wants to cancel         | Status → "Cancelled"    | Send cancellation confirmation email |
| **reschedule** | Patient wants different time    | Status → "Rescheduling" | Send Cal.com reschedule link         |
| **unanswered** | Voicemail or no answer          | Voicemail_Left → TRUE   | 2hr reminder will still send         |

### How AI Determines Outcomes

The AI analyzes the conversation and intelligently maps responses:

**Confirmed Examples:**

- "Yes, I'll be there"
- "I can make it"
- "See you then"
- "That works for me"

**Cancel Examples:**

- "I need to cancel"
- "I can't come"
- "I won't be able to make it"

**Reschedule Examples:**

- "Can we reschedule?"
- "I need a different time"
- "Can I come on a different day?"

**Unanswered Examples:**

- Call goes to voicemail
- No answer after multiple rings
- Phone number disconnected

### Structured Data Schema

The JSON schema that guides AI extraction:

```json
{
  "outcome": {
    "type": "string",
    "enum": ["confirmed", "cancel", "reschedule", "unanswered"]
  },
  "patientResponse": {
    "type": "string",
    "description": "What the patient said"
  },
  "needsFollowup": {
    "type": "boolean",
    "description": "If staff should follow up"
  },
  "appointmentConfirmed": {
    "type": "boolean",
    "description": "True if patient will attend"
  }
}
```

---

## How the Workflow Works (Updated for v2.0)

### Two-Workflow Architecture

**Workflow 1: Voice Call Escalation**

- Identifies unconfirmed appointments
- Initiates Vapi calls with inline assistant
- Marks calls as initiated

**Workflow 2: Vapi Results Handler (NEW)**

- Receives webhook when call ends
- Parses structured outcome
- Routes to appropriate action
- Updates Google Sheet

### Flow Diagram (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Schedule Trigger (Every 30 minutes)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Read Google Sheet (All Appointments)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Filter for 20hr Unconfirmed                                  │
│    ✓ 24hr_Reminder_Sent = TRUE                                  │
│    ✓ Status = "Pending"                                         │
│    ✓ 20hr_Voice_Call_Made = FALSE                               │
│    ✓ 19.5 - 20.5 hours before appointment                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Any Calls Needed? (IF Node)                                  │
└──────────┬──────────────────────────────────────────────────────┘
           │                                    │
           ▼ YES                                ▼ NO
┌──────────────────────────┐          ┌────────────────────┐
│ 5. Loop Each Patient     │          │ End Workflow       │
└──────────┬───────────────┘          └────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. Initiate Vapi Call (HTTP Request)                             │
│    → Patient gets phone call from AI assistant                   │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. Mark Call Initiated (Update Google Sheet)                     │
│    → Set 20hr_Voice_Call_Made = TRUE                             │
└──────────┬───────────────────────────────────────────────────────┘
           │
           │ [Patient receives call, conversation happens...]
           │ [Vapi processes call asynchronously]
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. Webhook: Vapi Call Results (Separate Trigger)                 │
│    → Receives transcript, summary, call outcome                   │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ 9. Parse Call Results                                             │
│    → Analyze transcript to determine action                       │
│    → "Confirmed" / "Cancel" / "Voicemail" / "No Answer"          │
└──────────┬───────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────────────┐
│ 10. Route by Action (Switch Node)                                │
└──┬───────────┬─────────────┬──────────────────────────────────────┘
   │           │             │
   ▼           ▼             ▼
┌────────┐  ┌───────────┐  ┌──────────────┐
│CONFIRMED│  │CANCEL/    │  │VOICEMAIL/    │
│         │  │RESCHEDULE │  │NO ANSWER     │
└────┬────┘  └─────┬─────┘  └──────┬───────┘
     │             │                │
     ▼             ▼                ▼
┌─────────────┐ ┌────────────┐ ┌──────────────┐
│Update Sheet:│ │Send Cal.com│ │Update Sheet: │
│Status=      │ │Link via    │ │Log Result    │
│"Confirmed"  │ │Email       │ │              │
└─────────────┘ └────────────┘ └──────────────┘
```

---

## Conversation Flow Examples

### Scenario 1: Patient Confirms

**AI Agent:** "Hi John, this is Dr. Jennifer's office calling about your appointment tomorrow at 2:30 PM. We noticed you haven't confirmed yet. Are you still able to make it?"

**Patient:** "Oh yes! Sorry, I was busy and forgot to reply to the email. I'll be there."

**AI Agent:** "Perfect! I've marked you as confirmed. We'll see you tomorrow at 2:30 PM. Have a great day!"

**System Action:**

- ✅ Update Status → "Confirmed"
- ✅ Update Voice_Call_Agent_Action_Taken → "Confirmed"
- ✅ Update Voice_Call_Agent_Call_Summary → Transcript
- ✅ Notify staff via Slack

---

### Scenario 2: Patient Needs to Reschedule

**AI Agent:** "Hi Sarah, this is Dr. Jennifer's office calling about your appointment tomorrow at 10:00 AM. We noticed you haven't confirmed yet. Are you still able to make it?"

**Patient:** "Oh no, I actually can't make it tomorrow. Can I reschedule?"

**AI Agent:** "Of course! I'm sending you a text message with a link to pick a new time. You'll receive it in just a moment."

**System Action:**

- 📧 Send email with Cal.com link
- ✅ Update Voice_Call_Agent_Action_Taken → "Sent Cal.com Link"
- ✅ Update Voice_Call_Agent_Call_Summary → Transcript
- ⏳ Status remains "Pending" (will be updated when they reschedule via Cal.com)

---

### Scenario 3: Voicemail

**AI Agent:** "Hi Michael, this is Dr. Jennifer's office calling about your appointment tomorrow at 3:00 PM. Please call us back at (555) 123-4567 or reply to our email to confirm. Thank you!"

**System Action:**

- ✅ Update Voice_Call_Agent_Action_Taken → "Voicemail Left"
- ✅ Update Voice_Call_Agent_Call_Summary → "Voicemail - left callback message"
- ⏳ Status remains "Pending"
- 📧 2-hour reminder will still be sent later

---

## Testing the Workflow (Updated for v2.0)

### Test Mode Configuration

**For rapid testing**, modify the filter timing in the "Filter for 20hr Unconfirmed" Code node:

**Production (20 hours before):**

```javascript
hoursUntil >= 19.5 && hoursUntil <= 20.5;
```

**Testing (1.5 minutes before):**

```javascript
const minutesUntil = hoursUntil * 60;
minutesUntil >= 1.25 && minutesUntil <= 1.75;
```

### Test Procedure

1. **Activate Both Workflows:**

   - **IMPORTANT:** Activate Workflow 2 (Vapi Results Handler) FIRST
   - Then activate Workflow 1 (Voice Call Escalation)

2. **Create Test Appointment:**

   - Add row to Google Sheet
   - Set appointment time: **1.5 minutes from now**
   - Set `24hr_Reminder_Sent = TRUE`
   - Set `Status = "Pending"`
   - Set `20hr_Voice_Call_Made = FALSE`
   - Use **your personal phone number**
   - Fill in `Patient_Name` (will be used in greeting)

3. **Wait for Call:**

   - You should receive a call within 1-2 minutes
   - The greeting will say: "Hi [Your Name], this is Dr. Jennifer's office..."

4. **Test All Four Outcomes:**

   **Test 1: Confirmed Outcome**

   - Answer the call
   - Say: "Yes, I'll be there" or "I can make it"
   - Verify Google Sheet updates:
     - `Status` = "Confirmed"
     - `Voice_Call_Outcome` = "confirmed"
     - `Voice_Call_Recording_URL` populated

   **Test 2: Cancel Outcome**

   - Answer the call
   - Say: "I need to cancel my appointment"
   - Verify Google Sheet updates:
     - `Status` = "Cancelled"
     - `Voice_Call_Outcome` = "cancel"
     - Check if cancellation email prepared

   **Test 3: Reschedule Outcome**

   - Answer the call
   - Say: "Can I reschedule for a different time?"
   - Verify Google Sheet updates:
     - `Status` = "Rescheduling"
     - `Voice_Call_Outcome` = "reschedule"
     - `Needs_Reschedule_Link` = TRUE
     - Check if reschedule email prepared

   **Test 4: Unanswered Outcome**

   - Don't answer the call (let it go to voicemail)
   - Verify Google Sheet updates:
     - `Voicemail_Left` = TRUE
     - `Voice_Call_Outcome` = "unanswered"
     - `Status` remains "Pending"

5. **Verify Webhook Processing:**

   - n8n Dashboard → Workflow 2 Executions
   - Check that webhook was received within 1-2 minutes after call ended
   - Verify structured data was extracted correctly

6. **Check Vapi Dashboard:**
   - Login to https://dashboard.vapi.ai
   - Navigate to Calls
   - Find your test call
   - Review transcript, recording, and analysis
   - Verify structured data appears in call details

### Debugging Test Calls

**If call doesn't initiate:**

- Check Workflow 1 execution logs
- Verify `VAPI_API_KEY` is set correctly
- Verify `VAPI_PHONE_NUMBER_ID` is set correctly
- Check phone number is in E.164 format: `+1XXXXXXXXXX`

**If webhook not received:**

- Verify Workflow 2 is activated
- Check `N8N_WEBHOOK_URL` environment variable
- Test webhook manually: POST to `/webhook/vapi-results`
- Check Vapi dashboard for webhook delivery status

**If wrong outcome detected:**

- Review call transcript in Vapi dashboard
- Check if patient response was ambiguous
- Refine system prompt if needed
- Adjust structured data prompts

---

## Troubleshooting

### Issue 1: No Call Received

**Possible Causes:**

- ❌ Vapi API key not set correctly
- ❌ Phone number not configured in Vapi
- ❌ Filtering logic not matching appointment
- ❌ Phone number format incorrect

**Solution:**

```javascript
// Check execution logs:
n8n Dashboard → Executions → View latest execution

// Verify filter output:
"Filter for 20hr Unconfirmed" node → Check output count

// Verify phone format (must be E.164):
Correct: +15551234567
Incorrect: (555) 123-4567
```

---

### Issue 2: Webhook Not Receiving Results

**Possible Causes:**

- ❌ Webhook URL not configured in Vapi
- ❌ Workflow not active (webhook disabled)
- ❌ Firewall blocking incoming webhooks

**Solution:**

```bash
# 1. Verify webhook is active:
n8n Dashboard → Workflows → Voice Call Escalation → Activate

# 2. Test webhook manually:
curl -X POST https://your-n8n-instance.com/webhook/vapi-call-complete \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# 3. Check Vapi webhook logs:
Vapi Dashboard → Settings → Webhooks → View Logs
```

---

### Issue 3: Wrong Action Detected

**Example:** Patient confirmed but system logged "Voicemail Left"

**Cause:** Transcript parsing logic needs adjustment

**Solution:**
Edit "Parse Call Results" Code node:

```javascript
// Adjust keywords for confirmation:
if (
  transcriptLower.includes("confirmed") ||
  transcriptLower.includes("see you") ||
  transcriptLower.includes("i'll be there") ||
  transcriptLower.includes("yes") ||
  transcriptLower.includes("yeah") || // ADD MORE KEYWORDS
  transcriptLower.includes("sure")
) {
  // ADD MORE KEYWORDS
  actionTaken = "Confirmed";
  patientConfirmed = true;
}
```

---

### Issue 4: High Costs

**Problem:** Voice calls costing more than expected

**Solution: Implement Hybrid Approach**

Only call patients who are **high-risk** (e.g., new patients, history of no-shows):

**Modify Filter Logic:**

```javascript
// Add condition to filter:
const isHighRisk = row["Patient_Type"] === "New" || row["No_Show_History"] === "TRUE";

const shouldCall =
  sent24hr === true && status === "Pending" && voiceCallMade !== true && hoursUntil >= 19.5 && hoursUntil <= 20.5 && isHighRisk; // ← ADD THIS CONDITION
```

**Expected Savings:**

- Before: 100 calls/day × $0.40/min × 2 min = $80/day ($2,400/month)
- After: 30 calls/day × $0.40/min × 2 min = $24/day ($720/month)
- **Savings: $1,680/month (70% reduction)**

---

## HIPAA Compliance Checklist

Before deploying to production:

- [ ] Vapi BAA signed and documented
- [ ] Encryption at rest confirmed
- [ ] Encryption in transit (TLS 1.2+) verified
- [ ] Call recording retention policy set (recommend 30 days)
- [ ] Audit logging enabled
- [ ] Data residency (US-only) confirmed
- [ ] Staff trained on new workflow
- [ ] Incident response plan documented
- [ ] Patient consent for voice calls obtained
- [ ] Privacy policy updated to mention automated calls

---

## Cost Estimation

### Production Costs (Monthly)

**Assumptions:**

- 100 appointments per day
- 20% need voice call escalation (didn't confirm after 24hr email)
- 20 calls per day
- Average call length: 2 minutes

**Calculation:**

```
20 calls/day × 2 minutes × $0.40/min = $16/day
$16/day × 30 days = $480/month
```

**Vapi.ai Pricing:**

- Starter Plan: $0.40-0.50/min
- Pro Plan: $0.30-0.40/min (with volume discounts)

**Comparison to Alternatives:**

- **Bland.ai:** $1.00/min → $1,200/month (2.5x more expensive)
- **Twilio + Claude:** $0.10-0.30/min → $120-360/month (but 4-6x more complex)

---

## Monitoring & Analytics

### Key Metrics to Track

**In Google Sheet:**

1. Total voice calls made per day
2. Confirmation rate from voice calls
3. Cancellation rate from voice calls
4. Voicemail/no-answer rate

**Add Tracking Formula:**

```
=COUNTIF(Voice_Call_Agent_Action_Taken, "Confirmed") / COUNTIF(20hr_Voice_Call_Made, TRUE)
```

**Expected Success Metrics:**

- **Confirmation Rate:** 60-70% (patients who answer and confirm)
- **Cancellation Rate:** 10-20% (patients who reschedule/cancel)
- **No Answer Rate:** 10-30% (voicemail/no answer)

---

## Next Steps

1. ✅ Complete Vapi.ai account setup
2. ✅ Add `20hr_Voice_Call_Made` column to Google Sheet
3. ✅ Import workflow to n8n
4. ✅ Configure environment variables
5. ✅ Test with personal phone number
6. ✅ Sign HIPAA BAA with Vapi
7. ✅ Deploy to production
8. ✅ Monitor for 1 week
9. ✅ Adjust conversation prompts if needed
10. ✅ Document results and ROI

---

## Support & Resources

**Vapi.ai Documentation:** https://docs.vapi.ai
**n8n Community:** https://community.n8n.io
**Google Sheets API:** https://developers.google.com/sheets/api

**Questions?** Check [VOICE_WORKFLOW_TESTING.md](VOICE_WORKFLOW_TESTING.md) for additional testing scenarios.

---

**Last Updated:** 2025-11-09
**Workflow Version:** 2.0 (Structured Outcomes Update)
**Status:** Production Ready ✅

---

## Version History

**v2.0 (2025-11-09)** - Structured Outcomes Update

- ✅ Added inline assistant configuration (no dashboard setup needed)
- ✅ Implemented structured data extraction with JSON schema
- ✅ Created separate webhook handler workflow
- ✅ Added four outcome types: confirmed, cancel, reschedule, unanswered
- ✅ Automated voicemail detection
- ✅ Enhanced Google Sheet tracking columns
- ✅ Comprehensive architecture documentation

**v1.0 (2025-10-31)** - Initial Release

- Basic voice call escalation
- Manual transcript parsing
- Single workflow architecture

---

## Additional Documentation

For complete technical details, see:

- [VAPI_INTEGRATION_ARCHITECTURE.md](VAPI_INTEGRATION_ARCHITECTURE.md) - Complete architecture guide
- [VOICE_WORKFLOW_TESTING.md](VOICE_WORKFLOW_TESTING.md) - Testing procedures
- [VOICE_WORKFLOW_COMPARISON.md](VOICE_WORKFLOW_COMPARISON.md) - Provider comparisons
