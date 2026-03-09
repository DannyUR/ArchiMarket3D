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
    const [realModelCounts, setRealModelCounts] = useState({});

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
            
            await fetchRealModelCounts(categoriesData);
            
            if (categoriesData.length > 0) {
                const firstStructural = categoriesData.find(c => 
                    c.category_type === 'estructural' || 
                    determineCategoryType(c.name) === 'estructural'
                );
                setSelectedCategory(firstStructural || categoriesData[0]);
            }
        } catch (error) {
            console.error('Error cargando categorías:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRealModelCounts = async (categoriesList) => {
        const counts = {};
        const promises = categoriesList.map(async (category) => {
            try {
                const response = await API.get(`/categories/${category.id}/models`);
                const modelsData = response.data.data?.data || response.data.models || [];
                counts[category.id] = modelsData.length;
            } catch (error) {
                console.error(`Error cargando modelos para categoría ${category.name}:`, error);
                counts[category.id] = 0;
            }
        });
        
        await Promise.all(promises);
        setRealModelCounts(counts);
    };

    const fetchCategoryModels = async (categoryId) => {
        setModelsLoading(true);
        try {
            const response = await API.get(`/categories/${categoryId}/models`);
            console.log('📦 Modelos de categoría:', response.data);

            const modelsData = response.data.data?.data || response.data.models || [];
            setCategoryModels(modelsData);
            
            setRealModelCounts(prev => ({
                ...prev,
                [categoryId]: modelsData.length
            }));
        } catch (error) {
            console.error('Error cargando modelos:', error);
            setCategoryModels([]);
        } finally {
            setModelsLoading(false);
        }
    };

    // MISMA FUNCIÓN QUE EN MODEL LIST
    const getIconByCategory = (categoryName) => {
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

    // MISMA FUNCIÓN QUE EN MODEL LIST
    const getCategoryColor = (categoryName) => {
        const colorMap = {
            'Estructuras de Acero': '#3b82f6',
            'Estructuras de Concreto': '#3b82f6',
            'Cimentaciones': '#3b82f6',
            'Elementos Portantes': '#3b82f6',
            'Arquitectura Residencial': '#10b981',
            'Arquitectura Comercial': '#10b981',
            'Fachadas y Cerramientos': '#10b981',
            'Cubiertas y Azoteas': '#10b981',
            'Sistemas Eléctricos': '#f59e0b',
            'Fontanería y Tuberías': '#f59e0b',
            'HVAC (Climatización)': '#f59e0b',
            'Protección Contra Incendios': '#f59e0b',
            'Mobiliario de Oficina': '#8b5cf6',
            'Mobiliario Residencial': '#8b5cf6',
            'Mobiliario Urbano': '#8b5cf6',
            'Equipamiento': '#8b5cf6',
            'Equipo Pesado': '#ef4444',
            'Maquinaria Industrial': '#ef4444',
            'Equipo de Construcción': '#ef4444',
            'Infraestructura Vial': '#06b6d4',
            'Espacios Públicos': '#06b6d4',
            'Paisajismo': '#06b6d4',
            'Redes de Servicio': '#06b6d4'
        };
        return colorMap[categoryName] || '#3b82f6';
    };

    const getCategoryIcon = (categoryName, isActive = false) => {
        const color = isActive ? colors.white : colors.primary;
        const size = isMobile ? 20 : 24;

        const iconMap = {
            'Estructuras de Acero': <FiBox size={size} color={color} />,
            'Estructuras de Concreto': <FiBox size={size} color={color} />,
            'Cimentaciones': <FiBox size={size} color={color} />,
            'Elementos Portantes': <FiBox size={size} color={color} />,
            'Arquitectura Residencial': <FiHome size={size} color={color} />,
            'Arquitectura Comercial': <HiOutlineOfficeBuilding size={size} color={color} />,
            'Fachadas y Cerramientos': <FiLayers size={size} color={color} />,
            'Cubiertas y Azoteas': <FiLayers size={size} color={color} />,
            'Sistemas Eléctricos': <HiOutlineLightBulb size={size} color={color} />,
            'Fontanería y Tuberías': <FiPackage size={size} color={color} />,
            'HVAC (Climatización)': <HiOutlineLightBulb size={size} color={color} />,
            'Protección Contra Incendios': <FiPackage size={size} color={color} />,
            'Mobiliario de Oficina': <FiPackage size={size} color={color} />,
            'Mobiliario Residencial': <FiHome size={size} color={color} />,
            'Mobiliario Urbano': <FiGrid size={size} color={color} />,
            'Equipamiento': <FiPackage size={size} color={color} />,
            'Equipo Pesado': <FiBox size={size} color={color} />,
            'Maquinaria Industrial': <FiBox size={size} color={color} />,
            'Equipo de Construcción': <FiBox size={size} color={color} />,
            'Infraestructura Vial': <FiGrid size={size} color={color} />,
            'Espacios Públicos': <FiGrid size={size} color={color} />,
            'Paisajismo': <FiGrid size={size} color={color} />,
            'Redes de Servicio': <FiPackage size={size} color={color} />
        };
        return iconMap[categoryName] || <FiGrid size={size} color={color} />;
    };

    const groupCategoriesByType = () => {
        const groups = {
            'Estructurales': [],
            'Arquitectura': [],
            'Instalaciones (MEP)': [],
            'Mobiliario': [],
            'Maquinaria': [],
            'Urbanismo': []
        };

        const typeMap = {
            'estructural': 'Estructurales',
            'arquitectura': 'Arquitectura',
            'instalaciones': 'Instalaciones (MEP)',
            'mobiliario': 'Mobiliario',
            'maquinaria': 'Maquinaria',
            'urbanismo': 'Urbanismo'
        };

        categories.forEach(category => {
            const categoryType = category.category_type || determineCategoryType(category.name);
            const groupName = typeMap[categoryType] || 'Otros';
            if (groups[groupName]) {
                groups[groupName].push({ ...category, _type: categoryType });
            }
        });

        return groups;
    };

    const determineCategoryType = (categoryName) => {
        const name = categoryName.toLowerCase();
        if (name.includes('estructura') || name.includes('acero') || name.includes('concreto') || name.includes('cimentación')) return 'estructural';
        if (name.includes('arquitectura') || name.includes('residencial') || name.includes('comercial') || name.includes('fachada') || name.includes('cubierta')) return 'arquitectura';
        if (name.includes('instalación') || name.includes('eléctrico') || name.includes('fontanería') || name.includes('hvac') || name.includes('incendio')) return 'instalaciones';
        if (name.includes('mobiliario') || name.includes('equipamiento')) return 'mobiliario';
        if (name.includes('maquinaria') || name.includes('equipo') || name.includes('industria')) return 'maquinaria';
        if (name.includes('urbanismo') || name.includes('infraestructura') || name.includes('vial') || name.includes('espacio') || name.includes('paisaje')) return 'urbanismo';
        return 'otros';
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
            backgroundColor: 'transparent',
            '&:focus': {
                outline: 'none'
            }
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            zIndex: 10
        },
        modelInfo: {
            padding: isMobile ? '1rem' : '1.2rem'
        },
        modelName: {
            fontSize: isMobile ? '0.95rem' : '1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem',
            lineHeight: '1.4',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
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
            gap: '0.3rem',
            background: colors.white,
            padding: '0.2rem 0.8rem',
            borderRadius: '30px'
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
            color: '#94a3b8',
            background: colors.white,
            padding: '0.2rem 0.8rem',
            borderRadius: '30px',
            width: 'fit-content'
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
                <motion.div
                    style={styles.categoriesPanel}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={styles.categoriesHeader}>
                        <div style={styles.categoriesTitle}>
                            <FiLayers /> Categorías
                        </div>
                        <span style={styles.categoriesCount}>{categories.length}</span>
                    </div>

                    <div style={styles.categoryList}>
                        {Object.entries(groupCategoriesByType()).map(([groupName, groupCategories]) => {
                            if (groupCategories.length === 0) return null;

                            return (
                                <div key={groupName}>
                                    <div style={{
                                        fontSize: '0.85rem',
                                        fontWeight: '700',
                                        color: colors.primary,
                                        textTransform: 'uppercase',
                                        marginTop: '1rem',
                                        marginBottom: '0.75rem',
                                        paddingLeft: '0.5rem',
                                        letterSpacing: '0.5px'
                                    }}>
                                        ⭐ {groupName}
                                    </div>

                                    {groupCategories.map((category, index) => {
                                        const isActive = selectedCategory?.id === category.id;
                                        const modelCount = realModelCounts[category.id] || 0;
                                        
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
                                                            ({modelCount})
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
                            );
                        })}
                    </div>
                </motion.div>

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
                                onFocus={(e) => e.target.style.outline = 'none'}
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
                                const categoryColor = getCategoryColor(selectedCategory?.name);
                                const icon = getIconByCategory(selectedCategory?.name);
                                const format = model.format || 'GLTF';
                                const size = model.size_mb || '0';
                                const price = model.price || 0;

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
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '100%',
                                                height: '100%',
                                                background: `linear-gradient(135deg, ${categoryColor}10 0%, ${categoryColor}05 100%)`,
                                                flexDirection: 'column',
                                                gap: '0.5rem'
                                            }}>
                                                <div style={{ fontSize: '3rem' }}>{icon}</div>
                                                <div style={{ fontSize: '0.9rem', color: categoryColor }}>
                                                    {selectedCategory?.name || 'Modelo'}
                                                </div>
                                            </div>
                                            <div style={styles.modelBadge}>
                                                <FiEye size={10} /> 3D
                                            </div>
                                        </div>
                                        <div style={styles.modelInfo}>
                                            <h3 style={styles.modelName}>{model.name}</h3>
                                            <div style={styles.modelMeta}>
                                                <span style={styles.modelMetaItem}>
                                                    <FiBox size={12} color={categoryColor} /> {format}
                                                </span>
                                                <span style={styles.modelMetaItem}>
                                                    <FiDownload size={12} color={categoryColor} /> {size} MB
                                                </span>
                                            </div>
                                            <div style={styles.modelPrice}>
                                                ${typeof price === 'number' ? price.toFixed(2) : '0.00'}
                                            </div>
                                            <div style={styles.modelStats}>
                                                <FiStar color="#fbbf24" /> 4.5 · 128
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