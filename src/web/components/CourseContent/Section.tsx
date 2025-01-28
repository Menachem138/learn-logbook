import React from "react";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Lesson } from "./types";

interface SectionProps {
  title: string;
  lessons: Lesson[];
  duration: string;
  onLessonComplete: (lessonIndex: number) => void;
}

const Section = ({ title, lessons, duration, onLessonComplete }: SectionProps) => {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>
        <div className="flex justify-between w-full">
          <span>{title}</span>
          <Badge variant="secondary">{duration}</Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-2">
          {lessons.map((lesson, index) => (
            <li key={index} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={lesson.completed}
                  onCheckedChange={() => onLessonComplete(index)}
                />
                <span className={lesson.completed ? "line-through" : ""}>
                  {lesson.title}
                </span>
              </div>
              <span className="text-muted-foreground">{lesson.duration}</span>
            </li>
          ))}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
};

export default Section;