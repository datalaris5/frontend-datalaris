import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Moon size={20} className="text-blue-400" />
      ) : theme === 'light' ? (
        <Sun size={20} className="text-yellow-500" />
      ) : (
        <Monitor size={20} className="text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
