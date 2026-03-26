const axios = require('axios');

const PENDO_BASE = 'https://app.pendo.io/api/v1';

function getPendoHeaders() {
  const key = process.env.PENDO_API_KEY;
  if (!key) throw new Error('PENDO_API_KEY environment variable is not set');
  return {
    'x-pendo-integration-key': key,
    'Content-Type': 'application/json',
  };
}

function getPendoAppId() {
  const id = process.env.PENDO_APP_ID;
  if (!id) throw new Error('PENDO_APP_ID environment variable is not set');
  return id;
}

function getStartMs(daysBack = 30) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d.getTime();
}

async function pendoPost(body) {
  const response = await axios.post(`${PENDO_BASE}/aggregation`, body, {
    headers: getPendoHeaders(),
  });
  return response.data;
}

async function pendoGet(path) {
  const response = await axios.get(`${PENDO_BASE}${path}`, {
    headers: getPendoHeaders(),
  });
  return response.data;
}

module.exports = { getPendoHeaders, getPendoAppId, getStartMs, pendoPost, pendoGet, PENDO_BASE };
