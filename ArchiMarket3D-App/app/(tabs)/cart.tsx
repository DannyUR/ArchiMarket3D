// app/(tabs)/cart.tsx
import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CartScreen() {
    const {
        cartItems,
        getCartTotal,
        getCartCount,
        removeFromCart,
        updateQuantity,
    } = useCart();

    const { isAuthenticated } = useAuth();

    const handleCheckout = () => {
        if (!isAuthenticated) {
            Alert.alert('Iniciar sesión', 'Debes iniciar sesión para continuar', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Iniciar sesión', onPress: () => router.push('/auth/login') }
            ]);
            return;
        }
        router.push('/checkout');
    };

    const getLicenseInfo = (license: string) => {
        switch(license) {
            case 'personal':
                return { name: 'Personal', icon: '👤', color: '#10b981' };
            case 'business':
                return { name: 'Empresarial', icon: '🏢', color: '#f59e0b' };
            case 'unlimited':
                return { name: 'Ilimitada', icon: '🌍', color: '#8b5cf6' };
            default:
                return { name: 'Personal', icon: '👤', color: '#10b981' };
        }
    };

    const renderCartItem = ({ item }: { item: any }) => {
        const licenseInfo = getLicenseInfo(item.license);
        const itemTotal = item.price * item.quantity;

        return (
            <View style={styles.cartItem}>
                <LinearGradient
                    colors={[licenseInfo.color + '15', licenseInfo.color + '05']}
                    style={styles.itemGradient}
                >
                    <View style={styles.itemHeader}>
                        <View style={styles.itemIcon}>
                            <Text style={styles.itemIconText}>📦</Text>
                        </View>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.model.name}</Text>
                            <View style={styles.licenseBadge}>
                                <Text style={styles.licenseBadgeIcon}>{licenseInfo.icon}</Text>
                                <Text style={[styles.licenseBadgeText, { color: licenseInfo.color }]}>
                                    {licenseInfo.name}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => removeFromCart(item.model.id, item.license, item.model.name)}
                            style={styles.removeIcon}
                        >
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.itemDetails}>
                        <View style={styles.priceInfo}>
                            <Text style={styles.priceLabel}>Precio unitario</Text>
                            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                        </View>

                        <View style={styles.quantitySection}>
                            <Text style={styles.quantityLabel}>Cantidad</Text>
                            <View style={styles.quantityControls}>
                                <TouchableOpacity
                                    onPress={() => updateQuantity(item.model.id, item.license, item.quantity - 1, item.model.name)}
                                    style={styles.quantityButton}
                                >
                                    <Ionicons name="remove" size={16} color="#4f46e5" />
                                </TouchableOpacity>

                                <Text style={styles.quantity}>{item.quantity}</Text>

                                <TouchableOpacity
                                    onPress={() => updateQuantity(item.model.id, item.license, item.quantity + 1, item.model.name)}
                                    style={styles.quantityButton}
                                >
                                    <Ionicons name="add" size={16} color="#4f46e5" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.subtotalSection}>
                            <Text style={styles.subtotalLabel}>Subtotal</Text>
                            <Text style={styles.itemSubtotal}>${itemTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </View>
        );
    };

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <LinearGradient
                    colors={['#f1f5f9', '#e2e8f0']}
                    style={styles.emptyIconBg}
                >
                    <Ionicons name="cart-outline" size={60} color="#94a3b8" />
                </LinearGradient>
                <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
                <Text style={styles.emptySubtitle}>
                    Explora nuestro catálogo de modelos 3D profesionales
                </Text>
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => router.push('/(tabs)/models')}
                >
                    <LinearGradient
                        colors={['#4f46e5', '#7c3aed']}
                        style={styles.exploreButtonGradient}
                    >
                        <Ionicons name="search-outline" size={18} color="#fff" />
                        <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const total = getCartTotal();
    const itemCount = getCartCount();

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Mi Carrito</Text>
                    <View style={styles.itemCountBadge}>
                        <Text style={styles.itemCountText}>{itemCount}</Text>
                    </View>
                </View>
                <Text style={styles.headerSubtitle}>
                    Revisa los modelos seleccionados
                </Text>
            </LinearGradient>

            <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => `${item.model.id}-${item.license}`}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            {/* Footer con resumen */}
            <View style={styles.footer}>
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Resumen de compra</Text>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal ({itemCount} items)</Text>
                        <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>IVA (16%)</Text>
                        <Text style={styles.summaryValue}>${(total * 0.16).toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.summaryRowTotal}>
                        <Text style={styles.summaryLabelTotal}>Total</Text>
                        <Text style={styles.summaryValueTotal}>${(total * 1.16).toFixed(2)}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                >
                    <LinearGradient
                        colors={['#4f46e5', '#7c3aed']}
                        style={styles.checkoutButtonGradient}
                    >
                        <Ionicons name="cart-outline" size={20} color="#fff" />
                        <Text style={styles.checkoutButtonText}>
                            Proceder al pago
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
    },
    itemCountBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    itemCountText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
    },
    list: {
        padding: 16,
        paddingBottom: 20,
    },
    // Item del carrito
    cartItem: {
        marginBottom: 14,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    itemGradient: {
        padding: 16,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    itemIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    itemIconText: {
        fontSize: 24,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 6,
    },
    licenseBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    licenseBadgeIcon: {
        fontSize: 12,
    },
    licenseBadgeText: {
        fontSize: 11,
        fontWeight: '500',
    },
    removeIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    priceInfo: {
        flex: 1,
    },
    priceLabel: {
        fontSize: 11,
        color: '#94a3b8',
        marginBottom: 2,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4f46e5',
    },
    quantitySection: {
        alignItems: 'center',
    },
    quantityLabel: {
        fontSize: 11,
        color: '#94a3b8',
        marginBottom: 4,
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: 24,
        paddingHorizontal: 4,
        paddingVertical: 4,
    },
    quantityButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    quantity: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
        marginHorizontal: 12,
        minWidth: 25,
        textAlign: 'center',
    },
    subtotalSection: {
        alignItems: 'flex-end',
    },
    subtotalLabel: {
        fontSize: 11,
        color: '#94a3b8',
        marginBottom: 2,
    },
    itemSubtotal: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1e293b',
    },
    // Footer
    footer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 10,
    },
    summaryCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 14,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748b',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
    },
    divider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    summaryRowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
    },
    summaryLabelTotal: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    summaryValueTotal: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4f46e5',
    },
    checkoutButton: {
        borderRadius: 40,
        overflow: 'hidden',
    },
    checkoutButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    // Empty state
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
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 28,
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
});