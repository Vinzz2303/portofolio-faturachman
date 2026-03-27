import { useEffect, useState } from 'react';

const useDarkMode = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedMode = localStorage.getItem('darkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    useEffect(() => {
        const body = document.body;
        if (isDarkMode) {
            body.classList.add('dark');
            localStorage.setItem('darkMode', true);
        } else {
            body.classList.remove('dark');
            localStorage.setItem('darkMode', false);
        }
    }, [isDarkMode]);

    return [isDarkMode, toggleDarkMode];
};

export default useDarkMode;