import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/components/theme/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';
import Toast from 'react-native-toast-message';
import type { CalendarEventInsert } from '@/types/calendar';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

export function AddEventModal({ visible, onClose, onEventAdded }: AddEventModalProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('לימודים');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000));
  const [isBackup, setIsBackup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'אנא הזן כותרת לאירוע',
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
          text2: 'יש להתחבר כדי להוסיף אירוע',
          position: 'bottom',
        });
        return;
      }

      const newEvent: CalendarEventInsert = {
        title,
        description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        category,
        is_backup: isBackup,
        completed: false,
        user_id: session.session.user.id
      };
      
      const { error } = await supabase
        .from('calendar_events')
        .insert(newEvent);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'הצלחה',
        text2: 'האירוע נוסף בהצלחה',
        position: 'bottom',
      });

      setTitle('');
      setDescription('');
      setCategory('לימודים');
      setStartTime(new Date());
      setEndTime(new Date(Date.now() + 3600000));
      setIsBackup(false);
      onEventAdded();
      onClose();
    } catch (error) {
      console.error('Error adding event:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה בהוספת האירוע',
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
          <Text style={styles.modalTitle}>הוספת אירוע חדש</Text>
          
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="כותרת"
            placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            textAlign="right"
          />
          
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="תיאור"
            placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            multiline
            textAlign="right"
            textAlignVertical="top"
          />

          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeField}>
              <Text style={styles.label}>שעת התחלה</Text>
              <DateTimePicker
                value={startTime}
                mode="datetime"
                is24Hour={true}
                onChange={(event, date) => date && setStartTime(date)}
                textColor={theme === 'dark' ? '#fff' : '#000'}
              />
            </View>

            <View style={styles.dateTimeField}>
              <Text style={styles.label}>שעת סיום</Text>
              <DateTimePicker
                value={endTime}
                mode="datetime"
                is24Hour={true}
                onChange={(event, date) => date && setEndTime(date)}
                textColor={theme === 'dark' ? '#fff' : '#000'}
              />
            </View>
          </View>

          <View style={styles.categoryContainer}>
            {['לימודים', 'עבודה', 'אישי', 'אחר'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  category === cat && styles.selectedCategory,
                  { backgroundColor: getCategoryColor(cat) }
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.backupButton, isBackup && styles.backupButtonSelected]}
            onPress={() => setIsBackup(!isBackup)}
          >
            <Text style={[styles.backupButtonText, isBackup && styles.backupButtonTextSelected]}>
              זמן גיבוי
            </Text>
          </TouchableOpacity>

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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'לימודים': '#3b82f6',
    'עבודה': '#ef4444',
    'אישי': '#10b981',
    'אחר': '#8b5cf6',
  };
  return colors[category] || colors['אחר'];
};

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
  descriptionInput: {
    height: 80,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateTimeField: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    opacity: 0.8,
  },
  selectedCategory: {
    opacity: 1,
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  backupButton: {
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  backupButtonSelected: {
    backgroundColor: '#4285f4',
  },
  backupButtonText: {
    color: theme === 'dark' ? '#fff' : '#374151',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  backupButtonTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
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
