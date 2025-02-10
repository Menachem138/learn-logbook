
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StudyTimer } from '@/components/StudyTimer';
import { Calendar } from '@/components/Calendar';
import Library from '@/components/Library';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <StudyTimer />
        <View style={styles.content}>
          <Calendar />
          <Library />
        </View>
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
    flexGrow: 1,
    padding: 16,
  },
  content: {
    marginTop: 24,
    gap: 24,
  },
});
