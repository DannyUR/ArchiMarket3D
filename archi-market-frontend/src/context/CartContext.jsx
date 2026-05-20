import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';
import { useNotification } from './NotificationContext';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cartLoaded, setCartLoaded] = useState(false);
    const { showSuccess, showError, showInfo } = useNotification();

    // Cargar carrito del localStorage al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                setCartItems(parsed);
                console.log('✅ Carrito cargado desde localStorage:', parsed);
            } catch (e) {
                console.error('Error parsing cart from localStorage:', e);
                localStorage.removeItem('cart');
            }
        } else {
            console.log('ℹ️ No hay carrito guardado en localStorage');
        }
        setCartLoaded(true);
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        if (cartLoaded) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
            console.log('💾 Carrito guardado en localStorage');
        }
    }, [cartItems, cartLoaded]);

    const addToCart = (model, license, quantity = 1) => {
        const existingItemIndex = cartItems.findIndex(item => item.model.id === model.id);
        const existingItem = existingItemIndex >= 0 ? cartItems[existingItemIndex] : null;

        if (existingItem && existingItem.license === license) {
            setCartItems(prev =>
                prev.map(item =>
                    item.model.id === model.id && item.license === license
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            );
            showSuccess(`🛒 Se actualizó la cantidad de ${model.name}`);
        } else if (existingItem && existingItem.license !== license) {
            setCartItems(prev =>
                prev.map((item, idx) =>
                    idx === existingItemIndex
                        ? { ...item, license, price: calculateLicensePrice(model.price, license) }
                        : item
                )
            );
            showSuccess(`🛒 Se cambió la licencia de ${model.name} a ${license}`);
        } else {
            setCartItems(prev => [...prev, {
                model,
                license,
                quantity,
                price: calculateLicensePrice(model.price, license)
            }]);
            showSuccess(`🛒 ${model.name} agregado al carrito`);
        }
    };

    const removeFromCart = (modelId, license, modelName) => {
        setCartItems(prev =>
            prev.filter(item => !(item.model.id === modelId && item.license === license))
        );
        showInfo(`🗑️ ${modelName} eliminado del carrito`);
    };

    const updateQuantity = (modelId, license, quantity, modelName) => {
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

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
        console.log('✅ Carrito limpiado completamente');
    };

    const calculateLicensePrice = (basePrice, license) => {
        const multipliers = {
            personal: 1.0,
            business: 2.5,
            unlimited: 5.0
        };
        return basePrice * (multipliers[license] || 1.0);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) =>
            total + (item.price * item.quantity), 0
        );
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    // ✅ CHECKOUT CORREGIDO - AHORA CON URLs CORRECTAS
    const checkout = async () => {
        try {
            setLoading(true);

            if (!cartItems || cartItems.length === 0) {
                const error = new Error('El carrito está vacío. Por favor, agrega productos antes de hacer checkout.');
                console.error('❌ Carrito vacío:', error.message);
                showError('El carrito está vacío');
                throw error;
            }

            const items = cartItems.map(item => ({
                model_id: item.model.id,
                license_type: item.license
            }));

            console.log('📦 Carrito antes de checkout:', JSON.stringify(cartItems, null, 2));
            console.log('📦 Items enviados al servidor:', JSON.stringify(items, null, 2));

            // ✅ URLS DE RETORNO CORRECTAS
            const currentOrigin = window.location.origin; // http://localhost:3000 o http://localhost:8081
            const returnUrl = `${currentOrigin}/purchases/success`;
            const cancelUrl = `${currentOrigin}/checkout`;

            console.log('📍 URL de retorno:', returnUrl);
            console.log('📍 URL de cancelación:', cancelUrl);

            // Usar la nueva ruta de PayPal con URLs correctas
            const response = await API.post('/shopping/create-paypal-order', { 
                items,
                return_url: returnUrl,
                cancel_url: cancelUrl
            });

            if (response.data.success) {
                // Redirigir a PayPal
                window.location.href = response.data.approval_url;
                return response.data;
            } else {
                console.error('❌ Error del servidor:', response.data);
                throw new Error(response.data.message || 'Error al crear la orden');
            }
        } catch (error) {
            console.error('❌ Error en checkout:', error.response?.data || error.message);
            if (error.response?.data?.errors) {
                console.error('Errores de validación:', error.response.data.errors);
                console.error('Datos recibidos por el servidor:', error.response.data.received_data);
            }
            throw error;
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
};