import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser,
    FiMail,
    FiBriefcase,
    FiShoppingBag,
    FiDownload,
    FiLogOut,
    FiEdit2,
    FiSave,
    FiX,
    FiCalendar,
    FiDollarSign,
    FiPackage,
    FiStar,
    FiClock,
    FiChevronRight,
    FiEye,
    FiCheckCircle,
    FiFileText,
    FiXCircle
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        company: ''
    });
    const [purchases, setPurchases] = useState([]);
    const [activeTab, setActiveTab] = useState('profile');
    const [stats, setStats] = useState({
        totalSpent: 0,
        totalPurchases: 0,
        totalDownloads: 0,
        memberSince: ''
    });
    const [userLicenses, setUserLicenses] = useState([]);
    const { showSuccess, showError } = useNotification();

    useEffect(() => {
        const fetchAllData = async () => {
            await Promise.all([
                fetchUserData(),
                fetchPurchases(),
                fetchUserLicenses()
            ]);
        };
        fetchAllData();
    }, []);

    const fetchUserLicenses = async () => {
        try {
            const response = await API.get('/my-licenses');
            console.log('Licencias:', response.data);
            setUserLicenses(response.data?.data?.licenses || []);
        } catch (error) {
            console.error('Error cargando licencias:', error);
            setUserLicenses([]);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await API.get('/profile');
            const userData = response.data?.data?.user;

            if (userData) {
                setUser(userData);
                setFormData({
                    name: userData.name || '',
                    company: userData.company || ''
                });
                setStats({
                    totalSpent: response.data?.data?.stats?.total_spent || 0,
                    totalPurchases: response.data?.data?.stats?.total_purchases || 0,
                    totalDownloads: 0,
                    memberSince: userData.created_at
                        ? new Date(userData.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })
                        : 'Fecha no disponible'
                });
            }
        } catch (error) {
            console.error('Error cargando perfil:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPurchases = async () => {
        try {
            const response = await API.get('/profile/purchases');
            console.log('Compras response:', response.data);
            const purchasesData = response.data?.data?.data || [];
            setPurchases(purchasesData);
        } catch (error) {
            console.error('Error cargando compras:', error);
            setPurchases([]);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await API.put('/profile', formData);
            setUser(response.data.data);
            setEditing(false);
            showSuccess('✅ Perfil actualizado correctamente');
        } catch (error) {
            showError('❌ Error al actualizar el perfil');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getLicenseTypeLabel = (type) => {
        const labels = {
            personal: 'Personal',
            business: 'Empresarial',
            unlimited: 'Ilimitada'
        };
        return labels[type] || type;
    };

    const getLicenseTypeColor = (type) => {
        const colors = {
            personal: '#3b82f6',
            business: '#8b5cf6',
            unlimited: '#10b981'
        };
        return colors[type] || '#64748b';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin expiración';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem',
            backgroundColor: '#f8fafc',
            minHeight: 'calc(100vh - 80px)'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        titleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.dark,
            margin: 0
        },
        titleBadge: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.25rem 1rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        logoutBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.white,
            color: colors.danger,
            border: `1px solid ${colors.danger}20`,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '0.95rem',
            fontWeight: '500',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        statIcon: {
            fontSize: '1.5rem',
            color: colors.primary,
            marginBottom: '1rem'
        },
        statValue: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '1.5rem'
        },
        sidebar: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0',
            height: 'fit-content'
        },
        avatarContainer: {
            position: 'relative',
            width: '120px',
            height: '120px',
            margin: '0 auto 1.5rem'
        },
        avatar: {
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2.5rem',
            fontWeight: '600',
            boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)'
        },
        avatarBadge: {
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            width: '25px',
            height: '25px',
            backgroundColor: colors.success,
            borderRadius: '50%',
            border: `3px solid ${colors.white}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.8rem'
        },
        userInfo: {
            textAlign: 'center',
            marginBottom: '2rem'
        },
        userName: {
            fontSize: '1.3rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        userEmail: {
            fontSize: '0.9rem',
            color: '#64748b',
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
        },
        userType: {
            display: 'inline-block',
            padding: '0.5rem 1rem',
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginBottom: '1rem'
        },
        memberSince: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: '#64748b',
            padding: '0.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
        },
        navMenu: {
            marginTop: '2rem'
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '0.5rem'
        },
        navItemLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        navIcon: {
            fontSize: '1.2rem',
            color: '#64748b'
        },
        navText: {
            fontSize: '1rem',
            fontWeight: '500',
            color: colors.dark
        },
        navActive: {
            backgroundColor: colors.primary + '10',
            borderLeft: `4px solid ${colors.primary}`
        },
        navActiveIcon: {
            color: colors.primary
        },
        mainContent: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        sectionHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: `2px solid #e2e8f0`
        },
        sectionTitle: {
            fontSize: '1.3rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        editBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: 'transparent',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.3s'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1.5rem'
        },
        infoItem: {
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px'
        },
        infoLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '0.5rem'
        },
        infoValue: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark
        },
        input: {
            width: '100%',
            padding: '0.8rem 1rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            fontSize: '1rem',
            transition: 'all 0.3s',
            outline: 'none',
            backgroundColor: colors.white
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem'
        },
        saveBtn: {
            padding: '0.8rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '500'
        },
        cancelBtn: {
            padding: '0.8rem 1.5rem',
            backgroundColor: 'white',
            color: colors.dark,
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.95rem',
            fontWeight: '500'
        },
        purchaseGrid: {
            display: 'grid',
            gap: '1rem'
        },
        purchaseCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '1.5rem',
            alignItems: 'center',
            transition: 'transform 0.2s',
            cursor: 'pointer',
            border: '1px solid #e2e8f0'
        },
        purchaseIcon: {
            width: '50px',
            height: '50px',
            backgroundColor: colors.primary + '10',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.5rem'
        },
        purchaseDetails: {
            flex: 1
        },
        purchaseId: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        purchaseMeta: {
            display: 'flex',
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#64748b'
        },
        purchaseAmount: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.primary
        },
        viewBtn: {
            padding: '0.5rem 1rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
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
        },
        licensesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
        },
        licenseCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s',
            cursor: 'pointer'
        },
        licenseHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
        },
        licenseIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem'
        },
        licenseName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark
        },
        licenseType: {
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500',
            color: 'white',
            marginLeft: '0.5rem'
        },
        licenseBody: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1rem'
        },
        licenseInfo: {
            fontSize: '0.95rem'
        },
        licenseLabel: {
            color: '#64748b',
            fontSize: '0.85rem',
            marginBottom: '0.25rem'
        },
        licenseValue: {
            fontWeight: '500',
            color: colors.dark
        },
        licenseStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            width: 'fit-content'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ fontSize: '1.2rem', color: colors.primary }}>Cargando perfil...</div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>Mi Perfil</h1>
                    <span style={styles.titleBadge}>
                        {user?.user_type === 'architect' && 'Arquitecto'}
                        {user?.user_type === 'engineer' && 'Ingeniero'}
                        {user?.user_type === 'company' && 'Empresa'}
                    </span>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                {[
                    { icon: <FiDollarSign />, value: `$${stats.totalSpent || 0}`, label: 'Total gastado' },
                    { icon: <FiPackage />, value: stats.totalPurchases || 0, label: 'Compras realizadas' },
                    { icon: <FiDownload />, value: stats.totalDownloads || 0, label: 'Descargas' },
                    { icon: <FiClock />, value: stats.memberSince ? stats.memberSince.split(' ')[2] : '...', label: 'Miembro desde' }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        style={styles.statCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                    >
                        <div style={styles.statIcon}>{stat.icon}</div>
                        <div style={styles.statValue}>{stat.value}</div>
                        <div style={styles.statLabel}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Main Grid */}
            <div style={styles.mainGrid}>
                {/* Sidebar */}
                <motion.div
                    style={styles.sidebar}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div style={styles.avatarContainer}>
                        <div style={styles.avatar}>
                            {getInitials(user?.name)}
                        </div>
                        <div style={styles.avatarBadge}>
                            <FiCheckCircle size={12} />
                        </div>
                    </div>

                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.name || 'Usuario'}</div>
                        <div style={styles.userEmail}>
                            <FiMail size={14} /> {user?.email || 'cargando...'}
                        </div>
                        {user?.company && (
                            <div style={{ ...styles.userEmail, marginBottom: '1rem' }}>
                                <FiBriefcase size={14} /> {user?.company}
                            </div>
                        )}
                        <div style={styles.memberSince}>
                            <FiCalendar size={14} /> Miembro desde {stats.memberSince || '...'}
                        </div>
                    </div>

                    <div style={styles.navMenu}>
                        {[
                            { id: 'profile', icon: <FiUser />, label: 'Información personal' },
                            { id: 'purchases', icon: <FiShoppingBag />, label: 'Mis compras' },
                            { id: 'downloads', icon: <FiDownload />, label: 'Descargas' },
                            { id: 'licenses', icon: <FiFileText />, label: 'Mis Licencias' }
                        ].map(item => (
                            <motion.div
                                key={item.id}
                                style={{
                                    ...styles.navItem,
                                    ...(activeTab === item.id ? styles.navActive : {})
                                }}
                                whileHover={{ x: 5, backgroundColor: colors.primary + '05' }}
                                onClick={() => setActiveTab(item.id)}
                            >
                                <div style={styles.navItemLeft}>
                                    <span style={{
                                        ...styles.navIcon,
                                        ...(activeTab === item.id ? styles.navActiveIcon : {})
                                    }}>
                                        {item.icon}
                                    </span>
                                    <span style={styles.navText}>{item.label}</span>
                                </div>
                                <FiChevronRight color={activeTab === item.id ? colors.primary : '#cbd5e1'} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Main Content */}
                <motion.div
                    style={styles.mainContent}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <AnimatePresence mode="wait">
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>
                                        <FiUser /> Información personal
                                    </h2>
                                    {!editing && (
                                        <motion.button
                                            style={styles.editBtn}
                                            whileHover={{ scale: 1.02, backgroundColor: colors.primary + '10' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setEditing(true)}
                                        >
                                            <FiEdit2 /> Editar perfil
                                        </motion.button>
                                    )}
                                </div>

                                {!editing ? (
                                    <div style={styles.infoGrid}>
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>
                                                <FiUser /> Nombre completo
                                            </div>
                                            <div style={styles.infoValue}>{user?.name || 'No disponible'}</div>
                                        </div>
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>
                                                <FiMail /> Correo electrónico
                                            </div>
                                            <div style={styles.infoValue}>{user?.email || 'No disponible'}</div>
                                        </div>
                                        {user?.company && (
                                            <div style={styles.infoItem}>
                                                <div style={styles.infoLabel}>
                                                    <FiBriefcase /> Empresa
                                                </div>
                                                <div style={styles.infoValue}>{user?.company}</div>
                                            </div>
                                        )}
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>
                                                <FiCalendar /> Fecha de registro
                                            </div>
                                            <div style={styles.infoValue}>
                                                {user?.created_at
                                                    ? new Date(user.created_at).toLocaleDateString('es-MX', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })
                                                    : 'No disponible'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={styles.infoGrid}>
                                            <div style={styles.infoItem}>
                                                <label style={styles.infoLabel}>Nombre</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Tu nombre"
                                                />
                                            </div>
                                            <div style={styles.infoItem}>
                                                <label style={styles.infoLabel}>Empresa (opcional)</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                    placeholder="Nombre de la empresa"
                                                />
                                            </div>
                                        </div>

                                        <div style={styles.buttonGroup}>
                                            <motion.button
                                                style={styles.saveBtn}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleUpdateProfile}
                                            >
                                                <FiSave /> Guardar cambios
                                            </motion.button>
                                            <motion.button
                                                style={styles.cancelBtn}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setEditing(false)}
                                            >
                                                <FiX /> Cancelar
                                            </motion.button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'purchases' && (
                            <motion.div
                                key="purchases"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>
                                        <FiShoppingBag /> Historial de compras
                                    </h2>
                                </div>

                                {purchases.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <FiPackage style={styles.emptyIcon} />
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                            No hay compras aún
                                        </h3>
                                        <p style={{ color: '#94a3b8' }}>
                                            Explora nuestro catálogo y encuentra el modelo perfecto para tu proyecto
                                        </p>
                                    </div>
                                ) : (
                                    <div style={styles.purchaseGrid}>
                                        {purchases.map((purchase, index) => (
                                            <motion.div
                                                key={purchase.id || index}
                                                style={styles.purchaseCard}
                                                whileHover={{ scale: 1.01, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                                onClick={() => navigate(`/purchases/${purchase.id}`)}
                                            >
                                                <div style={styles.purchaseIcon}>
                                                    <HiOutlineCube />
                                                </div>
                                                <div style={styles.purchaseDetails}>
                                                    <div style={styles.purchaseId}>
                                                        Compra #{purchase.id}
                                                    </div>
                                                    <div style={styles.purchaseMeta}>
                                                        <span>
                                                            <FiCalendar size={12} /> {purchase.purchase_date
                                                                ? new Date(purchase.purchase_date).toLocaleDateString()
                                                                : 'Fecha no disponible'}
                                                        </span>
                                                        <span>
                                                            <FiPackage size={12} /> {purchase.models?.length || 0} modelos
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={styles.purchaseAmount}>
                                                        ${purchase.total || 0}
                                                    </div>
                                                    <button style={styles.viewBtn}>
                                                        <FiEye /> Ver detalles
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'downloads' && (
                            <motion.div
                                key="downloads"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>
                                        <FiDownload /> Descargas
                                    </h2>
                                </div>
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <p>Redirigiendo a la página de descargas...</p>
                                    {navigate('/downloads')}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'licenses' && (
                            <motion.div
                                key="licenses"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>
                                        <FiFileText /> Mis Licencias
                                    </h2>
                                </div>

                                {!userLicenses || userLicenses.length === 0 ? (
                                    <div style={styles.emptyState}>
                                        <FiFileText style={styles.emptyIcon} />
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                            No tienes licencias aún
                                        </h3>
                                        <p style={{ color: '#94a3b8' }}>
                                            Realiza tu primera compra para obtener licencias de modelos
                                        </p>
                                    </div>
                                ) : (
                                    <div style={styles.licensesGrid}>
                                        {userLicenses.map((license) => (
                                            <motion.div
                                                key={license.id}
                                                style={styles.licenseCard}
                                                whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                                                onClick={() => navigate(`/models/${license.model?.id}`)}
                                            >
                                                <div style={styles.licenseHeader}>
                                                    <div style={{
                                                        ...styles.licenseIcon,
                                                        backgroundColor: getLicenseTypeColor(license.license_type) + '20',
                                                        color: getLicenseTypeColor(license.license_type)
                                                    }}>
                                                        <HiOutlineCube />
                                                    </div>
                                                    <div>
                                                        <span style={styles.licenseName}>
                                                            {license.model?.name || 'Modelo'}
                                                        </span>
                                                        <span style={{
                                                            ...styles.licenseType,
                                                            backgroundColor: getLicenseTypeColor(license.license_type)
                                                        }}>
                                                            {getLicenseTypeLabel(license.license_type)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div style={styles.licenseBody}>
                                                    <div style={styles.licenseInfo}>
                                                        <div style={styles.licenseLabel}>Precio pagado</div>
                                                        <div style={styles.licenseValue}>${license.price_paid || 0}</div>
                                                    </div>
                                                    <div style={styles.licenseInfo}>
                                                        <div style={styles.licenseLabel}>Expiración</div>
                                                        <div style={styles.licenseValue}>
                                                            {formatDate(license.expires_at)}
                                                        </div>
                                                    </div>
                                                    <div style={styles.licenseInfo}>
                                                        <div style={styles.licenseLabel}>Fecha de compra</div>
                                                        <div style={styles.licenseValue}>
                                                            {license.purchase_date
                                                                ? new Date(license.purchase_date).toLocaleDateString()
                                                                : 'No disponible'}
                                                        </div>
                                                    </div>
                                                    <div style={styles.licenseInfo}>
                                                        <div style={styles.licenseLabel}>Estado</div>
                                                        <div style={{
                                                            ...styles.licenseStatus,
                                                            backgroundColor: license.is_active && !license.is_expired
                                                                ? colors.success + '10'
                                                                : colors.danger + '10',
                                                            color: license.is_active && !license.is_expired
                                                                ? colors.success
                                                                : colors.danger
                                                        }}>
                                                            {license.is_active && !license.is_expired ? (
                                                                <><FiCheckCircle size={12} /> Activa</>
                                                            ) : (
                                                                <><FiXCircle size={12} /> Expirada</>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};

export default Profile;