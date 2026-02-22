import React from 'react';
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
    FiStar 
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';

const PublicLicenses = () => {
    const licenses = [
        {
            id: 'personal',
            name: 'Personal',
            icon: <FiUsers />,
            price: 99.99,
            description: 'Ideal para profesionales independientes y pequeños proyectos',
            features: [
                'Uso individual',
                '1 proyecto simultáneo',
                'Soporte básico',
                'Actualizaciones por 1 año',
                'Formatos: OBJ, FBX'
            ],
            color: '#3b82f6',
            popular: false
        },
        {
            id: 'business',
            name: 'Empresarial',
            icon: <FiBriefcase />,
            price: 249.99,
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
            popular: true
        },
        {
            id: 'unlimited',
            name: 'Ilimitada',
            icon: <FiStar />,
            price: 499.99,
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
            popular: false
        }
    ];

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem'
        },
        header: {
            textAlign: 'center',
            marginBottom: '3rem'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem'
        },
        subtitle: {
            fontSize: '1.2rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: '0 auto'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
        },
        card: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0',
            position: 'relative',
            transition: 'all 0.3s'
        },
        popularBadge: {
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: colors.secondary,
            color: 'white',
            padding: '0.25rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600'
        },
        cardHeader: {
            textAlign: 'center',
            marginBottom: '2rem'
        },
        iconWrapper: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.8rem'
        },
        licenseName: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        licensePrice: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '1rem'
        },
        pricePeriod: {
            fontSize: '0.9rem',
            color: '#64748b',
            fontWeight: 'normal'
        },
        description: {
            color: '#64748b',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem'
        },
        featuresList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            marginBottom: '2rem'
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.75rem',
            fontSize: '0.95rem',
            color: colors.dark
        },
        featureIcon: {
            color: colors.success,
            fontSize: '1.1rem'
        },
        button: {
            width: '100%',
            padding: '1rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        buttonOutline: {
            backgroundColor: 'transparent',
            color: colors.primary,
            border: `2px solid ${colors.primary}`
        },
        faqSection: {
            marginTop: '4rem',
            padding: '2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px'
        },
        faqTitle: {
            fontSize: '1.8rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '2rem',
            textAlign: 'center'
        },
        faqGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '1.5rem'
        },
        faqItem: {
            backgroundColor: colors.white,
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        },
        faqQuestion: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem',
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
            <div style={styles.header}>
                <h1 style={styles.title}>Planes y Licencias</h1>
                <p style={styles.subtitle}>
                    Elige la licencia que mejor se adapte a tus necesidades
                </p>
            </div>

            <div style={styles.grid}>
                {licenses.map((license, index) => (
                    <motion.div
                        key={license.id}
                        style={{
                            ...styles.card,
                            borderColor: license.popular ? license.color : '#e2e8f0',
                            boxShadow: license.popular ? `0 10px 30px ${license.color}20` : 'none'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, boxShadow: `0 20px 40px ${license.color}30` }}
                    >
                        {license.popular && (
                            <div style={styles.popularBadge}>
                                Más popular
                            </div>
                        )}
                        
                        <div style={styles.cardHeader}>
                            <div style={{
                                ...styles.iconWrapper,
                                backgroundColor: license.color + '10',
                                color: license.color
                            }}>
                                {license.icon}
                            </div>
                            <h2 style={styles.licenseName}>{license.name}</h2>
                            <div style={styles.licensePrice}>
                                ${license.price} <span style={styles.pricePeriod}>/único</span>
                            </div>
                            <p style={styles.description}>{license.description}</p>
                        </div>

                        <ul style={styles.featuresList}>
                            {license.features.map((feature, i) => (
                                <li key={i} style={styles.featureItem}>
                                    <FiCheckCircle style={styles.featureIcon} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button 
                            style={{
                                ...styles.button,
                                ...(license.popular ? {} : styles.buttonOutline)
                            }}
                            onMouseEnter={(e) => {
                                if (!license.popular) {
                                    e.target.style.backgroundColor = colors.primary;
                                    e.target.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!license.popular) {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = colors.primary;
                                }
                            }}
                        >
                            Seleccionar {license.name}
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* FAQ Section */}
            <div style={styles.faqSection}>
                <h2 style={styles.faqTitle}>Preguntas frecuentes</h2>
                <div style={styles.faqGrid}>
                    {[
                        {
                            question: '¿Qué incluye cada licencia?',
                            answer: 'Cada licencia incluye acceso a los modelos 3D, soporte técnico y actualizaciones según el plan seleccionado.'
                        },
                        {
                            question: '¿Puedo cambiar de licencia después?',
                            answer: 'Sí, puedes actualizar tu licencia en cualquier momento. La diferencia se prorratea.'
                        },
                        {
                            question: '¿Las licencias son perpetuas?',
                            answer: 'Las licencias Personal y Empresarial incluyen actualizaciones por tiempo limitado. La licencia Ilimitada es perpetua.'
                        },
                        {
                            question: '¿Qué métodos de pago aceptan?',
                            answer: 'Aceptamos tarjetas de crédito/débito, PayPal y transferencias bancarias.'
                        }
                    ].map((faq, index) => (
                        <motion.div
                            key={index}
                            style={styles.faqItem}
                            whileHover={{ x: 5 }}
                        >
                            <div style={styles.faqQuestion}>
                                <FiHelpCircle color={colors.primary} />
                                {faq.question}
                            </div>
                            <p style={styles.faqAnswer}>{faq.answer}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PublicLicenses;