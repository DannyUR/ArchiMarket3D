import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiPackage,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiSearch,
    FiStar,
    FiX,
    FiDollarSign,
    FiGrid,
    FiDownload,
    FiEye
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const ModelsManagement = () => {
    const { showSuccess, showError } = useNotification();
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterFormat, setFilterFormat] = useState('all');
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        format: 'OBJ',
        size_mb: '',
        category_id: '',
        featured: false
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchModels();
        fetchCategories();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchModels = async () => {
        try {
            const response = await API.get('/admin/models');
            console.log('Modelos recibidos:', response.data);
            setModels(response.data.data || []);
        } catch (error) {
            console.error('Error cargando modelos:', error);
            showError('Error al cargar los modelos');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await API.get('/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error cargando categorías:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingModel) {
                await API.put(`/admin/models/${editingModel.id}`, formData);
                showSuccess('✅ Modelo actualizado');
            } else {
                await API.post('/admin/models', formData);
                showSuccess('✅ Modelo creado');
            }

            setShowModal(false);
            resetForm();
            fetchModels();
        } catch (error) {
            console.error('Error guardando modelo:', error);
            showError('❌ Error al guardar');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este modelo?')) {
            try {
                await API.delete(`/admin/models/${id}`);
                showSuccess('🗑️ Modelo eliminado');
                fetchModels();
            } catch (error) {
                showError('❌ Error al eliminar');
            }
        }
    };

    const handleToggleFeatured = async (id, featured) => {
        try {
            await API.post(`/admin/models/${id}/toggle-featured`);
            showSuccess(featured ? '⭐ Quitado de destacados' : '⭐ Destacado');
            fetchModels();
        } catch (error) {
            showError('❌ Error al cambiar estado');
        }
    };

    const resetForm = () => {
        setEditingModel(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            format: 'OBJ',
            size_mb: '',
            category_id: '',
            featured: false
        });
    };

    const openEditModal = (model) => {
        setEditingModel(model);
        setFormData({
            name: model.name,
            description: model.description,
            price: model.price,
            format: model.format,
            size_mb: model.size_mb,
            category_id: model.category_id,
            featured: model.featured
        });
        setShowModal(true);
    };

    const filteredModels = models.filter(model => {
        const matchesSearch = model.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || model.category_id === parseInt(filterCategory);
        const matchesFormat = filterFormat === 'all' || model.format === filterFormat;
        return matchesSearch && matchesCategory && matchesFormat;
    });

    const formats = [...new Set(models.map(m => m.format))];

    const styles = {
        container: {
            padding: isMobile ? '1rem' : '1.5rem',
            width: '100%'
        },
        // Header con título y botón
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        },
        title: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            margin: 0
        },
        addButton: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.95rem',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s',
            ':hover': {
                backgroundColor: colors.secondary
            }
        },
        // Stats cards
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        statCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: isMobile ? '1rem' : '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`
        },
        statValue: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            color: '#64748b'
        },
        // Top Bar con búsqueda (EXACTAMENTE IGUAL AL DASHBOARD)
        topBar: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            marginBottom: '2rem',
            backgroundColor: '#fff',
            padding: isMobile ? '1rem' : '1rem 1.5rem',
            borderRadius: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`,
            gap: isMobile ? '1rem' : 0
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            flex: 1,
            marginRight: isMobile ? 0 : '1rem'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            width: '100%',
            fontSize: '0.95rem',
            '::placeholder': {
                color: '#94a3b8'
            }
        },
        filterGroup: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
            width: isMobile ? '100%' : 'auto'
        },
        filterSelect: {
            padding: '0.5rem 2rem 0.5rem 1rem',
            backgroundColor: '#f8fafc',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.95rem',
            color: colors.dark,
            minWidth: isMobile ? '50%' : '160px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '16px'
        },
        // Vista para móvil (tarjetas)
        cardsContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem'
        },
        modelCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            border: `2px solid ${colors.primary}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #e2e8f0'
        },
        cardTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        cardIcon: {
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary
        },
        cardName: {
            fontWeight: '600',
            color: colors.dark,
            fontSize: '1rem'
        },
        cardBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '500'
        },
        cardDetails: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginBottom: '1rem'
        },
        cardDetail: {
            fontSize: '0.85rem'
        },
        detailLabel: {
            color: '#64748b',
            fontSize: '0.7rem',
            marginBottom: '0.25rem'
        },
        detailValue: {
            fontWeight: '500',
            color: colors.dark,
            fontSize: '0.9rem'
        },
        cardActions: {
            display: 'flex',
            gap: '0.5rem',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1rem'
        },
        cardActionBtn: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#f8fafc',
            border: `2px solid ${colors.primary}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: colors.dark
        },
        // Vista para desktop (tabla)
        tableContainer: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: `2px solid ${colors.primary}`,
            overflow: 'hidden',
            display: isMobile ? 'none' : 'block'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem'
        },
        th: {
            textAlign: 'left',
            padding: '1rem',
            borderBottom: '2px solid #e2e8f0',
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: '600',
            backgroundColor: '#f8fafc',
            whiteSpace: 'nowrap'
        },
        td: {
            padding: '1rem',
            borderBottom: '1px solid #e2e8f0',
            color: colors.dark,
            whiteSpace: 'nowrap'
        },
        modelInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        modelIcon: {
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary
        },
        modelName: {
            fontWeight: '500',
            color: colors.dark
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500'
        },
        featuredBadge: {
            backgroundColor: colors.warning + '10',
            color: colors.warning
        },
        normalBadge: {
            backgroundColor: '#f1f5f9',
            color: '#64748b'
        },
        actions: {
            display: 'flex',
            gap: '0.5rem'
        },
        actionBtn: {
            padding: '0.4rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            borderRadius: '4px',
            fontSize: '1rem',
            ':hover': {
                color: colors.primary
            }
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: `2px solid ${colors.primary}`
        },
        // Modal
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        },
        modal: {
            backgroundColor: '#fff',
            borderRadius: '15px',
            padding: isMobile ? '1.5rem' : '2rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        },
        modalTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#64748b'
        },
        formGroup: {
            marginBottom: '1.2rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.4rem',
            fontSize: '0.9rem',
            color: colors.dark,
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '0.7rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box'
        },
        select: {
            width: '100%',
            padding: '0.7rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            backgroundColor: '#fff',
            boxSizing: 'border-box'
        },
        textarea: {
            width: '100%',
            padding: '0.7rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            minHeight: '80px',
            resize: 'vertical',
            boxSizing: 'border-box'
        },
        checkbox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1.5rem'
        },
        saveBtn: {
            padding: '0.7rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
        },
        cancelBtn: {
            padding: '0.7rem 1.5rem',
            backgroundColor: '#f1f5f9',
            color: colors.dark,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
        }
    };

    const totalModels = models.length;
    const featuredModels = models.filter(m => m.featured).length;
    const totalDownloads = models.reduce((acc, m) => acc + (m.downloads || 0), 0);
    const totalSize = models.reduce((acc, m) => acc + (m.size_mb || 0), 0).toFixed(0);

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>Cargando modelos...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header con título y botón a la derecha */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '1.5rem'
            }}>
                <button style={styles.addButton} onClick={() => { resetForm(); setShowModal(true); }}>
                    <FiPlus /> Nuevo Modelo
                </button>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{totalModels}</div>
                    <div style={styles.statLabel}>Total modelos</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{featuredModels}</div>
                    <div style={styles.statLabel}>Destacados</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{totalDownloads}</div>
                    <div style={styles.statLabel}>Descargas</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{totalSize} MB</div>
                    <div style={styles.statLabel}>Espacio total</div>
                </div>
            </div>

            {/* Top Bar con búsqueda (IGUAL AL DASHBOARD) */}
            <div style={styles.topBar}>
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

                <div style={styles.filterGroup}>
                    <select style={styles.filterSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="all">Todas las categorías</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>

                    <select style={styles.filterSelect} value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)}>
                        <option value="all">Todos los formatos</option>
                        {formats.map(f => (
                            <option key={f} value={f}>{f}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Vista para móvil (tarjetas) */}
            {isMobile && (
                <div style={styles.cardsContainer}>
                    {filteredModels.length === 0 ? (
                        <div style={styles.emptyState}>
                            No se encontraron modelos
                        </div>
                    ) : (
                        filteredModels.map((model) => (
                            <motion.div
                                key={model.id}
                                style={styles.modelCard}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardTitle}>
                                        <div style={styles.cardIcon}>
                                            <HiOutlineCube size={16} />
                                        </div>
                                        <span style={styles.cardName}>{model.name}</span>
                                    </div>
                                    <span style={{
                                        ...styles.cardBadge,
                                        backgroundColor: model.featured ? colors.warning + '10' : '#f1f5f9',
                                        color: model.featured ? colors.warning : '#64748b'
                                    }}>
                                        {model.featured ? '⭐ Destacado' : 'Normal'}
                                    </span>
                                </div>

                                <div style={styles.cardDetails}>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Categoría</div>
                                        <div style={styles.detailValue}>{model.category?.name || '-'}</div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Precio</div>
                                        <div style={styles.detailValue}>${model.price}</div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Formato</div>
                                        <div style={styles.detailValue}>{model.format}</div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Tamaño</div>
                                        <div style={styles.detailValue}>{model.size_mb} MB</div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Descargas</div>
                                        <div style={styles.detailValue}>{model.downloads || 0}</div>
                                    </div>
                                </div>

                                <div style={styles.cardActions}>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleToggleFeatured(model.id, model.featured)}
                                    >
                                        <FiStar color={model.featured ? colors.warning : '#64748b'} />
                                        {model.featured ? 'Quitar' : 'Destacar'}
                                    </button>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => openEditModal(model)}
                                    >
                                        <FiEdit /> Editar
                                    </button>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleDelete(model.id)}
                                    >
                                        <FiTrash2 color={colors.danger} /> Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Vista para desktop (tabla) */}
            {!isMobile && (
                <div style={styles.tableContainer}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Modelo</th>
                                    <th style={styles.th}>Categoría</th>
                                    <th style={styles.th}>Precio</th>
                                    <th style={styles.th}>Formato</th>
                                    <th style={styles.th}>Tamaño</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Descargas</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredModels.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                            No se encontraron modelos
                                        </td>
                                    </tr>
                                ) : (
                                    filteredModels.map((model, index) => (
                                        <motion.tr
                                            key={model.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td style={styles.td}>
                                                <div style={styles.modelInfo}>
                                                    <div style={styles.modelIcon}>
                                                        <HiOutlineCube size={18} />
                                                    </div>
                                                    <span style={styles.modelName}>{model.name}</span>
                                                </div>
                                            </td>
                                            <td style={styles.td}>{model.category?.name || '-'}</td>
                                            <td style={styles.td}>${model.price}</td>
                                            <td style={styles.td}>{model.format}</td>
                                            <td style={styles.td}>{model.size_mb} MB</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.badge,
                                                    ...(model.featured ? styles.featuredBadge : styles.normalBadge)
                                                }}>
                                                    {model.featured ? '⭐ Destacado' : 'Normal'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{model.downloads || 0}</td>
                                            <td style={styles.td}>
                                                <div style={styles.actions}>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleToggleFeatured(model.id, model.featured)}
                                                        title={model.featured ? 'Quitar destacado' : 'Destacar'}
                                                    >
                                                        <FiStar color={model.featured ? colors.warning : '#64748b'} />
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => openEditModal(model)}
                                                        title="Editar"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleDelete(model.id)}
                                                        title="Eliminar"
                                                    >
                                                        <FiTrash2 color={colors.danger} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        style={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            style={styles.modal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>
                                    {editingModel ? 'Editar Modelo' : 'Nuevo Modelo'}
                                </h3>
                                <button style={styles.closeBtn} onClick={() => setShowModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nombre *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Descripción</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        style={styles.textarea}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Precio ($) *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            step="0.01"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Tamaño (MB) *</label>
                                        <input
                                            type="number"
                                            name="size_mb"
                                            value={formData.size_mb}
                                            onChange={handleInputChange}
                                            style={styles.input}
                                            step="0.1"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Formato *</label>
                                        <select
                                            name="format"
                                            value={formData.format}
                                            onChange={handleInputChange}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="OBJ">OBJ</option>
                                            <option value="FBX">FBX</option>
                                            <option value="GLTF">GLTF</option>
                                            <option value="GLB">GLB</option>
                                            <option value="STL">STL</option>
                                            <option value="3DS">3DS</option>
                                        </select>
                                    </div>
                                    <div style={styles.formGroup}>
                                        <label style={styles.label}>Categoría *</label>
                                        <select
                                            name="category_id"
                                            value={formData.category_id}
                                            onChange={handleInputChange}
                                            style={styles.select}
                                            required
                                        >
                                            <option value="">Seleccionar</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div style={styles.checkbox}>
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={formData.featured}
                                        onChange={handleInputChange}
                                        id="featured"
                                    />
                                    <label htmlFor="featured">Marcar como destacado</label>
                                </div>

                                <div style={styles.modalActions}>
                                    <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                                        Cancelar
                                    </button>
                                    <button type="submit" style={styles.saveBtn}>
                                        {editingModel ? 'Actualizar' : 'Crear'} Modelo
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModelsManagement;