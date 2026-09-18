import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import MainTabs from './MainTabs';
import SettingsScreen from '../screens/SettingsScreen';
import EventsScreen from '../screens/EventsScreen';
import ChallengesScreen from '../screens/ChallengesScreen';
import FeedScreen from '../screens/FeedScreen';
import GuildScreen from '../screens/GuildScreen';
import GuildBrowseScreen from '../screens/GuildBrowseScreen';
import GuildRankingScreen from '../screens/GuildRankingScreen';
import CreateGuildScreen from '../screens/CreateGuildScreen';
import AiChatScreen from '../screens/AiChatScreen';
import FriendsScreen from '../screens/FriendsScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import AddActivityScreen from '../screens/AddActivityScreen';
import AdminMissionsScreen from '../screens/AdminMissionsScreen';
import BodyMeasurementsScreen from '../screens/BodyMeasurementsScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#05050F' } }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Events" component={EventsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Feed" component={FeedScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Guild" component={GuildScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="GuildBrowse" component={GuildBrowseScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="GuildRanking" component={GuildRankingScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="CreateGuild" component={CreateGuildScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AiChat" component={AiChatScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Friends" component={FriendsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AddFriend" component={AddFriendScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AddActivity" component={AddActivityScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AdminMissions" component={AdminMissionsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
