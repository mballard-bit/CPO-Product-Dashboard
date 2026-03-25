const express = require('express');
const axios = require('axios');
const cors = require('cors');
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

app.use(cors());
app.use(express.json());

const PENDO_BASE = 'https://app.pendo.io/api/v1';

// Compute last-30-days start date (server-side, never from frontend)
function getStartDate() {
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return start.toISOString().split('T')[0];
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

    const startDate = getStartDate();

    const response = await axios.post(
      `${PENDO_BASE}/aggregation`,
      {
        response: { mimeType: 'application/json' },
        request: {
          pipeline: [
            {
              source: {
                pageEvents: { pageId },
                timeSeries: { period: 'dayRange', first: startDate, count: 30 },
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

    const startDate = getStartDate();

    const response = await axios.post(
      `${PENDO_BASE}/aggregation`,
      {
        response: { mimeType: 'application/json' },
        request: {
          pipeline: [
            {
              source: {
                featureEvents: { featureId },
                timeSeries: { period: 'dayRange', first: startDate, count: 30 },
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
    const startDate = getStartDate();
    const endDate = new Date().toISOString().split('T')[0];
    const response = await axios.get(
      `${PENDO_BASE}/score/pes?app_id=${PENDO_APP_ID}&start=${startDate}&end=${endDate}`,
      { headers: pendoHeaders }
    );
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
    const startDate = getStartDate();
    const startMs = new Date(startDate).getTime();

    const response = await axios.post(
      `${PENDO_BASE}/aggregation`,
      {
        response: { mimeType: 'application/json' },
        request: {
          pipeline: [
            { source: { visitors: { appId: PENDO_APP_ID } } },
            { filter: `lastvisit >= ${startMs}` },
            {
              group: {
                group: [],
                fields: [
                  { totalVisitors: { count: 'visitorId' } },
                  { totalAccounts: { count: 'accountId' } },
                ],
              },
            },
          ],
        },
      },
      { headers: pendoHeaders }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Pendo activity error:', error.message);
    res.status(500).json({ error: 'Failed to fetch activity from Pendo' });
  }
});

// Note: segmentId filtering is not implemented in v1 — add a conditional pipeline
// filter stage to each endpoint when segment-based views are needed.
app.listen(PORT, () => {
  console.log(`CPO Dashboard server running on port ${PORT}`);
});
