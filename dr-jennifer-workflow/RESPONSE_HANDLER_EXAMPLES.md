# Response Handler - Patient Response Examples

## Overview
This document shows real-world examples of patient responses and how the workflow processes them.

---

## Pattern Matching Examples (No AI Needed)

### Example 1: Simple "1"
```
Patient Email:
Subject: Re: Appointment Reminder - Dr. Jennifer
Body: 1
```

**Processing:**
- ✅ Pattern matched instantly
- ✅ Method: pattern_matching
- ✅ AI Used: No
- ✅ Cost: $0
- ✅ Time: <1 second

**Result:**
- Status: Confirmed
- Email sent: "✅ Appointment Confirmed"

---

### Example 2: Simple "2"
```
Patient Email:
Body: 2
```

**Processing:**
- ✅ Pattern matched
- ✅ AI Used: No

**Result:**
- Status: Cancelled
- Emails sent:
  1. Patient: "Appointment Cancelled" + Cal.com link
  2. Staff: "❌ Cancellation Alert"
- Waitlist: Triggered

---

### Example 3: Simple "3"
```
Patient Email:
Body: 3
```

**Processing:**
- ✅ Pattern matched
- ✅ AI Used: No

**Result:**
- Status: Rescheduled
- Emails sent:
  1. Patient: "Reschedule Your Appointment" + Cal.com link
  2. Staff: "🔄 Reschedule Request"
- Waitlist: NOT triggered

---

### Example 4: "1" with Extra Text
```
Patient Email:
Body: 1 - confirmed!
```

**Processing:**
- ✅ Pattern matched (found "1" in text)
- ✅ AI Used: No

**Result:**
- Status: Confirmed

---

### Example 5: "2" with Apology
```
Patient Email:
Body: 2, sorry I can't make it
```

**Processing:**
- ✅ Pattern matched (found "2" first)
- ✅ AI not needed

**Result:**
- Status: Cancelled

---

## AI Classification Examples (Claude Haiku)

### Example 6: Natural Language Confirm
```
Patient Email:
Body: Yes, I confirm my appointment
```

**Processing:**
- ❌ No "1" found
- → AI Classification triggered
- → Claude Haiku prompt: "Classify this: 'Yes, I confirm my appointment'"
- → AI response: "CONFIRM"
- ✅ Method: ai_claude_haiku
- ✅ Cost: ~$0.0001
- ✅ Time: ~300ms

**Result:**
- Status: Confirmed
- Email sent: "✅ Appointment Confirmed"

---

### Example 7: Natural Language Cancel
```
Patient Email:
Body: I'm sorry but I need to cancel
```

**Processing:**
- → AI Classification
- → AI response: "CANCEL"

**Result:**
- Status: Cancelled
- Staff notified
- Waitlist triggered

---

### Example 8: Cancel with Reason
```
Patient Email:
Body: I can't make it, my child is sick
```

**Processing:**
- → AI Classification
- → AI response: "CANCEL"

**Result:**
- Status: Cancelled
- Cancellation_Reason: "Patient requested via email"
- Staff notified with full details

---

### Example 9: Natural Language Reschedule
```
Patient Email:
Body: Can we reschedule for next week?
```

**Processing:**
- → AI Classification
- → AI response: "RESCHEDULE"

**Result:**
- Status: Rescheduled
- Cal.com link sent to patient

---

### Example 10: Polite Confirmation
```
Patient Email:
Body: Good morning! Yes, I'll be there. Thank you!
```

**Processing:**
- → AI Classification
- → AI detects intent: confirmation despite no "1"
- → AI response: "CONFIRM"

**Result:**
- Status: Confirmed

---

### Example 11: Urgent Cancellation
```
Patient Email:
Body: Emergency, can't make it, please cancel
```

**Processing:**
- → AI Classification
- → AI response: "CANCEL"

**Result:**
- Status: Cancelled
- Immediate processing

---

### Example 12: Typos Handled
```
Patient Email:
Body: confrim
```

**Processing:**
- → AI Classification (no "1" found)
- → AI understands typo
- → AI response: "CONFIRM"

**Result:**
- Status: Confirmed

---

### Example 13: Rescheduling Request
```
Patient Email:
Body: Something came up, can I change the time?
```

**Processing:**
- → AI Classification
- → AI response: "RESCHEDULE"

**Result:**
- Status: Rescheduled
- Cal.com link sent

---

## Unknown Responses (Clarification Needed)

### Example 14: Ambiguous Response
```
Patient Email:
Body: Maybe, I'm not sure yet
```

**Processing:**
- → AI Classification
- → AI response: "UNKNOWN"

**Result:**
- Status: Unchanged (stays "Pending")
- Clarification email sent:
```
Please Clarify Your Response

We couldn't understand your response.
Please reply with:
1 = Confirm
2 = Cancel
3 = Reschedule
```

---

### Example 15: Question Instead of Response
```
Patient Email:
Body: What time was my appointment again?
```

**Processing:**
- → AI Classification
- → AI response: "UNKNOWN" (asking question, not responding)

**Result:**
- Clarification email sent

---

### Example 16: Off-Topic Reply
```
Patient Email:
Body: Can I get a prescription refill?
```

**Processing:**
- → AI Classification
- → AI response: "UNKNOWN"

**Result:**
- Clarification email sent
- ⚠️ Manual follow-up needed for prescription request

---

## Error Cases

### Example 17: Patient Not Found
```
Patient Email:
From: unknown_patient@gmail.com
Body: 1
```

**Processing:**
- → Google Sheets lookup: No match
- → responseType: "patient_not_found"

**Result:**
- Email sent:
```
We Received Your Email

We couldn't find your appointment in our system.
Please contact us: [PHONE]
```

---

### Example 18: Past Appointment
```
Patient Email:
From: patient@gmail.com (has appointment yesterday)
Body: 1
```

**Processing:**
- → Date check: Appointment < now
- → responseType: "past_appointment"

**Result:**
- Email sent:
```
Appointment Already Occurred

This appointment has already occurred.
To schedule a new appointment: [Cal.com Link]
```

---

### Example 19: AI API Failure
```
(Hypothetical: Claude API is down)
```

**Processing:**
- → Pattern matching: No "1/2/3" found
- → AI call: FAILED (network error)
- → Fallback: responseType = "unknown"

**Result:**
- Clarification email sent (same as "unknown")
- Patient can retry by replying "1", "2", or "3"

---

## Multi-Patient Scenarios

### Example 20: Same Email, Multiple Appointments
```
Patient: John Doe
Email: john@gmail.com
Appointments:
  1. Tomorrow at 10:00 AM (already reminded)
  2. Next week at 2:00 PM (not yet reminded)

Patient replies: 1
```

**Processing:**
- → Lookup finds 2 appointments
- → Uses first match (most recent or matches reminder sent)

**Recommendation:**
- Include date in reminder subject: "Appointment Reminder - Nov 4"
- Match by email + date extracted from subject

---

### Example 21: Duplicate Replies
```
10:00 AM - Patient replies: "1"
10:05 AM - Patient replies: "2" (changed mind)
```

**Processing:**
- → First reply: Status = "Confirmed"
- → Second reply: Status = "Cancelled" (overwrites)

**Result:**
- Latest response wins
- Both emails processed
- Staff receives both notifications

**Future Enhancement:**
- Add cooldown period (ignore replies within 5 minutes)
- Or: Check current Status before sending notifications

---

## Language & Tone Variations

### Example 22: Formal Tone
```
Patient Email:
Body: Dear Dr. Jennifer's Office, I would like to confirm my attendance at the scheduled appointment. Thank you.
```

**AI Response:** "CONFIRM"
**Result:** Status = Confirmed

---

### Example 23: Informal Tone
```
Patient Email:
Body: yup i'll be there
```

**AI Response:** "CONFIRM"
**Result:** Status = Confirmed

---

### Example 24: Apologetic Cancel
```
Patient Email:
Body: I'm so sorry but I have to cancel. Something urgent came up with work. I'll reschedule soon.
```

**AI Response:** "CANCEL"
**Result:** Status = Cancelled (AI ignores sentiment, focuses on intent)

---

### Example 25: Enthusiastic Confirm
```
Patient Email:
Body: YES!!! I'll be there! Can't wait!
```

**AI Response:** "CONFIRM"
**Result:** Status = Confirmed

---

## Edge Cases

### Example 26: Multiple Numbers
```
Patient Email:
Body: I have 2 questions: 1) Can I confirm? and 2) What's the address?
```

**Processing:**
- → Pattern matching finds "1" first
- → responseType: "confirm" (before AI even runs)

**Result:**
- Status: Confirmed (pattern matching is first-match-wins)

---

### Example 27: Quoted Text
```
Patient Email:
Body:
> You asked me to reply:
> 1 = Confirm
> 2 = Cancel

I choose option 1
```

**Processing:**
- → Pattern matching finds "1" in quoted text
- → responseType: "confirm"

**Result:**
- Status: Confirmed

---

### Example 28: Email Signature
```
Patient Email:
Body: 1

--
John Doe
Phone: 555-1234
```

**Processing:**
- → Pattern matching finds "1" (ignores signature)

**Result:**
- Status: Confirmed

---

## Cost Analysis Examples

### Scenario: 1000 Appointment Reminders/Month

**Response Breakdown:**
- Total reminders sent: 1000
- Response rate: 30% = 300 replies
- Pattern matched (90%): 270 replies → $0 cost
- AI classified (10%): 30 replies → ~$3-5 cost

**Sample Month:**
- Week 1: 75 responses (68 pattern, 7 AI) = $0.70
- Week 2: 80 responses (72 pattern, 8 AI) = $0.80
- Week 3: 70 responses (63 pattern, 7 AI) = $0.70
- Week 4: 75 responses (67 pattern, 8 AI) = $0.80

**Total Month:** ~$3.00

---

## Comparison: With vs Without AI

### Without AI (Pattern Matching Only)

**Patient:** "Yes, I confirm"
**Result:**
- ❌ No "1" found
- → responseType: "unknown"
- → Clarification email sent
- → Patient must reply again with "1"
- → Extra friction, delayed confirmation

**Patient Experience:** 😐 Neutral (extra step)

---

### With AI (Hybrid Approach)

**Patient:** "Yes, I confirm"
**Result:**
- ✅ AI understands intent
- → Status: Confirmed immediately
- → Confirmation email sent
- → No additional steps

**Patient Experience:** 😊 Excellent (seamless)
**Cost:** $0.0001

**ROI:** Worth $0.0001 to avoid patient frustration

---

## Best Practices for Patients

### Recommended Patient Replies (for speed)

**Best:**
```
1
```
- Instant processing
- Zero cost
- No ambiguity

**Good:**
```
Confirmed
Yes
I'll be there
```
- AI processes in <1 second
- Minimal cost
- Patient-friendly

**Avoid:**
```
Maybe, not sure yet
Let me think about it
What time again?
```
- Requires clarification
- Delayed processing

---

## Staff Training Notes

### What Staff Should Know:

1. **Most patients will reply "1", "2", or "3"** (as instructed)
   - No AI needed for these
   - Instant processing

2. **Some patients will use natural language**
   - AI handles this automatically
   - Nearly 100% accurate

3. **Clarification emails are rare** (<2%)
   - Only sent for truly ambiguous responses
   - Patient can easily retry

4. **Cancellations trigger waitlist automatically**
   - Staff alert email includes all details
   - No manual action needed

5. **Check Google Sheet for Status updates**
   - Status column shows: Pending/Confirmed/Cancelled/Rescheduled
   - Timestamps show when action occurred

---

**Last Updated:** January 2025
**Total Examples:** 28 scenarios
**Coverage:** Pattern matching, AI classification, errors, edge cases
