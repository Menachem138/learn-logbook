import { StyleSheet } from 'react-native';

export const colors = {
  primary: '#000000',
  primaryForeground: '#FFFFFF',
  secondary: '#6b7280',
  secondaryForeground: '#FFFFFF',
  background: '#FFFFFF',
  backgroundSecondary: '#f3f4f6',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

import { TextStyle } from 'react-native';

type TypographyStyles = {
  h1: Pick<TextStyle, 'fontSize' | 'fontWeight'>;
  h2: Pick<TextStyle, 'fontSize' | 'fontWeight'>;
  h3: Pick<TextStyle, 'fontSize' | 'fontWeight'>;
  h4: Pick<TextStyle, 'fontSize' | 'fontWeight'>;
  body: Pick<TextStyle, 'fontSize'>;
  small: Pick<TextStyle, 'fontSize'>;
  tiny: Pick<TextStyle, 'fontSize'>;
};

export const typography: TypographyStyles = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
  },
  small: {
    fontSize: 14,
  },
  tiny: {
    fontSize: 12,
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  buttonText: {
    color: colors.primaryForeground,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.input,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flexCol: {
    flexDirection: 'column',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default {
  colors,
  spacing,
  typography,
  styles,
};
