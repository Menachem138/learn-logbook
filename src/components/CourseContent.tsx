import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion } from "@/components/ui/accordion";
import { initialCourseData } from "./CourseContent/courseData";
import { CourseSection } from "./CourseContent/CourseSection";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { triggerConfetti } from "@/utils/confetti";

export default function CourseContent() {
  const { completedLessons, loading, toggleLesson } = useCourseProgress();

  const totalLessons = initialCourseData.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );

  const progress = (completedLessons.size / totalLessons) * 100;

  const handleToggleLesson = async (lessonId: string) => {
    const wasCompleted = completedLessons.has(lessonId);
    await toggleLesson(lessonId);
    
    // Only trigger confetti when completing a lesson, not when unchecking
    if (!wasCompleted) {
      triggerConfetti();
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center">טוען...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">התקדמות בקורס</h2>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {completedLessons.size} מתוך {totalLessons} שיעורים הושלמו ({progress.toFixed(1)}%)
        </p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {initialCourseData.map((section, index) => (
          <CourseSection
            key={index}
            index={index}
            title={section.title}
            lessons={section.lessons}
            completedLessons={completedLessons}
            onToggleLesson={handleToggleLesson}
          />
        ))}
      </Accordion>
    </Card>
  );
}