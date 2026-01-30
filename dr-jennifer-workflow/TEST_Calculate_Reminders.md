# Test Configuration: Calculate Reminders (1/2/3 Minutes)

## Purpose

Test the reminder workflow with **1, 2, and 3 MINUTE** intervals instead of 48/24/2 hours for rapid testing.

## How to Use

### Option A: Replace Code Node Temporarily

1. Open n8n workflow: "Appointment Reminders - FIXED"
2. Click "Calculate Reminders" code node
3. **Backup the original code** (copy to notepad)
4. Replace with the test code below
5. Run tests
6. **Restore original code** when done

### Option B: Create Separate Test Workflow

1. Duplicate "Appointment Reminders - FIXED" workflow
2. Rename to "Appointment Reminders - TEST"
3. Replace "Calculate Reminders" code with test version
4. Keep both workflows (test + production)

---

## Test Code (1/2/3 Minute Intervals)

### Replace "Calculate Reminders" Node Code With:

```javascript
/**
 * TEST VERSION - Appointment Reminder Logic
 * Uses MINUTES instead of HOURS for rapid testing
 * - 3-minute reminder (replaces 48hr)
 * - 2-minute reminder (replaces 24hr)
 * - 1-minute reminder (replaces 2hr)
 * Uses ISO_Time_Format field directly (no date/time parsing needed!)
 */

const now = new Date();
const results = [];

let processed = 0;
let skipped = 0;
let errors = 0;

for (const item of $input.all()) {
  try {
    const row = item.json;
    const isoTime = row["ISO_Time_Format"]; // "2025-10-31T15:45:00Z"
    const patientEmail = row["Patient Email"];
    const patientName = row["Patient Name"];
    const status = (row["Status"] || "Pending").toString();

    // Validate required fields
    if (!isoTime || !patientEmail || !patientName) {
      console.warn(`⚠️ Missing required fields for row`);
      skipped++;
      continue;
    }

    // Parse ISO timestamp directly
    const appt = new Date(isoTime);
    if (isNaN(appt.getTime())) {
      console.error(`❌ Invalid ISO_Time_Format: ${isoTime}`);
      errors++;
      continue;
    }

    // Calculate MINUTES until appointment (instead of hours)
    const minutesUntil = (appt - now) / 60000;

    console.log(`⏰ ${patientName}: ${minutesUntil.toFixed(1)} minutes until appointment`);

    // Skip past appointments (more than 5 minutes past)
    if (minutesUntil < -5) {
      console.log(`   ⏭️ Skipped: Past appointment`);
      skipped++;
      continue;
    }

    // Skip appointments more than 10 minutes out (for testing)
    if (minutesUntil > 10) {
      console.log(`   ⏭️ Skipped: More than 10 minutes out`);
      skipped++;
      continue;
    }

    // Skip cancelled or rescheduled appointments
    if (status === "Cancelled" || status === "Rescheduled") {
      console.log(`   ⏭️ Skipped: Status = ${status}`);
      skipped++;
      continue;
    }

    // Check reminder flags
    const sent3min = row["48hr_Reminder_Sent"] === true || row["48hr_Reminder_Sent"] === "TRUE";
    const sent2min = row["24hr_Reminder_Sent"] === true || row["24hr_Reminder_Sent"] === "TRUE";
    const sent1min = row["2hr_Reminder_Sent"] === true || row["2hr_Reminder_Sent"] === "TRUE";
    const staffAlerted = row["Staff_Alerted"] === true || row["Staff_Alerted"] === "TRUE";

    // TEST REMINDER WINDOWS (in minutes instead of hours)
    let reminderType = null;

    // 3-minute reminder (2.5-3.5 minute window) - replaces 48hr
    if (minutesUntil >= 2.5 && minutesUntil < 3.5 && !sent3min && status === "Pending") {
      reminderType = "48hr"; // Keep same type for compatibility
      console.log(`   ✅ 3-MINUTE REMINDER triggered`);
    }
    // 2-minute reminder (1.5-2.5 minute window) - replaces 24hr
    else if (minutesUntil >= 1.5 && minutesUntil < 2.5 && !sent2min) {
      reminderType = "24hr"; // Keep same type for compatibility
      console.log(`   ✅ 2-MINUTE REMINDER triggered`);
    }
    // 1-minute reminder (0.5-1.5 minute window) - replaces 2hr
    else if (minutesUntil >= 0.5 && minutesUntil < 1.5 && !sent1min) {
      reminderType = "2hr"; // Keep same type for compatibility
      console.log(`   ✅ 1-MINUTE REMINDER triggered`);
    }
    // Staff alert (within 30 seconds of start time)
    else if (minutesUntil >= -0.5 && minutesUntil <= 0.5 && !staffAlerted) {
      reminderType = "staff";
      console.log(`   ✅ STAFF ALERT triggered`);
    }

    // Only output if reminder is needed
    if (reminderType) {
      results.push({
        json: {
          ...row,
          reminderType,
          minutesUntil: Math.round(minutesUntil * 10) / 10,
          hoursUntil: Math.round(minutesUntil * 10) / 10, // For compatibility
          formattedDate: appt.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
          }),
          formattedTime: appt.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit", // Include seconds for testing
            hour12: true
          }),
          appointmentDateTime: appt.toISOString()
        }
      });
      processed++;
    } else {
      skipped++;
    }

  } catch (error) {
    console.error(`❌ Error processing appointment:`, error.message);
    errors++;
  }
}

console.log(`
🧪 TEST MODE - Reminder Processing Complete:
  - Reminders to send: ${processed}
  - Skipped: ${skipped} appointments
  - Errors: ${errors}
  - Total rows checked: ${$input.all().length}

📝 Reminder Windows (TEST):
  - 3-minute reminder: 2.5-3.5 min window (replaces 48hr)
  - 2-minute reminder: 1.5-2.5 min window (replaces 24hr)
  - 1-minute reminder: 0.5-1.5 min window (replaces 2hr)
  - Staff alert: ±30 seconds window
`);

return results;
```

---

## Testing Instructions

### Step 1: Create Test Appointment

Create an appointment in Google Sheets with `ISO_Time_Format` set to **5 minutes from now**:

**Example** (if current time is 3:00 PM):
```
Appointment_Uid: test-uid-123
Date: Friday, October 31
Time: 3:05 PM
Patient_Name: Test Patient
Patient_Email: your-test-email@example.com
Patient_Phone: +1234567890
Doctor_Name: Dr. Jennifer
Appointment_Type: Consultation
Status: Pending
ISO_Time_Format: 2025-10-31T15:05:00.000Z  ← 5 minutes from now
48hr_Reminder_Sent: FALSE
24hr_Reminder_Sent: FALSE
2hr_Reminder_Sent: FALSE
Staff_Alerted: FALSE
```

### Step 2: Set Schedule Trigger to 30 Seconds

**Current**: Schedule trigger runs every 1 hour
**For Testing**: Change to every 30 seconds

1. Open "Schedule Trigger (1 hour)" node
2. Change interval to: **30 seconds** or **1 minute**
3. Save

### Step 3: Activate Workflow

1. Toggle workflow to "Active"
2. Workflow will now check every 30 seconds

### Step 4: Watch Execution Logs

Expected timeline (if appointment is at 3:05 PM):

| Time | Minutes Until | Reminder Triggered | Flag Updated |
|------|---------------|-------------------|-------------|
| 3:01:30 PM | 3.5 min | None (outside window) | - |
| 3:02:00 PM | 3.0 min | ✅ 3-MINUTE (48hr) | `48hr_Reminder_Sent` = TRUE |
| 3:02:30 PM | 2.5 min | None (already sent) | - |
| 3:03:00 PM | 2.0 min | ✅ 2-MINUTE (24hr) | `24hr_Reminder_Sent` = TRUE |
| 3:03:30 PM | 1.5 min | None (already sent) | - |
| 3:04:00 PM | 1.0 min | ✅ 1-MINUTE (2hr) | `2hr_Reminder_Sent` = TRUE |
| 3:04:30 PM | 0.5 min | None (already sent) | - |
| 3:05:00 PM | 0 min | ✅ STAFF ALERT | `Staff_Alerted` = TRUE |

### Step 5: Verify Emails

Check your test email inbox for:
1. **3-minute reminder** (labeled as "48 hours")
2. **2-minute reminder** (labeled as "24 hours")
3. **1-minute reminder** (labeled as "2 hours")
4. **Staff alert** (if configured)

---

## Test Scenarios

### Scenario 1: Full Reminder Sequence
**Setup**: Appointment 5 minutes from now, Status: Pending
**Expected**:
- 3-min reminder sent (48hr)
- 2-min reminder sent (24hr)
- 1-min reminder sent (2hr)
- Staff alert at appointment time

### Scenario 2: Skip Confirmed Appointments for 3-Minute
**Setup**: Appointment 5 minutes from now, Status: Confirmed
**Expected**:
- 3-min reminder **NOT** sent (only for Pending)
- 2-min reminder **SENT** (for Confirmed/Pending)
- 1-min reminder **SENT** (for Confirmed/Pending)

### Scenario 3: Skip Cancelled Appointments
**Setup**: Appointment 5 minutes from now, Status: Cancelled
**Expected**:
- No reminders sent

### Scenario 4: Idempotency (No Duplicates)
**Setup**: Run workflow twice at same time
**Expected**:
- Reminder sent only once
- Flags prevent duplicate sends

### Scenario 5: Past Appointment
**Setup**: Appointment 10 minutes ago
**Expected**:
- No reminders sent
- Skipped: Past appointment

---

## Troubleshooting

### Issue: No Reminders Triggered

**Check**:
1. Verify `ISO_Time_Format` is correct format: `2025-10-31T15:05:00.000Z`
2. Check appointment is 1-5 minutes from now
3. Verify reminder flags are `FALSE` (not already sent)
4. Check Status is `Pending` or `Confirmed` (not `Cancelled`)

**View Logs**:
```
n8n Dashboard → Executions → Click latest run → Check "Calculate Reminders" output
```

### Issue: Multiple Reminders Sent

**Cause**: Reminder flags not updating
**Fix**: Check Google Sheets update nodes are working correctly

### Issue: Wrong Reminder Type

**Check timing windows**:
- 3-min: Must be between 2.5-3.5 minutes
- 2-min: Must be between 1.5-2.5 minutes
- 1-min: Must be between 0.5-1.5 minutes

### Issue: Email Not Received

**Check**:
1. Gmail API credentials connected
2. Email address is valid in Google Sheets
3. Check spam folder
4. Verify email send node executed successfully

---

## Converting Minutes to Seconds (For Even Faster Testing)

If you want **1/2/3 SECOND** intervals for ultra-fast testing:

```javascript
// Replace these lines:
const minutesUntil = (appt - now) / 60000;

// With:
const secondsUntil = (appt - now) / 1000;

// Update windows:
// 3-second reminder (2.5-3.5 second window)
if (secondsUntil >= 2.5 && secondsUntil < 3.5 && !sent3sec && status === "Pending") {
  reminderType = "48hr";
}
// 2-second reminder (1.5-2.5 second window)
else if (secondsUntil >= 1.5 && secondsUntil < 2.5 && !sent2sec) {
  reminderType = "24hr";
}
// 1-second reminder (0.5-1.5 second window)
else if (secondsUntil >= 0.5 && secondsUntil < 1.5 && !sent1sec) {
  reminderType = "2hr";
}
```

⚠️ **Warning**: Second-based testing requires:
- Appointment set to exact seconds in future
- Schedule trigger at 1-2 second intervals
- Very fast execution (may miss windows)

**Recommendation**: Stick with **minute-based testing** for reliability.

---

## Restore Production Configuration

### After Testing, Restore Original:

1. **Replace test code** with original "Calculate Reminders" code
2. **Change schedule trigger** back to 1 hour
3. **Delete test appointments** from Google Sheets
4. **Reset reminder flags** if needed

### Original Windows (Production):
```javascript
// 48-hour reminder (47-48 hour window)
if (hoursUntil >= 47 && hoursUntil < 48 && !sent48hr && status === "Pending") {
  reminderType = "48hr";
}
// 24-hour reminder (23-24 hour window)
else if (hoursUntil >= 23 && hoursUntil < 24 && !sent24hr) {
  reminderType = "24hr";
}
// 2-hour reminder (1.5-2.5 hour window)
else if (hoursUntil >= 1.5 && hoursUntil < 2.5 && !sent2hr) {
  reminderType = "2hr";
}
```

---

## Quick Test Checklist

- [ ] Backup original "Calculate Reminders" code
- [ ] Replace with test code (1/2/3 minutes)
- [ ] Change schedule trigger to 30 seconds
- [ ] Create test appointment 5 minutes from now
- [ ] Set `ISO_Time_Format` correctly
- [ ] Set all reminder flags to `FALSE`
- [ ] Set Status to `Pending`
- [ ] Activate workflow
- [ ] Watch execution logs
- [ ] Verify 3-minute reminder email received
- [ ] Verify Google Sheets flag updated to `TRUE`
- [ ] Verify 2-minute reminder email received
- [ ] Verify 1-minute reminder email received
- [ ] Verify no duplicate emails sent
- [ ] Restore original code
- [ ] Restore schedule trigger to 1 hour
- [ ] Delete test appointments

---

## Tips for Effective Testing

### 1. Use Your Personal Email
- Don't spam patient emails during testing
- Use your own email for test appointments

### 2. Monitor Real-Time
- Keep n8n Executions tab open
- Watch logs in real-time
- Check each node's output

### 3. Test One Scenario at a Time
- Don't create multiple test appointments
- Complete one full test before next

### 4. Use Descriptive Test Data
```
Patient_Name: TEST - 3min Reminder
Patient_Email: your-email@example.com
```

### 5. Document Results
- Screenshot execution logs
- Note any errors or issues
- Track email delivery times

---

## Expected Console Output (Test Mode)

```
⏰ TEST - 3min Reminder: 3.2 minutes until appointment
   ✅ 3-MINUTE REMINDER triggered

⏰ TEST - 2min Reminder: 2.1 minutes until appointment
   ✅ 2-MINUTE REMINDER triggered

⏰ TEST - 1min Reminder: 0.8 minutes until appointment
   ✅ 1-MINUTE REMINDER triggered

🧪 TEST MODE - Reminder Processing Complete:
  - Reminders to send: 3
  - Skipped: 0 appointments
  - Errors: 0
  - Total rows checked: 1

📝 Reminder Windows (TEST):
  - 3-minute reminder: 2.5-3.5 min window (replaces 48hr)
  - 2-minute reminder: 1.5-2.5 min window (replaces 24hr)
  - 1-minute reminder: 0.5-1.5 min window (replaces 2hr)
  - Staff alert: ±30 seconds window
```

---

## Success Criteria

✅ **All reminders sent at correct times**
✅ **No duplicate emails**
✅ **Flags updated correctly in Google Sheets**
✅ **Cancelled appointments skipped**
✅ **Confirmed appointments get 2min/1min only (not 3min)**
✅ **Execution logs show clear timing info**
✅ **No errors in n8n workflow**

---

**Happy Testing!** 🧪🚀

Once testing is complete, don't forget to restore the production configuration!
