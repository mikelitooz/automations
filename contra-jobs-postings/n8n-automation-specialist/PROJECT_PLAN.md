# 🚀 AutoScale CRM Intelligence Hub

> A production-ready n8n automation system demonstrating enterprise-grade business operations automation with AI-driven workflows.

## 🎯 Project Purpose

This project is designed to showcase expertise in **n8n automation** by building a complete business operations system that hits every requirement from modern n8n specialist roles:

| Skill Area                   | Demonstrated By                          |
| ---------------------------- | ---------------------------------------- |
| Complex n8n automations      | 6 interconnected workflow JSONs          |
| GoHighLevel/CRM integration  | Webhook handlers, CRM simulation         |
| AI-driven workflows          | OpenAI-powered lead qualification        |
| Reliability & error handling | Monitoring workflow + structured logging |
| Full-stack development       | Express.js backend API                   |
| Test automation              | Playwright E2E tests                     |
| DevOps                       | Docker Compose deployment                |

---

## 📁 Project Structure

```
n8n-automation-specialist/
├── README.md                 # Portfolio showcase
├── docker-compose.yml        # One-command deployment
├── .env.example              # Environment template
├── api/                      # Node.js backend
│   ├── package.json
│   ├── server.js
│   ├── routes/
│   │   ├── leads.js
│   │   ├── webhooks.js
│   │   └── ai.js
│   └── middleware/
│       └── logger.js
├── workflows/                # n8n workflow JSONs
│   ├── 01-lead-capture.json
│   ├── 02-ai-qualification.json
│   ├── 03-crm-sync.json
│   ├── 04-marketing-automation.json
│   ├── 05-onboarding.json
│   └── 06-error-monitoring.json
├── tests/                    # Playwright tests
│   ├── playwright.config.js
│   ├── api.spec.js
│   └── workflows.spec.js
└── docs/
    └── architecture.md
```

---

## 🔄 Workflow Overview

### 1. Lead Capture & Enrichment

- Webhook trigger for incoming leads
- Data validation and normalization
- Lead enrichment via external APIs
- Error handling with retry logic

### 2. AI Lead Qualification

- Receives enriched lead data
- Calls OpenAI for intelligent scoring
- Decision tree routing based on score
- Updates CRM with qualification status

### 3. CRM Sync & Pipeline

- Bidirectional sync simulation
- Stage progression automation
- Activity logging
- Notification triggers

### 4. Marketing Automation

- Drip campaign triggers
- Engagement tracking
- Re-engagement logic for cold leads

### 5. Customer Onboarding

- Welcome sequence automation
- Task creation for team
- Document collection triggers

### 6. Error Monitoring & Health

- Workflow execution monitoring
- Failure alerting
- Daily health digest

---

## 🛠️ Tech Stack

| Component        | Technology              |
| ---------------- | ----------------------- |
| Workflow Engine  | n8n                     |
| Backend API      | Node.js + Express       |
| Database         | PostgreSQL              |
| AI               | OpenAI API              |
| Testing          | Playwright              |
| Containerization | Docker + Docker Compose |

---

## 🚀 Quick Start

```bash
# Clone and setup
cd n8n-automation-specialist

# Start all services
docker-compose up -d

# Access n8n UI
open http://localhost:5678

# Import workflows from /workflows folder
```

---

## 🎯 Why This Project Stands Out

1. **Systems Thinking** - Not isolated scripts, but an interconnected business system
2. **AI Integration** - LLM-powered workflows (rare and valuable skill)
3. **Production-Ready** - Docker, logging, error handling built-in
4. **Full-Stack** - Node.js API demonstrates bonus development skills
5. **Test Automation** - Playwright shows QA mindset
6. **Clean Documentation** - Professional presentation

---

## 📊 Architecture

```mermaid
flowchart TB
    subgraph External["External Sources"]
        WEB[Website Form]
        API_EXT[External APIs]
    end

    subgraph N8N["n8n Workflows"]
        LC[Lead Capture]
        AIQ[AI Qualification]
        CRM[CRM Sync]
        MKT[Marketing]
        ONB[Onboarding]
        MON[Monitoring]
    end

    subgraph Backend["Node.js API"]
        LEADS[/api/leads]
        WEBHOOKS[/api/webhooks]
        AI[/api/ai]
    end

    subgraph Storage["Data Layer"]
        DB[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    WEB --> LC
    LC --> LEADS
    LEADS --> AIQ
    AIQ --> AI
    AI --> CRM
    CRM --> MKT
    CRM --> ONB
    MON --> DB

    LEADS --> DB
    AI --> REDIS
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suite
npx playwright test api.spec.js
```

---

## 📝 License

MIT - Built for portfolio demonstration purposes.
