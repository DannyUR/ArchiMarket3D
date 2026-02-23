import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDownload,
    FiEye,
    FiStar,
    FiShoppingCart,
    FiArrowLeft,
    FiCheckCircle,
    FiInfo,
    FiUser,
    FiCalendar,
    FiTag,
    FiBox,
    FiTrendingUp,
    FiThumbsUp,
    FiMessageCircle,
    FiShare2,
    FiHeart
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import API from '../../services/api';
import { colors } from '../../styles/theme';

// Componente visor de Sketchfab mejorado
const SketchfabViewer = ({ model }) => {
    const [viewerError, setViewerError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const spinnerStyle = {
        width: '50px',
        height: '50px',
        border: `4px solid ${colors.primary}20`,
        borderTop: `4px solid ${colors.primary}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    if (viewerError) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                borderRadius: '24px'
            }}>
                <HiOutlineCube size={80} color={colors.primary + '40'} />
                <p style={{ color: '#64748b' }}>No se pudo cargar el visor 3D</p>
            </div>
        );
    }

    const sketchfabId = model.sketchfab_id;

    if (!sketchfabId) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <HiOutlineCube size={80} color={colors.primary + '40'} />
            </div>
        );
    }

    const embedUrl = `https://sketchfab.com/models/${sketchfabId}/embed?` + new URLSearchParams({
        autospin: '0.2',
        autostart: '1',
        preload: '1',
        ui_controls: '1',
        ui_infos: '0',
        ui_stop: '1',
        ui_watermark: '0',
        ui_watermark_link: '0',
        ui_inspector: '0',
        ui_annotations: '0',
        ui_color: '0',
        ui_ar: '0',
        ui_help: '0',
        ui_settings: '0',
        ui_fullscreen: '1',
        ui_gyzmo: '1',
        camera: '0'
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                    zIndex: 1,
                    borderRadius: '24px'
                }}>
                    <div style={spinnerStyle} />
                </div>
            )}
            <iframe
                title={model.name}
                src={embedUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    border: 'none',
                    borderRadius: '24px'
                }}
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                onError={() => setViewerError(true)}
            />
        </div>
    );
};

const ModelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLicense, setSelectedLicense] = useState('personal');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const { addToCart } = useCart();

    // Multiplicadores de licencia (coinciden con PublicLicenses)
    const multipliers = {
        personal: 1.0,
        business: 2.5,
        unlimited: 5.0
    };

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchModel();
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, [id]);

    const fetchModel = async () => {
        try {
            const response = await API.get(`/models/${id}`);
            console.log('📦 Modelo recibido:', response.data);
            const modelData = response.data.data?.model || response.data;
            
            // Estructurar datos de autor si vienen en formato diferente
            if (!modelData.author && (modelData.author_name || modelData.author)) {
                modelData.author = {
                    name: modelData.author_name || modelData.author?.name,
                    bio: modelData.author_bio || modelData.author?.bio,
                    avatar: modelData.author_avatar || modelData.author?.avatar
                };
            }
            
            setModel(modelData);

            if (modelData.files && modelData.files.length > 0) {
                const preview = modelData.files.find(f => f.file_type === 'preview');
                setSelectedImage(preview?.file_url || null);
            }
        } catch (error) {
            console.error('Error cargando modelo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        addToCart(model, selectedLicense, quantity);
        navigate('/cart');
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        addToCart(model, selectedLicense, quantity);
        navigate('/checkout');
    };

    const getLicensePrice = (basePrice, license) => {
        return basePrice * (multipliers[license] || 1.0);
    };

    const getImageUrl = (fileUrl) => {
        if (!fileUrl) return null;
        return fileUrl.startsWith('http') ? fileUrl : 'http://127.0.0.1:8000' + fileUrl;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: colors.primary,
            cursor: 'pointer',
            marginBottom: '2rem',
            fontSize: '1rem',
            border: 'none',
            background: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.primary + '10'
            }
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2rem' : '3rem',
            marginBottom: '3rem'
        },
        // Panel izquierdo - Visor 3D
        previewSection: {
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: isMobile ? '1rem' : '1.5rem',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
            border: '1px solid #f0f0f0'
        },
        mainImage: {
            width: '100%',
            height: isMobile ? '350px' : '450px',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '1rem'
        },
        thumbnailGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.8rem'
        },
        thumbnail: {
            height: '80px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            overflow: 'hidden',
            border: '2px solid transparent',
            ':hover': {
                transform: 'scale(1.05)',
                borderColor: colors.primary
            }
        },
        thumbnailImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        watermark: {
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(5px)',
            color: colors.dark,
            padding: '0.6rem 1.2rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.5)'
        },
        // Panel derecho - Información
        infoSection: {
            padding: isMobile ? '0' : '1rem'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.8rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem',
            lineHeight: '1.2'
        },
        // Autor mejorado
        authorCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}03 100%)`,
            borderRadius: '20px',
            border: `1px solid ${colors.primary}10`
        },
        authorAvatar: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '1.5rem'
        },
        authorInfo: {
            flex: 1
        },
        authorName: {
            fontWeight: '600',
            color: colors.dark,
            fontSize: '1.1rem',
            marginBottom: '0.25rem'
        },
        authorBio: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        // Métricas
        metrics: {
            display: 'flex',
            gap: '2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
        },
        metricItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            background: '#f8fafc',
            padding: '0.5rem 1rem',
            borderRadius: '30px'
        },
        // Rating mejorado
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px'
        },
        ratingScore: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.primary
        },
        ratingStars: {
            display: 'flex',
            gap: '0.2rem'
        },
        // Precios y licencias
        priceCard: {
            background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}03 100%)`,
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            border: `1px solid ${colors.primary}20`
        },
        priceHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        priceLabel: {
            fontSize: '0.9rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        priceAmount: {
            fontSize: '3rem',
            fontWeight: '700',
            color: colors.primary,
            lineHeight: '1'
        },
        priceNote: {
            fontSize: '0.85rem',
            color: '#94a3b8',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        licenseSelector: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        licenseOption: {
            border: `2px solid #e2e8f0`,
            borderRadius: '20px',
            padding: '1.2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backgroundColor: 'white'
        },
        licenseSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '05',
            boxShadow: `0 10px 20px ${colors.primary}20`
        },
        licenseName: {
            fontWeight: '600',
            fontSize: '1.1rem',
            marginBottom: '0.5rem',
            color: colors.dark
        },
        licensePrice: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '0.5rem'
        },
        licenseMultiplier: {
            fontSize: '0.8rem',
            color: '#94a3b8'
        },
        actions: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            flexDirection: isMobile ? 'column' : 'row'
        },
        primaryButton: {
            flex: 1,
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s',
            boxShadow: `0 10px 20px ${colors.primary}30`
        },
        secondaryButton: {
            flex: 1,
            backgroundColor: 'white',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '20px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s'
        },
        favoriteButton: {
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            background: 'white',
            border: 'none',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            color: '#94a3b8',
            zIndex: 10,
            transition: 'all 0.2s'
        },
        // Tabs mejorados
        tabs: {
            display: 'flex',
            gap: '2rem',
            borderBottom: `2px solid #e2e8f0`,
            marginBottom: '2rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
        },
        tab: {
            padding: '1rem 0',
            cursor: 'pointer',
            borderBottom: '3px solid transparent',
            transition: 'all 0.3s',
            color: '#64748b',
            fontWeight: '500',
            whiteSpace: 'nowrap'
        },
        tabActive: {
            borderBottomColor: colors.primary,
            color: colors.primary,
            fontWeight: '600'
        },
        tabContent: {
            padding: isMobile ? '1.5rem' : '2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            lineHeight: '1.8',
            minHeight: '300px'
        },
        // Características
        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1rem'
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
        },
        featureIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.2rem'
        },
        // Reseñas mejoradas
        reviewsSummary: {
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '20px',
            flexWrap: 'wrap'
        },
        reviewCard: {
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '20px',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
        },
        reviewHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
        },
        reviewAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: colors.primary + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontWeight: '600',
            fontSize: '1.2rem'
        },
        reviewRating: {
            display: 'flex',
            gap: '0.2rem',
            marginBottom: '0.25rem'
        },
        reviewDate: {
            fontSize: '0.85rem',
            color: '#94a3b8'
        },
        reviewComment: {
            color: '#334155',
            lineHeight: '1.6',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            marginTop: '0.5rem'
        },
        reviewActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1rem',
            fontSize: '0.85rem',
            color: '#94a3b8'
        },
        emptyReviews: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '20px'
        },
        loading: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem',
            gap: '1.5rem'
        },
        spinner: {
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.primary}20`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={styles.spinner} />
                    <p>Cargando modelo...</p>
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <HiOutlineCube size={80} color={colors.primary + '40'} />
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Modelo no encontrado</p>
                </div>
            </div>
        );
    }

    const basePrice = model.price || 99.99;

    return (
        <div style={styles.container}>
            {/* Botón volver */}
            <motion.button
                style={styles.backButton}
                onClick={() => navigate(-1)}
                whileHover={{ x: -5, backgroundColor: colors.primary + '10' }}
                whileTap={{ scale: 0.95 }}
            >
                <FiArrowLeft /> Volver a modelos
            </motion.button>

            {/* Grid principal */}
            <div style={styles.grid}>
                {/* Panel izquierdo - Visor 3D */}
                <motion.div
                    style={styles.previewSection}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button
                        style={styles.favoriteButton}
                        onClick={() => setIsFavorite(!isFavorite)}
                    >
                        <FiHeart color={isFavorite ? colors.primary : '#94a3b8'} fill={isFavorite ? colors.primary : 'none'} />
                    </button>
                    
                    <div style={styles.mainImage}>
                        <SketchfabViewer model={model} />
                    </div>

                    {model.files && model.files.filter(f => f.file_type === 'preview').length > 1 && (
                        <div style={styles.thumbnailGrid}>
                            {model.files
                                .filter(f => f.file_type === 'preview')
                                .slice(0, 4)
                                .map((file, index) => (
                                    <motion.div
                                        key={index}
                                        style={styles.thumbnail}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setSelectedImage(file.file_url)}
                                    >
                                        <img
                                            src={getImageUrl(file.file_url)}
                                            alt={`Vista previa ${index + 1}`}
                                            style={styles.thumbnailImage}
                                        />
                                    </motion.div>
                                ))}
                        </div>
                    )}

                    <div style={styles.watermark}>
                        <FiEye /> Vista 3D interactiva
                    </div>
                </motion.div>

                {/* Panel derecho - Información */}
                <motion.div
                    style={styles.infoSection}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 style={styles.title}>{model.name}</h1>

                    {/* Autor */}
                    {model.author && model.author.name && (
                        <div style={styles.authorCard}>
                            {model.author.avatar ? (
                                <img
                                    src={model.author.avatar}
                                    alt={model.author.name}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={styles.authorAvatar}>
                                    {model.author.name.charAt(0)}
                                </div>
                            )}
                            <div style={styles.authorInfo}>
                                <div style={styles.authorName}>{model.author.name}</div>
                                <div style={styles.authorBio}>{model.author.bio || 'Creador profesional'}</div>
                            </div>
                        </div>
                    )}

                    {/* Métricas */}
                    <div style={styles.metrics}>
                        <div style={styles.metricItem}>
                            <FiBox /> {model.format || 'GLTF'}
                        </div>
                        <div style={styles.metricItem}>
                            <FiDownload /> {model.size_mb || '0'} MB
                        </div>
                        <div style={styles.metricItem}>
                            <FiCalendar /> {formatDate(model.publication_date)}
                        </div>
                    </div>

                    {/* Rating */}
                    <div style={styles.ratingContainer}>
                        <span style={styles.ratingScore}>
                            {model.stats?.average_rating?.toFixed(1) || '0.0'}
                        </span>
                        <div>
                            <div style={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <FiStar
                                        key={i}
                                        size={20}
                                        fill={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : 'none'}
                                        color={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : '#d1d5db'}
                                    />
                                ))}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                {model.stats?.total_reviews || 0} reseñas
                            </div>
                        </div>
                    </div>

                    {/* Precios */}
                    <div style={styles.priceCard}>
                        <div style={styles.priceHeader}>
                            <span style={styles.priceLabel}>Precio base</span>
                            <span style={styles.priceLabel}>Licencia seleccionada</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={styles.priceAmount}>${basePrice.toFixed(2)}</span>
                            </div>
                            <div>
                                <span style={{ ...styles.priceAmount, color: colors.primary }}>
                                    ${getLicensePrice(basePrice, selectedLicense).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div style={styles.priceNote}>
                            <FiInfo /> El precio varía según la licencia seleccionada
                        </div>
                    </div>

                    {/* Selector de licencias */}
                    <div style={styles.licenseSelector}>
                        {['personal', 'business', 'unlimited'].map(license => (
                            <motion.div
                                key={license}
                                style={{
                                    ...styles.licenseOption,
                                    ...(selectedLicense === license ? styles.licenseSelected : {})
                                }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedLicense(license)}
                            >
                                <div style={styles.licenseName}>
                                    {license === 'personal' && 'Personal'}
                                    {license === 'business' && 'Empresarial'}
                                    {license === 'unlimited' && 'Ilimitada'}
                                </div>
                                <div style={styles.licensePrice}>
                                    ${getLicensePrice(basePrice, license).toFixed(2)}
                                </div>
                                <div style={styles.licenseMultiplier}>
                                    {multipliers[license]}x del precio base
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Acciones */}
                    <div style={styles.actions}>
                        <motion.button
                            style={styles.primaryButton}
                            onClick={handleBuyNow}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiShoppingCart /> Comprar ahora
                        </motion.button>
                        <motion.button
                            style={styles.secondaryButton}
                            onClick={handleAddToCart}
                            whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Agregar al carrito
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Tabs de información */}
            <div style={{ marginTop: '3rem' }}>
                <div style={styles.tabs}>
                    {['description', 'features', 'reviews'].map(tab => (
                        <div
                            key={tab}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'description' && 'Descripción'}
                            {tab === 'features' && 'Características'}
                            {tab === 'reviews' && `Reseñas (${model.stats?.total_reviews || 0})`}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        style={styles.tabContent}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Descripción */}
                        {activeTab === 'description' && (
                            <div>
                                {model.description ? (
                                    <div style={{ lineHeight: '1.8' }}>
                                        {model.description.split('\n').map((paragraph, idx) => (
                                            <p key={idx} style={{ marginBottom: '1rem', color: '#334155' }}>
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                                        No hay descripción disponible para este modelo
                                    </div>
                                )}

                                {/* Detalles adicionales */}
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '1.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: colors.dark }}>
                                        Detalles del modelo
                                    </h4>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '1rem'
                                    }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Formato</div>
                                            <div style={{ fontWeight: '500' }}>{model.format}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Tamaño</div>
                                            <div style={{ fontWeight: '500' }}>{model.size_mb} MB</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Publicado</div>
                                            <div style={{ fontWeight: '500' }}>{formatDate(model.publication_date)}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>ID Sketchfab</div>
                                            <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>{model.sketchfab_id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Características */}
                        {activeTab === 'features' && (
                            <div>
                                <h3 style={{ fontWeight: '600', marginBottom: '1.5rem', color: colors.dark }}>
                                    Características técnicas
                                </h3>
                                <div style={styles.featuresGrid}>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiBox /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Formato</div>
                                            <div style={{ fontWeight: '600' }}>{model.format}</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiDownload /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tamaño</div>
                                            <div style={{ fontWeight: '600' }}>{model.size_mb} MB</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiTag /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Texturas</div>
                                            <div style={{ fontWeight: '600' }}>Incluidas (4K)</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiTrendingUp /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Polígonos</div>
                                            <div style={{ fontWeight: '600' }}>{model.polygon_count || '45,000'}</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiStar /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Materiales</div>
                                            <div style={{ fontWeight: '600' }}>{model.material_count || '5'}</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiEye /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Animaciones</div>
                                            <div style={{ fontWeight: '600' }}>{model.has_animations ? 'Sí' : 'No'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reseñas */}
                        {activeTab === 'reviews' && (
                            <div>
                                {/* Resumen de reseñas */}
                                <div style={styles.reviewsSummary}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', fontWeight: '700', color: colors.primary }}>
                                            {model.stats?.average_rating?.toFixed(1) || '0.0'}
                                        </div>
                                        <div style={{ color: '#64748b' }}>de 5.0</div>
                                    </div>
                                    <div>
                                        <div style={styles.ratingStars}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <FiStar
                                                    key={i}
                                                    size={28}
                                                    fill={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : 'none'}
                                                    color={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : '#d1d5db'}
                                                />
                                            ))}
                                        </div>
                                        <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                            <strong>{model.stats?.total_reviews || 0}</strong> reseñas
                                        </div>
                                    </div>
                                    {isLoggedIn && (
                                        <motion.button
                                            style={{
                                                marginLeft: 'auto',
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: colors.primary,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '30px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiMessageCircle /> Escribir reseña
                                        </motion.button>
                                    )}
                                </div>

                                {/* Lista de reseñas */}
                                {model.reviews && model.reviews.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {model.reviews.map(review => (
                                            <motion.div
                                                key={review.id}
                                                style={styles.reviewCard}
                                                whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                            >
                                                <div style={styles.reviewHeader}>
                                                    <div style={styles.reviewAvatar}>
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                            {review.user?.name || 'Usuario'}
                                                        </div>
                                                        <div style={styles.reviewRating}>
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <FiStar
                                                                    key={i}
                                                                    size={14}
                                                                    fill={i <= (review.rating || 0) ? '#fbbf24' : 'none'}
                                                                    color={i <= (review.rating || 0) ? '#fbbf24' : '#d1d5db'}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div style={styles.reviewDate}>
                                                            {formatDate(review.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={styles.reviewComment}>
                                                    {review.comment}
                                                </div>
                                                <div style={styles.reviewActions}>
                                                    <button style={{ cursor: 'pointer' }}>
                                                        <FiThumbsUp /> Útil
                                                    </button>
                                                    <button style={{ cursor: 'pointer' }}>
                                                        <FiMessageCircle /> Responder
                                                    </button>
                                                    <button style={{ cursor: 'pointer' }}>
                                                        <FiShare2 /> Compartir
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={styles.emptyReviews}>
                                        <FiStar size={60} color={colors.primary + '30'} />
                                        <h4 style={{ marginTop: '1rem', color: colors.dark }}>
                                            No hay reseñas aún
                                        </h4>
                                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                            ¿Compraste este modelo? ¡Comparte tu experiencia!
                                        </p>
                                        {isLoggedIn && (
                                            <motion.button
                                                style={{
                                                    marginTop: '1.5rem',
                                                    padding: '0.75rem 2rem',
                                                    backgroundColor: colors.primary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '30px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Escribir primera reseña
                                            </motion.button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ModelDetail;