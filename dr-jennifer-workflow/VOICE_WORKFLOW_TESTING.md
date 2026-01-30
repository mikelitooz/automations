# Voice Call Escalation - Testing Guide

**Workflow:** `voice-call-escalation-workflow.json`
**Purpose:** Test all scenarios for the 20-hour voice call escalation system

---

## Testing Philosophy

This workflow has **TWO separate execution paths**:
1. **Call Initiation Path** - Schedule trigger → Filter → Make calls
2. **Results Processing Path** - Webhook trigger → Parse results → Update sheet

**You must test BOTH paths** to ensure the complete flow works.

---

## Pre-Testing Checklist

Before running any tests:

- [ ] Vapi.ai account created
- [ ] API key configured in n8n (`VAPI_API_KEY`)
- [ ] Phone number purchased and ID saved (`VAPI_PHONE_NUMBER_ID`)
- [ ] Webhook URL configured in Vapi dashboard
- [ ] Google Sheet has `20hr_Voice_Call_Made` column
- [ ] Workflow imported to n8n
- [ ] All credentials reconnected
- [ ] Personal phone number ready for testing

---

## Test Configuration: Minute-Based Timing

**Why?** Testing with actual 20-hour delays is impractical. Use minute-based intervals instead.

### Production vs. Testing Timing

| Event | Production | Testing |
|-------|-----------|----------|
| 48hr reminder | 48 hours before | 3 minutes before |
| 24hr reminder | 24 hours before | 2 minutes before |
| **20hr voice call** | **20 hours before** | **1.5 minutes before** |
| 2hr reminder | 2 hours before | 0.5 minutes before |

### How to Enable Test Mode

**Edit "Filter for 20hr Unconfirmed" Code Node:**

Replace this production code:
```javascript
// Production: 19.5 to 20.5 hours before appointment
const shouldCall = (
  sent24hr === true &&
  status === "Pending" &&
  voiceCallMade !== true &&
  hoursUntil >= 19.5 &&
  hoursUntil <= 20.5
);
```

With this testing code:
```javascript
// Testing: 1.25 to 1.75 minutes before appointment
const minutesUntil = hoursUntil * 60;
const shouldCall = (
  sent24hr === true &&
  status === "Pending" &&
  voiceCallMade !== true &&
  minutesUntil >= 1.25 &&
  minutesUntil <= 1.75
);
```

**IMPORTANT:** Remember to switch back to production timing after testing!

---

## Test Scenarios

### Test 1: Happy Path - Patient Confirms

**Goal:** Patient answers call and confirms attendance

#### Setup
1. **Create test appointment in Google Sheet:**
   ```
   Appointment_Uid: TEST-001
   Date: [Today's date]
   Time: [1.5 minutes from now]
   ISO_Time_Format: [Today + 1.5 minutes in ISO format]
   Patient_Name: Your Name
   Patient_Phone: +1XXXXXXXXXX (YOUR phone)
   Patient_Email: your-email@gmail.com
   Status: Pending
   24hr_Reminder_Sent: TRUE
   20hr_Voice_Call_Made: FALSE
   ```

2. **Calculate ISO_Time_Format:**
   ```javascript
   // In browser console:
   const now = new Date();
   now.setMinutes(now.getMinutes() + 1.5);
   console.log(now.toISOString());
   // Copy result to ISO_Time_Format column
   ```

#### Execute
1. **Activate workflow** in n8n
2. **Wait 30 seconds** (for schedule trigger to run)
3. **Answer your phone** when it rings (should be within 1-2 minutes)
4. **When AI asks about confirmation, respond:**
   - "Yes, I'll be there"
   - OR "Confirmed"
   - OR "I'm coming"

#### Expected Results
✅ **Call Initiation:**
- Execution log shows "Filter for 20hr Unconfirmed" found 1 appointment
- Execution log shows "Initiate Vapi Call" succeeded
- Execution log shows "Mark Call Initiated" updated sheet
- Google Sheet shows `20hr_Voice_Call_Made = TRUE`

✅ **Call Results (after call ends):**
- New execution appears for webhook trigger
- Execution log shows "Parse Call Results" detected "Confirmed"
- Execution log shows "Route by Action" took "confirmed" path
- Google Sheet updated:
  - `Status = "Confirmed"`
  - `Voice_Call_Agent_Action_Taken = "Confirmed"`
  - `Voice_Call_Agent_Call_Summary = [transcript]`
  - `Confirmed_At = [timestamp]`
- Slack notification sent (if configured)

#### Troubleshooting
❌ **No call received:**
- Check execution logs: Did filter find the appointment?
- Verify phone number format: `+15551234567` (E.164 format)
- Check Vapi dashboard for call logs
- Verify `VAPI_PHONE_NUMBER_ID` is correct

❌ **Call received but no webhook:**
- Check Vapi webhook configuration
- Verify webhook URL is correct
- Check n8n executions for webhook trigger
- Test webhook manually (see below)

---

### Test 2: Patient Requests Cancellation/Reschedule

**Goal:** Patient wants to cancel or reschedule

#### Setup
Same as Test 1, but use different `Appointment_Uid: TEST-002`

#### Execute
1. Answer call
2. **When AI asks about confirmation, respond:**
   - "I need to cancel"
   - OR "I can't make it"
   - OR "Can I reschedule?"

#### Expected Results
✅ **Call Results:**
- "Parse Call Results" detected "Sent Cal.com Link"
- "Route by Action" took "cancel_reschedule" path
- Email sent with Cal.com link
- Google Sheet updated:
  - `Status` remains "Pending" (will change when they reschedule)
  - `Voice_Call_Agent_Action_Taken = "Sent Cal.com Link"`
  - `Voice_Call_Agent_Call_Summary = [transcript]`
- Email received with Cal.com reschedule link

---

### Test 3: Voicemail

**Goal:** Test voicemail handling

#### Setup
Same as Test 1, but use `Appointment_Uid: TEST-003`

#### Execute
1. **Do NOT answer the call**
2. Let it go to voicemail
3. AI should leave a message

#### Expected Results
✅ **Call Results:**
- "Parse Call Results" detected "Voicemail Left"
- "Route by Action" took default path
- Google Sheet updated:
  - `Status` remains "Pending"
  - `Voice_Call_Agent_Action_Taken = "Voicemail Left"`
  - `Voice_Call_Agent_Call_Summary = [voicemail transcript]`
- No email sent (patient needs to call back)

---

### Test 4: No Duplicate Calls

**Goal:** Ensure same patient doesn't get called twice

#### Setup
Same as Test 1, but:
- Set `20hr_Voice_Call_Made = TRUE` (already called)

#### Execute
1. Wait for schedule trigger
2. Check execution logs

#### Expected Results
✅ **Filter Stage:**
- "Filter for 20hr Unconfirmed" shows 0 appointments found
- Workflow takes "No Calls Needed - End" path
- No call made

---

### Test 5: Multiple Patients (Batch Processing)

**Goal:** Test loop logic with multiple appointments

#### Setup
Create **3 test appointments**:
```
TEST-005a: Your phone
TEST-005b: Friend's phone (with permission)
TEST-005c: Another test number
```

All with:
- Time: 1.5 minutes from now
- Status: Pending
- 24hr_Reminder_Sent: TRUE
- 20hr_Voice_Call_Made: FALSE

#### Execute
1. Activate workflow
2. Wait for calls

#### Expected Results
✅ **Call Initiation:**
- All 3 patients receive calls (1-2 minutes apart)
- Each call updates `20hr_Voice_Call_Made = TRUE`
- Loop processes all 3 patients sequentially

---

### Test 6: Edge Case - Already Confirmed Patient

**Goal:** Ensure confirmed patients don't get called

#### Setup
Create appointment with:
- Status: **Confirmed** (key difference)
- 24hr_Reminder_Sent: TRUE
- 20hr_Voice_Call_Made: FALSE

#### Execute
1. Wait for schedule trigger

#### Expected Results
✅ **Filter Stage:**
- Patient filtered out (Status != "Pending")
- No call made

---

### Test 7: Webhook Manual Testing

**Goal:** Test webhook processing independently

#### Setup
None needed

#### Execute
Send manual webhook request:

```bash
curl -X POST https://your-n8n-instance.com/webhook/vapi-call-complete \
  -H "Content-Type: application/json" \
  -d '{
    "call": {
      "id": "call_test_123",
      "status": "ended",
      "phoneNumber": "+15551234567",
      "endedReason": "customer-ended-call"
    },
    "transcript": "Agent: Hi John, are you still able to make it? Patient: Yes, I will be there.",
    "summary": "Patient confirmed attendance",
    "recordingUrl": "https://example.com/recording.mp3"
  }'
```

#### Expected Results
✅ **Webhook Processing:**
- Webhook receives data
- "Parse Call Results" detects "Confirmed"
- Routing works correctly
- Google Sheet attempts update (will fail due to phone number mismatch - expected)

---

## Testing Checklist Summary

| Test | Scenario | Status |
|------|----------|--------|
| 1 | Patient confirms via voice | ☐ |
| 2 | Patient requests cancel/reschedule | ☐ |
| 3 | Voicemail left | ☐ |
| 4 | No duplicate calls | ☐ |
| 5 | Multiple patients batch | ☐ |
| 6 | Already confirmed (skip) | ☐ |
| 7 | Webhook manual test | ☐ |

---

## Common Issues & Fixes

### Issue: Call Not Initiated

**Symptoms:**
- Filter shows 0 appointments despite having test data
- "Any Calls Needed?" takes FALSE path

**Debug Steps:**
```javascript
// Add logging to "Filter for 20hr Unconfirmed" Code node:
console.log(`
DEBUG:
  - ISO Time: ${isoTime}
  - Appointment Time: ${apptTime}
  - Current Time: ${now}
  - Hours Until: ${hoursUntil}
  - Minutes Until: ${minutesUntil}
  - Sent 24hr: ${sent24hr}
  - Status: ${status}
  - Voice Call Made: ${voiceCallMade}
`);
```

**Common Causes:**
1. ISO_Time_Format not in future (too late)
2. 24hr_Reminder_Sent is FALSE or empty
3. Status is not "Pending"
4. Timing window too narrow (adjust to ±1 min for testing)

**Fix:**
```javascript
// Widen testing window:
minutesUntil >= 0.5 && minutesUntil <= 2.5  // Instead of 1.25-1.75
```

---

### Issue: Webhook Not Triggered

**Symptoms:**
- Call completes but no webhook execution in n8n
- Google Sheet not updated with call results

**Debug Steps:**
1. **Check Vapi webhook logs:**
   - Vapi Dashboard → Settings → Webhooks → Logs
   - Look for failed webhook deliveries

2. **Verify webhook URL:**
   ```bash
   # Should match exactly:
   n8n: https://izzydev.app.n8n.cloud/webhook/vapi-call-complete
   Vapi: https://izzydev.app.n8n.cloud/webhook/vapi-call-complete
   ```

3. **Test webhook manually:**
   ```bash
   curl -X POST https://your-webhook-url \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

**Common Causes:**
1. Workflow not activated (webhook disabled)
2. Webhook URL typo in Vapi settings
3. Firewall blocking incoming webhooks
4. n8n instance using HTTP instead of HTTPS

**Fix:**
- Re-activate workflow in n8n
- Copy webhook URL directly from n8n (don't type manually)
- Use HTTPS for production n8n instances

---

### Issue: Wrong Action Detected

**Symptoms:**
- Patient said "yes" but system logged "Voicemail Left"
- Patient requested cancel but system logged "Confirmed"

**Debug Steps:**
Add logging to "Parse Call Results":
```javascript
console.log(`
TRANSCRIPT ANALYSIS:
  - Full Transcript: ${transcript}
  - Transcript Lower: ${transcriptLower}
  - Action Taken: ${actionTaken}
  - Patient Confirmed: ${patientConfirmed}
`);
```

**Common Causes:**
1. Transcript doesn't contain expected keywords
2. Patient used unexpected phrasing
3. Voice recognition error

**Fix:**
Add more keyword variations:
```javascript
// More flexible confirmation detection:
const confirmKeywords = [
  "confirmed", "confirm", "yes", "yeah", "yep", "sure",
  "i'll be there", "i will be there", "see you", "coming",
  "that works", "sounds good", "absolutely"
];

const isConfirmed = confirmKeywords.some(keyword =>
  transcriptLower.includes(keyword)
);
```

---

### Issue: High Vapi Costs

**Symptoms:**
- Monthly bill higher than expected
- Too many calls being made

**Debug Steps:**
1. Check Google Sheet: Count `20hr_Voice_Call_Made = TRUE`
2. Review Vapi usage dashboard
3. Check filter logic for over-calling

**Common Causes:**
1. Duplicate calls to same patient
2. Filter window too wide (calling patients multiple times)
3. Testing mode left on in production

**Fix:**
```javascript
// Stricter duplicate prevention:
if (voiceCallMade === true || voiceCallMade === "TRUE") {
  console.log(`⏭️ Skipping - already called ${patientName}`);
  continue;
}

// Narrower time window (production):
hoursUntil >= 19.75 && hoursUntil <= 20.25  // 30-min window instead of 60-min
```

---

## Performance Benchmarks

**Expected Execution Times:**

| Node | Expected Duration | Alert If > |
|------|------------------|------------|
| Schedule Trigger | Instant | - |
| Read Appointments | 1-3 seconds | 10 seconds |
| Filter for 20hr Unconfirmed | 0.5-2 seconds | 5 seconds |
| Loop: Each Patient | 0.1 seconds per patient | - |
| Initiate Vapi Call | 2-5 seconds | 15 seconds |
| Mark Call Initiated | 1-2 seconds | 10 seconds |
| Webhook: Vapi Results | Instant | - |
| Parse Call Results | 0.2-0.5 seconds | 2 seconds |
| Update Google Sheet | 1-3 seconds | 10 seconds |

**Total End-to-End:**
- Call initiation: 5-15 seconds
- Call duration: 30-120 seconds (patient-dependent)
- Results processing: 2-5 seconds
- **Total: 40-140 seconds**

---

## Production Deployment Checklist

Before switching to production:

- [ ] All 7 test scenarios passed
- [ ] Switched back to production timing (19.5-20.5 hours)
- [ ] Tested with at least 3 real staff phone numbers
- [ ] Vapi BAA signed (HIPAA)
- [ ] Conversation prompts reviewed and approved
- [ ] Cost monitoring set up
- [ ] Alert notifications configured (Slack/email)
- [ ] Staff trained on handling voice call results
- [ ] Documented in patient privacy policy
- [ ] Backup/fallback plan if Vapi service down

---

## Monitoring in Production

### Daily Checks (First Week)

1. **Call Success Rate:**
   ```
   = Calls Answered / Total Calls Made
   Target: >70%
   ```

2. **Confirmation Rate:**
   ```
   = Patients Confirmed / Calls Answered
   Target: >60%
   ```

3. **Cost Per Call:**
   ```
   = Total Vapi Bill / Number of Calls
   Target: <$0.80 (2 min avg @ $0.40/min)
   ```

4. **Error Rate:**
   ```
   = Failed Executions / Total Executions
   Target: <5%
   ```

### Weekly Review

- Review 5-10 call transcripts for quality
- Adjust conversation prompts if needed
- Check for duplicate calls
- Verify Google Sheet data accuracy
- Analyze no-show rate (before vs. after voice calls)

---

## Success Metrics

**Expected Impact** (based on industry benchmarks):

| Metric | Before Voice Calls | After Voice Calls | Improvement |
|--------|-------------------|-------------------|-------------|
| Confirmation Rate | 60% | 75-80% | +15-20% |
| No-Show Rate | 15-20% | 8-12% | -7-8% |
| Staff Time (calls) | 30 min/day | 5 min/day | -25 min/day |
| Revenue Recovery | $0 | $500-1,000/day | Significant |

**ROI Calculation:**
```
Monthly Cost: $480 (voice calls)
Monthly Benefit:
  - Reduced no-shows: 10% improvement × 100 appts/day × $200/appt = $2,000/day
  - Staff time saved: 25 min/day × $30/hr × 30 days = $375/month

Monthly Net Benefit: $60,375 - $480 = $59,895
ROI: 12,478% 🎯
```

---

## Next Steps After Testing

1. ✅ Complete all 7 test scenarios
2. ✅ Review and optimize conversation prompts
3. ✅ Switch to production timing
4. ✅ Deploy to production environment
5. ✅ Monitor for 1 week intensively
6. ✅ Collect feedback from patients
7. ✅ Adjust as needed
8. ✅ Document final results

---

**Testing Status:** Ready for Testing ✅
**Last Updated:** 2025-10-31
**Version:** 1.0
