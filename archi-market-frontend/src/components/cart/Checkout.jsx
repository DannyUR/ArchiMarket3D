import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowLeft,
    FiCreditCard,
    FiShield,
    FiTruck,
    FiCheckCircle,
    FiLock,
    FiUser,
    FiMapPin,
    FiPhone,
    FiMail
} from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { colors } from '../../styles/theme';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, checkout, loading } = useCart();
    const [step, setStep] = useState(1); // 1: Información, 2: Pago, 3: Confirmación
    const [orderComplete, setOrderComplete] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

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
            setOrderComplete(true);

            setTimeout(() => {
                navigate('/purchases');
            }, 3000);

        } catch (error) {
            console.error('Error en checkout:', error);
            setErrorMessage(
                error.response?.data?.message ||
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

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
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
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.dark
        },
        steps: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '3rem',
            position: 'relative'
        },
        stepLine: {
            position: 'absolute',
            top: '25px',
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
            padding: '0 1rem'
        },
        stepNumber: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '600',
            color: colors.dark
        },
        stepNumberActive: {
            backgroundColor: colors.primary,
            color: 'white'
        },
        stepNumberCompleted: {
            backgroundColor: colors.success,
            color: 'white'
        },
        stepLabel: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        stepLabelActive: {
            color: colors.primary,
            fontWeight: '600'
        },
        content: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '2rem'
        },
        formSection: {
            backgroundColor: 'white',
            borderRadius: '15px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        },
        formTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1.5rem'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem'
        },
        formGroup: {
            marginBottom: '1rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            color: colors.dark,
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '0.75rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            transition: 'all 0.3s',
            outline: 'none'
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        inputIcon: {
            position: 'absolute',
            left: '1rem',
            color: '#94a3b8'
        },
        inputWithIcon: {
            paddingLeft: '2.5rem'
        },
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
        summaryItem: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid #e2e8f0`
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
            color: '#64748b'
        },
        summaryItemPrice: {
            fontWeight: '600',
            color: colors.primary
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
            borderTop: `2px solid #e2e8f0`,
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem'
        },
        primaryButton: {
            flex: 1,
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
            gap: '0.5rem'
        },
        secondaryButton: {
            flex: 1,
            backgroundColor: 'white',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
        },
        secureBadge: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '1rem',
            color: '#64748b',
            fontSize: '0.9rem'
        },
        successSection: {
            textAlign: 'center',
            padding: '4rem'
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
            <div style={styles.header}>
                <button
                    style={styles.backButton}
                    onClick={() => navigate(-1)}
                >
                    <FiArrowLeft /> Volver al carrito
                </button>
                <h1 style={styles.title}>Finalizar compra</h1>
            </div>

            {/* Steps */}
            <div style={styles.steps}>
                <div style={styles.stepLine} />
                {[
                    { number: 1, label: 'Información' },
                    { number: 2, label: 'Pago' },
                    { number: 3, label: 'Confirmación' }
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
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 style={styles.formTitle}>Información de contacto</h2>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nombre</label>
                                    <div style={styles.inputWrapper}>
                                        <FiUser style={styles.inputIcon} />
                                        <input
                                            type="text"
                                            name="firstName"
                                            placeholder="Juan"
                                            style={{ ...styles.input, ...styles.inputWithIcon }}
                                            value={formData.firstName}
                                            onChange={handleInputChange}
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
                                            style={{ ...styles.input, ...styles.inputWithIcon }}
                                            value={formData.lastName}
                                            onChange={handleInputChange}
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
                                        style={{ ...styles.input, ...styles.inputWithIcon }}
                                        value={formData.email}
                                        onChange={handleInputChange}
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
                                        style={{ ...styles.input, ...styles.inputWithIcon }}
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <h2 style={{ ...styles.formTitle, marginTop: '2rem' }}>Dirección de facturación</h2>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Dirección</label>
                                <div style={styles.inputWrapper}>
                                    <FiMapPin style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="address"
                                        placeholder="Calle, número, colonia"
                                        style={{ ...styles.input, ...styles.inputWithIcon }}
                                        value={formData.address}
                                        onChange={handleInputChange}
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
                                    />
                                </div>
                            </div>

                            <div style={styles.buttonGroup}>
                                <button
                                    style={styles.secondaryButton}
                                    onClick={() => navigate('/cart')}
                                >
                                    Cancelar
                                </button>
                                <button
                                    style={styles.primaryButton}
                                    onClick={handleNextStep}
                                >
                                    Continuar al pago
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 style={styles.formTitle}>Información de pago</h2>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Número de tarjeta</label>
                                <div style={styles.inputWrapper}>
                                    <FiCreditCard style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        placeholder="1234 5678 9012 3456"
                                        style={{ ...styles.input, ...styles.inputWithIcon }}
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
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
                                    />
                                </div>
                            </div>

                            <div style={styles.secureBadge}>
                                <FiLock /> Tus datos están seguros (SSL)
                            </div>

                            <div style={styles.buttonGroup}>
                                <button
                                    style={styles.secondaryButton}
                                    onClick={handlePrevStep}
                                >
                                    Volver
                                </button>
                                <button
                                    style={styles.primaryButton}
                                    onClick={handleNextStep}
                                >
                                    Revisar pedido
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <h2 style={styles.formTitle}>Confirmar pedido</h2>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ fontWeight: '600', marginBottom: '1rem' }}>Productos:</h3>
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
                            </div>
                            {errorMessage && (
                                <div style={{
                                    backgroundColor: colors.danger + '10',
                                    color: colors.danger,
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1rem',
                                    textAlign: 'center'
                                }}>
                                    {errorMessage}
                                </div>
                            )}
                            <div style={styles.buttonGroup}>
                                <button
                                    style={styles.primaryButton}
                                    onClick={handleSubmitOrder}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                border: `2px solid ${colors.white}`,
                                                borderTop: `2px solid transparent`,
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            Procesando...
                                        </>
                                    ) : (
                                        'Confirmar y pagar'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Resumen */}
                <div style={styles.summary}>
                    <h3 style={styles.summaryTitle}>Resumen del pedido</h3>

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

                    <div style={styles.secureBadge}>
                        <FiShield /> Pago 100% seguro
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;