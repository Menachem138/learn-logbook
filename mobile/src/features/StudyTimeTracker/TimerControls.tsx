import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { TimerControlsProps } from './types';

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
          styles.studyButton
        ]}
        onPress={onStartStudy}
        disabled={timerState === 'STUDYING'}
      >
        <Icon
          name={timerState === 'STUDYING' ? 'pause' : 'play'}
          size={16}
          color={timerState === 'STUDYING' ? '#fff' : '#16a34a'}
        />
        <Text style={[
          styles.buttonText,
          timerState === 'STUDYING' ? styles.activeButtonText : styles.outlineButtonText,
          styles.studyButtonText
        ]}>
          למידה
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          timerState === 'BREAK' ? styles.activeButton : styles.outlineButton,
          styles.breakButton
        ]}
        onPress={onStartBreak}
        disabled={timerState === 'BREAK'}
      >
        <Icon
          name={timerState === 'BREAK' ? 'pause' : 'play'}
          size={16}
          color={timerState === 'BREAK' ? '#fff' : '#ca8a04'}
        />
        <Text style={[
          styles.buttonText,
          timerState === 'BREAK' ? styles.activeButtonText : styles.outlineButtonText,
          styles.breakButtonText
        ]}>
          הפסקה
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.stopButton,
          timerState === 'STOPPED' && styles.disabledButton
        ]}
        onPress={onStop}
        disabled={timerState === 'STOPPED'}
      >
        <Icon name="stop-circle" size={16} color="#fff" />
        <Text style={[styles.buttonText, styles.stopButtonText]}>
          עצור
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeButton: {
    backgroundColor: '#16a34a',
  },
  activeButtonText: {
    color: '#fff',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outlineButtonText: {
    color: '#374151',
  },
  studyButton: {
    borderColor: '#16a34a',
  },
  studyButtonText: {
    color: '#16a34a',
  },
  breakButton: {
    borderColor: '#ca8a04',
  },
  breakButtonText: {
    color: '#ca8a04',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  stopButtonText: {
    color: '#fff',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
