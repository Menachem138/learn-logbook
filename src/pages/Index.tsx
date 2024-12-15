import React from "react";
import { StudyTimer } from "@/components/StudyTimer";
import MotivationalQuotes from "@/components/MotivationalQuotes";
import CourseContent from "@/components/CourseContent";
import Library from "@/components/Library";
import Questions from "@/components/Questions";
import ChatAssistant from "@/components/ChatAssistant";
import CourseSchedule from "@/components/CourseSchedule";
import LearningJournal from "@/components/LearningJournal";
import StudyGoals from "@/components/StudyGoals";

export default function Index() {
  return (
    <div className="container py-6 space-y-6 text-right" dir="rtl">
      {/* Timer, Goals, and Chat Assistant in a grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudyGoals />
        <StudyTimer />
        <ChatAssistant />
      </div>

      {/* Other components in full width */}
      <div className="space-y-6">
        <MotivationalQuotes />
        <CourseContent />
        <CourseSchedule />
        <Library />
        <Questions />
        <LearningJournal />
      </div>
    </div>
  );
}
