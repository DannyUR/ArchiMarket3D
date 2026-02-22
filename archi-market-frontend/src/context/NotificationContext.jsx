import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import API from '../services/api';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // ✅ FUNCIÓN PARA OBTENER CONTADOR INICIAL (SOLO SI HAY TOKEN)
    const fetchUnreadCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('👤 No hay token, omitiendo notificaciones');
            return;
        }

        try {
            const response = await API.get('/admin/notifications/unread-count');
            setUnreadCount(response.data.data?.unread_count || 0);
        } catch (error) {
            console.error('Error obteniendo contador:', error);
        }
    };

    // ✅ FUNCIONES DE NOTIFICACIONES
    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    // ✅ FUNCIONES DE TOAST
    const showSuccess = (message) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
    };

    const showError = (message) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
    };

    const showInfo = (message) => {
        toast.info(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
    };

    const showWarning = (message) => {
        toast.warning(message, {
            position: "top-right",
            autoClose: 4000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "colored"
        });
    };

    // ✅ CONFIGURAR ECHO (SOLO SI HAY TOKEN)
    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            fetchUnreadCount();

            // Configurar Pusher
            window.Pusher = Pusher;

            const echo = new Echo({
                broadcaster: 'pusher',
                key: 'ffc3828cec5ad6e44d1b',
                cluster: 'mt1',
                forceTLS: true
            });

            const channel = echo.channel('admin-notifications');

            channel
                .listen('.user.registered', (notification) => {
                    addNotification(notification);
                    showInfo('👤 ' + notification.message);
                })
                .listen('.purchase.completed', (notification) => {
                    addNotification(notification);
                    showSuccess('💰 ' + notification.message);
                })
                .listen('.review.added', (notification) => {
                    addNotification(notification);
                    showInfo('⭐ ' + notification.message);
                })
                .listen('.payment.processed', (notification) => {
                    addNotification(notification);
                    showSuccess('💵 ' + notification.message);
                });

            return () => {
                channel.stopListening('.user.registered');
                channel.stopListening('.purchase.completed');
                channel.stopListening('.review.added');
                channel.stopListening('.payment.processed');
                echo.leave('admin-notifications');
            };
        }
    }, []); // Dependencias vacías

    // ✅ VALUE DEL CONTEXT
    const value = {
        notifications,
        unreadCount,
        addNotification,
        showSuccess,
        showError,
        showInfo,
        showWarning
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
        </NotificationContext.Provider>
    );
};