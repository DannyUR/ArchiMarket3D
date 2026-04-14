// app/(tabs)/cart.tsx
import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function CartScreen() {
    const {
        cartItems,
        getCartTotal,
        getCartCount,
        removeFromCart,
        updateQuantity,
        loading
    } = useCart();

    const { isAuthenticated } = useAuth();

    // En app/(tabs)/cart.tsx, modificar handleCheckout:
    const handleCheckout = () => {
        if (!isAuthenticated) {
            Alert.alert('Iniciar sesión', 'Debes iniciar sesión para continuar', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Iniciar sesión', onPress: () => router.push('/auth/login') }
            ]);
            return;
        }
        router.push('/checkout'); // ✅ Redirige al checkout
    };

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.model.name}</Text>
                <Text style={styles.itemLicense}>
                    Licencia: {item.license === 'personal' ? 'Personal' : item.license === 'business' ? 'Empresarial' : 'Ilimitada'}
                </Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)} MXN c/u</Text>
            </View>

            <View style={styles.itemActions}>
                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        onPress={() => updateQuantity(item.model.id, item.license, item.quantity - 1, item.model.name)}
                        style={styles.quantityButton}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantity}>{item.quantity}</Text>

                    <TouchableOpacity
                        onPress={() => updateQuantity(item.model.id, item.license, item.quantity + 1, item.model.name)}
                        style={styles.quantityButton}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => removeFromCart(item.model.id, item.license, item.model.name)}
                    style={styles.removeButton}
                >
                    <Text style={styles.removeButtonText}>Eliminar</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.itemSubtotal}>
                Subtotal: ${(item.price * item.quantity).toFixed(2)} MXN
            </Text>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <SafeAreaView style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyText}>Tu carrito está vacío</Text>
                <Text style={styles.emptySubtext}>
                    Explora nuestro catálogo de modelos 3D
                </Text>
                <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() => router.push('/(tabs)/explore')}
                >
                    <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={cartItems}
                renderItem={renderCartItem}
                keyExtractor={(item) => `${item.model.id}-${item.license}`}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalAmount}>${getCartTotal().toFixed(2)} MXN</Text>
                </View>

                <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                >
                    <Text style={styles.checkoutButtonText}>
                        Proceder al pago ({getCartCount()} items)
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 16,
    },
    cartItem: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    itemInfo: {
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    itemLicense: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 4,
        fontWeight: '500',
    },
    itemActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    quantity: {
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 16,
        minWidth: 30,
        textAlign: 'center',
    },
    removeButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    removeButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    itemSubtotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'right',
    },
    footer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 5,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    totalAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    checkoutButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        backgroundColor: '#999',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#f5f5f5',
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    exploreButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    exploreButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});