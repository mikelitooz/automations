Client 2: Marcus - Real Estate Agent
Background: I'm a solo real estate agent handling 50+ leads monthly from Zillow, Realtor.com, my website, and referrals.
Pain Points:
Leads scattered across different platforms
Missing follow-ups with potential buyers
Manually scheduling property viewings
Creating market reports for clients takes hours
What I need: An AI-powered lead management system that captures leads from all sources, qualifies them automatically via SMS/email conversations, schedules viewings based on my calendar availability, and generates personalized property recommendations. I also want automated market analysis reports for different neighborhoods that I can send to clients.
Budget: $3,000-5,000

What Marcus Actually Does Daily (The Hell)
6:00 AM - Lead Check (1 hour)
Opens Zillow app → 8 new leads
Opens Realtor.com → 5 new leads
Checks website contact form → 3 new inquiries
Checks voicemail → 4 messages
Manually copies all info into his CRM or worse, an Excel sheet
Half the leads are already cold because he didn't respond fast enough
8:00 AM - Response Marathon (2-3 hours)
Emails lead #1: "Hi, thanks for your interest. Are you pre-approved? What's your budget? When can we meet?"
Texts lead #2 the same questions
Lead #3 asks "What properties do you have in Oak Park under $400K?"
Marcus spends 20 minutes searching MLS, copy-pasting listings into email
Lead #4 wants to schedule viewing → 10 messages back and forth finding a time
Lead #5 never responds because Marcus replied 6 hours late
11:00 AM - Viewing Appointments (3-4 hours)
Drives to showing
Realizes he forgot to follow up with lead from last week
After showing, manually texts lead: "What did you think?"
Most don't reply
3:00 PM - Market Reports (2-3 hours)
Client asks: "What are homes selling for in Riverside?"
Marcus manually searches MLS for recent sales
Copy-pastes into Word document
Adds charts from Excel
Formats everything
Emails to client
Client asks about 2 more neighborhoods → repeat process
6:00 PM - Follow-ups He Forgot (1 hour)
Realizes he hasn't followed up with 15 leads from last month
Too tired to do it properly
Sends generic "Still looking?" texts
Most ignore him
Total time wasted: 8-10 hours daily on repetitive admin work Actual selling time: 3-4 hours
This is why he closes 2-3 deals monthly instead of 6-8

AUTOMATION 1: Lead Capture to Google Sheet
The Problem: Leads from 4+ sources, manually copying info, slow response time
The Solution:
ALL LEADS → ONE GOOGLE SHEET (Master Leads)

n8n watches:

- Zillow API (webhook when new lead)
- Realtor.com API (webhook)
- Website contact form (webhook)
- Email inbox (Gmail API for referrals)
- Phone calls (Twilio voicemail transcription)

Every new lead automatically added to Google Sheet:
Columns: Timestamp | Source | Name | Phone | Email | Budget | Property Type | Preapproval Status | Last Contact | Status | Notes

n8n also:
✓ Sends Marcus immediate Slack/SMS: "🔥 NEW LEAD: Sarah J from Zillow - Budget $350K - Looking in Oak Park"
✓ Auto-responds within 60 seconds to lead (more on this below)

Marcus opens ONE Google Sheet to see everything.

TIME TO BUILD: 4-6 hours
TIME SAVED: 1 hour daily

AUTOMATION 2: Instant Lead Response + Qualification
The Problem: Takes Marcus hours to respond, loses 40-50% of leads to faster agents
The Solution:
New lead comes in → n8n triggers instant response

VIA SMS (preferred):
"Hi [Name]! Thanks for your interest in [Property/Area]. I'm Marcus with [Brokerage].

Quick questions to help me find your perfect home:

1. What's your budget range?
2. Are you pre-approved for a mortgage?
3. When are you looking to move?
4. Must-haves (bedrooms, location, etc.)?

Reply with your answers and I'll send you personalized listings within the hour!"

VIA EMAIL (if no phone):
Same questions in friendly email format

AI QUALIFICATION (Claude API):
Lead responds → n8n sends to Claude API

Claude analyzes response:

- Budget mentioned? Extract number
- Pre-approved? Yes/No/Needs lender
- Timeline? Urgent (1-3 months) vs Casual (6+ months)
- Serious buyer signals vs tire kicker

Claude updates Google Sheet:

- Lead Score: Hot/Warm/Cold
- Budget: $350,000
- Pre-approval: No - needs referral
- Timeline: 2 months
- Priorities: 3bd, 2ba, Oak Park area, good schools

Claude generates personalized response:
"Thanks [Name]! Based on what you told me:

✓ I have 4 properties in Oak Park in your budget
✓ I'm sending you the listings now
✓ I can also connect you with a great lender (you'll get better rates pre-approved)
✓ Want to see any of these this week? I have openings Tues/Thurs afternoon

Which properties interest you most?"

ATTACHED: PDF with 4 matching listings from MLS (auto-generated)

HOT LEADS:
If lead score = Hot → Immediate call from Marcus (n8n triggers Twilio call)
If Marcus doesn't answer, texts him: "🚨 HOT LEAD - Call Sarah at [number] NOW"

COLD LEADS:
Go into nurture sequence (emails every 3 days with new listings)

RESULT:

- Response time: 6 hours → 60 seconds
- Lead conversion: 5% → 15-20%
- Marcus only talks to qualified, interested buyers

TIME TO BUILD: 8-10 hours
DEALS CLOSED: +2-4 monthly = $6,000-12,000 extra commission

AUTOMATION 3: Automated Property Recommendations
The Problem: Manually searching MLS and emailing listings takes 20-30 min per lead
The Solution:
Lead qualified → n8n knows their criteria (budget, location, beds/baths)

n8n connects to MLS API (or scrapes Zillow/Realtor.com if no MLS API):
Searches for:

- Price: $320K-380K (lead's budget)
- Location: Oak Park + 5 mile radius
- Bedrooms: 3+
- Bathrooms: 2+
- Listed in last 30 days

Finds 8 matching properties

n8n generates beautiful PDF:
"Properties Picked Just For You, [Name]!"

- Each property: Photo, price, address, beds/baths, key features
- MLS link to full details
- "Schedule viewing" button (links to booking system)

Sends via email automatically:
"Hi [Name], here are 8 homes matching your criteria in Oak Park. Want to see any? Click the viewing buttons or reply with your favorites!"

SMART FEATURES:

- New matching property listed → Auto-emails lead same day
- Price drop on saved property → Immediate alert to lead
- Property goes pending → Removes from future emails

TRACKING:
Google Sheet tracks:

- Properties sent to each lead
- Which properties they clicked on
- Which they scheduled viewings for
- Engagement score (high engagement = hot lead)

Marcus sees: "Sarah clicked on 3 properties and scheduled 2 viewings - CLOSE THIS DEAL"

TIME TO BUILD: 10-12 hours (MLS integration is the hard part)
TIME SAVED: 15 hours weekly
CONVERSIONS: Leads book viewings faster = more deals closed

AUTOMATION 4: Viewing Scheduler (Calendly-style)
The Problem: 10-15 messages back and forth to schedule ONE viewing = 20 min wasted per lead
The Solution:
Lead interested in property → Gets link in email/SMS

Link goes to: Simple booking page (Calendly or custom Typeform)

Lead sees Marcus's available times:
Tuesday:

- 2:00 PM ✓
- 4:00 PM ✓

Thursday:

- 10:00 AM ✓
- 2:00 PM ✓

Lead clicks time → Books instantly

n8n automation:

1. Creates Google Calendar event
2. Sends confirmation to lead:
   "✓ Viewing confirmed!
   Property: 123 Oak St
   Time: Tuesday 2 PM
   Meeting point: Property address
   Marcus's cell: [number]

   Need to reschedule? [Reschedule link]"

3. Updates Google Sheet: "Viewing scheduled - 123 Oak St - Tuesday 2pm"

4. Sends Marcus confirmation with:
   - Lead info
   - Property details
   - Lead's preferences/notes
   - Driving directions

REMINDERS:
24 hours before → SMS to lead: "Reminder: Viewing tomorrow at 2 PM. See you there!"
2 hours before → SMS: "Looking forward to showing you 123 Oak St in 2 hours!"

No-show prevention (big problem in real estate):
If lead doesn't confirm → Marcus gets alert: "Sarah hasn't confirmed. Call her."

AFTER VIEWING:
2 hours later → Auto-SMS: "What did you think of 123 Oak St? Love it, hate it, or somewhere in between? Let me know!"

Lead responses tracked in Google Sheet

TIME TO BUILD: 6-8 hours
TIME SAVED: 10 hours weekly of scheduling back-and-forth
NO-SHOWS REDUCED: 30% → 10%

AUTOMATION 5: Market Reports Generator
The Problem: Takes 2-3 hours to create market report for ONE neighborhood
The Solution:
Client asks: "What are homes selling for in Oak Park?"

Marcus types in Google Sheet or Slack: "/marketreport Oak Park"

n8n automation:

1. Searches MLS/Zillow API for Oak Park data (last 90 days):

   - Average sold price
   - Days on market
   - Price per sq ft
   - Active listings count
   - Pending sales

2. AI (Claude) generates professional report:

"OAK PARK MARKET REPORT - [Date]

MARKET OVERVIEW:
The Oak Park real estate market is currently [hot/warm/balanced/cool].

KEY METRICS (Last 90 Days):

- Average Sale Price: $365,000 (↑ 8% vs last year)
- Median Days on Market: 12 days
- Active Listings: 23 homes
- Pending Sales: 15 homes
- Homes Sold: 47

BUYER'S PERSPECTIVE:
Competition is high with homes selling in under 2 weeks. Strong offers and quick decisions are essential. Properties priced right often receive multiple offers.

SELLER'S PERSPECTIVE:  
Excellent time to sell. Well-priced homes are moving quickly. Professional staging and photos recommended to maximize sale price.

NEIGHBORHOOD HIGHLIGHTS:
[AI pulls from data: Top schools, parks, amenities, recent developments]

RECENT COMPARABLE SALES:
[Table of 5 most recent sales with address, price, beds/baths, $/sqft]

CURRENT LISTINGS TO WATCH:
[3-4 active listings with photos and details]

Want to discuss your specific situation?
Call me: [Marcus's number]
Email: [Marcus's email]"

3. Formats as beautiful PDF with charts
4. Emails to client automatically
5. Logs in Google Sheet: "Market report sent to John - Oak Park"

ADVANCED:

- Quarterly auto-reports to all past clients
- "Your neighborhood update" emails
- Price change alerts for specific streets

CLIENT REQUESTS MULTIPLE NEIGHBORHOODS:
Marcus: "/marketreport Oak Park, Riverside, Downtown"
System generates 3 reports in 2 minutes

TIME TO BUILD: 12-15 hours (hardest automation, lots of data)
TIME SAVED: 20+ hours monthly
VALUE ADD: Clients see Marcus as expert, refer more people

AUTOMATION 6: Follow-up Sequences (The Money Maker)
The Problem: 80% of leads need 5-12 touchpoints before buying, Marcus forgets after 2
The Solution:
LEAD NURTURE TRACKS IN GOOGLE SHEET:
Status: New → Contacted → Viewed Properties → Offer Made → Closed

Based on status, automatic sequences:

NEW LEAD (Day 1-7):
Day 1: Instant response + qualification (automated)
Day 2: Send matching properties (automated)
Day 3: "Did you see the listings I sent? Want to schedule viewings?"
Day 5: "Here are 3 NEW properties that match your criteria"
Day 7: Call from Marcus (automated reminder to call)

VIEWED PROPERTIES (Day 1-30):
Day 1: "What did you think?" (automated, after viewing)
Day 3: "Here are 3 similar properties you might like"
Day 7: "Any questions about the homes you saw?"
Day 14: "Market update: 2 new listings in your price range"
Day 21: Phone call from Marcus
Day 30: "Still looking? Your market just got 5 new listings"

COLD/STALE LEADS (Month 2-6):
Every 2 weeks: Automatic email with:

- Market updates
- New listings matching criteria
- Price drops on properties they viewed
- Neighborhood news

TEMPERATURE TRACKING:
Lead opens emails → Score increases
Lead clicks listings → Score increases  
Lead books viewing → Hot lead alert to Marcus
No engagement for 30 days → Moves to cold list

Marcus sees in Google Sheet:
🔥 Hot leads (8) - Focus here first
🟡 Warm leads (23) - Follow up this week  
🔵 Cold leads (19) - Auto-nurture only

RESULT:
Zero leads fall through cracks
Follow-up is consistent
Deals close 3-6 months later from leads Marcus forgot about

TIME TO BUILD: 8-10 hours
DEALS CLOSED: +3-5 yearly from "dead" leads = $9,000-15,000

COMPLETE SYSTEM ARCHITECTURE
LEAD SOURCES → n8n → GOOGLE SHEET (Master Hub)
↓
AI Qualification
↓
Auto-response + Property matches
↓
Viewing Scheduler
↓
Follow-up Sequences
↓
Market Reports on Demand
↓
MARCUS CLOSES DEALS
Marcus's New Daily Workflow:
Opens Google Sheet (5 minutes)
Sees hot leads highlighted
Calls hot leads only
System handles everything else
Shows properties
Closes deals
Time on admin: 30 minutes daily vs 8 hours

PACKAGE PRICING
TIER 1: Lead Manager - $3,000 Build time: 1 week
Includes:
Lead capture to Google Sheet (all sources)
Instant auto-responses
Basic follow-up sequences
Viewing scheduler
TIER 2: Smart Agent - $4,500 ⭐ RECOMMENDED Build time: 10 days
Everything in Tier 1 PLUS:
AI qualification
Automated property matching
Advanced follow-up sequences
Market report generator (basic)
TIER 3: Complete System - $6,500 Build time: 2 weeks
Everything in Tier 2 PLUS:
Advanced market reports with charts
Multi-neighborhood batch reports
CRM integration if needed
Lead scoring and prioritization
MONTHLY SUPPORT: $300-500
Fixes and updates
New lead sources added
Template adjustments
Monthly performance report

ROI FOR MARCUS
Current situation:
50 leads/month → 2-3 closed deals
Conversion rate: 5%
Average commission: $3,000
Monthly income: $6,000-9,000
Time on admin: 8 hours daily
With automation:
50 leads/month → 6-8 closed deals
Conversion rate: 12-16% (faster response, better follow-up)
Average commission: $3,000
Monthly income: $18,000-24,000
Time on admin: 30 min daily
Additional income: $12,000-15,000/month Investment: $4,500 setup + $400/month ROI: 267% in first month Payback: 11 days

BUILD TIMELINE
Week 1:
Days 1-2: Lead capture hub
Days 3-4: Auto-responses + qualification
Day 5: Testing
Week 2:
Days 1-2: Property matching system
Days 3-4: Viewing scheduler + reminders
Day 5: Follow-up sequences
Week 3:
Days 1-3: Market report generator
Days 4-5: Final testing + training Marcus
Total: 15 business days to complete system
Marcus sees results by Day 5 (lead capture + auto-responses working).

SALES PITCH
What you say: "Marcus, I automate lead management for real estate agents. You'll respond to every lead in under 60 seconds, automatically send them matching properties, and never miss a follow-up again.
One agent I worked with went from 2 deals per month to 6 deals per month in 90 days. Same leads, better follow-up.
Setup is $4,500, takes me 10 days, and you'll probably close an extra deal in the first month to pay for it.
Want to see how it works?"
Demo:
Show lead coming in → Google Sheet updates instantly
Show auto-response SMS going out
Show property matches being emailed
Show market report generated in 2 minutes
Show follow-up sequence calendar
Don't show code. Show results.

TECH STACK
Required:
n8n (automation engine)
Google Sheets (lead database)
Claude API ($30-50/month for AI)
Calendly or Typeform (scheduling)
Twilio ($20/month for SMS)
Gmail (emails)
MLS Integration:
If Marcus has MLS access → API integration
If not → Scrape Zillow/Realtor.com (less reliable)
Alternative: Marcus exports MLS data weekly, uploads to Google Sheet
Total monthly costs: $70-100

CRITICAL SUCCESS FACTORS
Speed matters - Every hour delayed = lost deals
Response time - 60 seconds vs 6 hours = 3x conversion
Consistency - Never miss a follow-up = more deals
Personalization - AI makes it feel human, not robotic
Simple for Marcus - One Google Sheet, that's it
Build fast. Get paid. Move to next client.



