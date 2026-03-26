import styled, { keyframes } from 'styled-components';

// ─── Fabric Design Tokens ──────────────────────────────────────────────────
export const colors = {
  // Brand
  primary: '#bcdc44',          // Leaf green — CTAs, active states, highlights
  primaryDark: '#a8c93a',      // Leaf hover state
  primaryText: '#212121',      // Text on leaf-green backgrounds

  // Surfaces
  background: '#f5f5f5',       // Gray 100 — page background
  cardBackground: '#ffffff',   // White — card surfaces

  // Text
  text: '#212121',             // Gray 900 — primary text
  lightText: '#757575',        // Gray 600 — secondary / meta text

  // Borders & structure
  border: '#e0e0e0',           // Gray 300 — borders, dividers
  borderStrong: '#bdbdbd',     // Gray 400 — emphasized borders

  // Semantic
  success: '#388e3c',
  warning: '#f57c00',
  error: '#d32f2f',

  // Tab aliases
  activeTab: '#bcdc44',
  tabBorder: '#e0e0e0',
};

// ─── Skeleton shimmer animation ────────────────────────────────────────────
const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

export const SkeletonBlock = styled.div<{ width?: string; height?: string }>`
  width: ${({ width }) => width ?? '100%'};
  height: ${({ height }) => height ?? '16px'};
  border-radius: 4px;
  background: linear-gradient(90deg, #eeeeee 25%, #f5f5f5 50%, #eeeeee 75%);
  background-size: 800px 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

// ─── App shell ─────────────────────────────────────────────────────────────
export const AppContainer = styled.div`
  font-family: 'Nunito Sans', 'Segoe UI', sans-serif;
  max-width: 1400px;
  margin: 0 auto;
  background: ${colors.background};
  min-height: 100vh;
  color: ${colors.text};
`;

// ─── Header ────────────────────────────────────────────────────────────────
export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: ${colors.cardBackground};
  border-bottom: 1px solid ${colors.border};
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);

  /* BambooHR brand accent — thin green stripe at top */
  border-top: 3px solid ${colors.primary};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  /* Green leaf accent mark to the left of the title */
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 32px;
    background: ${colors.primary};
    border-radius: 2px;
    flex-shrink: 0;
  }
`;

export const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 2px;
  color: ${colors.text};
  letter-spacing: -0.3px;
`;

export const Subtitle = styled.p`
  font-size: 12px;
  color: ${colors.lightText};
  margin: 0;
  font-weight: 400;
`;

export const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

// ─── Buttons ───────────────────────────────────────────────────────────────
export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'tertiary' }>`
  padding: 7px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Nunito Sans', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;

  ${({ variant }) => {
    if (variant === 'primary') return `
      background: #bcdc44;
      color: #212121;
      border: none;
      &:hover { background: #a8c93a; }
      &:focus-visible { outline: 2px solid #bcdc44; outline-offset: 2px; }
    `;
    if (variant === 'tertiary') return `
      background: transparent;
      color: #757575;
      border: none;
      &:hover { color: #212121; }
    `;
    // default = secondary (outline)
    return `
      background: #ffffff;
      color: #212121;
      border: 1px solid #e0e0e0;
      &:hover { border-color: #bdbdbd; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
      &:focus-visible { outline: 2px solid #bcdc44; outline-offset: 2px; }
    `;
  }}
`;

// ─── Tabs ──────────────────────────────────────────────────────────────────
export const TabBar = styled.div`
  display: flex;
  background: ${colors.cardBackground};
  border-bottom: 1px solid ${colors.tabBorder};
  padding: 0 24px;
  overflow-x: auto;
  gap: 4px;
  &::-webkit-scrollbar { display: none; }
`;

export const Tab = styled.button<{ active: boolean }>`
  padding: 12px 16px;
  font-size: 13px;
  font-family: 'Nunito Sans', sans-serif;
  font-weight: ${({ active }) => active ? '700' : '400'};
  color: ${({ active }) => active ? colors.text : colors.lightText};
  border: none;
  border-bottom: 3px solid ${({ active }) => active ? colors.activeTab : 'transparent'};
  margin-bottom: -1px;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;

  &:hover {
    color: ${colors.text};
  }
  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: -2px;
    border-radius: 2px;
  }
`;

// ─── Content area ──────────────────────────────────────────────────────────
export const ContentArea = styled.div`
  padding: 24px;
  @media (max-width: 600px) { padding: 16px 12px; }
`;

export const AreaHeader = styled.div`
  margin-bottom: 20px;
`;

export const AreaTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px;
  color: ${colors.text};
  letter-spacing: -0.2px;
`;

export const AreaDescription = styled.p`
  font-size: 12px;
  color: ${colors.lightText};
  margin: 0;
`;

// ─── Metric cards ──────────────────────────────────────────────────────────
export const MetricCardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  @media (max-width: 600px) { grid-template-columns: repeat(2, 1fr); }
`;

export const CardContainer = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.15s ease, border-color 0.15s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-color: ${colors.borderStrong};
  }
`;

export const CardLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: ${colors.lightText};
  margin-bottom: 8px;
`;

export const CardValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${colors.text};
  line-height: 1;
  letter-spacing: -0.5px;
`;

export const CardTrend = styled.div<{ positive?: boolean }>`
  font-size: 11px;
  font-weight: 600;
  margin-top: 8px;
  color: ${({ positive }) => positive ? colors.success : colors.lightText};
`;

export const CardPlaceholder = styled.div`
  font-size: 22px;
  font-weight: 700;
  color: ${colors.lightText};
`;

// ─── Feature usage bars ────────────────────────────────────────────────────
export const FeatureSection = styled.div`
  background: ${colors.cardBackground};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  padding: 16px;
`;

export const FeatureSectionTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${colors.text};
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;

  /* Green accent dot */
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

export const FeatureRowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  &:last-child { margin-bottom: 0; }
  @media (max-width: 600px) { flex-wrap: wrap; }
`;

export const FeatureLabel = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${colors.text};
  width: 180px;
  flex-shrink: 0;
  @media (max-width: 600px) { width: 100%; }
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
  font-weight: 600;
  color: ${colors.text};
  width: 36px;
  text-align: right;
`;

// ─── Charts ────────────────────────────────────────────────────────────────
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
  font-weight: 700;
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

// ─── Modal ─────────────────────────────────────────────────────────────────
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
`;

export const ModalBox = styled.div`
  background: ${colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.16);
`;

export const ModalTitle = styled.h2`
  font-size: 17px;
  font-weight: 700;
  margin: 0 0 16px;
  color: ${colors.text};
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
  flex-shrink: 0;

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
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  }

  &:focus-visible {
    outline: 2px solid ${colors.primary};
    outline-offset: 2px;
  }
`;
