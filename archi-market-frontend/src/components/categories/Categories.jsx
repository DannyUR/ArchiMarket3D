import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGrid,
    FiHome,
    FiBox,
    FiArrowRight,
    FiSearch,
    FiChevronRight,
    FiPackage,
    FiDownload,
    FiEye,
    FiStar,
    FiTrendingUp,
    FiDollarSign,
    FiLayers
} from 'react-icons/fi';
import { HiOutlineCube, HiOutlineOfficeBuilding, HiOutlineLightBulb } from 'react-icons/hi';
import API from '../../services/api';
import { colors } from '../../styles/theme';

const Categories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryModels, setCategoryModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (selectedCategory) {
            fetchCategoryModels(selectedCategory.id);
        }
    }, [selectedCategory]);

    const fetchCategories = async () => {
        try {
            const response = await API.get('/categories');
            console.log('📦 Categorías:', response.data);
            const categoriesData = response.data.data || response.data || [];
            setCategories(categoriesData);
            if (categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0]);
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategoryModels = async (categoryId) => {
        setModelsLoading(true);
        try {
            const response = await API.get(`/categories/${categoryId}/models`);
            console.log('📦 Modelos de categoría:', response.data);

            const modelsData = response.data.data?.data || response.data.models || [];
            setCategoryModels(modelsData);
        } catch (error) {
            console.error('Error cargando modelos:', error);
        } finally {
            setModelsLoading(false);
        }
    };

    const getPreviewImage = (model) => {
        try {
            if (!model.files || model.files.length === 0) return null;
            const file = model.files[0];
            const preview = model.files.find(f => f.file_type === 'preview') || file;
            if (!file || !file.file_url) return null;
            //return 'http://127.0.0.1:8000' + file.file_url;
            return `/api/storage/${preview.file_url.replace('/storage/', '')}`;
        } catch (error) {
            return null;
        }
    };

    const getCategoryIcon = (categoryName, isActive = false) => {
        const color = isActive ? colors.white : colors.primary;
        const size = isMobile ? 20 : 24;
        
        const icons = {
            'Arquitectura Residencial': <FiHome size={size} color={color} />,
            'Estructural': <FiBox size={size} color={color} />,
            'Arquitectura Comercial': <HiOutlineOfficeBuilding size={size} color={color} />,
            'Interiores': <FiPackage size={size} color={color} />,
            'Urbanismo': <FiGrid size={size} color={color} />,
            'Instalaciones': <HiOutlineLightBulb size={size} color={color} />
        };
        return icons[categoryName] || <FiGrid size={size} color={color} />;
    };

    const filteredModels = categoryModels.filter(model =>
        model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh'
        },
        header: {
            marginBottom: isMobile ? '2rem' : '3rem',
            textAlign: isMobile ? 'left' : 'center'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.8rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'flex-start' : 'center',
            gap: '1rem'
        },
        titleIcon: {
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '2.8rem'
        },
        subtitle: {
            fontSize: isMobile ? '1rem' : '1.1rem',
            color: '#64748b',
            maxWidth: '600px',
            margin: isMobile ? '0' : '0 auto',
            lineHeight: '1.6'
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
            gap: isMobile ? '1.5rem' : '2rem'
        },
        // Panel de categorías
        categoriesPanel: {
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: isMobile ? '1.2rem' : '1.8rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            border: '1px solid #f0f0f0',
            height: 'fit-content',
            position: isMobile ? 'static' : 'sticky',
            top: isMobile ? 'auto' : '100px'
        },
        categoriesHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: `2px solid ${colors.primary}10`
        },
        categoriesTitle: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        categoriesCount: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.25rem 0.75rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '600'
        },
        categoryList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        categoryItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0.8rem 1rem' : '1rem 1.2rem',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid transparent',
            backgroundColor: 'transparent'
        },
        categoryItemActive: {
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
            borderColor: 'transparent',
            boxShadow: `0 8px 20px ${colors.primary}30`
        },
        categoryLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        categoryIcon: {
            width: isMobile ? '36px' : '40px',
            height: isMobile ? '36px' : '40px',
            borderRadius: '12px',
            background: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        },
        categoryName: {
            fontSize: isMobile ? '0.95rem' : '1rem',
            fontWeight: '500',
            color: colors.dark
        },
        categoryNameActive: {
            color: colors.white,
            fontWeight: '600'
        },
        categoryCount: {
            fontSize: '0.85rem',
            color: '#64748b',
            marginLeft: '0.5rem'
        },
        categoryCountActive: {
            color: 'rgba(255,255,255,0.8)'
        },
        categoryArrow: {
            color: '#94a3b8',
            fontSize: isMobile ? '1rem' : '1.2rem'
        },
        categoryArrowActive: {
            color: colors.white
        },
        // Panel de modelos
        modelsPanel: {
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            border: '1px solid #f0f0f0'
        },
        modelsHeader: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginBottom: '2rem'
        },
        modelsTitleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        modelsTitle: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '600',
            color: colors.dark
        },
        modelsBadge: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '600'
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.2rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '14px',
            width: isMobile ? '100%' : '300px',
            transition: 'all 0.2s ease',
            backgroundColor: '#f8fafc'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.95rem',
            backgroundColor: 'transparent'
        },
        modelsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: isMobile ? '1rem' : '1.5rem'
        },
        modelCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid #e2e8f0',
            position: 'relative'
        },
        modelImage: {
            height: isMobile ? '160px' : '180px',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        modelImageTag: {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
        },
        modelBadge: {
            position: 'absolute',
            top: '0.8rem',
            right: '0.8rem',
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(5px)',
            padding: '0.3rem 0.8rem',
            borderRadius: '30px',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        },
        modelInfo: {
            padding: isMobile ? '1rem' : '1.2rem'
        },
        modelName: {
            fontSize: isMobile ? '0.95rem' : '1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem',
            lineHeight: '1.4'
        },
        modelMeta: {
            display: 'flex',
            gap: isMobile ? '0.5rem' : '1rem',
            fontSize: '0.8rem',
            color: '#64748b',
            marginBottom: '0.75rem',
            flexWrap: 'wrap'
        },
        modelMetaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
        },
        modelPrice: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '700',
            color: colors.primary
        },
        modelStats: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#94a3b8'
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary,
            fontSize: '1.1rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: isMobile ? '3rem 1rem' : '4rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            color: '#64748b'
        },
        emptyIcon: {
            fontSize: '3rem',
            color: colors.primary + '40',
            marginBottom: '1rem'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    Cargando categorías...
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <motion.div
                style={styles.header}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={styles.title}>
                    <FiGrid style={styles.titleIcon} />
                    Categorías
                </h1>
                <p style={styles.subtitle}>
                    Explora nuestra colección de modelos 3D profesionales organizados por categorías
                </p>
            </motion.div>

            <div style={styles.mainGrid}>
                {/* Panel de categorías */}
                <motion.div
                    style={styles.categoriesPanel}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={styles.categoriesHeader}>
                        <div style={styles.categoriesTitle}>
                            <FiLayers /> Todas las categorías
                        </div>
                        <span style={styles.categoriesCount}>{categories.length}</span>
                    </div>

                    <div style={styles.categoryList}>
                        {categories.map((category, index) => {
                            const isActive = selectedCategory?.id === category.id;
                            return (
                                <motion.div
                                    key={category.id}
                                    style={{
                                        ...styles.categoryItem,
                                        ...(isActive ? styles.categoryItemActive : {})
                                    }}
                                    whileHover={{ x: isMobile ? 0 : 5 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    <div style={styles.categoryLeft}>
                                        <div style={{
                                            ...styles.categoryIcon,
                                            backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colors.primary + '10'
                                        }}>
                                            {getCategoryIcon(category.name, isActive)}
                                        </div>
                                        <span style={{
                                            ...styles.categoryName,
                                            ...(isActive ? styles.categoryNameActive : {})
                                        }}>
                                            {category.name}
                                            <span style={{
                                                ...styles.categoryCount,
                                                ...(isActive ? styles.categoryCountActive : {})
                                            }}>
                                                ({category.models_count || 0})
                                            </span>
                                        </span>
                                    </div>
                                    <FiChevronRight style={{
                                        ...styles.categoryArrow,
                                        ...(isActive ? styles.categoryArrowActive : {})
                                    }} />
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Panel de modelos */}
                <motion.div
                    style={styles.modelsPanel}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={styles.modelsHeader}>
                        <div style={styles.modelsTitleSection}>
                            <h2 style={styles.modelsTitle}>
                                {selectedCategory?.name || 'Selecciona una categoría'}
                            </h2>
                            {selectedCategory && (
                                <span style={styles.modelsBadge}>
                                    {categoryModels.length} modelos
                                </span>
                            )}
                        </div>
                        <div style={styles.searchBox}>
                            <FiSearch color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Buscar modelos..."
                                style={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {modelsLoading ? (
                        <div style={styles.loadingState}>
                            Cargando modelos...
                        </div>
                    ) : filteredModels.length === 0 ? (
                        <div style={styles.emptyState}>
                            <HiOutlineCube style={styles.emptyIcon} />
                            <p>No hay modelos disponibles en esta categoría.</p>
                        </div>
                    ) : (
                        <div style={styles.modelsGrid}>
                            {filteredModels.map((model, index) => {
                                const previewImage = getPreviewImage(model);

                                return (
                                    <motion.div
                                        key={model.id}
                                        style={styles.modelCard}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
                                        onClick={() => navigate(`/models/${model.id}`)}
                                    >
                                        <div style={styles.modelImage}>
                                            {previewImage ? (
                                                <img
                                                    src={previewImage}
                                                    alt={model.name}
                                                    style={styles.modelImageTag}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentNode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%"><svg>...</svg></div>';
                                                    }}
                                                />
                                            ) : (
                                                <HiOutlineCube size={48} color={colors.primary + '40'} />
                                            )}
                                            <div style={styles.modelBadge}>
                                                <FiEye size={10} /> 3D
                                            </div>
                                        </div>
                                        <div style={styles.modelInfo}>
                                            <h3 style={styles.modelName}>{model.name}</h3>
                                            <div style={styles.modelMeta}>
                                                <span style={styles.modelMetaItem}>
                                                    <FiBox size={12} /> {model.format || 'GLTF'}
                                                </span>
                                                <span style={styles.modelMetaItem}>
                                                    <FiDownload size={12} /> {model.size_mb || '0'} MB
                                                </span>
                                            </div>
                                            <div style={styles.modelPrice}>
                                                ${model.price?.toFixed(2) || '99.99'}
                                            </div>
                                            <div style={styles.modelStats}>
                                                <FiStar /> {model.rating || '4.5'} · {model.downloads || '120'} descargas
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Categories;