# Apify Setup Guide - Multi-Platform Lead Scraper

Complete step-by-step guide to set up Apify integration for the Multi-Platform Lead Scraper workflow (Proof of Concept).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Apify Account Setup](#part-1-apify-account-setup)
3. [Part 2: Get Your Apify API Token](#part-2-get-your-apify-api-token)
4. [Part 3: Configure n8n Credentials](#part-3-configure-n8n-credentials)
5. [Part 4: Import Workflow to n8n](#part-4-import-workflow-to-n8n)
6. [Part 5: Configure Workflow Settings](#part-5-configure-workflow-settings)
7. [Part 6: Set Up Google Sheets](#part-6-set-up-google-sheets)
8. [Part 7: Test Individual Platforms](#part-7-test-individual-platforms)
9. [Part 8: Run Full Multi-Platform Test](#part-8-run-full-multi-platform-test)
10. [Part 9: Monitor Costs](#part-9-monitor-costs)
11. [Part 10: Switch to Production Mode](#part-10-switch-to-production-mode)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **n8n Cloud account** (https://izzydev.app.n8n.cloud/) or self-hosted n8n instance
- ✅ **Google account** with Google Sheets access
- ✅ **Credit card** for Apify subscription (required even for free tier)
- ✅ **20-30 minutes** for complete setup

**Estimated Costs**:
- Apify Starter Plan: **$39/month** (includes $39 in platform credits)
- POC Scraping (5 results per platform): **~$0.50-1/day** (covered by credits)
- Production Scraping (50 results per platform): **~$14-20/month** (covered by credits)

---

## Part 1: Apify Account Setup

### Step 1.1: Create Apify Account

1. Go to **https://console.apify.com/sign-up**
2. Sign up using:
   - Email + Password
   - OR GitHub account
   - OR Google account (recommended for easy access)

3. Verify your email address (check spam folder if needed)

### Step 1.2: Choose Your Plan

1. Log in to Apify Console: **https://console.apify.com/**
2. Navigate to **Settings** → **Billing**
3. Choose a plan:

   **Option A: Free Tier** (For initial testing only)
   - $5 platform credits/month
   - 4GB actor RAM
   - 7-day data retention
   - **Limitations**: Only ~250-300 leads/month total across all platforms

   **Option B: Starter Plan** (Recommended for POC)
   - **$39/month**
   - **$39 platform credits included**
   - 8GB actor RAM
   - 30-day data retention
   - **Can scrape**: ~3,000-5,000 leads/month comfortably

4. Add payment method (credit card required)

### Step 1.3: Verify Account is Active

1. Go to **https://console.apify.com/billing/usage**
2. Confirm you see:
   - Current plan name (Free or Starter)
   - Available credits balance
   - Usage statistics (should be $0 initially)

---

## Part 2: Get Your Apify API Token

### Step 2.1: Navigate to Integrations

1. In Apify Console, click your **profile icon** (top-right)
2. Select **Settings** → **Integrations**
3. OR go directly to: **https://console.apify.com/account/integrations**

### Step 2.2: Create Personal API Token

1. Scroll to **Personal API tokens** section
2. Click **+ New token**
3. Configure token:
   - **Token name**: `n8n-lead-scraper`
   - **Description**: `API token for n8n multi-platform lead scraper workflow`
   - **Permissions**: Full access (default)

4. Click **Create token**

### Step 2.3: Copy and Save Token

⚠️ **IMPORTANT**: You can only view the token once! Copy it immediately.

1. A modal will appear with your token (format: `apify_api_XXXXXXXXXX`)
2. Click **Copy to clipboard**
3. Save it securely in a password manager or text file
4. Example format: `apify_api_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

---

## Part 3: Configure n8n Credentials

### Step 3.1: Create HTTP Header Auth Credential

1. Log in to your n8n instance: **https://izzydev.app.n8n.cloud/**
2. Go to **Settings** (gear icon in left sidebar)
3. Click **Credentials** tab
4. Click **+ Add Credential** button

### Step 3.2: Select Credential Type

1. Search for: **HTTP Header Auth**
2. Click **HTTP Header Auth** from results

### Step 3.3: Configure Credential

Fill in the form:

```
Credential Name: Apify API Token
Header Name: Authorization
Value: Bearer apify_api_XXXXXXXXXX
```

**Important**: Replace `apify_api_XXXXXXXXXX` with your actual token from Part 2.

**Format must be**: `Bearer [space] apify_api_XXXXXXXXXX`

### Step 3.4: Save Credential

1. Click **Save** button
2. Verify credential appears in your credentials list
3. Note the credential ID (you'll reference this in the workflow)

---

## Part 4: Import Workflow to n8n

### Step 4.1: Download Workflow File

The workflow file is located at:
```
scraping-leads-workflow/workflows/1-multi-platform-scraper-apify-poc.json
```

### Step 4.2: Import to n8n

1. In n8n, go to **Workflows** (left sidebar)
2. Click **+ Add workflow** → **Import from File**
3. Select `1-multi-platform-scraper-apify-poc.json`
4. Click **Open**

### Step 4.3: Verify Import Success

You should see a workflow with **19 nodes**:
- 1 Schedule Trigger
- 1 Config node
- 3 LinkedIn nodes (Start Actor, Wait, Fetch Results)
- 3 Facebook nodes (Start Actor, Wait, Fetch Results)
- 3 Google Maps nodes (Start Actor, Wait, Fetch Results)
- 3 Error Check nodes (IF nodes)
- 1 Merge node
- 1 Transform Data node
- 1 Deduplicate node
- 1 Google Sheets Append node

---

## Part 5: Configure Workflow Settings

### Step 5.1: Link Apify Credentials to HTTP Nodes

You need to configure **9 HTTP Request nodes** to use your Apify credential:

**Nodes to configure**:
1. `LinkedIn - Start Actor`
2. `LinkedIn - Fetch Results`
3. `Facebook - Start Actor`
4. `Facebook - Fetch Results`
5. `Google Maps - Start Actor`
6. `Google Maps - Fetch Results`

**For each node**:
1. Click the node to open settings
2. Scroll to **Credential to connect with** section
3. Click the dropdown
4. Select **Apify API Token** (the credential you created in Part 3)
5. Click **Save** (or just close the panel - auto-saves)

### Step 5.2: Configure Apify Config Node

1. Click **Apify Config** node
2. Update these values:

```javascript
apify_token: "YOUR_APIFY_API_TOKEN"  // Replace with actual token
test_mode: "true"  // Keep as "true" for initial testing
max_results_per_platform: 5  // Start with 5 results for testing
linkedin_search_url: "https://www.linkedin.com/search/results/people/?keywords=founder%20OR%20ceo"
google_maps_query: "digital marketing agencies in San Francisco"
facebook_search_query: "automation agency"
```

**Customize search queries** for your target audience:
- **LinkedIn**: Change keywords to match your ideal customer profile (ICP)
- **Google Maps**: Change query and location to your target geography
- **Facebook**: Change query to match relevant pages/groups

---

## Part 6: Set Up Google Sheets

### Step 6.1: Create New Google Sheet

1. Go to **https://sheets.google.com/**
2. Click **+ Blank** to create new spreadsheet
3. Name it: **Lead Scraper - Apify POC**

### Step 6.2: Create "Raw Leads - Apify" Tab

1. Rename **Sheet1** to **Raw Leads - Apify**
2. Add these column headers in Row 1:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Lead ID | First Name | Last Name | Full Name | Company Name | Job Title | Location | Email Address | Phone Number | LinkedIn URL |

| K | L | M | N | O | P | Q | R | S | T |
|---|---|---|---|---|---|---|---|---|---|
| Company Website | Twitter Handle | Connections Count | Follower Count | Is Premium | Skills | Education | Company Size | Company Industry | Rating |

| U | V | W | X | Y | Z |
|---|---|---|---|---|---|
| Review Count | Facebook URL | Facebook Likes | Source Platform | Scrape Date | Lead Score |

| AA |
|----|
| Qualification Status |

**Total: 27 columns** (enhanced schema with Apify fields)

### Step 6.3: Get Sheet ID

1. Look at your Google Sheets URL:
   ```
   https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```
2. Copy the `SHEET_ID_HERE` part (long alphanumeric string)
3. Example: `1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p`

### Step 6.4: Configure Google Sheets Credentials in n8n

1. In n8n, go to **Settings** → **Credentials**
2. Click **+ Add Credential**
3. Search for: **Google Sheets OAuth2 API**
4. Click it to configure
5. Follow Google OAuth flow:
   - Sign in with your Google account
   - Grant n8n access to Google Sheets
   - Click **Allow**
6. Save credential as: **Google Sheets - Lead Scraper**

### Step 6.5: Link Sheet to Workflow

1. In your workflow, click **Append to Google Sheets** node
2. Configure:
   - **Credential**: Select `Google Sheets - Lead Scraper`
   - **Operation**: `Append`
   - **Document**: Click **Select from list**, find `Lead Scraper - Apify POC`
   - **Sheet Name**: `Raw Leads - Apify`
   - **Columns**: Already mapped in workflow (no changes needed)

3. Click **Save**

---

## Part 7: Test Individual Platforms

**Important**: Test one platform at a time before running all 3 together.

### Step 7.1: Test LinkedIn Only

1. Click **Apify Config** node
2. Verify `test_mode: "true"` and `max_results_per_platform: 5`
3. Click **LinkedIn - Start Actor** node
4. Click **Test step** button (play icon at bottom of panel)
5. Wait 45-60 seconds for execution
6. Check execution results:
   - **LinkedIn - Start Actor**: Should return `runId` and `defaultDatasetId`
   - **LinkedIn - Fetch Results**: Should return array of 5 LinkedIn profiles
   - **LinkedIn - Error Check**: Should output to TRUE branch

**Expected output fields**:
```json
{
  "fullName": "John Doe",
  "headline": "CEO at TechCorp",
  "companyName": "TechCorp",
  "location": "San Francisco, CA",
  "profileUrl": "https://linkedin.com/in/johndoe",
  "connectionsCount": 500,
  "skills": ["Leadership", "SaaS", "B2B Sales"]
}
```

### Step 7.2: Test Facebook Only

1. Click **Facebook - Start Actor** node
2. Click **Test step**
3. Wait 60-90 seconds (Facebook is slower)
4. Check results:
   - Should return array of 5 Facebook pages
   - Look for `name`, `url`, `likes`, `category` fields

**If Facebook fails**: This is common. Facebook scraping is heavily restricted. You may see empty results or errors. This is expected.

### Step 7.3: Test Google Maps Only

1. Click **Google Maps - Start Actor** node
2. Click **Test step**
3. Wait 30-45 seconds (fastest scraper)
4. Check results:
   - Should return array of 5 local businesses
   - Look for `title`, `address`, `phone`, `website`, `rating` fields

**Expected output fields**:
```json
{
  "title": "Acme Marketing Agency",
  "address": "123 Market St, San Francisco, CA 94103",
  "phone": "+1 (415) 555-1234",
  "website": "https://acmemarketing.com",
  "rating": 4.8,
  "reviewsCount": 127
}
```

---

## Part 8: Run Full Multi-Platform Test

### Step 8.1: Execute Entire Workflow

1. Ensure `test_mode: "true"` in **Apify Config** node
2. Click **Execute workflow** button (top-right, play icon)
3. Wait 90-120 seconds for all 3 platforms to complete
4. Watch execution progress:
   - All 3 platforms start simultaneously (parallel execution)
   - Each waits for its specific duration
   - Results merge together
   - Data gets transformed and deduplicated
   - Leads append to Google Sheets

### Step 8.2: Verify Google Sheets Output

1. Go to your **Lead Scraper - Apify POC** Google Sheet
2. Check **Raw Leads - Apify** tab
3. You should see **10-15 rows** (deduplication may reduce from initial 15)

**Sample row**:
| Lead ID | Full Name | Company Name | Source Platform | Scrape Date | Lead Score |
|---------|-----------|--------------|-----------------|-------------|------------|
| LEAD-2025-0001 | John Doe | TechCorp | LinkedIn | 2025-01-04 | NULL |
| LEAD-2025-0002 | | Acme Marketing | Google Maps | 2025-01-04 | 5 |
| LEAD-2025-0003 | | Tech Startup Hub | Facebook | 2025-01-04 | NULL |

### Step 8.3: Validate Data Quality

Check these fields are populated correctly:
- ✅ **LinkedIn leads**: Full name, job title, company name, LinkedIn URL
- ✅ **Google Maps leads**: Company name, phone, website, rating
- ✅ **Facebook leads**: Company name, Facebook URL, likes (if available)
- ✅ **All leads**: Source platform, scrape date, lead ID

### Step 8.4: Check for Errors

1. In n8n, click **Executions** (left sidebar)
2. Find your latest execution
3. Click to view details
4. Check for any red nodes (errors)

**Common issues**:
- **Facebook returns 0 results**: Expected. Facebook blocking is common.
- **LinkedIn returns 0 results**: Check if `linkedin_search_url` has results when opened in browser
- **Google Maps returns 0 results**: Try a more specific location query

---

## Part 9: Monitor Costs

### Step 9.1: Check Apify Usage Dashboard

1. Go to **https://console.apify.com/billing/usage**
2. You should see:
   - **Today's usage**: ~$0.50-1.00
   - **This month**: Same (if first run)
   - **Remaining credits**: $38-38.50 (if Starter plan)

### Step 9.2: View Individual Actor Costs

1. Go to **https://console.apify.com/actors/runs**
2. Click each recent run to see:
   - **Compute units used**: 0.02-0.05 CU per run
   - **Cost**: $0.15-0.35 per platform per run
   - **Run duration**: 20-45 seconds

**Expected costs per run (5 results per platform)**:
- LinkedIn: ~$0.20-0.30
- Facebook: ~$0.20-0.30
- Google Maps: ~$0.10-0.20
- **Total per daily run**: ~$0.50-0.80

**Projected monthly cost (30 runs)**:
- **Test mode (5 results/platform)**: $15-24/month
- **Production (50 results/platform)**: $60-90/month ⚠️ (may need higher plan)

### Step 9.3: Set Budget Alerts

1. In Apify Console, go to **Settings** → **Billing**
2. Scroll to **Usage alerts**
3. Click **+ Add alert**
4. Configure:
   - **Threshold**: $35 (90% of Starter plan credits)
   - **Email**: Your email address
   - **Action**: Send notification

---

## Part 10: Switch to Production Mode

⚠️ **Only do this after successful testing and cost validation!**

### Step 10.1: Update Config Node

1. Click **Apify Config** node
2. Change these values:

```javascript
test_mode: "false"  // Switch to production
max_results_per_platform: 50  // Increase to 50 results
```

### Step 10.2: Customize Search Queries

Update queries to target your specific ICP:

**LinkedIn example (targeting SaaS founders)**:
```
https://www.linkedin.com/search/results/people/?keywords=founder%20AND%20saas&origin=GLOBAL_SEARCH_HEADER
```

**Google Maps example (targeting agencies in multiple cities)**:
```
"marketing agencies in San Francisco OR Los Angeles OR Seattle"
```

**Facebook example (targeting specific niches)**:
```
"e-commerce automation agency"
```

### Step 10.3: Activate Schedule Trigger

1. Click **Schedule Daily 9AM** node
2. Verify schedule: **Every day at 9:00 AM**
3. Toggle workflow to **Active** (switch at top-right)
4. Workflow will now run automatically daily

### Step 10.4: Monitor First Production Run

1. Wait for first scheduled run (or manually execute)
2. Check Google Sheets for 100-150 leads (after deduplication)
3. Check Apify costs: Should be $14-20 per run
4. Verify data quality is maintained at higher volume

---

## Troubleshooting

### Issue 1: "Authorization failed" Error

**Cause**: Apify API token not configured correctly

**Solution**:
1. Verify token format: `Bearer apify_api_XXXXXXXXXX` (note the space after "Bearer")
2. Check token hasn't expired: Go to https://console.apify.com/account/integrations
3. Regenerate token if needed and update all 6 HTTP Request nodes

### Issue 2: "Dataset not found" Error

**Cause**: Actor run failed or didn't complete in time

**Solution**:
1. Increase wait time in **Wait nodes**:
   - LinkedIn: 60 seconds (up from 45)
   - Facebook: 90 seconds (up from 60)
   - Google Maps: 45 seconds (up from 30)
2. Check actor run status in Apify Console: https://console.apify.com/actors/runs

### Issue 3: No Results from LinkedIn

**Cause**: Search URL has no results or requires login

**Solution**:
1. Test LinkedIn search URL in browser (logged in)
2. Verify you see results
3. Copy exact URL from browser (including filters)
4. Update `linkedin_search_url` in Config node

### Issue 4: Facebook Returns Empty Array

**Cause**: Facebook aggressive anti-scraping measures

**Solution**:
- This is expected behavior
- Facebook scraping success rate is 30-50%
- Consider using Facebook Graph API instead (requires business account)
- OR manually export Facebook Group members and import to sheets

### Issue 5: High Apify Costs

**Cause**: Running too frequently or too many results per platform

**Solution**:
1. Reduce `max_results_per_platform` to 25-30
2. Change schedule to every 2-3 days instead of daily
3. Upgrade to higher Apify plan if needed

### Issue 6: Google Sheets Append Fails

**Cause**: Sheet ID incorrect or credentials expired

**Solution**:
1. Verify Sheet ID in **Append to Google Sheets** node
2. Test Google Sheets credential: Settings → Credentials → Test
3. Re-authenticate if needed

### Issue 7: Duplicate Leads in Sheet

**Cause**: Deduplication logic failing

**Solution**:
1. Check **Deduplicate Leads** node execution log
2. Verify email/LinkedIn URL fields are populated
3. Manually review and remove duplicates from sheet
4. Consider adding additional deduplication keys

---

## Next Steps

After successful setup:

1. ✅ **Run daily for 1 week** - Monitor data quality and costs
2. ✅ **Review APIFY_POC_README.md** - Understand workflow architecture
3. ✅ **Read APIFY_ACTOR_CONFIGURATIONS.md** - Learn advanced configuration
4. ✅ **Check APIFY_COST_TRACKING.md** - Optimize costs

5. **Phase 2 Planning**: Add remaining platforms (Reddit, Twitter, Instagram)
6. **Lead Qualification**: Build AI-powered lead scoring workflow
7. **Outreach Automation**: Create email campaign workflow

---

## Support Resources

- **Apify Documentation**: https://docs.apify.com/
- **n8n Documentation**: https://docs.n8n.io/
- **Apify Community Forum**: https://community.apify.com/
- **Apify Support**: support@apify.com (Starter plan includes email support)

---

**Setup completed!** 🎉 Your Multi-Platform Lead Scraper with Apify is now operational.
