# Lead Scraping & Cold Email Automation

**Vercel-deployed automation** for scraping leads, qualifying them with AI, and sending personalized cold emails.

## Overview

Automated lead generation pipeline:
- Scrape leads from target websites
- Find verified email addresses
- AI-powered lead qualification and research
- Generate hyper-personalized cold emails
- Track engagement and manage follow-ups

## What It Does

1. **Scrape Leads**: Use Firecrawl MCP to scrape target websites for leads
2. **Find Emails**: Automatically find verified email addresses
3. **Research & Qualify**: AI analyzes leads and scores them (website scraping + AI)
4. **Generate Emails**: AI crafts hyper-personalized cold emails
5. **Send & Track**: Send emails via Gmail API, monitor replies
6. **Follow-ups**: Smart 3-touch sequence (Day 3, 7, 14)

## Tech Stack

- **Platform**: Vercel (serverless functions)
- **Scraping**: Firecrawl MCP (web scraping)
- **AI**: Claude/OpenAI (qualification & email generation)
- **Email**: Gmail API
- **Database**: Google Sheets
- **Language**: TypeScript/Node.js

## Quick Start

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env

# Deploy to Vercel
vercel deploy
```

## Environment Variables

```bash
FIRECRAWL_API_KEY=your_firecrawl_key
CLAUDE_API_KEY=your_anthropic_key
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GOOGLE_SHEETS_ID=your_sheet_id
```

## Project Structure

```text
/api
  /scrape-leads.ts    # Firecrawl scraping endpoint
  /find-emails.ts     # Email finder
  /qualify-leads.ts   # AI qualification
  /generate-emails.ts # AI email writer
  /send-emails.ts     # Gmail sender
  /follow-up.ts       # Follow-up sequencer
/lib
  /firecrawl.ts       # Firecrawl wrapper
  /ai.ts              # AI helpers
  /gmail.ts           # Gmail API
  /sheets.ts          # Google Sheets
```

## API Routes

- `POST /api/scrape-leads` - Scrape leads from URLs
- `POST /api/find-emails` - Find/verify emails
- `POST /api/qualify-leads` - AI lead scoring
- `POST /api/generate-emails` - Generate personalized emails
- `POST /api/send-emails` - Send via Gmail
- `GET /api/follow-up` - Cron job for follow-ups

## License

MIT
