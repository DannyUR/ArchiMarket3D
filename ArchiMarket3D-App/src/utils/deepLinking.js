import * as Linking from 'expo-linking';
import { router } from 'expo-router';

// Configuración de deep links
export const deepLinkConfig = {
  prefixes: [
    'archimarket3d://',
    'https://archimarket3d.com',
    'http://localhost:8081'
  ],
};

// Manejar enlaces entrantes
export const handleDeepLink = (url) => {
  console.log('📱 Deep link recibido:', url);
  
  if (!url) return;
  
  // Parsear la URL
  const { path, queryParams } = Linking.parse(url);
  
  console.log('Path:', path);
  console.log('Query params:', queryParams);
  
  // Manejar diferentes rutas con Expo Router
  if (path === 'reset-password') {
    const { token, email } = queryParams;
    if (token && email) {
      // Navegar a la pantalla de reset-password
      router.push({
        pathname: '/reset-password',
        params: { token, email }
      });
    }
  }
  
  else if (path === 'email-verified') {
    const { verified, message } = queryParams;
    router.push({
      pathname: '/email-verified',
      params: { verified, message }
    });
  }
  
  else if (path === 'verification-error') {
    const { reason } = queryParams;
    router.push({
      pathname: '/email-verified',
      params: { error: 'true', reason }
    });
  }
  
  else if (path === 'purchases/success') {
    const { shopping_id } = queryParams;
    router.push({
      pathname: '/purchases/success',
      params: { shopping_id }
    });
  }
  
  else if (path === 'login') {
    router.push('/auth/login');
  }
  
  else if (path === 'forgot-password') {
    router.push('/forgot-password');
  }
};

// Configurar listener de deep links
export const setupDeepLinks = () => {
  // Manejar cuando la app se abre desde un link
  const handleInitialUrl = async () => {
    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      handleDeepLink(initialUrl);
    }
  };
  
  // Escuchar cambios de URL mientras la app está abierta
  const subscription = Linking.addEventListener('url', ({ url }) => {
    handleDeepLink(url);
  });
  
  handleInitialUrl();
  
  return () => {
    subscription.remove();
  };
};