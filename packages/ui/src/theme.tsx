import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors, spacing, radius, motion, typography, type Theme, type ColorScheme } from './tokens';

interface ThemeContextType {
  theme: Theme;
  colors: typeof colors.washi | typeof colors.sumi;
  spacing: typeof spacing;
  radius: typeof radius;
  motion: typeof motion;
  typography: typeof typography;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>('washi');

  useEffect(() => {
    // Detect system theme on mount
    if (systemColorScheme === 'dark') {
      setTheme('sumi');
    } else {
      setTheme('washi');
    }
  }, [systemColorScheme]);

  const colorScheme = theme === 'washi' ? colors.washi : colors.sumi;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        colors: colorScheme,
        spacing,
        radius,
        motion,
        typography,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
