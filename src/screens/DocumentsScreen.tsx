import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaContainer } from '../components/layout';
import { theme } from '../theme';

// Force RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const DOCUMENTS = [
  {
    title: 'סיכום שיעור ראשון',
    type: 'pdf',
    date: '25/01/2024',
    size: '1.2MB',
  },
  {
    title: 'מצגת מבוא',
    type: 'pptx',
    date: '24/01/2024',
    size: '3.5MB',
  },
  {
    title: 'תרגילי בית',
    type: 'docx',
    date: '23/01/2024',
    size: '500KB',
  },
];

const getIconName = (type: string) => {
  switch (type.toLowerCase()) {
    case 'pdf':
      return 'file-pdf-box';
    case 'docx':
      return 'file-word-box';
    case 'pptx':
      return 'file-powerpoint-box';
    default:
      return 'file-document-outline';
  }
};

export default function DocumentsScreen() {
  return (
    <SafeAreaContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>מסמכים</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Icon name="upload" size={24} color={theme.colors.primary} />
          <Text style={styles.uploadButtonText}>העלאת מסמך</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        {DOCUMENTS.map((doc, index) => (
          <TouchableOpacity key={index} style={styles.documentItem}>
            <Icon 
              name={getIconName(doc.type)}
              size={40}
              color={theme.colors.primary}
              style={styles.documentIcon}
            />
            <View style={styles.documentInfo}>
              <Text style={styles.documentTitle}>{doc.title}</Text>
              <View style={styles.documentMeta}>
                <Text style={styles.documentMetaText}>{doc.date}</Text>
                <Text style={styles.documentMetaText}>{doc.size}</Text>
                <Text style={styles.documentMetaText}>{doc.type.toUpperCase()}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <Icon name="download" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.heading2,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  uploadButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  uploadButtonText: {
    marginRight: theme.spacing.sm,
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.body,
    fontWeight: '500',
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  documentItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  documentIcon: {
    marginLeft: theme.spacing.lg,
  },
  documentInfo: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  documentTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'right',
  },
  documentMeta: {
    flexDirection: 'row-reverse',
    gap: theme.spacing.md,
  },
  documentMetaText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.secondary,
  },
  downloadButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface.secondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
});
