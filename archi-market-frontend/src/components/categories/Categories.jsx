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
    FiEye
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
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
            setCategories(response.data.data || response.data || []);
            if (response.data.data?.length > 0) {
                setSelectedCategory(response.data.data[0]);
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
            setCategoryModels(response.data.data?.data || response.data.models || []);
        } catch (error) {
            console.error('Error cargando modelos:', error);
        } finally {
            setModelsLoading(false);
        }
    };

    const getCategoryIcon = (categoryName) => {
        const icons = {
            'Arquitectura Residencial': <FiHome />,
            'Estructural': <FiBox />,
            'Arquitectura Comercial': <FiGrid />,
            'Interiores': <FiPackage />,
            'Urbanismo': <FiGrid />
        };
        return icons[categoryName] || <FiGrid />;
    };

    const filteredModels = categoryModels.filter(model =>
        model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem'
        },
        header: {
            marginBottom: '3rem'
        },
        title: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        subtitle: {
            fontSize: '1.1rem',
            color: '#64748b',
            maxWidth: '600px'
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '2rem'
        },
        // Panel de categorías
        categoriesPanel: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0',
            height: 'fit-content'
        },
        categoriesHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: `2px solid #e2e8f0`
        },
        categoriesTitle: {
            fontSize: '1.2rem',
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
            borderRadius: '20px',
            fontSize: '0.9rem'
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
            padding: '1rem 1.2rem',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: `1px solid transparent`
        },
        categoryItemActive: {
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary + '30',
            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.1)'
        },
        categoryLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        categoryIcon: {
            fontSize: '1.5rem',
            color: colors.primary,
            opacity: 0.8
        },
        categoryName: {
            fontSize: '1rem',
            fontWeight: '500',
            color: colors.dark
        },
        categoryCount: {
            fontSize: '0.9rem',
            color: '#64748b',
            marginLeft: '0.5rem'
        },
        categoryArrow: {
            color: colors.primary,
            opacity: 0.5
        },
        // Panel de modelos
        modelsPanel: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        modelsHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        modelsTitle: {
            fontSize: '1.3rem',
            fontWeight: '600',
            color: colors.dark
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            width: '300px'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.95rem'
        },
        modelsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem'
        },
        modelCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '15px',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s',
            border: '1px solid #e2e8f0'
        },
        modelImage: {
            height: '180px',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        modelOverlay: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(37, 99, 235, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            opacity: 0,
            transition: 'opacity 0.3s'
        },
        overlayBtn: {
            backgroundColor: 'white',
            color: colors.primary,
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        modelInfo: {
            padding: '1.2rem'
        },
        modelName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        modelMeta: {
            display: 'flex',
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#64748b',
            marginBottom: '0.5rem'
        },
        modelPrice: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: colors.primary
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary,
            fontSize: '1.1rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: '#f8fafc',
            borderRadius: '15px',
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
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FiGrid /> Categorías
                </h1>
                <p style={styles.subtitle}>
                    Explora nuestra colección de modelos 3D organizados por categorías
                </p>
            </div>

            {/* Main Grid */}
            <div style={styles.mainGrid}>
                {/* Panel de categorías */}
                <motion.div
                    style={styles.categoriesPanel}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={styles.categoriesHeader}>
                        <div style={styles.categoriesTitle}>
                            <FiGrid /> Todas las categorías
                        </div>
                        <span style={styles.categoriesCount}>{categories.length}</span>
                    </div>

                    <div style={styles.categoryList}>
                        {categories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                style={{
                                    ...styles.categoryItem,
                                    ...(selectedCategory?.id === category.id ? styles.categoryItemActive : {})
                                }}
                                whileHover={{ x: 5 }}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => setSelectedCategory(category)}
                            >
                                <div style={styles.categoryLeft}>
                                    <span style={styles.categoryIcon}>
                                        {getCategoryIcon(category.name)}
                                    </span>
                                    <span style={styles.categoryName}>
                                        {category.name}
                                        <span style={styles.categoryCount}>
                                            ({category.models_count || 0})
                                        </span>
                                    </span>
                                </div>
                                <FiChevronRight style={styles.categoryArrow} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Panel de modelos */}
                <motion.div
                    style={styles.modelsPanel}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={styles.modelsHeader}>
                        <h2 style={styles.modelsTitle}>
                            {selectedCategory?.name || 'Selecciona una categoría'}
                        </h2>
                        <div style={styles.searchBox}>
                            <FiSearch color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Buscar en esta categoría..."
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
                            <FiPackage style={styles.emptyIcon} />
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                No hay modelos en esta categoría
                            </h3>
                            <p style={{ color: '#94a3b8' }}>
                                Próximamente agregaremos más modelos
                            </p>
                        </div>
                    ) : (
                        <div style={styles.modelsGrid}>
                            {filteredModels.map((model, index) => (
                                <motion.div
                                    key={model.id}
                                    style={styles.modelCard}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                    onClick={() => navigate(`/models/${model.id}`)}
                                >
                                    <div style={styles.modelImage}>
                                        <HiOutlineCube size={48} color={colors.primary + '40'} />
                                        <div style={styles.modelOverlay}
                                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
                                        >
                                            <div style={styles.overlayBtn}>
                                                <FiEye /> Vista previa
                                            </div>
                                        </div>
                                    </div>
                                    <div style={styles.modelInfo}>
                                        <h3 style={styles.modelName}>{model.name}</h3>
                                        <div style={styles.modelMeta}>
                                            <span>{model.format}</span>
                                            <span>{model.size_mb} MB</span>
                                        </div>
                                        <div style={styles.modelPrice}>
                                            ${model.price}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Categories;