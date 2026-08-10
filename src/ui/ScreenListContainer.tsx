import React from 'react';
import { FlatList, FlatListProps, RefreshControl, StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface ScreenListContainerProps<T> extends Omit<FlatListProps<T>, 'contentContainerStyle'> {
  /** Fixed content (title, filters, tabs) that stays pinned above the scrollable list. */
  header?: React.ReactNode;
  /** Extra bottom padding to clear the fixed bottom tab bar (tab screens only). */
  withTabBarPadding?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/**
 * Like ScreenContainer, but backed by FlatList instead of ScrollView+map — for screens
 * whose main content is a real (potentially large, backend-paginated) list, so items are
 * virtualized instead of all mounted at once.
 */
export default function ScreenListContainer<T>({
  header,
  withTabBarPadding = true,
  contentContainerStyle,
  refreshing,
  onRefresh,
  ...rest
}: ScreenListContainerProps<T>) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(28, insets.top) + 24;
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      {header ? <View style={{ paddingHorizontal: 20, paddingTop: topPadding }}>{header}</View> : null}
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={[
          { padding: 20, paddingTop: header ? 0 : topPadding, paddingBottom: withTabBarPadding ? 100 : 32, flexGrow: 1 },
          contentContainerStyle,
        ]}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#A78BFA" /> : undefined}
        {...rest}
      />
    </View>
  );
}
