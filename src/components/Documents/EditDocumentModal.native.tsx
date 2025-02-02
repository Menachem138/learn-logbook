import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '@/components/theme/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import Toast from 'react-native-toast-message';

interface Document {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface EditDocumentModalProps {
  visible: boolean;
  document: Document | null;
  onClose: () => void;
  onDocumentUpdated: () => void;
}

export function EditDocumentModal({ visible, document, onClose, onDocumentUpdated }: EditDocumentModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setCategory(document.category);
    }
  }, [document]);

  const handleUpdate = async () => {
    if (!document?.id || !title.trim() || !content.trim() || !category.trim()) {
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
      const { error } = await supabase
        .from('documents')
        .update({
          title,
          content,
          category,
        })
        .eq('id', document.id);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'הצלחה',
        text2: 'המסמך עודכן בהצלחה',
        position: 'bottom',
      });

      onDocumentUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating document:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה בעדכון המסמך',
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
          <Text style={styles.modalTitle}>עריכת מסמך</Text>
          
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="כותרת"
            placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            textAlign="right"
          />
          
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="קטגוריה"
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
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleUpdate}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>עדכן</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>ביטול</Text>
            </TouchableOpacity>
          </View>
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
    height: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
