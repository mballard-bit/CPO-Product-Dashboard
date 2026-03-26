import styled from 'styled-components';

export const colors = {
  primary: '#1a73e8',
  background: '#f8f9fa',
  cardBackground: '#ffffff',
  text: '#1a1a2e',
  lightText: '#888888',
  border: '#e0e0e0',
  success: '#34a853',
  warning: '#f9ab00',
  error: '#ea4335',
  activeTab: '#1a73e8',
  tabBorder: '#e0e0e0',
};

export const AppContainer = styled.div`
  font-family: 'Source Sans Pro', 'Segoe UI', Roboto, sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  background: ${colors.background};
  min-height: 100vh;
  color: ${colors.text};
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  background: ${colors.cardBackground};
  border-bottom: 1px solid ${colors.border};
`;

export const HeaderLeft = styled.div``;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 2px;
  color: ${colors.text};
`;

export const Subtitle = styled.p`
  font-size: 12px;
  color: ${colors.lightText};
  margin: 0;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid ${({ variant }) => variant === 'primary' ? colors.primary : colors.border};
  background: ${({ variant }) => variant === 'primary' ? colors.primary : colors.cardBackground};
  color: ${({ variant }) => variant === 'primary' ? '#fff' : colors.text};
  &:hover {
    opacity: 0.85;
  }
`;

export const TabBar = styled.div`
  display: flex;
  background: ${colors.cardBackground};
  border-bottom: 2px solid ${colors.tabBorder};
  padding: 0 24px;
  overflow-x: auto;
  gap: 4px;
  &::-webkit-scrollbar { display: none; }
`;

export const Tab = styled.button<{ active: boolean }>`
  padding: 12px 16px;
  font-size: 13px;
  font-weight: ${({ active }) => active ? '600' : '400'};
  color: ${({ active }) => active ? colors.activeTab : colors.lightText};
  border: none;
  border-bottom: 2px solid ${({ active }) => active ? colors.activeTab : 'transparent'};
  margin-bottom: -2px;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  &:hover { color: ${colors.activeTab}; }
`;

export const ContentArea = styled.div`
  padding: 20px 24px;
`;

export const AreaHeader = styled.div`
  margin-bottom: 16px;
`;

export const AreaTitle = styled.h2`
  font-size: 17px;
  font-weight: 600;
  margin: 0 0 3px;
  color: ${colors.text};
`;

export const AreaDescription = styled.p`
  font-size: 12px;
  color: ${colors.lightText};
  margin: 0;
`;

export const MetricCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

export const CardContainer = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
`;

export const CardLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.lightText};
  margin-bottom: 8px;
`;

export const CardValue = styled.div`
  font-size: 26px;
  font-weight: 700;
  color: ${colors.text};
  line-height: 1;
`;

export const CardTrend = styled.div<{ positive?: boolean }>`
  font-size: 11px;
  margin-top: 6px;
  color: ${({ positive }) => positive ? colors.success : colors.lightText};
`;

export const CardPlaceholder = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${colors.lightText};
`;

export const FeatureSection = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
`;

export const FeatureSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 14px;
`;

export const FeatureRowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
`;

export const FeatureLabel = styled.div`
  font-size: 12px;
  color: ${colors.text};
  width: 180px;
  flex-shrink: 0;
`;

export const BarTrack = styled.div`
  flex: 1;
  background: ${colors.border};
  border-radius: 4px;
  height: 8px;
  overflow: hidden;
`;

export const BarFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${({ width }) => width}%;
  background: ${colors.primary};
  border-radius: 4px;
  transition: width 0.4s ease;
`;

export const FeaturePercent = styled.div`
  font-size: 12px;
  color: ${colors.text};
  width: 36px;
  text-align: right;
`;

export const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

export const ChartSection = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
`;

export const ChartTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 12px;
`;

export const ChartPlaceholder = styled.div`
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: ${colors.lightText};
`;

export const ErrorText = styled.div`
  font-size: 11px;
  color: ${colors.lightText};
`;

// Modal
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

export const ModalBox = styled.div`
  background: ${colors.cardBackground};
  border-radius: 10px;
  padding: 24px;
  min-width: 320px;
  max-width: 480px;
  width: 100%;
`;

export const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px;
`;

export const ToggleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${colors.border};
  &:last-of-type { border-bottom: none; }
`;

export const ToggleName = styled.div`
  font-size: 13px;
  color: ${colors.text};
`;

export const ToggleSwitch = styled.button<{ on: boolean }>`
  width: 40px;
  height: 22px;
  border-radius: 11px;
  border: none;
  background: ${({ on }) => on ? colors.primary : colors.border};
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${({ on }) => on ? '21px' : '3px'};
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s;
  }
`;
