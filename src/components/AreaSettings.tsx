import React from 'react';
import {
  ModalOverlay, ModalBox, ModalTitle, ToggleRow, ToggleName,
  ToggleSwitch, Button
} from '../styles/StyledComponents';

interface Props {
  areas: { id: string; name: string }[];
  enabledIds: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
}

const AreaSettings: React.FC<Props> = ({ areas, enabledIds, onToggle, onClose }) => {
  const enabledCount = enabledIds.size;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        <ModalTitle>Manage Product Areas</ModalTitle>
        {areas.map(area => {
          const isOn = enabledIds.has(area.id);
          const isLastEnabled = isOn && enabledCount === 1;
          return (
            <ToggleRow key={area.id}>
              <ToggleName>{area.name}</ToggleName>
              <ToggleSwitch
                on={isOn}
                disabled={isLastEnabled}
                onClick={() => !isLastEnabled && onToggle(area.id)}
                title={isLastEnabled ? 'At least one area must remain enabled' : ''}
              />
            </ToggleRow>
          );
        })}
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button onClick={onClose}>Done</Button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
};

export default AreaSettings;
