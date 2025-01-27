import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TimerMode } from '../../hooks/useTimer';

interface TimerDisplayProps {
  time: number;
  mode: TimerMode;
}

export default function TimerDisplay({ time, mode }: TimerDisplayProps) {
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const getModeText = () => {
    switch (mode) {
      case 'learn':
        return 'זמן למידה';
      case 'break':
        return 'הפסקה';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.modeText}>{getModeText()}</Text>
      <Text style={styles.timerText}>
        {formatNumber(hours)}:{formatNumber(minutes)}:{formatNumber(seconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'System',
    letterSpacing: 2,
  },
  modeText: {
    fontSize: 20,
    color: '#666',
    marginBottom: 10,
    fontFamily: 'System',
  },
});
