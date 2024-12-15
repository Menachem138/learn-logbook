import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/useProgress";

const ProgressTracker = () => {
  const { totalProgress, lessonProgress, goalProgress, fetchProgress } = useProgress();

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>התקדמות כללית</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Progress value={totalProgress} className="w-full" />
          <p className="text-center mt-2">{totalProgress}% הושלמו</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p>שיעורים: {Math.round(lessonProgress)}%</p>
          </div>
          <div className="text-left">
            <p>מטרות: {Math.round(goalProgress)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
