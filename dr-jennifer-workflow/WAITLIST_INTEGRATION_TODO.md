# Waitlist Integration Workflow - Specification (TODO)

## Overview
When an appointment is cancelled (either manually or auto-cancelled at 2hr mark), this workflow notifies ALL patients on the waitlist about the open slot. The first patient to reply "YES" gets the appointment.

## Workflow Architecture

```
Webhook Trigger (cancelled appointment details)
  ↓
Read Waitlist Sheet (get all waitlist patients)
  ↓
Code Node: Format mass notification email
  ↓
Gmail: Send to ALL waitlist patients
  ↓
Gmail Trigger: Wait for first "YES" reply
  ↓
Code: Extract patient email from reply
  ↓
Google Sheets: Lookup waitlist patient details
  ↓
Google Sheets: Update Appointments sheet
  │   - Replace cancelled appointment with new patient
  │   - Status = "Confirmed"
  │
Gmail: Send confirmation to successful patient
  ↓
Google Sheets: Remove patient from Waitlist
  ↓
Gmail: Send "slot filled" notice to other waitlist patients
```

## Data Flow

### Input (from Cancelled Appointment)
```json
{
  "appointmentId": "row_12",
  "date": "Monday, November 4",
  "time": "02:15 PM",
  "doctorName": "Dr. Jennifer",
  "appointmentType": "Follow-up",
  "cancelledPatientName": "John Doe",
  "cancelledAt": "2025-01-30T10:00:00Z"
}
```

### Waitlist Sheet Structure
Expected columns in "Waitlist" tab:
- Patient Name
- Patient Email
- Patient Phone
- Preferred Doctor (optional)
- Date Added
- Priority (optional: 1=high, 2=normal, 3=low)

## Technical Implementation

### 1. Webhook Trigger

**Setup in Reminder Workflow:**
After "Update Status to Cancelled" node, add:
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://izzydev.app.n8n.cloud/webhook/waitlist-notification",
    "method": "POST",
    "body": {
      "date": "={{ $json.Date }}",
      "time": "={{ $json.Time }}",
      "doctorName": "={{ $json['Doctor Name'] }}",
      "appointmentType": "={{ $json['Appointment Type'] }}",
      "formattedDate": "={{ $json.formattedDate }}",
      "formattedTime": "={{ $json.formattedTime }}",
      "patientName": "={{ $json['Patient Name'] }}",
      "rowNumber": "={{ $json.row_number }}"
    }
  }
}
```

**This Workflow:**
```json
{
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "waitlist-notification",
    "responseMode": "responseNode",
    "httpMethod": "POST"
  }
}
```

### 2. Read Waitlist Sheet

```json
{
  "type": "n8n-nodes-base.googleSheets",
  "parameters": {
    "operation": "read",
    "documentId": {
      "value": "1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s"
    },
    "sheetName": {
      "value": "Waitlist"
    },
    "options": {}
  }
}
```

### 3. Filter Waitlist (Optional)

If "Preferred Doctor" column exists:
```javascript
// Only notify patients who prefer this doctor OR have no preference
const doctorName = $json.doctorName;
const waitlistPatients = $input.all();

const eligible = waitlistPatients.filter(item => {
  const preferred = item.json["Preferred Doctor"];
  return !preferred || preferred === "Any" || preferred === doctorName;
});

return eligible;
```

### 4. Mass Notification Email

**To:** All waitlist patients (BCC for privacy)
**Subject:** 🚨 Appointment Slot Available - Reply YES to Claim

**Email Template:**
```
Hi Waitlist Patients,

An appointment slot has just become available!

📅 {{ $json.formattedDate }}
⏰ {{ $json.formattedTime }}
👨‍⚕️ With {{ $json.doctorName }}
📋 {{ $json.appointmentType }}

⚡ FIRST TO REPLY "YES" GETS THE APPOINTMENT ⚡

Simply reply to this email with:
YES

We will respond within 5 minutes to confirm if you got the slot.

Note: This is a time-sensitive notification. If someone else responds before you, the slot will be filled.

Best regards,
Dr. Jennifer's Clinic
```

**Important:** Use BCC (blind carbon copy) to protect patient privacy

### 5. Wait for First "YES" Reply

**Gmail Trigger Configuration:**
```json
{
  "type": "n8n-nodes-base.gmailTrigger",
  "parameters": {
    "event": "messageReceived",
    "simple": false,
    "filters": {
      "subject": "Re: 🚨 Appointment Slot Available"
    }
  }
}
```

**Parse Response (Code Node):**
```javascript
/**
 * Check if email contains "YES"
 * First YES wins
 */

const emailBody = ($json.body || $json.textPlain || "").toUpperCase();
const fromEmail = $json.from;

if (emailBody.includes("YES")) {
  return {
    json: {
      ...row,
      winnerEmail: fromEmail,
      repliedAt: new Date().toISOString(),
      isWinner: true
    }
  };
} else {
  // Not a valid YES reply, ignore
  return [];
}
```

### 6. Race Condition Handling

**Problem:** Multiple patients might reply "YES" simultaneously

**Solution: First-Write-Wins with Lock**
```javascript
/**
 * Check if slot is still available before assigning
 * Use atomic operation to prevent race conditions
 */

// 1. Re-read appointment row from sheet
const appointmentRow = await getAppointmentRow(rowNumber);

// 2. Check if still cancelled
if (appointmentRow.Status !== "Cancelled") {
  // Slot already filled by someone else
  return {
    json: {
      ...row,
      isWinner: false,
      reason: "Slot already filled"
    }
  };
}

// 3. Immediately update to "Processing" to lock
await updateAppointmentStatus(rowNumber, "Processing");

// 4. Proceed with assignment
return {
  json: {
    ...row,
    isWinner: true,
    slotLocked: true
  }
};
```

### 7. Update Appointments Sheet

**Replace cancelled appointment with new patient:**
```json
{
  "operation": "update",
  "columns": {
    "mappingMode": "defineBelow",
    "value": {
      "Patient Name": "={{ $json.winnerName }}",
      "Patient Email": "={{ $json.winnerEmail }}",
      "Patient Phone": "={{ $json.winnerPhone }}",
      "Status": "Confirmed",
      "Confirmed_At": "={{ $now }}",
      "Confirmed_Via": "Waitlist",
      "48hr Reminder Sent": "FALSE",
      "24hr Reminder Sent": "FALSE",
      "2hr Reminder Sent": "FALSE"
    },
    "matchingColumns": ["row_number"]
  }
}
```

**Note:** Reset reminder flags so new patient gets reminders

### 8. Confirmation Email (Winner)

```
Subject: ✅ Congratulations! You Got the Appointment

Hi {{ $json.winnerName }},

Great news! You were the first to respond and have been assigned the appointment:

📅 {{ $json.formattedDate }}
⏰ {{ $json.formattedTime }}
👨‍⚕️ With {{ $json.doctorName }}
📋 {{ $json.appointmentType }}

Your appointment is now CONFIRMED.

We'll send you reminder emails 48 hours and 24 hours before your appointment.

Please arrive 10 minutes early.

See you then!
Dr. Jennifer's Clinic
```

### 9. Remove from Waitlist

```json
{
  "operation": "delete",
  "documentId": "1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s",
  "sheetName": "Waitlist",
  "columns": {
    "matchingColumns": ["Patient Email"],
    "value": {
      "Patient Email": "={{ $json.winnerEmail }}"
    }
  }
}
```

### 10. Notification to Other Waitlist Patients

**Subject:** Appointment Slot Filled

```
Hi {{ $json["Patient Name"] }},

The appointment slot we notified you about ({{ $json.formattedDate }} at {{ $json.formattedTime }}) has been filled.

You remain on our waitlist and will be notified of future openings.

Thank you for your patience!
Dr. Jennifer's Clinic
```

**Send to:** All waitlist patients EXCEPT the winner

## Edge Cases & Error Handling

### 1. No Responses After 15 Minutes
- **Action:** Mark slot as "AVAILABLE" in sheet
- **Manual Process:** Front desk can assign to walk-ins or reschedule

### 2. Invalid "YES" Response
- **Example:** Patient replies "YES PLEASE" or "YES I WANT IT"
- **Action:** Still accept (check for "YES" anywhere in body)

### 3. Winner Doesn't Have Required Info
- **Problem:** Waitlist entry missing phone number
- **Action:** Send follow-up email requesting missing info before confirming

### 4. Multiple People Reply Within Same Second
- **Solution:** Gmail assigns unique message IDs
- **Logic:** First message ID received wins

### 5. Slot Cancelled During Waitlist Process
- **Scenario:** Doctor emergency, slot cancelled while waitlist running
- **Action:** Stop workflow, email all waitlist patients "Slot no longer available"

## Performance Optimization

### Large Waitlist (100+ Patients)
1. **Batch Emails:** Send in batches of 50 (Gmail API limit)
2. **Pagination:** If >500 waitlist entries, paginate reads
3. **Caching:** Cache waitlist data for 5 minutes to reduce sheet reads

### Fast Response Handling
- Gmail Trigger checks for new emails every 30 seconds
- Use webhook for instant notifications (if Gmail supports)

## Testing Scenarios

### Test 1: Single Waitlist Patient
1. Add 1 patient to Waitlist sheet
2. Cancel an appointment (trigger workflow)
3. Check email sent to waitlist patient
4. Reply "YES" from patient email
5. Verify:
   - Appointment updated with new patient
   - Waitlist patient removed
   - Confirmation email received

### Test 2: Multiple Waitlist Patients (Race Condition)
1. Add 3 patients to Waitlist
2. Cancel appointment
3. All 3 receive notification
4. Have all 3 reply "YES" within 1 minute
5. Verify:
   - Only 1 gets the appointment (first responder)
   - Other 2 receive "slot filled" email

### Test 3: No Waitlist Patients
1. Empty Waitlist sheet
2. Cancel appointment
3. Verify:
   - No emails sent
   - Appointment stays "Cancelled"
   - No errors in workflow

### Test 4: Preferred Doctor Filter
1. Add patients with different "Preferred Doctor" values
2. Cancel appointment with Dr. Smith
3. Verify:
   - Only patients who prefer Dr. Smith (or "Any") receive notification
   - Patients who prefer Dr. Jones do NOT receive email

## Integration with Reminder Workflow

### Connection Point
In `my_build_FIXED.json`, after "Update Status to Cancelled" node:

```
Update Status to Cancelled
  ↓
HTTP Request: Trigger Waitlist Webhook
  ↓
[End - Waitlist workflow takes over]
```

### Reminder Reset
When waitlist patient is assigned:
- Reset ALL reminder flags to FALSE
- New patient will receive full reminder sequence (48hr, 24hr, 2hr)

## Security Considerations

### 1. Patient Privacy
- ✅ Use BCC for mass notifications (patients can't see each other)
- ✅ Don't include previous patient's details in emails
- ✅ Log all waitlist assignments for audit trail

### 2. Spam Prevention
- Limit: Max 1 waitlist notification per slot
- Cooldown: Don't notify same waitlist patient more than 3 times/day

### 3. Data Validation
- Verify email addresses before sending
- Sanitize patient names (prevent injection)

## Environment Variables

```bash
# Waitlist webhook URL
WAITLIST_WEBHOOK_URL=https://izzydev.app.n8n.cloud/webhook/waitlist-notification

# Response timeout (minutes)
WAITLIST_RESPONSE_TIMEOUT=15

# Max waitlist patients to notify
WAITLIST_NOTIFY_LIMIT=100
```

## Monitoring & Analytics

### Track Metrics:
- Waitlist fill rate (% of cancelled slots filled from waitlist)
- Average response time (how fast patients reply)
- Conversion rate (notifications sent vs appointments filled)
- Waitlist size over time

### Success Criteria:
- ✅ 80%+ of cancelled slots filled from waitlist
- ✅ Average response time < 5 minutes
- ✅ No double-booking errors
- ✅ Patient satisfaction with process

## Future Enhancements

### 1. Priority System
- VIP patients get notified first
- Long-waiters get priority after X days

### 2. SMS Notifications
- In addition to email, send SMS for faster response
- Use Twilio integration

### 3. Auto-Confirmation
- If only 1 person on waitlist, auto-assign (skip "YES" reply)

### 4. Waitlist Expiration
- Remove patients after X days of inactivity
- Send re-confirmation: "Still interested in waitlist?"

## Priority: HIGH
This workflow completes the "appointment lifecycle":
- Booking (Cal.com) ✅
- Reminders (my_build_FIXED.json) ✅
- Response Handling (RESPONSE_HANDLER_TODO.md) ⏳
- **Waitlist Filling (THIS WORKFLOW)** ⏳

## Estimated Build Time: 6-8 hours

---

**Status:** Not yet built (placeholder node exists in `my_build_FIXED.json`)
**Dependencies:**
- Response Handler Workflow (recommended to build first)
- Waitlist Google Form (for patients to join waitlist)

**Next Steps:**
1. Create "Waitlist" tab in Google Sheet
2. Create Google Form for waitlist sign-up
3. Build and test with 2-3 test patients
4. Deploy and monitor for race conditions
5. Optimize for large waitlist (100+ patients)
