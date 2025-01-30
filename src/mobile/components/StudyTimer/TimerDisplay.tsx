import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '@mobile/styles/global';

type Styles = {
  container: ViewStyle;
  stateText: TextStyle;
  timerText: TextStyle;
};

interface TimerDisplayProps {
  time: number;
  timerState: 'IDLE' | 'STUDYING' | 'BREAK';
}

export function TimerDisplay({ time, timerState }: TimerDisplayProps) {
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getStateText = () => {
    switch (timerState) {
      case 'STUDYING':
        return 'זמן למידה';
      case 'BREAK':
        return 'זמן הפסקה';
      default:
        return 'מוכן להתחיל?';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.stateText}>{getStateText()}</Text>
      <Text style={styles.timerText}>{formatTime(time)}</Text>
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  stateText: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    color: colors.secondary,
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
});
