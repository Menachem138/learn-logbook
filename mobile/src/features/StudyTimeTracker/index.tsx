import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StudyTimeTracker = () => {
  return (
    <View testID="study-time-tracker" style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>מעקב זמן למידה</Text>
        </View>
      </View>
    </View>
  );
};

export default StudyTimeTracker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9fafb',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  content: {
    padding: 24,
    gap: 24,
  },
});
