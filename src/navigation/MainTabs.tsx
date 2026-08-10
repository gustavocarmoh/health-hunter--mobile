import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import PressableScale from '../ui/PressableScale';
import { OrbitronText } from '../ui/Typography';
import { HomeIcon, MissionsIcon, RankingIcon, StarIcon, ProfileIcon } from '../ui/Icons';
import { useTheme } from '../theme/ThemeContext';
import { MainTabParamList } from './types';
import DashboardScreen from '../screens/DashboardScreen';
import MissionsScreen from '../screens/MissionsScreen';
import RankingScreen from '../screens/RankingScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, React.ComponentType<{ color: string }>> = {
  Dashboard: ({ color }) => <HomeIcon color={color} />,
  Missions: ({ color }) => <MissionsIcon color={color} />,
  Ranking: ({ color }) => <RankingIcon color={color} />,
  Achievements: ({ color }) => <StarIcon color={color} />,
  Profile: ({ color }) => <ProfileIcon color={color} />,
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'HOME',
  Missions: 'MISSIONS',
  Ranking: 'RANKING',
  Achievements: 'ACHIEVE',
  Profile: 'PROFILE',
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.bg1,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
        paddingBottom: Math.max(10, insets.bottom),
      }}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const color = focused ? '#A78BFA' : colors.dim;
        const Icon = TAB_ICONS[route.name as keyof MainTabParamList];
        return (
          <PressableScale
            key={route.key}
            scaleTo={0.9}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: 'center', gap: 4, minHeight: 44, justifyContent: 'center' }}
          >
            <Icon color={color} />
            <OrbitronText weight="700" style={{ fontSize: 9, letterSpacing: 0.5, color }}>
              {TAB_LABELS[route.name as keyof MainTabParamList]}
            </OrbitronText>
          </PressableScale>
        );
      })}
    </View>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Missions" component={MissionsScreen} />
      <Tab.Screen name="Ranking" component={RankingScreen} />
      <Tab.Screen name="Achievements" component={AchievementsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
