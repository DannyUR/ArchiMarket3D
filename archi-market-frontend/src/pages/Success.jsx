import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle } from 'react-icons/fi';
import { colors } from '../styles/theme';
import { useCart } from '../context/CartContext';

const Success = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const shoppingId = searchParams.get('shopping_id');
    const { clearCart } = useCart();
    const hasCleared = useRef(false); // ✅ Usar ref para evitar múltiples limpiezas

    useEffect(() => {
        // ✅ Ejecutar una SOLA VEZ cuando el componente se monta
        if (!hasCleared.current) {
            hasCleared.current = true;
            clearCart();
            console.log('✅ Carrito limpiado después del pago exitoso');
        }

        // Redirigir a compras después de 3 segundos
        const timer = setTimeout(() => {
            navigate('/purchases');
        }, 3000);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // ✅ Dependencia vacía = ejecuta UNA SOLA VEZ

    const styles = {
        container: {
            maxWidth: '600px',
            margin: '0 auto',
            padding: '6rem 2rem',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        successSection: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '32px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            width: '100%'
        },
        successIcon: {
            fontSize: '5rem',
            color: colors.success,
            marginBottom: '1rem'
        },
        successTitle: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem'
        },
        successText: {
            color: '#64748b',
            marginBottom: '2rem',
            fontSize: '1.1rem'
        },
        shoppingId: {
            color: '#94a3b8',
            fontSize: '0.9rem',
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            fontFamily: 'monospace'
        }
    };

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
                    Las licencias ya están disponibles en tu cuenta.
                </p>
                <div style={styles.shoppingId}>
                    ID de compra: {shoppingId}
                </div>
                <p style={{ ...styles.successText, marginTop: '1.5rem', fontSize: '0.95rem' }}>
                    Serás redirigido a tus compras en unos segundos...
                </p>
            </motion.div>
        </div>
    );
};

export default Success;