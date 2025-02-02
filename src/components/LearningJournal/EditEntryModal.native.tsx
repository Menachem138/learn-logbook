import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Modal, TouchableOpacity, Text, Platform, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '@components/theme/ThemeProvider';
import Toast from 'react-native-toast-message';

interface EditEntryModalProps {
  visible: boolean;
  entry: {
    id: string;
    content: string;
  } | null;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}

export function EditEntryModal({ visible, entry, onClose, onSave }: EditEntryModalProps) {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const styles = getStyles(theme);

  useEffect(() => {
    if (entry) {
      setContent(entry.content);
    }
  }, [entry]);

  const handleSave = async () => {
    if (!content.trim()) {
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'אנא הכנס תוכן ליומן',
        position: 'bottom',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(content);
      onClose();
      Toast.show({
        type: 'success',
        text1: 'הצלחה',
        text2: 'הרשומה עודכנה בהצלחה',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error updating entry:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה בעדכון הרשומה',
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
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>ערוך רשומה</Text>
          
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            multiline
            textAlign="right"
            textAlignVertical="top"
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>שמור שינויים</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'right',
    color: theme === 'dark' ? '#fff' : '#000',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  input: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb',
    borderRadius: 8,
    padding: 12,
    minHeight: 120,
    color: theme === 'dark' ? '#fff' : '#000',
    fontSize: 16,
    marginBottom: 16,
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
