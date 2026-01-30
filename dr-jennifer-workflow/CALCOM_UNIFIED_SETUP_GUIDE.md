# Cal.com Unified Event Handler - Complete Setup Guide

## Overview

The **Cal.com Unified Event Handler** is a single, comprehensive workflow that manages the complete appointment lifecycle in one place. This replaces the need for separate appointment booking and event handler workflows.

### What This Workflow Handles

| Event Type | Action | Result |
|------------|--------|--------|
| **BOOKING_CREATED** | Append new row to Google Sheets | New appointment tracked |
| **BOOKING_CANCELLED** | Update status → "Cancelled" | Waitlist triggered for freed slot |
| **BOOKING_RESCHEDULED** | Update status → "Rescheduled" | Waitlist triggered for original slot |

### Benefits Over Separate Workflows

✅ **Single webhook URL** - One Cal.com integration point instead of 2-3
✅ **Unified logging** - All appointment events in one execution history
✅ **Consistent error handling** - Same parsing and validation logic
✅ **Easier maintenance** - One workflow to update, test, and monitor
✅ **Better performance** - Reduced webhook overhead
✅ **Atomic operations** - All appointment data changes centralized

---

## Architecture Diagram

```
Cal.com (Patient Actions)
    ↓
Cal.com Trigger (3 events: CREATED, CANCELLED, RESCHEDULED)
    ↓
Parse Cal.com Webhook (extract patient data, appointment details)
    ↓
Switch by Event Type (3-way router)
    ↓
┌──────────────────────┬─────────────────────┬──────────────────────┐
│   BOOKING_CREATED    │   BOOKING_CANCELLED │   BOOKING_RESCHEDULED│
│   ↓                  │   ↓                 │   ↓                  │
│   Append New Row     │   Update Status     │   Update Status      │
│   to Google Sheets   │   Staff Alert       │   Staff Alert        │
│   (Status: Pending)  │   Trigger Waitlist  │   Trigger Waitlist   │
└──────────────────────┴─────────────────────┴──────────────────────┘
```

---

## Prerequisites

Before starting setup, ensure you have:

- [ ] n8n instance (cloud or self-hosted): https://izzydev.app.n8n.cloud/
- [ ] Cal.com account with API access
- [ ] Google Sheets document for appointments
- [ ] Gmail account for staff notifications
- [ ] Waitlist notification workflow (separate, optional)

---

## Setup Instructions

### Part 1: Import Workflow to n8n

1. **Open n8n Dashboard**: Navigate to https://izzydev.app.n8n.cloud/
2. **Import Workflow**:
   - Click "+ Add workflow" button
   - Select "Import from file"
   - Choose `calcom-unified-event-handler-workflow.json`
   - Workflow name will auto-populate: "Cal.com Unified Event Handler - Complete Lifecycle"
3. **Save Workflow**: Click "Save" button

---

### Part 2: Configure Cal.com Trigger

#### Step 1: Open Cal.com Trigger Node
- Click on "Cal.com Trigger (All Events)" node (leftmost node)
- Verify events are configured:
  - ✅ BOOKING_CREATED
  - ✅ BOOKING_CANCELLED
  - ✅ BOOKING_RESCHEDULED

#### Step 2: Connect Cal.com Account
- Click "Credential to connect with" dropdown
- **If credential exists**: Select "Cal account"
- **If creating new**:
  1. Click "Create New Credential"
  2. Name: `Cal account`
  3. Get API Key from Cal.com:
     - Go to Cal.com → Settings → Security → API Keys
     - Click "Generate new API key"
     - Copy the key
  4. Paste API Key into n8n credential
  5. Click "Save"

#### Step 3: Activate Webhook
- Click "Listen for event" button in the trigger node
- n8n will automatically register the webhook with Cal.com
- **Webhook URL** will be generated (example: `https://izzydev.app.n8n.cloud/webhook-test/abc123`)
- Cal.com will now send all 3 event types to this workflow

**Important**: The webhook only triggers when workflow is **ACTIVE** (toggle in top-right)

---

### Part 3: Configure Google Sheets Connection

#### Nodes That Need Google Sheets Credentials
1. "Google Sheets: Append New Appointment" (line 100)
2. "Google Sheets: Update Cancelled" (line 400)
3. "Google Sheets: Update Rescheduled" (line 700)

#### Step 1: Reconnect Google Sheets Credential
For each node above:
1. Click on the node
2. Click "Credential to connect with" dropdown
3. **If credential exists**: Select "Google Sheets account"
4. **If creating new**:
   - Click "Create New Credential"
   - Name: `Google Sheets account`
   - Follow OAuth2 flow (sign in with Google)
   - Grant access to Google Sheets
   - Click "Save"

#### Step 2: Verify Document ID
All three Google Sheets nodes should point to:
- **Document ID**: `1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y`
- **Sheet Name**: `Sheet1` (gid=0)

**To change to your own sheet**:
1. Open your Google Sheets document
2. Copy the Document ID from URL:
   ```
   https://docs.google.com/spreadsheets/d/[DOCUMENT_ID]/edit
   ```
3. Update "documentId" → "value" in all three nodes

#### Step 3: Verify Column Mapping

**For "Append New Appointment" node** - ensure these columns exist in your sheet:
- Appointment_Uid
- Date
- Time
- ISO_Time_Format
- Patient_Name
- Patient_Email
- Patient_Phone
- Doctor_Name
- Appointment_Type
- Status
- 48hr_Reminder_Sent
- 24hr_Reminder_Sent
- 2hr_Reminder_Sent
- Cancelled_At
- Cancelled_Via
- Cancellation_Reason
- Rescheduled_At
- Rescheduled_Via
- New_Date
- New_Time

**For "Update Cancelled" node** - matching column:
- Uses `Appointment_Uid` to find row
- Updates: Status, Cancelled_At, Cancelled_Via, Cancellation_Reason

**For "Update Rescheduled" node** - matching column:
- Uses `Appointment_Uid` to find row
- Updates: Status, Rescheduled_At, Rescheduled_Via, New_Date, New_Time

---

### Part 4: Configure Staff Email Notifications

#### Nodes That Need Gmail Credentials
1. "Gmail: Staff Cancellation Alert" (line 400)
2. "Gmail: Staff Reschedule Alert" (line 700)

#### Step 1: Update Staff Email Address
In both nodes, change:
```javascript
"sendTo": "=debbiehills47@gmail.com"
```
To:
```javascript
"sendTo": "=YOUR_STAFF_EMAIL@example.com"
```

#### Step 2: Connect Gmail Credential
For each Gmail node:
1. Click on the node
2. Click "Credential to connect with" dropdown
3. **If credential exists**: Select "Gmail account"
4. **If creating new**:
   - Click "Create New Credential"
   - Name: `Gmail account`
   - Follow OAuth2 flow (sign in with Google)
   - Grant access to Gmail
   - Click "Save"

#### Step 3: Customize Email Messages (Optional)
You can customize the email templates in the "message" field:
- **Cancellation email**: See line 126 in workflow JSON
- **Reschedule email**: See line 228 in workflow JSON

---

### Part 5: Configure Waitlist Notification (Optional)

If you have a separate waitlist notification workflow, configure the webhook URLs.

#### Nodes That Trigger Waitlist
1. "HTTP: Trigger Waitlist (Cancellation)" (line 400)
2. "HTTP: Trigger Waitlist (Reschedule)" (line 700)

#### Step 1: Verify Waitlist Webhook URL
Both nodes should have:
```json
{
  "url": "https://izzydev.app.n8n.cloud/webhook/waitlist-notification"
}
```

#### Step 2: Confirm Waitlist Workflow Exists
1. Go to n8n Workflows
2. Look for "Waitlist Notification - First YES Wins" workflow
3. Open webhook trigger node
4. Verify webhook path is `waitlist-notification`
5. Ensure workflow is **ACTIVE**

**If you don't have a waitlist workflow**:
- You can delete these two HTTP nodes
- Or keep them inactive for future use

---

### Part 6: Test the Workflow

#### Before Testing
- [ ] Workflow is saved
- [ ] Cal.com credential is connected
- [ ] Google Sheets credentials are connected
- [ ] Gmail credentials are connected (if using staff alerts)
- [ ] Staff email address is updated
- [ ] Workflow is **ACTIVE** (toggle in top-right is green)

#### Test 1: Create New Appointment

**Setup**:
1. Go to your Cal.com booking page
2. Use your personal email for testing
3. Book an appointment for tomorrow

**Expected Results**:
- ✅ Workflow executes (check n8n Executions)
- ✅ "Parse Cal.com Webhook" output shows `eventType: "BOOKING_CREATED"`
- ✅ "Route by Event Type" routes to "created" output (output 0)
- ✅ New row added to Google Sheets with Status: "Pending"
- ✅ All patient data populated correctly

**Verify in n8n**:
1. Go to Executions tab
2. Click latest execution
3. Check each node output
4. Ensure no errors

**Verify in Google Sheets**:
1. Open your Google Sheets document
2. Check last row
3. Verify all columns populated:
   - Appointment_Uid (should be Cal.com uid)
   - Date (human-readable: "Friday, October 31")
   - Time (human-readable: "03:45 PM")
   - ISO_Time_Format (machine-readable: "2025-10-31T15:45:00Z")
   - Patient data (name, email, phone)
   - Status: "Pending"

#### Test 2: Cancel Appointment

**Setup**:
1. Open Cal.com booking confirmation email
2. Click "Cancel" button
3. Confirm cancellation

**Expected Results**:
- ✅ Workflow executes
- ✅ "Parse Cal.com Webhook" output shows `eventType: "BOOKING_CANCELLED"`
- ✅ "Route by Event Type" routes to "cancelled" output (output 1)
- ✅ Google Sheets Status updated to "Cancelled"
- ✅ Cancelled_At, Cancelled_Via populated
- ✅ Staff receives cancellation email
- ✅ Waitlist workflow triggered (if configured)

**Verify in Google Sheets**:
- Status: "Cancelled"
- Cancelled_At: Timestamp
- Cancelled_Via: "Cal.com"
- Cancellation_Reason: "Patient cancelled via Cal.com"

**Verify Staff Email**:
- Subject: "❌ Cancellation Alert - [Patient Name]"
- Body includes patient info, date, time, booking ID

#### Test 3: Reschedule Appointment

**Setup**:
1. Create new test appointment
2. Open Cal.com booking confirmation email
3. Click "Reschedule" button
4. Choose new date/time
5. Confirm reschedule

**Expected Results**:
- ✅ Workflow executes
- ✅ "Parse Cal.com Webhook" output shows `eventType: "BOOKING_RESCHEDULED"`
- ✅ "Route by Event Type" routes to "rescheduled" output (output 2)
- ✅ Google Sheets Status updated to "Rescheduled"
- ✅ New_Date and New_Time populated with new appointment time
- ✅ Staff receives reschedule email with both times
- ✅ Waitlist workflow triggered for **original slot**

**Verify in Google Sheets**:
- Status: "Rescheduled"
- Rescheduled_At: Timestamp
- Rescheduled_Via: "Cal.com"
- New_Date: New appointment date
- New_Time: New appointment time

**Verify Staff Email**:
- Subject: "🔄 Reschedule Alert - [Patient Name]"
- Body shows ORIGINAL APPOINTMENT (freed slot) and NEW APPOINTMENT

**Important**: The waitlist notification should be for the **original slot** that is now freed, not the new slot.

---

## Webhook Data Structure Reference

### BOOKING_CREATED Payload (Parsed Output)
```json
{
  "eventType": "BOOKING_CREATED",
  "bookingId": "12294431",
  "appointmentUid": "wRfLonh68vsBTj7z54FRuc",
  "patientEmail": "izzydevbuilds@gmail.com",
  "patientName": "Lisa P Huston",
  "patientPhone": "+17062745479",
  "appointmentDate": "Friday, October 31",
  "appointmentTime": "03:45 PM",
  "isoTimeFormat": "2025-10-31T15:45:00Z",
  "doctorName": "Dr. Jennifer",
  "appointmentType": "Consultation",
  "newDate": null,
  "newTime": null,
  "newIsoTime": null
}
```

### BOOKING_CANCELLED Payload (Parsed Output)
```json
{
  "eventType": "BOOKING_CANCELLED",
  "bookingId": "12275992",
  "appointmentUid": "u9mF6pXnkVnoEJw8G3xekG",
  "patientEmail": "john.doe@example.com",
  "patientName": "John Doe",
  "patientPhone": "+1234567890",
  "appointmentDate": "Monday, November 4",
  "appointmentTime": "02:15 PM",
  "isoTimeFormat": "2025-11-04T14:15:00Z",
  "doctorName": "Dr. Jennifer",
  "appointmentType": "Consultation",
  "newDate": null,
  "newTime": null,
  "newIsoTime": null
}
```

### BOOKING_RESCHEDULED Payload (Parsed Output)
```json
{
  "eventType": "BOOKING_RESCHEDULED",
  "bookingId": "12275992",
  "appointmentUid": "u9mF6pXnkVnoEJw8G3xekG",
  "patientEmail": "jane.smith@example.com",
  "patientName": "Jane Smith",
  "patientPhone": "+1234567890",
  "appointmentDate": "Monday, November 4",
  "appointmentTime": "02:15 PM",
  "isoTimeFormat": "2025-11-04T14:15:00Z",
  "doctorName": "Dr. Jennifer",
  "appointmentType": "Consultation",
  "newDate": "Wednesday, November 6",
  "newTime": "03:00 PM",
  "newIsoTime": "2025-11-06T15:00:00Z"
}
```

**Key Insight**:
- `appointmentDate/Time` = Original slot (freed, goes to waitlist)
- `newDate/newTime` = Where patient moved to (only for RESCHEDULED)

---

## Troubleshooting

### Issue: Webhook Not Triggering

**Symptoms**: No workflow executions when appointments are booked/cancelled/rescheduled

**Fixes**:
1. **Check workflow is ACTIVE**
   - Toggle in top-right must be green
   - Inactive workflows don't receive webhooks

2. **Re-register webhook**:
   - Open "Cal.com Trigger (All Events)" node
   - Click "Listen for event" button again
   - This refreshes webhook registration

3. **Verify Cal.com API key**:
   - Cal.com → Settings → Security → API Keys
   - Check key is not expired or revoked
   - Regenerate if needed, update n8n credential

4. **Check Cal.com webhook logs**:
   - Cal.com → Settings → Webhooks
   - View delivery history
   - Look for failed deliveries (404, 500 errors)

### Issue: Google Sheets Not Updating

**Symptoms**: Workflow executes but sheets don't update

**Fixes**:
1. **Reconnect Google Sheets credential**:
   - Open each Google Sheets node
   - Re-authenticate OAuth2

2. **Verify Document ID**:
   - Copy from your Google Sheets URL
   - Paste into all three nodes

3. **Check matching columns**:
   - "Append" uses no matching (always creates new row)
   - "Update Cancelled" and "Update Rescheduled" use `Appointment_Uid`
   - Ensure `Appointment_Uid` column exists and has correct values

4. **Verify sheet permissions**:
   - Share Google Sheet with your Google account
   - Ensure "Editor" access

5. **Check column names**:
   - Must match exactly (case-sensitive)
   - No extra spaces

### Issue: Staff Emails Not Received

**Symptoms**: No staff notification emails

**Fixes**:
1. **Reconnect Gmail credential**:
   - Open Gmail nodes
   - Re-authenticate OAuth2

2. **Check spam folder**:
   - Gmail may filter automated emails

3. **Verify staff email address**:
   - Ensure correct email in "sendTo" field

4. **Review execution logs**:
   - n8n Executions → Click failed execution
   - Look for Gmail API errors
   - Common: Rate limit (unlikely), permission denied

### Issue: Waitlist Not Triggered

**Symptoms**: Waitlist workflow doesn't execute after cancel/reschedule

**Fixes**:
1. **Check waitlist workflow is ACTIVE**
   - Must have green toggle

2. **Verify webhook URL**:
   - Should match your n8n instance
   - Check in HTTP nodes: `https://izzydev.app.n8n.cloud/webhook/waitlist-notification`

3. **Test webhook manually**:
   ```bash
   curl -X POST https://izzydev.app.n8n.cloud/webhook/waitlist-notification \
     -H "Content-Type: application/json" \
     -d '{
       "appointmentDate": "Monday, November 4",
       "appointmentTime": "02:15 PM",
       "doctorName": "Dr. Jennifer",
       "appointmentType": "Consultation"
     }'
   ```

4. **Check waitlist workflow executions**:
   - n8n Executions → Filter by "Waitlist Notification"
   - Look for errors

### Issue: Parse Webhook Node Errors

**Symptoms**: "Parse Cal.com Webhook" node fails

**Fixes**:
1. **Check raw webhook data**:
   - n8n Executions → Click execution
   - View "Cal.com Trigger (All Events)" output
   - Ensure webhook structure matches expected format

2. **Review JavaScript code**:
   - Line 26-140 in workflow JSON
   - Ensure no syntax errors

3. **Add error logging**:
   - Edit Code node
   - Add `console.log()` statements to debug

### Issue: Wrong Event Type Routing

**Symptoms**: CREATED events going to CANCELLED branch, etc.

**Fixes**:
1. **Check Switch node conditions**:
   - Output 0: `eventType === "BOOKING_CREATED"`
   - Output 1: `eventType === "BOOKING_CANCELLED"`
   - Output 2: `eventType === "BOOKING_RESCHEDULED"`

2. **Verify parsed eventType**:
   - n8n Executions → "Parse Cal.com Webhook" output
   - Ensure `eventType` field is correct

---

## Migration from Separate Workflows

### If You're Currently Using:
- `appointment-booking.md` workflow (BOOKING_CREATED only)
- `calcom-event-handler-workflow.json` (BOOKING_CANCELLED + BOOKING_RESCHEDULED)

### Migration Steps:

1. **Before Migration - Test Unified Workflow**:
   - Import `calcom-unified-event-handler-workflow.json` as NEW workflow
   - Test thoroughly with personal appointments
   - Verify all 3 event types work correctly
   - Run in parallel with old workflows for 24-48 hours

2. **During Migration - Switch Over**:
   - Activate unified workflow
   - Deactivate old workflows (DON'T delete yet)
   - Monitor executions for 1 week

3. **After Migration - Cleanup**:
   - After 1 week of successful operation
   - Archive old workflows (export JSON as backup)
   - Delete old workflows from n8n

### Data Integrity Concerns:

**Will existing appointments break?**
- No - unified workflow uses same Google Sheets structure
- Existing rows remain unchanged
- New appointments follow same column mapping

**What about in-flight appointments?**
- Appointments booked before migration will still work
- Reminder workflows will find them by Status field
- Cal.com events (cancel/reschedule) will route correctly

**What happens if webhook changes?**
- Cal.com webhook URL will change when you activate unified workflow
- Old webhooks will stop receiving events
- Test appointments after activation to verify webhook works

---

## Integration with Other Workflows

### 1. Reminder Workflow
**Relationship**: Depends on this workflow's Status field

**How It Works**:
1. Reminder workflow runs on schedule (e.g., hourly)
2. Reads Google Sheets
3. Checks Status field:
   - "Pending" or "Confirmed" → Send reminder
   - "Cancelled" or "Rescheduled" → Skip reminder

**Important**: Ensure Status updates happen BEFORE reminder runs

### 2. Waitlist Notification Workflow
**Relationship**: Called by this workflow via webhook

**How It Works**:
1. Patient cancels or reschedules
2. This workflow updates Google Sheets
3. This workflow triggers waitlist via HTTP POST
4. Waitlist workflow finds matching waitlist patients
5. Waitlist workflow sends BCC email to all matches
6. First "YES" reply wins the slot

**Important**: Waitlist webhook URL must match exactly

### 3. Response Handler Workflow (Email-based)
**Relationship**: Parallel, independent workflow

**Use Case**:
- This workflow: Patients using Cal.com interface
- Response Handler: Patients replying to reminder emails

**Conflict Prevention**:
- Both update Status field
- No actual conflict: Different trigger sources
- Last update wins (usually same result)

**Recommendation**: Keep both active for maximum coverage

---

## Advanced Configuration

### 1. Add Patient Confirmation Email

**Why**: Confirm booking/cancellation/reschedule to patient

**How**: Add Gmail node after each branch

**Example for BOOKING_CREATED**:
```json
{
  "type": "n8n-nodes-base.gmail",
  "parameters": {
    "sendTo": "={{ $json.patientEmail }}",
    "subject": "Appointment Confirmed - {{ $json.appointmentDate }}",
    "message": "Hi {{ $json.patientName }},\n\nYour appointment is confirmed!\n\nDate: {{ $json.appointmentDate }}\nTime: {{ $json.appointmentTime }}\nDoctor: {{ $json.doctorName }}\nType: {{ $json.appointmentType }}\n\nTo cancel or reschedule, click here:\nhttps://cal.com/reschedule/{{ $json.appointmentUid }}"
  }
}
```

**Where to Add**: After "Google Sheets: Append New Appointment" node

### 2. Add Cancellation Reason Tracking

**Why**: Understand why patients cancel

**How**: Cal.com includes cancellation reason in webhook

**Update Parse Webhook Code** (line 26):
```javascript
// Add after line 60
const cancellationReason = webhook.responses?.rescheduleReason?.value ||
                          webhook.cancellationReason ||
                          "Not provided";

// Add to results (line 100)
results.push({
  json: {
    ...existing_fields,
    cancellationReason: cancellationReason
  }
});
```

**Update Google Sheets Node**:
Add column mapping:
```json
{
  "Cancellation_Reason": "={{ $json.cancellationReason }}"
}
```

### 3. Add Metrics Dashboard

**Why**: Track appointment trends, cancellation rates

**How**: Create separate "Metrics" sheet tab, log events

**Example Node** (add to all 3 branches):
```json
{
  "type": "n8n-nodes-base.googleSheets",
  "parameters": {
    "operation": "append",
    "sheetName": "Metrics",
    "columns": {
      "Timestamp": "={{ $now }}",
      "Event_Type": "{{ $json.eventType }}",
      "Doctor": "{{ $json.doctorName }}",
      "Patient": "{{ $json.patientName }}",
      "Appointment_Date": "{{ $json.appointmentDate }}"
    }
  }
}
```

### 4. Add Slack/Discord Notifications

**Why**: Real-time alerts for staff in chat tools

**How**: Add webhook node after staff email

**Slack Example**:
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "YOUR_SLACK_WEBHOOK_URL",
    "method": "POST",
    "body": {
      "text": "🚨 {{ $json.eventType }}: {{ $json.patientName }} - {{ $json.appointmentDate }} {{ $json.appointmentTime }}"
    }
  }
}
```

**Discord Example**:
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "YOUR_DISCORD_WEBHOOK_URL",
    "method": "POST",
    "body": {
      "content": "🚨 {{ $json.eventType }}: {{ $json.patientName }} - {{ $json.appointmentDate }} {{ $json.appointmentTime }}"
    }
  }
}
```

### 5. Add SMS Confirmation (Twilio)

**Why**: Text patients booking/cancellation confirmation

**How**: Add Twilio node after Google Sheets append/update

**Example for BOOKING_CREATED**:
```json
{
  "type": "n8n-nodes-base.twilio",
  "parameters": {
    "resource": "sms",
    "operation": "send",
    "from": "YOUR_TWILIO_PHONE",
    "to": "={{ $json.patientPhone }}",
    "message": "Hi {{ $json.patientName }}, your appointment with {{ $json.doctorName }} is confirmed for {{ $json.appointmentDate }} at {{ $json.appointmentTime }}. Reply CANCEL to cancel."
  }
}
```

---

## Security Considerations

### 1. Webhook Authentication
- Cal.com signs webhook requests with HMAC
- n8n automatically validates signatures
- No additional configuration needed
- **Never expose webhook URL publicly** (only Cal.com should know it)

### 2. Data Privacy (HIPAA Compliance)
- **PHI in transit**: Encrypted via HTTPS
- **PHI at rest**: Google Sheets (ensure BAA with Google Workspace)
- **Audit logging**: n8n execution history (30-day retention)
- **Access control**: Restrict n8n workflow access to authorized staff only

### 3. Required Business Associate Agreements (BAAs)
- ✅ Cal.com (appointment scheduling)
- ✅ Google Workspace (Google Sheets storage)
- ✅ n8n Cloud (workflow execution)
- ✅ Gmail (if sending patient emails)
- ✅ Twilio (if sending SMS)

### 4. Best Practices
- Use OAuth2 for all credentials (more secure than API keys)
- Enable 2FA on all accounts (n8n, Cal.com, Google, Gmail)
- Regularly rotate API keys (quarterly)
- Monitor failed login attempts
- Review execution logs weekly for anomalies

---

## Performance Optimization

### Execution Time Benchmarks
- **BOOKING_CREATED**: ~2-3 seconds (parse + append)
- **BOOKING_CANCELLED**: ~4-5 seconds (parse + update + email + waitlist)
- **BOOKING_RESCHEDULED**: ~4-5 seconds (parse + update + email + waitlist)

### Reducing Execution Time
1. **Disable waitlist** if not using: Delete HTTP nodes
2. **Disable staff emails** if not needed: Delete Gmail nodes
3. **Use "upsert" instead of "update"**: Google Sheets node (creates if missing, updates if exists)

### Cost Optimization
- **n8n executions**: Included in n8n plan (unlimited on Pro)
- **AI cost**: $0 (no AI used, pure webhook parsing)
- **Gmail API**: Free tier (quota: 1 billion queries/day)
- **Google Sheets API**: Free tier (quota: 300 requests/minute)

**Estimated Monthly Cost**: $0 (assuming existing n8n, Gmail, Google Sheets accounts)

---

## Monitoring and Maintenance

### Daily Tasks
- [ ] Check n8n execution history for errors
- [ ] Verify no failed webhook deliveries in Cal.com

### Weekly Tasks
- [ ] Review Google Sheets for data accuracy
- [ ] Check staff email delivery rate
- [ ] Verify waitlist notifications are working

### Monthly Tasks
- [ ] Review Cal.com webhook logs
- [ ] Regenerate Cal.com API key (security best practice)
- [ ] Audit Google Sheets for duplicate rows
- [ ] Review cancellation/reschedule metrics

### Quarterly Tasks
- [ ] Update n8n workflows to latest versions
- [ ] Review and optimize workflow performance
- [ ] Test disaster recovery (backup/restore)

---

## Success Metrics

Track these KPIs after deployment:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Webhook Delivery Success Rate** | 99%+ | Cal.com webhook logs |
| **Data Accuracy** | 100% | Manual spot checks vs Cal.com |
| **Execution Success Rate** | 98%+ | n8n execution history |
| **Staff Email Delivery** | 99%+ | Gmail sent folder |
| **Waitlist Fill Rate** | 40-60% | Google Sheets Status tracking |
| **Average Execution Time** | < 5 sec | n8n execution duration |

---

## FAQ

**Q: Can I use this without the waitlist workflow?**
A: Yes! Just delete the two HTTP nodes that trigger waitlist. Everything else will work fine.

**Q: What happens if both this workflow and Response Handler trigger for the same event?**
A: Google Sheets update uses `Appointment_Uid` as matching key, so last update wins. No duplicate rows created.

**Q: Can I add more Cal.com event types?**
A: Yes! Edit "Cal.com Trigger (All Events)" node, add to `events` array:
- `MEETING_ENDED`
- `BOOKING_REQUESTED` (if using approval workflow)
- `BOOKING_REJECTED`

**Q: How do I test without real patients?**
A: Create test bookings using your own email, then cancel/reschedule them.

**Q: What if Cal.com webhook format changes?**
A: Update "Parse Cal.com Webhook" node JavaScript code to match new format. Check Cal.com API docs for changes.

**Q: Can I customize the Google Sheets columns?**
A: Yes, but ensure all workflows (reminders, waitlist, etc.) use the same column names.

**Q: How do I handle multiple doctors?**
A: Workflow auto-extracts doctor name from `eventTitle`. No changes needed.

**Q: What's the maximum number of appointments this can handle?**
A: Google Sheets supports 10 million cells, n8n has no execution limits on Pro plan. Realistically: 100,000+ appointments/year.

---

## Support and Resources

- **n8n Documentation**: https://docs.n8n.io
- **Cal.com API Docs**: https://cal.com/docs/api-reference
- **Google Sheets API**: https://developers.google.com/sheets
- **n8n Community**: https://community.n8n.io/

---

**Setup Complete!** 🎉

Your Cal.com Unified Event Handler is now managing the complete appointment lifecycle in one streamlined workflow.

**Next Steps**:
1. Test all 3 event types with personal appointments
2. Monitor executions for first week
3. Review metrics and optimize as needed
4. Consider migrating from separate workflows (if applicable)
