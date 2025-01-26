import React from 'react';
import { SafeAreaView, View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../../theme';

interface SafeAreaContainerProps extends ViewProps {
  children: React.ReactNode;
  withPadding?: boolean;
}

export function SafeAreaContainer({ children, withPadding = true, style, ...props }: SafeAreaContainerProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={[styles.container, withPadding && styles.withPadding]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  withPadding: {
    padding: theme.spacing.md,
  },
});
