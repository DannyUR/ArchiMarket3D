import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiLock,
    FiArrowRight,
    FiBriefcase,
    FiMenu,
    FiX,
    FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { colors, shadows, fonts } from '../../styles/theme';

const Register = () => {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_type: 'architect',
        company: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();
    const { showSuccess, showError, showInfo } = useNotification();

    // Detectar si es móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calcular fortaleza de contraseña
    useEffect(() => {
        let strength = 0;
        if (form.password.length >= 8) strength += 25;
        if (/[A-Z]/.test(form.password)) strength += 25;
        if (/[0-9]/.test(form.password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(form.password)) strength += 25;
        setPasswordStrength(strength);
    }, [form.password]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await API.post('/auth/register', form);
            showSuccess('🎉 ¡Registro exitoso! Por favor verifica tu email.');  // 👈 NOTIFICACIÓN

            // Guardar token si el login es automático
            if (response.data.data?.token) {
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            console.log('Error registro:', err.response?.data);

            if (err.response?.status === 422) {
                const errors = err.response?.data?.errors;
                if (errors?.email) {
                    showError('📧 ' + errors.email[0]);
                } else {
                    showError('❌ Error de validación');
                }
            } else {
                showError('❌ Error al registrar usuario');
            }
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 25) return '#ef4444';
        if (passwordStrength <= 50) return '#f59e0b';
        if (passwordStrength <= 75) return '#3b82f6';
        return '#10b981';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 25) return 'Débil';
        if (passwordStrength <= 50) return 'Regular';
        if (passwordStrength <= 75) return 'Buena';
        return 'Excelente';
    };

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            fontFamily: fonts.main,
            background: '#f8fafc'
        },
        // Panel izquierdo (marca)
        leftPanel: {
            flex: isMobile ? 'auto' : '1',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '20px' : '40px',
            position: 'relative',
            overflow: 'hidden',
            minHeight: isMobile ? (showFeatures ? 'auto' : '80px') : '100vh',
            transition: 'min-height 0.3s ease'
        },
        leftPanelContent: {
            color: colors.white,
            zIndex: 2,
            textAlign: 'center',
            maxWidth: '400px',
            display: isMobile && !showFeatures ? 'none' : 'block'
        },
        mobileToggle: {
            display: isMobile ? 'flex' : 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            padding: '10px 20px',
            color: colors.white,
            cursor: 'pointer',
            zIndex: 3
        },
        mobileToggleText: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '18px',
            fontWeight: '600'
        },
        iconWrapper: {
            fontSize: isMobile ? '40px' : '80px',
            marginBottom: isMobile ? '15px' : '30px',
            color: colors.white,
            opacity: 0.9
        },
        leftTitle: {
            fontSize: isMobile ? '28px' : '42px',
            fontWeight: '700',
            marginBottom: isMobile ? '10px' : '20px',
            lineHeight: '1.2'
        },
        leftSubtitle: {
            fontSize: isMobile ? '14px' : '18px',
            opacity: 0.9,
            marginBottom: isMobile ? '20px' : '40px',
            lineHeight: '1.6'
        },
        featureList: {
            textAlign: 'left',
            marginTop: isMobile ? '15px' : '30px'
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: isMobile ? '12px' : '20px',
            fontSize: isMobile ? '14px' : '16px'
        },
        featureIcon: {
            marginRight: '15px',
            fontSize: isMobile ? '18px' : '24px'
        },
        // Panel derecho (formulario)
        rightPanel: {
            flex: '1',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: isMobile ? '20px' : '40px',
            backgroundColor: colors.white
        },
        card: {
            width: '100%',
            maxWidth: isMobile ? '100%' : '500px',
            padding: isMobile ? '30px 20px' : '40px',
            borderRadius: isMobile ? '15px' : '20px',
            boxShadow: isMobile ? shadows.medium : shadows.large,
            backgroundColor: colors.white
        },
        header: {
            marginBottom: isMobile ? '30px' : '40px',
            textAlign: 'center'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '30px',
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: colors.primary,
            borderBottom: `2px solid ${colors.primary}20`,
            paddingBottom: '20px'
        },
        welcomeText: {
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '10px'
        },
        subtitle: {
            fontSize: isMobile ? '13px' : '14px',
            color: '#64748b',
            lineHeight: '1.6'
        },
        error: {
            backgroundColor: colors.danger + '10',
            color: colors.danger,
            padding: isMobile ? '12px' : '15px',
            borderRadius: '10px',
            marginBottom: '25px',
            fontSize: isMobile ? '13px' : '14px',
            border: `1px solid ${colors.danger}20`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        success: {
            backgroundColor: colors.success + '10',
            color: colors.success,
            padding: isMobile ? '12px' : '15px',
            borderRadius: '10px',
            marginBottom: '25px',
            fontSize: isMobile ? '13px' : '14px',
            border: `1px solid ${colors.success}20`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '15px' : '20px'
        },
        formGroup: {
            marginBottom: isMobile ? '15px' : '20px'
        },
        label: {
            display: 'block',
            marginBottom: '8px',
            color: colors.dark,
            fontSize: isMobile ? '13px' : '14px',
            fontWeight: '500'
        },
        inputWrapper: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
        },
        inputIcon: {
            position: 'absolute',
            left: '15px',
            color: '#94a3b8',
            fontSize: isMobile ? '16px' : '18px'
        },
        input: {
            width: '100%',
            padding: isMobile ? '12px 12px 12px 40px' : '15px 15px 15px 45px',
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            fontSize: isMobile ? '14px' : '14px',
            transition: 'all 0.3s',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: '#f8fafc'
        },
        select: {
            width: '100%',
            padding: isMobile ? '12px 15px' : '15px 15px 15px 45px',
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            fontSize: isMobile ? '14px' : '14px',
            backgroundColor: '#f8fafc',
            appearance: 'none',
            cursor: 'pointer'
        },
        passwordStrength: {
            marginTop: '8px',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden'
        },
        passwordStrengthBar: {
            height: '100%',
            width: `${passwordStrength}%`,
            backgroundColor: getPasswordStrengthColor(),
            transition: 'width 0.3s ease'
        },
        passwordStrengthText: {
            fontSize: '12px',
            color: getPasswordStrengthColor(),
            marginTop: '4px',
            textAlign: 'right'
        },
        terms: {
            fontSize: isMobile ? '12px' : '13px',
            color: '#64748b',
            marginBottom: '20px',
            textAlign: 'center'
        },
        termsLink: {
            color: colors.primary,
            textDecoration: 'none',
            fontWeight: '500'
        },
        button: {
            width: '100%',
            padding: isMobile ? '14px' : '16px',
            backgroundColor: colors.primary,
            color: colors.white,
            border: 'none',
            borderRadius: '10px',
            fontSize: isMobile ? '15px' : '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '20px'
        },
        buttonLoading: {
            width: '20px',
            height: '20px',
            border: `2px solid ${colors.white}`,
            borderTop: `2px solid transparent`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        footer: {
            marginTop: '30px',
            textAlign: 'center',
            fontSize: isMobile ? '13px' : '14px',
            color: '#64748b'
        },
        footerLink: {
            color: colors.primary,
            textDecoration: 'none',
            fontWeight: '500',
            marginLeft: '5px'
        }
    };

    return (
        <div style={styles.container}>
            {/* Panel izquierdo - Versión móvil */}
            {isMobile && (
                <div style={styles.leftPanel}>
                    <div
                        style={styles.mobileToggle}
                        onClick={() => setShowFeatures(!showFeatures)}
                    >
                        <div style={styles.mobileToggleText}>
                            <HiOutlineCube />
                            <span>ArchiMarket3D</span>
                        </div>
                        {showFeatures ? <FiX size={24} /> : <FiMenu size={24} />}
                    </div>

                    <motion.div
                        style={styles.leftPanelContent}
                        initial={false}
                        animate={{ height: showFeatures ? 'auto' : 0, opacity: showFeatures ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            style={styles.iconWrapper}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            <HiOutlineCube />
                        </motion.div>

                        <h1 style={styles.leftTitle}>Únete a ArchiMarket3D</h1>
                        <p style={styles.leftSubtitle}>
                            Comienza a acceder a miles de modelos 3D profesionales
                        </p>

                        <div style={styles.featureList}>
                            {[
                                'Acceso inmediato a la biblioteca',
                                'Modelos BIM certificados',
                                'Visualización en realidad mixta',
                                'Soporte técnico prioritario'
                            ].map((feature, index) => (
                                <div key={index} style={styles.featureItem}>
                                    <span style={styles.featureIcon}>✓</span>
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Panel izquierdo - Versión desktop */}
            {!isMobile && (
                <motion.div
                    style={styles.leftPanel}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={styles.leftPanelContent}>
                        <motion.div
                            style={styles.iconWrapper}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        >
                            <HiOutlineCube />
                        </motion.div>

                        <h1 style={styles.leftTitle}>Únete a ArchiMarket3D</h1>
                        <p style={styles.leftSubtitle}>
                            Regístrate y comienza a acceder a la mejor biblioteca de modelos 3D para construcción
                        </p>

                        <div style={styles.featureList}>
                            {[
                                'Acceso inmediato a la biblioteca',
                                'Modelos BIM certificados',
                                'Visualización en realidad mixta',
                                'Soporte técnico prioritario'
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    style={styles.featureItem}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                >
                                    <span style={styles.featureIcon}>✓</span>
                                    {feature}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                        zIndex: 1
                    }} />
                </motion.div>
            )}

            {/* Panel derecho - Formulario */}
            <motion.div
                style={styles.rightPanel}
                initial={!isMobile ? { x: 100, opacity: 0 } : {}}
                animate={!isMobile ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8 }}
            >
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.logo}>
                            <HiOutlineCube />
                            <span>ArchiMarket3D</span>
                        </div>

                        <h2 style={styles.welcomeText}>Crear cuenta</h2>
                        <p style={styles.subtitle}>
                            Completa tus datos para comenzar
                        </p>
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={styles.success}>
                            <FiCheckCircle />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={styles.formGrid}>
                            {/* Nombre completo */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Nombre completo</label>
                                <div style={styles.inputWrapper}>
                                    <FiUser style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Ej: Juan Pérez"
                                        style={styles.input}
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Tipo de usuario */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Tipo de usuario</label>
                                <div style={styles.inputWrapper}>
                                    <FiBriefcase style={styles.inputIcon} />
                                    <select
                                        name="user_type"
                                        style={styles.select}
                                        value={form.user_type}
                                        onChange={handleChange}
                                    >
                                        <option value="architect">Arquitecto</option>
                                        <option value="engineer">Ingeniero</option>
                                        <option value="company">Empresa</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Email</label>
                            <div style={styles.inputWrapper}>
                                <FiMail style={styles.inputIcon} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="tu@email.com"
                                    style={styles.input}
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        {/* Empresa (opcional) */}
                        {form.user_type === 'company' && (
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Empresa</label>
                                <div style={styles.inputWrapper}>
                                    <FiBriefcase style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="company"
                                        placeholder="Nombre de la empresa"
                                        style={styles.input}
                                        value={form.company}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Contraseña */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Contraseña</label>
                            <div style={styles.inputWrapper}>
                                <FiLock style={styles.inputIcon} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="••••••••"
                                    style={styles.input}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {form.password && (
                                <>
                                    <div style={styles.passwordStrength}>
                                        <div style={styles.passwordStrengthBar} />
                                    </div>
                                    <div style={styles.passwordStrengthText}>
                                        {getPasswordStrengthText()}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Confirmar contraseña */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Confirmar contraseña</label>
                            <div style={styles.inputWrapper}>
                                <FiLock style={styles.inputIcon} />
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    style={{
                                        ...styles.input,
                                        borderColor: form.password && form.password_confirmation
                                            ? (form.password === form.password_confirmation
                                                ? colors.success
                                                : colors.danger)
                                            : '#e2e8f0'
                                    }}
                                    value={form.password_confirmation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {form.password && form.password_confirmation && (
                                <div style={{
                                    fontSize: '12px',
                                    color: form.password === form.password_confirmation
                                        ? colors.success
                                        : colors.danger,
                                    marginTop: '4px'
                                }}>
                                    {form.password === form.password_confirmation
                                        ? '✓ Las contraseñas coinciden'
                                        : '✗ Las contraseñas no coinciden'}
                                </div>
                            )}
                        </div>

                        <div style={styles.terms}>
                            Al registrarte, aceptas nuestros{' '}
                            <a href="/terms" style={styles.termsLink}>Términos y Condiciones</a>
                            {' '}y{' '}
                            <a href="/privacy" style={styles.termsLink}>Política de Privacidad</a>
                        </div>

                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div style={styles.buttonLoading} />
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    Crear cuenta
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        ¿Ya tienes una cuenta?
                        <a href="/login" style={styles.footerLink}>
                            Inicia sesión
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// Añadir keyframes para animación de carga
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

export default Register;