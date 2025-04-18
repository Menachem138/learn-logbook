import React from "react";
import { StudyTimer } from "@/components/StudyTimer";
import MotivationalQuotes from "@/components/MotivationalQuotes";
import CourseContent from "@/components/CourseContent";
import Library from "@/components/Library";
import Questions from "@/components/Questions";
import ChatAssistant from "@/components/ChatAssistant";
import CourseSchedule from "@/components/CourseSchedule";
import LearningJournal from "@/components/LearningJournal";
import { YouTubeLibrary } from "@/components/YouTubeLibrary";
import { TwitterLibrary } from "@/components/TwitterLibrary";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Documents } from "@/components/Documents";
import { Calendar } from "@/components/Calendar";

export default function Index() {
  return (
    <div className="container py-6 space-y-6 text-right" dir="rtl">
      <div className="flex justify-between items-center">
        <ThemeToggle />
        <h1 className="text-2xl font-bold">ברוך הבא</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyTimer />
        <ChatAssistant />
      </div>

      <div className="space-y-6">
        <Calendar />
        <MotivationalQuotes />
        <CourseContent />
        <CourseSchedule />
        <Library />
        <Documents />
        <YouTubeLibrary />
        <TwitterLibrary />
        <Questions />
        <LearningJournal />
      </div>
    </div>
  );
}