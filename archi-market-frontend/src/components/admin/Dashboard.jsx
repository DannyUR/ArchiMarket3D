import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome,
    FiPackage,
    FiUsers,
    FiGrid,
    FiBarChart2,
    FiLogOut,
    FiShoppingBag,
    FiDollarSign,
    FiDownload,
    FiTrendingUp,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiBell,
    FiMenu,
    FiX,
    FiSettings,
    FiCreditCard,
    FiStar
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import ModelsManagement from './ModelsManagement';
import UsersManagement from './UsersManagement';
import CategoriesManagement from './CategoriesManagement';
import SalesManagement from './SalesManagement';
import Reports from './Reports';
import Analytics from './Analytics';
import Settings from './Settings';
import Notifications from './Notifications';
import PaymentsManagement from './PaymentsManagement';
import ReviewsManagement from './ReviewsManagement';
import { useNotification } from '../../context/NotificationContext';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalModels: 0,
        totalSales: 0,
        totalPurchases: 0,
        recentUsers: [],
        recentModels: [],
        trends: {
            users: 0,
            models: 0,
            sales: 0,
            purchases: 0
        },
        salesByDay: [],
        topModels: []
    });
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([
        { id: 1, text: 'Nuevo usuario registrado', time: 'hace 5 min', read: false },
        { id: 2, text: 'Compra realizada: Modelo #1234', time: 'hace 15 min', read: false },
        { id: 3, text: 'Modelo destacado: Casa Moderna', time: 'hace 1 hora', read: true }
    ]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        // Cargar datos iniciales
        fetchDashboardStats();

        // 🔄 ACTUALIZAR CADA 30 SEGUNDOS
        const interval = setInterval(() => {
            fetchDashboardStats();
            console.log('🔄 Dashboard actualizado');
        }, 30000); // 30 segundos

        return () => {
            window.removeEventListener('resize', checkMobile);
            clearInterval(interval); // Limpiar intervalo al desmontar
        };
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await API.get('/admin/dashboard/stats');
            console.log('📊 Datos del dashboard:', response.data);
            const data = response.data.data || {};

            setStats({
                totalUsers: data.totalUsers || 0,
                totalModels: data.totalModels || 0,
                totalSales: data.totalSales || 0,
                totalPurchases: data.totalPurchases || 0,
                recentUsers: data.recentUsers || [],
                recentModels: data.recentModels || [],
                trends: data.trends || {
                    users: 0,
                    models: 0,
                    sales: 0,
                    purchases: 0
                },
                salesByDay: data.salesByDay || [],
                topModels: data.topModels || []
            });

        } catch (error) {
            console.error('❌ Error cargando estadísticas:', error);
            showError('Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        showSuccess('Sesión cerrada correctamente');
    };

    const getInitials = (name) => {
        if (!name) return 'A';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f8fafc',
            position: 'relative'
        },
        // Sidebar - FIJO en laptop
        sidebar: {
            width: '280px',
            backgroundColor: '#1a1f2e',
            color: '#fff',
            position: isMobile ? 'fixed' : 'sticky',
            top: 0,
            left: 0,
            height: '100vh',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
            transform: isMobile && !mobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
            transition: 'transform 0.3s ease'
        },
        // Overlay para móvil
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            display: isMobile && mobileMenuOpen ? 'block' : 'none'
        },
        sidebarHeader: {
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        },
        logoIcon: {
            fontSize: '2rem',
            color: colors.primary
        },
        logoText: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: '#fff'
        },
        profileSection: {
            padding: '1.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        profileAvatar: {
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
        },
        profileInfo: {
            flex: 1
        },
        profileName: {
            fontWeight: '600',
            marginBottom: '0.25rem'
        },
        profileRole: {
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        roleBadge: {
            backgroundColor: colors.primary,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.7rem'
        },
        navSection: {
            padding: '1rem 0'
        },
        navTitle: {
            padding: '0.5rem 1.5rem',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            color: 'rgba(255,255,255,0.7)',
            ':hover': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#fff'
            }
        },
        navItemActive: {
            backgroundColor: 'rgba(37, 99, 235, 0.2)',
            color: colors.primary,
            borderLeft: `3px solid ${colors.primary}`
        },
        navIcon: {
            fontSize: '1.2rem',
            minWidth: '24px'
        },
        // Main content
        mainContent: {
            flex: 1,
            padding: isMobile ? '1rem' : '2rem',
            width: isMobile ? '100%' : 'calc(100% - 280px)'
        },
        // Top bar móvil
        mobileTopBar: {
            display: isMobile ? 'flex' : 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            backgroundColor: '#fff',
            padding: '1rem',
            borderRadius: '10px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        },
        mobileMenuBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: colors.dark
        },
        // Top bar desktop
        topBar: {
            display: isMobile ? 'none' : 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            backgroundColor: '#fff',
            padding: '1rem 2rem',
            borderRadius: '15px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        },
        pageTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.dark
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            width: '300px'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            width: '100%'
        },
        notificationIcon: {
            position: 'relative',
            cursor: 'pointer'
        },
        // Stats cards
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: '#fff',
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`,
        },
        statIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            fontSize: '1.5rem'
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
        statTrend: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            color: colors.success,
            marginTop: '0.5rem'
        },
        // Charts
        chartsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: '1rem',
            marginBottom: '2rem'
        },
        chartCard: {
            backgroundColor: '#fff',
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`,
        },
        chartHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        chartTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.dark
        },
        chartPeriod: {
            padding: '0.25rem 0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#64748b'
        },
        chartPlaceholder: {
            height: '250px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            color: '#64748b',
            fontSize: '0.95rem'
        },
        // Tables
        tablesGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1rem'
        },
        tableCard: {
            backgroundColor: '#fff',
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`,
            overflowX: 'auto'
        },
        tableHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        tableTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.dark
        },
        viewAllBtn: {
            color: colors.primary,
            cursor: 'pointer',
            fontSize: '0.9rem'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: isMobile ? '500px' : 'auto'
        },
        th: {
            textAlign: 'left',
            padding: '0.75rem',
            borderBottom: '2px solid #e2e8f0',
            color: '#64748b',
            fontSize: '0.8rem',
            fontWeight: '600'
        },
        td: {
            padding: '0.75rem',
            borderBottom: '1px solid #e2e8f0',
            color: colors.dark
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '500'
        },
        actionBtn: {
            padding: '0.25rem 0.5rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            marginRight: '0.5rem'
        },
        loadingState: {
            textAlign: 'center',
            padding: '4rem',
            color: colors.primary
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.mainContent}>
                    <div style={styles.loadingState}>
                        <div>Cargando dashboard...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Overlay para móvil */}
            {isMobile && mobileMenuOpen && (
                <div style={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
            )}

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <HiOutlineCube style={styles.logoIcon} />
                    <span style={styles.logoText}>ArchiMarket3D</span>
                </div>

                <div style={styles.profileSection}>
                    <div style={styles.profileAvatar}>
                        {getInitials(user?.name)}
                    </div>
                    <div style={styles.profileInfo}>
                        <div style={styles.profileName}>{user?.name || 'Admin'}</div>
                        <div style={styles.profileRole}>
                            <span>Administrador</span>
                            <span style={styles.roleBadge}>Admin</span>
                        </div>
                    </div>
                </div>

                <div style={styles.navSection}>
                    <div style={styles.navTitle}>PRINCIPAL</div>
                    {[
                        { id: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
                        { id: 'models', icon: <FiPackage />, label: 'Modelos' },
                        { id: 'users', icon: <FiUsers />, label: 'Usuarios' },
                        { id: 'categories', icon: <FiGrid />, label: 'Categorías' },
                        { id: 'sales', icon: <FiShoppingBag />, label: 'Ventas' },
                        { id: 'payments', icon: <FiCreditCard />, label: 'Pagos' },
                        { id: 'reviews', icon: <FiStar />, label: 'Reseñas' }
                    ].map(item => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.navItem,
                                ...(activeTab === item.id ? styles.navItemActive : {})
                            }}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (isMobile) setMobileMenuOpen(false);
                            }}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.navSection}>
                    <div style={styles.navTitle}>REPORTES</div>
                    {[
                        { id: 'reports', icon: <FiBarChart2 />, label: 'Estadísticas' },
                        { id: 'analytics', icon: <FiTrendingUp />, label: 'Analíticas' }
                    ].map(item => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.navItem,
                                ...(activeTab === item.id ? styles.navItemActive : {})
                            }}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (isMobile) setMobileMenuOpen(false);
                            }}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={styles.navSection}>
                    <div style={styles.navTitle}>SISTEMA</div>
                    {[
                        { id: 'notifications', icon: <FiBell />, label: 'Notificaciones', badge: unreadCount },
                        { id: 'settings', icon: <FiSettings />, label: 'Configuración' }
                    ].map(item => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.navItem,
                                ...(activeTab === item.id ? styles.navItemActive : {})
                            }}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (isMobile) setMobileMenuOpen(false);
                            }}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge > 0 && (
                                <span style={styles.navBadge}>{item.badge}</span>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '1rem 0' }}>
                    <div
                        style={{ ...styles.navItem, color: '#ff6b6b' }}
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        <span>Cerrar sesión</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Top bar móvil */}
                <div style={styles.mobileTopBar}>
                    <button
                        style={styles.mobileMenuBtn}
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <FiMenu />
                    </button>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: '600', color: colors.dark }}>
                        {activeTab === 'dashboard' && 'Dashboard'}
                        {activeTab === 'models' && 'Gestión de Modelos'}
                        {activeTab === 'users' && 'Gestión de Usuarios'}
                        {activeTab === 'categories' && 'Gestión de Categorías'}
                        {activeTab === 'sales' && 'Gestión de Ventas'}
                        {activeTab === 'reports' && 'Gestión de Estadísticas'}
                        {activeTab === 'analytics' && 'Gestión de Analíticas'}
                        {activeTab === 'payments' && 'Gestión de Pagos'}
                        {activeTab === 'reviews' && 'Gestión de Reseñas'}
                        {activeTab === 'notifications' && 'Notificaciones'}
                        {activeTab === 'settings' && 'Configuración'}
                    </h1>
                    <div style={styles.notificationIcon}>
                        <FiBell size={20} color="#64748b" />
                    </div>
                </div>

                {/* Top bar desktop */}
                <div style={styles.topBar}>
                    <h1 style={styles.pageTitle}>
                        {activeTab === 'dashboard' && 'Dashboard'}
                        {activeTab === 'models' && 'Gestión de Modelos'}
                        {activeTab === 'users' && 'Gestión de Usuarios'}
                        {activeTab === 'categories' && 'Gestión de Categorías'}
                        {activeTab === 'sales' && 'Gestión de Ventas'}
                        {activeTab === 'reports' && 'Gestión de Estadísticas'}
                        {activeTab === 'analytics' && 'Gestión de Analíticas'}
                        {activeTab === 'payments' && 'Gestión de Pagos'}
                        {activeTab === 'reviews' && 'Gestión de Reseñas'}
                        {activeTab === 'notifications' && 'Notificaciones'}
                        {activeTab === 'settings' && 'Configuración'}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={styles.searchBox}>
                            <FiSearch color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                style={styles.searchInput}
                            />
                        </div>
                        <div style={styles.notificationIcon}>
                            <FiBell size={20} color="#64748b" />
                        </div>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <>
                        {/* Stats Cards */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.primary + '10', color: colors.primary }}>
                                    <FiUsers />
                                </div>
                                <div style={styles.statValue}>{stats.totalUsers || 0}</div>
                                <div style={styles.statLabel}>Usuarios totales</div>
                                <div style={styles.statTrend}>
                                    <FiTrendingUp /> {stats.trends?.users || 0}% este mes
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.success + '10', color: colors.success }}>
                                    <FiPackage />
                                </div>
                                <div style={styles.statValue}>{stats.totalModels || 0}</div>
                                <div style={styles.statLabel}>Modelos 3D</div>
                                <div style={styles.statTrend}>
                                    <FiTrendingUp /> {stats.trends?.models || 0}% este mes
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.warning + '10', color: colors.warning }}>
                                    <FiDollarSign />
                                </div>
                                <div style={styles.statValue}>${stats.totalSales || 0}</div>
                                <div style={styles.statLabel}>Ventas totales</div>
                                <div style={styles.statTrend}>
                                    <FiTrendingUp /> {stats.trends?.sales || 0}% este mes
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.secondary + '10', color: colors.secondary }}>
                                    <FiShoppingBag />
                                </div>
                                <div style={styles.statValue}>{stats.totalPurchases || 0}</div>
                                <div style={styles.statLabel}>Compras realizadas</div>
                                <div style={styles.statTrend}>
                                    <FiTrendingUp /> {stats.trends?.purchases || 0}% este mes
                                </div>
                            </div>
                        </div>

                        {/* Charts con datos reales */}
                        <div style={styles.chartsGrid}>
                            {/* Gráfica de Ventas Mensuales */}
                            <div style={styles.chartCard}>
                                <div style={styles.chartHeader}>
                                    <h3 style={styles.chartTitle}>Ventas mensuales</h3>
                                    <span style={styles.chartPeriod}>Últimos 7 días</span>
                                </div>
                                <div style={{ height: '250px', width: '100%' }}>
                                    {stats.salesByDay && stats.salesByDay.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={stats.salesByDay}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="total"
                                                    stroke={colors.primary}
                                                    name="Ventas ($)"
                                                    strokeWidth={2}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="transactions"
                                                    stroke={colors.success}
                                                    name="Transacciones"
                                                    strokeWidth={2}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={styles.chartPlaceholder}>
                                            No hay datos de ventas disponibles
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gráfica de Modelos Populares */}
                            <div style={styles.chartCard}>
                                <div style={styles.chartHeader}>
                                    <h3 style={styles.chartTitle}>Modelos populares</h3>
                                    <span style={styles.chartPeriod}>Top 5</span>
                                </div>
                                <div style={{ height: '250px', width: '100%' }}>
                                    {stats.topModels && stats.topModels.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.topModels}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar
                                                    dataKey="sales_count"
                                                    fill={colors.primary}
                                                    name="Ventas"
                                                />
                                                <Bar
                                                    dataKey="revenue"
                                                    fill={colors.success}
                                                    name="Ingresos ($)"
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div style={styles.chartPlaceholder}>
                                            No hay datos de modelos populares
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tables */}
                        <div style={styles.tablesGrid}>
                            <div style={styles.tableCard}>
                                <div style={styles.tableHeader}>
                                    <h3 style={styles.tableTitle}>Usuarios recientes</h3>
                                    <span style={styles.viewAllBtn} onClick={() => setActiveTab('users')}>
                                        Ver todos →
                                    </span>
                                </div>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Usuario</th>
                                            <th style={styles.th}>Fecha</th>
                                            <th style={styles.th}>Tipo</th>
                                            <th style={styles.th}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentUsers?.map(user => (
                                            <tr key={user.id}>
                                                <td style={styles.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: colors.primary + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.statusBadge, backgroundColor: colors.primary + '10', color: colors.primary }}>
                                                        {user.user_type}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <button style={styles.actionBtn}><FiEdit /></button>
                                                    <button style={styles.actionBtn}><FiTrash2 /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={styles.tableCard}>
                                <div style={styles.tableHeader}>
                                    <h3 style={styles.tableTitle}>Modelos recientes</h3>
                                    <span style={styles.viewAllBtn} onClick={() => setActiveTab('models')}>
                                        Ver todos →
                                    </span>
                                </div>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Modelo</th>
                                            <th style={styles.th}>Precio</th>
                                            <th style={styles.th}>Formato</th>
                                            <th style={styles.th}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentModels?.map(model => (
                                            <tr key={model.id}>
                                                <td style={styles.td}>{model.name}</td>
                                                <td style={styles.td}>${model.price}</td>
                                                <td style={styles.td}>{model.format}</td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        backgroundColor: model.featured ? colors.success + '10' : '#f1f5f9',
                                                        color: model.featured ? colors.success : '#64748b'
                                                    }}>
                                                        {model.featured ? 'Destacado' : 'Normal'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'models' && (
                    <ModelsManagement />
                )}

                {activeTab === 'users' && (
                    <UsersManagement />
                )}

                {activeTab === 'categories' && (
                    <CategoriesManagement />
                )}

                {activeTab === 'sales' && (
                    <SalesManagement />
                )}

                {activeTab === 'payments' && (
                    <PaymentsManagement />
                )}

                {activeTab === 'reviews' && (
                    <ReviewsManagement />
                )}

                {activeTab === 'reports' && (
                    <Reports />
                )}

                {activeTab === 'analytics' && (
                    <Analytics />
                )}

                {activeTab === 'notifications' && (
                    <Notifications />
                )}

                {activeTab === 'settings' && (
                    <Settings />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;