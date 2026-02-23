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
import { colors } from '../../styles/theme';

// Componente visor de Sketchfab
const SketchfabViewer = ({ model }) => {
    const [viewerError, setViewerError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Estilos locales para el spinner
    const spinnerStyle = {
        width: '40px',
        height: '40px',
        border: `3px solid ${colors.primary}20`,
        borderTop: `3px solid ${colors.primary}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    if (viewerError) {
        return (
            <div style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                borderRadius: '10px'
            }}>
                <HiOutlineCube size={60} color={colors.primary + '40'} />
                <p style={{ color: '#64748b' }}>No se pudo cargar el visor 3D</p>
            </div>
        );
    }

    const sketchfabId = model.sketchfab_id;

    if (!sketchfabId) {
        return (
            <div style={{
                width: '100%',
                height: '400px',
                backgroundColor: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <HiOutlineCube size={60} color={colors.primary + '40'} />
            </div>
        );
    }

    // URL con parámetros para ocultar la UI de Sketchfab
    const embedUrl = `https://sketchfab.com/models/${sketchfabId}/embed?` + new URLSearchParams({
        autospin: '0.2',
        autostart: '1',
        preload: '1',
        ui_controls: '1',
        ui_infos: '0',           // ← Oculta información del modelo
        ui_stop: '1',
        ui_watermark: '0',        // ← Oculta watermark de Sketchfab
        ui_watermark_link: '0',   // ← Oculta link
        ui_inspector: '0',        // ← Oculta inspector
        ui_annotations: '0',      // ← Oculta anotaciones
        ui_color: '0',            // ← Oculta selector de color
        ui_ar: '0',               // ← Oculta botón AR
        ui_help: '0',             // ← Oculta ayuda
        ui_settings: '0',         // ← Oculta configuraciones
        ui_fullscreen: '1',       // ← Mantiene fullscreen
        ui_gyzmo: '1',            // ← Mantiene controles de rotación
        camera: '0'
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
                    backgroundColor: '#f1f5f9',
                    zIndex: 1
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
                    border: 'none'
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
    const { addToCart } = useCart();

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
            console.log('👤 Datos del autor:', {
                author_name: modelData.author_name,
                author_bio: modelData.author_bio,
                author_avatar: modelData.author_avatar
            });
            setModel(modelData);

            // Seleccionar primera imagen como principal
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
        const multipliers = {
            personal: 1.0,
            business: 2.5,
            unlimited: 5.0
        };
        return basePrice * (multipliers[license] || 1.0);
    };

    const getImageUrl = (fileUrl) => {
        if (!fileUrl) return null;
        return fileUrl.startsWith('http') ? fileUrl : 'http://127.0.0.1:8000' + fileUrl;
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
        mainImage: {
            width: '100%',
            height: '400px',
            backgroundColor: '#e2e8f0',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.2rem',
            marginBottom: '1rem',
            overflow: 'hidden'
        },
        mainImageTag: {
            width: '100%',
            height: '100%',
            objectFit: 'contain'
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
            transition: 'opacity 0.3s',
            overflow: 'hidden'
        },
        thumbnailImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
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
        // En tu objeto styles, agrega o modifica:
        reviewCard: {
            backgroundColor: colors.white,
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s',
            '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }
        },
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
                {/* Panel izquierdo - Visor Sketchfab */}
                <div style={styles.previewSection}>
                    <div style={styles.mainImage}>
                        <SketchfabViewer model={model} />
                    </div>

                    {model.files && model.files.filter(f => f.file_type === 'preview').length > 1 && (
                        <div style={styles.thumbnailGrid}>
                            {model.files
                                .filter(f => f.file_type === 'preview')
                                .map((file, index) => (
                                    <div
                                        key={index}
                                        style={styles.thumbnail}
                                        onClick={() => setSelectedImage(file.file_url)}
                                    >
                                        <img
                                            src={getImageUrl(file.file_url)}
                                            alt={`Vista previa ${index + 1}`}
                                            style={styles.thumbnailImage}
                                        />
                                    </div>
                                ))}
                        </div>
                    )}

                    <div style={styles.watermark}>
                        <FiEye /> Vista 3D interactiva
                    </div>
                </div>

                {/* Panel derecho - Información */}
                <div style={styles.infoSection}>
                    <h1 style={styles.title}>{model.name}</h1>

                    {/* Autor del modelo */}
                    {model.author && model.author.name && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#f8fafc',
                            borderRadius: '12px'
                        }}>
                            {model.author.avatar ? (
                                <img
                                    src={model.author.avatar}
                                    alt={model.author.name}
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    backgroundColor: colors.primary + '20',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: colors.primary,
                                    fontWeight: '600',
                                    fontSize: '1.2rem'
                                }}>
                                    {model.author.name?.charAt(0) || 'A'}
                                </div>
                            )}
                            <div>
                                <div style={{ fontWeight: '600', color: colors.dark }}>
                                    {model.author.name}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                    {model.author.bio || 'Creador profesional'}
                                </div>
                            </div>
                        </div>
                    )}

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

                            {/* Información adicional del modelo */}
                            <div style={{
                                marginTop: '2rem',
                                padding: '1.5rem',
                                backgroundColor: colors.white,
                                borderRadius: '10px',
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
                                        <div style={{ fontWeight: '500' }}>
                                            {model.publication_date ? new Date(model.publication_date).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>ID Sketchfab</div>
                                        <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>{model.sketchfab_id || 'N/A'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div>
                            <h3 style={{ fontWeight: '600', marginBottom: '1.5rem', color: colors.dark }}>
                                Características técnicas
                            </h3>
                            <div style={styles.features}>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Formato:</strong> {model.format}</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Tamaño de archivo:</strong> {model.size_mb} MB</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Texturas:</strong> Incluidas (resolución 4K)</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Optimizado para:</strong> BIM, Revit, ArchiCAD</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Polígonos:</strong> {model.polygon_count || '45,000'}</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Materiales:</strong> {model.material_count || '5'}</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Animaciones:</strong> {model.has_animations ? 'Sí' : 'No'}</span>
                                </div>
                                <div style={styles.featureItem}>
                                    <FiCheckCircle color={colors.success} />
                                    <span><strong>Rigging:</strong> {model.has_rigging ? 'Sí' : 'No'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div style={styles.reviews}>
                            {/* Resumen de reseñas - MEJORADO */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3rem',
                                marginBottom: '2.5rem',
                                padding: '2rem',
                                backgroundColor: colors.white,
                                borderRadius: '15px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                {/* Rating promedio grande */}
                                <div style={{ textAlign: 'center', minWidth: '120px' }}>
                                    <div style={{
                                        fontSize: '3.5rem',
                                        fontWeight: '700',
                                        color: colors.primary,
                                        lineHeight: '1'
                                    }}>
                                        {model.stats?.average_rating?.toFixed(1) || '0.0'}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                        de 5.0
                                    </div>
                                </div>

                                {/* Estrellas y contador */}
                                <div>
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.25rem',
                                        marginBottom: '0.5rem'
                                    }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <FiStar
                                                key={i}
                                                size={24}
                                                fill={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : 'none'}
                                                color={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : '#d1d5db'}
                                            />
                                        ))}
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '1rem' }}>
                                        <strong>{model.stats?.total_reviews || 0}</strong> {model.stats?.total_reviews === 1 ? 'reseña' : 'reseñas'}
                                    </div>
                                </div>

                                {/* Botón para escribir reseña (solo si está logueado) */}
                                {isLoggedIn && (
                                    <button style={{
                                        marginLeft: 'auto',
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: colors.primary,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}>
                                        Escribir reseña
                                    </button>
                                )}
                            </div>

                            {/* Lista de reseñas - MEJORADA */}
                            {model.reviews && model.reviews.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {model.reviews.map(review => (
                                        <div key={review.id} style={{
                                            ...styles.reviewCard,
                                            padding: '1.5rem',
                                            backgroundColor: colors.white,
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            transition: 'all 0.2s'
                                        }}>
                                            {/* Cabecera de la reseña */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                marginBottom: '1rem'
                                            }}>
                                                {/* Avatar */}
                                                <div style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '50%',
                                                    backgroundColor: colors.primary + '20',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: colors.primary,
                                                    fontWeight: '600',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {review.user?.name?.charAt(0) || 'U'}
                                                </div>

                                                {/* Info del usuario */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: colors.dark,
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {review.user?.name || 'Usuario'}
                                                    </div>

                                                    {/* Rating de la reseña */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem'
                                                    }}>
                                                        <div style={{ display: 'flex', gap: '0.15rem' }}>
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <FiStar
                                                                    key={i}
                                                                    size={14}
                                                                    fill={i <= (review.rating || 0) ? '#fbbf24' : 'none'}
                                                                    color={i <= (review.rating || 0) ? '#fbbf24' : '#d1d5db'}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                                            {new Date(review.created_at).toLocaleDateString('es-MX', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comentario */}
                                            <div style={{
                                                color: '#334155',
                                                lineHeight: '1.6',
                                                fontSize: '0.95rem',
                                                paddingLeft: '0.5rem',
                                                borderLeft: `3px solid ${colors.primary}40`
                                            }}>
                                                {review.comment}
                                            </div>

                                            {/* Acciones de la reseña (opcional) */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'flex-end',
                                                gap: '1rem',
                                                marginTop: '1rem',
                                                fontSize: '0.85rem',
                                                color: '#94a3b8'
                                            }}>
                                                <button style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#64748b'
                                                }}>
                                                    👍 Útil
                                                </button>
                                                <button style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: '#64748b'
                                                }}>
                                                    💬 Responder
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Empty state mejorado */
                                <div style={{
                                    textAlign: 'center',
                                    padding: '4rem 2rem',
                                    backgroundColor: colors.white,
                                    borderRadius: '15px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <FiStar size={60} color={colors.primary + '30'} style={{ marginBottom: '1rem' }} />
                                    <h4 style={{
                                        fontSize: '1.2rem',
                                        fontWeight: '600',
                                        color: colors.dark,
                                        marginBottom: '0.5rem'
                                    }}>
                                        No hay reseñas aún
                                    </h4>
                                    <p style={{
                                        color: '#64748b',
                                        marginBottom: '1.5rem',
                                        maxWidth: '400px',
                                        margin: '0 auto 1.5rem auto'
                                    }}>
                                        ¿Compraste este modelo? ¡Comparte tu experiencia con la comunidad!
                                    </p>
                                    {isLoggedIn && (
                                        <button style={{
                                            padding: '0.75rem 2rem',
                                            backgroundColor: colors.primary,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            cursor: 'pointer'
                                        }}>
                                            Escribir primera reseña
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
    // Agrega esto ANTES del export default
    <style>{`
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `}</style>
};

export default ModelDetail;