import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/StyledComponents';

interface Props {
  type: 'page' | 'feature';
  id: string;
  label: string;
  refreshKey: number;
}

interface QoQData {
  current: number;
  previous: number;
  changePct: number | null;
  insight: string | null;
}

const Container = styled.div`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${colors.border};
`;

const Stats = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
`;

const Stat = styled.div``;

const StatLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${colors.lightText};
  margin-bottom: 2px;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${colors.text};
`;

const Change = styled.span<{ positive: boolean | null }>`
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

const InsightLoading = styled.div`
  font-size: 12px;
  color: ${colors.lightText};
  font-style: italic;
`;

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

const QoQInsight: React.FC<Props> = ({ type, id, label, refreshKey }) => {
  const [data, setData] = useState<QoQData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setData(null);
    fetch(`/api/pendo/qoq?type=${type}&id=${encodeURIComponent(id)}&label=${encodeURIComponent(label)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, id, label, refreshKey]);

  if (loading) return <Container><InsightLoading>Generating insight…</InsightLoading></Container>;
  if (!data) return null;

  const { current, previous, changePct, insight } = data;
  const isPositive = changePct !== null ? changePct >= 0 : null;

  return (
    <Container>
      <Stats>
        <Stat>
          <StatLabel>Current 90 days</StatLabel>
          <StatValue>{fmt(current)}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Previous 90 days</StatLabel>
          <StatValue>{fmt(previous)}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>QoQ Change</StatLabel>
          <StatValue>
            <Change positive={isPositive}>
              {changePct === null ? '—' : `${changePct >= 0 ? '+' : ''}${changePct}%`}
            </Change>
          </StatValue>
        </Stat>
      </Stats>
      {insight && <InsightText>{insight}</InsightText>}
    </Container>
  );
};

export default QoQInsight;
