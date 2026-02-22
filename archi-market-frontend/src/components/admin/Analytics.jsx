import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FiTrendingUp,
    FiUsers,
    FiPackage,
    FiShoppingCart,
    FiClock,
    FiMapPin,
    FiCpu,
    FiTarget,
    FiZap,
    FiAlertCircle,
    FiRefreshCw,
    FiDownload,
    FiCalendar
} from 'react-icons/fi';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ScatterChart, Scatter, ZAxis,
    ComposedChart, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const Analytics = () => {
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [predictions, setPredictions] = useState([]);
    const [userBehavior, setUserBehavior] = useState([]);
    const [trendingModels, setTrendingModels] = useState([]);
    const [abandonedCarts, setAbandonedCarts] = useState([]);
    const [peakHours, setPeakHours] = useState([]);
    const [userSegments, setUserSegments] = useState([]);
    const [retentionData, setRetentionData] = useState([]);
    const [period, setPeriod] = useState('month');
    const [isMobile, setIsMobile] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState('all');

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchAnalyticsData();
        return () => window.removeEventListener('resize', checkMobile);
    }, [period]);

    const fetchAnalyticsData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchPredictions(),
                fetchUserBehavior(),
                fetchTrendingModels(),
                fetchAbandonedCarts(),
                fetchPeakHours(),
                fetchUserSegments(),
                fetchRetentionData()
            ]);
        } catch (error) {
            console.error('Error cargando analíticas:', error);
            showError('Error al cargar las analíticas');
        } finally {
            setLoading(false);
        }
    };

    // Predicciones de ventas (simuladas con datos reales + proyección)
    const fetchPredictions = async () => {
        try {
            const response = await API.get(`/admin/reports/sales?period=${period}`);
            const historicalData = response.data?.data?.sales_by_day || [];
            
            // Generar predicción simple (promedio móvil)
            const last7Days = historicalData.slice(-7);
            const avgSales = last7Days.reduce((acc, day) => acc + (day.total_sales || 0), 0) / 7;
            
            const predictions = [];
            for (let i = 1; i <= 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                predictions.push({
                    date: date.toLocaleDateString(),
                    real: null,
                    predicted: avgSales * (1 + (Math.random() * 0.2 - 0.1)), // ±10% variación
                    upper: avgSales * 1.2,
                    lower: avgSales * 0.8
                });
            }
            
            setPredictions(predictions);
        } catch (error) {
            console.error('Error cargando predicciones:', error);
        }
    };

    // Comportamiento de usuarios (horarios, días)
    const fetchUserBehavior = async () => {
        try {
            const response = await API.get('/admin/analytics/user-behavior');
            // Datos de ejemplo mientras se implementa en backend
            const behavior = [
                { hour: '0-2', visits: 120, purchases: 5 },
                { hour: '2-4', visits: 80, purchases: 2 },
                { hour: '4-6', visits: 60, purchases: 1 },
                { hour: '6-8', visits: 150, purchases: 8 },
                { hour: '8-10', visits: 450, purchases: 25 },
                { hour: '10-12', visits: 680, purchases: 42 },
                { hour: '12-14', visits: 720, purchases: 48 },
                { hour: '14-16', visits: 650, purchases: 38 },
                { hour: '16-18', visits: 580, purchases: 32 },
                { hour: '18-20', visits: 490, purchases: 28 },
                { hour: '20-22', visits: 380, purchases: 20 },
                { hour: '22-24', visits: 220, purchases: 10 }
            ];
            setUserBehavior(behavior);
        } catch (error) {
            console.error('Error cargando comportamiento:', error);
        }
    };

    // Modelos con tendencia (ganando popularidad)
    const fetchTrendingModels = async () => {
        try {
            const response = await API.get('/admin/analytics/trending-models');
            // Datos de ejemplo
            const trending = [
                { name: 'Casa Moderna', views: 1250, growth: 45, sales: 12 },
                { name: 'Edificio Corporativo', views: 980, growth: 32, sales: 8 },
                { name: 'Puente Metálico', views: 760, growth: 28, sales: 5 },
                { name: 'Departamento Loft', views: 650, growth: 25, sales: 4 },
                { name: 'Centro Comercial', views: 540, growth: 22, sales: 3 }
            ];
            setTrendingModels(trending);
        } catch (error) {
            console.error('Error cargando tendencias:', error);
        }
    };

    // Carritos abandonados
    const fetchAbandonedCarts = async () => {
        try {
            const response = await API.get('/admin/analytics/abandoned-carts');
            // Datos de ejemplo
            const carts = [
                { reason: 'Precio alto', count: 45, percentage: 30 },
                { reason: 'Comparando', count: 38, percentage: 25 },
                { reason: 'Sin registro', count: 32, percentage: 21 },
                { reason: 'Proceso complejo', count: 20, percentage: 13 },
                { reason: 'Otros', count: 17, percentage: 11 }
            ];
            setAbandonedCarts(carts);
        } catch (error) {
            console.error('Error cargando carritos:', error);
        }
    };

    // Horarios pico
    const fetchPeakHours = async () => {
        try {
            const response = await API.get('/admin/analytics/peak-hours');
            // Datos de ejemplo
            const peaks = [
                { hour: '12:00', purchases: 42 },
                { hour: '13:00', purchases: 48 },
                { hour: '14:00', purchases: 45 },
                { hour: '19:00', purchases: 38 },
                { hour: '20:00', purchases: 35 },
                { hour: '21:00', purchases: 30 }
            ];
            setPeakHours(peaks);
        } catch (error) {
            console.error('Error cargando horas pico:', error);
        }
    };

    // Segmentación de usuarios
    const fetchUserSegments = async () => {
        try {
            const response = await API.get('/admin/analytics/user-segments');
            // Datos de ejemplo
            const segments = [
                { segment: 'Nuevos', count: 150, revenue: 2500 },
                { segment: 'Ocasionales', count: 280, revenue: 8500 },
                { segment: 'Frecuentes', count: 120, revenue: 12500 },
                { segment: 'VIP', count: 35, revenue: 8900 },
                { segment: 'Inactivos', count: 410, revenue: 0 }
            ];
            setUserSegments(segments);
        } catch (error) {
            console.error('Error cargando segmentos:', error);
        }
    };

    // Retención de usuarios
    const fetchRetentionData = async () => {
        try {
            const response = await API.get('/admin/analytics/retention');
            // Datos de ejemplo (cohortes)
            const retention = [
                { month: 'Mes 1', retention: 100 },
                { month: 'Mes 2', retention: 65 },
                { month: 'Mes 3', retention: 48 },
                { month: 'Mes 4', retention: 39 },
                { month: 'Mes 5', retention: 32 },
                { month: 'Mes 6', retention: 28 }
            ];
            setRetentionData(retention);
        } catch (error) {
            console.error('Error cargando retención:', error);
        }
    };

    const handleExportAnalytics = () => {
        showSuccess('📊 Exportando análisis completo... (próximamente)');
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
        metricSelect: {
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.95rem',
            color: colors.dark,
            minWidth: '150px'
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
        exportButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1.5rem',
            backgroundColor: colors.success,
            color: 'white',
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
            border: '1px solid #e2e8f0'
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
            height: isMobile ? '250px' : '300px',
            minHeight: '200px',
            position: 'relative'
        },
        // Cards de métricas rápidas
        metricsRow: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        metricCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        metricIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
        },
        metricInfo: {
            flex: 1
        },
        metricValue: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        metricLabel: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        metricTrend: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            color: colors.success,
            marginTop: '0.25rem'
        },
        // Listas
        listContainer: {
            marginTop: '1rem'
        },
        listItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: '1px solid #e2e8f0'
        },
        listItemLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        listRank: {
            width: '24px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: '600'
        },
        listName: {
            fontWeight: '500',
            color: colors.dark
        },
        listStats: {
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
        },
        listStat: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        growthBadge: {
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: '600',
            backgroundColor: colors.success + '10',
            color: colors.success
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
            border: '1px solid #e2e8f0'
        }
    };

    // Métricas rápidas (simuladas)
    const quickMetrics = [
        { icon: <FiTrendingUp />, color: colors.primary, value: '+23%', label: 'Crecimiento', trend: '+5% vs ayer' },
        { icon: <FiTarget />, color: colors.success, value: '78%', label: 'Conversión', trend: '+2%' },
        { icon: <FiZap />, color: colors.warning, value: '3.2s', label: 'Tiempo en sitio', trend: '-0.5s' },
        { icon: <FiShoppingCart />, color: colors.secondary, value: '12%', label: 'Carritos abandonados', trend: '-3%' }
    ];

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={{ marginBottom: '1rem' }}>Analizando datos...</div>
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
                    <FiCpu /> Analíticas Avanzadas
                </h2>
                <div style={styles.controls}>
                    <select
                        style={styles.periodSelect}
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                    >
                        <option value="day">Últimas 24h</option>
                        <option value="week">Última semana</option>
                        <option value="month">Último mes</option>
                        <option value="quarter">Último trimestre</option>
                    </select>

                    <select
                        style={styles.metricSelect}
                        value={selectedMetric}
                        onChange={(e) => setSelectedMetric(e.target.value)}
                    >
                        <option value="all">Todas las métricas</option>
                        <option value="sales">Ventas</option>
                        <option value="users">Usuarios</option>
                        <option value="models">Modelos</option>
                        <option value="behavior">Comportamiento</option>
                    </select>

                    <button style={styles.refreshButton} onClick={fetchAnalyticsData}>
                        <FiRefreshCw /> Actualizar
                    </button>

                    <button style={styles.exportButton} onClick={handleExportAnalytics}>
                        <FiDownload /> Exportar
                    </button>
                </div>
            </div>

            {/* Métricas rápidas */}
            <div style={styles.metricsRow}>
                {quickMetrics.map((metric, index) => (
                    <div key={index} style={styles.metricCard}>
                        <div style={{ ...styles.metricIcon, backgroundColor: metric.color + '10', color: metric.color }}>
                            {metric.icon}
                        </div>
                        <div style={styles.metricInfo}>
                            <div style={styles.metricValue}>{metric.value}</div>
                            <div style={styles.metricLabel}>{metric.label}</div>
                            <div style={styles.metricTrend}>{metric.trend}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid de gráficas */}
            <div style={styles.statsGrid}>
                {/* Predicción de ventas */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiTrendingUp /> Predicción de ventas (7 días)
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {predictions.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={predictions}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="monotone" dataKey="upper" fill={colors.primary + '10'} stroke="none" />
                                    <Area type="monotone" dataKey="lower" fill={colors.primary + '10'} stroke="none" />
                                    <Line type="monotone" dataKey="predicted" stroke={colors.primary} strokeWidth={2} dot={false} name="Predicción" />
                                    <Line type="monotone" dataKey="real" stroke={colors.success} strokeWidth={2} dot={{ r: 4 }} name="Real (histórico)" />
                                </ComposedChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Generando predicciones...</div>
                        )}
                    </div>
                </div>

                {/* Comportamiento por hora */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiClock /> Actividad por hora
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {userBehavior.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userBehavior}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis yAxisId="left" orientation="left" stroke={colors.primary} />
                                    <YAxis yAxisId="right" orientation="right" stroke={colors.success} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="visits" fill={colors.primary} name="Visitas" />
                                    <Bar yAxisId="right" dataKey="purchases" fill={colors.success} name="Compras" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de comportamiento</div>
                        )}
                    </div>
                </div>

                {/* Modelos con tendencia */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiPackage /> Modelos en tendencia
                        </h3>
                    </div>
                    <div style={styles.listContainer}>
                        {trendingModels.map((model, index) => (
                            <div key={index} style={styles.listItem}>
                                <div style={styles.listItemLeft}>
                                    <span style={styles.listRank}>{index + 1}</span>
                                    <span style={styles.listName}>{model.name}</span>
                                </div>
                                <div style={styles.listStats}>
                                    <span style={styles.listStat}>{model.views} vistas</span>
                                    <span style={styles.growthBadge}>+{model.growth}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carritos abandonados */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiShoppingCart /> Razones de abandono
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {abandonedCarts.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={abandonedCarts}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ reason, percent }) => `${reason}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                    >
                                        {abandonedCarts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de carritos</div>
                        )}
                    </div>
                </div>

                {/* Segmentación de usuarios */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiUsers /> Segmentos de usuarios
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {userSegments.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={userSegments} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="segment" type="category" width={100} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill={colors.primary} name="Usuarios" />
                                    <Bar dataKey="revenue" fill={colors.success} name="Ingresos ($)" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de segmentos</div>
                        )}
                    </div>
                </div>

                {/* Retención de usuarios */}
                <div style={styles.chartCard}>
                    <div style={styles.chartHeader}>
                        <h3 style={styles.chartTitle}>
                            <FiTarget /> Retención de usuarios
                        </h3>
                    </div>
                    <div style={styles.chartContainer}>
                        {retentionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={retentionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="retention" stroke={colors.primary} fill={colors.primary + '20'} name="Retención %" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={styles.emptyState}>Sin datos de retención</div>
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

export default Analytics;