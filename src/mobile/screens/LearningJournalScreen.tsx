import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@mobile/services/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { JournalEntryForm as JournalEntryFormComponent } from './components/LearningJournal/JournalEntryForm';
const JournalEntryForm = JournalEntryFormComponent;
import { JournalEntry } from './components/LearningJournal/JournalEntry';
import { Modal } from '../components/ui/Modal';

type Props = NativeStackScreenProps<RootStackParamList, 'LearningJournal'>;

interface JournalEntryType {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  tags?: string[];
  user_id: string;
}

export default function LearningJournalScreen({ navigation }: Props) {
  const [editingEntry, setEditingEntry] = useState<JournalEntryType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות ביומן');
      }

      const { data, error } = await supabase
        .from('learning_journal')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('learning_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (entry: JournalEntryType) => {
      const { error } = await supabase
        .from('learning_journal')
        .update({ content: entry.content })
        .eq('id', entry.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      setIsEditing(false);
      setEditingEntry(null);
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>טוען...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>יומן למידה</Text>
            <Text style={styles.subtitle}>מה למדת היום?</Text>
          </View>
          
          <JournalEntryForm 
            onEntryAdded={() => queryClient.invalidateQueries({ queryKey: ['journal-entries'] })} 
          />

          <View style={styles.entriesContainer}>
            {entries.map((entry) => (
              <JournalEntry
                key={entry.id}
                entry={entry}
                onEdit={() => {
                  setEditingEntry(entry);
                  setIsEditing(true);
                }}
                onDelete={() => deleteEntryMutation.mutate(entry.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isEditing}
        onClose={() => {
          setIsEditing(false);
          setEditingEntry(null);
        }}
        title="ערוך רשומה"
      >
        <View style={styles.modalContent}>
          <TextInput
            style={styles.editInput}
            value={editingEntry?.content || ''}
            onChangeText={(text) => 
              setEditingEntry(editingEntry ? { ...editingEntry, content: text } : null)
            }
            multiline
            textAlignVertical="top"
            textAlign="right"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => updateEntryMutation.mutate(editingEntry!)}
            >
              <Text style={styles.buttonText}>שמור שינויים</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => {
                setIsEditing(false);
                setEditingEntry(null);
              }}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                ביטול
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'right',
  },
  entriesContainer: {
    marginTop: 24,
  },
  modalContent: {
    padding: 16,
  },
  editInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#000',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  secondaryButtonText: {
    color: '#000',
  },
});
