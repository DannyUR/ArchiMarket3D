// app/_layout.tsx
import { Stack, useSegments, router } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { SettingsProvider } from '../context/SettingsContext';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Componente que maneja la protección de rutas
function RootLayoutNav() {
    const { isAuthenticated, isLoading } = useAuth();
    const segments = useSegments();
    const isRedirecting = useRef(false);
    const lastRedirectRef = useRef<string>('');

    useEffect(() => {
        if (isLoading) return;
        if (isRedirecting.current) return;

        const inAuthGroup = segments[0] === 'auth';
        const inTabsGroup = segments[0] === '(tabs)';

        // ✅ Ya no hay index, la raíz es auth/login

        const currentPath = segments.join('/');

        console.log('🔐 Auth state:', {
            isAuthenticated,
            segments,
            inAuthGroup,
            inTabsGroup,
            currentPath
        });

        // Evitar redirecciones en bucle
        if (lastRedirectRef.current === currentPath) {
            console.log('⚠️ Posible bucle de redirección detectado, evitando...');
            return;
        }

        // ✅ Si NO está autenticado y NO está en auth, redirigir a login
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

        // ✅ Si está autenticado y está en auth, redirigir a tabs
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
            {/* ✅ ELIMINADO: <Stack.Screen name="index" /> */}

            {/* Pantallas de autenticación */}
            <Stack.Screen name="auth" />

            {/* Pantallas principales (protegidas) */}
            <Stack.Screen name="(tabs)" />

            {/* Otras pantallas */}
            <Stack.Screen name="checkout" />
            <Stack.Screen
                name="models/[id]"
                options={{
                    title: 'Detalle del modelo',
                    headerBackTitle: 'Volver',
                    headerShown: true,
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
                    <RootLayoutNav />
                </CartProvider>
            </SettingsProvider>
        </AuthProvider>
    );
}