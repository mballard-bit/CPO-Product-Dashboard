const express = require('express');
const axios = require('axios');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const PENDO_API_KEY = process.env.PENDO_API_KEY;
const PENDO_APP_ID = process.env.PENDO_APP_ID;
if (!PENDO_API_KEY) {
  console.error('FATAL: PENDO_API_KEY is not set in .env');
  process.exit(1);
}
if (!PENDO_APP_ID) {
  console.error('FATAL: PENDO_APP_ID is not set in .env');
  process.exit(1);
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const anthropic = ANTHROPIC_API_KEY ? new Anthropic({ apiKey: ANTHROPIC_API_KEY }) : null;
if (!anthropic) console.warn('ANTHROPIC_API_KEY not set — QoQ insights will be disabled');

app.use(cors());
app.use(express.json());

const PENDO_BASE = 'https://app.pendo.io/api/v1';

// Simple in-memory cache with TTL
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getCached(key) {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key, data, ttlMs = CACHE_TTL_MS) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

// Compute last-30-days start timestamp in ms (server-side, never from frontend)
function getStartMs() {
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return start.getTime();
}

const pendoHeaders = {
  'x-pendo-integration-key': PENDO_API_KEY,
  'Content-Type': 'application/json',
};

// GET /api/pendo/pages?pageId=xxx
// Returns visitor + account counts for a page over the last 30 days
app.get('/api/pendo/pages', async (req, res) => {
  try {
    const { pageId } = req.query;
    if (!pageId) return res.status(400).json({ error: 'pageId is required' });

    const cacheKey = `pages:${pageId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const startMs = getStartMs();

    const response = await axios.post(
      `${PENDO_BASE}/aggregation`,
      {
        response: { mimeType: 'application/json' },
        request: {
          pipeline: [
            {
              source: {
                pageEvents: { pageId },
                timeSeries: { period: 'dayRange', first: startMs, count: 30 },
              },
            },
            {
              group: {
                group: [],
                fields: [
                  { numVisitors: { count: 'visitorId' } },
                  { numAccounts: { count: 'accountId' } },
                ],
              },
            },
          ],
        },
      },
      { headers: pendoHeaders }
    );
    setCached(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Pendo pages error:', error.message);
    res.status(500).json({ error: 'Failed to fetch page data from Pendo' });
  }
});

// GET /api/pendo/features?featureId=xxx
// Returns click counts for a feature over the last 30 days
app.get('/api/pendo/features', async (req, res) => {
  try {
    const { featureId } = req.query;
    if (!featureId) return res.status(400).json({ error: 'featureId is required' });

    const cacheKey = `features:${featureId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const startMs = getStartMs();

    const response = await axios.post(
      `${PENDO_BASE}/aggregation`,
      {
        response: { mimeType: 'application/json' },
        request: {
          pipeline: [
            {
              source: {
                featureEvents: { featureId },
                timeSeries: { period: 'dayRange', first: startMs, count: 30 },
              },
            },
            {
              group: {
                group: [],
                fields: [
                  { numVisitors: { count: 'visitorId' } },
                  { numAccounts: { count: 'accountId' } },
                ],
              },
            },
          ],
        },
      },
      { headers: pendoHeaders }
    );
    setCached(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Pendo features error:', error.message);
    res.status(500).json({ error: 'Failed to fetch feature data from Pendo' });
  }
});

// GET /api/pendo/pes
// Returns Product Engagement Score (adoption, stickiness, growth)
app.get('/api/pendo/pes', async (req, res) => {
  try {
    const cached = getCached('pes');
    if (cached) return res.json(cached);

    const startMs = getStartMs();
    const startDate = new Date(startMs).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    const response = await axios.get(
      `${PENDO_BASE}/score/pes?app_id=${PENDO_APP_ID}&start=${startDate}&end=${endDate}`,
      { headers: pendoHeaders }
    );
    setCached('pes', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Pendo PES error:', error.message);
    res.status(500).json({ error: 'Failed to fetch PES from Pendo' });
  }
});

// GET /api/pendo/activity
// Returns active visitor + account totals for the app over the last 30 days
app.get('/api/pendo/activity', async (req, res) => {
  try {
    const cached = getCached('activity');
    if (cached) return res.json(cached);

    const startMs = getStartMs();

    const response = await axios.post(
      `${PENDO_BASE}/aggregation`,
      {
        response: { mimeType: 'application/json' },
        request: {
          pipeline: [
            { source: { visitors: { appId: PENDO_APP_ID } } },
            { filter: `metadata.auto__323232.lastvisit >= ${startMs}` },
            {
              group: {
                group: [],
                fields: [
                  { totalVisitors: { count: 'visitorId' } },
                  { totalAccounts: { count: 'metadata.auto.accountid' } },
                ],
              },
            },
          ],
        },
      },
      { headers: pendoHeaders }
    );
    setCached('activity', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Pendo activity error:', error.message);
    res.status(500).json({ error: 'Failed to fetch activity from Pendo' });
  }
});

// GET /api/pendo/timeseries?type=feature&id=xxx&days=30
// Returns daily visitor + event counts for a page or feature
app.get('/api/pendo/timeseries', async (req, res) => {
  try {
    const { type, id, days = '30' } = req.query;
    if (!type || !id) return res.status(400).json({ error: 'type and id are required' });
    if (type !== 'page' && type !== 'feature') return res.status(400).json({ error: 'type must be page or feature' });

    const numDays = Math.min(90, Math.max(7, parseInt(days, 10) || 30));
    const cacheKey = `timeseries:${type}:${id}:${numDays}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const startMs = (() => {
      const d = new Date();
      d.setDate(d.getDate() - numDays);
      return d.getTime();
    })();

    const source = type === 'page'
      ? { pageEvents: { pageId: id }, timeSeries: { period: 'dayRange', first: startMs, count: numDays } }
      : { featureEvents: { featureId: id }, timeSeries: { period: 'dayRange', first: startMs, count: numDays } };

    const response = await axios.post(
      `${PENDO_BASE}/aggregation`,
      {
        response: { mimeType: 'application/json' },
        request: {
          pipeline: [
            { source },
            {
              group: {
                group: ['day'],
                fields: [
                  { numVisitors: { count: 'visitorId' } },
                  { numEvents: { count: 'numEvents' } },
                ],
              },
            },
          ],
        },
      },
      { headers: pendoHeaders }
    );
    setCached(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Pendo timeseries error:', error.message);
    res.status(500).json({ error: 'Failed to fetch timeseries from Pendo' });
  }
});

// Generate a data-driven summary when no AI key is available
function generateTemplateInsight(label, current, previous, changePct) {
  const n = changePct === null ? null : Math.abs(changePct);
  const dir = changePct === null ? null : changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat';
  const mag = n === null ? '' : n >= 30 ? 'sharply ' : n >= 10 ? 'moderately ' : '';

  const sentence1 = changePct === null
    ? `${label} had ${current.toLocaleString()} unique visitors this quarter with no prior-quarter data to compare.`
    : dir === 'flat'
    ? `${label} held steady this quarter at ${current.toLocaleString()} visitors, consistent with the prior 90-day period.`
    : `${label} is ${mag}${dir} ${n}% quarter-over-quarter — ${current.toLocaleString()} visitors this period vs. ${previous.toLocaleString()} last quarter.`;

  const contexts = {
    'Marketing Cost Calculator': changePct > 0
      ? 'Growing calculator engagement signals rising awareness of EOR costs; consider A/B testing the calculator placement to accelerate top-of-funnel conversion.'
      : 'Softening engagement with the cost calculator may indicate visitors are not reaching it — audit the marketing page flow and CTA prominence.',
    'Full Breakdown Calculator': changePct > 0
      ? 'Increased use of the detailed breakdown tool suggests more serious evaluation intent; this cohort is high-intent and worth targeting with direct sales outreach.'
      : 'Fewer visitors reaching the full breakdown view could indicate friction in the cost estimation flow or that the entry point needs higher visibility.',
    'Demos Scheduled': changePct > 0
      ? 'Demo requests are a direct pipeline signal — this growth should be correlated against MQL conversion rates to confirm quality is tracking with volume.'
      : 'Declining demo requests is a leading indicator worth acting on quickly; consider whether the schedule-a-demo CTA needs prominence or messaging improvements.',
    'EOR Installs': changePct > 0
      ? 'Accelerating installs indicate the EOR onboarding flow is converting well; maintain this momentum by reducing time-to-value after install.'
      : 'A drop in installs may reflect friction in the "Get Started" flow or reduced marketing page traffic reaching the conversion step — check the full funnel.',
    'New EOR Employee': changePct > 0
      ? 'Growing EOR employee onboardings indicate healthy expansion within existing EOR accounts; this is a strong product stickiness signal for the feature.'
      : 'Fewer new EOR employee records suggest existing EOR customers may be slowing expansion — consider proactive outreach or in-app nudges to drive growth.',
  };

  const sentence2 = contexts[label] || (
    changePct > 0
      ? 'Positive momentum here contributes to the overall Global Employment funnel — monitor for sustained growth over the next quarter.'
      : 'This decline warrants investigation to determine whether it reflects reduced demand, a UX issue, or an upstream awareness gap.'
  );

  return `${sentence1} ${sentence2}`;
}

// Helper: fetch aggregate visitor count for a page or feature over a specific period
async function fetchPeriodAggregate(type, id, startMs, days) {
  const source = type === 'page'
    ? { pageEvents: { pageId: id }, timeSeries: { period: 'dayRange', first: startMs, count: days } }
    : { featureEvents: { featureId: id }, timeSeries: { period: 'dayRange', first: startMs, count: days } };
  const response = await axios.post(
    `${PENDO_BASE}/aggregation`,
    {
      response: { mimeType: 'application/json' },
      request: {
        pipeline: [
          { source },
          { group: { group: [], fields: [{ numVisitors: { count: 'visitorId' } }] } },
        ],
      },
    },
    { headers: pendoHeaders }
  );
  return response.data;
}

// GET /api/pendo/qoq?type=feature|page&id=xxx&label=yyy
// Returns current vs previous 90-day visitor counts + AI-generated insight
app.get('/api/pendo/qoq', async (req, res) => {
  try {
    const { type, id, label } = req.query;
    if (!type || !id || !label) return res.status(400).json({ error: 'type, id, label required' });

    const cacheKey = `qoq:${type}:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const DAY = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const currentStart = now - 90 * DAY;
    const previousStart = now - 180 * DAY;

    const [currentResp, previousResp] = await Promise.all([
      fetchPeriodAggregate(type, id, currentStart, 90),
      fetchPeriodAggregate(type, id, previousStart, 90),
    ]);

    const current = currentResp?.results?.[0]?.numVisitors ?? 0;
    const previous = previousResp?.results?.[0]?.numVisitors ?? 0;
    const changePct = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null;

    let insight = generateTemplateInsight(label, current, previous, changePct);

    if (anthropic) {
      try {
        const direction = changePct === null ? 'no prior data'
          : changePct > 0 ? `up ${changePct}%` : changePct < 0 ? `down ${Math.abs(changePct)}%` : 'flat';
        const msg = await anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 150,
          messages: [{
            role: 'user',
            content: `You are a product analyst at BambooHR. Write exactly 2-3 sentences of QoQ insight for a CPO dashboard.

Feature: "${label}" (part of BambooHR's Global Employment / EOR product)
Current 90 days: ${current.toLocaleString()} unique visitors
Previous 90 days: ${previous.toLocaleString()} unique visitors
Trend: ${direction} quarter-over-quarter

Sentence 1: describe the trend factually with specific numbers. Sentences 2-3: provide actionable interpretation for the product team, connecting to EOR market context where relevant. No headers, no bullets.`,
          }],
        });
        const aiText = msg.content[0]?.type === 'text' ? msg.content[0].text.trim() : null;
        if (aiText) insight = aiText;
      } catch (e) {
        console.error('Claude insight error:', e.message);
      }
    }

    const result = { current, previous, changePct, insight };
    setCached(cacheKey, result, 6 * 60 * 60 * 1000); // cache 6 hours
    res.json(result);
  } catch (error) {
    console.error('QoQ error:', error.message);
    res.status(500).json({ error: 'Failed to fetch QoQ data' });
  }
});

// GET /api/pendo/guide-summary?guideId=xxx
// Returns seen/dismissed/completed counts for an in-app guide over the last 30 days
app.get('/api/pendo/guide-summary', async (req, res) => {
  try {
    const { guideId } = req.query;
    if (!guideId) return res.status(400).json({ error: 'guideId is required' });

    const cacheKey = `guide-summary:${guideId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const startMs = getStartMs();

    async function guideCount(type) {
      const response = await axios.post(
        `${PENDO_BASE}/aggregation`,
        {
          response: { mimeType: 'application/json' },
          request: {
            pipeline: [
              {
                source: {
                  guideEvents: { guideId },
                  timeSeries: { period: 'dayRange', first: startMs, count: 30 },
                },
              },
              { filter: `type == "${type}"` },
              {
                group: {
                  group: [],
                  fields: [
                    { numVisitors: { count: 'visitorId' } },
                    { numEvents: { count: 'numEvents' } },
                  ],
                },
              },
            ],
          },
        },
        { headers: pendoHeaders }
      );
      const row = response.data?.results?.[0] ?? {};
      return { visitors: row.numVisitors ?? 0, events: row.numEvents ?? 0 };
    }

    const [seen, dismissed, completed] = await Promise.all([
      guideCount('guideSeen'),
      guideCount('guideDismissed'),
      guideCount('guideComplete'),
    ]);

    const dismissalRate = seen.visitors > 0
      ? Math.round((dismissed.visitors / seen.visitors) * 100)
      : 0;
    const completionRate = seen.visitors > 0
      ? Math.round((completed.visitors / seen.visitors) * 100)
      : 0;

    const result = { seen, dismissed, completed, dismissalRate, completionRate };
    setCached(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Guide summary error:', error.message);
    res.status(500).json({ error: 'Failed to fetch guide summary' });
  }
});

// Note: segmentId filtering is not implemented in v1 — add a conditional pipeline
// filter stage to each endpoint when segment-based views are needed.
app.listen(PORT, () => {
  console.log(`CPO Dashboard server running on port ${PORT}`);
});
