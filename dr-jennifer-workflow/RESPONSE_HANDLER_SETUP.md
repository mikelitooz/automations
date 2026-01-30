# Response Handler Workflow - Setup & Testing Guide

## Overview
This workflow processes patient email replies to appointment reminders using a **hybrid approach**:
- **90% of responses:** Pattern matching for "1", "2", "3" (instant, free)
- **10% of responses:** AI classification for natural language (Claude Haiku, ~$1-2/month)

---

## Prerequisites

### 1. Google Sheet Columns (Optional but Recommended)

Add these columns to "Dr. Jennifer Clinic Appointments" sheet for better tracking:

| Column Name | Type | Purpose |
|------------|------|---------|
| Confirmed_At | Date/Time | Timestamp when patient confirmed |
| Confirmed_Via | Text | "Email", "Cal.com", or "Phone" |
| Cancelled_At | Date/Time | Timestamp when cancelled |
| Cancelled_Via | Text | "Email", "Cal.com", or "Patient" |
| Cancellation_Reason | Text | Why appointment was cancelled |
| Rescheduled_At | Date/Time | Timestamp when rescheduled |
| Rescheduled_Via | Text | "Email", "Cal.com", or "Phone" |

**Note:** Workflow will work without these columns, but you'll lose tracking data.

### 2. Claude API Key

1. Get API key from: https://console.anthropic.com/
2. In n8n, go to **Settings** → **Environment Variables**
3. Add:
   ```
   Name: CLAUDE_API_KEY
   Value: sk-ant-api03-...your-key...
   ```
4. Save and restart n8n if needed

---

## Step 1: Import Workflow (2 minutes)

1. **Open n8n Dashboard:**
   - Go to https://izzydev.app.n8n.cloud/

2. **Import Workflow:**
   - Click **Workflows** → **Import from File**
   - Select: `response-handler-workflow.json`
   - Workflow name: "Response Handler - Patient Email Replies"

3. **Verify Import:**
   - Should see ~20 nodes on canvas
   - Check for: Gmail Trigger, Lookup Patient, Pattern Matching, AI Classification, Route by Response

---

## Step 2: Connect Credentials (3 minutes)

### Gmail Trigger
1. Click "Gmail Trigger" node
2. Select Gmail OAuth2 credential (should already exist from reminder workflow)
3. If not, create new → Follow OAuth2 flow

### Google Sheets Nodes
Nodes needing credentials:
- Lookup Patient
- Update Status: Confirmed
- Update Status: Cancelled
- Update Status: Rescheduled

**Connect all:**
1. Click any sheet node
2. Select "Google Sheets account" credential
3. n8n should auto-assign to all sheet nodes

### Gmail Send Nodes
All Gmail nodes should auto-connect to same credential.

---

## Step 3: Configure Settings (5 minutes)

### 1. Update Staff Email
Currently hardcoded to `debbiehills47@gmail.com`. To change:

**Nodes to update:**
- "Staff: Cancellation Alert"
- "Staff: Reschedule Alert"

**How:**
1. Click node
2. Change `sendTo` parameter
3. Or set environment variable: `STAFF_EMAIL`

### 2. Verify Sheet ID
All Google Sheets nodes should use:
- **Document ID:** `1kl76KR3-QAYtL4s5dl-r8UCiS7bAFv0PNyfksAdvt8s`
- **Sheet Name:** "Appointments"

### 3. Waitlist Webhook URL
In "Trigger Waitlist" node:
- **URL:** `https://izzydev.app.n8n.cloud/webhook/waitlist-notification`
- ⚠️ Update this when waitlist workflow is built

### 4. Cal.com Booking URL
Verify in all reschedule emails:
- **URL:** `https://cal.com/izzydevbuilds/appointment-with-dr.-jennifer`

---

## Step 4: Test Pattern Matching (10 minutes)

### Test 1: Confirm with "1"

**Setup:**
1. Create test appointment in Google Sheet:
   - Date: Tomorrow
   - Time: 02:00 PM
   - Patient Name: Test Patient 1
   - Patient Email: your_email@gmail.com
   - Status: Pending

2. Send test email:
   - **From:** your_email@gmail.com (must match sheet)
   - **To:** Your clinic Gmail
   - **Subject:** Re: Appointment Reminder - Dr. Jennifer
   - **Body:** 1

**Wait 1-2 minutes** (Gmail Trigger polls every minute)

**Expected Results:**
- ✅ Execution appears in n8n history
- ✅ Status in Google Sheet = "Confirmed"
- ✅ Confirmed_At timestamp set
- ✅ Confirmed_Via = "Email"
- ✅ You receive confirmation email

**Verify in n8n:**
1. Click execution in history
2. Check "Pattern Matching" node output:
   - `responseType: "confirm"`
   - `classificationMethod: "pattern_matching"`
   - `aiUsed: false`

---

### Test 2: Cancel with "2"

**Send email:**
- **Subject:** Re: Appointment Reminder - Dr. Jennifer
- **Body:** 2

**Expected Results:**
- ✅ Status = "Cancelled"
- ✅ Cancelled_At timestamp
- ✅ Cancelled_Via = "Email"
- ✅ Patient receives cancellation email
- ✅ Staff receives cancellation alert
- ✅ Waitlist webhook triggered (will 404 until waitlist workflow built)

---

### Test 3: Reschedule with "3"

**Send email:**
- **Subject:** Re: Appointment Reminder - Dr. Jennifer
- **Body:** 3

**Expected Results:**
- ✅ Status = "Rescheduled"
- ✅ Rescheduled_At timestamp
- ✅ Patient receives Cal.com link
- ✅ Staff receives reschedule alert
- ❌ No waitlist trigger

---

## Step 5: Test AI Classification (10 minutes)

### Test 4: Natural Language Confirm

**Send email:**
- **Body:** Yes, I confirm my appointment

**Expected Results:**
- ✅ Execution shows AI node was called
- ✅ AI response: "CONFIRM"
- ✅ Status = "Confirmed"
- ✅ `classificationMethod: "ai_claude_haiku"`
- ✅ `aiUsed: true`

**Check cost:**
- Execution log should show: ~$0.0001 cost

---

### Test 5: Natural Language Cancel

**Send email:**
- **Body:** I'm sorry but I need to cancel, my child is sick

**Expected Results:**
- ✅ AI classifies as: "CANCEL"
- ✅ Status = "Cancelled"
- ✅ Staff notified
- ✅ Waitlist triggered

---

### Test 6: Natural Language Reschedule

**Send email:**
- **Body:** Can we reschedule for next week?

**Expected Results:**
- ✅ AI classifies as: "RESCHEDULE"
- ✅ Status = "Rescheduled"
- ✅ Cal.com link sent

---

### Test 7: Ambiguous Response (Unknown)

**Send email:**
- **Body:** Maybe, I'm not sure yet

**Expected Results:**
- ✅ AI classifies as: "UNKNOWN"
- ✅ Clarification email sent
- ❌ No status change in sheet

---

## Step 6: Test Edge Cases (10 minutes)

### Test 8: Patient Not Found

**Send email from unknown address:**
- **From:** unknown_patient@gmail.com
- **Body:** 1

**Expected Results:**
- ✅ "Patient Not Found" email sent
- ✅ No sheet updates
- ✅ Execution log: "patient_not_found"

---

### Test 9: Past Appointment

**Create appointment in the past:**
- Date: Yesterday
- Time: 02:00 PM

**Send email:**
- **Body:** 1

**Expected Results:**
- ✅ "Appointment Already Occurred" email sent
- ✅ No status change
- ✅ Execution log: "past_appointment"

---

### Test 10: Typos

**Send email:**
- **Body:** confrim (typo)

**Expected Results:**
- ✅ AI classifies as: "CONFIRM"
- ✅ Status = "Confirmed"
- ✅ AI handles typo correctly

---

## Step 7: Activate Workflow (30 seconds)

Once all tests pass:

1. **Toggle Active Switch:**
   - Top-right corner: Click to **ON** (blue)

2. **Confirm Settings:**
   - Gmail Trigger: Poll every 1 minute
   - Workflow runs automatically when patient replies

---

## Monitoring & Analytics

### Check Execution History
1. Click **Executions** in left sidebar
2. View recent runs
3. Look for:
   - ✅ Green checkmarks (successful)
   - Pattern matched vs AI classified ratio

### Track AI Usage
In execution logs, check for:
```
📊 Pattern Matching Summary:
  - Processed: 10 emails
  - Pattern matched: 9 (90%)
  - Needs AI: 1 (10%)
```

### Expected Monthly Stats (1000 reminders)
- **Total responses:** ~300 (30% response rate)
- **Pattern matched:** ~270 (90%)
- **AI classified:** ~30 (10%)
- **AI cost:** ~$3-5/month
- **Total time saved:** ~5-10 hours/month

---

## Troubleshooting

### ❌ Gmail Trigger Not Firing

**Check:**
1. Gmail OAuth2 credential connected and not expired
2. Poll interval set to "Every Minute"
3. Filter includes "Re: Appointment Reminder"
4. Send test email with correct subject format

**Fix:**
- Reconnect Gmail credential
- Check spam folder for reminder emails
- Verify patient is replying (not composing new email)

---

### ❌ Patient Not Found

**Error:** "Patient email not found in appointments"

**Check:**
1. Email "from" address matches exactly in Google Sheet
2. Sheet name is "Appointments" (case-sensitive)
3. Column name is "Patient Email" (with space)

**Fix:**
- Verify patient email in sheet
- Check for typos or extra spaces

---

### ❌ AI Classification Failing

**Error:** "Claude API error" or "ai_error"

**Check:**
1. `CLAUDE_API_KEY` environment variable set correctly
2. API key is valid and not expired
3. Check API quota: https://console.anthropic.com/

**Fallback:**
- Workflow sends clarification email to patient
- Patient can retry with "1", "2", or "3"

---

### ❌ Status Not Updating

**Check:**
1. Google Sheets credentials connected
2. Matching columns correct: ["Patient Email", "Date", "Time"]
3. Patient has appointment matching those fields

**Debug:**
1. Click execution → Check "Lookup Patient" output
2. Verify patient data returned
3. Check "Update Status" node for errors

---

### ❌ Duplicate Responses

**Scenario:** Patient replies multiple times

**Behavior:**
- ✅ Latest response wins (updates Status each time)
- ✅ Patient receives new email for each response
- ⚠️ Staff may receive multiple alerts

**Solution:**
- Add logic to check current Status before processing
- Or: Add cooldown period (ignore responses within 5 minutes of last)

---

## Integration with Other Workflows

### With Reminder Workflow (my_build_FIXED.json)
- ✅ Both workflows use same Google Sheet
- ✅ Reminder workflow checks Status field
- ✅ If Status = "Confirmed", 24hr reminder is simple (not urgent)
- ✅ If Status = "Cancelled", reminders stop

### With Waitlist Workflow (to be built)
- ✅ This workflow triggers waitlist via HTTP POST
- ✅ Passes appointment details for bulk notification
- ⚠️ Waitlist webhook will 404 until workflow is built (this is OK)

### With Cal.com Event Handler (to be built)
- Both workflows update same Status field
- Both notify same staff email
- Both trigger same waitlist webhook
- No conflicts

---

## Performance Expectations

### Response Time
- **Pattern matched:** <1 second processing
- **AI classified:** 1-2 seconds processing
- **Total:** Patient receives email within 1-3 minutes of replying

### Accuracy
- **Pattern matching:** 100% accuracy (exact match)
- **AI classification:** 98%+ accuracy (handles typos, natural language)
- **Unknown rate:** <2% (ambiguous responses)

### Cost
- **Pattern matched:** $0
- **AI classified:** ~$0.0001 per email
- **Monthly (1000 reminders, 30% response, 10% AI):** ~$3-5

---

## Production Checklist

Before relying on this workflow:

- [ ] All 10 test scenarios passed
- [ ] Claude API key configured and tested
- [ ] Staff email updated to correct address
- [ ] Cal.com booking URL verified
- [ ] Google Sheet columns added (optional tracking)
- [ ] Workflow activated (toggle ON)
- [ ] Monitored for 48 hours with real patients
- [ ] AI usage and cost tracked
- [ ] Team trained on new confirmation process

---

## Next Steps

### 1. Monitor First Week
- Check execution history daily
- Track pattern match vs AI ratio
- Verify Status updates working correctly
- Collect patient feedback

### 2. Build Waitlist Workflow
- ✅ This workflow already triggers waitlist webhook
- ⏳ Need to build waitlist notification workflow
- See: `WAITLIST_INTEGRATION_TODO.md`

### 3. Build Cal.com Event Handler
- ✅ Handle Cal.com `BOOKING_CANCELLED` webhook
- ✅ Handle Cal.com `BOOKING_RESCHEDULED` webhook
- Same logic as email responses, different trigger

---

## Support & Resources

**Documentation:**
- 📋 [RESPONSE_HANDLER_TODO.md](./RESPONSE_HANDLER_TODO.md) - Original specification
- 🔮 [WAITLIST_INTEGRATION_TODO.md](./WAITLIST_INTEGRATION_TODO.md) - Next workflow to build
- 📊 [WORKFLOW_FIXES_SUMMARY.md](./WORKFLOW_FIXES_SUMMARY.md) - Reminder workflow fixes

**Need Help?**
1. Check execution logs in n8n (click specific execution)
2. Review this setup guide troubleshooting section
3. Test with your own email first before patient testing

---

## Success Metrics

After 1 week of operation:

- ✅ 95%+ of "1/2/3" responses classified correctly
- ✅ 98%+ of natural language responses classified correctly
- ✅ <2% "unknown" responses requiring clarification
- ✅ Status field updated within 2 minutes of patient reply
- ✅ Staff notified of all cancellations/reschedules
- ✅ No duplicate processing or lost responses
- ✅ AI cost under $10/month

---

**Last Updated:** January 2025
**Version:** 1.0
**Estimated Setup Time:** 30 minutes total
