import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '@mobile/styles/global';

type Styles = {
  container: ViewStyle;
  statItem: ViewStyle;
  label: TextStyle;
  value: TextStyle;
};

interface TimerStatsProps {
  totalStudyTime: number;
  totalBreakTime: number;
  currentTime: number;
  timerState: 'IDLE' | 'STUDYING' | 'BREAK';
}

export function TimerStats({
  totalStudyTime,
  totalBreakTime,
  currentTime,
  timerState,
}: TimerStatsProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}ש ${remainingMinutes}ד`;
    }
    return `${remainingMinutes}ד`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.label}>זמן למידה כולל</Text>
        <Text style={styles.value}>{formatDuration(totalStudyTime)}</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.label}>זמן הפסקה כולל</Text>
        <Text style={styles.value}>{formatDuration(totalBreakTime)}</Text>
      </View>
      {timerState !== 'IDLE' && (
        <View style={styles.statItem}>
          <Text style={styles.label}>זמן נוכחי</Text>
          <Text style={styles.value}>{formatDuration(currentTime)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  label: {
    fontSize: 16,
    color: colors.secondary,
  },
  value: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
