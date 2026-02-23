import axios from 'axios';

// Detectar automáticamente el entorno
const getBaseURL = () => {
    // Si estamos en desarrollo local (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000/api';
    }
    // Si estamos en la red local (IP)
    return 'http://192.168.1.11:8000/api';
};

const API = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Interceptor para añadir token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('🔑 Token enviado:', token ? 'Sí' : 'No');
        console.log('📡 Solicitando a:', config.baseURL + config.url);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores
API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('❌ Error en petición:', {
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            status: error.response?.status,
            message: error.message
        });
        
        if (error.response?.status === 401) {
            console.error('⚠️ Sesión expirada');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;