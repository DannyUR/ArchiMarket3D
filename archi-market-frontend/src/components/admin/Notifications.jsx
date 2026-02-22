import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiBell,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiInfo,
    FiShoppingBag,
    FiUsers,
    FiPackage,
    FiDollarSign,
    FiClock,
    FiCheck,
    FiTrash2,
    FiFilter,
    FiRefreshCw,
    FiSettings,
    FiMail,
    FiStar,
    FiCreditCard
} from 'react-icons/fi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const Notifications = () => {
    const { showSuccess, showError } = useNotification();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [typeFilter, setTypeFilter] = useState('all');
    const [isMobile, setIsMobile] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        read: 0
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchNotifications();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await API.get('/admin/notifications');
            console.log('📦 Respuesta completa:', response.data);

            // Extraer notificaciones de la estructura correcta
            let notificationsData = [];

            if (response.data?.data?.data) {
                // Estructura con paginación de Laravel
                notificationsData = response.data.data.data;
            } else if (Array.isArray(response.data?.data)) {
                // Estructura simple
                notificationsData = response.data.data;
            } else if (Array.isArray(response.data)) {
                // Estructura directa
                notificationsData = response.data;
            }

            // Asegurar que siempre sea array
            if (!Array.isArray(notificationsData)) {
                notificationsData = [];
            }

            console.log('📊 Notificaciones extraídas:', notificationsData);

            setNotifications(notificationsData);

            // Calcular estadísticas
            const unread = notificationsData.filter(n => !n.read_at).length;
            setStats({
                total: notificationsData.length,
                unread: unread,
                read: notificationsData.length - unread
            });

        } catch (error) {
            console.error('❌ Error cargando notificaciones:', error);
            showError('Error al cargar las notificaciones');
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await API.post(`/admin/notifications/${id}/read`);

            setNotifications(prev =>
                prev.map(notif =>
                    notif.id === id ? { ...notif, read_at: new Date().toISOString() } : notif
                )
            );

            setStats(prev => ({
                ...prev,
                unread: prev.unread - 1,
                read: prev.read + 1
            }));

            showSuccess('✅ Notificación marcada como leída');
        } catch (error) {
            console.error('Error marcando notificación:', error);
            showError('❌ Error al marcar notificación');
        }
    };

    const markAllAsRead = async () => {
        try {
            await API.post('/admin/notifications/read-all');

            setNotifications(prev =>
                prev.map(notif => ({ ...notif, read_at: new Date().toISOString() }))
            );

            setStats(prev => ({
                ...prev,
                unread: 0,
                read: prev.total
            }));

            showSuccess('✅ Todas las notificaciones marcadas como leídas');
        } catch (error) {
            console.error('Error marcando todas:', error);
            showError('❌ Error al marcar notificaciones');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await API.delete(`/admin/notifications/${id}`);

            // Actualizar estado
            const wasUnread = notifications.find(n => n.id === id)?.read_at === null;

            setNotifications(prev => prev.filter(notif => notif.id !== id));

            setStats(prev => ({
                total: prev.total - 1,
                unread: wasUnread ? prev.unread - 1 : prev.unread,
                read: wasUnread ? prev.read : prev.read - 1
            }));

            showSuccess('🗑️ Notificación eliminada');
        } catch (error) {
            console.error('Error eliminando notificación:', error);
            showError('❌ Error al eliminar');
        }
    };

    const deleteAllRead = async () => {
        try {
            // Filtrar las que no tienen read_at
            const readNotifications = notifications.filter(n => n.read_at);

            // Eliminar una por una (o podrías crear un endpoint batch)
            for (const notif of readNotifications) {
                await API.delete(`/admin/notifications/${notif.id}`);
            }

            setNotifications(prev => prev.filter(n => !n.read_at));

            setStats(prev => ({
                total: prev.unread,
                unread: prev.unread,
                read: 0
            }));

            showSuccess('🗑️ Notificaciones leídas eliminadas');
        } catch (error) {
            console.error('Error eliminando leídas:', error);
            showError('❌ Error al eliminar');
        }
    };

    const getTimeAgo = (dateString) => {
        if (!dateString) return 'Recién llegada';

        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Ahora mismo';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        return `Hace ${diffDays} días`;
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'user': return <FiUsers />;
            case 'sale': return <FiShoppingBag />;
            case 'review': return <FiStar />;
            case 'payment': return <FiCreditCard />;
            case 'alert': return <FiAlertCircle />;
            case 'system': return <FiSettings />;
            default: return <FiBell />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'user': return colors.primary;
            case 'sale': return colors.success;
            case 'review': return colors.warning;
            case 'payment': return '#8b5cf6';
            case 'alert': return colors.danger;
            case 'system': return colors.secondary;
            default: return '#64748b';
        }
    };

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'unread' && notif.read_at) return false;
        if (filter === 'read' && !notif.read_at) return false;
        if (typeFilter !== 'all' && notif.type !== typeFilter) return false;
        return true;
    });

    const styles = {
        container: {
            padding: isMobile ? '1rem' : '1.5rem',
            width: '100%'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        title: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        titleBadge: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '500',
            marginLeft: '1rem'
        },
        actions: {
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
        },
        actionButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: colors.dark,
            transition: 'all 0.2s'
        },
        dangerButton: {
            color: colors.danger,
            borderColor: colors.danger + '20'
        },
        // Filtros
        filtersBar: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem',
            marginBottom: '2rem'
        },
        filterGroup: {
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap',
            flex: 1
        },
        filterButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: '#64748b',
            transition: 'all 0.2s'
        },
        filterButtonActive: {
            backgroundColor: colors.primary,
            color: 'white',
            borderColor: colors.primary
        },
        typeFilter: {
            padding: '0.5rem 2rem 0.5rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.9rem',
            color: colors.dark,
            minWidth: '150px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '16px'
        },
        // Stats cards
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        statValue: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        // Lista de notificaciones
        notificationsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
        },
        notificationItem: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            opacity: notif => notif.read_at ? 0.7 : 1
        },
        notificationIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            flexShrink: 0
        },
        notificationContent: {
            flex: 1,
            minWidth: 0
        },
        notificationHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.25rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
        },
        notificationTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.dark
        },
        notificationTime: {
            fontSize: '0.8rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
        },
        notificationMessage: {
            fontSize: '0.9rem',
            color: '#64748b',
            marginBottom: '0.5rem'
        },
        notificationFooter: {
            display: 'flex',
            gap: '1rem'
        },
        notificationType: {
            fontSize: '0.75rem',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            color: '#64748b'
        },
        notificationActions: {
            display: 'flex',
            gap: '0.5rem',
            marginLeft: 'auto'
        },
        iconButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            padding: '0.25rem',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
        },
        unreadDot: {
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: colors.primary,
            marginRight: '0.5rem'
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem',
            color: '#64748b',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={{ marginBottom: '1rem' }}>Cargando notificaciones...</div>
                    <div style={{ width: '50px', height: '50px', border: `3px solid ${colors.primary}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h2 style={styles.title}>
                        <FiBell /> Notificaciones
                    </h2>
                    {stats.unread > 0 && (
                        <span style={styles.titleBadge}>
                            {stats.unread} nuevas
                        </span>
                    )}
                </div>

                <div style={styles.actions}>
                    <button
                        style={styles.actionButton}
                        onClick={markAllAsRead}
                        disabled={stats.unread === 0}
                    >
                        <FiCheck /> Marcar todas como leídas
                    </button>
                    <button
                        style={{ ...styles.actionButton, ...styles.dangerButton }}
                        onClick={deleteAllRead}
                        disabled={stats.read === 0}
                    >
                        <FiTrash2 /> Eliminar leídas
                    </button>
                    <button
                        style={styles.actionButton}
                        onClick={fetchNotifications}
                    >
                        <FiRefreshCw /> Actualizar
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.total}</div>
                    <div style={styles.statLabel}>Total</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.unread}</div>
                    <div style={styles.statLabel}>No leídas</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.read}</div>
                    <div style={styles.statLabel}>Leídas</div>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filtersBar}>
                <div style={styles.filterGroup}>
                    <button
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'all' ? styles.filterButtonActive : {})
                        }}
                        onClick={() => setFilter('all')}
                    >
                        Todas
                    </button>
                    <button
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'unread' ? styles.filterButtonActive : {})
                        }}
                        onClick={() => setFilter('unread')}
                    >
                        No leídas
                    </button>
                    <button
                        style={{
                            ...styles.filterButton,
                            ...(filter === 'read' ? styles.filterButtonActive : {})
                        }}
                        onClick={() => setFilter('read')}
                    >
                        Leídas
                    </button>
                </div>

                <select
                    style={styles.typeFilter}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="all">Todos los tipos</option>
                    <option value="user">Usuarios</option>
                    <option value="sale">Ventas</option>
                    <option value="review">Reseñas</option>
                    <option value="payment">Pagos</option>
                    <option value="alert">Alertas</option>
                    <option value="system">Sistema</option>
                </select>
            </div>

            {/* Lista de notificaciones */}
            {filteredNotifications.length === 0 ? (
                <div style={styles.emptyState}>
                    <FiBell size={48} color={colors.primary + '40'} />
                    <h3 style={{ margin: '1rem 0', fontSize: '1.2rem', color: colors.dark }}>
                        No hay notificaciones
                    </h3>
                    <p style={{ color: '#94a3b8' }}>
                        {filter !== 'all' ? 'Prueba con otros filtros' : 'Las nuevas notificaciones aparecerán aquí'}
                    </p>
                </div>
            ) : (
                <div style={styles.notificationsList}>
                    <AnimatePresence>
                        {filteredNotifications.map((notif) => (
                            <motion.div
                                key={notif.id}
                                style={{
                                    ...styles.notificationItem,
                                    opacity: notif.read_at ? 0.7 : 1
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                onClick={() => !notif.read_at && markAsRead(notif.id)}
                            >
                                <div style={{
                                    ...styles.notificationIcon,
                                    backgroundColor: getTypeColor(notif.type) + '10',
                                    color: getTypeColor(notif.type)
                                }}>
                                    {getTypeIcon(notif.type)}
                                </div>

                                <div style={styles.notificationContent}>
                                    <div style={styles.notificationHeader}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {!notif.read_at && <span style={styles.unreadDot} />}
                                            <span style={styles.notificationTitle}>{notif.title}</span>
                                        </div>
                                        <span style={styles.notificationTime}>
                                            <FiClock size={12} /> {getTimeAgo(notif.created_at)}
                                        </span>
                                    </div>

                                    <div style={styles.notificationMessage}>
                                        {notif.message}
                                    </div>

                                    <div style={styles.notificationFooter}>
                                        <span style={styles.notificationType}>
                                            {notif.type === 'user' && 'Usuario'}
                                            {notif.type === 'sale' && 'Venta'}
                                            {notif.type === 'review' && 'Reseña'}
                                            {notif.type === 'payment' && 'Pago'}
                                            {notif.type === 'alert' && 'Alerta'}
                                            {notif.type === 'system' && 'Sistema'}
                                        </span>
                                    </div>
                                </div>

                                <div style={styles.notificationActions}>
                                    {!notif.read_at && (
                                        <button
                                            style={styles.iconButton}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(notif.id);
                                            }}
                                            title="Marcar como leída"
                                        >
                                            <FiCheck />
                                        </button>
                                    )}
                                    <button
                                        style={styles.iconButton}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteNotification(notif.id);
                                        }}
                                        title="Eliminar"
                                    >
                                        <FiTrash2 color={colors.danger} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

// Añadir keyframes para animación
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

export default Notifications;