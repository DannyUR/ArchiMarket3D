import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api'
});

// Interceptor para añadir token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('🔑 Token enviado:', token ? 'Sí' : 'No');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores 401
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('⚠️ Sesión expirada');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirigir al login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default API;