# Appointment Reminder Workflow - Quick Start Guide

## TL;DR - Get Started in 10 Minutes

This guide will get your fixed appointment reminder workflow up and running quickly.

---

## Prerequisites

Before you start:
- ✅ n8n account at https://izzydev.app.n8n.cloud/
- ✅ Google Sheets with "Dr. Jennifer Clinic Appointments" already set up
- ✅ Gmail account connected to n8n
- ✅ Cal.com integration already populating appointments

---

## Step 1: Import Workflow (2 minutes)

1. **Open n8n Dashboard:**
   - Go to https://izzydev.app.n8n.cloud/
   - Click **Workflows** in left sidebar

2. **Import the Fixed Workflow:**
   - Click **Import from File** button
   - Select: `my_build_FIXED.json`
   - Workflow name: "Appointment Reminders - FIXED"

3. **Verify Import:**
   - Should see ~18 nodes on canvas
   - Check for: Schedule Trigger, Read Appointments, Calculate Reminders, Route by Reminder Type

---

## Step 2: Connect Credentials (3 minutes)

The workflow will show red warning icons on nodes that need credentials.

### Google Sheets Credentials

**Nodes that need connection:**
- Read Appointments
- Update 48hr Flag
- Update 24hr Flag
- Update 2hr Flag (Confirmed)
- Update Status to Cancelled
- Update Staff Alert Flag

**How to connect:**
1. Click any node with red warning
2. Click **Credentials** dropdown
3. Select: "Google Sheets account" (should already exist)
4. If not, click **Create New** → Follow OAuth2 flow
5. Repeat for all sheet nodes (or n8n will auto-assign)

### Gmail Credentials

**Nodes that need connection:**
- 48hr Reminder Email
- 24hr Urgent Email (Not Confirmed)
- 24hr Simple Reminder (Confirmed)
- 2hr Final Reminder (Confirmed)
- 2hr Auto-Cancel Email (Not Confirmed)
- Staff Alert Email

**How to connect:**
1. Click any Gmail node
2. Select Gmail OAuth2 credential
3. n8n should auto-assign to all Gmail nodes

---

## Step 3: Verify Google Sheet Structure (2 minutes)

Your "Dr. Jennifer Clinic Appointments" sheet must have these columns:

**Required Columns:**
- Date
- Time
- Patient Name
- Patient Phone
- Patient Email
- Doctor Name
- Appointment Type
- Status (values: Pending, Confirmed, Cancelled, Rescheduled)
- 48hr Reminder Sent (checkbox)
- 24hr Reminder Sent (checkbox)
- 2hr Reminder Sent (checkbox)
- Staff_Alerted (checkbox - optional, can add)

**Check your sheet:**
1. Open: https://docs.google.com/spreadsheets/d/1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s/
2. Go to "Appointments" tab
3. Verify column names match EXACTLY (including spaces)

---

## Step 4: Update Staff Email (1 minute)

The workflow currently sends staff alerts to `debbiehills47@gmail.com`.

**To change:**
1. Find node: "Staff Alert Email"
2. Click to open
3. Change `sendTo` parameter to your staff email
4. Click **Save**

---

## Step 5: Test with Manual Execution (5 minutes)

**Create Test Appointments:**

Add these 4 rows to your Google Sheet:

| Date | Time | Patient Name | Patient Email | Doctor Name | Appointment Type | Status | 48hr Reminder Sent | 24hr Reminder Sent | 2hr Reminder Sent |
|------|------|--------------|---------------|-------------|------------------|--------|-------------------|-------------------|------------------|
| [48h from now] | 02:15 PM | Test Patient 48h | your_email@gmail.com | Dr. Jennifer | Follow-up | Pending | FALSE | FALSE | FALSE |
| [24h from now] | 03:30 PM | Test Patient 24h Pending | your_email@gmail.com | Dr. Jennifer | New Patient Visit | Pending | TRUE | FALSE | FALSE |
| [24h from now] | 04:00 PM | Test Patient 24h Confirmed | your_email@gmail.com | Dr. Jennifer | Follow-up | Confirmed | TRUE | FALSE | FALSE |
| [2h from now] | [current time + 2h] | Test Patient 2h | your_email@gmail.com | Dr. Jennifer | Consultation | Confirmed | TRUE | TRUE | FALSE |

**Calculate Times:**
- 48h from now: Today's date + 2 days, same time
- 24h from now: Tomorrow's date, any time
- 2h from now: Today's date, current time + 2 hours

**Run Workflow:**
1. In n8n, click **Execute Workflow** button (bottom center)
2. Wait 5-10 seconds for execution to complete
3. Click on "Calculate Reminders" node → Check output
   - Should see: "Reminders to send: 4"

**Check Results:**
1. **Your Email Inbox:**
   - Should receive 4 emails (one from each test appointment)
   - Check subjects match expected templates

2. **Google Sheet:**
   - Open sheet and check your test rows
   - Checkbox flags should now be TRUE
   - Status for 48h/24h tests should remain "Pending"/"Confirmed"

---

## Step 6: Verify No Duplicates (2 minutes)

**Run workflow again immediately:**
1. Click **Execute Workflow** again
2. Check "Calculate Reminders" output
   - Should see: "Reminders to send: 0" (all flags already TRUE)
   - Or "Skipped: 4 appointments"

**This confirms:**
- ✅ Flags are being saved correctly
- ✅ No duplicate reminders sent

---

## Step 7: Activate Workflow (30 seconds)

Once manual tests pass:

1. **Toggle Active Switch:**
   - Top-right corner of workflow canvas
   - Click toggle to **ON** (blue)

2. **Confirm Activation:**
   - Workflow will now run automatically every 1 hour
   - Schedule Trigger will execute at: :00, :00, :00 (every hour on the hour)

---

## Step 8: Monitor First 24 Hours

### Check Execution History:
1. Click **Executions** in left sidebar
2. View recent runs
3. Check for:
   - ✅ Green checkmarks (successful)
   - ⚠️ Yellow warnings (review logs)
   - ❌ Red errors (requires fixing)

### Expected Behavior:
- **Every hour:** Workflow checks all appointments
- **First few runs:** May send no emails (no appointments in timing windows)
- **When appointment enters window:** Reminder sent + flag updated
- **Next hour:** Same appointment skipped (flag already TRUE)

---

## Troubleshooting Common Issues

### ❌ "No reminders to send" but appointments exist

**Check:**
1. Appointment timing: Is it 47-48h, 23-24h, or 1.5-2.5h away?
2. Status field: Is it "Pending" or "Confirmed" (not "Cancelled")?
3. Flags: Are reminder checkboxes already TRUE?

---

### ❌ Duplicate emails being sent

**Check:**
1. Only ONE workflow is active (deactivate old `my_build.json`)
2. Sheet ID is correct (same for read and update nodes)
3. Flags are updating (check Google Sheet after execution)

---

### ❌ "Invalid date/time" errors in logs

**Check:**
1. Time format in Google Sheet: Must be "HH:MM AM/PM" (e.g., "02:15 PM")
2. Date format: "MM/DD/YYYY" or "YYYY-MM-DD"
3. No empty Date or Time cells

---

### ❌ Gmail nodes failing

**Check:**
1. Gmail OAuth2 credentials are connected
2. Credentials haven't expired (reconnect if needed)
3. "From" email matches Gmail account

---

### ❌ Google Sheets nodes failing

**Check:**
1. Sheet ID: `1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s`
2. Sheet name: "Appointments" (case-sensitive)
3. OAuth2 credentials connected
4. Google account has edit permissions on sheet

---

## What Happens Next?

### Patient Receives 48hr Reminder:
- Email with "Reply 1=Confirm, 2=Cancel, 3=Reschedule"
- **TODO (Future):** Response Handler workflow processes reply

### Patient Receives 24hr Reminder:
- **If Pending:** Urgent email with auto-cancel warning
- **If Confirmed:** Simple friendly reminder

### Patient Receives 2hr Reminder:
- **If Confirmed:** Final reminder
- **If Pending:** Status changed to "Cancelled" + cancellation email sent
  - **TODO (Future):** Waitlist workflow notifies waitlist patients

### Staff Alert:
- Sent within 15 minutes of appointment start time
- Includes all patient details

---

## Next Steps (Future Workflows)

### 1. Build Response Handler (Priority: HIGH)
- **File:** `RESPONSE_HANDLER_TODO.md`
- **Purpose:** Process patient email replies (confirm/cancel/reschedule)
- **Estimated Time:** 4-6 hours

### 2. Build Waitlist Integration (Priority: HIGH)
- **File:** `WAITLIST_INTEGRATION_TODO.md`
- **Purpose:** Notify waitlist when appointments cancelled
- **Estimated Time:** 6-8 hours

---

## Production Readiness Checklist

Before relying on this workflow in production:

- [ ] All test scenarios passed (see `WORKFLOW_TESTING_GUIDE.md`)
- [ ] No duplicate emails observed
- [ ] Timing windows working correctly (48h, 24h, 2h)
- [ ] Staff email updated to correct address
- [ ] Workflow monitored for 24 hours with real appointments
- [ ] Execution history shows no errors
- [ ] Team trained on Google Sheet column meanings
- [ ] Old `my_build.json` workflow deactivated

---

## Support & Resources

**Documentation:**
- 📋 [WORKFLOW_TESTING_GUIDE.md](./WORKFLOW_TESTING_GUIDE.md) - Comprehensive testing
- 📊 [WORKFLOW_FIXES_SUMMARY.md](./WORKFLOW_FIXES_SUMMARY.md) - What was fixed
- 🔮 [RESPONSE_HANDLER_TODO.md](./RESPONSE_HANDLER_TODO.md) - Future workflow
- 🎯 [WAITLIST_INTEGRATION_TODO.md](./WAITLIST_INTEGRATION_TODO.md) - Future workflow

**Need Help?**
1. Check execution logs in n8n
2. Review this quick start guide
3. Consult troubleshooting section above
4. Review comprehensive testing guide for specific scenarios

---

## Success!

If you've completed all 8 steps:
- ✅ Workflow is running every hour
- ✅ Reminders being sent at correct times
- ✅ No duplicate emails
- ✅ Flags updating correctly in Google Sheet

**You're all set!** 🎉

Your appointment reminder system is now operational and ready to handle patient notifications automatically.

---

**Last Updated:** January 2025
**Version:** 1.0
**Estimated Setup Time:** 15 minutes total
