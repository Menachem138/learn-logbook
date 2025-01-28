import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  useEffect(() => {
    console.log('[HomeScreen] Component mounted');
    return () => console.log('[HomeScreen] Component unmounted');
  }, []);

  try {
    console.log('[HomeScreen] Rendering component');
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>ברוך הבא</Text>
          </View>
          
          {/* Here we'll add the components one by one */}
          <Text style={styles.placeholder}>בקרוב - הטיימר שלך</Text>
          <Text style={styles.placeholder}>בקרוב - לוח השנה שלך</Text>
          <Text style={styles.placeholder}>בקרוב - הספרייה שלך</Text>
        </ScrollView>
      </SafeAreaView>
    );
  } catch (error) {
    console.error('[HomeScreen] Render error:', error);
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error loading screen</Text>
        <Text style={{ color: 'red' }}>{error.message}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'right',
    marginVertical: 8,
  },
});
