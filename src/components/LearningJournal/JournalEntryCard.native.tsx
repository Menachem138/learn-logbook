import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../components/theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

interface JournalEntryCardProps {
  entry: {
    id: string;
    content: string;
    created_at: string;
    is_important: boolean;
    tags?: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
}

export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={[styles.card, entry.is_important && styles.importantCard]}>
      <View style={styles.header}>
        <View style={styles.tagContainer}>
          {entry.is_important && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>חשוב</Text>
            </View>
          )}
          {entry.tags && entry.tags.length > 0 && (
            <View style={styles.tagList}>
              {entry.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="create-outline" size={20} color={theme === 'dark' ? '#fff' : '#374151'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={20} color={theme === 'dark' ? '#fff' : '#374151'} />
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
  importantCard: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tagContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: theme === 'dark' ? '#fff' : '#374151',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
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
