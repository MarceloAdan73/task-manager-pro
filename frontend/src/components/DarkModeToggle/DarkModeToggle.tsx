'use client';

import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export function DarkModeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <>
          <FiSun className="text-yellow-400 text-lg" />
          <span className="font-medium">Light</span>
        </>
      ) : (
        <>
          <FiMoon className="text-gray-700 text-lg" />
          <span className="font-medium">Dark</span>
        </>
      )}
    </button>
  );
}
