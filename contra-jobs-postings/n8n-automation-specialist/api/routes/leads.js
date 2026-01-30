/**
 * Leads API Router
 * 
 * Endpoints for lead management:
 * - Create, read, update leads
 * - Lead scoring and enrichment
 * - Pipeline stage management
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../middleware/logger');

const router = express.Router();

// In-memory store (would use PostgreSQL in production)
const leads = new Map();

/**
 * Create a new lead
 * POST /api/leads
 */
router.post('/', (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      company,
      phone,
      source,
      customFields = {}
    } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email is required'
      });
    }

    const lead = {
      id: uuidv4(),
      email,
      firstName: firstName || '',
      lastName: lastName || '',
      company: company || '',
      phone: phone || '',
      source: source || 'api',
      customFields,
      status: 'new',
      score: null,
      qualificationStatus: 'pending',
      pipelineStage: 'lead',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      activities: [{
        type: 'created',
        timestamp: new Date().toISOString(),
        details: { source }
      }]
    };

    leads.set(lead.id, lead);

    logger.info('Lead created', { leadId: lead.id, email: lead.email });

    res.status(201).json({
      success: true,
      data: lead,
      message: 'Lead created successfully'
    });
  } catch (error) {
    logger.error('Error creating lead', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Get all leads with optional filtering
 * GET /api/leads
 */
router.get('/', (req, res) => {
  try {
    const { status, stage, minScore, maxScore, limit = 50, offset = 0 } = req.query;

    let results = Array.from(leads.values());

    // Apply filters
    if (status) {
      results = results.filter(l => l.status === status);
    }
    if (stage) {
      results = results.filter(l => l.pipelineStage === stage);
    }
    if (minScore) {
      results = results.filter(l => l.score >= parseInt(minScore));
    }
    if (maxScore) {
      results = results.filter(l => l.score <= parseInt(maxScore));
    }

    // Pagination
    const total = results.length;
    results = results.slice(parseInt(offset), parseInt(offset) + parseInt(limit));

    res.json({
      success: true,
      data: results,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching leads', { error: error.message });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Get a single lead by ID
 * GET /api/leads/:id
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const lead = leads.get(id);

    if (!lead) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lead with ID ${id} not found`
      });
    }

    res.json({
      success: true,
      data: lead
    });
  } catch (error) {
    logger.error('Error fetching lead', { error: error.message, leadId: req.params.id });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Update lead score
 * PUT /api/leads/:id/score
 */
router.put('/:id/score', (req, res) => {
  try {
    const { id } = req.params;
    const { score, reason } = req.body;

    const lead = leads.get(id);
    if (!lead) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lead with ID ${id} not found`
      });
    }

    if (typeof score !== 'number' || score < 0 || score > 100) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Score must be a number between 0 and 100'
      });
    }

    lead.score = score;
    lead.updatedAt = new Date().toISOString();
    lead.activities.push({
      type: 'score_updated',
      timestamp: new Date().toISOString(),
      details: { score, reason }
    });

    // Auto-qualify based on score
    if (score >= 70) {
      lead.qualificationStatus = 'qualified';
      lead.pipelineStage = 'qualified';
    } else if (score >= 40) {
      lead.qualificationStatus = 'nurture';
    } else {
      lead.qualificationStatus = 'unqualified';
    }

    leads.set(id, lead);

    logger.info('Lead score updated', {
      leadId: id,
      score,
      qualificationStatus: lead.qualificationStatus
    });

    res.json({
      success: true,
      data: lead,
      message: 'Lead score updated successfully'
    });
  } catch (error) {
    logger.error('Error updating lead score', { error: error.message, leadId: req.params.id });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Update lead pipeline stage
 * PUT /api/leads/:id/stage
 */
router.put('/:id/stage', (req, res) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    const validStages = ['lead', 'qualified', 'meeting', 'proposal', 'negotiation', 'won', 'lost'];

    if (!validStages.includes(stage)) {
      return res.status(400).json({
        error: 'Validation Error',
        message: `Invalid stage. Must be one of: ${validStages.join(', ')}`
      });
    }

    const lead = leads.get(id);
    if (!lead) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lead with ID ${id} not found`
      });
    }

    const previousStage = lead.pipelineStage;
    lead.pipelineStage = stage;
    lead.updatedAt = new Date().toISOString();
    lead.activities.push({
      type: 'stage_changed',
      timestamp: new Date().toISOString(),
      details: { previousStage, newStage: stage, notes }
    });

    leads.set(id, lead);

    logger.info('Lead stage updated', { leadId: id, previousStage, newStage: stage });

    res.json({
      success: true,
      data: lead,
      message: 'Lead stage updated successfully'
    });
  } catch (error) {
    logger.error('Error updating lead stage', { error: error.message, leadId: req.params.id });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

/**
 * Delete a lead
 * DELETE /api/leads/:id
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    if (!leads.has(id)) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Lead with ID ${id} not found`
      });
    }

    leads.delete(id);
    logger.info('Lead deleted', { leadId: id });

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting lead', { error: error.message, leadId: req.params.id });
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

module.exports = router;
