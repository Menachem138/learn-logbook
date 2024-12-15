import React from "react";
import { StudyTimer } from "@/components/StudyTimer";
import MotivationalQuotes from "@/components/MotivationalQuotes";
import CourseContent from "@/components/CourseContent";
import { TabsLibrary } from "@/components/TabsLibrary";
import Questions from "@/components/Questions";
import ChatAssistant from "@/components/ChatAssistant";
import CourseSchedule from "@/components/CourseSchedule";
import LearningJournal from "@/components/LearningJournal";

export default function Index() {
  return (
    <div className="container py-6 space-y-6 text-right" dir="rtl">
      {/* Timer and Chat Assistant in a row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyTimer />
        <ChatAssistant />
      </div>

      {/* Other components in full width */}
      <div className="space-y-6">
        <MotivationalQuotes />
        <CourseContent />
        <CourseSchedule />
        <TabsLibrary />
        <Questions />
        <LearningJournal />
      </div>
    </div>
  );
}
