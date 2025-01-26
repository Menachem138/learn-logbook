import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { theme } from './index';

export function useRTL() {
  const [isRTL, setIsRTL] = useState(true); // Default to RTL for Hebrew

  useEffect(() => {
    // For web, we can detect the document's dir attribute
    if (Platform.OS === 'web') {
      const htmlDir = document.documentElement.dir;
      setIsRTL(htmlDir === 'rtl');
    }
    // For mobile, we keep the default RTL setting
  }, []);

  return {
    isRTL,
    textAlign: isRTL ? 'right' : 'left',
    direction: isRTL ? 'rtl' : 'ltr',
    flexDirection: isRTL ? 'row-reverse' : 'row',
  };
}

export function useTheme() {
  return {
    ...theme,
    rtl: useRTL(),
  };
}

export function useResponsive() {
  const [windowWidth, setWindowWidth] = useState(
    Platform.OS === 'web' ? window.innerWidth : 0
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    isMobile: windowWidth < theme.breakpoints.md,
    isTablet: windowWidth >= theme.breakpoints.md && windowWidth < theme.breakpoints.lg,
    isDesktop: windowWidth >= theme.breakpoints.lg,
    windowWidth,
  };
}

// Utility hook for consistent spacing across platforms
export function useSpacing() {
  return {
    px: (value: keyof typeof theme.spacing) => ({
      paddingHorizontal: theme.spacing[value],
    }),
    py: (value: keyof typeof theme.spacing) => ({
      paddingVertical: theme.spacing[value],
    }),
    mx: (value: keyof typeof theme.spacing) => ({
      marginHorizontal: theme.spacing[value],
    }),
    my: (value: keyof typeof theme.spacing) => ({
      marginVertical: theme.spacing[value],
    }),
    p: (value: keyof typeof theme.spacing) => ({
      padding: theme.spacing[value],
    }),
    m: (value: keyof typeof theme.spacing) => ({
      margin: theme.spacing[value],
    }),
  };
}
