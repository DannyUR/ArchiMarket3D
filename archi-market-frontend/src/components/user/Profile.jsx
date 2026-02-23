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
    FiXCircle,
    FiAward,
    FiTrendingUp,
    FiHeart,
    FiShare2,
    FiSettings,
    FiCreditCard,
    FiMapPin,
    FiPhone
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
    const [isMobile, setIsMobile] = useState(false);
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

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh',
            backgroundColor: '#f8fafc'
        },
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginBottom: '2rem'
        },
        titleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        titleIcon: {
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '2.5rem'
        },
        titleBadge: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.5rem 1.5rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            border: `1px solid ${colors.primary}20`
        },
        logoutBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.8rem 1.2rem' : '0.8rem 1.5rem',
            backgroundColor: colors.white,
            color: colors.danger,
            border: `1px solid ${colors.danger}20`,
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '0.95rem',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '1rem' : '1.5rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: isMobile ? '1.2rem' : '1.8rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            transition: 'all 0.3s'
        },
        statIcon: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            color: colors.primary,
            marginBottom: isMobile ? '0.5rem' : '1rem',
            background: colors.primary + '10',
            width: 'fit-content',
            padding: '0.5rem',
            borderRadius: '16px'
        },
        statValue: {
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem',
            lineHeight: '1.2'
        },
        statLabel: {
            fontSize: isMobile ? '0.8rem' : '0.9rem',
            color: '#64748b'
        },
        mainGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '320px 1fr',
            gap: isMobile ? '1.5rem' : '2rem'
        },
        sidebar: {
            backgroundColor: colors.white,
            borderRadius: '32px',
            padding: isMobile ? '2rem 1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            height: 'fit-content',
            position: isMobile ? 'static' : 'sticky',
            top: isMobile ? 'auto' : '100px'
        },
        avatarContainer: {
            position: 'relative',
            width: isMobile ? '100px' : '120px',
            height: isMobile ? '100px' : '120px',
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
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '600',
            boxShadow: `0 10px 30px ${colors.primary}30`,
            border: '4px solid white'
        },
        avatarBadge: {
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            width: '30px',
            height: '30px',
            backgroundColor: colors.success,
            borderRadius: '50%',
            border: `3px solid ${colors.white}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.9rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
        },
        userInfo: {
            textAlign: 'center',
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: `2px solid ${colors.primary}10`
        },
        userName: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        userEmail: {
            fontSize: '0.95rem',
            color: '#64748b',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
        },
        userType: {
            display: 'inline-block',
            padding: '0.5rem 1.5rem',
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            marginBottom: '1rem'
        },
        memberSince: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: '#64748b',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px'
        },
        navMenu: {
            marginTop: '1rem'
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.2rem',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '0.5rem'
        },
        navItemLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        navIcon: {
            fontSize: '1.2rem',
            color: '#64748b',
            width: '24px'
        },
        navText: {
            fontSize: isMobile ? '1rem' : '0.95rem',
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
            borderRadius: '32px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            minHeight: '500px'
        },
        sectionHeader: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: `2px solid ${colors.primary}10`
        },
        sectionTitle: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '700',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        editBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.5rem',
            backgroundColor: 'transparent',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.2s'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1.5rem'
        },
        infoItem: {
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s'
        },
        infoLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '0.75rem'
        },
        infoValue: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            lineHeight: '1.4'
        },
        input: {
            width: '100%',
            padding: '1rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '16px',
            fontSize: '1rem',
            transition: 'all 0.2s',
            outline: 'none',
            backgroundColor: colors.white
        },
        buttonGroup: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            flexWrap: 'wrap'
        },
        saveBtn: {
            padding: '1rem 2rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            boxShadow: `0 8px 20px ${colors.primary}30`
        },
        cancelBtn: {
            padding: '1rem 2rem',
            backgroundColor: 'white',
            color: colors.dark,
            border: `2px solid #e2e8f0`,
            borderRadius: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600'
        },
        purchaseGrid: {
            display: 'grid',
            gap: '1rem'
        },
        purchaseCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            padding: '1.5rem',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto',
            gap: isMobile ? '1rem' : '1.5rem',
            alignItems: 'center',
            transition: 'all 0.2s',
            cursor: 'pointer',
            border: '1px solid #f0f0f0'
        },
        purchaseIcon: {
            width: isMobile ? '60px' : '50px',
            height: isMobile ? '60px' : '50px',
            backgroundColor: colors.primary + '10',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '1.5rem'
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
            color: '#64748b',
            flexWrap: 'wrap'
        },
        purchaseAmount: {
            fontSize: isMobile ? '1.5rem' : '1.3rem',
            fontWeight: '700',
            color: colors.primary
        },
        viewBtn: {
            padding: '0.8rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        emptyState: {
            textAlign: 'center',
            padding: isMobile ? '3rem 1.5rem' : '4rem',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            color: '#64748b'
        },
        emptyIcon: {
            fontSize: '4rem',
            color: colors.primary + '40',
            marginBottom: '1rem'
        },
        licensesGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
        },
        licenseCard: {
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            padding: '1.5rem',
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s',
            cursor: 'pointer'
        },
        licenseHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        licenseIcon: {
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
        },
        licenseName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark
        },
        licenseType: {
            display: 'inline-block',
            padding: '0.3rem 1rem',
            borderRadius: '30px',
            fontSize: '0.8rem',
            fontWeight: '600',
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
            fontSize: '0.8rem',
            marginBottom: '0.25rem'
        },
        licenseValue: {
            fontWeight: '600',
            color: colors.dark
        },
        licenseStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            width: 'fit-content'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: '60vh',
                    gap: '1.5rem'
                }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        border: `4px solid ${colors.primary}20`,
                        borderTop: `4px solid ${colors.primary}`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p style={{ color: colors.primary, fontSize: '1.1rem' }}>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>
                        <FiAward style={styles.titleIcon} />
                        Mi Perfil
                    </h1>
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
                    { icon: <FiDollarSign />, value: `$${stats.totalSpent.toFixed(2)}`, label: 'Total gastado' },
                    { icon: <FiPackage />, value: stats.totalPurchases, label: 'Compras realizadas' },
                    { icon: <FiDownload />, value: stats.totalDownloads, label: 'Descargas' },
                    { icon: <FiCalendar />, value: stats.memberSince ? stats.memberSince.split(' ')[2] : '...', label: 'Miembro desde' }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        style={styles.statCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
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
                            <FiCheckCircle size={14} />
                        </div>
                    </div>

                    <div style={styles.userInfo}>
                        <div style={styles.userName}>{user?.name || 'Usuario'}</div>
                        <div style={styles.userEmail}>
                            <FiMail /> {user?.email || 'cargando...'}
                        </div>
                        {user?.company && (
                            <div style={{ ...styles.userEmail, marginBottom: '1rem' }}>
                                <FiBriefcase /> {user?.company}
                            </div>
                        )}
                        <div style={styles.memberSince}>
                            <FiCalendar /> Miembro desde {stats.memberSince || '...'}
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
                                transition={{ duration: 0.2 }}
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
                                        <motion.div 
                                            style={styles.infoItem}
                                            whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}
                                        >
                                            <div style={styles.infoLabel}>
                                                <FiUser /> Nombre completo
                                            </div>
                                            <div style={styles.infoValue}>{user?.name || 'No disponible'}</div>
                                        </motion.div>
                                        <motion.div 
                                            style={styles.infoItem}
                                            whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}
                                        >
                                            <div style={styles.infoLabel}>
                                                <FiMail /> Correo electrónico
                                            </div>
                                            <div style={styles.infoValue}>{user?.email || 'No disponible'}</div>
                                        </motion.div>
                                        {user?.company && (
                                            <motion.div 
                                                style={styles.infoItem}
                                                whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}
                                            >
                                                <div style={styles.infoLabel}>
                                                    <FiBriefcase /> Empresa
                                                </div>
                                                <div style={styles.infoValue}>{user?.company}</div>
                                            </motion.div>
                                        )}
                                        <motion.div 
                                            style={styles.infoItem}
                                            whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.03)' }}
                                        >
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
                                        </motion.div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={styles.infoGrid}>
                                            <div style={styles.infoItem}>
                                                <label style={styles.infoLabel}>Nombre completo</label>
                                                <input
                                                    type="text"
                                                    style={styles.input}
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="Tu nombre"
                                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                                                    onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
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
                                transition={{ duration: 0.2 }}
                            >
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>
                                        <FiShoppingBag /> Historial de compras
                                    </h2>
                                </div>

                                {purchases.length === 0 ? (
                                    <motion.div 
                                        style={styles.emptyState}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <FiPackage style={styles.emptyIcon} />
                                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: colors.dark }}>
                                            No hay compras aún
                                        </h3>
                                        <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
                                            Explora nuestro catálogo y encuentra el modelo perfecto para tu proyecto
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div style={styles.purchaseGrid}>
                                        {purchases.map((purchase, index) => (
                                            <motion.div
                                                key={purchase.id || index}
                                                style={styles.purchaseCard}
                                                whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                                onClick={() => navigate(`/purchases/${purchase.id}`)}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
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
                                                    <motion.button 
                                                        style={styles.viewBtn}
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <FiEye /> Ver detalles
                                                    </motion.button>
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
                                transition={{ duration: 0.2 }}
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
                                transition={{ duration: 0.2 }}
                            >
                                <div style={styles.sectionHeader}>
                                    <h2 style={styles.sectionTitle}>
                                        <FiFileText /> Mis Licencias
                                    </h2>
                                </div>

                                {!userLicenses || userLicenses.length === 0 ? (
                                    <motion.div 
                                        style={styles.emptyState}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <FiFileText style={styles.emptyIcon} />
                                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: colors.dark }}>
                                            No tienes licencias aún
                                        </h3>
                                        <p style={{ color: '#94a3b8' }}>
                                            Realiza tu primera compra para obtener licencias de modelos
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div style={styles.licensesGrid}>
                                        {userLicenses.map((license, index) => (
                                            <motion.div
                                                key={license.id}
                                                style={styles.licenseCard}
                                                whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
                                                onClick={() => navigate(`/models/${license.model?.id}`)}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
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
                                                                <><FiCheckCircle /> Activa</>
                                                            ) : (
                                                                <><FiXCircle /> Expirada</>
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

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Profile;