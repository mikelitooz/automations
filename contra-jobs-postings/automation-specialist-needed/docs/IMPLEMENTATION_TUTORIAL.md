# Implementation Tutorial - AgencyFlow Automation Suite

> 🎓 This is a detailed, hands-on guide showing exactly how to build each automation step-by-step in Zapier.

---

## Table of Contents

1. [Part 1: Slack → Trello Task Pipeline](#part-1-slack--trello-task-pipeline)
2. [Part 2: Stripe → Client Onboarding Flow](#part-2-stripe--client-onboarding-flow)
3. [Part 3: Admin Automations](#part-3-admin-automations)

---

# Part 1: Slack → Trello Task Pipeline

This automation creates Trello cards when tasks are confirmed in Slack.

## Step 1.1: Create New Zap

1. Log into [Zapier](https://zapier.com)
2. Click **Create Zap** (orange button, top left)
3. Name your zap: `AgencyFlow - Slack to Trello Tasks`

---

## Step 1.2: Configure the Trigger (Slack)

### Select App & Event

1. Search for **Slack** in the app search
2. Select **New Message Posted to Channel** as the trigger event
3. Click **Continue**

### Connect Account

1. Click **Sign in to Slack**
2. Select your workspace
3. Authorize Zapier

### Configure Trigger

1. **Channel**: Select the channel you want to monitor
   - Example: `#project-requests` or `#client-work`
2. **Trigger for Bot Messages?**: No
3. **Include Messages in Threads?**: Optional (Yes recommended)
4. Click **Continue**

### Test Trigger

1. Post a test message in your selected channel:
   ```
   Task confirmed: Update homepage design @Friday #urgent
   ```
2. Click **Test trigger**
3. Verify the message appears in results
4. Click **Continue**

---

## Step 1.3: Add Filter (Only Confirmed Tasks)

### Add New Step

1. Click **+** to add a new step
2. Search for **Filter by Zapier**
3. Select **Filter** (built into Zapier)

### Configure Filter

Set up the filter rules:

| Field           | Condition       | Value     |
| --------------- | --------------- | --------- |
| Message Text    | (Text) Contains | confirmed |
| OR Message Text | (Text) Contains | approved  |
| OR Message Text | (Text) Contains | go ahead  |

1. Click **+ Add OR** to add each condition
2. Click **Continue**
3. Test with your sample message - should pass filter

---

## Step 1.4: Extract Data with Formatter

### Add New Step

1. Click **+** to add a new step
2. Search for **Formatter by Zapier**
3. Select **Text** as the event

### Action 1: Extract Task Title

1. **Transform**: Extract Pattern
2. **Input**: `{{Message Text}}`
3. **Pattern**: `Task confirmed: (.+?)(?:@|#|$)`
   - This extracts the task description
4. **Continue** and test

### Action 2: Extract Due Date (Add Another Formatter Step)

1. Add another **Formatter** step
2. **Transform**: Extract Pattern
3. **Input**: `{{Message Text}}`
4. **Pattern**: `@(\w+)`
   - This extracts text after @
5. **Continue** and test

### Action 3: Extract Label (Add Another Formatter Step)

1. Add another **Formatter** step
2. **Transform**: Extract Pattern
3. **Input**: `{{Message Text}}`
4. **Pattern**: `#(\w+)`
   - This extracts text after #
5. **Continue** and test

---

## Step 1.5: Create Trello Card

### Add New Step

1. Click **+** to add a new step
2. Search for **Trello**
3. Select **Create Card** as the action

### Connect Account

1. Click **Sign in to Trello**
2. Authorize Zapier

### Configure Action

Fill in the fields:

| Field           | Value                                                  |
| --------------- | ------------------------------------------------------ |
| **Board**       | Select your project board                              |
| **List**        | "📋 To Do" (or your default list)                      |
| **Name**        | `{{Formatter Output from Step 4}}` (extracted title)   |
| **Description** | `Created from Slack by {{User Name}} at {{Timestamp}}` |
| **Position**    | Top                                                    |
| **Due Date**    | `{{Formatter Output from Step 5}}` (extracted date)    |

Click **Continue** and test - a card should be created!

---

## Step 1.6: Add Label to Card (Based on Keyword)

### Add New Step: Paths

1. Click **+** to add a new step
2. Search for **Paths by Zapier**
3. This lets us handle different labels

### Configure Paths

**Path A: Urgent**

- **Name**: Urgent Tasks
- **Rule**: `{{Formatter Output - Label}}` contains `urgent`
- **Action**: Trello - Add Label to Card
  - Card: `{{Card ID from previous step}}`
  - Label: Red/Urgent

**Path B: Design**

- **Name**: Design Tasks
- **Rule**: `{{Formatter Output - Label}}` contains `design`
- **Action**: Trello - Add Label to Card
  - Card: `{{Card ID}}`
  - Label: Purple/Design

**Path C: Development**

- **Name**: Dev Tasks
- **Rule**: `{{Formatter Output - Label}}` contains `dev`
- **Action**: Trello - Add Label to Card
  - Card: `{{Card ID}}`
  - Label: Blue/Development

---

## Step 1.7: Send Confirmation to Slack

### Add Final Step

1. Click **+** to add a new step
2. Search for **Slack**
3. Select **Send Channel Message**

### Configure Action

| Field            | Value                   |
| ---------------- | ----------------------- |
| **Channel**      | Same channel as trigger |
| **Message Text** | See template below      |
| **Bot Name**     | AgencyFlow Bot          |
| **Bot Icon**     | `:white_check_mark:`    |

**Message Template**:

```
✅ *Card Created!*

• *Task*: {{Card Name}}
• *Board*: {{Board Name}}
• *Due*: {{Due Date}}
• *Link*: {{Card URL}}

Created by <@{{User ID}}>
```

---

## Step 1.8: Turn On Zap

1. Click **Publish** in the top right
2. Toggle the zap **ON**
3. Test by posting in your channel:
   ```
   Task confirmed: Create new landing page @Monday #design
   ```

🎉 **Zap 1 Complete!**

---

# Part 2: Stripe → Client Onboarding Flow

This automation handles the complete client onboarding when payment is received.

## Step 2.1: Create New Zap

1. Click **Create Zap**
2. Name it: `AgencyFlow - Client Onboarding`

---

## Step 2.2: Configure Stripe Trigger

### Select App & Event

1. Search for **Stripe**
2. Select **New Charge** as trigger
3. Connect your Stripe account (use API key)

### Configure Trigger

1. Leave default settings
2. Click **Continue**
3. **Test**: If no recent charges, create a test charge:
   - Use Stripe CLI or Dashboard test mode
   - Card: `4242 4242 4242 4242`

---

## Step 2.3: Format Client Name

### Add Formatter Step

1. Add **Formatter by Zapier**
2. **Event**: Text
3. **Transform**: Replace
4. **Input**: `{{Customer Name}}`
5. **Find**: ` ` (space)
6. **Replace**: `-` (hyphen)

This converts "John Smith" → "john-smith" for the channel name.

### Add Another Formatter

1. **Transform**: Lowercase
2. **Input**: Previous step output

---

## Step 2.4: Create Slack Channel

### Add Slack Step

1. Add **Slack** → **Create Channel**
2. **Channel Name**: `client-{{formatted_name}}`
3. **Is Private**: Yes (recommended)

### Set Channel Topic (Add Another Slack Step)

1. Add **Slack** → **Set Channel Topic**
2. **Channel**: `{{Channel ID from previous step}}`
3. **Topic**: `Project channel for {{Customer Name}} | Plan: {{Product Name}}`

---

## Step 2.5: Post Welcome Message

### Add Slack Step

1. Add **Slack** → **Send Channel Message**
2. **Channel**: `{{New Channel ID}}`
3. **Message**:

```
:wave: *Welcome to your project channel, {{Customer Name}}!*

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is your dedicated space for project communication.

*Quick Links:*
• :clipboard: Trello Board: (link will be posted shortly)
• :calendar: Schedule a kickoff call: [Your Calendly Link]
• :book: Client Resources: [Your Resource Link]

*What's Next:*
1. We're setting up your project board
2. You'll receive a kickoff email within 24 hours
3. Reply here anytime with questions!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Looking forward to working together! :rocket:
```

### Pin the Message

1. Add **Slack** → **Add Pin**
2. **Channel**: `{{Channel ID}}`
3. **Timestamp**: `{{Message Timestamp from previous step}}`

---

## Step 2.6: Clone Trello Board

### Add Trello Step

1. Add **Trello** → **Copy Board**
2. **Board to Copy**: "CLIENT TEMPLATE"
3. **New Board Name**: `{{Customer Name}} - Project Board`

### Update List Names (Optional Extra Step)

1. For each default list, you can update with client-specific info
2. Or leave as template defaults

---

## Step 2.7: Create Toggl Project

### Add Toggl Step

1. Add **Toggl** → **Create Project**
2. Connect your Toggl account (via API token)
3. **Workspace**: Select your workspace
4. **Project Name**: `{{Customer Name}}`
5. **Is Private**: No
6. **Is Billable**: Yes
7. **Color**: Choose a default

---

## Step 2.8: Post Trello Link to Slack

### Add Slack Step

1. Add **Slack** → **Send Channel Message**
2. **Channel**: `{{Client Channel ID}}`
3. **Message**:

```
:clipboard: *Your project board is ready!*

View it here: {{Trello Board URL}}

Your Toggl project has also been set up for time tracking.
```

---

## Step 2.9: Notify Internal Team

### Add Slack Step

1. Add **Slack** → **Send Channel Message**
2. **Channel**: `#team-updates` (or internal channel)
3. **Message**:

```
:tada: *New Client Onboarded!*

• *Client*: {{Customer Name}}
• *Email*: {{Customer Email}}
• *Plan*: {{Product Name}}
• *Amount*: ${{Amount}} {{Currency}}

*Resources Created:*
• Slack: #client-{{formatted_name}}
• Trello: {{Board URL}}
• Toggl: Project created

:point_right: Kickoff needed within 24 hours
```

---

## Step 2.10: Log to Google Sheets

### Add Google Sheets Step

1. Add **Google Sheets** → **Create Spreadsheet Row**
2. **Spreadsheet**: "Client Master Tracker"
3. **Worksheet**: Sheet1
4. **Columns**:

| Column        | Value                                           |
| ------------- | ----------------------------------------------- |
| Date          | `{{Current Date}}` (use Formatter to get today) |
| Client Name   | `{{Customer Name}}`                             |
| Email         | `{{Customer Email}}`                            |
| Plan          | `{{Product Name}}`                              |
| Stripe ID     | `{{Charge ID}}`                                 |
| Slack Channel | `client-{{formatted_name}}`                     |
| Trello Board  | `{{Board URL}}`                                 |
| Toggl Project | `{{Project Name}}`                              |
| Status        | Active                                          |

---

## Step 2.11: Turn On and Test

1. Click **Publish**
2. Toggle **ON**
3. Create a test payment in Stripe (use test mode)
4. Verify:
   - [ ] Slack channel created
   - [ ] Welcome message posted & pinned
   - [ ] Trello board cloned
   - [ ] Toggl project created
   - [ ] Team notified
   - [ ] Sheet updated

🎉 **Zap 2 Complete!**

---

# Part 3: Admin Automations

These are supporting automations for daily operations.

## Zap 3.1: Daily Time Tracking Reminder

### Create New Zap

Name: `AgencyFlow - Time Reminder`

### Configure Steps

| Step | App      | Event               | Configuration                  |
| ---- | -------- | ------------------- | ------------------------------ |
| 1    | Schedule | Every Day           | 5:00 PM, your timezone         |
| 2    | Toggl    | Get Time Entries    | Today's date range             |
| 3    | Filter   | Only Continue If    | Total Duration < 3600 (1 hour) |
| 4    | Slack    | Send Direct Message | To yourself or team            |

**Reminder Message**:

```
:clock5: *Time Tracking Reminder*

It looks like you haven't logged much time today!

:point_right: Log your time: https://track.toggl.com

Don't forget to track:
• Client meetings
• Project work
• Admin tasks
```

---

## Zap 3.2: Weekly Status Report

### Create New Zap

Name: `AgencyFlow - Weekly Report`

### Configure Steps

| Step | App       | Event         | Configuration                     |
| ---- | --------- | ------------- | --------------------------------- |
| 1    | Schedule  | Every Week on | Monday, 9:00 AM                   |
| 2    | Trello    | Find Cards    | Filter: moved to Done last 7 days |
| 3    | Toggl     | Get Reports   | Last 7 days summary               |
| 4    | Formatter | Text          | Compile report                    |
| 5    | Slack     | Send Message  | To #team-updates                  |

**Report Template**:

```
:chart_with_upwards_trend: *Weekly Status Report*
_{Date Range}_

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

*Tasks Completed:* {{Count}}
{{List of completed card names}}

*Hours Logged:* {{Total Hours}}
• Billable: {{Billable Hours}}
• Internal: {{Internal Hours}}

*Top Projects:*
{{Project breakdown}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

:calendar: Upcoming deadlines this week:
{{Cards with due dates in next 7 days}}
```

---

## Zap 3.3: Stuck Task Alert

### Create New Zap

Name: `AgencyFlow - Stuck Task Alert`

### Configure Steps

| Step | App      | Event            | Configuration                   |
| ---- | -------- | ---------------- | ------------------------------- |
| 1    | Schedule | Every Day        | 10:00 AM                        |
| 2    | Trello   | Find Cards       | List = "In Progress"            |
| 3    | Filter   | Only Continue If | Card Last Activity > 5 days ago |
| 4    | Slack    | Send Message     | To #automation-alerts           |

**Alert Message**:

```
:warning: *Stuck Task Alert*

The following cards have been in "In Progress" for over 5 days:

{{List of stuck cards with links}}

:point_right: Please review and update or move these cards.
```

---

## Zap 3.4: Trello → Slack Notifications

### Create New Zap

Name: `AgencyFlow - Trello Updates`

### Configure Steps

| Step | App    | Event              | Configuration                        |
| ---- | ------ | ------------------ | ------------------------------------ |
| 1    | Trello | Card Moved to List | Any board                            |
| 2    | Filter | Only Continue If   | List name is "Done" or "In Progress" |
| 3    | Slack  | Send Message       | To relevant channel                  |

**Notification Template**:

```
:trello: *Trello Update*

• *Card*: {{Card Name}}
• *Moved to*: {{List Name}}
• *Board*: {{Board Name}}
• *By*: {{Member Name}}

:link: {{Card URL}}
```

---

# Final Checklist

## Verify All Zaps Running

| Zap                          | Status | Tested |
| ---------------------------- | ------ | ------ |
| Slack → Trello Tasks         | [ ] ON | [ ] ✓  |
| Stripe → Onboarding          | [ ] ON | [ ] ✓  |
| Daily Time Reminder          | [ ] ON | [ ] ✓  |
| Weekly Report                | [ ] ON | [ ] ✓  |
| Stuck Task Alert             | [ ] ON | [ ] ✓  |
| Trello → Slack Notifications | [ ] ON | [ ] ✓  |

## Monitor for First Week

1. Check Zapier Task History daily
2. Review #automation-alerts for errors
3. Gather feedback from team
4. Fine-tune filters and messages

---

# Bonus: Error Handling

For critical zaps (especially Client Onboarding), add error handling:

1. At the end of the zap, add **Paths**
2. Path A: If ALL steps succeeded → Log success
3. Path B: If ANY step failed → Send error alert

**Error Alert**:

```
:rotating_light: *Automation Error*

Zap: {{Zap Name}}
Error Step: {{Failed Step}}
Error: {{Error Message}}
Data: {{Trigger Data}}

Manual intervention required.
```

---

_You've successfully built the complete AgencyFlow Automation Suite!_ 🎉

For maintenance and troubleshooting, see:

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [MAINTENANCE.md](./MAINTENANCE.md)
