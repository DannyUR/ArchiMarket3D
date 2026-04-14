// app/(tabs)/checkout.tsx
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Alert, StyleSheet, Modal, Platform
} from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api/client';

export default function CheckoutScreen() {
    const { cartItems, getCartTotal, clearCart, loading: cartLoading, cartLoaded } = useCart();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('paypal');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paypalUrl, setPaypalUrl] = useState('');

    // Datos del formulario
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
    });

    // Cargar datos del usuario si está autenticado
    useEffect(() => {
        if (user) {
            const nameParts = (user.name || '').split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                email: user.email || '',
                phone: user.phone || '',
            }));
        }
    }, [user]);

    // Validar carrito vacío
    useEffect(() => {
        if (cartLoaded && cartItems.length === 0) {
            Alert.alert(
                'Carrito vacío',
                'No hay productos en tu carrito. Agrega algunos antes de continuar.',
                [{ text: 'Ir a explorar', onPress: () => router.replace('/(tabs)/models') }]
            );
        }
    }, [cartLoaded, cartItems]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNextStep = () => {
        // Validar paso 1
        if (step === 1) {
            if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
                Alert.alert('Campos incompletos', 'Por favor completa todos los campos obligatorios.');
                return;
            }
        }
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setStep(step - 1);
    };

    const handleSubmitOrder = async () => {
        setProcessing(true);
        setErrorMessage('');

        try {
            // Preparar los items del carrito
            const items = cartItems.map(item => ({
                model_id: item.model.id,
                license_type: item.license,
                quantity: item.quantity,
                price: item.price
            }));

            // Crear la orden en el backend
            const response = await api.post('/shopping/create-paypal-order', {
                items: items,
                total: getCartTotal(),
                shipping_info: {
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    zip_code: formData.zipCode
                },
                return_url: 'http://localhost:8081/purchases/success',
                cancel_url: 'http://localhost:8081/checkout'
            });

            const { approval_url, order_id } = response.data;

            // ✅ Redirigir a PayPal en la misma ventana
            if (Platform.OS === 'web') {
                window.location.href = approval_url;
            } else {
                // Para móvil, abrir en navegador
                const { Linking } = await import('react-native');
                await Linking.openURL(approval_url);
            }

        } catch (error: any) {
            console.error('Error en checkout:', error);
            const message = error.response?.data?.message || error.message || 'Error al procesar el pago';
            setErrorMessage(message);
            Alert.alert('Error', message);
        } finally {
            setProcessing(false);
        }
    };

    const getLicenseLabel = (license: string) => {
        const labels = {
            personal: 'Personal',
            business: 'Empresarial',
            unlimited: 'Ilimitada'
        };
        return labels[license] || license;
    };

    const total = getCartTotal();

    if (cartItems.length === 0 && cartLoaded) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color="#cbd5e1" />
                <Text style={styles.emptyTitle}>Carrito vacío</Text>
                <Text style={styles.emptyText}>No hay productos para procesar</Text>
                <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/models')}>
                    <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/(tabs)/cart')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#2563eb" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Finalizar compra</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Steps */}
            <View style={styles.stepsContainer}>
                {[
                    { number: 1, label: 'Info', icon: 'person-outline' },
                    { number: 2, label: 'Pago', icon: 'card-outline' },
                    { number: 3, label: 'Confirmar', icon: 'checkmark-circle-outline' }
                ].map((s) => (
                    <View key={s.number} style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            step > s.number && styles.stepCompleted,
                            step === s.number && styles.stepActive
                        ]}>
                            {step > s.number ? (
                                <Ionicons name="checkmark" size={20} color="#fff" />
                            ) : (
                                <Text style={[
                                    styles.stepNumber,
                                    step === s.number && styles.stepNumberActive
                                ]}>{s.number}</Text>
                            )}
                        </View>
                        <Text style={[
                            styles.stepLabel,
                            step === s.number && styles.stepLabelActive
                        ]}>{s.label}</Text>
                    </View>
                ))}
            </View>

            {/* Paso 1: Información */}
            {step === 1 && (
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="person-outline" size={20} /> Información de contacto
                    </Text>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Juan"
                                value={formData.firstName}
                                onChangeText={(v) => handleInputChange('firstName', v)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Apellido *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Pérez"
                                value={formData.lastName}
                                onChangeText={(v) => handleInputChange('lastName', v)}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="juan@email.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={formData.email}
                            onChangeText={(v) => handleInputChange('email', v)}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Teléfono</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="+52 123 456 7890"
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(v) => handleInputChange('phone', v)}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                        <Ionicons name="home-outline" size={20} /> Dirección de facturación
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Dirección *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Calle, número, colonia"
                            value={formData.address}
                            onChangeText={(v) => handleInputChange('address', v)}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 2 }]}>
                            <Text style={styles.label}>Ciudad</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ciudad"
                                value={formData.city}
                                onChangeText={(v) => handleInputChange('city', v)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>CP</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Código postal"
                                keyboardType="numeric"
                                value={formData.zipCode}
                                onChangeText={(v) => handleInputChange('zipCode', v)}
                            />
                        </View>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.cancelButton} onPress={() => router.replace('/(tabs)/models')}>
                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
                            <Text style={styles.nextButtonText}>Continuar al pago</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Paso 2: Método de pago */}
            {step === 2 && (
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="card-outline" size={20} /> Método de pago
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'paypal' && styles.paymentOptionSelected
                        ]}
                        onPress={() => setPaymentMethod('paypal')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <Text style={styles.paymentIcon}>💰</Text>
                            <View>
                                <Text style={styles.paymentName}>PayPal</Text>
                                <Text style={styles.paymentDesc}>Paga con tu cuenta PayPal o tarjeta</Text>
                            </View>
                        </View>
                        {paymentMethod === 'paypal' && (
                            <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                        )}
                    </TouchableOpacity>

                    <View style={styles.secureBadge}>
                        <Ionicons name="lock-closed" size={14} color="#94a3b8" />
                        <Text style={styles.secureText}>Tus datos están seguros (SSL)</Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.backButtonOutline} onPress={handlePrevStep}>
                            <Ionicons name="arrow-back" size={18} color="#2563eb" />
                            <Text style={styles.backButtonOutlineText}>Volver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.nextButton, paymentMethod !== 'paypal' && styles.disabledButton]}
                            onPress={handleNextStep}
                            disabled={paymentMethod !== 'paypal'}
                        >
                            <Text style={styles.nextButtonText}>Revisar pedido</Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Paso 3: Confirmación */}
            {step === 3 && (
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="checkmark-circle-outline" size={20} /> Confirmar pedido
                    </Text>

                    {cartItems.map((item, index) => (
                        <View key={`${item.model.id}-${item.license}`} style={styles.orderItem}>
                            <View style={styles.orderItemInfo}>
                                <Text style={styles.orderItemName}>{item.model.name}</Text>
                                <Text style={styles.orderItemMeta}>
                                    {getLicenseLabel(item.license)} × {item.quantity}
                                </Text>
                            </View>
                            <Text style={styles.orderItemPrice}>
                                ${(item.price * item.quantity).toFixed(2)} MXN
                            </Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total a pagar</Text>
                        <Text style={styles.totalValue}>${total.toFixed(2)} MXN</Text>
                    </View>

                    {errorMessage ? (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle" size={20} color="#ef4444" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.backButtonOutline} onPress={handlePrevStep}>
                            <Ionicons name="arrow-back" size={18} color="#2563eb" />
                            <Text style={styles.backButtonOutlineText}>Volver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.payButton, (processing || cartLoading) && styles.disabledButton]}
                            onPress={handleSubmitOrder}
                            disabled={processing || cartLoading}
                        >
                            {processing ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.payButtonText}>Pagar con PayPal</Text>
                                    <Ionicons name="logo-paypal" size={18} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Resumen lateral (siempre visible) */}
            <View style={styles.summaryCard}>
                <Text style={styles.summaryCardTitle}>
                    <Ionicons name="cube-outline" size={18} /> Resumen del pedido
                </Text>

                {cartItems.slice(0, 2).map((item, index) => (
                    <View key={index} style={styles.summaryCardItem}>
                        <Text style={styles.summaryCardItemName} numberOfLines={1}>
                            {item.model.name}
                        </Text>
                        <Text style={styles.summaryCardItemPrice}>
                            ${(item.price * item.quantity).toFixed(2)} MXN
                        </Text>
                    </View>
                ))}
                {cartItems.length > 2 && (
                    <Text style={styles.summaryCardMore}>+{cartItems.length - 2} más</Text>
                )}

                <View style={styles.summaryCardDivider} />

                <View style={styles.summaryCardTotal}>
                    <Text style={styles.summaryCardTotalLabel}>Total</Text>
                    <Text style={styles.summaryCardTotalValue}>${total.toFixed(2)} MXN</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f8fafc',
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginTop: 16,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 8,
        marginBottom: 24,
    },
    exploreButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 40,
    },
    exploreButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
        paddingVertical: 24,
        backgroundColor: '#fff',
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepActive: {
        backgroundColor: '#2563eb',
    },
    stepCompleted: {
        backgroundColor: '#10b981',
    },
    stepNumber: {
        fontSize: 16,
        fontWeight: '600',
        color: '#64748b',
    },
    stepNumberActive: {
        color: '#fff',
    },
    stepLabel: {
        fontSize: 12,
        color: '#64748b',
    },
    stepLabelActive: {
        color: '#2563eb',
        fontWeight: '500',
    },
    formSection: {
        backgroundColor: '#fff',
        margin: 16,
        marginBottom: 8,
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        paddingVertical: 14,
        borderRadius: 40,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#64748b',
        fontWeight: '500',
    },
    nextButton: {
        flex: 2,
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 40,
    },
    nextButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    backButtonOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 40,
    },
    backButtonOutlineText: {
        color: '#2563eb',
        fontWeight: '500',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderWidth: 2,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    paymentOptionSelected: {
        borderColor: '#2563eb',
        backgroundColor: '#eff6ff',
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentIcon: {
        fontSize: 28,
    },
    paymentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
    },
    paymentDesc: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    secureBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
        paddingVertical: 12,
    },
    secureText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    disabledButton: {
        opacity: 0.6,
    },
    payButton: {
        flex: 2,
        backgroundColor: '#2563eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 40,
    },
    payButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    orderItemInfo: {
        flex: 1,
    },
    orderItemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    orderItemMeta: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2563eb',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2563eb',
    },
    errorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
    },
    errorText: {
        flex: 1,
        fontSize: 13,
        color: '#ef4444',
    },
    summaryCard: {
        backgroundColor: '#fff',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 16,
    },
    summaryCardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    summaryCardItemName: {
        flex: 1,
        fontSize: 14,
        color: '#64748b',
    },
    summaryCardItemPrice: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    summaryCardMore: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 4,
        marginBottom: 12,
    },
    summaryCardDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    summaryCardTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryCardTotalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    summaryCardTotalValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2563eb',
    },
});