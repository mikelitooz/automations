# 🚀 AutoScale CRM Intelligence Hub

> **Production-ready n8n automation system demonstrating AI-powered business operations at scale.**

[![n8n](https://img.shields.io/badge/n8n-Automation-orange)](https://n8n.io)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://docker.com)
[![Playwright](https://img.shields.io/badge/Tests-Playwright-purple)](https://playwright.dev)

---

## 🎯 What This Project Demonstrates

| Skill                       | Implementation                                          |
| --------------------------- | ------------------------------------------------------- |
| **Complex n8n Automations** | 6 interconnected workflows across sales, marketing, ops |
| **AI-Driven Workflows**     | OpenAI-powered lead qualification & smart routing       |
| **API Integration**         | RESTful backend with webhook handling                   |
| **Error Handling**          | Retry logic, fallbacks, health monitoring               |
| **Full-Stack Development**  | Node.js/Express API with structured logging             |
| **Test Automation**         | Playwright E2E tests for API & workflows                |
| **DevOps**                  | Docker Compose deployment, environment config           |

---

## 📁 Project Structure

```
├── docker-compose.yml      # One-command deployment
├── .env.example            # Environment template
├── api/                    # Node.js backend
│   ├── server.js           # Express app
│   ├── routes/             # API endpoints
│   └── middleware/         # Logging, etc.
├── workflows/              # n8n workflow JSONs
│   ├── 01-lead-capture.json
│   ├── 02-ai-qualification.json
│   ├── 03-crm-sync.json
│   ├── 04-marketing-automation.json
│   ├── 05-onboarding.json
│   └── 06-error-monitoring.json
├── tests/                  # Playwright tests
└── docs/                   # Architecture docs
```

---

## 🔄 Workflow Overview

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│ Lead Capture│────▶│ AI Qualify   │────▶│ CRM Sync  │
└─────────────┘     └──────────────┘     └───────────┘
                           │                    │
                           ▼                    ▼
                    ┌──────────────┐     ┌───────────┐
                    │  Marketing   │     │ Onboarding│
                    └──────────────┘     └───────────┘
                           │                    │
                           └────────┬───────────┘
                                    ▼
                           ┌──────────────┐
                           │  Monitoring  │
                           └──────────────┘
```

### Workflow Details

| #   | Workflow         | Description                                  |
| --- | ---------------- | -------------------------------------------- |
| 01  | Lead Capture     | Webhook intake, validation, enrichment       |
| 02  | AI Qualification | GPT-powered scoring with fallback rules      |
| 03  | CRM Sync         | Pipeline updates, stale lead detection       |
| 04  | Marketing        | Engagement tracking, re-engagement campaigns |
| 05  | Onboarding       | Phased customer activation, task creation    |
| 06  | Monitoring       | Health checks, error alerts, daily digest    |

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) OpenAI API key

### 1. Clone & Configure

```bash
cd n8n-automation-specialist
cp .env.example .env
# Edit .env with your settings
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Access

- **n8n UI**: http://localhost:5678
- **API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

### 4. Import Workflows

1. Open n8n UI
2. Go to Workflows → Import
3. Import each JSON from `/workflows`

---

## 🧪 Testing

```bash
cd tests
npm install
npm test
```

### Test Coverage

- ✅ API endpoint tests (20+ test cases)
- ✅ Workflow structure validation
- ✅ Error handling scenarios

---

## 📡 API Endpoints

### Leads

| Method | Endpoint               | Description             |
| ------ | ---------------------- | ----------------------- |
| POST   | `/api/leads`           | Create new lead         |
| GET    | `/api/leads`           | List leads with filters |
| GET    | `/api/leads/:id`       | Get lead by ID          |
| PUT    | `/api/leads/:id/score` | Update lead score       |
| PUT    | `/api/leads/:id/stage` | Update pipeline stage   |

### AI

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| POST   | `/api/ai/qualify`        | AI lead qualification       |
| POST   | `/api/ai/generate-reply` | Generate personalized email |
| POST   | `/api/ai/sentiment`      | Analyze text sentiment      |

### Webhooks

| Method | Endpoint                  | Description          |
| ------ | ------------------------- | -------------------- |
| POST   | `/api/webhooks/lead`      | Ingest external lead |
| POST   | `/api/webhooks/crm-sync`  | CRM sync events      |
| POST   | `/api/webhooks/marketing` | Marketing events     |

---

## 🏗️ Tech Stack

| Layer         | Technology       |
| ------------- | ---------------- |
| Orchestration | n8n              |
| Backend       | Node.js, Express |
| Database      | PostgreSQL       |
| Cache         | Redis            |
| AI            | OpenAI GPT-4     |
| Testing       | Playwright       |
| Deployment    | Docker Compose   |

---

## 📊 Architecture

See [docs/architecture.md](docs/architecture.md) for detailed architecture diagrams and design decisions.

---

## 🎯 Why This Project Wins

1. **Systems Thinking** — Not isolated scripts, but interconnected business automation
2. **AI Integration** — Production-ready LLM workflows with intelligent fallbacks
3. **Reliability** — Error handling, retries, health monitoring built-in
4. **Professional Quality** — Clean code, comprehensive tests, full documentation
5. **Portfolio Ready** — Demonstrates real-world n8n expertise

---

## 📝 License

MIT — Built for portfolio demonstration.
