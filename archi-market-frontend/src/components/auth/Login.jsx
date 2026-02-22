import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiMenu, FiX } from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { colors, shadows, fonts } from '../../styles/theme';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showFeatures, setShowFeatures] = useState(false);
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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await API.post('/auth/login', form);
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));

            // ✅ VERIFICAR TIPO DE USUARIO
            const userType = response.data.data.user.user_type;

            showSuccess('👋 ¡Bienvenido de vuelta!');

            // Redirigir según el tipo de usuario
            if (userType === 'admin') {
                navigate('/admin');  // Admin va al dashboard
            } else {
                navigate('/models'); // Usuarios normales van a modelos
            }

        } catch (err) {
            // ... manejo de errores
        } finally {
            setLoading(false);
        }
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
            maxWidth: isMobile ? '100%' : '400px',
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
            marginBottom: '30px', // Más espacio
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: colors.primary,
            borderBottom: `2px solid ${colors.primary}20`, // Línea decorativa sutil
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
            lineHeight: '1.6',
            padding: isMobile ? '0 10px' : '0'
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
        formGroup: {
            marginBottom: isMobile ? '20px' : '25px'
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
        forgotPassword: {
            textAlign: 'right',
            marginBottom: '25px'
        },
        forgotLink: {
            color: colors.primary,
            fontSize: isMobile ? '13px' : '14px',
            textDecoration: 'none'
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
            gap: '10px'
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

                        <h1 style={styles.leftTitle}>Bienvenido a ArchiMarket3D</h1>
                        <p style={styles.leftSubtitle}>
                            La plataforma líder en modelos 3D profesionales
                        </p>

                        <div style={styles.featureList}>
                            {[
                                'Modelos BIM profesionales',
                                'Visualización en realidad mixta',
                                'Descarga inmediata',
                                'Soporte técnico especializado'
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

                        <h1 style={styles.leftTitle}>Bienvenido a ArchiMarket3D</h1>
                        <p style={styles.leftSubtitle}>
                            La plataforma líder en modelos 3D profesionales para arquitectura y construcción
                        </p>

                        <div style={styles.featureList}>
                            {[
                                'Modelos BIM profesionales',
                                'Visualización en realidad mixta',
                                'Descarga inmediata',
                                'Soporte técnico especializado'
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

            {/* Panel derecho (siempre visible) */}
            <motion.div
                style={styles.rightPanel}
                initial={!isMobile ? { x: 100, opacity: 0 } : {}}
                animate={!isMobile ? { x: 0, opacity: 1 } : {}}
                transition={{ duration: 0.8 }}
            >
                <div style={styles.card}>
                    <div style={styles.header}>
                        {/* Logo en el panel derecho - AGREGADO */}
                        <div style={styles.logo}>
                            <HiOutlineCube />
                            <span>ArchiMarket3D</span>
                        </div>

                        <h2 style={styles.welcomeText}>¡Hola de nuevo!</h2>
                        <p style={styles.subtitle}>
                            Ingresa tus credenciales para acceder a miles de modelos 3D profesionales
                        </p>
                    </div>

                    {error && (
                        <div style={styles.error}>
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
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
                        </div>

                        <div style={styles.forgotPassword}>
                            <a href="/forgot-password" style={styles.forgotLink}>
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div style={styles.buttonLoading} />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    Iniciar Sesión
                                    <FiArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        ¿No tienes una cuenta?
                        <a href="/register" style={styles.footerLink}>
                            Regístrate gratis
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

export default Login;