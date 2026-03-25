import React from 'react';
import { ProductArea } from '../types';
import { TabBar, Tab } from '../styles/StyledComponents';

interface Props {
  areas: ProductArea[];
  activeId: string;
  onSelect: (id: string) => void;
}

const TabNav: React.FC<Props> = ({ areas, activeId, onSelect }) => (
  <TabBar>
    {areas.map(area => (
      <Tab
        key={area.id}
        active={area.id === activeId}
        onClick={() => onSelect(area.id)}
      >
        {area.name}
      </Tab>
    ))}
  </TabBar>
);

export default TabNav;
