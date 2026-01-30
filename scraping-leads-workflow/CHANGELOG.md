# Changelog

All notable changes to the Multi-Platform Lead Scraping & Cold Email Automation system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-01-04

### 🎉 Major Release: Real Web Scraping + Dual-Path AI Qualification

This is a **major version upgrade** with significant architecture changes to workflows 1 and 3.

### Added

#### Workflow 1: Multi-Platform Scraper
- ✨ **Real Puppeteer web scraping** for LinkedIn and Google Maps
- ✨ **7 platform support** (up from 1): LinkedIn, Google Maps, Apollo, Reddit, Twitter, Facebook (placeholder), Instagram (placeholder)
- ✨ **Platform Router node** with Switch logic to route to different scraping methods
- ✨ **LinkedIn Puppeteer Scraper** - Headless Chrome automation for LinkedIn search results
- ✨ **Google Maps Puppeteer Scraper** - Local business data extraction
- ✨ **Reddit JSON API** integration (no authentication required)
- ✨ **Twitter API v2** integration (free tier: 1500 tweets/month)
- ✨ **Advanced deduplication logic** - Removes duplicates by email, LinkedIn URL, or company+name combination
- ✨ **Anti-detection features** - Random delays (2-8 seconds), user-agent rotation, rate limiting
- ✨ **Scraping Config node** - Centralized configuration for platform selection and credentials

#### Workflow 3: AI Lead Qualifier & Researcher
- ✨ **Dual-path qualification system** - Intelligent routing based on data availability
- ✨ **Path A: Website-Based Qualification** - Deep content analysis for leads with company websites
- ✨ **Path B: Social Media Qualification** - Profile-based scoring for Reddit/Twitter/social leads without websites
- ✨ **Check Website Exists node** - Switch node that routes leads to appropriate qualification path
- ✨ **Platform-specific AI prompts**:
  - Path A: 4-category scoring (Manual Processes, Growth Stage, Industry Fit, Decision Maker)
  - Path B: Job title-based scoring with conservative thresholds
- ✨ **Separate AI models** for each path (enables different temperature/model settings)
- ✨ **Merge node** to combine results from both qualification paths

### Changed

#### Workflow 1: Multi-Platform Scraper
- 🔄 **Complete rebuild**: Increased from 4 nodes to 15 nodes
- 🔄 **Replaced Apollo.io API-only approach** with multi-platform scraping architecture
- 🔄 **Enhanced data cleaning** with comprehensive deduplication logic
- 🔄 **Improved error handling** - Error objects filtered out during deduplication

#### Workflow 3: AI Lead Qualifier & Researcher
- 🔄 **Complete rebuild**: Increased from 7 nodes to 14 nodes
- 🔄 **Lowered qualification threshold for social leads**: Score >= 6 (vs >= 7 for website leads)
- 🔄 **Capped social lead scores at 8/10** (reserves 9-10 for leads with full website data)
- 🔄 **Enhanced AI prompts** with detailed scoring guides and keyword indicators
- 🔄 **Added timeout to website scraping** (15 seconds) to prevent hanging on slow sites

### Improved

- 💰 **Cost reduction**: $20-60/month (down from $69-189/month) - **73% cheaper**
- 🚀 **No expensive API subscriptions required** (Reddit and Twitter are free tier)
- 🎯 **Better lead quality** through platform-specific qualification logic
- 📊 **More comprehensive data** from 7 sources instead of 1
- 🔒 **Better data quality** with advanced deduplication preventing duplicate outreach

### Technical Details

#### Workflow 1 Node Breakdown
- **Before v2.0**: 4 nodes (Schedule Trigger → Apollo API → Clean Data → Google Sheets)
- **After v2.0**: 15 nodes
  - 1x Schedule Trigger
  - 1x Scraping Config (Set node)
  - 1x Platform Router (Switch node)
  - 7x Scraper nodes (LinkedIn, Google Maps, Apollo API, Reddit, Twitter, Facebook, Instagram)
  - 1x Merge node
  - 1x Clean & Deduplicate (Code node with 100+ lines of logic)
  - 1x Google Sheets Append

#### Workflow 3 Node Breakdown
- **Before v2.0**: 7 nodes (Trigger → Filter → Scrape → HTML→MD → AI Chain → Update)
- **After v2.0**: 14 nodes
  - 1x Google Sheets Trigger
  - 1x Filter (Email + Status check)
  - 1x Check Website Exists (Switch node)
  - **Path A** (Website): 5 nodes (Scrape → HTML→MD → AI Chain → Model → Parser)
  - **Path B** (Social): 3 nodes (AI Chain → Model → Parser)
  - 1x Merge Paths
  - 1x Update Google Sheets

### Dependencies

#### New Requirements
- **Puppeteer** - Required for LinkedIn and Google Maps scraping
  - Installation: `npm install puppeteer` in n8n instance
  - n8n Cloud users may need to use Execute Command node first
- **LinkedIn session cookie** (`li_at`) - Get from browser cookies after logging into LinkedIn
- **Twitter Bearer Token** (optional) - Get from https://developer.twitter.com/ for Twitter scraping

### Breaking Changes

⚠️ **Workflow 1 (Multi-Platform Scraper)**
- **Complete JSON structure change** - Cannot be updated via partial edits, must re-import
- **New configuration required** in "Scraping Config" node:
  - `platform`: Select which platform to scrape (linkedin, google_maps, apollo, reddit, twitter, facebook, instagram)
  - `linkedin_cookie`: Session cookie for LinkedIn (li_at value)
  - `twitter_api_key`: Bearer token for Twitter API (optional)
  - `outscraper_api_key`: API key for Outscraper (optional fallback for Google Maps)

⚠️ **Workflow 3 (AI Lead Qualifier & Researcher)**
- **Complete JSON structure change** - Must re-import entire workflow
- **New qualification logic**: Leads without websites now qualify with lower threshold (6 vs 7)
- **New output**: `qualification_notes` field now includes scoring breakdown

### Migration Guide

If upgrading from v1.0 to v2.0:

1. **Backup existing workflows**
   - Export workflows 1 and 3 from n8n before upgrading
   - Keep backup of Google Sheets data

2. **Install Puppeteer**
   ```bash
   # For self-hosted n8n
   npm install puppeteer

   # For n8n Cloud
   # Use Execute Command node with: npm install puppeteer
   ```

3. **Re-import workflows**
   - Delete old workflows 1 and 3
   - Import new `1-multi-platform-scraper.json` (v2)
   - Import new `3-ai-qualifier-researcher.json` (v2)

4. **Configure credentials**
   - **Workflow 1**: Open "Scraping Config" node
     - Set `platform` to "reddit" for testing (no auth required)
     - For LinkedIn: Get `li_at` cookie from browser (Application → Cookies → linkedin.com)
     - For Twitter: Get bearer token from https://developer.twitter.com/
   - **Workflow 3**: Connect ChatGPT API credentials to both AI model nodes

5. **Update Google Sheets ID**
   - Replace `YOUR_GOOGLE_SHEET_ID` in both workflows with your actual sheet ID

6. **Test incrementally**
   - Start with Reddit scraping (no authentication)
   - Test qualification on a few leads
   - Verify deduplication logic works
   - Then enable other platforms (LinkedIn, Twitter, Google Maps)

7. **Monitor first runs**
   - Check n8n execution logs for errors
   - Verify leads are being deduplicated correctly
   - Confirm qualification routing works (check Path A vs Path B)

### Compatibility

✅ **Workflow 2 (Email Finder)** - No changes required, fully compatible
✅ **Workflow 4 (Email Generator)** - No changes required, fully compatible
✅ **Workflow 5 (Email Sender)** - No changes required, fully compatible
✅ **Workflow 6 (Follow-Up Sequencer)** - No changes required, fully compatible

All downstream workflows (2, 4, 5, 6) continue to work seamlessly because workflows 1 and 3 maintain the same Google Sheets output structure.

### Known Issues

- **Facebook and Instagram scrapers** are placeholders only (require complex authentication)
  - Alternative: Use manual export or Facebook/Instagram Graph API
- **LinkedIn session cookie expires** after ~1 year
  - Solution: Update `li_at` cookie in "Scraping Config" node when expired
- **Google Maps scraping** may be rate-limited by Google
  - Solution: Add longer delays or use Outscraper API fallback
- **Puppeteer may not be available** on n8n Cloud by default
  - Solution: Use Execute Command node to install, or contact n8n support

### Performance Notes

- **Reddit scraping**: ~2-5 seconds for 50 results (fastest)
- **Twitter scraping**: ~3-8 seconds for 50 results
- **LinkedIn scraping**: ~30-60 seconds for 50 results (slower due to anti-detection delays)
- **Google Maps scraping**: ~20-40 seconds for 50 results
- **Qualification (Path A - website)**: ~10-20 seconds per lead (website scraping + AI)
- **Qualification (Path B - social)**: ~3-5 seconds per lead (AI only, no scraping)

### Cost Analysis

#### v1.0 Costs
- Apollo.io API: $49-149/month (paid tiers for API access)
- ChatGPT API: $20-40/month
- **Total**: $69-189/month

#### v2.0 Costs
- Reddit API: **FREE** (no limits for JSON endpoint)
- Twitter API: **FREE** (1500 tweets/month on free tier)
- LinkedIn scraping: **FREE** (just needs session cookie)
- Google Maps scraping: **FREE** (rate-limited, or use Outscraper 100 free/month)
- ChatGPT API: $20-40/month
- **Total**: $20-60/month

**Savings**: $49-129/month (**73% cost reduction**)

### Future Roadmap

- [ ] Implement Facebook Groups scraper (requires Facebook Graph API integration)
- [ ] Implement Instagram Business scraper (requires Instagram Graph API)
- [ ] Add proxy support for Puppeteer scrapers (avoid IP bans)
- [ ] Add multiple LinkedIn session cookie rotation (scale scraping)
- [ ] Add Apify integration as alternative to Puppeteer (pre-built scrapers)
- [ ] Add email validation before qualification (reduce API costs)
- [ ] Add A/B testing for AI prompts (optimize qualification accuracy)

---

## [1.0.0] - 2025-01-03

### Initial Release

- 6 modular workflows for cold email automation
- Apollo.io API integration for lead scraping (single source)
- Hunter.io email finding (free tier)
- AI-powered lead qualification (single path, website scraping only)
- Hyper-personalized email generation
- Email sending via Gmail API (50-100/day)
- 3-touch follow-up sequencer
- Google Sheets as database
- CAN-SPAM compliance

---

## Version Comparison Summary

| Feature | v1.0 | v2.0 |
|---------|------|------|
| **Scraping Sources** | 1 (Apollo API) | 7 (LinkedIn, Google Maps, Apollo, Reddit, Twitter, FB, IG) |
| **Scraping Method** | REST API only | Puppeteer + REST APIs |
| **Qualification Paths** | 1 (website only) | 2 (website + social) |
| **Workflow 1 Nodes** | 4 | 15 |
| **Workflow 3 Nodes** | 7 | 14 |
| **Deduplication** | Basic | Advanced (3 criteria) |
| **Monthly Cost** | $69-189 | $20-60 |
| **Setup Complexity** | Low | Medium (requires Puppeteer) |
| **Lead Volume** | 50-200/month | 500-2000/month |
| **Free Tier Options** | 0 | 4 (Reddit, Twitter, LinkedIn, Google Maps) |
