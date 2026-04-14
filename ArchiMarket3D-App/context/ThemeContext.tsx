// context/ThemeContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useSettings } from './SettingsContext';

export interface ThemeContextType {
    isDark: boolean;
    colors: {
        background: string;
        text: string;
        border: string;
        card: string;
        primary: string;
    };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { isDarkMode } = useSettings();

    const theme = useMemo<ThemeContextType>(() => {
        if (isDarkMode) {
            return {
                isDark: true,
                colors: {
                    background: '#0f172a',
                    text: '#f1f5f9',
                    border: '#334155',
                    card: '#1e293b',
                    primary: '#3b82f6',
                },
            };
        }
        return {
            isDark: false,
            colors: {
                background: '#f8fafc',
                text: '#1e293b',
                border: '#e2e8f0',
                card: '#ffffff',
                primary: '#2563eb',
            },
        };
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}
