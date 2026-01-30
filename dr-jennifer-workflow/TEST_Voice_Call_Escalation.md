# Test Configuration: Voice Call Escalation (1-2 Minute Testing)

## Purpose

Test the **Voice Call Escalation workflow** with **1-2 MINUTE** intervals instead of 20 hours for rapid testing.

This allows you to test the entire voice call workflow (call initiation, webhook callback, Google Sheets updates) in just a few minutes.

---

## How to Use

### Option A: Replace Code Node Temporarily

1. Open n8n workflow: **"Voice Call Escalation - 20hr Unconfirmed"**
2. Click **"Filter for 20hr Unconfirmed"** code node
3. **Backup the original code** (copy to notepad)
4. Replace with the test code below
5. Run tests
6. **Restore original code** when done

### Option B: Create Separate Test Workflow

1. Duplicate **"Voice Call Escalation - 20hr Unconfirmed"** workflow
2. Rename to **"Voice Call Escalation - TEST"**
3. Replace **"Filter for 20hr Unconfirmed"** code with test version
4. Keep both workflows (test + production)

---

## Test Code (1-2 Minute Intervals)

### Replace "Filter for 20hr Unconfirmed" Node Code With:

```javascript
/**
 * TEST VERSION - Filter for appointments needing voice call escalation
 * Uses MINUTES instead of HOURS for rapid testing
 * - 2-minute test (replaces 20hr voice call)
 *
 * Criteria (TEST MODE):
 * - 24hr_Reminder_Sent = TRUE (they got the 24hr reminder)
 * - Status = "Pending" (not confirmed yet)
 * - 20hr_Voice_Call_Made = FALSE or null (haven't called yet)
 * - Current time is 1.5-2.5 minutes (±30 seconds) before appointment
 */

const now = new Date();
const appointments = $input.all();
const needsCalls = [];

let totalChecked = 0;
let needsCall = 0;
let skipped = 0;

for (const item of appointments) {
  try {
    const row = item.json;
    totalChecked++;

    // Extract fields
    const isoTime = row["ISO_Time_Format"];
    const status = (row["Status"] || "Pending").toString();
    const sent24hr = row["24hr_Reminder_Sent"] === true || row["24hr_Reminder_Sent"] === "TRUE";
    const voiceCallMade = row["20hr_Voice_Call_Made"] === true || row["20hr_Voice_Call_Made"] === "TRUE";
    const patientPhone = row["Patient_Phone"];
    const patientName = row["Patient_Name"];
    const patientEmail = row["Patient_Email"];

    // Validate required fields
    if (!isoTime || !patientPhone || !patientName) {
      console.warn(`⚠️ Missing required fields for row`);
      skipped++;
      continue;
    }

    // Parse appointment time
    const apptTime = new Date(isoTime);
    if (isNaN(apptTime.getTime())) {
      console.error(`❌ Invalid ISO_Time_Format: ${isoTime}`);
      skipped++;
      continue;
    }

    // Calculate MINUTES until appointment (instead of hours)
    const minutesUntil = (apptTime - now) / 60000; // milliseconds to minutes

    console.log(`📞 ${patientName}: ${minutesUntil.toFixed(2)} minutes until appointment`);

    // TEST: Check if appointment needs voice call
    // Production: 19.5 to 20.5 hours (1-hour window)
    // Testing: 1.5 to 2.5 minutes (1-minute window)
    const shouldCall = (
      sent24hr === true &&
      status === "Pending" &&
      voiceCallMade !== true &&
      minutesUntil >= 1.5 &&
      minutesUntil <= 2.5
    );

    if (shouldCall) {
      console.log(`   ✅ VOICE CALL TRIGGERED - ${minutesUntil.toFixed(2)} minutes until appointment`);

      needsCalls.push({
        json: {
          ...row,
          minutesUntil: Math.round(minutesUntil * 100) / 100,
          hoursUntil: Math.round(minutesUntil * 100) / 100, // For compatibility
          formattedDate: apptTime.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
          }),
          formattedTime: apptTime.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit", // Include seconds for testing
            hour12: true
          }),
          appointmentDateTime: apptTime.toISOString()
        }
      });
      needsCall++;
    } else {
      // Log why it was skipped
      if (voiceCallMade === true) {
        console.log(`   ⏭️ Skipped: Voice call already made`);
      } else if (sent24hr !== true) {
        console.log(`   ⏭️ Skipped: 24hr reminder not sent yet`);
      } else if (status !== "Pending") {
        console.log(`   ⏭️ Skipped: Status = ${status} (not Pending)`);
      } else if (minutesUntil < 1.5 || minutesUntil > 2.5) {
        console.log(`   ⏭️ Skipped: Outside 1.5-2.5 minute window (${minutesUntil.toFixed(2)} min)`);
      }
      skipped++;
    }

  } catch (error) {
    console.error(`❌ Error filtering appointment:`, error.message);
    skipped++;
  }
}

console.log(`
🧪 TEST MODE - Voice Call Escalation Filter:
  - Total appointments checked: ${totalChecked}
  - Need voice calls: ${needsCall}
  - Skipped: ${skipped}

📝 Test Window:
  - Voice call triggered: 1.5-2.5 minutes before appointment (replaces 19.5-20.5 hours)
  - Requirements: 24hr_Reminder_Sent=TRUE, Status=Pending, 20hr_Voice_Call_Made=FALSE
`);

return needsCalls;
```

---

## Testing Instructions

### Step 1: Create Test Appointment in Google Sheets

Create an appointment with `ISO_Time_Format` set to **4 minutes from now**:

**Example** (if current time is 3:00 PM):
```
Appointment_Uid: test-voice-001
Date: Friday, November 3
Time: 3:04 PM
Patient_Name: Test Voice Patient
Patient_Email: your-test-email@example.com
Patient_Phone: +1234567890
Doctor_Name: Dr. Jennifer Martinez
Appointment_Type: Annual Physical
Status: Pending
ISO_Time_Format: 2025-11-03T15:04:00.000Z  ← 4 minutes from now
24hr_Reminder_Sent: TRUE  ← MUST be TRUE
48hr_Reminder_Sent: TRUE
2hr_Reminder_Sent: FALSE
20hr_Voice_Call_Made: FALSE  ← MUST be FALSE
Voice_Call_Agent_Action_Taken: (empty)
Voice_Call_Agent_Call_Summary: (empty)
Confirmed_At: (empty)
```

**Critical Fields:**
- ✅ `24hr_Reminder_Sent` = **TRUE** (required for voice call)
- ✅ `Status` = **"Pending"** (must be unconfirmed)
- ✅ `20hr_Voice_Call_Made` = **FALSE** (haven't called yet)
- ✅ `ISO_Time_Format` = **4 minutes from now**

---

### Step 2: Set Schedule Trigger to 30 Seconds

**Current**: Schedule trigger runs every 30 minutes
**For Testing**: Change to every 30 seconds

1. Open **"Schedule Trigger (Every 30min)"** node
2. Change interval to: **30 seconds** or **1 minute**
3. Save

---

### Step 3: Verify Vapi Configuration

**Before testing, ensure:**

1. ✅ **Environment Variables Set**:
   - `VAPI_API_KEY` = Your Vapi API key
   - `VAPI_PHONE_NUMBER_ID` = Your Vapi phone number ID

2. ✅ **Vapi Webhook Configured**:
   - Vapi Dashboard → Settings → Server URL
   - Set to: `https://apollo-alpha.app.n8n.cloud/webhook-test/vapi-call-complete`

3. ✅ **Webhook Node Active**:
   - Click "Webhook: Vapi Call Results" node
   - Click "Listen for Test Event" to register webhook

4. ✅ **Phone Number Ready**:
   - Use **your own phone number** for testing
   - Don't use patient phone numbers

---

### Step 4: Activate Workflow

1. Toggle workflow to **"Active"**
2. Workflow will now check every 30 seconds

---

### Step 5: Watch Execution Logs

Expected timeline (if appointment is at 3:04 PM):

| Time | Minutes Until | Action | Google Sheet Update |
|------|---------------|--------|---------------------|
| 3:00:00 PM | 4.0 min | None (outside window) | - |
| 3:00:30 PM | 3.5 min | None (outside window) | - |
| 3:01:00 PM | 3.0 min | None (outside window) | - |
| 3:01:30 PM | 2.5 min | ✅ **VOICE CALL INITIATED** | `20hr_Voice_Call_Made` = TRUE |
| 3:02:00 PM | 2.0 min | None (already called) | - |
| **~3:03 PM** | ~1 min | 📞 **Voice call happening** | - |
| **~3:04 PM** | ~0 min | ✅ **Call ends, webhook received** | Action + Summary updated |

---

### Step 6: Monitor Call Execution

#### **Execution #1: Initiate Call** (at 2 minutes before appointment)

**Expected n8n execution flow:**
1. Schedule Trigger fires
2. Read Appointments from Google Sheets
3. Filter for 20hr Unconfirmed → **1 patient found**
4. Any Calls Needed? → **Yes**
5. Loop: Each Patient → Start loop
6. **Initiate Vapi Call** → Call API request sent
7. Extract Call ID → Call ID captured
8. Mark Call Initiated → `20hr_Voice_Call_Made` = TRUE

**Check Google Sheets:**
- `20hr_Voice_Call_Made` should now be **TRUE**

---

#### **Execution #2: Process Results** (1-2 minutes after call ends)

**Expected n8n execution flow:**
1. **Webhook: Vapi Call Results** → Triggered by Vapi
2. Parse Call Results → Extract action taken
3. Route by Action → Switch based on response:
   - **Path 1 (Confirmed)**: Update: Confirmed → Notify Staff: Confirmed
   - **Path 2 (Cancel/Reschedule)**: Lookup Appointment → Send Cal.com Link
   - **Path 3 (Other)**: Update: Other Result
4. Webhook Response → Respond to Vapi

**Check Google Sheets:**
- `Voice_Call_Agent_Action_Taken` = "Confirmed" / "Sent Cal.com Link" / etc.
- `Voice_Call_Agent_Call_Summary` = Transcript summary
- If confirmed: `Status` = "Confirmed", `Confirmed_At` = timestamp

---

### Step 7: Verify Your Phone

During testing, you should:

1. **Receive a call** at your test phone number
2. **Answer the call** or let it go to voicemail
3. **Interact with voice agent**:
   - Say "Yes, I'll be there" → Should mark as **Confirmed**
   - Say "I need to cancel" → Should send **Cal.com link**
   - Don't answer → Should leave **Voicemail**

---

## Test Scenarios

### Scenario 1: Patient Confirms Appointment

**Setup**:
- Appointment 4 min from now
- Status: Pending
- 24hr_Reminder_Sent: TRUE
- Answer call and say: "Yes, I'll be there"

**Expected**:
1. ✅ Voice call initiated at 2 min before
2. ✅ Call connects
3. ✅ Patient confirms
4. ✅ Google Sheet updated:
   - `Status` = "Confirmed"
   - `Voice_Call_Agent_Action_Taken` = "Confirmed"
   - `Confirmed_At` = timestamp
5. ✅ Slack notification sent (if configured)

---

### Scenario 2: Patient Wants to Cancel/Reschedule

**Setup**: Same as Scenario 1, but say: "I need to reschedule"

**Expected**:
1. ✅ Voice call initiated
2. ✅ Patient says "reschedule"
3. ✅ Email sent with Cal.com link
4. ✅ Google Sheet updated:
   - `Voice_Call_Agent_Action_Taken` = "Sent Cal.com Link"
   - `Voice_Call_Agent_Call_Summary` = Transcript

---

### Scenario 3: Voicemail

**Setup**: Same as Scenario 1, but don't answer

**Expected**:
1. ✅ Voice call initiated
2. ✅ Goes to voicemail
3. ✅ Agent leaves voicemail message
4. ✅ Google Sheet updated:
   - `Voice_Call_Agent_Action_Taken` = "Voicemail Left"

---

### Scenario 4: No Duplicate Calls (Idempotency)

**Setup**: Run workflow twice at same time

**Expected**:
1. ✅ First run: Call initiated
2. ✅ `20hr_Voice_Call_Made` = TRUE
3. ✅ Second run: No call (flag prevents duplicate)

---

### Scenario 5: Already Confirmed Appointment

**Setup**:
- Appointment 4 min from now
- Status: **Confirmed** (not Pending)
- 24hr_Reminder_Sent: TRUE

**Expected**:
- ❌ No call initiated
- Console log: "Skipped: Status = Confirmed (not Pending)"

---

### Scenario 6: 24hr Reminder Not Sent Yet

**Setup**:
- Appointment 4 min from now
- 24hr_Reminder_Sent: **FALSE**
- Status: Pending

**Expected**:
- ❌ No call initiated
- Console log: "Skipped: 24hr reminder not sent yet"

---

## Troubleshooting

### Issue: No Call Initiated

**Check**:
1. ✅ `24hr_Reminder_Sent` = TRUE (required)
2. ✅ `Status` = "Pending"
3. ✅ `20hr_Voice_Call_Made` = FALSE
4. ✅ Appointment is 1.5-2.5 minutes from now
5. ✅ `ISO_Time_Format` is valid: `2025-11-03T15:04:00.000Z`

**View Logs**:
```
n8n Dashboard → Executions → Click latest run → Check "Filter for 20hr Unconfirmed" output
```

---

### Issue: Vapi Error "Invalid Phone Number"

**Cause**: Phone number not in E.164 format

**Fix**: Use format `+1XXXXXXXXXX` (e.g., `+12345678900`)

---

### Issue: Webhook Not Receiving Data

**Check**:
1. ✅ Vapi Dashboard → Server URL is set correctly
2. ✅ Webhook URL matches exactly: `https://apollo-alpha.app.n8n.cloud/webhook-test/vapi-call-complete`
3. ✅ Workflow is **Active** (not just saved)
4. ✅ "Webhook: Vapi Call Results" node has been activated

**Test Webhook**:
- Click "Webhook: Vapi Call Results" node
- Click "Listen for Test Event"
- Make a test call from Vapi dashboard

---

### Issue: Call Connects But Agent Doesn't Speak

**Check**:
1. ✅ `firstMessage` is properly configured
2. ✅ Claude API key is valid (for Anthropic model)
3. ✅ ElevenLabs voice ID "rachel" is valid
4. ✅ Check Vapi dashboard logs for errors

---

### Issue: Google Sheets Not Updating

**Check**:
1. ✅ "Mark Call Initiated" node has correct sheet ID
2. ✅ "Update: Confirmed" node has correct sheet ID
3. ✅ Google Sheets OAuth2 credentials are connected
4. ✅ Matching column is correct: `Appointment_Uid` or `Patient_Phone`

---

### Issue: Multiple Calls to Same Patient

**Cause**: `20hr_Voice_Call_Made` flag not updating

**Fix**:
1. Check "Mark Call Initiated" node executed successfully
2. Verify Google Sheets update completed
3. Check sheet has `20hr_Voice_Call_Made` column

---

## Combining with Reminder Testing

You can test **both reminders AND voice calls** together:

### Combined Test Timeline (7-Minute Test)

**Setup**: Create appointment **7 minutes from now**

| Time | Minutes | Reminder/Call | Action |
|------|---------|---------------|--------|
| T+0 | 7.0 min | - | Workflow activated |
| T+3 | 4.0 min | - | Outside windows |
| **T+4** | **3.0 min** | ✅ **3-min reminder** | 48hr reminder sent |
| **T+5** | **2.0 min** | ✅ **2-min reminder + Voice call** | 24hr reminder + call initiated |
| **T+6** | **1.0 min** | ✅ **1-min reminder** | 2hr reminder sent |
| **T+7** | 0.0 min | ✅ **Staff alert** | Appointment time |

**Required Changes**:
1. ✅ Use **TEST_Calculate_Reminders.md** code for reminders
2. ✅ Use **this file's** code for voice calls
3. ✅ Set schedule trigger to **30 seconds**
4. ✅ Create appointment **7 minutes from now**

---

## Environment Variable Setup

### Set in n8n:

**Settings → Environment Variables**

```bash
# Vapi Configuration
VAPI_API_KEY=vapi_your_api_key_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here

# Optional: Claude API (if not set globally)
ANTHROPIC_API_KEY=sk-ant-your_key_here
```

**Get Vapi Values**:
1. **API Key**: https://dashboard.vapi.ai → Settings → API Keys
2. **Phone Number ID**: https://dashboard.vapi.ai → Phone Numbers → Copy ID

---

## Restore Production Configuration

### After Testing, Restore Original:

1. ✅ **Replace test code** with original "Filter for 20hr Unconfirmed" code
2. ✅ **Change schedule trigger** back to 30 minutes
3. ✅ **Delete test appointments** from Google Sheets
4. ✅ **Reset reminder flags** if needed
5. ✅ **Update test phone numbers** to real patient numbers

### Original Windows (Production):
```javascript
// 20-hour voice call (19.5-20.5 hour window)
const shouldCall = (
  sent24hr === true &&
  status === "Pending" &&
  voiceCallMade !== true &&
  hoursUntil >= 19.5 &&
  hoursUntil <= 20.5
);
```

---

## Quick Test Checklist

- [ ] Backup original "Filter for 20hr Unconfirmed" code
- [ ] Replace with test code (1.5-2.5 minutes)
- [ ] Change schedule trigger to 30 seconds
- [ ] Create test appointment 4 minutes from now
- [ ] Set `ISO_Time_Format` correctly
- [ ] Set `24hr_Reminder_Sent` = TRUE
- [ ] Set `20hr_Voice_Call_Made` = FALSE
- [ ] Set Status to "Pending"
- [ ] Set `VAPI_API_KEY` environment variable
- [ ] Set `VAPI_PHONE_NUMBER_ID` environment variable
- [ ] Configure Vapi webhook URL
- [ ] Activate webhook node in n8n
- [ ] Use YOUR phone number for testing
- [ ] Activate workflow
- [ ] Watch execution logs
- [ ] Verify call received on your phone
- [ ] Verify `20hr_Voice_Call_Made` flag = TRUE
- [ ] Answer call and test confirmation
- [ ] Verify webhook execution triggered
- [ ] Verify Google Sheets updated with results
- [ ] Restore original code
- [ ] Restore schedule trigger to 30 minutes
- [ ] Delete test appointments

---

## Expected Console Output (Test Mode)

```
📞 Test Voice Patient: 2.35 minutes until appointment
   ✅ VOICE CALL TRIGGERED - 2.35 minutes until appointment

🧪 TEST MODE - Voice Call Escalation Filter:
  - Total appointments checked: 1
  - Need voice calls: 1
  - Skipped: 0

📝 Test Window:
  - Voice call triggered: 1.5-2.5 minutes before appointment (replaces 19.5-20.5 hours)
  - Requirements: 24hr_Reminder_Sent=TRUE, Status=Pending, 20hr_Voice_Call_Made=FALSE
```

---

## Success Criteria

✅ **Call initiated at correct time (2 min before)**
✅ **No duplicate calls**
✅ **`20hr_Voice_Call_Made` flag updated to TRUE**
✅ **Voice call connects to your phone**
✅ **Voice agent speaks first message**
✅ **Patient can confirm/cancel/reschedule**
✅ **Webhook receives call results**
✅ **Google Sheet updated with action taken**
✅ **Transcript/summary recorded**
✅ **No errors in n8n workflow**

---

**Happy Testing!** 🧪📞

Once testing is complete, don't forget to restore the production configuration and remove test phone numbers!
