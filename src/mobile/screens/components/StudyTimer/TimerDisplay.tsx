import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatTime } from '@/utils/timeUtils';
import type { TimerState } from '@/components/StudyTimeTracker/types';

interface TimerDisplayProps {
  time: number;
  timerState: TimerState;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, timerState }) => {
  const getBgColor = () => {
    switch (timerState) {
      case 'STUDYING':
        return '#dcfce7'; // bg-green-100
      case 'BREAK':
        return '#fef9c3'; // bg-yellow-100
      default:
        return '#f3f4f6'; // bg-gray-100
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.timerContainer, { backgroundColor: getBgColor() }]}>
        <Text style={styles.timerText}>
          {formatTime(time)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  timerContainer: {
    width: '100%',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
