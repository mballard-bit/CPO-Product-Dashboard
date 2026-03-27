const { pendoPost, getPendoAppId, getStartMs } = require('../_lib/pendo');
const { getCached, setCached, setCacheHeaders } = require('../_lib/cache');

module.exports = async function handler(req, res) {
  try {
    const cached = getCached('activity');
    if (cached) { setCacheHeaders(res); return res.json(cached); }

    const startMs = getStartMs();
    const appId = getPendoAppId();

    const data = await pendoPost({
      response: { mimeType: 'application/json' },
      request: {
        pipeline: [
          { source: { visitors: { appId } } },
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
    });

    setCached('activity', data);
    setCacheHeaders(res); res.json(data);
  } catch (err) {
    console.error('Pendo activity error:', err.message);
    res.status(500).json({ error: 'Failed to fetch activity from Pendo' });
  }
};
