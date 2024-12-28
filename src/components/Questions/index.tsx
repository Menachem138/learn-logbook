import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageCircle, Plus, MessageSquareQuote } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Question {
  id: string;
  content: string;
  answer: string | null;
  is_answered: boolean;
  created_at: string;
  type: 'general' | 'trading';
}

const Questions = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [newQuestion, setNewQuestion] = React.useState('');
  const [newAnswer, setNewAnswer] = React.useState('');
  const [questionType, setQuestionType] = React.useState<'general' | 'trading'>('general');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = React.useState<string | null>(null);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = React.useState(false);
  const queryClient = useQueryClient();

  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Question[];
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase.from('questions').insert([
        {
          content,
          user_id: session?.user.id,
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
    onError: () => {
      toast({
        title: "שגיאה בשמירת השאלה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    },
  });

  const addAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer }: { questionId: string; answer: string }) => {
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
        description: "התשובה נוספה לשאלה",
      });
    },
    onError: () => {
      toast({
        title: "שגיאה בשמירת התשובה",
        description: "אנא נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    addQuestionMutation.mutate(newQuestion);
  };

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnswer.trim() || !selectedQuestionId) return;
    addAnswerMutation.mutate({ questionId: selectedQuestionId, answer: newAnswer });
  };

  const renderQuestions = (type: 'general' | 'trading') => {
    const filteredQuestions = questions?.filter(q => q.type === type) || [];
    
    if (filteredQuestions.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          עדיין אין שאלות. אתה מוזמן להוסיף את השאלה הראשונה!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="bg-background text-foreground transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-lg">{question.content}</CardTitle>
              <CardDescription>
                {new Date(question.created_at).toLocaleDateString('he-IL')}
              </CardDescription>
            </CardHeader>
            {question.answer && (
              <CardContent className="pt-4 border-t">
                <p className="font-semibold mb-2">תשובה:</p>
                <p>{question.answer}</p>
              </CardContent>
            )}
            <CardFooter className="pt-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedQuestionId(question.id);
                  setIsAnswerDialogOpen(true);
                }}
              >
                <MessageSquareQuote className="h-4 w-4" />
                {question.answer ? 'ערוך תשובה' : 'הוסף תשובה'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-background text-foreground transition-colors duration-300 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <MessageCircle className="h-6 w-6" />
          שאלות
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              שאלה חדשה
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>הוספת שאלה חדשה</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  variant={questionType === 'general' ? 'default' : 'outline'}
                  onClick={() => setQuestionType('general')}
                >
                  שאלה כללית
                </Button>
                <Button
                  type="button"
                  variant={questionType === 'trading' ? 'default' : 'outline'}
                  onClick={() => setQuestionType('trading')}
                >
                  שאלה ליועץ המסחר
                </Button>
              </div>
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="מה תרצה לשאול?"
                className="min-h-[100px]"
              />
              <Button type="submit" disabled={!newQuestion.trim()}>
                שלח שאלה
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isAnswerDialogOpen} onOpenChange={setIsAnswerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת תשובה</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <Textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="כתוב את התשובה כאן..."
              className="min-h-[100px]"
            />
            <Button type="submit" disabled={!newAnswer.trim()}>
              שמור תשובה
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="text-center py-4">טוען...</div>
      ) : (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">שאלות כלליות</TabsTrigger>
            <TabsTrigger value="trading">שאלות ליועץ המסחר</TabsTrigger>
          </TabsList>
          <TabsContent value="general" className="mt-6">
            {renderQuestions('general')}
          </TabsContent>
          <TabsContent value="trading" className="mt-6">
            {renderQuestions('trading')}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Questions;
