/**
 * API Endpoint Tests
 * 
 * Playwright tests for AutoScale CRM Intelligence Hub API
 * Testing all endpoints for correctness and reliability
 */

const { test, expect } = require('@playwright/test');

const API_BASE = process.env.API_URL || 'http://localhost:3000';

test.describe('Health Check Endpoints', () => {
  test('GET /health should return healthy status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/health`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
  });

  test('GET / should return API info', async ({ request }) => {
    const response = await request.get(`${API_BASE}/`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.name).toBe('AutoScale CRM Intelligence Hub API');
    expect(data.endpoints).toHaveProperty('leads');
    expect(data.endpoints).toHaveProperty('ai');
  });
});

test.describe('Leads API', () => {
  let createdLeadId;

  test('POST /api/leads should create a new lead', async ({ request }) => {
    const leadData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      company: 'Test Corp',
      phone: '+1234567890',
      source: 'playwright_test'
    };

    const response = await request.post(`${API_BASE}/api/leads`, {
      data: leadData
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('id');
    expect(data.data.email).toBe(leadData.email);
    expect(data.data.status).toBe('new');
    expect(data.data.qualificationStatus).toBe('pending');

    createdLeadId = data.data.id;
  });

  test('POST /api/leads should fail without email', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/leads`, {
      data: { firstName: 'NoEmail' }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.error).toBe('Validation Error');
  });

  test('GET /api/leads should return leads list', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/leads`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
    expect(data).toHaveProperty('pagination');
  });

  test('GET /api/leads/:id should return specific lead', async ({ request }) => {
    // First create a lead
    const createRes = await request.post(`${API_BASE}/api/leads`, {
      data: { email: 'gettest@example.com', firstName: 'Get', lastName: 'Test' }
    });
    const { data: { id } } = await createRes.json();

    const response = await request.get(`${API_BASE}/api/leads/${id}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(id);
  });

  test('PUT /api/leads/:id/score should update lead score', async ({ request }) => {
    // Create a lead first
    const createRes = await request.post(`${API_BASE}/api/leads`, {
      data: { email: 'scoretest@example.com' }
    });
    const { data: { id } } = await createRes.json();

    // Update score
    const response = await request.put(`${API_BASE}/api/leads/${id}/score`, {
      data: { score: 85, reason: 'High-value prospect' }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data.score).toBe(85);
    expect(data.data.qualificationStatus).toBe('qualified');
  });

  test('PUT /api/leads/:id/stage should update pipeline stage', async ({ request }) => {
    // Create a lead first
    const createRes = await request.post(`${API_BASE}/api/leads`, {
      data: { email: 'stagetest@example.com' }
    });
    const { data: { id } } = await createRes.json();

    // Update stage
    const response = await request.put(`${API_BASE}/api/leads/${id}/stage`, {
      data: { stage: 'qualified', notes: 'Ready for sales' }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data.pipelineStage).toBe('qualified');
  });

  test('DELETE /api/leads/:id should delete lead', async ({ request }) => {
    // Create a lead first
    const createRes = await request.post(`${API_BASE}/api/leads`, {
      data: { email: 'deletetest@example.com' }
    });
    const { data: { id } } = await createRes.json();

    // Delete
    const response = await request.delete(`${API_BASE}/api/leads/${id}`);
    expect(response.ok()).toBeTruthy();

    // Verify deletion
    const getRes = await request.get(`${API_BASE}/api/leads/${id}`);
    expect(getRes.status()).toBe(404);
  });
});

test.describe('Webhooks API', () => {
  test('POST /api/webhooks/lead should accept lead webhook', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/webhooks/lead`, {
      data: {
        email: 'webhook@example.com',
        firstName: 'Webhook',
        source: 'landing_page'
      }
    });

    expect(response.status()).toBe(202);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data).toHaveProperty('eventId');
  });

  test('POST /api/webhooks/crm-sync should process CRM sync', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/webhooks/crm-sync`, {
      data: {
        action: 'contact_updated',
        entity: 'contact',
        data: { contactId: 'test-123', name: 'Updated Name' }
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('processed');
  });

  test('POST /api/webhooks/marketing should track marketing events', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/webhooks/marketing`, {
      data: {
        eventType: 'email_opened',
        contactId: 'contact-456',
        campaignId: 'campaign-789'
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('GET /api/webhooks/events should return event history', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/webhooks/events`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('GET /api/webhooks/health should return webhook health', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/webhooks/health`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
  });
});

test.describe('AI API', () => {
  test('POST /api/ai/qualify should qualify a lead', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/ai/qualify`, {
      data: {
        lead: {
          id: 'test-lead-1',
          email: 'ceo@fortune500.com',
          firstName: 'Jane',
          lastName: 'Executive',
          company: 'Fortune 500 Corp',
          source: 'demo_request'
        }
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('score');
    expect(data.data).toHaveProperty('confidence');
    expect(data.data).toHaveProperty('recommendedAction');
  });

  test('POST /api/ai/qualify should fail without lead data', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/ai/qualify`, {
      data: {}
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/ai/generate-reply should generate email', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/ai/generate-reply`, {
      data: {
        lead: {
          firstName: 'Alex',
          company: 'StartupXYZ'
        },
        context: 'Follow up after demo request',
        tone: 'professional'
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('subject');
    expect(data.data).toHaveProperty('body');
  });

  test('POST /api/ai/sentiment should analyze text', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/ai/sentiment`, {
      data: {
        text: 'This product is amazing and has exceeded all our expectations!'
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toHaveProperty('sentiment');
    expect(data.data).toHaveProperty('score');
  });

  test('GET /api/ai/health should return AI health status', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/ai/health`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data).toHaveProperty('openaiConfigured');
  });
});

test.describe('Error Handling', () => {
  test('GET /nonexistent should return 404', async ({ request }) => {
    const response = await request.get(`${API_BASE}/nonexistent`);
    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe('Not Found');
  });

  test('Invalid JSON should be handled gracefully', async ({ request }) => {
    const response = await request.post(`${API_BASE}/api/leads`, {
      headers: { 'Content-Type': 'application/json' },
      data: 'invalid json {'
    });

    // Should either reject or handle gracefully
    expect([400, 500]).toContain(response.status());
  });
});
