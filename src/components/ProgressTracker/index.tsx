import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

interface CourseProgress {
  course_id: string;
  completed_sections: string[];
  total_sections: number;
  last_activity: string;
}

export const ProgressTracker: React.FC = () => {
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const { session } = useAuth();

  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        console.error('Error fetching progress:', error);
        return;
      }

      setProgress(data || []);
    };

    fetchProgress();
  }, [session?.user?.id]);

  return (
    <div className="space-y-4 rtl">
      <h2 className="text-2xl font-bold mb-4">התקדמות בקורס</h2>
      {progress.map((courseProgress) => (
        <Card key={courseProgress.course_id} className="p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {courseProgress.course_id}
              </h3>
              <span className="text-sm text-gray-500">
                {Math.round((courseProgress.completed_sections.length / courseProgress.total_sections) * 100)}%
              </span>
            </div>
            <Progress
              value={(courseProgress.completed_sections.length / courseProgress.total_sections) * 100}
              className="w-full"
            />
            <p className="text-sm text-gray-500 mt-2">
              פעילות אחרונה: {new Date(courseProgress.last_activity).toLocaleDateString('he-IL')}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
