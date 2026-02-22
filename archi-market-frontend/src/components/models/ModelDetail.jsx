import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiDownload,
    FiEye,
    FiStar,
    FiShoppingCart,
    FiArrowLeft,
    FiCheckCircle,
    FiInfo
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { colors } from '../../styles/theme';

const ModelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLicense, setSelectedLicense] = useState('personal');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { addToCart } = useCart();
    const { showSuccess, showInfo } = useNotification();

    useEffect(() => {
        fetchModel();
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, [id]);

    const fetchModel = async () => {
        try {
            const response = await API.get(`/models/${id}`);
            console.log('Modelo:', response.data);
            setModel(response.data.data?.model || response.data);
        } catch (error) {
            console.error('Error cargando modelo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!isLoggedIn) {
            showInfo('🔑 Inicia sesión para agregar al carrito');
            navigate('/login');
            return;
        }
        addToCart(model, selectedLicense, quantity);
        showSuccess('🛒 Modelo agregado al carrito');
        navigate('/cart');
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            showInfo('🔑 Inicia sesión para comprar');
            navigate('/login');
            return;
        }
        addToCart(model, selectedLicense, quantity);
        showSuccess('💰 Redirigiendo al checkout...');
        navigate('/checkout');
    };

    const getLicensePrice = (basePrice, license) => {
        console.log('Calculando precio:', { basePrice, license });
        const multipliers = {
            personal: 1.0,
            business: 2.5,
            unlimited: 5.0
        };
        return basePrice * (multipliers[license] || 1.0);
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem'
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
            background: 'none'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '3rem',
            marginBottom: '3rem'
        },
        // Panel izquierdo - Vista previa
        previewSection: {
            backgroundColor: '#f8fafc',
            borderRadius: '15px',
            padding: '2rem',
            position: 'relative'
        },
        previewImage: {
            width: '100%',
            height: '400px',
            backgroundColor: '#e2e8f0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.2rem',
            marginBottom: '1rem'
        },
        thumbnailGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem'
        },
        thumbnail: {
            height: '80px',
            backgroundColor: '#e2e8f0',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'opacity 0.3s'
        },
        watermark: {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        // Panel derecho - Información
        infoSection: {
            padding: '1rem'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem'
        },
        meta: {
            display: 'flex',
            gap: '2rem',
            marginBottom: '2rem',
            color: '#64748b'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        rating: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '2rem'
        },
        stars: {
            display: 'flex',
            gap: '0.25rem',
            color: '#fbbf24'
        },
        priceCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            padding: '1.5rem',
            marginBottom: '2rem'
        },
        price: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '0.5rem'
        },
        licenseSelector: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        licenseOption: {
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            padding: '1rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        licenseSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '10'
        },
        licenseName: {
            fontWeight: '600',
            marginBottom: '0.5rem'
        },
        licensePrice: {
            color: colors.primary,
            fontWeight: '700'
        },
        actions: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem'
        },
        primaryButton: {
            flex: 1,
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.3s'
        },
        secondaryButton: {
            flex: 1,
            backgroundColor: 'white',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
        },
        tabs: {
            display: 'flex',
            gap: '2rem',
            borderBottom: `2px solid #e2e8f0`,
            marginBottom: '2rem'
        },
        tab: {
            padding: '1rem 0',
            cursor: 'pointer',
            borderBottom: '2px solid transparent',
            transition: 'all 0.3s'
        },
        tabActive: {
            borderBottomColor: colors.primary,
            color: colors.primary,
            fontWeight: '600'
        },
        tabContent: {
            padding: '2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            lineHeight: '1.8'
        },
        features: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginTop: '1rem'
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: colors.dark
        },
        reviews: {
            marginTop: '2rem'
        },
        reviewCard: {
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            marginBottom: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    Cargando modelo...
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    Modelo no encontrado
                </div>
            </div>
        );
    }

    const basePrice = model.price || 99.99;

    return (
        <div style={styles.container}>
            <button
                style={styles.backButton}
                onClick={() => navigate(-1)}
            >
                <FiArrowLeft /> Volver a modelos
            </button>

            <div style={styles.grid}>
                {/* Panel izquierdo - Vista previa */}
                <div style={styles.previewSection}>
                    <div style={styles.previewImage}>
                        <HiOutlineCube size={48} />
                    </div>
                    <div style={styles.thumbnailGrid}>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} style={styles.thumbnail} />
                        ))}
                    </div>
                    <div style={styles.watermark}>
                        <FiEye /> Vista previa
                    </div>
                </div>

                {/* Panel derecho - Información */}
                <div style={styles.infoSection}>
                    <h1 style={styles.title}>{model.name}</h1>

                    <div style={styles.meta}>
                        <div style={styles.metaItem}>
                            <FiDownload /> {model.format}
                        </div>
                        <div style={styles.metaItem}>
                            {model.size_mb} MB
                        </div>
                    </div>

                    <div style={styles.rating}>
                        <div style={styles.stars}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <FiStar key={i} />
                            ))}
                        </div>
                        <span>({model.reviews_count || 0} reseñas)</span>
                    </div>

                    <div style={styles.priceCard}>
                        <div style={styles.price}>
                            ${getLicensePrice(basePrice, selectedLicense).toFixed(2)}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            {selectedLicense === 'personal' && 'Licencia Personal - Uso individual'}
                            {selectedLicense === 'business' && 'Licencia Empresarial - Múltiples proyectos'}
                            {selectedLicense === 'unlimited' && 'Licencia Ilimitada - Sin restricciones'}
                        </div>
                    </div>

                    <div style={styles.licenseSelector}>
                        {['personal', 'business', 'unlimited'].map(license => (
                            <motion.div
                                key={license}
                                style={{
                                    ...styles.licenseOption,
                                    ...(selectedLicense === license ? styles.licenseSelected : {})
                                }}
                                whileHover={{ scale: 1.02 }}
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
                            </motion.div>
                        ))}
                    </div>

                    <div style={styles.actions}>
                        <button
                            style={styles.primaryButton}
                            onClick={handleBuyNow}
                            onMouseEnter={(e) => e.target.style.backgroundColor = colors.secondary}
                            onMouseLeave={(e) => e.target.style.backgroundColor = colors.primary}
                        >
                            <FiShoppingCart /> Comprar ahora
                        </button>
                        <button
                            style={styles.secondaryButton}
                            onClick={handleAddToCart}
                        >
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs de información */}
            <div>
                <div style={styles.tabs}>
                    <div
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'description' ? styles.tabActive : {})
                        }}
                        onClick={() => setActiveTab('description')}
                    >
                        Descripción
                    </div>
                    <div
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'features' ? styles.tabActive : {})
                        }}
                        onClick={() => setActiveTab('features')}
                    >
                        Características
                    </div>
                    <div
                        style={{
                            ...styles.tab,
                            ...(activeTab === 'reviews' ? styles.tabActive : {})
                        }}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reseñas
                    </div>
                </div>

                <div style={styles.tabContent}>
                    {activeTab === 'description' && (
                        <div>
                            {model.description || 'Descripción no disponible'}
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div>
                            <h3>Características del modelo:</h3>
                            <div style={styles.features}>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} /> Formato: {model.format}
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} /> Tamaño: {model.size_mb} MB
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} /> Texturas incluidas
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} /> Optimizado para BIM
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div style={styles.reviews}>
                            {model.reviews && model.reviews.length > 0 ? (
                                model.reviews.map(review => (
                                    <div key={review.id} style={styles.reviewCard}>
                                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                                            {review.user?.name || 'Usuario'}
                                        </div>
                                        <div style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                                            {review.comment}
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', color: '#64748b' }}>
                                    No hay reseñas aún
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModelDetail;