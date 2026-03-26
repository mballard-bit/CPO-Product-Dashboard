const { getSheetsClient } = require('../_lib/sheets');
const { getCached, setCached } = require('../_lib/cache');

const SHEETS_ID = '19nbeemZFUO28kurH3ASXGaIzYHLAbWjSgzo8ezotTck';

module.exports = async function handler(req, res) {
  try {
    const cacheKey = 'sheets:global-employment';
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEETS_ID,
      range: "'invites/Starts by month'!A1:Z",
    });

    const rows = response.data.values ?? [];
    const result = { totalRows: rows.length, first5: rows.slice(0, 5) };
    setCached(cacheKey, result, 15 * 60 * 1000);
    res.json(result);
  } catch (err) {
    console.error('Global Employment Sheets error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
