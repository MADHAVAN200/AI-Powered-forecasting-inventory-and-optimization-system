import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_STORAGE_KEY = 'warehouse-theme';

/**
 * A reusable ThemeToggle component that handles theme persistence
 * and class manipulation on document.documentElement.
 * 
 * @param {string} className - Optional className for custom positioning
 */
const ThemeToggle = ({ className = "" }) => {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'dark';
        return window.localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;
        const isDark = theme === 'dark';
        root.classList.toggle('dark', isDark);
        root.setAttribute('data-theme', theme);
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const isDark = theme === 'dark';

    // Default classes if no className is provided
    const defaultClasses = "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

    return (
        <button
            type="button"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={className || defaultClasses}
        >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
};

export default ThemeToggle;
