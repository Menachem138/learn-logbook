import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/types/database';

type StudyGoal = Database['public']['Tables']['study_goals']['Row'];

export default function StudyGoals() {
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('study_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת המטרות",
        variant: "destructive",
      });
      return;
    }

    setGoals(data || []);
  };

  const addGoal = async () => {
    if (!newGoal.trim()) return;

    const { error } = await supabase
      .from('study_goals')
      .insert([{ description: newGoal.trim(), completed: false }]);

    if (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בהוספת המטרה",
        variant: "destructive",
      });
      return;
    }

    setNewGoal('');
    fetchGoals();
    toast({
      title: "הצלחה",
      description: "המטרה נוספה בהצלחה",
    });
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('study_goals')
      .update({ completed })
      .eq('id', id);

    if (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעדכון המטרה",
        variant: "destructive",
      });
      return;
    }

    fetchGoals();
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('study_goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה במחיקת המטרה",
        variant: "destructive",
      });
      return;
    }

    fetchGoals();
    toast({
      title: "הצלחה",
      description: "המטרה נמחקה בהצלחה",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>מטרות לימוד</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="הוסף מטרה חדשה"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            dir="rtl"
          />
          <Button onClick={addGoal}>הוסף</Button>
        </div>

        <div className="space-y-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center justify-between gap-2 p-2 bg-secondary/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={goal.completed}
                  onCheckedChange={(checked) => toggleGoal(goal.id, checked as boolean)}
                />
                <span className={goal.completed ? 'line-through text-muted-foreground' : ''}>
                  {goal.description}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteGoal(goal.id)}
                className="text-destructive hover:text-destructive/90"
              >
                מחק
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
