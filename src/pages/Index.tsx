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
import { Documents } from "@/components/Documents";
import { Calendar } from "@/components/Calendar";

export default function Index() {
  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-right">
          ברוך הבא
        </h1>
        
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
    </div>
  );
}