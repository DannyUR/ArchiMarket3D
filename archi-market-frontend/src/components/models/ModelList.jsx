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
    FiHeart,
    FiBox,
    FiTrendingUp,
    FiClock,
    FiUser
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
                transition: 'transform 0.5s ease'
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
    const [isMobile, setIsMobile] = useState(false);
    const [sortBy, setSortBy] = useState('recent');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 12
    });

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Categorías disponibles
    const categories = [
        { id: 'todos', name: 'Todos', icon: <BsGrid3X3GapFill />, color: '#64748b' },
        { id: 'estructuras', name: 'Estructuras', icon: <HiOutlineOfficeBuilding />, count: 850, color: '#3b82f6' },
        { id: 'arquitectura', name: 'Arquitectura', icon: <HiOutlineHome />, count: 1200, color: '#10b981' },
        { id: 'instalaciones', name: 'Instalaciones', icon: <HiOutlineLightBulb />, count: 450, color: '#f59e0b' },
        { id: 'mobiliario', name: 'Mobiliario', icon: <HiOutlineCube />, count: 600, color: '#8b5cf6' }
    ];

    useEffect(() => {
        fetchModels(pagination.current_page);
    }, [pagination.current_page, selectedCategory, sortBy]);

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
                //return 'http://127.0.0.1:8000' + preview.file_url;
                const path = preview.file_url.replace('/storage/', '');
                return `/api/storage/${path}`;
            }
        }
        return null;
    };

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

    const getCategoryColor = (categoryId) => {
        const cat = categories.find(c => c.id === categoryId);
        return cat?.color || colors.primary;
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh',
            width: '100%',
            boxSizing: 'border-box'
        },
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginBottom: '2rem',
            width: '100%'
        },
        titleSection: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            lineHeight: '1.2'
        },
        titleIcon: {
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '2.5rem'
        },
        subtitle: {
            color: '#64748b',
            fontSize: isMobile ? '0.9rem' : '1rem',
            lineHeight: '1.5'
        },
        controls: {
            display: 'flex',
            gap: '0.8rem',
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'flex-end'
        },
        filterBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.7rem 1.2rem' : '0.8rem 1.5rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '30px',
            background: colors.white,
            color: colors.dark,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontWeight: '500',
            fontSize: isMobile ? '0.9rem' : '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        },
        viewToggle: {
            display: 'flex',
            gap: '0.5rem',
            background: '#f8fafc',
            padding: '0.25rem',
            borderRadius: '30px',
            border: `1px solid #e2e8f0`
        },
        viewButton: {
            padding: isMobile ? '0.6rem' : '0.75rem',
            border: 'none',
            borderRadius: '30px',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: '#64748b',
            fontSize: isMobile ? '1.1rem' : '1.2rem'
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
            position: 'relative',
            width: '100%'
        },
        searchInput: {
            flex: 1,
            padding: isMobile ? '1rem 1rem 1rem 3rem' : '1.2rem 1.5rem 1.2rem 3.5rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '40px',
            fontSize: isMobile ? '0.95rem' : '1rem',
            outline: 'none',
            transition: 'all 0.3s ease',
            background: '#ffffff',
            width: '100%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        },
        searchIcon: {
            position: 'absolute',
            left: isMobile ? '1.2rem' : '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            fontSize: isMobile ? '1.2rem' : '1.3rem',
            zIndex: 1
        },
        filtersPanel: {
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '30px',
            padding: isMobile ? '1.5rem' : '2rem',
            marginBottom: '2rem',
            border: '1px solid #f0f0f0',
            width: '100%',
            boxSizing: 'border-box',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
        },
        filtersHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: `2px solid ${colors.primary}10`
        },
        filtersTitle: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        categoriesGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.8rem',
            marginTop: '0.5rem'
        },
        categoryChip: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: isMobile ? '1rem' : '1rem 1.2rem',
            background: colors.white,
            border: '2px solid #e2e8f0',
            borderRadius: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: colors.dark,
            fontSize: isMobile ? '0.95rem' : '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        },
        categoryChipActive: {
            background: colors.primary,
            borderColor: colors.primary,
            color: colors.white,
            transform: 'scale(1.02)',
            boxShadow: `0 8px 20px ${colors.primary}30`
        },
        categoryIcon: {
            fontSize: '1.3rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        categoryCount: {
            marginLeft: 'auto',
            fontSize: '0.85rem',
            color: '#64748b',
            fontWeight: '500',
            background: '#f1f5f9',
            padding: '0.2rem 0.6rem',
            borderRadius: '20px'
        },
        categoryCountActive: {
            background: 'rgba(255,255,255,0.2)',
            color: 'white'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: isMobile ? '1.5rem' : '2rem',
            marginBottom: '3rem',
            width: '100%'
        },
        card: {
            backgroundColor: colors.white,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '1px solid #f0f0f0',
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        },
        cardImage: {
            height: isMobile ? '200px' : '220px',
            background: 'linear-gradient(145deg, ' + colors.primary + '10 0%, ' + colors.primary + '05 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0
        },
        cardBadge: {
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(5px)',
            padding: '0.4rem 1rem',
            borderRadius: '30px',
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            fontWeight: '600',
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.5)'
        },
        cardFavorite: {
            position: 'absolute',
            top: '1rem',
            left: '1rem',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(5px)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: 'none',
            color: '#94a3b8',
            zIndex: 10,
            fontSize: isMobile ? '1rem' : '1.1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        },
        cardContent: {
            padding: isMobile ? '1.2rem' : '1.5rem',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
        },
        cardCategory: {
            display: 'inline-block',
            color: colors.primary,
            fontSize: isMobile ? '0.7rem' : '0.75rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '0.5rem',
            background: colors.primary + '10',
            padding: '0.2rem 1rem',
            borderRadius: '30px',
            width: 'fit-content'
        },
        cardTitle: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.75rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        cardMeta: {
            display: 'flex',
            gap: isMobile ? '0.8rem' : '1rem',
            color: '#64748b',
            fontSize: isMobile ? '0.8rem' : '0.85rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: '#f8fafc',
            padding: '0.2rem 0.8rem',
            borderRadius: '30px'
        },
        cardFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 'auto',
            paddingTop: '1rem',
            borderTop: '1px solid #f0f0f0'
        },
        cardPrice: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '700',
            color: colors.primary,
            lineHeight: '1.2'
        },
        cardStats: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: '#94a3b8',
            fontSize: '0.8rem',
            background: '#f8fafc',
            padding: '0.2rem 0.8rem',
            borderRadius: '30px'
        },
        cardActions: {
            display: 'flex',
            gap: '0.5rem'
        },
        actionBtn: {
            width: isMobile ? '36px' : '40px',
            height: isMobile ? '36px' : '40px',
            borderRadius: '12px',
            border: `1px solid #e2e8f0`,
            background: colors.white,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            color: '#64748b',
            fontSize: isMobile ? '1rem' : '1.1rem'
        },
        paginationContainer: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '3rem',
            flexWrap: 'wrap',
            padding: '1rem 0'
        },
        pageButton: {
            padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.2rem',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            background: colors.white,
            color: colors.dark,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: isMobile ? '40px' : '48px',
            textAlign: 'center',
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: '500',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        },
        pageButtonActive: {
            backgroundColor: colors.primary,
            color: 'white',
            borderColor: colors.primary,
            boxShadow: `0 8px 16px ${colors.primary}30`
        },
        pageButtonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed',
            pointerEvents: 'none'
        },
        pageEllipsis: {
            padding: '0.5rem',
            color: '#64748b',
            fontSize: isMobile ? '1rem' : '1.1rem'
        },
        pageInfo: {
            textAlign: 'center',
            marginTop: '1.5rem',
            color: '#64748b',
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            padding: '0 1rem'
        },
        loading: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1.5rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: isMobile ? '4rem 1.5rem' : '5rem',
            color: '#64748b',
            fontSize: isMobile ? '1rem' : '1.2rem',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '40px',
            border: '1px solid #f0f0f0',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
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
            {/* Header mejorado */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>
                        <FiBox style={styles.titleIcon} />
                        Modelos 3D
                    </h1>
                    <p style={styles.subtitle}>
                        {pagination.total} modelos profesionales disponibles para tu proyecto
                    </p>
                </div>
                <div style={styles.controls}>
                    <motion.button
                        style={styles.filterBtn}
                        onClick={() => setShowFilters(!showFilters)}
                        whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiFilter color={colors.primary} />
                        {!isMobile && 'Filtros'}
                    </motion.button>
                    <div style={styles.viewToggle}>
                        <motion.button
                            style={{
                                ...styles.viewButton,
                                ...(view === 'grid' ? styles.viewButtonActive : {})
                            }}
                            onClick={() => setView('grid')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiGrid />
                        </motion.button>
                        <motion.button
                            style={{
                                ...styles.viewButton,
                                ...(view === 'list' ? styles.viewButtonActive : {})
                            }}
                            onClick={() => setView('list')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FiList />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Barra de búsqueda mejorada */}
            <div style={styles.searchBar}>
                <FiSearch style={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, categoría o formato..."
                    style={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
            </div>

            {/* Panel de filtros mejorado */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        style={styles.filtersPanel}
                    >
                        <div style={styles.filtersHeader}>
                            <h3 style={styles.filtersTitle}>
                                <FiFilter /> Categorías
                            </h3>
                            <motion.button
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                                onClick={() => setShowFilters(false)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <FiX size={20} />
                            </motion.button>
                        </div>
                        <div style={styles.categoriesGrid}>
                            {categories.map((cat) => {
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <motion.div
                                        key={cat.id}
                                        style={{
                                            ...styles.categoryChip,
                                            ...(isActive ? styles.categoryChipActive : {})
                                        }}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        whileHover={{ y: -2, boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span style={{
                                            ...styles.categoryIcon,
                                            color: isActive ? colors.white : cat.color
                                        }}>
                                            {cat.icon}
                                        </span>
                                        <span>{cat.name}</span>
                                        {cat.count && (
                                            <span style={{
                                                ...styles.categoryCount,
                                                ...(isActive ? styles.categoryCountActive : {})
                                            }}>
                                                {cat.count}
                                            </span>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid de modelos mejorado */}
            {models.length === 0 ? (
                <motion.div
                    style={styles.emptyState}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <HiOutlineCube size={80} color={colors.primary + '40'} />
                    <p style={{ marginTop: '1.5rem' }}>No hay modelos disponibles</p>
                </motion.div>
            ) : (
                <>
                    <motion.div
                        style={view === 'grid' ? styles.grid : {}}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {models.map((model, index) => {
                            const previewImage = getPreviewImage(model);

                            // Extraer valores asegurando que sean strings/números
                            const categoryName = typeof model.category === 'object'
                                ? model.category?.name || 'Modelo 3D'
                                : model.category || 'Modelo 3D';

                            const format = typeof model.format === 'object'
                                ? model.format?.name || 'GLTF'
                                : model.format || 'GLTF';

                            const size = typeof model.size_mb === 'object'
                                ? model.size_mb?.value || '0'
                                : model.size_mb || '0';

                            const price = typeof model.price === 'object'
                                ? model.price?.value || 0
                                : model.price || 0;

                            return (
                                <motion.div
                                    key={model.id}
                                    style={styles.card}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
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
                                        <motion.button
                                            style={styles.cardFavorite}
                                            whileHover={{ scale: 1.1, backgroundColor: colors.primary, color: 'white' }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log('Favorito:', model.id);
                                            }}
                                        >
                                            <FiHeart />
                                        </motion.button>
                                    </div>
                                    <div style={styles.cardContent}>
                                        <div style={styles.cardCategory}>
                                            {categoryName}
                                        </div>
                                        <h3 style={styles.cardTitle}>{model.name}</h3>
                                        <div style={styles.cardMeta}>
                                            <span style={styles.metaItem}>
                                                <HiOutlineCube size={14} color={colors.primary} /> {format}
                                            </span>
                                            <span style={styles.metaItem}>
                                                <FiDownload size={14} color={colors.primary} /> {size} MB
                                            </span>
                                        </div>
                                        <div style={styles.cardFooter}>
                                            <span style={styles.cardPrice}>
                                                ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                                            </span>
                                            <div style={styles.cardStats}>
                                                <FiStar color="#fbbf24" /> 4.5 · 128
                                            </div>
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
                    </motion.div>

                    {/* Paginación mejorada */}
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
                                    whileHover={pagination.current_page !== 1 ? { scale: 1.05 } : {}}
                                    whileTap={pagination.current_page !== 1 ? { scale: 0.95 } : {}}
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
                                    whileHover={pagination.current_page !== 1 ? { scale: 1.05 } : {}}
                                    whileTap={pagination.current_page !== 1 ? { scale: 0.95 } : {}}
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
                                    whileHover={pagination.current_page !== pagination.last_page ? { scale: 1.05 } : {}}
                                    whileTap={pagination.current_page !== pagination.last_page ? { scale: 0.95 } : {}}
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
                                    whileHover={pagination.current_page !== pagination.last_page ? { scale: 1.05 } : {}}
                                    whileTap={pagination.current_page !== pagination.last_page ? { scale: 0.95 } : {}}
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