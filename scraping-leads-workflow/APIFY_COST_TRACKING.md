# Apify Cost Tracking & Optimization Guide

Complete guide to monitoring, tracking, and optimizing Apify costs for the Multi-Platform Lead Scraper workflow.

---

## Table of Contents

1. [Understanding Apify Pricing](#understanding-apify-pricing)
2. [Cost Tracking Dashboard](#cost-tracking-dashboard)
3. [Daily Cost Monitoring](#daily-cost-monitoring)
4. [Monthly Budget Planning](#monthly-budget-planning)
5. [Cost Optimization Strategies](#cost-optimization-strategies)
6. [Budget Alerts Setup](#budget-alerts-setup)
7. [Cost vs. Value Analysis](#cost-vs-value-analysis)
8. [Troubleshooting High Costs](#troubleshooting-high-costs)

---

## Understanding Apify Pricing

### Pricing Model

Apify charges based on **compute units (CU)** consumed:
- **1 CU** = 1 GB RAM for 1 hour
- **Cost**: $0.40 per CU (Starter plan with Bronze discount)
- **Billing**: Pay-as-you-go using platform credits

### Plan Comparison

| Plan | Monthly Cost | Credits Included | Discount Tier | Best For |
|------|--------------|------------------|---------------|----------|
| **Free** | $0 | $5 | None | Testing only (250-300 leads/month) |
| **Starter** | **$39** | **$39** | Bronze (10% off) | POC & small-scale (1,500-3,000 leads/month) |
| **Standard** | $149 | $149 | Silver (15% off) | Production (5,000-10,000 leads/month) |
| **Business** | $499 | $499 | Gold (20% off) | High volume (20,000+ leads/month) |

### What Consumes Compute Units?

**Actor Runtime**: Main cost driver
- Memory allocated (GB) × Duration (hours) = CU consumed
- Example: 1 GB RAM actor running for 30 seconds = 0.0083 CU = $0.0033

**Proxy Usage**: Additional cost
- Datacenter proxies: Included in CU cost
- **Residential proxies**: +$0.50 per GB transferred (LinkedIn uses ~100 MB per 50 profiles = $0.05 extra)

**Storage**: Minimal cost
- 7-day retention: Free
- 30-day retention: $0.03 per GB per month (negligible for lead data)

---

## Cost Tracking Dashboard

### Accessing Apify Usage Dashboard

1. Go to **https://console.apify.com/billing/usage**
2. Dashboard shows:
   - **Current month usage** (bar chart)
   - **Daily breakdown** (line graph)
   - **Top actors by cost** (table)
   - **Remaining credits** (balance widget)

### Key Metrics to Monitor

**1. Daily Usage ($)**
- Target: $0.50-1.00/day (test mode) or $4-6/day (production)
- Alert if: Exceeds $10/day

**2. Monthly Burn Rate**
- Target: $15-24/month (test) or $120-165/month (production)
- Alert if: On track to exceed plan credits

**3. Cost Per Lead**
- Target: $0.03-0.08 per lead
- Alert if: Exceeds $0.15 per lead

**4. Actor Success Rate**
- Target: 85-95% successful runs
- Alert if: Drops below 70% (wasted costs on failures)

---

## Daily Cost Monitoring

### Daily Checklist (5 minutes)

**Every Morning**:
1. ✅ Check **https://console.apify.com/billing/usage**
2. ✅ Verify yesterday's cost: Should be $0.50-1.00 (test) or $4-6 (production)
3. ✅ Review **Actor runs**: https://console.apify.com/actors/runs
4. ✅ Check for failed runs (wasted $)
5. ✅ Review Google Sheets lead count (ROI validation)

### Manual Cost Calculation

**Formula**:
```
Daily Cost = (LinkedIn CU × $0.40) + (Facebook CU × $0.40) + (Google Maps CU × $0.40) + (Residential Proxy GB × $0.50)
```

**Example (Test Mode - 5 results per platform)**:
```
LinkedIn:   0.02 CU × $0.40 = $0.008 + (0.05 GB proxy × $0.50) = $0.033
Facebook:   0.02 CU × $0.40 = $0.008
Google Maps: 0.01 CU × $0.40 = $0.004
Total: $0.045 per run
Daily (1 run): $0.045
Monthly (30 runs): $1.35
```

**Example (Production - 50 results per platform)**:
```
LinkedIn:   0.18 CU × $0.40 = $0.072 + (0.50 GB proxy × $0.50) = $0.322
Facebook:   0.18 CU × $0.40 = $0.072
Google Maps: 0.12 CU × $0.40 = $0.048
Total: $0.442 per run
Daily (1 run): $0.44
Monthly (30 runs): $13.26
```

### Tracking Spreadsheet Template

Create a Google Sheet to track costs:

| Date | LinkedIn CU | Facebook CU | Google Maps CU | Total CU | Cost ($) | Leads Scraped | Cost per Lead |
|------|-------------|-------------|----------------|----------|----------|---------------|---------------|
| 2025-01-04 | 0.02 | 0.02 | 0.01 | 0.05 | $0.045 | 12 | $0.004 |
| 2025-01-05 | 0.02 | 0.03 | 0.01 | 0.06 | $0.054 | 14 | $0.004 |
| 2025-01-06 | 0.18 | 0.18 | 0.12 | 0.48 | $0.442 | 127 | $0.003 |

**Monthly Totals**: Sum columns to track monthly usage vs. budget.

---

## Monthly Budget Planning

### Budget Scenarios

**Scenario 1: Minimum Viable ($39/month - Starter Plan)**

**Configuration**:
- Run frequency: Every 3 days (10 runs/month)
- Results per platform: 25
- Total leads/month: ~600-750 (after deduplication)

**Cost Breakdown**:
```
LinkedIn:  10 runs × 0.10 CU × $0.40 = $0.40 + ($0.25 proxy) = $0.65/month
Facebook:  10 runs × 0.10 CU × $0.40 = $0.40/month
Google Maps: 10 runs × 0.06 CU × $0.40 = $0.24/month
Total Scraping: $1.29/month
Plan Cost: $39/month (includes $39 credits)
Total: $40.29/month
Remaining Credits: $37.71
```

**Scenario 2: Standard Production ($39/month - Starter Plan)**

**Configuration**:
- Run frequency: Daily (30 runs/month)
- Results per platform: 30
- Total leads/month: ~2,100-2,700

**Cost Breakdown**:
```
LinkedIn:  30 runs × 0.12 CU × $0.40 = $1.44 + ($0.75 proxy) = $2.19/month
Facebook:  30 runs × 0.12 CU × $0.40 = $1.44/month
Google Maps: 30 runs × 0.08 CU × $0.40 = $0.96/month
Total Scraping: $4.59/month
Plan Cost: $39/month (includes $39 credits)
Total: $43.59/month
Remaining Credits: $34.41
```

**Scenario 3: High Volume ($149/month - Standard Plan)**

**Configuration**:
- Run frequency: Daily (30 runs/month)
- Results per platform: 100
- Total leads/month: ~7,000-9,000

**Cost Breakdown**:
```
LinkedIn:  30 runs × 0.45 CU × $0.40 = $5.40 + ($2.50 proxy) = $7.90/month
Facebook:  30 runs × 0.45 CU × $0.40 = $5.40/month
Google Maps: 30 runs × 0.30 CU × $0.40 = $3.60/month
Total Scraping: $16.90/month
Plan Cost: $149/month (includes $149 credits)
Total: $165.90/month
Remaining Credits: $132.10
```

### Recommended Budget Allocation

**Month 1-2 (Testing Phase)**:
- Budget: $39/month (Starter Plan)
- Usage target: $2-5/month (stay well under limit)
- Focus: Validate data quality, not volume

**Month 3-4 (Ramp-Up Phase)**:
- Budget: $39/month (Starter Plan)
- Usage target: $10-20/month
- Focus: Increase volume, monitor cost per lead

**Month 5+ (Production Phase)**:
- Budget: $39-149/month (based on volume needs)
- Usage target: 50-80% of plan credits
- Focus: Optimize cost per qualified lead

---

## Cost Optimization Strategies

### Quick Wins (Save 30-50%)

**1. Skip Low-Performing Platforms**
- If Facebook success rate < 30%, remove it
- **Savings**: $1.50-5.40/month

**2. Reduce Run Frequency**
- Daily → Every 2 days: **Saves 50%**
- Daily → Twice a week: **Saves 70%**

**3. Lower Max Results**
- 50 → 30 per platform: **Saves 40%**
- 50 → 25 per platform: **Saves 50%**

**4. Test Mode by Default**
- Set `test_mode: "true"` as default
- Override to `false` only for production runs
- **Saves 90%** when testing workflow changes

### Advanced Optimizations (Save 50-70%)

**1. Smart Scheduling**
- Run LinkedIn on Mon/Wed/Fri only
- Run Google Maps on Tue/Thu only
- Skip Facebook entirely (manual outreach instead)
- **Savings**: $5-15/month

**2. Datacenter Proxies for Non-LinkedIn**
- Facebook + Google Maps: Use datacenter proxies (free)
- LinkedIn only: Use residential proxies
- **Savings**: $1-3/month on proxy costs

**3. Conditional Execution**
- Add IF node: Only scrape if Google Sheets has < 100 unqualified leads
- Prevents over-scraping when you have a backlog
- **Savings**: 20-40% on unnecessary runs

**4. Deduplication Before Scraping**
- Check if LinkedIn URL already exists in Google Sheets
- Skip scraping profiles you already have
- **Savings**: 10-30% on duplicate scraping

### Cost vs. Quality Tradeoffs

| Optimization | Cost Savings | Quality Impact | Recommended? |
|--------------|--------------|----------------|--------------|
| Reduce maxItems (50 → 30) | 40% | Low (still enough leads) | ✅ Yes |
| Skip Facebook | 33% | Medium (lose 30% of sources) | ⚠️ If <30% success rate |
| Datacenter proxies | 50% proxy cost | High for LinkedIn (block rate) | ❌ No for LinkedIn |
| Run every 2 days | 50% | Low (still 15 runs/month) | ✅ Yes |
| Reduce to 1 platform only | 66% | Very High (lose diversification) | ❌ No |

---

## Budget Alerts Setup

### Apify Built-In Alerts

**Step 1**: Go to **https://console.apify.com/settings/notifications**

**Step 2**: Enable "Usage alerts"

**Step 3**: Configure thresholds:
```
Alert 1: 50% of monthly credits used
Alert 2: 75% of monthly credits used
Alert 3: 90% of monthly credits used
```

**Step 4**: Add email addresses for notifications

**Step 5**: Enable Slack webhook (optional) for real-time alerts

### Custom n8n Budget Monitoring Workflow

Create a separate n8n workflow to monitor costs:

**Nodes**:
1. **Schedule Trigger**: Daily at 8 AM
2. **HTTP Request**: Fetch Apify usage data via API
   ```
   GET https://api.apify.com/v2/users/me/usage
   Authorization: Bearer YOUR_APIFY_TOKEN
   ```
3. **Code Node**: Calculate daily/monthly costs
4. **IF Node**: Check if costs exceed thresholds
5. **Gmail Node**: Send alert email if over budget

**Alert Thresholds**:
- Daily cost > $10: Warning email
- Monthly projection > $50 (Starter plan): Upgrade recommendation email
- Cost per lead > $0.15: Optimization needed email

---

## Cost vs. Value Analysis

### Lead Value Calculation

**Formula**:
```
Lead Value = (Qualified Leads × Conversion Rate × Average Deal Size) - Cost of Acquisition
```

**Example**:
```
Monthly Leads: 2,500
Qualification Rate: 30% (750 qualified leads)
Conversion Rate: 2% (15 customers)
Average Deal Size: $500
Monthly Revenue: 15 × $500 = $7,500
Monthly Cost: $43 (Apify + n8n)
Profit: $7,457
ROI: 17,251% 🚀
```

### Break-Even Analysis

**Question**: How many leads do I need to break even?

**Assumptions**:
- Cost per lead: $0.03-0.08
- Qualification rate: 30%
- Conversion rate: 2%
- Average deal size: $500

**Calculation**:
```
Break-even leads = Monthly Cost / (Qualified Rate × Conversion Rate × Deal Size)
Break-even leads = $43 / (0.30 × 0.02 × $500)
Break-even leads = $43 / $3
Break-even leads = 15 leads
```

**Interpretation**: You only need to scrape **15 leads per month** to break even. Anything above that is pure profit.

### ROI by Budget Scenario

| Scenario | Monthly Cost | Leads Scraped | Qualified Leads | Conversions | Revenue | ROI |
|----------|--------------|---------------|-----------------|-------------|---------|-----|
| Minimal | $40 | 750 | 225 | 5 | $2,500 | 6,150% |
| Standard | $44 | 2,500 | 750 | 15 | $7,500 | 16,945% |
| High Volume | $166 | 8,000 | 2,400 | 48 | $24,000 | 14,357% |

**Key Insight**: All scenarios have exceptional ROI. Focus on data quality over cost optimization.

---

## Troubleshooting High Costs

### Unexpected Cost Spikes

**Issue**: Daily cost suddenly jumped from $1 to $10

**Possible Causes**:
1. ✅ **Check workflow executions**: Did it run multiple times accidentally?
   - Solution: Review n8n execution history, disable duplicate triggers
2. ✅ **Check maxItems**: Did config change from 30 to 300?
   - Solution: Reset maxItems in Apify Config node
3. ✅ **Check actor failures**: Are actors retrying and failing repeatedly?
   - Solution: Review Apify run logs, fix input configuration errors
4. ✅ **Check proxy usage**: Did residential proxy usage spike?
   - Solution: Review network tab in Apify Console

### Consistently High Cost Per Lead

**Issue**: Cost per lead is $0.20+ (target: $0.03-0.08)

**Diagnostic Steps**:
1. **Check success rate**: Are 50%+ runs failing?
   - If yes: Fix actor configurations (see APIFY_ACTOR_CONFIGURATIONS.md)
2. **Check deduplication**: Are you scraping many duplicates?
   - If yes: Improve deduplication logic in workflow
3. **Check data quality**: Are scraped leads actually usable?
   - If no: Refine search queries to target better ICP fit

**Solutions**:
- Improve success rate: Use residential proxies, increase wait times
- Improve deduplication: Add pre-scraping duplicate check
- Improve ICP targeting: Refine LinkedIn keywords, Google Maps categories

### Exceeding Plan Credits

**Issue**: Usage projected to exceed $39/month (Starter plan)

**Short-Term Solutions**:
1. **Pause workflow**: Stop daily runs until next month
2. **Reduce volume**: Lower maxItems to 20-25
3. **Reduce frequency**: Run every 2-3 days instead of daily

**Long-Term Solutions**:
1. **Upgrade plan**: Move to Standard ($149/month)
2. **Buy credits**: Purchase additional credits ($0.40/CU, no discount)
3. **Optimize workflow**: Apply cost optimization strategies above

**Cost Comparison**:
- Upgrade to Standard: $149/month (includes $149 credits) = $0.34/CU effective
- Buy credits on Starter: $39 plan + $110 additional = $149 total = $0.40/CU effective
- **Recommendation**: Upgrade to Standard for better value

---

## Cost Tracking Checklist

### Daily (5 minutes)
- [ ] Check Apify usage dashboard
- [ ] Verify daily cost is within expected range ($0.50-1 test, $4-6 production)
- [ ] Review any failed runs (wasted costs)
- [ ] Update cost tracking spreadsheet

### Weekly (15 minutes)
- [ ] Calculate weekly burn rate
- [ ] Project monthly cost based on current usage
- [ ] Review cost per lead metric
- [ ] Compare actual vs. planned budget
- [ ] Adjust workflow if over budget

### Monthly (30 minutes)
- [ ] Full month cost review
- [ ] Calculate ROI (leads → qualified → conversions → revenue)
- [ ] Identify cost optimization opportunities
- [ ] Plan next month's budget allocation
- [ ] Update budget scenarios based on actuals

---

## Cost Benchmarks

### Industry Benchmarks (B2B Lead Scraping)

| Metric | Our Target | Industry Average | Our Advantage |
|--------|------------|------------------|---------------|
| Cost per lead | $0.03-0.08 | $2-10 | **96-99% cheaper** |
| Cost per qualified lead | $0.10-0.27 | $50-200 | **99% cheaper** |
| Monthly scraping cost | $39-166 | $500-2,000 | **75-92% cheaper** |
| Data quality | 90-95% | 60-80% | **+15-30%** |

### Alternative Solutions Comparison

| Solution | Monthly Cost | Leads/Month | Cost per Lead | Data Quality |
|----------|--------------|-------------|---------------|--------------|
| **Apify (Our Workflow)** | **$39-166** | **2,500-8,000** | **$0.03-0.08** | **90-95%** |
| Purchased lead lists | $500-2,000 | 1,000-5,000 | $0.50-2.00 | 40-60% |
| Manual scraping (VA) | $400-800 | 500-1,500 | $0.27-1.60 | 70-80% |
| Apollo.io paid plan | $49-149 | 1,000-10,000 | $0.05-0.15 | 85-90% |
| ZoomInfo | $15,000-40,000/year | Unlimited | $0.01-0.05 | 95%+ |

**Key Insight**: Apify workflow offers best cost/quality ratio for small-to-medium businesses. Only enterprise buyers justify ZoomInfo's premium.

---

## Summary & Recommendations

### Cost Management Best Practices

1. ✅ **Monitor daily** - 5 minutes every morning prevents surprise overages
2. ✅ **Start small** - Test mode (5 results) for first 2 weeks
3. ✅ **Track ROI** - Measure leads → qualified → conversions → revenue
4. ✅ **Optimize incrementally** - Make small tweaks, measure impact
5. ✅ **Set alerts** - Budget alerts at 50%, 75%, 90% of plan credits
6. ✅ **Focus on value** - $0.10/lead is still profitable if quality is high

### Recommended Budget Path

**Month 1**: $39 plan, test mode, $2-5 actual usage
**Month 2**: $39 plan, increase to 30 results/platform, $10-15 usage
**Month 3**: $39 plan, production (50 results), $20-30 usage
**Month 4+**: Consider Standard plan ($149) if consistently exceeding $39 credits

### When to Upgrade Plans

**Stay on Free ($5/month credits)**:
- Testing only
- Scraping < 300 leads/month
- No budget for paid tools

**Upgrade to Starter ($39/month)**:
- Production use
- Scraping 1,500-3,000 leads/month
- Need 30-day data retention
- Want email support

**Upgrade to Standard ($149/month)**:
- High volume (5,000-10,000 leads/month)
- Running multiple workflows
- Need priority support
- Consistently using $50-150/month in credits

**Upgrade to Business ($499/month)**:
- Enterprise scale (20,000+ leads/month)
- Running 5+ automation projects
- Need dedicated support
- Team collaboration required

---

## Support Resources

- **Apify Pricing Page**: https://apify.com/pricing
- **Usage Dashboard**: https://console.apify.com/billing/usage
- **API Docs (Usage Endpoint)**: https://docs.apify.com/api/v2#/reference/usage
- **Cost Calculator**: https://apify.com/pricing-calculator

---

**Last Updated**: 2025-01-04
**Version**: 1.0
