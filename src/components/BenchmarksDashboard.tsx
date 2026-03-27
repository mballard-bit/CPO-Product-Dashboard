import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
  LineChart, Line, Legend,
} from 'recharts';
import styled from 'styled-components';
import {
  colors, ContentArea, AreaHeader, AreaTitle, AreaDescription,
  ChartSection, ChartTitle, ChartPlaceholder, MetricCardGrid,
  CardContainer, CardLabel, CardValue,
} from '../styles/StyledComponents';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FeatureUsageRow { features: number; companies: number; }
interface AreaUsageRow { area: string; series: { month: string; users: number }[]; latestUsers: number; }
interface TopFeatureRow { feature: string; users: number; }

interface BenchmarksData {
  featureUsage: FeatureUsageRow[];
  areaUsage: AreaUsageRow[];
  topFeatures: TopFeatureRow[];
  latestMonth: string;
}

// ── Styled components ─────────────────────────────────────────────────────────

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
  flex-wrap: wrap;
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

const InsightText = styled.p`
  font-size: 12px;
  line-height: 1.6;
  color: ${colors.lightText};
  margin: 0;
  font-style: italic;
`;

const TierGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 10px 0;
`;

const TierCard = styled.div<{ tier: 'low' | 'mid' | 'high' }>`
  background: ${({ tier }) =>
    tier === 'low' ? '#fff5f5' :
    tier === 'mid' ? '#fff8f0' : '#f0faf4'};
  border: 1px solid ${({ tier }) =>
    tier === 'low' ? '#fecaca' :
    tier === 'mid' ? '#fed7aa' : '#bbf7d0'};
  border-radius: 8px;
  padding: 12px 14px;
`;

const TierLabel = styled.div<{ tier: 'low' | 'mid' | 'high' }>`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ tier }) =>
    tier === 'low' ? colors.error :
    tier === 'mid' ? colors.warning : colors.success};
  margin-bottom: 4px;
`;

const TierValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${colors.text};
`;

const TierSub = styled.div`
  font-size: 11px;
  color: ${colors.lightText};
  margin-top: 2px;
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

const TICK = { fontSize: 10, fill: colors.lightText };
const TOOLTIP_STYLE = { fontSize: 12, border: `1px solid ${colors.border}`, borderRadius: 6 };

// Color bars by feature count — light blue → deep blue
function featureColor(features: number): string {
  const ratio = (features - 1) / 12;
  const r = Math.round(219 - (219 - 37) * ratio);
  const g = Math.round(234 - (234 - 99) * ratio);
  const b = Math.round(254 - (254 - 235) * ratio);
  return `rgb(${r},${g},${b})`;
}

// Area colors
const AREA_COLORS: Record<string, string> = {
  'Employees': colors.primary,
  'Time Off': colors.success,
  'Admin': colors.warning,
  'Onboarding': '#8b5cf6',
  'Payroll': '#ec4899',
  'Reporting and Analytics': '#06b6d4',
  'Time Tracking': '#f97316',
  'Benefits': '#84cc16',
};

function computeFeatureStats(data: FeatureUsageRow[]) {
  const total = data.reduce((s, r) => s + r.companies, 0);
  let cumulative = 0;
  let median = 1;
  for (const row of [...data].sort((a, b) => a.features - b.features)) {
    cumulative += row.companies;
    if (cumulative >= total / 2) { median = row.features; break; }
  }
  const low = data.filter(r => r.features <= 2).reduce((s, r) => s + r.companies, 0);
  const mid = data.filter(r => r.features >= 3 && r.features <= 5).reduce((s, r) => s + r.companies, 0);
  const high = data.filter(r => r.features >= 6).reduce((s, r) => s + r.companies, 0);
  return { total, median, low, mid, high };
}

function featureInsightText(stats: ReturnType<typeof computeFeatureStats>): string {
  const { total, median, high, low } = stats;
  const highPct = Math.round((high / total) * 100);
  const lowPct = Math.round((low / total) * 100);

  if (highPct >= 40) {
    return `${highPct}% of Elite customers are using 6 or more features — a strong indicator of deep product adoption. Customers in the high-engagement tier show significantly higher retention and expansion rates. With a median of ${median} features, the average customer is accessing meaningful breadth of the package.`;
  }
  if (median <= 3) {
    return `The median Elite customer uses only ${median} features, and ${lowPct}% use just 1–2. These low-engagement customers are at elevated churn risk — they're paying for Elite but capturing only a fraction of the value. Proactive customer success outreach focused on feature discovery for the 1–2 feature cohort should be a near-term priority.`;
  }
  return `With a median of ${median} features, Elite customers are using a moderate breadth of the package. ${highPct}% are deep users (6+ features), while ${lowPct}% are underutilising the tier. The opportunity is to move the mid-tier cohort (3–5 features) toward higher engagement, where retention and NPS are strongest.`;
}

function areaInsightText(area: string, users: number, change: number | null): string {
  const AREA_DESC: Record<string, { role: string; low: string; high: string }> = {
    'Employees': {
      role: 'core people management workflows',
      high: 'Employee management is the most foundational area — high adoption here confirms the product is embedded in daily HR operations.',
      low: 'Low employee management usage may indicate customers are managing people data outside BambooHR or have incomplete onboarding.',
    },
    'Time Off': {
      role: 'leave and absence tracking',
      high: 'Time Off is a high-frequency, high-visibility feature — strong adoption here directly drives daily active usage and improves retention.',
      low: 'Time Off underusage often means customers are still tracking leave in spreadsheets, which is a significant activation gap to address.',
    },
    'Onboarding': {
      role: 'new hire onboarding workflows',
      high: 'Onboarding adoption signals customers are using BambooHR as their system of record for new hires — a strong retention driver tied to hiring activity.',
      low: 'Low Onboarding usage is a missed opportunity: automated onboarding reduces HR admin time and increases employee satisfaction from day one.',
    },
    'Payroll': {
      role: 'payroll processing',
      high: 'Payroll is the highest-stickiness feature in the product. Customers running payroll through BambooHR are highly unlikely to churn.',
      low: 'Low Payroll adoption means revenue from this module is concentrated, and customers not yet using it represent a significant expansion opportunity.',
    },
    'Reporting and Analytics': {
      role: 'HR reporting and insights',
      high: 'Reporting adoption indicates customers are using BambooHR as a strategic data source, not just an operational tool — a strong signal of platform maturity.',
      low: 'Underuse of Reporting often means customers are exporting data to external tools. Closing this gap creates stickiness and positions BambooHR as the analytics layer.',
    },
    'Admin': {
      role: 'administrative and settings workflows',
      high: 'Admin usage reflects how deeply customers have configured the platform. High admin activity typically precedes broader feature adoption.',
      low: 'Low admin usage may indicate customers are under-configured, limiting the value they can get from other features.',
    },
  };

  const desc = AREA_DESC[area];
  if (!desc) return `${area} had ${users.toLocaleString()} active users in the most recent period.`;
  const trend = change === null ? '' : change >= 0 ? ` Usage is up ${change}% vs the prior period.` : ` Usage is down ${Math.abs(change)}% vs the prior period.`;
  return `${users.toLocaleString()} users active in ${area} (${desc.role}).${trend} ${change !== null && change < 0 ? desc.low : desc.high}`;
}

// ── Main component ────────────────────────────────────────────────────────────

const BenchmarksDashboard: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [data, setData] = useState<BenchmarksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/tableau/elite-benchmarks')
      .then(r => {
        if (!r.ok) return r.json().then(body => Promise.reject(`HTTP ${r.status}: ${body?.detail || body?.error || r.statusText}`));
        return r.json();
      })
      .then(d => setData(d))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const featureUsage = data?.featureUsage ?? [];
  const areaUsage = data?.areaUsage ?? [];
  const topFeatures = data?.topFeatures ?? [];

  const featStats = featureUsage.length > 0 ? computeFeatureStats(featureUsage) : null;

  // Build a combined area trend chart using all areas' series
  const allMonths = areaUsage.length > 0
    ? areaUsage[0].series.map(s => s.month)
    : [];
  const areaChartData = allMonths.map(month => {
    const point: Record<string, any> = { month };
    areaUsage.forEach(a => {
      const s = a.series.find(s => s.month === month);
      if (s) point[a.area] = s.users;
    });
    return point;
  });

  return (
    <ContentArea>
      <AreaHeader>
        <AreaTitle>Feature Usage</AreaTitle>
        <AreaDescription>
          Product feature adoption and usage depth across the customer base
          {' · '}
          <a href="https://prod-useast-b.online.tableau.com/#/site/bamboohr/views/ElitePackage/FeatureUsageOverview"
            target="_blank" rel="noopener noreferrer"
            style={{ color: 'inherit', opacity: 0.6, fontSize: 11 }}>
            Source: Tableau ↗
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

      {!loading && !error && data && (
        <>
          {/* Feature adoption summary cards */}
          {featStats && (
            <MetricCardGrid>
              <CardContainer>
                <CardLabel>Elite Customers</CardLabel>
                <CardValue>{featStats.total.toLocaleString()}</CardValue>
              </CardContainer>
              <CardContainer>
                <CardLabel>Median Features Used</CardLabel>
                <CardValue>{featStats.median}</CardValue>
              </CardContainer>
              <CardContainer>
                <CardLabel>High Adoption (6+)</CardLabel>
                <CardValue>{Math.round((featStats.high / featStats.total) * 100)}%</CardValue>
              </CardContainer>
              <CardContainer>
                <CardLabel>Mid Adoption (3–5)</CardLabel>
                <CardValue>{Math.round((featStats.mid / featStats.total) * 100)}%</CardValue>
              </CardContainer>
              <CardContainer>
                <CardLabel>Low Adoption (1–2)</CardLabel>
                <CardValue>{Math.round((featStats.low / featStats.total) * 100)}%</CardValue>
              </CardContainer>
            </MetricCardGrid>
          )}

          {/* Feature count distribution */}
          <SectionTitle>Feature Adoption Distribution</SectionTitle>
          <SectionDescription>
            How many Elite customers are actively using each number of available features
          </SectionDescription>

          {featStats && (
            <TierGrid>
              <TierCard tier="low">
                <TierLabel tier="low">Low (1–2 features)</TierLabel>
                <TierValue>{featStats.low}</TierValue>
                <TierSub>{Math.round((featStats.low / featStats.total) * 100)}% of customers · at-risk cohort</TierSub>
              </TierCard>
              <TierCard tier="mid">
                <TierLabel tier="mid">Mid (3–5 features)</TierLabel>
                <TierValue>{featStats.mid}</TierValue>
                <TierSub>{Math.round((featStats.mid / featStats.total) * 100)}% of customers · growth opportunity</TierSub>
              </TierCard>
              <TierCard tier="high">
                <TierLabel tier="high">High (6+ features)</TierLabel>
                <TierValue>{featStats.high}</TierValue>
                <TierSub>{Math.round((featStats.high / featStats.total) * 100)}% of customers · healthy adopters</TierSub>
              </TierCard>
            </TierGrid>
          )}

          {featureUsage.length > 0 && (
            <ChartSection>
              <ChartTitle>Customers by Number of Features Used</ChartTitle>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={featureUsage} margin={{ top: 4, right: 8, bottom: 16, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="features" tick={TICK} tickLine={false}
                    label={{ value: 'Number of Features', position: 'insideBottom', offset: -8, fontSize: 10, fill: colors.lightText }} />
                  <YAxis tick={TICK} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE}
                    formatter={(v: any) => [v, 'Companies']}
                    labelFormatter={(l) => `${l} feature${l === 1 ? '' : 's'}`} />
                  <Bar dataKey="companies" name="Companies" radius={[3, 3, 0, 0]}>
                    {featureUsage.map((entry) => (
                      <Cell key={entry.features} fill={featureColor(entry.features)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {featStats && (
                <InsightBox>
                  <InsightStats>
                    <div>
                      <InsightStatLabel>Total customers</InsightStatLabel>
                      <InsightStatValue>{featStats.total.toLocaleString()}</InsightStatValue>
                    </div>
                    <div>
                      <InsightStatLabel>Median features</InsightStatLabel>
                      <InsightStatValue>{featStats.median}</InsightStatValue>
                    </div>
                    <div>
                      <InsightStatLabel>6+ features</InsightStatLabel>
                      <InsightStatValue>{Math.round((featStats.high / featStats.total) * 100)}%</InsightStatValue>
                    </div>
                  </InsightStats>
                  <InsightText>{featureInsightText(featStats)}</InsightText>
                </InsightBox>
              )}
            </ChartSection>
          )}

          {/* Product area usage */}
          <SectionTitle>Usage by Product Area</SectionTitle>
          <SectionDescription>
            Active users across each product area — {data.latestMonth}
          </SectionDescription>

          {areaChartData.length > 0 && (
            <ChartSection>
              <ChartTitle>Active Users by Product Area Over Time</ChartTitle>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={areaChartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                  <XAxis dataKey="month" tick={TICK} tickLine={false} interval="preserveStartEnd"
                    tickFormatter={m => m.split(' ')[0].substring(0, 3)} />
                  <YAxis tick={TICK} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: colors.lightText }}
                    formatter={(v: any, name: any) => [Number(v).toLocaleString(), name]} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  {areaUsage.filter(a => a.latestUsers > 50).map(a => (
                    <Line key={a.area} type="monotone" dataKey={a.area}
                      stroke={AREA_COLORS[a.area] || colors.lightText}
                      strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </ChartSection>
          )}

          {/* Per-area insight cards */}
          <ChartGrid>
            {areaUsage.filter(a => a.latestUsers > 30).map(a => {
              const vals = a.series.map(s => s.users);
              const half = Math.ceil(vals.length / 2);
              const recentAvg = vals.slice(-half).reduce((s, v) => s + v, 0) / (half || 1);
              const prevVals = vals.slice(0, vals.length - half);
              const prevAvg = prevVals.length > 0 ? prevVals.reduce((s, v) => s + v, 0) / prevVals.length : 0;
              const changePct = prevAvg > 0 ? Math.round(((recentAvg - prevAvg) / prevAvg) * 100) : null;
              const isPositive = changePct !== null ? changePct >= 0 : null;

              return (
                <ChartSection key={a.area}>
                  <ChartTitle>{a.area}</ChartTitle>
                  <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={a.series} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                      <XAxis dataKey="month" tick={TICK} tickLine={false} interval="preserveStartEnd"
                        tickFormatter={m => m.split(' ')[0].substring(0, 3)} />
                      <YAxis tick={TICK} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE}
                        formatter={(v: any) => [Number(v).toLocaleString(), 'Active Users']} />
                      <Bar dataKey="users" fill={AREA_COLORS[a.area] || colors.primary} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <InsightBox>
                    <InsightStats>
                      <div>
                        <InsightStatLabel>Latest users</InsightStatLabel>
                        <InsightStatValue>{a.latestUsers.toLocaleString()}</InsightStatValue>
                      </div>
                      <div>
                        <InsightStatLabel>Change</InsightStatLabel>
                        <InsightStatValue>
                          <span style={{ color: isPositive === null ? colors.lightText : isPositive ? colors.success : colors.error, fontWeight: 600, fontSize: 13 }}>
                            {changePct === null ? '—' : `${changePct >= 0 ? '+' : ''}${changePct}%`}
                          </span>
                        </InsightStatValue>
                      </div>
                    </InsightStats>
                    <InsightText>{areaInsightText(a.area, a.latestUsers, changePct)}</InsightText>
                  </InsightBox>
                </ChartSection>
              );
            })}
          </ChartGrid>

          {/* Top features */}
          <SectionTitle>Most Used Features</SectionTitle>
          <SectionDescription>
            Top features by distinct active users — {data.latestMonth}
          </SectionDescription>

          {topFeatures.length > 0 && (
            <ChartSection>
              <ChartTitle>Top 15 Features by Active Users</ChartTitle>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topFeatures} layout="vertical"
                  margin={{ top: 4, right: 60, bottom: 0, left: 130 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
                  <XAxis type="number" tick={TICK} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: colors.text }}
                    tickLine={false} axisLine={false} width={130} />
                  <Tooltip contentStyle={TOOLTIP_STYLE}
                    formatter={(v: any) => [Number(v).toLocaleString(), 'Active Users']} />
                  <Bar dataKey="users" fill={colors.primary} radius={[0, 3, 3, 0]}
                    label={{ position: 'right', fontSize: 10, fill: colors.lightText,
                      formatter: (v: any) => Number(v).toLocaleString() }} />
                </BarChart>
              </ResponsiveContainer>
              <InsightBox>
                <InsightText>
                  {topFeatures[0] && `${topFeatures[0].feature} leads with ${topFeatures[0].users.toLocaleString()} active users, confirming it as the product's highest-frequency touchpoint. `}
                  The top features represent the core daily workflows customers rely on most — these are the areas where reliability, performance, and UX quality have the highest impact on customer satisfaction and NPS. Features with high usage but low NPS correlation are candidates for deeper quality investment.
                </InsightText>
              </InsightBox>
            </ChartSection>
          )}
        </>
      )}
    </ContentArea>
  );
};

export default BenchmarksDashboard;
