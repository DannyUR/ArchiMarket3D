import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { colors } from '../styles/theme';

const AuthLayout = ({ children, title, subtitle }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Scroll al top
        window.scrollTo(0, 0);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'center',
                padding: isMobile ? '100px 1rem 2rem' : '2rem',
                background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.primary}05 100%)`,
                boxSizing: 'border-box'
            }}
        >
            <div style={{
                maxWidth: '450px',
                width: '100%',
                margin: '0 auto',
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: isMobile ? '2rem 1.5rem' : '2.5rem',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                {title && <h1 style={{ 
                    fontSize: isMobile ? '1.8rem' : '2rem', 
                    marginBottom: '0.5rem',
                    color: colors.dark
                }}>{title}</h1>}
                {subtitle && <p style={{ 
                    color: '#64748b', 
                    marginBottom: '2rem',
                    fontSize: isMobile ? '0.9rem' : '1rem'
                }}>{subtitle}</p>}
                {children}
            </div>
        </motion.div>
    );
};

export default AuthLayout;