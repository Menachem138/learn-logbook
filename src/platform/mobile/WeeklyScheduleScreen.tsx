import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, I18nManager } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaContainer } from '../components/layout';
import { theme } from '../theme';

// Force RTL
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const DEFAULT_SCHEDULE = [
  { time: '16:00–16:15', activity: 'הכנה מנטלית ופיזית' },
  { time: '16:15–17:00', activity: 'צפייה בפרק מהקורס וסיכומים' },
  { time: '17:00–17:10', activity: 'הפסקת ריענון קצרה' },
  { time: '17:10–18:00', activity: 'תרגול מעשי' },
  { time: '18:00–18:10', activity: 'הפסקה קצרה נוספת' },
  { time: '18:10–19:00', activity: 'חזרה על החומר וכתיבת שאלות פתוחות' },
];

const DAYS = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
];

export default function WeeklyScheduleScreen() {
  const [selectedDay, setSelectedDay] = useState(1); // Monday (שני) by default

  return (
    <SafeAreaContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>לוח זמנים שבועי</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
        {DAYS.map((day, index) => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              selectedDay === index && styles.selectedDayButton,
            ]}
            onPress={() => setSelectedDay(index)}
          >
            <Text style={[
              styles.dayButtonText,
              selectedDay === index && styles.selectedDayButtonText,
            ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scheduleContainer}>
        {DEFAULT_SCHEDULE.map((item, index) => (
          <View key={index} style={styles.scheduleItem}>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <View style={styles.activityContainer}>
              <Text style={styles.activityText}>{item.activity}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Icon name="plus" size={24} color={theme.colors.surface.primary} />
          <Text style={styles.addButtonText}>הוסף משימה</Text>
        </TouchableOpacity>
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
  daysContainer: {
    backgroundColor: theme.colors.surface.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  dayButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.xs,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.surface.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.small,
  },
  selectedDayButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  dayButtonText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedDayButtonText: {
    color: theme.colors.surface.primary,
  },
  scheduleContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  scheduleItem: {
    flexDirection: 'row-reverse', // RTL support
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.small,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeContainer: {
    backgroundColor: theme.colors.surface.secondary,
    padding: theme.spacing.md,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: theme.borderRadius.lg,
    width: 130,
    justifyContent: 'center',
  },
  timeText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  activityContainer: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  activityText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    textAlign: 'right',
    lineHeight: 24,
    letterSpacing: 0.3,
  },
  addButton: {
    flexDirection: 'row-reverse', // RTL support
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadow.medium,
  },
  addButtonText: {
    color: theme.colors.surface.primary,
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semiBold,
    marginRight: theme.spacing.md,
    letterSpacing: 0.5,
  },
});
