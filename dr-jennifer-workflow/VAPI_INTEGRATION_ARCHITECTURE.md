# Vapi Voice Call Integration Architecture

## Overview

This document explains the complete architecture for Vapi.ai voice call integration with structured outcome detection for Dr. Jennifer's appointment confirmation workflow.

## Architecture Pattern: Two-Workflow System

### Why Two Workflows?

We use **two separate n8n workflows** to handle voice calls:

1. **Voice Call Escalation Workflow** - Initiates outbound calls
2. **Vapi Call Results Handler Workflow** - Processes call outcomes (NEW)

This separation provides:
- ✅ Clean separation of concerns
- ✅ Independent testing capabilities
- ✅ Reusable webhook endpoint
- ✅ Better error handling and monitoring
- ✅ Scalability for future voice features

---

## Workflow 1: Voice Call Escalation

**File:** `voice-call-escalation-workflow.json`

**Purpose:** Identify unconfirmed appointments 20 hours before scheduled time and initiate Vapi voice calls.

### Flow Diagram

```
Schedule Trigger (Every 30 min)
  ↓
Read Appointments from Google Sheet
  ↓
Filter for 20hr Unconfirmed
  ↓
Any Calls Needed? (IF node)
  ↓ (TRUE)
Loop: Each Patient
  ↓
Initiate Vapi Call (HTTP POST)
  ↓
Extract Call ID
  ↓
Mark Call Initiated (Update Sheet: 20hr_Voice_Call_Made = TRUE)
```

### Key Node: Initiate Vapi Call (HTTP POST)

**Configuration:**
- **Method:** POST
- **URL:** `https://api.vapi.ai/call`
- **Authentication:** HTTP Header Auth
  - Header: `Authorization: Bearer {{ $env.VAPI_API_KEY }}`
- **Body Type:** JSON
- **Body Content:** Inline assistant configuration (see below)

### Inline Assistant Configuration

```json
{
  "phoneNumberId": "{{ $env.VAPI_PHONE_NUMBER_ID }}",
  "customer": {
    "number": "{{ $json.Patient_Phone }}"
  },
  "assistant": {
    "name": "Dr. Jennifer Appointment Confirmation Assistant",
    "model": {
      "provider": "anthropic",
      "model": "claude-3-5-sonnet-20241022",
      "messages": [
        {
          "role": "system",
          "content": "System prompt with patient-specific variables..."
        }
      ],
      "temperature": 0.7
    },
    "voice": {
      "provider": "11labs",
      "voiceId": "rachel"
    },
    "firstMessage": "Hi {{ $json.Patient_Name }}, this is Dr. Jennifer's office...",
    "endCallPhrases": ["goodbye", "thank you", "have a great day", "take care"],
    "recordingEnabled": true,
    "voicemailDetection": {
      "provider": "vapi",
      "enabled": true
    },
    "analysisPlan": {
      "summaryPrompt": "Summarize this appointment confirmation call...",
      "structuredDataPrompt": "Extract the call outcome...",
      "structuredDataSchema": {
        "type": "object",
        "properties": {
          "outcome": {
            "type": "string",
            "enum": ["confirmed", "cancel", "reschedule", "unanswered"]
          },
          "patientResponse": { "type": "string" },
          "needsFollowup": { "type": "boolean" },
          "appointmentConfirmed": { "type": "boolean" }
        },
        "required": ["outcome", "patientResponse", "needsFollowup", "appointmentConfirmed"]
      }
    }
  },
  "serverUrl": "{{ $env.N8N_WEBHOOK_URL }}/webhook/vapi-results"
}
```

### Dynamic Variables

The assistant configuration uses patient-specific data:
- `{{ $json.Patient_Name }}` - "John Smith"
- `{{ $json.Patient_Phone }}` - "+12345678901"
- `{{ $json.formattedDate }}` - "Monday, January 15"
- `{{ $json.formattedTime }}` - "2:30 PM"

### What Happens After API Call

1. Vapi receives the request and queues the call
2. Vapi returns: `{ id: "call_abc123", status: "queued" }`
3. Workflow marks `20hr_Voice_Call_Made = TRUE` in Google Sheet
4. Workflow ends
5. **Vapi makes the actual phone call** (asynchronous - happens separately)
6. When call ends, **Vapi sends webhook** to Workflow 2

---

## Workflow 2: Vapi Call Results Handler (NEW)

**File:** `vapi-call-results-handler-workflow.json`

**Purpose:** Receive call outcome from Vapi webhook and update appointment records accordingly.

### Flow Diagram

```
Webhook Trigger (/webhook/vapi-results)
  ↓
Parse Webhook Payload
  ↓
Route by Outcome (Switch node with 4 branches)
  ↓
  ├─ confirmed → Update Sheet: Status="Confirmed"
  ├─ cancel → Update Sheet: Status="Cancelled" → Prepare Cancellation Email
  ├─ reschedule → Update Sheet: Status="Rescheduling" → Prepare Reschedule Email
  └─ unanswered → Update Sheet: Voicemail_Left=TRUE
```

### Webhook Trigger

**Path:** `/webhook/vapi-results`

**Full URL:** `https://YOUR-N8N-INSTANCE.app.n8n.cloud/webhook/vapi-results`

**Trigger Type:** Webhook (receives POST requests from Vapi)

### Webhook Payload Structure

When a call ends, Vapi sends this payload:

```json
{
  "message": {
    "type": "end-of-call-report",
    "endedReason": "customer-ended-call",
    "call": {
      "id": "call_abc123",
      "status": "ended",
      "phoneNumberId": "your-phone-number-id",
      "customer": {
        "number": "+12345678901"
      }
    },
    "analysis": {
      "summary": "Patient confirmed they will attend their appointment tomorrow at 2:30 PM.",
      "structuredData": {
        "outcome": "confirmed",
        "patientResponse": "Patient confirmed they will attend",
        "needsFollowup": false,
        "appointmentConfirmed": true
      },
      "successEvaluation": "..."
    },
    "artifact": {
      "transcript": "Full conversation text...",
      "recording": {
        "url": "https://storage.vapi.ai/..."
      },
      "messages": [...]
    }
  }
}
```

### Parse Webhook Payload Node

Extracts and normalizes data:

```javascript
const payload = $input.first().json.body;
const message = payload.message;
const structuredData = message.analysis.structuredData || {};

// Output
{
  callId: "call_abc123",
  Patient_Phone: "+12345678901",
  outcome: "confirmed",
  patientResponse: "Patient confirmed they will attend",
  needsFollowup: false,
  appointmentConfirmed: true,
  callSummary: "Patient confirmed...",
  transcriptUrl: "...",
  recordingUrl: "https://storage.vapi.ai/...",
  callCompletedAt: "2025-01-15T14:32:10Z"
}
```

### Route by Outcome (Switch Node)

Routes to 4 different branches based on `outcome` value:

#### Branch 1: `outcome = "confirmed"`
- Updates Google Sheet:
  - `Status` = "Confirmed"
  - `Confirmed_At` = timestamp
  - `Confirmed_Via` = "Voice Call"
  - `Voice_Call_Outcome` = "confirmed"
  - `Voice_Call_Summary` = AI-generated summary
  - `Voice_Call_Recording_URL` = Vapi recording URL
- **No follow-up action needed** - patient is confirmed

#### Branch 2: `outcome = "cancel"`
- Updates Google Sheet:
  - `Status` = "Cancelled"
  - `Cancelled_At` = timestamp
  - `Cancelled_Via` = "Voice Call"
  - `Cancellation_Reason` = "Patient requested cancellation via voice call"
  - Recording and summary fields
- **Follow-up action:** Send cancellation confirmation email

#### Branch 3: `outcome = "reschedule"`
- Updates Google Sheet:
  - `Status` = "Rescheduling"
  - `Rescheduled_At` = timestamp
  - `Rescheduled_Via` = "Voice Call"
  - `Needs_Reschedule_Link` = TRUE
  - Recording and summary fields
- **Follow-up action:** Send Cal.com reschedule link via email

#### Branch 4: `outcome = "unanswered"`
- Updates Google Sheet:
  - `Voicemail_Left` = TRUE
  - `Voice_Call_Outcome` = "unanswered"
  - Summary and recording fields
- **No immediate action** - 2hr reminder will still send as fallback

### Voicemail Detection

Vapi automatically detects voicemail using AI-based detection:

**How it works:**
1. Call is initiated
2. Vapi listens to initial audio
3. AI determines if it's a human or voicemail
4. If voicemail: `endedReason = "voicemail-reached"`
5. Webhook contains this information

**Mapping to outcomes:**
- If `endedReason = "voicemail-reached"` → `outcome = "unanswered"`
- If patient answered but didn't confirm → outcome determined by conversation

---

## Structured Data Extraction

### What is Structured Data?

Instead of parsing transcripts manually, Vapi's AI automatically extracts structured information based on a JSON schema you provide.

### JSON Schema Definition

```json
{
  "type": "object",
  "properties": {
    "outcome": {
      "type": "string",
      "enum": ["confirmed", "cancel", "reschedule", "unanswered"],
      "description": "The final outcome of the call"
    },
    "patientResponse": {
      "type": "string",
      "description": "Brief description of what the patient said"
    },
    "needsFollowup": {
      "type": "boolean",
      "description": "Whether this patient needs additional follow-up contact"
    },
    "appointmentConfirmed": {
      "type": "boolean",
      "description": "True if patient explicitly confirmed they will attend"
    }
  },
  "required": ["outcome", "patientResponse", "needsFollowup", "appointmentConfirmed"]
}
```

### How AI Determines Outcome

The AI analyzes the conversation and maps patient responses to outcomes:

| Patient Says | AI Extracts Outcome |
|-------------|---------------------|
| "Yes, I'll be there" | `confirmed` |
| "I can make it" | `confirmed` |
| "I need to cancel" | `cancel` |
| "I can't come" | `cancel` |
| "Can we reschedule?" | `reschedule` |
| "I need a different time" | `reschedule` |
| (No answer / voicemail) | `unanswered` |
| "I'm not sure yet" | Depends on context - AI uses `needsFollowup: true` |

### Structured Data Prompt

The prompt guides the AI on how to extract data:

```
Extract the call outcome and patient's intent from this appointment
confirmation conversation. Determine if they confirmed attendance,
requested cancellation, requested reschedule, or if the call was
unanswered (voicemail/no pickup).
```

---

## Environment Variables Configuration

### Required Environment Variables

Set these in n8n (Settings → Environments):

```bash
# Vapi API Credentials
VAPI_API_KEY=your_vapi_api_key_here

# Vapi Phone Number ID (from Vapi dashboard)
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here

# n8n Webhook Base URL (for serverUrl)
N8N_WEBHOOK_URL=https://YOUR-INSTANCE.app.n8n.cloud
```

### Where to Find These Values

**1. Vapi API Key**
- Login to https://dashboard.vapi.ai
- Navigate to Settings → API Keys
- Create new API key or copy existing one
- Format: `1a639fcf-4f49-4e07-90c6-77d5cec2a12d`

**2. Vapi Phone Number ID**
- Dashboard → Phone Numbers
- Click on your phone number
- Copy the ID from the URL or details panel
- Format: `phone_abc123...`

**3. n8n Webhook URL**
- Your n8n instance base URL
- Example: `https://izzydev.app.n8n.cloud`
- The webhook path `/webhook/vapi-results` is appended automatically

---

## Google Sheet Columns

### New Columns Added for Voice Call Tracking

Add these columns to your `appointment` sheet:

| Column Name | Data Type | Purpose |
|------------|-----------|---------|
| `Voice_Call_Outcome` | Text | One of: confirmed, cancel, reschedule, unanswered |
| `Voice_Call_Summary` | Text | AI-generated call summary |
| `Voice_Call_Recording_URL` | URL | Link to Vapi call recording |
| `Voicemail_Left` | Boolean | TRUE if call reached voicemail |
| `Needs_Reschedule_Link` | Boolean | TRUE if patient requested reschedule |

### Existing Columns Used

| Column Name | Used By | Purpose |
|------------|---------|---------|
| `Patient_Phone` | Both workflows | Match patient for updates |
| `Patient_Name` | Workflow 1 | Personalize greeting |
| `Appointment_Date` | Workflow 1 | Tell patient their date |
| `Appointment_Time` | Workflow 1 | Tell patient their time |
| `Status` | Workflow 2 | Update to Confirmed/Cancelled/Rescheduling |
| `Confirmed_At` | Workflow 2 | Timestamp when confirmed |
| `Confirmed_Via` | Workflow 2 | Set to "Voice Call" |
| `20hr_Voice_Call_Made` | Workflow 1 | Prevent duplicate calls |

---

## Security & HIPAA Compliance

### Credential Management

✅ **DO:**
- Store API keys in n8n environment variables
- Use HTTP Header Auth credential type
- Never commit credentials to Git

❌ **DON'T:**
- Hardcode API keys in workflow JSON
- Share credentials in documentation
- Store keys in Google Sheets

### Call Recording & PHI

**Recording Settings:**
```json
"recordingEnabled": true
```

**HIPAA Requirements:**
1. ✅ Obtain patient consent for recording (via intake form)
2. ✅ Store recordings securely (Vapi uses encrypted storage)
3. ✅ Sign BAA with Vapi (Business Associate Agreement)
4. ✅ Set retention policy (delete after 30 days if not needed)
5. ✅ Restrict access to recordings (only authorized staff)

**Vapi's HIPAA Compliance:**
- Vapi is HIPAA-compliant when configured properly
- Recordings are encrypted at rest and in transit
- BAA available upon request from Vapi support

### Data in Transit

- ✅ All API calls use HTTPS/TLS
- ✅ Webhook payloads encrypted in transit
- ✅ No patient data in URL parameters

---

## Testing Procedures

### Test Scenario 1: Confirmed Appointment

**Steps:**
1. Add test appointment to Google Sheet (20 hours in future)
2. Set `Status = "Pending"`, `24hr_Reminder_Sent = TRUE`
3. Wait for workflow to trigger (or run manually)
4. Answer the call
5. Confirm you'll attend when asked

**Expected Result:**
- Vapi calls your phone
- Conversation happens
- Webhook received within 1-2 minutes after call ends
- Google Sheet updated:
  - `Status = "Confirmed"`
  - `Voice_Call_Outcome = "confirmed"`
  - Recording URL populated

### Test Scenario 2: Cancellation Request

**Steps:**
1. Set up test appointment
2. Answer call
3. Say "I need to cancel my appointment"

**Expected Result:**
- `Status = "Cancelled"`
- `Voice_Call_Outcome = "cancel"`
- Cancellation email prepared (check email node)

### Test Scenario 3: Reschedule Request

**Steps:**
1. Set up test appointment
2. Answer call
3. Say "Can I reschedule for a different time?"

**Expected Result:**
- `Status = "Rescheduling"`
- `Voice_Call_Outcome = "reschedule"`
- `Needs_Reschedule_Link = TRUE`
- Reschedule email prepared

### Test Scenario 4: Voicemail

**Steps:**
1. Set up test appointment
2. Don't answer the call (let it go to voicemail)

**Expected Result:**
- Voicemail message left
- `Voice_Call_Outcome = "unanswered"`
- `Voicemail_Left = TRUE`
- `Status` remains "Pending" (2hr reminder will still send)

### Debugging Test Calls

**Check these locations:**

1. **n8n Workflow 1 Executions**
   - Verify call was initiated
   - Check Vapi API response (call ID returned?)

2. **Vapi Dashboard**
   - Dashboard → Calls
   - Find your call by phone number or call ID
   - View transcript, recording, and structured data

3. **n8n Workflow 2 Executions**
   - Check if webhook was received
   - View parsed outcome data
   - Verify Google Sheet update

4. **Google Sheet**
   - Check row was updated
   - Verify recording URL is clickable

---

## Cost Estimates

### Vapi Pricing (as of 2025)

**Per Call Costs:**
- Voice AI (Claude 3.5 Sonnet): ~$0.10-0.15 per minute
- 11Labs voice synthesis: ~$0.03 per minute
- Twilio phone charges: ~$0.01 per minute
- **Total: ~$0.14-0.19 per minute**

**Average Call Duration:** 1-2 minutes

**Monthly Estimate for Dr. Jennifer:**
- 100 unconfirmed appointments/month
- Average 1.5 min per call
- Cost: 100 × 1.5 × $0.16 = **$24/month**

**ROI:**
- No-show rate reduction: 10% → 3% (saves ~$5,000/month)
- Staff time saved: 2 hours/day × $25/hour = $1,250/month
- **Total benefit: $6,250/month for $24/month cost = 26,000% ROI**

---

## Troubleshooting

### Issue: Call Not Initiated

**Symptoms:** Vapi API call fails, no call ID returned

**Possible Causes:**
1. Invalid `VAPI_API_KEY` - Check environment variable
2. Invalid `VAPI_PHONE_NUMBER_ID` - Verify in Vapi dashboard
3. Patient phone number not in E.164 format - Must start with `+1`
4. Vapi account out of credits

**Solution:**
```bash
# Test API key
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.vapi.ai/call

# Check phone number format
# CORRECT: +12345678901
# WRONG: (234) 567-8901
```

### Issue: Webhook Not Received

**Symptoms:** Call completes but Workflow 2 never triggers

**Possible Causes:**
1. `serverUrl` not configured in Vapi call
2. Webhook URL is incorrect
3. n8n workflow 2 not activated

**Solution:**
1. Check HTTP Request node has `serverUrl` in body
2. Verify webhook URL: `https://YOUR-INSTANCE.app.n8n.cloud/webhook/vapi-results`
3. Activate Workflow 2 (toggle switch in n8n)
4. Test webhook manually: Send POST to webhook URL

### Issue: Wrong Outcome Detected

**Symptoms:** Patient confirmed but outcome shows "cancel"

**Possible Causes:**
1. Ambiguous patient response
2. AI model temperature too high
3. Structured data prompt needs refinement

**Solution:**
1. Review call transcript in Vapi dashboard
2. Refine `structuredDataPrompt` to be more explicit
3. Adjust model temperature (lower = more deterministic)
4. Add more examples to system prompt

### Issue: Google Sheet Not Updated

**Symptoms:** Webhook received but sheet row not updated

**Possible Causes:**
1. `Patient_Phone` doesn't match (formatting issue)
2. Google Sheets credential expired
3. Sheet ID or sheet name changed

**Solution:**
1. Check phone number format matches exactly (including `+1`)
2. Reconnect Google Sheets OAuth credential
3. Verify `documentId` and `sheetName` in Google Sheets nodes

---

## Future Enhancements

### Planned Features

1. **Real-time Staff Alerts**
   - Send Slack/SMS to staff when urgent responses received
   - Trigger for: cancellations, reschedule requests

2. **Multi-language Support**
   - Detect patient's preferred language
   - Use different voice and prompts for Spanish, etc.

3. **Sentiment Analysis**
   - Detect patient frustration or concern
   - Flag for staff follow-up

4. **Automated Rescheduling**
   - Instead of just sending link, use Vapi to offer times during call
   - Book new appointment via API during conversation

5. **Voice Biometrics**
   - Verify patient identity by voice (HIPAA-compliant)
   - Reduce fraud and improve security

### Integration Opportunities

- **Athenahealth FHIR API:** Update appointment status in EMR automatically
- **Twilio SMS:** Send follow-up text with confirmation number after call
- **Zapier:** Connect to other practice management systems
- **Analytics Dashboard:** Visualize call outcomes, success rates, trends

---

## Additional Resources

### Vapi Documentation
- API Reference: https://docs.vapi.ai/api-reference/calls/create
- Structured Data Guide: https://docs.vapi.ai/features/structured-data
- Voicemail Detection: https://docs.vapi.ai/features/voicemail-detection
- HIPAA Compliance: https://docs.vapi.ai/security/hipaa

### n8n Documentation
- Webhook Trigger: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/
- HTTP Request: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/
- Environment Variables: https://docs.n8n.io/code-examples/expressions/environment-variables/

### Related Workflow Documentation
- `VOICE_ESCALATION_SETUP_GUIDE.md` - Original setup instructions
- `VOICE_WORKFLOW_TESTING.md` - Testing procedures
- `VOICE_WORKFLOW_COMPARISON.md` - Comparison with other voice providers

---

## Summary

✅ **Two-workflow architecture** for clean separation of concerns
✅ **Inline assistant configuration** for personalized patient conversations
✅ **Structured data extraction** eliminates manual transcript parsing
✅ **Four outcome types** cover all scenarios: confirmed, cancel, reschedule, unanswered
✅ **Voicemail detection** automatically handled by Vapi AI
✅ **HIPAA compliant** when configured with BAAs and proper security
✅ **Cost-effective** at ~$24/month for 100 calls
✅ **Scalable** architecture ready for future enhancements

This integration provides a professional, automated voice confirmation system that improves patient experience while saving staff time and reducing no-shows.
