# Google Sheets Structure for Refill Automation

## 🎯 Overview

This automation requires **TWO new sheets** to be added to your existing Google Sheets workbook:

1. **Refill_Requests** - Audit log of all refill requests (for compliance and quality tracking)
2. **Medications** - Patient medication database (source of truth for active prescriptions)

**IMPORTANT**: These sheets work alongside the existing "Appointments" sheet from Automations 1-3. Do NOT delete or modify existing sheets.

---

## 📋 Sheet 1: Refill_Requests (Audit Log)

### Purpose
Logs every refill request for compliance, quality assurance, and performance metrics. Required for DEA audits and HIPAA compliance.

### How to Create

1. In your existing Google Sheets workbook, create a new sheet named **exactly**: `Refill_Requests`
2. Add the following columns in **Row 1** (headers):

---

### Column Structure

| Column Letter | Column Name | Data Type | Description | Example Value |
|---------------|-------------|-----------|-------------|---------------|
| A | Request_ID | Text | Unique identifier for each request | REFILL-12345-1738000000000 |
| B | Patient_Name | Text | Full legal name | John Smith |
| C | Patient_ID | Text | Patient identifier | PT-12345 |
| D | Phone | Text | Patient phone (E.164 format) | +15555551234 |
| E | Medication | Text | Requested medication name + dosage | Lisinopril 10mg |
| F | Request_Text | Text | Original SMS message from patient | "I need a refill for my blood pressure medication" |
| G | Request_Date | Datetime | When request was received | 01/27/2026 14:30:00 |
| H | Decision | Text | AI decision | AUTO-APPROVE |
| I | AI_Reasoning | Text | Why AI made this decision | "Patient has 3 refills remaining, last visit was 45 days ago, not a controlled substance" |
| J | AI_Confidence | Number | Confidence score 0.0-1.0 | 0.95 |
| K | Pharmacy_Status | Text | Transmission status | Sent / Pending / Failed / Escalated |
| L | Patient_Notified | Text | Was patient sent confirmation SMS? | Yes / No |
| M | Processed_By | Text | Who handled the request | AI Auto-Approve |
| N | Flags | Text | Warning flags (comma-separated) | controlled-substance, safety-concern |
| O | Notes | Text | Staff manual notes | "Called patient to verify opioid request per PDMP" |
| P | Processed_Date | Datetime | When fully processed | 01/27/2026 14:32:15 |

---

### Sample Data (Row 2)

Copy this into Row 2 as a template:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REFILL-12345-1738000000 | John Smith | PT-12345 | +15555551234 | Lisinopril 10mg | I need a refill for my blood pressure medication | 01/27/2026 14:30:00 | AUTO-APPROVE | Patient has 3 refills remaining, last visit was 45 days ago, not a controlled substance | 0.95 | Sent | Yes | AI Auto-Approve | | | 01/27/2026 14:32:15 |

---

### Conditional Formatting (Optional but Recommended)

Color-code by decision for quick visual scanning:

1. **Select column H** (Decision column)
2. Format → Conditional formatting
3. Add three rules:

**Rule 1: AUTO-APPROVE = Green**
- Format cells if: Text is exactly `AUTO-APPROVE`
- Background color: Light green (#d9ead3)

**Rule 2: NEEDS-APPROVAL = Yellow**
- Format cells if: Text is exactly `NEEDS-APPROVAL`
- Background color: Light yellow (#fff2cc)

**Rule 3: ESCALATE = Red**
- Format cells if: Text is exactly `ESCALATE`
- Background color: Light red (#f4cccc)

---

### Data Entry Notes

**Who enters data?**
- **n8n workflows auto-populate** all rows (no manual entry required)
- **Staff can add notes** in column O (Notes) after processing escalations

**How often to review?**
- **Daily**: Check for ESCALATE requests and ensure staff handled them
- **Weekly**: Doctor reviews AI_Reasoning for accuracy (quality assurance)
- **Monthly**: Export for compliance reporting (DEA, state boards)

---

### Data Retention

**HIPAA Requirement**: Retain for **7 years**

**How to archive**:
1. At end of each year, copy all rows to a new sheet named "Refill_Requests_2026_Archive"
2. Delete archived rows from main "Refill_Requests" sheet
3. Keep archive sheet in the same workbook (or export to secure storage)

---

## 💊 Sheet 2: Medications (Patient Medication Database)

### Purpose
Central source of truth for all active patient medications. AI uses this to validate refill requests and match medications.

### How to Create

1. In your existing Google Sheets workbook, create a new sheet named **exactly**: `Medications`
2. Add the following columns in **Row 1** (headers):

---

### Column Structure

| Column Letter | Column Name | Data Type | Description | Example Value |
|---------------|-------------|-----------|-------------|---------------|
| A | Medication_ID | Text | Unique medication record ID | MED-12345-001 |
| B | Patient_ID | Text | Patient identifier (links to patient) | PT-12345 |
| C | Patient_Name | Text | Full legal name | John Smith |
| D | Medication_Name | Text | Generic name (preferred) or brand name | Lisinopril |
| E | Dosage | Text | Strength and form | 10mg tablet |
| F | Frequency | Text | How often to take | Once daily |
| G | Last_Filled_Date | Date | Most recent pharmacy fill date | 12/28/2025 |
| H | Refills_Remaining | Number | Refills left on current prescription | 3 |
| I | Controlled_Substance | Text | Yes/No | No |
| J | Schedule | Text | DEA schedule (if controlled) | N/A |
| K | Prescriber | Text | Doctor who prescribed | Dr. Jennifer |
| L | Pharmacy | Text | Patient's preferred pharmacy | CVS Pharmacy #12345 |
| M | Pharmacy_NCPDP | Text | 7-digit NCPDP pharmacy ID | 1234567 |
| N | Pharmacy_Phone | Text | Pharmacy phone number | +18005551234 |
| O | Status | Text | Active or Inactive | Active |
| P | Start_Date | Date | When first prescribed | 06/15/2024 |
| Q | End_Date | Date | When discontinued (if applicable) | (blank if active) |
| R | Notes | Text | Clinical notes | "For hypertension. Monitor BP monthly." |

---

### Sample Data (3 example medications)

**Row 2** (Routine medication - auto-approve eligible):
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MED-12345-001 | PT-12345 | John Smith | Lisinopril | 10mg tablet | Once daily | 12/28/2025 | 3 | No | N/A | Dr. Jennifer | CVS Pharmacy #12345 | 1234567 | +18005551234 | Active | 06/15/2024 | | For hypertension. Monitor BP monthly. |

**Row 3** (No refills - needs approval):
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MED-12345-002 | PT-12345 | John Smith | Metformin | 500mg tablet | Twice daily | 01/15/2026 | **0** | No | N/A | Dr. Jennifer | CVS Pharmacy #12345 | 1234567 | +18005551234 | Active | 03/10/2023 | | For type 2 diabetes. A1C = 6.8%. |

**Row 4** (Controlled substance - auto-escalate):
| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| MED-67890-001 | PT-67890 | Sarah Johnson | Oxycodone | 5mg tablet | Every 6 hours as needed | 01/20/2026 | 1 | **Yes** | **II** | Dr. Jennifer | Walgreens #99999 | 9876543 | +18005559999 | Active | 01/05/2026 | | Post-surgical pain. Reviewed PDMP 01/05/2026. |

---

### Conditional Formatting (Controlled Substances)

Highlight controlled substances for easy identification:

1. **Select column I** (Controlled_Substance)
2. Format → Conditional formatting
3. Add rule:
   - Format cells if: Text is exactly `Yes`
   - Background color: Light red (#f4cccc)
   - Bold text

---

### How to Populate This Sheet

**Option 1: Manual Entry** (For initial setup)
1. Export medication list from your EMR (Athenahealth, DrChrono, etc.)
2. Copy/paste into Google Sheets
3. Clean up formatting, ensure columns match

**Option 2: Athenahealth FHIR API** (Automated sync)
1. Use Athenahealth FHIR API to fetch MedicationStatement resources
2. Build n8n workflow to sync medications nightly
3. See [ATHENAHEALTH_API_INTEGRATION.md](ATHENAHEALTH_API_INTEGRATION.md) for details

**Option 3: Typeform Intake** (From Automation 3)
1. Patients submit medication list via intake form
2. Workflow automatically adds to Medications sheet
3. Staff verifies accuracy before activation

---

### Data Entry Best Practices

**Medication_Name**:
- ✅ Use **generic names** when possible (Lisinopril, not Zestril)
- ✅ Be consistent with spelling/capitalization
- ❌ Avoid abbreviations (write "Hydrochlorothiazide", not "HCTZ")

**Dosage**:
- ✅ Include unit (mg, mcg, mL) and form (tablet, capsule, liquid)
- ✅ Examples: "10mg tablet", "500mg capsule", "5mg/mL liquid"

**Frequency**:
- ✅ Use plain language: "Once daily", "Twice daily", "Every 6 hours"
- ✅ Include "as needed" if applicable: "Every 4-6 hours as needed for pain"

**Controlled_Substance**:
- ✅ "Yes" for Schedule II-V drugs (opioids, stimulants, benzodiazepines, sleep aids)
- ✅ "No" for all others
- ⚠️ **This is critical** - AI uses this to auto-escalate controlled substances

**Schedule** (DEA classification):
- Schedule II: Oxycodone, Adderall, Ritalin, Fentanyl (highest abuse potential, no refills allowed federally)
- Schedule III: Codeine, Ketamine, Anabolic steroids
- Schedule IV: Xanax, Ativan, Ambien, Tramadol
- Schedule V: Lyrica, Cough syrups with codeine
- N/A: Non-controlled medications

**Pharmacy_NCPDP**:
- ✅ Always 7 digits (e.g., 1234567)
- ✅ Find using [NCPDP Pharmacy Locator](https://nabp.pharmacy/resources/ncpdp-pharmacy-locator/)
- ⚠️ **Critical for pharmacy transmission** - incorrect NCPDP = prescription fails

**Status**:
- "Active" = Currently prescribed, patient taking
- "Inactive" = Discontinued or completed
- ⚠️ **AI only matches Active medications**

---

### Updating Medications

**When to update**:
- Patient gets new prescription → Add row
- Prescription discontinued → Change Status to "Inactive", add End_Date
- Refill filled at pharmacy → Update Last_Filled_Date, decrease Refills_Remaining
- New prescription written → Reset Refills_Remaining (typically 3-12 refills)

**Who updates**:
- **Staff**: After doctor appointments (new prescriptions, discontinuations)
- **Pharmacy sync**: If integrated with pharmacy system (advanced)
- **n8n workflow**: After auto-approved refills sent to pharmacy

---

## 📊 Sheet Relationships

### How Sheets Connect

```
┌──────────────────────────────────────────────────────────────┐
│  PATIENTS Sheet (from Automation 1)                          │
│  Contains: Patient_ID, Patient_Name, Phone, DOB, Last_Visit  │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              │ Links via Patient_ID
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
┌───────────────────────────┐   ┌──────────────────────────┐
│  MEDICATIONS Sheet        │   │  REFILL_REQUESTS Sheet   │
│  Source of truth for meds │   │  Audit log of requests   │
└───────────────────────────┘   └──────────────────────────┘
        │
        │ AI matches requested med
        │ against this list
        ▼
    DECISION MADE
```

**Example Lookup Flow**:
1. Patient texts: "I need a refill for my blood pressure medication"
2. Workflow looks up patient by phone in **Patients** sheet → finds Patient_ID
3. Workflow filters **Medications** sheet for this Patient_ID → finds all active meds
4. AI matches "blood pressure medication" → Lisinopril 10mg
5. AI checks: Refills_Remaining = 3, Controlled_Substance = No, Status = Active
6. AI decides: AUTO-APPROVE
7. Workflow logs to **Refill_Requests** sheet

---

## 🔍 Formulas and Automation (Optional)

### Auto-Calculate Days Since Last Fill

Add a helper column to Medications sheet:

**Column S: Days_Since_Last_Fill**

Formula in S2 (drag down):
```
=IF(G2<>"", TODAY()-G2, "")
```

This shows how many days since patient last filled medication (useful for identifying overdue refills).

---

### Flag Expiring Refills

Add a helper column to Medications sheet:

**Column T: Refill_Status**

Formula in T2 (drag down):
```
=IF(O2="Inactive", "Discontinued",
   IF(H2=0, "⚠️ NO REFILLS",
      IF(H2<=2, "⚠️ LOW REFILLS", "✅ OK")))
```

Color-code this column:
- Red: "⚠️ NO REFILLS"
- Yellow: "⚠️ LOW REFILLS"
- Green: "✅ OK"

---

### Monthly Refill Summary (Dashboard)

Create a new sheet named "Refill_Dashboard" with these formulas:

**Total refills this month**:
```
=COUNTIFS(Refill_Requests!G:G, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

**Auto-approval rate**:
```
=COUNTIFS(Refill_Requests!H:H, "AUTO-APPROVE", Refill_Requests!G:G, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1)) / COUNTIFS(Refill_Requests!G:G, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

**Average AI confidence**:
```
=AVERAGEIFS(Refill_Requests!J:J, Refill_Requests!G:G, ">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1))
```

---

## 🧪 Testing Your Sheets

### Validation Checklist

Before activating the automation, verify:

**Refill_Requests Sheet**:
- [ ] Sheet name is exactly "Refill_Requests" (case-sensitive)
- [ ] All 16 columns (A-P) have correct headers
- [ ] Sample row exists with realistic data
- [ ] Conditional formatting applied to Decision column

**Medications Sheet**:
- [ ] Sheet name is exactly "Medications" (case-sensitive)
- [ ] All 18 columns (A-R) have correct headers
- [ ] At least 5 sample medications added for testing
- [ ] Includes mix of controlled and non-controlled substances
- [ ] Controlled_Substance column conditional formatting applied
- [ ] All active medications have Refills_Remaining > 0

**Integration Test**:
- [ ] Google Sheets ID added to n8n environment variables
- [ ] n8n workflow can read from Medications sheet
- [ ] n8n workflow can write to Refill_Requests sheet
- [ ] Test SMS triggers correct lookup and logging

---

## 📞 Troubleshooting

### Issue: Workflow can't find sheet

**Error**: "Sheet 'Refill_Requests' not found"

**Solutions**:
- Check exact spelling (case-sensitive): `Refill_Requests` not `refill_requests`
- Ensure sheet is in the same workbook as Appointments sheet
- Verify Google Sheets ID in n8n environment variable is correct

---

### Issue: Patient medications not found

**Error**: "No medications found for patient PT-12345"

**Solutions**:
- Verify Patient_ID in Medications sheet matches Patient_ID in Patients sheet
- Check Status column = "Active" (workflow filters out Inactive)
- Ensure there's no extra spaces in Patient_ID cells

---

### Issue: Controlled substances not escalating

**Error**: AI auto-approves opioid refill

**Solutions**:
- Check Controlled_Substance column = "Yes" (exact spelling, case-sensitive)
- Verify Medications sheet name is exactly "Medications"
- Re-import workflow if this column was added after initial import

---

## 📚 Related Documentation

- [REFILL_README.md](REFILL_README.md) - Full automation overview and ROI
- [REFILL_SETUP_GUIDE.md](REFILL_SETUP_GUIDE.md) - Step-by-step deployment
- [REFILL_AI_PROTOCOL.md](REFILL_AI_PROTOCOL.md) - Clinical decision rules
- [ATHENAHEALTH_API_INTEGRATION.md](ATHENAHEALTH_API_INTEGRATION.md) - Automated medication sync

---

**Document Version**: 1.0
**Last Updated**: January 27, 2026
**Setup Time**: 30-45 minutes (manual entry) or 2 hours (with EMR export/cleanup)
