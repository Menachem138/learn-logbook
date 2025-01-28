import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TimerDisplayProps } from './types';

const formatTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
};

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, timerState }) => {
  const getBackgroundColor = () => {
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
      <View style={[styles.timerContainer, { backgroundColor: getBackgroundColor() }]}>
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
