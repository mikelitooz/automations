# Email Deliverability & CAN-SPAM Compliance Guide

Complete guide to ensuring your cold emails land in the inbox (not spam) and comply with US CAN-SPAM regulations.

## Table of Contents

1. [Gmail Warm-Up Strategy](#gmail-warm-up-strategy)
2. [CAN-SPAM Compliance Checklist](#can-spam-compliance-checklist)
3. [Email Content Best Practices](#email-content-best-practices)
4. [Technical Setup (SPF, DKIM, DMARC)](#technical-setup-spf-dkim-dmarc)
5. [Tracking & Monitoring](#tracking--monitoring)
6. [Troubleshooting Spam Issues](#troubleshooting-spam-issues)

---

## Gmail Warm-Up Strategy

### Why Warm-Up Matters

**Cold Start Problem**: Sending 100 cold emails on Day 1 from izzydevbuilds@gmail.com = instant spam folder.

**Solution**: Gradually increase sending volume over 2-4 weeks to build sender reputation.

### Week-by-Week Warm-Up Schedule

#### Week 1: Manual Sending (0-5 emails/day)
**Goal**: Establish sending pattern with high engagement

**Day 1-3**:
- Send 3-5 emails to friends/colleagues
- Ask them to reply (high engagement = good signal)
- Open emails, click links, mark as important

**Day 4-7**:
- Send 5 emails/day to warm contacts
- Continue getting replies
- Gmail learns: "This sender gets replies = not spam"

#### Week 2: Semi-Automated (10-20 emails/day)
**Goal**: Increase volume while maintaining engagement

**Day 8-10**:
- Send 10 emails/day (5 warm + 5 cold prospects)
- Personalize each email
- Track open rates (should be 30%+)

**Day 11-14**:
- Increase to 20 emails/day
- Monitor bounce rate (<2%)
- Check spam complaints (should be 0)

#### Week 3: Ramping Up (30-50 emails/day)
**Goal**: Reach sustainable sending limit

**Day 15-21**:
- 30 emails/day (split morning/afternoon)
- Continue personalization
- Monitor deliverability (use mail-tester.com)

**Day 18-21**:
- Increase to 50 emails/day
- Stabilize at this volume
- Gmail daily limit: 500/day (we stay at 50-100 for safety)

#### Week 4+: Production Mode (50-100 emails/day)
**Goal**: Maintain reputation, scale carefully

- **50-100 emails/day** consistently
- Never spike above 100/day with free Gmail
- If upgrading to G Suite: can go up to 2,000/day (but still warm up gradually)

### Warm-Up Checklist

- [ ] Start with manual sends to warm contacts
- [ ] Get replies from at least 30% of emails
- [ ] Increase volume by 10-20% every 3 days
- [ ] Never skip days (consistency matters)
- [ ] Monitor bounce rate (<2%)
- [ ] Check spam folder daily
- [ ] Use mail-tester.com weekly to check score (aim for 9/10+)

---

## CAN-SPAM Compliance Checklist

### Legal Requirements (US Law)

CAN-SPAM Act applies to **all commercial emails**. Non-compliance = $51,744 per violation.

### 7 Required Elements

#### 1. Accurate "From" Information

**Required**: Email must accurately identify sender

- ✅ **From**: Izzy Dev <izzydevbuilds@gmail.com>
- ❌ **From**: Google CEO <izzydevbuilds@gmail.com>

**n8n Implementation**:
```json
{
  "from": "Izzy Dev <izzydevbuilds@gmail.com>",
  "fromName": "Izzy from Automation Agency"
}
```

#### 2. Honest Subject Lines

**Required**: Subject must reflect email content

- ✅ "Quick question about automating your workflows"
- ✅ "Noticed you're hiring VAs - automation idea"
- ❌ "RE: Your Order #12345" (deceptive)
- ❌ "URGENT: Action Required" (misleading)

**AI Prompt for Subject Line Generation**:
```
Generate a subject line that:
- Accurately reflects the email content
- References the recipient's company or situation
- Is NOT misleading or clickbait
- Complies with CAN-SPAM Act
```

#### 3. Identify Email as Advertisement

**Required**: Email must disclose it's a commercial message

**Where to Add**:
- Email footer OR first line

**Example**:
```
This is a business inquiry from Automation Agency.

If you're not interested, no worries - just let me know and I'll remove you from our list.
```

**n8n Implementation**:
Add to email template in Workflow 4 (Email Generator).

#### 4. Include Physical Address

**Required**: Valid postal address of your business

**Options**:
1. **Home address** (if sole proprietor)
2. **Business address** (if registered LLC)
3. **PO Box** (if you have one)
4. **Virtual mailbox** (UPS Store, Anytime Mailbox - $10-20/month)

**Example Footer**:
```
---
Izzy Dev
Automation Agency
1234 Main Street, Suite 100
Los Angeles, CA 90001

Unsubscribe | View in Browser
```

**n8n Implementation**:
```javascript
// Add to email template
const emailFooter = `
---
Izzy Dev
Automation Agency
1234 Main Street, Suite 100
Los Angeles, CA 90001

<a href="{{unsubscribe_link}}">Unsubscribe</a>
`;
```

#### 5. Unsubscribe Mechanism

**Required**: Clear, conspicuous way to opt-out

**Requirements**:
- Link must be visible
- Must work for 30 days after sending
- Must process opt-out within 10 business days
- Can't require login or payment to unsubscribe
- Can't sell/transfer email after opt-out

**Example Unsubscribe Link**:
```html
<a href="https://your-domain.com/unsubscribe?email={{email}}&token={{unique_token}}">
  Unsubscribe from future emails
</a>
```

**n8n Workflow for Unsubscribe**:

**Option 1: Google Sheets Flag**
1. Create "Unsubscribed" column in Google Sheets
2. Create simple n8n webhook: `/unsubscribe?email={{email}}`
3. When triggered, update Google Sheets: Unsubscribed = TRUE
4. Workflow 5 (Email Sender) filters out unsubscribed leads

**Option 2: Typeform Unsubscribe**
1. Create Typeform: "Unsubscribe from Automation Agency emails"
2. Single question: "Email address"
3. On submit → n8n webhook → update Google Sheets
4. Auto-reply: "You've been unsubscribed. Sorry to see you go!"

#### 6. Honor Opt-Outs Promptly

**Required**: Process unsubscribe requests within 10 business days

**n8n Implementation**:
- Unsubscribe webhook immediately updates Google Sheets
- Workflow 5 checks "Unsubscribed" column before sending
- If Unsubscribed = TRUE, skip sending

#### 7. Monitor Third-Party Compliance

**Required**: You're responsible for anyone you hire to send emails

**Applies to**:
- n8n (workflow platform) ✅
- Gmail API ✅
- Any contractors/VAs

**Action Items**:
- Verify n8n doesn't send spam
- Ensure Gmail API is used per Terms of Service
- If hiring VAs, train them on CAN-SPAM

---

## Email Content Best Practices

### Avoid Spam Trigger Words

**High-Risk Words** (avoid in subject/body):
- Free, $$$, Cash, Prize, Winner, Urgent, Act Now
- Click here, Limited time, 100% guaranteed
- No credit card, Risk-free, Satisfaction guaranteed
- Dear friend, This is not spam

**Use Instead**:
- "Quick question for you"
- "Idea for [Company Name]"
- "Noticed you're hiring VAs"
- "Automation suggestion"

### Email Structure

**Good Cold Email Pattern**:
```
Subject: Quick question about [specific pain point]

Hi {{first_name}},

[Personalized opener - reference something specific about their company]

[Identify their pain point based on research]

[Brief value proposition - 1 sentence]

[Soft CTA - question, not pushy]

Best,
Izzy
Automation Agency

---
[Footer with unsubscribe link & physical address]
```

**Example**:
```
Subject: Noticed you're scaling your team

Hi Sarah,

I saw your recent LinkedIn post about hiring 3 new VAs to handle your client onboarding process.

I work with agencies like yours to automate repetitive workflows (forms, scheduling, client communications) - usually saves 10-15 hours per week.

Would it make sense to show you how we automated this for a similar agency last month?

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

### Text-to-HTML Ratio

**Best Practice**: Keep emails simple (plain text or minimal HTML)

**Spam Filters Like**:
- Plain text emails (highest deliverability)
- Minimal HTML (simple formatting)
- Text-to-image ratio: 80% text, 20% images

**Spam Filters Hate**:
- All-image emails (no text)
- Heavy HTML templates (looks like marketing)
- Large embedded images
- Tracking pixels (use sparingly)

### Personalization Tokens

**Use AI to personalize**:
- {{first_name}}
- {{company_name}}
- {{recent_news}} (from research step)
- {{pain_point}} (from AI analysis)

**Example AI Prompt** (Workflow 4):
```
Generate a cold email for:
- Company: {{company_name}}
- Pain Point: {{pain_points_identified}}
- Decision Maker: {{first_name}} {{job_title}}

Email should:
1. Reference specific pain point
2. Offer automation solution
3. Include soft CTA (question, not pushy)
4. Be 80-100 words max
5. Avoid spam trigger words
6. Sound conversational, not salesy
```

---

## Technical Setup (SPF, DKIM, DMARC)

### What Are These?

**SPF (Sender Policy Framework)**: Verifies you're authorized to send from your domain

**DKIM (DomainKeys Identified Mail)**: Cryptographic signature proves email authenticity

**DMARC (Domain-based Message Authentication)**: Tells receiving servers what to do if SPF/DKIM fail

### For Gmail Users (izzydevbuilds@gmail.com)

**Good News**: Gmail automatically handles SPF/DKIM for @gmail.com addresses.

**Action Required**: None (Gmail manages this)

**Check Your Score**:
1. Send test email to: mail-tester.com
2. Should score 9/10 or 10/10
3. If lower, review warnings

### If Using Custom Domain (future upgrade)

**Example**: emails from @automationagency.com

**Step 1: SPF Record**
Add TXT record to DNS:
```
v=spf1 include:_spf.google.com ~all
```

**Step 2: DKIM Setup**
1. In Gmail Admin Console: Apps → Google Workspace → Gmail → Authenticate email
2. Generate DKIM key
3. Add DKIM TXT record to DNS (provided by Google)

**Step 3: DMARC Policy**
Add TXT record:
```
v=DMARC1; p=quarantine; rua=mailto:izzydevbuilds@gmail.com
```

**Verify Setup**:
- Use MXToolbox.com → DMARC Lookup
- Use mail-tester.com → Send test email

---

## Tracking & Monitoring

### Metrics to Track

**Deliverability Metrics**:
- **Bounce Rate**: <2% (hard bounces = bad email, soft = temporary issue)
- **Spam Complaints**: 0% (1 complaint can hurt reputation)
- **Unsubscribe Rate**: <0.5% (if higher, improve targeting)

**Engagement Metrics**:
- **Open Rate**: 30-50% (good cold email)
- **Click Rate**: 5-10%
- **Reply Rate**: 10-15% (goal)

### Tools for Tracking

**Free Options**:
- Gmail read receipts (manual)
- Mailtrack Chrome extension (free, shows opens)
- n8n tracking (build custom tracker)

**Paid Options** ($10-30/month):
- Mailshake (email warm-up + tracking)
- Lemlist (cold email platform)
- Instantly.ai (deliverability monitoring)

### n8n Custom Tracking Implementation

**Step 1: Add Tracking Pixel** (optional)
```html
<!-- Add to email body -->
<img src="https://your-n8n-instance.com/webhook/track-open?lead_id={{lead_id}}" width="1" height="1" style="display:none;" />
```

**Step 2: Track Link Clicks**
Replace direct links with tracking links:
```
Original: https://automationagency.com
Tracked: https://your-n8n-instance.com/webhook/track-click?lead_id={{lead_id}}&url=https://automationagency.com
```

**Step 3: n8n Webhook Handler**
- Receives tracking pixel/link requests
- Updates Google Sheets: Opens Count +1, Clicks Count +1
- Redirects to original URL (for clicks)

---

## Troubleshooting Spam Issues

### Emails Going to Spam Folder

**Diagnosis**: Send test email to mail-tester.com

**Common Issues**:

#### Issue 1: Low Sender Reputation
**Symptoms**: New Gmail account, no sending history
**Fix**: Follow warm-up schedule (Week 1-4)

#### Issue 2: Spam Trigger Words
**Symptoms**: mail-tester score <7/10
**Fix**: Remove words like "free", "click here", "urgent"

#### Issue 3: Missing Unsubscribe Link
**Symptoms**: CAN-SPAM warning
**Fix**: Add unsubscribe link to footer

#### Issue 4: High Bounce Rate
**Symptoms**: >5% of emails bounce
**Fix**:
- Validate emails before sending (Hunter.io, NeverBounce)
- Remove invalid emails from list

#### Issue 5: Low Engagement
**Symptoms**: No opens/replies for 50+ emails
**Fix**:
- Improve subject lines (A/B test)
- Better targeting (qualify leads more strictly)
- Increase personalization

#### Issue 6: Recipient Marked as Spam
**Symptoms**: Gmail shows warning "Some recipients marked this as spam"
**Fix**:
- Immediately stop sending to that segment
- Review email content (too salesy?)
- Improve targeting (wrong audience?)

### Gmail Daily Limit Reached

**Error**: "You have reached the daily sending limit"

**Gmail Limits**:
- Free Gmail: 500 emails/day
- G Suite: 2,000 emails/day

**Solutions**:
1. **Stay under limit**: Set n8n to max 450/day (safety buffer)
2. **Upgrade to G Suite**: $6/user/month, 2,000/day limit
3. **Use multiple accounts**: Rotate between 2-3 Gmail accounts
4. **Switch to SMTP**: Sendgrid (100/day free), Mailgun ($35/month for 50K)

### Unsubscribe Rate Too High

**Threshold**: >1% unsubscribe rate = targeting problem

**Diagnosis**:
- Check email content (too pushy?)
- Review targeting (wrong audience?)
- Analyze unsubscribed leads (common pattern?)

**Fix**:
- Improve lead qualification (Workflow 3)
- Test different messaging angles
- Segment by industry/company size

---

## CAN-SPAM Compliance Checklist (Summary)

Use this before launching:

- [ ] **From address** is accurate (izzydevbuilds@gmail.com)
- [ ] **Subject line** honestly reflects content
- [ ] **Email includes** "This is a business inquiry" disclaimer
- [ ] **Physical address** in footer
- [ ] **Unsubscribe link** is visible and functional
- [ ] **Unsubscribe process** updates Google Sheets immediately
- [ ] **Workflow 5** filters out unsubscribed leads
- [ ] **Tested** unsubscribe flow (works within 10 days)
- [ ] **Monitored** spam complaints (should be 0)

---

## Daily Monitoring Checklist

**Every Morning** (5 minutes):
- [ ] Check Gmail for bounces/spam complaints
- [ ] Review open rates in Google Sheets (30%+ is good)
- [ ] Check reply inbox for hot leads
- [ ] Verify no unsubscribe requests pending

**Weekly** (15 minutes):
- [ ] Run mail-tester.com check (score should be 9-10/10)
- [ ] Review bounce rate (<2%)
- [ ] Analyze reply rate (10-15% goal)
- [ ] Clean email list (remove bounced emails)

**Monthly** (30 minutes):
- [ ] Review overall deliverability trends
- [ ] A/B test new email templates
- [ ] Audit unsubscribe process
- [ ] Update CAN-SPAM footer if address changes

---

## Resources

### Deliverability Tools
- **mail-tester.com**: Free email score checker
- **MXToolbox.com**: DNS/SPF/DKIM validator
- **Mailtrack**: Free Gmail open tracking extension
- **Mailshake**: Paid warm-up service ($59/month)

### CAN-SPAM Resources
- **FTC Guide**: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- **Email Law**: https://www.emaillaw.org

### Gmail Resources
- **Gmail Sending Limits**: https://support.google.com/a/answer/166852
- **Gmail API Docs**: https://developers.google.com/gmail/api

---

## Final Tips

1. **Start slow**: Don't rush the warm-up
2. **Monitor daily**: Catch issues early
3. **Personalize**: Generic emails = spam folder
4. **Test often**: Use mail-tester.com weekly
5. **Respect opt-outs**: Unsubscribe = immediate removal
6. **Follow the law**: CAN-SPAM fines are no joke ($50K+)

---

**Remember**: Deliverability > Volume. Better to send 50 emails that land in inbox than 500 that go to spam.
