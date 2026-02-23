import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowRight,
    FiEye,
    FiDownload,
    FiGrid,
    FiCube,
    FiUsers,
    FiStar,
    FiCheckCircle,
    FiMenu,
    FiX,
    FiLinkedin,
    FiTwitter,
    FiInstagram,
    FiYoutube
} from 'react-icons/fi';
import { HiOutlineCube, HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineLightBulb } from 'react-icons/hi';
import { BsArrowRightShort } from 'react-icons/bs';
import API from '../services/api';
import { colors } from '../styles/theme';

const LandingPage = () => {
    const [featuredModels, setFeaturedModels] = useState([]);
    const [stats, setStats] = useState({
        models: 0,
        users: 0,
        downloads: 0
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
            models: 2500,
            users: 1250,
            downloads: 18500
        });
    }, []);

    // Estilos específicos para el navbar responsive
    const navStyles = {
        navbar: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
            zIndex: 1000,
            borderBottom: '1px solid #e2e8f0'
        },
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: '700',
            color: colors.primary,
            textDecoration: 'none'
        },
        desktopMenu: {
            display: isMobile ? 'none' : 'flex',
            gap: '1rem',
            alignItems: 'center'
        },
        mobileMenuBtn: {
            display: isMobile ? 'block' : 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            color: colors.dark,
            zIndex: 1001
        },
        mobileMenu: {
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: mobileMenuOpen ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 999,
            borderBottom: `1px solid #e2e8f0`
        },
        loginBtn: {
            color: colors.primary,
            textDecoration: 'none',
            fontWeight: '600',
            padding: '0.5rem 1rem',
            fontSize: isMobile ? '1.1rem' : '1rem',
            display: 'inline-block'
        },
        registerBtn: {
            backgroundColor: colors.primary,
            color: colors.white,
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: isMobile ? '1.1rem' : '1rem',
            display: 'inline-block',
            textAlign: 'center'
        },
        mobileLink: {
            color: colors.dark,
            textDecoration: 'none',
            fontSize: '1.2rem',
            fontWeight: '500',
            padding: '1rem 0',
            borderBottom: '1px solid #e2e8f0',
            width: '100%',
            textAlign: 'center'
        }
    };

    const styles = {
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: '700',
            color: colors.primary,
            textDecoration: 'none', // ← Asegura que ningún logo tenga subrayado
            cursor: 'pointer'
        },
        logoHighlight: {
            color: colors.primary
        },
        loginBtn: {
            color: colors.primary,
            textDecoration: 'none',
            fontWeight: '600',
            marginRight: '1rem'
        },
        registerBtn: {
            backgroundColor: colors.primary,
            color: colors.white,
            padding: '0.6rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'all 0.3s'
        },
        mobileMenuBtn: {
            display: isMobile ? 'block' : 'none',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: colors.dark
        },
        mobileMenu: {
            position: 'fixed',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            display: mobileMenuOpen ? 'block' : 'none',
            zIndex: 999
        },
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '1rem' : '2rem',
            marginTop: isMobile ? '70px' : '80px'
        },
        // Hero section más visual
        hero: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2rem' : '4rem',
            alignItems: 'center',
            marginBottom: isMobile ? '3rem' : '5rem',
            minHeight: isMobile ? 'auto' : '80vh'
        },
        heroContent: {
            paddingRight: isMobile ? '0' : '2rem'
        },
        heroBadge: {
            display: 'inline-block',
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
        },
        heroTitle: {
            fontSize: isMobile ? '2.5rem' : '4rem',
            fontWeight: '800',
            color: colors.dark,
            marginBottom: '1.5rem',
            lineHeight: '1.1'
        },
        heroHighlight: {
            color: colors.primary,
            position: 'relative',
            display: 'inline-block'
        },
        heroSubtitle: {
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: '#64748b',
            marginBottom: '2rem',
            lineHeight: '1.6'
        },
        heroButtons: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem',
            marginBottom: '2rem'
        },
        primaryBtn: {
            backgroundColor: colors.primary,
            color: colors.white,
            padding: isMobile ? '0.8rem 1.5rem' : '1rem 2rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s',
            border: 'none',
            cursor: 'pointer'
        },
        secondaryBtn: {
            backgroundColor: 'transparent',
            color: colors.primary,
            padding: isMobile ? '0.8rem 1.5rem' : '1rem 2rem',
            borderRadius: '10px',
            textDecoration: 'none',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            border: `2px solid ${colors.primary}`,
            transition: 'all 0.3s'
        },
        stats: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: isMobile ? '1rem' : '2rem',
            marginTop: '2rem'
        },
        statItem: {
            textAlign: 'left'
        },
        statNumber: {
            fontSize: isMobile ? '1.5rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            lineHeight: '1.2'
        },
        statLabel: {
            color: '#64748b',
            fontSize: isMobile ? '0.8rem' : '0.9rem'
        },
        heroVisual: {
            position: 'relative',
            height: isMobile ? '300px' : '500px',
            background: 'linear-gradient(145deg, ' + colors.primary + '20 0%, ' + colors.primary + '05 100%)',
            borderRadius: '30px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        floatingCard: {
            position: 'absolute',
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            padding: '1rem',
            borderRadius: '15px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        section: {
            marginBottom: isMobile ? '4rem' : '6rem'
        },
        sectionTitle: {
            fontSize: isMobile ? '2rem' : '3rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem',
            textAlign: isMobile ? 'left' : 'center'
        },
        sectionSubtitle: {
            fontSize: isMobile ? '1rem' : '1.2rem',
            color: '#64748b',
            textAlign: isMobile ? 'left' : 'center',
            maxWidth: '700px',
            margin: '0 auto 3rem auto'
        },
        // Feature destacado: Realidad Mixta
        featureHighlight: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2rem' : '4rem',
            alignItems: 'center',
            marginBottom: '4rem'
        },
        featureContent: {
            order: isMobile ? 2 : 1
        },
        featureTag: {
            color: colors.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontSize: '0.9rem',
            marginBottom: '1rem'
        },
        featureTitle: {
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1.5rem',
            lineHeight: '1.3'
        },
        featureDesc: {
            color: '#64748b',
            fontSize: isMobile ? '1rem' : '1.1rem',
            marginBottom: '2rem',
            lineHeight: '1.8'
        },
        featureList: {
            listStyle: 'none',
            padding: 0
        },
        featureListItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            color: colors.dark
        },
        checkIcon: {
            color: colors.primary,
            fontSize: '1.2rem'
        },
        featureVisual: {
            order: isMobile ? 1 : 2,
            position: 'relative',
            height: isMobile ? '300px' : '400px',
            background: 'linear-gradient(135deg, ' + colors.primary + ' 0%, ' + colors.primary + '80 100%)',
            borderRadius: '30px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.white
        },
        // Categorías
        categories: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '3rem'
        },
        categoryCard: {
            backgroundColor: colors.white,
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            textAlign: 'center',
            transition: 'all 0.3s',
            cursor: 'pointer',
            border: '1px solid #f0f0f0'
        },
        categoryIcon: {
            fontSize: '2.5rem',
            color: colors.primary,
            marginBottom: '1rem'
        },
        categoryTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        categoryCount: {
            color: '#64748b',
            fontSize: '0.9rem'
        },
        // Modelos grid
        modelsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '2rem'
        },
        modelCard: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s',
            cursor: 'pointer',
            border: '1px solid #f0f0f0'
        },
        modelImage: {
            width: '100%',
            height: '200px',
            background: 'linear-gradient(145deg, ' + colors.primary + '20 0%, ' + colors.primary + '05 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        modelPreview: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'rgba(255,255,255,0.9)',
            padding: '0.4rem 0.8rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: colors.dark,
            fontWeight: '500',
            backdropFilter: 'blur(5px)'
        },
        modelInfo: {
            padding: '1.5rem'
        },
        modelCategory: {
            color: colors.primary,
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: '0.5rem'
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
            fontSize: '0.85rem',
            marginBottom: '1rem'
        },
        modelPrice: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: colors.primary
        },
        // Testimonios
        testimonials: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '2rem'
        },
        testimonialCard: {
            backgroundColor: colors.white,
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            border: '1px solid #f0f0f0'
        },
        testimonialText: {
            color: colors.dark,
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            fontStyle: 'italic'
        },
        testimonialAuthor: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        authorAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: colors.primary + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontWeight: '600'
        },
        authorInfo: {
            flex: 1
        },
        authorName: {
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.2rem'
        },
        authorRole: {
            color: '#64748b',
            fontSize: '0.85rem'
        },
        rating: {
            display: 'flex',
            gap: '0.2rem',
            color: '#FFB800',
            marginBottom: '1rem'
        },
        // CTA Final
        ctaSection: {
            background: 'linear-gradient(135deg, ' + colors.primary + ' 0%, ' + colors.primary + 'CC 100%)',
            padding: isMobile ? '3rem 2rem' : '4rem',
            borderRadius: '30px',
            textAlign: 'center',
            color: colors.white
        },
        ctaTitle: {
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem'
        },
        ctaText: {
            fontSize: isMobile ? '1rem' : '1.2rem',
            opacity: 0.9,
            marginBottom: '2rem',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
        },
        ctaBtn: {
            backgroundColor: colors.white,
            color: colors.primary,
            padding: '1rem 3rem',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: isMobile ? '1rem' : '1.1rem',
            display: 'inline-block',
            transition: 'transform 0.3s'
        },
        // Footer styles - CORREGIDO (sin huecos y esquinas redondas arriba)
        footer: {
            backgroundColor: '#0A1929',
            color: colors.white,
            padding: isMobile ? '3rem 1.5rem 0' : '4rem 2rem 0',
            marginTop: '4rem',
            width: '100%',
            borderTopLeftRadius: '30px',      // ← Esquina redonda arriba izquierda
            borderTopRightRadius: '30px',     // ← Esquina redonda arriba derecha
            borderBottomLeftRadius: 0,         // ← Sin redondear abajo
            borderBottomRightRadius: 0,        // ← Sin redondear abajo
            boxSizing: 'border-box'
        },
        footerContainer: {
            maxWidth: '1200px',
            margin: '0 auto',
            width: '100%'
        },
        footerGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
            gap: isMobile ? '2rem' : '3rem',
            marginBottom: '3rem'
        },
        footerCol: {
            display: 'flex',
            flexDirection: 'column'
        },
        footerText: {
            color: '#94a3b8',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            marginBottom: '1.5rem',
            maxWidth: '300px'
        },
        footerTitle: {
            color: colors.white,
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '1.5rem'
        },
        footerList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        footerLink: {
            color: '#94a3b8',
            textDecoration: 'none',
            fontSize: '0.95rem',
            lineHeight: '2.2',
            transition: 'color 0.3s',
            cursor: 'pointer',
            display: 'inline-block',
            ':hover': {
                color: colors.primary
            }
        },
        footerDivider: {
            height: '1px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            marginBottom: '2rem',
            width: '100%'
        },
        footerBottom: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            paddingBottom: isMobile ? '2rem' : '2.5rem' // Espacio inferior solo aquí
        },
        copyright: {
            color: '#94a3b8',
            fontSize: '0.9rem',
            margin: 0
        },
        footerBadges: {
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        footerBadge: {
            color: '#94a3b8',
            fontSize: '0.9rem',
            textDecoration: 'none',
            transition: 'color 0.3s',
            cursor: 'pointer',
            ':hover': {
                color: colors.primary
            }
        }
    };

    return (
        <>
            {/* Navbar Responsive para LandingPage */}
            <nav style={navStyles.navbar}>
                <div style={navStyles.container}>
                    {/* Logo */}
                    <Link to="/" style={navStyles.logo}>
                        <HiOutlineCube size={isMobile ? 28 : 32} />
                        <span>ArchiMarket3D</span>
                    </Link>

                    {/* Menú para desktop */}
                    <div style={navStyles.desktopMenu}>
                        <Link to="/login" style={navStyles.loginBtn}>Iniciar Sesión</Link>
                        <Link to="/register" style={navStyles.registerBtn}>Registrarse</Link>
                    </div>

                    {/* Botón menú hamburguesa (móvil) */}
                    <button
                        style={navStyles.mobileMenuBtn}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>

                {/* Menú desplegable para móvil */}
                {mobileMenuOpen && (
                    <div style={navStyles.mobileMenu}>
                        <Link
                            to="/login"
                            style={navStyles.mobileLink}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Iniciar Sesión
                        </Link>
                        <Link
                            to="/register"
                            style={{
                                ...navStyles.mobileLink,
                                color: colors.primary,
                                fontWeight: '600'
                            }}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Registrarse
                        </Link>
                    </div>
                )}
            </nav>

            <div style={styles.container}>
                {/* Hero Section - Más visual */}
                <section style={styles.hero}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={styles.heroContent}
                    >
                        <div style={styles.heroBadge}>
                            🚀 Plataforma B2B para construcción
                        </div>
                        <h1 style={styles.heroTitle}>
                            Visualiza en{' '}
                            <span style={styles.heroHighlight}>
                                Realidad Mixta
                            </span>{' '}
                            antes de comprar
                        </h1>
                        <p style={styles.heroSubtitle}>
                            La primera plataforma que te permite ver y validar modelos 3D en tu obra
                            antes de adquirirlos. Reduce errores, retrabajos y sobrecostos.
                        </p>

                        <div style={styles.heroButtons}>
                            <Link to="/register" style={styles.primaryBtn}>
                                Comenzar gratis <FiArrowRight />
                            </Link>
                            <Link to="/register" style={styles.secondaryBtn}>
                                Explorar modelos <BsArrowRightShort />
                            </Link>
                        </div>

                        <div style={styles.stats}>
                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>{stats.models}+</div>
                                <div style={styles.statLabel}>Modelos 3D</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>{stats.users}+</div>
                                <div style={styles.statLabel}>Empresas</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statNumber}>{stats.downloads.toLocaleString()}</div>
                                <div style={styles.statLabel}>Descargas</div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={styles.heroVisual}
                    >
                        <div style={{
                            ...styles.floatingCard,
                            top: '20%',
                            left: '10%'
                        }}>
                            <FiEye color={colors.primary} size={24} />
                            <span>Vista previa en RM</span>
                        </div>
                        <div style={{
                            ...styles.floatingCard,
                            bottom: '20%',
                            right: '10%'
                        }}>
                            <FiDownload color={colors.primary} size={24} />
                            <span>Descarga inmediata</span>
                        </div>
                        <HiOutlineCube size={100} color={colors.white} style={{ opacity: 0.5 }} />
                    </motion.div>
                </section>

                {/* Feature Highlight: Realidad Mixta */}
                <section style={styles.section}>
                    <div style={styles.featureHighlight}>
                        <div style={styles.featureContent}>
                            <div style={styles.featureTag}>Tecnología exclusiva</div>
                            <h2 style={styles.featureTitle}>
                                Ver antes de comprar,<br />
                                <span style={{ color: colors.primary }}>en tu obra</span>
                            </h2>
                            <p style={styles.featureDesc}>
                                Con nuestra tecnología de realidad mixta, puedes visualizar cualquier modelo
                                3D en el contexto real de tu construcción antes de comprarlo. Asegura que las
                                dimensiones, materiales y acabados sean los correctos.
                            </p>
                            <ul style={styles.featureList}>
                                {[
                                    'Visualización en escala real',
                                    'Integración con BIM',
                                    'Validación de dimensiones',
                                    'Compatibilidad con HoloLens y móviles'
                                ].map((item, idx) => (
                                    <li key={idx} style={styles.featureListItem}>
                                        <FiCheckCircle style={styles.checkIcon} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div style={styles.featureVisual}>
                            <FiEye size={80} />
                        </div>
                    </div>
                </section>

                {/* Categorías */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Explora por categoría</h2>
                    <p style={styles.sectionSubtitle}>
                        Más de 2,500 modelos BIM profesionales organizados para tu próximo proyecto
                    </p>
                    <div style={styles.categories}>
                        {[
                            { icon: <HiOutlineOfficeBuilding />, name: 'Estructuras', count: 850 },
                            { icon: <HiOutlineHome />, name: 'Arquitectura', count: 1200 },
                            { icon: <HiOutlineLightBulb />, name: 'Instalaciones', count: 450 },
                            { icon: <HiOutlineCube />, name: 'Mobiliario', count: 600 }
                        ].map((cat, idx) => (
                            <motion.div
                                key={idx}
                                style={styles.categoryCard}
                                whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                            >
                                <div style={styles.categoryIcon}>{cat.icon}</div>
                                <h3 style={styles.categoryTitle}>{cat.name}</h3>
                                <div style={styles.categoryCount}>{cat.count} modelos</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Modelos Destacados - AHORA CON DATOS REALES */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Modelos destacados</h2>
                    <p style={styles.sectionSubtitle}>
                        Los modelos más populares entre arquitectos e ingenieros
                    </p>
                    <div style={styles.modelsGrid}>
                        {featuredModels.length > 0 ? (
                            featuredModels.slice(0, 4).map((model, idx) => (
                                <motion.div
                                    key={model.id || idx}
                                    style={styles.modelCard}
                                    whileHover={{ y: -5 }}
                                    onClick={() => window.location.href = `/models/${model.id}`}
                                >
                                    <div style={styles.modelImage}>
                                        {model.preview_image ? (
                                            <img
                                                src={model.preview_image}
                                                alt={model.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <HiOutlineCube size={50} color={colors.primary} />
                                        )}
                                        <div style={styles.modelPreview}>
                                            <FiEye size={14} /> Vista previa 3D
                                        </div>
                                    </div>
                                    <div style={styles.modelInfo}>
                                        <div style={styles.modelCategory}>
                                            {model.category_name || model.category || 'Estructural'}
                                        </div>
                                        <h3 style={styles.modelName}>
                                            {model.name || `Modelo Profesional ${idx + 1}`}
                                        </h3>
                                        <div style={styles.modelMeta}>
                                            <span>Formato: {model.format || 'OBJ/FBX'}</span>
                                            <span>{model.file_size || '45'} MB</span>
                                        </div>
                                        <div style={styles.modelPrice}>
                                            ${model.price ? Number(model.price).toFixed(2) : '99.99'}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            // Skeleton loading mientras cargan
                            [1, 2, 3, 4].map((item) => (
                                <div key={item} style={styles.modelCard}>
                                    <div style={{ ...styles.modelImage, backgroundColor: '#f0f0f0' }} />
                                    <div style={styles.modelInfo}>
                                        <div style={{ height: '20px', backgroundColor: '#f0f0f0', marginBottom: '10px' }} />
                                        <div style={{ height: '15px', backgroundColor: '#f0f0f0', width: '60%' }} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <Link to="/register" style={styles.secondaryBtn}>
                            Ver todos los modelos <FiArrowRight />
                        </Link>
                    </div>
                </section>

                {/* Testimonios */}
                <section style={styles.section}>
                    <h2 style={styles.sectionTitle}>Lo que dicen nuestros clientes</h2>
                    <p style={styles.sectionSubtitle}>
                        Arquitectos e ingenieros de las mejores constructoras confían en nosotros
                    </p>
                    <div style={styles.testimonials}>
                        {[
                            {
                                name: 'Carlos Rodríguez',
                                role: 'Arquitecto, Grupo Constructor',
                                text: 'La realidad mixta nos ha ahorrado miles de pesos en retrabajos. Ver los modelos en obra antes de comprar es revolucionario.',
                                rating: 5
                            },
                            {
                                name: 'María Fernández',
                                role: 'Ingeniera Civil',
                                text: 'La calidad de los modelos BIM es excepcional. Todo está listo para usar en nuestros proyectos.',
                                rating: 5
                            },
                            {
                                name: 'Juan Pablo Torres',
                                role: 'Desarrollador Inmobiliario',
                                text: 'Plataforma indispensable para cualquier proyecto de construcción. El ahorro en tiempo es enorme.',
                                rating: 5
                            }
                        ].map((testimonial, idx) => (
                            <div key={idx} style={styles.testimonialCard}>
                                <div style={styles.rating}>
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <FiStar key={i} fill="#FFB800" />
                                    ))}
                                </div>
                                <p style={styles.testimonialText}>"{testimonial.text}"</p>
                                <div style={styles.testimonialAuthor}>
                                    <div style={styles.authorAvatar}>
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div style={styles.authorInfo}>
                                        <div style={styles.authorName}>{testimonial.name}</div>
                                        <div style={styles.authorRole}>{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Final */}
                <section style={styles.ctaSection}>
                    <h2 style={styles.ctaTitle}>¿Listo para transformar tus proyectos?</h2>
                    <p style={styles.ctaText}>
                        Únete a más de 1,200 empresas que ya están construyendo mejor con ArchiMarket3D
                    </p>
                    <Link to="/register" style={styles.ctaBtn}>
                        Crear cuenta gratuita
                    </Link>
                </section>

                {/* Footer - SIN ESPACIO Y CON ESQUINAS REDONDAS */}
                <footer style={styles.footer}>
                    <div style={styles.footerContainer}>
                        <div style={styles.footerGrid}>
                            {/* Columna 1: Logo y descripción */}
                            <div style={styles.footerCol}>
                                <Link
                                    to="/"
                                    style={{
                                        ...styles.logo,
                                        marginBottom: '1rem',
                                        display: 'inline-block',
                                        textDecoration: 'none',
                                        color: colors.white // Logo en blanco para footer oscuro
                                    }}
                                >
                                    Archi<span style={{ color: colors.primary }}>Market3D</span>
                                </Link>
                                <p style={styles.footerText}>
                                    La primera plataforma B2B de modelos 3D para construcción con visualización en realidad mixta.
                                </p>
                            </div>

                            {/* Columna 2: Producto */}
                            <div style={styles.footerCol}>
                                <h4 style={styles.footerTitle}>Producto</h4>
                                <ul style={styles.footerList}>
                                    <li><Link to="/models" style={styles.footerLink}>Modelos 3D</Link></li>
                                    <li><Link to="/categories" style={styles.footerLink}>Categorías</Link></li>
                                    <li><Link to="/pricing" style={styles.footerLink}>Precios y licencias</Link></li>
                                    <li><Link to="/featured" style={styles.footerLink}>Destacados</Link></li>
                                </ul>
                            </div>

                            {/* Columna 3: Empresa */}
                            <div style={styles.footerCol}>
                                <h4 style={styles.footerTitle}>Empresa</h4>
                                <ul style={styles.footerList}>
                                    <li><Link to="/about" style={styles.footerLink}>Sobre nosotros</Link></li>
                                    <li><Link to="/blog" style={styles.footerLink}>Blog</Link></li>
                                    <li><Link to="/contact" style={styles.footerLink}>Contacto</Link></li>
                                    <li><Link to="/careers" style={styles.footerLink}>Trabaja con nosotros</Link></li>
                                </ul>
                            </div>

                            {/* Columna 4: Soporte */}
                            <div style={styles.footerCol}>
                                <h4 style={styles.footerTitle}>Soporte</h4>
                                <ul style={styles.footerList}>
                                    <li><Link to="/help" style={styles.footerLink}>Centro de ayuda</Link></li>
                                    <li><Link to="/faq" style={styles.footerLink}>FAQ</Link></li>
                                    <li><Link to="/terms" style={styles.footerLink}>Términos y condiciones</Link></li>
                                    <li><Link to="/privacy" style={styles.footerLink}>Privacidad</Link></li>
                                </ul>
                            </div>
                        </div>

                        {/* Línea divisoria */}
                        <div style={styles.footerDivider} />

                        {/* Copyright y badges */}
                        <div style={styles.footerBottom}>
                            <p style={styles.copyright}>
                                © 2026 ArchiMarket3D. Todos los derechos reservados.
                            </p>
                            <div style={styles.footerBadges}>
                                <span style={styles.footerBadge}>Pago seguro</span>
                                <span style={styles.footerBadge}>Modelos certificados</span>
                                <span style={styles.footerBadge}>Soporte 24/7</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default LandingPage;