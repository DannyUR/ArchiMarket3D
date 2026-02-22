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
    FiArrowLeft
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
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const response = await API.get('/purchases');
            console.log('Respuesta completa:', response.data);
            
            // ✅ ESTRUCTURA CORRECTA
            // response.data = { success: true, data: { data: [], current_page: 1, ... } }
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
        switch(status) {
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
        switch(status) {
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
        switch(status) {
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

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem'
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
            background: 'none'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        subtitle: {
            fontSize: '1rem',
            color: '#64748b'
        },
        filtersBar: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            backgroundColor: colors.white,
            flex: 1,
            maxWidth: '400px'
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            width: '100%',
            fontSize: '0.95rem',
            backgroundColor: 'transparent'
        },
        filterSelect: {
            padding: '0.75rem 1rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '10px',
            fontSize: '0.95rem',
            color: colors.dark,
            backgroundColor: colors.white,
            cursor: 'pointer',
            outline: 'none'
        },
        // Lista de compras
        purchasesList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        purchaseCard: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        purchaseHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        purchaseId: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        purchaseNumber: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark
        },
        purchaseStatus: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        purchaseDate: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.9rem'
        },
        purchaseItems: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
        },
        itemPreview: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            fontSize: '0.9rem'
        },
        itemName: {
            fontWeight: '500',
            color: colors.dark
        },
        itemLicense: {
            color: colors.primary,
            fontSize: '0.8rem',
            backgroundColor: colors.primary + '10',
            padding: '0.2rem 0.5rem',
            borderRadius: '12px'
        },
        purchaseFooter: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: `1px solid #e2e8f0`
        },
        purchaseTotal: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.primary
        },
        viewButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer'
        },
        // Detalle de compra
        detailView: {
            backgroundColor: colors.white,
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        detailHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        detailTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            color: colors.dark
        },
        closeButton: {
            padding: '0.5rem',
            backgroundColor: '#f8fafc',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        },
        detailGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem'
        },
        detailSection: {
            backgroundColor: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '12px'
        },
        sectionTitle: {
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        detailRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            fontSize: '0.95rem'
        },
        detailLabel: {
            color: '#64748b'
        },
        detailValue: {
            fontWeight: '500',
            color: colors.dark
        },
        itemsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        detailItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: colors.white,
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        },
        itemInfo: {
            flex: 1
        },
        itemTitle: {
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        itemSubtitle: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        itemPrice: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.primary
        },
        downloadBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: colors.success + '10',
            color: colors.success,
            border: `1px solid ${colors.success}20`,
            borderRadius: '6px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            marginLeft: '1rem'
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary,
            fontSize: '1.1rem'
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
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    Cargando tus compras...
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                {selectedPurchase ? (
                    <button 
                        style={styles.backButton}
                        onClick={() => setSelectedPurchase(null)}
                    >
                        <FiArrowLeft /> Volver a mis compras
                    </button>
                ) : (
                    <>
                        <h1 style={styles.title}>
                            <FiShoppingBag /> Mis Compras
                        </h1>
                        <p style={styles.subtitle}>
                            Historial de todas tus transacciones
                        </p>
                    </>
                )}
            </div>

            {!selectedPurchase ? (
                <>
                    {/* Filtros */}
                    <div style={styles.filtersBar}>
                        <div style={styles.searchBox}>
                            <FiSearch color="#94a3b8" />
                            <input
                                type="text"
                                placeholder="Buscar por modelo o ID..."
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
                        <div style={styles.emptyState}>
                            <FiPackage style={styles.emptyIcon} />
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                                No hay compras para mostrar
                            </h3>
                            <p style={{ color: '#94a3b8' }}>
                                {searchTerm || filterStatus !== 'all' 
                                    ? 'Intenta con otros filtros' 
                                    : 'Explora nuestros modelos y realiza tu primera compra'}
                            </p>
                        </div>
                    ) : (
                        <div style={styles.purchasesList}>
                            {filteredPurchases.map((purchase, index) => (
                                <motion.div
                                    key={purchase.id}
                                    style={styles.purchaseCard}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
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
                                            {formatDate(purchase.purchase_date)}
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
                                            <div style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                                Total pagado
                                            </div>
                                            <div style={styles.purchaseTotal}>
                                                ${purchase.total}
                                            </div>
                                        </div>
                                        <button style={styles.viewButton}>
                                            Ver detalles <FiChevronRight />
                                        </button>
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
                        <button 
                            style={styles.closeButton}
                            onClick={() => setSelectedPurchase(null)}
                        >
                            ✕
                        </button>
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
                                    {selectedPurchase.payment_provider || 'Demo'}
                                </span>
                            </div>
                        </div>

                        <div style={styles.detailSection}>
                            <div style={styles.sectionTitle}>
                                <FiDollarSign /> Resumen
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Subtotal:</span>
                                <span style={styles.detailValue}>
                                    ${selectedPurchase.total}
                                </span>
                            </div>
                            <div style={styles.detailRow}>
                                <span style={styles.detailLabel}>Impuestos:</span>
                                <span style={styles.detailValue}>
                                    ${(selectedPurchase.total * 0.16).toFixed(2)}
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
                        <FiPackage /> Modelos adquiridos
                    </div>
                    <div style={styles.itemsList}>
                        {selectedPurchase.models?.map(model => (
                            <div key={model.id} style={styles.detailItem}>
                                <div style={styles.itemInfo}>
                                    <div style={styles.itemTitle}>{model.name}</div>
                                    <div style={styles.itemSubtitle}>
                                        Formato: {model.format} | Tamaño: {model.size_mb} MB
                                    </div>
                                    <div style={styles.itemSubtitle}>
                                        Licencia: {model.pivot?.license_type || 'Personal'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={styles.itemPrice}>
                                        ${model.pivot?.unit_price || model.price}
                                    </div>
                                    {selectedPurchase.status === 'completed' && (
                                        <button 
                                            style={styles.downloadBtn}
                                            onClick={() => navigate(`/download/${model.id}`)}
                                        >
                                            <FiDownload /> Descargar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MyPurchases;