import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import api from '../api/client';

export default function ResetPassword() {
  const params = useLocalSearchParams();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Obtener parámetros del deep link
    if (params.token) setToken(params.token);
    if (params.email) setEmail(decodeURIComponent(params.email));
  }, [params]);

  const validatePassword = (pass) => {
    if (pass.length < 8) return 'Mínimo 8 caracteres';
    if (!/[A-Z]/.test(pass)) return 'Debe tener una mayúscula';
    if (!/[a-z]/.test(pass)) return 'Debe tener una minúscula';
    if (!/[0-9]/.test(pass)) return 'Debe tener un número';
    return null;
  };

  const handleSubmit = async () => {
    if (!token || !email) {
      Alert.alert('Error', 'Enlace inválido o expirado');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });

      if (response.data.success) {
        Alert.alert(
          '✅ Contraseña actualizada',
          'Tu contraseña ha sido restablecida correctamente',
          [
            {
              text: 'Iniciar sesión',
              onPress: () => router.push('/login')
            }
          ]
        );
      } else {
        setError(response.data.message || 'Error al restablecer la contraseña');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={60} color="#ef4444" />
        <Text style={styles.errorTitle}>Enlace inválido</Text>
        <Text style={styles.errorText}>
          El enlace de restablecimiento es inválido o ha expirado.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/forgot-password')}
        >
          <Text style={styles.buttonText}>Solicitar nuevo enlace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Feather name="lock" size={40} color="#4f46e5" />
          </View>

          <Text style={styles.title}>Restablecer Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu nueva contraseña para {email}
          </Text>

          {error ? (
            <View style={styles.errorBox}>
              <Feather name="alert-circle" size={20} color="#dc2626" />
              <Text style={styles.errorBoxText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Feather name="key" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.requirements}>
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <View style={styles.inputWrapper}>
              <Feather name="check-circle" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Feather
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#9ca3af"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Restablecer Contraseña</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => router.push('/login')}
          >
            <Feather name="arrow-left" size={16} color="#4f46e5" />
            <Text style={styles.backLinkText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#e0e7ff',
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: 'white',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  eyeIcon: {
    padding: 12,
  },
  requirements: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
  },
  errorBoxText: {
    flex: 1,
    color: '#dc2626',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  backLinkText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
});