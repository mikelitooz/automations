/**
 * Webhooks API Router
 * 
 * Endpoints for n8n webhook integration:
 * - Receive incoming webhooks
 * - Forward events to n8n workflows
 * - Handle CRM sync events
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../middleware/logger');

const router = express.Router();

// Webhook event log (in-memory, would use database in production)
const webhookEvents = [];

/**
 * Webhook secret validation middleware
 */
const validateWebhookSecret = (req, res, next) => {
  const secret = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.WEBHOOK_SECRET;

  // Skip validation if no secret is configured
  if (!expectedSecret) {
    return next();
  }

  if (secret !== expectedSecret) {
    logger.warn('Invalid webhook secret', {
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid webhook secret'
    });
  }

  next();
};

/**
 * Receive lead from external source (website, ad platform, etc.)
 * POST /api/webhooks/lead
 */
router.post('/lead', validateWebhookSecret, async (req, res) => {
  try {
    const eventId = uuidv4();
    const payload = req.body;

    logger.info('Lead webhook received', {
      eventId,
      source: payload.source || 'unknown'
    });

    // Log the event
    const event = {
      id: eventId,
      type: 'lead_received',
      payload,
      receivedAt: new Date().toISOString(),
      status: 'pending',
      processedAt: null
    };
    webhookEvents.push(event);

    // Forward to n8n webhook if configured
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    if (n8nWebhookUrl) {
      try {
        const response = await fetch(`${n8nWebhookUrl}/lead-capture`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Event-ID': eventId
          },
          body: JSON.stringify({
            ...payload,
            _meta: {
              eventId,
              receivedAt: event.receivedAt,
              source: 'api-webhook'
            }
          })
        });

        event.status = response.ok ? 'forwarded' : 'forward_failed';
        event.processedAt = new Date().toISOString();

        logger.info('Lead forwarded to n8n', {
          eventId,
          status: event.status
        });
      } catch (forwardError) {
        event.status = 'forward_error';
        event.error = forwardError.message;
        logger.error('Failed to forward to n8n', {
          eventId,
          error: forwardError.message
        });
      }
    } else {
      event.status = 'processed_locally';
      event.processedAt = new Date().toISOString();
    }

    res.status(202).json({
      success: true,
      eventId,
      message: 'Webhook received and processing',
      status: event.status
    });
  } catch (error) {
    logger.error('Error processing lead webhook', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * CRM sync webhook - receives updates from CRM
 * POST /api/webhooks/crm-sync
 */
router.post('/crm-sync', validateWebhookSecret, async (req, res) => {
  try {
    const eventId = uuidv4();
    const { action, entity, data } = req.body;

    logger.info('CRM sync webhook received', {
      eventId,
      action,
      entity
    });

    const event = {
      id: eventId,
      type: 'crm_sync',
      action,
      entity,
      payload: data,
      receivedAt: new Date().toISOString(),
      status: 'processing'
    };
    webhookEvents.push(event);

    // Process based on action type
    switch (action) {
      case 'contact_created':
      case 'contact_updated':
        event.status = 'processed';
        logger.info(`CRM ${action} processed`, { eventId, entity });
        break;

      case 'deal_stage_changed':
        event.status = 'processed';
        logger.info('Deal stage change processed', {
          eventId,
          newStage: data?.newStage
        });
        break;

      default:
        event.status = 'unknown_action';
        logger.warn('Unknown CRM action', { eventId, action });
    }

    event.processedAt = new Date().toISOString();

    res.json({
      success: true,
      eventId,
      message: `CRM sync action '${action}' processed`,
      status: event.status
    });
  } catch (error) {
    logger.error('Error processing CRM sync webhook', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Marketing event webhook - tracks engagement
 * POST /api/webhooks/marketing
 */
router.post('/marketing', validateWebhookSecret, (req, res) => {
  try {
    const eventId = uuidv4();
    const { eventType, contactId, campaignId, metadata } = req.body;

    logger.info('Marketing event received', {
      eventId,
      eventType,
      contactId,
      campaignId
    });

    const event = {
      id: eventId,
      type: 'marketing_event',
      eventType,
      contactId,
      campaignId,
      metadata,
      receivedAt: new Date().toISOString(),
      status: 'processed'
    };
    webhookEvents.push(event);

    res.json({
      success: true,
      eventId,
      message: `Marketing event '${eventType}' recorded`
    });
  } catch (error) {
    logger.error('Error processing marketing webhook', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Get webhook event history
 * GET /api/webhooks/events
 */
router.get('/events', (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;

    let results = [...webhookEvents].reverse(); // Most recent first

    if (type) {
      results = results.filter(e => e.type === type);
    }
    if (status) {
      results = results.filter(e => e.status === status);
    }

    results = results.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: results,
      total: results.length
    });
  } catch (error) {
    logger.error('Error fetching webhook events', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Webhook health/test endpoint
 * GET /api/webhooks/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    eventsProcessed: webhookEvents.length,
    lastEvent: webhookEvents.length > 0
      ? webhookEvents[webhookEvents.length - 1].receivedAt
      : null
  });
});

module.exports = router;
