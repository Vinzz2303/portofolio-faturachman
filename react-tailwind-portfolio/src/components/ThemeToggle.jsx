import React from 'react';
import { useDarkMode } from '../hooks/useDarkMode';

const ThemeToggle = () => {
    const [isDarkMode, toggleDarkMode] = useDarkMode();

    return (
        <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-md focus:outline-none ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'
            }`}
        >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
};

export default ThemeToggle;