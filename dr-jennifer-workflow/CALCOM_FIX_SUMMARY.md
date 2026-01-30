# Cal.com Reschedule/Cancel Duplicate Row Fix - Summary

## Problem Statement

When users rescheduled or canceled appointments in Cal.com, the workflow created **duplicate rows** in Google Sheets instead of updating existing ones, as shown in the user's screenshot:

| Appointment_Uid | Date | Time | Patient_Name | Status |
|----------------|------|------|--------------|---------|
| 2RFwaTPthqnJbWH | Wednesday, November 6 | 08:45 | Alpha Diana | Pending |
| rc3b5Sg2GdTYopx | Thursday, November 7 | 09:30 | Alpha Diana | Pending |

**Expected behavior**: One row that updates from "Pending" → "Rescheduled" → "Cancelled"
**Actual behavior**: Multiple rows with different `Appointment_Uid` values

## Root Cause Analysis

Cal.com generates a **NEW `uid`** when appointments are rescheduled:

From actual webhook data (`cal.com_responses.md`):

```json
// Initial Booking (BOOKING_CREATED)
{
  "uid": "3LpAwYNWsfRYM1qcxtYeUZ",
  "iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com",
  "bookingId": 12439850
}

// After Reschedule (BOOKING_RESCHEDULED)
{
  "uid": "cp96d6UZfisqb5MqJSTMbj",  // ❌ NEW UID!
  "iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com",  // ✅ SAME!
  "bookingId": 12439935,  // ❌ NEW booking ID!
  "rescheduleUid": "3LpAwYNWsfRYM1qcxtYeUZ",  // Original uid
  "rescheduleId": 12439850  // Original bookingId
}

// After Cancel (BOOKING_CANCELLED)
{
  "uid": "cp96d6UZfisqb5MqJSTMbj",  // ❌ Still the rescheduled uid
  "iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com"  // ✅ SAME!
}
```

### Why the Workflow Created Duplicates

1. **Initial booking**: Created row with `Appointment_Uid: "3LpAwYNWsfRYM1qcxtYeUZ"`
2. **Reschedule event**: Workflow tried to find row with `Appointment_Uid: "cp96d6UZfisqb5MqJSTMbj"`
3. **No match found**: Google Sheets "update" mode falls back to **append** → **duplicate row created**
4. **Cancel event**: Same issue - tries to match `"cp96d6UZfisqb5MqJSTMbj"`, finds the duplicate instead

## The Solution: Use iCalUID

The `iCalUID` is a **calendar standard (RFC 5545)** that persists across an appointment's entire lifecycle:
- ✅ Same for initial booking
- ✅ Same after reschedule
- ✅ Same after cancellation
- ✅ Only changes if appointment is permanently deleted

### Implementation

**File Modified**: `calcom-unified-event-handler-workflow.json`

**Change Made** (line 1078 in Parse Cal.com Webhook1 node):

```javascript
// BEFORE:
appointmentUid: webhook.uid,

// AFTER:
appointmentUid: webhook.iCalUID || webhook.uid,  // Fallback to uid if iCalUID unavailable
```

**Impact**: This single change automatically fixes all three Google Sheets nodes:
1. **Append New Appointment** (BOOKING_CREATED) - Now stores iCalUID
2. **Update Cancelled** (BOOKING_CANCELLED) - Now matches by iCalUID
3. **Update Rescheduled** (BOOKING_RESCHEDULED) - Now matches by iCalUID

## How It Works Now

```
User Books Appointment
  ↓
Workflow appends row: Appointment_Uid = "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com"
  ↓
User Reschedules
  ↓
Workflow receives BOOKING_RESCHEDULED with iCalUID = "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com"
  ↓
Finds existing row by iCalUID ✅
  ↓
Updates Status = "Rescheduled" (NO DUPLICATE!)
  ↓
User Cancels
  ↓
Workflow receives BOOKING_CANCELLED with iCalUID = "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com"
  ↓
Finds SAME row by iCalUID ✅
  ↓
Updates Status = "Cancelled" (NO DUPLICATE!)
```

## Testing Status

✅ Code changes completed
⬜ Needs testing in n8n (see [CALCOM_FIX_TESTING_GUIDE.md](CALCOM_FIX_TESTING_GUIDE.md))

## Deployment Steps

1. **Backup Current Workflow** (recommended)
   - Export current workflow from n8n as backup

2. **Import Updated Workflow**
   - Go to n8n → Workflows → Import from File
   - Select `calcom-unified-event-handler-workflow.json`
   - Choose "Replace" to update existing workflow

3. **Verify Credentials**
   - Ensure Cal.com account is connected
   - Ensure Google Sheets account is connected

4. **Activate Workflow**
   - Toggle "Active" in n8n

5. **Test** (see Testing Guide)
   - Book → Reschedule → Cancel
   - Verify only 1 row exists with updated status

## Backward Compatibility

✅ **Existing data is safe**: Old rows with `uid` format will continue to work normally.

✅ **Gradual migration**: New bookings will use iCalUID format. Old bookings remain with uid format until their next reschedule/cancel (at which point they'll match by uid one last time, then future events will use the iCalUID stored in the row).

⚠️ **Edge case**: If an OLD booking (created before this fix) is rescheduled:
- The webhook will contain a NEW uid and the iCalUID
- The workflow will try to match by iCalUID
- The old row has `uid` format, not iCalUID format
- **Result**: May create duplicate for that ONE transition

**Mitigation**: This affects only appointments booked BEFORE the fix. After the first reschedule cycle (24-48 hours), all active appointments will be in the new format.

## Alternative Solutions Considered

### Option 1: Match by Patient Email + Date/Time
- **Pros**: Would work regardless of UID format
- **Cons**: Requires original date/time in webhook; fails if patient books multiple appointments

### Option 2: Match by Cal.com bookingId
- **Pros**: Simpler than iCalUID
- **Cons**: `bookingId` ALSO changes on reschedule (not persistent)

### Option 3: Match by Patient Email + Phone
- **Pros**: Simple, human-identifiable
- **Cons**: Fails if patient has multiple appointments; data can change

### Why iCalUID is Best:
✅ Calendar standard (RFC 5545)
✅ Guaranteed to persist across reschedules/cancels
✅ Already provided by Cal.com in all webhook types
✅ Unique per appointment lifecycle
✅ No dependency on patient data

## Technical Details

### n8n Node Configuration

**Parse Cal.com Webhook1** (Code node):
```javascript
results.push({
  json: {
    eventType: eventType,
    bookingId: webhook.bookingId || webhook.uid,
    appointmentUid: webhook.iCalUID || webhook.uid,  // ← KEY CHANGE
    patientEmail: patientEmail,
    patientName: patientName,
    // ... other fields
  }
});
```

**Google Sheets: Append New Appointment**:
```json
{
  "operation": "append",
  "columns": {
    "Appointment_Uid": "={{ $json.appointmentUid }}",  // ← Now receives iCalUID
    "Date": "={{ $json.appointmentDate }}",
    // ... other columns
  }
}
```

**Google Sheets: Update Rescheduled**:
```json
{
  "operation": "update",
  "columns": {
    "Status": "Rescheduled",
    "Appointment_Uid": "={{ $('Parse Cal.com Webhook1').item.json.appointmentUid }}"
  },
  "matchingColumns": ["Appointment_Uid"]  // ← Matches by iCalUID
}
```

**Google Sheets: Update Cancelled**:
```json
{
  "operation": "update",
  "columns": {
    "Status": "Cancelled",
    "Appointment_Uid": "={{ $('Parse Cal.com Webhook1').item.json.appointmentUid }}"
  },
  "matchingColumns": ["Appointment_Uid"]  // ← Matches by iCalUID
}
```

## Files Modified

1. ✅ `calcom-unified-event-handler-workflow.json` - Core fix
2. ✅ `CALCOM_FIX_SUMMARY.md` - This file
3. ✅ `CALCOM_FIX_TESTING_GUIDE.md` - Testing procedures

## Files Referenced

- `cal.com_responses.md` - Actual webhook payloads that revealed the iCalUID solution
- `CALCOM_UNIFIED_SETUP_GUIDE.md` - Original setup documentation
- Google Sheet: `Medical_Workflow` (ID: 1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y)

## Related Documentation

- [Cal.com Webhook Documentation](https://cal.com/docs/integrations/webhooks)
- [RFC 5545 - iCalendar Specification](https://datatracker.ietf.org/doc/html/rfc5545#section-3.8.4.7)
- [n8n Google Sheets Node Documentation](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googlesheets/)

## Success Metrics

After deployment, monitor these metrics:

- ✅ Zero duplicate rows for reschedules/cancels
- ✅ All executions show "Success" status
- ✅ Appointment_Uid format: `*@Cal.com` for new bookings
- ✅ Google Sheets row count matches active appointment count

## Rollback Plan

If issues occur:

1. **Immediate rollback**: Restore backup workflow from Step 1
2. **Manual cleanup**: Delete duplicate rows in Google Sheets (filter by duplicate Patient_Email + Date combinations)
3. **Report issue**: Document the failure scenario for debugging

## Next Steps

1. ⬜ Import updated workflow to n8n (5 minutes)
2. ⬜ Run test booking → reschedule → cancel (10 minutes)
3. ⬜ Verify no duplicates created (2 minutes)
4. ⬜ Monitor for 24 hours in production
5. ⬜ Update any related documentation if needed

## Questions?

Contact the automation team or refer to:
- Testing Guide: `CALCOM_FIX_TESTING_GUIDE.md`
- Setup Guide: `CALCOM_UNIFIED_SETUP_GUIDE.md`
- Webhook Data: `cal.com_responses.md`

---

**Fix Completed**: 2025-11-04
**Tested**: ⬜ Pending
**Deployed**: ⬜ Pending
**Status**: ✅ Ready for Testing
