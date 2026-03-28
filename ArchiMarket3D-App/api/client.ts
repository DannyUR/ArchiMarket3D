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

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Para evitar la pantalla de advertencia
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;