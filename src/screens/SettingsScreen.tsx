import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../components/theme/ThemeProvider';
import { useAuth } from '../components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const { isBiometricAvailable, isBiometricEnabled, toggleBiometric } = useAuth();
  const styles = getStyles(theme);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>הגדרות</Text>

        <View style={styles.section}>
          <View style={styles.settingRow}>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#4285f4' }}
            />
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>מצב כהה</Text>
              <Ionicons 
                name={theme === 'dark' ? 'moon' : 'sunny'} 
                size={24} 
                color={theme === 'dark' ? '#fff' : '#000'} 
              />
            </View>
          </View>

          {isBiometricAvailable && (
            <View style={styles.settingRow}>
              <Switch
                value={isBiometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: '#767577', true: '#4285f4' }}
              />
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>אימות ביומטרי</Text>
                <Ionicons 
                  name="finger-print" 
                  size={24} 
                  color={theme === 'dark' ? '#fff' : '#000'} 
                />
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>התנתק</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme: 'light' | 'dark') => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 24,
    color: theme === 'dark' ? '#fff' : '#000',
  },
  section: {
    backgroundColor: theme === 'dark' ? '#2d2d2d' : '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: theme === 'dark' ? '#fff' : '#000',
  },
  signOutButton: {
    backgroundColor: '#ff6b6b',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
