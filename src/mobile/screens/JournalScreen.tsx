import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Force RTL
I18nManager.forceRTL(true);

type JournalEntry = {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
};

const mockEntries: JournalEntry[] = [
  {
    id: '1',
    title: 'סיכום שיעור ראשון',
    content: 'היום למדנו על העקרונות הבסיסיים...',
    date: '26/01/2024',
    tags: ['שיעור', 'מבוא'],
  },
  {
    id: '2',
    title: 'תרגול בית',
    content: 'השלמתי את כל התרגילים...',
    date: '25/01/2024',
    tags: ['תרגול', 'שיעורי בית'],
  },
];

export default function JournalScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const filteredEntries = mockEntries.filter(
    entry =>
      entry.title.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchText.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="חיפוש ביומן..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#666"
        />
      </View>
      
      <ScrollView style={styles.scrollView}>
        {filteredEntries.map((entry) => (
          <TouchableOpacity
            key={entry.id}
            style={[styles.entryCard, selectedEntry === entry.id && styles.selectedEntry]}
            onPress={() => setSelectedEntry(entry.id)}
          >
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle}>{entry.title}</Text>
              <Text style={styles.entryDate}>{entry.date}</Text>
            </View>
            <Text style={styles.entryContent} numberOfLines={3}>
              {entry.content}
            </Text>
            <View style={styles.tagsContainer}>
              {entry.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>+ רשומה חדשה</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  entryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedEntry: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  entryContent: {
    fontSize: 16,
    color: '#444',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0e0e0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  addButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
