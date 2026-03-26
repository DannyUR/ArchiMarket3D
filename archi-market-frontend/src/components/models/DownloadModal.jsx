import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDownload,
    FiX,
    FiCheckCircle,
    FiAlertCircle,
    FiArchive,
    FiPackage,
    FiHardDrive
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';

const DownloadModal = ({ isOpen, onClose, model, onDownload, isDownloading, availableFormats = [] }) => {
    const [selectedFormat, setSelectedFormat] = useState(null);

    // Cuando se abre el modal, seleccionar el primer formato disponible
    useEffect(() => {
        if (isOpen && availableFormats.length > 0) {
            setSelectedFormat(availableFormats[0].format);
        } else {
            setSelectedFormat(null);
        }
    }, [isOpen, availableFormats]);

    const getFormatIcon = (format) => {
        switch(format?.toLowerCase()) {
            case 'obj': return <FiArchive size={32} />;
            case 'fbx': return <FiPackage size={32} />;
            case 'gltf':
            case 'glb': return <HiOutlineCube size={32} />;
            case 'dwg':
            case 'dxf': return <FiHardDrive size={32} />;
            default: return <FiHardDrive size={32} />;
        }
    };

    const getFormatColor = (format) => {
        switch(format?.toLowerCase()) {
            case 'obj': return '#3b82f6';
            case 'fbx': return '#8b5cf6';
            case 'gltf':
            case 'glb': return '#10b981';
            case 'dwg':
            case 'dxf': return '#ef4444';
            default: return colors.primary;
        }
    };

    const handleDownload = async () => {
        if (!selectedFormat) {
            alert('Por favor selecciona un formato');
            return;
        }
        await onDownload(selectedFormat);
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.95,
            y: 20
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 20
        }
    };

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
        },
        modal: {
            background: 'white',
            borderRadius: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
            position: 'relative'
        },
        header: {
            padding: '2rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            transition: 'all 0.3s',
            ':hover': {
                color: colors.dark,
                background: '#f1f5f9'
            }
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        titleIcon: {
            color: colors.primary,
            fontSize: '1.8rem'
        },
        content: {
            padding: '2rem'
        },
        modelInfo: {
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
        },
        modelName: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        modelMeta: {
            fontSize: '0.9rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        formatsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
        },
        formatCard: {
            padding: '1.5rem',
            border: '2px solid #e2e8f0',
            borderRadius: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.75rem',
            textAlign: 'center',
            position: 'relative'
        },
        formatCardSelected: {
            borderColor: colors.primary,
            background: colors.primary + '08',
            boxShadow: `0 0 0 1px ${colors.primary}20`
        },
        formatIcon: {
            fontSize: '2rem'
        },
        formatLabel: {
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.dark
        },
        formatSize: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        infoBox: {
            display: 'flex',
            gap: '0.75rem',
            padding: '1rem',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '12px',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            color: '#92400e'
        },
        footer: {
            padding: '2rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
        },
        cancelButton: {
            padding: '0.75rem 1.5rem',
            border: `1px solid #e2e8f0`,
            borderRadius: '12px',
            background: 'white',
            color: colors.dark,
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        downloadButton: {
            padding: '0.75rem 2rem',
            border: 'none',
            borderRadius: '12px',
            background: colors.primary,
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s',
            opacity: !selectedFormat || isDownloading ? 0.5 : 1,
            pointerEvents: !selectedFormat || isDownloading ? 'none' : 'auto'
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    style={styles.overlay}
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        style={styles.modal}
                        variants={modalVariants}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={styles.header}>
                            <div style={styles.title}>
                                <span style={styles.titleIcon}>📥</span>
                                Descargar Modelo
                            </div>
                            <motion.button
                                style={styles.closeButton}
                                onClick={onClose}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FiX size={24} />
                            </motion.button>
                        </div>

                        {/* Content */}
                        <div style={styles.content}>
                            {/* Modelo info */}
                            {model && (
                                <div style={styles.modelInfo}>
                                    <div style={styles.modelName}>{model.name}</div>
                                    <div style={styles.modelMeta}>
                                        <span>📦 {model.format || 'Formato no especificado'}</span>
                                        <span>💾 {model.size_mb || 0} MB</span>
                                    </div>
                                </div>
                            )}

                            {/* Formatos disponibles */}
                            <h3 style={{ marginBottom: '1rem', color: colors.dark }}>
                                Formatos disponibles ({availableFormats.length})
                            </h3>

                            {availableFormats.length === 0 ? (
                                <div style={styles.infoBox}>
                                    <FiAlertCircle size={20} />
                                    <span>No hay formatos disponibles para descargar</span>
                                </div>
                            ) : (
                                <div style={styles.formatsGrid}>
                                    {availableFormats.map((format) => {
                                        const isSelected = selectedFormat === format.format;
                                        const color = getFormatColor(format.format);

                                        return (
                                            <motion.div
                                                key={format.format}
                                                style={{
                                                    ...styles.formatCard,
                                                    ...(isSelected ? styles.formatCardSelected : {}),
                                                    borderColor: isSelected ? color : undefined
                                                }}
                                                onClick={() => setSelectedFormat(format.format)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div style={{ color }}>
                                                    {getFormatIcon(format.format)}
                                                </div>
                                                <div style={styles.formatLabel}>{format.format}</div>
                                                <div style={styles.formatSize}>
                                                    {(format.size_bytes / 1024 / 1024).toFixed(2)} MB
                                                </div>
                                                {isSelected && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        color
                                                    }}>
                                                        <FiCheckCircle size={20} />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Info */}
                            <div style={styles.infoBox}>
                                <FiAlertCircle size={20} />
                                <span>
                                    Los archivos se descargarán en su formato original.
                                    Asegúrate de tener el software compatible.
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={styles.footer}>
                            <motion.button
                                style={styles.cancelButton}
                                onClick={onClose}
                                whileHover={{ backgroundColor: '#f1f5f9' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Cancelar
                            </motion.button>
                            <motion.button
                                style={styles.downloadButton}
                                onClick={handleDownload}
                                disabled={!selectedFormat || isDownloading}
                                whileHover={selectedFormat && !isDownloading ? { scale: 1.05 } : {}}
                                whileTap={selectedFormat && !isDownloading ? { scale: 0.98 } : {}}
                            >
                                <FiDownload size={18} />
                                {isDownloading ? 'Descargando...' : 'Descargar'}
                            </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DownloadModal;