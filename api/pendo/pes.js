const { pendoGet, getPendoAppId, getStartMs } = require('../_lib/pendo');
const { getCached, setCached } = require('../_lib/cache');

module.exports = async function handler(req, res) {
  try {
    const cached = getCached('pes');
    if (cached) return res.json(cached);

    const startMs = getStartMs();
    const startDate = new Date(startMs).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    const appId = getPendoAppId();

    const data = await pendoGet(`/score/pes?app_id=${appId}&start=${startDate}&end=${endDate}`);
    setCached('pes', data);
    res.json(data);
  } catch (err) {
    console.error('Pendo PES error:', err.message);
    res.status(500).json({ error: 'Failed to fetch PES from Pendo' });
  }
};
