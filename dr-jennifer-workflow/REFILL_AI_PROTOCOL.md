# AI Clinical Protocol for Prescription Refill Automation

## ⚠️ DOCTOR APPROVAL REQUIRED

**CRITICAL**: This document contains the clinical decision rules that Claude AI will use to triage prescription refill requests. **Dr. Jennifer MUST review and approve these protocols before the automation goes live.**

**Purpose**: Ensure AI decisions align with practice standards, comply with DEA regulations, and prioritize patient safety.

---

## 🎯 Protocol Overview

The AI system uses a **three-tier decision framework**:

1. **AUTO-APPROVE** (Target: 80% of requests) - Routine refills that meet all safety criteria
2. **NEEDS-APPROVAL** (Target: 15% of requests) - Cases requiring clinical judgment
3. **ESCALATE** (Target: 5% of requests) - Immediate staff intervention required

**Safety-first design**: When in doubt, the AI escalates rather than auto-approves.

---

## ✅ TIER 1: AUTO-APPROVE Protocol

### Criteria (ALL must be true)

| # | Criterion | Explanation | How AI Verifies |
|---|-----------|-------------|-----------------|
| 1 | **Medication on file** | Patient is currently prescribed this medication | Lookup in Medications sheet by Patient_ID |
| 2 | **Refills remaining ≥ 1** | Prescription has at least one refill authorized | Check Refills_Remaining column > 0 |
| 3 | **Last visit within 180 days** | Patient seen in past 6 months | Calculate days since Last_Visit_Date |
| 4 | **NOT controlled substance** | Not Schedule II-V (DEA classification) | Check Controlled_Substance = "No" |
| 5 | **Clear medication match** | Request unambiguously identifies medication | AI natural language matching with confidence > 0.8 |
| 6 | **Status = Active** | Medication not discontinued | Check Status column = "Active" |

---

### Examples of AUTO-APPROVE Cases

#### Example 1: Blood Pressure Medication (Ideal Case)
```
Patient SMS: "I need a refill for my lisinopril"

Medication Record:
- Name: Lisinopril 10mg
- Refills: 3 remaining
- Last Visit: 45 days ago
- Controlled: No
- Status: Active

AI Decision: AUTO-APPROVE ✅
Reasoning: "Patient has 3 refills remaining, last visit was 45 days ago,
medication clearly matches lisinopril on file, not a controlled substance."
Confidence: 0.95
```

**Result**: Sent to pharmacy within 2 minutes, patient receives confirmation SMS.

---

#### Example 2: Diabetes Medication (Clear Match)
```
Patient SMS: "Refill metformin please"

Medication Record:
- Name: Metformin 500mg
- Refills: 2 remaining
- Last Visit: 120 days ago (4 months)
- Controlled: No
- Status: Active

AI Decision: AUTO-APPROVE ✅
Reasoning: "Clear medication match, 2 refills available, last visit within
6-month window, routine diabetes maintenance medication."
Confidence: 0.92
```

---

#### Example 3: Thyroid Medication (Long-term Maintenance)
```
Patient SMS: "I'm running low on my thyroid pill, can I get a refill?"

Medication Record:
- Name: Levothyroxine 50mcg
- Refills: 5 remaining
- Last Visit: 60 days ago
- Controlled: No
- Status: Active

AI Decision: AUTO-APPROVE ✅
Reasoning: "Stable chronic condition medication, plenty of refills,
recent visit, clear match."
Confidence: 0.88
```

---

### Medications Commonly Auto-Approved

**Cardiovascular**:
- ACE Inhibitors (Lisinopril, Enalapril)
- Beta Blockers (Metoprolol, Atenolol)
- Calcium Channel Blockers (Amlodipine)
- Diuretics (Hydrochlorothiazide)
- Statins (Atorvastatin, Simvastatin)

**Endocrine**:
- Metformin (diabetes)
- Levothyroxine (thyroid)
- Glipizide (diabetes)

**Respiratory**:
- Albuterol inhalers
- Montelukast (Singulair)

**Gastrointestinal**:
- Omeprazole (acid reflux)
- Pantoprazole

**Other**:
- Low-dose aspirin
- Vitamin D supplements
- Antihistamines (Cetirizine, Loratadine)

**Why these are safe for auto-approval**:
- Well-established safety profiles
- Unlikely to cause acute harm if dose missed
- Routinely prescribed for chronic conditions
- Low abuse potential

---

## ⚠️ TIER 2: NEEDS-APPROVAL Protocol

### Criteria (ANY is true)

| # | Criterion | Explanation | Why Doctor Review Needed |
|---|-----------|-------------|--------------------------|
| 1 | **Last visit 180-365 days ago** | Patient seen 6-12 months ago | Approaching annual visit, may need labs/exam |
| 2 | **Zero refills remaining** | No authorized refills left | Requires new prescription (doctor must sign) |
| 3 | **Ambiguous request** | Can't clearly identify medication | Risk of sending wrong medication |
| 4 | **Multiple similar meds** | Patient on 2+ similar drugs | Risk of confusion (e.g., two different dosages) |
| 5 | **AI confidence < 0.8** | Uncertain medication match | Safety margin - verify before approving |
| 6 | **High-risk medication** | Warfarin, insulin, immunosuppressants | Requires closer monitoring despite not being controlled |

---

### Examples of NEEDS-APPROVAL Cases

#### Example 1: No Refills Remaining
```
Patient SMS: "Can I get a refill on my metformin?"

Medication Record:
- Name: Metformin 500mg
- Refills: 0 ⚠️
- Last Visit: 210 days ago (7 months)
- Controlled: No

AI Decision: NEEDS-APPROVAL ⚠️
Reasoning: "No refills remaining - requires new prescription. Last visit
was 7 months ago, patient may benefit from scheduling annual checkup."
Recommended Action: "Approve new 90-day supply with 3 refills OR schedule
annual visit first if labs needed."
```

**Doctor Slack message includes**:
- Patient history
- Last labs/visit notes (if integrated with EMR)
- One-click buttons: [✅ Approve Refill] [❌ Deny - Schedule Visit] [📞 Call Patient]

---

#### Example 2: Ambiguous Request
```
Patient SMS: "I need more of my blood pressure medication"

Patient has 3 blood pressure medications:
- Lisinopril 10mg (refills: 2)
- Amlodipine 5mg (refills: 3)
- Hydrochlorothiazide 25mg (refills: 1)

AI Decision: NEEDS-APPROVAL ⚠️
Reasoning: "Patient has 3 active blood pressure medications. Request does
not specify which one. Requires clarification to avoid sending wrong medication."
Recommended Action: "Review which medication patient is running low on, or
call patient to clarify."
```

---

#### Example 3: High-Risk Medication (Warfarin)
```
Patient SMS: "Refill warfarin"

Medication Record:
- Name: Warfarin 5mg
- Refills: 2 remaining
- Last Visit: 90 days ago
- Controlled: No
- Status: Active

AI Decision: NEEDS-APPROVAL ⚠️
Reasoning: "Warfarin is high-risk anticoagulant requiring regular INR
monitoring. Verify recent labs before approving."
Recommended Action: "Check recent INR. If therapeutic, approve. If overdue
for labs, schedule INR check first."
```

**Why warfarin needs approval despite meeting auto-approve criteria**:
- Narrow therapeutic window
- Requires frequent lab monitoring (INR)
- Serious consequences if dosing is wrong (bleeding/clotting)
- **Doctor should add warfarin to high-risk list in AI prompt**

---

#### Example 4: Multiple Dosages (Diabetes)
```
Patient SMS: "Can I get more metformin?"

Patient has:
- Metformin 500mg twice daily (refills: 3)
- Metformin ER 1000mg once daily (refills: 2) ⚠️

AI Decision: NEEDS-APPROVAL ⚠️
Reasoning: "Patient is on two different metformin formulations. Unclear
which one is being requested. Requires clarification."
```

---

### How Doctor Approves via Slack

**Slack message format**:
```
⚠️ Refill Request: Doctor Approval Needed

Patient: John Smith (#12345)
Last Visit: 7 months ago

Request: "Can I get a refill on my metformin?"
Medication: Metformin 500mg (currently taking)
Refills Left: 0 (needs new prescription)
Last Filled: 30 days ago

AI Analysis: No refills remaining. Patient needs new prescription.
Recommended Action: Approve new 90-day supply with 3 refills OR
schedule annual checkup first.

[✅ Approve Refill]  [❌ Deny Refill]  [📞 Call Patient]
```

**Doctor clicks "✅ Approve Refill"**:
1. System sends new prescription to pharmacy (90-day supply, 3 refills)
2. Patient receives SMS: "✅ Refill approved! Your prescription has been sent..."
3. Google Sheet updated: Processed_By = "Dr. Jennifer"
4. Medications sheet updated: Refills_Remaining = 3

**Average time**: 2-4 hours (doctor reviews during breaks between patients)

---

## 🚨 TIER 3: ESCALATE Protocol

### Criteria (ANY is true - IMMEDIATE ACTION REQUIRED)

| # | Criterion | Explanation | Why Immediate Escalation |
|---|-----------|-------------|--------------------------|
| 1 | **Controlled Substance** | Schedule II-V drug | DEA compliance, PDMP check, abuse potential |
| 2 | **Last visit > 365 days** | No visit in over 1 year | Patient needs comprehensive exam before any refills |
| 3 | **New medication request** | Not on current medication list | Requires diagnosis, drug interactions check |
| 4 | **Patient safety concern** | Mentions side effects, adverse reaction | Clinical judgment needed immediately |
| 5 | **Dosage change requested** | Patient wants to change dose/frequency | Requires medical evaluation |
| 6 | **Parse error** | AI can't understand request | Human review essential for safety |

---

### Examples of ESCALATE Cases

#### Example 1: Controlled Substance (Schedule II Opioid)
```
Patient SMS: "I need more oxycodone"

Medication Record:
- Name: Oxycodone 5mg
- Schedule: II (highest control level)
- Refills: 1 remaining
- Last Visit: 20 days ago (post-surgery follow-up)
- Controlled: Yes ⚠️

AI Decision: ESCALATE 🚨
Flags: controlled-substance, schedule-ii, opioid
Reasoning: "DEA Schedule II opioid requires manual verification. Must check
PDMP (Prescription Drug Monitoring Program) before dispensing."
Recommended Action: "Call patient to verify request, check PDMP for
concerning patterns, verify surgical recovery progress. If legitimate,
manually process refill."
```

**Staff receives urgent SMS**:
```
🚨 URGENT REFILL ESCALATION

Patient: Sarah Johnson
Phone: +15555551234
Request: "I need more oxycodone"

⚠️ CONTROLLED SUBSTANCE
⚠️ SCHEDULE II OPIOID

Action: Call patient immediately to verify request and
check PDMP (Prescription Drug Monitoring Program)

- Dr. Jennifer's Office
```

**Slack critical alert** sent simultaneously to `#urgent-refills` channel.

**Staff action checklist**:
- [ ] Call patient within 15 minutes
- [ ] Verify patient identity (DOB, address)
- [ ] Ask about pain level and surgical recovery
- [ ] Check PDMP for concerning patterns (early refills, multiple prescribers)
- [ ] If appropriate, manually send to pharmacy
- [ ] Document in Google Sheets Notes column

**Why this can't be auto-approved**:
- DEA regulations require heightened scrutiny
- Opioid epidemic - must prevent abuse/diversion
- PDMP check is legally required in most states
- Early refills may indicate tolerance, abuse, or diversion

---

#### Example 2: Safety Concern Mentioned
```
Patient SMS: "My blood pressure medication is making me really dizzy.
Can I get a refill anyway?"

Medication Record:
- Name: Lisinopril 10mg
- Refills: 3 remaining
- Last Visit: 60 days ago

AI Decision: ESCALATE 🚨
Flags: safety-concern, side-effects-mentioned
Reasoning: "Patient reports dizziness as side effect. This may indicate
hypotension (blood pressure too low) or other adverse reaction. Requires
clinical evaluation before refill."
Recommended Action: "Call patient immediately. Check recent home BP readings.
May need dose reduction, medication change, or office visit to evaluate."
```

**Why this escalates despite having refills**:
- Dizziness with BP meds = possible hypotension (dangerous)
- May need dose adjustment or medication change
- Continuing same medication could cause falls, injury
- Requires immediate clinical assessment

---

#### Example 3: Patient Not Seen in Over 1 Year
```
Patient SMS: "Can I get a refill on my cholesterol medication?"

Medication Record:
- Name: Atorvastatin 20mg
- Refills: 1 remaining
- Last Visit: 450 days ago ⚠️ (15 months)

AI Decision: ESCALATE 🚨
Flags: overdue-for-visit, no-recent-labs
Reasoning: "Patient has not been seen in over 1 year. Cholesterol medications
require periodic monitoring (liver function, lipid panel). Cannot refill without
updated labs and examination."
Recommended Action: "Schedule patient for office visit with labs before
approving any refills."
```

**Staff response SMS to patient**:
```
Thank you for your refill request.

Our records show it's been 15 months since your last visit.
For your safety, we need to schedule a checkup and run labs
before approving refills.

Please call the office at (555) 555-1234 to schedule.

- Dr. Jennifer's Office
```

---

#### Example 4: Dosage Change Requested
```
Patient SMS: "Can I get my lisinopril increased to 20mg? The 10mg
isn't working as well anymore."

Medication Record:
- Name: Lisinopril 10mg
- Refills: 2 remaining

AI Decision: ESCALATE 🚨
Flags: dosage-change-requested
Reasoning: "Patient requesting dosage increase. Requires blood pressure
evaluation, assessment of current dose effectiveness, and potential drug
interactions check."
Recommended Action: "Schedule office visit or telehealth consult to evaluate
BP control. May need dose adjustment, or addition of second medication."
```

---

#### Example 5: New Medication Not on File
```
Patient SMS: "I'd like to try that new diabetes drug I saw on TV, Ozempic.
Can you send that to my pharmacy?"

AI Decision: ESCALATE 🚨
Flags: new-medication-request, not-on-file
Reasoning: "Patient requesting medication not currently prescribed. Requires
diagnosis review, insurance authorization, patient education, and evaluation
for suitability."
Recommended Action: "Schedule office visit to discuss. Ozempic requires prior
authorization, injection training, and monitoring for side effects."
```

---

### Controlled Substances Requiring ESCALATE

**Schedule II** (No refills allowed federally, new prescription each time):
- Oxycodone (OxyContin, Percocet)
- Hydrocodone (Vicodin, Norco) - *Schedule II since 2014*
- Morphine
- Fentanyl patches
- Adderall (amphetamine/dextroamphetamine)
- Ritalin (methylphenidate)
- Concerta

**Schedule III**:
- Codeine combination products (Tylenol #3)
- Testosterone
- Ketamine
- Anabolic steroids

**Schedule IV**:
- Xanax (alprazolam)
- Ativan (lorazepam)
- Klonopin (clonazepam)
- Ambien (zolpidem)
- Tramadol
- Lyrica (pregabalin)

**Schedule V**:
- Cough syrups with codeine (<200mg/100mL)
- Lomotil (diphenoxylate/atropine)

**Why controlled substances always escalate**:
- DEA regulations require enhanced tracking
- State PDMP check often legally required
- High abuse/diversion potential
- May require patient identity verification
- Some states limit quantity/duration

---

## 🔒 Safety Mechanisms

### 1. Parse Error Failsafe

If AI cannot parse its own response or encounters an error:

```javascript
// From refill-ai-triage.json
catch (error) {
  // Fallback: escalate on parse errors (safety first)
  decision = {
    decision: 'ESCALATE',
    reasoning: 'AI response parsing failed. Escalating for manual review.',
    confidence: 0.0,
    flags: ['parse-error', 'manual-review-required']
  };
}
```

**Principle**: Technical errors NEVER result in auto-approval. When in doubt, escalate.

---

### 2. Confidence Threshold

AI must be confident (>0.8) in medication match for auto-approval:

```
AI Confidence: 0.95 → AUTO-APPROVE (if other criteria met)
AI Confidence: 0.75 → NEEDS-APPROVAL ⚠️ (verify medication identity)
AI Confidence: 0.50 → ESCALATE 🚨 (too uncertain)
```

---

### 3. Audit Trail

Every decision logged to Google Sheets with:
- Patient ID, medication, decision, AI reasoning
- Timestamp, confidence score
- Who processed (AI / Doctor / Staff)
- Flags for concerning patterns

**Used for**:
- DEA audits (controlled substance tracking)
- Quality assurance (weekly doctor review of AI decisions)
- Compliance reporting
- Identifying AI errors for retraining

---

### 4. Doctor Oversight

**Weekly Review Process**:
1. Doctor reviews sample of AUTO-APPROVE decisions (10-20 random cases)
2. Checks for errors: wrong medication, missed contraindications
3. Logs errors in "AI_Quality_Review" sheet
4. If error rate >2%, pause automation and refine protocols

**Monthly Metrics**:
- Total requests, auto-approval rate, escalation rate
- Average confidence scores
- Controlled substance compliance (100% escalated?)
- Patient satisfaction survey results

---

## 📋 Protocol Customization

### Doctor Can Modify:

**1. Last Visit Window**
- Default: 180 days (6 months)
- Can adjust to: 90 days, 120 days, 365 days
- **Where to change**: `refill-ai-triage.json`, line ~45 in system prompt

**2. High-Risk Medication List**
Add medications that should always need approval despite being non-controlled:
- Warfarin (anticoagulant - requires INR monitoring)
- Insulin (diabetes - dosing errors dangerous)
- Immunosuppressants (transplant meds)
- Chemotherapy agents

**How to add**: In `refill-ai-triage.json`, add to system prompt:
```
HIGH-RISK MEDICATIONS (require approval even if not controlled):
- Warfarin: Check recent INR before approving
- Insulin: Verify dosing and recent glucose logs
- Tacrolimus: Check trough levels
```

**3. Refill Threshold**
- Default: Refills_Remaining ≥ 1
- Can change to: ≥ 2 for extra safety margin

---

### Protocol Updates

**How to update after going live**:

1. **Identify need**: Doctor finds AI making suboptimal decisions
2. **Document pattern**: What's happening? Which medications? How often?
3. **Update protocol**: Modify system prompt in `refill-ai-triage.json`
4. **Test update**: Use test patient data to verify new behavior
5. **Deploy**: Update workflow in n8n
6. **Monitor**: Track changes in approval rates, errors

**Example update**:
```
Problem: AI auto-approves albuterol inhalers, but doctor wants to ensure
patients aren't overusing (sign of poor asthma control)

Solution: Add to NEEDS-APPROVAL criteria:
"If albuterol refill requested and last fill was <21 days ago, flag for
review (possible overuse - may need controller medication adjustment)"
```

---

## ✅ Pre-Launch Approval Checklist

**Dr. Jennifer must review and initial each item before automation goes live**:

- [ ] **AUTO-APPROVE criteria align with practice standards** - I agree these are safe for automated approval
- [ ] **NEEDS-APPROVAL criteria are appropriate** - Cases requiring my review are correctly identified
- [ ] **ESCALATE criteria cover all safety concerns** - All controlled substances and high-risk situations properly flagged
- [ ] **Controlled substance list is complete** - All Schedule II-V drugs will escalate
- [ ] **High-risk medications identified** - Any non-controlled drugs needing approval are added (warfarin, insulin, etc.)
- [ ] **Last visit window is appropriate** - 180-day window matches my clinical judgment
- [ ] **Weekly review process understood** - I will review AI decisions weekly for quality assurance
- [ ] **PDMP check process documented** - Staff knows to check PDMP for all controlled substances
- [ ] **Patient communication approved** - SMS templates are appropriate and professional
- [ ] **Slack approval workflow tested** - I've tested clicking Approve/Deny buttons

**Doctor Signature**: _________________________ **Date**: _____________

---

## 📞 Questions for Dr. Jennifer

Before finalizing protocols, please answer:

1. **Last Visit Window**: Is 6 months (180 days) appropriate, or would you prefer 4 months (120 days) or 1 year (365 days)?

2. **High-Risk Medications**: Are there any non-controlled medications you want to ALWAYS require your approval (e.g., warfarin, insulin, immunosuppressants)?

3. **Refill Threshold**: Should we require at least 1 refill remaining, or 2+ for extra safety margin?

4. **Controlled Substance Protocol**: For Schedule III-V (Xanax, Ambien, etc.), is manual verification always required, or can senior staff handle with PDMP check?

5. **Emergency Override**: Should there be a way for patients to request urgent refills (e.g., "traveling tomorrow, need refill")? If so, how should these be handled?

6. **After-Hours Requests**: Refills received after 5 PM - process next morning, or send holding message?

---

**Document Version**: 1.0
**Requires Doctor Approval**: YES - DO NOT ACTIVATE WITHOUT SIGNED APPROVAL
**Last Updated**: January 27, 2026
**Review Frequency**: Monthly for first 3 months, then quarterly
