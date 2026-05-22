// api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

const LOCAL_IP = '192.168.1.20';
const BACKEND_PORT = '8000';

// Detectar entorno
const isWeb = Platform.OS === 'web';
let isLocalhost = false;
let currentPort = '';

if (isWeb && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    currentPort = window.location.port;
}

let BASE_URL: string;

if (isWeb && isLocalhost) {
    BASE_URL = `http://localhost:${BACKEND_PORT}/api`;
    console.log(`🌐 API usando localhost:${BACKEND_PORT}`);
} else if (isWeb && !isLocalhost) {
    BASE_URL = `http://${LOCAL_IP}:${BACKEND_PORT}/api`;
    console.log(`📱 API usando IP:${BACKEND_PORT}`);
} else {
    BASE_URL = `http://${LOCAL_IP}:${BACKEND_PORT}/api`;
    console.log(`📱 App móvil usando IP:${BACKEND_PORT}`);
}

console.log('🔧 API_URL:', BASE_URL);

console.log('🔥 BASE URL FINAL:', BASE_URL);
console.log('🔥 LOGIN URL:', `${BASE_URL}/auth/login`);
Alert.alert('DEBUG URL', `${BASE_URL}/auth/login`);

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para agregar el token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (__DEV__) {
        console.log(`📤 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
      }
      
      return config;
    } catch (error) {
      console.error('Error getting token:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`📥 ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error('❌ Error response:', {
        status: error.response.status,
        url: error.config?.url,
        message: error.response.data?.message || error.message
      });
      
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