import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        const emailParam = searchParams.get('email');
        
        if (tokenParam && emailParam) {
            setToken(tokenParam);
            setEmail(decodeURIComponent(emailParam));
        } else {
            setError('Enlace inválido o incompleto');
        }
    }, [searchParams]);

    const validatePassword = (pass) => {
        const errors = [];
        if (pass.length < 8) errors.push('Mínimo 8 caracteres');
        if (!/[A-Z]/.test(pass)) errors.push('Una mayúscula');
        if (!/[a-z]/.test(pass)) errors.push('Una minúscula');
        if (!/[0-9]/.test(pass)) errors.push('Un número');
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        const passwordErrors = validatePassword(password);
        if (passwordErrors.length > 0) {
            setError(`La contraseña debe cumplir: ${passwordErrors.join(', ')}`);
            setLoading(false);
            return;
        }

        if (password !== passwordConfirmation) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/reset-password', {
                token: token,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation
            });

            if (response.data.success) {
                setSuccess(true);
                setMessage('¡Contraseña actualizada correctamente!');
                
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError(response.data.message || 'Error al restablecer la contraseña');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error al procesar la solicitud');
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
        emailHighlight: {
            color: '#4f46e5',
            fontWeight: 'bold'
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
        passwordToggle: {
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
        },
        passwordToggleSvg: {
            width: '20px',
            height: '20px',
            color: '#9ca3af'
        },
        requirements: {
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#6b7280'
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
        },
        loadingContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
        },
        loader: {
            width: '50px',
            height: '50px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
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

    if (!token || !email) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconWrapper, background: '#fee2e2' }}>
                        <svg style={{ ...styles.icon, color: '#dc2626' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h2 style={styles.title}>Enlace inválido</h2>
                    <p style={styles.subtitle}>
                        El enlace de restablecimiento es inválido o ha expirado.
                    </p>
                    <Link to="/forgot-password" style={styles.button}>
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={{ ...styles.iconWrapper, background: '#dcfce7' }}>
                        <svg style={{ ...styles.icon, color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h2 style={styles.title}>¡Contraseña actualizada!</h2>
                    <p style={styles.subtitle}>{message}</p>
                    <div style={styles.loadingContainer}>
                        <div style={styles.loader}></div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Redirigiendo al inicio de sesión...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.iconWrapper}>
                    <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                </div>
                <h1 style={styles.title}>Restablecer Contraseña</h1>
                <p style={styles.subtitle}>
                    Ingresa tu nueva contraseña para la cuenta <span style={styles.emailHighlight}>{email}</span>
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
                        <label style={styles.label}>Nueva Contraseña</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}>
                                <svg style={styles.inputIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                style={styles.input}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                            <button
                                type="button"
                                style={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <svg style={styles.passwordToggleSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                    </svg>
                                ) : (
                                    <svg style={styles.passwordToggleSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <div style={styles.requirements}>
                            <strong>Requisitos:</strong> Mínimo 8 caracteres, una mayúscula, una minúscula y un número
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirmar Contraseña</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}>
                                <svg style={styles.inputIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                style={styles.input}
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                onFocus={(e) => e.currentTarget.style.borderColor = '#4f46e5'}
                                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                            />
                            <button
                                type="button"
                                style={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? (
                                    <svg style={styles.passwordToggleSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                                    </svg>
                                ) : (
                                    <svg style={styles.passwordToggleSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading ? { opacity: 0.5, cursor: 'not-allowed' } : {})
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
                                Restableciendo...
                            </>
                        ) : (
                            'Restablecer Contraseña'
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

export default ResetPassword;