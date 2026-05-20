import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!email) {
            setError('Por favor ingresa tu correo electrónico');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/forgot-password', { email });
            
            if (response.data.success) {
                setSubmitted(true);
                setMessage('Hemos enviado un enlace de recuperación a tu correo electrónico');
            } else {
                setError(response.data.message || 'Error al procesar la solicitud');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // Estilos CSS como objeto JavaScript
    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        card: {
            maxWidth: '450px',
            width: '100%',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '2rem'
        },
        iconWrapper: {
            width: '70px',
            height: '70px',
            background: '#e0e7ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
        },
        icon: {
            width: '35px',
            height: '35px',
            color: '#4f46e5'
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '0.5rem'
        },
        subtitle: {
            color: '#6b7280',
            textAlign: 'center',
            fontSize: '0.9rem',
            marginBottom: '2rem',
            lineHeight: '1.5'
        },
        errorMessage: {
            marginBottom: '1rem',
            padding: '0.75rem',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '10px',
            color: '#dc2626',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        successMessage: {
            marginBottom: '1rem',
            padding: '0.75rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            color: '#16a34a',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            color: '#374151',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
        },
        inputWrapper: {
            position: 'relative'
        },
        inputIcon: {
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center'
        },
        inputIconSvg: {
            width: '20px',
            height: '20px',
            color: '#9ca3af'
        },
        input: {
            width: '100%',
            padding: '12px 12px 12px 45px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '1rem',
            transition: 'all 0.3s',
            outline: 'none',
            boxSizing: 'border-box'
        },
        inputFocus: {
            borderColor: '#4f46e5',
            boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
        },
        button: {
            width: '100%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            fontWeight: 'bold',
            padding: '14px',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '1rem'
        },
        buttonHover: {
            transform: 'scale(1.02)'
        },
        buttonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        link: {
            textAlign: 'center'
        },
        linkText: {
            color: '#4f46e5',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem'
        },
        emailBox: {
            background: '#eff6ff',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center'
        },
        emailText: {
            color: '#1e40af',
            fontSize: '0.875rem',
            wordBreak: 'break-all'
        },
        spinner: {
            display: 'inline-block',
            width: '18px',
            height: '18px',
            border: '2px solid white',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            marginRight: '8px',
            verticalAlign: 'middle'
        }
    };

    // Añadir animación al documento
    if (typeof document !== 'undefined') {
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            input:focus {
                border-color: #4f46e5 !important;
                box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important;
            }
            button:hover:not(:disabled) {
                transform: scale(1.02);
            }
        `;
        document.head.appendChild(styleSheet);
    }

    if (submitted) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconWrapper}>
                        <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    <h2 style={styles.title}>¡Revisa tu correo!</h2>
                    <p style={{ color: '#4b5563', textAlign: 'center', marginBottom: '1rem' }}>{message}</p>
                    <div style={styles.emailBox}>
                        <p style={styles.emailText}>📧 {email}</p>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.button}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        Volver al inicio de sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconWrapper}>
                    <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                </div>
                <h1 style={styles.title}>¿Olvidaste tu contraseña?</h1>
                <p style={styles.subtitle}>
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>

                {error && (
                    <div style={styles.errorMessage}>
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Correo Electrónico</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}>
                                <svg style={styles.inputIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                                </svg>
                            </div>
                            <input
                                type="email"
                                style={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                disabled={loading}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {})
                        }}
                        disabled={loading}
                        onMouseEnter={(e) => {
                            if (!loading) e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>
                                Enviando...
                            </>
                        ) : (
                            'Enviar enlace de recuperación'
                        )}
                    </button>
                </form>

                <div style={styles.link}>
                    <Link to="/login" style={styles.linkText}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;