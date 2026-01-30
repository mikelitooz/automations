# Insurance Verification - Google Sheet Columns

## Overview

This guide shows you how to add insurance verification columns to your existing "Appointments" sheet from Automation 1 (SMS Reminders).

**Setup Time**: 10 minutes

---

## New Columns to Add

Add these 11 columns to the **right side** of your existing Appointments sheet (after the existing columns):

| # | Column Name | Type | Width | Description |
|---|------------|------|-------|-------------|
| 1 | **Insurance_Company** | Text | 150px | Insurer name (e.g., Aetna, UnitedHealthcare, Blue Cross) |
| 2 | **Member_ID** | Text | 120px | Insurance member/subscriber ID |
| 3 | **Policy_Number** | Text | 120px | Policy or group number |
| 4 | **Verification_Status** | Text | 150px | VERIFIED / COPAY / DEDUCTIBLE / INACTIVE / AUTH_NEEDED |
| 5 | **Verification_Date** | DateTime | 150px | When verification was run (auto-filled by workflow) |
| 6 | **Copay_Amount** | Number | 100px | Copay amount owed (0 if none) |
| 7 | **Deductible_Amount** | Number | 120px | Deductible amount owed (0 if none) |
| 8 | **Prior_Auth_Needed** | Text | 100px | Yes / No (prior authorization required) |
| 9 | **Insurance_Verified_Today** | Text | 150px | Yes / No (prevents duplicate verification) |
| 10 | **Patient_Notified_Copay** | Text | 150px | Yes / No (SMS notification sent) |
| 11 | **Insurance_Notes** | Text | 300px | Error messages, special notes, or verification details |

---

## Step-by-Step Setup

### Step 1: Open Your Appointments Sheet

1. Open your **Appointments** Google Sheet (from Automation 1)
2. You should see existing columns like:
   - Date, Time, Patient_Name, Phone, etc.
   - 48hr_Reminder_Sent, 24hr_Reminder_Sent, etc.

### Step 2: Add New Column Headers

1. **Scroll to the far right** of your sheet (after the last column)
2. **Click on the next empty column** (probably column T, U, or V)
3. **Copy/paste these 11 headers** into consecutive columns:

```
Insurance_Company
Member_ID
Policy_Number
Verification_Status
Verification_Date
Copay_Amount
Deductible_Amount
Prior_Auth_Needed
Insurance_Verified_Today
Patient_Notified_Copay
Insurance_Notes
```

### Step 3: Format the Columns

**Format Verification_Date column**:
1. Click the column letter (e.g., column X)
2. Format → Number → Date time
3. Example format: `01/26/2026 23:15:00`

**Format Copay_Amount and Deductible_Amount**:
1. Click each column
2. Format → Number → Number
3. Decimal places: 0
4. Example: `50` or `250`

**Resize columns** (optional):
- Drag column borders to match the widths in the table above
- Or select columns → Right-click → Resize columns

---

## Sample Data

Add test data to familiarize yourself with the system:

### Example Row 1 (Verified - No Issues)
```
Insurance_Company: Aetna
Member_ID: 123456789
Policy_Number: GRP-ABC123
Verification_Status: VERIFIED
Verification_Date: 01/26/2026 23:15
Copay_Amount: 0
Deductible_Amount: 0
Prior_Auth_Needed: No
Insurance_Verified_Today: Yes
Patient_Notified_Copay: No
Insurance_Notes: Policy active. No copay or deductible.
```

### Example Row 2 (Copay Due)
```
Insurance_Company: UnitedHealthcare
Member_ID: 987654321
Policy_Number: POL-XYZ789
Verification_Status: COPAY
Verification_Date: 01/26/2026 23:15
Copay_Amount: 50
Deductible_Amount: 0
Prior_Auth_Needed: No
Insurance_Verified_Today: Yes
Patient_Notified_Copay: Yes
Insurance_Notes: Copay of $50 due at visit.
```

### Example Row 3 (Inactive - Urgent)
```
Insurance_Company: Blue Cross Blue Shield
Member_ID: 456789123
Policy_Number: GRP-DEF456
Verification_Status: INACTIVE
Verification_Date: 01/26/2026 23:15
Copay_Amount: 0
Deductible_Amount: 0
Prior_Auth_Needed: No
Insurance_Verified_Today: Yes
Patient_Notified_Copay: Yes
Insurance_Notes: ⚠️ URGENT: Policy inactive or terminated. Contact patient immediately.
```

---

## Column Descriptions (Detailed)

### 1. Insurance_Company
**What it is**: The name of the patient's insurance provider
**Examples**:
- Aetna
- UnitedHealthcare (UHC)
- Blue Cross Blue Shield (BCBS)
- Cigna
- Humana
- Medicare
- Medicaid

**Where to get it**: From patient intake forms or EMR

### 2. Member_ID
**What it is**: The unique identifier on the patient's insurance card (usually on front)
**Format**: Alphanumeric, varies by insurer
**Examples**:
- `123456789` (9 digits)
- `ABC123456789` (mix of letters/numbers)
- `W123456789` (starts with letter)

**Where to get it**: Insurance card (patient provides photo or physical card)

### 3. Policy_Number
**What it is**: Group or policy number (sometimes same as Member ID)
**Format**: Varies by insurer
**Examples**:
- `GRP-ABC123` (group plans)
- `POL-789456` (individual plans)
- Sometimes just a number: `123456`

**Where to get it**: Insurance card (usually labeled "Group #" or "Policy #")

### 4. Verification_Status
**What it is**: Result of the verification check
**Auto-filled by workflow** - Leave blank initially

**Possible Values**:
- `VERIFIED` - Policy active, no copay/deductible (🟢 Green)
- `COPAY` - Copay amount due (🟡 Yellow)
- `DEDUCTIBLE` - Deductible amount due (🟡 Yellow)
- `INACTIVE` - Policy not active (🔴 Red - URGENT)
- `AUTH_NEEDED` - Prior authorization required (🟡 Yellow)
- *(blank)* - Not yet verified

### 5. Verification_Date
**What it is**: Timestamp when verification ran
**Auto-filled by workflow** - Leave blank initially
**Format**: DateTime (MM/DD/YYYY HH:MM)
**Example**: `01/26/2026 23:15`

### 6. Copay_Amount
**What it is**: Dollar amount patient owes as copay
**Auto-filled by workflow** - Leave blank or `0` initially
**Format**: Number (no dollar sign)
**Examples**: `20`, `50`, `75`

### 7. Deductible_Amount
**What it is**: Dollar amount patient owes toward deductible
**Auto-filled by workflow** - Leave blank or `0` initially
**Format**: Number (no dollar sign)
**Examples**: `100`, `250`, `1000`

### 8. Prior_Auth_Needed
**What it is**: Whether prior authorization is required
**Auto-filled by workflow** - Leave blank initially
**Values**: `Yes` or `No`

### 9. Insurance_Verified_Today
**What it is**: Flag to prevent duplicate verification
**Auto-filled by workflow** - Leave blank initially
**Values**: `Yes` or *(blank)*
**Purpose**: Workflow checks this to avoid verifying same patient multiple times

**Important**: This should reset daily. Options:
- Manual: Clear this column each morning
- Automated: Add a daily cleanup workflow (optional)

### 10. Patient_Notified_Copay
**What it is**: Flag indicating SMS notification was sent
**Auto-filled by workflow** - Leave blank initially
**Values**: `Yes` or *(blank)*
**Purpose**: Tracks whether patient received copay/deductible SMS

### 11. Insurance_Notes
**What it is**: Detailed notes, error messages, or special instructions
**Auto-filled by workflow** - Leave blank initially
**Examples**:
- `Policy active. No copay or deductible.`
- `Copay of $50 due at visit.`
- `⚠️ URGENT: Policy inactive or terminated.`
- `Prior authorization required for this appointment type.`
- `Verification failed: Invalid member ID.`

---

## Color-Coding (Optional but Recommended)

Add conditional formatting to highlight verification status:

### Setup Conditional Formatting

1. **Select the entire Verification_Status column**
2. **Format → Conditional formatting**
3. **Add rules**:

**Rule 1 - Green (VERIFIED)**:
- Format cells if: Text is exactly `VERIFIED`
- Background: Light green (#d9ead3)
- Text: Dark green (#274e13)

**Rule 2 - Yellow (COPAY/DEDUCTIBLE/AUTH_NEEDED)**:
- Format cells if: Text contains `COPAY` OR `DEDUCTIBLE` OR `AUTH_NEEDED`
- Background: Light yellow (#fff2cc)
- Text: Dark orange (#bf9000)

**Rule 3 - Red (INACTIVE)**:
- Format cells if: Text is exactly `INACTIVE`
- Background: Light red (#f4cccc)
- Text: Dark red (#990000)

**Result**: Your sheet will visually highlight issues at a glance!

---

## Data Entry Best Practices

### New Appointments

When adding new appointments, fill in:
1. **Required**: Patient_Name, Date, Time, Phone (existing columns)
2. **Insurance info**: Insurance_Company, Member_ID, Policy_Number
3. **Leave blank**: All other insurance columns (workflow fills these)

### Missing Insurance Info

If patient hasn't provided insurance:
- Leave Insurance_Company, Member_ID, Policy_Number **blank**
- Workflow will skip these patients
- Staff can verify manually or add info later

### Self-Pay Patients

For patients paying out-of-pocket (no insurance):
- Insurance_Company: `Self-Pay` or leave blank
- Leave all other insurance columns blank
- Workflow will skip these patients

---

## Daily Maintenance

### Morning Routine (5 minutes)

1. **Open Google Sheet**
2. **Check color-coded rows**:
   - 🟢 Green (VERIFIED) → Ready to go
   - 🟡 Yellow (COPAY/etc.) → Inform patient at check-in
   - 🔴 Red (INACTIVE) → Call patient ASAP
3. **Review morning email report** for detailed breakdown

### End of Day

1. **Mark completed appointments**: Change Status to `COMPLETED`
2. **(Optional) Clear** `Insurance_Verified_Today` column for tomorrow
   - Or let workflow handle duplicates (it checks this field)

### Weekly Cleanup

1. **Archive old appointments** (past dates)
2. **Backup sheet**: File → Download → Excel or CSV
3. **Review denied claims** vs. verification accuracy

---

## Troubleshooting

### Verification Not Running?

**Check**:
- Insurance_Company column has value (not blank)
- Insurance_Verified_Today is blank or "No"
- Date = tomorrow's date
- Status = SCHEDULED

### Workflow Skipping Patients?

**Possible reasons**:
- Missing insurance info (columns blank)
- Already verified today (`Insurance_Verified_Today = Yes`)
- Date is not tomorrow
- Status is not SCHEDULED

### Duplicate Verifications?

**Solution**:
- Workflow checks `Insurance_Verified_Today` column
- Should only run once per patient per day
- If duplicates occur, check for multiple workflow instances

---

## Integration with Automation 1 (SMS Reminders)

These insurance columns work **alongside** your existing SMS reminder columns:

### Existing Columns (from Automation 1)
- Date, Time, Patient_Name, Phone, etc.
- 48hr_Reminder_Sent, 24hr_Reminder_Sent, 2hr_Reminder_Sent
- Confirmed, Status, etc.

### New Columns (Automation 2 - Insurance)
- Insurance_Company, Member_ID, Policy_Number
- Verification_Status, Copay_Amount, etc.

**Both systems use the same sheet** - no conflicts!

---

## Example: Complete Row

Here's what a complete appointment row looks like with both SMS reminders AND insurance verification:

```
Date: 01/28/2026
Time: 10:30 AM
Patient_Name: Maria Garcia
Phone: +15559876543
Email: maria@example.com
Doctor_Name: Dr. Chen
Appointment_Type: Follow-up
Office_Address: 456 Health Plaza
Office_Phone: (555) 987-6543
Confirmed: Yes
Status: SCHEDULED
48hr_Reminder_Sent: Yes
24hr_Reminder_Sent: (blank - already confirmed)
2hr_Reminder_Sent: (will be sent day-of)

Insurance_Company: Aetna
Member_ID: 123456789
Policy_Number: GRP-ABC123
Verification_Status: COPAY
Verification_Date: 01/27/2026 23:15
Copay_Amount: 50
Deductible_Amount: 0
Prior_Auth_Needed: No
Insurance_Verified_Today: Yes
Patient_Notified_Copay: Yes
Insurance_Notes: Copay of $50 due at visit.
```

**Result**:
- ✅ Patient got 48hr reminder SMS (Automation 1)
- ✅ Patient confirmed appointment
- ✅ Insurance verified overnight (Automation 2)
- ✅ Patient got copay notification SMS
- ✅ Staff sees green/yellow/red color-coding
- ✅ Ready for check-in!

---

## Next Steps

Once your columns are set up:
1. ✅ **Go to**: `INSURANCE_SETUP_GUIDE.md`
2. ✅ Import the two workflow JSON files
3. ✅ Configure credentials
4. ✅ Test with sample data
5. ✅ Activate workflows

---

**Questions?** See the main `INSURANCE_VERIFICATION_README.md` or `INSURANCE_SETUP_GUIDE.md`
