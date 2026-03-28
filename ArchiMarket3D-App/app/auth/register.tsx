import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('architect'); // architect, engineer, company
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await register({ 
      name, 
      email, 
      password, 
      password_confirmation: passwordConfirmation,
      role: userType 
    });
    setLoading(false);
    
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', result.error || 'Error al registrarse');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>ArchiMarket3D</Text>
      <Text style={styles.subtitle}>Crea una nueva cuenta</Text>

      {/* Nombre completo */}
      <TextInput
        style={styles.input}
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
      />

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {/* Tipo de usuario */}
      <Text style={styles.label}>Tipo de usuario</Text>
      <View style={styles.userTypeContainer}>
        <TouchableOpacity
          style={[styles.userTypeButton, userType === 'architect' && styles.userTypeActive]}
          onPress={() => setUserType('architect')}
        >
          <Text style={[styles.userTypeText, userType === 'architect' && styles.userTypeTextActive]}>
            🏛️ Arquitecto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.userTypeButton, userType === 'engineer' && styles.userTypeActive]}
          onPress={() => setUserType('engineer')}
        >
          <Text style={[styles.userTypeText, userType === 'engineer' && styles.userTypeTextActive]}>
            🔧 Ingeniero
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.userTypeButton, userType === 'company' && styles.userTypeActive]}
          onPress={() => setUserType('company')}
        >
          <Text style={[styles.userTypeText, userType === 'company' && styles.userTypeTextActive]}>
            🏢 Empresa
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Confirmar contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f3f4f6',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  userTypeActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  userTypeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  userTypeTextActive: {
    color: 'white',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#2563eb',
    textAlign: 'center',
    marginTop: 20,
  },
});