import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    FiCheckCircle,
    FiUsers,
    FiBriefcase,
    FiInfinity,
    FiDownload,
    FiHeadphones,
    FiEdit3,
    FiHelpCircle, 
    FiStar,
    FiZap,
    FiAward,
    FiTrendingUp
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';

const PublicLicenses = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('one-time');

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Precio base de ejemplo para mostrar multiplicadores
    const exampleBasePrice = 99.99;

    const multipliers = {
        personal: 1.0,
        business: 2.5,
        unlimited: 5.0
    };

    const licenses = [
        {
            id: 'personal',
            name: 'Personal',
            icon: <FiUsers />,
            price: exampleBasePrice * multipliers.personal,
            description: 'Ideal para profesionales independientes y pequeños proyectos',
            features: [
                'Uso individual',
                '1 proyecto simultáneo',
                'Soporte básico',
                'Actualizaciones por 1 año',
                'Formatos: OBJ, FBX'
            ],
            color: '#3b82f6',
            multiplier: multipliers.personal,
            popular: false
        },
        {
            id: 'business',
            name: 'Empresarial',
            icon: <FiBriefcase />,
            price: exampleBasePrice * multipliers.business,
            description: 'Perfecto para estudios de arquitectura y equipos de trabajo',
            features: [
                'Hasta 5 usuarios',
                'Proyectos ilimitados',
                'Soporte prioritario',
                'Actualizaciones por 3 años',
                'Todos los formatos',
                'Modelos BIM incluidos'
            ],
            color: '#8b5cf6',
            multiplier: multipliers.business,
            popular: true
        },
        {
            id: 'unlimited',
            name: 'Ilimitada',
            icon: <FiStar />,
            price: exampleBasePrice * multipliers.unlimited,
            description: 'Para grandes empresas y uso corporativo sin restricciones',
            features: [
                'Usuarios ilimitados',
                'Proyectos ilimitados',
                'Soporte 24/7 dedicado',
                'Actualizaciones de por vida',
                'Todos los formatos premium',
                'Modelos personalizados',
                'API exclusiva'
            ],
            color: '#10b981',
            multiplier: multipliers.unlimited,
            popular: false
        }
    ];

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh'
        },
        header: {
            textAlign: 'center',
            marginBottom: isMobile ? '2rem' : '3rem'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.8rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
        },
        titleIcon: {
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '2.8rem'
        },
        subtitle: {
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: '#64748b',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
        },
        // Nota explicativa
        noteCard: {
            background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.primary}05 100%)`,
            borderRadius: '20px',
            padding: isMobile ? '1.5rem' : '2rem',
            marginBottom: '3rem',
            border: `1px solid ${colors.primary}20`,
            textAlign: 'center'
        },
        noteTitle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: colors.primary,
            marginBottom: '1rem'
        },
        noteText: {
            color: '#64748b',
            fontSize: isMobile ? '0.95rem' : '1rem',
            lineHeight: '1.6',
            maxWidth: '800px',
            margin: '0 auto'
        },
        noteExample: {
            display: 'inline-block',
            backgroundColor: 'white',
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            color: colors.dark,
            border: `1px solid ${colors.primary}30`,
            marginTop: '1rem'
        },
        // Grid de licencias
        grid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '1.5rem' : '2rem',
            marginBottom: '4rem'
        },
        card: {
            backgroundColor: colors.white,
            borderRadius: '32px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
            border: '1px solid #f0f0f0',
            position: 'relative',
            transition: 'all 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        },
        popularBadge: {
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 100%)`,
            color: 'white',
            padding: '0.5rem 2rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '600',
            letterSpacing: '0.5px',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
            whiteSpace: 'nowrap'
        },
        cardHeader: {
            textAlign: 'center',
            marginBottom: '2rem',
            position: 'relative'
        },
        iconWrapper: {
            width: isMobile ? '70px' : '80px',
            height: isMobile ? '70px' : '80px',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: isMobile ? '2rem' : '2.5rem',
            background: (color) => `${color}10`,
            color: (color) => color
        },
        licenseName: {
            fontSize: isMobile ? '1.8rem' : '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem'
        },
        priceContainer: {
            marginBottom: '1rem'
        },
        licensePrice: {
            fontSize: isMobile ? '2.5rem' : '3rem',
            fontWeight: '700',
            color: colors.primary,
            lineHeight: '1'
        },
        pricePeriod: {
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: 'normal',
            marginLeft: '0.25rem'
        },
        multiplier: {
            display: 'inline-block',
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginTop: '0.5rem'
        },
        description: {
            color: '#64748b',
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            padding: '0 1rem'
        },
        featuresList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            marginBottom: '2rem',
            flex: 1
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            color: colors.dark
        },
        featureIcon: {
            color: colors.success,
            fontSize: '1.2rem',
            flexShrink: 0
        },
        button: {
            width: '100%',
            padding: '1rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: `0 8px 20px ${colors.primary}30`,
            marginTop: 'auto'
        },
        buttonOutline: {
            backgroundColor: 'transparent',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            boxShadow: 'none'
        },
        // Tabla comparativa
        comparisonSection: {
            marginTop: '4rem',
            padding: isMobile ? '2rem 1rem' : '3rem',
            backgroundColor: '#f8fafc',
            borderRadius: '32px',
            border: '1px solid #f0f0f0'
        },
        comparisonTitle: {
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '2rem',
            textAlign: 'center'
        },
        comparisonGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '2rem'
        },
        comparisonCard: {
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '24px',
            border: '1px solid #e2e8f0'
        },
        comparisonPrice: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '1rem'
        },
        comparisonNote: {
            fontSize: '0.85rem',
            color: '#94a3b8',
            marginTop: '1rem',
            fontStyle: 'italic'
        },
        // FAQ
        faqSection: {
            marginTop: '4rem',
            padding: isMobile ? '2rem 1rem' : '3rem',
            backgroundColor: 'white',
            borderRadius: '32px',
            border: '1px solid #f0f0f0'
        },
        faqTitle: {
            fontSize: isMobile ? '1.8rem' : '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '2rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
        },
        faqGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1.5rem'
        },
        faqItem: {
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s'
        },
        faqQuestion: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        faqAnswer: {
            color: '#64748b',
            fontSize: '0.95rem',
            lineHeight: '1.6'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <motion.div
                style={styles.header}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={styles.title}>
                    <FiAward style={styles.titleIcon} />
                    Planes y Licencias
                </h1>
                <p style={styles.subtitle}>
                    Elige la licencia que mejor se adapte a tus necesidades. 
                    Todos los precios son por modelo y se multiplican según la licencia seleccionada.
                </p>
            </motion.div>

            {/* Nota explicativa */}
            <motion.div
                style={styles.noteCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div style={styles.noteTitle}>
                    <FiZap /> ¿Cómo funcionan los precios?
                </div>
                <p style={styles.noteText}>
                    Cada modelo 3D tiene su propio precio base. El costo final se calcula 
                    multiplicando ese precio base por el multiplicador de la licencia elegida.
                </p>
                <div style={styles.noteExample}>
                    💡 Ejemplo: Un modelo de ${exampleBasePrice} costaría:
                    Personal ${exampleBasePrice * multipliers.personal} · 
                    Empresarial ${exampleBasePrice * multipliers.business} · 
                    Ilimitada ${exampleBasePrice * multipliers.unlimited}
                </div>
            </motion.div>

            {/* Grid de licencias */}
            <div style={styles.grid}>
                {licenses.map((license, index) => (
                    <motion.div
                        key={license.id}
                        style={{
                            ...styles.card,
                            borderColor: license.popular ? license.color : '#f0f0f0',
                            boxShadow: license.popular ? `0 20px 40px ${license.color}20` : '0 20px 40px rgba(0,0,0,0.03)',
                            transform: license.popular ? 'scale(1.02)' : 'scale(1)',
                            zIndex: license.popular ? 2 : 1
                        }}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ 
                            y: -10, 
                            boxShadow: `0 30px 60px ${license.color}30`,
                            ...(license.popular ? { scale: 1.03 } : { scale: 1.02 })
                        }}
                    >
                        {license.popular && (
                            <motion.div 
                                style={styles.popularBadge}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.1, type: 'spring' }}
                            >
                                ⭐ MÁS POPULAR
                            </motion.div>
                        )}
                        
                        <div style={styles.cardHeader}>
                            <div style={{
                                ...styles.iconWrapper,
                                background: `${license.color}10`,
                                color: license.color
                            }}>
                                {license.icon}
                            </div>
                            <h2 style={styles.licenseName}>{license.name}</h2>
                            <div style={styles.priceContainer}>
                                <span style={styles.licensePrice}>
                                    ${license.price.toFixed(2)}
                                </span>
                                <span style={styles.pricePeriod}>/modelo</span>
                            </div>
                            <div style={styles.multiplier}>
                                Multiplicador: {license.multiplier}x
                            </div>
                            <p style={styles.description}>{license.description}</p>
                        </div>

                        <ul style={styles.featuresList}>
                            {license.features.map((feature, i) => (
                                <motion.li
                                    key={i}
                                    style={styles.featureItem}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                >
                                    <FiCheckCircle style={styles.featureIcon} />
                                    {feature}
                                </motion.li>
                            ))}
                        </ul>

                        <motion.button
                            style={{
                                ...styles.button,
                                ...(license.popular ? {} : styles.buttonOutline)
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onMouseEnter={(e) => {
                                if (!license.popular) {
                                    e.target.style.backgroundColor = license.color;
                                    e.target.style.color = 'white';
                                    e.target.style.borderColor = license.color;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!license.popular) {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = license.color;
                                    e.target.style.borderColor = license.color;
                                }
                            }}
                        >
                            Seleccionar {license.name}
                        </motion.button>
                    </motion.div>
                ))}
            </div>

            {/* Tabla comparativa de precios */}
            <motion.div
                style={styles.comparisonSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 style={styles.comparisonTitle}>Comparativa de precios</h2>
                <div style={styles.comparisonGrid}>
                    <div style={styles.comparisonCard}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Modelo Básico</h3>
                        <div style={styles.comparisonPrice}>$19.99</div>
                        <div>Personal: $19.99</div>
                        <div>Empresarial: $49.97</div>
                        <div>Ilimitada: $99.95</div>
                        <div style={styles.comparisonNote}>*Modelos simples de baja complejidad</div>
                    </div>
                    <div style={styles.comparisonCard}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Modelo Estándar</h3>
                        <div style={styles.comparisonPrice}>$49.99</div>
                        <div>Personal: $49.99</div>
                        <div>Empresarial: $124.97</div>
                        <div>Ilimitada: $249.95</div>
                        <div style={styles.comparisonNote}>*Modelos de complejidad media</div>
                    </div>
                    <div style={styles.comparisonCard}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Modelo Premium</h3>
                        <div style={styles.comparisonPrice}>$99.99</div>
                        <div>Personal: $99.99</div>
                        <div>Empresarial: $249.97</div>
                        <div>Ilimitada: $499.95</div>
                        <div style={styles.comparisonNote}>*Modelos complejos con detalles avanzados</div>
                    </div>
                </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div
                style={styles.faqSection}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h2 style={styles.faqTitle}>
                    <FiHelpCircle color={colors.primary} />
                    Preguntas frecuentes
                </h2>
                <div style={styles.faqGrid}>
                    {[
                        {
                            question: '¿Qué incluye cada licencia?',
                            answer: 'Cada licencia incluye acceso a los modelos 3D, soporte técnico y actualizaciones según el plan seleccionado. Los modelos se pueden descargar en múltiples formatos.'
                        },
                        {
                            question: '¿Cómo funcionan los multiplicadores?',
                            answer: 'El precio base de cada modelo se multiplica por el factor de la licencia (1x para Personal, 2.5x para Empresarial, 5x para Ilimitada). Así, los modelos más caros mantienen la proporción.'
                        },
                        {
                            question: '¿Puedo cambiar de licencia después?',
                            answer: 'Sí, puedes actualizar tu licencia en cualquier momento. La diferencia se prorratea y solo pagas la diferencia.'
                        },
                        {
                            question: '¿Las licencias son perpetuas?',
                            answer: 'Las licencias Personal y Empresarial incluyen actualizaciones por tiempo limitado. La licencia Ilimitada incluye actualizaciones de por vida.'
                        },
                        {
                            question: '¿Qué métodos de pago aceptan?',
                            answer: 'Aceptamos tarjetas de crédito/débito, PayPal, transferencias bancarias y criptomonedas para empresas.'
                        },
                        {
                            question: '¿Hay descuentos por volumen?',
                            answer: 'Sí, para compras de múltiples modelos o licencias empresariales, contáctanos para obtener un presupuesto personalizado.'
                        }
                    ].map((faq, index) => (
                        <motion.div
                            key={index}
                            style={styles.faqItem}
                            whileHover={{ x: 5, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.05 }}
                        >
                            <div style={styles.faqQuestion}>
                                <FiHelpCircle color={colors.primary} />
                                {faq.question}
                            </div>
                            <p style={styles.faqAnswer}>{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default PublicLicenses;