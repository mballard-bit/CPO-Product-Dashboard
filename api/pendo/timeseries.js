const { pendoPost } = require('../_lib/pendo');
const { getCached, setCached } = require('../_lib/cache');

module.exports = async function handler(req, res) {
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

    const data = await pendoPost({
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
    });

    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('Pendo timeseries error:', err.message);
    res.status(500).json({ error: 'Failed to fetch timeseries from Pendo' });
  }
};
