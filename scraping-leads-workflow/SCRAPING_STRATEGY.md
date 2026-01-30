# Platform-Specific Scraping Strategy Guide

Complete guide for scraping leads from 6 platforms using cost-free tools (Puppeteer, BeautifulSoup, n8n Code nodes).

## Table of Contents

1. [LinkedIn Sales Navigator](#linkedin-sales-navigator)
2. [Google Maps (Local Businesses)](#google-maps-local-businesses)
3. [Apollo.io / ZoomInfo](#apolloio--zoominfo)
4. [Reddit](#reddit)
5. [Twitter](#twitter)
6. [Facebook Groups](#facebook-groups)
7. [Instagram](#instagram)
8. [Rate Limiting & Anti-Detection](#rate-limiting--anti-detection)
9. [Data Cleaning & Deduplication](#data-cleaning--deduplication)

---

## LinkedIn Sales Navigator

### Overview
LinkedIn is the #1 source for B2B leads. Sales Navigator provides advanced search filters for targeting decision-makers.

### Prerequisites
- LinkedIn Premium or Sales Navigator account ($79.99/month)
- Puppeteer installed in n8n (Code node)
- Session cookies for authentication

### Search Strategy

**Target Audience for Automation Agency**:
- Job Titles: Founder, CEO, Operations Manager, COO, Business Owner
- Company Size: 10-500 employees
- Industries: SaaS, E-commerce, Consulting, Real Estate, Healthcare
- Keywords: "scaling", "manual processes", "hiring virtual assistants"

### Scraping Method: Puppeteer Code Node

```javascript
// n8n Code Node - LinkedIn Scraper
const puppeteer = require('puppeteer');

async function scrapeLinkedIn() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set cookies for authentication (from your logged-in session)
  await page.setCookie({
    name: 'li_at',
    value: 'YOUR_LINKEDIN_SESSION_COOKIE',
    domain: '.linkedin.com'
  });

  // Navigate to Sales Navigator search
  const searchURL = 'https://www.linkedin.com/sales/search/people?query=(recentSearchParam%3A(id%3A12345))';
  await page.goto(searchURL, { waitUntil: 'networkidle2' });

  // Wait for results to load
  await page.waitForSelector('.artdeco-list__item');

  // Extract lead data
  const leads = await page.evaluate(() => {
    const results = [];
    const items = document.querySelectorAll('.artdeco-list__item');

    items.forEach(item => {
      const name = item.querySelector('.artdeco-entity-lockup__title')?.innerText || '';
      const title = item.querySelector('.artdeco-entity-lockup__subtitle')?.innerText || '';
      const company = item.querySelector('.artdeco-entity-lockup__caption')?.innerText || '';
      const profileURL = item.querySelector('a.artdeco-entity-lockup__title-link')?.href || '';
      const location = item.querySelector('.artdeco-entity-lockup__caption-row')?.innerText || '';

      results.push({
        full_name: name,
        job_title: title,
        company_name: company,
        linkedin_url: profileURL,
        location: location,
        source_platform: 'LinkedIn'
      });
    });

    return results;
  });

  await browser.close();
  return leads;
}

// Execute and return results
return await scrapeLinkedIn();
```

### Rate Limiting
- **Max**: 50 profiles per session
- **Delay**: 3-5 seconds between page loads
- **Sessions**: Run 2-3 times per day, max 150 leads/day
- **Detection avoidance**: Rotate user agents, randomize delays

### Data Extraction
- Full Name
- Job Title
- Company Name
- LinkedIn Profile URL
- Location (City, State)
- Connection Degree (1st, 2nd, 3rd)

---

## Google Maps (Local Businesses)

### Overview
Ideal for targeting local businesses that need automation (restaurants, dental offices, real estate agencies).

### Prerequisites
- No account needed
- Outscraper free tier (100 searches/month) OR Puppeteer

### Method 1: Outscraper API (Recommended)

```javascript
// n8n Code Node - Outscraper API
const axios = require('axios');

async function scrapeGoogleMaps() {
  const response = await axios.get('https://api.outscraper.com/maps/search-v3', {
    params: {
      query: 'automation agency in Los Angeles',
      limit: 100,
      language: 'en'
    },
    headers: {
      'X-API-KEY': 'YOUR_OUTSCRAPER_API_KEY'
    }
  });

  const leads = response.data.data.map(business => ({
    company_name: business.name,
    phone_number: business.phone,
    company_website: business.site,
    location: business.full_address,
    rating: business.rating,
    reviews_count: business.reviews,
    source_platform: 'Google Maps'
  }));

  return leads;
}

return await scrapeGoogleMaps();
```

### Method 2: Puppeteer (Free, Slower)

```javascript
// Puppeteer Google Maps scraper
const puppeteer = require('puppeteer');

async function scrapeGoogleMapsFree() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const searchQuery = 'digital agencies in San Francisco';
  await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`);

  await page.waitForSelector('.Nv2PK');

  // Scroll to load more results
  await autoScroll(page);

  const businesses = await page.evaluate(() => {
    const results = [];
    const items = document.querySelectorAll('.Nv2PK');

    items.forEach(item => {
      const name = item.querySelector('.qBF1Pd')?.innerText || '';
      const address = item.querySelector('.W4Efsd:nth-of-type(2) span')?.innerText || '';
      const phone = item.querySelector('.W4Efsd:nth-of-type(4) span')?.innerText || '';
      const website = item.querySelector('a[data-value="Website"]')?.href || '';

      results.push({
        company_name: name,
        location: address,
        phone_number: phone,
        company_website: website,
        source_platform: 'Google Maps'
      });
    });

    return results;
  });

  await browser.close();
  return businesses;
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    const wrapper = document.querySelector('.m6QErb');
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = wrapper.scrollHeight;
        wrapper.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

return await scrapeGoogleMapsFree();
```

### Best Search Queries for Automation Agency
- "SaaS companies in [city]"
- "digital marketing agencies in [city]"
- "real estate agencies in [city]"
- "e-commerce stores in [city]"
- "consulting firms in [city]"

---

## Apollo.io / ZoomInfo

### Overview
B2B contact databases with free tiers. Easier than scraping, but limited free credits.

### Apollo.io Free Tier
- **Credits**: 50 contacts/month free
- **API**: Yes (requires account)
- **Exports**: CSV download

### Method: Apollo.io API

```javascript
// n8n Code Node - Apollo.io API
const axios = require('axios');

async function searchApollo() {
  const response = await axios.post('https://api.apollo.io/v1/mixed_people/search', {
    api_key: 'YOUR_APOLLO_API_KEY',
    q_organization_domains: 'saas',
    page: 1,
    per_page: 50,
    person_titles: ['founder', 'ceo', 'operations manager']
  });

  const leads = response.data.people.map(person => ({
    first_name: person.first_name,
    last_name: person.last_name,
    email_address: person.email,
    job_title: person.title,
    company_name: person.organization_name,
    company_website: person.organization.website_url,
    linkedin_url: person.linkedin_url,
    source_platform: 'Apollo.io'
  }));

  return leads;
}

return await searchApollo();
```

### ZoomInfo (Alternative)
- More expensive ($14,995/year minimum)
- Better data quality
- Not recommended for MVP (use Apollo free tier)

---

## Reddit

### Overview
Find prospects actively discussing pain points in relevant subreddits.

### Target Subreddits for Automation Agency
- r/Entrepreneur
- r/smallbusiness
- r/SaaS
- r/startups
- r/digitalnomad
- r/ecommerce
- r/realestateinvesting

### Scraping Method: Reddit API (Free)

```javascript
// n8n Code Node - Reddit Scraper
const axios = require('axios');

async function scrapeReddit() {
  // Search for posts mentioning automation pain points
  const keywords = ['need automation', 'manual processes', 'wasting time', 'hiring VA'];
  const subreddits = ['Entrepreneur', 'smallbusiness', 'SaaS', 'startups'];

  const leads = [];

  for (const subreddit of subreddits) {
    for (const keyword of keywords) {
      const response = await axios.get(`https://www.reddit.com/r/${subreddit}/search.json`, {
        params: {
          q: keyword,
          restrict_sr: 1,
          sort: 'relevance',
          t: 'month',
          limit: 25
        }
      });

      response.data.data.children.forEach(post => {
        const author = post.data.author;
        const title = post.data.title;
        const selftext = post.data.selftext;
        const url = `https://www.reddit.com${post.data.permalink}`;

        leads.push({
          full_name: author,
          company_name: `Reddit User: ${author}`,
          pain_points: `${title} - ${selftext.substring(0, 200)}`,
          reddit_url: url,
          source_platform: 'Reddit',
          subreddit: subreddit
        });
      });

      // Rate limiting: 1 request per second
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return leads;
}

return await scrapeReddit();
```

### Engagement Strategy
1. **Direct Message**: If they include contact info in post/profile
2. **Comment**: Add value first, then DM
3. **Email**: Search for their email using Hunter.io (if they mention company)

---

## Twitter

### Overview
Find businesses tweeting about pain points or scaling challenges.

### Prerequisites
- Twitter API Free Tier (1,500 tweets/month)
- Apply at: https://developer.twitter.com/en/portal/dashboard

### Scraping Method: Twitter API v2

```javascript
// n8n Code Node - Twitter API
const axios = require('axios');

async function scrapeTwitter() {
  const keywords = [
    'need automation OR manual processes OR hiring assistant',
    'scaling business OR overwhelmed OR too many tasks',
    'wasting time OR repetitive work'
  ];

  const leads = [];

  for (const query of keywords) {
    const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
      params: {
        query: query + ' -is:retweet',
        max_results: 50,
        'tweet.fields': 'author_id,created_at',
        'user.fields': 'name,username,description,url'
      },
      headers: {
        'Authorization': 'Bearer YOUR_TWITTER_BEARER_TOKEN'
      }
    });

    const tweets = response.data.data || [];
    const users = response.data.includes?.users || [];

    tweets.forEach(tweet => {
      const user = users.find(u => u.id === tweet.author_id);
      if (user) {
        leads.push({
          full_name: user.name,
          twitter_handle: `@${user.username}`,
          bio: user.description,
          company_website: user.url || '',
          pain_points: tweet.text,
          tweet_url: `https://twitter.com/${user.username}/status/${tweet.id}`,
          source_platform: 'Twitter'
        });
      }
    });
  }

  return leads;
}

return await scrapeTwitter();
```

### Best Hashtags to Monitor
- #SaaS
- #startup
- #entrepreneur
- #businessautomation
- #productivity
- #solopreneur

---

## Facebook Groups

### Overview
Private communities where business owners discuss challenges. Harder to scrape (requires manual membership).

### Target Groups for Automation Agency
- "SaaS Founders & Entrepreneurs"
- "E-commerce Entrepreneurs"
- "Digital Agency Owners"
- "Real Estate Investors"
- "Business Process Automation"

### Scraping Method: Semi-Manual (Puppeteer)

```javascript
// WARNING: Facebook actively blocks automated scraping
// Use this cautiously, with delays and manual login

const puppeteer = require('puppeteer');

async function scrapeFacebookGroup() {
  const browser = await puppeteer.launch({
    headless: false, // Use visible browser to avoid detection
    args: ['--no-sandbox']
  });

  const page = await browser.newPage();

  // Manual login required (or use saved session cookies)
  await page.goto('https://www.facebook.com/groups/YOUR_GROUP_ID');

  // Wait for manual login...
  await page.waitForTimeout(30000); // 30 seconds to log in manually

  // Scroll to load posts
  await autoScrollFacebook(page);

  // Extract posts mentioning automation needs
  const posts = await page.evaluate(() => {
    const results = [];
    const postElements = document.querySelectorAll('[data-ad-preview="message"]');

    postElements.forEach(post => {
      const text = post.innerText;
      const authorElement = post.closest('[role="article"]').querySelector('a[role="link"]');
      const author = authorElement?.innerText || '';
      const profileLink = authorElement?.href || '';

      // Filter for automation-related posts
      if (text.match(/automation|manual|process|virtual assistant|time-consuming/i)) {
        results.push({
          full_name: author,
          facebook_url: profileLink,
          pain_points: text.substring(0, 200),
          source_platform: 'Facebook'
        });
      }
    });

    return results;
  });

  await browser.close();
  return posts;
}

async function autoScrollFacebook(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= 3000) { // Scroll 3000px
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
}

return await scrapeFacebookGroup();
```

### Recommended Approach
- **Manual**: Join groups, export member list (if allowed by group admin)
- **Semi-automated**: Use Puppeteer with manual login once per week
- **Engagement**: Comment on posts first, build relationships before outreach

---

## Instagram

### Overview
Business profiles often include email/website in bio. Good for B2C, less effective for B2B automation agency.

### Scraping Method: Instagram API (Limited)

```javascript
// Instagram Basic Display API (requires app approval)
const axios = require('axios');

async function scrapeInstagram() {
  // Note: Instagram API is very restrictive
  // Alternative: Use Puppeteer to scrape public profiles

  const hashtags = ['digitalmarketing', 'saasfounder', 'ecommercebusiness', 'entrepreneur'];
  const leads = [];

  for (const hashtag of hashtags) {
    const response = await axios.get(`https://www.instagram.com/explore/tags/${hashtag}/?__a=1`);
    const posts = response.data.graphql.hashtag.edge_hashtag_to_media.edges;

    posts.forEach(post => {
      const username = post.node.owner.username;
      const caption = post.node.edge_media_to_caption.edges[0]?.node.text || '';

      leads.push({
        full_name: username,
        instagram_handle: `@${username}`,
        instagram_url: `https://instagram.com/${username}`,
        pain_points: caption.substring(0, 200),
        source_platform: 'Instagram'
      });
    });
  }

  return leads;
}

return await scrapeInstagram();
```

### Alternative: Manual Scraping
- Search hashtags manually
- Export followers of competitor accounts
- Use third-party tools like PhantomBuster (paid)

---

## Rate Limiting & Anti-Detection

### General Rules to Avoid Bans

**1. Delays Between Requests**
- LinkedIn: 3-5 seconds
- Google Maps: 2-3 seconds
- Reddit: 1 second (API rate limit)
- Twitter: 1 request/second
- Facebook: 5-10 seconds (high detection)

**2. Rotate User Agents**
```javascript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36...'
];

await page.setUserAgent(userAgents[Math.floor(Math.random() * userAgents.length)]);
```

**3. Use Proxies (Optional)**
- Free: Tor network (slow)
- Paid: Bright Data, Smartproxy ($50-100/month)

**4. Session Management**
- Save cookies after login
- Reuse sessions (don't log in every scrape)
- Clear cookies every 7-14 days

**5. Randomize Behavior**
```javascript
// Random delay function
function randomDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Usage
await randomDelay(2000, 5000); // 2-5 seconds
```

### Detection Signals to Avoid
- Too many requests in short time
- Always same user agent
- No mouse movements (headless browser detection)
- Accessing pages too quickly
- No cookies/session data

---

## Data Cleaning & Deduplication

### After Scraping: Clean Data

```javascript
// n8n Code Node - Data Cleaning
function cleanLeadData(leads) {
  return leads.map(lead => {
    // Normalize names
    lead.full_name = lead.full_name?.trim().replace(/\s+/g, ' ') || '';

    // Extract first/last name
    const nameParts = lead.full_name.split(' ');
    lead.first_name = nameParts[0] || '';
    lead.last_name = nameParts.slice(1).join(' ') || '';

    // Clean emails
    lead.email_address = lead.email_address?.toLowerCase().trim() || '';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(lead.email_address)) {
      lead.email_status = 'Invalid';
    }

    // Clean phone numbers
    lead.phone_number = lead.phone_number?.replace(/[^\d+]/g, '') || '';

    // Add scraped timestamp
    lead.scrape_date = new Date().toISOString().split('T')[0];

    return lead;
  });
}

return cleanLeadData($input.all());
```

### Deduplication Strategy

```javascript
// Remove duplicates by email or LinkedIn URL
function deduplicateLeads(leads) {
  const seen = new Set();
  const unique = [];

  leads.forEach(lead => {
    const identifier = lead.email_address || lead.linkedin_url || lead.full_name;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      unique.push(lead);
    }
  });

  return unique;
}

return deduplicateLeads($input.all());
```

### Before Adding to Google Sheets
1. Check if email/LinkedIn URL already exists
2. If exists, update only missing fields (enrichment)
3. If new, add as new row
4. Mark scrape date and source platform

---

## Summary: Daily Scraping Schedule

### Monday - Wednesday - Friday (Rotation)

**9:00 AM - LinkedIn**
- Scrape 50 profiles (3 different searches)
- Total: 150 leads/day

**10:00 AM - Google Maps**
- Scrape 100 local businesses (2 cities)
- Total: 200 leads/day

**11:00 AM - Apollo.io**
- API call (50 credits used)
- Total: 50 leads/day

**2:00 PM - Reddit/Twitter**
- Reddit: 100 posts scraped
- Twitter: 150 tweets scraped
- Total: 250 leads/day

**Total Weekly Volume**:
- 1,950 leads/week (650/day × 3 days)
- After qualification: 200-300 qualified leads/week

---

## Legal & Ethical Considerations

### Terms of Service (ToS)
- LinkedIn: Prohibits automated scraping (use at own risk)
- Google Maps: Allows scraping public data
- Reddit: API allows 60 requests/minute
- Twitter: API allows 1,500 tweets/month (free tier)
- Facebook: Strictly prohibits automated scraping

### Best Practices
1. **Respect robots.txt**
2. **Don't overload servers** (rate limit aggressively)
3. **Use official APIs** when available
4. **Only scrape public data**
5. **Don't scrape personal info** (comply with GDPR/CCPA)

### Backup Plan
If scraping gets blocked:
- Use paid tools: Apollo.io ($49/mo), ZoomInfo ($14K/year)
- Manual CSV imports
- Partner referrals
- Inbound lead generation (SEO, ads)

---

## Next Steps

1. **Start with easiest platforms**: Apollo.io API, Reddit API, Twitter API
2. **Then add**: Google Maps (Outscraper free tier)
3. **Advanced (if needed)**: LinkedIn Puppeteer (use cautiously)
4. **Avoid for now**: Facebook (too risky), Instagram (low B2B value)

**Recommended MVP Stack**:
- Apollo.io: 50 leads/month
- Google Maps (Outscraper): 100 leads/month
- Reddit API: 200 leads/month
- **Total**: 350 qualified leads/month (FREE)

---

Built with n8n, Puppeteer, and a healthy respect for rate limits.
