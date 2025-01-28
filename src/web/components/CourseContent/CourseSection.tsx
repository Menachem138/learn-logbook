import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LessonItem } from "./LessonItem";

interface Lesson {
  title: string;
  duration: string;
}

interface CourseSectionProps {
  index: number;
  title: string;
  lessons: Lesson[];
  completedLessons: Set<string>;
  onToggleLesson: (lessonId: string) => void;
}

export function CourseSection({ 
  index, 
  title, 
  lessons, 
  completedLessons, 
  onToggleLesson 
}: CourseSectionProps) {
  return (
    <AccordionItem value={`section-${index}`}>
      <AccordionTrigger className="text-right">
        <div className="flex justify-between w-full items-center">
          <span>{title}</span>
          <Badge variant="secondary" className="ml-2">
            {lessons.length} שיעורים
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <ul className="space-y-2">
          {lessons.map((lesson, lessonIndex) => {
            const lessonId = `${index}-${lessonIndex}`;
            return (
              <LessonItem
                key={lessonIndex}
                title={lesson.title}
                duration={lesson.duration}
                isCompleted={completedLessons.has(lessonId)}
                onToggle={() => onToggleLesson(lessonId)}
              />
            );
          })}
        </ul>
      </AccordionContent>
    </AccordionItem>
  );
}