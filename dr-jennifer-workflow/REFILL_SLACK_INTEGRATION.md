# Slack Integration Guide for Refill Approvals

## 🎯 Overview

This guide explains how to set up **Slack integration** for the Prescription Refill automation, enabling:

1. **Doctor approval workflow** - One-click approve/deny buttons for refills needing review
2. **Urgent escalations** - Critical alerts for controlled substances and safety concerns
3. **Audit trail** - Threaded conversations for complex cases

**Benefits**:
- Doctor reviews refills on phone/desktop (no need to log into n8n or EMR)
- **2-4 hour response time** vs 24+ hours with phone tag
- One-click approve → instant pharmacy transmission
- Searchable history of all approval decisions

---

## 📋 Prerequisites

Before starting:
- [ ] Slack workspace for your medical practice
- [ ] Slack admin access (to create apps)
- [ ] n8n workflows imported (from [REFILL_SETUP_GUIDE.md](REFILL_SETUP_GUIDE.md))
- [ ] Doctor and key staff added to Slack workspace

---

## PART 1: Create Slack App (15 minutes)

### Step 1.1: Create New App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App**
3. Select **From scratch**
4. **App Name**: `Dr. Jennifer Refill Assistant`
5. **Workspace**: Select your practice's Slack workspace
6. Click **Create App**

### Step 1.2: Configure App Info

1. Navigate to **Basic Information**
2. Scroll to **Display Information**
3. Update:
   - **App name**: Dr. Jennifer Refill Assistant
   - **Short description**: Automated prescription refill approval system
   - **App icon**: Upload a medical/prescription icon (optional)
   - **Background color**: Choose practice branding color
4. **Save Changes**

---

## PART 2: Configure Permissions (10 minutes)

### Step 2.1: Add OAuth Scopes

1. Navigate to **OAuth & Permissions** (left sidebar)
2. Scroll to **Scopes** → **Bot Token Scopes**
3. Click **Add an OAuth Scope**
4. Add these scopes:

| Scope | Purpose | Required? |
|-------|---------|-----------|
| `chat:write` | Send messages to channels | ✅ Yes |
| `chat:write.public` | Send messages to public channels without joining | ✅ Yes |
| `channels:read` | View channel info | ⚠️ Optional (useful for debugging) |
| `users:read` | Get user info for @mentions | ⚠️ Optional |

### Step 2.2: Install App to Workspace

1. Scroll up to **OAuth Tokens for Your Workspace**
2. Click **Install to Workspace**
3. Review permissions
4. Click **Allow**
5. **Copy the Bot User OAuth Token** (starts with `xoxb-...`)
6. **Save this token** - you'll need it for n8n credentials

**Important**: Keep this token secret! It has access to post messages to your Slack workspace.

---

## PART 3: Create Slack Channels (5 minutes)

### Step 3.1: Create Approval Channel

1. In Slack, create a new channel:
   - **Channel name**: `refill-approvals`
   - **Description**: Prescription refills needing doctor approval (NEEDS-APPROVAL tier)
   - **Privacy**: **Private** (HIPAA - don't make public)
2. Invite key members:
   - Dr. Jennifer (required)
   - Practice manager (optional)
   - Senior staff (optional)

### Step 3.2: Create Escalation Channel

1. Create another channel:
   - **Channel name**: `urgent-refills`
   - **Description**: URGENT: Controlled substances and safety concerns requiring immediate action (ESCALATE tier)
   - **Privacy**: **Private**
2. Invite:
   - Dr. Jennifer (required)
   - Staff responsible for urgent calls (required)
   - Practice manager (required)

### Step 3.3: Invite Bot to Channels

In each channel, type:
```
/invite @Dr. Jennifer Refill Assistant
```

The bot must be a member to post messages.

---

## PART 4: Configure n8n Integration (10 minutes)

### Step 4.1: Add Slack Credential to n8n

1. In n8n, navigate to **Credentials** → **+ Add Credential**
2. Select **Slack OAuth2 API**
3. In the **OAuth Access Token** field, paste the Bot User OAuth Token (from Part 2.2)
4. Click **Save**

### Step 4.2: Test Slack Connection

1. Open **refill-processor** workflow in n8n
2. Find the **Send Slack Approval Request** node
3. Click **Test step** (lightning bolt icon)
4. If successful, you should see a message posted to `#refill-approvals`

If error occurs:
- Verify token is correct (starts with `xoxb-`)
- Ensure bot is invited to channel
- Check channel name spelling in environment variable

---

## PART 5: Basic Message Format (No Interactive Buttons)

The current workflow sends **static messages** (text-only, no buttons).

### Example: Needs Approval Message

```
⚠️ Refill Request: Doctor Approval Needed

Patient: John Smith (#12345)
Last Visit: 7 months ago

Request: "Can I get a refill on my metformin?"
Medication: Metformin 500mg (currently taking)
Refills Left: 0 (needs new prescription)
Last Filled: 30 days ago

AI Analysis: No refills remaining. Patient needs new prescription.
Recommended Action: Approve new 90-day supply with 3 refills OR
schedule annual checkup first.
```

**Doctor response** (manual):
1. Review the request in Slack
2. Go to n8n (or EMR) to approve/deny
3. Process refill manually

**Limitation**: No one-click buttons yet (see Part 6 for interactive messages).

---

### Example: Escalation Message

```
🚨 CRITICAL: Refill Request Escalation

Patient: Sarah Johnson
Phone: +15555551234

Request: "I need more oxycodone"
Medication: Oxycodone 5mg

Escalation Reasons:
• controlled-substance
• schedule-ii
• opioid

AI Analysis: DEA Schedule II opioid requires manual verification.
Must check PDMP before dispensing.

Recommended Action: Call patient immediately to verify request,
check PDMP for concerning patterns, verify surgical recovery progress.
```

**Staff action**:
1. See critical alert in `#urgent-refills`
2. Call patient within 15 minutes
3. Verify identity, check PDMP
4. Process manually if appropriate
5. Reply in Slack thread with notes

---

## PART 6: Interactive Messages (Advanced - Optional)

**Interactive messages** add **clickable buttons** to Slack messages, enabling doctor to approve/deny with one click.

**Example**:
```
[Message content here]

[✅ Approve Refill]  [❌ Deny Refill]  [📞 Call Patient]
```

**Benefit**: Doctor clicks "Approve" → n8n receives webhook → pharmacy transmission happens automatically.

**Complexity**: Requires building a separate webhook workflow to handle button clicks.

---

### Step 6.1: Enable Interactivity

1. In Slack App settings, navigate to **Interactivity & Shortcuts**
2. Toggle **Interactivity**: **ON**
3. **Request URL**: This is where Slack sends button click events

**Webhook URL format**:
```
https://[your-n8n-instance].app.n8n.cloud/webhook/slack-refill-approval
```

**How to get this URL**:
- You'll create a new webhook workflow in n8n (see Step 6.2)
- The webhook URL is displayed in the Webhook node

4. **Save Changes**

---

### Step 6.2: Create Slack Webhook Workflow in n8n

**Purpose**: Handle button clicks from Slack (approve/deny actions).

**Create new workflow**:

1. In n8n, create new workflow: `Slack Refill Approval Handler`
2. Add **Webhook** node:
   - **HTTP Method**: POST
   - **Path**: `slack-refill-approval`
   - **Response**: Respond Immediately
3. Copy the webhook URL and add to Slack app (Step 6.1)

**Add Code node** to parse Slack payload:

```javascript
// Parse Slack interactive message payload
const payload = JSON.parse($input.first().json.body.payload);

const action = payload.actions[0].action_id; // 'approve_refill', 'deny_refill', or 'call_patient'
const buttonValue = payload.actions[0].value; // e.g., 'approve_PT-12345_Lisinopril'
const userId = payload.user.id; // Who clicked the button
const channelId = payload.channel.id;
const messageTs = payload.message.ts; // Timestamp of original message

// Parse button value to extract patient ID and medication
const parts = buttonValue.split('_');
const actionType = parts[0]; // 'approve', 'deny', 'call'
const patientId = parts[1]; // 'PT-12345'
const medication = parts.slice(2).join(' '); // 'Lisinopril'

return {
  json: {
    action: action,
    actionType: actionType,
    patientId: patientId,
    medication: medication,
    userId: userId,
    channelId: channelId,
    messageTs: messageTs
  }
};
```

**Add Switch node** to route by action:

- Route 1: `action === 'approve_refill'` → Send to pharmacy + update Slack
- Route 2: `action === 'deny_refill'` → Send denial SMS to patient + update Slack
- Route 3: `action === 'call_patient'` → Log action + update Slack

**For approve action**, add HTTP Request node to trigger pharmacy transmission:

```javascript
// Lookup patient and medication details from Google Sheets
// Prepare pharmacy request
// Send to pharmacy API (same as refill-processor workflow)
// Update Google Sheets: Processed_By = "Dr. Jennifer (Slack)"
// Send confirmation SMS to patient
```

**Update Slack message** to show button was clicked:

```javascript
// Replace interactive message with static confirmation
const slackUpdate = {
  channel: $json.channelId,
  ts: $json.messageTs, // Update original message
  text: `✅ APPROVED by Dr. Jennifer`,
  blocks: [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `✅ *APPROVED* by <@${$json.userId}> at ${new Date().toLocaleTimeString()}\n\nPrescription sent to pharmacy. Patient notified.`
      }
    }
  ]
};

return { json: slackUpdate };
```

Send via **Slack** node (Update Message operation).

---

### Step 6.3: Update refill-processor.json to Include Buttons

Modify the **Prepare Slack Approval** node in `refill-processor.json`:

Add `actions` block to Slack message:

```javascript
const slackMessage = {
  channel: process.env.SLACK_DOCTOR_CHANNEL || '#refill-approvals',
  text: `⚠️ Refill Request: Doctor Approval Needed`,
  blocks: [
    // ... existing header and patient info blocks ...

    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '✅ Approve Refill'
          },
          style: 'primary',
          value: `approve_${patient.id}_${medication.name.replace(/\s/g, '_')}`,
          action_id: 'approve_refill'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '❌ Deny Refill'
          },
          style: 'danger',
          value: `deny_${patient.id}_${medication.name.replace(/\s/g, '_')}`,
          action_id: 'deny_refill'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📞 Call Patient'
          },
          value: `call_${patient.id}`,
          action_id: 'call_patient'
        }
      ]
    }
  ]
};
```

**Now when doctor clicks "Approve"**:
1. Slack sends webhook to n8n
2. n8n workflow sends prescription to pharmacy
3. Patient receives SMS confirmation
4. Google Sheets updated
5. Slack message updated to show "✅ APPROVED"

**Total time**: <30 seconds from click to patient notification.

---

## PART 7: Testing Slack Integration (15 minutes)

### Test 1: Basic Message (No Buttons)

1. Trigger a NEEDS-APPROVAL refill request (zero refills remaining)
2. Check `#refill-approvals` channel in Slack
3. Verify message contains:
   - Patient name and ID
   - Medication details
   - AI reasoning
   - Recommended action

**If message doesn't appear**:
- Check n8n execution log for errors
- Verify Slack credential is correct
- Ensure bot is invited to channel

---

### Test 2: Escalation Alert

1. Trigger an ESCALATE refill request (controlled substance)
2. Check `#urgent-refills` channel in Slack
3. Verify message contains:
   - 🚨 CRITICAL header
   - Patient info with phone number
   - Escalation flags
   - Immediate action required

---

### Test 3: Interactive Buttons (If Implemented)

1. Send NEEDS-APPROVAL refill request
2. In Slack, click **✅ Approve Refill** button
3. Verify:
   - Slack message updates to "✅ APPROVED by Dr. Jennifer"
   - Patient receives SMS confirmation
   - Google Sheets updated with Processed_By = "Dr. Jennifer (Slack)"
   - Pharmacy transmission logged

**If button doesn't work**:
- Check Slack App **Interactivity** is enabled
- Verify webhook URL in Slack app settings
- Check n8n webhook workflow is ACTIVE
- Review n8n execution log for webhook errors

---

## PART 8: Slack Message Templates

### Template 1: Routine Approval Needed

```javascript
{
  channel: '#refill-approvals',
  text: '⚠️ Refill Request: Doctor Approval Needed',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '⚠️ Refill Request: Doctor Approval Needed'
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Patient:*\n${patientName}` },
        { type: 'mrkdwn', text: `*Patient ID:*\n${patientId}` },
        { type: 'mrkdwn', text: `*Last Visit:*\n${lastVisitDate}` },
        { type: 'mrkdwn', text: `*Request:*\n"${requestText}"` }
      ]
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Medication:*\n${medicationName}` },
        { type: 'mrkdwn', text: `*Dosage:*\n${dosage}` },
        { type: 'mrkdwn', text: `*Refills Left:*\n${refillsRemaining}` },
        { type: 'mrkdwn', text: `*Last Filled:*\n${lastFilledDate}` }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*AI Analysis:*\n${aiReasoning}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Recommended Action:*\n${recommendedAction}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Received: ${timestamp} | Confidence: ${confidence * 100}%`
        }
      ]
    }
  ]
}
```

---

### Template 2: Critical Escalation

```javascript
{
  channel: '#urgent-refills',
  text: '🚨 CRITICAL: Refill Request Escalation',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '🚨 CRITICAL: Refill Request Escalation'
      }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Patient:*\n${patientName}` },
        { type: 'mrkdwn', text: `*Phone:*\n${patientPhone}` },
        { type: 'mrkdwn', text: `*Request:*\n"${requestText}"` },
        { type: 'mrkdwn', text: `*Medication:*\n${medicationName}` }
      ]
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Escalation Reasons:*\n${flags.map(f => `• ${f}`).join('\n')}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*AI Analysis:*\n${aiReasoning}`
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Recommended Action:*\n${recommendedAction}`
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `⚠️ *URGENT: Staff must call patient within 15 minutes*`
        }
      ]
    }
  ]
}
```

---

## PART 9: HIPAA Compliance for Slack

### Required Safeguards

✅ **Business Associate Agreement (BAA)**:
- Slack offers BAA on **Enterprise Grid** plan only ($150+/user/month)
- **Standard/Pro plans DO NOT include BAA** ⚠️
- Alternative: Self-host Mattermost (open-source Slack alternative with HIPAA support)

✅ **Channel Privacy**:
- All refill channels must be **Private** (not public or shared externally)
- Only authorized staff as members
- No guests or external collaborators

✅ **Data Retention**:
- Configure message retention: 7 years (HIPAA requirement)
- Slack Enterprise Grid: Settings → Data Retention → Custom retention
- Export messages monthly for offline backup

✅ **Access Controls**:
- Enable 2FA for all Slack users
- Use SSO (SAML) if available
- Disable file sharing if not needed (reduces data leak risk)
- Audit user access quarterly

✅ **De-Identification** (Optional but Recommended):
- Use Patient ID instead of full name in Slack messages
- Example: "Patient #12345" instead of "John Smith"
- Reduces PHI exposure if Slack is compromised

---

### HIPAA Checklist for Slack Integration

Before going live with PHI in Slack:

- [ ] Slack **Enterprise Grid** plan purchased (for BAA)
- [ ] BAA signed with Slack
- [ ] All channels are **Private**
- [ ] Only authorized staff invited to channels
- [ ] 2FA enabled for all users
- [ ] Message retention set to 7 years
- [ ] Monthly export scheduled
- [ ] Audit log enabled (Enterprise feature)
- [ ] Staff trained on Slack security policies

**If you cannot meet these requirements**, consider:
1. **Alternative 1**: Use patient ID only (no names) in Slack messages
2. **Alternative 2**: Use email approvals instead of Slack
3. **Alternative 3**: Self-host Mattermost with HIPAA compliance

---

## PART 10: Troubleshooting

### Issue: Bot can't post to channel

**Error**: `not_in_channel`

**Solution**:
1. In Slack channel, type: `/invite @Dr. Jennifer Refill Assistant`
2. Verify bot appears in channel members list

---

### Issue: Interactive buttons don't work

**Error**: Clicking button does nothing

**Solution**:
1. Check Slack App → **Interactivity & Shortcuts** is enabled
2. Verify **Request URL** matches n8n webhook URL
3. Ensure n8n webhook workflow is **ACTIVE**
4. Check n8n execution log - should see webhook triggered when button clicked

---

### Issue: Slack messages contain [object Object]

**Error**: Message shows `[object Object]` instead of patient name

**Solution**:
- You're passing an object where a string is expected
- Fix: Use `patientContext.patient.name` instead of `patientContext.patient`
- Check all field interpolations in Slack message template

---

### Issue: Multiple approval messages for same refill

**Error**: Same refill request sent to Slack 3 times

**Solution**:
- Workflow is executing multiple times
- Check n8n executions - look for duplicate triggers
- Verify Twilio webhook is configured only once
- Check for duplicate workflows running

---

## 📊 Usage Metrics

Track Slack integration effectiveness:

**Response Time**:
- Average time from Slack message to doctor approval
- Target: <4 hours during business hours

**Approval Rate**:
- % of NEEDS-APPROVAL requests that get approved (vs denied)
- Typical: 80-90% approved

**Escalation Follow-Up**:
- % of ESCALATE cases where staff called patient within 15 minutes
- Target: 100%

**How to measure**:
- Export Refill_Requests Google Sheet
- Filter by Decision = "NEEDS-APPROVAL"
- Calculate time difference: Processed_Date - Request_Date

---

## 📱 Mobile App Setup (Optional)

Enable doctor to approve refills from phone:

1. Download **Slack mobile app** (iOS/Android)
2. Sign into your practice workspace
3. Enable push notifications for:
   - `#refill-approvals` (mentions and all messages)
   - `#urgent-refills` (all messages)
4. Test: Send approval request, verify mobile notification received

**Doctor workflow on mobile**:
1. Receive push notification: "New refill approval needed"
2. Open Slack app
3. Review patient details
4. Tap **✅ Approve Refill** button
5. Done - patient receives confirmation in <30 seconds

---

## 🎓 Staff Training

### For Doctors (30 minutes)

**What they need to know**:
1. Install Slack mobile app and enable notifications
2. Approval requests appear in `#refill-approvals` (~6/day)
3. Escalations appear in `#urgent-refills` (~2/day)
4. Click buttons to approve/deny (if interactive messages enabled)
5. Reply in thread for complex cases
6. Review AI reasoning before approving

**Training exercise**:
- Send test approval request
- Doctor practices clicking Approve button
- Verify patient receives confirmation SMS

---

### For Staff (15 minutes)

**What they need to know**:
1. Monitor `#urgent-refills` for critical escalations
2. Respond within 15 minutes
3. Call patient, verify request, check PDMP
4. Reply in Slack thread with outcome
5. Manually process refill if appropriate

---

## 📚 Related Documentation

- [REFILL_README.md](REFILL_README.md) - Complete automation overview
- [REFILL_SETUP_GUIDE.md](REFILL_SETUP_GUIDE.md) - Full deployment guide
- [REFILL_AI_PROTOCOL.md](REFILL_AI_PROTOCOL.md) - Clinical decision rules

---

**Document Version**: 1.0
**Last Updated**: January 27, 2026
**Setup Time**: 45 minutes (basic) or 2 hours (with interactive buttons)
**Monthly Cost**: $0 (Free/Pro) or $150+/user (Enterprise Grid with BAA)
