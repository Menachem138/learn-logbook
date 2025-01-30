import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatTotalTime } from '@/utils/timeUtils';
import type { TimerState } from '@/components/StudyTimeTracker/types';
import { Ionicons } from '@expo/vector-icons';

interface TimerStatsProps {
  totalStudyTime: number;
  totalBreakTime: number;
  currentTime: number;
  timerState: TimerState;
}

export const TimerStats: React.FC<TimerStatsProps> = ({
  totalStudyTime,
  totalBreakTime,
  currentTime,
  timerState,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details'>('summary');
  const totalTime = totalStudyTime + totalBreakTime + (timerState !== 'STOPPED' ? currentTime : 0);
  const studyPercentage = totalTime > 0 
    ? ((totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0)) / totalTime) * 100 
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.tabList}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>סיכום</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'details' && styles.activeTab]}
          onPress={() => setActiveTab('details')}
        >
          <Text style={[styles.tabText, activeTab === 'details' && styles.activeTabText]}>פירוט</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'summary' ? (
        <View style={styles.summaryContent}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>זמן למידה</Text>
            <Text style={styles.summaryTime}>
              {formatTotalTime(totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0))}
            </Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${studyPercentage}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0%</Text>
            <Text style={styles.progressLabel}>50%</Text>
            <Text style={styles.progressLabel}>100%</Text>
          </View>
        </View>
      ) : (
        <View style={styles.detailsContent}>
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Ionicons name="book" size={20} color="#166534" />
              <Text style={styles.detailLabel}>זמן למידה</Text>
            </View>
            <Text style={styles.detailTime}>
              {formatTotalTime(totalStudyTime + (timerState === 'STUDYING' ? currentTime : 0))}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <View style={styles.detailHeader}>
              <Ionicons name="cafe" size={20} color="#854d0e" />
              <Text style={styles.detailLabel}>זמן הפסקה</Text>
            </View>
            <Text style={styles.detailTime}>
              {formatTotalTime(totalBreakTime + (timerState === 'BREAK' ? currentTime : 0))}
            </Text>
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
    padding: 4,
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
    color: '#000',
    fontWeight: '500',
  },
  summaryContent: {
    marginTop: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000',
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
    marginTop: 16,
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#166534',
  },
  detailTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
});
