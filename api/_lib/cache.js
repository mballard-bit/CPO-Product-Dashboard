// Simple in-memory cache — shared within a warm serverless instance
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) return entry.data;
  cache.delete(key);
  return null;
}

function setCached(key, data, ttlMs = 5 * 60 * 1000) {
  cache.set(key, { data, expires: Date.now() + ttlMs });
}

// Set Cache-Control so Vercel's CDN caches the response at the edge.
// s-maxage: how long the CDN serves the cached response without revalidating.
// stale-while-revalidate: serve stale while fetching fresh in background.
function setCacheHeaders(res, maxAgeSeconds = 300) {
  res.setHeader(
    'Cache-Control',
    `s-maxage=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`
  );
}

module.exports = { getCached, setCached, setCacheHeaders };
