import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiShoppingCart,
    FiTrash2,
    FiPlus,
    FiMinus,
    FiArrowLeft,
    FiCheckCircle,
    FiCreditCard,
    FiShield,
    FiTruck
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { colors } from '../../styles/theme';
import { useNotification } from '../../context/NotificationContext';

const Cart = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
        checkout,
        loading
    } = useCart();

    const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, payment, success
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [orderComplete, setOrderComplete] = useState(false);
    const { showSuccess, showInfo } = useNotification();

    const handleCheckout = async () => {
        try {
            const result = await checkout();
            setCheckoutStep('success');
            setOrderComplete(true);
            showSuccess('✅ ¡Compra realizada con éxito!'); // 👈 NOTIFICACIÓN
            setTimeout(() => {
                navigate('/purchases');
            }, 3000);
        } catch (error) {
            console.error('Error en checkout:', error);
            showInfo('❌ Error al procesar la compra'); // 👈 NOTIFICACIÓN DE ERROR
        }
    };

    const getLicenseLabel = (license) => {
        const labels = {
            personal: 'Personal',
            business: 'Empresarial',
            unlimited: 'Ilimitada'
        };
        return labels[license] || license;
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: colors.primary,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1rem'
        },
        emptyCart: {
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px'
        },
        emptyIcon: {
            fontSize: '5rem',
            color: colors.primary,
            marginBottom: '1rem'
        },
        emptyTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1rem'
        },
        emptyText: {
            color: '#64748b',
            marginBottom: '2rem'
        },
        shopButton: {
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
        },
        cartGrid: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
        },
        cartItems: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        cartItem: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: '100px 1fr auto',
            gap: '1.5rem',
            alignItems: 'center'
        },
        itemImage: {
            width: '100px',
            height: '100px',
            backgroundColor: '#f1f5f9',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary
        },
        itemInfo: {
            flex: 1
        },
        itemName: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        itemMeta: {
            display: 'flex',
            gap: '1rem',
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '0.5rem'
        },
        itemLicense: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            display: 'inline-block'
        },
        itemPrice: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.primary
        },
        quantityControls: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem'
        },
        quantityButton: {
            width: '30px',
            height: '30px',
            borderRadius: '5px',
            border: `2px solid #e2e8f0`,
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        removeButton: {
            color: colors.danger,
            cursor: 'pointer',
            padding: '0.5rem',
            background: 'none',
            border: 'none'
        },
        // Resumen de compra
        summary: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            position: 'sticky',
            top: '2rem'
        },
        summaryTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1.5rem'
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            color: '#64748b'
        },
        summaryTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: `2px solid #e2e8f0`,
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark
        },
        checkoutButton: {
            width: '100%',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem'
        },
        securePayment: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            color: '#64748b',
            fontSize: '0.9rem'
        },
        // Checkout steps
        paymentSection: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        },
        stepTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1rem'
        },
        paymentMethods: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        paymentMethod: {
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        paymentMethodSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10'
        },
        successSection: {
            textAlign: 'center',
            padding: '3rem'
        },
        successIcon: {
            fontSize: '5rem',
            color: colors.success,
            marginBottom: '1rem'
        },
        successTitle: {
            fontSize: '2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1rem'
        },
        successText: {
            color: '#64748b',
            marginBottom: '2rem'
        }
    };

    if (checkoutStep === 'success') {
        return (
            <div style={styles.container}>
                <motion.div
                    style={styles.successSection}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <FiCheckCircle style={styles.successIcon} />
                    <h1 style={styles.successTitle}>¡Compra exitosa!</h1>
                    <p style={styles.successText}>
                        Serás redirigido a tus compras en unos segundos...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div style={styles.container}>
                <motion.div
                    style={styles.emptyCart}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiShoppingCart style={styles.emptyIcon} />
                    <h2 style={styles.emptyTitle}>Tu carrito está vacío</h2>
                    <p style={styles.emptyText}>
                        ¿No sabes qué comprar? ¡Miles de modelos te esperan!
                    </p>
                    <button
                        style={styles.shopButton}
                        onClick={() => navigate('/models')}
                    >
                        Explorar modelos
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button
                    style={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    <FiArrowLeft /> Seguir comprando
                </button>
                <h1 style={styles.title}>
                    <FiShoppingCart /> Carrito ({getCartCount()} items)
                </h1>
            </div>

            <div style={styles.cartGrid}>
                {/* Lista de items */}
                <div style={styles.cartItems}>
                    <AnimatePresence>
                        {cartItems.map((item) => (
                            <motion.div
                                key={`${item.model.id}-${item.license}`}
                                style={styles.cartItem}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                layout
                            >
                                <div style={styles.itemImage}>
                                    <FiShoppingCart size={32} />
                                </div>

                                <div style={styles.itemInfo}>
                                    <h3 style={styles.itemName}>{item.model.name}</h3>
                                    <div style={styles.itemMeta}>
                                        <span>Formato: {item.model.format}</span>
                                        <span>{item.model.size_mb} MB</span>
                                    </div>
                                    <div style={styles.itemLicense}>
                                        {getLicenseLabel(item.license)}
                                    </div>

                                    <div style={styles.quantityControls}>
                                        <button
                                            style={styles.quantityButton}
                                            onClick={() => updateQuantity(
                                                item.model.id,
                                                item.license,
                                                item.quantity - 1
                                            )}
                                        >
                                            <FiMinus />
                                        </button>
                                        <span>{item.quantity}</span>
                                        <button
                                            style={styles.quantityButton}
                                            onClick={() => updateQuantity(
                                                item.model.id,
                                                item.license,
                                                item.quantity + 1
                                            )}
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={styles.itemPrice}>
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                    <button
                                        style={styles.removeButton}
                                        onClick={() => removeFromCart(
                                            item.model.id,
                                            item.license
                                        )}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Resumen de compra */}
                <div style={styles.summary}>
                    <h3 style={styles.summaryTitle}>Resumen de compra</h3>

                    <div style={styles.summaryRow}>
                        <span>Subtotal ({getCartCount()} items)</span>
                        <span>${getCartTotal().toFixed(2)}</span>
                    </div>

                    <div style={styles.summaryRow}>
                        <span>Envío</span>
                        <span>Gratis</span>
                    </div>

                    <div style={styles.summaryRow}>
                        <span>Impuestos</span>
                        <span>${(getCartTotal() * 0.16).toFixed(2)}</span>
                    </div>

                    <div style={styles.summaryTotal}>
                        <span>Total</span>
                        <span>${(getCartTotal() * 1.16).toFixed(2)}</span>
                    </div>

                    <button
                        style={styles.checkoutButton}
                        onClick={() => navigate('/checkout')}
                    >
                        <FiCreditCard /> Proceder al pago
                    </button>

                    <div style={styles.securePayment}>
                        <FiShield /> Pago seguro
                        <FiTruck /> Entrega inmediata
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;