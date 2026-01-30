# Typeform Medical Intake Form Template

## 🎯 Overview

This document provides the complete structure for building a **HIPAA-compliant medical intake form** in Typeform Business.

**Completion time**: 5-7 minutes
**Total questions**: 20-25 (with conditional logic)
**Form purpose**: Collect patient demographics, insurance, medical history, medications, and allergies before appointment

---

## 📋 Form Structure

### **Welcome Screen**

**Title**: Welcome to Dr. Jennifer's Practice

**Description**:
```
Thank you for choosing Dr. Jennifer's Practice!

To save time at your appointment, please complete this secure intake form.
It should only take 5-7 minutes.

All information is encrypted and HIPAA-compliant.

Your appointment: [appointment_date] at [appointment_time]
```

**Button text**: Get Started

---

## Section 1: Demographics (5 Questions)

### Question 1: Full Name ⭐ REQUIRED
- **Type**: Short Text
- **Field ID**: `full_name`
- **Question**: What is your full legal name?
- **Placeholder**: First Middle Last
- **Validation**: Required
- **Description**: Please enter your name exactly as it appears on your insurance card

---

### Question 2: Date of Birth ⭐ REQUIRED
- **Type**: Date
- **Field ID**: `date_of_birth`
- **Question**: What is your date of birth?
- **Validation**: Required, Must be in the past
- **Format**: MM/DD/YYYY

---

### Question 3: Gender ⭐ REQUIRED
- **Type**: Multiple Choice
- **Field ID**: `gender`
- **Question**: What is your gender?
- **Validation**: Required
- **Options**:
  - Male
  - Female
  - Other
  - Prefer not to say

---

### Question 4: Email
- **Type**: Email
- **Field ID**: `email`
- **Question**: What is your email address?
- **Placeholder**: name@example.com
- **Validation**: Valid email format
- **Description**: We'll use this to send appointment confirmations and test results

---

### Question 5: Phone Number ⭐ REQUIRED
- **Type**: Phone Number
- **Field ID**: `phone`
- **Question**: What is your mobile phone number?
- **Validation**: Required, Valid US phone number
- **Default country**: United States (+1)
- **Description**: We'll use this for appointment reminders and important updates

---

## Section 2: Address (4 Questions)

### Question 6: Street Address ⭐ REQUIRED
- **Type**: Short Text
- **Field ID**: `street_address`
- **Question**: What is your street address?
- **Placeholder**: 123 Main Street, Apt 4B
- **Validation**: Required

---

### Question 7: City ⭐ REQUIRED
- **Type**: Short Text
- **Field ID**: `city`
- **Question**: City
- **Validation**: Required

---

### Question 8: State ⭐ REQUIRED
- **Type**: Dropdown
- **Field ID**: `state`
- **Question**: State
- **Validation**: Required
- **Options**: All 50 US states (dropdown list)
- **Alphabetical**: Yes

---

### Question 9: ZIP Code ⭐ REQUIRED
- **Type**: Short Text
- **Field ID**: `zip_code`
- **Question**: ZIP Code
- **Validation**: Required, 5 digits
- **Placeholder**: 12345

---

## Section 3: Insurance Information (5 Questions)

### Question 10: Insurance Company ⭐ REQUIRED
- **Type**: Short Text
- **Field ID**: `insurance_company`
- **Question**: What is your insurance company name?
- **Placeholder**: e.g., Aetna, Blue Cross Blue Shield, UnitedHealthcare
- **Validation**: Required
- **Description**: Enter the name exactly as it appears on your insurance card

---

### Question 11: Member ID ⭐ REQUIRED
- **Type**: Short Text
- **Field ID**: `member_id`
- **Question**: What is your Member ID (Subscriber ID)?
- **Validation**: Required
- **Description**: Found on the front of your insurance card

---

### Question 12: Policy Number
- **Type**: Short Text
- **Field ID**: `policy_number`
- **Question**: What is your Policy Number?
- **Description**: If different from Member ID. Leave blank if same.

---

### Question 13: Group Number
- **Type**: Short Text
- **Field ID**: `group_number`
- **Question**: What is your Group Number?
- **Description**: Found on your insurance card (if applicable)

---

### Question 14: Insurance Phone
- **Type**: Phone Number
- **Field ID**: `insurance_phone`
- **Question**: What is the customer service phone number on your insurance card?
- **Description**: Usually found on the back of your card

---

## Section 4: Medical History (3 Questions)

### Question 15: Current Medical Conditions
- **Type**: Multiple Choice (Allow multiple selections)
- **Field ID**: `current_conditions`
- **Question**: Do you currently have any of the following conditions? (Select all that apply)
- **Options**:
  - ☐ Diabetes
  - ☐ High Blood Pressure (Hypertension)
  - ☐ Heart Disease
  - ☐ Asthma
  - ☐ COPD
  - ☐ Cancer (current or past)
  - ☐ Kidney Disease
  - ☐ Liver Disease
  - ☐ Thyroid Disorder
  - ☐ Arthritis
  - ☐ Depression/Anxiety
  - ☐ Other (please specify below)
  - ☐ None of the above

---

### Question 16: Past Surgeries
- **Type**: Long Text
- **Field ID**: `past_surgeries`
- **Question**: Have you had any surgeries? If yes, please list them and approximate dates.
- **Placeholder**: e.g., Appendectomy (2018), Knee surgery (2020)
- **Description**: Leave blank if none

---

### Question 17: Family Medical History
- **Type**: Long Text
- **Field ID**: `family_history`
- **Question**: Please describe any significant medical conditions in your immediate family (parents, siblings).
- **Placeholder**: e.g., Mother: Diabetes, Father: Heart disease
- **Description**: This helps us provide better preventive care. Leave blank if none.

---

## Section 5: Medications (2 Questions with Logic Jump)

### Question 18: Takes Medications? ⭐ REQUIRED
- **Type**: Yes/No
- **Field ID**: `takes_medications`
- **Question**: Do you currently take any medications (prescription or over-the-counter)?
- **Validation**: Required

**Logic Jump**:
- If **Yes** → Show Question 19
- If **No** → Skip to Question 20

---

### Question 19: Medication List (Conditional)
- **Type**: Long Text
- **Field ID**: `medications`
- **Question**: Please list all medications you currently take, including dosage.
- **Placeholder**: e.g., Lisinopril 10mg once daily, Metformin 500mg twice daily, Aspirin 81mg daily
- **Validation**: Required (if shown)
- **Description**: Include vitamins and supplements

**Show if**: Question 18 = Yes

---

## Section 6: Allergies (2 Questions with Logic Jump)

### Question 20: Has Allergies? ⭐ REQUIRED
- **Type**: Yes/No
- **Field ID**: `has_allergies`
- **Question**: Do you have any allergies (medications, foods, environmental)?
- **Validation**: Required

**Logic Jump**:
- If **Yes** → Show Question 21
- If **No** → Skip to Question 22

---

### Question 21: Allergy List (Conditional)
- **Type**: Long Text
- **Field ID**: `allergies`
- **Question**: Please list all allergies and the reaction you experience.
- **Placeholder**: e.g., Penicillin (rash), Peanuts (anaphylaxis), Pollen (sneezing)
- **Validation**: Required (if shown)
- **Description**: ⚠️ Important: Include severity of reaction

**Show if**: Question 20 = Yes

---

## Section 7: Emergency Contact (3 Questions)

### Question 22: Emergency Contact Name ⭐ REQUIRED
- **Type**: Short Text
- **Field ID**: `emergency_name`
- **Question**: Emergency contact: Full name
- **Validation**: Required

---

### Question 23: Emergency Contact Relationship ⭐ REQUIRED
- **Type**: Dropdown
- **Field ID**: `emergency_relationship`
- **Question**: Relationship to you
- **Validation**: Required
- **Options**:
  - Spouse
  - Parent
  - Child
  - Sibling
  - Friend
  - Other

---

### Question 24: Emergency Contact Phone ⭐ REQUIRED
- **Type**: Phone Number
- **Field ID**: `emergency_phone`
- **Question**: Emergency contact: Phone number
- **Validation**: Required, Valid US phone number

---

## Section 8: Consent & Confirmation (1 Question)

### Question 25: Consent Checkbox ⭐ REQUIRED
- **Type**: Legal (Checkbox)
- **Field ID**: `consent`
- **Question**: Please confirm the following:
- **Validation**: Required (must check to submit)
- **Checkbox text**:
```
☐ I confirm that all information provided is accurate and complete to the best of my knowledge.

☐ I authorize Dr. Jennifer's Practice to use this information for my medical care and insurance billing.

☐ I understand this form is transmitted securely and is HIPAA-compliant.
```

---

## **Thank You Screen**

**Title**: ✅ Thank you! Your form has been submitted.

**Message**:
```
Your intake information has been received and your medical record has been updated.

You're all set for your appointment on [appointment_date] at [appointment_time].

What to bring:
• Photo ID
• Insurance card
• Payment for any copay ($[copay_amount] if applicable)

We look forward to seeing you!

- Dr. Jennifer's Practice
```

**Button**: Close

---

## 🔒 HIPAA Compliance Settings

### Required Typeform Business Settings

**Before using this form in production, configure these settings in Typeform:**

1. **Enable HIPAA Mode**
   - Settings → Security → Enable HIPAA Compliance
   - This encrypts all responses at rest

2. **Disable Analytics & Tracking**
   - Settings → Tracking → Disable Google Analytics
   - Settings → Tracking → Disable Facebook Pixel
   - Settings → Tracking → Disable all third-party trackers

3. **Data Retention**
   - Settings → Data Retention → Set to 30 days
   - Responses older than 30 days are automatically deleted

4. **Access Controls**
   - Share → Limit access to authorized staff only
   - Enable password protection for form admin access
   - Enable 2FA for all Typeform team members

5. **SSL/HTTPS**
   - Always enabled by default on Typeform
   - Verify green padlock in browser

6. **Webhook Security**
   - Settings → Webhooks → Use HTTPS endpoint only
   - Add webhook secret for verification

7. **Download Restrictions**
   - Settings → Responses → Disable CSV export for non-admin users
   - Limit who can download patient data

---

## 🔗 Hidden Fields Configuration

**Pass these fields via URL to track patient context:**

In the n8n workflow, these are automatically appended to the form URL:

```
?patient_name=[value]
&appointment_id=[value]
&phone=[value]
&appointment_date=[value]
&appointment_time=[value]
&insurance_company=[value]
&member_id=[value]
```

**To configure in Typeform:**

1. Go to **Connect** tab
2. Click **Hidden fields**
3. Add each field:
   - `patient_name` (text)
   - `appointment_id` (text)
   - `phone` (text)
   - `appointment_date` (text)
   - `appointment_time` (text)
   - `insurance_company` (text)
   - `member_id` (text)

These fields are **not visible** to the patient but are captured in the submission and used to match back to the appointment in Google Sheets.

---

## 🎨 Design & Branding

### Recommended Settings

**Theme**:
- **Font**: Clean sans-serif (e.g., Helvetica, Open Sans)
- **Colors**: Professional medical palette
  - Primary: Blue (#2E5C8A) - trust, professionalism
  - Accent: Teal (#17A2B8) - calm, health
  - Background: White (#FFFFFF)
- **Button style**: Rounded corners, clear CTA text

**Layout**:
- **One question per screen** (recommended for medical forms)
- **Progress bar**: Show (helps patient see how much is left)
- **Question numbering**: Show (e.g., "Question 5 of 25")

**Mobile Optimization**:
- Test on mobile devices (80% of patients use phones)
- Large touch targets for buttons
- Short questions and clear labels

**Custom branding**:
- Add practice logo to Welcome screen
- Add practice photo or stock medical image
- Include practice address and phone in Thank You screen

---

## 📊 Field Mapping to Athenahealth FHIR

**This table shows how Typeform fields map to FHIR resources:**

| Typeform Field | FHIR Resource | FHIR Field Path | Notes |
|----------------|---------------|-----------------|-------|
| `full_name` | Patient | `name[0].text` | Full name |
| `full_name` (parsed) | Patient | `name[0].given[0]` | First name |
| `full_name` (parsed) | Patient | `name[0].family` | Last name |
| `date_of_birth` | Patient | `birthDate` | Format: YYYY-MM-DD |
| `gender` | Patient | `gender` | Values: male, female, other, unknown |
| `email` | Patient | `telecom[1].value` | System: email |
| `phone` | Patient | `telecom[0].value` | System: phone |
| `street_address` | Patient | `address[0].line[0]` | |
| `city` | Patient | `address[0].city` | |
| `state` | Patient | `address[0].state` | |
| `zip_code` | Patient | `address[0].postalCode` | |
| `insurance_company` | Coverage | `payor[0].display` | |
| `member_id` | Coverage | `class[0].value` | Type: Member ID |
| `policy_number` | Coverage | `class[1].value` | Type: Policy Number |
| `group_number` | Coverage | `class[2].value` | Type: Group Number |
| `allergies` | AllergyIntolerance | `code.text` | Split by comma for multiple |
| `medications` | MedicationStatement | `medicationCodeableConcept.text` | Split by comma for multiple |
| `emergency_name` | Patient | `contact[0].name.text` | |
| `emergency_relationship` | Patient | `contact[0].relationship[0].text` | |
| `emergency_phone` | Patient | `contact[0].telecom[0].value` | System: phone |

**See `ATHENAHEALTH_API_INTEGRATION.md` for detailed mapping code.**

---

## 🧪 Testing Checklist

Before deploying to production:

### Functionality Tests
- [ ] All required fields enforce validation
- [ ] Logic jumps work correctly (medications, allergies)
- [ ] Hidden fields capture correctly from URL parameters
- [ ] Form submits successfully
- [ ] Thank You screen displays with correct appointment info
- [ ] Webhook fires to n8n on submission
- [ ] Mobile responsive on iPhone and Android

### Data Quality Tests
- [ ] Test with various name formats (Jr., III, hyphenated)
- [ ] Test with PO Box addresses
- [ ] Test with international phone numbers (if applicable)
- [ ] Test with multiple allergies (comma-separated)
- [ ] Test with "None" responses for optional sections

### HIPAA Compliance Tests
- [ ] HIPAA mode enabled in Typeform
- [ ] No third-party trackers active
- [ ] Form uses HTTPS (padlock in browser)
- [ ] Webhook endpoint uses HTTPS
- [ ] Data retention policy set to 30 days
- [ ] Access limited to authorized staff only

### User Experience Tests
- [ ] Completion time is 5-7 minutes (test with real user)
- [ ] Questions are clear and unambiguous
- [ ] Error messages are helpful
- [ ] Progress bar works correctly
- [ ] Mobile experience is smooth

---

## 💡 Customization Tips

### For Different Specialties

**Pediatrics**:
- Add: Parent/Guardian name
- Add: Child's school name
- Add: Immunization records

**Cardiology**:
- Add: Family history of heart disease
- Add: Exercise habits
- Add: Smoking history

**OB/GYN**:
- Add: Last menstrual period
- Add: Pregnancy history
- Add: Birth control method

**Mental Health**:
- Add: Current symptoms (PHQ-9 scale)
- Add: Previous therapy experience
- Add: Support system questions

### For Multi-Location Practices

Add question:
- **Type**: Dropdown
- **Question**: Which office location is your appointment at?
- **Options**: List all practice locations
- **Field ID**: `office_location`

---

## 📞 Support & Resources

**Typeform HIPAA Documentation**:
- https://www.typeform.com/help/hipaa-compliance/

**FHIR R4 Specification**:
- https://www.hl7.org/fhir/patient.html
- https://www.hl7.org/fhir/allergyintolerance.html
- https://www.hl7.org/fhir/medicationstatement.html

**Typeform API Documentation**:
- https://developer.typeform.com/webhooks/

**Best Practices**:
- Keep forms under 10 minutes completion time
- Use conditional logic to reduce question count
- Test on mobile devices before launch
- A/B test question wording for clarity

---

## ✅ Quick Start Checklist

To create this form in Typeform:

1. [ ] Sign up for Typeform Business (required for HIPAA)
2. [ ] Request and sign BAA from Typeform
3. [ ] Create new form from scratch
4. [ ] Copy questions from this template (Sections 1-8)
5. [ ] Configure hidden fields (7 fields from URL parameters)
6. [ ] Set up logic jumps (medications, allergies)
7. [ ] Enable HIPAA mode and security settings
8. [ ] Add practice branding (logo, colors, photos)
9. [ ] Test form submission end-to-end
10. [ ] Configure webhook to n8n (see setup guide)
11. [ ] Test with sample patient data
12. [ ] Get compliance officer approval
13. [ ] Launch to real patients

---

**Form Template Version**: 1.0
**Last Updated**: January 27, 2026
**Created for**: Dr. Jennifer's Medical Practice Automation Suite - Part 3 of 5

**Total Setup Time**: 45-60 minutes
**Estimated Completion Rate**: 85% (with 24hr reminder)
**Average Completion Time**: 5-7 minutes
