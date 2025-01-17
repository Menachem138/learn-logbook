import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { Database } from '../../lib/supabase/types';
import type { Question } from '../../lib/supabase/types/questions';

export const ChatScreen: React.FC = () => {
  const [questions, setQuestions] = useState<Array<Question>>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const { data: questionData, error } = await supabase
        .from('questions')
        .select()
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (questionData) {
        setQuestions(questionData);
      }
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      const { data: question, error } = await supabase
        .from('questions')
        .insert({
          content: newQuestion.trim(),
          user_id: userId,
          is_answered: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (question) {
        setQuestions(currentQuestions => [question, ...currentQuestions]);
        setNewQuestion('');
      }
    } catch (error) {
      console.error('Error asking question:', error);
    }
  };

  const renderItem = ({ item }: { item: Question }) => (
    <View style={styles.questionContainer}>
      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{item.content}</Text>
        {item.answer && (
          <View style={styles.answerContainer}>
            <Text style={styles.answerLabel}>Answer:</Text>
            <Text style={styles.answerText}>{item.answer}</Text>
          </View>
        )}
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={[styles.status, item.is_answered && styles.statusAnswered]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Questions & Answers</Text>
        </View>

        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
          refreshing={isLoading}
          onRefresh={loadQuestions}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newQuestion}
            onChangeText={setNewQuestion}
            placeholder="Ask a question..."
            multiline
          />
          <TouchableOpacity
            style={styles.askButton}
            onPress={askQuestion}
            disabled={!newQuestion.trim()}
          >
            <Text style={styles.askButtonText}>Ask Question</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  questionContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  questionContent: {
    flex: 1,
    marginRight: 12,
  },
  questionText: {
    fontSize: 16,
    marginBottom: 8,
  },
  answerContainer: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  answerLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0284c7',
    marginBottom: 4,
  },
  answerText: {
    fontSize: 14,
  },
  dateText: {
    fontSize: 12,
    color: '#64748b',
  },
  status: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginTop: 6,
  },
  statusAnswered: {
    backgroundColor: '#22c55e',
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
  },
  askButton: {
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  askButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
