import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '@/components/auth/AuthProvider';
import { DocumentService, Document } from '@/services/DocumentService';
import { theme } from '@/theme';
import { SafeAreaContainer } from '@/components/layout';
import { Capacitor } from '@capacitor/core';
import { FilePicker } from '@capawesome/capacitor-file-picker';
import { formatFileSize } from '@/utils/format';

export default function DocumentsScreen() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadDocuments = async () => {
      try {
        const docs = await DocumentService.getDocuments(user.id);
        setDocuments(docs);
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize real-time sync for documents
    DocumentService.initializeSync(user.id, (payload) => {
      if (payload.new) {
        setDocuments(prev => {
          const index = prev.findIndex(doc => doc.id === payload.new.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = payload.new;
            return updated;
          } else {
            return [payload.new, ...prev];
          }
        });
      } else if (payload.old && payload.eventType === 'DELETE') {
        setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
      }
    });

    loadDocuments();

    return () => {
      DocumentService.cleanup();
    };
  }, [user]);

  const handleAddDocument = async () => {
    if (!user) return;

    try {
      setUploading(true);

      if (Platform.OS === 'web') {
        // Web file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*/*';
        input.onchange = async (e: Event) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          try {
            await DocumentService.uploadDocument(user.id, file, file.name);
          } catch (error) {
            console.error('Failed to upload document:', error);
          }
        };
        input.click();
      } else {
        // Mobile file picker using Capacitor
        const result = await FilePicker.pickFiles({
          multiple: false,
        });

        if (result.files.length > 0) {
          const file = result.files[0];
          const response = await fetch(file.path);
          const blob = await response.blob();
          const uploadFile = new File([blob], file.name, { type: file.mimeType });
          
          await DocumentService.uploadDocument(user.id, uploadFile, file.name);
        }
      }
    } catch (error) {
      console.error('Failed to pick or upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await DocumentService.deleteDocument(documentId);
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  if (Platform.OS === 'web') {
    return (
      <div className="p-4 rtl" dir="rtl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">מסמכים</h1>
          <button
            onClick={handleAddDocument}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'מעלה...' : 'הוסף מסמך'}
          </button>
        </div>
        {loading ? (
          <p>טוען...</p>
        ) : documents.length === 0 ? (
          <p>אין מסמכים עדיין</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{doc.title}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(doc.file_size)}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    הורד
                  </a>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    מחק
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <SafeAreaContainer>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>מסמכים</Text>
          <TouchableOpacity
            style={[styles.addButton, uploading && styles.addButtonDisabled]}
            onPress={handleAddDocument}
            disabled={uploading}
          >
            <Text style={styles.addButtonText}>
              {uploading ? 'מעלה...' : 'הוסף מסמך'}
            </Text>
          </TouchableOpacity>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : documents.length === 0 ? (
          <Text style={styles.message}>אין מסמכים עדיין</Text>
        ) : (
          <ScrollView style={styles.documentsList}>
            {documents.map((doc) => (
              <View key={doc.id} style={styles.documentItem}>
                <View>
                  <Text style={styles.documentTitle}>{doc.title}</Text>
                  <Text style={styles.documentMeta}>
                    {formatFileSize(doc.file_size)}
                  </Text>
                </View>
                <View style={styles.documentActions}>
                  <TouchableOpacity
                    onPress={() => {
                      if (Platform.OS === 'web') {
                        window.open(doc.file_url, '_blank');
                      } else {
                        // Handle mobile download
                        // TODO: Implement mobile file download
                      }
                    }}
                  >
                    <Text style={styles.actionButton}>הורד</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteDocument(doc.id)}>
                    <Text style={[styles.actionButton, styles.deleteButton]}>
                      מחק
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  documentsList: {
    flex: 1,
  },
  documentItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
  },
  documentMeta: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'right',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    color: theme.colors.error,
  },
});
