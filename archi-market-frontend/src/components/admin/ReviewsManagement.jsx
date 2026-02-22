import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiStar,
    FiEdit,
    FiTrash2,
    FiSearch,
    FiFilter,
    FiEye,
    FiCheckCircle,
    FiXCircle,
    FiAlertCircle,
    FiMessageSquare,
    FiUser,
    FiCalendar,
    FiMail,
    FiThumbsUp,
    FiThumbsDown,
    FiFlag,
    FiMoreVertical,
    FiFileText,
    FiDownload,
    FiRefreshCw,
    FiInfo,
    FiX,
    FiAlertTriangle,
    FiClock,
    FiCheck,


} from 'react-icons/fi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const ReviewsManagement = () => {
    const { showSuccess, showError, showInfo } = useNotification();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedReview, setSelectedReview] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0,
        pendingModeration: 0
    });
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        fetchReviews();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterRating !== 'all') params.append('rating', filterRating);
            if (filterStatus !== 'all') params.append('status', filterStatus);
            if (searchTerm) params.append('search', searchTerm);

            const response = await API.get(`/admin/reviews?${params.toString()}`);
            console.log('📦 Respuesta completa:', response.data);

            let reviewsData = [];
            let statsData = {};

            if (response.data?.data?.reviews) {
                console.log('✅ Estructura 1: data.reviews');
                reviewsData = response.data.data.reviews.data || response.data.data.reviews;
                statsData = response.data.data.stats || {};
            }

            console.log('⭐ Reviews extraídos:', reviewsData);
            console.log('📊 Stats extraídos:', statsData);

            // ✅ MAPEAR LOS NOMBRES CORRECTAMENTE
            setReviews(reviewsData);
            setStats({
                totalReviews: statsData.total_reviews || 0,
                averageRating: statsData.average_rating || 0,
                pendingModeration: statsData.pending_moderation || 0,
                reported: statsData.reported || 0,
                ratingDistribution: statsData.rating_distribution || {
                    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
                }
            });

        } catch (error) {
            console.error('❌ Error cargando reseñas:', error);
            showError('Error al cargar las reseñas');
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const response = await API.post(`/admin/reviews/${id}/approve`);
            showSuccess('✅ Reseña aprobada');
            fetchReviews(); // Recargar la lista
        } catch (error) {
            console.error('Error aprobando:', error);
            showError('❌ Error al aprobar');
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await API.post(`/admin/reviews/${id}/reject`);
            showSuccess('✅ Reseña rechazada');
            fetchReviews();
        } catch (error) {
            console.error('Error rechazando:', error);
            showError('❌ Error al rechazar');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar esta reseña?')) {
            try {
                await API.delete(`/admin/reviews/${id}`);
                showSuccess('🗑️ Reseña eliminada');
                fetchReviews();
            } catch (error) {
                console.error('Error eliminando:', error);
                showError('❌ Error al eliminar');
            }
        }
    };

    const handleReply = async (id, replyText) => {
        try {
            console.log('Enviando respuesta:', { id, reply: replyText }); // Debug

            const response = await API.post(`/admin/reviews/${id}/reply`, {
                reply: replyText  // Asegúrate que el campo se llame 'reply'
            });

            showSuccess('✅ Respuesta enviada');
            setShowReplyModal(false);
            setReplyText('');
            fetchReviews();
        } catch (error) {
            console.error('Error al responder:', error);
            console.error('Detalles del error:', error.response?.data); // Ver qué dice el backend
            showError('❌ Error al enviar respuesta: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const submitReply = async () => {
        if (!replyText.trim()) {
            showInfo('Escribe una respuesta');
            return;
        }

        await handleReply(selectedReview.id, replyText);
    };

    const handleReport = async (id) => {
        try {
            const response = await API.post(`/admin/reviews/${id}/toggle-report`);
            showSuccess(response.data.message);
            fetchReviews();
        } catch (error) {
            console.error('Error al reportar:', error);
            showError('❌ Error al cambiar reporte');
        }
    };

    const getRatingStars = (rating) => {
        return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return colors.success;
            case 'pending': return colors.warning;
            case 'rejected': return colors.danger;
            default: return '#64748b';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'approved': return 'Aprobada';
            case 'pending': return 'Pendiente';
            case 'rejected': return 'Rechazada';
            default: return status;
        }
    };

    const filteredReviews = reviews.filter(review => {
        const matchesSearch = review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.model?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
        const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
        return matchesSearch && matchesRating && matchesStatus;
    });

    const styles = {
        container: {
            padding: isMobile ? '1rem' : '1.5rem',
            width: '100%'
        },
        header: {
            marginBottom: '2rem'
        },
        title: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        statCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`
        },
        statValue: {
            fontSize: '1.5rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        statLabel: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        ratingDistribution: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(5, 1fr)',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: `2px solid ${colors.primary}`
        },
        ratingItem: {
            textAlign: 'center',
            padding: '0.5rem',
            borderRadius: '8px',
            backgroundColor: '#f8fafc'
        },
        ratingNumber: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.warning,
            marginBottom: '0.25rem'
        },
        ratingCount: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        filtersBar: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        searchBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: `2px solid ${colors.primary}`,
            flex: 1
        },
        searchInput: {
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            width: '100%',
            fontSize: '0.95rem'
        },
        filterSelect: {
            padding: '0.5rem 2rem 0.5rem 1rem',
            backgroundColor: '#fff',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            outline: 'none',
            fontSize: '0.95rem',
            color: colors.dark,
            minWidth: isMobile ? '100%' : '140px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '16px'
        },
        cardsContainer: {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '1rem'
        },
        reviewCard: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1rem',
            border: `2px solid ${colors.primary}`,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        },
        cardHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1rem'
        },
        userInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
        },
        userAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1rem',
            fontWeight: '600'
        },
        userName: {
            fontWeight: '600',
            color: colors.dark
        },
        userEmail: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        rating: {
            fontSize: '1rem',
            color: colors.warning,
            marginBottom: '0.25rem'
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: '500'
        },
        cardContent: {
            marginBottom: '1rem'
        },
        modelName: {
            fontSize: '0.9rem',
            fontWeight: '500',
            color: colors.primary,
            marginBottom: '0.5rem'
        },
        comment: {
            fontSize: '0.95rem',
            color: colors.dark,
            lineHeight: '1.5',
            marginBottom: '0.5rem'
        },
        date: {
            fontSize: '0.8rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
        },
        replySection: {
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            borderLeft: `3px solid ${colors.primary}`
        },
        replyHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            color: colors.dark
        },
        replyText: {
            fontSize: '0.9rem',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        replyDate: {
            fontSize: '0.7rem',
            color: '#64748b'
        },
        cardActions: {
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
        },
        cardActionBtn: {
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#f8fafc',
            border: `2px solid ${colors.primary}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            color: colors.dark
        },
        tableContainer: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: `2px solid ${colors.primary}`,
            overflow: 'hidden',
            display: isMobile ? 'none' : 'block'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem'
        },
        th: {
            textAlign: 'left',
            padding: '1rem',
            borderBottom: '2px solid #e2e8f0',
            color: '#64748b',
            fontSize: '0.85rem',
            fontWeight: '600',
            backgroundColor: '#f8fafc',
            whiteSpace: 'nowrap'
        },
        td: {
            padding: '1rem',
            borderBottom: '1px solid #e2e8f0',
            color: colors.dark,
            whiteSpace: 'nowrap'
        },
        actionBtn: {
            padding: '0.4rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            borderRadius: '4px',
            fontSize: '1rem'
        },
        modalOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
        },
        modal: {
            backgroundColor: '#fff',
            borderRadius: '15px',
            padding: isMobile ? '1.5rem' : '2rem',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'auto'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        },
        modalTitle: {
            fontSize: '1.2rem',
            fontWeight: '600',
            color: colors.dark
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#64748b'
        },
        textarea: {
            width: '100%',
            padding: '0.7rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            minHeight: '100px',
            resize: 'vertical',
            marginBottom: '1rem'
        },
        modalActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
        },
        button: {
            padding: '0.7rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500'
        },
        primaryButton: {
            backgroundColor: colors.primary,
            color: 'white'
        },
        secondaryButton: {
            backgroundColor: '#f1f5f9',
            color: colors.dark
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
            border: `2px solid ${colors.primary}`
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={{ marginBottom: '1rem' }}>Cargando reseñas...</div>
                    <div style={{ width: '50px', height: '50px', border: `3px solid ${colors.primary}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}


            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.totalReviews || 0}</div>
                    <div style={styles.statLabel}>Total reseñas</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>
                        {stats.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'}
                    </div>
                    <div style={styles.statLabel}>Calificación promedio</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.pendingModeration || 0}</div>
                    <div style={styles.statLabel}>Pendientes</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.reported || 0}</div>
                    <div style={styles.statLabel}>Reportadas</div>
                </div>
            </div>

            {/* Distribución de calificaciones */}
            <div style={styles.ratingDistribution}>
                {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} style={styles.ratingItem}>
                        <div style={styles.ratingNumber}>{rating} ★</div>
                        <div style={styles.ratingCount}>
                            {stats.ratingDistribution?.[rating] || 0} reseñas
                        </div>
                    </div>
                ))}
            </div>

            {/* Filtros */}
            <div style={styles.filtersBar}>
                <div style={styles.searchBox}>
                    <FiSearch color="#94a3b8" />
                    <input
                        type="text"
                        placeholder="Buscar por usuario, modelo o comentario..."
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <select style={styles.filterSelect} value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                    <option value="all">Todas las calificaciones</option>
                    <option value="5">5 estrellas</option>
                    <option value="4">4 estrellas</option>
                    <option value="3">3 estrellas</option>
                    <option value="2">2 estrellas</option>
                    <option value="1">1 estrella</option>
                </select>

                <select style={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Todos los estados</option>
                    <option value="approved">Aprobadas</option>
                    <option value="pending">Pendientes</option>
                    <option value="rejected">Rechazadas</option>
                </select>
            </div>

            {/* Vista móvil */}
            {isMobile && (
                <div style={styles.cardsContainer}>
                    {filteredReviews.length === 0 ? (
                        <div style={styles.emptyState}>
                            No se encontraron reseñas
                        </div>
                    ) : (
                        filteredReviews.map((review) => (
                            <motion.div
                                key={review.id}
                                style={styles.reviewCard}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div style={styles.cardHeader}>
                                    <div style={styles.userInfo}>
                                        <div style={styles.userAvatar}>
                                            {review.user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={styles.userName}>{review.user?.name}</div>
                                            <div style={styles.userEmail}>{review.user?.email}</div>
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: getStatusColor(review.status) + '10',
                                        color: getStatusColor(review.status)
                                    }}>
                                        {getStatusText(review.status)}
                                    </span>
                                </div>

                                <div style={styles.cardContent}>
                                    <div style={styles.rating}>{getRatingStars(review.rating)}</div>
                                    <div style={styles.modelName}>{review.model?.name}</div>
                                    <div style={styles.comment}>"{review.comment}"</div>
                                    <div style={styles.date}>
                                        <FiCalendar size={12} /> {new Date(review.created_at).toLocaleDateString()}
                                        {review.reported && (
                                            <span style={{ color: colors.danger, marginLeft: '0.5rem' }}>
                                                <FiAlertCircle /> Reportada
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {review.reply && (
                                    <div style={styles.replySection}>
                                        <div style={styles.replyHeader}>
                                            <FiMessageSquare /> Respuesta del equipo
                                        </div>
                                        <div style={styles.replyText}>{review.reply.text}</div>
                                        <div style={styles.replyDate}>
                                            {new Date(review.reply.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}

                                <div style={styles.cardActions}>
                                    {review.status === 'pending' && (
                                        <>
                                            <button
                                                style={styles.cardActionBtn}
                                                onClick={() => handleApprove(review.id)}
                                            >
                                                <FiCheckCircle color={colors.success} /> Aprobar
                                            </button>
                                            <button
                                                style={styles.cardActionBtn}
                                                onClick={() => handleReject(review.id)}
                                            >
                                                <FiXCircle color={colors.danger} /> Rechazar
                                            </button>
                                        </>
                                    )}
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleReply(review)}
                                    >
                                        <FiMessageSquare /> Responder
                                    </button>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleReport(review.id)}
                                    >
                                        <FiFlag color={review.reported ? colors.danger : '#64748b'} />
                                        {review.reported ? 'Reportada' : 'Reportar'}
                                    </button>
                                    <button
                                        style={styles.cardActionBtn}
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        <FiTrash2 color={colors.danger} /> Eliminar
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}

            {/* Vista desktop */}
            {!isMobile && (
                <div style={styles.tableContainer}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Usuario</th>
                                    <th style={styles.th}>Modelo</th>
                                    <th style={styles.th}>Calificación</th>
                                    <th style={styles.th}>Comentario</th>
                                    <th style={styles.th}>Fecha</th>
                                    <th style={styles.th}>Estado</th>
                                    <th style={styles.th}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReviews.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                            No se encontraron reseñas
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReviews.map((review, index) => (
                                        <motion.tr
                                            key={review.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '8px',
                                                        backgroundColor: colors.primary + '10',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: colors.primary
                                                    }}>
                                                        {review.user?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div>{review.user?.name}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                            {review.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>{review.model?.name}</td>
                                            <td style={styles.td}>{getRatingStars(review.rating)}</td>
                                            <td style={styles.td}>
                                                <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {review.comment.substring(0, 50)}...
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </td>
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.statusBadge,
                                                    backgroundColor: getStatusColor(review.status) + '10',
                                                    color: getStatusColor(review.status)
                                                }}>
                                                    {getStatusText(review.status)}
                                                </span>
                                                {review.reported && (
                                                    <span style={{ marginLeft: '0.5rem', color: colors.danger }}>
                                                        <FiAlertCircle />
                                                    </span>
                                                )}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    {review.status === 'pending' && (
                                                        <>
                                                            <button
                                                                style={styles.actionBtn}
                                                                onClick={() => handleApprove(review.id)}
                                                                title="Aprobar"
                                                            >
                                                                <FiCheckCircle color={colors.success} />
                                                            </button>
                                                            <button
                                                                style={styles.actionBtn}
                                                                onClick={() => handleReject(review.id)}
                                                                title="Rechazar"
                                                            >
                                                                <FiXCircle color={colors.danger} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleReply(review)}
                                                        title="Responder"
                                                    >
                                                        <FiMessageSquare />
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleReport(review.id)}
                                                        title={review.reported ? 'Quitar reporte' : 'Reportar'}
                                                    >
                                                        <FiFlag color={review.reported ? colors.danger : '#64748b'} />
                                                    </button>
                                                    <button
                                                        style={styles.actionBtn}
                                                        onClick={() => handleDelete(review.id)}
                                                        title="Eliminar"
                                                    >
                                                        <FiTrash2 color={colors.danger} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal de respuesta */}
            <AnimatePresence>
                {showReplyModal && (
                    <motion.div
                        style={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowReplyModal(false)}
                    >
                        <motion.div
                            style={styles.modal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={styles.modalHeader}>
                                <h3 style={styles.modalTitle}>
                                    Responder a {selectedReview?.user?.name}
                                </h3>
                                <button style={styles.closeBtn} onClick={() => setShowReplyModal(false)}>
                                    <FiX />
                                </button>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                    Comentario original:
                                </div>
                                <div style={{
                                    padding: '1rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    fontSize: '0.95rem',
                                    color: colors.dark
                                }}>
                                    "{selectedReview?.comment}"
                                </div>
                            </div>

                            <textarea
                                placeholder="Escribe tu respuesta..."
                                style={styles.textarea}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />

                            <div style={styles.modalActions}>
                                <button
                                    style={{ ...styles.button, ...styles.secondaryButton }}
                                    onClick={() => setShowReplyModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    style={{ ...styles.button, ...styles.primaryButton }}
                                    onClick={submitReply}
                                >
                                    Enviar respuesta
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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

export default ReviewsManagement;