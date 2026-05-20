// context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';
import api from '../api/client';
import { useAuth } from './AuthContext';

// 🔥 CONFIGURACIÓN - CAMBIA ESTA IP POR LA TUYA
// Ejecuta 'ipconfig' en Windows y busca "IPv4"
const LOCAL_IP = '192.168.1.20'; // ← CAMBIA A TU IP REAL
const BACKEND_PORT = '8000';
const APP_SCHEME = 'archimarket3d';
const EXPO_WEB_PORT = '8083'; // Puerto de la app Expo en web

export interface Model {
    id: number;
    name: string;
    price: number;
    description?: string;
    image?: string;
    sketchfab_id?: string;
}

export interface CartItem {
    model: Model;
    license: 'personal' | 'business' | 'unlimited';
    quantity: number;
    price: number;
}

interface CartContextType {
    cartItems: CartItem[];
    loading: boolean;
    error: string | null;
    cartLoaded: boolean;
    addToCart: (model: Model, license: string, quantity?: number) => void;
    removeFromCart: (modelId: number, license: string, modelName: string) => void;
    updateQuantity: (modelId: number, license: string, quantity: number, modelName: string) => void;
    clearCart: () => Promise<void>;
    getCartTotal: () => number;
    getCartCount: () => number;
    checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = '@archimarket_cart';

// ✅ Hook personalizado
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cartLoaded, setCartLoaded] = useState(false);
    const { isAuthenticated } = useAuth();

    // Detectar plataforma
    const isMobileApp = Platform.OS !== 'web'; // iOS o Android real
    const isExpoWeb = Platform.OS === 'web'; // Expo en navegador (puerto 8083)
    
    // URLs según plataforma
    const BACKEND_URL = `http://${LOCAL_IP}:${BACKEND_PORT}`;
    const EXPO_WEB_URL = `http://${LOCAL_IP}:${EXPO_WEB_PORT}`;

    useEffect(() => {
        loadCart();
        console.log('📱 ========== CART PROVIDER INICIALIZADO ==========');
        console.log('📱 Plataforma:', Platform.OS);
        console.log('📱 isMobileApp:', isMobileApp);
        console.log('📱 isExpoWeb:', isExpoWeb);
        console.log('🌐 Backend URL:', BACKEND_URL);
        console.log('🌐 Expo Web URL:', EXPO_WEB_URL);
        console.log('==================================================');
    }, []);

    useEffect(() => {
        if (cartLoaded) {
            saveCart();
        }
    }, [cartItems]);

    const loadCart = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setCartItems(parsed);
                console.log('📦 Carrito cargado:', parsed.length, 'items');
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setCartLoaded(true);
        }
    };

    const saveCart = async () => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    };

    const calculateLicensePrice = (basePrice: number, license: string): number => {
        const multipliers: Record<string, number> = {
            personal: 1.0,
            business: 2.5,
            unlimited: 5.0
        };
        return basePrice * (multipliers[license] || 1.0);
    };

    const addToCart = (model: Model, license: string, quantity: number = 1) => {
        const existingIndex = cartItems.findIndex(item => item.model.id === model.id);
        const existing = existingIndex >= 0 ? cartItems[existingIndex] : null;

        if (existing && existing.license === license) {
            setCartItems(prev =>
                prev.map(item =>
                    item.model.id === model.id && item.license === license
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
            Alert.alert('✅', `📦 ${model.name} - Cantidad actualizada`);
        } else if (existing && existing.license !== license) {
            setCartItems(prev =>
                prev.map((item, idx) =>
                    idx === existingIndex
                        ? { ...item, license: license as any, price: calculateLicensePrice(model.price, license) }
                        : item
                )
            );
            Alert.alert('🔄', `${model.name} - Licencia cambiada a ${license}`);
        } else {
            setCartItems(prev => [...prev, {
                model,
                license: license as any,
                quantity,
                price: calculateLicensePrice(model.price, license)
            }]);
            Alert.alert('✅', `${model.name} agregado al carrito`);
        }
    };

    const removeFromCart = (modelId: number, license: string, modelName: string) => {
        setCartItems(prev =>
            prev.filter(item => !(item.model.id === modelId && item.license === license))
        );
        Alert.alert('🗑️', `${modelName} eliminado del carrito`);
    };

    const updateQuantity = (modelId: number, license: string, quantity: number, modelName: string) => {
        if (quantity <= 0) {
            removeFromCart(modelId, license, modelName);
            return;
        }

        setCartItems(prev =>
            prev.map(item =>
                item.model.id === modelId && item.license === license
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = async () => {
        setCartItems([]);
        await AsyncStorage.removeItem(STORAGE_KEY);
    };

    const getCartTotal = (): number => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = (): number => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const checkout = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🛒 ========== INICIANDO CHECKOUT ==========');
            console.log('📦 Items en carrito:', cartItems.length);
            console.log('📱 Plataforma:', Platform.OS);
            console.log('📱 isMobileApp:', isMobileApp);
            console.log('📱 isExpoWeb:', isExpoWeb);

            if (!isAuthenticated) {
                Alert.alert(
                    'Iniciar sesión requerido',
                    'Debes iniciar sesión para continuar',
                    [
                        { text: 'Cancelar', style: 'cancel' },
                        { text: 'Iniciar sesión', onPress: () => router.push('/auth/login') }
                    ]
                );
                return;
            }

            if (cartItems.length === 0) {
                Alert.alert('Carrito vacío', 'Agrega productos antes de continuar');
                return;
            }

            const items = cartItems.map(item => ({
                model_id: item.model.id,
                license_type: item.license
            }));

            // 🔥 DETERMINAR return_url SEGÚN LA PLATAFORMA
            let returnUrl;
            let cancelUrl = `${APP_SCHEME}://checkout`;

            if (isMobileApp) {
                // App móvil REAL - PayPal redirige a deep link directamente
                returnUrl = `${APP_SCHEME}://purchases/success`;
                console.log('📱 Usando deep link para app móvil:', returnUrl);
            } else {
                // Web (Expo) - PayPal redirige al backend, luego backend redirige a web
                returnUrl = `${BACKEND_URL}/api/shopping/execute-paypal-payment`;
                cancelUrl = `${EXPO_WEB_URL}/checkout`;
                console.log('🌐 Usando callback para web:', returnUrl);
            }

            console.log('📤 Enviando a PayPal:', { items });
            console.log('🔗 Return URL:', returnUrl);
            console.log('❌ Cancel URL:', cancelUrl);

            // Crear orden en PayPal
            const response = await api.post('/shopping/create-paypal-order', { 
                items,
                return_url: returnUrl,
                cancel_url: cancelUrl
            });

            console.log('📥 Respuesta PayPal:', response.data);

            if (response.data.success && response.data.approval_url) {
                console.log('🔗 Abriendo PayPal:', response.data.approval_url);
                
                const canOpen = await Linking.canOpenURL(response.data.approval_url);
                
                if (canOpen) {
                    await Linking.openURL(response.data.approval_url);
                } else {
                    Alert.alert('Error', 'No se pudo abrir PayPal. Asegúrate de tener la app de PayPal instalada o usa el navegador.');
                }
            } else {
                throw new Error(response.data.message || 'Error al crear la orden');
            }
        } catch (error: any) {
            console.error('❌ Checkout error:', error);
            
            let message = 'Error al procesar el pago';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.data?.error) {
                message = error.response.data.error;
            } else if (error.message) {
                message = error.message;
            }
            
            setError(message);
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        cartItems,
        loading,
        error,
        cartLoaded,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        checkout
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}