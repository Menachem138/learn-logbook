declare module '@/components/theme/ThemeProvider' {
  export function useTheme(): { theme: 'light' | 'dark'; toggleTheme: () => void };
  export function ThemeProvider({ children }: { children: React.ReactNode }): React.ReactElement;
}
