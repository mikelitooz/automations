# Apify Actor Configurations Guide

Detailed configuration reference for all Apify actors used in the Multi-Platform Lead Scraper workflow.

---

## Table of Contents

1. [Overview](#overview)
2. [LinkedIn Profile Scraper](#linkedin-profile-scraper)
3. [Facebook Pages Scraper](#facebook-pages-scraper)
4. [Google Maps Scraper](#google-maps-scraper)
5. [Advanced Configurations](#advanced-configurations)
6. [Field Mapping Reference](#field-mapping-reference)
7. [Performance Tuning](#performance-tuning)
8. [Cost Optimization](#cost-optimization)

---

## Overview

### Apify Actor Basics

**What is an Apify Actor?**
- A serverless compute unit that runs web scraping/automation code
- Pre-built by Apify team or community developers
- Runs in isolated Docker containers with browser automation
- Charges based on compute units (CU) consumed

**How Actors Work**:
1. **Start Run**: POST request to Apify API with input configuration
2. **Async Execution**: Actor runs in background (20-60 seconds typically)
3. **Results Storage**: Data saved to Apify dataset (temporary storage)
4. **Fetch Results**: GET request to dataset API to retrieve scraped data

### Actors Used in This Workflow

| Actor Name | Actor ID | Purpose | Cost (per 1K items) |
|------------|----------|---------|---------------------|
| LinkedIn Profile Scraper | `curious_coder~linkedin-profile-scraper` | Scrape LinkedIn profiles | $3-5 |
| Facebook Pages Scraper | `apify~facebook-pages-scraper` | Scrape Facebook business pages | $4-5 |
| Google Maps Scraper | `compass~crawler-google-places` | Scrape local businesses | $2-3 |

---

## LinkedIn Profile Scraper

### Actor Information

- **Actor ID**: `curious_coder~linkedin-profile-scraper`
- **Alternative**: `dev_fusion~linkedin-profile-scraper` (mass scraper, no cookies needed)
- **Documentation**: https://apify.com/curious_coder/linkedin-profile-scraper
- **Pricing**: ~$0.003-0.005 per profile (~$3-5 per 1,000)
- **Average Runtime**: 30-60 seconds for 50 profiles

### Input Configuration

```json
{
  "startUrls": [
    {
      "url": "https://www.linkedin.com/search/results/people/?keywords=founder%20OR%20ceo"
    }
  ],
  "maxItems": 50,
  "proxy": {
    "useApifyProxy": true,
    "apifyProxyGroups": ["RESIDENTIAL"]
  }
}
```

### Input Parameters Explained

#### `startUrls` (Required)
Array of LinkedIn URLs to scrape. Supported URL types:
- **Search results**: `https://www.linkedin.com/search/results/people/?keywords=...`
- **Sales Navigator searches**: `https://www.linkedin.com/sales/search/people?query=...`
- **Individual profiles**: `https://www.linkedin.com/in/username`
- **Company employee lists**: `https://www.linkedin.com/company/company-name/people/`

**Example - Search by Job Title**:
```json
"startUrls": [
  {
    "url": "https://www.linkedin.com/search/results/people/?keywords=founder%20AND%20saas"
  }
]
```

**Example - Sales Navigator Search**:
```json
"startUrls": [
  {
    "url": "https://www.linkedin.com/sales/search/people?query=(recentSearchParam:(doLogHistory:true,showSaveSearchButton:true),filters:List((type:CURRENT_TITLE,values:List((text:Founder,selectionType:INCLUDED)))))"
  }
]
```

**Example - Multiple Search URLs**:
```json
"startUrls": [
  { "url": "https://www.linkedin.com/search/results/people/?keywords=founder" },
  { "url": "https://www.linkedin.com/search/results/people/?keywords=ceo" },
  { "url": "https://www.linkedin.com/search/results/people/?keywords=cto" }
]
```

#### `maxItems` (Required)
Maximum number of profiles to scrape across all URLs.

**Recommendations**:
- **Test mode**: 5-10 (low cost validation)
- **Production**: 50-100 (daily lead generation)
- **Bulk export**: 500-1,000 (one-time data collection)

**Note**: LinkedIn has rate limits. Stay under 100/hour to avoid detection.

#### `proxy` (Required)
Proxy configuration for IP rotation (avoids LinkedIn blocking).

**Options**:
```json
// Residential proxies (best for LinkedIn, more expensive)
"proxy": {
  "useApifyProxy": true,
  "apifyProxyGroups": ["RESIDENTIAL"]
}

// Datacenter proxies (cheaper, higher block rate)
"proxy": {
  "useApifyProxy": true,
  "apifyProxyGroups": ["DATACENTER"]
}

// Auto (Apify chooses best proxy type)
"proxy": {
  "useApifyProxy": true
}
```

**Cost Impact**: Residential proxies cost 10x more than datacenter but have 90% success rate vs. 50-60%.

#### Optional Parameters

**`cookies`** (Array): LinkedIn session cookies for authenticated scraping
```json
"cookies": [
  {
    "name": "li_at",
    "value": "YOUR_LINKEDIN_SESSION_COOKIE",
    "domain": ".linkedin.com"
  }
]
```
⚠️ **Not needed for this actor** - curious_coder version works without authentication.

**`includeUnfetchedProfiles`** (Boolean): Include profiles where scraping failed
```json
"includeUnfetchedProfiles": false  // Default: false
```

### Output Fields

The actor returns JSON array with these fields:

| Field Name | Type | Description | Populated Rate |
|------------|------|-------------|----------------|
| `fullName` | String | Full name | 100% |
| `firstName` | String | First name | 95% |
| `lastName` | String | Last name | 95% |
| `headline` | String | Current job title | 98% |
| `companyName` | String | Current company | 95% |
| `companyUrl` | String | LinkedIn company page URL | 90% |
| `location` | String | City, state, country | 95% |
| `profileUrl` | String | LinkedIn profile URL | 100% |
| `connectionDegree` | String | 1st, 2nd, 3rd connection | 100% |
| `connectionsCount` | Number/String | Connections (may be "500+") | 85% |
| `followersCount` | Number | Follower count | 70% |
| `isPremium` | Boolean | Has LinkedIn Premium | 100% |
| `email` | String | Email address | 10-30% |
| `phone` | String | Phone number | 5-15% |
| `twitter` | String | Twitter handle | 20-40% |
| `skills` | Array | List of skills | 80% |
| `experience` | Array | Work history | 85% |
| `education` | Array | Education history | 70% |
| `summary` | String | About section | 60% |

**Example Output**:
```json
{
  "fullName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "headline": "CEO & Founder at TechCorp | Building SaaS for SMBs",
  "companyName": "TechCorp",
  "companyUrl": "https://www.linkedin.com/company/techcorp",
  "location": "San Francisco Bay Area",
  "profileUrl": "https://www.linkedin.com/in/johndoe",
  "connectionDegree": "2nd",
  "connectionsCount": "500+",
  "followersCount": 3542,
  "isPremium": true,
  "email": "john@techcorp.com",
  "twitter": "@johndoe",
  "skills": ["Leadership", "SaaS", "B2B Sales", "Product Strategy"],
  "experience": [
    {
      "title": "CEO & Founder",
      "company": "TechCorp",
      "duration": "Jan 2020 - Present · 4 yrs",
      "location": "San Francisco, CA"
    }
  ],
  "education": [
    {
      "schoolName": "Stanford University",
      "degree": "MBA",
      "fieldOfStudy": "Business Administration",
      "timePeriod": "2015 - 2017"
    }
  ]
}
```

### LinkedIn-Specific Tips

1. **Use Boolean Search** in keywords:
   - `founder OR ceo OR cto` (any of these)
   - `founder AND saas` (both required)
   - `"head of operations"` (exact phrase)

2. **Filter by Location** (add to URL):
   ```
   &geoUrn=103644278  // United States
   &geoUrn=90000084   // San Francisco Bay Area
   ```

3. **Filter by Company Size** (Sales Navigator only):
   - 1-10: Startups
   - 11-50: Small businesses
   - 51-200: Mid-market
   - 201-500: Enterprise
   - 501+: Large enterprise

4. **Rate Limiting Best Practices**:
   - Max 50-100 profiles per run
   - Wait 30-60 minutes between runs
   - Use residential proxies for higher volume

---

## Facebook Pages Scraper

### Actor Information

- **Actor ID**: `apify~facebook-pages-scraper`
- **Documentation**: https://apify.com/apify/facebook-pages-scraper
- **Pricing**: ~$0.004-0.005 per page (~$4-5 per 1,000)
- **Average Runtime**: 45-90 seconds for 50 pages

⚠️ **Important**: Facebook aggressively blocks scrapers. Success rate is 30-50%. Consider Facebook Graph API as alternative.

### Input Configuration

```json
{
  "startUrls": [
    {
      "url": "https://www.facebook.com/search/pages/?q=automation%20agency"
    }
  ],
  "maxItems": 50,
  "language": "en"
}
```

### Input Parameters Explained

#### `startUrls` (Required)
Array of Facebook URLs to scrape. Supported URL types:
- **Page search results**: `https://www.facebook.com/search/pages/?q=...`
- **Individual pages**: `https://www.facebook.com/pagename`
- **Group search**: `https://www.facebook.com/search/groups/?q=...`

**Example - Search for Business Pages**:
```json
"startUrls": [
  {
    "url": "https://www.facebook.com/search/pages/?q=e-commerce%20automation"
  }
]
```

**Example - Multiple Page Categories**:
```json
"startUrls": [
  { "url": "https://www.facebook.com/search/pages/?q=marketing%20agency" },
  { "url": "https://www.facebook.com/search/pages/?q=digital%20agency" },
  { "url": "https://www.facebook.com/search/pages/?q=automation%20consultant" }
]
```

#### `maxItems` (Required)
Maximum number of pages to scrape.

**Recommendations**:
- **Test mode**: 5-10
- **Production**: 25-50 (Facebook blocks aggressively)
- **Bulk export**: Not recommended (high failure rate)

#### `language` (Optional)
Language for Facebook interface.

**Options**: `"en"`, `"es"`, `"fr"`, `"de"`, etc.

#### Optional Parameters

**`proxyConfiguration`** (Object): Proxy settings
```json
"proxyConfiguration": {
  "useApifyProxy": true,
  "apifyProxyGroups": ["RESIDENTIAL"]
}
```

**`onlyPosts`** (Boolean): Only scrape posts, not page details
```json
"onlyPosts": false  // Default: false (scrape page details + recent posts)
```

### Output Fields

| Field Name | Type | Description | Populated Rate |
|------------|------|-------------|----------------|
| `name` | String | Page name | 100% |
| `url` | String | Facebook page URL | 100% |
| `category` | String | Business category | 90% |
| `likes` | Number | Page likes count | 95% |
| `followersCount` | Number | Follower count | 80% |
| `about` | String | About section text | 70% |
| `description` | String | Short description | 60% |
| `location` | String | Business address | 40% |
| `phone` | String | Phone number | 30% |
| `email` | String | Contact email | 10-20% |
| `website` | String | Website URL | 50% |
| `checkins` | Number | Location check-ins | 30% |
| `rating` | Number | Star rating (1-5) | 40% |
| `reviewsCount` | Number | Total reviews | 40% |
| `posts` | Array | Recent posts (if scraped) | 80% |

**Example Output**:
```json
{
  "name": "Automation Solutions Inc",
  "url": "https://www.facebook.com/automationsolutions",
  "category": "Business Service",
  "likes": 5430,
  "followersCount": 6102,
  "about": "We help businesses automate their workflows and save time with AI-powered solutions.",
  "description": "Automation agency specializing in n8n, Zapier, and Make.com integrations.",
  "location": "123 Main St, San Francisco, CA 94102",
  "phone": "+1 (415) 555-1234",
  "email": "hello@automationsolutions.com",
  "website": "https://automationsolutions.com",
  "checkins": 234,
  "rating": 4.8,
  "reviewsCount": 89
}
```

### Facebook-Specific Tips

1. **High Failure Rate Expected**: 50-70% of runs may fail due to Facebook anti-bot measures. This is normal.

2. **Use Specific Queries**: Generic queries like "business" return poor results. Use specific niches:
   - "e-commerce automation agency"
   - "saas companies San Francisco"
   - "digital marketing consultant"

3. **Fallback Strategy**: If Facebook scraping consistently fails, use:
   - **Facebook Graph API** (requires business account + app approval)
   - **Manual export** from Facebook Groups (Settings → Members → Download CSV)
   - **Skip Facebook** and focus on LinkedIn + Google Maps

4. **Alternative Actor**: Try `phantombuster~facebook-page-likers` for scraping page followers instead of pages themselves.

---

## Google Maps Scraper

### Actor Information

- **Actor ID**: `compass~crawler-google-places`
- **Alternative**: `nwua9Gu5YrADL7ZDj` (used in n8n templates)
- **Documentation**: https://apify.com/compass/crawler-google-places
- **Pricing**: ~$0.002-0.003 per business (~$2-3 per 1,000)
- **Average Runtime**: 20-40 seconds for 50 businesses

### Input Configuration

```json
{
  "searchStringsArray": [
    "digital marketing agencies in San Francisco"
  ],
  "maxCrawledPlacesPerSearch": 50,
  "language": "en",
  "exportPlaceUrls": false,
  "includeWebResults": false
}
```

### Input Parameters Explained

#### `searchStringsArray` (Required)
Array of search queries (same as you'd type in Google Maps search box).

**Example - Single Location**:
```json
"searchStringsArray": [
  "digital marketing agencies in San Francisco, CA"
]
```

**Example - Multiple Locations**:
```json
"searchStringsArray": [
  "digital marketing agencies in San Francisco, CA",
  "digital marketing agencies in Los Angeles, CA",
  "digital marketing agencies in Seattle, WA"
]
```

**Example - Multiple Business Types**:
```json
"searchStringsArray": [
  "saas companies near San Francisco, CA",
  "software development companies in SF",
  "tech startups San Francisco"
]
```

**Search Query Tips**:
- Always include location for accurate results
- Use "near" vs. "in" for broader radius
- Combine business type + location for best results
- Try variations: "agencies", "companies", "services", "consultants"

#### `maxCrawledPlacesPerSearch` (Required)
Maximum number of businesses to scrape per search query.

**Recommendations**:
- **Test mode**: 5-10
- **Production**: 50-100
- **Bulk export**: 500-1,000 (Google Maps has 20-120 results per query typically)

#### `language` (Optional)
Language code for Google Maps interface.

**Options**: `"en"`, `"es"`, `"fr"`, `"de"`, etc.

#### `exportPlaceUrls` (Optional)
Whether to include Google Maps URLs in output.

```json
"exportPlaceUrls": true  // Default: false
```

#### `includeWebResults` (Optional)
Whether to include web search results (not just map listings).

```json
"includeWebResults": false  // Default: false (only map listings)
```

#### Optional Parameters

**`locationQuery`** (String): Override location for all searches
```json
"locationQuery": "San Francisco, CA"
```

**`includeImages`** (Boolean): Scrape business photos
```json
"includeImages": true  // Default: false (saves time + cost)
```

**`includeReviews`** (Boolean): Scrape individual reviews
```json
"includeReviews": false  // Default: false (adds 50% cost + time)
```

### Output Fields

| Field Name | Type | Description | Populated Rate |
|------------|------|-------------|----------------|
| `title` | String | Business name | 100% |
| `address` | String | Full street address | 95% |
| `city` | String | City name | 95% |
| `state` | String | State/province | 95% |
| `postalCode` | String | ZIP/postal code | 90% |
| `countryCode` | String | Country code (e.g., "US") | 100% |
| `phone` | String | Phone number | 85% |
| `phoneNumber` | String | Alternate phone field | 85% |
| `website` | String | Business website | 70% |
| `url` | String | Google Maps URL | 100% |
| `category` | String | Business category | 95% |
| `categoryName` | String | Alternate category field | 95% |
| `rating` | Number | Star rating (1-5) | 90% |
| `stars` | Number | Alternate rating field | 90% |
| `reviewsCount` | Number | Total review count | 90% |
| `totalScore` | Number | Alternate review count field | 90% |
| `priceLevel` | String | Price indicator ($-$$$$) | 40% |
| `openingHours` | Object | Business hours JSON | 70% |
| `placeId` | String | Google Maps place ID | 100% |
| `latitude` | Number | GPS latitude | 100% |
| `longitude` | Number | GPS longitude | 100% |
| `location` | Object | Combined lat/lng object | 100% |

**Example Output**:
```json
{
  "title": "Acme Marketing Agency",
  "address": "123 Market Street, San Francisco, CA 94103, USA",
  "city": "San Francisco",
  "state": "California",
  "postalCode": "94103",
  "countryCode": "US",
  "phone": "+14155551234",
  "phoneNumber": "(415) 555-1234",
  "website": "https://acmemarketing.com",
  "url": "https://www.google.com/maps/place/...",
  "category": "Marketing agency",
  "rating": 4.8,
  "reviewsCount": 127,
  "priceLevel": "$$",
  "openingHours": {
    "Monday": "9:00 AM – 5:00 PM",
    "Tuesday": "9:00 AM – 5:00 PM",
    "Wednesday": "9:00 AM – 5:00 PM",
    "Thursday": "9:00 AM – 5:00 PM",
    "Friday": "9:00 AM – 5:00 PM",
    "Saturday": "Closed",
    "Sunday": "Closed"
  },
  "placeId": "ChIJd8BlQ2BZwokRfmmxN...",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  }
}
```

### Google Maps-Specific Tips

1. **Most Reliable Scraper**: Google Maps has the highest success rate (95-99%) and best data quality.

2. **Location Specificity Matters**:
   - ✅ Good: "digital marketing agencies in San Francisco, CA"
   - ❌ Poor: "marketing agencies near me" (uses Apify server location)

3. **Radius Search** using "near":
   - `"near San Francisco"` → 10-20 mile radius
   - `"in San Francisco"` → City limits only

4. **Multiple Searches for Broader Coverage**:
   ```json
   "searchStringsArray": [
     "agencies in San Francisco",
     "agencies in Oakland",
     "agencies in Berkeley",
     "agencies in Palo Alto"
   ]
   ```

5. **Category Filtering**:
   - Google Maps has 500+ categories
   - Examples: "restaurant", "hotel", "lawyer", "dentist", "saas company"

---

## Advanced Configurations

### Parallel Execution in n8n

All 3 actors start simultaneously from the **Apify Config** node. This parallel execution pattern saves time:

**Sequential (not used)**: 45s + 60s + 30s = 135 seconds total
**Parallel (current)**: max(45s, 60s, 30s) = 60 seconds total

### Wait Times Tuning

Default wait times in workflow:
- LinkedIn: 45 seconds
- Facebook: 60 seconds
- Google Maps: 30 seconds

**Increase if**:
- "Dataset not found" errors
- Empty results when testing shows data exists
- High volume scraping (100+ items per platform)

**Decrease if**:
- Small result sets (5-10 items)
- Want faster execution
- Budget allows retry-on-failure logic

### Retry Logic

Add **retry on failure** to HTTP Request nodes:

1. Click any "Start Actor" node
2. Go to **Settings** tab
3. Under **Retry on Fail**, configure:
   - **Max tries**: 2
   - **Wait between tries**: 10000 ms (10 seconds)

### Webhook Alternative (Advanced)

Instead of Wait nodes, use webhook callbacks:

**Step 1**: Add webhook trigger to workflow
**Step 2**: Pass webhook URL to Apify actor:
```json
"webhookOptions": {
  "successUrl": "https://your-n8n.com/webhook/apify-success",
  "failureUrl": "https://your-n8n.com/webhook/apify-failure"
}
```
**Step 3**: Apify calls webhook when run completes (faster, no waiting)

---

## Field Mapping Reference

### Standard Schema → Apify Fields

The **Transform Apify Data** node maps platform-specific fields to standardized schema.

**LinkedIn Mapping**:
```javascript
{
  full_name: raw.fullName || raw.name,
  first_name: nameParts[0],
  last_name: nameParts.slice(1).join(' '),
  company_name: raw.companyName || raw.company?.name,
  job_title: raw.headline || raw.title,
  location: raw.location,
  email_address: raw.email,
  phone_number: raw.phone || raw.phoneNumbers?.[0],
  linkedin_url: raw.profileUrl || raw.url,
  company_website: raw.companyWebsite,
  connections_count: raw.connectionsCount,
  follower_count: raw.followersCount,
  skills: raw.skills ? raw.skills.join(', ') : '',
  education: raw.education ? raw.education.map(e => e.schoolName).join(', ') : ''
}
```

**Google Maps Mapping**:
```javascript
{
  company_name: raw.title || raw.name,
  location: raw.address,
  phone_number: raw.phone || raw.phoneNumber,
  company_website: raw.website || raw.url,
  rating: raw.rating || raw.stars,
  review_count: raw.reviewsCount || raw.totalScore,
  latitude: raw.latitude || raw.location?.lat,
  longitude: raw.longitude || raw.location?.lng,
  place_id: raw.placeId
}
```

**Facebook Mapping**:
```javascript
{
  company_name: raw.name || raw.title,
  location: raw.location || raw.address,
  phone_number: raw.phone || raw.phoneNumber,
  company_website: raw.website || raw.url,
  facebook_url: raw.url,
  facebook_about: raw.about || raw.description,
  facebook_likes: raw.likes,
  follower_count: raw.likes || raw.followersCount
}
```

---

## Performance Tuning

### Reducing Costs

1. **Lower maxItems**:
   - 50 → 25 items: Saves 50% cost
   - Test mode (5 items): Saves 90% cost

2. **Skip Low-Performing Platforms**:
   - If Facebook success rate < 30%, remove it (saves $6-9/month)

3. **Reduce Run Frequency**:
   - Daily → Every 2 days: Saves 50%
   - Daily → Weekly: Saves 85%

4. **Use Datacenter Proxies** (LinkedIn only):
   - Residential → Datacenter: Saves 80% proxy cost
   - Tradeoff: 60% success rate vs. 90%

### Improving Success Rate

1. **Increase Wait Times**:
   - LinkedIn: 45s → 60s
   - Facebook: 60s → 90s

2. **Use Residential Proxies**:
   - Higher cost but 90-95% success rate

3. **Reduce Volume Per Run**:
   - 100 items → 50 items: Lower rate limit triggers

4. **Stagger Runs**:
   - Don't run all 3 platforms simultaneously
   - Run LinkedIn at 9 AM, Facebook at 12 PM, Google Maps at 3 PM

### Improving Data Quality

1. **Enable Email Scraping** (LinkedIn):
   - Some actors support deep profile scraping for emails
   - Costs 2-3x more but increases email find rate from 10% to 30-50%

2. **Scrape Individual Profiles** vs. Search Results:
   - Search results: Fast, shallow data
   - Individual profiles: Slow, deep data (experience, education, skills)

3. **Post-Enrichment**:
   - Use Hunter.io for email finding ($49/month for 5,000 emails)
   - Use Clearbit for firmographic data ($99/month)

---

## Cost Optimization

### Monthly Budget Scenarios

**Scenario 1: Tight Budget ($39/month - Starter Plan)**
```
Run every 3 days, 25 results per platform
- LinkedIn: 250 profiles/month = $1.25
- Google Maps: 250 businesses/month = $0.75
- Skip Facebook (low success rate)
Total: $2/month scraping + $39 plan = $41/month
```

**Scenario 2: Standard Budget ($39/month - Starter Plan)**
```
Run daily, 30 results per platform
- LinkedIn: 900 profiles/month = $4.50
- Facebook: 900 pages/month = $4.50
- Google Maps: 900 businesses/month = $2.70
Total: $11.70/month scraping + $39 plan = $50.70/month
```

**Scenario 3: High Volume ($149/month - Standard Plan)**
```
Run daily, 100 results per platform
- LinkedIn: 3,000 profiles/month = $15
- Facebook: 3,000 pages/month = $15
- Google Maps: 3,000 businesses/month = $9
Total: $39/month scraping + $149 plan = $188/month
```

### ROI by Scenario

**Lead Value Assumption**: $10-50 per qualified B2B lead

**Scenario 1 ROI**:
- 500 leads/month × 30% qualified = 150 qualified leads
- 150 × $10 = $1,500 value
- Cost: $41
- **ROI: 3,558%** 🚀

**Scenario 2 ROI**:
- 1,800 leads/month × 30% qualified = 540 qualified leads
- 540 × $10 = $5,400 value
- Cost: $51
- **ROI: 10,488%** 🚀

---

## Support & Troubleshooting

### Actor-Specific Issues

**LinkedIn returns 0 results**:
1. Test search URL in browser (logged in to LinkedIn)
2. Verify results exist
3. Try different keywords
4. Check if URL includes filters (location, industry, etc.)

**Facebook returns empty array**:
1. Expected behavior (30-50% success rate)
2. Try different search query
3. Consider switching to Facebook Graph API
4. Or skip Facebook entirely

**Google Maps returns wrong location**:
1. Add explicit city/state to query: "agencies in San Francisco, CA"
2. Don't use "near me" (uses Apify server location, not yours)

### Getting Help

- **Apify Support**: support@apify.com (email support with Starter plan)
- **Apify Docs**: https://docs.apify.com/
- **Actor-Specific Issues**: Check actor's "Issues" tab in Apify Console
- **Community Forum**: https://community.apify.com/

---

**Last Updated**: 2025-01-04
**Version**: 1.0
