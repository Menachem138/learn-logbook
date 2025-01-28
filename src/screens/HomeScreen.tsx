import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import Timer from '@/components/Timer';
import CourseSchedule from '@/components/CourseSchedule';
import { Documents } from '@/components/Documents';
import LearningJournal from '@/components/LearningJournal';
import { TwitterLibrary } from '@/components/TwitterLibrary';
import { YouTubeLibrary } from '@/components/YouTubeLibrary';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>ברוך הבא</Text>
        </View>
        
        <Timer />
        <CourseSchedule />
        <Documents />
        <LearningJournal />
        <TwitterLibrary />
        <YouTubeLibrary />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});