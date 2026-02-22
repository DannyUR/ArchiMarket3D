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
    FiHardDrive
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import API from '../../services/api';
import { colors } from '../../styles/theme';

const Downloads = () => {
    const navigate = useNavigate();
    const [downloads, setDownloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('recent'); // recent, name, size
    const [selectedFormat, setSelectedFormat] = useState('all');

    useEffect(() => {
        fetchDownloads();
    }, []);

    const fetchDownloads = async () => {
        try {
            // Primero obtenemos las compras del usuario
            const purchasesResponse = await API.get('/purchases');
            const purchases = purchasesResponse.data?.data?.data || [];
            
            // Extraemos todos los modelos de las compras
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
                            last_downloaded: model.last_downloaded || null
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

    const handleDownload = async (modelId, modelName, format) => {
        try {
            // Buscar el archivo de descarga del modelo
            const modelResponse = await API.get(`/models/${modelId}`);
            const modelFiles = modelResponse.data?.data?.model?.files || [];
            const downloadFile = modelFiles.find(f => f.file_type === 'download');
            
            if (!downloadFile) {
                alert('No hay archivo disponible para descargar');
                return;
            }

            // Descargar el archivo
            const response = await API.get(`/download/${downloadFile.id}`, {
                responseType: 'blob'
            });
            
            // Crear link de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${modelName}.${format.toLowerCase()}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Actualizar contador de descargas (opcional)
            setDownloads(prev => prev.map(d => 
                d.id === modelId 
                    ? { ...d, download_count: (d.download_count || 0) + 1, last_downloaded: new Date().toISOString() }
                    : d
            ));

        } catch (error) {
            console.error('Error descargando archivo:', error);
            alert('Error al descargar el archivo');
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
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFormatIcon = (format) => {
        switch(format?.toLowerCase()) {
            case 'obj':
                return <FiArchive />;
            case 'fbx':
                return <FiPackage />;
            case 'gltf':
            case 'glb':
                return <HiOutlineCube />;
            default:
                return <FiHardDrive />;
        }
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
            outline: 'none',
            minWidth: '150px'
        },
        statsCard: {
            backgroundColor: colors.white,
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            border: '1px solid #e2e8f0',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem'
        },
        statItem: {
            textAlign: 'center'
        },
        statValue: {
            fontSize: '1.8rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        downloadsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
        },
        downloadCard: {
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
            backgroundColor: colors.primary + '10',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
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
        modelFormat: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            color: '#64748b'
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
        licenseBadge: {
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            backgroundColor: colors.primary + '10',
            color: colors.primary,
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '500'
        },
        cardFooter: {
            padding: '1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        downloadBtn: {
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
        downloadCount: {
            fontSize: '0.9rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
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
                    Cargando tus descargas...
                </div>
            </div>
        );
    }

    const totalDownloads = downloads.length;
    const totalSize = downloads.reduce((acc, d) => acc + (d.size_mb || 0), 0).toFixed(0);
    const uniqueFormats = [...new Set(downloads.map(d => d.format))].length;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <FiDownload /> Mis Descargas
                </h1>
                <p style={styles.subtitle}>
                    Todos los modelos que has adquirido, listos para descargar
                </p>
            </div>

            {/* Stats */}
            <div style={styles.statsCard}>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{totalDownloads}</div>
                    <div style={styles.statLabel}>Modelos disponibles</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{totalSize} MB</div>
                    <div style={styles.statLabel}>Espacio total</div>
                </div>
                <div style={styles.statItem}>
                    <div style={styles.statValue}>{uniqueFormats}</div>
                    <div style={styles.statLabel}>Formatos diferentes</div>
                </div>
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
                
                <div style={{ display: 'flex', gap: '1rem' }}>
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
                <div style={styles.emptyState}>
                    <FiPackage style={styles.emptyIcon} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                        No hay modelos para descargar
                    </h3>
                    <p style={{ color: '#94a3b8' }}>
                        {searchTerm || selectedFormat !== 'all' 
                            ? 'Intenta con otros filtros' 
                            : 'Realiza tu primera compra para comenzar a descargar'}
                    </p>
                </div>
            ) : (
                <div style={styles.downloadsGrid}>
                    {filteredDownloads.map((download, index) => (
                        <motion.div
                            key={`${download.id}-${index}`}
                            style={styles.downloadCard}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                        >
                            <div style={styles.cardHeader}>
                                <div style={styles.cardIcon}>
                                    {getFormatIcon(download.format)}
                                </div>
                                <div style={styles.cardTitle}>
                                    <div style={styles.modelName}>{download.name}</div>
                                    <div style={styles.modelFormat}>
                                        <span>{download.format}</span>
                                        <span>•</span>
                                        <span>{download.size_mb} MB</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.cardBody}>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>
                                        <FiCalendar /> Comprado
                                    </span>
                                    <span style={styles.infoValue}>
                                        {formatDate(download.purchase_date)}
                                    </span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>
                                        <FiPackage /> Licencia
                                    </span>
                                    <span style={styles.licenseBadge}>
                                        {download.license_type}
                                    </span>
                                </div>
                                {download.last_downloaded && (
                                    <div style={styles.infoRow}>
                                        <span style={styles.infoLabel}>
                                            <FiClock /> Última descarga
                                        </span>
                                        <span style={styles.infoValue}>
                                            {formatDate(download.last_downloaded)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={styles.cardFooter}>
                                <div style={styles.downloadCount}>
                                    <FiDownload />
                                    {download.download_count || 0} descargas
                                </div>
                                <button 
                                    style={styles.downloadBtn}
                                    onClick={() => handleDownload(download.id, download.name, download.format)}
                                >
                                    <FiDownload /> Descargar
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Downloads;