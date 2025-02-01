import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/hooks/useProgress";

const ProgressTracker = () => {
  const { progress } = useProgress();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>התקדמות כללית</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="w-full" />
        <p className="text-center mt-2">{progress}% הושלמו</p>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;