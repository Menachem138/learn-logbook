import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Button } from '@mobile/components/ui/Button';

type Styles = {
  container: ViewStyle;
  spacing: ViewStyle;
};
import { spacing } from '@mobile/styles/global';

interface TimerControlsProps {
  timerState: 'IDLE' | 'STUDYING' | 'BREAK';
  onStartStudy: () => void;
  onStartBreak: () => void;
  onStop: () => void;
}

export function TimerControls({
  timerState,
  onStartStudy,
  onStartBreak,
  onStop,
}: TimerControlsProps) {
  return (
    <View style={styles.container}>
      {timerState === 'IDLE' && (
        <Button onPress={onStartStudy} size="lg">
          התחל ללמוד
        </Button>
      )}
      {timerState === 'STUDYING' && (
        <>
          <Button onPress={onStartBreak} size="lg">
            התחל הפסקה
          </Button>
          <View style={styles.spacing} />
          <Button onPress={onStop} variant="outline" size="lg">
            עצור
          </Button>
        </>
      )}
      {timerState === 'BREAK' && (
        <>
          <Button onPress={onStartStudy} size="lg">
            חזור ללמידה
          </Button>
          <View style={styles.spacing} />
          <Button onPress={onStop} variant="outline" size="lg">
            עצור
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create<Styles>({
  container: {
    padding: spacing.md,
  },
  spacing: {
    height: spacing.md,
  },
});
