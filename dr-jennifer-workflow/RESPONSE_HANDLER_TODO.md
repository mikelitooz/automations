# Response Handler Workflow - Specification (TODO)

## Overview
This workflow will handle patient email responses to appointment reminder emails. Patients can reply with:
- **1** = Confirm appointment
- **2** = Cancel appointment
- **3** = Request to reschedule

## Workflow Architecture

```
Gmail Trigger (watch for incoming emails)
  ↓
Filter: Only emails replying to our reminder threads
  ↓
Code Node: Parse email body for "1", "2", or "3"
  ↓
Switch Node: Route by response type
  ↓
  ├─ Response = "1" (CONFIRM)
  │   → Update Sheet: Status = "Confirmed"
  │   → Gmail: "Thank you for confirming!"
  │
  ├─ Response = "2" (CANCEL)
  │   → Update Sheet: Status = "Cancelled"
  │   → Gmail: "Your appointment has been cancelled"
  │   → [TRIGGER] Waitlist Notification Workflow
  │
  └─ Response = "3" (RESCHEDULE)
      → Gmail: "Please visit [link] to choose a new time"
      → Update Sheet: Status = "Rescheduled"
```

## Technical Requirements

### 1. Gmail Trigger Configuration
- **Type**: Gmail Trigger node
- **Event**: New email received
- **Filter criteria**:
  - Subject contains: "Re: Appointment Reminder" or "Re: ACTION REQUIRED"
  - From: Patient email addresses (match against Google Sheet)
  - Has not been processed yet (use label or flag)

### 2. Email Parsing Logic (Code Node)

```javascript
/**
 * Parse patient email response
 * Extract: patient email, response choice (1/2/3), appointment details
 */

const emailBody = $json.body || $json.textPlain || "";
const fromEmail = $json.from;

// Extract response number (1, 2, or 3)
let response = null;
const patterns = [
  /^\s*1\s*$/m,  // Just "1"
  /^\s*2\s*$/m,  // Just "2"
  /^\s*3\s*$/m,  // Just "3"
  /reply.*1/i,   // "Reply 1"
  /reply.*2/i,   // "Reply 2"
  /reply.*3/i    // "Reply 3"
];

if (patterns[0].test(emailBody) || patterns[3].test(emailBody)) {
  response = "confirm";
} else if (patterns[1].test(emailBody) || patterns[4].test(emailBody)) {
  response = "cancel";
} else if (patterns[2].test(emailBody) || patterns[5].test(emailBody)) {
  response = "reschedule";
} else {
  response = "unknown";
}

return {
  json: {
    ...row,
    patientEmail: fromEmail,
    responseType: response,
    originalBody: emailBody,
    processedAt: new Date().toISOString()
  }
};
```

### 3. Google Sheets Integration

**Lookup Patient:**
- Use Gmail Trigger: "from" email address
- Find matching row in "Appointments" sheet
- Match by: `Patient Email` column

**Update Sheet:**

#### For Confirm (Response = "1"):
```json
{
  "Status": "Confirmed",
  "Confirmed_At": "[Timestamp]",
  "Confirmed_Via": "Email"
}
```

#### For Cancel (Response = "2"):
```json
{
  "Status": "Cancelled",
  "Cancelled_At": "[Timestamp]",
  "Cancelled_Via": "Email",
  "Cancellation_Reason": "Patient requested"
}
```

#### For Reschedule (Response = "3"):
```json
{
  "Status": "Rescheduled",
  "Rescheduled_At": "[Timestamp]",
  "Rescheduled_Via": "Email"
}
```

### 4. Confirmation Emails

#### Confirm Email Template:
```
Subject: ✅ Appointment Confirmed

Hi [Patient Name],

Thank you for confirming your appointment!

📅 [Date] at [Time]
👨‍⚕️ With Dr. [Doctor Name]
📋 [Appointment Type]

We'll send you a reminder 24 hours before your appointment.

See you then!
Dr. Jennifer's Clinic
```

#### Cancel Email Template:
```
Subject: Appointment Cancelled

Hi [Patient Name],

Your appointment on [Date] at [Time] has been cancelled as requested.

If you need to schedule a new appointment, please visit:
[Booking Link]

Or join our waitlist for earlier availability:
[Waitlist Form Link]

Best regards,
Dr. Jennifer's Clinic
```

#### Reschedule Email Template:
```
Subject: Reschedule Your Appointment

Hi [Patient Name],

We've received your request to reschedule your appointment originally scheduled for [Date] at [Time].

Please choose a new time:
[Cal.com Booking Link]

If you need assistance, please call us at [Phone Number].

Best regards,
Dr. Jennifer's Clinic
```

### 5. Error Handling

**Unknown Response:**
If patient replies with something other than "1", "2", or "3":

```
Subject: Please Clarify Your Response

Hi [Patient Name],

We received your email but couldn't understand your response.

For your appointment on [Date] at [Time], please reply with:
1 = Confirm
2 = Cancel
3 = Reschedule

Or call us at [Phone Number].

Best regards,
Dr. Jennifer's Clinic
```

**Patient Not Found:**
If email address doesn't match any appointment:
- Log error
- Send generic "Please contact us" email
- Alert staff

## Integration Points

### Connect to Reminder Workflow
After these nodes in `my_build_FIXED.json`:
- "Update 48hr Flag"
- "Update 24hr Flag"

Add note: "→ Response Handler Workflow monitors for replies"

### Connect to Waitlist Workflow
When Response = "2" (Cancel):
- After updating Status to "Cancelled"
- Trigger the Waitlist Notification workflow (pass appointment details)

## Testing Scenarios

### Test 1: Patient Confirms (Response = "1")
1. Send test email from patient email to clinic Gmail
2. Subject: "Re: Appointment Reminder - Dr. Jennifer"
3. Body: "1"
4. Expected:
   - Status updated to "Confirmed" in Google Sheet
   - Patient receives confirmation email

### Test 2: Patient Cancels (Response = "2")
1. Send email with body: "2"
2. Expected:
   - Status updated to "Cancelled"
   - Patient receives cancellation email
   - Waitlist workflow triggered

### Test 3: Patient Reschedules (Response = "3")
1. Send email with body: "3"
2. Expected:
   - Status updated to "Rescheduled"
   - Patient receives Cal.com booking link

### Test 4: Invalid Response
1. Send email with body: "I want to cancel"
2. Expected:
   - Patient receives clarification email
   - Status unchanged

## Additional Features (Optional)

### 1. Natural Language Processing
Instead of just "1", "2", "3", detect:
- "confirm", "yes", "I'll be there" → Confirm
- "cancel", "can't make it", "no" → Cancel
- "reschedule", "change time", "different day" → Reschedule

### 2. Confirmation Codes
Add unique confirmation code to emails:
- "Reply with: CONFIRM-A3X9 to confirm"
- Prevents accidental confirmations from other emails

### 3. Response Deadline
- Only accept responses up to 1 hour before appointment
- After deadline: "Too late to cancel, please call us"

### 4. Multiple Appointments
If patient has multiple appointments:
- Include appointment ID in email
- Parse which appointment they're responding to

## n8n Nodes Needed

1. **Gmail Trigger** (trigger)
2. **Google Sheets: Lookup** (find patient by email)
3. **Code: Parse Response** (extract 1/2/3)
4. **Switch: Route by Response** (confirm/cancel/reschedule/unknown)
5. **Google Sheets: Update** (update Status field) - 3 separate nodes
6. **Gmail: Send Confirmation** - 4 different templates
7. **HTTP Request: Trigger Waitlist** (call waitlist workflow webhook)
8. **Error Handler: Unknown Response**

## Environment Variables

```bash
# Cal.com booking link
CAL_COM_BOOKING_URL=https://cal.com/dr-jennifer

# Waitlist form
WAITLIST_FORM_URL=https://forms.google.com/waitlist

# Clinic phone
CLINIC_PHONE=+1-555-123-4567

# Waitlist workflow webhook
WAITLIST_WEBHOOK_URL=https://izzydev.app.n8n.cloud/webhook/waitlist-notification
```

## Priority: HIGH
This workflow is critical for the reminder system to be fully functional. Without it:
- Patients must call to confirm/cancel (more staff workload)
- Auto-cancel at 2hr mark happens even if patient wants to keep appointment
- No automated waitlist filling

## Estimated Build Time: 4-6 hours

---

**Status:** Not yet built (placeholder nodes exist in `my_build_FIXED.json`)
**Next Steps:**
1. Review this specification
2. Build and test with sample emails
3. Connect to main reminder workflow
4. Deploy and monitor for 48 hours
