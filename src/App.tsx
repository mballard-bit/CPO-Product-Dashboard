import React, { useState, useCallback } from 'react';
import AREAS from './config/areaConfig';
import AreaDashboard from './components/AreaDashboard';
import AreaSettings from './components/AreaSettings';
import PaidJobAdsDashboard from './components/PaidJobAdsDashboard';
import ThreePGDashboard from './components/ThreePGDashboard';
import {
  AppContainer, Header, HeaderLeft, Title, Subtitle,
  HeaderActions, Button, TabBar, Tab
} from './styles/StyledComponents';

const STORAGE_KEY = 'cpo_dashboard_enabled_areas';

const PAID_ADS_AREA = { id: 'paid-job-ads', name: 'Paid Job Ads' };
const THREE_PG_AREA = { id: '3pg', name: '3PG' };
const ALL_AREA_IDS = [...AREAS.map(a => a.id), PAID_ADS_AREA.id, THREE_PG_AREA.id];

function loadEnabledIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure paid-job-ads is included if not explicitly stored (migration)
        const set = new Set(parsed);
        if (!parsed.includes(PAID_ADS_AREA.id)) set.add(PAID_ADS_AREA.id);
        if (!parsed.includes(THREE_PG_AREA.id)) set.add(THREE_PG_AREA.id);
        return set;
      }
    }
  } catch { /* ignore */ }
  return new Set(ALL_AREA_IDS);
}

function saveEnabledIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

const App: React.FC = () => {
  const [enabledIds, setEnabledIds] = useState<Set<string>>(loadEnabledIds);
  const visibleAreas = AREAS.filter(a => enabledIds.has(a.id));
  const paidAdsVisible = enabledIds.has(PAID_ADS_AREA.id);
  const threePgVisible = enabledIds.has(THREE_PG_AREA.id);
  const [activeId, setActiveId] = useState<string>(() => visibleAreas[0]?.id ?? AREAS[0].id);
  const PAID_ADS_ID = PAID_ADS_AREA.id;
  const THREE_PG_ID = THREE_PG_AREA.id;
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const handleToggle = useCallback((id: string) => {
    setEnabledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
        if (id === activeId) {
          const remaining = [...AREAS.filter(a => next.has(a.id)), ...(next.has(PAID_ADS_ID) ? [PAID_ADS_AREA] : [])];
          setActiveId(remaining[0]?.id ?? '');
        }
      } else {
        next.add(id);
      }
      saveEnabledIds(next);
      return next;
    });
  }, [activeId, PAID_ADS_ID]);

  const activeArea = AREAS.find(a => a.id === activeId) ?? visibleAreas[0];

  return (
    <AppContainer>
      <Header>
        <HeaderLeft>
          <Title>Product Usage Dashboard</Title>
          <Subtitle>Live data · Last 30 days</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <Button onClick={() => setRefreshKey(k => k + 1)}>Refresh</Button>
          <Button onClick={() => setShowSettings(true)}>Manage Areas</Button>
          <Button onClick={() => { localStorage.removeItem('cpo_auth_email'); window.location.reload(); }}>Sign Out</Button>
        </HeaderActions>
      </Header>

      <TabBar>
        {visibleAreas.map(area => (
          <Tab key={area.id} active={area.id === activeId} onClick={() => setActiveId(area.id)}>
            {area.name}
          </Tab>
        ))}
        {paidAdsVisible && (
          <Tab active={activeId === PAID_ADS_ID} onClick={() => setActiveId(PAID_ADS_ID)}>
            Paid Job Ads
          </Tab>
        )}
        {threePgVisible && (
          <Tab active={activeId === THREE_PG_ID} onClick={() => setActiveId(THREE_PG_ID)}>
            3PG
          </Tab>
        )}
      </TabBar>

      {activeId === PAID_ADS_ID
        ? <PaidJobAdsDashboard refreshKey={refreshKey} />
        : activeId === THREE_PG_ID
        ? <ThreePGDashboard refreshKey={refreshKey} />
        : activeArea && <AreaDashboard key={activeArea.id} area={activeArea} refreshKey={refreshKey} />
      }

      {showSettings && (
        <AreaSettings
          areas={[...AREAS, PAID_ADS_AREA, THREE_PG_AREA]}
          enabledIds={enabledIds}
          onToggle={handleToggle}
          onClose={() => setShowSettings(false)}
        />
      )}
    </AppContainer>
  );
};

export default App;
