import { useState, useEffect, useCallback } from 'react';

import { DEFAULT_THEME_COLORS, THEME_STORAGE_KEY } from './constants';

const applyThemeToDOM = (colors: Record<string, string>) => {
  const root = document.documentElement;
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
};

const loadSavedTheme = (): Record<string, string> | null => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Record<string, string>>(() => {
    return loadSavedTheme() ?? { ...DEFAULT_THEME_COLORS };
  });

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const updateColor = useCallback((key: string, value: string) => {
    setTheme((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetTheme = useCallback(() => {
    const defaults = { ...DEFAULT_THEME_COLORS };
    setTheme(defaults);
    localStorage.removeItem(THEME_STORAGE_KEY);

    // Clear inline styles so :root CSS kicks back in
    const root = document.documentElement;
    Object.keys(defaults).forEach((key) => {
      root.style.removeProperty(key);
    });
  }, []);

  const hasCustomTheme = Object.keys(DEFAULT_THEME_COLORS).some(
    (key) => theme[key] !== DEFAULT_THEME_COLORS[key],
  );

  return { theme, updateColor, resetTheme, hasCustomTheme };
};
