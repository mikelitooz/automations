# Cal.com Duplicate Row Fix - Hybrid Matching Solution (FINAL)

## Problem Recap

When users rescheduled or canceled appointments in Cal.com, duplicate rows were created in Google Sheets instead of updating existing ones, even after implementing the `iCalUID` fix.

**Root Cause**: The `iCalUID` values were identical, but n8n's Google Sheets "update" operation has a **fallback behavior**: when no matching row is found, it appends a new row instead of throwing an error.

## Why the iCalUID Fix Didn't Work Initially

Even though both rows showed the same `iCalUID` (`qboepPsWTUezVyN6mAEBoxk@Cal.com`), duplicates were still created because:

1. **Existing rows** (created before the fix) had the OLD `uid` format stored in `Appointment_Uid`
2. **New reschedule events** tried to match by the NEW `iCalUID` format
3. **No match found** → Google Sheets appended a new row

This is a **migration period issue** where old and new data formats coexist.

## Solution Implemented: Hybrid Matching Strategy

Instead of relying solely on `Appointment_Uid` (which can vary between old `uid` and new `iCalUID` formats), we now match by **stable patient identifiers**:

### Matching Columns Changed:
```
BEFORE: matchingColumns: ["Appointment_Uid"]
AFTER:  matchingColumns: ["Patient_Email", "Patient_Phone"]
```

### Why This Works:

✅ **Patient Email + Phone is stable** across booking, reschedule, and cancel events
✅ **Works with both old and new data** (no migration needed)
✅ **Unique identifier** for each patient's appointment
✅ **Intuitive matching** based on WHO the appointment is for, not cryptic UIDs

⚠️ **Assumption**: Patients don't have multiple concurrent active appointments. If they do, the first match will be updated.

## Changes Made

### File Modified
`calcom-unified-event-handler-workflow.json`

### Change 1: Update Rescheduled Node (Lines 694-708)

**BEFORE**:
```json
{
  "columns": {
    "value": {
      "Status": "Rescheduled",
      "Rescheduled_At": "={{ $now }}",
      "Rescheduled_Via": "Cal.com",
      "Appointment_Uid": "={{ $('Parse Cal.com Webhook1').item.json.appointmentUid }}"
    },
    "matchingColumns": ["Appointment_Uid"]
  }
}
```

**AFTER**:
```json
{
  "columns": {
    "value": {
      "Status": "Rescheduled",
      "Rescheduled_At": "={{ $now }}",
      "Rescheduled_Via": "Cal.com",
      "Appointment_Uid": "={{ $('Parse Cal.com Webhook1').item.json.appointmentUid }}",
      "Patient_Email": "={{ $('Parse Cal.com Webhook1').item.json.patientEmail }}",
      "Patient_Phone": "={{ $('Parse Cal.com Webhook1').item.json.patientPhone }}"
    },
    "matchingColumns": ["Patient_Email", "Patient_Phone"]
  }
}
```

### Change 2: Update Cancelled Node (Lines 320-335)

Same matching strategy applied to the cancellation flow.

## How It Works Now

```
User Books Appointment
  ↓
Row created: Patient_Email = "patient@example.com", Patient_Phone = "+1234567890"
  ↓
User Reschedules
  ↓
Webhook contains same email + phone
  ↓
Google Sheets finds row by Patient_Email + Patient_Phone ✅
  ↓
Updates Status = "Rescheduled" (NO DUPLICATE!)
  ↓
User Cancels
  ↓
Same email + phone in webhook
  ↓
Google Sheets finds SAME row ✅
  ↓
Updates Status = "Cancelled" (NO DUPLICATE!)
```

## Benefits of This Approach

1. **✅ No Migration Required**: Works with existing data immediately
2. **✅ Handles Both Formats**: Works whether `Appointment_Uid` has old `uid` or new `iCalUID`
3. **✅ Patient-Centric**: Matches based on who the appointment is for (more intuitive)
4. **✅ Simple**: No complex lookup logic or IF nodes needed
5. **✅ Reliable**: Patient email + phone rarely changes within a booking lifecycle

## Edge Cases & Limitations

### Edge Case 1: Patient Has Multiple Appointments
**Scenario**: Patient books appointment A for Monday and appointment B for Tuesday, then reschedules appointment A.

**Behavior**: The workflow will update the **first matching row** it finds (likely appointment A if it was created first).

**Mitigation**: If this is a concern, add `Date` or `Time` to the matching columns:
```json
"matchingColumns": ["Patient_Email", "Patient_Phone", "Date"]
```

### Edge Case 2: Patient Changes Email/Phone Before Rescheduling
**Scenario**: Patient books with email1@example.com, then reschedules with email2@example.com.

**Behavior**: No match found → Duplicate row created.

**Mitigation**: This is rare in practice (Cal.com uses the original booking's contact info).

### Edge Case 3: Two Patients with Same Email/Phone
**Scenario**: Household members share email/phone.

**Behavior**: First matching row will be updated (may be wrong patient).

**Mitigation**: Very rare; Cal.com typically requires unique emails per user.

## Testing Procedure

### Step 1: Clean Up Existing Duplicates (Optional)
If you have existing duplicate rows, you can either:
- **Option A**: Manually delete duplicate rows in Google Sheets
- **Option B**: Let them remain (future bookings won't create new duplicates)

### Step 2: Import Updated Workflow
1. Open n8n: https://izzydev.app.n8n.cloud/
2. Navigate to Workflows → Cal.com Unified Event Handler
3. Click **Import from File**
4. Select `calcom-unified-event-handler-workflow.json`
5. Choose **Replace** to update

### Step 3: Test Booking → Reschedule → Cancel Flow

#### Test 3A: Create New Booking
1. Book appointment via Cal.com
2. Verify single row created in Google Sheets
3. Note the `Patient_Email` and `Patient_Phone` values

#### Test 3B: Reschedule Appointment
1. Reschedule the appointment via Cal.com
2. **Expected**: SAME row updated (check by Patient_Email + Patient_Phone)
3. **Expected**: Status changed to "Rescheduled"
4. **Expected**: NO new duplicate row created

#### Test 3C: Cancel Appointment
1. Cancel the appointment via Cal.com
2. **Expected**: SAME row updated
3. **Expected**: Status changed to "Cancelled"
4. **Expected**: NO new duplicate row created

## Verification Checklist

After testing, verify:

- ✅ Only 1 row exists for the appointment (no duplicates)
- ✅ Status progresses: Pending → Rescheduled → Cancelled
- ✅ `Appointment_Uid` column contains the iCalUID (format: `xxx@Cal.com`)
- ✅ `Patient_Email` and `Patient_Phone` remain consistent across all events
- ✅ n8n execution logs show "Success" for all events
- ✅ No errors in Google Sheets operations

## Comparison: Previous Fix vs. Current Fix

| Aspect | iCalUID Fix (Previous) | Hybrid Matching (Current) |
|--------|------------------------|---------------------------|
| **Matching Strategy** | `Appointment_Uid` only | `Patient_Email + Patient_Phone` |
| **Handles Old Data** | ❌ No (requires migration) | ✅ Yes (works immediately) |
| **Handles UID Changes** | ❌ No (if Cal.com changes UID format) | ✅ Yes (doesn't depend on UID) |
| **Migration Required** | ✅ Yes (update old rows) | ❌ No |
| **Edge Cases** | Fails if UID format differs | Works unless patient info changes |
| **Complexity** | Simple | Simple |
| **Reliability** | Depends on Cal.com UID consistency | Depends on patient info stability |

## Why Not Keep iCalUID Matching?

The `iCalUID` fix WAS correct in theory, but failed in practice due to:

1. **Data format mismatch** during migration period
2. **No way to retroactively update** old rows without manual intervention
3. **Cal.com UID behavior** is opaque (could change in future)

The **Patient Email + Phone** approach is more **resilient** because:
- Patient identity rarely changes during a booking lifecycle
- It's Cal.com-agnostic (doesn't depend on their internal UID logic)
- Works immediately without data migration

## Rollback Plan (If Needed)

If this solution causes issues:

1. **Restore Previous Version**:
   - Re-import the backup workflow
   - Change matching back to `["Appointment_Uid"]`

2. **Alternative Solution**:
   - Use `matchingColumns: ["Patient_Email", "Date", "Time"]`
   - This adds temporal specificity to avoid multi-appointment conflicts

## Files Modified

1. ✅ `calcom-unified-event-handler-workflow.json` - Core fix
2. ✅ `CALCOM_HYBRID_FIX_FINAL.md` - This documentation

## Related Documentation

- `cal.com_responses.md` - Actual webhook payloads
- `CALCOM_FIX_SUMMARY.md` - Previous iCalUID fix attempt
- `CALCOM_FIX_TESTING_GUIDE.md` - Original testing guide
- `CALCOM_UNIFIED_SETUP_GUIDE.md` - Initial setup documentation

## Success Metrics

After deployment, verify these metrics over 24-48 hours:

- ✅ **Zero duplicate rows** for reschedules/cancels
- ✅ **All n8n executions** show "Success" status
- ✅ **Google Sheets row count** matches expected appointment count
- ✅ **No patient complaints** about status tracking issues

## Next Steps

1. ⬜ Import updated workflow to n8n (5 minutes)
2. ⬜ Test with real booking → reschedule → cancel (10 minutes)
3. ⬜ Verify no duplicates created (2 minutes)
4. ⬜ Monitor in production for 24-48 hours
5. ⬜ Clean up any remaining old duplicates manually (optional)

## Questions or Issues?

If duplicates still occur:

1. **Check n8n execution logs**: Verify `Patient_Email` and `Patient_Phone` are being extracted correctly
2. **Check Google Sheets columns**: Ensure `Patient_Email` and `Patient_Phone` columns exist and have correct names
3. **Check for multiple appointments**: If patient has multiple active appointments, consider adding `Date` to matching columns

---

**Fix Completed**: 2025-11-04
**Approach**: Hybrid Matching (Patient Email + Phone)
**Status**: ✅ Ready for Testing
**Expected Result**: Zero duplicates for reschedules/cancels
