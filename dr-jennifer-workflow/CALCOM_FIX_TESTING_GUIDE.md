# Cal.com Reschedule Fix - Testing Guide

## What Was Fixed

**Problem**: Rescheduling or canceling appointments created duplicate rows with different `Appointment_Uid` values.

**Root Cause**: Cal.com sends a NEW `uid` for rescheduled appointments, but the workflow was trying to match by `uid`.

**Solution**: Changed to use `iCalUID` instead of `uid`. The `iCalUID` persists across reschedules and cancellations (calendar standard RFC 5545).

## Changes Made

**File**: `calcom-unified-event-handler-workflow.json`

**Node Modified**: "Parse Cal.com Webhook1" (line 1078)

```javascript
// Changed from:
appointmentUid: webhook.uid

// To:
appointmentUid: webhook.iCalUID || webhook.uid
```

**Result**: All Google Sheets nodes now use the persistent `iCalUID` for matching.

## Testing Procedure

### Step 1: Import Updated Workflow

1. Open n8n: https://izzydev.app.n8n.cloud/
2. Navigate to Workflows
3. Find "Cal.com Unified Event Handler" workflow
4. Click **Import from File**
5. Select `calcom-unified-event-handler-workflow.json`
6. Choose **Replace** to update the existing workflow

### Step 2: Activate Workflow

1. Open the imported workflow
2. Click **Activate** toggle in top-right
3. Verify all credentials are reconnected:
   - Cal.com account
   - Google Sheets account

### Step 3: Test Booking → Reschedule → Cancel Flow

#### Test 3A: Create Booking
1. Go to your Cal.com booking page
2. Book a new appointment with these details:
   - Name: "Test Patient"
   - Email: (your test email)
   - Phone: (your test phone)
   - Appointment Type: "Consultation"
3. Complete the booking

**Expected Result**:
- ✅ New row appears in Google Sheets
- ✅ `Appointment_Uid` column contains an iCalUID (format: `xxxxxx@Cal.com`)
- ✅ `Status` = "Pending"
- ✅ All patient details populated correctly

**Record**: Write down the `Appointment_Uid` value: `___________________________`

#### Test 3B: Reschedule Appointment
1. Go to the booking confirmation email
2. Click "Reschedule" link
3. Choose a different date/time
4. Confirm the reschedule

**Expected Result**:
- ✅ **SAME ROW** is updated (check by `Appointment_Uid` from Step 3A)
- ✅ `Status` changed to "Rescheduled"
- ✅ `Rescheduled_At` timestamp populated
- ✅ `Rescheduled_Via` = "Cal.com"
- ❌ **NO DUPLICATE ROW** created

**Verify**: Check that the `Appointment_Uid` is STILL the same: `___________________________`

#### Test 3C: Cancel Appointment
1. Go to the booking confirmation email (for rescheduled time)
2. Click "Cancel" link
3. Confirm the cancellation

**Expected Result**:
- ✅ **SAME ROW** is updated (check by `Appointment_Uid` from Step 3A)
- ✅ `Status` changed to "Cancelled"
- ✅ `Cancelled_At` timestamp populated
- ✅ `Cancelled_Via` = "Cal.com"
- ❌ **NO DUPLICATE ROW** created

**Verify**: Check that the `Appointment_Uid` is STILL the same: `___________________________`

### Step 4: Verify in n8n Execution Logs

1. Go to n8n → Workflows → Cal.com Unified Event Handler
2. Click "Executions" tab
3. Check the last 3 executions (booking, reschedule, cancel):
   - ✅ All executions show "Success"
   - ✅ "Parse Cal.com Webhook1" node shows `appointmentUid` with iCalUID format
   - ✅ Google Sheets nodes completed without errors

### Step 5: Edge Case Testing (Optional but Recommended)

#### Test 5A: Multiple Reschedules
1. Book a new appointment
2. Reschedule it 3 times to different dates/times
3. Verify only 1 row exists with final status "Rescheduled"

#### Test 5B: Reschedule Then Cancel
1. Book a new appointment
2. Reschedule it once
3. Then cancel it
4. Verify only 1 row exists with final status "Cancelled"

#### Test 5C: Concurrent Bookings (Same Patient)
1. Book 2 different appointments for the same patient
2. Reschedule one of them
3. Cancel the other
4. Verify 2 separate rows exist (one Rescheduled, one Cancelled)

## Troubleshooting

### Issue: "Appointment_Uid column shows old uid format (no @Cal.com)"

**Cause**: Existing rows from before the fix still have old `uid` values.

**Solution**: This is expected. Only NEW bookings will have iCalUID format. Old rows will continue to work normally.

### Issue: "Update nodes still create duplicates"

**Check**:
1. Verify workflow was re-imported (not just saved)
2. Check Parse webhook node contains `webhook.iCalUID || webhook.uid`
3. Ensure workflow is activated
4. Check n8n execution logs for errors

**Debug**:
1. Open n8n execution for the reschedule event
2. Click on "Parse Cal.com Webhook1" node
3. Check output: Does `appointmentUid` contain an iCalUID?
4. If it shows a plain `uid`, the webhook parser wasn't updated correctly

### Issue: "iCalUID is null/undefined"

**Cause**: Cal.com webhook doesn't include iCalUID field (unlikely but possible).

**Fallback**: The code includes `|| webhook.uid` fallback, so it should still work.

**Solution**: Check Cal.com webhook configuration and ensure all event types are enabled.

## Rollback Plan (If Needed)

If the fix causes issues, rollback by restoring the original value:

1. Open workflow JSON
2. Find line 1078 in "Parse Cal.com Webhook1" node
3. Change back to:
   ```javascript
   appointmentUid: webhook.uid,
   ```
4. Re-import workflow to n8n

## Success Criteria

✅ **Fix is working if**:
- Booking creates 1 row
- Rescheduling updates the SAME row (no duplicate)
- Canceling updates the SAME row (no duplicate)
- `Appointment_Uid` stays consistent across all events
- All executions show "Success" in n8n logs

## Additional Notes

### Why iCalUID Works

From your actual Cal.com webhook data (`cal.com_responses.md`):

```json
// BOOKING_CREATED (line 123)
"uid": "3LpAwYNWsfRYM1qcxtYeUZ",
"iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com"

// BOOKING_RESCHEDULED (line 273, 277)
"uid": "cp96d6UZfisqb5MqJSTMbj",  // ❌ DIFFERENT!
"iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com"  // ✅ SAME!

// BOOKING_CANCELLED (line 400, 421)
"uid": "cp96d6UZfisqb5MqJSTMbj",  // ❌ DIFFERENT!
"iCalUID": "3LpAwYNWsfRYM1qcxtYeUZ@Cal.com"  // ✅ SAME!
```

The `iCalUID` is a **calendar standard** (RFC 5545) that represents the appointment's lifecycle, not individual booking instances.

### Bonus Data Available

The reschedule webhook also includes:
- `rescheduleUid`: Original `uid` value
- `rescheduleId`: Original `bookingId`
- `rescheduleStartTime`: Original appointment time

These could be used for additional tracking if needed in the future.

## Questions?

If you encounter any issues during testing:
1. Check n8n execution logs for error messages
2. Verify webhook payloads include `iCalUID` field
3. Ensure Google Sheets has correct column structure
4. Review this guide's troubleshooting section

**Test Date**: _______________
**Tested By**: _______________
**Test Result**: ⬜ Pass ⬜ Fail
**Notes**: _______________________________________________
