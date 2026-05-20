// api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// 🔴 CONFIGURACIÓN DE RED
// Obtén tu IP local ejecutando 'ipconfig' en Windows (busca IPv4)
// Ejemplo: 192.168.1.20
const LOCAL_IP = '192.168.1.20'; // ← CAMBIA ESTA IP POR LA TUYA

// Puertos
const BACKEND_PORT = '8000';

// Detectar si estamos en web o móvil
const isWeb = Platform.OS === 'web';

// 🔥 CORREGIDO: Usar la misma IP para web y móvil
// En web también usar la IP, no localhost
const BASE_URL = `http://${LOCAL_IP}:${BACKEND_PORT}/api`;

// URL para producción (cuando tengas un dominio real)
const PRODUCTION_URL = 'https://tu-dominio.com/api';

// 🔥 CAMBIA esto a false cuando estés en producción
const IS_PRODUCTION = false;

// URL final
const API_URL = IS_PRODUCTION ? PRODUCTION_URL : BASE_URL;

console.log('🔧 ========== CONFIGURACIÓN API ==========');
console.log('📱 Plataforma:', isWeb ? 'Web (Navegador)' : 'Móvil (React Native)');
console.log('🌐 API_URL:', API_URL);
console.log('🏠 IP Local:', LOCAL_IP);
console.log('🔌 Puerto:', BACKEND_PORT);
console.log('==========================================');

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token a TODAS las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log para debugging
      console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      
      return config;
    } catch (error) {
      console.error('Error getting token:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    console.log(`📥 Respuesta ${response.status}: ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error('❌ Error response:', {
        status: error.response.status,
        url: error.config?.url,
        message: error.response.data?.message || error.message
      });
      
      // Token expirado - solo borrar si no es ruta pública
      if (error.response.status === 401) {
        const isPublicRoute = error.config?.url?.includes('forgot-password') || 
                             error.config?.url?.includes('reset-password') ||
                             error.config?.url?.includes('login') ||
                             error.config?.url?.includes('register');
        
        if (!isPublicRoute) {
          console.log('⚠️ Token expirado o inválido');
          await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
        }
      }
    } else if (error.request) {
      console.error('❌ No response from server:', error.request);
    } else {
      console.error('❌ Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;