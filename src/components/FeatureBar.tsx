import React from 'react';
import { FeatureBarValue } from '../types';
import {
  FeatureRowContainer, FeatureLabel, BarTrack, BarFill, FeaturePercent, SkeletonBlock
} from '../styles/StyledComponents';

interface Props {
  label: string;
  value: FeatureBarValue;
}

const FeatureBar: React.FC<Props> = ({ label, value }) => (
  <FeatureRowContainer>
    <FeatureLabel>{label}</FeatureLabel>
    {value.loading
      ? <SkeletonBlock height="8px" />
      : (
        <BarTrack>
          <BarFill width={value.error || value.percent == null ? 0 : value.percent} />
        </BarTrack>
      )
    }
    <FeaturePercent>
      {value.loading ? '' : value.error || value.percent == null ? '—' : `${value.percent}%`}
    </FeaturePercent>
  </FeatureRowContainer>
);

export default FeatureBar;
