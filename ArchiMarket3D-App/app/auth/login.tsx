import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }

        setLoading(true);
        console.log('🚀 Ejecutando login...');
        const result = await login(email, password);
        setLoading(false);

        console.log('📊 Resultado del login:', result);

        if (result.success) {
            console.log('✅ Login exitoso, redirigiendo...');
            // Usar router.replace para limpiar el historial
            router.replace('/(tabs)');
        } else {
            console.log('❌ Login fallido:', result.error);
            Alert.alert('Error', result.error || 'Credenciales incorrectas');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ArchiMarket3D</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f3f4f6' },
    title: { fontSize: 32, fontWeight: 'bold', color: '#2563eb', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
    input: { backgroundColor: 'white', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb' },
    button: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
    buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    link: { color: '#2563eb', textAlign: 'center', marginTop: 20 },
});