import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TwitterFeed } from '@/components/Social/TwitterFeed.native';
import { useTheme } from '@/components/theme/ThemeProvider';

export function SocialScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ScrollView 
      style={[
        styles.container, 
        { backgroundColor: isDark ? '#1a1a1a' : '#fff' }
      ]}
    >
      <View style={styles.content}>
        <TwitterFeed username="learn_logbook" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
