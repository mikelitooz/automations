# Migration to Medical_Workflow Google Sheet - Complete ✅

**Date**: 2025-10-31
**Status**: All workflows successfully updated

## Summary

All 4 appointment workflows have been migrated from the old "Dr. Jennifer Clinic Appointments" sheet to the new "Medical_Workflow" sheet with underscore-based column names.

---

## Changes Made

### 1. Google Sheet Configuration
- **Old Sheet ID**: `1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s`
- **New Sheet ID**: `1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y`

- **Old Document Name**: "Dr. Jennifer Clinic Appointments"
- **New Document Name**: "Medical_Workflow"

- **Old Sheet Name**: "Appointments"
- **New Sheet Name**: "Sheet1"

### 2. Column Name Updates (Spaces → Underscores)

| Old Column Name | New Column Name |
|----------------|-----------------|
| `Patient Name` | `Patient_Name` |
| `Patient Email` | `Patient_Email` |
| `Patient Phone` | `Patient_Phone` |
| `Doctor Name` | `Doctor_Name` |
| `Appointment Type` | `Appointment_Type` |
| `48hr Reminder Sent` | `48hr_Reminder_Sent` |
| `24hr Reminder Sent` | `24hr_Reminder_Sent` |
| `2hr Reminder Sent` | `2hr_Reminder_Sent` |
| `Preferred Doctor` | `Preferred_Doctor` |

**No Changes**: `Date`, `Time`, `Status`, `Appointment_Uid`, `ISO_Time_Format` (already had correct format)

---

## Updated Workflows

### ✅ 1. my_build_FIXED.json (Appointment Reminders)
**File**: [dr-jennifer-workflow/my_build_FIXED.json](my_build_FIXED.json)

**Changes**:
- Google Sheet ID updated (6 occurrences)
- Sheet name updated from "Appointments" → "Sheet1" (6 occurrences)
- JavaScript code in "Calculate Reminders" node updated:
  - `row["Patient_Email"]`, `row["Patient_Name"]` (instead of spaces)
  - All reminder flag columns: `48hr_Reminder_Sent`, `24hr_Reminder_Sent`, `2hr_Reminder_Sent`
- Email templates updated: `$json["Patient_Name"]`, `$json["Doctor_Name"]`, etc.
- Google Sheets update nodes:
  - `matchingColumns: ["Patient_Name", "Date", "Time"]`
  - Column mappings: `"48hr_Reminder_Sent": "TRUE"`

### ✅ 2. response-handler-workflow.json (Patient Email Replies)
**File**: [dr-jennifer-workflow/response-handler-workflow.json](response-handler-workflow.json)

**Changes**:
- Google Sheet ID updated (2 occurrences)
- Sheet name updated (2 occurrences)
- Google Sheets lookup column: `"column": "Patient_Email"`
- JavaScript code in "Pattern Matching" node updated:
  - `patientData["Patient_Name"]` (all references)
- Email templates updated
- Google Sheets update nodes:
  - `matchingColumns: ["Patient_Email", "Date", "Time"]`

### ✅ 3. calcom-event-handler-workflow.json (Cal.com Webhook Handler)
**File**: [dr-jennifer-workflow/calcom-event-handler-workflow.json](calcom-event-handler-workflow.json)

**Changes**:
- Google Sheet ID updated (2 occurrences)
- Sheet name updated (2 occurrences)
- Google Sheets update nodes:
  - `matchingColumns: ["Patient_Email", "Date", "Time"]`

**Note**: This workflow uses camelCase variable names (`patientName`, `doctorName`, `appointmentType`) created in the "Parse Cal.com Webhook" JavaScript node. These don't directly reference Google Sheet columns, so no JavaScript changes were needed.

### ✅ 4. waitlist-notification-workflow-SIMPLIFIED.json (Waitlist Notifications)
**File**: [dr-jennifer-workflow/waitlist-notification-workflow-SIMPLIFIED.json](waitlist-notification-workflow-SIMPLIFIED.json)

**Changes**:
- Google Sheet ID updated
- Sheet name updated
- JavaScript code in "Filter Waitlist" node updated:
  - `patient["Patient_Email"]`
  - `patient["Patient_Name"]`
  - `patient["Preferred_Doctor"]`

**Note**: This workflow reads from the "Waitlist" tab (gid=1) which may need to be created or verified in the new sheet.

---

## Testing Checklist

Before deploying these updated workflows to production:

### Sheet Setup
- [ ] Verify new Google Sheet ID: `1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y`
- [ ] Confirm "Sheet1" tab exists
- [ ] Verify all column headers match new naming:
  - `Patient_Name`, `Patient_Email`, `Patient_Phone`
  - `Doctor_Name`, `Appointment_Type`
  - `48hr_Reminder_Sent`, `24hr_Reminder_Sent`, `2hr_Reminder_Sent`
  - `ISO_Time_Format`, `Date`, `Time`, `Status`, `Appointment_Uid`
- [ ] Confirm "Waitlist" tab exists (gid=1) for waitlist workflow

### Workflow Testing
- [ ] Import updated workflows to n8n
- [ ] Reconnect Google Sheets OAuth2 credentials
- [ ] Test "Read Appointments" nodes (all workflows)
- [ ] Test "Calculate Reminders" with sample data
- [ ] Test "Response Handler" with test email reply
- [ ] Test "Cal.com Event Handler" with test webhook
- [ ] Test "Waitlist Notification" with freed slot

### Data Migration
- [ ] Copy data from old sheet to new sheet (if needed)
- [ ] Verify ISO_Time_Format column is populated correctly
- [ ] Test reminder calculation with real appointment data
- [ ] Verify matching logic works with new column names

---

## Rollback Plan

If issues occur, you can revert to the old sheet:

1. Replace all instances of:
   - New Sheet ID → Old Sheet ID
   - `"Medical_Workflow"` → `"Dr. Jennifer Clinic Appointments"`
   - `"Sheet1"` → `"Appointments"`
   - `Patient_Name` → `Patient Name` (all columns with underscores → spaces)

2. Old workflows are still available (not deleted)

---

## New Google Sheet Structure

**Document ID**: `1qwRj5vMXyrCiuAohIX-gcOmGK1M9Hc1BMLkK0vBE_3Y`
**Document Name**: Medical_Workflow

### Sheet1 (Appointments)
```
Appointment_Uid
Date
Time
Patient_Name
Patient_Phone
Patient_Email
Doctor_Name
Appointment_Type
Status
48hr_Reminder_Sent
24hr_Reminder_Sent
2hr_Reminder_Sent
Confirmed_At
Confirmed_Via
Cancelled_At
Cancelled_Via
Cancellation_Reason
Rescheduled_At
Rescheduled_Via
Staff_Alerted
ISO_Time_Format
```

### Waitlist (Tab for waitlist patients)
```
Patient_Name
Patient_Email
Patient_Phone
Preferred_Doctor
Date_Added
```

---

## Benefits of New Structure

### 1. Consistent Naming Convention
- All columns use underscores (no spaces)
- Easier to reference in code: `row["Patient_Name"]`
- Reduces risk of typos and parsing errors

### 2. ISO_Time_Format Column
- Simplified date/time parsing (eliminated 40+ lines of code)
- More reliable: `new Date(row["ISO_Time_Format"])`
- No more AM/PM, 12hr vs 24hr format confusion

### 3. Better Organization
- Clear document name: "Medical_Workflow"
- Dedicated tabs: "Sheet1" (appointments), "Waitlist"
- Scalable for future additions (e.g., "Prescriptions", "Lab_Results")

---

## Next Steps

1. **Test thoroughly** using the testing checklist above
2. **Monitor first 24-48 hours** after deployment
3. **Check execution logs** in n8n for any Google Sheets errors
4. **Verify reminder emails** are being sent correctly
5. **Confirm waitlist notifications** trigger on cancellations/reschedules

---

## Support

If you encounter issues:
- Check n8n execution logs for error details
- Verify Google Sheets permissions (share with service account)
- Confirm column names match exactly (case-sensitive)
- Test each workflow individually before running in production

---

**Migration completed successfully! ✅**
