import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  StudyTimer: undefined;
  LearningJournal: undefined;
  Calendar: undefined;
  CourseSchedule: undefined;
  ChatAssistant: undefined;
  Documents: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
