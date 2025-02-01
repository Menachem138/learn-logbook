import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Achievement } from './types';

interface RewardStats {
  total_points: number;
  current_streak: number;
  longest_streak: number;
  achievements: Achievement[];
}

export const RewardsSystem: React.FC = () => {
  const [rewardStats, setRewardStats] = useState<RewardStats>({
    total_points: 0,
    current_streak: 0,
    longest_streak: 0,
    achievements: []
  });
  const { session } = useAuth();

  useEffect(() => {
    const fetchRewardStats = async () => {
      if (!session?.user?.id) return;

      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (statsError) {
        console.error('Error fetching stats:', statsError);
        return;
      }

      const { data: achievements, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', session.user.id);

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        return;
      }

      // Type assertion to ensure achievements match the Achievement type
      const typedAchievements = achievements?.map(achievement => ({
        ...achievement,
        type: achievement.type as Achievement['type']
      })) || [];

      setRewardStats({
        total_points: stats?.total_points || 0,
        current_streak: stats?.current_streak || 0,
        longest_streak: stats?.longest_streak || 0,
        achievements: typedAchievements
      });
    };

    fetchRewardStats();
  }, [session?.user?.id]);

  const getAchievementIcon = (type: Achievement['type']) => {
    switch (type) {
      case 'trophy':
        return <Trophy className="h-5 w-5" />;
      case 'star':
        return <Star className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 rtl" dir="rtl">
      <h2 className="text-2xl font-bold">הישגים ופרסים</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex flex-col items-center">
            <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
            <h3 className="text-lg font-semibold">נקודות כוללות</h3>
            <p className="text-2xl font-bold">{rewardStats.total_points}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center">
            <Star className="h-8 w-8 text-blue-500 mb-2" />
            <h3 className="text-lg font-semibold">רצף נוכחי</h3>
            <p className="text-2xl font-bold">{rewardStats.current_streak} ימים</p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex flex-col items-center">
            <Award className="h-8 w-8 text-purple-500 mb-2" />
            <h3 className="text-lg font-semibold">רצף הכי ארוך</h3>
            <p className="text-2xl font-bold">{rewardStats.longest_streak} ימים</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">הישגים אחרונים</h3>
        <div className="space-y-4">
          {rewardStats.achievements.map((achievement) => (
            <div key={achievement.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {getAchievementIcon(achievement.type)}
              <div>
                <h4 className="font-semibold">{achievement.title}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
              <Badge variant="secondary" className="mr-auto">
                {new Date(achievement.earned_at).toLocaleDateString('he-IL')}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RewardsSystem;
