import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendChartConfig } from '../types';
import { ChartSection, ChartTitle, ChartPlaceholder, colors } from '../styles/StyledComponents';
import QoQInsight from './QoQInsight';

interface Props {
  config: TrendChartConfig;
  refreshKey: number;
}

interface DataPoint {
  date: string;
  value: number;
}

const TrendChart: React.FC<Props> = ({ config, refreshKey }) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);

    fetch(`/api/pendo/timeseries?type=${config.type}&id=${encodeURIComponent(config.id)}&days=30`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.results) { setError(true); return; }
        const points: DataPoint[] = (d.results as Array<{ day: number; numVisitors: number; numEvents: number }>)
          .map(row => ({
            date: new Date(row.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: config.metric === 'events' ? row.numEvents : row.numVisitors,
          }));
        setData(points);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.type, config.id, config.metric, refreshKey]);

  return (
    <ChartSection>
      <ChartTitle>{config.label}</ChartTitle>
      {loading && <ChartPlaceholder>Loading…</ChartPlaceholder>}
      {!loading && (error || data.length === 0) && (
        <ChartPlaceholder>No data available</ChartPlaceholder>
      )}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: colors.lightText }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: colors.lightText }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 12, border: `1px solid ${colors.border}`, borderRadius: 6 }}
              labelStyle={{ color: colors.lightText }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors.primary}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              name={config.metric === 'events' ? 'Events' : 'Visitors'}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
      <QoQInsight
        type={config.type}
        id={config.id}
        label={config.label}
        refreshKey={refreshKey}
      />
    </ChartSection>
  );
};

export default TrendChart;
