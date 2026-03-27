const https = require('https');
const { getCached, setCached } = require('../_lib/cache');

const SITE_ID = '61cb2b09-4350-4210-987a-38e86bcfb486';
const VIEW_IDS = {
  featureUsage: '31e22669-ee75-42f1-9ce1-59544a225b5c',      // Elite Package / Feature Usage Overview
  usageByArea: 'a3eb3c61-f9c1-45e8-9785-cf2577f4dfde',        // Company Product Usage / Usage by Package and Feature
};

function httpPost(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function httpGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers,
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

function parseNum(s) {
  if (!s || s === '') return null;
  return parseFloat(String(s).replace(/[,$%]/g, '')) || null;
}

function parseCsv(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    // handle quoted fields with commas
    const fields = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuote = !inQuote; }
      else if (line[i] === ',' && !inQuote) { fields.push(cur.trim()); cur = ''; }
      else { cur += line[i]; }
    }
    fields.push(cur.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = fields[i] ?? ''; });
    return obj;
  });
}

module.exports = async (req, res) => {
  const cacheKey = 'tableau:elite-benchmarks';
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  try {
    const server = process.env.TABLEAU_SERVER;
    const patName = process.env.TABLEAU_PAT_NAME;
    const patSecret = process.env.TABLEAU_PAT_SECRET;
    const site = process.env.TABLEAU_SITE;

    // Sign in
    const signInRes = await httpPost(`${server}/api/3.21/auth/signin`, {
      credentials: {
        personalAccessTokenName: patName,
        personalAccessTokenSecret: patSecret,
        site: { contentUrl: site },
      },
    }, { Accept: 'application/json' });

    if (signInRes.status !== 200) {
      return res.status(502).json({ error: 'Tableau auth failed', detail: signInRes.body });
    }

    const { token } = JSON.parse(signInRes.body).credentials;
    const authHeaders = { 'X-Tableau-Auth': token };

    // Fetch both views in parallel
    const [featureRaw, usageRaw] = await Promise.all([
      httpGet(`${server}/api/3.21/sites/${SITE_ID}/views/${VIEW_IDS.featureUsage}/data`, authHeaders),
      httpGet(`${server}/api/3.21/sites/${SITE_ID}/views/${VIEW_IDS.usageByArea}/data`, authHeaders),
    ]);

    // Sign out (fire and forget)
    httpPost(`${server}/api/3.21/auth/signout`, {}, authHeaders).catch(() => {});

    // ── Feature Usage Distribution (Elite customers by # of features) ──────────
    const featureRows = parseCsv(featureRaw.body);
    const featureUsage = featureRows
      .map(r => ({
        features: parseNum(r['# of Features']),
        companies: parseNum(r['Distinct count of Last N Months companies']),
      }))
      .filter(r => r.features !== null && r.companies !== null)
      .sort((a, b) => a.features - b.features);

    // ── Product Area Usage (distinct users by area, last available months) ─────
    const MONTH_ORDER = ['January','February','March','April','May','June',
                         'July','August','September','October','November','December'];

    const usageRows = parseCsv(usageRaw.body);

    // Find all available months and take the latest 3
    const allMonths = [...new Set(usageRows.map(r => r['Month of event_date']).filter(Boolean))];
    allMonths.sort((a, b) => {
      const [ma, ya] = a.split(' '); const [mb, yb] = b.split(' ');
      return (Number(ya) - Number(yb)) || (MONTH_ORDER.indexOf(ma) - MONTH_ORDER.indexOf(mb));
    });
    const recentMonths = allMonths.slice(-6); // last 6 months

    // Aggregate: per area per month, take the max distinct user count across features
    const SKIP_AREAS = new Set(['No Product Area', 'Other', '']);
    const areaMonthMap = {}; // { area: { month: maxUsers } }

    usageRows
      .filter(r =>
        recentMonths.includes(r['Month of event_date']) &&
        r['Measure Names'] === 'Distinct count of user_id' &&
        r['product_area']?.trim() &&
        !SKIP_AREAS.has(r['product_area'].trim()) &&
        r['feature']?.trim() &&
        r['Distinct count of user_id']
      )
      .forEach(r => {
        const area = r['product_area'].trim();
        const month = r['Month of event_date'];
        const users = parseInt(r['Distinct count of user_id'].replace(/,/g, '')) || 0;
        if (!areaMonthMap[area]) areaMonthMap[area] = {};
        areaMonthMap[area][month] = (areaMonthMap[area][month] || 0) + users;
      });

    // Build time-series per area (sorted by month)
    const areaUsage = Object.entries(areaMonthMap).map(([area, months]) => {
      const series = recentMonths
        .filter(m => months[m] != null)
        .map(m => ({ month: m, users: months[m] }));
      const latestUsers = series.length > 0 ? series[series.length - 1].users : 0;
      return { area, series, latestUsers };
    }).sort((a, b) => b.latestUsers - a.latestUsers);

    // Top features (latest month, non-empty names, aggregated across areas)
    const latestMonth = allMonths[allMonths.length - 1];
    const featureUserMap = {};
    usageRows
      .filter(r =>
        r['Month of event_date'] === latestMonth &&
        r['Measure Names'] === 'Distinct count of user_id' &&
        r['feature']?.trim() &&
        !SKIP_AREAS.has(r['product_area']?.trim()) &&
        r['Distinct count of user_id']
      )
      .forEach(r => {
        const feat = r['feature'].trim();
        const users = parseInt(r['Distinct count of user_id'].replace(/,/g, '')) || 0;
        featureUserMap[feat] = (featureUserMap[feat] || 0) + users;
      });

    const topFeatures = Object.entries(featureUserMap)
      .map(([feature, users]) => ({ feature, users }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 15);

    const result = { featureUsage, areaUsage, topFeatures, latestMonth };
    setCached(cacheKey, result, 30 * 60 * 1000); // 30 min cache
    res.json(result);
  } catch (err) {
    console.error('Tableau elite-benchmarks error:', err.message);
    res.status(500).json({ error: 'Failed to fetch Tableau data', detail: err.message });
  }
};
