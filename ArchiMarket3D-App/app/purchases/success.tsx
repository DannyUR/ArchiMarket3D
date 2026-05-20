// app/purchases/success.tsx
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/client';
import { useCart } from '../../context/CartContext';

export default function PurchaseSuccess() {
    const { shopping_id, payment_success, token, PayerID } = useLocalSearchParams();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [purchase, setPurchase] = useState<any>(null);
    const [purchaseDetails, setPurchaseDetails] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

    useEffect(() => {
        console.log('🔍 Success page params:', { shopping_id, payment_success, token, PayerID });
        
        if (payment_success === 'true') {
            console.log('✅ Pago ya confirmado por PayPal, mostrando éxito directamente');
            setAlreadyConfirmed(true);
            fetchPurchaseDetails();
            setLoading(false);
            return;
        }
        
        if (shopping_id) {
            confirmPurchase();
        } else if (token && PayerID) {
            redirectToPayPalCallback();
        } else {
            setError('No se encontró información de la compra');
            setLoading(false);
        }
    }, []);

    const fetchPurchaseDetails = async () => {
        if (!shopping_id) return;
        try {
            const response = await api.get(`/purchases/${shopping_id}`);
            if (response.data.success) {
                setPurchaseDetails(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching purchase details:', err);
        }
    };

    const redirectToPayPalCallback = () => {
        if (typeof window === 'undefined') return;
        const backendOrigin = api.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
        window.location.href = `${backendOrigin}/api/shopping/execute-paypal-payment?paymentId=${encodeURIComponent(token as string)}&PayerID=${encodeURIComponent(PayerID as string)}`;
    };

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
            await fetchPurchaseDetails();
            
        } catch (err: any) {
            console.error('Error confirming purchase:', err);
            
            const errorMessage = err.response?.data?.message || '';
            if (errorMessage.includes('ya fue procesada') || errorMessage.includes('estado inválido')) {
                console.log('✅ Compra ya estaba procesada, mostrando éxito');
                setAlreadyConfirmed(true);
                await fetchPurchaseDetails();
                setError(null);
            } else {
                setError(errorMessage || 'Error al confirmar la compra');
            }
        } finally {
            setLoading(false);
        }
    };

    // 🔥 Función segura para formatear precios
    const formatPrice = (price: any): string => {
        const num = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(num)) return '0.00';
        return num.toFixed(2);
    };

    const getItems = () => {
        if (purchaseDetails?.models) {
            return purchaseDetails.models;
        }
        if (purchase?.data?.items) {
            return purchase.data.items;
        }
        return [];
    };

    const items = getItems();
    const subtotal = typeof purchaseDetails?.total === 'string' ? parseFloat(purchaseDetails.total) : (purchaseDetails?.total || 0);
    const purchaseTotal = typeof purchase?.data?.total === 'string' ? parseFloat(purchase.data.total) : (purchase?.data?.total || 0);
    const finalSubtotal = subtotal || purchaseTotal || 0;
    const iva = finalSubtotal * 0.16;
    const total = finalSubtotal + iva;

    const formatDate = (dateString?: string) => {
        if (dateString) {
            return new Date(dateString).toLocaleDateString('es-MX', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (alreadyConfirmed) {
        return (
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* Header */}
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
                    {/* Tarjeta de estado */}
                    <View style={styles.statusCard}>
                        <View style={styles.statusBadge}>
                            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                            <Text style={styles.statusText}>Pago confirmado</Text>
                        </View>
                        <Text style={styles.orderNumber}>Orden #{shopping_id || purchaseDetails?.id || purchase?.data?.shopping_id}</Text>
                        <Text style={styles.orderDate}>{formatDate(purchaseDetails?.purchase_date)}</Text>
                    </View>

                    {/* Resumen de la compra */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Ionicons name="cube-outline" size={18} color="#4f46e5" /> Resumen de compra
                        </Text>
                        
                        {items.length > 0 ? (
                            items.map((item: any, index: number) => {
                                // 🔥 Obtener precio de forma segura
                                const itemPrice = item.pivot?.unit_price || item.price || item.unit_price || 0;
                                const priceNum = typeof itemPrice === 'string' ? parseFloat(itemPrice) : itemPrice;
                                
                                return (
                                    <View key={index} style={styles.productItem}>
                                        <View style={styles.productIcon}>
                                            <Text style={styles.productIconText}>📦</Text>
                                        </View>
                                        <View style={styles.productInfo}>
                                            <Text style={styles.productName}>{item.name}</Text>
                                            <Text style={styles.productLicense}>
                                                Licencia: {item.pivot?.license_type || item.license_type || 'Personal'}
                                            </Text>
                                        </View>
                                        <Text style={styles.productPrice}>
                                            ${formatPrice(priceNum)}
                                        </Text>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.emptyProducts}>Cargando productos...</Text>
                        )}
                        
                        <View style={styles.divider} />
                        
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>${formatPrice(finalSubtotal)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IVA (16%)</Text>
                            <Text style={styles.totalValue}>${formatPrice(iva)}</Text>
                        </View>
                        <View style={styles.totalRowTotal}>
                            <Text style={styles.totalLabelTotal}>Total pagado</Text>
                            <Text style={styles.totalValueTotal}>${formatPrice(total)} MXN</Text>
                        </View>
                    </View>

                    {/* Método de pago */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            <Ionicons name="card-outline" size={18} color="#4f46e5" /> Método de pago
                        </Text>
                        <View style={styles.paymentMethod}>
                            <View style={styles.paymentIcon}>
                                <Ionicons name="logo-paypal" size={28} color="#0070ba" />
                            </View>
                            <View style={styles.paymentInfo}>
                                <Text style={styles.paymentName}>PayPal</Text>
                                <Text style={styles.paymentDesc}>Pago realizado con PayPal</Text>
                            </View>
                            <View style={styles.paymentStatus}>
                                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                                <Text style={styles.paymentStatusText}>Completado</Text>
                            </View>
                        </View>
                    </View>

                    {/* Instrucciones */}
                    <View style={styles.instructionsCard}>
                        <LinearGradient
                            colors={['#e0e7ff', '#c7d2fe']}
                            style={styles.instructionsGradient}
                        >
                            <Ionicons name="bulb-outline" size={24} color="#4f46e5" />
                            <View style={styles.instructionsContent}>
                                <Text style={styles.instructionsTitle}>¿Cómo descargar tus modelos?</Text>
                                <Text style={styles.instructionsText}>
                                    1. Ve a la sección "Mis compras" o "Licencias" en tu perfil
                                </Text>
                                <Text style={styles.instructionsText}>
                                    2. Selecciona el modelo que deseas descargar
                                </Text>
                                <Text style={styles.instructionsText}>
                                    3. Haz clic en el botón de descarga
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Botones de acción */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => router.push('/(tabs)/profile?tab=purchases')}
                        >
                            <LinearGradient
                                colors={['#4f46e5', '#7c3aed']}
                                style={styles.primaryButtonGradient}
                            >
                                <Ionicons name="download-outline" size={20} color="#fff" />
                                <Text style={styles.primaryButtonText}>Ver mis compras</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => router.push('/(tabs)/models')}
                        >
                            <Ionicons name="grid-outline" size={20} color="#4f46e5" />
                            <Text style={styles.secondaryButtonText}>Seguir comprando</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
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
                        <Text style={styles.detailValue}>#{purchase?.data?.shopping_id || shopping_id}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Fecha:</Text>
                        <Text style={styles.detailValue}>
                            {new Date().toLocaleDateString('es-MX')}
                        </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Subtotal:</Text>
                        <Text style={styles.detailValue}>${formatPrice(purchase?.data?.total || 0)}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>IVA (16%):</Text>
                        <Text style={styles.detailValue}>${formatPrice((purchase?.data?.total || 0) * 0.16)}</Text>
                    </View>
                    
                    <View style={styles.detailRowTotal}>
                        <Text style={styles.detailLabelTotal}>Total pagado:</Text>
                        <Text style={styles.detailValueTotal}>
                            ${formatPrice((purchase?.data?.total || 0) * 1.16)} MXN
                        </Text>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={24} color="#4f46e5" />
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
                        <LinearGradient
                            colors={['#4f46e5', '#7c3aed']}
                            style={styles.primaryButtonGradient}
                        >
                            <Ionicons name="download-outline" size={20} color="#fff" />
                            <Text style={styles.primaryButtonText}>Ver mis compras</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => router.push('/(tabs)/models')}
                    >
                        <Ionicons name="grid-outline" size={20} color="#4f46e5" />
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
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#10b981',
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: '#64748b',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
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
    productItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    productIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    productIconText: {
        fontSize: 22,
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 2,
    },
    productLicense: {
        fontSize: 11,
        color: '#64748b',
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4f46e5',
    },
    emptyProducts: {
        textAlign: 'center',
        color: '#94a3b8',
        paddingVertical: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    totalLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    totalValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1e293b',
    },
    totalRowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 10,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    totalLabelTotal: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    totalValueTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4f46e5',
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    paymentInfo: {
        flex: 1,
    },
    paymentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    paymentDesc: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
    },
    paymentStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    paymentStatusText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#10b981',
    },
    instructionsCard: {
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 20,
    },
    instructionsGradient: {
        flexDirection: 'row',
        padding: 16,
        gap: 14,
    },
    instructionsContent: {
        flex: 1,
    },
    instructionsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4f46e5',
        marginBottom: 8,
    },
    instructionsText: {
        fontSize: 11,
        color: '#4338ca',
        marginBottom: 4,
        lineHeight: 16,
    },
    buttonContainer: {
        gap: 12,
        marginBottom: 16,
    },
    primaryButton: {
        borderRadius: 40,
        overflow: 'hidden',
    },
    primaryButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 16,
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
        borderColor: '#4f46e5',
    },
    secondaryButtonText: {
        color: '#4f46e5',
        fontWeight: '600',
        fontSize: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
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
    detailRowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 12,
        marginTop: 4,
    },
    detailLabelTotal: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    detailValueTotal: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4f46e5',
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
        backgroundColor: '#4f46e5',
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