import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/theme/ThemeProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Toast from 'react-native-toast-message';
import { JournalEntryForm } from '../components/LearningJournal/JournalEntryForm.native';
import { JournalEntryCard } from '../components/LearningJournal/JournalEntryCard.native';
import { EditEntryModal } from '../components/LearningJournal/EditEntryModal.native';

interface JournalEntry {
  id: string;
  content: string;
  created_at: string;
  is_important: boolean;
  tags?: string[];
  user_id: string;
}

export default function JournalScreen() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const styles = getStyles(theme);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: entries = [], isLoading, refetch } = useQuery({
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
      return data as JournalEntry[];
    },
  });

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_journal')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      Toast.show({
        type: 'success',
        text1: 'הצלחה',
        text2: 'הרשומה נמחקה בהצלחה',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error deleting entry:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה במחיקת הרשומה',
        position: 'bottom',
      });
    }
  };

  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const updateEntry = async (content: string) => {
    if (!editingEntry) return;

    try {
      const { error } = await supabase
        .from('learning_journal')
        .update({ content })
        .eq('id', editingEntry.id);

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  };

  const renderItem = ({ item }: { item: JournalEntry }) => (
    <JournalEntryCard
      entry={item}
      onEdit={() => setEditingEntry(item)}
      onDelete={() => deleteEntry(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>יומן למידה</Text>
        <Text style={styles.subtitle}>מה למדת היום?</Text>
        
        <JournalEntryForm 
          onEntryAdded={() => queryClient.invalidateQueries({ queryKey: ['journal-entries'] })} 
        />

        <FlatList
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={async () => {
                setIsRefreshing(true);
                await refetch();
                setIsRefreshing(false);
              }}
              tintColor={theme === 'dark' ? '#fff' : '#000'}
            />
          }
        />

        <EditEntryModal
          visible={!!editingEntry}
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={updateEntry}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
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
    fontSize: 18,
    textAlign: 'right',
    marginBottom: 24,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  list: {
    marginTop: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
});
