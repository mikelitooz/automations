# Google Sheets Master Database Template

Complete column structure for the "Cold Email Master Database" spreadsheet.

## Overview

This Google Sheet serves as the **central database** for all 6 workflows. It tracks leads from scraping through qualification, emailing, follow-ups, and replies.

## Spreadsheet Structure

### Create 4 Tabs

1. **Raw Leads**: All scraped leads (unfiltered)
2. **Qualified Leads**: Leads that passed AI qualification
3. **Sent Emails**: Leads with emails sent
4. **Replied Leads**: Hot leads who responded

---

## Tab 1: Raw Leads (40 Columns)

### Lead Information (Columns A-J)

| Column | Header | Format | Example | Notes |
|--------|--------|--------|---------|-------|
| A | Lead ID | Text | `LEAD-2025-001` | Auto-generated: `=CONCATENATE("LEAD-",YEAR(TODAY()),"-",TEXT(ROW(),"000"))` |
| B | First Name | Text | John | Extracted from Full Name |
| C | Last Name | Text | Smith | Extracted from Full Name |
| D | Full Name | Text | John Smith | As scraped |
| E | Company Name | Text | Acme SaaS Inc | Company name |
| F | Job Title | Text | Founder & CEO | Decision maker title |
| G | Industry | Text | SaaS | Industry category |
| H | Location | Text | San Francisco, CA | City, State |
| I | Source Platform | Dropdown | LinkedIn | Options: LinkedIn, Google Maps, Apollo.io, Reddit, Twitter, Facebook, Instagram |
| J | Scrape Date | Date | 2025-01-15 | Auto: `=TODAY()` |

### Contact Details (Columns K-P)

| Column | Header | Format | Example | Notes |
|--------|--------|--------|---------|-------|
| K | Email Address | Email | john@acme.com | Primary email |
| L | Email Status | Dropdown | Valid | Options: Valid, Invalid, Unknown, Not Found |
| M | Phone Number | Phone | +14155551234 | E.164 format |
| N | LinkedIn URL | URL | linkedin.com/in/johnsmith | Full URL |
| O | Company Website | URL | acme.com | Domain only |
| P | Twitter/Social Handle | Text | @johnsmith | Social media handle |

### Enrichment Data (Columns Q-X)

| Column | Header | Format | Example | Notes |
|--------|--------|--------|---------|-------|
| Q | Company Size | Number | 50 | Employee count |
| R | Revenue Range | Text | $1M-$5M | Estimated ARR |
| S | Funding Stage | Dropdown | Series A | Options: Bootstrapped, Seed, Series A/B/C, Public |
| T | Tech Stack | Text | React, AWS, Stripe | Comma-separated |
| U | Recent News/Events | Text | Just raised $2M Series A | From research |
| V | Pain Points Identified | Text | Hiring 3 VAs for manual data entry | AI-extracted |
| W | Automation Opportunities | Text | Form processing, scheduling | AI-suggested |
| X | Decision Maker Role | Text | Primary | Options: Primary, Secondary, Gatekeeper |

### Qualification (Columns Y-AB)

| Column | Header | Format | Example | Notes |
|--------|--------|--------|---------|-------|
| Y | Lead Score | Number | 8 | 1-10 scale (AI-generated) |
| Z | Qualification Status | Dropdown | Qualified | Options: Pending, Qualified, Rejected |
| AA | Qualification Date | Date | 2025-01-15 | When AI qualified |
| AB | Qualification Notes | Text | Perfect fit - scaling team | AI reasoning |

### Email Campaign (Columns AC-AJ)

| Column | Header | Format | Example | Notes |
|--------|--------|--------|---------|-------|
| AC | Email Subject | Text | Noticed you're scaling your team | AI-generated |
| AD | Email Body | Long Text | Hi John, I saw... | Full email content |
| AE | Email Status | Dropdown | Sent | Options: Draft, Ready, Sent, Replied, Bounced, Unsubscribed |
| AF | Sent Date | Date | 2025-01-16 | When email was sent |
| AG | Opens Count | Number | 3 | Tracking pixel count |
| AH | Clicks Count | Number | 1 | Link clicks |
| AI | Reply Status | Dropdown | Replied | Options: No Reply, Replied, Unsubscribed |
| AJ | Reply Content | Long Text | Yes, let's schedule a call | First reply text |

### Follow-Up Tracking (Columns AK-AN)

| Column | Header | Format | Example | Notes |
|--------|--------|--------|---------|-------|
| AK | Follow-Up Count | Number | 2 | Total follow-ups sent (0-3) |
| AL | Last Contact Date | Date | 2025-01-20 | Last email sent date |
| AM | Next Follow-Up Date | Date | 2025-01-27 | Calculated: Last Contact + 7 days |
| AN | Follow-Up Status | Dropdown | Active | Options: Active, Stopped, Completed |

---

## Tab 2: Qualified Leads

### Same Columns as Raw Leads

Filter criteria:
- Qualification Status = "Qualified"
- Lead Score ≥ 7

**Formula for auto-population**:
```
=FILTER('Raw Leads'!A:AN, 'Raw Leads'!Z:Z="Qualified", 'Raw Leads'!Y:Y>=7)
```

---

## Tab 3: Sent Emails

### Same Columns as Raw Leads

Filter criteria:
- Email Status = "Sent"

**Formula**:
```
=FILTER('Raw Leads'!A:AN, 'Raw Leads'!AE:AE="Sent")
```

---

## Tab 4: Replied Leads

### Same Columns as Raw Leads

Filter criteria:
- Reply Status = "Replied"

**Formula**:
```
=FILTER('Raw Leads'!A:AN, 'Raw Leads'!AI:AI="Replied")
```

**Sort by**: Sent Date (newest first)

---

## Color Coding (Conditional Formatting)

### Lead Score Colors

Apply to Column Y (Lead Score):

| Score | Color | Label |
|-------|-------|-------|
| 9-10 | 🟢 Green | Hot Lead |
| 7-8 | 🟡 Yellow | Warm Lead |
| 5-6 | 🟠 Orange | Medium Lead |
| 1-4 | 🔴 Red | Cold Lead |

**Conditional Formatting Rule**:
```
=AND($Y2>=9, $Y2<=10) → Green background
=AND($Y2>=7, $Y2<9) → Yellow background
=AND($Y2>=5, $Y2<7) → Orange background
=AND($Y2>=1, $Y2<5) → Red background
```

### Email Status Colors

Apply to Column AE (Email Status):

| Status | Color |
|--------|-------|
| Replied | 🟢 Green |
| Sent | 🟡 Yellow |
| Ready | 🔵 Blue |
| Bounced | 🔴 Red |
| Unsubscribed | ⚫ Black |

---

## Formulas & Automation

### Lead ID Auto-Generation (Column A)

```excel
=CONCATENATE("LEAD-",YEAR(TODAY()),"-",TEXT(ROW()-1,"000"))
```
Result: `LEAD-2025-001`, `LEAD-2025-002`, etc.

### Next Follow-Up Date Calculation (Column AM)

```excel
=IF(AND(AL2<>"", AK2<3, AI2<>"Replied"),
  IF(AK2=0, AL2+3,
    IF(AK2=1, AL2+4,
      IF(AK2=2, AL2+7, "")
    )
  ),
  ""
)
```

Logic:
- If Follow-Up Count = 0 → +3 days (first follow-up)
- If Follow-Up Count = 1 → +4 days (second follow-up)
- If Follow-Up Count = 2 → +7 days (final follow-up)
- If Replied → blank (stop sequence)

### Days Since Last Contact (Helper Column)

Add Column AO:

```excel
=IF(AL2<>"", TODAY()-AL2, "")
```

### Email Status Summary (Dashboard)

Create a "Dashboard" tab with these formulas:

**Total Leads**:
```excel
=COUNTA('Raw Leads'!A:A)-1
```

**Qualified Leads**:
```excel
=COUNTIF('Raw Leads'!Z:Z,"Qualified")
```

**Emails Sent**:
```excel
=COUNTIF('Raw Leads'!AE:AE,"Sent")
```

**Replies Received**:
```excel
=COUNTIF('Raw Leads'!AI:AI,"Replied")
```

**Reply Rate**:
```excel
=COUNTIF('Raw Leads'!AI:AI,"Replied")/COUNTIF('Raw Leads'!AE:AE,"Sent")
```
Format as percentage.

**Average Lead Score**:
```excel
=AVERAGE('Raw Leads'!Y:Y)
```

---

## Data Validation (Dropdowns)

### Source Platform (Column I)

Options: `LinkedIn, Google Maps, Apollo.io, Reddit, Twitter, Facebook, Instagram`

### Email Status (Column L)

Options: `Valid, Invalid, Unknown, Not Found`

### Funding Stage (Column S)

Options: `Bootstrapped, Seed, Series A, Series B, Series C, Public`

### Qualification Status (Column Z)

Options: `Pending, Qualified, Rejected`

### Email Status (Column AE)

Options: `Draft, Ready, Sent, Replied, Bounced, Unsubscribed`

### Reply Status (Column AI)

Options: `No Reply, Replied, Unsubscribed`

### Follow-Up Status (Column AN)

Options: `Active, Stopped, Completed`

---

## n8n Integration: How Workflows Update This Sheet

### Workflow 1: Multi-Platform Lead Scraper
**Updates**: Columns A-J (Lead Information)
**Action**: Append new rows to "Raw Leads" tab
**Frequency**: Daily at 9 AM + manual trigger

### Workflow 2: Email Finder & Enrichment
**Updates**: Columns K-P (Contact Details), Q-X (Enrichment Data)
**Trigger**: New row added with empty Email Address
**Action**: Update existing row with email + enrichment data

### Workflow 3: AI Lead Qualifier & Researcher
**Updates**: Columns U-AB (Enrichment + Qualification)
**Trigger**: Email Status = "Valid"
**Action**: Update Lead Score, Qualification Status, Notes

### Workflow 4: Email Generator
**Updates**: Columns AC-AD (Email Subject, Email Body)
**Trigger**: Qualification Status = "Qualified"
**Action**: Update with AI-generated email, set Email Status = "Ready"

### Workflow 5: Email Sender & Reply Monitor
**Updates**: Columns AE-AJ (Email Campaign)
**Trigger**: Email Status = "Ready"
**Action**:
- Send email via Gmail
- Update Email Status = "Sent"
- Set Sent Date = TODAY()
- Track opens/clicks
- Update Reply Status if reply received

### Workflow 6: Follow-Up Sequencer
**Updates**: Columns AK-AN (Follow-Up Tracking)
**Trigger**: Daily cron (9 AM)
**Action**:
- Check Next Follow-Up Date
- If TODAY() ≥ Next Follow-Up Date AND Follow-Up Count < 3:
  - Send follow-up email
  - Increment Follow-Up Count
  - Update Last Contact Date
  - Calculate new Next Follow-Up Date

---

## Sharing & Permissions

### For n8n Integration

1. **Share sheet with n8n service account**:
   - Get service account email from n8n credentials
   - Share with "Editor" permissions

2. **Get Sheet ID**:
   - From URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
   - Copy `YOUR_SHEET_ID`
   - Use in n8n workflows

### For Team Members

- **Owner**: You (full access)
- **Editors**: Team members who send emails
- **Viewers**: Stakeholders who monitor metrics

---

## Backup & Data Retention

### Daily Backup

Set up automatic daily backup:
1. Google Sheets → File → Download → CSV
2. Save to Google Drive folder: "Lead Database Backups"
3. Use Google Apps Script to automate:

```javascript
function backupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Raw Leads');
  var folder = DriveApp.getFolderById('YOUR_BACKUP_FOLDER_ID');
  var date = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd");
  var fileName = 'Leads_Backup_' + date + '.csv';

  var csv = convertSheetToCSV(sheet);
  folder.createFile(fileName, csv);
}

function convertSheetToCSV(sheet) {
  var data = sheet.getDataRange().getValues();
  var csv = '';
  data.forEach(function(row) {
    csv += row.join(',') + '\n';
  });
  return csv;
}
```

Set trigger: Daily at 11 PM.

---

## Performance Optimization

### For Large Datasets (1,000+ leads)

**Issue**: Google Sheets slows down with complex formulas

**Solutions**:

1. **Use FILTER instead of complex IF statements**
2. **Limit conditional formatting** to essential columns only
3. **Archive old leads** (>90 days) to separate sheet
4. **Use ARRAYFORMULA** for batch calculations:

```excel
=ARRAYFORMULA(IF(A2:A<>"", TEXT(ROW(A2:A)-1,"000"), ""))
```

5. **Consider migrating to Airtable** if >5,000 leads (better performance)

---

## Example Data (First 3 Rows)

| Lead ID | First Name | Last Name | Company Name | Job Title | Email | Lead Score | Qualification Status | Email Status |
|---------|------------|-----------|--------------|-----------|-------|------------|---------------------|--------------|
| LEAD-2025-001 | John | Smith | Acme SaaS | CEO | john@acme.com | 9 | Qualified | Sent |
| LEAD-2025-002 | Sarah | Johnson | TechCorp | COO | sarah@techcorp.com | 8 | Qualified | Ready |
| LEAD-2025-003 | Mike | Davis | StartupXYZ | Founder | mike@startupxyz.com | 6 | Rejected | - |

---

## Setup Checklist

- [ ] Create new Google Sheet: "Cold Email Master Database"
- [ ] Create 4 tabs: Raw Leads, Qualified Leads, Sent Emails, Replied Leads
- [ ] Add 40 column headers to "Raw Leads"
- [ ] Set up data validation (dropdowns) for status columns
- [ ] Add conditional formatting (color coding by Lead Score, Email Status)
- [ ] Create Dashboard tab with summary formulas
- [ ] Share with n8n service account (Editor permissions)
- [ ] Copy Sheet ID for n8n workflows
- [ ] Set up daily backup (optional)
- [ ] Test: Add 1 manual lead, verify formulas work

---

## Troubleshooting

**Issue**: n8n can't update sheet
**Fix**: Verify service account has Editor permissions

**Issue**: Formulas not calculating
**Fix**: Check for circular references, use F9 to recalculate

**Issue**: Sheet is slow
**Fix**: Archive old data, simplify formulas, limit conditional formatting

**Issue**: Duplicate leads added
**Fix**: Add UNIQUE() wrapper or check for existing Email/LinkedIn URL before inserting

---

**Next Step**: Import this template into Google Sheets, then connect to n8n workflows!
