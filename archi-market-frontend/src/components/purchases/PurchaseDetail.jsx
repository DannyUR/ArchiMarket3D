import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    FiArrowLeft,
    FiCalendar,
    FiDollarSign,
    FiPackage,
    FiDownload,
    FiCheckCircle,
    FiClock,
    FiXCircle,
    FiFileText,
    FiCreditCard,
    FiTag,
    FiBox,
    FiAward,
    FiShoppingBag,
    FiPrinter,
    FiMail,
    FiShield
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { colors } from '../../styles/theme';

const PurchaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
        fetchPurchaseDetail();
    }, [id]);

    const fetchPurchaseDetail = async () => {
        try {
            const response = await API.get(`/purchases/${id}`);
            console.log('Detalle de compra:', response.data);
            setPurchase(response.data.data || response.data);
        } catch (err) {
            console.error('Error cargando detalle:', err);
            setError('No se pudo cargar el detalle de la compra');
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

    const handleDownload = async (fileId, modelName) => {
        try {
            const response = await API.get(`/download/${fileId}`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${modelName}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error descargando archivo:', error);
            alert('Error al descargar el archivo');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: isMobile ? '5rem 1rem 2rem' : '6rem 2rem 2rem',
            minHeight: '100vh'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: colors.primary,
            cursor: 'pointer',
            marginBottom: '2rem',
            fontSize: '1rem',
            border: 'none',
            background: 'none',
            padding: '0.8rem 1.5rem',
            borderRadius: '30px',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.primary + '10'
            }
        },
        header: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: `2px solid ${colors.primary}10`
        },
        titleSection: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        title: {
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            fontWeight: '700',
            color: colors.dark,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        titleIcon: {
            color: colors.primary,
            fontSize: isMobile ? '1.8rem' : '2.2rem'
        },
        status: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.5rem',
            borderRadius: '30px',
            fontSize: '0.95rem',
            fontWeight: '600',
            border: '1px solid transparent'
        },
        actionsBar: {
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
        },
        actionButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.8rem 1.5rem',
            backgroundColor: 'white',
            color: colors.dark,
            border: `2px solid #e2e8f0`,
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '500',
            transition: 'all 0.2s'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s'
        },
        cardTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingBottom: '0.75rem',
            borderBottom: `2px solid ${colors.primary}10`
        },
        infoGrid: {
            display: 'grid',
            gap: '1rem'
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px'
        },
        infoLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            fontSize: '0.95rem'
        },
        infoValue: {
            fontWeight: '600',
            color: colors.dark,
            fontSize: '0.95rem'
        },
        totalAmountCard: {
            gridColumn: isMobile ? '1' : 'span 2',
            backgroundColor: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
            color: 'white',
            padding: isMobile ? '1.5rem' : '2rem',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: '1rem'
        },
        totalLabel: {
            fontSize: '1.1rem',
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        totalValue: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700'
        },
        // Sección de items
        itemsSection: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            marginTop: '2rem'
        },
        itemsHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        itemsTitle: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        itemsCount: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.4rem 1rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        itemsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        itemCard: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: isMobile ? '1rem' : '0',
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            transition: 'all 0.2s'
        },
        itemIcon: {
            width: '60px',
            height: '60px',
            backgroundColor: colors.primary + '10',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '2rem'
        },
        itemInfo: {
            flex: 1,
            marginLeft: isMobile ? '0' : '1rem'
        },
        itemName: {
            fontSize: '1.2rem',
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
        metaTag: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            backgroundColor: 'white',
            padding: '0.3rem 0.8rem',
            borderRadius: '30px',
            border: '1px solid #e2e8f0'
        },
        itemLicense: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.3rem 0.8rem',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '600'
        },
        itemPrice: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '700',
            color: colors.primary,
            marginRight: isMobile ? '0' : '1rem'
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
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.success,
                color: 'white'
            }
        },
        // Estados
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
        errorState: {
            textAlign: 'center',
            padding: isMobile ? '3rem 1rem' : '4rem',
            backgroundColor: 'white',
            borderRadius: '24px',
            border: '1px solid #f0f0f0',
            color: colors.danger
        },
        errorIcon: {
            fontSize: '4rem',
            color: colors.danger + '40',
            marginBottom: '1rem'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={styles.spinner} />
                    <p style={{ color: colors.primary, fontSize: '1.1rem' }}>Cargando detalle de compra...</p>
                </div>
            </div>
        );
    }

    if (error || !purchase) {
        return (
            <div style={styles.container}>
                <div style={styles.errorState}>
                    <FiXCircle style={styles.errorIcon} />
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: colors.dark }}>
                        {error || 'Compra no encontrada'}
                    </h3>
                    <p style={{ color: '#64748b' }}>La compra que buscas no existe o ha sido eliminada</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Botón volver */}
            <motion.button 
                style={styles.backButton}
                whileHover={{ x: -5, backgroundColor: colors.primary + '10' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/purchases')}
            >
                <FiArrowLeft /> Volver a mis compras
            </motion.button>

            {/* Header */}
            <div style={styles.header}>
                <div style={styles.titleSection}>
                    <h1 style={styles.title}>
                        <FiShoppingBag style={styles.titleIcon} />
                        Compra #{purchase.id}
                    </h1>
                    <div style={{
                        ...styles.status,
                        backgroundColor: getStatusColor(purchase.status) + '10',
                        color: getStatusColor(purchase.status),
                        borderColor: getStatusColor(purchase.status) + '20'
                    }}>
                        {getStatusIcon(purchase.status)}
                        {getStatusText(purchase.status)}
                    </div>
                </div>
                
                <div style={styles.actionsBar}>
                    <motion.button 
                        style={styles.actionButton}
                        whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePrint}
                    >
                        <FiPrinter /> Imprimir
                    </motion.button>
                    <motion.button 
                        style={styles.actionButton}
                        whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <FiMail /> Enviar recibo
                    </motion.button>
                </div>
            </div>

            {/* Grid de información */}
            <div style={styles.grid}>
                {/* Información de compra */}
                <motion.div 
                    style={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div style={styles.cardTitle}>
                        <FiCalendar /> Información de compra
                    </div>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>
                                <FiCalendar /> Fecha
                            </span>
                            <span style={styles.infoValue}>
                                {formatDate(purchase.purchase_date)}
                            </span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>
                                <FiCreditCard /> Método de pago
                            </span>
                            <span style={styles.infoValue}>
                                {purchase.payment_provider || 'Demo'}
                            </span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>
                                <FiTag /> ID de transacción
                            </span>
                            <span style={styles.infoValue}>
                                {purchase.payment_id || `TRX-${purchase.id}`}
                            </span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>
                                <FiShield /> Estado
                            </span>
                            <span style={{
                                ...styles.infoValue,
                                color: getStatusColor(purchase.status)
                            }}>
                                {getStatusText(purchase.status)}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Resumen de pago */}
                <motion.div 
                    style={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div style={styles.cardTitle}>
                        <FiDollarSign /> Resumen de pago
                    </div>
                    <div style={styles.infoGrid}>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Subtotal</span>
                            <span style={styles.infoValue}>
                                ${purchase.total}
                            </span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Impuestos (16%)</span>
                            <span style={styles.infoValue}>
                                ${(purchase.total * 0.16).toFixed(2)}
                            </span>
                        </div>
                        <div style={styles.infoRow}>
                            <span style={styles.infoLabel}>Envío</span>
                            <span style={{ ...styles.infoValue, color: colors.success }}>
                                Gratis
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Total card */}
                <motion.div 
                    style={styles.totalAmountCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div style={styles.totalLabel}>
                        <FiAward size={24} /> Total pagado
                    </div>
                    <div style={styles.totalValue}>
                        ${(purchase.total * 1.16).toFixed(2)}
                    </div>
                </motion.div>
            </div>

            {/* Modelos adquiridos */}
            <motion.div 
                style={styles.itemsSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div style={styles.itemsHeader}>
                    <div style={styles.itemsTitle}>
                        <FiPackage /> Modelos adquiridos
                    </div>
                    <span style={styles.itemsCount}>
                        {purchase.models?.length || 0} modelos
                    </span>
                </div>

                <div style={styles.itemsList}>
                    {purchase.models?.map((model, index) => (
                        <motion.div 
                            key={model.id} 
                            style={styles.itemCard}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <div style={styles.itemIcon}>
                                    <HiOutlineCube />
                                </div>
                                <div style={styles.itemInfo}>
                                    <div style={styles.itemName}>{model.name}</div>
                                    <div style={styles.itemMeta}>
                                        <span style={styles.metaTag}>
                                            <FiBox /> {model.format}
                                        </span>
                                        <span style={styles.metaTag}>
                                            <FiDownload /> {model.size_mb} MB
                                        </span>
                                        <span style={styles.itemLicense}>
                                            {model.pivot?.license_type || 'Personal'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                marginTop: isMobile ? '1rem' : 0,
                                width: isMobile ? '100%' : 'auto',
                                justifyContent: isMobile ? 'space-between' : 'flex-end'
                            }}>
                                <span style={styles.itemPrice}>
                                    ${model.pivot?.unit_price || model.price}
                                </span>
                                {purchase.status === 'completed' && (
                                    <motion.button 
                                        style={styles.downloadBtn}
                                        whileHover={{ scale: 1.02, backgroundColor: colors.success, color: 'white' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleDownload(model.id, model.name)}
                                    >
                                        <FiDownload /> Descargar
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PurchaseDetail;