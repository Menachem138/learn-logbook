import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { useAuth } from '@/components/auth/AuthProvider';
import { JournalService, JournalEntry } from '@/services/JournalService';
import { theme } from '@/theme';
import { SafeAreaContainer } from '@/components/layout';

export default function JournalScreen() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;

    const loadEntries = async () => {
      try {
        const journalEntries = await JournalService.getEntries(user.id);
        setEntries(journalEntries);
      } catch (error) {
        console.error('Failed to load journal entries:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize real-time sync for journal entries
    JournalService.initializeSync(user.id, (payload) => {
      if (payload.new) {
        setEntries(prev => {
          const index = prev.findIndex(entry => entry.id === payload.new.id);
          if (index >= 0) {
            // Update existing entry
            const updated = [...prev];
            updated[index] = payload.new;
            return updated;
          } else {
            // Add new entry
            return [payload.new, ...prev];
          }
        });
      } else if (payload.old && payload.eventType === 'DELETE') {
        // Remove deleted entry
        setEntries(prev => prev.filter(entry => entry.id !== payload.old.id));
      }
    });

    loadEntries();

    return () => {
      JournalService.cleanup();
    };
  }, [user]);

  if (Platform.OS === 'web') {
    return (
      <div className="p-4 rtl" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">יומן למידה</h1>
        {loading ? (
          <p>טוען...</p>
        ) : entries.length === 0 ? (
          <p>אין רשומות ביומן עדיין</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium">{entry.title}</h3>
                <p className="mt-2 text-gray-600">{entry.content}</p>
                {entry.mood && (
                  <p className="mt-2 text-sm text-gray-500">מצב רוח: {entry.mood}</p>
                )}
                {entry.study_duration && (
                  <p className="text-sm text-gray-500">
                    משך למידה: {entry.study_duration} דקות
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {new Date(entry.created_at).toLocaleDateString('he-IL')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <SafeAreaContainer>
      <View style={styles.container}>
        <Text style={styles.title}>יומן למידה</Text>
        {loading ? (
          <Text style={styles.message}>טוען...</Text>
        ) : entries.length === 0 ? (
          <Text style={styles.message}>אין רשומות ביומן עדיין</Text>
        ) : (
          <ScrollView style={styles.entriesList}>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.entryItem}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryContent}>{entry.content}</Text>
                {entry.mood && (
                  <Text style={styles.entryMeta}>מצב רוח: {entry.mood}</Text>
                )}
                {entry.study_duration && (
                  <Text style={styles.entryMeta}>
                    משך למידה: {entry.study_duration} דקות
                  </Text>
                )}
                <Text style={styles.entryDate}>
                  {new Date(entry.created_at).toLocaleDateString('he-IL')}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  entriesList: {
    flex: 1,
  },
  entryItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'right',
  },
  entryContent: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'right',
  },
  entryMeta: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  entryDate: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'right',
  },
});
