import React, { useState, useCallback } from 'react';
import AREAS from './config/areaConfig';
import TabNav from './components/TabNav';
import AreaDashboard from './components/AreaDashboard';
import AreaSettings from './components/AreaSettings';
import {
  AppContainer, Header, HeaderLeft, Title, Subtitle,
  HeaderActions, Button
} from './styles/StyledComponents';

const STORAGE_KEY = 'cpo_dashboard_enabled_areas';

function loadEnabledIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) return new Set(parsed);
    }
  } catch { /* ignore */ }
  return new Set(AREAS.filter(a => a.defaultEnabled).map(a => a.id));
}

function saveEnabledIds(ids: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

const App: React.FC = () => {
  const [enabledIds, setEnabledIds] = useState<Set<string>>(loadEnabledIds);
  const visibleAreas = AREAS.filter(a => enabledIds.has(a.id));
  const [activeId, setActiveId] = useState<string>(() => visibleAreas[0]?.id ?? AREAS[0].id);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const handleToggle = useCallback((id: string) => {
    setEnabledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size === 1) return prev;
        next.delete(id);
        if (id === activeId) {
          const remaining = AREAS.filter(a => next.has(a.id));
          setActiveId(remaining[0]?.id ?? '');
        }
      } else {
        next.add(id);
      }
      saveEnabledIds(next);
      return next;
    });
  }, [activeId]);

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
        </HeaderActions>
      </Header>

      <TabNav
        areas={visibleAreas}
        activeId={activeArea?.id ?? ''}
        onSelect={setActiveId}
      />

      {activeArea && (
        <AreaDashboard key={activeArea.id} area={activeArea} refreshKey={refreshKey} />
      )}

      {showSettings && (
        <AreaSettings
          areas={AREAS}
          enabledIds={enabledIds}
          onToggle={handleToggle}
          onClose={() => setShowSettings(false)}
        />
      )}
    </AppContainer>
  );
};

export default App;
