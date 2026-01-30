# Waitlist System - Quick Start Guide

## ✅ What's Complete

1. **Google Form** with 3 fields (You created this ✓)
   - Full Name
   - Phone Number
   - Email Address

2. **Google Sheets "Waitlist" tab** (You created this ✓)
   - Auto-populated from Google Form

3. **n8n Workflows** (Ready to import ✓)
   - `waitlist-signup-confirmation-workflow.json` - Sends confirmation email
   - `waitlist-notification-workflow.json` - Alerts patients when slots open

4. **Documentation** (Complete ✓)
   - `WAITLIST_FORM_SETUP_GUIDE.md` - Full setup instructions
   - `WAITLIST_FORM_HIPAA_COMPLIANCE.md` - HIPAA requirements
   - `WAITLIST_INTEGRATION_TODO.md` - Technical specification

---

## 🚀 Next Steps (5 Minutes)

### Step 1: Import Confirmation Workflow

```
1. Go to https://izzydev.app.n8n.cloud/
2. Click "+ Add workflow"
3. Import: waitlist-signup-confirmation-workflow.json
4. Click "Google Sheets Trigger: New Waitlist Entry" node
5. Update Document ID to YOUR sheet
6. Update Sheet Name to "Waitlist" (or your tab name)
7. Click "Gmail: Send Confirmation" node
8. Connect Gmail credential
9. Update phone number in email template
10. Activate workflow (toggle top-right)
```

### Step 2: Update Existing Waitlist Notification Workflow

The `waitlist-notification-workflow.json` has been updated to use your exact column names:
- **Full Name** (was: "Patient Name")
- **Email Address** (was: "Patient Email")
- **Phone Number** (was: "Patient Phone")

```
1. Open existing "Waitlist Notification - First YES Wins" in n8n
2. Replace with updated: waitlist-notification-workflow.json
3. OR manually update the code nodes to use correct column names
4. Verify "Read Waitlist" node points to correct sheet tab
```

### Step 3: Test End-to-End

```
1. Fill out your Google Form with YOUR email
2. Check Google Sheets → new row appears immediately
3. Wait 1-2 minutes
4. Check email → confirmation received (if workflow active)
5. Verify all data correct
```

---

## 📊 Your Google Form Column Names

Based on your test submission, your form uses these exact column names:

```json
{
  "Timestamp": "03/11/2025 08:54:07",
  "Full Name": "Robert T Kearney",
  "Phone Number": "509-432-7356",
  "Email Address": "Robert@Kearney.com"
}
```

**All workflows have been updated to match these exact names!**

---

## 🎯 How It Works

### Patient Journey

```
1. Patient fills Google Form
   ↓
2. Auto-appends to "Waitlist" sheet tab
   ↓
3. Google Sheets Trigger detects new row (polls every 1 min)
   ↓
4. Confirmation email sent automatically
   ↓
5. Patient waits...
   ↓
6. Appointment cancelled (from Cal.com)
   ↓
7. Waitlist Notification Workflow triggered
   ↓
8. All waitlist patients receive email with Cal.com booking link
   ↓
9. First to book gets the appointment!
```

### Email Examples

**Confirmation Email** (from signup):
```
Subject: ✅ You're on the Waitlist - Dr. Jennifer's Clinic

Hi Robert,

Thank you for joining our appointment waitlist!

📋 Your Waitlist Details:
  • Name: Robert T Kearney
  • Phone: 509-432-7356
  • Email: Robert@Kearney.com
  • Joined: Monday, March 11, 2025
  • Current Position: #1

🔔 What Happens Next?
When an appointment slot becomes available...
[full email in workflow]
```

**Slot Available Email** (from cancellation):
```
Subject: 🚨 Appointment Slot Available - Book Now!

Hi Waitlist Patients,

An appointment has been CANCELLED and this slot is now available!

📅 Monday, November 4
⏰ 02:15 PM
👨‍⚕️ With Dr. Jennifer
📋 Consultation

⚡ FIRST TO BOOK GETS THE APPOINTMENT ⚡

Click here to claim this slot:
🔗 https://cal.com/izzydevbuilds/appointment-with-dr.-jennifer?slot=2025-11-04T14:15:00.000Z

[full email in workflow]
```

---

## 🔧 Troubleshooting

### Issue: Confirmation email not received

**Fix**:
1. Verify workflow is ACTIVE (green toggle)
2. Check Google Sheets Trigger polling interval (default: 1 minute)
3. Check Gmail credential is connected
4. Check spam folder
5. Review n8n execution logs

### Issue: Wrong column names error

**Fix**:
- All workflows have been updated to use:
  - `Full Name`
  - `Email Address`
  - `Phone Number`
- If you change your Google Form field names, update workflows accordingly

### Issue: Waitlist notification not sending

**Fix**:
1. Check "Waitlist Notification" workflow is ACTIVE
2. Verify webhook URL is correct in Cal.com workflow
3. Test manually with curl/Postman
4. Check "Read Waitlist" node sheet tab name

---

## 📁 File Reference

| File | Purpose |
|------|---------|
| **waitlist-signup-confirmation-workflow.json** | Sends confirmation email when patient joins |
| **waitlist-notification-workflow.json** | Alerts patients when slots open (UPDATED) |
| **WAITLIST_FORM_SETUP_GUIDE.md** | Complete setup instructions (12 parts) |
| **WAITLIST_FORM_HIPAA_COMPLIANCE.md** | HIPAA requirements and compliance |
| **WAITLIST_INTEGRATION_TODO.md** | Original technical specification |
| **WAITLIST_QUICK_START.md** | This file |

---

## ✅ Checklist Before Launch

- [ ] Google Form created with 3 fields
- [ ] Form linked to Google Sheets "Waitlist" tab
- [ ] Test form submission → row appears in sheet
- [ ] Confirmation workflow imported to n8n
- [ ] Confirmation workflow activated
- [ ] Gmail credential connected
- [ ] Notification workflow updated with correct column names
- [ ] Notification workflow activated
- [ ] Test confirmation email received
- [ ] Test slot notification (manual trigger)
- [ ] HIPAA compliance verified (BAA signed)

---

## 💰 Cost Summary

**Total Monthly Cost**: $0

Assuming you already have:
- Google Workspace (required for HIPAA): $6-18/month
- n8n Cloud: Included in existing plan
- Gmail API: Free
- Google Sheets API: Free

---

## 📞 Support

**Documentation**:
- Full setup: [WAITLIST_FORM_SETUP_GUIDE.md](WAITLIST_FORM_SETUP_GUIDE.md)
- HIPAA: [WAITLIST_FORM_HIPAA_COMPLIANCE.md](WAITLIST_FORM_HIPAA_COMPLIANCE.md)

**Resources**:
- n8n: https://docs.n8n.io
- Google Forms: https://support.google.com/docs/answer/6281888

---

**Ready to test?** Import the confirmation workflow and submit a test form!
