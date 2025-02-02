import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '@/components/theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

import type { JournalEntryCardProps } from '@/types/journal';

export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{entry.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(entry)} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(entry.id)} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={theme === 'dark' ? '#ef4444' : '#dc2626'} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.content}>{entry.content}</Text>
      
      <Text style={styles.timestamp}>
        {new Date(entry.created_at).toLocaleDateString('he-IL')} {new Date(entry.created_at).toLocaleTimeString('he-IL')}
      </Text>
    </View>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  card: {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'right',
    flex: 1,
    marginRight: 8,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  tag: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  timestamp: {
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    fontSize: 12,
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
});
