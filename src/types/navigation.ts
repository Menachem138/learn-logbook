import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

export type TabParamList = {
  Home: undefined;
  Journal: undefined;
  Summary: undefined;
  Settings: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type HomeScreenProps = BottomTabScreenProps<TabParamList, 'Home'>;
export type JournalScreenProps = BottomTabScreenProps<TabParamList, 'Journal'>;
export type SummaryScreenProps = BottomTabScreenProps<TabParamList, 'Summary'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
