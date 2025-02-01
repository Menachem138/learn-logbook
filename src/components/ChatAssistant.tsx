import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuth();

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id) return;

    const userMessage = newMessage;
    setNewMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: { message: userMessage, userId: session.user.id }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        // Handle rate limiting specifically
        if (data.error === 'Rate limit exceeded') {
          toast({
            title: "נא להמתין",
            description: "נא להמתין מעט לפני שליחת הודעה נוספת",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        setMessages(prev => prev.slice(0, -1));
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Determine the error message based on the type of error
      let errorMessage = "אנא נסה שוב מאוחר יותר";
      if (error.message?.includes('Rate limit exceeded') || 
          error.status === 429 || 
          error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        errorMessage = "נא להמתין מעט לפני שליחת הודעה נוספת";
      }
      
      toast({
        title: "שגיאה בשליחת ההודעה",
        description: errorMessage,
        variant: "destructive",
      });
      
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4 h-[500px] flex flex-col">
      <ScrollArea className="flex-grow mb-4 pr-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-muted'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="flex gap-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="שאל את העוזר האישי שלך..."
          className="min-h-[60px]"
        />
        <Button type="submit" disabled={isLoading || !newMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </Card>
  );
}