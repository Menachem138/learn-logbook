import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Accordion } from "@/components/ui/accordion";
import { initialCourseData } from "./CourseContent/courseData";
import { CourseSection } from "./CourseContent/CourseSection";
import { useCourseProgress } from "@/hooks/useCourseProgress";
import { triggerConfetti } from "@/utils/confetti";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function CourseContent() {
  const { completedLessons, loading, error, toggleLesson } = useCourseProgress();
  const { toast } = useToast();

  const totalLessons = initialCourseData.reduce(
    (acc, section) => acc + section.lessons.length,
    0
  );

  // Fix progress calculation by ensuring proper division
  const progress = completedLessons ? (completedLessons.size / totalLessons) * 100 : 0;

  const handleToggleLesson = async (lessonId: string) => {
    try {
      if (!completedLessons) return;
      
      const wasCompleted = completedLessons.has(lessonId);
      await toggleLesson(lessonId);
      
      // Only trigger confetti when completing a lesson, not when unchecking
      if (!wasCompleted) {
        triggerConfetti();
        toast({
          title: "כל הכבוד!",
          description: "השיעור סומן כהושלם",
        });
      }
    } catch (err) {
      console.error("Error toggling lesson:", err);
      toast({
        title: "שגיאה בעדכון השיעור",
        description: "לא הצלחנו לעדכן את סטטוס השיעור. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-2 w-full" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          שגיאה בטעינת התקדמות הקורס. נסה לרענן את העמוד.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">התקדמות בקורס</h2>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {completedLessons?.size || 0} מתוך {totalLessons} שיעורים הושלמו ({progress.toFixed(1)}%)
        </p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {initialCourseData.map((section, index) => (
          <CourseSection
            key={index}
            index={index}
            title={section.title}
            lessons={section.lessons}
            completedLessons={completedLessons || new Set()}
            onToggleLesson={handleToggleLesson}
          />
        ))}
      </Accordion>
    </Card>
  );
}