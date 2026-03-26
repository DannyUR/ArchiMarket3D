import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiCreditCard,
    FiShield,
    FiCheckCircle,
    FiLock,
    FiUser,
    FiMapPin,
    FiPhone,
    FiMail,
    FiInfo,
    FiPackage,
    FiDollarSign,
    FiCalendar,
    FiHome,
    FiBuilding,
    FiSmartphone,
    FiAtSign
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styles/theme';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, checkout, loading, cartLoaded } = useCart();
    const { showError, showInfo } = useNotification();
    const [step, setStep] = useState(1);
    const [orderComplete, setOrderComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('paypal');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Validar que el carrito no esté vacío
    useEffect(() => {
        if (cartLoaded && cartItems.length === 0) {
            showError('⚠️ El carrito está vacío. Selecciona productos antes de hacer checkout.');
            setTimeout(() => navigate('/cart'), 2000);
        }
    }, [cartLoaded, cartItems.length, navigate, showError]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleNextStep = () => {
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setStep(step - 1);
    };

    const token = localStorage.getItem('token');
    console.log('Token existe:', !!token);
    if (!token) {
        navigate('/login');
        return;
    }

    const handleSubmitOrder = async () => {
        setProcessing(true);
        setErrorMessage('');

        try {
            const result = await checkout();
            console.log('Resultado del checkout:', result);
        } catch (error) {
            console.error('Error en checkout:', error);
            setErrorMessage(
                error.response?.data?.message ||
                error.message ||
                'Error al procesar el pago. Intenta de nuevo.'
            );
        } finally {
            setProcessing(false);
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

    const subtotal = getCartTotal();
    const tax = subtotal * 0.16;
    const total = subtotal + tax;

    // Métodos de pago disponibles
    const paymentMethods = [
        {
            id: 'paypal',
            name: 'PayPal',
            icon: '💳',
            description: 'Paga con tu cuenta PayPal o tarjeta',
            available: true,
            color: '#003087'
        },
        {
            id: 'stripe',
            name: 'Tarjeta de crédito/débito',
            icon: '💳',
            description: 'Visa, Mastercard, American Express',
            available: false,
            color: '#635BFF',
            comingSoon: true
        },
        {
            id: 'mercadopago',
            name: 'MercadoPago',
            icon: '🪙',
            description: 'Paga con saldo, Oxxo o transferencia',
            available: false,
            color: '#00B1EA',
            comingSoon: true
        },
        {
            id: 'bank',
            name: 'Transferencia bancaria',
            icon: '🏦',
            description: 'Para empresas (requiere validación)',
            available: false,
            color: '#2E7D32',
            comingSoon: true
        }
    ];

    // Estilos para métodos de pago
    const paymentMethodStyles = {
        container: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1rem',
            marginBottom: '2rem',
            marginTop: '1rem'
        },
        card: {
            padding: '1.5rem',
            borderRadius: '16px',
            border: '2px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.2s',
            position: 'relative',
            backgroundColor: 'white'
        },
        cardSelected: {
            borderColor: colors.primary,
            boxShadow: `0 0 0 3px ${colors.primary}20`
        },
        cardDisabled: {
            opacity: 0.7,
            cursor: 'not-allowed',
            backgroundColor: '#f8fafc'
        },
        comingSoonBadge: {
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            backgroundColor: '#FFE5E5',
            color: '#FF4444',
            padding: '0.25rem 0.75rem',
            borderRadius: '30px',
            fontSize: '0.7rem',
            fontWeight: '600',
            border: '1px solid #FF4444'
        },
        icon: {
            fontSize: '2rem',
            marginBottom: '0.5rem'
        },
        name: {
            fontWeight: '600',
            fontSize: '1rem',
            marginBottom: '0.25rem',
            color: colors.dark
        },
        description: {
            fontSize: '0.85rem',
            color: '#64748b'
        }
    };

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
        headerLeft: {
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
            fontSize: '1rem',
            padding: '0.8rem 1.5rem',
            borderRadius: '30px',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.primary + '10'
            }
        },
        headerRight: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            margin: 0
        },
        steps: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            position: 'relative',
            maxWidth: '800px',
            margin: '0 auto 3rem auto'
        },
        stepLine: {
            position: 'absolute',
            top: '30px',
            left: '10%',
            right: '10%',
            height: '2px',
            backgroundColor: '#e2e8f0',
            zIndex: 1
        },
        stepItem: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
            zIndex: 2,
            backgroundColor: 'white',
            padding: '0 1rem',
            position: 'relative'
        },
        stepNumber: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            color: colors.dark,
            fontSize: '1.2rem',
            transition: 'all 0.3s'
        },
        stepNumberActive: {
            backgroundColor: colors.primary,
            color: 'white',
            boxShadow: `0 8px 20px ${colors.primary}30`
        },
        stepNumberCompleted: {
            backgroundColor: colors.success,
            color: 'white'
        },
        stepLabel: {
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: '500'
        },
        stepLabelActive: {
            color: colors.primary,
            fontWeight: '600'
        },
        content: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: isMobile ? '1.5rem' : '2rem'
        },
        // Formulario
        formSection: {
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0'
        },
        formTitle: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.dark,
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        inputIcon: {
            position: 'absolute',
            left: '1rem',
            color: '#94a3b8',
            fontSize: '1.2rem',
            zIndex: 1
        },
        input: {
            width: '100%',
            padding: '1rem 1rem 1rem 3rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '16px',
            fontSize: '1rem',
            transition: 'all 0.2s',
            outline: 'none',
            backgroundColor: '#f8fafc',
            ':focus': {
                borderColor: colors.primary,
                boxShadow: `0 0 0 4px ${colors.primary}20`
            }
        },
        // Botones
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            flexDirection: isMobile ? 'column' : 'row'
        },
        primaryButton: {
            flex: 1,
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: `0 8px 20px ${colors.primary}30`,
            transition: 'all 0.2s'
        },
        secondaryButton: {
            flex: 1,
            backgroundColor: 'white',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '30px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s'
        },
        // Resumen
        summary: {
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            position: isMobile ? 'static' : 'sticky',
            top: '100px',
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
        summaryItem: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid #f0f0f0`,
            gap: '1rem'
        },
        summaryItemDetails: {
            flex: 1
        },
        summaryItemName: {
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        summaryItemMeta: {
            fontSize: '0.85rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        summaryItemPrice: {
            fontWeight: '700',
            color: colors.primary,
            fontSize: '1.1rem'
        },
        summaryRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            color: '#64748b'
        },
        summaryTotal: {
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: `2px solid #f0f0f0`,
            fontSize: '1.2rem',
            fontWeight: '700',
            color: colors.dark
        },
        secureBadge: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '1.5rem',
            color: '#64748b',
            fontSize: '0.9rem',
            flexWrap: 'wrap'
        },
        // Success
        successSection: {
            textAlign: 'center',
            padding: isMobile ? '3rem 1rem' : '4rem',
            backgroundColor: 'white',
            borderRadius: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            maxWidth: '600px',
            margin: '0 auto'
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
        // Loading
        spinner: {
            width: '20px',
            height: '20px',
            border: `2px solid ${colors.white}`,
            borderTop: `2px solid transparent`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    if (orderComplete) {
        return (
            <div style={styles.container}>
                <motion.div
                    style={styles.successSection}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                >
                    <FiCheckCircle style={styles.successIcon} />
                    <h1 style={styles.successTitle}>¡Pago exitoso!</h1>
                    <p style={styles.successText}>
                        Tu compra ha sido procesada correctamente.
                        Serás redirigido a tus compras en unos segundos...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <motion.button
                        style={styles.backButton}
                        whileHover={{ x: -5, backgroundColor: colors.primary + '10' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                    >
                        <FiArrowLeft /> Volver al carrito
                    </motion.button>
                </div>
                <div style={styles.headerRight}>
                    <h1 style={styles.title}>Finalizar compra</h1>
                </div>
            </div>

            {/* Steps */}
            <div style={styles.steps}>
                <div style={styles.stepLine} />
                {[
                    { number: 1, label: 'Información', icon: <FiUser /> },
                    { number: 2, label: 'Pago', icon: <FiCreditCard /> },
                    { number: 3, label: 'Confirmación', icon: <FiCheckCircle /> }
                ].map((s) => (
                    <div key={s.number} style={styles.stepItem}>
                        <div style={{
                            ...styles.stepNumber,
                            ...(step > s.number ? styles.stepNumberCompleted : {}),
                            ...(step === s.number ? styles.stepNumberActive : {})
                        }}>
                            {step > s.number ? <FiCheckCircle /> : s.number}
                        </div>
                        <div style={{
                            ...styles.stepLabel,
                            ...(step === s.number ? styles.stepLabelActive : {})
                        }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            <div style={styles.content}>
                {/* Formulario */}
                <div style={styles.formSection}>
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h2 style={styles.formTitle}>
                                    <FiUser /> Información de contacto
                                </h2>

                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Nombre</label>
                                        <div style={styles.inputWrapper}>
                                            <FiUser style={styles.inputIcon} />
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="Juan"
                                                style={styles.input}
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Apellido</label>
                                        <div style={styles.inputWrapper}>
                                            <FiUser style={styles.inputIcon} />
                                            <input
                                                type="text"
                                                name="lastName"
                                                placeholder="Pérez"
                                                style={styles.input}
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email</label>
                                    <div style={styles.inputWrapper}>
                                        <FiMail style={styles.inputIcon} />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="juan@email.com"
                                            style={styles.input}
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Teléfono</label>
                                    <div style={styles.inputWrapper}>
                                        <FiPhone style={styles.inputIcon} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            placeholder="+52 123 456 7890"
                                            style={styles.input}
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>

                                <h2 style={{ ...styles.formTitle, marginTop: '2rem' }}>
                                    <FiHome /> Dirección de facturación
                                </h2>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Dirección</label>
                                    <div style={styles.inputWrapper}>
                                        <FiMapPin style={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="address"
                                            placeholder="Calle, número, colonia"
                                            style={styles.input}
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>

                                <div style={styles.formGrid}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Ciudad</label>
                                        <input
                                            type="text"
                                            name="city"
                                            style={styles.input}
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>

                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Código postal</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            style={styles.input}
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            onFocus={(e) => e.target.style.borderColor = colors.primary}
                                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                        />
                                    </div>
                                </div>

                                <div style={styles.buttonGroup}>
                                    <motion.button
                                        style={styles.secondaryButton}
                                        whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/cart')}
                                    >
                                        Cancelar
                                    </motion.button>
                                    <motion.button
                                        style={styles.primaryButton}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleNextStep}
                                    >
                                        Continuar al pago
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h2 style={styles.formTitle}>
                                    <FiCreditCard /> Método de pago
                                </h2>

                                {/* Selector de métodos de pago */}
                                <div style={paymentMethodStyles.container}>
                                    {paymentMethods.map(method => (
                                        <motion.div
                                            key={method.id}
                                            style={{
                                                ...paymentMethodStyles.card,
                                                ...(paymentMethod === method.id ? paymentMethodStyles.cardSelected : {}),
                                                ...(!method.available ? paymentMethodStyles.cardDisabled : {})
                                            }}
                                            whileHover={method.available ? { scale: 1.02, y: -2 } : {}}
                                            onClick={() => {
                                                if (method.available) {
                                                    setPaymentMethod(method.id);
                                                } else {
                                                    showInfo('🚧 Este método estará disponible próximamente. Por ahora, usa PayPal.');
                                                }
                                            }}
                                        >
                                            {method.comingSoon && (
                                                <div style={paymentMethodStyles.comingSoonBadge}>
                                                    🚧 Próximamente
                                                </div>
                                            )}
                                            <div style={paymentMethodStyles.icon}>{method.icon}</div>
                                            <div style={paymentMethodStyles.name}>{method.name}</div>
                                            <div style={paymentMethodStyles.description}>{method.description}</div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Solo mostramos los campos de tarjeta si es PayPal (por ahora) */}
                                {paymentMethod === 'paypal' && (
                                    <>
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Número de tarjeta</label>
                                            <div style={styles.inputWrapper}>
                                                <FiCreditCard style={styles.inputIcon} />
                                                <input
                                                    type="text"
                                                    name="cardNumber"
                                                    placeholder="4242 4242 4242 4242"
                                                    style={styles.input}
                                                    value={formData.cardNumber}
                                                    onChange={handleInputChange}
                                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </div>
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Nombre en la tarjeta</label>
                                            <input
                                                type="text"
                                                name="cardName"
                                                placeholder="JUAN PEREZ"
                                                style={styles.input}
                                                value={formData.cardName}
                                                onChange={handleInputChange}
                                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>

                                        <div style={styles.formGrid}>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Fecha exp.</label>
                                                <input
                                                    type="text"
                                                    name="expiryDate"
                                                    placeholder="MM/AA"
                                                    style={styles.input}
                                                    value={formData.expiryDate}
                                                    onChange={handleInputChange}
                                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </div>

                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>CVV</label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    placeholder="123"
                                                    style={styles.input}
                                                    value={formData.cvv}
                                                    onChange={handleInputChange}
                                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div style={styles.secureBadge}>
                                    <FiLock /> Tus datos están seguros (SSL)
                                </div>

                                <div style={styles.buttonGroup}>
                                    <motion.button
                                        style={styles.secondaryButton}
                                        whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePrevStep}
                                    >
                                        Volver
                                    </motion.button>
                                    <motion.button
                                        style={{
                                            ...styles.primaryButton,
                                            opacity: paymentMethod !== 'paypal' ? 0.6 : 1
                                        }}
                                        whileHover={{ scale: paymentMethod === 'paypal' ? 1.02 : 1 }}
                                        whileTap={{ scale: paymentMethod === 'paypal' ? 0.98 : 1 }}
                                        onClick={() => {
                                            if (paymentMethod === 'paypal') {
                                                handleNextStep();
                                            } else {
                                                showInfo('🚧 Este método estará disponible próximamente. Por ahora, usa PayPal.');
                                            }
                                        }}
                                    >
                                        {paymentMethod === 'paypal' 
                                            ? 'Revisar pedido' 
                                            : 'Próximamente'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h2 style={styles.formTitle}>
                                    <FiCheckCircle /> Confirmar pedido
                                </h2>

                                <div style={{ marginBottom: '2rem' }}>
                                    {cartItems.map(item => (
                                        <div key={`${item.model.id}-${item.license}`} style={styles.summaryItem}>
                                            <div style={styles.summaryItemDetails}>
                                                <div style={styles.summaryItemName}>{item.model.name}</div>
                                                <div style={styles.summaryItemMeta}>
                                                    <FiPackage /> {getLicenseLabel(item.license)} × {item.quantity}
                                                </div>
                                            </div>
                                            <div style={styles.summaryItemPrice}>
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {errorMessage && (
                                    <div style={{
                                        backgroundColor: colors.danger + '10',
                                        color: colors.danger,
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        marginBottom: '1rem',
                                        textAlign: 'center',
                                        border: `1px solid ${colors.danger}20`
                                    }}>
                                        {errorMessage}
                                    </div>
                                )}

                                <div style={styles.buttonGroup}>
                                    <motion.button
                                        style={styles.secondaryButton}
                                        whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePrevStep}
                                    >
                                        Volver
                                    </motion.button>
                                    <motion.button
                                        style={{...styles.primaryButton, opacity: (!cartLoaded || processing) ? 0.6 : 1}}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleSubmitOrder}
                                        disabled={!cartLoaded || processing}
                                    >
                                        {!cartLoaded ? (
                                            <>
                                                <div style={styles.spinner} />
                                                Cargando carrito...
                                            </>
                                        ) : processing ? (
                                            <>
                                                <div style={styles.spinner} />
                                                Procesando...
                                            </>
                                        ) : (
                                            'Pagar con PayPal'
                                        )}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Resumen */}
                <div style={styles.summary}>
                    <h3 style={styles.summaryTitle}>
                        <FiPackage /> Resumen del pedido
                    </h3>

                    {cartItems.map(item => (
                        <div key={`${item.model.id}-${item.license}`} style={styles.summaryItem}>
                            <div style={styles.summaryItemDetails}>
                                <div style={styles.summaryItemName}>{item.model.name}</div>
                                <div style={styles.summaryItemMeta}>
                                    {getLicenseLabel(item.license)} × {item.quantity}
                                </div>
                            </div>
                            <div style={styles.summaryItemPrice}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}

                    <div style={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>

                    <div style={styles.summaryRow}>
                        <span>Impuestos (16%)</span>
                        <span>${tax.toFixed(2)}</span>
                    </div>

                    <div style={styles.summaryTotal}>
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <div style={styles.secureBadge}>
                        <span><FiShield /> Pago seguro</span>
                        <span><FiLock /> SSL</span>
                    </div>
                </div>
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

export default Checkout;