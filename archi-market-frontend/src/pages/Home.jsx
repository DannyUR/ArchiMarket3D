import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiArrowRight,
    FiClock,
    FiTrendingUp,
    FiCalendar,
    FiEye,
    FiAward,
    FiZap,
    FiCompass,
    FiMapPin
} from 'react-icons/fi';
import { colors } from '../styles/theme';
import API from '../services/api';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [featuredModels, setFeaturedModels] = useState([]);
    const [trendingCategories, setTrendingCategories] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);

    // Detectar móvil y saludo con hora actualizada
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);

        const hour = new Date().getHours();
        if (hour < 12) setGreeting('🌅 Buenos días');
        else if (hour < 19) setGreeting('☀️ Buenas tardes');
        else setGreeting('🌙 Buenas noches');

        return () => {
            window.removeEventListener('resize', checkMobile);
            clearInterval(timer);
        };
    }, []);

    // Cargar datos con Promise.all (OPTIMIZADO)
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const startTime = performance.now();
            
            try {
                // 📌 TODAS LAS LLAMADAS EN PARALELO - MUCHO MÁS RÁPIDO
                const [userRes, featuredRes, categoriesRes] = await Promise.all([
                    API.get('/auth/me').catch(err => {
                        console.log('Error cargando usuario:', err);
                        return { data: { data: { user: null } } };
                    }),
                    API.get('/models/featured?limit=8').catch(err => {
                        console.log('No hay modelos destacados o error:', err);
                        return { data: { data: [] } };
                    }),
                    API.get('/categories').catch(err => {
                        console.log('Error cargando categorías:', err);
                        return { data: { data: [] } };
                    })
                ]);

                // Usuario
                const userData = userRes.data.data?.user || userRes.data.user || userRes.data;
                setUser(userData);

                // Modelos destacados
                setFeaturedModels(featuredRes.data.data || []);

                // Categorías populares
                const allCats = categoriesRes.data.data || categoriesRes.data || [];
                const topCats = allCats
                    .filter(cat => cat.models_count > 0)
                    .sort((a, b) => b.models_count - a.models_count)
                    .slice(0, 3)
                    .map(cat => ({
                        id: cat.id,
                        name: cat.name,
                        count: cat.models_count,
                        color: getCategoryColor(cat.name),
                        icon: getCategoryEmoji(cat.name)
                    }));
                setTrendingCategories(topCats);

            } catch (error) {
                console.error('Error general:', error);
            } finally {
                setIsLoading(false);
                const endTime = performance.now();
                console.log(`✅ Home cargado en ${((endTime - startTime) / 1000).toFixed(2)} segundos`);
            }
        };

        fetchData();
    }, []);

    // Función para obtener color de categoría (igual que en ModelList)
    const getCategoryColor = (category) => {
        if (!category) return '#3b82f6';
        const catId = typeof category === 'object' ? category?.id : category;
        const colorMap = {
            1: '#3b82f6', 2: '#10b981', 3: '#f59e0b', 4: '#ef4444', 5: '#8b5cf6',
            6: '#ec4899', 7: '#06b6d4', 8: '#6366f1', 9: '#14b8a6', 10: '#f97316',
        };
        return colorMap[catId] || '#3b82f6';
    };

    // Función para obtener emoji por categoría (IGUAL que en ModelList)
    const getCategoryEmoji = (categoryName) => {
        const icons = {
            'Estructuras de Acero': '🏗️',
            'Estructuras de Concreto': '🏗️',
            'Cimentaciones': '🏗️',
            'Elementos Portantes': '🏗️',
            'Arquitectura Residencial': '🏠',
            'Arquitectura Comercial': '🏢',
            'Fachadas y Cerramientos': '🏛️',
            'Cubiertas y Azoteas': '🏠',
            'Sistemas Eléctricos': '⚡',
            'Fontanería y Tuberías': '🔧',
            'HVAC (Climatización)': '❄️',
            'Protección Contra Incendios': '🔥',
            'Mobiliario de Oficina': '🪑',
            'Mobiliario Residencial': '🛋️',
            'Mobiliario Urbano': '🚏',
            'Equipamiento': '⚙️',
            'Equipo Pesado': '🏗️',
            'Maquinaria Industrial': '🏭',
            'Equipo de Construcción': '🚜',
            'Infraestructura Vial': '🛣️',
            'Espacios Públicos': '🏞️',
            'Paisajismo': '🌳',
            'Redes de Servicio': '🔌'
        };
        return icons[categoryName] || '📦';
    };

    const formatPrice = (price) => {
        if (!price) return '$0';
        const num = typeof price === 'number' ? price : parseFloat(price);
        return isNaN(num) ? '$0' : `$${num.toFixed(2)}`;
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100, damping: 12 }
        }
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh',
            background: '#ffffff',
            position: 'relative'
        },
        // Header premium con hora
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        greetingSection: {
            flex: 1
        },
        greeting: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.5rem',
            lineHeight: '1.2'
        },
        userName: {
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}dd)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        timeBox: {
            background: '#f8fafc',
            padding: '0.8rem 1.5rem',
            borderRadius: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '1.2rem',
            border: '1px solid #f0f0f0'
        },
        timeItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        timeIcon: {
            color: colors.primary,
            fontSize: '1.2rem'
        },
        timeText: {
            color: colors.dark,
            fontWeight: '500',
            fontSize: '0.95rem'
        },
        timeDivider: {
            width: '1px',
            height: '20px',
            background: '#e2e8f0'
        },
        // Banner principal
        mainBanner: {
            background: 'linear-gradient(135deg, #0A1929 0%, #1A2B3F 100%)',
            borderRadius: '30px',
            padding: isMobile ? '2rem' : '2.5rem',
            marginBottom: '3rem',
            color: 'white',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '2rem',
            position: 'relative',
            overflow: 'hidden'
        },
        bannerContent: {
            flex: 1,
            zIndex: 2
        },
        bannerTag: {
            display: 'inline-block',
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            padding: '0.4rem 1.2rem',
            borderRadius: '40px',
            fontSize: '0.8rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            border: '1px solid rgba(255,255,255,0.2)'
        },
        bannerTitle: {
            fontSize: isMobile ? '1.8rem' : '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            lineHeight: '1.2'
        },
        bannerHighlight: {
            color: colors.primary,
            position: 'relative',
            display: 'inline-block'
        },
        bannerText: {
            color: 'rgba(255,255,255,0.8)',
            fontSize: '1rem',
            lineHeight: '1.6',
            maxWidth: '500px',
            marginBottom: '1.5rem'
        },
        bannerStats: {
            display: 'flex',
            gap: '2rem'
        },
        bannerStat: {
            textAlign: 'center'
        },
        bannerStatNumber: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white'
        },
        bannerStatLabel: {
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)'
        },
        bannerButton: {
            background: colors.primary,
            color: 'white',
            border: 'none',
            padding: '1rem 2rem',
            borderRadius: '40px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 10px 20px ${colors.primary}40`,
            transition: 'all 0.3s',
            whiteSpace: 'nowrap',
            zIndex: 2
        },
        bannerGradient: {
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: colors.primary + '20',
            filter: 'blur(60px)',
            zIndex: 1
        },
        // Secciones
        section: {
            marginBottom: '4rem'
        },
        sectionHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        sectionIcon: {
            color: colors.primary,
            fontSize: '1.8rem'
        },
        viewAllLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: colors.primary,
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            background: 'rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s',
            ':hover': {
                background: 'rgba(59, 130, 246, 0.2)',
                gap: '0.5rem'
            }
        },
        // Grid de modelos
        modelsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '1.5rem'
        },
        modelCard: {
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            cursor: 'pointer',
            transition: 'all 0.3s',
            position: 'relative'
        },
        modelImage: {
            height: '160px',
            background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        },
        modelBadge: {
            position: 'absolute',
            top: '0.8rem',
            right: '0.8rem',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(5px)',
            padding: '0.3rem 0.8rem',
            borderRadius: '30px',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem'
        },
        featuredBadge: {
            position: 'absolute',
            top: '0.8rem',
            left: '0.8rem',
            background: colors.primary,
            color: 'white',
            padding: '0.3rem 0.8rem',
            borderRadius: '30px',
            fontSize: '0.7rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            boxShadow: `0 2px 8px ${colors.primary}30`,
            zIndex: 2
        },
        modelInfo: {
            padding: '1rem'
        },
        modelCategory: {
            fontSize: '0.7rem',
            color: colors.primary,
            fontWeight: '600',
            textTransform: 'uppercase',
            marginBottom: '0.3rem'
        },
        modelName: {
            fontSize: '0.95rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
        },
        modelMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#64748b'
        },
        modelPrice: {
            fontWeight: '700',
            color: colors.primary
        },
        // Categorías destacadas
        categoriesGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1.5rem'
        },
        categoryCard: {
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid #f0f0f0',
            cursor: 'pointer',
            transition: 'all 0.3s',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            ':hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 20px 30px rgba(59,130,246,0.1)'
            }
        },
        categoryEmoji: {
            fontSize: '3rem',
            marginBottom: '1rem'
        },
        categoryName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        categoryCount: {
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '1rem'
        },
        categoryTrend: {
            display: 'inline-block',
            background: '#10b98110',
            color: '#10b981',
            padding: '0.2rem 1rem',
            borderRadius: '30px',
            fontSize: '0.8rem',
            fontWeight: '600'
        },
        // Loading skeletons
        skeleton: {
            background: '#f0f0f0',
            borderRadius: '20px',
            height: '280px',
            animation: 'pulse 1.5s ease-in-out infinite'
        },
        skeletonCategory: {
            background: '#f0f0f0',
            borderRadius: '20px',
            height: '200px',
            animation: 'pulse 1.5s ease-in-out infinite'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header premium con hora */}
            <div style={styles.header}>
                <div style={styles.greetingSection}>
                    <h1 style={styles.greeting}>
                        {greeting}, <span style={styles.userName}>{user?.name?.split(' ')[0] || 'Usuario'}</span>
                    </h1>
                    <div style={styles.timeBox}>
                        <div style={styles.timeItem}>
                            <FiCalendar style={styles.timeIcon} />
                            <span style={styles.timeText}>
                                {currentTime.toLocaleDateString('es-MX', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long'
                                })}
                            </span>
                        </div>
                        <div style={styles.timeDivider} />
                        <div style={styles.timeItem}>
                            <FiClock style={styles.timeIcon} />
                            <span style={styles.timeText}>
                                {formatTime(currentTime)} hrs
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner principal */}
            <motion.div 
                style={styles.mainBanner}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div style={styles.bannerGradient} />
                <div style={styles.bannerContent}>
                    <div style={styles.bannerTag}>✨ CURADOS PARA TI</div>
                    <h2 style={styles.bannerTitle}>
                        Modelos <span style={styles.bannerHighlight}>Destacados</span> por expertos
                    </h2>
                    <p style={styles.bannerText}>
                        Nuestro equipo selecciona los mejores modelos para garantizar calidad y precisión en tus proyectos.
                    </p>
                    <div style={styles.bannerStats}>
                        <div style={styles.bannerStat}>
                            <div style={styles.bannerStatNumber}>{featuredModels.length}+</div>
                            <div style={styles.bannerStatLabel}>Destacados</div>
                        </div>
                        <div style={styles.bannerStat}>
                            <div style={styles.bannerStatNumber}>236</div>
                            <div style={styles.bannerStatLabel}>Modelos totales</div>
                        </div>
                    </div>
                </div>
                <motion.button 
                    style={styles.bannerButton}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/models')}
                >
                    Explorar catálogo <FiArrowRight />
                </motion.button>
            </motion.div>

            {/* Categorías destacadas */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitle}>
                        <FiCompass style={styles.sectionIcon} /> Categorías populares
                    </div>
                </div>

                <motion.div 
                    style={styles.categoriesGrid}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {isLoading ? (
                        [1,2,3].map(i => <div key={i} style={styles.skeletonCategory} />)
                    ) : trendingCategories.length > 0 ? (
                        trendingCategories.map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                style={styles.categoryCard}
                                variants={itemVariants}
                                whileHover={{ y: -5 }}
                                onClick={() => navigate(`/categories/${cat.id}`)}
                            >
                                <div style={styles.categoryEmoji}>{cat.icon}</div>
                                <h3 style={styles.categoryName}>{cat.name}</h3>
                                <div style={styles.categoryCount}>{cat.count} modelos</div>
                                <div style={styles.categoryTrend}>🔥 Popular</div>
                            </motion.div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                            <p style={{ color: '#64748b' }}>Cargando categorías...</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* MODELOS DESTACADOS */}
            <div style={styles.section}>
                <div style={styles.sectionHeader}>
                    <div style={styles.sectionTitle}>
                        <FiAward style={styles.sectionIcon} /> Modelos Destacados
                    </div>
                    <div style={styles.viewAllLink} onClick={() => navigate('/models')}>
                        Ver todos <FiArrowRight />
                    </div>
                </div>

                <motion.div 
                    style={styles.modelsGrid}
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {isLoading ? (
                        [1,2,3,4].map(i => <div key={i} style={styles.skeleton} />)
                    ) : featuredModels.length > 0 ? (
                        featuredModels.slice(0, 8).map((model, idx) => {
                            const categoryName = typeof model.category === 'object'
                                ? model.category?.name || 'Modelo 3D'
                                : model.category || 'Modelo 3D';
                            const emoji = getCategoryEmoji(categoryName);

                            return (
                                <motion.div
                                    key={model.id}
                                    style={styles.modelCard}
                                    variants={itemVariants}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate(`/models/${model.id}`)}
                                >
                                    <div style={styles.modelImage}>
                                        <div style={{ fontSize: '3rem' }}>{emoji}</div>
                                        <div style={styles.featuredBadge}>
                                            <FiZap size={10} /> Destacado
                                        </div>
                                        <div style={styles.modelBadge}>
                                            <FiEye size={10} /> Vista 3D
                                        </div>
                                    </div>
                                    <div style={styles.modelInfo}>
                                        <div style={styles.modelCategory}>
                                            {categoryName}
                                        </div>
                                        <div style={styles.modelName}>{model.name}</div>
                                        <div style={styles.modelMeta}>
                                            <span>{model.format || 'GLTF'}</span>
                                            <span style={styles.modelPrice}>{formatPrice(model.price)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✨</div>
                            <h3 style={{ marginTop: '1rem', color: colors.dark }}>Próximamente modelos destacados</h3>
                            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                Mientras tanto, explora nuestro catálogo completo
                            </p>
                            <motion.button
                                style={{
                                    ...styles.bannerButton,
                                    marginTop: '1.5rem',
                                    background: colors.primary,
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '40px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/models')}
                            >
                                Explorar catálogo <FiArrowRight />
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Home;