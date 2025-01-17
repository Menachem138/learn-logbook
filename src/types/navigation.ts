import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  StudyTimer: undefined;
  LearningJournal: undefined;
  Library: undefined;
  CourseSchedule: undefined;
  Chat: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
