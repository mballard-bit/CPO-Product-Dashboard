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

interface SimpleChartProps {
  data: SeekRow[];
  dataKey: keyof SeekRow;
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
            formatter={formatter ? (v: any) => [formatter(v as number), label] : undefined} />
          <Line type="monotone" dataKey={dataKey as string} stroke={color} strokeWidth={2}
            dot={false} activeDot={{ r: 4 }} name={label} />
        </LineChart>
      </ResponsiveContainer>
    </ChartSection>
  );
};

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
          <ChartGrid>
            <SimpleChart data={seek} dataKey="seekEnabled" label="SEEK Enabled Customers" color={colors.primary} />
            <SimpleChart data={seek} dataKey="pctSeekEnabled" label="% SEEK Enabled"
              color={colors.success} formatter={v => `${v.toFixed(1)}%`} />
          </ChartGrid>

          <SectionTitle>Posting Activity</SectionTitle>
          <ChartGrid>
            <SimpleChart data={seek} dataKey="postings" label="Job Postings" color={colors.primary} />
            <SimpleChart data={seek} dataKey="customersPosting" label="Customers Posting" color={colors.warning} />
          </ChartGrid>

          <SectionTitle>ATS Penetration</SectionTitle>
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
