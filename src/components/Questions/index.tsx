import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MessageCircle, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionDialog } from './QuestionDialog';
import { QuestionList } from './QuestionList';

export default function Questions() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = React.useState('');
  const [newAnswer, setNewAnswer] = React.useState('');
  const [questionType, setQuestionType] = React.useState<'general' | 'trading'>('general');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = React.useState<string | null>(null);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: questions, isLoading, error } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id,
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('questions').insert([
        {
          content,
          user_id: session.user.id,
          type: questionType,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setNewQuestion('');
      setIsDialogOpen(false);
      toast({
        title: "השאלה נשמרה בהצלחה",
        description: "נענה בהקדם האפשרי",
      });
    },
    onError: (error) => {
      console.error('Error adding question:', error);
      toast({
        title: "שגיאה בשמירת השאלה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    },
  });

  const addAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
      if (!session?.user?.id) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('questions')
        .update({ answer, is_answered: true })
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      setNewAnswer('');
      setIsAnswerDialogOpen(false);
      setSelectedQuestionId(null);
      toast({
        title: "התשובה נשמרה בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error adding answer:', error);
      toast({
        title: "שגיאה בשמירת התשובה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      toast({
        title: "השאלה נמחקה בהצלחה",
      });
    },
    onError: (error) => {
      console.error('Error deleting question:', error);
      toast({
        title: "שגיאה במחיקת השאלה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    },
  });

  if (!session) {
    return (
      <div className="text-center py-8">
        <p>יש להתחבר כדי לצפות בשאלות</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>שגיאה בטעינת השאלות. אנא נסה שוב מאוחר יותר</p>
        <p className="text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleQuestionSubmit = (content: string) => {
    if (!content.trim()) return;
    addQuestionMutation.mutate(content);
  };

  const handleAnswerSubmit = (answer: string) => {
    if (!answer.trim() || !selectedQuestionId) return;
    addAnswerMutation.mutate({ questionId: selectedQuestionId, answer });
  };

  return (
    <div className="bg-background text-foreground transition-colors duration-300 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <MessageCircle className="h-6 w-6" />
          שאלות
        </h2>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          שאלה חדשה
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">שאלות כלליות</TabsTrigger>
          <TabsTrigger value="trading">שאלות ליועץ המסחר</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          <QuestionList
            questions={questions?.filter(q => q.type === 'general') || []}
            onAnswerClick={(id) => {
              setSelectedQuestionId(id);
              setIsAnswerDialogOpen(true);
              const question = questions?.find(q => q.id === id);
              if (question?.answer) {
                setNewAnswer(question.answer);
              }
            }}
            onDelete={(id) => deleteQuestionMutation.mutate(id)}
          />
        </TabsContent>
        <TabsContent value="trading" className="mt-6">
          <QuestionList
            questions={questions?.filter(q => q.type === 'trading') || []}
            onAnswerClick={(id) => {
              setSelectedQuestionId(id);
              setIsAnswerDialogOpen(true);
              const question = questions?.find(q => q.id === id);
              if (question?.answer) {
                setNewAnswer(question.answer);
              }
            }}
            onDelete={(id) => deleteQuestionMutation.mutate(id)}
          />
        </TabsContent>
      </Tabs>

      <QuestionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleQuestionSubmit}
        title="הוספת שאלה חדשה"
        value={newQuestion}
        onChange={setNewQuestion}
        submitLabel={addQuestionMutation.isPending ? 'שולח...' : 'שלח שאלה'}
        questionType={questionType}
        onQuestionTypeChange={setQuestionType}
      />

      <QuestionDialog
        isOpen={isAnswerDialogOpen}
        onClose={() => {
          setIsAnswerDialogOpen(false);
          setSelectedQuestionId(null);
          setNewAnswer('');
        }}
        onSubmit={handleAnswerSubmit}
        title="הוספת תשובה"
        value={newAnswer}
        onChange={setNewAnswer}
        submitLabel={addAnswerMutation.isPending ? 'שומר...' : 'שמור תשובה'}
        questionType={questionType}
        onQuestionTypeChange={setQuestionType}
      />
    </div>
  );
}
