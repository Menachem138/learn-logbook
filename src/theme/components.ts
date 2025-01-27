import { ComponentStyleConfig } from '@chakra-ui/react';

export const components: Record<string, ComponentStyleConfig> = {
  Button: {
    baseStyle: {
      fontWeight: 600,
      fontSize: '18px',
      borderRadius: 'md',
      _focus: {
        boxShadow: 'none',
      },
    },
    variants: {
      primary: {
        bg: '#4285F4',
        color: 'white',
        _hover: {
          bg: '#1976D2',
        },
      },
      secondary: {
        bg: '#f5f5f5',
        color: '#333333',
        _hover: {
          bg: '#e0e0e0',
        },
      },
      outline: {
        border: '2px solid',
        borderColor: '#4285F4',
        color: '#4285F4',
        _hover: {
          bg: 'rgba(66, 133, 244, 0.1)',
        },
      },
    },
    defaultProps: {
      variant: 'primary',
    },
  },
  Input: {
    baseStyle: {
      field: {
        bg: '#f5f5f5',
        borderRadius: 'md',
        _placeholder: {
          color: '#666666',
        },
      },
    },
    variants: {
      filled: {
        field: {
          bg: '#f5f5f5',
          border: '1px solid',
          borderColor: 'transparent',
          _hover: {
            bg: '#e8e8e8',
          },
          _focus: {
            bg: '#ffffff',
            borderColor: '#4285F4',
          },
        },
      },
    },
    defaultProps: {
      variant: 'filled',
    },
  },
  Text: {
    variants: {
      body: {
        fontSize: '16px',
        lineHeight: 1.5,
        color: '#333333',
      },
      secondary: {
        fontSize: '16px',
        lineHeight: 1.5,
        color: '#666666',
      },
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: 'bold',
      color: '#333333',
    },
    sizes: {
      xl: {
        fontSize: '32px',
        lineHeight: 1.2,
      },
      lg: {
        fontSize: '24px',
        lineHeight: 1.3,
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        bg: 'white',
        borderRadius: 'lg',
        boxShadow: 'sm',
        p: 4,
      },
    },
  },
  Progress: {
    baseStyle: {
      track: {
        bg: '#f5f5f5',
      },
      filledTrack: {
        bg: '#4285F4',
      },
    },
  },
};
