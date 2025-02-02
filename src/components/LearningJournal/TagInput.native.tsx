import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../components/theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');
  const styles = getStyles(theme);

  const handleAddTag = () => {
    if (inputValue.trim()) {
      const newTags = [...tags, inputValue.trim()];
      onChange(newTags);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={setInputValue}
          placeholder="הוסף תגית..."
          placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
          onSubmitEditing={handleAddTag}
          returnKeyType="done"
          textAlign="right"
        />
        <TouchableOpacity onPress={handleAddTag} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color={theme === 'dark' ? '#fff' : '#374151'} />
        </TouchableOpacity>
      </View>

      {tags.length > 0 && (
        <View style={styles.tagContainer}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={styles.removeButton}>
                <Ionicons name="close-circle" size={16} color={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    gap: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
    borderRadius: 8,
    padding: 12,
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  addButton: {
    padding: 4,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 4,
  },
  tagText: {
    color: theme === 'dark' ? '#fff' : '#374151',
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  removeButton: {
    padding: 2,
  },
});
