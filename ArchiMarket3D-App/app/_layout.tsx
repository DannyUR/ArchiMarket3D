// app/_layout.tsx
import { Stack, useSegments, router } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { SettingsProvider } from '../context/SettingsContext';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { GamificationProvider } from '../context/GamificationContext';

// Solo importar deep links en móvil
let setupDeepLinks = () => {};
if (Platform.OS !== 'web') {
  const deepLinking = require('./utils/deepLinking');
  setupDeepLinks = deepLinking.setupDeepLinks;
}

// Componente que maneja la protección de rutas
function RootLayoutNav() {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const isRedirecting = useRef(false);
    const lastRedirectRef = useRef<string>('');

    // Configurar deep links solo en móvil
    useEffect(() => {
        if (Platform.OS !== 'web') {
            const cleanup = setupDeepLinks();
            return cleanup;
        }
    }, []);

    useEffect(() => {
        if (isLoading) return;
        if (isRedirecting.current) return;

        const inAuthGroup = segments[0] === 'auth';
        const inTabsGroup = segments[0] === '(tabs)';
        
        const publicRoutes = ['reset-password', 'forgot-password', 'email-verified'];
        const isPublicRoute = publicRoutes.includes(segments[0]);

        const currentPath = segments.join('/');

        console.log('🔐 Auth state:', {
            isAuthenticated,
            segments,
            inAuthGroup,
            inTabsGroup,
            isPublicRoute,
            currentPath,
            platform: Platform.OS
        });

        if (lastRedirectRef.current === currentPath) {
            console.log('⚠️ Posible bucle de redirección detectado, evitando...');
            return;
        }

        if (isPublicRoute) {
            console.log('📍 Ruta pública, acceso permitido');
            return;
        }

        if (!isAuthenticated && !inAuthGroup) {
            console.log('🚫 Usuario no autenticado, redirigiendo a login');
            isRedirecting.current = true;
            lastRedirectRef.current = 'login';
            router.replace('/auth/login');
            setTimeout(() => {
                isRedirecting.current = false;
            }, 500);
            return;
        }

        if (isAuthenticated && inAuthGroup) {
            console.log('✅ Usuario autenticado en auth, redirigiendo a tabs');
            isRedirecting.current = true;
            lastRedirectRef.current = 'tabs';
            router.replace('/(tabs)');
            setTimeout(() => {
                isRedirecting.current = false;
            }, 500);
            return;
        }

    }, [isAuthenticated, isLoading, segments]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="auth" />
            <Stack.Screen 
                name="reset-password" 
                options={{
                    headerShown: true,
                    title: 'Restablecer Contraseña',
                    headerStyle: { backgroundColor: '#1e40af' },
                    headerTintColor: '#fff',
                    headerBackTitle: 'Volver',
                }}
            />
            <Stack.Screen 
                name="forgot-password" 
                options={{
                    headerShown: true,
                    title: 'Olvidé mi contraseña',
                    headerStyle: { backgroundColor: '#1e40af' },
                    headerTintColor: '#fff',
                    headerBackTitle: 'Volver',
                }}
            />
            <Stack.Screen 
                name="email-verified" 
                options={{
                    headerShown: true,
                    title: 'Verificar Email',
                    headerStyle: { backgroundColor: '#1e40af' },
                    headerTintColor: '#fff',
                    headerBackTitle: 'Volver',
                }}
            />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="checkout" />
            <Stack.Screen
                name="models/[id]"
                options={{
                    title: 'Detalle del modelo',
                    headerBackTitle: 'Volver',
                    headerShown: false,
                    headerStyle: { backgroundColor: '#1e40af' },
                    headerTintColor: '#fff',
                }}
            />
            <Stack.Screen
                name="terms"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="privacy"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
            <Stack.Screen
                name="purchases/success"
                options={{
                    headerShown: false,
                    presentation: 'modal',
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <SettingsProvider>
                <CartProvider>
                    <GamificationProvider>
                        <RootLayoutNav />
                    </GamificationProvider>
                </CartProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}