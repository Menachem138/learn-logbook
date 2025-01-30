import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTimer } from '@/components/StudyTimeTracker/useTimer';
import { TimerDisplay } from './components/StudyTimer/TimerDisplay';
import { TimerControls } from './components/StudyTimer/TimerControls';
import { TimerStats } from './components/StudyTimer/TimerStats';

type Props = NativeStackScreenProps<RootStackParamList, 'StudyTimer'>;

export default function StudyTimerScreen({ navigation }: Props) {
  const { session } = useAuth();
  const timer = useTimer(session?.user?.id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TimerDisplay time={timer.time} timerState={timer.timerState} />
        <View style={styles.spacing} />
        <TimerControls
          timerState={timer.timerState}
          onStartStudy={() => timer.startTimer('STUDYING')}
          onStartBreak={() => timer.startTimer('BREAK')}
          onStop={timer.stopTimer}
        />
        <View style={styles.spacing} />
        <TimerStats
          totalStudyTime={timer.totalStudyTime}
          totalBreakTime={timer.totalBreakTime}
          currentTime={timer.time}
          timerState={timer.timerState}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  spacing: {
    height: 24,
  },
});
