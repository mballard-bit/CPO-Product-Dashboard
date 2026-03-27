const { getSheetsClient } = require('../_lib/sheets');

module.exports = async function handler(req, res) {
  try {
    const sheets = getSheetsClient();
    // Fetch first 5 rows from row 48 onward, wide range to catch all columns
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '1t9RSWDSGYM0AAaUK6uZ7t0QURcGZAO6fV7UcVZ6EdUQ',
      range: "'2025&2026'!A48:AZ52",
    });
    const rows = response.data.values ?? [];
    // Return each row with column letters for easy reading
    const labeled = rows.map((row, ri) => {
      const obj = {};
      row.forEach((val, ci) => {
        const col = ci < 26
          ? String.fromCharCode(65 + ci)
          : 'A' + String.fromCharCode(65 + ci - 26);
        if (val) obj[col] = val;
      });
      return { row: 48 + ri, cols: obj };
    });
    res.json(labeled);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
