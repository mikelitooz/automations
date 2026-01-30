# Complete Setup Guide - Marcus Real Estate Automation

This guide walks you through setting up all 6 workflows from scratch. Estimated setup time: **2-4 hours**.

---

## Table of Contents
1. [Prerequisites & Accounts](#prerequisites--accounts)
2. [Environment Variables Setup](#environment-variables-setup)
3. [Google Sheets Configuration](#google-sheets-configuration)
4. [n8n Workflow Import](#n8n-workflow-import)
5. [API Credentials Configuration](#api-credentials-configuration)
6. [Testing Each Workflow](#testing-each-workflow)
7. [Going Live](#going-live)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites & Accounts

### Required Accounts (Must Have)

| Service | Purpose | Cost | Sign Up Link |
|---------|---------|------|--------------|
| **n8n Cloud** or Self-hosted | Workflow automation platform | $20/mo or Free (self-hosted) | [n8n.io](https://n8n.io) |
| **Google Workspace** | Sheets, Gmail, Calendar | Free or $6/user/mo | [workspace.google.com](https://workspace.google.com) |
| **Twilio** | SMS notifications | Pay-as-you-go (~$20/mo) | [twilio.com](https://twilio.com) |
| **Anthropic Claude** | AI lead qualification | $30-50/mo | [console.anthropic.com](https://console.anthropic.com) |

### Recommended Accounts (Optional but Valuable)

| Service | Purpose | Cost | Sign Up Link |
|---------|---------|------|--------------|
| **Calendly** | Viewing scheduler | Free or $10/mo | [calendly.com](https://calendly.com) |
| **MLS API** | Property data (official) | Varies by MLS | Contact your local MLS |
| **Apify** | Zillow/Realtor scraping (fallback) | Pay-as-you-go (~$10-20/mo) | [apify.com](https://apify.com) |

---

## Environment Variables Setup

### Step 1: Create `.env` File in n8n

In n8n Cloud:
1. Go to **Settings** → **Environment Variables**
2. Add each variable below

In Self-hosted n8n:
1. Edit your `.env` file in n8n directory
2. Add these variables:

```bash
# AGENT INFORMATION
AGENT_EMAIL=marcus@realestate.com
AGENT_PHONE=+15551234567

# GOOGLE SERVICES
GOOGLE_SHEETS_ID=your_google_sheet_id_here

# TWILIO (SMS)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+15559876543

# CLAUDE AI
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxx

# MLS/PROPERTY DATA (Choose one)
# Option A: Official MLS API
MLS_API_URL=https://api.bridgedataoutput.com/api/v2/OData/listings
MLS_API_KEY=your_mls_api_key

# Option B: Apify (Zillow/Realtor scraping fallback)
APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxx

# CALENDLY
CALENDLY_URL=https://calendly.com/marcus/property-viewing
CALENDLY_API_KEY=your_calendly_api_key_optional
```

### Step 2: Get Each API Key

#### Google Services
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Real Estate Automation"
3. Enable APIs:
   - Google Sheets API
   - Gmail API
   - Google Calendar API
4. Create Service Account:
   - IAM & Admin → Service Accounts → Create
   - Name: "n8n-automation"
   - Download JSON key
5. In n8n:
   - Add credential: "Google Service Account"
   - Upload JSON key file
   - Test connection

#### Twilio (SMS)
1. Go to [Twilio Console](https://console.twilio.com)
2. Sign up / Log in
3. Get a phone number:
   - Phone Numbers → Buy a Number
   - Select US number with SMS capability ($1/mo)
4. Copy credentials:
   - Account SID: Dashboard → Account SID
   - Auth Token: Dashboard → Auth Token
   - Phone Number: Phone Numbers → Active Numbers

#### Claude API (Anthropic)
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Sign up / Log in
3. API Keys → Create Key
4. Copy key (starts with `sk-ant-`)
5. Add credits ($5 minimum, $50 recommended)

#### MLS API (Option A - Preferred)
1. Contact your local MLS provider
2. Request API access (usually requires real estate license)
3. Common providers:
   - Bridge Interactive (BridgeDataOutput)
   - RETS/RESO Web API
   - ListHub
4. Get API endpoint URL and authentication token

#### Apify (Option B - Fallback)
1. Go to [Apify](https://apify.com)
2. Sign up / Log in
3. Settings → Integrations → API Token
4. Copy token (starts with `apify_api_`)
5. Add $10 credit for scraping

#### Calendly
1. Go to [Calendly](https://calendly.com)
2. Sign up / Log in (Free plan works)
3. Create event type:
   - Name: "Property Viewing"
   - Duration: 60 minutes
   - Questions to ask:
     - Phone number (required)
     - Property address of interest (optional)
4. Get your scheduling link: Settings → My Link
5. (Optional) API key: Integrations → API & Webhooks

---

## Google Sheets Configuration

### Step 1: Create Master Leads Sheet

Follow the detailed guide in [templates/master-leads-sheet-template.md](templates/master-leads-sheet-template.md).

**Quick setup:**
1. Create new Google Sheet
2. Name: "Marcus Real Estate - Master Leads"
3. Add columns from template (17 columns total)
4. Format columns (dates, numbers, text)
5. Add conditional formatting (color-coding)
6. Share with n8n service account (Editor access)

### Step 2: Copy Sheet ID

From the URL:
```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
                                    ^^^^^^^^^^^^^^^^^^^^^^^^
                                    This is your SHEET_ID
```

Add to n8n environment variables:
```
GOOGLE_SHEETS_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## n8n Workflow Import

### Step 1: Import All 6 Workflows

In n8n dashboard:
1. Click "Workflows" (left sidebar)
2. Click "+ Add workflow" → "Import from file"
3. Import in this order:

   **Import Order (Important!):**
   1. ✅ `workflows/1-lead-capture-hub.json`
   2. ✅ `workflows/2-ai-qualification.json`
   3. ✅ `workflows/4-viewing-scheduler.json` (before 3!)
   4. ✅ `workflows/3-property-recommendations.json`
   5. ✅ `workflows/5-follow-up-sequences.json`
   6. ✅ `workflows/6-market-report-generator.json`

4. After each import, click "Save" (don't activate yet)

### Step 2: Configure Credentials

For each workflow, configure these credentials:

**Google Sheets:**
- Type: "Google Sheets OAuth2 API" or "Service Account"
- Use service account JSON key from earlier

**Gmail:**
- Type: "Gmail OAuth2"
- Sign in with your agent Google account

**Google Calendar:**
- Type: "Google Calendar OAuth2"
- Same account as Gmail

**Twilio:**
- Type: "Twilio API"
- Account SID + Auth Token from earlier

**HTTP Request (Claude, MLS):**
- Type: "Header Auth"
- Add header `x-api-key` with your API keys

### Step 3: Update Node Settings

Some nodes may need manual updates:

**Workflow 1 (Lead Capture):**
- Open "Append to Master Leads Sheet" node
- Verify sheet name = "Master Leads"
- Test connection

**Workflow 2 (AI Qualification):**
- Open "Claude AI Lead Qualification" node
- Verify API endpoint and headers
- Test with sample data

**Workflow 4 (Viewing Scheduler):**
- Open "Calendly Booking Webhook" node
- Copy webhook URL
- Add to Calendly: Settings → Webhooks → Add Webhook

---

## API Credentials Configuration

### Google Sheets API

**n8n Configuration:**
1. Credentials → Add → "Google Sheets OAuth2 API"
2. Option A: OAuth2
   - Click "Connect Google Account"
   - Grant permissions
3. Option B: Service Account (recommended)
   - Upload JSON key file
   - Test connection

### Gmail API

**n8n Configuration:**
1. Credentials → Add → "Gmail OAuth2"
2. Click "Connect Gmail Account"
3. Sign in with agent email
4. Grant permissions

**Enable Less Secure Apps (if needed):**
1. Google Account → Security
2. 2-Step Verification: ON
3. App Passwords → Generate for "n8n"

### Twilio API

**n8n Configuration:**
1. Credentials → Add → "Twilio API"
2. Enter:
   - Account SID: `ACxxxxxxxxxxxx`
   - Auth Token: `your_token`
3. Test: Send test SMS

**Set Webhook URLs:**
1. Twilio Console → Phone Numbers → Active Numbers
2. Click your number
3. Messaging:
   - A MESSAGE COMES IN: `https://your-n8n.com/webhook/twilio-call-capture`
4. Voice:
   - A CALL COMES IN: `https://your-n8n.com/webhook/twilio-call-capture`

### Claude API

**n8n Configuration:**
1. In workflow 2, find "Claude AI Lead Qualification" node
2. Authentication: "Generic Credential Type" → "Header Auth"
3. Add credentials:
   - Name: `x-api-key`
   - Value: `your_claude_api_key`

**Test:**
1. Execute workflow with test lead
2. Check execution log for Claude response

### MLS API (or Apify Fallback)

**Option A: Official MLS API**
1. In workflows 3 & 6, find "Search MLS API" nodes
2. Update URL: `https://api.your-mls-provider.com/listings`
3. Authentication: Usually Bearer token or API key
4. Test query

**Option B: Apify (Zillow/Realtor Scraping)**
1. In workflows 3 & 6, disable MLS nodes
2. Enable "Zillow API (Fallback)" nodes
3. Add Apify token in headers
4. Test scraping

### Calendly Webhook

1. Calendly → Integrations → Webhooks
2. Add webhook:
   - URL: `https://your-n8n.com/webhook/calendly-booking`
   - Events: `invitee.created`
3. Copy shared secret (optional)
4. Test booking

---

## Testing Each Workflow

### Test Workflow 1: Lead Capture Hub

**Test via Website Form:**
1. Activate workflow in n8n
2. Get webhook URL from "Website Contact Form" node
3. Test with cURL:
   ```bash
   curl -X POST https://your-n8n.com/webhook/website-contact \
     -H "Content-Type: application/json" \
     -d '{
       "source": "website",
       "name": "Test User",
       "email": "test@example.com",
       "phone": "+15551234567",
       "budget": "250000",
       "property_type": "House",
       "message": "Looking for 3 bed 2 bath in Oak Park"
     }'
   ```
4. Check:
   - ✅ Lead appears in Google Sheet
   - ✅ Email notification received
   - ✅ SMS notification received

### Test Workflow 2: AI Qualification

**Prerequisites:** Test lead from Workflow 1 exists in sheet

1. Workflow 2 triggers automatically when new lead detected
2. Wait 1-2 minutes
3. Check Google Sheet:
   - ✅ "Lead Score" updated (HOT/WARM/COLD)
   - ✅ "Budget" extracted
   - ✅ "Timeline" filled
   - ✅ "Status" = "Qualified"
4. Check lead's email: Should receive personalized response
5. Check lead's SMS: Should receive text message
6. If HOT lead: Check agent receives call + SMS alert

### Test Workflow 3: Property Recommendations

**Manual Test:**
1. Set workflow trigger to "Manual"
2. Add qualified lead to sheet (if not already there)
3. Click "Execute Workflow" in n8n
4. Check:
   - ✅ MLS API returns properties
   - ✅ Email sent with property matches
   - ✅ "Properties Sent" column updated in sheet

**Automated Test:**
1. Change trigger back to "Schedule: Daily at 9 AM"
2. For immediate test, change cron to run in 2 minutes
3. Wait and verify execution

### Test Workflow 4: Viewing Scheduler

**Test via Calendly:**
1. Activate workflow
2. Book test appointment on Calendly
3. Check:
   - ✅ Google Calendar event created
   - ✅ Confirmation email sent to lead
   - ✅ Confirmation SMS sent to lead
   - ✅ Agent notified via SMS
   - ✅ Sheet updated: "Viewings Scheduled"
4. Wait 24 hours: Check reminder sent
5. Wait 2 hours before appointment: Check final reminder

### Test Workflow 5: Follow-Up Sequences

**Test with Mock Data:**
1. Add test leads with different "Last Contact" dates:
   - Lead A: 2 days ago (should trigger Day 2 follow-up)
   - Lead B: 7 days ago (should trigger Day 7 follow-up)
   - Lead C: 30 days ago (should move to cold sequence)
2. Set workflow to manual execution (for testing)
3. Execute workflow
4. Check:
   - ✅ Correct follow-ups sent based on timeline
   - ✅ Emails match lead stage (New/Active/Cold)
   - ✅ SMS messages sent
   - ✅ Sheet "Last Contact" updated

### Test Workflow 6: Market Report Generator

**Test via Webhook:**
1. Get webhook URL from workflow
2. Test with cURL:
   ```bash
   curl -X POST https://your-n8n.com/webhook/market-report \
     -H "Content-Type: application/json" \
     -d '{
       "neighborhood": "Oak Park",
       "email": "client@example.com",
       "name": "John Doe"
     }'
   ```
3. Check:
   - ✅ MLS data fetched (90-day sales + active listings)
   - ✅ Claude AI generates analysis
   - ✅ Beautiful HTML report emailed
   - ✅ Report logged in "Market Reports Log" sheet

**Test Batch Report:**
```bash
curl -X POST https://your-n8n.com/webhook/market-report \
  -H "Content-Type: application/json" \
  -d '{
    "neighborhoods": "Oak Park, Riverside, Downtown",
    "email": "client@example.com"
  }'
```
Should generate 3 separate reports.

---

## Going Live

### Step 1: Final Checklist

- [ ] All 6 workflows imported and tested
- [ ] All API credentials working
- [ ] Google Sheet shared with n8n service account
- [ ] Email notifications working
- [ ] SMS notifications working
- [ ] Calendly webhook connected
- [ ] Test lead processed successfully end-to-end
- [ ] Agent phone/email updated in environment variables

### Step 2: Activate Workflows

Activate in this order:
1. ✅ Workflow 1 (Lead Capture Hub)
2. ✅ Workflow 2 (AI Qualification)
3. ✅ Workflow 4 (Viewing Scheduler)
4. ✅ Workflow 3 (Property Recommendations) - Set to Daily 9 AM
5. ✅ Workflow 5 (Follow-Up Sequences) - Set to Daily 10 AM
6. ✅ Workflow 6 (Market Reports) - Keep manual/on-demand

### Step 3: Connect Lead Sources

**Website Contact Form:**
```html
<form action="https://your-n8n.com/webhook/website-contact" method="POST">
  <input type="hidden" name="source" value="website">
  <input name="name" placeholder="Full Name" required>
  <input name="email" type="email" placeholder="Email" required>
  <input name="phone" placeholder="Phone" required>
  <input name="budget" placeholder="Budget">
  <input name="property_type" placeholder="Looking for...">
  <textarea name="message" placeholder="Tell us what you're looking for"></textarea>
  <button type="submit">Submit</button>
</form>
```

**Zillow/Realtor.com:**
- Configure lead forwarding in your Zillow agent dashboard
- Forward to: Your n8n webhook URL
- Or set up email forwarding to Gmail (Gmail trigger will catch it)

**Email Referrals:**
- Already captured by Gmail trigger (looks for "Referral:" in subject)
- Forward referral emails with subject starting with "Referral:"

### Step 4: Monitor First Week

**Daily Checks (Days 1-7):**
- Check n8n execution logs each morning
- Verify leads appearing in Google Sheet
- Confirm SMS/emails being sent
- Check for any error notifications
- Monitor API usage/costs

**What to Watch:**
- Lead capture rate (should match your lead sources)
- AI qualification accuracy (manually review first 10-20)
- SMS delivery rate (should be 98%+)
- Email open rates (track with Gmail)
- Response times (should be <60 seconds)

### Step 5: Optimization (Week 2+)

**Adjust based on results:**
- Email templates: Personalize based on response rates
- Follow-up timing: Adjust days if needed
- Lead scoring: Refine HOT/WARM/COLD criteria
- Property matching: Tweak budget ranges
- SMS messages: A/B test different wording

---

## Troubleshooting

### Common Issues & Solutions

#### Issue: Leads not appearing in Google Sheet

**Symptoms:** Webhook receives data but sheet doesn't update

**Solutions:**
1. Check n8n service account has "Editor" access to sheet
2. Verify GOOGLE_SHEETS_ID is correct
3. Check sheet name is exactly "Master Leads" (case-sensitive)
4. Look at n8n execution log for errors
5. Test Google Sheets node manually

#### Issue: AI qualification not working

**Symptoms:** Leads stuck in "Unqualified" status

**Solutions:**
1. Check Claude API key is valid (test in Claude Console)
2. Verify API credits available ($5+ balance)
3. Check Claude API rate limits (default: 50 requests/min)
4. Look at workflow execution log for Claude response
5. Ensure prompt is correctly formatted (check JSON syntax)

#### Issue: SMS not sending

**Symptoms:** No text messages received

**Solutions:**
1. Verify Twilio credentials in n8n
2. Check Twilio phone number has SMS capability
3. Check Twilio account balance ($10+ recommended)
4. Verify recipient phone format: +15551234567 (E.164 format)
5. Check Twilio logs for delivery status

#### Issue: Emails not sending

**Symptoms:** Gmail node fails or emails not received

**Solutions:**
1. Re-authenticate Gmail OAuth2 in n8n
2. Check Gmail account not locked/suspended
3. Enable "Less secure app access" (if using older auth)
4. Check spam folder
5. Verify sender email matches AGENT_EMAIL variable

#### Issue: Calendly bookings not triggering workflow

**Symptoms:** Appointments scheduled but workflow doesn't run

**Solutions:**
1. Check Calendly webhook URL is correct
2. Verify webhook is active in Calendly settings
3. Check Calendly event type has webhook enabled
4. Test webhook manually with cURL
5. Look at Calendly webhook logs

#### Issue: Property recommendations returning no results

**Symptoms:** Empty property lists in emails

**Solutions:**
1. Check MLS API credentials valid
2. Verify API endpoint URL correct
3. Check search criteria (budget range, location)
4. Fallback to Apify (Zillow scraper) if MLS unavailable
5. Manually test MLS API with Postman

#### Issue: Market reports failing

**Symptoms:** Error generating reports

**Solutions:**
1. Check MLS API has 90 days of sales data
2. Verify neighborhood name matches MLS data
3. Check Claude API working
4. Simplify report (disable charts temporarily)
5. Test with known neighborhood first

#### Issue: Workflow execution too slow

**Symptoms:** Long delays between lead capture and response

**Solutions:**
1. Check n8n server performance (CPU/RAM)
2. Optimize workflow nodes (remove unnecessary waits)
3. Use n8n Cloud instead of self-hosted
4. Reduce API timeout values
5. Run critical workflows (1, 2) on separate n8n instance

#### Issue: High API costs

**Symptoms:** Unexpected bills from Twilio/Claude/Apify

**Solutions:**
1. Set spending limits in each service
2. Reduce SMS frequency (email-first strategy)
3. Cache Claude responses for similar leads
4. Use MLS API instead of Apify scraping
5. Monitor usage dashboards daily

---

## Getting Help

**n8n Community:**
- Forum: [community.n8n.io](https://community.n8n.io)
- Documentation: [docs.n8n.io](https://docs.n8n.io)

**API Documentation:**
- Claude: [docs.anthropic.com](https://docs.anthropic.com)
- Twilio: [twilio.com/docs](https://www.twilio.com/docs)
- Google Sheets: [developers.google.com/sheets](https://developers.google.com/sheets)

**Real Estate Tech:**
- MLS standards: [reso.org](https://reso.org)
- Bridge API: [bridgedataoutput.com/docs](https://bridgedataoutput.com/docs)

---

**Setup Complete!** You now have a fully automated real estate lead management system. Monitor performance for the first 30 days and adjust as needed.

Next: Review [DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md) for quick reference guide.
