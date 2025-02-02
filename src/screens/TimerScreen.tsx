import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/theme/ThemeProvider';
import { supabase } from '../integrations/supabase/client';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTimer } from '../hooks/useTimer';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../types/navigation';

type TimerState = 'STOPPED' | 'STUDYING' | 'BREAK';

export default function TimerScreen({ navigation }: BottomTabScreenProps<TabParamList, 'Timer'>) {
  const { theme } = useTheme();
  const [timerState, setTimerState] = useState<TimerState>('STOPPED');
  const { time, isRunning, isPaused, startTimer, pauseTimer, stopTimer } = useTimer();

  const styles = getStyles(theme, timerState);

  const handleStartStudy = useCallback(async () => {
    if (timerState !== 'STUDYING') {
      setTimerState('STUDYING');
      startTimer();
    } else if (isPaused) {
      pauseTimer();
    }
  }, [timerState, startTimer, isPaused, pauseTimer]);

  const handleStartBreak = useCallback(async () => {
    if (timerState !== 'BREAK') {
      setTimerState('BREAK');
      startTimer();
    } else if (isPaused) {
      pauseTimer();
    }
  }, [timerState, startTimer, isPaused, pauseTimer]);

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
        <Text style={styles.title}>ברוך הבא</Text>
        <Text style={styles.subtitle}>מעקב זמן למידה</Text>
        
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

        <View style={styles.secondaryControls}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Journal')}
          >
            <Ionicons name="calendar-outline" size={24} color={theme === 'dark' ? '#fff' : '#374151'} />
            <Text style={[styles.buttonText, { color: theme === 'dark' ? '#fff' : '#374151' }]}>
              יומן
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Summary')}
          >
            <Ionicons name="document-text-outline" size={24} color={theme === 'dark' ? '#fff' : '#374151'} />
            <Text style={[styles.buttonText, { color: theme === 'dark' ? '#fff' : '#374151' }]}>
              סיכום
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

import { useNavigation } from '@react-navigation/native';

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
      fontSize: 28,
      fontWeight: 'bold',
      textAlign: 'right',
      marginBottom: 8,
      color: theme === 'dark' ? '#fff' : '#000',
    },
    subtitle: {
      fontSize: 20,
      textAlign: 'right',
      marginBottom: 24,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    },
    timerDisplay: {
      backgroundColor: getTimerBgColor(),
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
      marginBottom: 32,
    },
    timerText: {
      fontSize: 64,
      fontWeight: 'bold',
      fontFamily: 'monospace',
      fontVariant: ['tabular-nums'],
      color: '#000',
      letterSpacing: 2,
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
      borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
    },
    breakButton: {
      backgroundColor: '#6B7280',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#4B5563' : '#9CA3AF',
    },
    stopButton: {
      backgroundColor: '#FF6B6B',
      borderWidth: 1,
      borderColor: theme === 'dark' ? '#EF4444' : '#FCA5A5',
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
    },
    buttonTextDisabled: {
      color: '#9CA3AF',
    },
    secondaryControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 32,
      gap: 24,
    },
    secondaryButton: {
      alignItems: 'center',
      gap: 4,
    },
  });
};
