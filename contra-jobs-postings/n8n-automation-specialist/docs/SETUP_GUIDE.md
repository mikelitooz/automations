# 🛠️ Setup Guide - AutoScale CRM Intelligence Hub

A complete step-by-step guide to get this project running on your machine.

---

## Prerequisites

Before starting, make sure you have:

| Tool               | Required Version | Check Command            |
| ------------------ | ---------------- | ------------------------ |
| **Docker Desktop** | Latest           | `docker --version`       |
| **Docker Compose** | v2.0+            | `docker compose version` |
| **Node.js**        | v18+ (for tests) | `node --version`         |
| **Git**            | Any              | `git --version`          |

### Install Docker Desktop (if needed)

1. Go to https://www.docker.com/products/docker-desktop
2. Download for Windows
3. Install and restart your computer
4. Open Docker Desktop and wait for it to start

---

## Step 1: Navigate to Project

```bash
cd c:/Users/DELL/Desktop/projects/automation/contra-jobs-postings/n8n-automation-specialist
```

---

## Step 2: Create Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Now edit `.env` with your settings:

```env
# Required settings (update these)
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=YourSecurePassword123

# Database credentials
POSTGRES_USER=n8n
POSTGRES_PASSWORD=YourDBPassword123
POSTGRES_DB=n8n

# Optional: Add your OpenAI key for AI features
# Leave empty to use fallback scoring
OPENAI_API_KEY=sk-your-openai-key-here
```

> **Note:** Without an OpenAI key, the AI qualification will use rule-based fallback scoring (still works great for demos!)

---

## Step 3: Start Docker Containers

Make sure Docker Desktop is running, then:

```bash
docker compose up -d
```

This starts 4 services:

- **n8n** (workflow engine) - port 5678
- **PostgreSQL** (database) - port 5432
- **Redis** (cache) - port 6379
- **API** (Node.js backend) - port 3000

### Check if everything is running:

```bash
docker compose ps
```

You should see all 4 services with status "Up".

### View logs (if needed):

```bash
# All services
docker compose logs -f

# Just n8n
docker compose logs -f n8n

# Just API
docker compose logs -f api
```

---

## Step 4: Access n8n

Open your browser and go to:

```
http://localhost:5678
```

Login with:

- **Username:** The value you set for `N8N_BASIC_AUTH_USER` (default: admin)
- **Password:** The value you set for `N8N_BASIC_AUTH_PASSWORD`

---

## Step 5: Import Workflows

1. In n8n, click **"Workflows"** in the sidebar
2. Click **"Add Workflow"** → **"Import from File"**
3. Import each workflow in order:

   - `workflows/01-lead-capture.json`
   - `workflows/02-ai-qualification.json`
   - `workflows/03-crm-sync.json`
   - `workflows/04-marketing-automation.json`
   - `workflows/05-onboarding.json`
   - `workflows/06-error-monitoring.json`

4. For each imported workflow:
   - Open it
   - Click **"Activate"** (toggle in top right)

---

## Step 6: Test the API

Open a new terminal and test the API:

```bash
# Health check
curl http://localhost:3000/health

# You should see:
# {"status":"healthy","timestamp":"...","uptime":...}
```

### Test creating a lead:

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"John","lastName":"Doe","company":"Acme Inc"}'
```

---

## Step 7: Test a Workflow (Optional)

### Trigger the Lead Capture webhook:

```bash
curl -X POST http://localhost:5678/webhook/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@fortune500.com",
    "firstName": "Jane",
    "lastName": "Executive",
    "company": "Fortune 500 Corp",
    "source": "demo_request"
  }'
```

Then check n8n → Executions to see the workflow run!

---

## Step 8: Run Tests (Optional)

To run the Playwright tests:

```bash
cd tests
npm install
npm test
```

---

## Troubleshooting

### Docker containers won't start

```bash
# Stop everything and restart
docker compose down
docker compose up -d --build
```

### Port already in use

Change the ports in `docker-compose.yml`:

```yaml
ports:
  - "5679:5678" # n8n on different port
  - "3001:3000" # API on different port
```

### API can't connect to database

Wait 30 seconds for PostgreSQL to fully start, then:

```bash
docker compose restart api
```

### n8n can't reach the API

The API URL inside n8n workflows uses Docker networking. Make sure the API container is running:

```bash
docker compose ps api
```

---

## Stopping the Project

```bash
# Stop all containers
docker compose down

# Stop and remove all data (fresh start)
docker compose down -v
```

---

## Quick Reference

| Service    | URL                          | Purpose         |
| ---------- | ---------------------------- | --------------- |
| n8n        | http://localhost:5678        | Workflow editor |
| API        | http://localhost:3000        | REST API        |
| API Health | http://localhost:3000/health | Health check    |
| API Docs   | http://localhost:3000        | Endpoint list   |

---

## Next Steps

1. ✅ Explore each workflow in n8n
2. ✅ Test the API endpoints with Postman or curl
3. ✅ Add your OpenAI key for AI-powered qualification
4. ✅ Customize workflows for your use case
5. ✅ Run the test suite to see everything pass

**You're all set!** 🚀
