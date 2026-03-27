const { pendoPost, getStartMs } = require('../_lib/pendo');
const { getCached, setCached, setCacheHeaders } = require('../_lib/cache');

module.exports = async function handler(req, res) {
  try {
    const { pageId } = req.query;
    if (!pageId) return res.status(400).json({ error: 'pageId is required' });

    const cacheKey = `pages:${pageId}`;
    const cached = getCached(cacheKey);
    if (cached) { setCacheHeaders(res); return res.json(cached); }

    const startMs = getStartMs();
    const data = await pendoPost({
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
    });

    setCached(cacheKey, data);
    setCacheHeaders(res); res.json(data);
  } catch (err) {
    console.error('Pendo pages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch page data from Pendo' });
  }
};
