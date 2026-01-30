# Athenahealth FHIR API Integration Guide

## 🎯 Overview

This technical guide provides detailed information on integrating with the **Athenahealth FHIR R4 API** to automatically create patient records from Typeform intake submissions.

**API Version**: FHIR R4 (HL7 FHIR Release 4)
**Authentication**: OAuth 2.0 (Client Credentials Grant)
**Base URL (Production)**: `https://api.platform.athenahealth.com/fhir/r4/`
**Base URL (Preview)**: `https://api.preview.platform.athenahealth.com/fhir/r4/`

---

## 📚 Table of Contents

1. [API Authentication](#api-authentication)
2. [FHIR Resources Used](#fhir-resources-used)
3. [Data Mapping: Typeform → FHIR](#data-mapping-typeform--fhir)
4. [Patient Resource Creation](#patient-resource-creation)
5. [Coverage Resource (Insurance)](#coverage-resource-insurance)
6. [AllergyIntolerance Resource](#allergyintolerance-resource)
7. [MedicationStatement Resource](#medicationstatement-resource)
8. [Search Before Create (Duplicate Prevention)](#search-before-create-duplicate-prevention)
9. [Error Handling](#error-handling)
10. [Testing in Preview Environment](#testing-in-preview-environment)
11. [Production Deployment](#production-deployment)
12. [Advanced Features](#advanced-features)

---

## 🔐 API Authentication

### OAuth 2.0 Client Credentials Flow

Athenahealth uses **Client Credentials Grant** for server-to-server authentication.

**Token Endpoint**:
```
POST https://api.platform.athenahealth.com/oauth2/v1/token
```

**Request Headers**:
```http
Content-Type: application/x-www-form-urlencoded
Authorization: Basic {Base64(client_id:client_secret)}
```

**Request Body**:
```
grant_type=client_credentials
scope=patient/*.* athena/service/Athenanet.MDP.*
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "patient/*.* athena/service/Athenanet.MDP.*"
}
```

**Token Lifetime**: 1 hour (3600 seconds)

**n8n Configuration** (already in workflow):
- **Authentication**: OAuth2 API (generic credential)
- **Grant Type**: Client Credentials
- **Access Token URL**: `https://api.platform.athenahealth.com/oauth2/v1/token`
- **Client ID**: From Athenahealth Developer Portal
- **Client Secret**: From Athenahealth Developer Portal
- **Scope**: `patient/*.* athena/service/Athenanet.MDP.*`
- **Authentication**: Send as Basic Auth header

n8n automatically handles token refresh when it expires.

---

## 🔗 FHIR Resources Used

The intake form workflow creates these FHIR resources:

| Resource Type | Purpose | Endpoint |
|---------------|---------|----------|
| **Patient** | Core demographics, contact info, address | `/Patient` |
| **Coverage** | Insurance information | `/Coverage` |
| **AllergyIntolerance** | Patient allergies | `/AllergyIntolerance` |
| **MedicationStatement** | Current medications | `/MedicationStatement` |

**Note**: All resources follow **FHIR R4 specification**.

---

## 🗺️ Data Mapping: Typeform → FHIR

### Complete Field Mapping Table

| Typeform Field | FHIR Resource | FHIR Path | Data Type | Required | Notes |
|----------------|---------------|-----------|-----------|----------|-------|
| `full_name` | Patient | `name[0].text` | string | ✅ | Full name as entered |
| `full_name` (parsed) | Patient | `name[0].given[0]` | string | ✅ | First name |
| `full_name` (parsed) | Patient | `name[0].family` | string | ✅ | Last name |
| `date_of_birth` | Patient | `birthDate` | date (YYYY-MM-DD) | ✅ | Convert from MM/DD/YYYY |
| `gender` | Patient | `gender` | code | ✅ | male, female, other, unknown |
| `email` | Patient | `telecom[1].value` | string | ❌ | system: email |
| `phone` | Patient | `telecom[0].value` | string | ✅ | system: phone, E.164 format |
| `street_address` | Patient | `address[0].line[0]` | string | ❌ | |
| `city` | Patient | `address[0].city` | string | ❌ | |
| `state` | Patient | `address[0].state` | string | ❌ | 2-letter code |
| `zip_code` | Patient | `address[0].postalCode` | string | ❌ | 5 or 9 digits |
| `insurance_company` | Coverage | `payor[0].display` | string | ❌ | Insurance name |
| `member_id` | Coverage | `class[0].value` | string | ❌ | Type: Member ID |
| `policy_number` | Coverage | `class[1].value` | string | ❌ | Type: Policy Number |
| `group_number` | Coverage | `class[2].value` | string | ❌ | Type: Group Number |
| `allergies` | AllergyIntolerance | `code.text` | string | ❌ | Split by comma |
| `medications` | MedicationStatement | `medicationCodeableConcept.text` | string | ❌ | Split by comma |
| `emergency_name` | Patient | `contact[0].name.text` | string | ❌ | Emergency contact |
| `emergency_relationship` | Patient | `contact[0].relationship[0].text` | string | ❌ | |
| `emergency_phone` | Patient | `contact[0].telecom[0].value` | string | ❌ | system: phone |

**✅ = Required by Athenahealth API**

---

## 👤 Patient Resource Creation

### Minimal Required Patient Resource

```json
{
  "resourceType": "Patient",
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["John"],
      "text": "John Smith"
    }
  ],
  "gender": "male",
  "birthDate": "1980-01-15"
}
```

### Complete Patient Resource (from workflow)

```json
{
  "resourceType": "Patient",
  "identifier": [
    {
      "system": "http://dr-jennifer-practice.com/patient-id",
      "value": "APT-01282026-1030AM-John-Smith"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["John"],
      "text": "John Smith"
    }
  ],
  "telecom": [
    {
      "system": "phone",
      "value": "+15551234567",
      "use": "mobile"
    },
    {
      "system": "email",
      "value": "john.smith@example.com",
      "use": "home"
    }
  ],
  "gender": "male",
  "birthDate": "1980-01-15",
  "address": [
    {
      "use": "home",
      "type": "both",
      "line": ["123 Main Street, Apt 4B"],
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701",
      "country": "US"
    }
  ],
  "contact": [
    {
      "relationship": [
        {
          "text": "Spouse"
        }
      ],
      "name": {
        "text": "Jane Smith"
      },
      "telecom": [
        {
          "system": "phone",
          "value": "+15559876543"
        }
      ]
    }
  ]
}
```

### API Request

**Endpoint**:
```
POST https://api.platform.athenahealth.com/fhir/r4/Patient
```

**Headers**:
```http
Authorization: Bearer {access_token}
Content-Type: application/fhir+json
Accept: application/fhir+json
```

**Request Body**: JSON from above

### API Response

**Success (HTTP 201 Created)**:
```json
{
  "resourceType": "Patient",
  "id": "12345",
  "meta": {
    "versionId": "1",
    "lastUpdated": "2026-01-27T18:45:00.000Z"
  },
  "identifier": [
    {
      "system": "http://dr-jennifer-practice.com/patient-id",
      "value": "APT-01282026-1030AM-John-Smith"
    }
  ],
  "name": [
    {
      "use": "official",
      "family": "Smith",
      "given": ["John"],
      "text": "John Smith"
    }
  ],
  "gender": "male",
  "birthDate": "1980-01-15"
  // ... rest of patient data
}
```

**Key Fields to Extract**:
- `id`: Patient ID (e.g., `12345`) - Store in Google Sheet as `Athenahealth_Patient_ID`
- `meta.lastUpdated`: Timestamp of creation

---

## 🏥 Coverage Resource (Insurance)

### FHIR Coverage Resource

```json
{
  "resourceType": "Coverage",
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/v3-ActCode",
        "code": "HIP",
        "display": "Health Insurance Plan"
      }
    ],
    "text": "Health Insurance"
  },
  "subscriber": {
    "reference": "Patient/12345"
  },
  "beneficiary": {
    "reference": "Patient/12345"
  },
  "payor": [
    {
      "display": "Aetna"
    }
  ],
  "class": [
    {
      "type": {
        "coding": [
          {
            "system": "http://terminology.hl7.org/CodeSystem/coverage-class",
            "code": "subplan"
          }
        ],
        "text": "Member ID"
      },
      "value": "W123456789",
      "name": "Member ID"
    },
    {
      "type": {
        "text": "Policy Number"
      },
      "value": "POL-ABC123",
      "name": "Policy Number"
    },
    {
      "type": {
        "text": "Group Number"
      },
      "value": "GRP-XYZ456",
      "name": "Group Number"
    }
  ]
}
```

### API Request

**Endpoint**:
```
POST https://api.platform.athenahealth.com/fhir/r4/Coverage
```

**Important**: Create Coverage AFTER Patient is created, so you have the Patient ID to reference.

**Workflow Order**:
1. Create Patient → Get Patient ID
2. Update Coverage resource with `Patient/{id}` references
3. Create Coverage resource

---

## 🚨 AllergyIntolerance Resource

### Single Allergy Example

```json
{
  "resourceType": "AllergyIntolerance",
  "clinicalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
        "code": "active",
        "display": "Active"
      }
    ]
  },
  "verificationStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
        "code": "unconfirmed",
        "display": "Unconfirmed"
      }
    ]
  },
  "category": ["medication"],
  "criticality": "high",
  "code": {
    "coding": [
      {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "code": "7980",
        "display": "Penicillin"
      }
    ],
    "text": "Penicillin"
  },
  "patient": {
    "reference": "Patient/12345"
  },
  "reaction": [
    {
      "manifestation": [
        {
          "text": "Rash"
        }
      ],
      "severity": "moderate"
    }
  ]
}
```

### Handling Multiple Allergies

If patient lists: `"Penicillin (rash), Peanuts (anaphylaxis), Pollen (sneezing)"`

**Workflow logic** (already in `intake-form-received.json`):
```javascript
const allergyList = patient.allergies.split(',').map(a => a.trim()).filter(a => a);

allergyList.forEach((allergy, index) => {
  allergyResources.push({
    resourceType: 'AllergyIntolerance',
    clinicalStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
        code: 'active'
      }]
    },
    code: {
      text: allergy  // Simple text, no coding lookup
    },
    patient: {
      reference: `Patient/${patientId}`
    }
  });
});
```

**Create each allergy separately** via POST requests.

---

## 💊 MedicationStatement Resource

### Single Medication Example

```json
{
  "resourceType": "MedicationStatement",
  "status": "active",
  "medicationCodeableConcept": {
    "coding": [
      {
        "system": "http://www.nlm.nih.gov/research/umls/rxnorm",
        "code": "197361",
        "display": "Lisinopril 10 MG Oral Tablet"
      }
    ],
    "text": "Lisinopril 10mg once daily"
  },
  "subject": {
    "reference": "Patient/12345"
  },
  "effectiveDateTime": "2026-01-27",
  "dateAsserted": "2026-01-27",
  "informationSource": {
    "reference": "Patient/12345"
  },
  "dosage": [
    {
      "text": "10mg once daily",
      "timing": {
        "repeat": {
          "frequency": 1,
          "period": 1,
          "periodUnit": "d"
        }
      }
    }
  ]
}
```

### Simplified Version (for intake forms)

```json
{
  "resourceType": "MedicationStatement",
  "status": "active",
  "medicationCodeableConcept": {
    "text": "Lisinopril 10mg once daily"
  },
  "subject": {
    "reference": "Patient/12345"
  }
}
```

**Note**: The simplified version uses free text instead of coded medications. This is acceptable for patient-reported medications (verified by provider later).

### Handling Multiple Medications

Similar to allergies, split by comma and create separate resources.

---

## 🔍 Search Before Create (Duplicate Prevention)

### Why Search First?

**Problem**: Running the workflow multiple times (e.g., patient submits form twice) creates duplicate patient records.

**Solution**: Search for existing patient BEFORE creating a new one.

### Patient Search Query

**Endpoint**:
```
GET https://api.platform.athenahealth.com/fhir/r4/Patient?family={lastName}&given={firstName}&birthdate={YYYY-MM-DD}
```

**Example**:
```
GET https://api.platform.athenahealth.com/fhir/r4/Patient?family=Smith&given=John&birthdate=1980-01-15
```

### Search Response

**If patient exists** (HTTP 200):
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 1,
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "12345",
        "name": [
          {
            "family": "Smith",
            "given": ["John"]
          }
        ],
        "birthDate": "1980-01-15"
      }
    }
  ]
}
```

**If patient does NOT exist**:
```json
{
  "resourceType": "Bundle",
  "type": "searchset",
  "total": 0,
  "entry": []
}
```

### Workflow Logic for Duplicate Prevention

Add this **BEFORE** the "Create Patient in Athenahealth" node:

```javascript
// Search for existing patient
const patient = $input.first().json.originalPatientData;

// Build search query
const searchParams = new URLSearchParams({
  family: patient.lastName,
  given: patient.firstName,
  birthdate: patient.dateOfBirth  // Already in YYYY-MM-DD format
});

const searchUrl = `https://api.platform.athenahealth.com/fhir/r4/Patient?${searchParams}`;

// Make search request (use HTTP Request node)
// If total > 0, patient exists → use existing patient ID
// If total = 0, patient does not exist → create new patient
```

**Updated Workflow**:
1. Extract Patient Data
2. Map to FHIR Format
3. **Search for Existing Patient** ← NEW
4. **IF patient exists** → Use existing ID, skip creation
5. **IF patient does NOT exist** → Create new patient
6. Update Google Sheet with Patient ID

---

## ⚠️ Error Handling

### Common API Errors

#### Error 400: Bad Request (Validation Error)

**Response**:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "invalid",
      "diagnostics": "Patient.birthDate: Invalid date format. Expected YYYY-MM-DD."
    }
  ]
}
```

**Common Causes**:
- Invalid date format (must be `YYYY-MM-DD`)
- Missing required fields (name, gender, birthDate)
- Invalid gender code (must be: `male`, `female`, `other`, `unknown`)

**Fix**:
- Validate data before API call
- Check date conversion logic
- Use proper gender mapping

---

#### Error 401: Unauthorized

**Response**:
```json
{
  "error": "invalid_token",
  "error_description": "The access token provided is expired, revoked, malformed, or invalid."
}
```

**Causes**:
- Access token expired (> 1 hour old)
- Invalid OAuth2 credentials
- Incorrect scope

**Fix**:
- n8n auto-refreshes tokens - check credential configuration
- Verify Client ID/Secret are correct
- Ensure scope includes `patient/*.*`

---

#### Error 403: Forbidden

**Response**:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "forbidden",
      "diagnostics": "Practice ID not authorized for this operation."
    }
  ]
}
```

**Causes**:
- API credentials don't have permission for this practice
- Wrong Practice ID in request
- API access not enabled for your account

**Fix**:
- Contact Athenahealth support
- Verify Practice ID
- Ensure API access is provisioned

---

#### Error 404: Not Found

**Causes**:
- Wrong API endpoint URL
- Patient ID doesn't exist (when updating/reading)

**Fix**:
- Verify base URL: `https://api.platform.athenahealth.com/fhir/r4/`
- Check Patient ID is valid

---

#### Error 409: Conflict (Duplicate)

**Response**:
```json
{
  "resourceType": "OperationOutcome",
  "issue": [
    {
      "severity": "error",
      "code": "duplicate",
      "diagnostics": "A patient with the same name and birthdate already exists. Patient ID: 12345"
    }
  ]
}
```

**Causes**:
- Patient already exists in system
- Duplicate submission

**Fix**:
- Implement "Search Before Create" logic (see above)
- Use existing Patient ID from error message

---

### Error Handling in n8n Workflow

**Add IF node after API call**:

```javascript
// Check if API call succeeded
const response = $input.first().json;

if (response.resourceType === 'OperationOutcome') {
  // Error occurred
  const errorMessage = response.issue[0].diagnostics;

  return {
    json: {
      error: true,
      message: errorMessage,
      patientData: $('Extract Patient Data').first().json
    }
  };
} else {
  // Success - patient created
  return {
    json: {
      error: false,
      patientId: response.id,
      patientData: response
    }
  };
}
```

**Route to error handling**:
- TRUE → Log error, notify staff via email/Slack
- FALSE → Continue with normal flow

---

## 🧪 Testing in Preview Environment

### Setup Preview Environment

1. **Get Preview Credentials**:
   - Contact Athenahealth support
   - Request Preview environment access
   - Receive separate Client ID/Secret for Preview

2. **Configure n8n for Preview**:
   - Update Athenahealth OAuth2 credential
   - Change Access Token URL to: `https://api.preview.platform.athenahealth.com/oauth2/v1/token`
   - Use Preview Client ID/Secret

3. **Update API Endpoint URLs**:
   - In "Create Patient in Athenahealth" node
   - Change URL from:
     ```
     https://api.platform.athenahealth.com/fhir/r4/Patient
     ```
   - To:
     ```
     https://api.preview.platform.athenahealth.com/fhir/r4/Patient
     ```

### Test Cases

**Test 1: Minimal Required Fields**
- Name: Test Patient
- DOB: 01/01/1980
- Gender: Male
- Expected: Patient created successfully

**Test 2: Complete Patient with All Fields**
- All demographics
- Address
- Insurance
- Medications
- Allergies
- Emergency contact
- Expected: Patient + Coverage + Allergies + Medications all created

**Test 3: Duplicate Patient**
- Submit same patient twice
- Expected: Second submission should detect duplicate (if search logic implemented)

**Test 4: Invalid Data**
- Invalid date format (MM-DD-YYYY instead of YYYY-MM-DD)
- Expected: 400 error with validation message

**Test 5: Missing Required Fields**
- Omit birthDate
- Expected: 400 error

### Preview Environment Benefits

- ✅ Safe to test without affecting production data
- ✅ Same API behavior as production
- ✅ Can view/delete test patients freely
- ✅ Separate credentials prevent accidental production writes

### Accessing Preview Data

1. Log in to Athenahealth application
2. Switch to **Preview environment**
3. Search for test patients
4. Verify data accuracy

---

## 🚀 Production Deployment

### Pre-Production Checklist

- [ ] All tests passed in Preview environment
- [ ] Search before create logic implemented (duplicate prevention)
- [ ] Error handling configured
- [ ] Staff notification for failed API calls
- [ ] Data validation implemented
- [ ] HIPAA compliance verified
- [ ] BAA signed with Athenahealth

### Switch to Production API

1. **Update OAuth2 Credential**:
   - Access Token URL → `https://api.platform.athenahealth.com/oauth2/v1/token`
   - Client ID → Production credentials
   - Client Secret → Production credentials

2. **Update API Endpoints**:
   - Remove `preview.` from all URLs
   - Example: `https://api.platform.athenahealth.com/fhir/r4/Patient`

3. **Update Practice ID** (if different):
   - Verify correct production Practice ID
   - Update in any API calls that require it

### Gradual Rollout Strategy

**Week 1: Limited Testing**
- Enable for 5-10 test patients
- Monitor closely for errors
- Verify data accuracy in Athenahealth
- Staff review every submission

**Week 2: Pilot Group**
- Enable for 25% of appointments
- Continue monitoring
- Gather staff feedback
- Measure time savings

**Week 3: Full Deployment**
- Enable for 100% of appointments
- Switch to exception-based monitoring
- Track metrics (completion rate, error rate)

### Monitoring Production

**Daily** (first week):
- Check n8n execution log for errors
- Review failed API calls
- Verify all form submissions created patients
- Staff feedback on data quality

**Weekly** (ongoing):
- Review error rate
- Check for duplicate patients
- Monitor API response times
- Measure ROI (time saved)

---

## 🔧 Advanced Features

### Feature 1: Update Existing Patient

Instead of always creating new patients, update existing records.

**Endpoint**:
```
PUT https://api.platform.athenahealth.com/fhir/r4/Patient/{id}
```

**Use Case**: Patient completes intake form for second appointment (update demographics if changed).

---

### Feature 2: Attach Documents to Patient

Upload intake form PDF to patient record.

**Endpoint**:
```
POST https://api.platform.athenahealth.com/fhir/r4/DocumentReference
```

**Resource**:
```json
{
  "resourceType": "DocumentReference",
  "status": "current",
  "type": {
    "text": "Intake Form"
  },
  "subject": {
    "reference": "Patient/12345"
  },
  "content": [
    {
      "attachment": {
        "contentType": "application/pdf",
        "data": "base64-encoded-pdf-data",
        "title": "Patient Intake Form - 2026-01-27"
      }
    }
  ]
}
```

---

### Feature 3: Create Appointment

Automatically create appointment in Athenahealth when booking.

**Endpoint**:
```
POST https://api.platform.athenahealth.com/fhir/r4/Appointment
```

**Resource**:
```json
{
  "resourceType": "Appointment",
  "status": "booked",
  "serviceType": [
    {
      "text": "General Consultation"
    }
  ],
  "appointmentType": {
    "text": "Routine Visit"
  },
  "description": "Annual checkup",
  "start": "2026-01-28T10:30:00Z",
  "end": "2026-01-28T11:00:00Z",
  "participant": [
    {
      "actor": {
        "reference": "Patient/12345"
      },
      "status": "accepted"
    }
  ]
}
```

---

### Feature 4: Condition Resources (Medical History)

Create structured Condition resources from medical history.

**Example**:
```json
{
  "resourceType": "Condition",
  "clinicalStatus": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/condition-clinical",
        "code": "active"
      }
    ]
  },
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "73211009",
        "display": "Diabetes mellitus"
      }
    ],
    "text": "Diabetes"
  },
  "subject": {
    "reference": "Patient/12345"
  }
}
```

**Use Case**: Convert checkbox selections (Diabetes, Hypertension, etc.) from intake form into structured Condition resources.

---

## 📊 API Rate Limits & Performance

### Rate Limits

**Athenahealth API limits**:
- **Requests per minute**: 60-120 (varies by endpoint)
- **Requests per hour**: 1,000-2,000
- **Daily limit**: 10,000-50,000

**For typical medical practice**:
- 30 patients/day × 4 API calls each = 120 requests/day
- Well within limits

### Optimization Tips

1. **Batch requests** (if API supports):
   - Create Patient + Coverage in single request (FHIR Bundle)
   - Reduces API call count

2. **Cache Patient IDs**:
   - Store in Google Sheet to avoid repeated searches
   - Check sheet before searching Athenahealth

3. **Async processing**:
   - n8n workflows already async
   - Form submission doesn't block patient

4. **Retry logic**:
   - Implement exponential backoff for failed requests
   - Max 3 retries with 1s, 5s, 15s delays

---

## 🆘 Troubleshooting Common Issues

### Issue: Patient created but missing data fields

**Symptom**: Patient exists in Athenahealth but insurance/allergies missing

**Causes**:
- Coverage/AllergyIntolerance API calls failed after Patient creation
- Workflow stopped partway through

**Fix**:
- Implement transaction rollback (FHIR Bundle transaction)
- OR: Create all resources, log failures, manual review

---

### Issue: Date format errors

**Symptom**: API returns "Invalid date format"

**Cause**: Typeform returns `MM/DD/YYYY`, FHIR requires `YYYY-MM-DD`

**Fix** (already in workflow):
```javascript
let dobFormatted = patient.dateOfBirth;
if (dobFormatted && dobFormatted.includes('/')) {
  const parts = dobFormatted.split('/');
  if (parts.length === 3) {
    dobFormatted = `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
  }
}
```

---

### Issue: Gender code invalid

**Symptom**: API returns "Invalid gender code"

**Cause**: Typeform returns "Male" but FHIR expects "male" (lowercase)

**Fix** (already in workflow):
```javascript
const genderMap = {
  'Male': 'male',
  'Female': 'female',
  'Other': 'other',
  'Prefer not to say': 'unknown'
};
const genderCode = genderMap[patient.gender] || 'unknown';
```

---

## 📚 Additional Resources

**Athenahealth Developer Portal**:
- https://developer.athenahealth.com/

**FHIR R4 Specification**:
- Patient: https://www.hl7.org/fhir/patient.html
- Coverage: https://www.hl7.org/fhir/coverage.html
- AllergyIntolerance: https://www.hl7.org/fhir/allergyintolerance.html
- MedicationStatement: https://www.hl7.org/fhir/medicationstatement.html

**OAuth 2.0 Client Credentials**:
- https://oauth.net/2/grant-types/client-credentials/

**n8n HTTP Request Node**:
- https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/

---

## ✅ Integration Checklist

Before going live:

### API Access
- [ ] Athenahealth API access granted
- [ ] Developer Portal account created
- [ ] API application created
- [ ] OAuth2 credentials obtained (Client ID + Secret)
- [ ] Practice ID confirmed
- [ ] Preview environment access granted

### Authentication
- [ ] n8n OAuth2 credential configured
- [ ] Token refresh working
- [ ] Scope includes patient read/write

### FHIR Resources
- [ ] Patient resource creation tested
- [ ] Coverage resource creation tested
- [ ] AllergyIntolerance resource creation tested
- [ ] MedicationStatement resource creation tested

### Data Validation
- [ ] Date format conversion working
- [ ] Gender code mapping working
- [ ] Phone number E.164 format
- [ ] Required fields validated before API call

### Error Handling
- [ ] 400 errors handled (validation)
- [ ] 401 errors handled (auth)
- [ ] 409 errors handled (duplicate)
- [ ] Staff notification for errors configured

### Duplicate Prevention
- [ ] Search before create implemented
- [ ] Existing patient detection working
- [ ] Patient ID reuse logic tested

### Testing
- [ ] Preview environment tested
- [ ] All test cases passed
- [ ] Staff reviewed test data in Athenahealth
- [ ] Data accuracy verified

### Production
- [ ] Switched to production credentials
- [ ] Production Practice ID updated
- [ ] Gradual rollout plan in place
- [ ] Monitoring dashboards configured

---

**Last Updated**: January 27, 2026
**API Version**: FHIR R4
**Created for**: Dr. Jennifer's Medical Practice - Automation 3 (Digital Intake Forms)

For setup instructions, see `INTAKE_SETUP_GUIDE.md`.
For workflow overview, see `INTAKE_FORMS_README.md`.
