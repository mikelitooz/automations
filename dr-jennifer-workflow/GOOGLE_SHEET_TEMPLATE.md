# Google Sheet Template for Appointment Reminders

## Overview

This document describes the required Google Sheets structure for the SMS Appointment Reminders workflow. You'll need **two sheets (tabs)** within a single Google Spreadsheet.

---

## Sheet 1: Appointments (Main Schedule)

### Required Columns

| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| **Date** | Date (MM/DD/YYYY) | Appointment date | 01/25/2026 |
| **Time** | Time (HH:MM AM/PM) | Appointment time | 9:00 AM |
| **Patient_Name** | Text | Patient's full name | Sarah Johnson |
| **Phone** | Text | Patient phone number (E.164 format) | +15551234567 |
| **Email** | Text (Optional) | Patient email | sarah@example.com |
| **Doctor_Name** | Text | Assigned doctor | Dr. Smith |
| **Appointment_Type** | Text | Type of appointment | Annual Checkup |
| **Office_Address** | Text | Full office address | 123 Main St, City, ST 12345 |
| **Office_Phone** | Text | Office phone number | (555) 123-4567 |
| **Google_Maps_Link** | URL | Link to office location | https://maps.google.com/?q=... |
| **Calendly_Link** | URL (Optional) | Rescheduling link | https://calendly.com/drjennifer |
| **Confirmed** | Text | Confirmation status | Yes / No / (blank) |
| **Confirmed_At** | DateTime | When patient confirmed | 01/23/2026 14:30 |
| **Status** | Text | Appointment status | SCHEDULED / CANCELLED / COMPLETED |
| **48hr_Reminder_Sent** | Text | 48hr reminder flag | Yes / (blank) |
| **24hr_Reminder_Sent** | Text | 24hr reminder flag | Yes / (blank) |
| **2hr_Reminder_Sent** | Text | 2hr reminder flag | Yes / (blank) |
| **Available_For_Waitlist** | Text | Waitlist availability flag | Yes / No / (blank) |
| **Cancelled_At** | DateTime (Optional) | When appointment cancelled | 01/23/2026 16:45 |
| **Notes** | Text (Optional) | Staff notes | Patient prefers morning appts |

### Sample Data Row

```
Date: 01/27/2026
Time: 10:30 AM
Patient_Name: Maria Garcia
Phone: +15559876543
Email: maria.garcia@email.com
Doctor_Name: Dr. Chen
Appointment_Type: Follow-up Visit
Office_Address: 456 Health Plaza, Suite 200, Springfield, CA 90210
Office_Phone: (555) 987-6543
Google_Maps_Link: https://maps.google.com/?q=456+Health+Plaza+Springfield+CA
Calendly_Link: https://calendly.com/drjennifer/reschedule
Confirmed: (blank)
Confirmed_At: (blank)
Status: SCHEDULED
48hr_Reminder_Sent: (blank)
24hr_Reminder_Sent: (blank)
2hr_Reminder_Sent: (blank)
Available_For_Waitlist: (blank)
Cancelled_At: (blank)
Notes: (blank)
```

---

## Sheet 2: Waitlist

### Required Columns

| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| **Patient_Name** | Text | Patient's full name | John Davis |
| **Phone** | Text | Patient phone number (E.164 format) | +15552223333 |
| **Email** | Text (Optional) | Patient email | john@example.com |
| **Preferred_Times** | Text | Preferred appointment times | Morning slots preferred |
| **Added_To_Waitlist** | DateTime | When added to waitlist | 01/20/2026 09:15 |
| **Notified_Count** | Number | Times notified of opening | 2 |
| **Last_Notified** | DateTime | Last notification date | 01/23/2026 14:30 |
| **Priority** | Number | Waitlist priority (1=highest) | 1 |
| **Notes** | Text (Optional) | Staff notes | Flexible schedule |

### Sample Data Row

```
Patient_Name: Emily Rodriguez
Phone: +15554445555
Email: emily.r@example.com
Preferred_Times: Afternoons, any day
Added_To_Waitlist: 01/15/2026 11:00
Notified_Count: 0
Last_Notified: (blank)
Priority: 1
Notes: New patient, very eager
```

---

## Setup Instructions

### Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it: `Dr. Jennifer - Appointment Schedule`

### Step 2: Create Sheet Tabs

1. **Rename Sheet1** to `Appointments`
2. **Add a new sheet** (click + at bottom) and name it `Waitlist`

### Step 3: Set Up Columns

**For "Appointments" tab:**
1. In Row 1, add all column headers listed above (copy/paste from the table)
2. **Format the Date column**: Select column → Format → Number → Date
3. **Format the Time column**: Select column → Format → Number → Time
4. **Format DateTime columns** (Confirmed_At, Cancelled_At): Format → Number → Date time

**For "Waitlist" tab:**
1. In Row 1, add all column headers listed above
2. **Format DateTime columns**: Added_To_Waitlist, Last_Notified → Format → Number → Date time
3. **Format Priority column**: Format → Number → Number

### Step 4: Add Sample Data (Optional but Recommended)

Add 2-3 test appointments to the Appointments sheet to test the workflow:

**Example Test Row:**
```
01/28/2026 | 2:00 PM | Test Patient | +15551112222 | test@example.com | Dr. Smith | Test Appointment | 123 Main St | (555) 123-4567 | https://maps.google.com/ | https://calendly.com/test | (blank) | (blank) | SCHEDULED | (blank) | (blank) | (blank) | (blank) | (blank) | Test appointment
```

### Step 5: Share & Get Sheet ID

1. Click **Share** (top right)
2. Set to **Anyone with the link can view** (or add specific collaborators)
3. Copy the **Sheet ID** from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - Example: If URL is `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i/edit`
   - Then Sheet ID is: `1a2b3c4d5e6f7g8h9i`
4. **Save this Sheet ID** — you'll need it when configuring the n8n workflow

---

## Important Notes

### Phone Number Format
- **Must use E.164 format**: `+1` (country code) + 10-digit number
- ✅ Correct: `+15551234567`
- ❌ Wrong: `555-123-4567`, `(555) 123-4567`, `5551234567`

### Date/Time Format
- **Date**: Use your region's standard format (n8n will parse automatically)
- **Time**: Include AM/PM for clarity
- **Consistency is key**: Use the same format throughout

### Status Values
- **SCHEDULED**: Active upcoming appointment
- **CANCELLED**: Patient cancelled
- **COMPLETED**: Appointment happened (past date)
- **NO-SHOW**: Patient didn't show up

### Reminder Tracking
- Leave blank initially
- Workflow automatically updates to "Yes" when reminder is sent
- Used to prevent duplicate reminders

### Confirmed Column
- Leave blank until patient confirms
- Workflow sets to "Yes" when patient replies "1" or "CONFIRM"
- Used to skip 24hr reminder for confirmed patients

---

## Data Management Best Practices

### Daily Maintenance
1. **Archive completed appointments** weekly (move to separate "Archive" sheet)
2. **Clear old reminders** for past dates to keep sheet clean
3. **Review waitlist priority** regularly

### Weekly Tasks
1. Import next week's appointments from your EMR/scheduling system
2. Verify all phone numbers are in E.164 format
3. Check for duplicate appointments

### Monthly Cleanup
1. Export to backup (File → Download → Excel or CSV)
2. Remove test data
3. Update office info if changed (address, phone, Calendly link)

---

## Troubleshooting

### Workflow not sending reminders?
- ✅ Check Date/Time format is consistent
- ✅ Verify phone numbers are in E.164 format (+1XXXXXXXXXX)
- ✅ Ensure "Status" column says "SCHEDULED"
- ✅ Check reminder flags are blank (not already sent)

### Duplicate reminders?
- Check if reminder flag columns got cleared
- Verify workflow is updating the sheet after sending

### Patient responses not working?
- Confirm Phone number matches exactly between sheets
- Check if patient exists in Appointments sheet

---

## Example Formulas (Optional Enhancements)

### Auto-calculate "Hours Until Appointment"
```excel
=IF(A2="","", (A2+B2-NOW())*24)
```
*Place in a helper column to see hours remaining*

### Flag No-Response Patients (48hr+ ago)
```excel
=IF(AND(Q2="Yes", M2="", NOW()>A2+B2-1), "⚠️ NO RESPONSE", "")
```
*Highlights patients who didn't confirm after 48hr reminder*

### Auto-set Status for Past Appointments
```excel
=IF(A2+B2<NOW(), "COMPLETED", "SCHEDULED")
```
*Automatically marks past appointments as completed*

---

## Next Steps

Once your Google Sheet is set up:
1. ✅ Copy the Sheet ID
2. ✅ Move to **SETUP_GUIDE.md** to connect it to n8n
3. ✅ Configure Twilio credentials
4. ✅ Test with sample data

---

## Questions?

Common issues and solutions are in the **SETUP_GUIDE.md** troubleshooting section.
