import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDownload,
    FiPackage,
    FiCalendar,
    FiClock,
    FiSearch,
    FiFilter,
    FiChevronDown,
    FiEye,
    FiArchive,
    FiHardDrive,
    FiBox,
    FiTrendingUp,
    FiX,
    FiCheckCircle
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { colors } from '../../styles/theme';
import DownloadModal from '../models/DownloadModal';

const Downloads = () => {
    const navigate = useNavigate();
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent');
    const [selectedFormat, setSelectedFormat] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedDownloadModel, setSelectedDownloadModel] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);

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
        fetchDownloads();
    }, []);

    const fetchDownloads = async () => {
        try {
            const purchasesResponse = await API.get('/purchases');
            const purchases = purchasesResponse.data?.data?.data || [];

            const allDownloads = [];
            purchases.forEach(purchase => {
                if (purchase.models && purchase.status === 'completed') {
                    purchase.models.forEach(model => {
                        allDownloads.push({
                            id: model.id,
                            name: model.name,
                            format: model.format,
                            size_mb: model.size_mb,
                            license_type: model.pivot?.license_type || 'Personal',
                            purchase_date: purchase.purchase_date,
                            purchase_id: purchase.id,
                            download_count: model.download_count || 0,
                            last_downloaded: model.last_downloaded || null,
                            preview_image: model.preview_image || null
                        });
                    });
                }
            });

            setDownloads(allDownloads);
        } catch (error) {
            console.error('Error cargando descargas:', error);
        } finally {
            setLoading(false);
        }
    };

    // En la función handleDownload, antes de abrir el modal
    const handleDownload = async (modelId, modelName, format) => {
        try {
            console.log(`📥 Obteniendo formatos disponibles para modelo ${modelId}...`);
            
            // Usar el nuevo endpoint para obtener formatos
            const formatsResponse = await API.get(`/models/${modelId}/formats`);
            const availableFormats = formatsResponse.data?.data || [];

            console.log('📦 Formatos disponibles:', availableFormats);

            if (availableFormats.length === 0) {
                alert('Este modelo no tiene archivos disponibles para descargar. Por favor contacte al administrador.');
                return;
            }

            const downloadModel = downloads.find(d => d.id === modelId);
            if (downloadModel) {
                setSelectedDownloadModel({
                    ...downloadModel,
                    availableFormats
                });
                setShowDownloadModal(true);
            }
        } catch (error) {
            console.error('Error obteniendo formatos:', error);
            alert('Error al cargar las opciones de descarga');
        }
    };

    // Función auxiliar para realizar la descarga
    const performDownload = async (downloadFile, selectedFormat) => {
        try {
            console.log('✅ Archivo encontrado:', downloadFile);

            // Descargar el archivo
            const response = await API.get(`/download/${downloadFile.id}`, {
                responseType: 'blob'
            });

            console.log('📥 Archivo descargado, tamaño:', response.data.size);

            if (!response.data || response.data.size === 0) {
                alert('Error: El archivo está vacío. Por favor intenta de nuevo.');
                return false;
            }

            // Crear blob y descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generar nombre del archivo
            const fileName = selectedDownloadModel.name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);

            // Obtener extensión de la URL del archivo
            const urlParts = downloadFile.file_url?.split('.') || [];
            const extension = urlParts[urlParts.length - 1] || selectedFormat.toLowerCase();

            link.setAttribute('download', `${fileName}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // Actualizar contador de descargas
            setDownloads(prev => prev.map(d =>
                d.id === selectedDownloadModel.id
                    ? { ...d, download_count: (d.download_count || 0) + 1, last_downloaded: new Date().toISOString() }
                    : d
            ));

            console.log(`✅ Descarga completada: ${fileName}.${extension}`);
            return true;

        } catch (error) {
            console.error('❌ Error en descarga:', error);
            throw error;
        }
    };

    const handleDownloadWithFormat = async (selectedFormat) => {
        if (!selectedDownloadModel) return;

        try {
            setIsDownloading(true);

            console.log(`📥 Iniciando descarga del formato: ${selectedFormat}`);

            // Usar el nuevo endpoint con selección de formato
            const downloadUrl = `/models/${selectedDownloadModel.id}/download?format=${selectedFormat}`;
            
            const response = await API.get(downloadUrl, {
                responseType: 'blob'
            });

            console.log('✅ Archivo descargado, tamaño:', response.data.size);

            if (!response.data || response.data.size === 0) {
                alert('Error: El archivo está vacío. Por favor intenta de nuevo.');
                setIsDownloading(false);
                return;
            }

            // Crear blob y descargar
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Generar nombre del archivo
            const fileName = selectedDownloadModel.name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
            const extension = selectedFormat.toLowerCase();

            link.setAttribute('download', `${fileName}.${extension}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // Actualizar contador de descargas
            setDownloads(prev => prev.map(d =>
                d.id === selectedDownloadModel.id
                    ? { ...d, download_count: (d.download_count || 0) + 1, last_downloaded: new Date().toISOString() }
                    : d
            ));

            console.log(`✅ Descarga completada: ${fileName}.${extension}`);

            // Cerrar modal
            setShowDownloadModal(false);
            setSelectedDownloadModel(null);

        } catch (error) {
            console.error('❌ Error descargando archivo:', error);

            if (error.response?.status === 403) {
                alert('No tienes permiso para descargar este modelo. Asegúrate de haberlo comprado.');
            } else if (error.response?.status === 401) {
                alert('Por favor inicia sesión para descargar.');
                navigate('/login');
            } else if (error.response?.status === 404) {
                alert('El formato seleccionado no está disponible para este modelo. Por favor, contacta al administrador.');
            } else {
                alert('Error al descargar el archivo. Por favor intenta de nuevo.');
            }
        } finally {
            setIsDownloading(false);
        }
    };

    const filteredDownloads = downloads
        .filter(download => {
            const matchesSearch = download.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFormat = selectedFormat === 'all' || download.format === selectedFormat;
            return matchesSearch && matchesFormat;
        })
        .sort((a, b) => {
            if (sortBy === 'recent') {
                return new Date(b.purchase_date) - new Date(a.purchase_date);
            } else if (sortBy === 'name') {
                return a.name.localeCompare(b.name);
            } else if (sortBy === 'size') {
                return b.size_mb - a.size_mb;
            }
            return 0;
        });

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFormatIcon = (format) => {
        const iconProps = { size: isMobile ? 20 : 24 };
        switch (format?.toLowerCase()) {
            case 'obj':
                return <FiArchive {...iconProps} />;
            case 'fbx':
                return <FiPackage {...iconProps} />;
            case 'gltf':
            case 'glb':
                return <HiOutlineCube {...iconProps} />;
            default:
                return <FiHardDrive {...iconProps} />;
        }
    };

    const getFormatColor = (format) => {
        switch (format?.toLowerCase()) {
            case 'obj': return '#3b82f6';
            case 'fbx': return '#8b5cf6';
            case 'gltf':
            case 'glb': return '#10b981';
            default: return '#64748b';
        }
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
        title: {
            fontSize: isMobile ? '2rem' : '2.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
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
        // Stats cards
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? '1rem' : '1.5rem',
            marginBottom: '2rem'
        },
        statCard: {
            backgroundColor: colors.white,
            borderRadius: '24px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)',
            border: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
        },
        statIcon: {
            width: isMobile ? '50px' : '60px',
            height: isMobile ? '50px' : '60px',
            borderRadius: '20px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: isMobile ? '1.5rem' : '2rem'
        },
        statContent: {
            flex: 1
        },
        statValue: {
            fontSize: isMobile ? '1.8rem' : '2.2rem',
            fontWeight: '700',
            color: colors.dark,
            lineHeight: '1.2',
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            color: '#64748b'
        },
        // Filtros
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
        filterGroup: {
            display: 'flex',
            gap: '0.8rem',
            flexWrap: 'wrap'
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
            minWidth: isMobile ? '150px' : '180px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 1rem center',
            backgroundSize: '16px'
        },
        filterBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.8rem 1.2rem' : '1rem 1.5rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '20px',
            backgroundColor: colors.white,
            color: colors.dark,
            cursor: 'pointer',
            fontSize: isMobile ? '0.95rem' : '1rem',
            transition: 'all 0.2s'
        },
        // Grid de descargas
        downloadsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: isMobile ? '1rem' : '1.5rem'
        },
        downloadCard: {
            backgroundColor: colors.white,
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid #f0f0f0',
            transition: 'all 0.3s',
            cursor: 'pointer',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
        },
        cardHeader: {
            padding: isMobile ? '1.2rem' : '1.5rem',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        cardIcon: {
            width: isMobile ? '60px' : '70px',
            height: isMobile ? '60px' : '70px',
            backgroundColor: (format) => `${getFormatColor(format)}10`,
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: (format) => getFormatColor(format),
            fontSize: isMobile ? '1.8rem' : '2rem'
        },
        cardTitle: {
            flex: 1
        },
        modelName: {
            fontSize: isMobile ? '1.1rem' : '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem',
            lineHeight: '1.4'
        },
        modelFormat: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: isMobile ? '0.85rem' : '0.9rem',
            color: '#64748b'
        },
        formatBadge: {
            padding: '0.2rem 0.8rem',
            backgroundColor: (format) => `${getFormatColor(format)}10`,
            color: (format) => getFormatColor(format),
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600'
        },
        cardBody: {
            padding: isMobile ? '1.2rem' : '1.5rem'
        },
        infoGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '1rem'
        },
        infoItem: {
            backgroundColor: '#f8fafc',
            padding: '0.8rem',
            borderRadius: '16px'
        },
        infoLabel: {
            fontSize: '0.75rem',
            color: '#64748b',
            marginBottom: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem'
        },
        infoValue: {
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            fontWeight: '600',
            color: colors.dark
        },
        licenseBadge: {
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '600',
            marginTop: '0.25rem'
        },
        cardFooter: {
            padding: isMobile ? '1.2rem' : '1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        downloadBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '0.8rem 1.2rem' : '1rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '30px',
            fontSize: isMobile ? '0.9rem' : '0.95rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: `0 8px 20px ${colors.primary}30`
        },
        downloadCount: {
            fontSize: '0.85rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'white',
            padding: '0.4rem 1rem',
            borderRadius: '30px'
        },
        emptyState: {
            textAlign: 'center',
            padding: isMobile ? '4rem 1.5rem' : '5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '32px',
            color: '#64748b',
            gridColumn: '1 / -1',
            border: '1px solid #f0f0f0'
        },
        emptyIcon: {
            fontSize: '4rem',
            color: colors.primary + '40',
            marginBottom: '1rem'
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
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={styles.spinner} />
                    <p style={{ color: colors.primary, fontSize: '1.1rem' }}>Cargando tus descargas...</p>
                </div>
            </div>
        );
    }

    const totalDownloads = downloads.length;
    const totalSize = downloads.reduce((acc, d) => acc + (d.size_mb || 0), 0).toFixed(0);
    const uniqueFormats = [...new Set(downloads.map(d => d.format))].length;

    return (
        <div style={styles.container}>
            {/* Header */}
            <motion.div
                style={styles.header}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 style={styles.title}>
                    <FiDownload style={styles.titleIcon} />
                    Mis Descargas
                </h1>
                <p style={styles.subtitle}>
                    Todos los modelos que has adquirido, listos para descargar cuando los necesites
                </p>
            </motion.div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                {[
                    { icon: <FiPackage />, value: totalDownloads, label: 'Modelos disponibles' },
                    { icon: <FiHardDrive />, value: `${totalSize} MB`, label: 'Espacio total' },
                    { icon: <FiBox />, value: uniqueFormats, label: 'Formatos diferentes' }
                ].map((stat, index) => (
                    <motion.div
                        key={index}
                        style={styles.statCard}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}
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
                        placeholder="Buscar modelos..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={styles.filterGroup}>
                    <select
                        style={styles.filterSelect}
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="recent">Más recientes</option>
                        <option value="name">Por nombre</option>
                        <option value="size">Por tamaño</option>
                    </select>

                    <select
                        style={styles.filterSelect}
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                    >
                        <option value="all">Todos los formatos</option>
                        {[...new Set(downloads.map(d => d.format))].map(format => (
                            <option key={format} value={format}>{format}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid de descargas */}
            {filteredDownloads.length === 0 ? (
                <motion.div
                    style={styles.emptyState}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FiPackage style={styles.emptyIcon} />
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: colors.dark }}>
                        No hay modelos para descargar
                    </h3>
                    <p style={{ color: '#94a3b8', maxWidth: '400px', margin: '0 auto' }}>
                        {searchTerm || selectedFormat !== 'all'
                            ? 'Intenta con otros filtros de búsqueda'
                            : 'Realiza tu primera compra para comenzar a descargar modelos'}
                    </p>
                </motion.div>
            ) : (
                <div style={styles.downloadsGrid}>
                    {filteredDownloads.map((download, index) => (
                        <motion.div
                            key={`${download.id}-${index}`}
                            style={styles.downloadCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                            onClick={() => navigate(`/models/${download.id}`)}
                        >
                            <div style={styles.cardHeader}>
                                <div style={{
                                    ...styles.cardIcon,
                                    backgroundColor: `${getFormatColor(download.format)}10`,
                                    color: getFormatColor(download.format)
                                }}>
                                    {getFormatIcon(download.format)}
                                </div>
                                <div style={styles.cardTitle}>
                                    <div style={styles.modelName}>{download.name}</div>
                                    <div style={styles.modelFormat}>
                                        <span style={{
                                            ...styles.formatBadge,
                                            backgroundColor: `${getFormatColor(download.format)}10`,
                                            color: getFormatColor(download.format)
                                        }}>
                                            {download.format}
                                        </span>
                                        <span>•</span>
                                        <span>{download.size_mb} MB</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.infoGrid}>
                                    <div style={styles.infoItem}>
                                        <div style={styles.infoLabel}>
                                            <FiCalendar /> Fecha de compra
                                        </div>
                                        <div style={styles.infoValue}>
                                            {formatDate(download.purchase_date)}
                                        </div>
                                    </div>
                                    <div style={styles.infoItem}>
                                        <div style={styles.infoLabel}>
                                            <FiPackage /> Licencia
                                        </div>
                                        <div style={styles.infoValue}>
                                            <span style={styles.licenseBadge}>
                                                {download.license_type}
                                            </span>
                                        </div>
                                    </div>
                                    {download.last_downloaded && (
                                        <div style={styles.infoItem}>
                                            <div style={styles.infoLabel}>
                                                <FiClock /> Última descarga
                                            </div>
                                            <div style={styles.infoValue}>
                                                {formatDate(download.last_downloaded)}
                                            </div>
                                        </div>
                                    )}
                                    <div style={styles.infoItem}>
                                        <div style={styles.infoLabel}>
                                            <FiDownload /> Total descargas
                                        </div>
                                        <div style={styles.infoValue}>
                                            {download.download_count || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.cardFooter}>
                                <div style={styles.downloadCount}>
                                    <FiDownload /> {download.download_count || 0}
                                </div>
                                <motion.button
                                    style={styles.downloadBtn}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDownload(download.id, download.name, download.format);
                                    }}
                                >
                                    <FiDownload /> Descargar
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>

            {/* Download Modal */}
            <DownloadModal
                isOpen={showDownloadModal}
                onClose={() => {
                    setShowDownloadModal(false);
                    setSelectedDownloadModel(null);
                }}
                model={selectedDownloadModel}
                onDownload={handleDownloadWithFormat}
                isDownloading={isDownloading}
                availableFormats={selectedDownloadModel?.availableFormats || []}
            />
        </div>
    );
};

export default Downloads;