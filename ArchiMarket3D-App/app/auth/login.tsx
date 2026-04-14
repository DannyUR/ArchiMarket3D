// app/auth/login.tsx
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Completa todos los campos');
            return;
        }

        setLoading(true);
        
        try {
            console.log('🚀 Ejecutando login...');
            await login(email, password);
            console.log('✅ Login exitoso, el usuario debería estar autenticado');
            // La redirección se maneja en el AuthContext
        } catch (error: any) {
            console.log('❌ Login fallido:', error);
            let errorMessage = 'Credenciales incorrectas';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            Alert.alert('Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ArchiMarket3D</Text>
            <Text style={styles.subtitle}>Inicia sesión en tu cuenta</Text>

            <TextInput 
                style={styles.input} 
                placeholder="Email" 
                value={email} 
                onChangeText={setEmail} 
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
            />
            
            <TextInput 
                style={styles.input} 
                placeholder="Contraseña" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                editable={!loading}
            />

            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleLogin} 
                disabled={loading}
            >
                {loading ? 
                    <ActivityIndicator color="white" /> : 
                    <Text style={styles.buttonText}>Iniciar Sesión</Text>
                }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/register')} disabled={loading}>
                <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        padding: 20, 
        backgroundColor: '#f3f4f6' 
    },
    title: { 
        fontSize: 32, 
        fontWeight: 'bold', 
        color: '#2563eb', 
        textAlign: 'center', 
        marginBottom: 8 
    },
    subtitle: { 
        fontSize: 14, 
        color: '#6b7280', 
        textAlign: 'center', 
        marginBottom: 32 
    },
    input: { 
        backgroundColor: 'white', 
        padding: 12, 
        borderRadius: 10, 
        marginBottom: 16, 
        borderWidth: 1, 
        borderColor: '#e5e7eb',
        fontSize: 16
    },
    button: { 
        backgroundColor: '#2563eb', 
        paddingVertical: 14, 
        borderRadius: 10, 
        alignItems: 'center', 
        marginTop: 8 
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
        opacity: 0.7
    },
    buttonText: { 
        color: 'white', 
        fontWeight: 'bold', 
        fontSize: 16 
    },
    link: { 
        color: '#2563eb', 
        textAlign: 'center', 
        marginTop: 20,
        fontSize: 14
    },
});