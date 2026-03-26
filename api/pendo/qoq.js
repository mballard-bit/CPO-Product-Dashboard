const Anthropic = require('@anthropic-ai/sdk');
const { pendoPost } = require('../_lib/pendo');
const { getCached, setCached } = require('../_lib/cache');

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

async function fetchPeriodAggregate(type, id, startMs, days) {
  const source = type === 'page'
    ? { pageEvents: { pageId: id }, timeSeries: { period: 'dayRange', first: startMs, count: days } }
    : { featureEvents: { featureId: id }, timeSeries: { period: 'dayRange', first: startMs, count: days } };
  return pendoPost({
    response: { mimeType: 'application/json' },
    request: {
      pipeline: [
        { source },
        { group: { group: [], fields: [{ numVisitors: { count: 'visitorId' } }] } },
      ],
    },
  });
}

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

module.exports = async function handler(req, res) {
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
    setCached(cacheKey, result, 6 * 60 * 60 * 1000);
    res.json(result);
  } catch (err) {
    console.error('QoQ error:', err.message);
    res.status(500).json({ error: 'Failed to fetch QoQ data' });
  }
};
