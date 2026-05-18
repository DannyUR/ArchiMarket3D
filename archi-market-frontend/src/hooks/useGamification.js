// hooks/useGamification.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useGamification() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        } catch (err) {
            console.error('Error fetching gamification:', err);
            setError(err.response?.data?.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGamification();
    }, [fetchGamification]);

    return { data, loading, error, refresh: fetchGamification };
}