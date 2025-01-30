import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@mobile/services/supabase';

interface JournalEntryFormProps {
  onEntryAdded: () => void;
}

export function JournalEntryForm({ onEntryAdded }: JournalEntryFormProps) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addEntry = async (isImportant: boolean = false) => {
    if (!content.trim()) {
      // We'll handle error messages through the parent component
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        return;
      }

      const { error } = await supabase
        .from('learning_journal')
        .insert([{
          content,
          tags,
          is_important: isImportant,
          user_id: session.session.user.id
        }]);

      if (error) throw error;

      setContent('');
      setTags([]);
      onEntryAdded();
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.contentInput}
        value={content}
        onChangeText={setContent}
        placeholder="מה למדת היום?"
        multiline
        textAlignVertical="top"
        textAlign="right"
      />
      
      <View style={styles.tagsContainer}>
        <View style={styles.tagInput}>
          <TextInput
            style={styles.tagTextInput}
            value={currentTag}
            onChangeText={setCurrentTag}
            placeholder="הוסף תגית"
            onSubmitEditing={addTag}
            textAlign="right"
          />
          <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
            <Ionicons name="add-circle" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tagsList}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => addEntry(false)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>הוסף רשומה</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => addEntry(true)}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            הוסף כהערה חשובה
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  contentInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tagsContainer: {
    gap: 8,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagTextInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  addTagButton: {
    padding: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 4,
  },
  tagText: {
    color: '#374151',
    fontSize: 12,
  },
  buttonContainer: {
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
