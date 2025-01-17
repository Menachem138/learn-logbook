import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { Database } from '../../lib/supabase/types';

type JournalEntry = Database['public']['Tables']['learning_journal']['Row'];

export const LearningJournalScreen: React.FC = () => {
  const [entries, setEntries] = useState<Array<JournalEntry>>([]);
  const [newEntry, setNewEntry] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const { data: journalData, error } = await supabase
        .from('learning_journal')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (journalData) {
        setEntries(journalData);
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async () => {
    if (!newEntry.trim()) return;

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data: entry, error } = await supabase
        .from('learning_journal')
        .insert({
          content: newEntry.trim(),
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      if (entry) {
        setEntries([entry, ...entries]);
        setNewEntry('');
      }
    } catch (error) {
      console.error('Error adding journal entry:', error);
    }
  };

  const toggleImportant = async (entry: JournalEntry) => {
    try {
      const { data: updatedEntry, error } = await supabase
        .from('learning_journal')
        .update({ is_important: !entry.is_important })
        .eq('id', entry.id)
        .select()
        .single();

      if (error) throw error;
      if (updatedEntry) {
        setEntries(currentEntries => 
          currentEntries.map((e: JournalEntry) => 
            e.id === updatedEntry.id ? updatedEntry : e
          )
        );
      }
    } catch (error) {
      console.error('Error updating journal entry:', error);
    }
  };

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryContainer}>
      <TouchableOpacity
        style={[styles.starButton, item.is_important && styles.starButtonActive]}
        onPress={() => toggleImportant(item)}
      >
        <Text style={styles.starButtonText}>★</Text>
      </TouchableOpacity>
      <View style={styles.entryContent}>
        <Text style={styles.entryText}>{item.content}</Text>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Learning Journal</Text>
        </View>

        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          refreshing={isLoading}
          onRefresh={loadEntries}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newEntry}
            onChangeText={setNewEntry}
            placeholder="Write your thoughts..."
            multiline
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addEntry}
            disabled={!newEntry.trim()}
          >
            <Text style={styles.addButtonText}>Add Entry</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  entryContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  starButton: {
    padding: 8,
    marginRight: 8,
  },
  starButtonActive: {
    opacity: 1,
  },
  starButtonText: {
    fontSize: 20,
    color: '#eab308',
    opacity: 0.3,
  },
  entryContent: {
    flex: 1,
  },
  entryText: {
    fontSize: 16,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
  },
  addButton: {
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default LearningJournalScreen;
