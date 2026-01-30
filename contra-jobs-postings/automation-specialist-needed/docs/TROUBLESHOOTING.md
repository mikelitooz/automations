# Troubleshooting Guide - AgencyFlow Automation Suite

Common issues and their solutions.

---

## Quick Diagnosis

| Symptom               | Likely Cause          | Jump To                           |
| --------------------- | --------------------- | --------------------------------- |
| Zap not triggering    | Trigger misconfigured | [Trigger Issues](#trigger-issues) |
| Card not created      | Trello permissions    | [Trello Issues](#trello-issues)   |
| Channel not created   | Slack scope missing   | [Slack Issues](#slack-issues)     |
| Onboarding incomplete | Multi-step failure    | [Stripe Issues](#stripe-issues)   |
| Delayed notifications | Zapier plan limits    | [Zapier Issues](#zapier-issues)   |

---

## Trigger Issues

### Zap Not Running on New Messages

**Symptoms**: Slack messages not triggering Trello card creation

**Solutions**:

1. **Check Zap is ON** - Verify in Zapier dashboard
2. **Verify channel** - Ensure Zap monitors the correct channel
3. **Check filter** - Message may not match filter criteria
4. **Test manually** - Use "Test trigger" in Zapier

**Debug Steps**:

```
1. Go to Zapier → Your Zap → Trigger step
2. Click "Test trigger"
3. Check if recent messages appear
4. If no data, re-authenticate Slack
```

---

### Stripe Webhook Not Firing

**Symptoms**: Payments don't trigger onboarding

**Solutions**:

1. **Check webhook status** in Stripe dashboard
2. **Verify endpoint URL** is correct Zapier catch hook
3. **Check test/live mode** - Ensure you're testing in correct environment

**Debug Steps**:

```
1. Stripe Dashboard → Developers → Webhooks
2. Click your endpoint
3. Check "Recent attempts" for failures
4. Look for 200 OK responses
```

---

## Trello Issues

### Card Not Being Created

**Symptoms**: Zap runs but no Trello card appears

**Causes & Fixes**:
| Cause | Fix |
|-------|-----|
| Wrong board selected | Update Trello action to correct board |
| No access to board | Invite Zapier user to board |
| Board is closed | Reopen the board |
| List doesn't exist | Create the target list |

**Debug Steps**:

```
1. Check Zapier task history
2. Look for Trello action step
3. Expand to see error message
4. Common: "Board not found" or "Unauthorized"
```

### Cards Going to Wrong List

**Symptoms**: Cards appear but in wrong location

**Fix**:

1. Open Zap in Zapier
2. Edit Trello "Create Card" action
3. Re-select the correct list
4. Save and test

---

## Slack Issues

### Channel Not Being Created

**Symptoms**: Stripe payment processed but no Slack channel

**Causes & Fixes**:
| Cause | Fix |
|-------|-----|
| Missing scopes | Re-authorize with required permissions |
| Channel name invalid | Ensure name is lowercase, no spaces |
| Channel already exists | Add unique identifier (timestamp/ID) |

**Required Slack Scopes**:

```
channels:manage
channels:write
chat:write
users:read
```

**Fix Channel Name Issues**:

```javascript
// Channel names must be:
// - Lowercase only
// - No spaces (use hyphens)
// - Max 80 characters
// - No special chars except hyphen/underscore

// Bad:  "Client - ABC Company!"
// Good: "client-abc-company"
```

### Welcome Message Not Posting

**Symptoms**: Channel created but empty

**Causes**:

1. Bot not in channel → Invite bot to channel
2. Wrong channel ID → Check channel mapping
3. Message too long → Slack has 40,000 char limit

---

## Toggl Issues

### Project Not Being Created

**Symptoms**: Toggl project missing after onboarding

**Fixes**:

1. **Check API token** - Regenerate in Toggl settings
2. **Verify workspace** - Ensure correct workspace selected
3. **Check name uniqueness** - Project names must be unique

**Debug**:

```
1. Zapier → Task History → Find failed task
2. Expand Toggl action
3. Look for error: "Project already exists" or "Invalid token"
```

---

## Zapier Issues

### Delayed Triggers

**Symptoms**: Automations run late (>15 minutes)

**Cause**: Zapier polling interval based on plan

| Plan         | Polling Interval |
| ------------ | ---------------- |
| Free         | 15 minutes       |
| Starter      | 15 minutes       |
| Professional | 2 minutes        |
| Team         | 1 minute         |

**Solutions**:

1. Upgrade plan for faster polling
2. Use webhooks instead of polling triggers
3. Accept delay for non-critical automations

### Task Limit Reached

**Symptoms**: Zaps stop running mid-month

**Fix**:

1. Check usage: Zapier → Settings → Usage
2. Upgrade plan if needed
3. Optimize zaps to reduce task count

**Optimization Tips**:

- Combine multiple actions into one zap
- Use filters early to skip unnecessary runs
- Archive unused zaps

---

## Multi-Step Failures

### Partial Onboarding

**Symptoms**: Some steps complete, others fail

**Debug Process**:

1. Go to Zapier → Task History
2. Find the failed run
3. Expand each step to find failure point
4. Note error message

**Common Patterns**:

```
Step 1-3 ✅
Step 4 ❌ "Rate limit exceeded"
Step 5-7 ⏭️ Skipped

Fix: Add delay step before step 4
```

### Rollback Strategy

If onboarding fails midway:

1. **Identify created resources**

   - Check Slack for new channel
   - Check Trello for new board
   - Check Toggl for new project

2. **Manual cleanup**

   - Archive/delete partial resources
   - Or complete setup manually

3. **Re-trigger**
   - Use "Replay" in Zapier to retry

---

## Error Messages Reference

| Error              | Meaning                | Solution                |
| ------------------ | ---------------------- | ----------------------- |
| `401 Unauthorized` | Bad API key/token      | Re-authenticate account |
| `403 Forbidden`    | Missing permissions    | Check scopes/access     |
| `404 Not Found`    | Resource deleted/moved | Update zap with new IDs |
| `429 Rate Limited` | Too many requests      | Add delay step          |
| `500 Server Error` | Service down           | Wait and retry          |

---

## Getting Help

### Self-Service

1. Check Zapier status: [status.zapier.com](https://status.zapier.com)
2. Search Zapier Community
3. Review platform-specific docs

### Escalation

1. Capture error details from Task History
2. Note timestamp and affected client
3. Contact automation admin with details

---

## Preventive Measures

### Daily

- [ ] Check #automation-alerts channel

### Weekly

- [ ] Review Zapier Task History
- [ ] Check usage vs. limit

### Monthly

- [ ] Test all critical paths
- [ ] Update any changed credentials
- [ ] Archive unused zaps

---

_If your issue isn't covered here, document it and add to this guide!_
