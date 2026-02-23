import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch,
    FiGrid,
    FiList,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight,
    FiEye,
    FiDownload,
    FiStar,
    FiFilter,
    FiX,
    FiHeart
} from 'react-icons/fi';
import { HiOutlineCube, HiOutlineOfficeBuilding, HiOutlineHome, HiOutlineLightBulb } from 'react-icons/hi';
import { BsGrid3X3GapFill } from 'react-icons/bs';
import API from '../../services/api';
import { colors } from '../../styles/theme';

// Componente helper para manejar imágenes con fallback
const ModelImage = ({ src, alt, modelId }) => {
    const [error, setError] = useState(false);

    if (error || !src) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                background: `linear-gradient(145deg, ${colors.primary}10 0%, ${colors.primary}05 100%)`
            }}>
                <HiOutlineCube size={60} color={colors.primary + '40'} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.5s'
            }}
            onError={() => setError(true)}
        />
    );
};

const ModelList = () => {
    const navigate = useNavigate();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid');
    const [selectedCategory, setSelectedCategory] = useState('todos');
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 12
    });

    // Categorías disponibles (basadas en tu BD)
    const categories = [
        { id: 'todos', name: 'Todos', icon: <BsGrid3X3GapFill /> },
        { id: 'estructuras', name: 'Estructuras', icon: <HiOutlineOfficeBuilding />, count: 850 },
        { id: 'arquitectura', name: 'Arquitectura', icon: <HiOutlineHome />, count: 1200 },
        { id: 'instalaciones', name: 'Instalaciones', icon: <HiOutlineLightBulb />, count: 450 },
        { id: 'mobiliario', name: 'Mobiliario', icon: <HiOutlineCube />, count: 600 }
    ];

    useEffect(() => {
        fetchModels(pagination.current_page);
    }, [pagination.current_page, selectedCategory]);

    const fetchModels = async (page = 1) => {
        setLoading(true);
        try {
            const response = await API.get(`/models?page=${page}`);
            console.log('📦 API Response - Página:', page, response.data);

            if (response.data?.success && response.data?.data) {
                setModels(response.data.data.data || []);
                setPagination({
                    current_page: response.data.data.current_page || 1,
                    last_page: response.data.data.last_page || 1,
                    total: response.data.data.total || 0,
                    per_page: response.data.data.per_page || 12
                });
            } else {
                setModels([]);
            }
        } catch (error) {
            console.error('Error cargando modelos:', error);
            setModels([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        // Implementar búsqueda después
        console.log('Buscando:', search);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) {
            setPagination(prev => ({ ...prev, current_page: newPage }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const getPreviewImage = (model) => {
        if (model.files && model.files.length > 0) {
            const preview = model.files.find(f => f.file_type === 'preview');
            if (preview?.file_url) {
                return 'http://127.0.0.1:8000' + preview.file_url;
            }
        }
        return null;
    };

    // Función para renderizar números de página
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        const current = pagination.current_page;
        const last = pagination.last_page;

        if (last <= maxVisible) {
            for (let i = 1; i <= last; i++) {
                pages.push(i);
            }
        } else {
            if (current <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(last);
            } else if (current >= last - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = last - 3; i <= last; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = current - 1; i <= current + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(last);
            }
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return <span key={`ellipsis-${index}`} style={styles.pageEllipsis}>...</span>;
            }
            return (
                <motion.button
                    key={page}
                    style={{
                        ...styles.pageButton,
                        ...(page === current ? styles.pageButtonActive : {})
                    }}
                    onClick={() => handlePageChange(page)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {page}
                </motion.button>
            );
        });
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        },
        titleSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
        },
        title: {
            fontSize: '2.2rem',
            fontWeight: '700',
            color: colors.dark,
            margin: 0
        },
        subtitle: {
            color: '#64748b',
            fontSize: '1rem'
        },
        controls: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
        },
        filterBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '12px',
            background: colors.white,
            color: colors.dark,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: '500'
        },
        viewToggle: {
            display: 'flex',
            gap: '0.5rem',
            background: '#f8fafc',
            padding: '0.25rem',
            borderRadius: '12px',
            border: `1px solid #e2e8f0`
        },
        viewButton: {
            padding: '0.75rem',
            border: 'none',
            borderRadius: '8px',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#64748b',
            fontSize: '1.2rem'
        },
        viewButtonActive: {
            background: colors.white,
            color: colors.primary,
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        },
        searchBar: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            position: 'relative'
        },
        searchInput: {
            flex: 1,
            padding: '1rem 1rem 1rem 3rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '16px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'all 0.3s',
            background: '#f8fafc'
        },
        searchIcon: {
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: '1.2rem'
        },
        // Filtros
        filtersPanel: {
            background: '#f8fafc',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: `1px solid #e2e8f0`
        },
        categoriesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginTop: '1rem'
        },
        categoryChip: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            background: colors.white,
            border: `2px solid #e2e8f0`,
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: colors.dark
        },
        categoryChipActive: {
            background: colors.primary,
            borderColor: colors.primary,
            color: colors.white
        },
        categoryIcon: {
            fontSize: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        categoryCount: {
            marginLeft: 'auto',
            fontSize: '0.8rem',
            color: '#64748b'
        },
        // Grid de modelos
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
        },
        card: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            transition: 'all 0.3s',
            cursor: 'pointer',
            border: '1px solid #f0f0f0',
            position: 'relative'
        },
        cardImage: {
            height: '220px',
            background: 'linear-gradient(145deg, ' + colors.primary + '10 0%, ' + colors.primary + '05 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        },
        cardBadge: {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(5px)',
            padding: '0.4rem 0.8rem',
            borderRadius: '30px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        },
        cardFavorite: {
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(5px)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            border: 'none',
            color: '#94a3b8',
            zIndex: 10
        },
        cardContent: {
            padding: '1.5rem'
        },
        cardCategory: {
            color: colors.primary,
            fontSize: '0.8rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.5rem'
        },
        cardTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem',
            lineHeight: '1.4'
        },
        cardMeta: {
            display: 'flex',
            gap: '1rem',
            color: '#64748b',
            fontSize: '0.85rem',
            marginBottom: '1rem'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
        },
        cardFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f0f0f0'
        },
        cardPrice: {
            fontSize: '1.4rem',
            fontWeight: '700',
            color: colors.primary
        },
        cardActions: {
            display: 'flex',
            gap: '0.5rem'
        },
        actionBtn: {
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            border: `1px solid #e2e8f0`,
            background: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: '#64748b'
        },
        // Paginación profesional
        paginationContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '3rem',
            flexWrap: 'wrap'
        },
        pageButton: {
            padding: '0.6rem 1rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            background: colors.white,
            color: colors.dark,
            cursor: 'pointer',
            transition: 'all 0.2s',
            minWidth: '45px',
            textAlign: 'center',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        pageButtonActive: {
            backgroundColor: colors.primary,
            color: 'white',
            borderColor: colors.primary
        },
        pageButtonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        pageEllipsis: {
            padding: '0.5rem',
            color: '#64748b'
        },
        pageInfo: {
            textAlign: 'center',
            marginTop: '1rem',
            color: '#64748b',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        loading: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem',
            color: colors.primary,
            fontSize: '1.2rem',
            gap: '1rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem',
            color: '#64748b',
            fontSize: '1.2rem',
            background: '#f8fafc',
            borderRadius: '20px'
        },
        spinner: {
            width: '50px',
            height: '50px',
            border: `3px solid ${colors.primary}20`,
            borderTop: `3px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        }
    };

    if (loading && models.length === 0) {
        return (
            <div style={styles.loading}>
                <div style={styles.spinner} />
                <p>Cargando modelos 3D...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header con título y controles */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>Modelos 3D</h1>
                    <p style={styles.subtitle}>
                        {pagination.total} modelos disponibles para tu proyecto
                    </p>
                </div>
                <div style={styles.controls}>
                    <motion.button
                        style={styles.filterBtn}
                        onClick={() => setShowFilters(!showFilters)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiFilter /> Filtros
                    </motion.button>
                    <div style={styles.viewToggle}>
                        <button
                            style={{
                                ...styles.viewButton,
                                ...(view === 'grid' ? styles.viewButtonActive : {})
                            }}
                            onClick={() => setView('grid')}
                        >
                            <FiGrid />
                        </button>
                        <button
                            style={{
                                ...styles.viewButton,
                                ...(view === 'list' ? styles.viewButtonActive : {})
                            }}
                            onClick={() => setView('list')}
                        >
                            <FiList />
                        </button>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda profesional */}
            <div style={styles.searchBar}>
                <FiSearch style={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, categoría o formato..."
                    style={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
            </div>

            {/* Panel de filtros (expandible) */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        style={styles.filtersPanel}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: '600', color: colors.dark }}>Categorías</h3>
                            <button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                onClick={() => setShowFilters(false)}
                            >
                                <FiX size={20} />
                            </button>
                        </div>
                        <div style={styles.categoriesGrid}>
                            {categories.map((cat) => (
                                <motion.div
                                    key={cat.id}
                                    style={{
                                        ...styles.categoryChip,
                                        ...(selectedCategory === cat.id ? styles.categoryChipActive : {})
                                    }}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {cat.icon}
                                    <span>{cat.name}</span>
                                    {cat.count && (
                                        <span style={styles.categoryCount}>{cat.count}</span>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid de modelos */}
            {models.length === 0 ? (
                <div style={styles.emptyState}>
                    <HiOutlineCube size={60} color={colors.primary + '40'} />
                    <p style={{ marginTop: '1rem' }}>No hay modelos disponibles</p>
                </div>
            ) : (
                <>
                    <div style={view === 'grid' ? styles.grid : {}}>
                        {models.map((model) => {
                            const previewImage = getPreviewImage(model);

                            // Extraer valores asegurando que sean strings/números
                            const categoryName = typeof model.category === 'object'
                                ? model.category?.name || 'Modelo 3D'
                                : model.category || 'Modelo 3D';

                            const format = typeof model.format === 'object'
                                ? model.format?.name || 'OBJ/FBX'
                                : model.format || 'OBJ/FBX';

                            const size = typeof model.size_mb === 'object'
                                ? model.size_mb?.value || '45'
                                : model.size_mb || '45';

                            const price = typeof model.price === 'object'
                                ? model.price?.value || 99.99
                                : model.price || 99.99;

                            return (
                                <motion.div
                                    key={model.id}
                                    style={styles.card}
                                    whileHover={{ y: -8 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    onClick={() => navigate(`/models/${model.id}`)}
                                >
                                    <div style={styles.cardImage}>
                                        <ModelImage
                                            src={previewImage}
                                            alt={model.name}
                                            modelId={model.id}
                                        />
                                        <div style={styles.cardBadge}>
                                            <FiEye size={12} /> Vista previa 3D
                                        </div>
                                        <button
                                            style={styles.cardFavorite}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Favorito:', model.id);
                                            }}
                                        >
                                            <FiHeart />
                                        </button>
                                    </div>
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardCategory}>
                                            {categoryName}
                                        </div>
                                        <h3 style={styles.cardTitle}>{model.name}</h3>
                                        <div style={styles.cardMeta}>
                                            <span style={styles.metaItem}>
                                                <HiOutlineCube size={14} /> {format}
                                            </span>
                                            <span style={styles.metaItem}>
                                                <FiDownload size={14} /> {size} MB
                                            </span>
                                        </div>
                                        <div style={styles.cardFooter}>
                                            <span style={styles.cardPrice}>
                                                ${typeof price === 'number' ? price.toFixed(2) : '99.99'}
                                            </span>
                                            <div style={styles.cardActions}>
                                                <motion.button
                                                    style={styles.actionBtn}
                                                    whileHover={{ scale: 1.1, backgroundColor: colors.primary + '10' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        console.log('Vista rápida:', model.id);
                                                    }}
                                                >
                                                    <FiEye size={16} />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Paginación profesional */}
                    {pagination.last_page > 1 && (
                        <>
                            <div style={styles.paginationContainer}>
                                <motion.button
                                    style={{
                                        ...styles.pageButton,
                                        ...(pagination.current_page === 1 ? styles.pageButtonDisabled : {})
                                    }}
                                    onClick={() => handlePageChange(1)}
                                    disabled={pagination.current_page === 1}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiChevronsLeft />
                                </motion.button>

                                <motion.button
                                    style={{
                                        ...styles.pageButton,
                                        ...(pagination.current_page === 1 ? styles.pageButtonDisabled : {})
                                    }}
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiChevronLeft />
                                </motion.button>

                                {renderPageNumbers()}

                                <motion.button
                                    style={{
                                        ...styles.pageButton,
                                        ...(pagination.current_page === pagination.last_page ? styles.pageButtonDisabled : {})
                                    }}
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiChevronRight />
                                </motion.button>

                                <motion.button
                                    style={{
                                        ...styles.pageButton,
                                        ...(pagination.current_page === pagination.last_page ? styles.pageButtonDisabled : {})
                                    }}
                                    onClick={() => handlePageChange(pagination.last_page)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <FiChevronsRight />
                                </motion.button>
                            </div>

                            {pagination.total > 0 && (
                                <div style={styles.pageInfo}>
                                    Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} -{' '}
                                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)} de {pagination.total} modelos
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ModelList;