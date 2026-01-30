# Pharmacy API Integration Guide

## 🎯 Overview

This guide explains how to integrate the refill automation with pharmacy systems to transmit prescriptions electronically. You have **two options**:

1. **Mock API** (for testing/development) - Free, immediate deployment
2. **Surescripts API** (for production) - Real e-prescribing, $500-1000/month

---

## 🧪 Option A: Mock Pharmacy API (Recommended for Testing)

### Purpose

The mock API simulates pharmacy responses without actually sending prescriptions. Perfect for:
- Initial testing of workflows
- Training staff
- Demonstrating the system to stakeholders
- Development/staging environments

### How It Works

```
n8n Workflow
    ↓
Send HTTP POST to mock endpoint
    ↓
Mock API logs the request
    ↓
Returns simulated success/failure response
    ↓
Workflow continues normally (logs, sends SMS, etc.)
```

**No prescriptions are actually transmitted** - it's purely for testing the automation logic.

---

### Setup (5 minutes)

#### Step 1: Create Mock Endpoint

**Option A: Webhook.site** (Easiest - No signup required)

1. Go to [webhook.site](https://webhook.site)
2. You'll get a unique URL like: `https://webhook.site/abc-123-def-456`
3. Copy this URL
4. Set as `PHARMACY_API_URL` environment variable in n8n

**How to use**:
- Send test refill request
- Open webhook.site in browser
- See the exact JSON payload that would be sent to pharmacy
- Verify prescription details are correct

**Option B: RequestBin** (Similar to webhook.site)

1. Go to [requestbin.com](https://requestbin.com)
2. Click "Create a RequestBin"
3. Copy the bin URL
4. Use as `PHARMACY_API_URL`

**Option C: Custom Mock Server** (Advanced)

Build a simple Express.js server that returns deterministic responses:

```javascript
// mock-pharmacy-api.js
const express = require('express');
const app = express();
app.use(express.json());

app.post('/refill', (req, res) => {
  const { prescription, patient, pharmacy } = req.body;

  // Simulate pharmacy validation
  if (!pharmacy.ncpdpId || pharmacy.ncpdpId.length !== 7) {
    return res.status(400).json({
      status: 'ERROR',
      code: '010',
      message: 'Invalid pharmacy NCPDP ID'
    });
  }

  // Simulate successful transmission
  res.json({
    status: 'SUCCESS',
    code: '000',
    message: 'Prescription accepted by pharmacy',
    confirmationNumber: `RX-${Date.now()}`,
    estimatedReadyTime: '1-2 hours'
  });
});

app.listen(3000, () => console.log('Mock pharmacy API running on port 3000'));
```

Deploy to Heroku/Vercel and use URL as `PHARMACY_API_URL`.

---

### Mock API Response Format

The mock should return this JSON structure (matching Surescripts format):

**Success Response**:
```json
{
  "status": "SUCCESS",
  "code": "000",
  "message": "Prescription accepted by pharmacy",
  "confirmationNumber": "RX-1738000000000",
  "estimatedReadyTime": "1-2 hours",
  "pharmacyName": "CVS Pharmacy #12345",
  "pharmacyPhone": "+18005551234"
}
```

**Error Responses**:

**Pharmacy not found**:
```json
{
  "status": "ERROR",
  "code": "010",
  "message": "Pharmacy NCPDP ID not found in network"
}
```

**Patient insurance issue**:
```json
{
  "status": "ERROR",
  "code": "020",
  "message": "Patient insurance not on file at pharmacy. Patient should call pharmacy."
}
```

**System error**:
```json
{
  "status": "ERROR",
  "code": "900",
  "message": "Temporary system error. Please retry."
}
```

---

### Testing with Mock API

1. Set `PHARMACY_API_URL` to your mock endpoint
2. Send auto-approve eligible refill request via SMS
3. Check mock endpoint logs to see transmitted data
4. Verify response is handled correctly by workflow
5. Patient should still receive confirmation SMS

**What to verify**:
- Prescription details (drug name, dosage, quantity)
- Patient demographics (name, DOB)
- Prescriber NPI and credentials
- Pharmacy NCPDP ID (7 digits)

---

## 🏥 Option B: Surescripts Production API

### What is Surescripts?

**Surescripts** is the **national e-prescribing network** in the United States, connecting:
- 95% of US pharmacies (70,000+ locations)
- 2.7 million healthcare providers
- 300+ million prescriptions transmitted annually

**Benefits**:
- **Real-time transmission** - prescription arrives instantly
- **EPCS support** - Electronic controlled substance prescriptions (Schedule II-V)
- **Medication history** - View patient's fill history from all pharmacies
- **Formulary checks** - Insurance coverage verification
- **Prior authorization** - Automated PA workflows

---

### Requirements

Before you can use Surescripts:

**Provider Requirements**:
- [ ] Active DEA registration
- [ ] Valid NPI (National Provider Identifier)
- [ ] State medical license in good standing
- [ ] E-prescribing certification (complete training)
- [ ] EPCS identity proofing (for controlled substances)

**Practice Requirements**:
- [ ] EHR/pharmacy system with Surescripts integration OR custom API integration
- [ ] HIPAA compliance policies
- [ ] Signed Surescripts Data Use Agreement
- [ ] IT infrastructure to support API calls

**Costs**:
- **Base subscription**: $500-1,000/month
- **Per-transaction fees**: $0.50-$1.00 per prescription
- **Setup/onboarding**: $1,000-3,000 one-time
- **EPCS certification**: $150-300/year per provider

---

### Onboarding Process (30-60 days)

#### Phase 1: Application (Week 1)

1. **Contact Surescripts**:
   - Website: [surescripts.com/contact](https://surescripts.com/contact)
   - Phone: 1-866-797-3239
   - Email: customersupport@surescripts.com

2. **Submit Application**:
   - Practice information (name, address, NPI)
   - Provider information (each prescriber's NPI, DEA)
   - IT contact details
   - Integration method (API vs EHR)

3. **Sign Agreements**:
   - Data Use Agreement
   - Business Associate Agreement (HIPAA)
   - Terms of Service

#### Phase 2: Credentialing (Weeks 2-3)

Surescripts verifies:
- Provider DEA registrations (via DEA database)
- NPI validity (via NPPES)
- State medical licenses
- Practice location addresses

**Tip**: Have scanned copies of DEA certificates and licenses ready to expedite.

#### Phase 3: Technical Integration (Weeks 3-5)

1. **Get API Credentials**:
   - Client ID and Secret
   - Production endpoint URLs
   - Test environment access

2. **Implement NCPDP SCRIPT Standard**:
   Surescripts uses **NCPDP SCRIPT 2017071** XML format for prescription transmission.

3. **Test Environment**:
   - Send test prescriptions to Surescripts sandbox
   - Verify proper formatting and data mapping
   - Test error handling (pharmacy not found, patient not on file, etc.)

4. **Certification Testing**:
   - Surescripts runs ~20 test scenarios
   - Must pass all scenarios to certify
   - Includes: new RX, refill, change, cancel, medication history

#### Phase 4: EPCS Setup (Weeks 4-6, if needed)

For **controlled substances** (Schedule II-V):

1. **Complete EPCS Training**:
   - DEA-required training (2 hours)
   - Certificate valid for 2 years
   - Cost: ~$150-300

2. **Identity Proofing**:
   - In-person verification OR
   - Remote biometric verification (fingerprint, facial recognition)
   - Provider must prove they are who they claim to be

3. **Two-Factor Authentication**:
   - Hard token (physical device) OR
   - Soft token (phone app)
   - Required every time prescribing controlled substance

#### Phase 5: Go-Live (Week 6+)

1. Production credentials issued
2. Final smoke tests in production environment
3. Go-live approval from Surescripts
4. Begin transmitting real prescriptions

---

### API Integration Details

#### Authentication

**OAuth 2.0 Client Credentials Grant**:

```http
POST https://api.surescripts.net/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&scope=prescription.write medication_history.read
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

Use access token in subsequent requests:
```http
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

---

#### Prescription Transmission Request

**Endpoint**: `POST https://api.surescripts.net/prescription/v1/newrx`

**Headers**:
```
Authorization: Bearer {access_token}
Content-Type: application/xml
Accept: application/xml
```

**Request Body** (NCPDP SCRIPT XML):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Message xmlns="http://www.ncpdp.org/schema/SCRIPT">
  <Header>
    <To>PHARMACY_NCPDP_ID</To>
    <From>SENDER_ID</From>
    <MessageID>MSG-1738000000000</MessageID>
    <SentTime>2026-01-27T14:30:00Z</SentTime>
  </Header>
  <Body>
    <NewRx>
      <Prescriber>
        <Identification>
          <NPI>1234567890</NPI>
          <DEA>AB1234563</DEA>
        </Identification>
        <Name>
          <LastName>Smith</LastName>
          <FirstName>Jennifer</FirstName>
        </Name>
        <Address>
          <AddressLine1>123 Medical Plaza</AddressLine1>
          <City>Springfield</City>
          <State>IL</State>
          <ZipCode>62701</ZipCode>
        </Address>
        <CommunicationNumbers>
          <Phone>5555551234</Phone>
          <Fax>5555551235</Fax>
        </CommunicationNumbers>
      </Prescriber>

      <Patient>
        <Identification>
          <PatientID>PT-12345</PatientID>
        </Identification>
        <Name>
          <LastName>Johnson</LastName>
          <FirstName>John</FirstName>
        </Name>
        <DateOfBirth>1980-05-15</DateOfBirth>
        <Gender>M</Gender>
        <Address>
          <AddressLine1>456 Main Street</AddressLine1>
          <City>Springfield</City>
          <State>IL</State>
          <ZipCode>62702</ZipCode>
        </Address>
        <CommunicationNumbers>
          <Phone>5555559876</Phone>
        </CommunicationNumbers>
      </Patient>

      <Medication>
        <DrugDescription>Lisinopril 10mg Tablet</DrugDescription>
        <DrugCoded>
          <ProductCode>
            <Code>00093-3147-01</Code>
            <Qualifier>NDC</Qualifier>
          </ProductCode>
        </DrugCoded>
        <Quantity>
          <Value>90</Value>
          <CodeListQualifier>38</CodeListQualifier>
          <UnitOfMeasure>C48480</UnitOfMeasure>
        </Quantity>
        <DaysSupply>90</DaysSupply>
        <Refills>3</Refills>
        <Directions>Take one tablet by mouth once daily</Directions>
        <WrittenDate>2026-01-27</WrittenDate>
      </Medication>

      <Pharmacy>
        <Identification>
          <NCPDPID>1234567</NCPDPID>
        </Identification>
        <StoreName>CVS Pharmacy #12345</StoreName>
        <Address>
          <AddressLine1>789 Pharmacy Way</AddressLine1>
          <City>Springfield</City>
          <State>IL</State>
          <ZipCode>62702</ZipCode>
        </Address>
        <CommunicationNumbers>
          <Phone>8005551234</Phone>
        </CommunicationNumbers>
      </Pharmacy>
    </NewRx>
  </Body>
</Message>
```

---

#### Response Handling

**Success Response**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Message xmlns="http://www.ncpdp.org/schema/SCRIPT">
  <Header>
    <MessageID>MSG-1738000000001</MessageID>
    <RelatesToMessageID>MSG-1738000000000</RelatesToMessageID>
    <SentTime>2026-01-27T14:30:15Z</SentTime>
  </Header>
  <Body>
    <Status>
      <Code>000</Code>
      <Description>Prescription received and accepted</Description>
    </Status>
  </Body>
</Message>
```

**Error Response**:
```xml
<Message>
  <Body>
    <Status>
      <Code>010</Code>
      <Description>Pharmacy not found</Description>
    </Status>
  </Body>
</Message>
```

**Common Error Codes**:
| Code | Meaning | Action |
|------|---------|--------|
| 000 | Success | Prescription accepted |
| 010 | Pharmacy not found | Verify NCPDP ID |
| 020 | Patient not on file at pharmacy | Patient must call pharmacy to add insurance |
| 600 | Invalid drug code | Verify NDC number |
| 601 | Drug not covered by insurance | Prior authorization needed |
| 900 | System error | Retry after 5 minutes |

---

### n8n Implementation (Production)

#### Update HTTP Request Node in refill-processor.json

Replace the "Send to Pharmacy API" node configuration:

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.surescripts.net/prescription/v1/newrx",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "oAuth2Api",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "Content-Type",
          "value": "application/xml"
        },
        {
          "name": "Accept",
          "value": "application/xml"
        }
      ]
    },
    "sendBody": true,
    "contentType": "raw",
    "rawContentType": "application/xml",
    "body": "={{ $('Prepare Surescripts XML').json.xmlPayload }}",
    "options": {
      "timeout": 30000
    }
  }
}
```

#### Add XML Preparation Node

Before the HTTP Request, add a Code node to build the NCPDP SCRIPT XML:

```javascript
// Prepare Surescripts XML payload
const data = $input.first().json;
const patient = data.pharmacyRequest.patient;
const prescription = data.pharmacyRequest.prescription;
const prescriber = data.pharmacyRequest.prescriber;
const pharmacy = data.pharmacyRequest.pharmacy;

const xmlPayload = `<?xml version="1.0" encoding="UTF-8"?>
<Message xmlns="http://www.ncpdp.org/schema/SCRIPT">
  <Header>
    <To>${pharmacy.ncpdpId}</To>
    <From>YOUR_SENDER_ID</From>
    <MessageID>MSG-${Date.now()}</MessageID>
    <SentTime>${new Date().toISOString()}</SentTime>
  </Header>
  <Body>
    <NewRx>
      <Prescriber>
        <Identification>
          <NPI>${prescriber.npi}</NPI>
        </Identification>
        <Name>
          <LastName>${prescriber.name.split(' ').pop()}</LastName>
          <FirstName>${prescriber.name.split(' ')[0]}</FirstName>
        </Name>
        <CommunicationNumbers>
          <Phone>${prescriber.phone.replace(/\D/g, '')}</Phone>
          <Fax>${prescriber.fax.replace(/\D/g, '')}</Fax>
        </CommunicationNumbers>
      </Prescriber>

      <Patient>
        <Identification>
          <PatientID>${patient.patientId}</PatientID>
        </Identification>
        <Name>
          <LastName>${patient.lastName}</LastName>
          <FirstName>${patient.firstName}</FirstName>
        </Name>
        <DateOfBirth>${patient.dateOfBirth}</DateOfBirth>
        <Gender>${patient.gender}</Gender>
      </Patient>

      <Medication>
        <DrugDescription>${prescription.drugName} ${prescription.strength}</DrugDescription>
        <Quantity>
          <Value>${prescription.quantity}</Value>
        </Quantity>
        <DaysSupply>${prescription.daysSupply}</DaysSupply>
        <Refills>${prescription.refills}</Refills>
        <Directions>${prescription.directions}</Directions>
        <WrittenDate>${prescription.writtenDate}</WrittenDate>
      </Medication>

      <Pharmacy>
        <Identification>
          <NCPDPID>${pharmacy.ncpdpId}</NCPDPID>
        </Identification>
      </Pharmacy>
    </NewRx>
  </Body>
</Message>`;

return {
  json: {
    xmlPayload: xmlPayload,
    // Pass through for logging
    patientName: data.patientName,
    medicationName: data.medicationName
  }
};
```

---

### Pharmacy Lookup (NCPDP Directory)

Patients may switch pharmacies. To find NCPDP IDs:

**Option 1: NCPDP Provider Locator** (Official)
- Website: [nabp.pharmacy/resources/ncpdp-pharmacy-locator](https://nabp.pharmacy/resources/ncpdp-pharmacy-locator)
- Search by: Pharmacy name, address, or phone
- Returns: 7-digit NCPDP ID

**Option 2: Surescripts Pharmacy Search API**
```http
GET https://api.surescripts.net/pharmacy/v1/search
  ?name=CVS
  &city=Springfield
  &state=IL
  &zip=62702

Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "pharmacies": [
    {
      "ncpdpId": "1234567",
      "name": "CVS Pharmacy #12345",
      "address": "789 Pharmacy Way, Springfield, IL 62702",
      "phone": "8005551234",
      "fax": "8005551235"
    }
  ]
}
```

Add this to your workflow if you want patients to specify their preferred pharmacy.

---

### Medication History (Optional Enhancement)

Surescripts also provides **medication history** - see what prescriptions patient has filled at ANY pharmacy:

```http
GET https://api.surescripts.net/medication-history/v1/patient/{patientId}
Authorization: Bearer {access_token}
```

**Use cases**:
- Verify patient's current medications before AI triage
- Detect early refills (possible abuse)
- Identify medications prescribed by other doctors

---

## 🔄 Migration Path: Mock → Production

### When to Migrate

Migrate from mock to Surescripts when:
- [ ] Soft launch testing complete (2 weeks)
- [ ] AI accuracy validated (>95%)
- [ ] Staff trained and comfortable with system
- [ ] Surescripts onboarding complete
- [ ] Budget approved ($500-1000/month)

### Migration Steps

1. **Keep workflows running with mock API** during Surescripts onboarding
2. **Complete Surescripts certification** (weeks 3-6)
3. **Test in Surescripts sandbox** (parallel to mock)
4. **Update environment variable**: Change `PHARMACY_API_URL` from mock to Surescripts production endpoint
5. **Update HTTP node**: Replace JSON payload with XML (see above)
6. **Add OAuth2 credential** for Surescripts
7. **Test with 1-2 real prescriptions** (non-critical medications)
8. **Monitor for 24 hours** - check for errors
9. **Full cutover** - all refills now go to real pharmacies

**Rollback plan**: If errors occur, change `PHARMACY_API_URL` back to mock and troubleshoot offline.

---

## 📊 Cost Comparison

| Feature | Mock API | Surescripts Production |
|---------|----------|------------------------|
| **Setup cost** | $0 | $1,000-3,000 |
| **Monthly base fee** | $0 | $500-1,000 |
| **Per-transaction** | $0 | $0.50-1.00 |
| **Total monthly cost** (40 refills/day) | **$0** | **~$650** |
| **Real prescriptions** | ❌ No | ✅ Yes |
| **95% pharmacy coverage** | ❌ No | ✅ Yes |
| **EPCS (controlled substances)** | ❌ No | ✅ Yes |
| **Medication history** | ❌ No | ✅ Yes |
| **Insurance formulary** | ❌ No | ✅ Yes |
| **Setup time** | 5 minutes | 30-60 days |

**Recommendation**: Start with **mock API** for testing, migrate to **Surescripts** for production.

---

## 🔒 Security & Compliance

### Data Encryption
- All API calls use **TLS 1.2+** encryption
- Patient data encrypted in transit
- Surescripts SOC 2 Type II certified

### HIPAA Compliance
- Surescripts BAA required (included with contract)
- Audit logging of all prescription transmissions
- 7-year retention requirement

### DEA Compliance
- EPCS for controlled substances
- Two-factor authentication required
- Identity proofing every 2 years

---

## 📞 Support

**Surescripts Customer Support**:
- Phone: 1-866-797-3239
- Email: customersupport@surescripts.com
- Hours: 24/7 for production issues

**Technical Documentation**:
- [Surescripts Developer Portal](https://developers.surescripts.com)
- NCPDP SCRIPT Implementation Guide
- API Reference Documentation

---

**Document Version**: 1.0
**Last Updated**: January 27, 2026
**Next Review**: After Surescripts onboarding complete
