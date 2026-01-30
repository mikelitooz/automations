# Google Sheet Columns for Intake Form Tracking

## 🎯 Overview

This guide shows you how to add **7 new columns** to your existing Appointments Google Sheet to track digital intake form workflows.

**Integration**: These columns work alongside existing columns from Automation 1 (SMS Reminders) and Automation 2 (Insurance Verification).

**Time to add**: 10 minutes

---

## 📊 New Columns to Add

Add these 7 columns to the **right** of your existing columns:

| Column Name | Type | Width | Sample Value | Purpose |
|-------------|------|-------|--------------|---------|
| **Form_Link_Sent** | Text | 80px | Yes / No | Tracks if intake form SMS was sent |
| **Form_Link_Sent_Date** | DateTime | 150px | 01/25/2026 14:30:00 | When form link was sent |
| **Form_Completion_Link** | URL | 300px | https://form.typeform.com/to/abc123?patient_name=... | Unique Typeform URL for patient |
| **Form_Completed** | Text | 80px | Yes / No | Tracks if patient submitted form |
| **Form_Completed_Date** | DateTime | 150px | 01/26/2026 18:45:00 | When patient submitted form |
| **Reminder_Sent** | Text | 80px | Yes / No | Tracks if 24hr reminder was sent |
| **Athenahealth_Patient_ID** | Text | 150px | 12345 | Patient ID from Athenahealth FHIR API |

---

## 🔧 Step-by-Step Setup

### Step 1: Open Your Appointments Sheet

1. Open your **Appointments** Google Sheet
2. You should already have columns from Automation 1 & 2:
   - From **Automation 1**: Date, Time, Patient_Name, Phone, Status, Confirmed, 48hr_Reminder_Sent, etc.
   - From **Automation 2**: Insurance_Company, Member_ID, Verification_Status, etc.

### Step 2: Add Column Headers

1. Scroll to the **far right** of your existing columns
2. Find the first empty column (likely column AA or AB)
3. Add these 7 column headers in consecutive columns:

**Column headers** (copy/paste these exactly):
```
Form_Link_Sent
Form_Link_Sent_Date
Form_Completion_Link
Form_Completed
Form_Completed_Date
Reminder_Sent
Athenahealth_Patient_ID
```

### Step 3: Format the Columns

**Form_Link_Sent_Date** column:
1. Select the entire column (click column letter)
2. Format → Number → Date time
3. Example format: `01/26/2026 15:30:00`

**Form_Completed_Date** column:
1. Select the entire column
2. Format → Number → Date time

**Form_Completion_Link** column:
1. Select the entire column
2. Format → Number → Plain text (prevents auto-linking)
3. Column width: 300px (to show full URLs)

**Yes/No columns** (Form_Link_Sent, Form_Completed, Reminder_Sent):
1. No special formatting needed
2. Values will be: `Yes`, `No`, or blank

**Athenahealth_Patient_ID** column:
1. Format → Number → Plain text (to preserve leading zeros if any)

---

## 📝 Sample Data

Here's what a complete row looks like with **all three automations** (SMS + Insurance + Intake):

| Patient_Name | Date | Time | Phone | Status | Insurance_Company | Member_ID | Verification_Status | Form_Link_Sent | Form_Completion_Link | Form_Completed | Athenahealth_Patient_ID |
|-------------|------|------|-------|--------|------------------|-----------|-------------------|--------------|-------------------|--------------|----------------------|
| John Smith | 01/28/2026 | 10:30 AM | +15551234567 | SCHEDULED | Aetna | W123456789 | VERIFIED | Yes | https://form.typeform.com/to/xyz?patient_name=John%20Smith&... | Yes | 98765 |
| Sarah Johnson | 01/28/2026 | 2:00 PM | +15559876543 | SCHEDULED | Blue Cross | ABC987654 | COPAY | Yes | https://form.typeform.com/to/xyz?patient_name=Sarah%20Johnson&... | No | |
| Mike Davis | 01/29/2026 | 9:00 AM | +15556541234 | SCHEDULED | UnitedHealthcare | U555123456 | VERIFIED | No | | No | |

**Explanation**:
- **John Smith**: Form sent, completed, pushed to Athenahealth (ID: 98765)
- **Sarah Johnson**: Form sent but NOT completed yet (will get reminder at 6 PM)
- **Mike Davis**: Form not sent yet (will be sent 48 hours before appointment)

---

## 📋 Detailed Column Descriptions

### 1. Form_Link_Sent
**Purpose**: Tracks whether the intake form SMS has been sent to the patient

**Values**:
- `Yes` - Form link was sent via SMS
- `No` or blank - Form link not sent yet

**Updated by**: Workflow 1 (intake-form-sender.json)

**When it's set**: 48 hours before appointment

**Use case**: Prevents duplicate form links from being sent

---

### 2. Form_Link_Sent_Date
**Purpose**: Timestamp when the form link was sent

**Format**: `MM/DD/YYYY HH:MM:SS`

**Example**: `01/25/2026 14:30:00`

**Updated by**: Workflow 1 (intake-form-sender.json)

**Use case**: Track how long patients have had to complete the form

---

### 3. Form_Completion_Link
**Purpose**: Stores the unique Typeform URL sent to the patient

**Format**: Full URL with hidden fields

**Example**:
```
https://form.typeform.com/to/abc123?patient_name=John%20Smith&appointment_id=APT-01282026-1030AM-John-Smith&phone=%2B15551234567&appointment_date=01%2F28%2F2026&appointment_time=10%3A30%20AM&insurance_company=Aetna&member_id=W123456789
```

**Updated by**: Workflow 1 (intake-form-sender.json)

**Use case**:
- Allows staff to resend link if patient lost it
- Used by reminder workflow to send same link
- Includes hidden fields to track patient context

---

### 4. Form_Completed
**Purpose**: Tracks whether patient has submitted the intake form

**Values**:
- `Yes` - Patient submitted the form
- `No` or blank - Form not completed yet

**Updated by**: Workflow 2 (intake-form-received.json)

**When it's set**: When Typeform webhook fires (patient submits form)

**Use case**: Prevents reminder from being sent if form is already completed

---

### 5. Form_Completed_Date
**Purpose**: Timestamp when patient submitted the form

**Format**: `MM/DD/YYYY HH:MM:SS`

**Example**: `01/26/2026 18:45:00`

**Updated by**: Workflow 2 (intake-form-received.json)

**Use case**: Track completion time (helps measure urgency/compliance)

---

### 6. Reminder_Sent
**Purpose**: Tracks whether 24-hour reminder was sent

**Values**:
- `Yes` - Reminder SMS was sent
- `No` or blank - No reminder sent

**Updated by**: Workflow 3 (intake-form-reminder.json)

**When it's set**: 6 PM the day before appointment (if form not completed)

**Use case**: Prevents multiple reminders from being sent

**Note**: Only sent if `Form_Link_Sent = Yes` AND `Form_Completed ≠ Yes`

---

### 7. Athenahealth_Patient_ID
**Purpose**: Stores the patient ID returned by Athenahealth FHIR API

**Format**: Numeric string (or alphanumeric depending on Athenahealth configuration)

**Example**: `98765` or `PAT-12345`

**Updated by**: Workflow 2 (intake-form-received.json)

**When it's set**: After successful patient creation in Athenahealth

**Use case**:
- Links Google Sheet record to Athenahealth patient
- Used for future API calls (update patient, add notes, etc.)
- Helps staff look up patient in EMR quickly

---

## 🎨 Conditional Formatting (Color-Coding)

Add color-coding to visualize form status at a glance.

### Format 1: Form Completed (Green)
1. Select the **Form_Completed** column (entire column)
2. Format → Conditional formatting
3. Format rules:
   - Format cells if: **Text is exactly** `Yes`
   - Formatting style: **Light green 3 background** (#d9ead3)
4. Click **Done**

### Format 2: Form Sent but Not Completed (Yellow)
1. Select the **Form_Link_Sent** column
2. Format → Conditional formatting
3. Format rules:
   - Format cells if: **Custom formula is**
   - Formula: `=AND($AA2="Yes", $AD2<>"Yes")`
     - (Replace `$AA2` with your Form_Link_Sent column)
     - (Replace `$AD2` with your Form_Completed column)
   - Formatting style: **Light yellow 3 background** (#fff2cc)
4. Click **Done**

### Format 3: Form Not Sent (Red) - Urgent if <24hr
1. Select the **Form_Link_Sent** column
2. Format → Conditional formatting
3. Format rules:
   - Format cells if: **Custom formula is**
   - Formula: `=AND($AA2<>"Yes", $B2=TODAY()+1)`
     - (Replace `$AA2` with Form_Link_Sent column)
     - (Replace `$B2` with Date column)
     - This highlights if appointment is tomorrow and form wasn't sent
   - Formatting style: **Light red 3 background** (#f4cccc)
4. Click **Done**

---

## 🔄 Form Lifecycle States

Understanding the data flow through these columns:

### State 1: Initial (Before Form Sent)
```
Form_Link_Sent: [blank]
Form_Link_Sent_Date: [blank]
Form_Completion_Link: [blank]
Form_Completed: [blank]
Form_Completed_Date: [blank]
Reminder_Sent: [blank]
Athenahealth_Patient_ID: [blank]
```
**What happens next**: Workflow 1 runs hourly, will send form 48hr before appointment

---

### State 2: Form Sent (Awaiting Completion)
```
Form_Link_Sent: Yes
Form_Link_Sent_Date: 01/25/2026 14:30:00
Form_Completion_Link: https://form.typeform.com/to/...
Form_Completed: No
Form_Completed_Date: [blank]
Reminder_Sent: [blank]
Athenahealth_Patient_ID: [blank]
```
**What happens next**: Patient receives SMS with form link. If not completed by 6 PM day before, Workflow 3 sends reminder.

---

### State 3: Reminder Sent (Form Still Incomplete)
```
Form_Link_Sent: Yes
Form_Link_Sent_Date: 01/25/2026 14:30:00
Form_Completion_Link: https://form.typeform.com/to/...
Form_Completed: No
Form_Completed_Date: [blank]
Reminder_Sent: Yes
Athenahealth_Patient_ID: [blank]
```
**What happens next**: Patient receives reminder SMS. If still not completed, staff will ask patient to fill out on arrival.

---

### State 4: Form Completed (Success!)
```
Form_Link_Sent: Yes
Form_Link_Sent_Date: 01/25/2026 14:30:00
Form_Completion_Link: https://form.typeform.com/to/...
Form_Completed: Yes
Form_Completed_Date: 01/26/2026 18:45:00
Reminder_Sent: [blank or Yes]
Athenahealth_Patient_ID: 98765
```
**What happens next**: Patient data is in Athenahealth EMR. Staff can review during check-in. No further automated actions needed.

---

## 📊 Staff Dashboard View (Optional)

Create a **summary view** for staff to quickly see form status:

### Add Summary Formulas

In a separate area of your sheet (or new sheet tab), add:

**Total Appointments Today**:
```
=COUNTIF(Date:Date, TODAY())
```

**Forms Sent Today**:
```
=COUNTIFS(Date:Date, TODAY(), Form_Link_Sent:Form_Link_Sent, "Yes")
```

**Forms Completed Today**:
```
=COUNTIFS(Date:Date, TODAY(), Form_Completed:Form_Completed, "Yes")
```

**Forms Pending (Sent but Not Completed)**:
```
=COUNTIFS(Date:Date, TODAY(), Form_Link_Sent:Form_Link_Sent, "Yes", Form_Completed:Form_Completed, "<>Yes")
```

**Completion Rate**:
```
=Forms_Completed_Today / Forms_Sent_Today
```

**Example Dashboard**:
```
📊 Intake Form Status - Today (01/27/2026)

Total Appointments: 25
Forms Sent: 20
Forms Completed: 17
Forms Pending: 3
Completion Rate: 85%

⚠️ Pending Forms:
- Sarah Johnson (2:00 PM)
- Mike Davis (3:30 PM)
- Lisa Brown (4:00 PM)
```

---

## 🔍 Filtering & Sorting

### Useful Filter Views

**View 1: Incomplete Forms (Action Needed)**
1. Data → Create a filter
2. Filter by:
   - `Form_Link_Sent` = Yes
   - `Form_Completed` ≠ Yes
   - `Date` = Today or Tomorrow
3. Result: Shows patients who need follow-up

**View 2: Completed Forms (Ready for Check-In)**
1. Data → Create a filter
2. Filter by:
   - `Form_Completed` = Yes
   - `Date` = Today
3. Result: Shows patients ready for fast check-in

**View 3: Missing Patient IDs (Integration Issues)**
1. Data → Create a filter
2. Filter by:
   - `Form_Completed` = Yes
   - `Athenahealth_Patient_ID` = [blank]
3. Result: Shows forms completed but not pushed to EMR (needs troubleshooting)

---

## ✅ Integration with Existing Columns

These new columns work seamlessly with your existing automation columns:

### Full Column Order (All 3 Automations)

**Core Appointment Data**:
1. Date
2. Time
3. Patient_Name
4. Phone
5. Email
6. Status
7. Notes

**Automation 1: SMS Reminders**:
8. 48hr_Reminder_Sent
9. 24hr_Reminder_Sent
10. 2hr_Reminder_Sent
11. Confirmed
12. Waitlist

**Automation 2: Insurance Verification**:
13. Insurance_Company
14. Member_ID
15. Policy_Number
16. Verification_Status
17. Verification_Date
18. Copay_Amount
19. Deductible_Amount
20. Insurance_Verified_Today

**Automation 3: Digital Intake Forms** (NEW):
21. Form_Link_Sent
22. Form_Link_Sent_Date
23. Form_Completion_Link
24. Form_Completed
25. Form_Completed_Date
26. Reminder_Sent
27. Athenahealth_Patient_ID

**Total Columns**: 27+

---

## 🛠️ Troubleshooting

### Issue: Form_Link_Sent not updating to "Yes"

**Possible causes**:
1. Workflow 1 (intake-form-sender) is not active
2. Appointment date is not exactly 48 hours away
3. Google Sheets credentials not configured in workflow
4. Patient_Name, Date, or Time columns don't match (used for lookup)

**Fix**:
- Check n8n workflow execution log
- Verify appointment date/time
- Verify Google Sheets update node has correct column mapping

---

### Issue: Form_Completed not updating after submission

**Possible causes**:
1. Typeform webhook not configured
2. Workflow 2 (intake-form-received) is not active
3. Hidden fields in Typeform URL don't match patient data
4. Google Sheets update node failing due to column mismatch

**Fix**:
- Check Typeform webhook settings (should point to n8n)
- Test Typeform submission manually
- Check n8n execution log for errors
- Verify Patient_Name, Date, Time match exactly

---

### Issue: Athenahealth_Patient_ID is blank even though Form_Completed = Yes

**Possible causes**:
1. Athenahealth API call failed (credentials, permissions, or data validation)
2. Workflow didn't extract patient ID from API response
3. Google Sheets update happened before Athenahealth call completed

**Fix**:
- Check n8n execution log for Athenahealth API errors
- Verify Athenahealth OAuth2 credentials
- Check "Create Patient in Athenahealth" node output
- See `ATHENAHEALTH_API_INTEGRATION.md` for detailed troubleshooting

---

## 🎯 Daily Maintenance Routine

**Every morning (5 minutes)**:

1. **Review today's appointments**:
   - Filter: Date = Today
   - Check Form_Completed column

2. **Identify incomplete forms**:
   - Look for: Form_Link_Sent = Yes, Form_Completed ≠ Yes
   - Call these patients or prepare tablet for in-office completion

3. **Verify Athenahealth sync**:
   - Check: Form_Completed = Yes, Athenahealth_Patient_ID has value
   - If blank, manually push data or contact IT

4. **Clear completed appointments**:
   - After appointment completes, update Status → COMPLETED
   - (Optional) Archive completed rows to separate sheet monthly

---

## 📧 Staff Training Checklist

Before rolling out to staff:

- [ ] Explain the 3-state lifecycle (Not Sent → Sent → Completed)
- [ ] Show how to filter for incomplete forms
- [ ] Demonstrate how to resend form link (copy from Form_Completion_Link column)
- [ ] Train on what to do if patient arrives without completing form
- [ ] Show how to verify data in Athenahealth using Patient ID
- [ ] Explain color-coding (green = done, yellow = pending, red = urgent)
- [ ] Provide quick reference card with common filters

---

## ✅ Setup Checklist

- [ ] Add 7 new column headers to Google Sheet
- [ ] Format Form_Link_Sent_Date and Form_Completed_Date columns (Date time)
- [ ] Set Form_Completion_Link column width to 300px
- [ ] Add conditional formatting (green/yellow/red)
- [ ] Test with sample appointment data
- [ ] Verify workflows can read/write to new columns
- [ ] Create staff training materials
- [ ] Document any custom changes for your practice

---

**Last Updated**: January 27, 2026
**Created for**: Dr. Jennifer's Medical Practice - Automation 3 (Digital Intake Forms)
**Integration**: Works with Automation 1 (SMS Reminders) + Automation 2 (Insurance Verification)

**Questions?** See `INTAKE_SETUP_GUIDE.md` for complete deployment instructions.
