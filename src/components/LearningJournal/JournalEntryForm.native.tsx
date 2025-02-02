import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import { useTheme } from '@/components/theme/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import TagInput from './TagInput.native';
import Toast from 'react-native-toast-message';

import type { JournalEntryFormProps } from '@/types/journal';
import type { JournalEntryInsert } from '@/types/supabase';

export function JournalEntryForm({ onEntryAdded }: { onEntryAdded: () => void }) {
  const { theme } = useTheme();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styles = getStyles(theme);

  const addEntry = async () => {
    if (!title.trim() || !content.trim()) {
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'אנא מלא את כל השדות',
        position: 'bottom',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        Toast.show({
          type: 'error',
          text1: 'שגיאה',
          text2: 'יש להתחבר כדי להוסיף רשומה',
          position: 'bottom',
        });
        return;
      }

      const entry: JournalEntryInsert = {
        title,
        content,
        tags,
        user_id: session.session.user.id
      };
      
      const { error } = await supabase
        .from('journal_entries')
        .insert([entry]);

      if (error) throw error;

      setTitle('');
      setContent('');
      setTags([]);
      onEntryAdded();
      Toast.show({
        type: 'success',
        text1: 'הצלחה',
        text2: 'הרשומה נוספה בהצלחה!',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error adding entry:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה בהוספת רשומה',
        position: 'bottom',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        value={title}
        onChangeText={setTitle}
        placeholder="כותרת"
        placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
        textAlign="right"
      />
      
      <TextInput
        style={styles.contentInput}
        value={content}
        onChangeText={setContent}
        placeholder="מה למדת היום?"
        placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
        multiline
        textAlign="right"
        textAlignVertical="top"
      />
      
      <TagInput tags={tags} onChange={setTags} />
      
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={addEntry}
        disabled={isSubmitting}
      >
        <Text style={styles.buttonText}>הוסף רשומה</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    gap: 16,
  },
  titleInput: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
    borderRadius: 8,
    padding: 12,
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  contentInput: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
    borderRadius: 8,
    padding: 12,
    height: 120,
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4285f4',
  },
  secondaryButton: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  secondaryButtonText: {
    color: theme === 'dark' ? '#fff' : '#374151',
  },
});
