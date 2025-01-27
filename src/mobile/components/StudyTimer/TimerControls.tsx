import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { TimerMode } from '../../hooks/useTimer';

interface TimerControlsProps {
  isActive: boolean;
  isPaused: boolean;
  mode: TimerMode;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onModeChange: (mode: TimerMode) => void;
}

export default function TimerControls({
  isActive,
  isPaused,
  mode,
  onStart,
  onPause,
  onResume,
  onStop,
  onModeChange,
}: TimerControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.modeButtons}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'learn' && styles.activeModeButton]}
          onPress={() => onModeChange('learn')}
        >
          <Text style={[styles.modeButtonText, mode === 'learn' && styles.activeModeButtonText]}>
            למידה
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'break' && styles.activeModeButton]}
          onPress={() => onModeChange('break')}
        >
          <Text style={[styles.modeButtonText, mode === 'break' && styles.activeModeButtonText]}>
            הפסקה
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controlButtons}>
        {!isActive ? (
          <TouchableOpacity style={styles.startButton} onPress={onStart}>
            <Text style={styles.startButtonText}>התחל</Text>
          </TouchableOpacity>
        ) : (
          <>
            {isPaused ? (
              <TouchableOpacity style={styles.resumeButton} onPress={onResume}>
                <Text style={styles.buttonText}>המשך</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
                <Text style={styles.buttonText}>השהה</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.stopButton} onPress={onStop}>
              <Text style={styles.buttonText}>עצור</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  modeButtons: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeModeButton: {
    backgroundColor: '#007AFF',
  },
  modeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  activeModeButtonText: {
    color: '#fff',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pauseButton: {
    backgroundColor: '#FFA000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  resumeButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  stopButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
