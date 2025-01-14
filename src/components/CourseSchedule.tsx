import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WeeklySchedule } from "./CourseSchedule/WeeklySchedule";
import { useToast } from "@/hooks/use-toast";
import { initialWeeklySchedule, scheduleToJson, jsonToSchedule, DaySchedule } from "./CourseSchedule/scheduleData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

const weeklyTopics = [
  {
    week: 1,
    title: "יסודות הקריפטו",
    topics: [
      "יסודות הקריפטו",
      "מסחר בסיסי",
      "ניתוח טכני ראשוני"
    ]
  },
  {
    week: 2,
    title: "פלטפורמות ואינדיקטורים",
    topics: [
      "תפעול פלטפורמות",
      "עבודה עם ארנקים",
      "אינדיקטורים",
      "יישום בסיסי בשוק"
    ]
  },
  {
    week: 3,
    title: "אסטרטגיות מתקדמות",
    topics: [
      "אסטרטגיות מתקדמות",
      "וייקוף",
      "מבנה שוק",
      "המשקפיים של חי טל",
      "תוכנית עבודה וניהול סיכונים"
    ]
  },
  {
    week: 4,
    title: "מסחר מעשי",
    topics: [
      "נזילות",
      "היצע/ביקוש",
      "מסחר בספוט",
      "כלים מנטליים",
      "סקירות שוק מעשיות"
    ]
  }
];

const backupBlocks = [
  {
    title: "בלוק גיבוי",
    sessions: [
      "שלישי בערב (20:30–21:30): זמן להשלמות",
      'שישי אחה"צ (14:00–15:00): סשן חירום להשלמת חומר'
    ]
  }
];

const importantRules = [
  {
    title: "כללים חשובים",
    rules: [
      "שגרת הכנה: סידור המקום והכנה מנטלית בכל תחילת סשן",
      "הפסקות מובנות: כל 50 דקות לימוד, 10 דקות הפסקה",
      "מעקב יומי: רשום במחברת מה למדת ומה דורש העמקה",
      "תגמולים ועונשים: תגמל את עצמך על התמדה, הענש את עצמך בעדינות במקרה של התחמקות ללא סיבה"
    ]
  }
];

export default function CourseSchedule() {
  const [weeklySchedule, setWeeklySchedule] = useState(initialWeeklySchedule);
  const { toast } = useToast();
  const { session } = useAuth();

  useEffect(() => {
    if (session?.user?.id) {
      loadScheduleFromSupabase();
    }
  }, [session?.user?.id]);

  const loadScheduleFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const formattedSchedule = data.map(item => ({
          day: item.day_name,
          schedule: jsonToSchedule(item.schedule)
        }));
        setWeeklySchedule(formattedSchedule);
      } else {
        await saveScheduleToSupabase(initialWeeklySchedule);
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast({
        title: "שגיאה בטעינת לוח הזמנים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const saveScheduleToSupabase = async (scheduleToSave: DaySchedule[]) => {
    if (!session?.user?.id) return;

    try {
      await supabase
        .from('schedules')
        .delete()
        .eq('user_id', session.user.id);

      const { error } = await supabase
        .from('schedules')
        .insert(
          scheduleToSave.map(day => ({
            user_id: session.user.id,
            day_name: day.day,
            schedule: scheduleToJson(day.schedule)
          }))
        );

      if (error) throw error;
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  };

  const handleUpdateDay = async (dayIndex: number, newSchedule: any[]) => {
    try {
      const updatedSchedule = [...weeklySchedule];
      updatedSchedule[dayIndex] = {
        ...updatedSchedule[dayIndex],
        schedule: newSchedule
      };
      
      await saveScheduleToSupabase(updatedSchedule);
      setWeeklySchedule(updatedSchedule);
      
      toast({
        title: "לוח הזמנים עודכן",
        description: "השינויים נשמרו בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה בשמירת לוח הזמנים",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDayName = async (dayIndex: number, newName: string) => {
    try {
      const updatedSchedule = [...weeklySchedule];
      updatedSchedule[dayIndex] = {
        ...updatedSchedule[dayIndex],
        day: newName
      };
      
      await saveScheduleToSupabase(updatedSchedule);
      setWeeklySchedule(updatedSchedule);
      
      toast({
        title: "שם היום עודכן",
        description: "השינויים נשמרו בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה בשמירת שם היום",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const handleAddDay = async () => {
    try {
      const newDay = {
        day: `יום ${weeklySchedule.length + 1}`,
        schedule: [
          { time: "16:00–16:15", activity: "הכנה מנטלית ופיזית" },
          { time: "16:15–17:00", activity: "צפייה בפרק מהקורס וסיכומים" },
        ]
      };
      
      const updatedSchedule = [...weeklySchedule, newDay];
      await saveScheduleToSupabase(updatedSchedule);
      setWeeklySchedule(updatedSchedule);
      
      toast({
        title: "יום חדש נוסף",
        description: "יום חדש נוסף ללוח הזמנים",
      });
    } catch (error) {
      toast({
        title: "שגיאה בהוספת יום חדש",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDay = async (dayIndex: number) => {
    try {
      const updatedSchedule = weeklySchedule.filter((_, index) => index !== dayIndex);
      await saveScheduleToSupabase(updatedSchedule);
      setWeeklySchedule(updatedSchedule);
      
      toast({
        title: "יום הוסר",
        description: "היום הוסר מלוח הזמנים",
      });
    } catch (error) {
      toast({
        title: "שגיאה במחיקת היום",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>לוח זמנים לקורס הקריפטו</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="schedule">לוח זמנים שבועי</TabsTrigger>
            <TabsTrigger value="topics">נושאים שבועיים</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule">
            <div className="space-y-8">
              <WeeklySchedule
                schedule={weeklySchedule}
                onUpdateDay={handleUpdateDay}
                onUpdateDayName={handleUpdateDayName}
                onAddDay={handleAddDay}
                onDeleteDay={handleDeleteDay}
              />
              
              <div className="space-y-8">
                {backupBlocks.map((block, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg">{block.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {block.sessions.map((session, sessionIndex) => (
                          <li key={sessionIndex} className="flex items-center py-2">
                            <Badge variant="secondary" className="mr-2">גיבוי</Badge>
                            <span>{session}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}

                {importantRules.map((block, index) => (
                  <Card key={index} className="border-2 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-lg">{block.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc list-inside">
                        {block.rules.map((rule, ruleIndex) => (
                          <li key={ruleIndex} className="text-muted-foreground">
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="topics">
            <div className="grid gap-6">
              {weeklyTopics.map((week) => (
                <Card key={week.week} className="overflow-hidden">
                  <CardHeader className="bg-muted">
                    <CardTitle className="text-lg">
                      שבוע {week.week}: {week.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-2">
                      {week.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-center py-2 border-b last:border-0">
                          <Badge variant="outline" className="mr-2">{topicIndex + 1}</Badge>
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
