import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion } from "@/components/ui/accordion";
import Section from "./Section";
import { initialCourseData } from "./courseData";  // Updated import
import { Section as SectionType } from "./types";
import { useToast } from "@/hooks/use-toast";

const CourseContent = () => {
  const [courseData, setCourseData] = useState<SectionType[]>(initialCourseData);
  const { toast } = useToast();

  const calculateTotalDuration = useCallback((lessons: any[]) => {
    const totalSeconds = lessons.reduce((acc, lesson) => {
      const [hours, minutes, seconds] = lesson.duration.split(':').map(Number);
      return acc + hours * 3600 + minutes * 60 + seconds;
    }, 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  }, []);

  const handleLessonComplete = useCallback((sectionIndex: number, lessonIndex: number) => {
    setCourseData(prevData => {
      const newData = [...prevData];
      newData[sectionIndex].lessons[lessonIndex].completed = 
        !newData[sectionIndex].lessons[lessonIndex].completed;
      return newData;
    });
    
    toast({
      title: "סטטוס שיעור עודכן",
      description: "ההתקדמות שלך נשמרה!",
    });
  }, [toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>תוכן הקורס</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {courseData.map((section, sectionIndex) => (
            <Section
              key={sectionIndex}
              title={section.title}
              lessons={section.lessons}
              duration={calculateTotalDuration(section.lessons)}
              onLessonComplete={(lessonIndex) => handleLessonComplete(sectionIndex, lessonIndex)}
            />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default CourseContent;