// app/purchases/success.tsx
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/client';

export default function PurchaseSuccess() {
    const { shopping_id, payment_success, token, PayerID } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [purchase, setPurchase] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔍 Success page params:', { shopping_id, payment_success, token, PayerID });
        
        if (payment_success === 'true' && shopping_id) {
            confirmPurchase();
        } else if (token && PayerID) {
            // Para retorno de PayPal con token y PayerID
            confirmPayPalPurchase();
        } else {
            setError('No se encontró información de la compra');
            setLoading(false);
        }
    }, []);

    const confirmPurchase = async () => {
        try {
            setLoading(true);
            
            const shoppingId = parseInt(shopping_id as string, 10);
            
            if (isNaN(shoppingId)) {
                setError('ID de compra inválido');
                setLoading(false);
                return;
            }
            
            const response = await api.post('/purchases/confirm', {
                shopping_id: shoppingId
            });
            
            setPurchase(response.data);
            
        } catch (err: any) {
            console.error('Error confirming purchase:', err);
            setError(err.response?.data?.message || 'Error al confirmar la compra');
        } finally {
            setLoading(false);
        }
    };

    const confirmPayPalPurchase = async () => {
        try {
            setLoading(true);
            
            const response = await api.post('/paypal/capture-order', {
                token: token,
                PayerID: PayerID,
                shopping_id: shopping_id
            });
            
            setPurchase(response.data);
            
        } catch (err: any) {
            console.error('Error capturing PayPal order:', err);
            setError(err.response?.data?.message || 'Error al capturar el pago');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Confirmando tu compra...</Text>
                <Text style={styles.loadingSubtext}>Por favor espera un momento</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.errorIconContainer}>
                    <Ionicons name="alert-circle" size={64} color="#ef4444" />
                </View>
                <Text style={styles.errorTitle}>Error en el pago</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => router.push('/checkout')}>
                    <Text style={styles.retryButtonText}>Intentar nuevamente</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)')}>
                    <Text style={styles.backButtonText}>Volver al inicio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.header}
            >
                <View style={styles.successIcon}>
                    <Ionicons name="checkmark" size={48} color="#fff" />
                </View>
                <Text style={styles.successTitle}>¡Pago Completado!</Text>
                <Text style={styles.successSubtitle}>
                    Tu compra se ha realizado exitosamente
                </Text>
            </LinearGradient>

            <View style={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Detalles de la compra</Text>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Número de orden:</Text>
                        <Text style={styles.detailValue}>#{purchase?.id || shopping_id}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fecha:</Text>
                        <Text style={styles.detailValue}>
                            {new Date().toLocaleDateString('es-MX')}
                        </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Total pagado:</Text>
                        <Text style={styles.detailValueHighlight}>
                            ${purchase?.total || '0.00'} MXN
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color="#2563eb" />
                    <Text style={styles.infoText}>
                        Los modelos adquiridos ya están disponibles en tu perfil.
                        Puedes descargarlos desde la sección "Mis compras" o "Licencias".
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/(tabs)/profile?tab=purchases')}
                    >
                        <Ionicons name="download-outline" size={20} color="#fff" />
                        <Text style={styles.primaryButtonText}>Ver mis compras</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/(tabs)/explore')}
                    >
                        <Ionicons name="grid-outline" size={20} color="#2563eb" />
                        <Text style={styles.secondaryButtonText}>Seguir comprando</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    successSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    detailLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    detailValueHighlight: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2563eb',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#eff6ff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#1e40af',
        lineHeight: 18,
    },
    buttonContainer: {
        gap: 12,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        borderRadius: 40,
    },
    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingVertical: 16,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: '#2563eb',
    },
    secondaryButtonText: {
        color: '#2563eb',
        fontWeight: '600',
        fontSize: 16,
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1e293b',
        marginTop: 20,
    },
    loadingSubtext: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 8,
    },
    errorIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 24,
    },
    retryButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 40,
        marginBottom: 12,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    backButton: {
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 40,
    },
    backButtonText: {
        color: '#64748b',
        fontWeight: '500',
    },
});