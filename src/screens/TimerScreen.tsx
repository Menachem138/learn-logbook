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
type Props = BottomTabScreenProps<TabParamList, 'Timer'>;

const TimerScreen = ({ navigation }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const [timerState, setTimerState] = useState<TimerState>('STOPPED');
  const { time, isRunning, isPaused, startTimer, pauseTimer, stopTimer } = useTimer();

  const styles = getStyles(theme, timerState);

  const handleStartStudy = useCallback(() => {
    if (timerState !== 'STUDYING') {
      setTimerState('STUDYING');
      startTimer();
    } else {
      pauseTimer();
    }
  }, [timerState, startTimer, pauseTimer]);

  const handleStartBreak = useCallback(() => {
    if (timerState !== 'BREAK') {
      setTimerState('BREAK');
      startTimer();
    } else {
      pauseTimer();
    }
  }, [timerState, startTimer, pauseTimer]);

  const handleStop = useCallback(async () => {
    if (timerState !== 'STOPPED') {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          const duration = time.split(':').reduce((acc, time) => (60 * parseInt(acc)) + parseInt(time), '0');
          await supabase.from('timer_sessions').insert({
            user_id: session.user.id,
            type: timerState.toLowerCase(),
            duration: parseInt(duration),
            started_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to save timer session:', error);
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
};

export default TimerScreen;



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
      padding: 20,
      paddingTop: 40,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      textAlign: 'right',
      marginBottom: 8,
      color: theme === 'dark' ? '#fff' : '#000',
      fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
    subtitle: {
      fontSize: 22,
      textAlign: 'right',
      marginBottom: 32,
      color: theme === 'dark' ? '#9ca3af' : '#6b7280',
      fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
    timerDisplay: {
      backgroundColor: getTimerBgColor(),
      borderRadius: 20,
      padding: 40,
      alignItems: 'center',
      marginBottom: 40,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    timerText: {
      fontSize: 72,
      fontWeight: '600',
      fontVariant: ['tabular-nums'],
      color: theme === 'dark' ? '#fff' : '#000',
      letterSpacing: 2,
      fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
    controls: {
      flexDirection: 'row-reverse',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 32,
    },
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      gap: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    studyButton: {
      backgroundColor: '#4285f4',
      borderWidth: 0,
    },
    breakButton: {
      backgroundColor: '#6B7280',
      borderWidth: 0,
    },
    stopButton: {
      backgroundColor: '#FF6B6B',
      borderWidth: 0,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
      fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
    },
    buttonTextDisabled: {
      opacity: 0.6,
    },
    secondaryControls: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 40,
    },
    secondaryButton: {
      alignItems: 'center',
      gap: 8,
      opacity: 0.8,
    },
  });
};
