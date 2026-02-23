import React, { useState, useEffect } from 'react';
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
    FiTruck,
    FiPackage,
    FiDownload,
    FiTag,
    FiPercent,
    FiGift,
    FiLock
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
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

    const [checkoutStep, setCheckoutStep] = useState('cart');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [orderComplete, setOrderComplete] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const { showSuccess, showInfo } = useNotification();

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleCheckout = async () => {
        try {
            const result = await checkout();
            setCheckoutStep('success');
            setOrderComplete(true);
            showSuccess('✅ ¡Compra realizada con éxito!');
            setTimeout(() => {
                navigate('/purchases');
            }, 3000);
        } catch (error) {
            console.error('Error en checkout:', error);
            showInfo('❌ Error al procesar la compra');
        }
    };

    const handleApplyPromo = () => {
        if (promoCode.toUpperCase() === 'BIENVENIDO10') {
            setPromoApplied(true);
            showSuccess('🎉 Código aplicado: 10% de descuento');
        } else {
            showInfo('❌ Código no válido');
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

    const getLicenseColor = (license) => {
        const colors = {
            personal: '#3b82f6',
            business: '#8b5cf6',
            unlimited: '#10b981'
        };
        return colors[license] || '#64748b';
    };

    const subtotal = getCartTotal();
    const tax = subtotal * 0.16;
    const discount = promoApplied ? subtotal * 0.1 : 0;
    const total = subtotal + tax - discount;

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh'
        },
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginBottom: '2rem'
        },
        titleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: 0
        },
        titleIcon: {
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '2.5rem'
        },
        itemCount: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.5rem 1.5rem',
            borderRadius: '30px',
            fontSize: '0.95rem',
            fontWeight: '600'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: colors.primary,
            cursor: 'pointer',
            border: 'none',
            background: 'none',
            fontSize: '1rem',
            padding: '0.8rem 1.5rem',
            borderRadius: '30px',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.primary + '10'
            }
        },
        emptyCart: {
            textAlign: 'center',
            padding: isMobile ? '4rem 1.5rem' : '5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '32px',
            border: '1px solid #f0f0f0',
            maxWidth: '600px',
            margin: '0 auto'
        },
        emptyIcon: {
            fontSize: '5rem',
            color: colors.primary + '40',
            marginBottom: '1rem'
        },
        emptyTitle: {
            fontSize: '1.8rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1rem'
        },
        emptyText: {
            color: '#64748b',
            marginBottom: '2rem',
            fontSize: '1rem',
            lineHeight: '1.6'
        },
        shopButton: {
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: '1rem 2.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: `0 8px 20px ${colors.primary}30`,
            transition: 'all 0.2s'
        },
        cartGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: isMobile ? '1.5rem' : '2rem'
        },
        cartItems: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        cartItem: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: isMobile ? '1.2rem' : '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '100px 1fr auto',
            gap: isMobile ? '1rem' : '1.5rem',
            alignItems: 'center',
            transition: 'all 0.2s'
        },
        itemImage: {
            width: isMobile ? '80px' : '100px',
            height: isMobile ? '80px' : '100px',
            backgroundColor: colors.primary + '10',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '2.5rem'
        },
        itemInfo: {
            flex: 1
        },
        itemHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
        },
        itemName: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            margin: 0
        },
        itemPrice: {
            fontSize: isMobile ? '1.2rem' : '1.3rem',
            fontWeight: '700',
            color: colors.primary
        },
        itemMeta: {
            display: 'flex',
            gap: '1rem',
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '0.75rem',
            flexWrap: 'wrap'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: '#f8fafc',
            padding: '0.2rem 0.8rem',
            borderRadius: '20px'
        },
        itemLicense: {
            display: 'inline-block',
            padding: '0.3rem 1rem',
            backgroundColor: (license) => `${getLicenseColor(license)}10`,
            color: (license) => getLicenseColor(license),
            borderRadius: '30px',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '0.75rem'
        },
        quantityControls: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            backgroundColor: '#f8fafc',
            padding: '0.3rem',
            borderRadius: '30px',
            width: 'fit-content'
        },
        quantityButton: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            transition: 'all 0.2s'
        },
        quantityValue: {
            minWidth: '30px',
            textAlign: 'center',
            fontWeight: '600',
            color: colors.dark
        },
        removeButton: {
            color: colors.danger,
            cursor: 'pointer',
            padding: '0.5rem',
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            transition: 'all 0.2s'
        },
        // Resumen de compra
        summary: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            position: isMobile ? 'static' : 'sticky',
            top: isMobile ? 'auto' : '100px',
            height: 'fit-content'
        },
        summaryTitle: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        promoSection: {
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '16px'
        },
        promoTitle: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        promoInput: {
            display: 'flex',
            gap: '0.5rem'
        },
        promoField: {
            flex: 1,
            padding: '0.8rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '12px',
            fontSize: '0.9rem',
            outline: 'none',
            transition: 'all 0.2s'
        },
        promoButton: {
            padding: '0.8rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
        },
        promoApplied: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: colors.success + '10',
            color: colors.success,
            borderRadius: '12px',
            fontSize: '0.9rem'
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            color: '#64748b',
            fontSize: isMobile ? '0.95rem' : '1rem'
        },
        summaryTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: `2px solid #f0f0f0`,
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '700',
            color: colors.dark
        },
        checkoutButton: {
            width: '100%',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: isMobile ? '1rem' : '1.2rem',
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem',
            boxShadow: `0 8px 20px ${colors.primary}30`,
            transition: 'all 0.2s'
        },
        securePayment: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            marginTop: '1.5rem',
            color: '#64748b',
            fontSize: '0.9rem',
            flexWrap: 'wrap'
        },
        secureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
        },
        successSection: {
            textAlign: 'center',
            padding: isMobile ? '3rem 1rem' : '4rem'
        },
        successIcon: {
            fontSize: '5rem',
            color: colors.success,
            marginBottom: '1rem'
        },
        successTitle: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem'
        },
        successText: {
            color: '#64748b',
            marginBottom: '2rem',
            fontSize: '1.1rem'
        },
        loading: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1.5rem'
        },
        spinner: {
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.primary}20`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
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

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={styles.spinner} />
                    <p style={{ color: colors.primary, fontSize: '1.1rem' }}>Procesando carrito...</p>
                </div>
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
                        ¿No sabes qué comprar? Miles de modelos profesionales te esperan para llevar tus proyectos al siguiente nivel.
                    </p>
                    <motion.button
                        style={styles.shopButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/models')}
                    >
                        Explorar modelos
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <motion.button
                        style={styles.backButton}
                        whileHover={{ x: -5, backgroundColor: colors.primary + '10' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                    >
                        <FiArrowLeft /> Seguir comprando
                    </motion.button>
                </div>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>
                        <FiShoppingCart style={styles.titleIcon} />
                        Carrito
                    </h1>
                    <span style={styles.itemCount}>{getCartCount()} {getCartCount() === 1 ? 'item' : 'items'}</span>
                </div>
            </div>

            {/* Contenido principal */}
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
                                whileHover={{ y: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
                            >
                                <div style={styles.itemImage}>
                                    <HiOutlineCube />
                                </div>

                                <div style={styles.itemInfo}>
                                    <div style={styles.itemHeader}>
                                        <h3 style={styles.itemName}>{item.model.name}</h3>
                                        <span style={styles.itemPrice}>
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>

                                    <div style={styles.itemMeta}>
                                        <span style={styles.metaItem}>
                                            <FiPackage /> {item.model.format}
                                        </span>
                                        <span style={styles.metaItem}>
                                            <FiDownload /> {item.model.size_mb} MB
                                        </span>
                                    </div>

                                    <div style={{
                                        ...styles.itemLicense,
                                        backgroundColor: `${getLicenseColor(item.license)}10`,
                                        color: getLicenseColor(item.license)
                                    }}>
                                        Licencia {getLicenseLabel(item.license)}
                                    </div>

                                    <div style={styles.quantityControls}>
                                        <motion.button
                                            style={styles.quantityButton}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => updateQuantity(
                                                item.model.id,
                                                item.license,
                                                item.quantity - 1
                                            )}
                                        >
                                            <FiMinus />
                                        </motion.button>
                                        <span style={styles.quantityValue}>{item.quantity}</span>
                                        <motion.button
                                            style={styles.quantityButton}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => updateQuantity(
                                                item.model.id,
                                                item.license,
                                                item.quantity + 1
                                            )}
                                        >
                                            <FiPlus />
                                        </motion.button>
                                    </div>
                                </div>

                                <motion.button
                                    style={styles.removeButton}
                                    whileHover={{ scale: 1.1, color: colors.danger }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeFromCart(
                                        item.model.id,
                                        item.license
                                    )}
                                >
                                    <FiTrash2 />
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Resumen de compra */}
                <motion.div
                    style={styles.summary}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 style={styles.summaryTitle}>
                        <FiCreditCard /> Resumen de compra
                    </h3>

                    {/* Código promocional */}
                    <div style={styles.promoSection}>
                        <div style={styles.promoTitle}>
                            <FiGift /> ¿Tienes un código?
                        </div>
                        {!promoApplied ? (
                            <div style={styles.promoInput}>
                                <input
                                    type="text"
                                    placeholder="Ingresa tu código"
                                    style={styles.promoField}
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <motion.button
                                    style={styles.promoButton}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleApplyPromo}
                                >
                                    Aplicar
                                </motion.button>
                            </div>
                        ) : (
                            <div style={styles.promoApplied}>
                                <FiCheckCircle /> Código aplicado: 10% de descuento
                            </div>
                        )}
                    </div>

                    {/* Detalles del total */}
                    <div style={styles.summaryRow}>
                        <span>Subtotal ({getCartCount()} items)</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {promoApplied && (
                        <div style={{ ...styles.summaryRow, color: colors.success }}>
                            <span>Descuento (10%)</span>
                            <span>-${discount.toFixed(2)}</span>
                        </div>
                    )}

                    <div style={styles.summaryRow}>
                        <span>Impuestos (16%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>

                    <div style={styles.summaryRow}>
                        <span>Envío</span>
                        <span style={{ color: colors.success }}>Gratis</span>
                    </div>

                    <div style={styles.summaryTotal}>
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <motion.button
                        style={styles.checkoutButton}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/checkout')}
                    >
                        <FiCreditCard /> Proceder al pago
                    </motion.button>

                    <div style={styles.securePayment}>
                        <span style={styles.secureItem}>
                            <FiLock /> Pago seguro
                        </span>
                        <span style={styles.secureItem}>
                            <FiShield /> Compra protegida
                        </span>
                        <span style={styles.secureItem}>
                            <FiTruck /> Descarga inmediata
                        </span>
                    </div>
                </motion.div>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Cart;