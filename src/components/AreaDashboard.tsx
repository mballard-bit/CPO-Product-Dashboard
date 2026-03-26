import React, { useEffect, useState } from 'react';
import { ProductArea, MetricValue, FeatureBarValue, AppTotals } from '../types';
import { fetchMetricValue, fetchRawFeatureData, computeFeatureBar, fetchAppTotals, fetchBaseTotals } from '../services/pendoApi';
import MetricCard from './MetricCard';
import FeatureBar from './FeatureBar';
import TrendChart from './TrendChart';
import {
  ContentArea, AreaHeader, AreaTitle, AreaDescription,
  MetricCardGrid, FeatureSection, FeatureSectionTitle, Button, ChartGrid
} from '../styles/StyledComponents';

interface Props {
  area: ProductArea;
  refreshKey: number;
}

const loadingMetric: MetricValue = { value: null, previousValue: null, loading: true, error: false };
const loadingBar: FeatureBarValue = { percent: null, loading: true, error: false };

const AreaDashboard: React.FC<Props> = ({ area, refreshKey }) => {
  const [metricValues, setMetricValues] = useState<MetricValue[]>(
    area.metricCards.map(() => loadingMetric)
  );
  const [featureValues, setFeatureValues] = useState<FeatureBarValue[]>(
    area.featureRows.map(() => loadingBar)
  );
  const [allFailed, setAllFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setMetricValues(area.metricCards.map(() => loadingMetric));
    setFeatureValues(area.featureRows.map(() => loadingBar));
    setAllFailed(false);

    let cancelled = false;

    async function load() {
      // Fire all requests in parallel — no sequential waterfall
      const [totals, metricResults, featureRaws] = await Promise.all([
        area.featureBarBase ? fetchBaseTotals(area.featureBarBase) : fetchAppTotals(),
        Promise.all(area.metricCards.map(card => fetchMetricValue(card))),
        Promise.all(area.featureRows.map(row => fetchRawFeatureData(row))),
      ]);
      if (cancelled) return;

      const metricVals: MetricValue[] = metricResults.map(r => ({
        value: r.current,
        previousValue: null,
        loading: false,
        error: r.current === null,
      }));
      setMetricValues(metricVals);
      if (metricVals.every(v => v.error)) setAllFailed(true);

      setFeatureValues(featureRaws.map((raw, i) =>
        computeFeatureBar(raw, area.featureRows[i], totals)
      ));
    }

    load();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [area.id, refreshKey, retryKey]);

  if (allFailed) {
    return (
      <ContentArea>
        <AreaHeader>
          <AreaTitle>{area.name}</AreaTitle>
          <AreaDescription>Could not load data. Check your Pendo API key and network.</AreaDescription>
        </AreaHeader>
        <Button onClick={() => setRetryKey(k => k + 1)}>Retry</Button>
      </ContentArea>
    );
  }

  return (
    <ContentArea>
      <AreaHeader>
        <AreaTitle>{area.name}</AreaTitle>
        <AreaDescription>{area.description}</AreaDescription>
      </AreaHeader>

      <MetricCardGrid>
        {area.metricCards.map((card, i) => (
          <MetricCard key={card.label} card={card} value={metricValues[i]} />
        ))}
      </MetricCardGrid>

      {area.featureRows.length > 0 && (
        <FeatureSection>
          <FeatureSectionTitle>Key Feature Usage</FeatureSectionTitle>
          {area.featureRows.map((row, i) => (
            <FeatureBar key={row.pendoId} label={row.label} value={featureValues[i]} />
          ))}
        </FeatureSection>
      )}

      {area.trendCharts && area.trendCharts.length > 0 && (
        <ChartGrid>
          {area.trendCharts.map(chart => (
            <TrendChart key={chart.id} config={chart} refreshKey={refreshKey} />
          ))}
        </ChartGrid>
      )}
    </ContentArea>
  );
};

export default AreaDashboard;
