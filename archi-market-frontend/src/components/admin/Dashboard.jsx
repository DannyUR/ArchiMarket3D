import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiHome,
    FiPackage,
    FiUsers,
    FiGrid,
    FiBarChart2,
    FiSettings,
    FiLogOut,
    FiShoppingBag,
    FiDollarSign,
    FiDownload,
    FiTrendingUp,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiSearch
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalModels: 0,
        totalSales: 0,
        totalPurchases: 0,
        recentUsers: [],
        recentModels: [],
        recentSales: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await API.get('/admin/dashboard/stats');
            console.log('Dashboard stats:', response.data);
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
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

    const styles = {
        container: {
            display: 'flex',
            minHeight: '100vh',
            backgroundColor: '#f8fafc'
        },
        // Sidebar
        sidebar: {
            width: '280px',
            backgroundColor: colors.white,
            borderRight: '1px solid #e2e8f0',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '2rem',
            padding: '0 1rem'
        },
        navSection: {
            marginBottom: '2rem'
        },
        navTitle: {
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#94a3b8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1rem',
            padding: '0 1rem'
        },
        navItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            marginBottom: '0.25rem',
            color: '#64748b'
        },
        navItemActive: {
            backgroundColor: colors.primary + '10',
            color: colors.primary
        },
        navItemHover: {
            backgroundColor: '#f1f5f9'
        },
        navIcon: {
            fontSize: '1.2rem'
        },
        navText: {
            fontSize: '0.95rem',
            fontWeight: '500'
        },
        // Main content
        mainContent: {
            flex: 1,
            marginLeft: '280px',
            padding: '2rem'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        headerTitle: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.dark
        },
        headerActions: {
            display: 'flex',
            gap: '1rem'
        },
        logoutBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: colors.white,
            color: colors.danger,
            border: `1px solid ${colors.danger}20`,
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        // Stats cards
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
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        statChange: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginTop: '0.5rem',
            fontSize: '0.8rem'
        },
        // Charts section
        chartsSection: {
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        chartCard: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        chartHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        chartTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark
        },
        chartPeriod: {
            padding: '0.25rem 0.75rem',
            backgroundColor: '#f1f5f9',
            borderRadius: '20px',
            fontSize: '0.8rem',
            color: '#64748b'
        },
        // Tables
        tableCard: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        tableHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        tableTitle: {
            fontSize: '1.1rem',
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
            borderCollapse: 'collapse'
        },
        th: {
            textAlign: 'left',
            padding: '0.75rem',
            borderBottom: '2px solid #e2e8f0',
            color: '#64748b',
            fontSize: '0.85rem',
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
            fontSize: '0.8rem',
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
        // Loading
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
                        Cargando dashboard...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.logo}>
                    <HiOutlineCube size={32} />
                    <span>ArchiMarket3D</span>
                </div>

                <div style={styles.navSection}>
                    <div style={styles.navTitle}>PRINCIPAL</div>
                    {[
                        { id: 'dashboard', icon: <FiHome />, label: 'Dashboard' },
                        { id: 'models', icon: <FiPackage />, label: 'Modelos' },
                        { id: 'users', icon: <FiUsers />, label: 'Usuarios' },
                        { id: 'categories', icon: <FiGrid />, label: 'Categorías' },
                        { id: 'sales', icon: <FiShoppingBag />, label: 'Ventas' }
                    ].map(item => (
                        <div
                            key={item.id}
                            style={{
                                ...styles.navItem,
                                ...(activeTab === item.id ? styles.navItemActive : {})
                            }}
                            onClick={() => setActiveTab(item.id)}
                            onMouseEnter={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.backgroundColor = styles.navItemHover.backgroundColor;
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            <span style={styles.navText}>{item.label}</span>
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
                            onClick={() => setActiveTab(item.id)}
                        >
                            <span style={styles.navIcon}>{item.icon}</span>
                            <span style={styles.navText}>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div
                        style={{ ...styles.navItem, color: colors.danger }}
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        <span style={styles.navText}>Cerrar sesión</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                <div style={styles.header}>
                    <h1 style={styles.headerTitle}>
                        {activeTab === 'dashboard' && 'Dashboard'}
                        {activeTab === 'models' && 'Gestión de Modelos'}
                        {activeTab === 'users' && 'Gestión de Usuarios'}
                        {activeTab === 'categories' && 'Categorías'}
                        {activeTab === 'sales' && 'Ventas'}
                        {activeTab === 'reports' && 'Reportes'}
                        {activeTab === 'analytics' && 'Analíticas'}
                    </h1>
                    <div style={styles.headerActions}>
                        <button style={styles.logoutBtn} onClick={handleLogout}>
                            <FiLogOut /> Salir
                        </button>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Stats Cards */}
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.primary + '10', color: colors.primary }}>
                                    <FiUsers />
                                </div>
                                <div style={styles.statValue}>{stats.totalUsers || 0}</div>
                                <div style={styles.statLabel}>Usuarios totales</div>
                                <div style={styles.statChange}>
                                    <FiTrendingUp color={colors.success} /> +12% este mes
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.success + '10', color: colors.success }}>
                                    <FiPackage />
                                </div>
                                <div style={styles.statValue}>{stats.totalModels || 0}</div>
                                <div style={styles.statLabel}>Modelos 3D</div>
                                <div style={styles.statChange}>
                                    <FiTrendingUp color={colors.success} /> +5% este mes
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.warning + '10', color: colors.warning }}>
                                    <FiDollarSign />
                                </div>
                                <div style={styles.statValue}>${stats.totalSales || 0}</div>
                                <div style={styles.statLabel}>Ventas totales</div>
                                <div style={styles.statChange}>
                                    <FiTrendingUp color={colors.success} /> +18% este mes
                                </div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={{ ...styles.statIcon, backgroundColor: colors.secondary + '10', color: colors.secondary }}>
                                    <FiShoppingBag />
                                </div>
                                <div style={styles.statValue}>{stats.totalPurchases || 0}</div>
                                <div style={styles.statLabel}>Compras realizadas</div>
                                <div style={styles.statChange}>
                                    <FiTrendingUp color={colors.success} /> +8% este mes
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div style={styles.chartsSection}>
                            <div style={styles.chartCard}>
                                <div style={styles.chartHeader}>
                                    <h3 style={styles.chartTitle}>Ventas mensuales</h3>
                                    <span style={styles.chartPeriod}>Últimos 6 meses</span>
                                </div>
                                <div style={{ height: '200px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                    Gráfico de ventas (próximamente)
                                </div>
                            </div>
                            <div style={styles.chartCard}>
                                <div style={styles.chartHeader}>
                                    <h3 style={styles.chartTitle}>Modelos populares</h3>
                                    <span style={styles.chartPeriod}>Top 5</span>
                                </div>
                                <div style={{ height: '200px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                                    Gráfico de modelos (próximamente)
                                </div>
                            </div>
                        </div>

                        {/* Recent Tables */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentUsers?.map(user => (
                                            <tr key={user.id}>
                                                <td style={styles.td}>{user.name}</td>
                                                <td style={styles.td}>{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.statusBadge, backgroundColor: colors.primary + '10', color: colors.primary }}>
                                                        {user.user_type}
                                                    </span>
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
                                            <th style={styles.th}>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentModels?.map(model => (
                                            <tr key={model.id}>
                                                <td style={styles.td}>{model.name}</td>
                                                <td style={styles.td}>${model.price}</td>
                                                <td style={styles.td}>
                                                    <span style={{ ...styles.statusBadge, backgroundColor: model.featured ? colors.success + '10' : '#f1f5f9', color: model.featured ? colors.success : '#64748b' }}>
                                                        {model.featured ? 'Destacado' : 'Normal'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'models' && (
                    <div>Gestión de Modelos (próximamente)</div>
                )}

                {activeTab === 'users' && (
                    <div>Gestión de Usuarios (próximamente)</div>
                )}

                {activeTab === 'categories' && (
                    <div>Gestión de Categorías (próximamente)</div>
                )}

                {activeTab === 'sales' && (
                    <div>Ventas (próximamente)</div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;