# Zapier Zap Structures - AgencyFlow Automation Suite

This document contains the detailed structure for each Zapier zap in the automation suite.

---

## Zap 1: Slack → Trello Task Pipeline

### Overview

Automatically creates Trello cards when tasks are confirmed in Slack.

### Trigger

| Step | App       | Event                  | Details                              |
| ---- | --------- | ---------------------- | ------------------------------------ |
| 1    | **Slack** | New Message in Channel | Monitors designated project channels |

### Filter Conditions

```
Message contains: "confirmed" OR "approved" OR "go ahead"
AND
Message does NOT contain: "not confirmed" OR "hold"
```

### Actions

| Step | App           | Event                  | Configuration                                     |
| ---- | ------------- | ---------------------- | ------------------------------------------------- |
| 2    | **Formatter** | Text - Extract Pattern | Extract task title, due date, labels              |
| 3    | **Paths**     | Route based on label   | Different boards for different project types      |
| 4a   | **Trello**    | Create Card            | Name: {extracted_title}, List: "To Do"            |
| 4b   | **Trello**    | Add Label              | Based on keywords (#urgent → Red, #design → Blue) |
| 4c   | **Trello**    | Set Due Date           | If @date mentioned, parse and set                 |
| 5    | **Slack**     | Send Channel Message   | "✅ Card created: [card_link]"                    |

### Zap Diagram

```
┌─────────────────┐
│  New Slack Msg  │
│   (confirmed)   │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Extract Details │
│  title/date/tag │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│     Paths       │
├─────┬─────┬─────┤
│ Dev │Design│Other│
└──┬──┴──┬──┴──┬──┘
   │     │     │
   ▼     ▼     ▼
┌─────────────────┐
│ Create Trello   │
│    Card         │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Add Labels +    │
│   Due Date      │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Slack Confirm   │
│   w/ card link  │
└─────────────────┘
```

---

## Zap 2: Trello → Slack Notifications

### Overview

Notifies Slack when Trello cards change status.

### Trigger

| Step | App        | Event              | Details                     |
| ---- | ---------- | ------------------ | --------------------------- |
| 1    | **Trello** | Card Moved to List | Monitors all project boards |

### Actions

| Step | App        | Event                | Configuration                       |
| ---- | ---------- | -------------------- | ----------------------------------- |
| 2    | **Filter** | Only Continue If     | List name = "In Progress" OR "Done" |
| 3    | **Slack**  | Send Channel Message | Post update with card details       |

### Message Template

```
📋 **Card Update**
• Card: {card_name}
• Moved to: {list_name}
• By: {member_name}
• Link: {card_url}
```

---

## Zap 3: Stripe → Full Client Onboarding

### Overview

Complete automated onboarding when client pays via Stripe.

### Trigger

| Step | App        | Event      | Details            |
| ---- | ---------- | ---------- | ------------------ |
| 1    | **Stripe** | New Charge | status = succeeded |

### Actions (Multi-Step Flow)

| Step | App               | Action            | Configuration                       |
| ---- | ----------------- | ----------------- | ----------------------------------- |
| 2    | **Formatter**     | Text              | Clean client name for channel       |
| 3    | **Slack**         | Create Channel    | Name: `client-{clean_name}`         |
| 4    | **Slack**         | Set Channel Topic | "Project channel for {client_name}" |
| 5    | **Slack**         | Send Message      | Welcome message template            |
| 6    | **Slack**         | Pin Message       | Pin the welcome message             |
| 7    | **Trello**        | Copy Board        | Copy from "CLIENT TEMPLATE" board   |
| 8    | **Trello**        | Update Board Name | "{client_name} - Project Board"     |
| 9    | **Toggl**         | Create Project    | Project: {client_name}              |
| 10   | **Slack**         | Send DM           | Notify team of new client           |
| 11   | **Google Sheets** | Create Row        | Log client in master tracker        |

### Zap Diagram

```
┌─────────────────┐
│ Stripe Payment  │
│    Success      │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│ Format Client   │
│     Name        │
└───────┬─────────┘
        │
        ├──────────────────────────────┐
        ▼                              ▼
┌─────────────────┐           ┌─────────────────┐
│ Create Slack    │           │  Clone Trello   │
│   Channel       │           │   Template      │
└───────┬─────────┘           └───────┬─────────┘
        │                             │
        ▼                             ▼
┌─────────────────┐           ┌─────────────────┐
│ Welcome Message │           │ Rename Board    │
│   + Pin         │           │ to Client Name  │
└───────┬─────────┘           └───────┬─────────┘
        │                             │
        └──────────────┬──────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Create Toggl    │
              │   Project       │
              └───────┬─────────┘
                      │
                      ▼
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌─────────────────┐        ┌─────────────────┐
│ Notify Team     │        │ Log to Sheet    │
│  (Slack DM)     │        │                 │
└─────────────────┘        └─────────────────┘
```

---

## Zap 4: Daily Time Tracking Reminder

### Trigger

| Step | App          | Event        | Details |
| ---- | ------------ | ------------ | ------- |
| 1    | **Schedule** | Every Day at | 5:00 PM |

### Actions

| Step | App        | Action           | Configuration                          |
| ---- | ---------- | ---------------- | -------------------------------------- |
| 2    | **Toggl**  | Get Time Entries | Today's date                           |
| 3    | **Filter** | Only Continue If | Total hours < 1                        |
| 4    | **Slack**  | Send DM          | "Don't forget to log your time today!" |

---

## Zap 5: Weekly Status Report

### Trigger

| Step | App          | Event         | Details           |
| ---- | ------------ | ------------- | ----------------- |
| 1    | **Schedule** | Every Week on | Monday at 9:00 AM |

### Actions

| Step | App           | Action         | Configuration                     |
| ---- | ------------- | -------------- | --------------------------------- |
| 2    | **Trello**    | Get Cards      | All "Done" cards from last 7 days |
| 3    | **Toggl**     | Get Reports    | Hours logged last 7 days          |
| 4    | **Formatter** | Compile Report | Format as Slack message           |
| 5    | **Slack**     | Post Message   | To #team-updates channel          |

### Report Template

```
📊 **Weekly Status Report**
━━━━━━━━━━━━━━━━━━━━━

**Tasks Completed**: {count}
{list of completed cards}

**Hours Logged**: {total_hours}
• Top Projects: {breakdown}

**Upcoming Deadlines**:
{cards with due dates this week}
```

---

## Zap 6: Stuck Task Alert

### Trigger

| Step | App          | Event        | Details  |
| ---- | ------------ | ------------ | -------- |
| 1    | **Schedule** | Every Day at | 10:00 AM |

### Actions

| Step | App        | Action           | Configuration           |
| ---- | ---------- | ---------------- | ----------------------- |
| 2    | **Trello** | Get Cards        | On "In Progress" list   |
| 3    | **Filter** | Only Continue If | Card age > 5 days       |
| 4    | **Slack**  | Send Message     | Alert about stuck tasks |

---

## Slack Slash Commands Reference

### /task

Create a quick task in Trello from Slack.

**Syntax**:

```
/task [description] @[due date] #[label]
```

**Examples**:

```
/task Update homepage design @Friday #urgent
/task Review client proposal @2024-01-15 #design
/task Fix login bug #dev
```

### /status

Get quick status update.

**Syntax**:

```
/status [client-name]
```

---

_This document serves as the technical blueprint for implementation._
