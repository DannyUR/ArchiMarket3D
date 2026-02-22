import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiFileText,
    FiCalendar,
    FiCheckCircle,
    FiXCircle,
    FiClock,
    FiDownload,
    FiEye,
    FiInfo
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { colors } from '../../styles/theme';

const Licenses = () => {
    const navigate = useNavigate();
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        active: 0,
        expired: 0,
        total: 0
    });

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        try {
            const response = await API.get('/my-licenses');
            console.log('Respuesta completa:', response.data);

            // ✅ ESTRUCTURA CORRECTA
            // response.data.data.licenses es el array que necesitas
            const userLicenses = response.data?.data?.licenses || [];

            console.log('Licencias extraídas:', userLicenses);

            setLicenses(userLicenses);

            // Calcular estadísticas
            const active = userLicenses.filter(l => l.is_active && !l.is_expired).length;
            const expired = userLicenses.filter(l => l.is_expired).length;

            setStats({
                active,
                expired,
                total: userLicenses.length
            });

        } catch (error) {
            console.error('Error cargando licencias:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLicenseTypeLabel = (type) => {
        const labels = {
            personal: 'Personal',
            business: 'Empresarial',
            unlimited: 'Ilimitada'
        };
        return labels[type] || type;
    };

    const getLicenseTypeColor = (type) => {
        const colors = {
            personal: '#3b82f6',
            business: '#8b5cf6',
            unlimited: '#10b981'
        };
        return colors[type] || '#64748b';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Sin expiración';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
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
            fontSize: '1.5rem',
            color: colors.primary,
            marginBottom: '1rem'
        },
        statValue: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        licensesGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
        },
        licenseCard: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            overflow: 'hidden',
            border: '1px solid #e2e8f0',
            transition: 'all 0.3s',
            cursor: 'pointer'
        },
        cardHeader: {
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        cardIcon: {
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem'
        },
        cardTitle: {
            flex: 1
        },
        modelName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        licenseType: {
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500',
            color: 'white'
        },
        cardBody: {
            padding: '1.5rem'
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            fontSize: '0.95rem'
        },
        infoLabel: {
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        infoValue: {
            fontWeight: '500',
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
        cardFooter: {
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end'
        },
        viewBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.95rem',
            fontWeight: '500',
            cursor: 'pointer'
        },
        emptyState: {
            textAlign: 'center',
            padding: '4rem',
            backgroundColor: '#f8fafc',
            borderRadius: '15px',
            color: '#64748b',
            gridColumn: '1 / -1'
        },
        emptyIcon: {
            fontSize: '3rem',
            color: colors.primary + '40',
            marginBottom: '1rem'
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary,
            fontSize: '1.1rem'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    Cargando tus licencias...
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FiFileText /> Mis Licencias
                </h1>
                <p style={styles.subtitle}>
                    Gestiona todas las licencias de tus modelos adquiridos
                </p>
            </div>

            {/* Estadísticas */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <FiCheckCircle style={{ ...styles.statIcon, color: colors.success }} />
                    <div style={styles.statValue}>{stats.active}</div>
                    <div style={styles.statLabel}>Licencias activas</div>
                </div>
                <div style={styles.statCard}>
                    <FiXCircle style={{ ...styles.statIcon, color: colors.danger }} />
                    <div style={styles.statValue}>{stats.expired}</div>
                    <div style={styles.statLabel}>Licencias expiradas</div>
                </div>
                <div style={styles.statCard}>
                    <FiFileText style={{ ...styles.statIcon, color: colors.primary }} />
                    <div style={styles.statValue}>{stats.total}</div>
                    <div style={styles.statLabel}>Total de licencias</div>
                </div>
            </div>

            {/* Lista de licencias */}
            {licenses.length === 0 ? (
                <div style={styles.emptyState}>
                    <FiFileText style={styles.emptyIcon} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        No tienes licencias aún
                    </h3>
                    <p style={{ color: '#94a3b8' }}>
                        Realiza tu primera compra para obtener licencias de modelos
                    </p>
                </div>
            ) : (
                <div style={styles.licensesGrid}>
                    {licenses.map((license, index) => (
                        <motion.div
                            key={license.id}
                            style={styles.licenseCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                            onClick={() => navigate(`/models/${license.model.id}`)}
                        >
                            <div style={styles.cardHeader}>
                                <div style={{
                                    ...styles.cardIcon,
                                    backgroundColor: getLicenseTypeColor(license.license_type) + '20',
                                    color: getLicenseTypeColor(license.license_type)
                                }}>
                                    <HiOutlineCube />
                                </div>
                                <div style={styles.cardTitle}>
                                    <div style={styles.modelName}>{license.model.name}</div>
                                    <span style={{
                                        ...styles.licenseType,
                                        backgroundColor: getLicenseTypeColor(license.license_type)
                                    }}>
                                        {getLicenseTypeLabel(license.license_type)}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>
                                        <FiCalendar /> Fecha de compra
                                    </span>
                                    <span style={styles.infoValue}>
                                        {new Date(license.purchase_date).toLocaleDateString()}
                                    </span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>
                                        <FiClock /> Expiración
                                    </span>
                                    <span style={styles.infoValue}>
                                        {formatDate(license.expires_at)}
                                    </span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>
                                        Precio pagado
                                    </span>
                                    <span style={styles.infoValue}>
                                        ${license.price_paid}
                                    </span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>
                                        Estado
                                    </span>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: license.is_active && !license.is_expired
                                            ? colors.success + '10'
                                            : colors.danger + '10',
                                        color: license.is_active && !license.is_expired
                                            ? colors.success
                                            : colors.danger
                                    }}>
                                        {license.is_active && !license.is_expired ? (
                                            <><FiCheckCircle /> Activa</>
                                        ) : (
                                            <><FiXCircle /> Expirada</>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.cardFooter}>
                                <button
                                    style={styles.viewBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/models/${license.model.id}`);
                                    }}
                                >
                                    <FiEye /> Ver modelo
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Licenses;