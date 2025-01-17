import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackScreenProps } from '../../types/navigation';

export const AuthScreen: React.FC<RootStackScreenProps<'Auth'>> = ({ navigation }) => {
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    // More strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidFormat = emailRegex.test(email);
    
    // Check for common test/example domains
    const invalidDomains = ['example.com', 'test.com', 'domain.com'];
    const domain = email.split('@')[1];
    const isValidDomain = !invalidDomains.includes(domain);
    
    return isValidFormat && isValidDomain;
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleAuth = async () => {
    console.log('Starting authentication process...');
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      console.log(`Attempting to ${isSignUp ? 'sign up' : 'sign in'} with email: ${email}`);
      
      if (isSignUp) {
        // Proceed with sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: 'io.supabase.learnlogbook://login-callback',
            data: {
              email,
            }
          }
        });
        
        console.log('Sign up response:', { data, error });
        
        if (error) {
          console.error('Sign up error:', error);
          if (error.message.includes('User already registered')) {
            Alert.alert('Error', 'This email is already registered. Please sign in instead.');
            setIsSignUp(false);
          } else {
            throw error;
          }
          return;
        }
        
        if (!data.user) {
          throw new Error('No user data returned');
        }
        
        console.log('Sign up successful');
        Alert.alert(
          'Success',
          'Please check your email for the confirmation link. You will be able to sign in after confirming your email.',
          [
            {
              text: 'OK',
              onPress: () => {
                setEmail('');
                setPassword('');
                setIsSignUp(false);
              }
            }
          ]
        );
      } else {
        console.log('Attempting sign in');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        console.log('Sign in response:', { data, error });
        
        if (error) {
          console.error('Sign in error:', error);
          if (error.message.includes('Email not confirmed')) {
            Alert.alert(
              'Error',
              'Please confirm your email address before signing in. Check your email for the confirmation link.'
            );
          } else if (error.message.includes('Invalid login credentials')) {
            Alert.alert('Error', 'Invalid email or password');
          } else {
            throw error;
          }
          return;
        }

        if (data.session) {
          console.log('Sign in successful');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.switchButtonText}>
            {isSignUp
              ? 'Already have an account? Sign In'
              : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0284c7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchButton: {
    alignItems: 'center',
  },
  switchButtonText: {
    color: '#0284c7',
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
  },
});

export default AuthScreen;
