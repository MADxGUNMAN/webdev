'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('dark-mode');
        if (stored === 'enabled') {
            setDarkMode(true);
            document.body.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            const next = !prev;
            if (next) {
                document.body.classList.add('dark');
                localStorage.setItem('dark-mode', 'enabled');
            } else {
                document.body.classList.remove('dark');
                localStorage.setItem('dark-mode', 'disabled');
            }
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
