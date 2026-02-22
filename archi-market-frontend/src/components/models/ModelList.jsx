import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import API from '../../services/api';
import { colors } from '../../styles/theme';

const ModelList = () => {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('grid');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await API.get('/models');
            console.log('API Response:', response.data);
            
            // La API devuelve: { success: true, data: { data: [], current_page: 1, ... } }
            if (response.data?.success && response.data?.data) {
                setModels(response.data.data.data || []);
                setPagination({
                    current_page: response.data.data.current_page || 1,
                    last_page: response.data.data.last_page || 1,
                    total: response.data.data.total || 0
                });
            } else {
                setModels([]);
            }
        } catch (error) {
            console.error('Error cargando modelos:', error);
            setModels([]);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '2rem'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '600',
            color: colors.dark
        },
        searchBar: {
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem'
        },
        searchInput: {
            flex: 1,
            padding: '0.75rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '8px',
            fontSize: '1rem'
        },
        viewToggle: {
            display: 'flex',
            gap: '0.5rem'
        },
        viewButton: {
            padding: '0.5rem',
            border: `2px solid #e2e8f0`,
            borderRadius: '8px',
            background: colors.white,
            cursor: 'pointer'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem'
        },
        card: {
            backgroundColor: colors.white,
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.3s',
            cursor: 'pointer'
        },
        cardImage: {
            height: '200px',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary
        },
        cardContent: {
            padding: '1.5rem'
        },
        cardTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem'
        },
        cardMeta: {
            display: 'flex',
            justifyContent: 'space-between',
            color: '#64748b',
            fontSize: '0.9rem',
            marginBottom: '1rem'
        },
        cardPrice: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: colors.primary
        },
        loading: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary,
            fontSize: '1.2rem'
        },
        emptyState: {
            textAlign: 'center',
            padding: '3rem',
            color: '#64748b',
            fontSize: '1.2rem'
        }
    };

    if (loading) {
        return <div style={styles.loading}>Cargando modelos...</div>;
    }

    if (!models || models.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    No hay modelos disponibles
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Modelos 3D</h1>
                <div style={styles.viewToggle}>
                    <button 
                        style={styles.viewButton}
                        onClick={() => setView('grid')}
                    >
                        <FiGrid />
                    </button>
                    <button 
                        style={styles.viewButton}
                        onClick={() => setView('list')}
                    >
                        <FiList />
                    </button>
                </div>
            </div>

            <div style={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Buscar modelos..."
                    style={styles.searchInput}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <button style={styles.viewButton}>
                    <FiSearch />
                </button>
            </div>

            <div style={view === 'grid' ? styles.grid : {}}>
                {models.map((model) => (
                    <motion.div
                        key={model.id}
                        style={styles.card}
                        whileHover={{ y: -5 }}
                        onClick={() => window.location.href = `/models/${model.id}`}
                    >
                        <div style={styles.cardImage}>
                            Vista previa
                        </div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>{model.name}</h3>
                            <div style={styles.cardMeta}>
                                <span>{model.format}</span>
                                <span>{model.size_mb} MB</span>
                            </div>
                            <div style={styles.cardPrice}>
                                ${model.price}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Paginación */}
            {pagination.last_page > 1 && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    Página {pagination.current_page} de {pagination.last_page}
                </div>
            )}
        </div>
    );
};

export default ModelList;