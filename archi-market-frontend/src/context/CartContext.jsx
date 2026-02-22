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
    const { showSuccess, showError, showInfo } = useNotification(); // ✅ AHORA ESTÁ DENTRO

    // Cargar carrito del localStorage al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (model, license, quantity = 1) => {
        setCartItems(prev => {
            const existingItem = prev.find(item => 
                item.model.id === model.id && item.license === license
            );

            if (existingItem) {
                showSuccess(`🛒 Se actualizó la cantidad de ${model.name}`); // ✅ NOTIFICACIÓN
                return prev.map(item =>
                    item.model.id === model.id && item.license === license
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            showSuccess(`🛒 ${model.name} agregado al carrito`); // ✅ NOTIFICACIÓN
            return [...prev, {
                model,
                license,
                quantity,
                price: calculateLicensePrice(model.price, license)
            }];
        });
    };

    const removeFromCart = (modelId, license, modelName) => {
        setCartItems(prev => 
            prev.filter(item => !(item.model.id === modelId && item.license === license))
        );
        showInfo(`🗑️ ${modelName} eliminado del carrito`); // ✅ NOTIFICACIÓN
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

    const checkout = async () => {
        setLoading(true);
        setError(null);

        try {
            const items = cartItems.map(item => ({
                model_id: item.model.id,
                license_type: item.license
            }));

            console.log('Enviando items:', items);

            const response = await API.post('/purchases/checkout', { items });
            console.log('Respuesta del servidor:', response.data);
            
            if (response.data.success) {
                showSuccess('✅ ¡Compra realizada con éxito!'); // ✅ NOTIFICACIÓN
                clearCart();
                return response.data;
            } else {
                throw new Error(response.data.message || 'Error en la compra');
            }
            
        } catch (err) {
            console.error('Error completo:', err.response?.data || err);
            const errorMsg = err.response?.data?.message || 'Error al procesar la compra';
            setError(errorMsg);
            showError('❌ ' + errorMsg); // ✅ NOTIFICACIÓN DE ERROR
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        cartItems,
        loading,
        error,
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