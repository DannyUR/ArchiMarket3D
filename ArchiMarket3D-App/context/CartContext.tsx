// context/CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import api from '../api/client';
import { useAuth } from './AuthContext';

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

    useEffect(() => {
        loadCart();
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

            const response = await api.post('/shopping/create-paypal-order', { items });

            if (response.data.success && response.data.approval_url) {
                const canOpen = await Linking.canOpenURL(response.data.approval_url);
                
                if (canOpen) {
                    await Linking.openURL(response.data.approval_url);
                } else {
                    Alert.alert('Error', 'No se pudo abrir PayPal');
                }
            } else {
                throw new Error(response.data.message || 'Error al crear la orden');
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            const message = error.response?.data?.message || error.message || 'Error al procesar el pago';
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