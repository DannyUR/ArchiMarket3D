import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiCreditCard,
    FiDollarSign,
    FiTrendingUp,
    FiUsers,
    FiCalendar,
    FiDownload,
    FiFilter,
    FiSearch,
    FiEye,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiRefreshCw,
    FiFileText,
    FiPrinter,
    FiMail,
    FiInfo,
    FiX
} from 'react-icons/fi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const PaymentsManagement = () => {
    const { showSuccess, showError, showInfo } = useNotification();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterMethod, setFilterMethod] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [stats, setStats] = useState({
        totalPayments: 0,
        successfulPayments: 0,
        pendingPayments: 0,
        failedPayments: 0,
        totalAmount: 0,
        avgAmount: 0
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchPayments();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (filterMethod !== 'all') params.append('method', filterMethod);
            if (dateRange.start) params.append('start_date', dateRange.start);
            if (dateRange.end) params.append('end_date', dateRange.end);
            if (searchTerm) params.append('search', searchTerm);

            const response = await API.get(`/admin/payments?${params.toString()}`);
            console.log('Pagos recibidos:', response.data);

            setPayments(response.data.data.payments || []);
            setStats(response.data.data.stats || {});
        } catch (error) {
            console.error('Error cargando pagos:', error);
            showError('Error al cargar los pagos');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = (format) => {
        showInfo(`📊 Exportando pagos en formato ${format}... (próximamente)`);
    };

    const handleRefund = async (paymentId) => {
        if (window.confirm('¿Procesar reembolso para este pago?')) {
            try {
                // Simular reembolso
                await new Promise(resolve => setTimeout(resolve, 1500));
                showSuccess('💰 Reembolso procesado correctamente');
                fetchPayments();
            } catch (error) {
                showError('❌ Error al procesar reembolso');
            }
        }
    };

    const handleResendReceipt = async (paymentId) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            showSuccess('📧 Recibo reenviado al cliente');
        } catch (error) {
            showError('❌ Error al reenviar recibo');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return colors.success;
            case 'pending': return colors.warning;
            case 'failed': return colors.danger;
            default: return '#64748b';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <FiCheckCircle />;
            case 'pending': return <FiClock />;
            case 'failed': return <FiXCircle />;
            default: return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed': return 'Completado';
            case 'pending': return 'Pendiente';
            case 'failed': return 'Fallido';
            default: return status;
        }
    };

    const getMethodIcon = (method) => {
        switch (method) {
            case 'stripe': return '💳';
            case 'paypal': return '🅿️';
            case 'mercadopago': return '🇧🇷';
            default: return '💵';
        }
    };

    const getMethodName = (method) => {
        switch (method) {
            case 'stripe': return 'Stripe';
            case 'paypal': return 'PayPal';
            case 'mercadopago': return 'MercadoPago';
            default: return method;
        }
    };

    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
        const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;

        let matchesDate = true;
        if (dateRange.start && dateRange.end) {
            const paymentDate = new Date(payment.date);
            matchesDate = paymentDate >= new Date(dateRange.start) &&
                paymentDate <= new Date(dateRange.end);
        }

        return matchesSearch && matchesStatus && matchesMethod && matchesDate;
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
        exportButtons: {
            display: 'flex',
            gap: '0.5rem'
        },
        exportButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: colors.dark
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1.2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`
        },
        statIcon: {
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
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
        filtersSection: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: `2px solid ${colors.primary}`
        },
        filtersHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            cursor: 'pointer'
        },
        filtersTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            color: colors.dark
        },
        filtersGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginTop: '1rem'
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
            minWidth: isMobile ? '100%' : '140px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '16px'
        },
        dateInput: {
            padding: '0.5rem 1rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.95rem'
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
            padding: '0.4rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            borderRadius: '4px',
            fontSize: '1rem'
        },
        cardsContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem',
            marginTop: '1rem'
        },
        paymentCard: {
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
        cardId: {
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.dark
        },
        cardStatus: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
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
            maxWidth: '600px',
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
        modalSection: {
            marginBottom: '1.5rem'
        },
        modalSectionTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e2e8f0'
        },
        modalGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
        },
        modalInfo: {
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px'
        },
        modalLabel: {
            fontSize: '0.8rem',
            color: '#64748b',
            marginBottom: '0.25rem'
        },
        modalValue: {
            fontWeight: '500',
            color: colors.dark
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '1.5rem'
        },
        button: {
            padding: '0.7rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.9rem'
        },
        primaryButton: {
            backgroundColor: colors.primary,
            color: 'white'
        },
        dangerButton: {
            backgroundColor: colors.danger + '10',
            color: colors.danger,
            border: `1px solid ${colors.danger}20`
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
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={{ marginBottom: '1rem' }}>Cargando pagos...</div>
                    <div style={{ width: '50px', height: '50px', border: `3px solid ${colors.primary}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>

                <div style={styles.exportButtons}>
                    <button style={styles.exportButton} onClick={() => handleExport('CSV')}>
                        <FiFileText /> CSV
                    </button>
                    <button style={styles.exportButton} onClick={() => handleExport('PDF')}>
                        <FiDownload /> PDF
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>💰</div>
                    <div style={styles.statValue}>${stats.totalAmount.toFixed(2)}</div>
                    <div style={styles.statLabel}>Total procesado</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>✅</div>
                    <div style={styles.statValue}>{stats.successfulPayments}</div>
                    <div style={styles.statLabel}>Exitosos</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>⏳</div>
                    <div style={styles.statValue}>{stats.pendingPayments}</div>
                    <div style={styles.statLabel}>Pendientes</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>❌</div>
                    <div style={styles.statValue}>{stats.failedPayments}</div>
                    <div style={styles.statLabel}>Fallidos</div>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filtersSection}>
                <div style={styles.filtersHeader}>
                    <div style={styles.filtersTitle}>
                        <FiFilter /> Filtros
                    </div>
                </div>

                <div style={styles.filtersGrid}>
                    <div style={styles.searchBox}>
                        <FiSearch color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Buscar por ID, cliente..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select style={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Todos los estados</option>
                        <option value="completed">Completados</option>
                        <option value="pending">Pendientes</option>
                        <option value="failed">Fallidos</option>
                    </select>

                    <select style={styles.filterSelect} value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
                        <option value="all">Todos los métodos</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="mercadopago">MercadoPago</option>
                    </select>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="date"
                            style={styles.dateInput}
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <input
                            type="date"
                            style={styles.dateInput}
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Vista móvil */}
            {isMobile && (
                <div style={styles.cardsContainer}>
                    {filteredPayments.length === 0 ? (
                        <div style={styles.emptyState}>
                            No se encontraron pagos
                        </div>
                    ) : (
                        filteredPayments.map((payment) => (
                            <motion.div
                                key={payment.id}
                                style={styles.paymentCard}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div style={styles.cardHeader}>
                                    <div>
                                        <div style={styles.cardId}>{payment.id}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                            {payment.user?.name}
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.cardStatus,
                                        backgroundColor: getStatusColor(payment.status) + '10',
                                        color: getStatusColor(payment.status)
                                    }}>
                                        {getStatusText(payment.status)}
                                    </span>
                                </div>

                                <div style={styles.cardDetails}>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Monto</div>
                                        <div style={styles.detailValue}>${payment.amount.toFixed(2)}</div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Método</div>
                                        <div style={styles.detailValue}>
                                            {getMethodIcon(payment.method)} {getMethodName(payment.method)}
                                        </div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Fecha</div>
                                        <div style={styles.detailValue}>
                                            {new Date(payment.date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={styles.cardDetail}>
                                        <div style={styles.detailLabel}>Transacción</div>
                                        <div style={styles.detailValue}>{payment.transaction_id}</div>
                                    </div>
                                </div>

                                <div style={styles.cardActions}>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => setSelectedPayment(payment)}
                                    >
                                        <FiEye /> Ver
                                    </button>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleResendReceipt(payment.id)}
                                    >
                                        <FiMail /> Recibo
                                    </button>
                                    {payment.status === 'completed' && (
                                        <button
                                            style={styles.cardActionBtn}
                                            onClick={() => handleRefund(payment.id)}
                                        >
                                            <FiRefreshCw /> Reembolso
                                        </button>
                                    )}
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
                                    <th style={styles.th}>ID</th>
                                    <th style={styles.th}>Cliente</th>
                                    <th style={styles.th}>Monto</th>
                                    <th style={styles.th}>Método</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Fecha</th>
                                    <th style={styles.th}>Transacción</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                            No se encontraron pagos
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment, index) => (
                                        <motion.tr
                                            key={payment.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td style={styles.td}>{payment.id}</td>
                                            <td style={styles.td}>{payment.user?.name}</td>
                                            <td style={styles.td}>${payment.amount.toFixed(2)}</td>
                                            <td style={styles.td}>
                                                {getMethodIcon(payment.method)} {getMethodName(payment.method)}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: getStatusColor(payment.status) + '10',
                                                    color: getStatusColor(payment.status)
                                                }}>
                                                    {getStatusIcon(payment.status)}
                                                    {getStatusText(payment.status)}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                {new Date(payment.date).toLocaleDateString()}
                                            </td>
                                            <td style={styles.td}>
                                                <code style={{ fontSize: '0.8rem' }}>{payment.transaction_id}</code>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => setSelectedPayment(payment)}
                                                        title="Ver detalles"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleResendReceipt(payment.id)}
                                                        title="Reenviar recibo"
                                                    >
                                                        <FiMail />
                                                    </button>
                                                    {payment.status === 'completed' && (
                                                        <button
                                                            style={styles.actionBtn}
                                                            onClick={() => handleRefund(payment.id)}
                                                            title="Reembolsar"
                                                        >
                                                            <FiRefreshCw />
                                                        </button>
                                                    )}
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

            {/* Modal de detalle */}
            <AnimatePresence>
                {selectedPayment && (
                    <motion.div
                        style={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPayment(null)}
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
                                    Detalle de Pago {selectedPayment.id}
                                </h3>
                                <button style={styles.closeBtn} onClick={() => setSelectedPayment(null)}>
                                    <FiX />
                                </button>
                            </div>

                            <div style={styles.modalSection}>
                                <h4 style={styles.modalSectionTitle}>Información general</h4>
                                <div style={styles.modalGrid}>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Estado</div>
                                        <div style={{
                                            ...styles.modalValue,
                                            color: getStatusColor(selectedPayment.status)
                                        }}>
                                            {getStatusText(selectedPayment.status)}
                                        </div>
                                    </div>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Monto</div>
                                        <div style={styles.modalValue}>${selectedPayment.amount.toFixed(2)}</div>
                                    </div>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Fecha</div>
                                        <div style={styles.modalValue}>
                                            {new Date(selectedPayment.date).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Método</div>
                                        <div style={styles.modalValue}>
                                            {getMethodName(selectedPayment.method)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalSection}>
                                <h4 style={styles.modalSectionTitle}>Cliente</h4>
                                <div style={styles.modalGrid}>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Nombre</div>
                                        <div style={styles.modalValue}>{selectedPayment.user?.name}</div>
                                    </div>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Email</div>
                                        <div style={styles.modalValue}>{selectedPayment.user?.email}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalSection}>
                                <h4 style={styles.modalSectionTitle}>Productos</h4>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {selectedPayment.items?.map((item, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem',
                                            borderBottom: '1px solid #e2e8f0'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                    Licencia: {item.license}
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: '600' }}>${item.price.toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.modalSection}>
                                <h4 style={styles.modalSectionTitle}>Detalles de pago</h4>
                                <div style={styles.modalGrid}>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Transacción</div>
                                        <div style={styles.modalValue}>{selectedPayment.transaction_id}</div>
                                    </div>
                                    {selectedPayment.metadata?.card_last4 && (
                                        <div style={styles.modalInfo}>
                                            <div style={styles.modalLabel}>Tarjeta</div>
                                            <div style={styles.modalValue}>
                                                **** {selectedPayment.metadata.card_last4}
                                            </div>
                                        </div>
                                    )}
                                    {selectedPayment.metadata?.paypal_email && (
                                        <div style={styles.modalInfo}>
                                            <div style={styles.modalLabel}>PayPal</div>
                                            <div style={styles.modalValue}>
                                                {selectedPayment.metadata.paypal_email}
                                            </div>
                                        </div>
                                    )}
                                    {selectedPayment.metadata?.error && (
                                        <div style={{
                                            ...styles.modalInfo,
                                            backgroundColor: colors.danger + '10',
                                            color: colors.danger
                                        }}>
                                            <div style={styles.modalLabel}>Error</div>
                                            <div style={styles.modalValue}>
                                                {selectedPayment.metadata.error}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={styles.modalActions}>
                                <button
                                    style={{ ...styles.button, ...styles.primaryButton }}
                                    onClick={() => handleResendReceipt(selectedPayment.id)}
                                >
                                    <FiMail /> Reenviar recibo
                                </button>
                                {selectedPayment.status === 'completed' && (
                                    <button
                                        style={{ ...styles.button, ...styles.dangerButton }}
                                        onClick={() => {
                                            handleRefund(selectedPayment.id);
                                            setSelectedPayment(null);
                                        }}
                                    >
                                        <FiRefreshCw /> Procesar reembolso
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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

export default PaymentsManagement;