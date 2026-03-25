import { MetricCard, FeatureRow, FeatureBarValue, AppTotals } from '../types';

const API_BASE = '/api/pendo';

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

interface PendoAggResult {
  results: Array<{ numVisitors?: number; numAccounts?: number; totalVisitors?: number; totalAccounts?: number }>;
}

interface PendoPesResult {
  score?: number;
}

export async function fetchMetricValue(card: MetricCard): Promise<{ current: number | null }> {
  if (card.pendoType === 'pes') {
    const data = await safeFetch<PendoPesResult>(`${API_BASE}/pes`);
    return { current: data?.score ?? null };
  }

  if (card.pendoType === 'accounts') {
    const data = await safeFetch<PendoAggResult>(`${API_BASE}/activity`);
    const row = data?.results?.[0];
    return { current: row?.totalAccounts ?? null };
  }

  if (card.pendoType === 'pageVisitors' && card.pendoIds[0]) {
    const data = await safeFetch<PendoAggResult>(`${API_BASE}/pages?pageId=${encodeURIComponent(card.pendoIds[0])}`);
    const row = data?.results?.[0];
    return { current: row?.numVisitors ?? null };
  }

  if (card.pendoType === 'featureUsage' && card.pendoIds[0]) {
    const data = await safeFetch<PendoAggResult>(`${API_BASE}/features?featureId=${encodeURIComponent(card.pendoIds[0])}`);
    const row = data?.results?.[0];
    return { current: row?.numVisitors ?? null };
  }

  return { current: null };
}

export async function fetchAppTotals(): Promise<AppTotals> {
  const data = await safeFetch<PendoAggResult>(`${API_BASE}/activity`);
  const row = data?.results?.[0];
  return {
    totalVisitors: row?.totalVisitors ?? null,
    totalAccounts: row?.totalAccounts ?? null,
  };
}

export async function fetchFeatureBarValue(row: FeatureRow, totals: AppTotals): Promise<FeatureBarValue> {
  const endpoint = row.pendoType === 'page'
    ? `${API_BASE}/pages?pageId=${encodeURIComponent(row.pendoId)}`
    : `${API_BASE}/features?featureId=${encodeURIComponent(row.pendoId)}`;

  const data = await safeFetch<PendoAggResult>(endpoint);
  const result = data?.results?.[0];

  const count = row.metric === 'visitors' ? result?.numVisitors : result?.numAccounts;
  const total = row.metric === 'visitors' ? totals.totalVisitors : totals.totalAccounts;

  if (count == null || !total) return { percent: null, loading: false, error: !data };

  return {
    percent: Math.min(100, Math.round((count / total) * 100)),
    loading: false,
    error: false,
  };
}
