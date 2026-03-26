import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { GuideCardConfig } from '../types';
import { colors } from '../styles/StyledComponents';

interface Props {
  config: GuideCardConfig;
  refreshKey: number;
}

interface GuideSummary {
  seen: { visitors: number; events: number };
  dismissed: { visitors: number; events: number };
  completed: { visitors: number; events: number };
  dismissalRate: number;
  completionRate: number;
}

const Card = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
`;

const CardTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${colors.primary};
    flex-shrink: 0;
  }
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${colors.text};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${colors.lightText};
  margin-top: 4px;
`;

const RateBar = styled.div`
  height: 6px;
  background: ${colors.border};
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  margin-bottom: 6px;
`;

const RateFill = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${({ color }) => color};
`;

const Legend = styled.div`
  display: flex;
  gap: 16px;
`;

const LegendItem = styled.div<{ color: string }>`
  font-size: 10px;
  color: ${colors.lightText};
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: ${({ color }) => color};
  }
`;

const Placeholder = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: ${colors.lightText};
`;

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const GuideStatsCard: React.FC<Props> = ({ config, refreshKey }) => {
  const [data, setData] = useState<GuideSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/pendo/guide-summary?guideId=${encodeURIComponent(config.guideId)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.guideId, refreshKey]);

  const engagedPct = data
    ? Math.min(100, Math.round(((data.seen.visitors - data.dismissed.visitors) / Math.max(data.seen.visitors, 1)) * 100))
    : 0;

  return (
    <Card>
      <CardTitle>{config.label}</CardTitle>
      {loading && <Placeholder>Loading…</Placeholder>}
      {!loading && !data && <Placeholder>No data</Placeholder>}
      {!loading && data && (
        <>
          <StatsRow>
            <Stat>
              <StatValue>{fmt(data.seen.visitors)}</StatValue>
              <StatLabel>Unique Views</StatLabel>
            </Stat>
            <Stat>
              <StatValue>{fmt(data.dismissed.visitors)}</StatValue>
              <StatLabel>Dismissed</StatLabel>
            </Stat>
            <Stat>
              <StatValue style={{ color: data.dismissalRate > 50 ? colors.error : colors.text }}>
                {data.dismissalRate}%
              </StatValue>
              <StatLabel>Dismissal Rate</StatLabel>
            </Stat>
            <Stat>
              <StatValue style={{ color: data.completed.visitors > 0 ? colors.success : colors.lightText }}>
                {data.completed.visitors}
              </StatValue>
              <StatLabel>Demo Requests</StatLabel>
            </Stat>
          </StatsRow>
          <RateBar>
            <RateFill width={engagedPct} color={colors.primary} />
            <RateFill width={data.dismissalRate} color={colors.border} />
          </RateBar>
          <Legend>
            <LegendItem color={colors.primary}>Engaged {engagedPct}%</LegendItem>
            <LegendItem color={colors.border}>Dismissed {data.dismissalRate}%</LegendItem>
          </Legend>
        </>
      )}
    </Card>
  );
};

export default GuideStatsCard;
