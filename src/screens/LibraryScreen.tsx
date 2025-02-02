import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import { AddLibraryItemModal } from '@/components/Library/AddLibraryItemModal.native';
import { EditLibraryItemModal } from '@/components/Library/EditLibraryItemModal.native';
import { PDFViewer } from '@/components/Library/PDFViewer.native';
import LinearGradient from 'expo-linear-gradient';

import type { LibraryItem } from '@/types/supabase.generated';

export default function LibraryScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  const { data: libraryItems = [], isLoading } = useQuery({
    queryKey: ['library-items'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות בתוכן');
      }

      const { data, error } = await supabase
        .from('library_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LibraryItem[];
    },
  });

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('library_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      Toast.show({
        type: 'success',
        text1: 'הצלחה',
        text2: 'הפריט נמחק בהצלחה',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      Toast.show({
        type: 'error',
        text1: 'שגיאה',
        text2: 'שגיאה במחיקת הפריט',
        position: 'bottom',
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>טוען תוכן...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { data: courseProgress } = useQuery({
    queryKey: ['course-progress'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות בתוכן');
      }

      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LinearGradient
          colors={['#6366f1', '#a855f7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quoteContainer}
        >
          <Text style={styles.quote}>ההצלחה היא סך כל המאמצים הקטנים שחוזרים על עצמם יום אחר יום</Text>
          <Text style={styles.quoteAuthor}>רוברט קולייר</Text>
        </LinearGradient>

        {courseProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressTitle}>התקדמות בקורס</Text>
            <Text style={styles.progressText}>
              {courseProgress.completed_lessons} מתוך {courseProgress.total_lessons} שיעורים הושלמו ({((courseProgress.completed_lessons / courseProgress.total_lessons) * 100).toFixed(1)}%)
            </Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${(courseProgress.completed_lessons / courseProgress.total_lessons) * 100}%` }
                ]} 
              />
            </View>
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={styles.title}>ספריית תוכן</Text>
        </View>

        <AddLibraryItemModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onItemAdded={() => {
            setShowAddModal(false);
            queryClient.invalidateQueries({ queryKey: ['library-items'] });
          }}
        />

        <EditLibraryItemModal
          visible={!!selectedItem}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onSave={() => {
            setSelectedItem(null);
            queryClient.invalidateQueries({ queryKey: ['library-items'] });
          }}
        />

        {selectedPdfUrl && (
          <PDFViewer
            visible={!!selectedPdfUrl}
            pdfUrl={selectedPdfUrl}
            onClose={() => setSelectedPdfUrl(null)}
          />
        )}

        <ScrollView style={styles.itemsContainer}>
          {libraryItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <View style={styles.headerActions}>
                  <TouchableOpacity
                    onPress={() => handleDeleteItem(item.id)}
                    style={styles.actionButton}
                  >
                    <Ionicons name="trash-outline" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setSelectedItem(item)}
                  >
                    <Ionicons name="pencil-outline" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => item.pdf_url && setSelectedPdfUrl(item.pdf_url)}
                  >
                    <Ionicons name="book-outline" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
                  </TouchableOpacity>
                </View>
              </View>

              {item.image_url && (
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <Text style={styles.itemText}>{item.content}</Text>
              </View>

              <View style={styles.itemFooter}>
                <Text style={styles.websiteLink}>learn-logbook.lovable.app</Text>
                <Ionicons name="lock-closed" size={16} color={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  quoteContainer: {
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  quote: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'right',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  quoteAuthor: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'right',
    opacity: 0.8,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  progressContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'right',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  progressText: {
    fontSize: 16,
    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
    textAlign: 'right',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'right',
    color: theme === 'dark' ? '#fff' : '#000',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  },
  itemsContainer: {
    flex: 1,
  },
  itemCard: {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  itemImage: {
    width: '100%',
    height: 200,
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  },
  itemContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  itemText: {
    fontSize: 16,
    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
    lineHeight: 24,
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  },
  websiteLink: {
    fontSize: 14,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  loadingText: {
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
});
