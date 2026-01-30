# Deployment Summary - Quick Reference Guide

Essential commands, configurations, and troubleshooting for the scraping-leads-workflow automation system.

## System Overview

**6 Modular Workflows** → **Google Sheets Database** → **Gmail Sending** → **50-100 leads converted daily**

---

## Quick Start Checklist

- [ ] Google Sheets created with 40 columns
- [ ] n8n workflows imported (6 files)
- [ ] Google Sheets credentials configured
- [ ] Gmail API credentials configured
- [ ] ChatGPT/OpenAI API key added
- [ ] Hunter.io API key added (free tier)
- [ ] All workflows tested individually
- [ ] Email warm-up schedule started (Week 1-4)

---

## Daily Operations

### Morning Routine (9:00 AM)

**1. Check Scraping Results**
```
Open Google Sheets → "Raw Leads" tab
Expected: 50-150 new leads scraped overnight
```

**2. Review Qualified Leads**
```
"Qualified Leads" tab
Expected: 30-50% of scraped leads (Lead Score ≥ 7)
```

**3. Check Email Sending Status**
```
"Sent Emails" tab
Expected: 50-100 emails sent (rate: 10/hour)
```

**4. Hot Leads Alert**
```
"Replied Leads" tab
Expected: 5-15 replies (10-15% reply rate)
```

### Evening Check (5:00 PM)

**1. Reply Monitoring**
```
Check Gmail inbox for replies
n8n should auto-update Google Sheets
Verify "Reply Status" = "Replied" for new responses
```

**2. Bounce/Error Check**
```
Google Sheets → Filter "Email Status" = "Bounced"
Remove invalid emails from future campaigns
```

**3. Daily Metrics**
```
Dashboard tab in Google Sheets:
- Total leads scraped today: ___
- Emails sent today: ___
- Reply rate: ___%
- Open rate: ___%
```

---

## Workflow Control

### Start All Workflows

```bash
# In n8n dashboard:
1. Activate "1-multi-platform-scraper"
2. Activate "2-email-finder"
3. Activate "3-ai-qualifier-researcher"
4. Activate "4-email-generator"
5. Activate "5-email-sender-monitor"
6. Activate "6-follow-up-sequencer"
```

### Stop All Workflows

```bash
# Emergency stop (e.g., fixing issue):
Deactivate all 6 workflows in n8n dashboard
Fix issue → Re-activate one by one
Test each workflow before activating next
```

### Manual Trigger (Testing)

```bash
# Workflow 1 (Scraper):
Click "Execute Workflow" button
Wait 2-5 minutes
Check Google Sheets for new leads

# Workflows 2-6:
Add test lead manually to Google Sheets
Watch workflows trigger automatically
```

---

## Environment Variables

### Required for All Workflows

```bash
# Google Sheets
GOOGLE_SHEET_ID="your_spreadsheet_id_here"

# Gmail
USER_EMAIL="izzydevbuilds@gmail.com"

# AI (ChatGPT/DeepSeek)
CHATGPT_API_KEY="sk-..."
OPENAI_API_BASE_URL="https://api.openai.com/v1"  # or DeepSeek URL

# Email Finding
HUNTER_API_KEY="your_hunter_io_key"  # Free: 50/month

# Rate Limiting
DAILY_EMAIL_LIMIT=50  # Start low, increase to 100
EMAILS_PER_HOUR=10

# CAN-SPAM Compliance
BUSINESS_ADDRESS="1234 Main St, Los Angeles, CA 90001"
UNSUBSCRIBE_WEBHOOK_URL="https://your-n8n-instance.com/webhook/unsubscribe"
```

### How to Update Variables

**In n8n workflows:**
1. Open workflow
2. Find node using variable (e.g., Google Sheets node)
3. Update "Document ID" field with `GOOGLE_SHEET_ID`
4. Save workflow

---

## Common Commands

### Check Google Sheets Status

```bash
# Verify sheet is accessible
# Open: https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit

# Check row count
# Raw Leads tab → Last row number = total leads scraped
```

### Check n8n Workflow Execution Logs

```bash
# In n8n dashboard:
1. Click workflow name
2. Click "Executions" tab (right side)
3. View recent runs (green = success, red = error)
4. Click failed execution → view error details
```

### Test Email Deliverability

```bash
# Send test email to mail-tester.com
1. Add test lead to Google Sheets with email: test-xxxxx@mail-tester.com
2. Wait for email to send
3. Check score at mail-tester.com
4. Goal: 9/10 or 10/10
```

---

## Troubleshooting

### Issue: No leads being scraped

**Check:**
- Workflow 1 is activated
- Schedule trigger is set correctly (daily 9 AM)
- Scraping code has valid cookies/API keys
- Rate limits not exceeded

**Fix:**
```bash
1. Open Workflow 1 in n8n
2. Click "Execute Workflow" manually
3. Check execution log for errors
4. Update API keys/cookies if expired
```

### Issue: Emails not sending

**Check:**
- Workflow 5 is activated
- Gmail API credentials valid
- Daily send limit not reached (500/day Gmail)
- "Email Status" = "Ready" in Google Sheets

**Fix:**
```bash
1. Verify Gmail OAuth2 token not expired
2. Check Google Sheets "Email Status" column
3. Manually trigger Workflow 5
4. Check execution log
```

### Issue: Low reply rate (<5%)

**Check:**
- Email deliverability score (use mail-tester.com)
- Personalization quality (AI-generated emails)
- Target audience fit (Lead Score accuracy)
- Email warm-up status (Week 1-4 process)

**Fix:**
```bash
1. Improve lead qualification (Workflow 3)
2. A/B test email templates
3. Increase personalization depth
4. Check spam folder (emails landing in spam?)
```

### Issue: High bounce rate (>5%)

**Check:**
- Email validation enabled (Workflow 2)
- Hunter.io API working
- Email format correct

**Fix:**
```bash
1. Add email validation step (ZeroBounce/NeverBounce)
2. Remove bounced emails from Google Sheets
3. Improve email finding logic (Workflow 2)
```

### Issue: Workflow crashes/errors

**Check:**
- n8n execution logs
- Google Sheets permissions
- API rate limits
- Memory/timeout issues

**Fix:**
```bash
1. Check n8n logs: Settings → Log Streaming
2. Verify all credentials are valid
3. Add error handling nodes (Stop on Error = false)
4. Increase workflow timeout (Settings → Timeout)
```

---

## Performance Metrics

### Target KPIs

| Metric | Target | Acceptable | Poor |
|--------|--------|------------|------|
| Leads Scraped/Week | 200-500 | 100-200 | <100 |
| Email Deliverability Score | 9-10/10 | 7-8/10 | <7/10 |
| Open Rate | 40-50% | 25-40% | <25% |
| Reply Rate | 10-15% | 5-10% | <5% |
| Bounce Rate | <2% | 2-5% | >5% |
| Unsubscribe Rate | <0.5% | 0.5-1% | >1% |

### Weekly Report Template

```
Week of: [Date]

LEAD GENERATION:
- Total leads scraped: ___
- Qualified leads: ___
- Lead Score avg: ___/10

EMAIL CAMPAIGN:
- Emails sent: ___
- Open rate: ___%
- Click rate: ___%
- Reply rate: ___%
- Meetings booked: ___

ISSUES:
- Bounce rate: ___%
- Spam complaints: ___
- System downtime: ___ hours

ACTIONS:
- [ ] Action item 1
- [ ] Action item 2
```

---

## Maintenance Schedule

### Daily
- Check replied leads (morning & evening)
- Monitor bounce rate
- Review execution logs for errors

### Weekly
- Clean up bounced emails
- Test deliverability (mail-tester.com)
- Review performance metrics
- A/B test new email templates

### Monthly
- Archive old leads (>90 days)
- Update AI prompts (improve personalization)
- Review and optimize scraping scripts
- Audit CAN-SPAM compliance

---

## Emergency Contacts & Resources

### Tools & Services

| Service | URL | Purpose |
|---------|-----|---------|
| n8n Cloud | https://izzydev.app.n8n.cloud/ | Workflow platform |
| Google Sheets | https://docs.google.com/spreadsheets/ | Lead database |
| Gmail | https://mail.google.com | Email sending |
| Hunter.io | https://hunter.io | Email finding |
| mail-tester.com | https://www.mail-tester.com | Deliverability check |

### Documentation

| Doc | Purpose |
|-----|---------|
| README.md | Project overview & architecture |
| SETUP_GUIDE.md | Step-by-step setup (15 parts) |
| SCRAPING_STRATEGY.md | Platform-specific scraping |
| EMAIL_DELIVERABILITY.md | Warm-up & CAN-SPAM |

### API Status Pages

- OpenAI Status: https://status.openai.com
- Google Workspace Status: https://www.google.com/appsstatus
- Hunter.io Status: https://status.hunter.io

---

## Cost Tracking

### Monthly Breakdown

```
n8n Cloud: $20/month (or free self-hosted)
ChatGPT API: $20-40/month
Hunter.io: $0/month (free tier: 50 emails)
Gmail: $0/month (free tier: 500 emails/day)
Google Sheets: $0/month
---
TOTAL: $40-60/month
```

### Cost Optimization Tips

1. **Use DeepSeek instead of ChatGPT**: $5-10/month (cheaper)
2. **Self-host n8n**: Free (requires VPS ~$5/month)
3. **Manual email patterns**: Reduce Hunter.io dependency
4. **Batch processing**: Reduce API calls

---

## Scaling Roadmap

### Current Capacity (MVP)
- 200-500 leads/week
- 50-100 emails/day
- 5-15 replies/week

### Phase 2 (Month 2)
- Upgrade to G Suite ($6/month)
- 2,000 emails/day capacity
- 1,000+ leads/week
- A/B testing framework

### Phase 3 (Month 3+)
- Multi-campaign support
- CRM integration (HubSpot/Salesforce)
- Team collaboration features
- Advanced analytics

---

## Security & Compliance

### Data Protection
- Google Sheets access: Limited to n8n service account only
- API keys: Stored in n8n credentials (encrypted)
- Email data: Auto-archive after 90 days
- Unsubscribe data: Retained indefinitely (CAN-SPAM)

### Backup Strategy
- Google Sheets: Auto-backup daily to Google Drive
- n8n workflows: Export JSON weekly
- Credentials: Store securely in password manager

### CAN-SPAM Compliance Checklist
- [ ] Physical address in email footer
- [ ] Unsubscribe link in every email
- [ ] Unsubscribe processed within 10 days
- [ ] Accurate "From" information
- [ ] Honest subject lines
- [ ] "Business inquiry" disclosure

---

## Next Steps After Deployment

**Week 1:**
- [ ] Start email warm-up (5 emails/day to warm contacts)
- [ ] Test all 6 workflows manually
- [ ] Monitor execution logs daily

**Week 2-4:**
- [ ] Gradually increase email volume (10 → 20 → 50/day)
- [ ] Track deliverability scores
- [ ] Optimize AI prompts

**Month 2+:**
- [ ] A/B test email templates
- [ ] Scale to 100 emails/day
- [ ] Analyze ROI and optimize

---

## Support

**Issues?** Check:
1. Execution logs in n8n
2. Google Sheets permissions
3. API rate limits
4. Troubleshooting section above

**Need help?** Review:
- SETUP_GUIDE.md (detailed setup)
- SCRAPING_STRATEGY.md (scraping issues)
- EMAIL_DELIVERABILITY.md (email problems)

---

**Last Updated**: 2025-01-04
**System Status**: ✅ Operational
**Next Review**: Weekly on Mondays
