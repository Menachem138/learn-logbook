import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Force RTL
I18nManager.forceRTL(true);

type Section = {
  id: string;
  title: string;
  lessons: Lesson[];
  progress: number;
};

type Lesson = {
  id: string;
  title: string;
  completed: boolean;
  duration: string;
};

const mockSections: Section[] = [
  {
    id: '1',
    title: 'מבוא לקורס',
    progress: 75,
    lessons: [
      { id: '1-1', title: 'ברוכים הבאים', completed: true, duration: '10:00' },
      { id: '1-2', title: 'סקירה כללית', completed: true, duration: '15:00' },
      { id: '1-3', title: 'כלים ומשאבים', completed: false, duration: '20:00' },
    ],
  },
  {
    id: '2',
    title: 'יסודות',
    progress: 50,
    lessons: [
      { id: '2-1', title: 'מושגי יסוד', completed: true, duration: '25:00' },
      { id: '2-2', title: 'עקרונות בסיסיים', completed: false, duration: '30:00' },
    ],
  },
];

export default function CourseScreen() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const renderProgressBar = (progress: number) => (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>תוכן הקורס</Text>
        {mockSections.map((section) => (
          <View key={section.id} style={styles.sectionContainer}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => toggleSection(section.id)}
            >
              <View style={styles.sectionHeaderContent}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.progressText}>{section.progress}%</Text>
              </View>
              {renderProgressBar(section.progress)}
            </TouchableOpacity>
            
            {expandedSection === section.id && (
              <View style={styles.lessonsList}>
                {section.lessons.map((lesson) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[styles.lessonItem, lesson.completed && styles.completedLesson]}
                  >
                    <View style={styles.lessonContent}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                    </View>
                    <View style={[styles.completionIndicator, lesson.completed && styles.completed]} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    padding: 16,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  lessonsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  lessonContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonTitle: {
    fontSize: 16,
    color: '#333',
  },
  lessonDuration: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  completedLesson: {
    opacity: 0.7,
  },
  completionIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
    marginLeft: 8,
  },
  completed: {
    backgroundColor: '#4CAF50',
  },
});
