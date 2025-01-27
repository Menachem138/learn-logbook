import React, { useState, useEffect } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TimerDisplay from '../components/StudyTimer/TimerDisplay';
import TimerControls from '../components/StudyTimer/TimerControls';
import { useTimer } from '../hooks/useTimer';

// Force RTL
I18nManager.forceRTL(true);

export default function TimerScreen() {
  const {
    time,
    isActive,
    isPaused,
    mode,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    setMode,
  } = useTimer();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.timerContainer}>
        <TimerDisplay time={time} mode={mode} />
        <TimerControls
          isActive={isActive}
          isPaused={isPaused}
          mode={mode}
          onStart={startTimer}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={stopTimer}
          onModeChange={setMode}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});
