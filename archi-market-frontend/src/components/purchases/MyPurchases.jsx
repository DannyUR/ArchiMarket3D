import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiShoppingBag,
    FiPackage,
    FiCalendar,
    FiDollarSign,
    FiDownload,
    FiEye,
    FiChevronRight,
    FiSearch,
    FiFilter,
    FiClock,
    FiCheckCircle,
    FiXCircle,
    FiArrowLeft,
    FiAward,
    FiCreditCard,
    FiTrendingUp,
    FiBox,
    FiTag,
    FiUser,
    FiMail
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { colors } from '../../styles/theme';

const MyPurchases = () => {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isMobile, setIsMobile] = useState(false);

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
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const response = await API.get('/purchases');
            console.log('Respuesta completa:', response.data);

            const purchasesData = response.data?.data?.data || [];
            setPurchases(purchasesData);

        } catch (error) {
            console.error('Error cargando compras:', error);
            setPurchases([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return colors.success;
            case 'pending':
                return colors.warning;
            case 'failed':
                return colors.danger;
            default:
                return '#64748b';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <FiCheckCircle />;
            case 'pending':
                return <FiClock />;
            case 'failed':
                return <FiXCircle />;
            default:
                return null;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Completada';
            case 'pending':
                return 'Pendiente';
            case 'failed':
                return 'Fallida';
            default:
                return status;
        }
    };

    const filteredPurchases = purchases.filter(purchase => {
        const matchesSearch = purchase.models?.some(model =>
            model.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || purchase.id.toString().includes(searchTerm);

        const matchesStatus = filterStatus === 'all' || purchase.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh'
        },
        header: {
            marginBottom: '2rem'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: colors.primary,
            cursor: 'pointer',
            marginBottom: '1rem',
            fontSize: '0.95rem',
            border: 'none',
            background: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '30px',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.primary + '10'
            }
        },
        titleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem',
            flexWrap: 'wrap'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: 0
        },
        titleIcon: {
            color: colors.primary,
            fontSize: isMobile ? '2rem' : '2.5rem'
        },
        subtitle: {
            fontSize: isMobile ? '0.95rem' : '1rem',
            color: '#64748b',
            lineHeight: '1.6'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '0.8rem' : '1rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            padding: isMobile ? '1rem' : '1.2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem'
        },
        statIcon: {
            width: isMobile ? '40px' : '48px',
            height: isMobile ? '40px' : '48px',
            borderRadius: '16px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: isMobile ? '1.2rem' : '1.5rem'
        },
        statContent: {
            flex: 1
        },
        statValue: {
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: '700',
            color: colors.dark,
            lineHeight: '1.2',
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: isMobile ? '0.75rem' : '0.8rem',
            color: '#64748b'
        },
        filtersBar: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: '1rem',
            marginBottom: '2rem'
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.8rem 1rem' : '1rem 1.2rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '20px',
            backgroundColor: colors.white,
            flex: 1,
            maxWidth: isMobile ? '100%' : '400px',
            transition: 'all 0.2s'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: isMobile ? '0.95rem' : '1rem',
            backgroundColor: 'transparent'
        },
        filterSelect: {
            padding: isMobile ? '0.8rem 1rem' : '1rem 1.5rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '20px',
            fontSize: isMobile ? '0.95rem' : '1rem',
            color: colors.dark,
            backgroundColor: colors.white,
            cursor: 'pointer',
            outline: 'none',
            minWidth: isMobile ? '100%' : '200px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '16px'
        },
        purchasesList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        purchaseCard: {
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: isMobile ? '1.2rem' : '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        purchaseHeader: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '0.8rem' : '0',
            marginBottom: '1rem'
        },
        purchaseId: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        purchaseNumber: {
            fontSize: isMobile ? '1rem' : '1.1rem',
            fontWeight: '600',
            color: colors.dark
        },
        purchaseStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '600'
        },
        purchaseDate: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.9rem',
            backgroundColor: '#f8fafc',
            padding: '0.4rem 1rem',
            borderRadius: '30px'
        },
        purchaseItems: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.8rem',
            marginBottom: '1.5rem'
        },
        itemPreview: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '30px',
            fontSize: '0.9rem',
            border: '1px solid #f0f0f0'
        },
        itemName: {
            fontWeight: '500',
            color: colors.dark
        },
        itemLicense: {
            color: colors.primary,
            fontSize: '0.7rem',
            backgroundColor: colors.primary + '10',
            padding: '0.2rem 0.6rem',
            borderRadius: '30px',
            fontWeight: '600'
        },
        purchaseFooter: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: `1px solid #f0f0f0`
        },
        purchaseTotal: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '700',
            color: colors.primary
        },
        viewButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: `0 8px 20px ${colors.primary}30`,
            transition: 'all 0.2s'
        },
        // Detalle de compra
        detailView: {
            backgroundColor: colors.white,
            borderRadius: '32px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0'
        },
        detailHeader: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: `2px solid ${colors.primary}10`
        },
        detailTitle: {
            fontSize: isMobile ? '1.5rem' : '1.8rem',
            fontWeight: '700',
            color: colors.dark
        },
        closeButton: {
            padding: '0.8rem',
            backgroundColor: '#f8fafc',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            color: '#64748b',
            fontSize: '1.2rem',
            width: '45px',
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.danger + '10',
                color: colors.danger
            }
        },
        detailGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        detailSection: {
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid #f0f0f0'
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        detailRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            fontSize: '0.95rem',
            padding: '0.5rem 0',
            borderBottom: '1px dashed #e2e8f0'
        },
        detailLabel: {
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        detailValue: {
            fontWeight: '500',
            color: colors.dark
        },
        itemsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1rem'
        },
        detailItem: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid #f0f0f0'
        },
        itemInfo: {
            flex: 1
        },
        itemTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        itemMeta: {
            display: 'flex',
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#64748b',
            flexWrap: 'wrap'
        },
        itemPrice: {
            fontSize: isMobile ? '1.2rem' : '1.3rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: isMobile ? '0.5rem' : '0'
        },
        downloadBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.5rem',
            backgroundColor: colors.success + '10',
            color: colors.success,
            border: `1px solid ${colors.success}20`,
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.success,
                color: 'white'
            }
        },
        loadingState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            gap: '1.5rem'
        },
        spinner: {
            width: '60px',
            height: '60px',
            border: `4px solid ${colors.primary}20`,
            borderTop: `4px solid ${colors.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
        },
        emptyState: {
            textAlign: 'center',
            padding: isMobile ? '4rem 1.5rem' : '5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '32px',
            color: '#64748b',
            border: '1px solid #f0f0f0'
        },
        emptyIcon: {
            fontSize: '4rem',
            color: colors.primary + '40',
            marginBottom: '1rem'
        }
    };

    // Calcular estadísticas - CON CORRECCIÓN DE TIPOS
    const totalSpent = purchases.reduce((acc, p) => {
        const price = p.total ? parseFloat(p.total) : 0;
        return acc + (isNaN(price) ? 0 : price);
    }, 0);

    const completedCount = purchases.filter(p => p.status === 'completed').length;
    const pendingCount = purchases.filter(p => p.status === 'pending').length;
    const totalModels = purchases.reduce((acc, p) => acc + (p.models?.length || 0), 0);

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={styles.spinner} />
                    <p style={{ color: colors.primary, fontSize: '1.1rem' }}>Cargando tus compras...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                {selectedPurchase ? (
                    <motion.button
                        style={styles.backButton}
                        whileHover={{ x: -5, backgroundColor: colors.primary + '10' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedPurchase(null)}
                    >
                        <FiArrowLeft /> Volver a mis compras
                    </motion.button>
                ) : (
                    <>
                        <div style={styles.titleSection}>
                            <h1 style={styles.title}>
                                <FiShoppingBag style={styles.titleIcon} />
                                Mis Compras
                            </h1>
                        </div>
                        <p style={styles.subtitle}>
                            Historial completo de todas tus transacciones y modelos adquiridos
                        </p>
                    </>
                )}
            </div>

            {!selectedPurchase ? (
                <>
                    {/* Stats Cards */}
                    <div style={styles.statsGrid}>
                        {[
                            {
                                icon: <FiDollarSign />,
                                value: `$${typeof totalSpent === 'number' ? totalSpent.toFixed(2) : '0.00'}`,
                                label: 'Total gastado'
                            },
                            {
                                icon: <FiPackage />,
                                value: completedCount,
                                label: 'Compras completadas'
                            },
                            {
                                icon: <FiClock />,
                                value: pendingCount,
                                label: 'Compras pendientes'
                            },
                            {
                                icon: <FiBox />,
                                value: totalModels,
                                label: 'Modelos adquiridos'
                            }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                style={styles.statCard}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                            >
                                <div style={styles.statIcon}>{stat.icon}</div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>{stat.value}</div>
                                    <div style={styles.statLabel}>{stat.label}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Filtros */}
                    <div style={styles.filtersBar}>
                        <div style={styles.searchBox}>
                            <FiSearch color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Buscar por modelo o ID de compra..."
                                style={styles.searchInput}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            style={styles.filterSelect}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Todas las compras</option>
                            <option value="completed">Completadas</option>
                            <option value="pending">Pendientes</option>
                            <option value="failed">Fallidas</option>
                        </select>
                    </div>

                    {/* Lista de compras */}
                    {filteredPurchases.length === 0 ? (
                        <motion.div
                            style={styles.emptyState}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <FiPackage style={styles.emptyIcon} />
                            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: colors.dark }}>
                                No hay compras para mostrar
                            </h3>
                            <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Intenta con otros filtros de búsqueda'
                                    : 'Explora nuestros modelos y realiza tu primera compra'}
                            </p>
                        </motion.div>
                    ) : (
                        <div style={styles.purchasesList}>
                            {filteredPurchases.map((purchase, index) => (
                                <motion.div
                                    key={purchase.id}
                                    style={styles.purchaseCard}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
                                    onClick={() => setSelectedPurchase(purchase)}
                                >
                                    <div style={styles.purchaseHeader}>
                                        <div style={styles.purchaseId}>
                                            <span style={styles.purchaseNumber}>
                                                Compra #{purchase.id}
                                            </span>
                                            <span style={{
                                                ...styles.purchaseStatus,
                                                backgroundColor: getStatusColor(purchase.status) + '10',
                                                color: getStatusColor(purchase.status)
                                            }}>
                                                {getStatusIcon(purchase.status)}
                                                {getStatusText(purchase.status)}
                                            </span>
                                        </div>
                                        <div style={styles.purchaseDate}>
                                            <FiCalendar />
                                            {formatShortDate(purchase.purchase_date)}
                                        </div>
                                    </div>

                                    <div style={styles.purchaseItems}>
                                        {purchase.models?.slice(0, 3).map(model => (
                                            <div key={model.id} style={styles.itemPreview}>
                                                <HiOutlineCube size={16} color={colors.primary} />
                                                <span style={styles.itemName}>{model.name}</span>
                                                <span style={styles.itemLicense}>
                                                    {model.pivot?.license_type || 'Personal'}
                                                </span>
                                            </div>
                                        ))}
                                        {purchase.models?.length > 3 && (
                                            <div style={styles.itemPreview}>
                                                +{purchase.models.length - 3} más
                                            </div>
                                        )}
                                    </div>

                                    <div style={styles.purchaseFooter}>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                Total pagado
                                            </div>
                                            <div style={styles.purchaseTotal}>
                                                ${purchase.total}
                                            </div>
                                        </div>
                                        <motion.button
                                            style={styles.viewButton}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Ver detalles <FiChevronRight />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </>
            ) : (
                /* Detalle de compra */
                <motion.div
                    style={styles.detailView}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={styles.detailHeader}>
                        <h2 style={styles.detailTitle}>
                            Detalle de Compra #{selectedPurchase.id}
                        </h2>
                        <motion.button
                            style={styles.closeButton}
                            whileHover={{ scale: 1.1, backgroundColor: colors.danger + '10', color: colors.danger }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSelectedPurchase(null)}
                        >
                            ✕
                        </motion.button>
                    </div>

                    <div style={styles.detailGrid}>
                        <div style={styles.detailSection}>
                            <div style={styles.sectionTitle}>
                                <FiCalendar /> Información de compra
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Fecha:</span>
                                <span style={styles.detailValue}>
                                    {formatDate(selectedPurchase.purchase_date)}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Estado:</span>
                                <span style={{
                                    ...styles.detailValue,
                                    color: getStatusColor(selectedPurchase.status)
                                }}>
                                    {getStatusText(selectedPurchase.status)}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Método de pago:</span>
                                <span style={styles.detailValue}>
                                    {selectedPurchase.payment_provider || 'Tarjeta de crédito'}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>ID de transacción:</span>
                                <span style={styles.detailValue}>
                                    {selectedPurchase.transaction_id || 'TRX-' + selectedPurchase.id}
                                </span>
                            </div>
                        </div>

                        <div style={styles.detailSection}>
                            <div style={styles.sectionTitle}>
                                <FiDollarSign /> Resumen financiero
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Subtotal:</span>
                                <span style={styles.detailValue}>
                                    ${selectedPurchase.total}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Impuestos (16%):</span>
                                <span style={styles.detailValue}>
                                    ${(selectedPurchase.total * 0.16).toFixed(2)}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Envío:</span>
                                <span style={{ ...styles.detailValue, color: colors.success }}>
                                    Gratis
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Total:</span>
                                <span style={{
                                    ...styles.detailValue,
                                    fontSize: '1.2rem',
                                    color: colors.primary
                                }}>
                                    ${(selectedPurchase.total * 1.16).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.sectionTitle}>
                        <FiPackage /> Modelos adquiridos ({selectedPurchase.models?.length || 0})
                    </div>
                    <div style={styles.itemsList}>
                        {selectedPurchase.models?.map(model => (
                            <motion.div
                                key={model.id}
                                style={styles.detailItem}
                                whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                            >
                                <div style={styles.itemInfo}>
                                    <div style={styles.itemTitle}>{model.name}</div>
                                    <div style={styles.itemMeta}>
                                        <span><FiBox /> {model.format}</span>
                                        <span><FiDownload /> {model.size_mb} MB</span>
                                        <span><FiTag /> {model.pivot?.license_type || 'Personal'}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={styles.itemPrice}>
                                        ${model.pivot?.unit_price || model.price}
                                    </div>
                                    {selectedPurchase.status === 'completed' && (
                                        <motion.button
                                            style={styles.downloadBtn}
                                            whileHover={{ scale: 1.02, backgroundColor: colors.success, color: 'white' }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/downloads`);
                                            }}
                                        >
                                            <FiDownload /> Descargar
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default MyPurchases;