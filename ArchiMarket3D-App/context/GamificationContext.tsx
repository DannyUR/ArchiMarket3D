
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

interface Achievement {
    id: number;
    name: string;
    description: string;
    icon: string;
    unlocked_at: string | null;
}

interface GamificationData {
    xp: number;
    level: number;
    level_icon: string;
    level_title: string;
    xp_current_level: number;
    xp_next_level: number;
    progress: number;
    discount: number;
    total_purchases: number;
    total_reviews: number;
    achievements: Achievement[];
}

interface GamificationContextType {
    data: GamificationData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<GamificationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGamification = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get('/user/gamification');
            
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError('Error al cargar datos de gamificación');
            }
        } catch (err: any) {
            console.error('Error fetching gamification:', err);
            setError(err.response?.data?.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGamification();
    }, [fetchGamification]);

    return (
        <GamificationContext.Provider
            value={{
                data,
                loading,
                error,
                refresh: fetchGamification,
            }}
        >
            {children}
        </GamificationContext.Provider>
    );
}