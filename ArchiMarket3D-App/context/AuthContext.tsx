// context/AuthContext.tsx - VERSIÓN COMPLETA CON updateProfile
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import api from '../api/client';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    user_type?: string;
    phone?: string;
    company?: string;
    bio?: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<User>;
    changePassword: (currentPassword: string, newPassword: string, newPasswordConfirmation: string) => Promise<void>;
    deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!user && !!token;

    // Cargar datos al iniciar
    useEffect(() => {
        loadStoredData();
    }, []);

    const loadStoredData = async () => {
        try {
            console.log('📦 Cargando datos almacenados...');
            const storedToken = await AsyncStorage.getItem('@auth_token');
            const storedUser = await AsyncStorage.getItem('@user_data');

            console.log('Token:', storedToken ? 'Sí' : 'No');
            console.log('User:', storedUser ? 'Sí' : 'No');

            if (storedToken && storedUser) {
                let userData;
                try {
                    userData = JSON.parse(storedUser);
                    console.log('✅ Usuario parseado:', userData);
                } catch (parseError) {
                    console.error('Error parsing user data');
                    await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
                    setIsLoading(false);
                    return;
                }

                setToken(storedToken);
                setUser(userData);
                api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                console.log('✅ Usuario cargado correctamente:', userData.name);
            } else {
                console.log('ℹ️ No hay sesión guardada');
            }
        } catch (error) {
            console.error('Error loading auth data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            console.log('📡 Enviando login request...');

            const response = await api.post('/auth/login', { email, password });

            console.log('📥 Respuesta completa:', JSON.stringify(response.data, null, 2));

            // ✅ Extraer datos correctamente (adaptado a la respuesta del backend)
            let newToken, userData;

            if (response.data.data) {
                // Formato: { success: true, data: { token, user } }
                newToken = response.data.data.token;
                userData = response.data.data.user;
            } else if (response.data.token) {
                // Formato directo
                newToken = response.data.token;
                userData = response.data.user;
            } else {
                throw new Error('Formato de respuesta inválido');
            }

            console.log('✅ Token obtenido:', newToken ? 'Sí' : 'No');
            console.log('✅ Usuario obtenido:', userData);

            // Guardar en storage
            await AsyncStorage.setItem('@auth_token', newToken);
            await AsyncStorage.setItem('@user_data', JSON.stringify(userData));

            // Actualizar estado
            setToken(newToken);
            setUser(userData);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            console.log('✅ Login exitoso, redirigiendo a home...');

            // Redirigir manualmente
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('❌ Login error:', error);
            console.error('Detalles:', error.response?.data);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (name: string, email: string, password: string, role: string = 'architect') => {
        try {
            setIsLoading(true);
            console.log('📡 Enviando registro request...');

            const response = await api.post('/auth/register', {
                name,
                email,
                password,
                password_confirmation: password,
                user_type: role
            });

            console.log('📥 Respuesta registro:', response.data);

            let newToken, userData;

            if (response.data.data) {
                newToken = response.data.data.token;
                userData = response.data.data.user;
            } else if (response.data.token) {
                newToken = response.data.token;
                userData = response.data.user;
            } else {
                throw new Error('Formato de respuesta inválido');
            }

            await AsyncStorage.setItem('@auth_token', newToken);
            await AsyncStorage.setItem('@user_data', JSON.stringify(userData));

            setToken(newToken);
            setUser(userData);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            console.log('✅ Registro exitoso, redirigiendo a home...');
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error('❌ Register error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // context/AuthContext.tsx - Verifica el logout
    const logout = async () => {
        try {
            console.log('🚪 Iniciando logout...');

            try {
                await api.post('/auth/logout');
            } catch (error) {
                console.log('Backend logout no necesario');
            }

            delete api.defaults.headers.common['Authorization'];
            await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
            setToken(null);
            setUser(null);

            console.log('✅ Estado limpiado, redirigiendo a login...');

            // ✅ Redirigir a LOGIN, no a index
            router.replace('/auth/login');

        } catch (error) {
            console.error('Logout error:', error);
            delete api.defaults.headers.common['Authorization'];
            await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
            setToken(null);
            setUser(null);
            router.replace('/auth/login');
        }
    };

    // context/AuthContext.tsx - Modificar la función updateProfile

    const updateProfile = async (data: Partial<User>): Promise<User> => {
        try {
            setIsLoading(true);
            console.log('📡 Enviando actualización de perfil...');
            console.log('📦 Datos a enviar:', data);

            // ✅ Usar POST en lugar de PUT si el backend no tiene PUT configurado
            const response = await api.post('/user/profile', data);

            console.log('📥 Respuesta actualización:', response.data);

            let updatedUser;
            if (response.data.data) {
                updatedUser = response.data.data;
            } else if (response.data.user) {
                updatedUser = response.data.user;
            } else {
                updatedUser = response.data;
            }

            // Actualizar estado local
            setUser(updatedUser);

            // Actualizar storage
            await AsyncStorage.setItem('@user_data', JSON.stringify(updatedUser));

            console.log('✅ Perfil actualizado correctamente');

            // ✅ IMPORTANTE: NO hacer router.replace ni ninguna redirección aquí
            // Solo retornar el usuario actualizado

            return updatedUser;

        } catch (error: any) {
            console.error('❌ Update profile error:', error);
            console.error('Detalles:', error.response?.data);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ CAMBIAR CONTRASEÑA
    const changePassword = async (
        currentPassword: string,
        newPassword: string,
        newPasswordConfirmation: string
    ): Promise<void> => {
        try {
            setIsLoading(true);
            console.log('📡 Enviando cambio de contraseña...');

            await api.post('/auth/change-password', {
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: newPasswordConfirmation
            });

            console.log('✅ Contraseña actualizada correctamente');

        } catch (error: any) {
            console.error('❌ Change password error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ ELIMINAR CUENTA
    const deleteAccount = async (): Promise<void> => {
        try {
            setIsLoading(true);
            console.log('📡 Eliminando cuenta...');

            await api.delete('/user/account');

            // Limpiar todo
            await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common['Authorization'];

            console.log('✅ Cuenta eliminada correctamente');
            router.replace('/auth/register');

        } catch (error: any) {
            console.error('❌ Delete account error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}