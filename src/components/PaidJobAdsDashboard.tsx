import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import styled from 'styled-components';
import { colors, ContentArea, AreaHeader, AreaTitle, AreaDescription, ChartSection, ChartTitle, ChartPlaceholder, MetricCardGrid, CardContainer, CardLabel, CardValue } from '../styles/StyledComponents';

interface AtsRow {
  week: string;
  atsCustomers: number | null;
  calConnected: number | null;
  customersInviting: number | null;
  interviewsScheduled: number | null;
  interviewsPerActive: number | null;
  pctScheduling: number | null;
  invitesSent: number | null;
  acceptanceRate: number | null;
}

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
  ats: AtsRow[];
  jobs: JobRow[];
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
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid ${colors.border};
`;

function fmt(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return n >= 10000 ? `${(n / 1000).toFixed(0)}k` : `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function fmtRevenue(n: number | null): string {
  if (n === null) return '—';
  return `$${n.toLocaleString()}`;
}

function latestVal(arr: any[], key: string): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i][key] !== null) return arr[i][key];
  }
  return null;
}

const TICK_STYLE = { fontSize: 10, fill: colors.lightText };

interface SimpleChartProps {
  data: any[];
  dataKey: string;
  label: string;
  color?: string;
  formatter?: (v: number) => string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, dataKey, label, color = colors.primary, formatter }) => {
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
          <XAxis dataKey="week" tick={TICK_STYLE} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={TICK_STYLE} tickLine={false} axisLine={false} allowDecimals={false}
            tickFormatter={formatter} />
          <Tooltip contentStyle={{ fontSize: 12, border: `1px solid ${colors.border}`, borderRadius: 6 }}
            labelStyle={{ color: colors.lightText }}
            formatter={formatter ? (v: number) => formatter(v) : undefined} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false}
            activeDot={{ r: 4 }} name={label} />
        </LineChart>
      </ResponsiveContainer>
    </ChartSection>
  );
};

const PaidJobAdsDashboard: React.FC<{ refreshKey: number }> = ({ refreshKey }) => {
  const [data, setData] = useState<SheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch('/api/sheets/paid-job-ads')
      .then(r => r.ok ? r.json() : Promise.reject(r))
      .then(d => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const latestLiRevenue = latestVal(data?.jobs ?? [], 'liRevenue');
  const latestBhrRevenue = latestVal(data?.jobs ?? [], 'bhrRevenue');
  const latestJobsPosted = latestVal(data?.jobs ?? [], 'jobsPosted');
  const latestInterviews = latestVal(data?.ats ?? [], 'interviewsScheduled');
  const latestInvites = latestVal(data?.ats ?? [], 'invitesSent');
  const latestAcceptance = latestVal(data?.ats ?? [], 'acceptanceRate');

  return (
    <ContentArea>
      <AreaHeader>
        <AreaTitle>Paid Job Ads</AreaTitle>
        <AreaDescription>LinkedIn job posting usage, revenue, and ATS interview scheduling — sourced from Google Sheets</AreaDescription>
      </AreaHeader>

      {loading && <ChartPlaceholder>Loading…</ChartPlaceholder>}
      {!loading && error && <ChartPlaceholder>Could not load Google Sheets data</ChartPlaceholder>}

      {!loading && !error && data && (
        <>
          <MetricCardGrid>
            <CardContainer>
              <CardLabel>LI Monthly Revenue</CardLabel>
              <CardValue>{fmtRevenue(latestLiRevenue)}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>BHR Revenue</CardLabel>
              <CardValue>{fmtRevenue(latestBhrRevenue)}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Jobs Posted (Est)</CardLabel>
              <CardValue>{fmt(latestJobsPosted)}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Interviews Scheduled</CardLabel>
              <CardValue>{fmt(latestInterviews)}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Invites Sent</CardLabel>
              <CardValue>{fmt(latestInvites)}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Acceptance Rate</CardLabel>
              <CardValue>{latestAcceptance !== null ? `${latestAcceptance}%` : '—'}</CardValue>
            </CardContainer>
          </MetricCardGrid>

          <SectionTitle>LinkedIn Job Posting</SectionTitle>
          <ChartGrid>
            <SimpleChart data={data.jobs} dataKey="liRevenue" label="LI Monthly Revenue"
              color={colors.success} formatter={v => `$${v.toLocaleString()}`} />
            <SimpleChart data={data.jobs} dataKey="bhrRevenue" label="BHR Revenue"
              color={colors.primary} formatter={v => `$${v.toLocaleString()}`} />
            <SimpleChart data={data.jobs} dataKey="jobsPosted" label="Jobs Posted (Est)" />
            <SimpleChart data={data.jobs} dataKey="views" label="Job Views" />
            <SimpleChart data={data.jobs} dataKey="applicants" label="Applicants" />
            <SimpleChart data={data.jobs} dataKey="hired" label="Hired" color={colors.success} />
          </ChartGrid>

          <SectionTitle>ATS Interview Scheduling</SectionTitle>
          <ChartGrid>
            <SimpleChart data={data.ats} dataKey="interviewsScheduled" label="Interviews Scheduled" />
            <SimpleChart data={data.ats} dataKey="invitesSent" label="Invites Sent" />
            <SimpleChart data={data.ats} dataKey="customersInviting" label="Customers Inviting" />
            <SimpleChart data={data.ats} dataKey="acceptanceRate" label="Acceptance Rate %"
              formatter={v => `${v}%`} />
          </ChartGrid>
        </>
      )}
    </ContentArea>
  );
};

export default PaidJobAdsDashboard;
