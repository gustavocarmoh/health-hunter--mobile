import React from 'react';
import { View } from 'react-native';
import { OrbitronText } from './Typography';
import { RANK_CONFIG } from '../state/stateConfig';
import { Rank } from '../state/types';

export default function RankBadge({ rank }: { rank: Rank }) {
  const rc = RANK_CONFIG[rank];
  return (
    <View
      style={{
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: 6,
        backgroundColor: rc.bg,
        borderWidth: 1,
        borderColor: rc.border,
      }}
    >
      <OrbitronText weight="800" style={{ fontSize: 11, color: rc.color }}>
        Rank {rank}
      </OrbitronText>
    </View>
  );
}
