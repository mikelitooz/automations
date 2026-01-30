# Appointment Reminder Workflow - Testing Guide

## Overview
This guide will help you test the fixed appointment reminder workflow (`my_build_FIXED.json`) to ensure all reminders are sent correctly without duplicates.

## Pre-Testing Checklist

### 1. Import Workflow to n8n
1. Open n8n dashboard: https://izzydev.app.n8n.cloud/
2. Go to **Workflows** → **Import from File**
3. Select `my_build_FIXED.json`
4. The workflow should import with the name "Appointment Reminders - FIXED"

### 2. Verify Credentials
Ensure Google Sheets OAuth2 credentials are connected:
- Node: "Read Appointments"
- Node: All "Update..." nodes
- Credential name: "Google Sheets account"

### 3. Verify Google Sheet Access
- Sheet ID: `1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s`
- Sheet name: "Appointments" (tab in "Dr. Jennifer Clinic Appointments")
- Required columns:
  - Date
  - Time
  - Patient Name
  - Patient Phone
  - Patient Email
  - Doctor Name
  - Appointment Type
  - Status
  - 48hr Reminder Sent (checkbox)
  - 24hr Reminder Sent (checkbox)
  - 2hr Reminder Sent (checkbox)
  - Staff_Alerted (checkbox)

---

## Test Scenarios

### Test 1: 48-Hour Reminder (Initial Contact)

**Setup:**
1. Calculate the date/time 48 hours from now
2. Add this row to Google Sheet "Appointments" tab:

| Date | Time | Patient Name | Patient Phone | Patient Email | Doctor Name | Appointment Type | Status | 48hr Reminder Sent | 24hr Reminder Sent | 2hr Reminder Sent |
|------|------|--------------|---------------|---------------|-------------|------------------|--------|-------------------|-------------------|------------------|
| [Date 48h from now] | [Time, e.g., "02:15 PM"] | Test Patient 1 | +1234567890 | your_test_email@gmail.com | Dr. Jennifer | New Patient Visit | Pending | FALSE | FALSE | FALSE |

**Execute:**
1. In n8n, click "Execute Workflow" manually (or wait for hourly trigger)
2. Check execution log for: "Reminders to send: 1"

**Expected Results:**
- ✅ Email received at `your_test_email@gmail.com` with subject: "Appointment Reminder - Dr. Jennifer"
- ✅ Email body contains: "Reply: 1 = Confirm, 2 = Cancel, 3 = Reschedule"
- ✅ Google Sheet updated: `48hr Reminder Sent` = TRUE
- ✅ Status remains: "Pending"

**Verify No Duplicates:**
- Wait 1 hour (or run workflow again manually)
- Should NOT send another email (flag already set to TRUE)

---

### Test 2: 24-Hour Reminder - NOT Confirmed (Urgent)

**Setup:**
1. Calculate the date/time 24 hours from now
2. Add this row to Google Sheet:

| Date | Time | Patient Name | Patient Email | Status | 48hr Reminder Sent | 24hr Reminder Sent | 2hr Reminder Sent |
|------|------|--------------|---------------|--------|-------------------|-------------------|------------------|
| [Date 24h from now] | [Time] | Test Patient 2 | your_test_email@gmail.com | Pending | TRUE | FALSE | FALSE |

**Execute:**
1. Run workflow manually

**Expected Results:**
- ✅ Email subject: "⚠️ ACTION REQUIRED - Appointment Tomorrow"
- ✅ Email contains: "If not confirmed in 2 hours before your appointment time, your appointment will be automatically cancelled"
- ✅ Email contains: "Reply NOW: 1 = Confirm, 2 = Cancel, 3 = Reschedule"
- ✅ Google Sheet updated: `24hr Reminder Sent` = TRUE
- ✅ Status remains: "Pending"

---

### Test 3: 24-Hour Reminder - Confirmed (Simple Reminder)

**Setup:**
1. Calculate the date/time 24 hours from now
2. Add this row to Google Sheet:

| Date | Time | Patient Name | Patient Email | Status | 48hr Reminder Sent | 24hr Reminder Sent | 2hr Reminder Sent |
|------|------|--------------|---------------|--------|-------------------|-------------------|------------------|
| [Date 24h from now] | [Time] | Test Patient 3 | your_test_email@gmail.com | Confirmed | TRUE | FALSE | FALSE |

**Execute:**
1. Run workflow manually

**Expected Results:**
- ✅ Email subject: "Appointment Reminder - Tomorrow"
- ✅ Email contains: "Thank you for confirming!"
- ✅ Email contains: "See you tomorrow!"
- ✅ Does NOT contain: "Reply 1/2/3" (no action needed)
- ✅ Google Sheet updated: `24hr Reminder Sent` = TRUE
- ✅ Status remains: "Confirmed"

---

### Test 4: 2-Hour Reminder - Confirmed (Final Reminder)

**Setup:**
1. Calculate the date/time 2 hours from now
2. Add this row to Google Sheet:

| Date | Time | Patient Name | Patient Email | Status | 48hr Reminder Sent | 24hr Reminder Sent | 2hr Reminder Sent |
|------|------|--------------|---------------|--------|-------------------|-------------------|------------------|
| [TODAY's date] | [Time 2h from now] | Test Patient 4 | your_test_email@gmail.com | Confirmed | TRUE | TRUE | FALSE |

**Execute:**
1. Run workflow manually

**Expected Results:**
- ✅ Email subject: "Final Reminder - Appointment in 2 Hours"
- ✅ Email contains: "Your appointment is starting soon!"
- ✅ Email contains: "⏰ [Time] TODAY"
- ✅ Google Sheet updated: `2hr Reminder Sent` = TRUE
- ✅ Status remains: "Confirmed"

---

### Test 5: 2-Hour Auto-Cancel - NOT Confirmed

**Setup:**
1. Calculate the date/time 2 hours from now
2. Add this row to Google Sheet:

| Date | Time | Patient Name | Patient Email | Status | 48hr Reminder Sent | 24hr Reminder Sent | 2hr Reminder Sent |
|------|------|--------------|---------------|--------|-------------------|-------------------|------------------|
| [TODAY's date] | [Time 2h from now] | Test Patient 5 | your_test_email@gmail.com | Pending | TRUE | TRUE | FALSE |

**Execute:**
1. Run workflow manually

**Expected Results:**
- ✅ Email subject: "Appointment Cancelled - No Confirmation Received"
- ✅ Email contains: "has been automatically cancelled because we did not receive a confirmation"
- ✅ Google Sheet updated: `2hr Reminder Sent` = TRUE
- ✅ **Status changed to: "Cancelled"** (CRITICAL CHECK)
- ✅ Workflow should route to "TODO: Waitlist Integration" node (not yet built)

**Future Integration:**
- When waitlist workflow is built, this should trigger mass email to waitlist patients

---

### Test 6: Staff Alert (Appointment Starting Now)

**Setup:**
1. Calculate the current time (within next 15 minutes)
2. Add this row to Google Sheet:

| Date | Time | Patient Name | Patient Email | Patient Phone | Doctor Name | Appointment Type | Status | Staff_Alerted |
|------|------|--------------|---------------|---------------|-------------|------------------|--------|--------------|
| [TODAY's date] | [Current time or 5-10 min from now] | Test Patient 6 | patient@gmail.com | +1234567890 | Dr. Jennifer | Follow-up | Confirmed | FALSE |

**Execute:**
1. Run workflow manually (or wait until appointment time)

**Expected Results:**
- ✅ Email sent to: `debbiehills47@gmail.com` (hardcoded staff email)
- ✅ Email subject: "🚨 Appointment Starting Now - Test Patient 6"
- ✅ Email contains: "STAFF ALERT:" with all patient details
- ✅ Google Sheet updated: `Staff_Alerted` = TRUE

**TODO for Production:**
- Replace hardcoded email with environment variable or configurable setting

---

## Edge Case Testing

### Test 7: Skip Cancelled Appointments

**Setup:**
Add a row with Status = "Cancelled":

| Date | Time | Patient Name | Status | 48hr Reminder Sent |
|------|------|--------------|--------|-------------------|
| [Date 48h from now] | [Time] | Cancelled Patient | Cancelled | FALSE |

**Expected Results:**
- ✅ NO email sent (appointment skipped in Code node)
- ✅ Sheet remains unchanged
- ✅ Execution log: "Skipped: 1 appointments"

---

### Test 8: Skip Rescheduled Appointments

**Setup:**
Add a row with Status = "Rescheduled":

| Date | Time | Patient Name | Status | 48hr Reminder Sent |
|------|------|--------------|--------|-------------------|
| [Date 48h from now] | [Time] | Rescheduled Patient | Rescheduled | FALSE |

**Expected Results:**
- ✅ NO email sent
- ✅ Sheet remains unchanged

---

### Test 9: Skip Past Appointments

**Setup:**
Add a row with date/time in the past:

| Date | Time | Patient Name | Status | 48hr Reminder Sent |
|------|------|--------------|--------|-------------------|
| [Yesterday] | [Any time] | Past Patient | Pending | FALSE |

**Expected Results:**
- ✅ NO email sent
- ✅ Execution log: "Skipped: 1 appointments"

---

### Test 10: AM/PM Time Parsing

**Setup:**
Test both AM and PM times:

| Date | Time | Patient Name | Expected Behavior |
|------|------|--------------|------------------|
| [Date 48h from now] | 02:15 PM | AM/PM Test 1 | Should parse correctly as 14:15 |
| [Date 48h from now] | 09:30 AM | AM/PM Test 2 | Should parse correctly as 09:30 |
| [Date 48h from now] | 12:00 PM | Noon Test | Should parse correctly as 12:00 (noon) |
| [Date 48h from now] | 12:00 AM | Midnight Test | Should parse correctly as 00:00 (midnight) |

**Expected Results:**
- ✅ All times parsed correctly
- ✅ Reminders sent at correct intervals
- ✅ No errors in execution log

---

### Test 11: No Duplicate Sends

**Setup:**
1. Create appointment 48 hours from now
2. Run workflow manually → Email sent, flag set to TRUE
3. **Immediately run workflow again** (simulate second execution within same hour)

**Expected Results:**
- ✅ First run: Email sent
- ✅ Second run: NO email sent (flag already TRUE)
- ✅ Execution log: "Skipped: 1 appointments" on second run

---

## Timing Window Verification

### Test 12: Verify 1-Hour Timing Windows

**Current Windows:**
- 48hr: 47-48 hours before
- 24hr: 23-24 hours before
- 2hr: 1.5-2.5 hours before
- Staff: -15min to +15min of appointment time

**Test Edge Cases:**

| Appointment Time | Hours Until | Expected Reminder | Should Send? |
|-----------------|-------------|-------------------|--------------|
| [48h from now] | 48.5 | 48hr | ❌ NO (outside window) |
| [48h from now] | 47.5 | 48hr | ✅ YES |
| [48h from now] | 46.5 | 48hr | ❌ NO (outside window) |
| [24h from now] | 23.5 | 24hr | ✅ YES |
| [24h from now] | 22.5 | 24hr | ❌ NO |
| [2h from now] | 2.0 | 2hr | ✅ YES |
| [2h from now] | 1.5 | 2hr | ✅ YES |
| [2h from now] | 2.6 | 2hr | ❌ NO |

---

## Production Deployment Checklist

Once all tests pass:

### 1. Activate Workflow
- ✅ Click "Active" toggle in n8n
- ✅ Schedule Trigger will run every 1 hour automatically

### 2. Monitor First 24 Hours
- Check execution history every few hours
- Verify no errors
- Confirm emails are being sent correctly

### 3. Set Up Monitoring
- Enable workflow error notifications (n8n settings)
- Add error handler nodes if needed
- Set up logging/tracking for sent reminders

### 4. Update Staff Email
Currently hardcoded to `debbiehills47@gmail.com`. To change:
1. Open workflow
2. Find node: "Staff Alert Email"
3. Change `sendTo` parameter
4. Or set up environment variable for production

### 5. Document for Team
- Share this testing guide with clinic staff
- Train staff on Google Sheet column meanings
- Explain Status field values (Pending/Confirmed/Cancelled/Rescheduled)

---

## Troubleshooting

### Issue: No Emails Sent

**Possible Causes:**
1. Gmail credentials expired → Reconnect OAuth2
2. No appointments in timing windows → Check date/time calculations
3. All flags already set to TRUE → Check checkbox values in sheet

**Debug Steps:**
1. Open workflow execution
2. Check "Calculate Reminders" node output
3. Look for: "Reminders to send: 0" vs "Reminders to send: X"
4. If 0, check console.log messages for skip reasons

---

### Issue: Duplicate Emails

**Possible Causes:**
1. Multiple workflows running (old + new)
2. Flags not being updated in sheet
3. Reading from wrong sheet

**Debug Steps:**
1. Check active workflows → Deactivate old "my_build.json"
2. Verify sheet ID in "Update..." nodes matches "Read Appointments" node
3. Check Google Sheet after execution → Flags should be TRUE

---

### Issue: Wrong Email Template Sent

**Possible Causes:**
1. IF node logic incorrect (Status field check)
2. Switch node routing issue

**Debug Steps:**
1. Check "Check 24hr Status" node output
2. Verify Status field value in appointment row
3. Test both "Pending" and "Confirmed" statuses separately

---

### Issue: Time Parsing Errors

**Error Message:**
```
❌ Date parse error for "XX/XX/XXXX XX:XX XX"
```

**Solution:**
- Check Time column format in Google Sheet
- Must be: "HH:MM AM" or "HH:MM PM" (e.g., "02:15 PM")
- Or 24-hour format: "14:15"

---

## Next Steps: Future Workflows

### Response Handler Workflow (Not Yet Built)
**Trigger:** Gmail Trigger (wait for patient reply)
**Logic:**
- Parse email body for "1", "2", or "3"
- Update Status field:
  - "1" → "Confirmed"
  - "2" → "Cancelled" (trigger waitlist)
  - "3" → Send reschedule instructions
- Send confirmation email back to patient

**Integration Point:** Connect after "Update 48hr Flag" and "Update 24hr Flag" nodes

---

### Waitlist Notification Workflow (Not Yet Built)
**Trigger:** When appointment Status changes to "Cancelled"
**Logic:**
1. Read "Waitlist" sheet (all patients)
2. Send mass email: "Slot available: Dr. [Name] on [Date] at [Time]. Reply YES to claim."
3. Wait for first "YES" reply (Gmail Trigger)
4. Update cancelled appointment with new patient details
5. Change Status to "Confirmed"
6. Remove patient from Waitlist sheet
7. Send confirmation to new patient

**Integration Point:** Connect after "Update Status to Cancelled" node

---

## Support

**Questions or Issues:**
- Check n8n execution logs first
- Review this testing guide
- Verify Google Sheet column names match exactly
- Ensure all credentials are active

**Success Metrics:**
- ✅ No duplicate emails sent
- ✅ All reminders sent within timing windows
- ✅ Correct email templates used (confirmed vs pending)
- ✅ Status field updated correctly for auto-cancels
- ✅ Staff alerts sent on time

---

## Appendix: Quick Reference

### Timing Windows (1-Hour Schedule)
- 48hr: 47.0 - 48.0 hours before
- 24hr: 23.0 - 24.0 hours before
- 2hr: 1.5 - 2.5 hours before
- Staff: -0.25 to +0.25 hours (±15 min)

### Status Values
- **Pending**: Default from Cal.com, awaiting confirmation
- **Confirmed**: Patient confirmed attendance
- **Cancelled**: Patient cancelled or auto-cancelled
- **Rescheduled**: Appointment moved to different time

### Reminder Flags (Checkboxes)
- `48hr Reminder Sent`: TRUE after 48hr email sent
- `24hr Reminder Sent`: TRUE after 24hr email sent
- `2hr Reminder Sent`: TRUE after 2hr email sent
- `Staff_Alerted`: TRUE after staff alert sent

---

**Last Updated:** January 2025
**Workflow Version:** my_build_FIXED.json v1.0
