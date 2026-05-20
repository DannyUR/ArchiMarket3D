import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function EmailVerified() {
  const params = useLocalSearchParams();
  const [countdown, setCountdown] = useState(5);
  
  const verified = params.verified;
  const message = params.message;
  const error = params.error;
  const reason = params.reason;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  let iconName, iconColor, titleText, messageText;

  if (verified === 'true') {
    iconName = 'check-circle';
    iconColor = '#16a34a';
    titleText = '¡Email Verificado!';
    messageText = message || 'Tu correo ha sido verificado correctamente.';
  } else if (error === 'true' || reason === 'user_not_found') {
    iconName = 'alert-circle';
    iconColor = '#dc2626';
    titleText = 'Usuario no encontrado';
    messageText = 'No se pudo encontrar el usuario asociado a este enlace.';
  } else {
    iconName = 'alert-triangle';
    iconColor = '#dc2626';
    titleText = 'Error de Verificación';
    messageText = message || 'No se pudo verificar tu correo. El enlace puede haber expirado.';
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor === '#16a34a' ? '#dcfce7' : '#fee2e2' }]}>
          <Feather name={iconName} size={40} color={iconColor} />
        </View>
        <Text style={styles.title}>{titleText}</Text>
        <Text style={styles.message}>{messageText}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Ir al inicio de sesión</Text>
        </TouchableOpacity>
        <Text style={styles.countdown}>Redirigiendo en {countdown} segundos...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 350,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  countdown: {
    fontSize: 12,
    color: '#9ca3af',
  },
});