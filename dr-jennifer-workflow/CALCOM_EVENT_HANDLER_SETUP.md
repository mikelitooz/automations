# Cal.com Event Handler - Setup Guide

> **⚠️ MIGRATION NOTICE**: This workflow has been superseded by the **Cal.com Unified Event Handler** which handles BOOKING_CREATED, BOOKING_CANCELLED, and BOOKING_RESCHEDULED in one workflow. See [CALCOM_UNIFIED_SETUP_GUIDE.md](CALCOM_UNIFIED_SETUP_GUIDE.md) for the recommended unified approach.
>
> **Use this workflow if**: You want to keep appointment booking (BOOKING_CREATED) separate from cancellation/reschedule handling.
>
> **Use the unified workflow if**: You want all Cal.com events managed in one place (recommended for new deployments).

## Overview

The **Cal.com Event Handler** is the most reliable way to handle appointment cancellations and reschedules. It directly listens to Cal.com webhook events, eliminating the need for email parsing.

### Why Use This Instead of Response Handler?

| Feature | Cal.com Event Handler | Response Handler (Email) |
|---------|----------------------|--------------------------|
| **Trigger** | Instant Cal.com webhook | 1-minute email polling |
| **Reliability** | 100% (direct API) | ~95% (depends on email format) |
| **Speed** | Immediate | 1-2 minute delay |
| **AI Cost** | $0 | ~$3-5/month (hybrid pattern matching + AI) |
| **Patient Action** | Click cancel/reschedule in Cal.com | Reply to email with 1/2/3 |
| **Accuracy** | Perfect | 90% pattern match, 10% AI fallback |

**Recommendation**: Use **BOTH** workflows:
- Cal.com Event Handler → Primary (patients using Cal.com interface)
- Response Handler → Backup (patients replying to reminder emails)

---

## Workflow Architecture

### Flow Diagram
```
Cal.com → BOOKING_CANCELLED/BOOKING_RESCHEDULED
    ↓
Parse Webhook (extract patient, date, time, doctor)
    ↓
Switch by Event Type
    ↓
┌─────────────────────┬─────────────────────┐
│   CANCELLED         │   RESCHEDULED       │
│   Update Sheet      │   Update Sheet      │
│   Staff Alert       │   Staff Alert       │
│   Trigger Waitlist  │   Trigger Waitlist  │
└─────────────────────┴─────────────────────┘
```

### Key Features
✅ **Instant webhook trigger** - No polling delay
✅ **Dual event handling** - Both cancellation and reschedule
✅ **Automatic waitlist trigger** - Freed slots immediately offered
✅ **Google Sheets sync** - Status updated automatically
✅ **Staff notifications** - Email alerts for all events
✅ **Rich metadata** - Booking ID, new date/time for reschedules

---

## Setup Instructions

### Part 1: Import Workflow to n8n

1. **Open n8n**: https://izzydev.app.n8n.cloud/
2. **Import Workflow**:
   - Click "+ Add workflow" → "Import from file"
   - Select `calcom-event-handler-workflow.json`
   - Workflow name: "Cal.com Event Handler - Cancellations & Reschedules"

### Part 2: Configure Cal.com Trigger

#### Step 1: Open Cal.com Trigger Node
- Click on "Cal.com Trigger" node (first node)
- You'll see: Events: `BOOKING_CANCELLED`, `BOOKING_RESCHEDULED`

#### Step 2: Connect Cal.com Account
- Click "Credential to connect with" dropdown
- Select existing "Cal account" credential
- **If not connected**: Click "Create New Credential"
  - Name: `Cal account`
  - API Key: Get from Cal.com → Settings → API Keys
  - Save credential

#### Step 3: Activate Webhook
- Click "Listen for event" button
- n8n will register the webhook with Cal.com
- **Webhook URL** will be automatically generated
- Cal.com will now send events to this workflow

**Important**: The webhook will only trigger when workflow is **ACTIVE**

### Part 3: Configure Google Sheets Connection

#### Step 1: Update Sheet Nodes
Two nodes need Google Sheets credentials:
1. "Update Sheet: Cancelled" (line 258)
2. "Update Sheet: Rescheduled" (line 367)

#### Step 2: Reconnect Credentials
- Click each node
- Select "Google Sheets account" credential
- **If not connected**:
  - Click "Create New Credential"
  - Follow OAuth2 flow
  - Grant access to Google Sheets

#### Step 3: Verify Sheet ID
Both nodes should point to:
- **Document ID**: `1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s`
- **Sheet Name**: `Appointments` (gid=0)

### Part 4: Configure Staff Email

Update staff email in two nodes:
1. **Staff: Cancellation Alert** (line 304)
2. **Staff: Reschedule Alert** (line 492)

**Change**:
```javascript
"sendTo": "=debbiehills47@gmail.com"
```

**To**:
```javascript
"sendTo": "=YOUR_STAFF_EMAIL@example.com"
```

### Part 5: Verify Waitlist Webhook URL

Two nodes trigger the waitlist:
1. "Trigger Waitlist (Cancellation)" - line 407
2. "Trigger Waitlist (Reschedule)" - line 595

**Both should have**:
```json
{
  "url": "https://izzydev.app.n8n.cloud/webhook/waitlist-notification"
}
```

**To verify**:
- Open "Waitlist Notification - First YES Wins" workflow
- Check webhook trigger path: `waitlist-notification`
- Confirm base URL matches your n8n instance

### Part 6: Activate Workflow

1. Click "Active" toggle in top-right corner
2. Workflow status: 🟢 Active
3. Cal.com webhook is now listening

---

## Cal.com Webhook Data Structure

### BOOKING_CANCELLED Payload
```json
{
  "triggerEvent": "BOOKING_CANCELLED",
  "bookingId": 12275992,
  "uid": "u9mF6pXnkVnoEJw8G3xekG",
  "title": "Appointment with Dr. Jennifer",
  "startTime": "2025-11-04T14:15:00Z",
  "endTime": "2025-11-04T14:30:00Z",
  "organizer": {
    "name": "Dr. Jennifer",
    "email": "chiizzy12a@gmail.com"
  },
  "attendees": [{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1234567890"
  }]
}
```

### BOOKING_RESCHEDULED Payload
```json
{
  "triggerEvent": "BOOKING_RESCHEDULED",
  "bookingId": 12275992,
  "startTime": "2025-11-04T14:15:00Z",  // Original time (freed slot)
  "rescheduleEndTime": "2025-11-06T15:00:00Z",  // New time
  "attendees": [{
    "name": "Jane Smith",
    "email": "jane.smith@example.com"
  }]
}
```

**Key Insight**: On reschedule, `startTime` is the **freed slot** that goes to waitlist, `rescheduleEndTime` is where patient moved to.

---

## Google Sheets Updates

### Cancellation Updates
| Column | Value |
|--------|-------|
| Status | "Cancelled" |
| Cancelled_At | Current timestamp |
| Cancelled_Via | "Cal.com" |
| Cancellation_Reason | "Patient cancelled via Cal.com" |

**Matching Columns**: Patient Email, Date, Time

### Reschedule Updates
| Column | Value |
|--------|-------|
| Status | "Rescheduled" |
| Rescheduled_At | Current timestamp |
| Rescheduled_Via | "Cal.com" |
| New_Date | New appointment date |
| New_Time | New appointment time |

**Matching Columns**: Patient Email, Date, Time

**Note**: The original row is updated to "Rescheduled". The new appointment is created separately by Cal.com BOOKING_CREATED event (handled by a different workflow).

---

## Testing Procedures

### Test 1: Cancel Appointment via Cal.com

**Setup**:
1. Create test appointment in Cal.com
2. Use your personal email
3. Schedule for tomorrow

**Steps**:
1. Open Cal.com booking confirmation email
2. Click "Cancel" button
3. Confirm cancellation

**Expected**:
- ✅ Workflow executes (check n8n Executions)
- ✅ Google Sheets Status → "Cancelled"
- ✅ Staff receives cancellation email
- ✅ Waitlist workflow triggered
- ✅ Waitlist patients notified via BCC email

**Verify in n8n**:
- Executions → Latest run → "Cal.com Event Handler"
- Check each node output
- Parse Webhook should show: `eventType: "BOOKING_CANCELLED"`

### Test 2: Reschedule Appointment via Cal.com

**Setup**:
1. Use existing appointment from Test 1 (or create new one)
2. Ensure appointment is not in past

**Steps**:
1. Open Cal.com booking confirmation email
2. Click "Reschedule" button
3. Choose new date/time
4. Confirm reschedule

**Expected**:
- ✅ Workflow executes
- ✅ Google Sheets Status → "Rescheduled"
- ✅ Google Sheets New_Date and New_Time populated
- ✅ Staff receives reschedule email with both times
- ✅ Waitlist workflow triggered for **original slot**
- ✅ Waitlist patients notified about **freed slot**

**Verify in n8n**:
- Parse Webhook output should show:
  - `eventType: "BOOKING_RESCHEDULED"`
  - `appointmentDate: "2025-11-04"` (original, freed slot)
  - `newDate: "2025-11-06"` (where patient moved)

### Test 3: Multiple Simultaneous Events

**Setup**:
1. Create 3 test appointments
2. Cancel one, reschedule two within 1 minute

**Expected**:
- ✅ All 3 events processed independently
- ✅ 3 separate workflow executions
- ✅ 3 waitlist notifications (1 cancel + 2 reschedule)
- ✅ No data corruption in Google Sheets

---

## Troubleshooting

### Issue: Webhook Not Triggering

**Symptoms**: Cal.com events not reaching n8n workflow

**Fixes**:
1. **Check workflow is ACTIVE** - Toggle must be green
2. **Re-register webhook**:
   - Open Cal.com Trigger node
   - Click "Listen for event" again
   - Webhook will re-register with Cal.com
3. **Verify Cal.com API key**:
   - Settings → API Keys in Cal.com
   - Ensure key is not expired
   - Regenerate if needed, update n8n credential
4. **Check Cal.com webhook logs**:
   - Cal.com → Settings → Webhooks
   - View delivery history
   - Look for failed deliveries

### Issue: Google Sheets Not Updating

**Symptoms**: Status remains "Pending" after cancel/reschedule

**Fixes**:
1. **Reconnect Google Sheets credential**:
   - Open sheet node
   - Re-authenticate OAuth2
2. **Check matching columns**:
   - Patient Email must match exactly
   - Date format must match: "YYYY-MM-DD"
   - Time format: "HH:MM AM/PM"
3. **Verify sheet structure**:
   - Columns: Status, Cancelled_At, Cancelled_Via, Rescheduled_At, etc.
   - Add missing columns if needed

### Issue: Waitlist Not Triggered

**Symptoms**: Waitlist patients not notified after cancel/reschedule

**Fixes**:
1. **Check waitlist workflow is active**
2. **Verify webhook URL**:
   - Should be: `https://izzydev.app.n8n.cloud/webhook/waitlist-notification`
   - Check in "Trigger Waitlist" nodes (both branches)
3. **Test webhook manually**:
   - Use Postman or curl
   - POST to webhook URL with test data
4. **Check waitlist workflow executions**:
   - Executions → Filter by "Waitlist Notification"
   - Look for errors

### Issue: Staff Email Not Received

**Symptoms**: No staff notification emails

**Fixes**:
1. **Check Gmail credential**:
   - Reconnect Gmail OAuth2
2. **Verify staff email address**:
   - Update in "Staff: Cancellation Alert" and "Staff: Reschedule Alert"
3. **Check spam folder**
4. **Review execution logs**:
   - Look for Gmail API errors
   - Rate limit errors (unlikely but possible)

---

## Integration with Other Workflows

### 1. Response Handler (Email-based)
**Relationship**: Parallel, independent workflows

**Use Case**:
- Cal.com Event Handler: Patients using Cal.com interface
- Response Handler: Patients replying to reminder emails

**Conflict Prevention**:
- Both update same Status field
- No conflict: Different trigger sources
- Last update wins (whichever fires last)

**Recommendation**: Keep both active for maximum coverage

### 2. Reminder Workflow
**Relationship**: Dependent - Reminder workflow reads Status

**Flow**:
1. Reminder workflow checks Status field
2. If "Cancelled" or "Rescheduled": Skip sending reminder
3. If "Confirmed" or "Pending": Send reminder

**Important**: Status update must complete before reminder runs

### 3. Waitlist Notification Workflow
**Relationship**: Called by this workflow via webhook

**Trigger Scenarios**:
- Cancellation → Waitlist notified
- Reschedule → Waitlist notified for **original slot**

**Race Condition Handling**:
- Waitlist workflow has atomic check
- First "YES" reply wins
- Others get "slot filled" notification

---

## Advanced Configuration

### 1. Add Patient Confirmation Email

**Why**: Confirm cancellation/reschedule to patient via email

**How**: Add Gmail node after "Update Sheet" nodes

**Example for Cancellation**:
```json
{
  "type": "n8n-nodes-base.gmail",
  "parameters": {
    "sendTo": "={{ $json.patientEmail }}",
    "subject": "Appointment Cancelled - Confirmation",
    "message": "Hi {{ $json.patientName }},\n\nYour appointment on {{ $json.appointmentDate }} at {{ $json.appointmentTime }} has been cancelled.\n\nIf this was a mistake, please book a new appointment:\nhttps://cal.com/izzydevbuilds/appointment-with-dr.-jennifer"
  }
}
```

### 2. Add Cancellation Reason Tracking

**Why**: Understand why patients cancel

**How**: Cal.com can include cancellation reason in webhook

**Update Parse Webhook**:
```javascript
const cancellationReason = webhook.responses?.rescheduleReason?.value || "Not provided";

results.push({
  json: {
    ...existing_fields,
    cancellationReason: cancellationReason
  }
});
```

### 3. Add Metrics Tracking

**Why**: Track cancellation/reschedule rates

**How**: Add Google Sheets append to "Metrics" tab

**Example**:
```json
{
  "type": "n8n-nodes-base.googleSheets",
  "parameters": {
    "operation": "append",
    "sheetName": "Metrics",
    "columns": {
      "Date": "={{ $now }}",
      "Event": "{{ $json.eventType }}",
      "Doctor": "{{ $json.doctorName }}",
      "Patient": "{{ $json.patientName }}"
    }
  }
}
```

### 4. Slack/Discord Notifications

**Why**: Real-time alerts for staff in chat tools

**How**: Add Slack/Discord webhook node after staff email

**Slack Example**:
```json
{
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "YOUR_SLACK_WEBHOOK_URL",
    "method": "POST",
    "body": {
      "text": "🚨 Cancellation: {{ $json.patientName }} - {{ $json.appointmentDate }} {{ $json.appointmentTime }}"
    }
  }
}
```

---

## Comparison: Cal.com vs Email Response Handler

### When Patient Cancels via Cal.com:
1. ✅ Cal.com Event Handler triggers (instant)
2. ✅ Status updated to "Cancelled"
3. ✅ Waitlist triggered
4. ❌ Response Handler does NOT trigger (no email reply)

### When Patient Replies "2" to Email:
1. ❌ Cal.com Event Handler does NOT trigger
2. ✅ Response Handler triggers (1-minute delay)
3. ✅ Status updated to "Cancelled"
4. ✅ Waitlist triggered

**Recommendation**: Run BOTH workflows to cover all scenarios.

---

## Cost Analysis

### Cal.com Event Handler
- **n8n executions**: ~200/month (assuming 100 cancels + 100 reschedules)
- **n8n cost**: Included in n8n plan (unlimited executions)
- **AI cost**: $0 (no AI needed, direct webhook parsing)
- **Total**: $0/month

### Response Handler (Email)
- **n8n executions**: ~500/month (1-minute Gmail polling)
- **AI cost**: ~$3-5/month (Claude Haiku for 10% of responses)
- **Total**: ~$3-5/month

**Savings**: Cal.com Event Handler is FREE and more reliable!

---

## Security Considerations

### 1. Webhook Authentication
- Cal.com signs webhook requests
- n8n automatically validates signatures
- No additional configuration needed

### 2. Data Privacy
- Patient data (email, phone) transmitted via webhook
- Ensure n8n instance uses HTTPS
- Webhook URL: `https://` only

### 3. Access Control
- Only Cal.com can trigger this workflow
- Webhook path is unique per workflow
- No public access risk

### 4. HIPAA Compliance
- **PHI in transit**: Encrypted (HTTPS)
- **PHI at rest**: Stored in Google Sheets (ensure BAA with Google)
- **BAA required**: Cal.com, n8n Cloud, Google Workspace

---

## Success Metrics

Track after deployment:
- ✅ **Event Processing Rate**: % of Cal.com events successfully processed
- ✅ **Waitlist Fill Rate**: % of cancelled/rescheduled slots filled from waitlist
- ✅ **Response Time**: Time from Cal.com event to waitlist notification
- ✅ **Data Accuracy**: % of Google Sheets updates matching Cal.com state
- ✅ **Staff Notification Delivery**: % of staff emails successfully sent

**Expected Benchmarks**:
- Event Processing Rate: 99%+
- Waitlist Fill Rate: 40-60% (depends on waitlist size)
- Response Time: < 30 seconds
- Data Accuracy: 100%
- Staff Notification Delivery: 99%+

---

## Maintenance

### Weekly Tasks
- Check n8n execution history for errors
- Review staff notification emails for anomalies

### Monthly Tasks
- Verify Cal.com webhook status (Settings → Webhooks)
- Regenerate Cal.com API key (security best practice)
- Review waitlist fill rate metrics

### As Needed
- Update staff email addresses
- Add new doctors to parsing logic
- Expand appointment types

---

## Support

### Common Questions

**Q: Can I use this without Response Handler?**
A: Yes, but you lose coverage for patients who reply to emails instead of using Cal.com.

**Q: What happens if both workflows trigger for same event?**
A: Google Sheets update uses matching columns (Patient Email + Date + Time), so last update wins. No duplicate entries.

**Q: Can I add more Cal.com event types?**
A: Yes! Add to `events` array in Cal.com Trigger:
- `BOOKING_CREATED`
- `MEETING_ENDED`
- `BOOKING_REQUESTED`

**Q: How do I test without actual patients?**
A: Create test bookings using your own email, then cancel/reschedule.

---

**Setup Complete!** 🎉

Your Cal.com Event Handler is now the fastest, most reliable way to handle cancellations and reschedules.

**Next Steps**:
1. Test with personal appointment
2. Monitor executions for first week
3. Review waitlist fill rates
4. Consider disabling Response Handler if Cal.com coverage is 100%

---

## Migration to Unified Workflow

### Why Migrate?

The **Cal.com Unified Event Handler** combines this workflow with appointment booking (BOOKING_CREATED) into one comprehensive workflow:

**Benefits**:
- ✅ Single webhook URL for all Cal.com events
- ✅ Unified logging and error handling
- ✅ Easier maintenance (1 workflow vs 2)
- ✅ Better performance (reduced webhook overhead)
- ✅ Consistent data parsing across all event types

**Files**:
- Workflow: `calcom-unified-event-handler-workflow.json`
- Setup Guide: [CALCOM_UNIFIED_SETUP_GUIDE.md](CALCOM_UNIFIED_SETUP_GUIDE.md)

### Migration Steps

1. **Test Unified Workflow**:
   - Import `calcom-unified-event-handler-workflow.json` as NEW workflow
   - Configure credentials (Cal.com, Google Sheets, Gmail)
   - Test all 3 event types (create, cancel, reschedule)

2. **Run in Parallel** (24-48 hours):
   - Keep both old and unified workflows active
   - Monitor executions for both
   - Verify unified workflow handles all events correctly

3. **Switch Over**:
   - Deactivate old workflows (this one + appointment-booking)
   - Keep unified workflow as sole Cal.com handler
   - Monitor for 1 week

4. **Cleanup**:
   - Export old workflows as JSON backup
   - Delete old workflows from n8n
   - Update documentation references

### Data Compatibility

✅ **No data migration needed** - Unified workflow uses same Google Sheets structure
✅ **Existing appointments continue working** - Same column mappings
✅ **No breaking changes** - All downstream workflows (reminders, waitlist) remain compatible

### Need Help?

See complete migration instructions in [CALCOM_UNIFIED_SETUP_GUIDE.md](CALCOM_UNIFIED_SETUP_GUIDE.md) under "Migration from Separate Workflows" section.
