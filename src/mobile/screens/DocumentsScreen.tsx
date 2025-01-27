import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Force RTL
I18nManager.forceRTL(true);

type Document = {
  id: string;
  title: string;
  type: string;
  size: string;
  lastModified: string;
};

const mockDocuments: Document[] = [
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
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>מסמכים</Text>
        <View style={styles.documentList}>
          {mockDocuments.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[styles.documentItem, selectedDocument === doc.id && styles.selectedDocument]}
              onPress={() => setSelectedDocument(doc.id)}
            >
              <View style={styles.documentIcon}>
                <Text style={styles.iconText}>{getDocumentIcon(doc.type)}</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle}>{doc.title}</Text>
                <Text style={styles.documentMeta}>
                  {doc.type} • {doc.size} • {doc.lastModified}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  documentList: {
    marginBottom: 80,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDocument: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#666',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
