import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiLock,
    FiArrowRight,
    FiBriefcase,
    FiEye,
    FiEyeOff,
    FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styles/theme';

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
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();

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
            showSuccess('🎉 ¡Registro exitoso! Por favor verifica tu email.');

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
                        Únete a <br />
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
                        Regístrate y accede a miles de modelos 3D profesionales para arquitectura y construcción
                    </motion.p>

                    {/* Beneficios */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '1.5rem'
                        }}
                    >
                        {[
                            'Acceso inmediato',
                            'Modelos BIM',
                            'Realidad mixta',
                            'Soporte prioritario'
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }}
                            >
                                <FiCheckCircle style={{ color: 'white', opacity: 0.8 }} />
                                {benefit}
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
                    maxWidth: '500px'
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
                            Crear cuenta
                        </h1>
                        <p style={{
                            color: '#64748b',
                            marginBottom: '2rem',
                            fontSize: '1rem'
                        }}>
                            Completa tus datos para comenzar
                        </p>
                    </motion.div>

                    {/* Error */}
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

                    {/* Success */}
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                backgroundColor: colors.success + '10',
                                color: colors.success,
                                padding: '1rem',
                                borderRadius: '12px',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: `1px solid ${colors.success}20`
                            }}
                        >
                            <FiCheckCircle size={20} />
                            {success}
                        </motion.div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                        {/* Grid de 2 columnas */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1rem'
                        }}>
                            {/* Nombre completo */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ marginBottom: '1rem' }}
                            >
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: colors.dark,
                                    fontWeight: '500',
                                    fontSize: '0.9rem'
                                }}>
                                    Nombre completo
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiUser style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8',
                                        fontSize: '1.2rem',
                                        zIndex: 1
                                    }} />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Ej: Juan Pérez"
                                        value={form.name}
                                        onChange={handleChange}
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

                            {/* Tipo de usuario */}
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
                                    Tipo de usuario
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiBriefcase style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8',
                                        fontSize: '1.2rem',
                                        zIndex: 1
                                    }} />
                                    <select
                                        name="user_type"
                                        value={form.user_type}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1rem 1rem 3rem',
                                            border: '2px solid #e2e8f0',
                                            borderRadius: '12px',
                                            fontSize: '1rem',
                                            outline: 'none',
                                            backgroundColor: '#f8fafc',
                                            appearance: 'none',
                                            cursor: 'pointer',
                                            color: colors.dark
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = colors.primary;
                                            e.target.style.boxShadow = `0 0 0 4px ${colors.primary}20`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="architect">Arquitecto</option>
                                        <option value="engineer">Ingeniero</option>
                                        <option value="company">Empresa</option>
                                    </select>
                                </div>
                            </motion.div>
                        </div>

                        {/* Email */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
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
                                    name="email"
                                    placeholder="tu@email.com"
                                    value={form.email}
                                    onChange={handleChange}
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

                        {/* Empresa (condicional) */}
                        {form.user_type === 'company' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.55 }}
                                style={{ marginBottom: '1.5rem' }}
                            >
                                <label style={{
                                    display: 'block',
                                    marginBottom: '0.5rem',
                                    color: colors.dark,
                                    fontWeight: '500',
                                    fontSize: '0.9rem'
                                }}>
                                    Empresa
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <FiBriefcase style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#94a3b8',
                                        fontSize: '1.2rem',
                                        zIndex: 1
                                    }} />
                                    <input
                                        type="text"
                                        name="company"
                                        placeholder="Nombre de la empresa"
                                        value={form.company}
                                        onChange={handleChange}
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
                        )}

                        {/* Contraseña */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
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
                                    name="password"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={handleChange}
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
                            {form.password && (
                                <>
                                    <div style={{
                                        marginTop: '8px',
                                        height: '4px',
                                        backgroundColor: '#e2e8f0',
                                        borderRadius: '2px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${passwordStrength}%`,
                                            backgroundColor: getPasswordStrengthColor(),
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: getPasswordStrengthColor(),
                                        marginTop: '4px',
                                        textAlign: 'right'
                                    }}>
                                        {getPasswordStrengthText()}
                                    </div>
                                </>
                            )}
                        </motion.div>

                        {/* Confirmar contraseña */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            style={{ marginBottom: '1.5rem' }}
                        >
                            <label style={{
                                display: 'block',
                                marginBottom: '0.5rem',
                                color: colors.dark,
                                fontWeight: '500',
                                fontSize: '0.9rem'
                            }}>
                                Confirmar contraseña
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
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    placeholder="••••••••"
                                    value={form.password_confirmation}
                                    onChange={handleChange}
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
                                        backgroundColor: '#f8fafc',
                                        borderColor: form.password && form.password_confirmation
                                            ? (form.password === form.password_confirmation
                                                ? colors.success
                                                : colors.danger)
                                            : '#e2e8f0'
                                    }}
                                    onFocus={(e) => {
                                        if (form.password === form.password_confirmation) {
                                            e.target.style.borderColor = colors.success;
                                            e.target.style.boxShadow = `0 0 0 4px ${colors.success}20`;
                                        }
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                            {form.password && form.password_confirmation && (
                                <div style={{
                                    fontSize: '12px',
                                    color: form.password === form.password_confirmation
                                        ? colors.success
                                        : colors.danger,
                                    marginTop: '4px',
                                    textAlign: 'right'
                                }}>
                                    {form.password === form.password_confirmation
                                        ? '✓ Las contraseñas coinciden'
                                        : '✗ Las contraseñas no coinciden'}
                                </div>
                            )}
                        </motion.div>

                        {/* Términos */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            style={{
                                fontSize: isMobile ? '12px' : '13px',
                                color: '#64748b',
                                marginBottom: '1.5rem',
                                textAlign: 'center'
                            }}
                        >
                            Al registrarte, aceptas nuestros{' '}
                            <a href="/terms" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '500' }}>
                                Términos y Condiciones
                            </a>
                            {' '}y{' '}
                            <a href="/privacy" style={{ color: colors.primary, textDecoration: 'none', fontWeight: '500' }}>
                                Política de Privacidad
                            </a>
                        </motion.div>

                        {/* Botón de registro */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
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
                                marginBottom: '1.5rem',
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
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    Crear cuenta
                                    <FiArrowRight />
                                </>
                            )}
                        </motion.button>

                        {/* Login */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            style={{
                                textAlign: 'center',
                                color: '#64748b',
                                fontSize: '0.95rem'
                            }}
                        >
                            ¿Ya tienes una cuenta?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
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
                                Inicia sesión
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

export default Register;