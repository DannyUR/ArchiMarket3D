// api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔴 CAMBIA ESTA URL POR LA DE NGROK
// Cuando estés en desarrollo con móvil, usa la URL de ngrok
// Cuando estés en web con localhost, usa localhost

// Detectar si estamos en web o móvil
const isWeb = typeof window !== 'undefined' && window.document !== undefined;

// URL para desarrollo local (web)
const LOCAL_URL = 'http://localhost:8000/api';

// URL para móvil (ngrok) - CAMBIA ESTA POR TU URL DE NGROK
const NGROK_URL = 'https://housewifely-quadrophonics-audrianna.ngrok-free.dev/api';

// Usa la URL según la plataforma
const API_URL = isWeb ? LOCAL_URL : NGROK_URL;

console.log('🔧 API_URL:', API_URL);
console.log('📱 Plataforma:', isWeb ? 'Web' : 'Móvil');

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Para evitar la pantalla de advertencia
  },
});

// Interceptor para agregar el token a TODAS las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log('🔑 Token en request:', token ? 'Sí existe' : 'No existe');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('⚠️ Token expirado o inválido');
      await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
      // Redirigir al login - puedes usar un event emitter o navigation ref
    }
    return Promise.reject(error);
  }
);

export default api;