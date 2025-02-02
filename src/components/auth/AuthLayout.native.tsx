import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/integrations/supabase/client';
import { useNavigation } from '@react-navigation/native';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { useAuth } from './AuthProvider';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AuthLayout() {
  const navigation = useNavigation<NavigationProp>();
  const { authenticateWithBiometric } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigation.replace('Home');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigation]);

  const signInWithEmail = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.session) {
        const biometricResult = await authenticateWithBiometric();
        if (biometricResult) {
          navigation.replace('Home');
        } else {
          Alert.alert('אימות ביומטרי נכשל', 'אנא נסה שוב או השתמש בסיסמה');
        }
      }
    } catch (error) {
      Alert.alert('שגיאת התחברות', 'אירעה שגיאה בתהליך ההתחברות. אנא נסה שוב.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>התחברות לקורס קריפטו</Text>
        <TextInput
          style={styles.input}
          placeholder="אימייל"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          textAlign="right"
        />
        <TextInput
          style={styles.input}
          placeholder="סיסמה"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          textAlign="right"
        />
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={signInWithEmail}
        >
          <Text style={styles.buttonText}>התחבר</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#111827',
  },
  input: {
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    width: '100%',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4285f4',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
