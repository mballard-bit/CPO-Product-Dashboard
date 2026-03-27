const { getSheetsClient } = require('../_lib/sheets');
const { getCached, setCached, setCacheHeaders } = require('../_lib/cache');

const SHEETS_ID = '1t9RSWDSGYM0AAaUK6uZ7t0QURcGZAO6fV7UcVZ6EdUQ';

function parseNum(val) {
  if (!val || val === '' || val === '#DIV/0!') return null;
  return parseFloat(String(val).replace(/[$,%]/g, '').replace(/,/g, '')) || null;
}

module.exports = async function handler(req, res) {
  try {
    const cacheKey = 'sheets:paid-job-ads';
    const cached = getCached(cacheKey);
    if (cached) { setCacheHeaders(res); return res.json(cached); }

    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: "'2025&2026'!A48:AZ",
    });

    const rows = response.data.values ?? [];
    if (rows.length < 2) return res.json({ ats: [], jobs: [] });

    // Skip the EA annotation row (index 1); real data starts at index 2.
    // Keep rows where either the ATS date (col A/index 0) OR the Jobs date
    // (col M/index 12) is present — the two tables may not have identical row ranges.
    const dataRows = rows.slice(2).filter(r =>
      (r[0] && r[0] !== 'EA' && r[0] !== '') ||
      (r[12] && r[12] !== 'EA' && r[12] !== '') ||
      (r[44] && r[44] !== 'EA' && r[44] !== '' && r[44] !== 'Baseline')
    );

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
    })).filter(r => r.week !== '');

    const seek = dataRows.map(r => ({
      week: r[44] ?? '',
      totalAnzCustomers: parseNum(r[45]),
      activeAts: parseNum(r[46]),
      atsAdoption: parseNum(r[47]),
      seekEnabled: parseNum(r[48]),
      pctSeekEnabled: parseNum(r[49]),
      postings: parseNum(r[50]),
      customersPosting: parseNum(r[51]),
    })).filter(r => r.week !== '');

    // Monthly summary section (columns AB–AO, indices 27–40)
    // These rows have a month label like "Aug-2025" at index 27
    const MONTH_RE = /^[A-Za-z]{3}-\d{4}$/;
    const jobsMonthly = dataRows
      .filter(r => r[27] && MONTH_RE.test(String(r[27]).trim()))
      .map(r => ({
        month: String(r[27]).trim(),
        atsCustomers: parseNum(r[28]),
        jobsPosted: parseNum(r[29]),
        customersPosted: parseNum(r[30]),
        firstTimePosting: parseNum(r[31]),
        jobsPostedToLI: parseNum(r[32]),
        views: parseNum(r[33]),
        applicants: parseNum(r[34]),
        hired: parseNum(r[35]),
        liRevenue: parseNum(r[36]),
        bhrRevenue: parseNum(r[37]),
        pctOfJobsPosted: parseNum(r[38]),
      }));

    const result = { ats, jobs, seek, jobsMonthly };
    setCached(cacheKey, result, 15 * 60 * 1000);
    setCacheHeaders(res); res.json(result);
  } catch (err) {
    console.error('Google Sheets error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Google Sheets data', detail: err.message });
  }
};
