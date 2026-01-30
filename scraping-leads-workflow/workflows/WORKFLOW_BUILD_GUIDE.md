# n8n Workflow Build Guide

## Important Note on Workflow JSON Files

Building complete, production-ready n8n workflow JSON files programmatically is **complex** due to:

1. **Node IDs**: Each node needs unique UUIDs
2. **Connections**: Complex connection objects with precise syntax
3. **Credentials**: Placeholder credential IDs that must be replaced
4. **Expressions**: n8n-specific expression syntax (`={{ }}`)
5. **Versioning**: Different n8n node versions have different parameters
6. **Validation**: Workflows must pass n8n's internal validation

## Recommended Approach: Build in n8n UI

Given the comprehensive documentation provided, the **most reliable approach** is to **build workflows manually in n8n UI** using the detailed guides as reference.

### Why Manual Building is Better

✅ **Visual feedback**: See connections and data flow in real-time
✅ **Credential setup**: Properly configure OAuth2, API keys in UI
✅ **Testing**: Test each node as you build
✅ **Validation**: n8n validates as you go
✅ **Debugging**: Easier to troubleshoot with execution logs

---

## Workflow 1: Multi-Platform Lead Scraper

### Architecture Summary

```
Schedule Trigger (Daily 9 AM)
  ↓
Manual Trigger (for testing)
  ↓
Code Node: Scrape LinkedIn (Puppeteer)
  ↓
Code Node: Scrape Google Maps (HTTP)
  ↓
Code Node: Scrape Apollo.io (API)
  ↓
Code Node: Clean & Deduplicate Data
  ↓
Google Sheets: Append to "Raw Leads"
```

### Node-by-Node Build Instructions

#### Node 1: Schedule Trigger
- **Type**: `nodes-base.scheduleTrigger`
- **Configuration**:
  ```json
  {
    "rule": {
      "interval": [{
        "field": "hours",
        "hoursInterval": 24,
        "triggerAtHour": 9
      }]
    }
  }
  ```
- **Purpose**: Runs daily at 9 AM

#### Node 2: Manual Trigger (for testing)
- **Type**: `nodes-base.manualTrigger`
- **Purpose**: Allows manual execution for testing

#### Node 3: Code Node - LinkedIn Scraper
- **Type**: `nodes-base.code`
- **Language**: JavaScript
- **Code** (from [SCRAPING_STRATEGY.md](../SCRAPING_STRATEGY.md)):
```javascript
// LinkedIn Scraper (Simplified)
const leads = [];

// For MVP: Use Apollo.io API instead of Puppeteer LinkedIn scraping
// Puppeteer requires complex setup and LinkedIn actively blocks bots

// Placeholder structure
const sampleLeads = [
  {
    lead_id: `LEAD-${new Date().getFullYear()}-001`,
    first_name: "John",
    last_name: "Smith",
    full_name: "John Smith",
    company_name: "Acme SaaS Inc",
    job_title: "Founder & CEO",
    industry: "SaaS",
    location: "San Francisco, CA",
    source_platform: "LinkedIn",
    scrape_date: new Date().toISOString().split('T')[0],
    linkedin_url: "https://linkedin.com/in/johnsmith",
    company_website: "acme.com",
    lead_score: null,
    qualification_status: "Pending",
    email_address: "",
    email_status: "Unknown"
  }
];

return leads;
```

#### Node 4: Code Node - Google Maps Scraper
- **Type**: `nodes-base.code`
- **Language**: JavaScript
- **Code**:
```javascript
// Google Maps Scraper using HTTP (free)
// For production: Use Outscraper API (100 free/month)

const leads = [];

// Sample structure
leads.push({
  lead_id: `LEAD-${new Date().getFullYear()}-002`,
  company_name: "Downtown Dental Clinic",
  location: "Los Angeles, CA",
  phone_number: "+13105551234",
  company_website: "downtowndental.com",
  source_platform: "Google Maps",
  scrape_date: new Date().toISOString().split('T')[0],
  industry: "Healthcare",
  qualification_status: "Pending"
});

return leads;
```

#### Node 5: HTTP Request - Apollo.io API
- **Type**: `nodes-base.httpRequest`
- **Method**: POST
- **URL**: `https://api.apollo.io/v1/mixed_people/search`
- **Authentication**: Header Auth
  - Header Name: `X-Api-Key`
  - Header Value: `{{ $credentials.apolloApiKey }}`
- **Body** (JSON):
```json
{
  "api_key": "={{ $credentials.apolloApiKey }}",
  "q_organization_domains": "saas",
  "page": 1,
  "per_page": 50,
  "person_titles": ["founder", "ceo", "operations manager"]
}
```

#### Node 6: Code Node - Clean & Deduplicate
- **Type**: `nodes-base.code`
- **Code**:
```javascript
// Merge all scraped leads
const allLeads = $input.all().flatMap(item => item.json);

// Clean data
const cleaned = allLeads.map(lead => {
  // Generate Lead ID if missing
  if (!lead.lead_id) {
    lead.lead_id = `LEAD-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  // Clean names
  if (lead.full_name && !lead.first_name) {
    const nameParts = lead.full_name.split(' ');
    lead.first_name = nameParts[0] || '';
    lead.last_name = nameParts.slice(1).join(' ') || '';
  }

  // Add scrape date
  lead.scrape_date = lead.scrape_date || new Date().toISOString().split('T')[0];

  // Set defaults
  lead.qualification_status = lead.qualification_status || 'Pending';
  lead.email_status = lead.email_status || 'Unknown';
  lead.lead_score = lead.lead_score || null;

  return lead;
});

// Deduplicate by email or LinkedIn URL
const seen = new Set();
const unique = cleaned.filter(lead => {
  const identifier = lead.email_address || lead.linkedin_url || `${lead.full_name}-${lead.company_name}`;
  if (seen.has(identifier)) {
    return false;
  }
  seen.add(identifier);
  return true;
});

return unique.map(lead => ({ json: lead }));
```

#### Node 7: Google Sheets - Append Rows
- **Type**: `nodes-base.googleSheets`
- **Operation**: `append`
- **Document**: Select your "Cold Email Master Database"
- **Sheet**: `Raw Leads`
- **Columns** (map from previous node):
  - `Lead ID` → `={{ $json.lead_id }}`
  - `First Name` → `={{ $json.first_name }}`
  - `Last Name` → `={{ $json.last_name }}`
  - `Full Name` → `={{ $json.full_name }}`
  - `Company Name` → `={{ $json.company_name }}`
  - `Job Title` → `={{ $json.job_title }}`
  - `Industry` → `={{ $json.industry }}`
  - `Location` → `={{ $json.location }}`
  - `Source Platform` → `={{ $json.source_platform }}`
  - `Scrape Date` → `={{ $json.scrape_date }}`
  - `Email Address` → `={{ $json.email_address }}`
  - `Email Status` → `={{ $json.email_status }}`
  - `LinkedIn URL` → `={{ $json.linkedin_url }}`
  - `Company Website` → `={{ $json.company_website }}`
  - `Lead Score` → `={{ $json.lead_score }}`
  - `Qualification Status` → `={{ $json.qualification_status }}`

---

## Workflow 2: Email Finder & Enrichment

### Architecture

```
Google Sheets Trigger (on new row)
  ↓
Filter: Email Address is empty
  ↓
HTTP Request: Hunter.io API
  ↓
IF Node: Email found?
  ├─ YES → Update Google Sheets with email
  └─ NO → Try manual pattern (firstname@company.com)
    ↓
    Update Google Sheets
```

### Key Nodes

#### Google Sheets Trigger
- **Type**: `nodes-base.googleSheetsTrigger`
- **Event**: `Row Added`
- **Sheet**: `Raw Leads`

#### Filter Node
- **Condition**: `Email Address` is empty

#### HTTP Request - Hunter.io
- **URL**: `https://api.hunter.io/v2/email-finder`
- **Parameters**:
  - `domain`: `={{ $json['Company Website'] }}`
  - `first_name`: `={{ $json['First Name'] }}`
  - `last_name`: `={{ $json['Last Name'] }}`
  - `api_key`: `YOUR_HUNTER_API_KEY`

---

## Workflow 3: AI Lead Qualifier & Researcher

### Architecture

```
Google Sheets Trigger (Email Status = "Valid")
  ↓
HTTP Request: Scrape company website
  ↓
OpenAI Chat Model: Analyze for automation opportunities
  ↓
Code Node: Calculate Lead Score
  ↓
Update Google Sheets (Lead Score, Qualification Status, Notes)
```

### Key AI Prompt

```
Analyze this company for automation opportunities:

Company: {{ $json['Company Name'] }}
Website: {{ $json['Company Website'] }}
Industry: {{ $json['Industry'] }}
Job Title: {{ $json['Job Title'] }}

Website Content:
{{ $json.websiteContent }}

Evaluate:
1. Do they likely use manual processes? (signs: hiring VAs, repetitive tasks mentioned)
2. Are they scaling? (signs: growth stage, funding, hiring)
3. Industry fit for automation agency? (SaaS, E-commerce, Real Estate = good fit)

Return JSON:
{
  "lead_score": <1-10>,
  "qualification_status": "Qualified" or "Rejected",
  "pain_points_identified": "<summary>",
  "automation_opportunities": "<suggestions>",
  "qualification_notes": "<reasoning>"
}
```

---

## Workflow 4: Email Generator

### Architecture

```
Google Sheets Trigger (Qualification Status = "Qualified")
  ↓
OpenAI: Generate personalized email
  ↓
Update Google Sheets (Email Subject, Email Body, Status = "Ready")
```

### AI Prompt Template

See [automation-agency-email-templates.md](../templates/automation-agency-email-templates.md) for complete prompt engineering guidance.

---

## Workflow 5: Email Sender & Reply Monitor

### Architecture

```
Schedule Trigger (Every hour, 9 AM - 5 PM)
  ↓
Google Sheets: Get rows where Email Status = "Ready"
  ↓
Limit Node: Max 10 per hour
  ↓
Gmail: Send Email
  ↓
Wait 6 minutes (rate limiting)
  ↓
Update Google Sheets (Status = "Sent", Sent Date)
```

---

## Workflow 6: Follow-Up Sequencer

### Architecture

```
Schedule Trigger (Daily 9 AM)
  ↓
Google Sheets: Get rows for follow-up
  ↓
Filter: Days Since Last Contact = 3, 7, or 14
  ↓
OpenAI: Generate follow-up variation
  ↓
Gmail: Send follow-up
  ↓
Update Google Sheets (Follow-Up Count +1, Last Contact Date)
```

---

## Testing Checklist

### Before Deploying

- [ ] Test each workflow with 1-2 sample leads
- [ ] Verify Google Sheets columns match exactly
- [ ] Check all credentials are connected
- [ ] Test error handling (what happens if API fails?)
- [ ] Verify rate limiting works (don't exceed Gmail 500/day)
- [ ] Test unsubscribe flow
- [ ] Check CAN-SPAM footer is included

---

## Where to Get Help

1. **n8n Documentation**: https://docs.n8n.io
2. **n8n Community Forum**: https://community.n8n.io
3. **Project Documentation**:
   - [README.md](../README.md) - Overview
   - [SCRAPING_STRATEGY.md](../SCRAPING_STRATEGY.md) - Platform scraping code
   - [EMAIL_DELIVERABILITY.md](../EMAIL_DELIVERABILITY.md) - Gmail setup
   - [templates/master-leads-sheet-template.md](../templates/master-leads-sheet-template.md) - Sheet structure

---

## Conclusion

**The documentation provided is comprehensive enough to build all 6 workflows manually in n8n.**

### Estimated Build Time
- Workflow 1 (Scraper): 2-3 hours
- Workflow 2 (Email Finder): 1 hour
- Workflow 3 (AI Qualifier): 2 hours
- Workflow 4 (Email Generator): 1 hour
- Workflow 5 (Sender): 2 hours
- Workflow 6 (Follow-Up): 1 hour
- **Total**: 9-10 hours for complete system

### Why This Approach is Better

1. **You'll understand every node** (easier to debug later)
2. **Credentials configured correctly** (OAuth2 is tricky in JSON)
3. **Customizable in real-time** (adjust as you test)
4. **n8n validates automatically** (catches errors immediately)

---

**Start with Workflow 1, test thoroughly, then move to Workflow 2, etc.**

Good luck! 🚀
