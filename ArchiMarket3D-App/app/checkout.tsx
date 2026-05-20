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

    // Cargar datos del usuario
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
            const items = cartItems.map(item => ({
                model_id: item.model.id,
                license_type: item.license,
                quantity: item.quantity,
                price: item.price
            }));

            const backendOrigin = api.defaults.baseURL?.replace(/\/api\/?$/, '') || 'http://localhost:8000';
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
                return_url: Platform.OS === 'web'
                    ? `${backendOrigin}/api/shopping/execute-paypal-payment`
                    : 'archimarket3d://purchases/success',
                cancel_url: Platform.OS === 'web'
                    ? `${window.location.origin}/checkout`
                    : 'archimarket3d://checkout'
            });

            const { approval_url } = response.data;

            if (Platform.OS === 'web') {
                window.location.href = approval_url;
            } else {
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

    const subtotal = getCartTotal();
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    if (cartItems.length === 0 && cartLoaded) {
        return (
            <View style={styles.emptyContainer}>
                <LinearGradient
                    colors={['#f1f5f9', '#e2e8f0']}
                    style={styles.emptyIconBg}
                >
                    <Ionicons name="cart-outline" size={60} color="#94a3b8" />
                </LinearGradient>
                <Text style={styles.emptyTitle}>Carrito vacío</Text>
                <Text style={styles.emptyText}>No hay productos para procesar</Text>
                <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/models')}>
                    <LinearGradient
                        colors={['#4f46e5', '#7c3aed']}
                        style={styles.exploreButtonGradient}
                    >
                        <Ionicons name="search-outline" size={18} color="#fff" />
                        <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header con gradiente */}
            <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.replace('/(tabs)/cart')} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Finalizar compra</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSubtitle}>Completa tus datos para continuar</Text>
            </LinearGradient>

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
                                <Ionicons name="checkmark" size={18} color="#fff" />
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
                        <Ionicons name="person-outline" size={20} color="#4f46e5" /> Información de contacto
                    </Text>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Nombre *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Juan"
                                placeholderTextColor="#94a3b8"
                                value={formData.firstName}
                                onChangeText={(v) => handleInputChange('firstName', v)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>Apellido *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Pérez"
                                placeholderTextColor="#94a3b8"
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
                            placeholderTextColor="#94a3b8"
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
                            placeholderTextColor="#94a3b8"
                            keyboardType="phone-pad"
                            value={formData.phone}
                            onChangeText={(v) => handleInputChange('phone', v)}
                        />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                        <Ionicons name="home-outline" size={20} color="#4f46e5" /> Dirección de facturación
                    </Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Dirección *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Calle, número, colonia"
                            placeholderTextColor="#94a3b8"
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
                                placeholderTextColor="#94a3b8"
                                value={formData.city}
                                onChangeText={(v) => handleInputChange('city', v)}
                            />
                        </View>
                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={styles.label}>CP</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Código postal"
                                placeholderTextColor="#94a3b8"
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
                            <LinearGradient
                                colors={['#4f46e5', '#7c3aed']}
                                style={styles.nextButtonGradient}
                            >
                                <Text style={styles.nextButtonText}>Continuar al pago</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Paso 2: Método de pago */}
            {step === 2 && (
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="card-outline" size={20} color="#4f46e5" /> Método de pago
                    </Text>

                    {/* PayPal - ACTIVO */}
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            paymentMethod === 'paypal' && styles.paymentOptionSelected
                        ]}
                        onPress={() => setPaymentMethod('paypal')}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <View style={styles.paymentIconContainer}>
                                <Text style={styles.paymentIcon}>💰</Text>
                            </View>
                            <View>
                                <Text style={styles.paymentName}>PayPal</Text>
                                <Text style={styles.paymentDesc}>Paga con tu cuenta PayPal o tarjeta</Text>
                            </View>
                        </View>
                        <View style={styles.paymentStatus}>
                            <View style={styles.paymentBadgeActive}>
                                <Text style={styles.paymentBadgeText}>Disponible</Text>
                            </View>
                            {paymentMethod === 'paypal' && (
                                <Ionicons name="checkmark-circle" size={22} color="#10b981" style={styles.paymentCheck} />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Tarjeta - PRÓXIMAMENTE */}
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            styles.paymentOptionDisabled
                        ]}
                        onPress={() => setShowPaymentModal(true)}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <View style={[styles.paymentIconContainer, styles.paymentIconDisabled]}>
                                <Text style={styles.paymentIcon}>💳</Text>
                            </View>
                            <View>
                                <Text style={styles.paymentName}>Tarjeta de crédito/débito</Text>
                                <Text style={styles.paymentDesc}>Visa, Mastercard, American Express</Text>
                            </View>
                        </View>
                        <View style={styles.paymentStatus}>
                            <View style={styles.paymentBadgeSoon}>
                                <Text style={styles.paymentBadgeSoonText}>Próximamente</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    {/* Transferencia - PRÓXIMAMENTE */}
                    <TouchableOpacity
                        style={[
                            styles.paymentOption,
                            styles.paymentOptionDisabled
                        ]}
                        onPress={() => setShowPaymentModal(true)}
                    >
                        <View style={styles.paymentOptionLeft}>
                            <View style={[styles.paymentIconContainer, styles.paymentIconDisabled]}>
                                <Text style={styles.paymentIcon}>🏦</Text>
                            </View>
                            <View>
                                <Text style={styles.paymentName}>Transferencia bancaria</Text>
                                <Text style={styles.paymentDesc}>SPEI / Transferencia directa</Text>
                            </View>
                        </View>
                        <View style={styles.paymentStatus}>
                            <View style={styles.paymentBadgeSoon}>
                                <Text style={styles.paymentBadgeSoonText}>Próximamente</Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={styles.secureBadge}>
                        <Ionicons name="shield-checkmark" size={16} color="#4f46e5" />
                        <Text style={styles.secureText}>Tus datos están seguros (SSL)</Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.backButtonOutline} onPress={handlePrevStep}>
                            <Ionicons name="arrow-back" size={18} color="#4f46e5" />
                            <Text style={styles.backButtonOutlineText}>Volver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.nextButton, paymentMethod !== 'paypal' && styles.disabledButton]}
                            onPress={handleNextStep}
                            disabled={paymentMethod !== 'paypal'}
                        >
                            <LinearGradient
                                colors={paymentMethod === 'paypal' ? ['#4f46e5', '#7c3aed'] : ['#cbd5e1', '#cbd5e1']}
                                style={styles.nextButtonGradient}
                            >
                                <Text style={styles.nextButtonText}>Revisar pedido</Text>
                                <Ionicons name="arrow-forward" size={18} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Paso 3: Confirmación */}
            {step === 3 && (
                <View style={styles.formSection}>
                    <Text style={styles.sectionTitle}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#4f46e5" /> Confirmar pedido
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
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.totalsContainer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>IVA (16%)</Text>
                            <Text style={styles.totalValue}>${iva.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalRowTotal}>
                            <Text style={styles.totalLabelTotal}>Total</Text>
                            <Text style={styles.totalValueTotal}>${total.toFixed(2)} MXN</Text>
                        </View>
                    </View>

                    {errorMessage ? (
                        <View style={styles.errorBox}>
                            <Ionicons name="alert-circle" size={20} color="#ef4444" />
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        </View>
                    ) : null}

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.backButtonOutline} onPress={handlePrevStep}>
                            <Ionicons name="arrow-back" size={18} color="#4f46e5" />
                            <Text style={styles.backButtonOutlineText}>Volver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.payButton, (processing || cartLoading) && styles.disabledButton]}
                            onPress={handleSubmitOrder}
                            disabled={processing || cartLoading}
                        >
                            <LinearGradient
                                colors={['#4f46e5', '#7c3aed']}
                                style={styles.payButtonGradient}
                            >
                                {processing ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <>
                                        <Text style={styles.payButtonText}>Pagar con PayPal</Text>
                                        <Ionicons name="logo-paypal" size={18} color="#fff" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Resumen lateral */}
            <View style={styles.summaryCard}>
                <LinearGradient
                    colors={['#f8fafc', '#f1f5f9']}
                    style={styles.summaryGradient}
                >
                    <Text style={styles.summaryCardTitle}>
                        <Ionicons name="cube-outline" size={18} color="#4f46e5" /> Resumen del pedido
                    </Text>

                    {cartItems.slice(0, 2).map((item, index) => (
                        <View key={index} style={styles.summaryCardItem}>
                            <Text style={styles.summaryCardItemName} numberOfLines={1}>
                                {item.model.name}
                            </Text>
                            <Text style={styles.summaryCardItemPrice}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </Text>
                        </View>
                    ))}
                    {cartItems.length > 2 && (
                        <Text style={styles.summaryCardMore}>+{cartItems.length - 2} más</Text>
                    )}

                    <View style={styles.summaryCardDivider} />

                    <View style={styles.summaryCardTotal}>
                        <Text style={styles.summaryCardTotalLabel}>Total a pagar</Text>
                        <Text style={styles.summaryCardTotalValue}>${total.toFixed(2)} MXN</Text>
                    </View>
                </LinearGradient>
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
    emptyIconBg: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
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
        borderRadius: 40,
        overflow: 'hidden',
    },
    exploreButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 28,
        paddingVertical: 14,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Header
    header: {
        paddingTop: 55,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.85)',
        marginLeft: 8,
    },
    // Steps
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 40,
        paddingVertical: 24,
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    stepItem: {
        alignItems: 'center',
    },
    stepCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#e2e8f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepActive: {
        backgroundColor: '#4f46e5',
    },
    stepCompleted: {
        backgroundColor: '#10b981',
    },
    stepNumber: {
        fontSize: 15,
        fontWeight: '600',
        color: '#64748b',
    },
    stepNumberActive: {
        color: '#fff',
    },
    stepLabel: {
        fontSize: 11,
        color: '#64748b',
    },
    stepLabelActive: {
        color: '#4f46e5',
        fontWeight: '500',
    },
    // Formulario
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
        fontSize: 15,
        color: '#1e293b',
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
        borderRadius: 40,
        overflow: 'hidden',
    },
    nextButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
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
        borderColor: '#4f46e5',
        paddingVertical: 14,
        borderRadius: 40,
    },
    backButtonOutlineText: {
        color: '#4f46e5',
        fontWeight: '500',
    },
    // Métodos de pago
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
        borderColor: '#4f46e5',
        backgroundColor: '#e0e7ff',
    },
    paymentOptionDisabled: {
        opacity: 0.7,
    },
    paymentOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    paymentIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paymentIconDisabled: {
        backgroundColor: '#e2e8f0',
    },
    paymentIcon: {
        fontSize: 24,
    },
    paymentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    paymentDesc: {
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
    },
    paymentStatus: {
        alignItems: 'flex-end',
        gap: 6,
    },
    paymentBadgeActive: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    paymentBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#10b981',
    },
    paymentBadgeSoon: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    paymentBadgeSoonText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#d97706',
    },
    paymentCheck: {
        marginTop: 4,
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
        color: '#64748b',
    },
    disabledButton: {
        opacity: 0.5,
    },
    // Confirmación
    payButton: {
        flex: 2,
        borderRadius: 40,
        overflow: 'hidden',
    },
    payButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
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
        borderBottomColor: '#f1f5f9',
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
        fontSize: 11,
        color: '#64748b',
        marginTop: 2,
    },
    orderItemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4f46e5',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 16,
    },
    totalsContainer: {
        marginTop: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    totalLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    totalValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    totalRowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    totalLabelTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    totalValueTotal: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4f46e5',
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
    // Resumen
    summaryCard: {
        margin: 16,
        marginTop: 8,
        marginBottom: 30,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryGradient: {
        padding: 20,
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
        color: '#4f46e5',
    },
});