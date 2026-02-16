/**
 * useTheme Hook
 * Centralized theme management for the application
 * Replaces duplicate theme logic in Header.js and AdminHeader.js
 * Handles localStorage persistence and system preference detection
 */

import { useState, useEffect } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check for saved theme preference (new key)
    const savedTheme = localStorage.getItem('theme');

    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Determine which theme to use, with fallback to legacy `darkMode` key
    let shouldBeDark;

    if (savedTheme === 'dark' || savedTheme === 'light') {
      // Use the explicitly saved theme
      shouldBeDark = savedTheme === 'dark';
    } else {
      // Fallback to legacy boolean `darkMode` key, if present
      const legacyDarkMode = localStorage.getItem('darkMode');

      if (legacyDarkMode !== null) {
        // Legacy value stored as a string, e.g. "true" or "false"
        shouldBeDark = legacyDarkMode === 'true';
        const migratedTheme = shouldBeDark ? 'dark' : 'light';
        // Migrate to new `theme` key so future reads use the new system
        localStorage.setItem('theme', migratedTheme);
        localStorage.removeItem('darkMode');
      } else {
        // No saved preference; fall back to system preference
        shouldBeDark = prefersDark;
      }
    }
    // Apply the theme
    setIsDark(shouldBeDark);
    applyTheme(shouldBeDark);
    setIsLoaded(true);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Only update if no saved preference
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        applyTheme(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  /**
   * Apply theme to the document
   * @param {boolean} dark - Whether to apply dark mode
   */
  const applyTheme = (dark) => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;

    if (dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  /**
   * Toggle between light and dark theme
   */
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    applyTheme(newTheme);
  };

  /**
   * Set theme explicitly
   * @param {('light'|'dark')} theme - The theme to set
   */
  const setTheme = (theme) => {
    const dark = theme === 'dark';
    setIsDark(dark);
    localStorage.setItem('theme', theme);
    applyTheme(dark);
  };

  /**
   * Reset theme to system preference
   */
  const resetTheme = () => {
    localStorage.removeItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    applyTheme(prefersDark);
  };

  return {
    isDark,
    isLoaded,
    toggleTheme,
    setTheme,
    resetTheme,
    theme: isDark ? 'dark' : 'light',
  };
}
