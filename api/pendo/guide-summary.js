const { pendoPost, getStartMs } = require('../_lib/pendo');
const { getCached, setCached } = require('../_lib/cache');

module.exports = async function handler(req, res) {
  try {
    const { guideId } = req.query;
    if (!guideId) return res.status(400).json({ error: 'guideId is required' });

    const cacheKey = `guide-summary:${guideId}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const startMs = getStartMs();

    async function guideCount(type) {
      const data = await pendoPost({
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
      });
      const row = data?.results?.[0] ?? {};
      return { visitors: row.numVisitors ?? 0, events: row.numEvents ?? 0 };
    }

    const [seen, dismissed, completed] = await Promise.all([
      guideCount('guideSeen'),
      guideCount('guideDismissed'),
      guideCount('guideComplete'),
    ]);

    const dismissalRate = seen.visitors > 0 ? Math.round((dismissed.visitors / seen.visitors) * 100) : 0;
    const completionRate = seen.visitors > 0 ? Math.round((completed.visitors / seen.visitors) * 100) : 0;

    const result = { seen, dismissed, completed, dismissalRate, completionRate };
    setCached(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.error('Guide summary error:', err.message);
    res.status(500).json({ error: 'Failed to fetch guide summary' });
  }
};
