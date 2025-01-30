import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { ChatMessage } from './components/ChatAssistant/ChatMessage';
import { ChatInput } from './components/ChatAssistant/ChatInput';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatAssistant'>;

interface ChatMessageType {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  user_id: string;
}

export default function ChatAssistantScreen({ navigation }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לצפות בצ\'אט');
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', session.session.user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessageType[];
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        throw new Error('יש להתחבר כדי לשלוח הודעה');
      }

      // First, insert the user's message
      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert([{
          content,
          role: 'user',
          user_id: session.session.user.id
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Then, get the AI response
      const { data: aiResponse, error: aiError } = await supabase
        .functions.invoke('chat-assistant', {
          body: { message: content }
        });

      if (aiError) throw aiError;

      // Finally, insert the AI's response
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('chat_messages')
        .insert([{
          content: aiResponse.message,
          role: 'assistant',
          user_id: session.session.user.id
        }])
        .select()
        .single();

      if (assistantError) throw assistantError;

      return { userMessage, assistantMessage };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />
      
      <ChatInput
        onSendMessage={(message) => sendMessageMutation.mutate(message)}
        isLoading={sendMessageMutation.isPending}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    padding: 16,
  },
});
