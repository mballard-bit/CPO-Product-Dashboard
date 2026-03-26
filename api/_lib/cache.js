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

module.exports = { getCached, setCached };
