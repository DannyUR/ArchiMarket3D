import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGrid,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiSearch,
    FiX,
    FiPackage,
    FiCalendar
} from 'react-icons/fi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const CategoriesManagement = () => {
    const { showSuccess, showError } = useNotification();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchCategories();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await API.get('/categories');
            console.log('Categorías recibidas:', response.data);
            
            let categoriesData = [];
            if (response.data?.data) {
                categoriesData = response.data.data;
            } else if (Array.isArray(response.data)) {
                categoriesData = response.data;
            }

            setCategories(categoriesData);
        } catch (error) {
            console.error('Error cargando categorías:', error);
            showError('Error al cargar las categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingCategory) {
                await API.put(`/admin/categories/${editingCategory.id}`, formData);
                showSuccess('✅ Categoría actualizada');
            } else {
                await API.post('/admin/categories', formData);
                showSuccess('✅ Categoría creada');
            }

            closeModal();
            fetchCategories();
        } catch (error) {
            console.error('Error guardando categoría:', error);
            showError('❌ Error al guardar');
        }
    };

    const handleDelete = async (id, modelsCount) => {
        if (modelsCount > 0) {
            showError(`❌ No se puede eliminar: tiene ${modelsCount} modelos asociados`);
            return;
        }

        if (window.confirm('¿Eliminar esta categoría?')) {
            try {
                await API.delete(`/admin/categories/${id}`);
                showSuccess('🗑️ Categoría eliminada');
                fetchCategories();
            } catch (error) {
                console.error('Error eliminando categoría:', error);
                showError('❌ Error al eliminar');
            }
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: ''
        });
    };

    const closeModal = () => {
        setShowModal(false);
        setTimeout(() => {
            resetForm();
        }, 100);
    };

    const openNewCategoryModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setShowModal(true);
    };

    const filteredCategories = categories.filter(cat => 
        cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const styles = {
        container: {
            padding: isMobile ? '1rem' : '1.5rem',
            width: '100%'
        },
        buttonContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '1.5rem'
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
            whiteSpace: 'nowrap'
        },
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
            border: `2px solid ${colors.primary}`,
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
        filtersBar: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: `2px solid ${colors.primary}`,
            flex: 1
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            width: '100%',
            fontSize: '0.95rem'
        },
        // Vista móvil (tarjetas)
        cardsContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem'
        },
        categoryCard: {
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
            marginBottom: '0.75rem'
        },
        cardTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        cardIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.2rem'
        },
        cardName: {
            fontWeight: '600',
            color: colors.dark,
            fontSize: '1.1rem'
        },
        cardDescription: {
            color: '#64748b',
            fontSize: '0.85rem',
            marginBottom: '1rem',
            lineHeight: '1.5'
        },
        cardFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '0.75rem'
        },
        modelCount: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.85rem',
            color: '#64748b'
        },
        cardActions: {
            display: 'flex',
            gap: '0.5rem'
        },
        cardActionBtn: {
            padding: '0.4rem',
            backgroundColor: '#f8fafc',
            border: `2px solid ${colors.primary}`,
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        // Vista desktop (tabla)
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
            color: colors.dark
        },
        categoryInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        categoryIcon: {
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary
        },
        categoryName: {
            fontWeight: '500',
            color: colors.dark
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
            fontSize: '1rem'
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
            border: `2px solid ${colors.primary}`,
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
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
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
        textarea: {
            width: '100%',
            padding: '0.7rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            boxSizing: 'border-box',
            minHeight: '100px',
            resize: 'vertical'
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

    const totalCategories = categories.length;
    const totalModels = categories.reduce((acc, cat) => acc + (cat.models_count || 0), 0);
    const avgModelsPerCategory = totalCategories > 0 ? (totalModels / totalCategories).toFixed(0) : 0;
    const categoriesWithModels = categories.filter(cat => cat.models_count > 0).length;

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>Cargando categorías...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Botón Nueva Categoría */}
            <div style={styles.buttonContainer}>
                <button style={styles.addButton} onClick={openNewCategoryModal}>
                    <FiPlus /> Nueva Categoría
                </button>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{totalCategories}</div>
                    <div style={styles.statLabel}>Total categorías</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{totalModels}</div>
                    <div style={styles.statLabel}>Modelos totales</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{avgModelsPerCategory}</div>
                    <div style={styles.statLabel}>Promedio x categoría</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{categoriesWithModels}</div>
                    <div style={styles.statLabel}>Categorías con modelos</div>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filtersBar}>
                <div style={styles.searchBox}>
                    <FiSearch color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Buscar categorías..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Vista móvil (tarjetas) */}
            {isMobile && (
                <div style={styles.cardsContainer}>
                    {filteredCategories.length === 0 ? (
                        <div style={styles.emptyState}>
                            No se encontraron categorías
                        </div>
                    ) : (
                        filteredCategories.map((category) => (
                            <motion.div
                                key={category.id}
                                style={styles.categoryCard}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardTitle}>
                                        <div style={styles.cardIcon}>
                                            <FiGrid />
                                        </div>
                                        <span style={styles.cardName}>{category.name}</span>
                                    </div>
                                </div>

                                <div style={styles.cardDescription}>
                                    {category.description || 'Sin descripción'}
                                </div>

                                <div style={styles.cardFooter}>
                                    <div style={styles.modelCount}>
                                        <FiPackage size={14} />
                                        <span>{category.models_count || 0} modelos</span>
                                    </div>

                                    <div style={styles.cardActions}>
                                        <button
                                            style={styles.cardActionBtn}
                                            onClick={() => openEditModal(category)}
                                            title="Editar"
                                        >
                                            <FiEdit size={14} />
                                        </button>
                                        <button
                                            style={styles.cardActionBtn}
                                            onClick={() => handleDelete(category.id, category.models_count)}
                                            title="Eliminar"
                                        >
                                            <FiTrash2 size={14} color={colors.danger} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Vista desktop (tabla) */}
            {!isMobile && (
                <div style={styles.tableContainer}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Categoría</th>
                                    <th style={styles.th}>Descripción</th>
                                    <th style={styles.th}>Modelos</th>
                                    <th style={styles.th}>Fecha creación</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                            No se encontraron categorías
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((category, index) => (
                                        <motion.tr
                                            key={category.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td style={styles.td}>
                                                <div style={styles.categoryInfo}>
                                                    <div style={styles.categoryIcon}>
                                                        <FiGrid />
                                                    </div>
                                                    <span style={styles.categoryName}>{category.name}</span>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                {category.description || '-'}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    backgroundColor: colors.primary + '10',
                                                    color: colors.primary,
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {category.models_count || 0}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <FiCalendar size={14} color="#64748b" />
                                                    {new Date(category.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actions}>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => openEditModal(category)}
                                                        title="Editar"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleDelete(category.id, category.models_count)}
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
                        onClick={closeModal}
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
                                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                                </h3>
                                <button style={styles.closeBtn} onClick={closeModal}>
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
                                        placeholder="Descripción de la categoría..."
                                    />
                                </div>

                                <div style={styles.modalActions}>
                                    <button type="button" style={styles.cancelBtn} onClick={closeModal}>
                                        Cancelar
                                    </button>
                                    <button type="submit" style={styles.saveBtn}>
                                        {editingCategory ? 'Guardar cambios' : 'Crear categoría'}
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

export default CategoriesManagement;