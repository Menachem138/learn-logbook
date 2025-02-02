import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { useTheme } from '@/components/theme/ThemeProvider';
import Ionicons from '@expo/vector-icons/Ionicons';

interface PDFViewerProps {
  visible: boolean;
  pdfUrl: string;
  onClose: () => void;
}

export function PDFViewer({ visible, pdfUrl, onClose }: PDFViewerProps) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
        </View>

        <View style={styles.pdfContainer}>
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4285f4" />
              <Text style={styles.loadingText}>טוען מסמך...</Text>
            </View>
          )}
          
          <Pdf
            source={{ uri: pdfUrl }}
            style={styles.pdf}
            onLoadComplete={() => setIsLoading(false)}
            onError={(error) => {
              console.error('Error loading PDF:', error);
              setIsLoading(false);
            }}
            enableRTL={true}
          />
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? '#374151' : '#f3f4f6',
  },
  closeButton: {
    padding: 8,
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#000',
    textAlign: 'center',
  },
});
