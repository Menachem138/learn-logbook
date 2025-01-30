import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface JournalEntryProps {
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

export function JournalEntry({ entry, onEdit, onDelete }: JournalEntryProps) {
  return (
    <View style={[styles.card, entry.is_important && styles.importantCard]}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          {entry.is_important && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>חשוב</Text>
            </View>
          )}
          {entry.tags?.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
            <Ionicons name="pencil" size={18} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
            <Ionicons name="trash" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.content}>{entry.content}</Text>
      <Text style={styles.timestamp}>
        {new Date(entry.created_at).toLocaleDateString()} {new Date(entry.created_at).toLocaleTimeString()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  importantCard: {
    borderWidth: 2,
    borderColor: '#eab308',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    backgroundColor: '#fef9c3',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  badgeText: {
    color: '#854d0e',
    fontSize: 12,
    fontWeight: '500',
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  tagText: {
    color: '#374151',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
    writingDirection: 'rtl',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
});
