import { theme } from './index';

export const components = {
  container: {
    base: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing[4],
    },
    rtl: {
      direction: 'rtl',
    },
  },
  text: {
    base: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.fontSizes.base,
      textAlign: 'right' as const,
    },
    heading: {
      fontSize: theme.typography.fontSizes['3xl'],
      fontWeight: theme.typography.fontWeights.bold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[4],
      textAlign: 'right' as const,
    },
    subheading: {
      fontSize: theme.typography.fontSizes['2xl'],
      fontWeight: theme.typography.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing[3],
      textAlign: 'right' as const,
    },
    body: {
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.lineHeights.normal,
      textAlign: 'right' as const,
    },
    secondary: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
      textAlign: 'right' as const,
    },
  },
  button: {
    base: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing[4],
      paddingVertical: theme.spacing[2],
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    text: {
      color: 'white',
      fontSize: theme.typography.fontSizes.lg,
      fontWeight: theme.typography.fontWeights.semibold,
      textAlign: 'center' as const,
    },
    disabled: {
      opacity: 0.5,
    },
  },
  input: {
    base: {
      backgroundColor: '#f5f5f5',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing[3],
      fontSize: theme.typography.fontSizes.base,
      color: theme.colors.text.primary,
      textAlign: 'right' as const,
    },
    label: {
      fontSize: theme.typography.fontSizes.sm,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing[1],
      textAlign: 'right' as const,
    },
  },
  card: {
    base: {
      backgroundColor: 'white',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing[4],
      marginBottom: theme.spacing[3],
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: theme.shadows.md,
        },
      }),
    },
  },
  list: {
    container: {
      flex: 1,
    },
    item: {
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.gray[200],
    },
  },
  progressBar: {
    container: {
      height: 8,
      backgroundColor: theme.colors.gray[200],
      borderRadius: theme.borderRadius.full,
      overflow: 'hidden',
    },
    fill: {
      height: '100%',
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.full,
    },
  },
};

export type Components = typeof components;
export default components;
