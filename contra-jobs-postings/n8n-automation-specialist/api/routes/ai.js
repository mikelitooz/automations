/**
 * AI API Router
 * 
 * Endpoints for AI-powered operations:
 * - Lead qualification using LLM
 * - Smart email generation
 * - Sentiment analysis
 */

const express = require('express');
const OpenAI = require('openai');
const logger = require('../middleware/logger');

const router = express.Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * AI-powered lead qualification
 * POST /api/ai/qualify
 */
router.post('/qualify', async (req, res) => {
  try {
    const { lead } = req.body;

    if (!lead) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Lead data is required'
      });
    }

    logger.info('AI qualification request', { leadId: lead.id || 'unknown' });

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      // Return mock response for demo/testing
      logger.warn('OpenAI API key not configured, using mock response');

      const mockScore = Math.floor(Math.random() * 40) + 50; // 50-90
      return res.json({
        success: true,
        data: {
          score: mockScore,
          confidence: 0.85,
          reasoning: 'Mock qualification - OpenAI API key not configured',
          signals: {
            positive: ['Has company email', 'Complete profile'],
            negative: ['Industry unknown'],
            neutral: ['First-time visitor']
          },
          recommendedAction: mockScore >= 70 ? 'schedule_call' : 'nurture_sequence',
          mock: true
        }
      });
    }

    // Build the qualification prompt
    const prompt = `Analyze this lead and provide a qualification score from 0-100.

Lead Data:
- Email: ${lead.email || 'Not provided'}
- Name: ${lead.firstName || ''} ${lead.lastName || ''}
- Company: ${lead.company || 'Not provided'}
- Phone: ${lead.phone ? 'Provided' : 'Not provided'}
- Source: ${lead.source || 'Unknown'}
- Custom Fields: ${JSON.stringify(lead.customFields || {})}

Provide your analysis in the following JSON format:
{
  "score": <number 0-100>,
  "confidence": <number 0-1>,
  "reasoning": "<brief explanation>",
  "signals": {
    "positive": ["<signal1>", "<signal2>"],
    "negative": ["<signal1>"],
    "neutral": ["<signal1>"]
  },
  "recommendedAction": "<schedule_call|nurture_sequence|disqualify|needs_more_info>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B sales lead qualification assistant. Analyze leads and provide accurate scoring based on available signals. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const responseText = completion.choices[0].message.content;

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.error('Failed to parse AI response', { error: parseError.message });
      return res.status(500).json({
        error: 'AI Response Error',
        message: 'Failed to parse AI qualification response'
      });
    }

    logger.info('AI qualification complete', {
      leadId: lead.id,
      score: analysis.score,
      action: analysis.recommendedAction
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('AI qualification error', { error: error.message });
    res.status(500).json({
      error: 'AI Processing Error',
      message: error.message
    });
  }
});

/**
 * Generate personalized email reply
 * POST /api/ai/generate-reply
 */
router.post('/generate-reply', async (req, res) => {
  try {
    const { lead, context, tone = 'professional' } = req.body;

    if (!lead || !context) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Lead data and context are required'
      });
    }

    logger.info('AI reply generation request', { leadId: lead.id || 'unknown' });

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured, using mock response');

      return res.json({
        success: true,
        data: {
          subject: `Following up on your inquiry, ${lead.firstName || 'there'}`,
          body: `Hi ${lead.firstName || 'there'},\n\nThank you for your interest! I'd love to learn more about your needs at ${lead.company || 'your company'}.\n\nWould you have 15 minutes this week for a quick call?\n\nBest regards`,
          mock: true
        }
      });
    }

    const prompt = `Generate a personalized ${tone} email for this lead.

Lead Info:
- Name: ${lead.firstName || ''} ${lead.lastName || ''}
- Company: ${lead.company || 'Not provided'}
- Source: ${lead.source || 'Unknown'}

Context: ${context}

Provide the email in this JSON format:
{
  "subject": "<email subject>",
  "body": "<email body text>"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B sales copywriter. Write concise, compelling emails that feel personal and drive action. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const responseText = completion.choices[0].message.content;

    let email;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        email = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      logger.error('Failed to parse AI email response', { error: parseError.message });
      return res.status(500).json({
        error: 'AI Response Error',
        message: 'Failed to parse AI email response'
      });
    }

    logger.info('AI reply generated', { leadId: lead.id });

    res.json({
      success: true,
      data: email
    });
  } catch (error) {
    logger.error('AI reply generation error', { error: error.message });
    res.status(500).json({
      error: 'AI Processing Error',
      message: error.message
    });
  }
});

/**
 * Analyze text sentiment
 * POST /api/ai/sentiment
 */
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Text is required'
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.json({
        success: true,
        data: {
          sentiment: 'neutral',
          score: 0.5,
          confidence: 0.8,
          mock: true
        }
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze the sentiment of the provided text. Respond with JSON: {"sentiment": "positive|negative|neutral", "score": <-1 to 1>, "confidence": <0-1>}'
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.1,
      max_tokens: 100
    });

    const responseText = completion.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { sentiment: 'neutral', score: 0, confidence: 0.5 };

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Sentiment analysis error', { error: error.message });
    res.status(500).json({
      error: 'AI Processing Error',
      message: error.message
    });
  }
});

/**
 * AI health check
 * GET /api/ai/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    openaiConfigured: !!process.env.OPENAI_API_KEY,
    model: 'gpt-4o-mini'
  });
});

module.exports = router;
