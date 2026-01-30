# Maintenance Guide - AgencyFlow Automation Suite

How to maintain and update the automation system over time.

---

## Routine Maintenance

### Daily Checks (2 minutes)

- [ ] Glance at #automation-alerts for error notifications
- [ ] Spot check Task History for any failed runs

### Weekly Review (15 minutes)

- [ ] Review Zapier Task History (look for patterns)
- [ ] Check task usage against plan limit
- [ ] Verify all scheduled zaps ran correctly

### Monthly Audit (30 minutes)

- [ ] Test critical paths end-to-end
- [ ] Review and archive inactive zaps
- [ ] Update credentials if prompted
- [ ] Document any changes made

---

## Making Changes

### Before Any Change

1. **Document current state** - Screenshot or export zap
2. **Understand dependencies** - Check what else uses this zap
3. **Test in isolation** - Use test mode if possible
4. **Have rollback plan** - Know how to revert

### Common Modifications

#### Adding a New Client Board Template

1. Duplicate existing "CLIENT TEMPLATE" board in Trello
2. Modify lists/labels as needed
3. Update Zapier "Copy Board" action
4. Test with test Stripe payment

#### Changing Slack Channel Naming

1. Open Stripe → Onboarding zap
2. Find "Create Channel" action
3. Modify the channel name formula
4. Test with sample data

```
Current: client-{{client_name}}
New:     proj-{{client_name}}-{{year}}
```

#### Adding New Notification

1. Create new zap or add step to existing
2. Configure trigger (what event)
3. Configure action (where to notify)
4. Test thoroughly

---

## Platform-Specific Updates

### When Slack Changes

**Impacts**: Channel creation, messaging, slash commands

**Update Checklist**:

- [ ] Re-authorize Slack in Zapier if prompted
- [ ] Check channel permissions
- [ ] Verify bot is still in required channels
- [ ] Test a simple post action

### When Trello Changes

**Impacts**: Board creation, card management, labels

**Update Checklist**:

- [ ] Verify template board still exists
- [ ] Check list names haven't changed
- [ ] Re-authenticate if API access lost
- [ ] Update any hardcoded board/list IDs

### When Toggl Changes

**Impacts**: Project creation, time tracking

**Update Checklist**:

- [ ] Verify workspace access
- [ ] Check API token validity
- [ ] Update workspace ID if changed

### When Stripe Changes

**Impacts**: Payment triggers, client data

**Update Checklist**:

- [ ] Verify webhook endpoints
- [ ] Check API key validity
- [ ] Update product/price IDs if changed

---

## Scaling the System

### Adding More Clients

The system scales automatically. No changes needed for normal client growth.

**Potential limits**:
| Component | Limit | Solution |
|-----------|-------|----------|
| Zapier tasks | Plan-based | Upgrade plan |
| Trello boards | 10/free | Upgrade or archive old |
| Slack channels | Unlimited | N/A |
| Toggl projects | Unlimited | N/A |

### Adding Team Members

1. **Slack**: Invite to workspace
2. **Trello**: Add to organization
3. **Toggl**: Add to workspace
4. **Zapier**: Add as team member (Team plan)

### Adding New Services/Plans

1. Update Stripe with new product
2. Modify onboarding zap with paths:
   ```
   Path A: Standard Plan → Basic onboarding
   Path B: Premium Plan → Enhanced onboarding
   Path C: Enterprise → VIP onboarding
   ```
3. Create plan-specific templates if needed

---

## Backup & Recovery

### What to Backup

| Item                 | How                | Frequency |
| -------------------- | ------------------ | --------- |
| Zap configurations   | Export from Zapier | Monthly   |
| Trello templates     | Copy board         | On change |
| Client tracker sheet | Google auto-saves  | Automatic |
| This documentation   | Git/file backup    | On change |

### Export Zaps

1. Go to Zapier → Settings → Export
2. Download JSON backup
3. Store in version control or cloud storage

### Recovery Procedure

1. **Don't panic** - Most failures are temporary
2. **Identify scope** - What's affected?
3. **Check status pages** - Is it a platform outage?
4. **Restore from backup** if needed
5. **Document** the incident

---

## Version History

Track all changes to the automation system here.

| Date     | Change        | Made By     |
| -------- | ------------- | ----------- |
| Dec 2025 | Initial setup | [Your Name] |
|          |               |             |
|          |               |             |

### Change Log Template

```
## [Date] - [Brief Description]

### Changed
- What was modified

### Added
- New features/zaps

### Removed
- Deprecated components

### Notes
- Any important context
```

---

## Optimization Tips

### Reduce Task Usage

1. **Combine zaps** - Fewer zaps = fewer tasks
2. **Use filters early** - Skip unnecessary runs
3. **Batch operations** - Use Looping for bulk actions

### Improve Speed

1. **Use webhooks** - Faster than polling
2. **Minimize API calls** - Cache data where possible
3. **Parallel paths** - Run independent actions simultaneously

### Increase Reliability

1. **Add error handling** - Use Zapier's error handling
2. **Set up alerts** - Get notified on failures
3. **Test regularly** - Catch issues early

---

## Handoff Checklist

If transferring ownership of this system:

- [ ] Share this documentation
- [ ] Transfer Zapier ownership
- [ ] Add new admin to all platforms
- [ ] Walk through each zap together
- [ ] Test with new owner present
- [ ] Update emergency contacts
- [ ] Document any tribal knowledge

---

## Emergency Contacts

| Issue               | Contact                                          |
| ------------------- | ------------------------------------------------ |
| Automation failures | [Your contact]                                   |
| Zapier support      | [support.zapier.com](https://support.zapier.com) |
| Billing questions   | [Your billing contact]                           |

---

_Keep this document updated as the system evolves!_
