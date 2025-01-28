import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { TimerStatsProps } from './types';

const formatTotalTime = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const TimerStats: React.FC<TimerStatsProps> = ({
  totalStudyTime,
  totalBreakTime,
  currentTime,
  timerState,
}) => {
  const [activeTab, setActiveTab] = React.useState<'summary' | 'details'>('summary');
  
  const totalTime = totalStudyTime + totalBreakTime + (timerState !== 'STOPPED' ? currentTime : 0);
  const studyPercentage = totalTime > 0 
    ? ((totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0)) / totalTime) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.tabList}>
        <Pressable
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            סיכום
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>
            פירוט
          </Text>
        </Pressable>
      </View>

      {activeTab === 'summary' && (
        <View style={styles.summaryContent}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>זמן למידה</Text>
            <Text style={styles.summaryTime}>
              {formatTotalTime(totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0))}
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${studyPercentage}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0%</Text>
            <Text style={styles.progressLabel}>50%</Text>
            <Text style={styles.progressLabel}>100%</Text>
          </View>
        </View>
      )}

      {activeTab === 'details' && (
        <View style={styles.detailsContent}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.studyIcon]}>
              <Icon name="book-open" size={20} color="#15803d" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>זמן למידה</Text>
              <Text style={[styles.statValue, styles.studyValue]}>
                {formatTotalTime(totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0))}
              </Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, styles.breakIcon]}>
              <Icon name="coffee" size={20} color="#854d0e" />
            </View>
            <View style={styles.statInfo}>
              <Text style={styles.statLabel}>זמן הפסקה</Text>
              <Text style={[styles.statValue, styles.breakValue]}>
                {formatTotalTime(totalBreakTime + (timerState === 'BREAK' ? currentTime : 0))}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabList: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    padding: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '500',
  },
  summaryContent: {
    gap: 8,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#374151',
  },
  summaryTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22c55e',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  detailsContent: {
    gap: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studyIcon: {
    backgroundColor: '#dcfce7',
  },
  breakIcon: {
    backgroundColor: '#fef9c3',
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#374151',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  studyValue: {
    color: '#15803d',
  },
  breakValue: {
    color: '#854d0e',
  },
});
