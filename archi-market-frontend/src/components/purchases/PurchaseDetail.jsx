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
    FiFileText
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

    const handleDownload = async (fileId, modelName) => {
        try {
            const response = await API.get(`/download/${fileId}`, {
                responseType: 'blob'
            });
            
            // Crear link de descarga
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

    const styles = {
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '2rem'
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: colors.primary,
            cursor: 'pointer',
            marginBottom: '2rem',
            fontSize: '0.95rem',
            border: 'none',
            background: 'none'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.dark
        },
        status: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            fontSize: '0.95rem',
            fontWeight: '500'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            marginBottom: '2rem'
        },
        card: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        cardTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #e2e8f0'
        },
        infoLabel: {
            color: '#64748b',
            fontSize: '0.95rem'
        },
        infoValue: {
            fontWeight: '500',
            color: colors.dark
        },
        totalAmount: {
            fontSize: '2rem',
            fontWeight: '700',
            color: colors.primary,
            textAlign: 'center',
            margin: '1rem 0'
        },
        itemsSection: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            padding: '1.5rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
            border: '1px solid #e2e8f0'
        },
        itemsList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        },
        itemCard: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '10px',
            border: '1px solid #e2e8f0'
        },
        itemInfo: {
            flex: 1
        },
        itemName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        itemDetails: {
            display: 'flex',
            gap: '1rem',
            fontSize: '0.9rem',
            color: '#64748b'
        },
        itemLicense: {
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            padding: '0.2rem 0.5rem',
            borderRadius: '12px',
            fontSize: '0.8rem'
        },
        itemPrice: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.primary,
            marginRight: '1rem'
        },
        downloadBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            backgroundColor: colors.success + '10',
            color: colors.success,
            border: `1px solid ${colors.success}20`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500'
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary,
            fontSize: '1.1rem'
        },
        errorState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.danger,
            fontSize: '1.1rem'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    Cargando detalle de compra...
                </div>
            </div>
        );
    }

    if (error || !purchase) {
        return (
            <div style={styles.container}>
                <div style={styles.errorState}>
                    {error || 'Compra no encontrada'}
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <button 
                style={styles.backButton}
                onClick={() => navigate('/purchases')}
            >
                <FiArrowLeft /> Volver a mis compras
            </button>

            <div style={styles.header}>
                <h1 style={styles.title}>
                    Detalle de Compra #{purchase.id}
                </h1>
                <div style={{
                    ...styles.status,
                    backgroundColor: getStatusColor(purchase.status) + '10',
                    color: getStatusColor(purchase.status)
                }}>
                    {getStatusIcon(purchase.status)}
                    {getStatusText(purchase.status)}
                </div>
            </div>

            <div style={styles.grid}>
                <div style={styles.card}>
                    <div style={styles.cardTitle}>
                        <FiCalendar /> Información de compra
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Fecha:</span>
                        <span style={styles.infoValue}>
                            {formatDate(purchase.purchase_date)}
                        </span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Método de pago:</span>
                        <span style={styles.infoValue}>
                            {purchase.payment_provider || 'Demo'}
                        </span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>ID de transacción:</span>
                        <span style={styles.infoValue}>
                            {purchase.payment_id || 'N/A'}
                        </span>
                    </div>
                </div>

                <div style={styles.card}>
                    <div style={styles.cardTitle}>
                        <FiDollarSign /> Resumen de pago
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Subtotal:</span>
                        <span style={styles.infoValue}>
                            ${purchase.total}
                        </span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.infoLabel}>Impuestos (16%):</span>
                        <span style={styles.infoValue}>
                            ${(purchase.total * 0.16).toFixed(2)}
                        </span>
                    </div>
                    <div style={styles.totalAmount}>
                        ${(purchase.total * 1.16).toFixed(2)}
                    </div>
                    <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                        Total pagado
                    </div>
                </div>
            </div>

            <div style={styles.itemsSection}>
                <div style={styles.cardTitle}>
                    <FiPackage /> Modelos adquiridos
                </div>
                <div style={styles.itemsList}>
                    {purchase.models?.map((model) => (
                        <div key={model.id} style={styles.itemCard}>
                            <div style={styles.itemInfo}>
                                <div style={styles.itemName}>{model.name}</div>
                                <div style={styles.itemDetails}>
                                    <span>Formato: {model.format}</span>
                                    <span>Tamaño: {model.size_mb} MB</span>
                                    <span style={styles.itemLicense}>
                                        {model.pivot?.license_type || 'Personal'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={styles.itemPrice}>
                                    ${model.pivot?.unit_price || model.price}
                                </span>
                                {purchase.status === 'completed' && (
                                    <button 
                                        style={styles.downloadBtn}
                                        onClick={() => handleDownload(model.id, model.name)}
                                    >
                                        <FiDownload /> Descargar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PurchaseDetail;