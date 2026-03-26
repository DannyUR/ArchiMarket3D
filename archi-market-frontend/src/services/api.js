import axios from 'axios';

// Configuración de URLs por entorno
const ENVIRONMENTS = {
    development: {
        local: 'http://127.0.0.1:8000/api',
        network: 'http://192.168.1.11:8000/api',
        ngrok: 'https://housewifely-quadrophonics-audrianna.ngrok-free.dev/api'
    },
    production: {
        url: 'https://api.archimarket3d.com/api' // Cuando tengas dominio
    }
};

// Detectar entorno automáticamente
const getBaseURL = () => {
    const hostname = window.location.hostname;
    const isProduction = process.env.NODE_ENV === 'production';

    // 1. Si es producción, usar URL de producción
    if (isProduction) {
        return ENVIRONMENTS.production.url;
    }

    // 2. Si estamos en ngrok (la URL contiene ngrok)
    if (hostname.includes('ngrok')) {
        return ENVIRONMENTS.development.ngrok;
    }

    // 3. Si estamos en localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return ENVIRONMENTS.development.local;
    }

    // 4. Si estamos en IP local (red)
    if (hostname.match(/^192\.168\.\d+\.\d+$/)) {
        return ENVIRONMENTS.development.network;
    }

    // 5. Por defecto, intentar con local
    console.warn('⚠️ No se pudo determinar el entorno, usando localhost por defecto');
    return ENVIRONMENTS.development.local;
};

// Crear instancia de axios
const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // URL completa del servidor Laravel
    withCredentials: true,
    timeout: 30000, // 30 segundos de timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Función para cambiar la URL manualmente (útil para pruebas)
API.setBaseURL = (url) => {
    API.defaults.baseURL = url;
    console.log('🔄 BaseURL cambiada a:', url);
};

// Función para obtener la URL actual
API.getBaseURL = () => {
    return API.defaults.baseURL;
};

// Interceptor de peticiones mejorado
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        console.log('📍 URL COMPLETA:', config.baseURL + config.url);
        console.log('🎯 BaseURL configurada:', config.baseURL);
        console.log('🔗 Ruta relativa:', config.url);
        console.log('🌐 Location hostname:', window.location.hostname);

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuestas
API.interceptors.response.use(
    (response) => {
        console.group('📦 Respuesta HTTP');
        console.log('URL:', response.config.url);
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        console.groupEnd();

        return response;
    },
    (error) => {
        // Logging detallado del error
        console.group('❌ Error HTTP');
        console.error('URL:', error.config?.url);
        console.error('BaseURL:', error.config?.baseURL);
        console.error('Status:', error.response?.status);
        console.error('Status Text:', error.response?.statusText);
        console.error('Mensaje:', error.message);

        if (error.response?.data) {
            console.error('Respuesta del servidor:', error.response.data);
        }

        if (error.code === 'ECONNABORTED') {
            console.error('⏱️ Timeout - El servidor tardó demasiado en responder');
        }

        if (!error.response) {
            console.error('🌐 Error de red - No se pudo conectar al servidor');
        }
        console.groupEnd();

        // Manejo de errores específicos
        if (error.response?.status === 401) {
            console.warn('🔒 Sesión expirada - Redirigiendo a login');
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Evitar redirección en peticiones de login
            if (!error.config.url.includes('/auth/login')) {
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 403) {
            console.warn('🚫 Acceso prohibido');
        }

        if (error.response?.status === 404) {
            console.warn('🔍 Recurso no encontrado');
        }

        if (error.response?.status === 422) {
            console.warn('📋 Error de validación');
        }

        if (error.response?.status >= 500) {
            console.error('🔥 Error del servidor (500)');
        }

        return Promise.reject(error);
    }
);

// Métodos útiles para archivos (descargas)
API.download = async (url, filename) => {
    try {
        const response = await API.get(url, {
            responseType: 'blob'
        });

        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);

        return true;
    } catch (error) {
        console.error('Error en descarga:', error);
        throw error;
    }
};

// Método para verificar conectividad
API.checkConnection = async () => {
    try {
        const start = Date.now();
        await API.get('/health', { timeout: 5000 });
        const latency = Date.now() - start;
        return { connected: true, latency };
    } catch (error) {
        return { connected: false, error: error.message };
    }
};

// Exportar configuración actual
API.config = {
    environments: ENVIRONMENTS,
    currentBaseURL: getBaseURL()
};

export default API;