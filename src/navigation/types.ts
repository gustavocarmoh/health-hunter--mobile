import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Dashboard: undefined;
  Missions: undefined;
  Ranking: undefined;
  Achievements: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Landing: undefined;
  Login: undefined;
  Register: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Settings: undefined;
  Events: undefined;
  Challenges: undefined;
  Feed: undefined;
  Guild: undefined;
  GuildBrowse: undefined;
  GuildRanking: undefined;
  CreateGuild: undefined;
  AiChat: undefined;
  Friends: undefined;
  AddFriend: undefined;
  AddActivity: {
    missionId?: string;
    missionName?: string;
    validationType?: 'GPS_DISTANCE' | 'DURATION';
    targetDistanceM?: number;
    targetDurationSec?: number;
  } | undefined;
  AdminMissions: undefined;
  BodyMeasurements: undefined;
  PublicProfile: { userId: string; name?: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
