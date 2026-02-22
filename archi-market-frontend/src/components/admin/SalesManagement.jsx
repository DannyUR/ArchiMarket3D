import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDollarSign,
    FiTrendingUp,
    FiShoppingBag,
    FiUsers,
    FiCalendar,
    FiDownload,
    FiFileText,
    FiFilter,
    FiX,
    FiSearch,
    FiEye,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiBarChart2,
    FiPackage,
    FiChevronDown
} from 'react-icons/fi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const SalesManagement = () => {
    const { showSuccess, showError } = useNotification();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [filterLicense, setFilterLicense] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [stats, setStats] = useState({
        totalSales: 0,
        monthlySales: 0,
        totalTransactions: 0,
        averageTicket: 0,
        salesByDay: [],
        topModels: []
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchSales();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchSales = async () => {
        try {
            // Obtener ventas con filtros
            const params = new URLSearchParams();
            if (dateRange.start) params.append('start_date', dateRange.start);
            if (dateRange.end) params.append('end_date', dateRange.end);

            const response = await API.get(`/admin/reports/sales?${params.toString()}`);
            console.log('Ventas recibidas:', response.data);

            const salesData = response.data?.data?.sales || [];
            setSales(salesData);

            // Calcular estadísticas
            const total = salesData.reduce((acc, sale) => acc + (parseFloat(sale.total) || 0), 0);
            const currentMonth = new Date().getMonth();
            const monthly = salesData
                .filter(sale => new Date(sale.date).getMonth() === currentMonth)
                .reduce((acc, sale) => acc + (parseFloat(sale.total) || 0), 0);

            setStats({
                totalSales: total,
                monthlySales: monthly,
                totalTransactions: salesData.length,
                averageTicket: salesData.length > 0 ? total / salesData.length : 0,
                salesByDay: response.data?.data?.sales_by_day || [],
                topModels: response.data?.data?.top_products || []
            });
        } catch (error) {
            console.error('Error cargando ventas:', error);
            showError('Error al cargar las ventas');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        try {
            // Crear CSV
            const headers = ['ID', 'Fecha', 'Cliente', 'Total', 'Items', 'Estado'];
            const csvData = filteredSales.map(sale => [
                sale.id,
                new Date(sale.date).toLocaleDateString(),
                sale.customer,
                sale.total,
                sale.items_count,
                sale.status
            ]);

            const csvContent = [
                headers.join(','),
                ...csvData.map(row => row.join(','))
            ].join('\n');

            // Descargar archivo
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ventas_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            showSuccess('📊 Reporte exportado correctamente');
        } catch (error) {
            console.error('Error exportando CSV:', error);
            showError('❌ Error al exportar');
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
            case 'completed': return 'Completada';
            case 'pending': return 'Pendiente';
            case 'failed': return 'Fallida';
            default: return status;
        }
    };

    const filteredSales = sales.filter(sale => {
        const matchesSearch = sale.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.id?.toString().includes(searchTerm);
        const matchesLicense = filterLicense === 'all' || sale.license_type === filterLicense;
        const matchesStatus = filterStatus === 'all' || sale.status === filterStatus;
        return matchesSearch && matchesLicense && matchesStatus;
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
            marginBottom: '1.5rem'
        },
        title: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        exportButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.success,
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
            border: `2px solid ${colors.primary}`
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
            fontSize: isMobile ? '1.5rem' : '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            color: '#64748b'
        },
        // Filtros
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
            border: `2px solid ${colors.primary}`
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
        // Gráficas
        chartsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        chartCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`
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
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        chartPlaceholder: {
            height: isMobile ? '150px' : '200px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            fontSize: '0.9rem'
        },
        topModelsList: {
            marginTop: '1rem'
        },
        topModelItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: '1px solid #e2e8f0'
        },
        topModelName: {
            fontWeight: '500',
            color: colors.dark
        },
        topModelStats: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
        },
        topModelCount: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.8rem'
        },
        topModelRevenue: {
            fontWeight: '600',
            color: colors.success
        },
        // Tabla
        tableContainer: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: `2px solid ${colors.primary}`,
            overflow: 'hidden'
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
        // Modal detalle
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
        modalItems: {
            maxHeight: '200px',
            overflowY: 'auto',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px'
        },
        modalItem: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.75rem',
            borderBottom: '1px solid #e2e8f0'
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
                <div style={styles.loadingState}>Cargando ventas...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header con título y botón exportar */}
            <div style={styles.header}>
                <h2 style={styles.title}>
                    <FiDollarSign /> Gestión de Ventas
                </h2>
                <button style={styles.exportButton} onClick={handleExportCSV}>
                    <FiDownload /> Exportar CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: colors.primary + '10', color: colors.primary }}>
                        <FiDollarSign />
                    </div>
                    <div style={styles.statValue}>${(stats.totalSales || 0).toFixed(2)}</div>
                    <div style={styles.statLabel}>Ventas totales</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: colors.success + '10', color: colors.success }}>
                        <FiTrendingUp />
                    </div>
                    <div style={styles.statValue}>${(stats.monthlySales || 0).toFixed(2)}</div>
                    <div style={styles.statLabel}>Ventas del mes</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: colors.warning + '10', color: colors.warning }}>
                        <FiShoppingBag />
                    </div>
                    <div style={styles.statValue}>{stats.totalTransactions || 0}</div>
                    <div style={styles.statLabel}>Transacciones</div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, backgroundColor: colors.secondary + '10', color: colors.secondary }}>
                        <FiUsers />
                    </div>
                    <div style={styles.statValue}>${(stats.averageTicket || 0).toFixed(2)}</div>
                    <div style={styles.statLabel}>Ticket promedio</div>
                </div>
            </div>

            {/* Filtros */}
            <div style={styles.filtersSection}>
                <div style={styles.filtersHeader} onClick={() => setShowFilters(!showFilters)}>
                    <div style={styles.filtersTitle}>
                        <FiFilter /> Filtros
                    </div>
                    <FiChevronDown style={{ transform: showFilters ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={styles.filtersGrid}>
                                <div style={styles.searchBox}>
                                    <FiSearch color="#94a3b8" />
                                    <input
                                        type="text"
                                        placeholder="Buscar por cliente o ID..."
                                        style={styles.searchInput}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <input
                                    type="date"
                                    style={styles.dateInput}
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    placeholder="Fecha inicio"
                                />

                                <input
                                    type="date"
                                    style={styles.dateInput}
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    placeholder="Fecha fin"
                                />

                                <select style={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="all">Todos los estados</option>
                                    <option value="completed">Completadas</option>
                                    <option value="pending">Pendientes</option>
                                    <option value="failed">Fallidas</option>
                                </select>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Gráficas */}
            <div style={styles.chartsGrid}>
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiTrendingUp /> Ventas mensuales
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Últimos 6 meses</span>
                    </div>
                    <div style={styles.chartPlaceholder}>
                        <div style={{ textAlign: 'center' }}>
                            <FiBarChart2 size={32} color={colors.primary + '40'} />
                            <div style={{ marginTop: '0.5rem' }}>Gráfico de ventas</div>
                        </div>
                    </div>
                </div>

                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiPackage /> Modelos más vendidos
                        </h3>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Top 5</span>
                    </div>

                    <div style={styles.topModelsList}>
                        {stats.topModels.length > 0 ? (
                            stats.topModels.map((model, index) => (
                                <div key={index} style={styles.topModelItem}>
                                    <span style={styles.topModelName}>{model.name}</span>
                                    <div style={styles.topModelStats}>
                                        <span style={styles.topModelCount}>{model.total_sales} uds</span>
                                        <span style={styles.topModelRevenue}>${model.revenue}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
                                No hay datos suficientes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabla de ventas */}
            <div style={styles.tableContainer}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Fecha</th>
                                <th style={styles.th}>Cliente</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Items</th>
                                <th style={styles.th}>Estado</th>
                                <th style={styles.th}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        No se encontraron ventas
                                    </td>
                                </tr>
                            ) : (
                                filteredSales.map((sale, index) => (
                                    <motion.tr
                                        key={sale.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td style={styles.td}>#{sale.id}</td>
                                        <td style={styles.td}>
                                            {new Date(sale.date).toLocaleDateString()}
                                        </td>
                                        <td style={styles.td}>{sale.customer}</td>
                                        <td style={styles.td}>${sale.total}</td>
                                        <td style={styles.td}>{sale.items_count}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusBadge,
                                                backgroundColor: getStatusColor(sale.status) + '10',
                                                color: getStatusColor(sale.status)
                                            }}>
                                                {getStatusIcon(sale.status)}
                                                {getStatusText(sale.status)}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <button
                                                style={styles.actionBtn}
                                                onClick={() => setSelectedSale(sale)}
                                                title="Ver detalles"
                                            >
                                                <FiEye />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de detalle */}
            <AnimatePresence>
                {selectedSale && (
                    <motion.div
                        style={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedSale(null)}
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
                                    Detalle de Venta #{selectedSale.id}
                                </h3>
                                <button style={styles.closeBtn} onClick={() => setSelectedSale(null)}>
                                    <FiX />
                                </button>
                            </div>

                            <div style={styles.modalSection}>
                                <h4 style={styles.modalSectionTitle}>Información general</h4>
                                <div style={styles.modalGrid}>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Fecha</div>
                                        <div style={styles.modalValue}>
                                            {new Date(selectedSale.date).toLocaleString()}
                                        </div>
                                    </div>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Estado</div>
                                        <div style={{
                                            ...styles.modalValue,
                                            color: getStatusColor(selectedSale.status)
                                        }}>
                                            {getStatusText(selectedSale.status)}
                                        </div>
                                    </div>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Cliente</div>
                                        <div style={styles.modalValue}>{selectedSale.customer}</div>
                                    </div>
                                    <div style={styles.modalInfo}>
                                        <div style={styles.modalLabel}>Total</div>
                                        <div style={styles.modalValue}>${selectedSale.total}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.modalSection}>
                                <h4 style={styles.modalSectionTitle}>Productos</h4>
                                <div style={styles.modalItems}>
                                    {selectedSale.items?.map((item, index) => (
                                        <div key={index} style={styles.modalItem}>
                                            <span>{item.name}</span>
                                            <span style={{ fontWeight: '600' }}>${item.price}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SalesManagement;