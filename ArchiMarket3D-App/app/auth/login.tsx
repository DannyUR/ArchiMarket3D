// app/auth/login.tsx
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.card}>
                    {/* Logo y título */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoIcon}>
                            <Feather name="box" size={32} color="#4f46e5" />
                        </View>
                        <Text style={styles.logo}>
                            Archi<span style={styles.logoAccent}>Market</span>3D
                        </Text>
                    </View>

                    <Text style={styles.title}>Bienvenido de vuelta</Text>
                    <Text style={styles.subtitle}>
                        Inicia sesión para acceder a tus modelos 3D
                    </Text>

                    {/* Campo de Email */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Correo electrónico</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="tu@email.com" 
                                placeholderTextColor="#9ca3af"
                                value={email} 
                                onChangeText={setEmail} 
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>
                    </View>

                    {/* Campo de Contraseña */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Contraseña</Text>
                        <View style={styles.inputWrapper}>
                            <Feather name="lock" size={20} color="#9ca3af" style={styles.inputIcon} />
                            <TextInput 
                                style={styles.input} 
                                placeholder="••••••••" 
                                placeholderTextColor="#9ca3af"
                                value={password} 
                                onChangeText={setPassword} 
                                secureTextEntry={!showPassword}
                                editable={!loading}
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
                    </View>

                    {/* Botón Olvidé mi contraseña */}
                    <TouchableOpacity 
                        style={styles.forgotButton}
                        onPress={() => router.push('/forgot-password')}
                        disabled={loading}
                    >
                        <Text style={styles.forgotButtonText}>¿Olvidaste tu contraseña?</Text>
                    </TouchableOpacity>

                    {/* Botón de Iniciar Sesión */}
                    <TouchableOpacity 
                        style={[styles.button, loading && styles.buttonDisabled]} 
                        onPress={handleLogin} 
                        disabled={loading}
                    >
                        {loading ? 
                            <ActivityIndicator color="white" size="small" /> : 
                            <>
                                <Feather name="log-in" size={18} color="white" />
                                <Text style={styles.buttonText}>Iniciar Sesión</Text>
                            </>
                        }
                    </TouchableOpacity>

                    {/* Separador */}
                    <View style={styles.separator}>
                        <View style={styles.separatorLine} />
                        <Text style={styles.separatorText}>o</Text>
                        <View style={styles.separatorLine} />
                    </View>

                    {/* Link de Registro */}
                    <TouchableOpacity 
                        style={styles.registerButton}
                        onPress={() => router.push('/auth/register')} 
                        disabled={loading}
                    >
                        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
                        <Text style={styles.registerLink}>Crea una cuenta</Text>
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
    inputIcon: {
        marginLeft: 12,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        paddingHorizontal: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    eyeIcon: {
        padding: 12,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotButtonText: {
        color: '#4f46e5',
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        backgroundColor: '#4f46e5',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 20,
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
        marginBottom: 20,
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
    registerButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerText: {
        color: '#6b7280',
        fontSize: 14,
    },
    registerLink: {
        color: '#4f46e5',
        fontSize: 14,
        fontWeight: '600',
    },
});