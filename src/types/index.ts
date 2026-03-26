export type PendoType = 'pageVisitors' | 'featureUsage' | 'pes' | 'accounts';
export type MetricFormat = 'number' | 'percent' | 'score';
export type FeatureMetric = 'visitors' | 'accounts';

export interface MetricCard {
  label: string;
  pendoType: PendoType;
  pendoIds: string[];       // page IDs or feature IDs
  format: MetricFormat;
  showTrend: boolean;
}

export interface FeatureRow {
  label: string;
  pendoType: 'page' | 'feature';
  pendoId: string;
  metric: FeatureMetric;
  // percentage = (metric count / total app visitors or accounts) × 100
}

export interface GuideCardConfig {
  label: string;
  guideId: string;
}

export interface TrendChartConfig {
  label: string;
  type: 'page' | 'feature';
  id: string;
  metric: 'visitors' | 'events';
}

export interface ProductArea {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
  metricCards: MetricCard[];
  featureRows: FeatureRow[];
  trendCharts?: TrendChartConfig[];
  guideCards?: GuideCardConfig[];
  // If set, feature bar % uses this page/feature's visitor count as denominator
  // instead of total app visitors. Useful for funnel-style areas.
  featureBarBase?: { type: 'page' | 'feature'; id: string };
}

export interface MetricValue {
  value: number | null;
  previousValue: number | null;  // for trend calculation; null if unavailable
  loading: boolean;
  error: boolean;
}

export interface FeatureBarValue {
  percent: number | null;
  loading: boolean;
  error: boolean;
}

export interface AppTotals {
  totalVisitors: number | null;
  totalAccounts: number | null;
}
