import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiSearch,
    FiX,
    FiUserCheck,
    FiUserX
} from 'react-icons/fi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const UsersManagement = () => {
    const { showSuccess, showError } = useNotification();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        user_type: 'architect',
        company: '',
        is_active: true
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchUsers();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await API.get('/admin/users');
            console.log('Respuesta completa:', response.data);

            let usersData = [];
            if (response.data?.data?.data) {
                usersData = response.data.data.data;
            } else if (Array.isArray(response.data?.data)) {
                usersData = response.data.data;
            } else if (Array.isArray(response.data)) {
                usersData = response.data;
            }

            console.log('Usuarios extraídos:', usersData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            showError('Error al cargar los usuarios');
            setUsers([]);
        } finally {
            setLoading(false);
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
            if (editingUser) {
                await API.put(`/admin/users/${editingUser.id}/role`, { user_type: formData.user_type });
                await API.put(`/admin/users/${editingUser.id}/toggle-status`, { is_active: formData.is_active });
                showSuccess('✅ Usuario actualizado');
            } else {
                // Aquí iría la lógica para crear usuario
                showSuccess('✅ Usuario creado (próximamente)');
            }

            closeModal();  
            fetchUsers();
        } catch (error) {
            console.error('Error guardando usuario:', error);
            showError('❌ Error al guardar');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) {
            try {
                await API.delete(`/admin/users/${id}`);
                showSuccess('🗑️ Usuario eliminado correctamente');
                fetchUsers();
            } catch (error) {
                console.error('Error eliminando usuario:', error);

                if (error.response?.status === 409) {
                    showError('❌ No se puede eliminar: El usuario tiene compras o reseñas asociadas');
                } else {
                    showError('❌ Error al eliminar el usuario');
                }
            }
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            await API.put(`/admin/users/${id}/toggle-status`);
            showSuccess(currentStatus ? '👤 Usuario desactivado' : '👤 Usuario activado');
            fetchUsers();
        } catch (error) {
            showError('❌ Error al cambiar estado');
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            user_type: 'architect',
            company: '',
            is_active: true
        });
    };

    const closeModal = () => {
        setShowModal(false);
        // Pequeño delay para asegurar que el modal se cierre antes de resetear
        setTimeout(() => {
            resetForm();
        }, 100);
    };

    const openNewUserModal = () => {
        resetForm(); // Llama a resetForm directamente
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            user_type: user.user_type,
            company: user.company || '',
            is_active: user.is_active
        });
        setShowModal(true);
    };


    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || user.user_type === filterRole;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'active' && user.is_active) ||
            (filterStatus === 'inactive' && !user.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleLabel = (role) => {
        const labels = {
            'architect': 'Arquitecto',
            'engineer': 'Ingeniero',
            'company': 'Empresa',
            'admin': 'Administrador'
        };
        return labels[role] || role;
    };

    const getRoleColor = (role) => {
        const colors = {
            'architect': '#3b82f6',
            'engineer': '#10b981',
            'company': '#8b5cf6',
            'admin': '#f59e0b'
        };
        return colors[role] || '#64748b';
    };

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
        filterSelect: {
            padding: '0.5rem 2rem 0.5rem 1rem',
            backgroundColor: '#fff',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.95rem',
            color: colors.dark,
            minWidth: isMobile ? '100%' : '160px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '16px'
        },
        cardsContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem'
        },
        userCard: {
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
        cardUser: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        cardAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1rem',
            fontWeight: '600'
        },
        cardName: {
            fontWeight: '600',
            color: colors.dark
        },
        cardEmail: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        cardBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.7rem',
            fontWeight: '500'
        },
        activeBadge: {
            backgroundColor: colors.success + '10',
            color: colors.success
        },
        inactiveBadge: {
            backgroundColor: colors.danger + '10',
            color: colors.danger
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
            color: colors.dark
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
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        userAvatar: {
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontWeight: '600'
        },
        roleBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '500'
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '500'
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
            border: `2px solid ${colors.primary}`
        },
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
            boxSizing: 'border-box',
            backgroundColor: editingUser ? '#f8fafc' : '#fff',
            cursor: editingUser ? 'not-allowed' : 'text'
        },
        select: {
            width: '100%',
            padding: '0.7rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            backgroundColor: '#fff'
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

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.is_active).length;
    const inactiveUsers = users.filter(u => !u.is_active).length;
    const adminUsers = users.filter(u => u.user_type === 'admin').length;

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>Cargando usuarios...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Botón Nuevo Usuario */}
            <div style={styles.buttonContainer}>
                <button style={styles.addButton} onClick={openNewUserModal}>
                    <FiPlus /> Nuevo Usuario
                </button>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{totalUsers}</div>
                    <div style={styles.statLabel}>Total usuarios</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{activeUsers}</div>
                    <div style={styles.statLabel}>Activos</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{inactiveUsers}</div>
                    <div style={styles.statLabel}>Inactivos</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{adminUsers}</div>
                    <div style={styles.statLabel}>Administradores</div>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filtersBar}>
                <div style={styles.searchBox}>
                    <FiSearch color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select style={styles.filterSelect} value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="all">Todos los roles</option>
                    <option value="architect">Arquitectos</option>
                    <option value="engineer">Ingenieros</option>
                    <option value="company">Empresas</option>
                    <option value="admin">Administradores</option>
                </select>

                <select style={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>
            </div>

            {/* Vista móvil */}
            {isMobile && (
                <div style={styles.cardsContainer}>
                    {filteredUsers.length === 0 ? (
                        <div style={styles.emptyState}>
                            No se encontraron usuarios
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
                            <motion.div
                                key={user.id}
                                style={styles.userCard}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div style={styles.cardHeader}>
                                    <div style={styles.cardUser}>
                                        <div style={styles.cardAvatar}>
                                            {user.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={styles.cardName}>{user.name}</div>
                                            <div style={styles.cardEmail}>{user.email}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.cardBadge,
                                        ...(user.is_active ? styles.activeBadge : styles.inactiveBadge)
                                    }}>
                                        {user.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>

                                <div style={styles.cardDetails}>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Rol</div>
                                        <div style={styles.detailValue}>
                                            <span style={{
                                                ...styles.roleBadge,
                                                backgroundColor: getRoleColor(user.user_type) + '10',
                                                color: getRoleColor(user.user_type)
                                            }}>
                                                {getRoleLabel(user.user_type)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Empresa</div>
                                        <div style={styles.detailValue}>{user.company || '-'}</div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Registro</div>
                                        <div style={styles.detailValue}>
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.cardActions}>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                                    >
                                        {user.is_active ? <FiUserX /> : <FiUserCheck />}
                                        {user.is_active ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => openEditModal(user)}
                                    >
                                        <FiEdit /> Editar
                                    </button>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleDelete(user.id)}
                                        disabled={user.shopping?.length > 0} // Opcional: deshabilitar si tiene compras
                                        title={user.shopping?.length > 0 ? 'No se puede eliminar: tiene compras' : 'Eliminar usuario'}
                                    >
                                        <FiTrash2 color={user.shopping?.length > 0 ? '#94a3b8' : colors.danger} />
                                        Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Vista desktop */}
            {!isMobile && (
                <div style={styles.tableContainer}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Usuario</th>
                                    <th style={styles.th}>Email</th>
                                    <th style={styles.th}>Rol</th>
                                    <th style={styles.th}>Empresa</th>
                                    <th style={styles.th}>Registro</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td style={styles.td}>
                                                <div style={styles.userInfo}>
                                                    <div style={styles.userAvatar}>
                                                        {user.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{user.name}</span>
                                                </div>
                                            </td>
                                            <td style={styles.td}>{user.email}</td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.roleBadge,
                                                    backgroundColor: getRoleColor(user.user_type) + '10',
                                                    color: getRoleColor(user.user_type)
                                                }}>
                                                    {getRoleLabel(user.user_type)}
                                                </span>
                                            </td>
                                            <td style={styles.td}>{user.company || '-'}</td>
                                            <td style={styles.td}>
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: user.is_active ? colors.success + '10' : colors.danger + '10',
                                                    color: user.is_active ? colors.success : colors.danger
                                                }}>
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.actions}>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                        title={user.is_active ? 'Desactivar' : 'Activar'}
                                                    >
                                                        {user.is_active ? <FiUserX /> : <FiUserCheck />}
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => openEditModal(user)}
                                                        title="Editar rol"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleDelete(user.id)}
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
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h3>
                                <button style={styles.closeBtn} onClick={closeModal}>  
                                    <FiX />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* Información del usuario (solo para edición) */}
                                {editingUser && (
                                    <div style={{
                                        backgroundColor: '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        marginBottom: '1.5rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '12px',
                                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'white',
                                                fontSize: '1.2rem',
                                                fontWeight: '600'
                                            }}>
                                                {editingUser.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{editingUser.name}</div>
                                                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{editingUser.email}</div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Registro</div>
                                                <div style={{ fontWeight: '500' }}>
                                                    {new Date(editingUser.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Empresa</div>
                                                <div style={{ fontWeight: '500' }}>{editingUser.company || '-'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Campos para nuevo usuario */}
                                {!editingUser && (
                                    <>
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
                                            <label style={styles.label}>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                                required
                                            />
                                        </div>

                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Contraseña *</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                style={styles.input}
                                                required
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Edición de rol */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Rol de usuario</label>
                                    <select
                                        name="user_type"
                                        value={formData.user_type}
                                        onChange={handleInputChange}
                                        style={styles.select}
                                    >
                                        <option value="architect">Arquitecto</option>
                                        <option value="engineer">Ingeniero</option>
                                        <option value="company">Empresa</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                {/* Empresa */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Empresa</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        style={styles.input}
                                    />
                                </div>

                                {/* Estado de la cuenta */}
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Estado de la cuenta</label>
                                    <div style={{
                                        display: 'flex',
                                        gap: '1rem',
                                        marginTop: '0.5rem'
                                    }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="is_active"
                                                value="true"
                                                checked={formData.is_active === true}
                                                onChange={() => setFormData({ ...formData, is_active: true })}
                                            />
                                            <span style={{ color: colors.success }}>Activa</span>
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="radio"
                                                name="is_active"
                                                value="false"
                                                checked={formData.is_active === false}
                                                onChange={() => setFormData({ ...formData, is_active: false })}
                                            />
                                            <span style={{ color: colors.danger }}>Inactiva</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div style={styles.modalActions}>
                                    <button type="button" style={styles.cancelBtn} onClick={closeModal}>  
                                        Cancelar
                                    </button>
                                    <button type="submit" style={styles.saveBtn}>
                                        {editingUser ? 'Guardar cambios' : 'Crear usuario'}
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

export default UsersManagement;