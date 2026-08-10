import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { useAppFonts } from './src/theme/fonts';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppStateProvider } from './src/state/AppStateContext';
import RootNavigator from './src/navigation/RootNavigator';
import TopBarButtons from './src/ui/TopBarButtons';
import Toast from './src/ui/Toast';
import BootstrapErrorBanner from './src/ui/BootstrapErrorBanner';
import OnboardingOverlay from './src/overlays/OnboardingOverlay';
import ConfettiOverlay from './src/overlays/ConfettiOverlay';
import AchievementUnlockOverlay from './src/overlays/AchievementUnlockOverlay';

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { mode, colors } = useTheme();
  const navTheme = {
    ...(mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.bg0,
      card: colors.bg1,
      border: colors.border,
      text: colors.text,
      primary: '#7C3AED',
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg0 }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
      <TopBarButtons />
      <Toast />
      <BootstrapErrorBanner />
      <OnboardingOverlay />
      <ConfettiOverlay />
      <AchievementUnlockOverlay />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppStateProvider>
            <AppShell />
          </AppStateProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
