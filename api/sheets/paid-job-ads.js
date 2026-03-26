const { getSheetsClient } = require('../_lib/sheets');
const { getCached, setCached } = require('../_lib/cache');

const SHEETS_ID = '1t9RSWDSGYM0AAaUK6uZ7t0QURcGZAO6fV7UcVZ6EdUQ';

function parseNum(val) {
  if (!val || val === '' || val === '#DIV/0!') return null;
  return parseFloat(String(val).replace(/[$,%]/g, '').replace(/,/g, '')) || null;
}

module.exports = async function handler(req, res) {
  try {
    const cacheKey = 'sheets:paid-job-ads';
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: "'2025&2026'!A48:Z",
    });

    const rows = response.data.values ?? [];
    if (rows.length < 2) return res.json({ ats: [], jobs: [] });

    // Skip the EA annotation row (index 1); real data starts at index 2
    const dataRows = rows.slice(2).filter(r => r[0] && r[0] !== 'EA' && r[0] !== '');

    const ats = dataRows.map(r => ({
      week: r[0] ?? '',
      atsCustomers: parseNum(r[1]),
      calConnected: parseNum(r[2]),
      customersInviting: parseNum(r[3]),
      interviewsScheduled: parseNum(r[4]),
      interviewsPerActive: parseNum(r[5]),
      pctScheduling: parseNum(r[6]),
      invitesSent: parseNum(r[8]),
      acceptanceRate: parseNum(r[9]),
    })).filter(r => r.atsCustomers !== null);

    const jobs = dataRows.map(r => ({
      week: r[12] ?? '',
      atsCustomers: parseNum(r[14]),
      jobsPosted: parseNum(r[15]),
      customersPosted: parseNum(r[16]),
      firstTimePosting: parseNum(r[17]),
      jobsPostedToLI: parseNum(r[18]),
      views: parseNum(r[19]),
      applicants: parseNum(r[20]),
      hired: parseNum(r[21]),
      liRevenue: parseNum(r[22]),
      bhrRevenue: parseNum(r[23]),
      pctOfJobsPosted: parseNum(r[24]),
    })).filter(r => r.jobsPosted !== null || r.liRevenue !== null);

    const result = { ats, jobs };
    setCached(cacheKey, result, 15 * 60 * 1000);
    res.json(result);
  } catch (err) {
    console.error('Google Sheets error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Google Sheets data' });
  }
};
