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
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserProfile } from "@/components/UserProfile";

export default function Index() {
  return (
    <div className="container py-6 space-y-6 text-right" dir="rtl">
      {/* Theme toggle and profile section */}
      <div className="flex justify-between items-center">
        <ThemeToggle />
        <UserProfile />
      </div>

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
        <Library />
        <YouTubeLibrary />
        <TwitterLibrary />
        <Questions />
        <LearningJournal />
      </div>
    </div>
  );
}