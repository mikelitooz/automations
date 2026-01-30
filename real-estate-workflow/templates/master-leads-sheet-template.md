# Master Leads Google Sheet Template

## Sheet Name: "Master Leads"

This is the central database for all lead management. Create a new Google Sheet with this exact structure:

### Column Headers (Row 1)

| Column | Header | Data Type | Description |
|--------|--------|-----------|-------------|
| A | **Timestamp** | DateTime | Auto-populated when lead captured |
| B | **Source** | Text | Zillow, Realtor.com, Website, Email Referral, Phone Call |
| C | **Name** | Text | Lead's full name |
| D | **Phone** | Text | Phone number (format: +1234567890) |
| E | **Email** | Email | Lead's email address |
| F | **Budget** | Text/Number | Budget range or max price |
| G | **Property Type** | Text | House, Condo, Townhouse, etc. |
| H | **Preapproval Status** | Text | Yes, No, Needs Lender, Unknown |
| I | **Last Contact** | DateTime | Last time lead was contacted |
| J | **Status** | Text | New, Qualified, Active, Viewing Scheduled, Cold, Closed |
| K | **Lead Score** | Text | HOT, WARM, COLD, Unqualified |
| L | **Timeline** | Text | 1-3 months, 3-6 months, 6+ months, Unknown |
| M | **Priorities** | Text | Key requirements (beds, baths, location, etc.) |
| N | **Notes** | Text | Additional notes, AI qualification reasoning |
| O | **Properties Sent** | Text | Count and dates of property recommendations |
| P | **Viewings Scheduled** | Text | List of scheduled viewings |
| Q | **Engagement Score** | Number | Calculated engagement metric (0-100) |

## Setup Instructions

### Step 1: Create the Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Blank" to create a new spreadsheet
3. Name it: **"Marcus Real Estate - Master Leads"**
4. Rename "Sheet1" to **"Master Leads"**

### Step 2: Add Headers

Copy and paste these headers into Row 1:

```
Timestamp	Source	Name	Phone	Email	Budget	Property Type	Preapproval Status	Last Contact	Status	Lead Score	Timeline	Priorities	Notes	Properties Sent	Viewings Scheduled	Engagement Score
```

### Step 3: Format Columns

**Apply these formats:**

- **Timestamp** (Column A): Format → Number → Date time
- **Last Contact** (Column I): Format → Number → Date time
- **Email** (Column E): No special format needed (plain text)
- **Engagement Score** (Column Q): Format → Number → Number (0 decimals)
- **All other columns**: Plain text

**Column Widths (recommended):**
- Timestamp: 150px
- Source: 100px
- Name: 150px
- Phone: 120px
- Email: 200px
- Budget: 100px
- Property Type: 120px
- Preapproval Status: 130px
- Last Contact: 150px
- Status: 120px
- Lead Score: 100px
- Timeline: 120px
- Priorities: 300px
- Notes: 300px
- Properties Sent: 200px
- Viewings Scheduled: 200px
- Engagement Score: 130px

### Step 4: Add Conditional Formatting (Color-Coding)

**Lead Score Column (K):**
- HOT = Red background (#fee2e2), Dark red text (#dc2626)
- WARM = Yellow background (#fef3c7), Orange text (#f59e0b)
- COLD = Blue background (#dbeafe), Blue text (#2563eb)
- Unqualified = Gray background (#f1f5f9), Gray text (#64748b)

**Status Column (J):**
- New = Light green (#d1fae5)
- Qualified = Green (#a7f3d0)
- Active = Blue (#bfdbfe)
- Viewing Scheduled = Purple (#e9d5ff)
- Cold = Gray (#e5e7eb)
- Closed = Dark green (#6ee7b7)

**To apply:**
1. Select column K → Format → Conditional formatting
2. Add rules for each value (HOT, WARM, COLD, Unqualified)
3. Repeat for column J

### Step 5: Create Additional Sheets

Add these optional tracking sheets:

#### Sheet 2: "Market Reports Log"
```
Timestamp | Neighborhood | Recipient | Avg Sold Price | Days on Market | Market Temp | Total Sold | Active Listings
```

#### Sheet 3: "Performance Dashboard" (Optional)
- Total leads by source (chart)
- Conversion rate by lead score
- Average engagement score
- Monthly deals closed

### Step 6: Share with n8n

1. Click "Share" button (top right)
2. Add your n8n service account email
3. Grant "Editor" access
4. Copy the Sheet ID from URL:
   - URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`
   - Extract `SHEET_ID` and save for `.env` file

### Step 7: Protect Important Columns (Optional)

To prevent accidental edits:
1. Select columns A, B, I (Timestamp, Source, Last Contact)
2. Right-click → Protect range
3. Set permissions to "Only you can edit"

## Sample Data (for Testing)

Add this test lead to row 2 for testing workflows:

```
Timestamp: 2025-01-22 10:00:00
Source: Website
Name: John Doe
Phone: +15551234567
Email: john.doe@test.com
Budget: 250000
Property Type: House
Preapproval Status: Unknown
Last Contact: 2025-01-22 10:00:00
Status: New
Lead Score: Unqualified
Timeline:
Priorities: 3 bed, 2 bath, good schools
Notes: Test lead for workflow validation
Properties Sent:
Viewings Scheduled:
Engagement Score: 0
```

## Usage Tips

**For Marcus:**
- **Filter views:** Use Data → Create a filter to view only HOT leads, or leads by Status
- **Sort by:** Engagement Score (descending) to prioritize high-engagement leads
- **Daily check:** Review "Status = New" leads first thing each morning
- **Weekly cleanup:** Archive or delete duplicate/spam leads

**Automation Notes:**
- Workflows automatically update this sheet
- Don't manually edit Timestamp or Last Contact (auto-generated)
- Lead Score changes automatically after AI qualification
- Status should progress: New → Qualified → Active → Viewing Scheduled → Closed
- Engagement Score increases with opens, clicks, viewings

## Troubleshooting

**Issue:** Workflows not updating sheet
- **Solution:** Check n8n service account has Editor access

**Issue:** Duplicate leads appearing
- **Solution:** Add "Email" as unique key in Workflow 1

**Issue:** Date formats showing incorrectly
- **Solution:** File → Settings → Locale → United States

**Issue:** Conditional formatting not working
- **Solution:** Re-apply rules exactly as listed above

## Advanced: Data Validation

To prevent data entry errors, add dropdown validation:

**Status Column (J):**
- Data → Data validation
- Criteria: List of items
- Values: `New, Qualified, Active, Viewing Scheduled, Cold, Closed`

**Lead Score Column (K):**
- Data → Data validation
- Criteria: List of items
- Values: `HOT, WARM, COLD, Unqualified`

**Preapproval Status Column (H):**
- Data → Data validation
- Criteria: List of items
- Values: `Yes, No, Needs Lender, Unknown`

---

## Sheet ID Location

After setup, your Sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
```

Copy `YOUR_SHEET_ID_HERE` and add to your n8n environment:
```
GOOGLE_SHEETS_ID=your_actual_sheet_id_here
```

---

**You're all set!** This sheet is now ready to receive leads from all 6 workflows.
