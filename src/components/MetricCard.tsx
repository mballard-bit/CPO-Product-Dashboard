import React from 'react';
import { MetricCard as MetricCardType, MetricValue } from '../types';
import {
  CardContainer, CardLabel, CardValue, CardTrend, CardPlaceholder, ErrorText
} from '../styles/StyledComponents';

interface Props {
  card: MetricCardType;
  value: MetricValue;
}

function formatValue(n: number, format: MetricCardType['format']): string {
  if (format === 'percent') return `${n}%`;
  if (format === 'score') return String(n);
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function trendLabel(current: number, previous: number | null): { text: string; positive: boolean } | null {
  if (previous == null || previous === 0) return null;
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? '↑' : '↓';
  return { text: `${sign} ${Math.abs(delta).toFixed(1)}% vs last period`, positive: delta >= 0 };
}

const MetricCard: React.FC<Props> = ({ card, value }) => {
  return (
    <CardContainer>
      <CardLabel>{card.label}</CardLabel>
      {value.loading && <CardPlaceholder>—</CardPlaceholder>}
      {!value.loading && value.error && (
        <>
          <CardPlaceholder>—</CardPlaceholder>
          <ErrorText>unavailable</ErrorText>
        </>
      )}
      {!value.loading && !value.error && value.value != null && (
        <>
          <CardValue>{formatValue(value.value, card.format)}</CardValue>
          {card.showTrend && value.value != null && (() => {
            const trend = trendLabel(value.value!, value.previousValue);
            return trend
              ? <CardTrend positive={trend.positive}>{trend.text}</CardTrend>
              : null;
          })()}
        </>
      )}
    </CardContainer>
  );
};

export default MetricCard;
