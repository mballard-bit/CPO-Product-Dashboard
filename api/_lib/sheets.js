const { google } = require('googleapis');

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 environment variable is not set');

  const credentials = JSON.parse(Buffer.from(raw.trim(), 'base64').toString('utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

module.exports = { getSheetsClient };
