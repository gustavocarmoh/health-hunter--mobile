import React from 'react';
import { View } from 'react-native';
import ScreenListContainer from '../ui/ScreenListContainer';
import ScreenHeader from '../ui/ScreenHeader';
import Avatar from '../ui/Avatar';
import { OrbitronText, RajdhaniText } from '../ui/Typography';
import { useTheme } from '../theme/ThemeContext';
import { useAppState } from '../state/AppStateContext';
import { FeedItemData } from '../state/types';

export default function FeedScreen() {
  const { colors } = useTheme();
  const { feedItems } = useAppState();

  return (
    <ScreenListContainer<FeedItemData>
      withTabBarPadding={false}
      header={<ScreenHeader title="FRIENDS FEED" />}
      data={feedItems}
      keyExtractor={(f, i) => `${f.name}-${i}`}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      renderItem={({ item: f }) => (
        <View style={{ flexDirection: 'row', gap: 12, backgroundColor: colors.bg1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14 }}>
          <Avatar initial={f.initial} size={36} bg={f.avatarColor} fontSize={14} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <RajdhaniText style={{ fontSize: 13, lineHeight: 18, color: colors.text }}>
              <RajdhaniText weight="700" style={{ fontSize: 13, color: colors.text }}>{f.name}</RajdhaniText> {f.action}
            </RajdhaniText>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <RajdhaniText style={{ fontSize: 11, color: colors.dim }}>{f.time}</RajdhaniText>
              {f.hasXp ? <OrbitronText weight="700" style={{ fontSize: 11, color: '#FBBF24' }}>+{f.xp} XP</OrbitronText> : null}
            </View>
          </View>
        </View>
      )}
    />
  );
}
