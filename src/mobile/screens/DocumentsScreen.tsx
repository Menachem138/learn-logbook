import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Documents'>;

interface Document {
  id: string;
  title: string;
  file_url: string;
  file_type: string;
  created_at: string;
  user_id: string;
}

export default function DocumentsScreen({ navigation }: Props) {
  const queryClient = useQueryClient();

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

  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: { uri: string; type: string; name: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי להעלות מסמך');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${session.session.user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('documents')
        .insert([{
          title: file.name,
          file_url: publicUrl,
          file_type: file.type,
          user_id: session.session.user.id
        }]);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const file = result[0];
      await uploadDocumentMutation.mutateAsync({
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.name || 'unknown',
      });
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking document:', err);
      }
    }
  };

  const renderItem = ({ item }: { item: Document }) => (
    <View style={styles.documentItem}>
      <TouchableOpacity
        style={styles.documentContent}
        onPress={() => {
          if (item.file_url) {
            Linking.openURL(item.file_url);
          }
        }}
      >
        <Ionicons
          name={item.file_type.includes('pdf') ? 'document-text' : 'document'}
          size={24}
          color="#000"
        />
        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.documentDate}>
            {new Date(item.created_at).toLocaleDateString('he-IL')}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteDocumentMutation.mutate(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={documents}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              אין מסמכים להצגה
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUpload}
        disabled={uploadDocumentMutation.isPending}
      >
        <Ionicons name="cloud-upload" size={24} color="#fff" />
        <Text style={styles.uploadButtonText}>העלה מסמך</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
  },
  documentContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  documentDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  uploadButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#000',
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
