import React from 'react';
import { RefreshControl, ScrollView, ScrollViewProps, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  /** Fixed content (title, filters, tabs) that stays pinned above the scrollable list. */
  header?: React.ReactNode;
  /** Extra bottom padding to clear the fixed bottom tab bar (tab screens only). */
  withTabBarPadding?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ScreenContainer({ children, header, withTabBarPadding = true, refreshing, onRefresh, style, ...rest }: ScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(28, insets.top) + 24;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      {header ? <View style={{ paddingHorizontal: 20, paddingTop: topPadding }}>{header}</View> : null}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          { padding: 20, paddingTop: header ? 0 : topPadding, paddingBottom: withTabBarPadding ? 100 : 32 },
          style,
        ]}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#A78BFA" /> : undefined}
        {...rest}
      >
        {children}
      </ScrollView>
    </View>
  );
}
