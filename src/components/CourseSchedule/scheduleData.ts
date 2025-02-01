import { Json } from "@/integrations/supabase/types";

export interface ScheduleItem {
  time: string;
  activity: string;
}

export interface DaySchedule {
  day: string;
  schedule: ScheduleItem[];
}

// Helper function to convert schedule items to/from JSON
export const scheduleToJson = (schedule: ScheduleItem[]): Json => {
  return schedule as unknown as Json;
};

export const jsonToSchedule = (json: Json): ScheduleItem[] => {
  if (Array.isArray(json)) {
    return json.map(item => {
      const jsonItem = item as { [key: string]: unknown };
      return {
        time: String(jsonItem.time || ''),
        activity: String(jsonItem.activity || '')
      };
    });
  }
  return [];
};

export const initialWeeklySchedule: DaySchedule[] = [
  {
    day: "יום שני",
    schedule: [
      { time: "16:00–16:15", activity: "הכנה מנטלית ופיזית" },
      { time: "16:15–17:00", activity: "צפייה בפרק מהקורס וסיכומים" },
      { time: "17:00–17:10", activity: "הפסקת ריענון קצרה" },
      { time: "17:10–18:00", activity: "תרגול מעשי" },
      { time: "18:00–18:10", activity: "הפסקה קצרה נוספת" },
      { time: "18:10–19:00", activity: "חזרה על החומר וכתיבת שאלות פתוחות" },
    ]
  },
  {
    day: "יום שלישי",
    schedule: [
      { time: "16:00–16:15", activity: "הכנה מנטלית ופיזית" },
      { time: "16:15–17:00", activity: "צפייה בפרק מהקורס וסיכומים" },
      { time: "17:00–17:10", activity: "הפסקת ריענון קצרה" },
      { time: "17:10–18:00", activity: "תרגול מעשי" },
      { time: "18:00–18:10", activity: "הפסקה קצרה נוספת" },
      { time: "18:10–19:00", activity: "חזרה על החומר וכתיבת שאלות פתוחות" },
    ]
  },
  {
    day: "יום רביעי",
    schedule: [
      { time: "16:00–16:15", activity: "הכנה מנטלית ופיזית" },
      { time: "16:15–17:00", activity: "צפייה בפרק מהקורס וסיכומים" },
      { time: "17:00–17:10", activity: "הפסקת ריענון קצרה" },
      { time: "17:10–18:00", activity: "תרגול מעשי" },
      { time: "18:00–18:10", activity: "הפסקה קצרה נוספת" },
      { time: "18:10–19:00", activity: "חזרה על החומר וכתיבת שאלות פתוחות" },
    ]
  },
  {
    day: "יום חמישי",
    schedule: [
      { time: "16:00–16:15", activity: "הכנה מנטלית ופיזית" },
      { time: "16:15–17:00", activity: "צפייה בפרק מהקורס וסיכומים" },
      { time: "17:00–17:10", activity: "הפסקת ריענון קצרה" },
      { time: "17:10–18:00", activity: "תרגול מעשי" },
      { time: "18:00–18:10", activity: "הפסקה קצרה נוספת" },
      { time: "18:10–19:00", activity: "חזרה על החומר וכתיבת שאלות פתוחות" },
    ]
  }
];