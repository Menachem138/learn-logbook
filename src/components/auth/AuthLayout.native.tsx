import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/integrations/supabase/client';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin, type User } from '@react-native-google-signin/google-signin';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/types/navigation';
import { useAuth } from './AuthProvider';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function AuthLayout() {
  const navigation = useNavigation<NavigationProp>();
  const { authenticateWithBiometric } = useAuth();

  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigation.replace('Home');
      }
    });

    GoogleSignin.configure({
      offlineAccess: true,
      webClientId: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigation]);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = await GoogleSignin.getTokens().then(tokens => tokens.idToken);
      if (!idToken) throw new Error('No ID token present');
      
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
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
        <TouchableOpacity 
          style={styles.googleButton}
          onPress={signInWithGoogle}
        >
          <Text style={styles.buttonText}>התחבר עם Google</Text>
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
  googleButton: {
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
