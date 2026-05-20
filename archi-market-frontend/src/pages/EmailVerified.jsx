import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const EmailVerified = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [countdown, setCountdown] = useState(5);
    
    const verified = searchParams.get('verified');
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    const reason = searchParams.get('reason');

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/login');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            padding: '2rem',
            textAlign: 'center'
        },
        iconWrapper: {
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto'
        },
        icon: {
            width: '35px',
            height: '35px'
        },
        title: {
            fontSize: '1.8rem',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '0.5rem'
        },
        message: {
            color: '#6b7280',
            marginBottom: '1.5rem',
            lineHeight: '1.5'
        },
        button: {
            width: '100%',
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'white',
            fontWeight: 'bold',
            padding: '12px',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '1rem'
        },
        countdown: {
            fontSize: '0.875rem',
            color: '#9ca3af'
        }
    };

    let iconSvg, iconBgColor, titleText, messageText;

    if (verified === 'true') {
        iconSvg = (
            <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
        );
        iconBgColor = { background: '#dcfce7', color: '#16a34a' };
        titleText = '¡Email Verificado!';
        messageText = message || 'Tu correo ha sido verificado correctamente.';
    } else if (error === 'user_not_found' || reason === 'user_not_found') {
        iconSvg = (
            <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
        );
        iconBgColor = { background: '#fee2e2', color: '#dc2626' };
        titleText = 'Usuario no encontrado';
        messageText = 'No se pudo encontrar el usuario asociado a este enlace.';
    } else {
        iconSvg = (
            <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        );
        iconBgColor = { background: '#fee2e2', color: '#dc2626' };
        titleText = 'Error de Verificación';
        messageText = message || 'No se pudo verificar tu correo. El enlace puede haber expirado.';
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={{ ...styles.iconWrapper, ...iconBgColor }}>
                    {iconSvg}
                </div>
                <h1 style={styles.title}>{titleText}</h1>
                <p style={styles.message}>{messageText}</p>
                <button onClick={() => navigate('/login')} style={styles.button}>
                    Ir al inicio de sesión
                </button>
                <p style={styles.countdown}>Redirigiendo en {countdown} segundos...</p>
            </div>
        </div>
    );
};

export default EmailVerified;