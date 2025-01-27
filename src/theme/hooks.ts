import { useEffect, useState } from 'react';
import { useColorMode } from '@chakra-ui/react';
import { theme } from './index';

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
  };
}

export function useRTL() {
  const [isRTL, setIsRTL] = useState(true); // Default to RTL for Hebrew

  useEffect(() => {
    // Set RTL direction for the entire app
    document.documentElement.dir = 'rtl';
    document.body.dir = 'rtl';

    return () => {
      document.documentElement.dir = 'ltr';
      document.body.dir = 'ltr';
    };
  }, []);

  return isRTL;
}

export function useThemeColors() {
  const { colorMode } = useColorMode();
  const colors = theme.colors;

  return {
    primary: colors.primary.main,
    background: colors.background.default,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    inputBackground: colors.background.paper,
  };
}

export function useTypography() {
  return theme.typography;
}

export function useSpacing() {
  return theme.spacing;
}

export function useBorderRadius() {
  return theme.borderRadius;
}

export function useShadows() {
  return theme.shadows;
}

// Custom hook for RTL-aware margin and padding
export function useRTLSpacing() {
  const isRTL = useRTL();

  return {
    marginStart: (value: string | number) => ({
      marginRight: isRTL ? value : undefined,
      marginLeft: !isRTL ? value : undefined,
    }),
    marginEnd: (value: string | number) => ({
      marginLeft: isRTL ? value : undefined,
      marginRight: !isRTL ? value : undefined,
    }),
    paddingStart: (value: string | number) => ({
      paddingRight: isRTL ? value : undefined,
      paddingLeft: !isRTL ? value : undefined,
    }),
    paddingEnd: (value: string | number) => ({
      paddingLeft: isRTL ? value : undefined,
      paddingRight: !isRTL ? value : undefined,
    }),
  };
}
