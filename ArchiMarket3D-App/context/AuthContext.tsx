// context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    user_type?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: any) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        console.log('🔍 checkAuth ejecutándose...');
        try {
            const storedToken = await AsyncStorage.getItem('auth_token');
            console.log('📦 Token en AsyncStorage:', storedToken ? 'Sí' : 'No');

            if (storedToken) {
                setToken(storedToken);
                console.log('📡 Llamando a /auth/me...');
                const response = await apiClient.get('/auth/me');
                console.log('✅ Respuesta de /auth/me:', response.data);

                // Tu backend probablemente también devuelve { success, data: { user } }
                let userData = response.data;
                if (userData.data) {
                    userData = userData.data;
                }

                setUser(userData);
                console.log('👤 Usuario cargado:', userData?.name);
            } else {
                console.log('⚠️ No hay token guardado');
            }
        } catch (error: any) {
            console.error('❌ Error en checkAuth:', error.response?.data || error.message);
            await AsyncStorage.removeItem('auth_token');
        } finally {
            setLoading(false);
            console.log('🏁 checkAuth finalizado');
        }
    };

    // context/AuthContext.tsx (con logs de depuración)

    const login = async (email: string, password: string) => {
        console.log('🔐 Intentando login con:', email);
        try {
            const response = await apiClient.post('/auth/login', { email, password });
            console.log('✅ Respuesta del servidor:', response.data);

            // 🔴 IMPORTANTE: Tu backend devuelve { success, message, data: { token, user } }
            const responseData = response.data;

            // Extraer token y user según el formato de tu backend
            let token, user;

            if (responseData.data) {
                // Formato: { success, message, data: { token, user } }
                token = responseData.data.token;
                user = responseData.data.user;
            } else {
                // Formato alternativo: { token, user }
                token = responseData.token;
                user = responseData.user;
            }

            console.log('📝 Token extraído:', token ? 'Sí' : 'No');
            console.log('👤 Usuario extraído:', user ? user.name : 'No');

            if (!token || !user) {
                console.error('❌ Formato de respuesta inesperado:', responseData);
                return {
                    success: false,
                    error: 'Formato de respuesta inválido'
                };
            }

            await AsyncStorage.setItem('auth_token', token);
            console.log('💾 Token guardado en AsyncStorage');

            setToken(token);
            setUser(user);
            console.log('✅ Estado actualizado: user =', user?.name);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error en login:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al iniciar sesión'
            };
        }
    };

    const register = async (userData: any) => {
        console.log('📝 Intentando registro...');
        try {
            const response = await apiClient.post('/auth/register', userData);
            console.log('✅ Respuesta registro:', response.data);

            const responseData = response.data;
            let token, user;

            if (responseData.data) {
                token = responseData.data.token;
                user = responseData.data.user;
            } else {
                token = responseData.token;
                user = responseData.user;
            }

            if (!token || !user) {
                return { success: false, error: 'Formato de respuesta inválido' };
            }

            await AsyncStorage.setItem('auth_token', token);
            setToken(token);
            setUser(user);
            console.log('✅ Registro exitoso:', user.name);

            return { success: true };
        } catch (error: any) {
            console.error('❌ Error en registro:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Error al registrarse'
            };
        }
    };

    const logout = async () => {
        try {
            // ✅ RUTA CORRECTA: /api/auth/logout
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            await AsyncStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAuthenticated: !!user,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};