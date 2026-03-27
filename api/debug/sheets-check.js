const { getSheetsClient } = require('../_lib/sheets');

module.exports = async function handler(req, res) {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;

  if (!raw) {
    return res.json({ status: 'missing', message: 'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 not set' });
  }

  let credentials;
  try {
    credentials = JSON.parse(Buffer.from(raw.trim(), 'base64').toString('utf8'));
  } catch (e) {
    return res.json({ status: 'decode_error', message: e.message, rawLength: raw.length });
  }

  const hasPrivateKey = !!credentials.private_key;
  const clientEmail = credentials.client_email || 'missing';

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.get({
      spreadsheetId: '1t9RSWDSGYM0AAaUK6uZ7t0QURcGZAO6fV7UcVZ6EdUQ',
      range: "'2025&2026'!A48:A50",
    });
    res.json({ status: 'ok', clientEmail, hasPrivateKey });
  } catch (e) {
    res.json({ status: 'sheets_error', message: e.message, clientEmail, hasPrivateKey });
  }
};
