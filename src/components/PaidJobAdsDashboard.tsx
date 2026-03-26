import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import styled from 'styled-components';
import {
  colors, ContentArea, AreaHeader, AreaTitle, AreaDescription,
  ChartSection, ChartTitle, ChartPlaceholder, MetricCardGrid,
  CardContainer, CardLabel, CardValue,
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

function fmtRevenue(n: number | null): string {
  if (n === null) return '—';
  return `$${n.toLocaleString()}`;
}

function fmt(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function latestVal(arr: any[], key: string): number | null {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i][key] !== null) return arr[i][key];
  }
  return null;
}

const TICK = { fontSize: 10, fill: colors.lightText };
const TOOLTIP_STYLE = { fontSize: 12, border: `1px solid ${colors.border}`, borderRadius: 6 };

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
          <XAxis dataKey="week" tick={TICK} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={TICK} tickLine={false} axisLine={false} allowDecimals={false}
            tickFormatter={formatter} />
          <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: colors.lightText }}
            formatter={formatter ? (v: number) => [formatter(v), label] : undefined} />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name={label} />
        </LineChart>
      </ResponsiveContainer>
    </ChartSection>
  );
};

// Combined revenue chart showing LI Revenue + BHR Revenue on one chart
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
            formatter={(v: number) => [`$${v.toLocaleString()}`, '']} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="liRevenue" stroke={colors.success} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name="LI Monthly Revenue" />
          <Line type="monotone" dataKey="bhrRevenue" stroke={colors.primary} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name="BHR Revenue" />
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

  const jobs = data?.jobs ?? [];

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
          {/* Summary metric cards */}
          <MetricCardGrid>
            <CardContainer>
              <CardLabel>LI Monthly Revenue</CardLabel>
              <CardValue>{fmtRevenue(latestVal(jobs, 'liRevenue'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>BHR Revenue</CardLabel>
              <CardValue>{fmtRevenue(latestVal(jobs, 'bhrRevenue'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Jobs Posted to LI</CardLabel>
              <CardValue>{fmt(latestVal(jobs, 'jobsPostedToLI'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Total Views</CardLabel>
              <CardValue>{fmt(latestVal(jobs, 'views'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Applicants</CardLabel>
              <CardValue>{fmt(latestVal(jobs, 'applicants'))}</CardValue>
            </CardContainer>
            <CardContainer>
              <CardLabel>Hired</CardLabel>
              <CardValue>{fmt(latestVal(jobs, 'hired'))}</CardValue>
            </CardContainer>
          </MetricCardGrid>

          {/* Revenue */}
          <SectionTitle>Revenue</SectionTitle>
          <SectionDescription>LinkedIn and BHR revenue trends over time</SectionDescription>
          <FullWidthChart>
            <RevenueChart data={jobs} />
          </FullWidthChart>

          {/* Adoption */}
          <SectionTitle>Adoption</SectionTitle>
          <SectionDescription>How many customers are posting jobs and reaching LinkedIn</SectionDescription>
          <ChartGrid>
            <SimpleChart data={jobs} dataKey="jobsPostedToLI" label="Jobs Posted to LinkedIn" />
            <SimpleChart data={jobs} dataKey="customersPosted" label="Customers Posted" color={colors.warning} />
            <SimpleChart data={jobs} dataKey="firstTimePosting" label="First Time Posting" color={colors.success} />
            <SimpleChart data={jobs} dataKey="pctOfJobsPosted" label="% of Jobs Posted to LI"
              formatter={v => `${v.toFixed(2)}%`} />
          </ChartGrid>

          {/* Views */}
          <SectionTitle>Views</SectionTitle>
          <SectionDescription>Job listing visibility on LinkedIn</SectionDescription>
          <FullWidthChart>
            <SimpleChart data={jobs} dataKey="views" label="Total Job Views" color={colors.primary} />
          </FullWidthChart>

          {/* Applications */}
          <SectionTitle>Applications</SectionTitle>
          <SectionDescription>Applicant volume and hiring outcomes</SectionDescription>
          <ChartGrid>
            <SimpleChart data={jobs} dataKey="applicants" label="Applicants" color={colors.primary} />
            <SimpleChart data={jobs} dataKey="hired" label="Hired" color={colors.success} />
          </ChartGrid>
        </>
      )}
    </ContentArea>
  );
};

export default PaidJobAdsDashboard;
