import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/theme/ThemeProvider';
import { supabase } from '../integrations/supabase/client';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTimer } from '../hooks/useTimer';

type TimerState = 'STOPPED' | 'STUDYING' | 'BREAK';

export default function TimerScreen() {
  const { theme } = useTheme();
  const [timerState, setTimerState] = useState<TimerState>('STOPPED');
  const { time, isRunning, startTimer, stopTimer } = useTimer();

  const styles = getStyles(theme, timerState);

  const handleStartStudy = useCallback(async () => {
    if (timerState !== 'STUDYING') {
      setTimerState('STUDYING');
      startTimer();
    }
  }, [timerState, startTimer]);

  const handleStartBreak = useCallback(async () => {
    if (timerState !== 'BREAK') {
      setTimerState('BREAK');
      startTimer();
    }
  }, [timerState, startTimer]);

  const handleStop = useCallback(async () => {
    if (timerState !== 'STOPPED') {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        await supabase.from('timer_sessions').insert({
          user_id: session.user.id,
          type: timerState.toLowerCase(),
          duration: parseInt(time.split(':').reduce((acc, time) => (60 * acc) + parseInt(time), 0)),
          started_at: new Date().toISOString(),
        });
      }
      setTimerState('STOPPED');
      stopTimer();
    }
  }, [timerState, stopTimer, time]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>מעקב זמן למידה</Text>
        
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>{time}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.button, styles.studyButton]}
            onPress={handleStartStudy}
            disabled={timerState === 'STUDYING'}
          >
            <Ionicons name="play" size={24} color={timerState === 'STUDYING' ? '#9CA3AF' : '#4285f4'} />
            <Text style={[styles.buttonText, timerState === 'STUDYING' && styles.buttonTextDisabled]}>
              למידה
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.breakButton]}
            onPress={handleStartBreak}
            disabled={timerState === 'BREAK'}
          >
            <Ionicons name="pause" size={24} color={timerState === 'BREAK' ? '#9CA3AF' : '#FFF'} />
            <Text style={[styles.buttonText, { color: '#FFF' }, timerState === 'BREAK' && styles.buttonTextDisabled]}>
              הפסקה
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStop}
            disabled={timerState === 'STOPPED'}
          >
            <Ionicons name="stop" size={24} color={timerState === 'STOPPED' ? '#9CA3AF' : '#FFF'} />
            <Text style={[styles.buttonText, { color: '#FFF' }, timerState === 'STOPPED' && styles.buttonTextDisabled]}>
              עצור
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: 'light' | 'dark', timerState: TimerState) => {
  const getTimerBgColor = () => {
    switch (timerState) {
      case 'STUDYING':
        return '#E8F5E9';
      case 'BREAK':
        return '#FFF8E1';
      default:
        return '#F5F5F5';
    }
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
    },
    content: {
      flex: 1,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 24,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    timerDisplay: {
      backgroundColor: getTimerBgColor(),
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      marginBottom: 32,
    },
    timerText: {
      fontSize: 48,
      fontWeight: 'bold',
      fontVariant: ['tabular-nums'],
      color: '#000',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 8,
      gap: 8,
    },
    studyButton: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    breakButton: {
      backgroundColor: '#6B7280',
    },
    stopButton: {
      backgroundColor: '#EF4444',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
    },
    buttonTextDisabled: {
      color: '#9CA3AF',
    },
  });
};
