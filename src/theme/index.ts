import { extendTheme } from '@chakra-ui/react';

export const theme = extendTheme({
  direction: 'rtl',
  colors: {
    primary: {
      main: '#4285F4',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    h1: {
      fontSize: '32px',
      fontWeight: 'bold',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '24px',
      fontWeight: 'bold',
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '16px',
      lineHeight: 1.5,
    },
    button: {
      fontSize: '18px',
      fontWeight: 600,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 2px 4px rgba(0,0,0,0.12)',
    lg: '0 4px 8px rgba(0,0,0,0.12)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 600,
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'primary.main',
          color: 'white',
          _hover: {
            bg: 'primary.dark',
          },
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          bg: 'background.paper',
          borderRadius: 'md',
        },
      },
    },
  },
});

export type AppTheme = typeof theme;
