import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import styled from 'styled-components';
import {
  colors, ContentArea, AreaHeader, AreaTitle, AreaDescription,
  ChartSection, ChartTitle, ChartPlaceholder, MetricCardGrid,
  CardContainer, CardLabel, CardValue, CardTrend,
} from '../styles/StyledComponents';

interface JobRow {
  week: string;
  atsCustomers: number | null;
  jobsPosted: number | null;
  customersPosted: number | null;
  firstTimePosting: number | null;
  jobsPostedToLI: number | null;
  views: number | null;
  applicants: number | null;
  hired: number | null;
  liRevenue: number | null;
  bhrRevenue: number | null;
  pctOfJobsPosted: number | null;
}

interface SheetData {
  ats: any[];
  jobs: JobRow[];
}

// ── Styled components ──────────────────────────────────────────────────────────

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const FullWidthChart = styled.div`
  margin-top: 12px;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  margin: 24px 0 2px;
  padding-bottom: 8px;
  border-bottom: 2px solid ${colors.border};
`;

const SectionDescription = styled.div`
  font-size: 12px;
  color: ${colors.lightText};
  margin-bottom: 10px;
`;

const InsightBox = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${colors.border};
`;

const InsightStats = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
`;

const InsightStat = styled.div``;

const InsightStatLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${colors.lightText};
  margin-bottom: 2px;
`;

const InsightStatValue = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.text};
`;

const InsightChange = styled.span<{ positive: boolean | null }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ positive }) =>
    positive === null ? colors.lightText :
    positive ? colors.success : colors.error};
`;

const InsightText = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: ${colors.lightText};
  margin: 0;
  font-style: italic;
`;

const NpsSection = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
`;

const NpsComment = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid ${colors.border};
  &:last-child { border-bottom: none; padding-bottom: 0; }
  &:first-child { padding-top: 0; }
`;

const NpsCommentText = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: ${colors.text};
  margin: 0 0 6px;
`;

const NpsMeta = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const NpsScore = styled.span<{ score: number | null }>`
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ score }) =>
    score === null ? colors.border :
    score >= 9 ? '#e6f4ea' :
    score >= 7 ? '#fef7e0' : '#fce8e6'};
  color: ${({ score }) =>
    score === null ? colors.lightText :
    score >= 9 ? colors.success :
    score >= 7 ? colors.warning : colors.error};
`;

const NpsDate = styled.span`
  font-size: 11px;
  color: ${colors.lightText};
`;

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtRevenue(n: number | null): string {
  if (n === null) return '—';
  return `$${n.toLocaleString()}`;
}

function fmt(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function fmtInsightVal(n: number, isRevenue: boolean): string {
  if (isRevenue) return `$${Math.round(n).toLocaleString()}`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return Math.round(n).toString();
}

function latestVal(arr: any[], key: string): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i][key] !== null) return arr[i][key];
  }
  return null;
}

function latestWeek(arr: any[], key: string): string | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i][key] !== null) return arr[i].week ?? null;
  }
  return null;
}

const INSIGHTS: Record<string, (changePct: number | null, recent: number, previous: number) => string> = {
  liRevenue: (p, r) => p === null
    ? `LinkedIn revenue is currently $${r.toLocaleString()} per month with no prior period to compare against.`
    : p >= 10
    ? `LinkedIn revenue is up ${p}% compared to the prior period at $${r.toLocaleString()}/mo — strong signal that more customers are activating paid job slots. Consider whether this growth is being driven by new customer adoption or expansion within existing accounts.`
    : p >= 0
    ? `LinkedIn revenue has grown modestly ${p}% to $${r.toLocaleString()}/mo. The trajectory is positive but there may be headroom to accelerate through better in-app promotion of the LI Jobs feature.`
    : `LinkedIn revenue is down ${Math.abs(p)}% to $${r.toLocaleString()}/mo. This could reflect seasonal hiring slowdowns or customers churning from paid slots — worth examining whether dismissal rates on the upgrade prompt are rising.`,

  bhrRevenue: (p, r) => p === null
    ? `BHR revenue from job ads is $${r.toLocaleString()} with no prior baseline available.`
    : p >= 0
    ? `BHR job ad revenue is up ${p}% to $${r.toLocaleString()}, tracking in line with LinkedIn adoption growth. Sustained revenue growth here validates the paid job ads product-market fit within the BambooHR customer base.`
    : `BHR job ad revenue declined ${Math.abs(p)}% to $${r.toLocaleString()}. Review whether the decline correlates with lower job posting volume or a reduction in customers upgrading to paid slots.`,

  jobsPostedToLI: (p, r) => p === null
    ? `${Math.round(r).toLocaleString()} jobs are being posted to LinkedIn on average with no historical comparison available.`
    : p >= 10
    ? `Jobs posted to LinkedIn are up ${p}% — growing volume signals that customers are finding value in the LinkedIn distribution channel. Monitor whether view and applicant counts are scaling proportionally.`
    : p >= 0
    ? `Job posting volume to LinkedIn grew ${p}%, a healthy but modest increase. If adoption has plateaued, look at whether the in-app nudge to post to LI is prominent enough during the job creation flow.`
    : `Jobs posted to LinkedIn dropped ${Math.abs(p)}%. This upstream metric directly impacts views and applicants — investigate whether a UI change or pricing adjustment may be discouraging customers from selecting LI distribution.`,

  customersPosted: (p, r) => p === null
    ? `${Math.round(r).toLocaleString()} unique customers posted jobs on average.`
    : p >= 0
    ? `The number of customers actively posting jobs grew ${p}%, indicating broader adoption across the customer base. First-time posting growth alongside this metric would confirm healthy new customer activation.`
    : `Fewer customers posted jobs this period (down ${Math.abs(p)}%). This breadth metric is important — even if total jobs posted is stable, a narrowing customer base posting them suggests concentration risk.`,

  views: (p, r) => p === null
    ? `Job listings are averaging ${Math.round(r).toLocaleString()} views with no prior period to compare.`
    : p >= 10
    ? `Job listing views are up ${p}% — LinkedIn's distribution is delivering strong reach. This is the top-of-funnel metric for the applicant pipeline; ensure the application-to-hire conversion rate is keeping pace.`
    : p >= 0
    ? `Views grew ${p}%, a modest improvement in reach. If job posting volume is growing faster than views, it may indicate declining per-job visibility — worth reviewing LinkedIn's algorithm changes or ad spend levels.`
    : `Views declined ${Math.abs(p)}% despite continued posting activity. Reduced per-job visibility could reflect market saturation, LinkedIn algorithm changes, or a shift toward lower-demand job categories.`,

  applicants: (p, r) => p === null
    ? `Averaging ${Math.round(r).toLocaleString()} applicants per period with no historical baseline.`
    : p >= 0
    ? `Applicant volume is up ${p}%, which is the direct outcome metric customers care about most. Growing applicant counts strengthen the ROI case for paid job ads and should be surfaced prominently in customer-facing reporting.`
    : `Applicant volume dropped ${Math.abs(p)}% — this is the metric customers use to evaluate ROI on job ads. Declining applicants despite stable views suggests a conversion problem worth investigating at the job listing quality level.`,

  hired: (p, r) => p === null
    ? `Averaging ${Math.round(r).toLocaleString()} hires per period sourced through LinkedIn job ads.`
    : p >= 0
    ? `Hires are up ${p}%, the ultimate outcome metric for paid job ads. This is a strong retention signal — customers who successfully hire through BambooHR's LI integration are far less likely to churn.`
    : `Hires declined ${Math.abs(p)}% this period. While lagging indicators like hires can fluctuate, a sustained decline weakens the product's value proposition. Consider whether applicant quality or volume changes upstream are contributing.`,
};

function computePeriodStats(data: any[], key: string): { recentAvg: number; prevAvg: number; changePct: number | null } {
  const vals = data.filter(d => d[key] !== null).map(d => d[key] as number);
  if (vals.length < 2) return { recentAvg: vals[0] ?? 0, prevAvg: 0, changePct: null };
  const half = Math.ceil(vals.length / 2);
  const recent = vals.slice(-half);
  const prev = vals.slice(0, vals.length - half);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const prevAvg = prev.length > 0 ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
  const changePct = prevAvg > 0 ? Math.round(((recentAvg - prevAvg) / prevAvg) * 100) : null;
  return { recentAvg, prevAvg, changePct };
}

// ── SheetInsight sub-component ─────────────────────────────────────────────────

interface SheetInsightProps {
  data: any[];
  metricKey: string;
  isRevenue?: boolean;
}

const SheetInsight: React.FC<SheetInsightProps> = ({ data, metricKey, isRevenue = false }) => {
  const { recentAvg, prevAvg, changePct } = computePeriodStats(data, metricKey);
  const isPositive = changePct !== null ? changePct >= 0 : null;
  const insightFn = INSIGHTS[metricKey];
  const insight = insightFn ? insightFn(changePct, recentAvg, prevAvg) : null;

  return (
    <InsightBox>
      <InsightStats>
        <InsightStat>
          <InsightStatLabel>Recent avg</InsightStatLabel>
          <InsightStatValue>{fmtInsightVal(recentAvg, isRevenue)}</InsightStatValue>
        </InsightStat>
        <InsightStat>
          <InsightStatLabel>Prior avg</InsightStatLabel>
          <InsightStatValue>{fmtInsightVal(prevAvg, isRevenue)}</InsightStatValue>
        </InsightStat>
        <InsightStat>
          <InsightStatLabel>Change</InsightStatLabel>
          <InsightStatValue>
            <InsightChange positive={isPositive}>
              {changePct === null ? '—' : `${changePct >= 0 ? '+' : ''}${changePct}%`}
            </InsightChange>
          </InsightStatValue>
        </InsightStat>
      </InsightStats>
      {insight && <InsightText>{insight}</InsightText>}
    </InsightBox>
  );
};

// ── Chart components ───────────────────────────────────────────────────────────

const TICK = { fontSize: 10, fill: colors.lightText };
const TOOLTIP_STYLE = { fontSize: 12, border: `1px solid ${colors.border}`, borderRadius: 6 };

interface SimpleChartProps {
  data: any[];
  dataKey: string;
  label: string;
  color?: string;
  formatter?: (v: number) => string;
  isRevenue?: boolean;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, dataKey, label, color = colors.primary, formatter, isRevenue }) => {
  const filled = data.filter(d => d[dataKey] !== null);
  if (filled.length === 0) return (
    <ChartSection>
      <ChartTitle>{label}</ChartTitle>
      <ChartPlaceholder>No data</ChartPlaceholder>
    </ChartSection>
  );
  return (
    <ChartSection>
      <ChartTitle>{label}</ChartTitle>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={filled} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis dataKey="week" tick={TICK} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={TICK} tickLine={false} axisLine={false} allowDecimals={false}
            tickFormatter={formatter} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: colors.lightText }}
            formatter={formatter ? (v: any) => [formatter(v as number), label] : undefined} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name={label} />
        </LineChart>
      </ResponsiveContainer>
      <SheetInsight data={data} metricKey={dataKey} isRevenue={isRevenue} />
    </ChartSection>
  );
};

const RevenueChart: React.FC<{ data: JobRow[] }> = ({ data }) => {
  const filled = data.filter(d => d.liRevenue !== null || d.bhrRevenue !== null);
  if (filled.length === 0) return (
    <ChartSection>
      <ChartTitle>Revenue Over Time</ChartTitle>
      <ChartPlaceholder>No data</ChartPlaceholder>
    </ChartSection>
  );
  return (
    <ChartSection>
      <ChartTitle>Revenue Over Time</ChartTitle>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={filled} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis dataKey="week" tick={TICK} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={TICK} tickLine={false} axisLine={false}
            tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: colors.lightText }}
            formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="liRevenue" stroke={colors.success} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name="LI Monthly Revenue" />
          <Line type="monotone" dataKey="bhrRevenue" stroke={colors.primary} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name="BHR Revenue" />
        </LineChart>
      </ResponsiveContainer>
      <SheetInsight data={data} metricKey="liRevenue" isRevenue />
    </ChartSection>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

interface NpsComment {
  text: string;
  score: number | null;
  date: string | null;
  visitorId: string | null;
}

const PaidJobAdsDashboard: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [npsComments, setNpsComments] = useState<NpsComment[]>([]);
  const [npsLoading, setNpsLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch('/api/sheets/paid-job-ads')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));

    setNpsLoading(true);
    fetch('/api/pendo/nps-comments?keywords=job+ads,linkedin,job+posting,paid+job&limit=3')
      .then(r => r.ok ? r.json() : [])
      .then(d => setNpsComments(Array.isArray(d) ? d : []))
      .catch(() => setNpsComments([]))
      .finally(() => setNpsLoading(false));
  }, [refreshKey]);

  const jobs = data?.jobs ?? [];
  const ytdYear = new Date().getFullYear();
  const weeksElapsed = Math.ceil((Date.now() - new Date(ytdYear, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const ytdRevenue = jobs.slice(-weeksElapsed).reduce((sum, r) => sum + (r.bhrRevenue ?? 0), 0);

  return (
    <ContentArea>
      <AreaHeader>
        <AreaTitle>Paid Job Ads</AreaTitle>
        <AreaDescription>LinkedIn Paid Job Ads — adoption, views, applications, and revenue · Sourced from Google Sheets</AreaDescription>
      </AreaHeader>

      {loading && <ChartPlaceholder>Loading…</ChartPlaceholder>}
      {!loading && error && <ChartPlaceholder>Could not load Google Sheets data</ChartPlaceholder>}

      {!loading && !error && data && (
        <>
          <MetricCardGrid>
            <CardContainer>
              <CardLabel>LI Monthly Revenue</CardLabel>
              <CardValue>{fmtRevenue(latestVal(jobs, 'liRevenue'))}</CardValue>
              {latestWeek(jobs, 'liRevenue') && (
                <CardTrend>Week of {latestWeek(jobs, 'liRevenue')}</CardTrend>
              )}
            </CardContainer>
            <CardContainer>
              <CardLabel>BHR Revenue</CardLabel>
              <CardValue>{fmtRevenue(latestVal(jobs, 'bhrRevenue'))}</CardValue>
              {latestWeek(jobs, 'bhrRevenue') && (
                <CardTrend>Week of {latestWeek(jobs, 'bhrRevenue')}</CardTrend>
              )}
            </CardContainer>
            <CardContainer>
              <CardLabel>Jobs Posted to LI</CardLabel>
              <CardValue>{fmt(latestVal(jobs, 'jobsPostedToLI'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>YTD BHR Revenue ({ytdYear})</CardLabel>
              <CardValue>{fmtRevenue(ytdRevenue)}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Applicants</CardLabel>
              <CardValue>{fmt(latestVal(jobs, 'applicants'))}</CardValue>
            </CardContainer>

          </MetricCardGrid>

          <SectionTitle>Revenue</SectionTitle>
          <SectionDescription>LinkedIn and BHR revenue trends over time</SectionDescription>
          <FullWidthChart>
            <RevenueChart data={jobs} />
          </FullWidthChart>

          <SectionTitle>Adoption</SectionTitle>
          <SectionDescription>How many customers are posting jobs and reaching LinkedIn</SectionDescription>
          <ChartGrid>
            <SimpleChart data={jobs} dataKey="jobsPostedToLI" label="Jobs Posted to LinkedIn" />
            <SimpleChart data={jobs} dataKey="customersPosted" label="Customers Posted" color={colors.warning} />
            <SimpleChart data={jobs} dataKey="firstTimePosting" label="First Time Posting" color={colors.success} />
            <SimpleChart data={jobs} dataKey="pctOfJobsPosted" label="% of Jobs Posted to LI"
              formatter={v => `${v.toFixed(2)}%`} />
          </ChartGrid>

          <SectionTitle>Applications</SectionTitle>
          <SectionDescription>Applicant volume from LinkedIn job listings</SectionDescription>
          <FullWidthChart>
            <SimpleChart data={jobs} dataKey="applicants" label="Applicants" color={colors.primary} />
          </FullWidthChart>

          <SectionTitle>Customer Voice</SectionTitle>
          <SectionDescription>Recent NPS comments mentioning job ads or LinkedIn</SectionDescription>
          <NpsSection>
            {npsLoading && <ChartPlaceholder style={{ height: 60 }}>Loading comments…</ChartPlaceholder>}
            {!npsLoading && npsComments.length === 0 && (
              <ChartPlaceholder style={{ height: 60 }}>No recent NPS comments found mentioning job ads</ChartPlaceholder>
            )}
            {!npsLoading && npsComments.map((c, i) => (
              <NpsComment key={i}>
                <NpsCommentText>"{c.text}"</NpsCommentText>
                <NpsMeta>
                  {c.score !== null && <NpsScore score={c.score}>NPS {c.score}</NpsScore>}
                  {c.date && <NpsDate>{c.date}</NpsDate>}
                </NpsMeta>
              </NpsComment>
            ))}
          </NpsSection>
        </>
      )}
    </ContentArea>
  );
};

export default PaidJobAdsDashboard;
