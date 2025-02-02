import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useTheme } from '@/components/theme/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import Toast from 'react-native-toast-message';
import type { LibraryItem } from '@/types/supabase.generated';

interface EditLibraryItemModalProps {
  visible: boolean;
  item: LibraryItem | null;
  onClose: () => void;
  onSave: () => void;
}

export function EditLibraryItemModal({ visible, item, onClose, onSave }: EditLibraryItemModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [title, setTitle] = useState(item?.title ?? '');
  const [content, setContent] = useState(item?.content ?? '');
  const [imageUrl, setImageUrl] = useState(item?.image_url ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'אנא הזן כותרת',
        position: 'bottom',
      });
      return;
    }

    if (!item?.id) {
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'פריט לא נמצא',
        position: 'bottom',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('library_items')
        .update({
          title,
          content,
          image_url: imageUrl,
        })
        .eq('id', item.id);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'הצלחה',
        text2: 'הפריט עודכן בהצלחה',
        position: 'bottom',
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating library item:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה בעדכון הפריט',
        position: 'bottom',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>עריכת פריט</Text>
            
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="כותרת"
              placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              textAlign="right"
            />
            
            <TextInput
              style={[styles.input, styles.contentInput]}
              value={content}
              onChangeText={setContent}
              placeholder="תוכן"
              placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              multiline
              textAlign="right"
              textAlignVertical="top"
            />

            <TextInput
              style={styles.input}
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="קישור לתמונה"
              placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              textAlign="right"
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>שמור</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'right',
    color: theme === 'dark' ? '#fff' : '#000',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  input: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  contentInput: {
    height: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: '#4285f4',
  },
  cancelButton: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  cancelButtonText: {
    color: theme === 'dark' ? '#fff' : '#374151',
  },
});
