import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TimerState } from '@/components/StudyTimeTracker/types';
import { Ionicons } from '@expo/vector-icons';

interface TimerControlsProps {
  timerState: TimerState;
  onStartStudy: () => void;
  onStartBreak: () => void;
  onStop: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  timerState,
  onStartStudy,
  onStartBreak,
  onStop,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          timerState === 'STUDYING' ? styles.activeButton : styles.outlineButton,
          { marginRight: 8 }
        ]}
        onPress={onStartStudy}
        disabled={timerState === 'STUDYING'}
      >
        <Ionicons
          name={timerState === 'STUDYING' ? 'pause' : 'play'}
          size={16}
          color={timerState === 'STUDYING' ? '#fff' : '#000'}
        />
        <Text style={[
          styles.buttonText,
          timerState === 'STUDYING' ? styles.activeButtonText : styles.outlineButtonText
        ]}>למידה</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          timerState === 'BREAK' ? styles.activeButton : styles.outlineButton,
          { marginRight: 8 }
        ]}
        onPress={onStartBreak}
        disabled={timerState === 'BREAK'}
      >
        <Ionicons
          name={timerState === 'BREAK' ? 'pause' : 'play'}
          size={16}
          color={timerState === 'BREAK' ? '#fff' : '#000'}
        />
        <Text style={[
          styles.buttonText,
          timerState === 'BREAK' ? styles.activeButtonText : styles.outlineButtonText
        ]}>הפסקה</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.stopButton]}
        onPress={onStop}
        disabled={timerState === 'STOPPED'}
      >
        <Ionicons name="stop" size={16} color="#fff" />
        <Text style={styles.stopButtonText}>עצור</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  activeButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderColor: '#000',
  },
  stopButton: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  buttonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#fff',
  },
  outlineButtonText: {
    color: '#000',
  },
  stopButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});
