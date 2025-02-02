import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTimer } from '../hooks/useTimer';
import { useTheme } from '../components/theme/ThemeProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function HomeScreen() {
  const { time, isRunning, isPaused, startTimer, pauseTimer, stopTimer } = useTimer();
  const { theme, toggleTheme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ברוך הבא</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons 
            name={theme === 'dark' ? 'sunny-outline' : 'moon-outline'} 
            size={24} 
            color={theme === 'dark' ? '#fff' : '#000'} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>מעקב זמן למידה</Text>
        
        <View style={styles.timerContainer}>
          <Text style={styles.timer}>{time}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]}
            onPress={stopTimer}
          >
            <Text style={styles.buttonText}>עצור</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.pauseButton]}
            onPress={pauseTimer}
          >
            <Text style={styles.buttonText}>הפסקה</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.startButton]}
            onPress={startTimer}
          >
            <Text style={styles.buttonText}>למידה</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    color: theme === 'dark' ? '#fff' : '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 16,
    color: theme === 'dark' ? '#fff' : '#000',
  },
  timerContainer: {
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  timer: {
    fontSize: 48,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: theme === 'dark' ? '#fff' : '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#ff6b6b',
  },
  pauseButton: {
    backgroundColor: '#868e96',
  },
  startButton: {
    backgroundColor: '#4285f4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
