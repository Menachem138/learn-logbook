import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing } from '../../styles/global';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  style,
  ...props
}: InputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[
          styles.label,
          error && styles.errorLabel
        ]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          error && styles.errorInput,
          style
        ]}
        placeholderTextColor={colors.secondary}
        {...props}
      />
      {(error || helperText) && (
        <Text style={[
          styles.helperText,
          error && styles.errorText
        ]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    fontSize: 16,
    color: colors.primary,
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  helperText: {
    fontSize: 12,
    color: colors.secondary,
    marginTop: spacing.xs,
  },
  errorText: {
    color: '#ef4444',
  },
  errorLabel: {
    color: '#ef4444',
  },
});
