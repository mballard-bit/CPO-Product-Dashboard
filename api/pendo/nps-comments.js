const { pendoPost, getPendoAppId } = require('../_lib/pendo');
const { getCached, setCached } = require('../_lib/cache');

module.exports = async function handler(req, res) {
  try {
    const keywords = (req.query.keywords || 'job ads,linkedin,job posting,paid job')
      .split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const limit = Math.min(10, parseInt(req.query.limit, 10) || 3);

    const cacheKey = `nps-comments:${keywords.join('|')}:${limit}`;
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const appId = getPendoAppId();
    const startMs = Date.now() - 180 * 24 * 60 * 60 * 1000;

    const data = await pendoPost({
      response: { mimeType: 'application/json' },
      request: {
        pipeline: [
          {
            source: {
              npsResponses: { appId },
              timeSeries: { period: 'dayRange', first: startMs, count: 180 },
            },
          },
          { filter: 'text != null && text != ""' },
          { sort: [{ browserTime: -1 }] },
          { limit: { limit: 500 } },
        ],
      },
    });

    const rows = data?.results ?? [];
    const matched = rows
      .filter(r => {
        const text = (r.text || '').toLowerCase();
        return keywords.some(k => text.includes(k));
      })
      .slice(0, limit)
      .map(r => ({
        text: r.text,
        score: r.rating ?? r.score ?? null,
        date: r.browserTime
          ? new Date(r.browserTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : null,
        visitorId: r.visitorId ?? null,
      }));

    setCached(cacheKey, matched, 30 * 60 * 1000);
    res.json(matched);
  } catch (err) {
    console.error('NPS comments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch NPS comments' });
  }
};
