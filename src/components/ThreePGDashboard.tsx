import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import styled from 'styled-components';
import {
  colors, ContentArea, AreaHeader, AreaTitle, AreaDescription,
  ChartSection, ChartTitle, ChartPlaceholder, MetricCardGrid,
  CardContainer, CardLabel, CardValue,
} from '../styles/StyledComponents';

interface SeekRow {
  week: string;
  totalAnzCustomers: number | null;
  activeAts: number | null;
  atsAdoption: number | null;
  seekEnabled: number | null;
  pctSeekEnabled: number | null;
  postings: number | null;
  customersPosting: number | null;
}

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
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

// ── Helpers ─────────────────────────────────────────────────────────────────

const TICK = { fontSize: 10, fill: colors.lightText };
const TOOLTIP_STYLE = { fontSize: 12, border: `1px solid ${colors.border}`, borderRadius: 6 };

function fmt(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function fmtPct(n: number | null): string {
  if (n === null) return '—';
  return `${n.toFixed(1)}%`;
}

function latestVal(arr: SeekRow[], key: keyof SeekRow): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i][key];
    if (v !== null && v !== undefined && v !== '') return v as number;
  }
  return null;
}

function computePeriodStats(data: SeekRow[], key: keyof SeekRow) {
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

const INSIGHTS: Record<string, (changePct: number | null, recent: number, previous: number) => string> = {
  seekEnabled: (p, r) => p === null
    ? `${Math.round(r)} ANZ customers currently have SEEK enabled with no prior period to compare against.`
    : p >= 10
    ? `SEEK-enabled customers are up ${p}% — strong adoption momentum in the ANZ market. This upstream metric drives posting volume and applicant outcomes; continued growth here validates the SEEK integration as a meaningful product differentiator.`
    : p >= 0
    ? `SEEK enablement grew ${p}%, a modest but positive trend. If growth has slowed, it may be worth examining whether in-product prompts to enable SEEK are prominent enough during onboarding or the ATS setup flow.`
    : `SEEK-enabled customers declined ${Math.abs(p)}%. This could reflect customers disabling the integration after trialling it — worth investigating whether setup friction or lack of applicant volume is driving disengagement.`,

  pctSeekEnabled: (p, r) => p === null
    ? `${r.toFixed(1)}% of active ATS customers currently have SEEK enabled — this is the baseline penetration rate.`
    : p >= 10
    ? `SEEK penetration rate is up ${p}% to ${r.toFixed(1)}% of active ATS customers. Growing penetration means the integration is reaching a broader share of the eligible base, which is a strong signal of product-market fit in ANZ.`
    : p >= 0
    ? `SEEK penetration rate grew ${p}% to ${r.toFixed(1)}%. Incremental growth is positive, but if the total ATS customer base is also growing, a flat penetration rate may indicate new customers aren't discovering or activating SEEK at the same rate.`
    : `SEEK penetration dropped ${Math.abs(p)}% to ${r.toFixed(1)}%. With a shrinking share of ATS customers using SEEK, it's worth reviewing whether recent product changes or competitive alternatives in ANZ are impacting adoption.`,

  postings: (p, r) => p === null
    ? `ANZ customers are averaging ${Math.round(r).toLocaleString()} SEEK postings per period with no historical baseline.`
    : p >= 10
    ? `Job postings through SEEK are up ${p}% — growing posting volume is the direct outcome that justifies the integration investment. Monitor whether applicant volumes are scaling proportionally as more jobs reach the SEEK network.`
    : p >= 0
    ? `Postings grew ${p}%, a steady increase. If customer count is growing faster than posting volume, it may indicate newer customers are activating SEEK but posting less frequently — an onboarding or activation gap worth investigating.`
    : `Postings declined ${Math.abs(p)}%. This could reflect seasonal hiring slowdowns in ANZ or customers reducing their SEEK activity. Cross-reference with customers posting to check whether fewer customers are active or whether existing customers are posting less.`,

  customersPosting: (p, r) => p === null
    ? `${Math.round(r)} customers are actively posting through SEEK with no prior period to compare.`
    : p >= 0
    ? `The number of customers actively posting grew ${p}%, indicating broader participation across the ANZ customer base. Growing breadth here is a healthy sign — concentration risk increases when total postings rely on a small number of active accounts.`
    : `Fewer customers posted through SEEK this period (down ${Math.abs(p)}%). Even if total posting volume is stable, a narrowing customer base suggests concentration risk. Identifying and re-engaging lapsed posters should be a priority.`,

  totalAnzCustomers: (p, r) => p === null
    ? `The ANZ customer base currently stands at ${Math.round(r).toLocaleString()} with no prior period to compare.`
    : p >= 0
    ? `The ANZ customer base grew ${p}% to ${Math.round(r).toLocaleString()}. A growing total base expands the potential pool for SEEK adoption — track whether SEEK penetration rate is keeping pace with this growth.`
    : `The ANZ customer base contracted ${Math.abs(p)}% to ${Math.round(r).toLocaleString()}. Customer churn in the region would naturally compress SEEK-enabled counts; normalising SEEK metrics against total customers will give a clearer picture of true adoption trends.`,

  activeAts: (p, r) => p === null
    ? `${Math.round(r).toLocaleString()} ANZ customers are actively using ATS — this is the addressable market for SEEK enablement.`
    : p >= 0
    ? `Active ATS customers in ANZ grew ${p}% to ${Math.round(r).toLocaleString()}. A larger active ATS base means more customers are eligible for SEEK — if SEEK penetration is held flat while active ATS grows, absolute SEEK-enabled counts should grow automatically.`
    : `Active ATS customers declined ${Math.abs(p)}% to ${Math.round(r).toLocaleString()}. Since SEEK enablement requires active ATS usage, a contracting ATS base puts a ceiling on SEEK growth. Focus on understanding what's driving reduced ATS activity in the region.`,
};

// ── SeekInsight sub-component ────────────────────────────────────────────────

interface SeekInsightProps {
  data: SeekRow[];
  metricKey: keyof SeekRow;
  isPct?: boolean;
}

const SeekInsight: React.FC<SeekInsightProps> = ({ data, metricKey, isPct = false }) => {
  const { recentAvg, prevAvg, changePct } = computePeriodStats(data, metricKey);
  const isPositive = changePct !== null ? changePct >= 0 : null;
  const insightFn = INSIGHTS[metricKey as string];
  const insight = insightFn ? insightFn(changePct, recentAvg, prevAvg) : null;

  function fmtVal(n: number) {
    if (isPct) return `${n.toFixed(1)}%`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return Math.round(n).toString();
  }

  return (
    <InsightBox>
      <InsightStats>
        <div>
          <InsightStatLabel>Recent avg</InsightStatLabel>
          <InsightStatValue>{fmtVal(recentAvg)}</InsightStatValue>
        </div>
        <div>
          <InsightStatLabel>Prior avg</InsightStatLabel>
          <InsightStatValue>{fmtVal(prevAvg)}</InsightStatValue>
        </div>
        <div>
          <InsightStatLabel>Change</InsightStatLabel>
          <InsightStatValue>
            <InsightChange positive={isPositive}>
              {changePct === null ? '—' : `${changePct >= 0 ? '+' : ''}${changePct}%`}
            </InsightChange>
          </InsightStatValue>
        </div>
      </InsightStats>
      {insight && <InsightText>{insight}</InsightText>}
    </InsightBox>
  );
};

// ── Chart component ──────────────────────────────────────────────────────────

interface SimpleChartProps {
  data: SeekRow[];
  dataKey: keyof SeekRow;
  label: string;
  color?: string;
  formatter?: (v: number) => string;
  isPct?: boolean;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, dataKey, label, color = colors.primary, formatter, isPct }) => {
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
          <Line type="monotone" dataKey={dataKey as string} stroke={color} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name={label} />
        </LineChart>
      </ResponsiveContainer>
      <SeekInsight data={data} metricKey={dataKey} isPct={isPct} />
    </ChartSection>
  );
};

// ── Main component ───────────────────────────────────────────────────────────

const ThreePGDashboard: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [seek, setSeek] = useState<SeekRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/sheets/paid-job-ads')
      .then(r => {
        if (!r.ok) return r.json().then(body => Promise.reject(`HTTP ${r.status}: ${body?.detail || body?.error || r.statusText}`));
        return r.json();
      })
      .then(d => setSeek(d.seek ?? []))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <ContentArea>
      <AreaHeader>
        <AreaTitle>3PG — SEEK</AreaTitle>
        <AreaDescription>
          ANZ customer adoption of SEEK job postings — ATS penetration, SEEK enablement, and posting activity
          {' · '}
          <a href="https://docs.google.com/spreadsheets/d/1t9RSWDSGYM0AAaUK6uZ7t0QURcGZAO6fV7UcVZ6EdUQ"
            target="_blank" rel="noopener noreferrer"
            style={{ color: 'inherit', opacity: 0.6, fontSize: 11 }}>
            Source: Google Sheet ↗
          </a>
        </AreaDescription>
      </AreaHeader>

      {loading && <ChartPlaceholder>Loading…</ChartPlaceholder>}
      {!loading && error && (
        <ChartPlaceholder>
          Could not load data<br />
          <span style={{ fontSize: 11, opacity: 0.7 }}>{error}</span>
        </ChartPlaceholder>
      )}

      {!loading && !error && (
        <>
          <MetricCardGrid>
            <CardContainer>
              <CardLabel>Total ANZ Customers</CardLabel>
              <CardValue>{fmt(latestVal(seek, 'totalAnzCustomers'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Active ATS</CardLabel>
              <CardValue>{fmt(latestVal(seek, 'activeAts'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>ATS Adoption</CardLabel>
              <CardValue>{fmtPct(latestVal(seek, 'atsAdoption'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>SEEK Enabled</CardLabel>
              <CardValue>{fmt(latestVal(seek, 'seekEnabled'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>% SEEK Enabled</CardLabel>
              <CardValue>{fmtPct(latestVal(seek, 'pctSeekEnabled'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Customers Posting</CardLabel>
              <CardValue>{fmt(latestVal(seek, 'customersPosting'))}</CardValue>
            </CardContainer>
          </MetricCardGrid>

          <SectionTitle>SEEK Enablement</SectionTitle>
          <SectionDescription>How many ATS customers have activated the SEEK integration</SectionDescription>
          <ChartGrid>
            <SimpleChart data={seek} dataKey="seekEnabled" label="SEEK Enabled Customers" color={colors.primary} />
            <SimpleChart data={seek} dataKey="pctSeekEnabled" label="% SEEK Enabled"
              color={colors.success} formatter={v => `${v.toFixed(1)}%`} isPct />
          </ChartGrid>

          <SectionTitle>Posting Activity</SectionTitle>
          <SectionDescription>Volume of job postings and breadth of customers actively using SEEK</SectionDescription>
          <ChartGrid>
            <SimpleChart data={seek} dataKey="postings" label="Job Postings" color={colors.primary} />
            <SimpleChart data={seek} dataKey="customersPosting" label="Customers Posting" color={colors.warning} />
          </ChartGrid>

          <SectionTitle>ATS Penetration</SectionTitle>
          <SectionDescription>Total addressable market in ANZ and how much of it is actively using ATS</SectionDescription>
          <ChartGrid>
            <SimpleChart data={seek} dataKey="totalAnzCustomers" label="Total ANZ Customers" color={colors.lightText} />
            <SimpleChart data={seek} dataKey="activeAts" label="Active ATS Customers" color={colors.primary} />
          </ChartGrid>
        </>
      )}
    </ContentArea>
  );
};

export default ThreePGDashboard;
