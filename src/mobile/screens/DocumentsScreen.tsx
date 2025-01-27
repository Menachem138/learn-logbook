import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, I18nManager, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { DocumentService, Document } from '../../services/DocumentService';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

// Force RTL
I18nManager.forceRTL(true);
  {
    id: '1',
    title: 'סיכום שיעור ראשון',
    type: 'PDF',
    size: '2.5MB',
    lastModified: '26/01/2024',
  },
  {
    id: '2',
    title: 'מטלת בית - שבוע 1',
    type: 'DOCX',
    size: '1.2MB',
    lastModified: '25/01/2024',
  },
  {
    id: '3',
    title: 'מצגת מבוא',
    type: 'PPTX',
    size: '5.8MB',
    lastModified: '24/01/2024',
  },
];

export default function DocumentsScreen() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  // Initialize real-time sync
  useRealtimeSync();

  useEffect(() => {
    loadDocuments();

    // Listen for real-time updates
    window.addEventListener('documentUpdate', handleDocumentUpdate);
    window.addEventListener('documentCreate', handleDocumentCreate);
    window.addEventListener('documentDelete', handleDocumentDelete);

    return () => {
      window.removeEventListener('documentUpdate', handleDocumentUpdate);
      window.removeEventListener('documentCreate', handleDocumentCreate);
      window.removeEventListener('documentDelete', handleDocumentDelete);
    };
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await DocumentService.getDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error('Error loading documents:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בטעינת המסמכים');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpdate = (event: CustomEvent) => {
    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === event.detail.id ? event.detail : doc
      )
    );
  };

  const handleDocumentCreate = (event: CustomEvent) => {
    setDocuments(prevDocs => [event.detail, ...prevDocs]);
  };

  const handleDocumentDelete = (event: CustomEvent) => {
    setDocuments(prevDocs => 
      prevDocs.filter(doc => doc.id !== event.detail.id)
    );
  };

  const handleAddDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];
      setLoading(true);

      // Create a File object from the selected asset
      const response = await fetch(file.uri);
      const blob = await response.blob();
      const documentFile = new File([blob], file.name, { type: file.mimeType });

      await DocumentService.uploadDocument(documentFile);
      Alert.alert('הצלחה', 'המסמך הועלה בהצלחה');
    } catch (err) {
      console.error('Error uploading document:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בהעלאת המסמך');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentPress = async (doc: Document) => {
    try {
      const supported = await Linking.canOpenURL(doc.file_url);
      
      if (supported) {
        await Linking.openURL(doc.file_url);
      } else {
        Alert.alert('שגיאה', 'לא ניתן לפתוח את המסמך במכשיר זה');
      }
    } catch (err) {
      console.error('Error opening document:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה בפתיחת המסמך');
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      setLoading(true);
      await DocumentService.deleteDocument(docId);
      Alert.alert('הצלחה', 'המסמך נמחק בהצלחה');
      await loadDocuments(); // Refresh the documents list
    } catch (err) {
      console.error('Error deleting document:', err);
      Alert.alert('שגיאה', 'אירעה שגיאה במחיקת המסמך');
    } finally {
      setLoading(false);
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF':
        return '📄';
      case 'DOCX':
        return '📝';
      case 'PPTX':
        return '📊';
      default:
        return '📎';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>טוען מסמכים...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>מסמכים</Text>
        <View style={styles.documentList}>
          {documents.length === 0 ? (
            <Text style={styles.emptyText}>אין מסמכים עדיין</Text>
          ) : (
            documents.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[styles.documentItem, selectedDocument === doc.id && styles.selectedDocument]}
              onPress={() => handleDocumentPress(doc)}
              onLongPress={() => {
                Alert.alert(
                  'מחיקת מסמך',
                  'האם אתה בטוח שברצונך למחוק מסמך זה?',
                  [
                    {
                      text: 'ביטול',
                      style: 'cancel',
                    },
                    {
                      text: 'מחק',
                      style: 'destructive',
                      onPress: () => handleDeleteDocument(doc.id),
                    },
                  ]
                );
              }}
            >
              <View style={styles.documentIcon}>
                <Text style={styles.iconText}>{getDocumentIcon(doc.file_type)}</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{doc.title}</Text>
                <Text style={styles.documentMeta}>
                  {doc.file_type} • {(doc.file_size / 1024 / 1024).toFixed(1)}MB • {new Date(doc.updated_at).toLocaleDateString('he-IL')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>+ העלה מסמך חדש</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

import { theme } from '../../theme';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: theme.typography.body1.fontSize,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.primary,
  },
  documentList: {
    marginBottom: theme.spacing.xl,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDocument: {
    backgroundColor: theme.colors.primary.light,
    borderColor: theme.colors.primary.main,
    borderWidth: 1,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  iconText: {
    fontSize: theme.typography.h2.fontSize,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: theme.typography.body1.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  documentMeta: {
    fontSize: theme.typography.body1.fontSize - 4,
    color: theme.colors.text.secondary,
  },
  uploadButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: theme.colors.background.default,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
  },
});
