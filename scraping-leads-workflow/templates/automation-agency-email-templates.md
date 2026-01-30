# Automation Agency Email Templates

Base email templates for AI to personalize. These provide structure while allowing AI to customize based on lead research.

## Template Philosophy

**Don't use generic templates verbatim**. Instead:
1. AI reads these templates for structure
2. AI analyzes lead research data (pain points, recent news, company info)
3. AI generates **unique, personalized email** using template pattern + research insights

---

## Table of Contents

1. [Initial Outreach Templates](#initial-outreach-templates)
2. [Follow-Up Templates](#follow-up-templates)
3. [AI Prompt Engineering](#ai-prompt-engineering)
4. [Subject Line Formulas](#subject-line-formulas)
5. [CAN-SPAM Footer](#can-spam-footer)

---

## Initial Outreach Templates

### Template 1: Pain Point Opener

**Use When**: AI identifies specific operational pain point

**Structure**:
```
Subject: {{specific_pain_point_reference}}

Hi {{first_name}},

{{opening_line_referencing_specific_observation}}

{{articulate_the_pain_point_they_feel}}

{{brief_value_prop_automation_solution}}

{{soft_question_cta}}

Best,
Izzy
Automation Agency

{{footer}}
```

**Example** (AI-generated from research):
```
Subject: Noticed you're hiring 3 VAs for data entry

Hi Sarah,

I saw your LinkedIn post about bringing on 3 virtual assistants to handle client onboarding forms and data entry.

That's a smart move for scaling, but I've seen agencies like yours automate most of that workflow - usually saves 10-15 hours per week and reduces errors.

We just built a similar system for a SaaS agency in Austin (automated their entire onboarding → cut VA hours by 70%).

Would it make sense to show you how that works?

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

### Template 2: Recent News Hook

**Use When**: AI finds recent company news/announcement

**Structure**:
```
Subject: Congrats on {{recent_achievement}}

Hi {{first_name}},

{{congratulations_on_recent_news}}

{{transition_to_growth_challenge}}

{{offer_automation_solution_specific_to_their_stage}}

{{soft_question_cta}}

Best,
Izzy

{{footer}}
```

**Example**:
```
Subject: Congrats on your Series A

Hi Michael,

Congrats on the $2M Series A round - that's huge!

Now comes the fun part: scaling from 10 to 50 customers without burning out your ops team. I've seen early-stage SaaS companies hit that wall around 30 customers when manual processes break down.

We specialize in automating customer onboarding, support ticket routing, and reporting for Series A companies. Usually frees up 20+ hours/week.

Make sense to chat about what that could look like for you?

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

### Template 3: Specific Tool/Process Mention

**Use When**: AI identifies specific tool they use or process they mention

**Structure**:
```
Subject: {{tool_or_process_reference}}

Hi {{first_name}},

{{reference_specific_tool_or_process_mentioned}}

{{identify_limitation_of_current_approach}}

{{offer_automation_upgrade}}

{{specific_example_or_result}}

{{soft_cta}}

Best,
Izzy

{{footer}}
```

**Example**:
```
Subject: Quick idea for your Airtable setup

Hi Emily,

I noticed you're using Airtable for lead tracking (saw your post about customizing views).

Airtable is great, but I bet you're still manually updating lead statuses, copying data from forms, and chasing down reps for updates. That's usually where the bottleneck lives.

We connect Airtable to web forms, Slack, and email so leads automatically flow through your pipeline - no manual data entry.

One of our e-commerce clients cut lead response time from 4 hours to 2 minutes with this setup.

Worth a 10-minute call to see if it fits your workflow?

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

### Template 4: Industry-Specific Approach

**Use When**: Targeting specific industry (SaaS, E-commerce, Real Estate, etc.)

**Structure**:
```
Subject: Automation for {{industry}} companies

Hi {{first_name}},

{{industry_context_statement}}

{{common_pain_point_in_that_industry}}

{{our_solution_specific_to_industry}}

{{quick_proof_case_study}}

{{soft_cta}}

Best,
Izzy

{{footer}}
```

**Example for SaaS**:
```
Subject: How SaaS companies automate trial → paid conversions

Hi David,

Most SaaS companies lose 60-70% of trial users because follow-up is manual, generic, or nonexistent.

We automate the entire trial-to-paid flow: onboarding emails, usage-based triggers, hand-off to sales when ready, and churn prevention sequences.

One of our SaaS clients (project management tool, 500 trials/month) increased trial-to-paid conversion from 8% to 19% in 6 weeks with this system.

Want to see how the automation works?

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

### Template 5: Competitor Mention (Use Cautiously)

**Use When**: AI finds they're using a competitor or similar solution

**Structure**:
```
Subject: Alternative to {{competitor_tool}}

Hi {{first_name}},

{{acknowledge_current_tool_usage}}

{{identify_limitation_or_cost_issue}}

{{offer_better_alternative}}

{{risk_free_offer}}

Best,
Izzy

{{footer}}
```

**Example**:
```
Subject: Alternative to Zapier for complex workflows

Hi Rachel,

I saw you're using Zapier for your lead routing (great choice for simple zaps).

But when you need multi-step workflows, conditional logic, or data transformations, Zapier gets expensive ($250+/month) and limits you to 15-minute delays.

We build custom automation workflows using n8n (unlimited workflows, instant triggers, way more flexibility) for a flat monthly fee.

One agency switched from Zapier Premium ($600/month) to our solution ($300/month) and got 5x more functionality.

Want a side-by-side comparison for your specific workflows?

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

## Follow-Up Templates

### Follow-Up 1: Value-Add (Day 3-4)

**Purpose**: Add value, not just "checking in"

**Structure**:
```
Subject: {{value_add_subject}}

Hi {{first_name}},

{{acknowledge_no_response}}

{{provide_free_resource_or_insight}}

{{soft_reopener}}

Best,
Izzy

{{footer}}
```

**Example**:
```
Subject: Free resource: Automation workflow template

Hi Sarah,

No worries if the timing isn't right - I know inboxes get crazy.

I put together a quick guide on the 5 workflows every agency should automate first (based on 20+ agency clients we've worked with). Thought it might be useful even if we don't end up working together.

[Link to 1-page PDF or Notion doc]

Let me know if you want to chat about implementing any of these.

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

### Follow-Up 2: Different Angle (Day 7-8)

**Purpose**: Approach from different perspective

**Structure**:
```
Subject: Different idea

Hi {{first_name}},

{{reference_original_email}}

{{try_different_pain_point_or_value_prop}}

{{simple_yes_no_question}}

Best,
Izzy

{{footer}}
```

**Example**:
```
Subject: Different angle

Hi Sarah,

I mentioned automating your onboarding process last week, but realized that might not be the biggest bottleneck for you.

A lot of agencies we work with actually need help with client reporting (the weekly/monthly reports that take 3-4 hours to compile). We automate those with real-time dashboards that pull from your tools automatically.

Is reporting more of a pain point for your team than onboarding?

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

### Follow-Up 3: Breakup Email (Day 14)

**Purpose**: Final attempt, low-pressure exit

**Structure**:
```
Subject: Should I close your file?

Hi {{first_name}},

{{acknowledge_silence}}

{{assume_not_interested}}

{{one_last_soft_offer}}

{{easy_out}}

Best,
Izzy

{{footer}}
```

**Example**:
```
Subject: Should I close your file?

Hi Sarah,

I've reached out a couple times about automating your agency workflows - but haven't heard back, so I'm guessing it's not a priority right now.

No problem at all! I'll go ahead and close your file.

If I'm wrong and you do want to chat, just reply "Yes" and I'll send over some times.

Otherwise, all the best with scaling the agency.

Best,
Izzy
Automation Agency

---
This is a business inquiry. Reply "stop" to unsubscribe.
Automation Agency | 1234 Main St, Los Angeles, CA 90001
```

---

## AI Prompt Engineering

### For Initial Email (Workflow 4)

**Prompt Template**:
```
You are writing a cold email for an automation agency to a potential client.

LEAD INFORMATION:
- First Name: {{first_name}}
- Company: {{company_name}}
- Job Title: {{job_title}}
- Industry: {{industry}}
- Pain Points Identified: {{pain_points_identified}}
- Recent News: {{recent_news}}
- Automation Opportunities: {{automation_opportunities}}

YOUR TASK:
Generate a personalized cold email (80-100 words) that:

1. Opens with specific reference to their company/situation (use pain points or recent news)
2. Identifies the operational challenge they likely face
3. Offers automation solution relevant to their industry
4. Includes brief proof/example (case study or result)
5. Ends with soft question CTA (not pushy)

STYLE GUIDELINES:
- Conversational, not corporate
- Confident but humble
- No hype words (revolutionary, game-changing, etc.)
- No spam trigger words (free, urgent, act now, etc.)
- Sound like a helpful peer, not a salesperson

EMAIL STRUCTURE (follow this pattern):

Subject: [Personalized subject referencing their specific situation]

Hi {{first_name}},

[Opening line - reference specific observation about their company]

[Articulate the pain point/challenge they likely feel]

[Brief value proposition - how automation solves it]

[Quick proof - case study or result for similar company]

[Soft CTA - question, not pushy request]

Best,
Izzy
Automation Agency

OUTPUT FORMAT:
Return as JSON:
{
  "subject": "...",
  "body": "..."
}

DO NOT include footer (will be added automatically).
```

---

### For Follow-Up Emails (Workflow 6)

**Follow-Up 1 Prompt** (Day 3):
```
Generate a follow-up email for someone who didn't respond to the initial email 3 days ago.

CONTEXT:
- Original email was about: {{email_subject}}
- Lead info: {{first_name}}, {{company_name}}, {{industry}}

YOUR TASK:
Create a value-add follow-up (60-80 words) that:

1. Acknowledges no response (brief, no guilt trip)
2. Provides free resource or insight (not sales pitch)
3. Soft reopener (optional)

TONE: Helpful, not pushy. Focus on giving value.

OUTPUT FORMAT:
{
  "subject": "...",
  "body": "..."
}
```

**Follow-Up 2 Prompt** (Day 7):
```
Generate a second follow-up email from a different angle.

CONTEXT:
- First email was about: {{original_pain_point}}
- Still no response after 7 days
- Lead info: {{first_name}}, {{company_name}}

YOUR TASK:
Try a different pain point or value proposition (50-70 words):

1. Brief reference to original email
2. Different angle/pain point
3. Simple yes/no question

TONE: Conversational, low-pressure.

OUTPUT FORMAT:
{
  "subject": "...",
  "body": "..."
}
```

**Follow-Up 3 Prompt** (Day 14):
```
Generate a "breakup" email - final follow-up before closing file.

CONTEXT:
- No response after 2 weeks
- Lead info: {{first_name}}

YOUR TASK:
Create a low-pressure exit email (40-60 words):

1. Acknowledge silence
2. Assume not interested (give them an out)
3. One last soft offer
4. Easy way to respond if interested

TONE: Respectful, not desperate or guilt-tripping.

OUTPUT FORMAT:
{
  "subject": "...",
  "body": "..."
}
```

---

## Subject Line Formulas

### Formula 1: Observation + Value
```
"Noticed [specific observation] → [quick value prop]"
```
Examples:
- "Noticed you're scaling your team → automation idea"
- "Saw your Series A news → ops scaling tip"

### Formula 2: Question Hook
```
"{{pain_point_question}}"
```
Examples:
- "Still manually updating lead statuses?"
- "Spending 10+ hours/week on reporting?"

### Formula 3: Specific Reference
```
"Quick idea for your {{tool_or_process}}"
```
Examples:
- "Quick idea for your Airtable setup"
- "Alternative to your current CRM workflow"

### Formula 4: Industry-Specific
```
"How {{industry}} companies automate {{process}}"
```
Examples:
- "How SaaS companies automate trial conversions"
- "How agencies automate client reporting"

### Formula 5: Competitor Alternative
```
"Alternative to {{competitor_tool}}"
```
Examples:
- "Alternative to Zapier for complex workflows"
- "Better solution than HubSpot workflows"

### Formula 6: Recent Achievement
```
"Congrats on {{achievement}}"
```
Examples:
- "Congrats on your Series A"
- "Congrats on hitting 1,000 customers"

---

## CAN-SPAM Footer

**Standard Footer Template**:
```
---
This is a business inquiry. Reply "stop" to unsubscribe.

Izzy Dev
Automation Agency
1234 Main Street, Suite 100
Los Angeles, CA 90001

Unsubscribe: {{unsubscribe_link}}
```

**n8n Variable**:
```javascript
const footer = `
---
This is a business inquiry. Reply "stop" to unsubscribe.

Izzy Dev
Automation Agency
1234 Main Street, Suite 100
Los Angeles, CA 90001

Unsubscribe: https://your-n8n-instance.com/unsubscribe?email=${email}&token=${uniqueToken}
`;
```

---

## A/B Testing Variations

### Test These Elements

**Subject Lines**:
- Question vs Statement
- Short (4-6 words) vs Medium (7-10 words)
- Personal vs Professional tone

**Opening Lines**:
- Direct pain point vs Congratulations hook
- Industry-specific vs Company-specific

**CTAs**:
- Question format vs Action format
- Low-commitment ("worth a quick chat?") vs High-value ("want to see how?")

### Track in Google Sheets

Add columns:
- Email Template Version (A, B, C)
- Open Rate by Version
- Reply Rate by Version

After 50 emails per version, analyze which performs best.

---

## Template Selection Logic (for AI)

**AI Decision Tree**:

```
IF recent_news exists:
  USE Template 2 (Recent News Hook)
ELSE IF specific_tool_mentioned:
  USE Template 3 (Specific Tool/Process)
ELSE IF industry == "SaaS" OR "E-commerce" OR "Real Estate":
  USE Template 4 (Industry-Specific)
ELSE IF pain_points_identified:
  USE Template 1 (Pain Point Opener)
ELSE:
  USE Template 1 (default)
```

**Implement in Workflow 4** (n8n Code node):
```javascript
function selectTemplate(lead) {
  if (lead.recent_news) {
    return 'template_2_recent_news';
  } else if (lead.tech_stack || lead.pain_points_identified.includes('Airtable|Zapier|HubSpot')) {
    return 'template_3_tool_mention';
  } else if (['SaaS', 'E-commerce', 'Real Estate'].includes(lead.industry)) {
    return 'template_4_industry_specific';
  } else {
    return 'template_1_pain_point';
  }
}

const templateChoice = selectTemplate($input.item.json);
return { templateChoice };
```

---

## Anti-Patterns (What NOT to Do)

❌ **Generic opener**: "I hope this email finds you well"

❌ **Hype language**: "Revolutionary solution", "Game-changing platform"

❌ **Long paragraphs**: Keep to 2-3 lines max per paragraph

❌ **Multiple CTAs**: "Can we schedule a call? Or if not, here's a video. Or download this guide."

❌ **Fake urgency**: "Limited time offer", "Only 3 spots left"

❌ **Too salesy**: "Our award-winning platform with 10,000+ customers..."

❌ **No personalization**: Copy-paste templates with {{first_name}} only

✅ **DO THIS INSTEAD**:
- Specific observation about their business
- Conversational tone
- Short, scannable paragraphs
- One clear CTA (question format)
- Value-first, not feature-dump
- Deeply personalized using AI research

---

## Examples by Industry

### SaaS Founders
**Pain Points**: Trial-to-paid conversion, customer onboarding, churn prevention, usage analytics

**Template**:
```
Subject: How to automate your trial → paid flow

Hi {{first_name}},

Most SaaS companies lose 60-70% of trial users because follow-up is either manual, generic, or nonexistent.

We automate the entire trial-to-paid sequence: onboarding emails, usage-based triggers, sales hand-off, and churn prevention.

{{specific_case_study_for_similar_saas_company}}

Want to see how it works for your product?

Best,
Izzy
```

### E-commerce Businesses
**Pain Points**: Abandoned carts, inventory sync, customer support, order tracking

**Template**:
```
Subject: Abandoned cart automation for e-commerce

Hi {{first_name}},

Saw you're running {{company_name}} - congrats on the growth!

Most e-commerce stores lose $15K-30K/month in abandoned carts because follow-up emails are either generic or delayed.

We build smart cart recovery flows (SMS + email) that trigger based on cart value, browsing behavior, and past purchase history. One boutique recovered $43K in the first month.

Make sense to show you how that works?

Best,
Izzy
```

### Real Estate Agents
**Pain Points**: Lead follow-up, showing schedules, property recommendations, client communication

**Template**:
```
Subject: Automate your lead follow-up (real estate)

Hi {{first_name}},

Most agents lose 40-50% of leads because follow-up is inconsistent (too busy showing properties).

We automate the entire lead nurturing flow: instant responses, property recommendations based on preferences, auto-scheduling for showings, and follow-up sequences.

One agent went from 5% to 15% conversion rate and cut follow-up time from 2 hours/day to 15 minutes.

Want to see how this works for your market?

Best,
Izzy
```

---

## Checklist Before Sending

- [ ] Subject line is personalized (not generic template)
- [ ] Opens with specific observation about their company
- [ ] Email body is 80-120 words (scannable)
- [ ] Includes proof/case study
- [ ] CTA is a question (not pushy request)
- [ ] Tone is conversational (not corporate)
- [ ] No spam trigger words
- [ ] CAN-SPAM footer included
- [ ] Unsubscribe link works
- [ ] Tested in mail-tester.com (score 9+/10)

---

**Remember**: Templates are starting points for AI. The magic happens when AI combines template structure + lead research + industry context to create truly personalized emails.
