// app/auth/register.tsx
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('architect');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  
  const { register } = useAuth();

  // Validaciones en tiempo real
  const isNameValid = name.length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };
  const isPasswordStrong = Object.values(isPasswordValid).every(Boolean);
  const doPasswordsMatch = password === passwordConfirmation && password.length > 0;
  const isFormValid = name && isEmailValid && isPasswordStrong && doPasswordsMatch;

  const getPasswordStrength = () => {
    const validCount = Object.values(isPasswordValid).filter(Boolean).length;
    if (validCount <= 2) return { text: 'Débil', color: '#ef4444', width: '25%' };
    if (validCount === 3) return { text: 'Media', color: '#f59e0b', width: '50%' };
    if (validCount === 4) return { text: 'Fuerte', color: '#10b981', width: '100%' };
    return { text: 'Muy débil', color: '#ef4444', width: '0%' };
  };

  const passwordStrength = getPasswordStrength();

  const handleRegister = async () => {
    if (!isFormValid) {
      let errorMsg = 'Por favor, completa todos los campos correctamente:\n';
      if (!name) errorMsg += '\n• Nombre completo';
      if (!isEmailValid) errorMsg += '\n• Correo electrónico válido';
      if (!isPasswordStrong) errorMsg += '\n• Contraseña más segura (revisa los requisitos)';
      if (!doPasswordsMatch) errorMsg += '\n• Las contraseñas no coinciden';
      Alert.alert('Error', errorMsg);
      return;
    }

    setLoading(true);
    
    try {
      console.log('🚀 Ejecutando registro...');
      await register(name, email, password, userType);
      console.log('✅ Registro exitoso, redirigiendo...');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.log('❌ Registro fallido:', error);
      
      let errorMessage = 'Error al registrarse';
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const markTouched = (field: keyof typeof touchedFields) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Feather name="box" size={32} color="#4f46e5" />
            </View>
            <Text style={styles.logo}>
              Archi<span style={styles.logoAccent}>Market</span>3D
            </Text>
          </View>

          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>
            Únete a nuestra comunidad de profesionales
          </Text>

          {/* Campo Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <View style={[
              styles.inputWrapper,
              touchedFields.name && !isNameValid && styles.inputError,
              touchedFields.name && isNameValid && styles.inputSuccess
            ]}>
              <Feather name="user" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Juan Pérez"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                onFocus={() => markTouched('name')}
                editable={!loading}
              />
              {touchedFields.name && isNameValid && (
                <Feather name="check-circle" size={20} color="#10b981" style={styles.inputRightIcon} />
              )}
            </View>
          </View>

          {/* Campo Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo electrónico</Text>
            <View style={[
              styles.inputWrapper,
              touchedFields.email && !isEmailValid && styles.inputError,
              touchedFields.email && isEmailValid && styles.inputSuccess
            ]}>
              <Feather name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                onFocus={() => markTouched('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
              {touchedFields.email && isEmailValid && (
                <Feather name="check-circle" size={20} color="#10b981" style={styles.inputRightIcon} />
              )}
            </View>
            {touchedFields.email && !isEmailValid && (
              <Text style={styles.errorText}>Ingresa un correo electrónico válido</Text>
            )}
          </View>

          {/* Tipo de usuario */}
          <Text style={styles.label}>Tipo de usuario</Text>
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'architect' && styles.userTypeActive]}
              onPress={() => setUserType('architect')}
              disabled={loading}
            >
              <Feather name="layers" size={20} color={userType === 'architect' ? '#fff' : '#4f46e5'} />
              <Text style={[styles.userTypeText, userType === 'architect' && styles.userTypeTextActive]}>
                Arquitecto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'engineer' && styles.userTypeActive]}
              onPress={() => setUserType('engineer')}
              disabled={loading}
            >
              <Feather name="tool" size={20} color={userType === 'engineer' ? '#fff' : '#4f46e5'} />
              <Text style={[styles.userTypeText, userType === 'engineer' && styles.userTypeTextActive]}>
                Ingeniero
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.userTypeButton, userType === 'company' && styles.userTypeActive]}
              onPress={() => setUserType('company')}
              disabled={loading}
            >
              <Feather name="briefcase" size={20} color={userType === 'company' ? '#fff' : '#4f46e5'} />
              <Text style={[styles.userTypeText, userType === 'company' && styles.userTypeTextActive]}>
                Empresa
              </Text>
            </TouchableOpacity>
          </View>

          {/* Campo Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={[
              styles.inputWrapper,
              touchedFields.password && !isPasswordStrong && styles.inputError,
              touchedFields.password && isPasswordStrong && styles.inputSuccess
            ]}>
              <Feather name="lock" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={password}
                onChangeText={setPassword}
                onFocus={() => markTouched('password')}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {/* Barra de fortaleza de contraseña */}
            {touchedFields.password && password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View style={[styles.strengthFill, { width: passwordStrength.width, backgroundColor: passwordStrength.color }]} />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  Fortaleza: {passwordStrength.text}
                </Text>
              </View>
            )}

            {/* Requisitos de contraseña */}
            {touchedFields.password && !isPasswordStrong && (
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>La contraseña debe tener:</Text>
                <View style={styles.requirementRow}>
                  <Feather name={isPasswordValid.length ? "check-circle" : "circle"} size={14} color={isPasswordValid.length ? "#10b981" : "#9ca3af"} />
                  <Text style={[styles.requirementText, isPasswordValid.length && styles.requirementMet]}>Mínimo 8 caracteres</Text>
                </View>
                <View style={styles.requirementRow}>
                  <Feather name={isPasswordValid.uppercase ? "check-circle" : "circle"} size={14} color={isPasswordValid.uppercase ? "#10b981" : "#9ca3af"} />
                  <Text style={[styles.requirementText, isPasswordValid.uppercase && styles.requirementMet]}>Al menos una mayúscula</Text>
                </View>
                <View style={styles.requirementRow}>
                  <Feather name={isPasswordValid.lowercase ? "check-circle" : "circle"} size={14} color={isPasswordValid.lowercase ? "#10b981" : "#9ca3af"} />
                  <Text style={[styles.requirementText, isPasswordValid.lowercase && styles.requirementMet]}>Al menos una minúscula</Text>
                </View>
                <View style={styles.requirementRow}>
                  <Feather name={isPasswordValid.number ? "check-circle" : "circle"} size={14} color={isPasswordValid.number ? "#10b981" : "#9ca3af"} />
                  <Text style={[styles.requirementText, isPasswordValid.number && styles.requirementMet]}>Al menos un número</Text>
                </View>
              </View>
            )}
          </View>

          {/* Campo Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={[
              styles.inputWrapper,
              touchedFields.confirmPassword && !doPasswordsMatch && styles.inputError,
              touchedFields.confirmPassword && doPasswordsMatch && styles.inputSuccess
            ]}>
              <Feather name="check-circle" size={20} color="#9ca3af" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#9ca3af"
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                onFocus={() => markTouched('confirmPassword')}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
            {touchedFields.confirmPassword && !doPasswordsMatch && passwordConfirmation.length > 0 && (
              <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
            )}
          </View>

          {/* Botón de registro */}
          <TouchableOpacity
            style={[styles.button, (!isFormValid || loading) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Feather name="user-plus" size={18} color="white" />
                <Text style={styles.buttonText}>Registrarse</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Separador */}
          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>o</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Link a login */}
          <TouchableOpacity 
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')} 
            disabled={loading}
          >
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <Text style={styles.loginLinkText}>Inicia sesión</Text>
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
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#e0e7ff',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  logoAccent: {
    color: '#4f46e5',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
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
    borderRadius: 14,
    backgroundColor: 'white',
    paddingHorizontal: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputIcon: {
    marginLeft: 12,
  },
  inputRightIcon: {
    marginRight: 12,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  inputSuccess: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
    marginLeft: 4,
  },
  eyeIcon: {
    padding: 12,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  userTypeActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  userTypeText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: 'white',
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    marginTop: 6,
  },
  requirementsContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
  },
  requirementsTitle: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 6,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  requirementMet: {
    color: '#10b981',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  separatorText: {
    marginHorizontal: 12,
    color: '#9ca3af',
    fontSize: 14,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6b7280',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#4f46e5',
    fontSize: 14,
    fontWeight: '600',
  },
});