const { google } = require('googleapis');

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set');

  // Vercel can introduce literal newline characters into the stored value,
  // which breaks JSON.parse. Fix by escaping any bare newlines first.
  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    credentials = JSON.parse(raw.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
  }
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

module.exports = { getSheetsClient };
