import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FiMail, 
    FiLock, 
    FiArrowRight, 
    FiEye, 
    FiEyeOff,
    FiGithub,
    FiLinkedin,
    FiTwitter 
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { colors } from '../../styles/theme';
import { useNotification } from '../../context/NotificationContext'; // ← IMPORTAR

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification(); // ← HOOK DE NOTIFICACIONES

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await API.post('/auth/login', form);
            console.log('📦 Login response:', response.data);
            
            // Guardar token y usuario
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            
            // Mostrar notificación de éxito
            showSuccess(`🎉 ¡Bienvenido ${response.data.data.user.name}!`);
            
            // Redirigir según tipo de usuario
            if (response.data.data.user.user_type === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/models', { replace: true });
            }

        } catch (err) {
            console.error('Error login:', err);
            const errorMsg = err.response?.data?.message || 'Credenciales incorrectas';
            setError(errorMsg);
            showError('❌ ' + errorMsg); // ← NOTIFICACIÓN DE ERROR
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            background: '#fafafa'
        }}>
            {/* Panel izquierdo - Hero visual */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                    flex: isMobile ? 'none' : '1.2',
                    background: `linear-gradient(145deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '3rem 1.5rem' : '4rem',
                    minHeight: isMobile ? '300px' : '100vh'
                }}
            >
                {/* Elementos decorativos de fondo */}
                <div style={{
                    position: 'absolute',
                    top: '-50%',
                    right: '-30%',
                    width: '100%',
                    height: '200%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 1
                }} />
                
                <div style={{
                    position: 'absolute',
                    bottom: '-30%',
                    left: '-20%',
                    width: '80%',
                    height: '80%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                    zIndex: 1
                }} />

                {/* Contenido del panel izquierdo */}
                <div style={{
                    position: 'relative',
                    zIndex: 2,
                    color: 'white',
                    maxWidth: '500px'
                }}>
                    <motion.div
                        animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 6, 
                            repeat: Infinity,
                            ease: "easeInOut" 
                        }}
                        style={{
                            fontSize: isMobile ? '3rem' : '4rem',
                            marginBottom: '2rem',
                            display: 'inline-block'
                        }}
                    >
                        <HiOutlineCube />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            fontSize: isMobile ? '2.2rem' : '3rem',
                            fontWeight: '700',
                            marginBottom: '1.5rem',
                            lineHeight: '1.2'
                        }}
                    >
                        Bienvenido a <br />
                        <span style={{ 
                            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            ArchiMarket3D
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            fontSize: isMobile ? '1rem' : '1.2rem',
                            opacity: 0.9,
                            marginBottom: '3rem',
                            lineHeight: '1.6'
                        }}
                    >
                        La plataforma líder en modelos 3D profesionales para arquitectura y construcción
                    </motion.p>

                    {/* Estadísticas */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '2rem'
                        }}
                    >
                        {[
                            { value: '2500+', label: 'Modelos' },
                            { value: '1250+', label: 'Empresas' },
                            { value: '18.5k', label: 'Descargas' }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                style={{ textAlign: 'center' }}
                            >
                                <div style={{
                                    fontSize: isMobile ? '1.5rem' : '2rem',
                                    fontWeight: '700',
                                    marginBottom: '0.3rem'
                                }}>
                                    {stat.value}
                                </div>
                                <div style={{
                                    fontSize: isMobile ? '0.8rem' : '0.9rem',
                                    opacity: 0.8
                                }}>
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </motion.div>

            {/* Panel derecho - Formulario */}
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{
                    flex: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isMobile ? '3rem 1.5rem' : '4rem',
                    backgroundColor: 'white',
                    minHeight: isMobile ? 'auto' : '100vh'
                }}
            >
                <div style={{
                    width: '100%',
                    maxWidth: '450px'
                }}>
                    {/* Logo pequeño */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: colors.primary,
                        marginBottom: '2.5rem'
                    }}>
                        <HiOutlineCube size={32} />
                        <span>ArchiMarket3D</span>
                    </div>

                    {/* Título */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 style={{
                            fontSize: isMobile ? '2rem' : '2.5rem',
                            fontWeight: '700',
                            color: colors.dark,
                            marginBottom: '0.5rem'
                        }}>
                            Hola de nuevo
                        </h1>
                        <p style={{
                            color: '#64748b',
                            marginBottom: '2.5rem',
                            fontSize: '1rem'
                        }}>
                            Ingresa tus credenciales para acceder a miles de modelos profesionales
                        </p>
                    </motion.div>

                    {/* Error (solo como respaldo visual, las notificaciones ya muestran error) */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                backgroundColor: colors.danger + '10',
                                color: colors.danger,
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: `1px solid ${colors.danger}20`
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                            {error}
                        </motion.div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                        {/* Campo Email */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            style={{ marginBottom: '1.5rem' }}
                        >
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: colors.dark,
                                fontWeight: '500',
                                fontSize: '0.9rem'
                            }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiMail style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8',
                                    fontSize: '1.2rem',
                                    zIndex: 1
                                }} />
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1rem 1rem 3rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.3s',
                                        boxSizing: 'border-box',
                                        backgroundColor: '#f8fafc'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.primary;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Campo Contraseña */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{ marginBottom: '1rem' }}
                        >
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: colors.dark,
                                fontWeight: '500',
                                fontSize: '0.9rem'
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{
                                    position: 'absolute',
                                    left: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#94a3b8',
                                    fontSize: '1.2rem',
                                    zIndex: 1
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '1rem 3rem 1rem 3rem',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '1rem',
                                        outline: 'none',
                                        transition: 'all 0.3s',
                                        boxSizing: 'border-box',
                                        backgroundColor: '#f8fafc'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = colors.primary;
                                        e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#94a3b8',
                                        fontSize: '1.2rem',
                                        zIndex: 1
                                    }}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </motion.div>

                        {/* Recordarme y olvidé contraseña */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '2rem'
                            }}
                        >
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                color: '#64748b'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        accentColor: colors.primary
                                    }}
                                />
                                Recordarme
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate('/forgot-password')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: colors.primary,
                                    cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    fontWeight: '500'
                                }}
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </motion.div>

                        {/* Botón de login */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                backgroundColor: colors.primary,
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s',
                                marginBottom: '2rem',
                                boxShadow: `0 8px 20px ${colors.primary}40`
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        border: `2px solid ${colors.white}`,
                                        borderTop: `2px solid transparent`,
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                    Iniciando sesión...
                                </>
                            ) : (
                                <>
                                    Iniciar Sesión
                                    <FiArrowRight />
                                </>
                            )}
                        </motion.button>

                        {/* Registro */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            style={{
                                textAlign: 'center',
                                color: '#64748b',
                                fontSize: '0.95rem'
                            }}
                        >
                            ¿No tienes una cuenta?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: colors.primary,
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    fontSize: '0.95rem',
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '2px'
                                }}
                            >
                                Regístrate gratis
                            </button>
                        </motion.div>
                    </form>
                </div>
            </motion.div>

            {/* Animaciones globales */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;