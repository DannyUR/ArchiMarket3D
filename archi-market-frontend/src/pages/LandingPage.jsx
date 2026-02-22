import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiEye, FiDownload, FiGrid } from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../services/api';
import { colors } from '../styles/theme';

const LandingPage = () => {
    const [featuredModels, setFeaturedModels] = useState([]);
    const [stats, setStats] = useState({
        models: 0,
        users: 0,
        downloads: 0
    });

    useEffect(() => {
        // Cargar modelos destacados (públicos)
        const fetchFeatured = async () => {
            try {
                const response = await API.get('/models/featured');
                setFeaturedModels(response.data.data || []);
            } catch (error) {
                console.log('Error cargando modelos');
            }
        };
        fetchFeatured();
        
        // Estadísticas simuladas
        setStats({
            models: 1500,
            users: 850,
            downloads: 12500
        });
    }, []);

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem'
        },
        hero: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '4rem',
            alignItems: 'center',
            marginBottom: '4rem',
            minHeight: '80vh'
        },
        heroContent: {
            paddingRight: '2rem'
        },
        heroTitle: {
            fontSize: '3.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem',
            lineHeight: '1.2'
        },
        heroHighlight: {
            color: colors.primary
        },
        heroSubtitle: {
            fontSize: '1.2rem',
            color: '#64748b',
            marginBottom: '2rem',
            lineHeight: '1.6'
        },
        heroButtons: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
        },
        primaryBtn: {
            backgroundColor: colors.primary,
            color: colors.white,
            padding: '1rem 2rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px'
        },
        secondaryBtn: {
            border: `2px solid ${colors.primary}`,
            color: colors.primary,
            padding: '1rem 2rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600'
        },
        stats: {
            display: 'flex',
            gap: '2rem',
            marginTop: '2rem'
        },
        statItem: {
            textAlign: 'center'
        },
        statNumber: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.primary
        },
        statLabel: {
            color: '#64748b',
            fontSize: '0.9rem'
        },
        heroImage: {
            width: '100%',
            height: 'auto',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
        },
        section: {
            marginBottom: '4rem'
        },
        sectionTitle: {
            fontSize: '2.5rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '2rem',
            textAlign: 'center'
        },
        features: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '4rem'
        },
        featureCard: {
            padding: '2rem',
            borderRadius: '15px',
            backgroundColor: colors.white,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            textAlign: 'center',
            transition: 'transform 0.3s'
        },
        featureIcon: {
            fontSize: '3rem',
            color: colors.primary,
            marginBottom: '1rem'
        },
        featureTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        modelsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
        },
        modelCard: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s',
            cursor: 'pointer',
            opacity: 0.9
        },
        modelImage: {
            width: '100%',
            height: '200px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.2rem',
            borderBottom: `3px solid ${colors.primary}`
        },
        modelInfo: {
            padding: '1.5rem'
        },
        modelName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        modelMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            color: '#64748b',
            fontSize: '0.9rem'
        },
        watermark: {
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: colors.white,
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
        }
    };

    return (
        <div style={styles.container}>
            {/* Hero Section */}
            <section style={styles.hero}>
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={styles.heroTitle}>
                        Modelos 3D profesionales para{' '}
                        <span style={styles.heroHighlight}>arquitectura y construcción</span>
                    </h1>
                    <p style={styles.heroSubtitle}>
                        Accede a la biblioteca más grande de modelos BIM, visualiza en realidad mixta 
                        y optimiza tus proyectos de construcción.
                    </p>
                    
                    <div style={styles.heroButtons}>
                        <Link to="/models" style={styles.primaryBtn}>
                            Explorar Modelos <FiArrowRight />
                        </Link>
                        <Link to="/register" style={styles.secondaryBtn}>
                            Comenzar Gratis
                        </Link>
                    </div>

                    <div style={styles.stats}>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{stats.models}+</div>
                            <div style={styles.statLabel}>Modelos</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{stats.users}+</div>
                            <div style={styles.statLabel}>Usuarios</div>
                        </div>
                        <div style={styles.statItem}>
                            <div style={styles.statNumber}>{stats.downloads.toLocaleString()}</div>
                            <div style={styles.statLabel}>Descargas</div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={styles.heroImage}>
                        <img 
                            src="/api/placeholder/600/400" 
                            alt="Modelos 3D"
                            style={{ width: '100%', borderRadius: '20px' }}
                        />
                    </div>
                </motion.div>
            </section>

            {/* Características */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>¿Por qué ArchiMarket3D?</h2>
                <div style={styles.features}>
                    {[
                        { icon: <HiOutlineCube />, title: 'Modelos BIM', desc: 'Archivos listos para usar en tus proyectos' },
                        { icon: <FiEye />, title: 'Realidad Mixta', desc: 'Visualiza antes de comprar' },
                        { icon: <FiDownload />, title: 'Descarga Inmediata', desc: 'Accede al instante después de la compra' },
                        { icon: <FiGrid />, title: 'Múltiples Formatos', desc: 'Compatible con todos los softwares' }
                    ].map((feat, idx) => (
                        <motion.div
                            key={idx}
                            style={styles.featureCard}
                            whileHover={{ y: -10 }}
                        >
                            <div style={styles.featureIcon}>{feat.icon}</div>
                            <h3 style={styles.featureTitle}>{feat.title}</h3>
                            <p style={{ color: '#64748b' }}>{feat.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Modelos Destacados (Vista Previa) */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>Modelos Destacados</h2>
                <div style={styles.modelsGrid}>
                    {[1, 2, 3, 4].map((item) => (
                        <motion.div
                            key={item}
                            style={styles.modelCard}
                            whileHover={{ y: -5 }}
                        >
                            <div style={{ position: 'relative' }}>
                                <div style={styles.modelImage}>
                                    Vista previa 3D
                                </div>
                                <div style={styles.watermark}>
                                    <FiEye /> Vista previa
                                </div>
                            </div>
                            <div style={styles.modelInfo}>
                                <h3 style={styles.modelName}>Casa Moderna {item}</h3>
                                <div style={styles.modelMeta}>
                                    <span>Formato: OBJ/FBX</span>
                                    <span>Tamaño: 45 MB</span>
                                </div>
                                <p style={{ color: colors.primary, fontWeight: '600', marginTop: '0.5rem' }}>
                                    Desde $99.99
                                </p>
                                <Link 
                                    to="/register" 
                                    style={{
                                        ...styles.primaryBtn,
                                        width: '100%',
                                        textAlign: 'center',
                                        marginTop: '1rem'
                                    }}
                                >
                                    Ver detalles
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section style={{
                ...styles.section,
                backgroundColor: colors.primary,
                padding: '4rem',
                borderRadius: '20px',
                color: colors.white,
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    ¿Listo para comenzar?
                </h2>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
                    Únete a miles de profesionales que ya confían en nosotros
                </p>
                <Link 
                    to="/register" 
                    style={{
                        backgroundColor: colors.white,
                        color: colors.primary,
                        padding: '1rem 3rem',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '1.2rem'
                    }}
                >
                    Crear cuenta gratis
                </Link>
            </section>
        </div>
    );
};

export default LandingPage;