import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  Home: undefined;
};

export type TabParamList = {
  Timer: undefined;
  Journal: undefined;
  Summary: undefined;
  Documents: undefined;
  Social: undefined;
  Settings: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type TimerScreenProps = BottomTabScreenProps<TabParamList, 'Timer'>;
export type JournalScreenProps = BottomTabScreenProps<TabParamList, 'Journal'>;
export type SummaryScreenProps = BottomTabScreenProps<TabParamList, 'Summary'>;
export type SocialScreenProps = BottomTabScreenProps<TabParamList, 'Social'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
