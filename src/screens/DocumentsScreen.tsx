import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/theme/ThemeProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';
import Ionicons from '@expo/vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  category: string;
  user_id: string;
}

export default function DocumentsScreen() {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const styles = getStyles(theme);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות במסמכים');
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
  });

  const renderItem = ({ item }: { item: Document }) => (
    <TouchableOpacity style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Text style={styles.documentTitle}>{item.title}</Text>
        <Text style={styles.documentCategory}>{item.category}</Text>
      </View>
      <Text style={styles.documentPreview} numberOfLines={2}>
        {item.content}
      </Text>
      <Text style={styles.documentDate}>
        {new Date(item.created_at).toLocaleDateString('he-IL')}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.loadingText}>טוען מסמכים...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>מסמכים</Text>
        
        <FlatList
          data={documents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="document-text-outline" 
                size={48} 
                color={theme === 'dark' ? '#4b5563' : '#9ca3af'} 
              />
              <Text style={styles.emptyText}>אין מסמכים להצגה</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'right',
    marginBottom: 24,
    color: theme === 'dark' ? '#fff' : '#000',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  documentCard: {
    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  documentCategory: {
    fontSize: 14,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  documentPreview: {
    fontSize: 16,
    color: theme === 'dark' ? '#d1d5db' : '#4b5563',
    marginBottom: 8,
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  documentDate: {
    fontSize: 12,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  loadingText: {
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: theme === 'dark' ? '#9ca3af' : '#6b7280',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
  },
});
