import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../components/auth/AuthProvider';
import { CourseService, CourseProgress } from '../services/CourseService';
import { theme } from '../theme';
import { SafeAreaContainer } from '../components/layout';

export default function CourseScreen() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) return;

    const loadProgress = async () => {
      try {
        const courseProgress = await CourseService.getCourseProgress(user.id);
        setProgress(courseProgress);
      } catch (error) {
        console.error('Failed to load course progress:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initialize real-time sync for course progress
    CourseService.initializeSync(user.id, (payload) => {
      if (payload.new) {
        setProgress(prev => {
          const index = prev.findIndex(p => p.lesson_id === payload.new.lesson_id);
          if (index >= 0) {
            // Update existing progress
            const updated = [...prev];
            updated[index] = payload.new;
            return updated;
          } else {
            // Add new progress
            return [...prev, payload.new];
          }
        });
      }
    });

    loadProgress();

    return () => {
      CourseService.cleanup();
    };
  }, [user]);

  if (Platform.OS === 'web') {
    return (
      <div className="p-4 rtl" dir="rtl">
        <h1 className="text-2xl font-bold mb-4">התקדמות בקורס</h1>
        {loading ? (
          <p>טוען...</p>
        ) : progress.length === 0 ? (
          <p>אין התקדמות עדיין</p>
        ) : (
          <div className="space-y-4">
            {progress.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">שיעור {item.lesson_id}</h3>
                  <span className="text-sm text-gray-500">{item.progress_percentage}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.progress_percentage}%` }}
                  />
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
        <Text style={styles.title}>התקדמות בקורס</Text>
        {loading ? (
          <Text style={styles.message}>טוען...</Text>
        ) : progress.length === 0 ? (
          <Text style={styles.message}>אין התקדמות עדיין</Text>
        ) : (
          <View style={styles.progressList}>
            {progress.map((item) => (
              <View key={item.id} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.lessonTitle}>שיעור {item.lesson_id}</Text>
                  <Text style={styles.percentage}>{item.progress_percentage}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${item.progress_percentage}%` }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  progressList: {
    gap: 12,
  },
  progressItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
});
