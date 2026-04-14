// context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';

export interface SettingsContextType {
    settings: Settings;
    updateSetting: (key: keyof Settings, value: any) => Promise<void>;
    isDarkMode: boolean;
    language: string;
    currentLanguageLabel: string;
}

export interface Settings {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
    twoFactorAuth: boolean;
    autoDownload: boolean;
    saveToGallery: boolean;
    downloadQuality: 'high' | 'medium' | 'low';
}

const defaultSettings: Settings = {
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: 'es',
    twoFactorAuth: false,
    autoDownload: false,
    saveToGallery: true,
    downloadQuality: 'high',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    // Cargar settings al iniciar
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem('@user_settings');
            if (savedSettings) {
                const parsed = JSON.parse(savedSettings);
                setSettings({ ...defaultSettings, ...parsed });
                console.log('✅ Settings cargados:', parsed);
            }
        } catch (error) {
            console.error('❌ Error loading settings:', error);
            setSettings(defaultSettings);
        } finally {
            setIsLoading(false);
        }
    };

    const updateSetting = async (key: keyof Settings, value: any) => {
        try {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            await AsyncStorage.setItem('@user_settings', JSON.stringify(newSettings));
            console.log(`✅ Setting actualizado: ${key} = ${value}`);
        } catch (error) {
            console.error(`❌ Error actualizing setting ${key}:`, error);
        }
    };

    const isDarkMode = settings.darkMode;
    const language = settings.language;
    const currentLanguageLabel = settings.language === 'es' ? 'Español' : 'English';

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSetting,
                isDarkMode,
                language,
                currentLanguageLabel,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}
