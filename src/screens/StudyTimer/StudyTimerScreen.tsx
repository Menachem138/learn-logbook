import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Database } from '../../lib/supabase/types';
import { supabase } from '../../lib/supabase/client';
import { TimerState } from '../../types/timer';
import { formatTime, minutesToMs } from '../../utils/timeUtils';

type TimerSession = Database['public']['Tables']['timer_sessions']['Row'];

const STUDY_TIME = minutesToMs(25); // 25 minutes
const BREAK_TIME = minutesToMs(5);  // 5 minutes

export const StudyTimerScreen: React.FC = () => {
  const [time, setTime] = useState<number>(STUDY_TIME);
  const [timerState, setTimerState] = useState<TimerState>(TimerState.STOPPED);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [sessions, setSessions] = useState<TimerSession[]>([]);

  useEffect(() => {
    loadSessions();
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  const loadSessions = async () => {
    try {
      const { data: sessionData, error } = await supabase
        .from('timer_sessions')
        .select()
        .order('created_at', { ascending: false })
        .limit(10)
        .returns<TimerSession[]>();

      if (error) throw error;
      if (sessionData) {
        setSessions(sessionData);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const startTimer = () => {
    if (timerState === TimerState.STOPPED) {
      setTimerState(TimerState.STUDYING);
      setTime(STUDY_TIME);
    }

    const id = setInterval(() => {
      setTime((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(id);
          saveSession(timerState === TimerState.STUDYING ? 'study' : 'break');
          return timerState === TimerState.STUDYING ? BREAK_TIME : STUDY_TIME;
        }
        return prevTime - 1000;
      });
    }, 1000);

    setIntervalId(id);
  };

  const pauseTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };

  const stopTimer = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
    setTimerState(TimerState.STOPPED);
    setTime(STUDY_TIME);
  };

  const saveSession = async (type: 'study' | 'break') => {
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data: session, error } = await supabase
        .from('timer_sessions')
        .insert({
          type,
          duration: type === 'study' ? STUDY_TIME - time : BREAK_TIME - time,
          user_id: userId
        })
        .select()
        .returns<TimerSession>()
        .single();

      if (error) throw error;
      if (session) {
        setSessions([session, ...sessions]);
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(time)}</Text>
        
        <View style={styles.buttonContainer}>
          {!intervalId ? (
            <TouchableOpacity style={styles.button} onPress={startTimer}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={pauseTimer}>
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.stopButton]} 
            onPress={stopTimer}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sessionsContainer}>
          <Text style={styles.sessionsTitle}>Recent Sessions</Text>
          {sessions.map((session, index) => (
            <View key={session.id} style={styles.sessionItem}>
              <Text style={styles.sessionText}>
                {session.type === 'study' ? 'Study' : 'Break'} - {formatTime(session.duration)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#dc2626',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionsContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  sessionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sessionItem: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sessionText: {
    fontSize: 16,
  },
});

export default StudyTimerScreen;
