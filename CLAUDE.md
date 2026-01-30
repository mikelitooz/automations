# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is an **n8n workflow automation repository** containing multiple automation projects built using n8n, Google Sheets, AI APIs (Claude/Anthropic), and various integration services. The repository includes production-ready workflow JSON files and comprehensive documentation for deployment.

## Project Structure

The repository contains **4 independent automation projects**:

### 1. Dr. Jennifer Medical Practice Automation (`dr-jennifer-workflow/`)
- **Status**: 70% complete (3.5 of 5 automations built)
- **Impact**: $79,200/month in financial benefits, saves 11 hours/day
- **Workflows**: 15 JSON files covering appointment reminders, insurance verification, intake forms, prescription refills, and lab results
- **Key Technologies**: Twilio SMS, Google Sheets, Typeform, Athenahealth FHIR API, Claude AI
- **HIPAA Compliant**: Yes - includes BAA requirements and compliance checklists

### 2. LinkedIn Job Automation (`linkedin-leads-workflow/`)
- **Purpose**: Automate job search and outreach
- **Workflows**: 1 JSON file
- **Key Technologies**: Apify (LinkedIn scraping), Google Sheets, Gmail
- **Cost**: ~$0.13 per run

### 3. Real Estate Lead Management (`real-estate-workflow/`)
- **Purpose**: Lead capture, qualification, and nurturing for real estate agents
- **Impact**: 5% → 15% conversion rate, saves 8-10 hours daily
- **Workflows**: 6 JSON files (lead capture, AI qualification, property recommendations, viewing scheduler, follow-up sequences, market reports)
- **Key Technologies**: Claude AI, Twilio, Google Sheets, MLS API integration, Calendly

### 4. E-commerce Fashion Boutique (`ecommerce-workflow/`)
- **Status**: In development
- **Purpose**: Order management, AI customer service, inventory sync, abandoned cart recovery
- **Expected Impact**: $43K-72K/month in recovered revenue

## n8n Workflow Architecture

All workflows follow this pattern:
- **Trigger** → **Data Processing** → **External API Calls** → **Data Storage (Google Sheets)** → **Notifications/Actions**

### Common n8n Node Types Used
- Webhook triggers and HTTP Request nodes
- Google Sheets (read/write operations)
- Code nodes (JavaScript for data transformation)
- Schedule/Cron triggers
- Twilio (SMS)
- Gmail API
- Anthropic Chat Model (Claude AI)
- Sticky notes for documentation

## Working with n8n Workflows

### Importing Workflows to n8n
```bash
# Navigate to specific project folder
cd dr-jennifer-workflow/  # or linkedin-leads-workflow/, etc.

# Import JSON file via n8n UI:
# n8n Dashboard → Workflows → Import from File → Select *.json
```

### Testing Workflows Locally
The repository contains **production-ready JSON exports** that need:
1. n8n instance (cloud: https://izzydev.app.n8n.cloud/ or self-hosted)
2. Credentials configured (Twilio, Google, Claude API, etc.)
3. Environment variables set
4. Webhook URLs updated

### n8n API Configuration
The repository includes `.mcp.json` with n8n MCP server configuration:
- **n8n API URL**: https://izzydev.app.n8n.cloud/
- **API Key**: Configured for n8n-mcp integration
- Used for programmatic workflow creation/validation

## Key Development Principles (from guide_to_n8n_mcp.md)

### Building n8n Workflows
1. **Templates First**: Always check n8n's 2,500+ templates before building from scratch
2. **Silent Execution**: Execute tools without commentary; only respond after all tools complete
3. **Parallel Execution**: Run independent operations simultaneously for performance
4. **Never Trust Defaults**: Explicitly configure ALL node parameters - default values cause runtime failures
5. **Multi-Level Validation**: Use validate_node_minimal → validate_node_operation → validate_workflow

### n8n MCP Workflow Process
```
1. Template Discovery (search_templates_by_metadata, get_templates_for_task)
2. Node Discovery (search_nodes, list_nodes, get_node_essentials)
3. Configuration Phase (get_node_essentials with includeExamples: true)
4. Validation Phase (validate_node_minimal, validate_node_operation)
5. Building Phase (set ALL parameters explicitly)
6. Workflow Validation (validate_workflow, validate_workflow_connections)
7. Deployment (n8n_create_workflow, n8n_validate_workflow)
```

### Critical n8n Connection Syntax
**IF Node Multi-Output Routing** - IF nodes have two outputs (TRUE/FALSE). Use `branch` parameter:
```json
{
  "type": "addConnection",
  "source": "if-node-id",
  "target": "success-handler-id",
  "sourcePort": "main",
  "targetPort": "main",
  "branch": "true"  // or "false" for FALSE branch
}
```

**Adding Connections** - Use four separate string parameters:
```json
{
  "type": "addConnection",
  "source": "source-node-id",
  "target": "target-node-id",
  "sourcePort": "main",
  "targetPort": "main"
}
```

## Common Development Tasks

### Creating a New n8n Workflow
1. Read `guide_to _n8n_mcp.md` for complete n8n-MCP best practices
2. Use n8n-mcp tools: `search_templates`, `get_node_essentials`, `validate_node_minimal`
3. Build workflow with explicit parameter configuration
4. Validate using `validate_workflow` before deployment
5. Create comprehensive documentation (README, SETUP_GUIDE, DEPLOYMENT_SUMMARY)

### Modifying Existing Workflows
1. Read the workflow's README.md first to understand architecture
2. Open the JSON file to review node structure
3. Check SETUP_GUIDE.md for credential and environment variable requirements
4. Test changes in n8n before exporting updated JSON
5. Update relevant documentation files

### Documentation Standards
Each automation project includes standardized documentation:
- **README.md**: Project overview, business impact, quick start
- **SETUP_GUIDE.md**: Step-by-step deployment instructions (typically 10-15 parts)
- **DEPLOYMENT_SUMMARY.md**: Quick reference for daily operations and troubleshooting
- **WORKFLOW_EXPLAINATION.md**: Original requirements and detailed use case
- **[FEATURE]_README.md**: Feature-specific documentation (e.g., INSURANCE_VERIFICATION_README.md)
- **Google Sheet templates**: Column structure documentation (e.g., GOOGLE_SHEET_TEMPLATE.md)

### Testing Workflows
Each project's SETUP_GUIDE.md includes testing procedures:
1. Create test data in Google Sheets
2. Use personal phone number for SMS testing
3. Execute workflow manually first
4. Verify all integrations (APIs, sheets, notifications)
5. Monitor for 24-48 hours before full production deployment

## Google Sheets as Database

**Central Pattern**: Google Sheets serves as the master database for all workflows
- Real-time data updates via Google Sheets API
- Color-coded status tracking (🟢🟡🔴 visual indicators)
- 20-35+ columns per automation project
- Serves as dashboard, data source, and audit trail

## API Integrations

### Claude AI (Anthropic)
- Used for intelligent triage and decision-making
- Examples: prescription refill approval, lead qualification, customer service chatbots
- Cost: $30-50/month typical usage

### Twilio SMS
- Two-way SMS communication
- Patient/customer notifications and response handling
- Cost: $5-25/month depending on volume

### Healthcare APIs (Dr. Jennifer project)
- **Athenahealth FHIR R4 API**: EMR integration (OAuth2)
- **Mock Insurance APIs**: Testing before production
- **Upgrade paths documented**: Availity, Change Healthcare, Waystar

### Real Estate APIs
- MLS API integration (or Zillow/Realtor.com via Apify)
- Calendly for scheduling
- QuickChart for report visualizations

## ROI and Business Metrics

Projects include detailed ROI calculations:
- **Dr. Jennifer**: $79,200/month benefit, 10,000-76,000% ROI
- **Real Estate**: +$12K-15K monthly, 267% ROI in first month
- **E-commerce**: $43K-72K/month in recovered abandoned carts
- **LinkedIn**: 4-5 hours saved per job search session

## Compliance and Security

### HIPAA Compliance (Dr. Jennifer project)
- Business Associate Agreements (BAAs) required for: Twilio, Google Workspace, Typeform, Athenahealth, Anthropic
- Patient consent workflows
- Audit logging
- 2FA required on all accounts
- Data retention policies (30-day auto-delete for forms, 7-year for prescriptions)

### Data Protection
- Encryption at rest and in transit
- OAuth2 authentication
- Secure API key management via environment variables
- No credentials in code/JSON files

## Environment Variables Pattern

Common environment variables across projects:
```bash
# Claude AI
CLAUDE_API_KEY=your_anthropic_api_key

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Sheets
GOOGLE_SHEETS_ID=your_sheet_id

# Project-specific
USER_EMAIL=your_email
AGENT_EMAIL=agent@example.com
MLS_API_KEY=your_mls_key
CALENDLY_API_KEY=your_calendly_key
```

## Git Workflow

Current branch: `main`
- No specific branching strategy documented
- Use descriptive commit messages
- Each project directory is self-contained

## File Naming Conventions

### Workflow Files
- Descriptive kebab-case: `appointment-reminders-workflow.json`
- Sequential numbering for multi-workflow projects: `1-lead-capture-hub.json`
- Feature-based naming: `refill-ai-triage.json`, `insurance-verification-nightly.json`

### Documentation Files
- UPPERCASE for primary docs: `README.md`, `SETUP_GUIDE.md`, `DEPLOYMENT_SUMMARY.md`
- Feature-specific: `INSURANCE_VERIFICATION_README.md`, `REFILL_AI_PROTOCOL.md`
- Template documentation: `GOOGLE_SHEET_TEMPLATE.md`, `INTAKE_TYPEFORM_TEMPLATE.md`

## Project Status Tracking

Refer to `PROJECT_COMPLETION_SUMMARY.md` for:
- Completed vs. in-progress automations
- Total files created
- Estimated build time
- Financial impact projections
- Next steps for incomplete features

## Common Issues and Solutions

### n8n Workflow Failures
- Check execution logs in n8n dashboard
- Verify all credentials are reconnected after import
- Ensure webhook URLs are updated for new n8n instance
- Confirm environment variables are set

### Google Sheets Errors
- Reconnect Google Sheets OAuth2 credentials
- Verify sheet permissions (share with service account)
- Check Document ID is correct in workflow nodes
- Ensure column headers match exactly

### SMS/Twilio Issues
- Phone numbers must be in E.164 format: +1XXXXXXXXXX
- Verify webhook is configured in Twilio console
- Check Twilio message logs for delivery status
- Ensure BAA is signed for HIPAA compliance

### API Integration Failures
- Review API rate limits
- Check API key validity and expiration
- Verify endpoint URLs haven't changed
- Use mock APIs for initial testing (documented in migration guides)

## Resources

- **n8n Documentation**: https://docs.n8n.io
- **n8n Cloud Instance**: https://izzydev.app.n8n.cloud/
- **n8n Community Forum**: https://community.n8n.io/
- **Apify Documentation**: https://docs.apify.com
- **Claude API Documentation**: https://docs.anthropic.com

## Notes for Future Development

1. **When creating new workflows**: Follow the established documentation pattern (README → SETUP_GUIDE → DEPLOYMENT_SUMMARY)
2. **Before modifying workflows**: Read the project's complete documentation set to understand dependencies
3. **Always include**: ROI calculations, success metrics, testing procedures, troubleshooting sections
4. **Mock APIs first**: Build with mock/test APIs before production integration
5. **HIPAA considerations**: If handling PHI, include compliance checklists and BAA requirements
6. **Use n8n-mcp tools**: Leverage the n8n MCP server for programmatic workflow creation/validation
7. **Parallel tool execution**: When operations are independent, execute them simultaneously per guide_to_n8n_mcp.md
8. **Explicit configuration**: Never rely on default parameter values in n8n nodes - the #1 source of runtime failures
