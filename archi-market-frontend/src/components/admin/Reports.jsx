import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiBarChart2,
    FiPieChart,
    FiTrendingUp,
    FiUsers,
    FiPackage,
    FiDollarSign,
    FiDownload,
    FiCalendar,
    FiFilter,
    FiRefreshCw
} from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const Reports = () => {
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('month');
    const [salesData, setSalesData] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [usersData, setUsersData] = useState([]);
    const [licensesData, setLicensesData] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchAllData();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [period, dateRange]);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchSalesStats(),
                fetchModelsStats(),
                fetchUsersStats(),
                fetchLicensesStats()
            ]);
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
            showError('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesStats = async () => {
        try {
            const params = new URLSearchParams({
                period,
                start_date: dateRange.start,
                end_date: dateRange.end
            });
            const response = await API.get(`/admin/reports/sales?${params.toString()}`);
            console.log('Ventas stats:', response.data);
            
            // Formatear datos para gráficas
            const formatted = response.data?.data?.sales_by_day?.map(item => ({
                date: new Date(item.date).toLocaleDateString(),
                sales: item.total_sales || 0,
                transactions: item.total_purchases || 0,
                average: item.average_sale || 0
            })) || [];
            
            setSalesData(formatted);
        } catch (error) {
            console.error('Error cargando ventas:', error);
        }
    };

    const fetchModelsStats = async () => {
        try {
            const response = await API.get('/admin/reports/models');
            console.log('Modelos stats:', response.data);
            
            // Top 10 modelos más vendidos
            const topModels = response.data?.data?.models
                ?.sort((a, b) => b.sales_count - a.sales_count)
                .slice(0, 10)
                .map(model => ({
                    name: model.name.length > 20 ? model.name.substring(0, 20) + '...' : model.name,
                    ventas: model.sales_count || 0,
                    ingresos: model.price * (model.sales_count || 0)
                })) || [];
            
            setModelsData(topModels);
        } catch (error) {
            console.error('Error cargando modelos:', error);
        }
    };

    const fetchUsersStats = async () => {
        try {
            const response = await API.get('/admin/reports/users');
            console.log('Usuarios stats:', response.data);
            
            // Usuarios por mes (últimos 6 meses)
            const usersByMonth = response.data?.data?.users_by_month
                ?.slice(-6)
                .map(item => ({
                    mes: `${item.month}/${item.year}`,
                    nuevos: item.total || 0
                })) || [];
            
            setUsersData(usersByMonth);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    };

    const fetchLicensesStats = async () => {
        try {
            const response = await API.get('/admin/reports/licenses');
            console.log('Licencias stats:', response.data);
            
            // Distribución de licencias
            const licenses = response.data?.data?.licenses || [];
            const byType = {
                personal: licenses.filter(l => l.license_type === 'personal').length,
                business: licenses.filter(l => l.license_type === 'business').length,
                unlimited: licenses.filter(l => l.license_type === 'unlimited').length
            };
            
            setLicensesData([
                { name: 'Personal', value: byType.personal },
                { name: 'Empresarial', value: byType.business },
                { name: 'Ilimitada', value: byType.unlimited }
            ]);
        } catch (error) {
            console.error('Error cargando licencias:', error);
        }
    };

    const handleExportPDF = () => {
        showSuccess('📊 Exportando reporte... (próximamente)');
    };

    const COLORS = [colors.primary, colors.success, colors.warning, colors.secondary, colors.danger];

    const styles = {
        container: {
            padding: isMobile ? '1rem' : '1.5rem',
            width: '100%'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
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
        controls: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        periodSelect: {
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
        exportButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.5rem',
            backgroundColor: colors.success,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
        },
        refreshButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f1f5f9',
            color: colors.dark,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1.5rem',
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
        chartContainer: {
            width: '100%',
            height: isMobile ? '250px' : '300px'
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
                    <div style={{ marginBottom: '1rem' }}>Cargando estadísticas...</div>
                    <div style={{ width: '50px', height: '50px', border: `3px solid ${colors.primary}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>
                    <FiBarChart2 /> Estadísticas Detalladas
                </h2>
                <div style={styles.controls}>
                    <select
                        style={styles.periodSelect}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="day">Por día</option>
                        <option value="week">Por semana</option>
                        <option value="month">Por mes</option>
                        <option value="year">Por año</option>
                    </select>

                    <input
                        type="date"
                        style={styles.dateInput}
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                    <input
                        type="date"
                        style={styles.dateInput}
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />

                    <button style={styles.refreshButton} onClick={fetchAllData}>
                        <FiRefreshCw /> Actualizar
                    </button>

                    <button style={styles.exportButton} onClick={handleExportPDF}>
                        <FiDownload /> Exportar
                    </button>
                </div>
            </div>

            {/* Gráficas */}
            <div style={styles.statsGrid}>
                {/* Ventas por período */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiTrendingUp /> Ventas por período
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {salesData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="sales" stroke={colors.primary} fill={colors.primary + '20'} name="Ventas ($)" />
                                    <Area type="monotone" dataKey="transactions" stroke={colors.success} fill={colors.success + '20'} name="Transacciones" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de ventas</div>
                        )}
                    </div>
                </div>

                {/* Modelos más vendidos */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiPackage /> Top Modelos
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {modelsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={modelsData} layout={isMobile ? 'vertical' : 'horizontal'}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {isMobile ? (
                                        <>
                                            <XAxis type="category" dataKey="name" hide />
                                            <YAxis type="number" />
                                        </>
                                    ) : (
                                        <>
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                        </>
                                    )}
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="ventas" fill={colors.primary} name="Ventas" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de modelos</div>
                        )}
                    </div>
                </div>

                {/* Usuarios nuevos */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiUsers /> Nuevos usuarios
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {usersData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={usersData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="mes" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="nuevos" stroke={colors.success} name="Usuarios nuevos" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de usuarios</div>
                        )}
                    </div>
                </div>

                {/* Distribución de licencias */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiPieChart /> Licencias por tipo
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {licensesData.filter(d => d.value > 0).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={licensesData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {licensesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de licencias</div>
                        )}
                    </div>
                </div>
            </div>
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

export default Reports;