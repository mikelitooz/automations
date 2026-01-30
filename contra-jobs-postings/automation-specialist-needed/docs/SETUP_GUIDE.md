# Setup Guide - AgencyFlow Automation Suite

A complete step-by-step guide to setting up the AgencyFlow automation system.

---

## Prerequisites

Before you begin, ensure you have:

- [ ] Zapier account (Professional plan or higher recommended)
- [ ] Slack workspace with admin access
- [ ] Trello account with admin access
- [ ] Toggl Track account
- [ ] Stripe account with API access
- [ ] Google account (for Sheets logging)

---

## Step 1: Slack Configuration

### 1.1 Create Dedicated Channels

Create the following channels in Slack:

```
#team-updates      → Weekly reports & announcements
#client-template   → Template for new client channels
#automation-alerts → Error notifications
```

### 1.2 Install Zapier App

1. Go to Slack App Directory
2. Search for "Zapier"
3. Click **Add to Slack**
4. Authorize the integration

### 1.3 (Optional) Create Slash Commands

If using custom slash commands:

1. Go to **Apps** → **Build** in Slack
2. Create new app → "AgencyFlow"
3. Add Slash Commands:
   - `/task` - Create task from Slack
   - `/status` - Get project status

---

## Step 2: Trello Configuration

### 2.1 Create Template Board

1. Create a new board named **"CLIENT TEMPLATE"**
2. Add these lists:

   ```
   📥 Inbox
   📋 To Do
   🔄 In Progress
   👀 Review
   ✅ Done
   📦 Archive
   ```

3. Add labels:
   | Label | Color | Use Case |
   |-------|-------|----------|
   | Urgent | Red | High priority |
   | Design | Purple | Design tasks |
   | Development | Blue | Dev tasks |
   | Content | Green | Content creation |
   | Meeting | Yellow | Meetings/calls |

4. Set board visibility to **Private**

### 2.2 Enable Trello Power-Ups

Enable these power-ups on your template:

- Calendar
- Custom Fields (for client-specific data)

### 2.3 Connect Trello to Zapier

1. In Zapier, add Trello as a connected account
2. Authorize with your Trello credentials
3. Test the connection

---

## Step 3: Toggl Configuration

### 3.1 Set Up Workspace

1. Create a workspace (or use existing)
2. Create these base tags:
   - `billable`
   - `internal`
   - `meeting`

### 3.2 Create Template Project

1. Create a project named **"[TEMPLATE]"**
2. Set default settings:
   - Billable: Yes
   - Color: Grey
3. This will be cloned for each new client

### 3.3 Connect Toggl to Zapier

1. In Zapier, add Toggl as a connected account
2. Use API token from **Profile Settings** → **API Token**
3. Test the connection

---

## Step 4: Stripe Configuration

### 4.1 Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy your **Secret Key** (starts with `sk_`)
3. For testing, use test mode keys

### 4.2 Set Up Webhooks (Alternative Method)

If not using Zapier's native trigger:

1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://hooks.zapier.com/hooks/catch/...`
3. Select events: `charge.succeeded`

### 4.3 Connect Stripe to Zapier

1. In Zapier, add Stripe as a connected account
2. Enter your API key
3. Test with a test charge

---

## Step 5: Google Sheets Configuration

### 5.1 Create Master Tracker

1. Create a new Google Sheet: **"Client Master Tracker"**
2. Add headers:

   ```
   Date | Client Name | Email | Plan | Stripe ID | Slack Channel | Trello Board | Toggl Project | Status
   ```

3. Format as table
4. Share with your team (View only)

### 5.2 Connect to Zapier

1. In Zapier, add Google Sheets as account
2. Authorize access to your Drive
3. Test by reading the sheet

---

## Step 6: Create the Zaps

### Zap 1: Slack → Trello Task Pipeline

1. **Trigger**: Slack - New Message in Channel
2. **Filter**: Message contains "confirmed"
3. **Action**: Trello - Create Card
4. **Action**: Slack - Send Channel Message

[Full structure in ZAP_STRUCTURES.md](./ZAP_STRUCTURES.md)

### Zap 2: Trello → Slack Notifications

1. **Trigger**: Trello - Card Moved to List
2. **Filter**: List is "Done" or "In Progress"
3. **Action**: Slack - Send Channel Message

### Zap 3: Stripe → Client Onboarding

1. **Trigger**: Stripe - New Charge
2. **Actions**: Create Slack channel, Trello board, Toggl project
3. **Action**: Log to Google Sheets

### Zap 4-6: Admin Automations

- Daily time reminder
- Weekly status report
- Stuck task alert

---

## Step 7: Testing

### Test Checklist

- [ ] Send test message in Slack → Verify Trello card created
- [ ] Move Trello card → Verify Slack notification
- [ ] Create test Stripe charge → Verify full onboarding
- [ ] Wait for scheduled triggers → Verify reports/reminders

### Test Stripe Payments

Use these test card numbers:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

---

## Step 8: Go Live

1. **Turn on all Zaps** in Zapier
2. **Monitor** the first few runs
3. **Check** Zapier Task History for errors
4. **Celebrate** 🎉

---

## Quick Reference

### Zapier Dashboard

- Monitor runs: [zapier.com/app/history](https://zapier.com/app/history)
- Manage zaps: [zapier.com/app/zaps](https://zapier.com/app/zaps)

### Important Links

| Platform | Admin Link                 |
| -------- | -------------------------- |
| Slack    | workspace.slack.com/admin  |
| Trello   | trello.com/power-ups/admin |
| Toggl    | track.toggl.com/settings   |
| Stripe   | dashboard.stripe.com       |

---

## Support

If you encounter issues:

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review Zapier Task History
3. Contact the automation admin

---

_Last updated: December 2025_
