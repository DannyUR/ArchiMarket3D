// app/config.js
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Obtener la IP local - CAMBIA ESTA IP SEGÚN TU ipconfig
// Ejecuta 'ipconfig' en Windows y busca "IPv4"
const LOCAL_IP = '192.168.1.20'; // ← CAMBIA A TU IP REAL

// En desarrollo, usa la IP local
// En producción, usa tu dominio real
export const BACKEND_URL = __DEV__ 
    ? `http://${LOCAL_IP}:8000`
    : 'https://tu-dominio.com';

export const API_URL = `${BACKEND_URL}/api`;