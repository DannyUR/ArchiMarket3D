// src/services/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api'
});

// Interceptor para añadir token a las peticiones
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token enviado:', token ? 'Sí' : 'No'); // Para debug
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;