import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaContainer } from '../components/layout';
import { theme } from '../theme';

// Force RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const COURSE_SECTIONS = [
  {
    title: 'מבוא לתכנות',
    progress: 80,
    lessons: [
      { title: 'מהו תכנות?', completed: true },
      { title: 'משתנים ופעולות בסיסיות', completed: true },
      { title: 'תנאים ולולאות', completed: false },
    ],
  },
  {
    title: 'פיתוח אפליקציות',
    progress: 30,
    lessons: [
      { title: 'סביבת פיתוח', completed: true },
      { title: 'ממשק משתמש בסיסי', completed: false },
      { title: 'ניהול מצב (State)', completed: false },
    ],
  },
];

export default function CourseScreen() {
  return (
    <SafeAreaContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>תוכן הקורס</Text>
      </View>

      <ScrollView style={styles.container}>
        {COURSE_SECTIONS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${section.progress}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{section.progress}%</Text>
              </View>
            </View>

            <View style={styles.lessonsList}>
              {section.lessons.map((lesson, lessonIndex) => (
                <TouchableOpacity 
                  key={lessonIndex}
                  style={styles.lessonItem}
                >
                  <Icon 
                    name={lesson.completed ? 'check-circle' : 'circle-outline'}
                    size={24}
                    color={lesson.completed ? theme.colors.success : theme.colors.text.secondary}
                  />
                  <Text style={[
                    styles.lessonTitle,
                    lesson.completed && styles.completedLesson
                  ]}>
                    {lesson.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
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
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.heading2,
    fontWeight: '700',
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    ...theme.shadow.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.heading3,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'right',
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.surface.secondary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
  },
  progressText: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.text.secondary,
    minWidth: 45,
    textAlign: 'left',
  },
  lessonsList: {
    marginTop: theme.spacing.md,
  },
  lessonItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface.secondary,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  lessonTitle: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    textAlign: 'right',
  },
  completedLesson: {
    color: theme.colors.text.secondary,
    textDecorationLine: 'line-through',
  },
});
