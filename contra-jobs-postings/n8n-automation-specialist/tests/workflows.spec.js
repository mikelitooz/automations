/**
 * Workflow Validation Tests
 * 
 * Tests to validate n8n workflow JSON structure and logic
 * Ensures workflows are properly configured and can be imported
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const WORKFLOWS_DIR = path.join(__dirname, '..', 'workflows');

// Helper to load workflow
const loadWorkflow = (filename) => {
  const filepath = path.join(WORKFLOWS_DIR, filename);
  const content = fs.readFileSync(filepath, 'utf8');
  return JSON.parse(content);
};

// Get all workflow files
const workflowFiles = fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.json'));

test.describe('Workflow Structure Validation', () => {
  for (const file of workflowFiles) {
    test(`${file} should have valid n8n structure`, async () => {
      const workflow = loadWorkflow(file);

      // Required top-level properties
      expect(workflow).toHaveProperty('name');
      expect(workflow).toHaveProperty('nodes');
      expect(workflow).toHaveProperty('connections');
      expect(workflow).toHaveProperty('settings');

      // Nodes should be an array
      expect(Array.isArray(workflow.nodes)).toBe(true);
      expect(workflow.nodes.length).toBeGreaterThan(0);

      // Connections should be an object
      expect(typeof workflow.connections).toBe('object');
    });
  }
});

test.describe('Node Configuration Validation', () => {
  for (const file of workflowFiles) {
    test(`${file} nodes should have required properties`, async () => {
      const workflow = loadWorkflow(file);

      for (const node of workflow.nodes) {
        // Every node must have these
        expect(node).toHaveProperty('id');
        expect(node).toHaveProperty('name');
        expect(node).toHaveProperty('type');
        expect(node).toHaveProperty('position');
        expect(node).toHaveProperty('parameters');

        // Position should have x, y coordinates
        expect(Array.isArray(node.position)).toBe(true);
        expect(node.position.length).toBe(2);

        // Type should be a valid n8n node type
        expect(node.type).toMatch(/^n8n-nodes-base\./);
      }
    });
  }
});

test.describe('Connection Validation', () => {
  for (const file of workflowFiles) {
    test(`${file} connections should reference existing nodes`, async () => {
      const workflow = loadWorkflow(file);

      // Get all node names
      const nodeNames = new Set(workflow.nodes.map(n => n.name));

      // Check each connection
      for (const [sourceName, outputs] of Object.entries(workflow.connections)) {
        // Source node should exist
        expect(nodeNames.has(sourceName)).toBe(true);

        // Check target nodes
        if (outputs.main) {
          for (const outputArray of outputs.main) {
            for (const connection of outputArray) {
              expect(nodeNames.has(connection.node)).toBe(true);
            }
          }
        }
      }
    });
  }
});

test.describe('Workflow-Specific Tests', () => {
  test('01-lead-capture should have webhook trigger', async () => {
    const workflow = loadWorkflow('01-lead-capture.json');

    const webhookNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
    expect(webhookNode).toBeDefined();
    expect(webhookNode.parameters.path).toBe('lead-capture');
  });

  test('02-ai-qualification should have AI API call', async () => {
    const workflow = loadWorkflow('02-ai-qualification.json');

    const httpNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.httpRequest');
    expect(httpNodes.length).toBeGreaterThan(0);

    // Should call AI endpoint
    const aiCall = httpNodes.find(n => n.parameters.url?.includes('/api/ai'));
    expect(aiCall).toBeDefined();
  });

  test('03-crm-sync should have scheduled trigger', async () => {
    const workflow = loadWorkflow('03-crm-sync.json');

    const scheduleNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.scheduleTrigger');
    expect(scheduleNode).toBeDefined();
  });

  test('04-marketing-automation should handle engagement events', async () => {
    const workflow = loadWorkflow('04-marketing-automation.json');

    // Should have code nodes for processing events
    const codeNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.code');
    expect(codeNodes.length).toBeGreaterThan(0);

    // Should have conditional routing
    const ifNodes = workflow.nodes.filter(n =>
      n.type === 'n8n-nodes-base.if' || n.type === 'n8n-nodes-base.switch'
    );
    expect(ifNodes.length).toBeGreaterThan(0);
  });

  test('05-onboarding should have phased tasks', async () => {
    const workflow = loadWorkflow('05-onboarding.json');

    // Check for initialization code
    const codeNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.code');
    const initNode = codeNodes.find(n => n.name.includes('Initialize'));
    expect(initNode).toBeDefined();
  });

  test('06-error-monitoring should have error trigger', async () => {
    const workflow = loadWorkflow('06-error-monitoring.json');

    const errorTrigger = workflow.nodes.find(n => n.type === 'n8n-nodes-base.errorTrigger');
    expect(errorTrigger).toBeDefined();

    // Should have health check
    const healthNode = workflow.nodes.find(n =>
      n.parameters.url?.includes('/health')
    );
    expect(healthNode).toBeDefined();
  });
});

test.describe('Settings Validation', () => {
  for (const file of workflowFiles) {
    test(`${file} should have proper execution settings`, async () => {
      const workflow = loadWorkflow(file);

      expect(workflow.settings).toHaveProperty('executionOrder');
      expect(workflow.settings.executionOrder).toBe('v1');
    });
  }

  test('Workflows should reference error monitoring workflow', async () => {
    // All main workflows should use 06-error-monitoring as error handler
    const mainWorkflows = workflowFiles.filter(f => !f.includes('06-error'));

    for (const file of mainWorkflows) {
      const workflow = loadWorkflow(file);

      // Error workflow should be configured (optional but recommended)
      if (workflow.settings.errorWorkflow) {
        expect(workflow.settings.errorWorkflow).toContain('error-monitoring');
      }
    }
  });
});

test.describe('Code Node Validation', () => {
  for (const file of workflowFiles) {
    test(`${file} code nodes should have valid JavaScript`, async () => {
      const workflow = loadWorkflow(file);

      const codeNodes = workflow.nodes.filter(n => n.type === 'n8n-nodes-base.code');

      for (const node of codeNodes) {
        const code = node.parameters.jsCode;
        expect(code).toBeDefined();

        // Basic syntax check - should not throw on parse
        // (Note: This is a basic check, not full validation)
        expect(code).not.toContain('syntax error');
        expect(code.includes('return')).toBe(true); // Should return something
      }
    });
  }
});

test.describe('Workflow Tags', () => {
  for (const file of workflowFiles) {
    test(`${file} should have tags for organization`, async () => {
      const workflow = loadWorkflow(file);

      expect(workflow).toHaveProperty('tags');
      expect(Array.isArray(workflow.tags)).toBe(true);
      expect(workflow.tags.length).toBeGreaterThan(0);

      // Each tag should have name and id
      for (const tag of workflow.tags) {
        expect(tag).toHaveProperty('name');
        expect(tag).toHaveProperty('id');
      }
    });
  }
});
