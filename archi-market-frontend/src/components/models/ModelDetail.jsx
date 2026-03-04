import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiDownload,
    FiEye,
    FiStar,
    FiShoppingCart,
    FiArrowLeft,
    FiCheckCircle,
    FiInfo,
    FiUser,
    FiCalendar,
    FiTag,
    FiBox,
    FiTrendingUp,
    FiThumbsUp,
    FiMessageCircle,
    FiShare2,
    FiHeart
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import API from '../../services/api';
import { colors } from '../../styles/theme';

// Componente visor de Sketchfab mejorado
const SketchfabViewer = ({ model }) => {
    const [viewerError, setViewerError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const spinnerStyle = {
        width: '50px',
        height: '50px',
        border: `4px solid ${colors.primary}20`,
        borderTop: `4px solid ${colors.primary}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    };

    if (viewerError) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                borderRadius: '24px'
            }}>
                <HiOutlineCube size={80} color={colors.primary + '40'} />
                <p style={{ color: '#64748b' }}>No se pudo cargar el visor 3D</p>
            </div>
        );
    }

    const sketchfabId = model.sketchfab_id;

    if (!sketchfabId) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '400px',
                background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <HiOutlineCube size={80} color={colors.primary + '40'} />
            </div>
        );
    }

    const embedUrl = `https://sketchfab.com/models/${sketchfabId}/embed?` + new URLSearchParams({
        autospin: '0.2',
        autostart: '1',
        preload: '1',
        ui_controls: '1',
        ui_infos: '0',
        ui_stop: '1',
        ui_watermark: '0',
        ui_watermark_link: '0',
        ui_inspector: '0',
        ui_annotations: '0',
        ui_color: '0',
        ui_ar: '0',
        ui_help: '0',
        ui_settings: '0',
        ui_fullscreen: '1',
        ui_gyzmo: '1',
        camera: '0'
    });

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px' }}>
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(145deg, #f8fafc 0%, #f1f5f9 100%)',
                    zIndex: 1,
                    borderRadius: '24px'
                }}>
                    <div style={spinnerStyle} />
                </div>
            )}
            <iframe
                title={model.name}
                src={embedUrl}
                style={{
                    width: '100%',
                    height: '100%',
                    minHeight: '400px',
                    border: 'none',
                    borderRadius: '24px'
                }}
                allow="autoplay; fullscreen; xr-spatial-tracking"
                allowFullScreen
                onLoad={() => setIsLoading(false)}
                onError={() => setViewerError(true)}
            />
        </div>
    );
};

const ModelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLicense, setSelectedLicense] = useState('personal');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editingComment, setEditingComment] = useState('');
    const [editingRating, setEditingRating] = useState(5);
    const [reviewLikes, setReviewLikes] = useState({}); // {reviewId: {count: num, isLiked: bool, likes: []}}
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [reviewReplies, setReviewReplies] = useState({}); // {reviewId: [replies]}
    const [replyLikes, setReplyLikes] = useState({}); // {replyId: {count: num, isLiked: bool}}
    const [replyingToReply, setReplyingToReply] = useState(null);
    const [nestedReplyText, setNestedReplyText] = useState('');
    const [nestedReplies, setNestedReplies] = useState({}); // {replyId: [replies]}
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingReplyComment, setEditingReplyComment] = useState('');
    const { addToCart } = useCart();
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: ''
    });
    const [submittingReview, setSubmittingReview] = useState(false);

    // Multiplicadores de licencia (coinciden con PublicLicenses)
    const multipliers = {
        personal: 1.0,
        business: 2.5,
        unlimited: 5.0
    };

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchModel();
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        console.log('👤 Usuario logueado:', !!token, 'Token:', token ? token.substring(0, 10) + '...' : 'No token');
        
        // Obtener datos del usuario actual
        if (token) {
            fetchCurrentUser();
        }
    }, [id]);

    // Cargar likes y respuestas cuando cambia el modelo
    useEffect(() => {
        if (model && model.reviews && isLoggedIn) {
            loadRepliesAndLikes();
        }
    }, [model?.reviews?.length, isLoggedIn]);

    const loadRepliesAndLikes = async () => {
        if (!model?.reviews) return;
        
        for (const review of model.reviews) {
            try {
                // Cargar respuestas del review
                const repliesResponse = await API.get(`/reviews/${review.id}/replies`);
                const replies = repliesResponse.data.replies || [];
                setReviewReplies(prev => ({
                    ...prev,
                    [review.id]: replies
                }));

                // Cargar likes del review
                const likesResponse = await API.get(`/reviews/${review.id}/likes`);
                const isLiked = likesResponse.data.likes?.some(like => like.user_id === currentUser?.id) || false;
                setReviewLikes(prev => ({
                    ...prev,
                    [review.id]: {
                        count: likesResponse.data.likes_count,
                        isLiked: isLiked,
                        likes: likesResponse.data.likes
                    }
                }));

                // Cargar likes de cada respuesta
                for (const reply of replies) {
                    try {
                        const replyLikesResponse = await API.get(`/reviews/replies/${reply.id}/likes`);
                        const isReplyLiked = replyLikesResponse.data.likes?.some(like => like.user_id === currentUser?.id) || false;
                        setReplyLikes(prev => ({
                            ...prev,
                            [reply.id]: {
                                count: replyLikesResponse.data.likes_count,
                                isLiked: isReplyLiked
                            }
                        }));
                    } catch (error) {
                        console.error('Error cargando likes de respuesta:', error);
                    }
                }
            } catch (error) {
                console.error('Error cargando likes/respuestas:', error);
            }
        }
    };
    
    const fetchCurrentUser = async () => {
        try {
            const response = await API.get('/auth/me');
            // El usuario puede venir en response.data.data.user o response.data.user
            let userData = response.data.data?.user || response.data.user || response.data.data || response.data;
            
            // Si userData es un objeto con la propiedad 'user', extraerla
            if (userData && userData.user && !userData.id) {
                userData = userData.user;
            }
            
            setCurrentUser(userData);
            console.log('👤 Usuario actual obtenido:', userData);
            console.log('👤 ID del usuario:', userData?.id, '(Tipo:', typeof userData?.id + ')');
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
        }
    };

    const fetchModel = async () => {
        try {
            const response = await API.get(`/models/${id}`);
            console.log('📦 Modelo recibido:', response.data);
            const responseData = response.data.data || response.data;
            const modelData = responseData?.model || responseData;
            
            // 🔑 IMPORTANTE: Incluir el objeto access directamente en modelData
            if (responseData?.access) {
                modelData.access = responseData.access;
            }
            
            // 📊 IMPORTANTE: Incluir los stats
            if (responseData?.stats) {
                modelData.stats = responseData.stats;
                console.log('📊 Stats actualizado:', responseData.stats);
            }

            // Estructurar datos de autor si vienen en formato diferente
            if (!modelData.author && (modelData.author_name || modelData.author)) {
                modelData.author = {
                    name: modelData.author_name || modelData.author?.name,
                    bio: modelData.author_bio || modelData.author?.bio,
                    avatar: modelData.author_avatar || modelData.author?.avatar
                };
            }

            setModel(modelData);
            console.log('🔍 ESTRUCTURA COMPLETA DE MODEL:', JSON.stringify(modelData, null, 2));
            console.log('✅ access.can_review:', modelData.access?.can_review);
            console.log('📊 Total reviews:', modelData.stats?.total_reviews);

            if (modelData.files && modelData.files.length > 0) {
                const preview = modelData.files.find(f => f.file_type === 'preview');
                setSelectedImage(preview?.file_url || null);
            }
        } catch (error) {
            console.error('Error cargando modelo:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        addToCart(model, selectedLicense, quantity);
        navigate('/cart');
    };

    const handleBuyNow = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        addToCart(model, selectedLicense, quantity);
        navigate('/checkout');
    };

    const getLicensePrice = (basePrice, license) => {
        return basePrice * (multipliers[license] || 1.0);
    };

    const getImageUrl = (fileUrl) => {
        if (!fileUrl) return null;
        return fileUrl.startsWith('http') ? fileUrl : 'http://127.0.0.1:8000' + fileUrl;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Agrega esta función para enviar la reseña
    const handleSubmitReview = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        setSubmittingReview(true);
        try {
            await API.post(`/reviews/models/${model.id}`, newReview);
            // Recargar el modelo para mostrar la nueva reseña
            await fetchModel();
            setShowReviewForm(false);
            setNewReview({ rating: 5, comment: '' });
        } catch (error) {
            console.error('Error al enviar reseña:', error);
            // Aquí puedes mostrar el error específico
            alert(error.response?.data?.message || 'Error al enviar reseña');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta reseña?')) {
            return;
        }

        try {
            await API.delete(`/reviews/${reviewId}`);
            await fetchModel();
            alert('Reseña eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar reseña:', error);
            alert(error.response?.data?.message || 'Error al eliminar reseña');
        }
    };

    const handleEditReview = (review) => {
        setEditingReviewId(review.id);
        setEditingComment(review.comment);
        setEditingRating(review.rating);
    };

    const handleSaveEditReview = async (reviewId) => {
        try {
            await API.put(`/reviews/${reviewId}`, {
                rating: editingRating,
                comment: editingComment
            });
            await fetchModel();
            setEditingReviewId(null);
            setEditingComment('');
            setEditingRating(5);
            alert('Reseña actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar reseña:', error);
            alert(error.response?.data?.message || 'Error al actualizar reseña');
        }
    };

    const handleEditReply = (reply) => {
        setEditingReplyId(reply.id);
        setEditingReplyComment(reply.comment);
    };

    const handleSaveEditReply = async (replyId, reviewId) => {
        try {
            await API.put(`/reviews/replies/${replyId}`, {
                comment: editingReplyComment
            });
            // Actualizar respuestas
            const response = await API.get(`/reviews/${reviewId}/replies`);
            setReviewReplies(prev => ({
                ...prev,
                [reviewId]: response.data.replies
            }));
            setEditingReplyId(null);
            setEditingReplyComment('');
            alert('Respuesta actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar respuesta:', error);
            alert(error.response?.data?.message || 'Error al actualizar respuesta');
        }
    };

    const handleToggleLike = async (reviewId) => {
        // No permitir dar like a la propia reseña
        const review = model.reviews.find(r => r.id === reviewId);
        if (review && review.user_id === currentUser?.id) {
            alert('No puedes dar like a tu propio comentario');
            return;
        }

        try {
            const response = await API.post(`/reviews/${reviewId}/like`);
            // Actualizar el estado local
            const isLiked = response.data.liked;
            setReviewLikes(prev => ({
                ...prev,
                [reviewId]: {
                    count: response.data.likes_count,
                    isLiked: isLiked,
                    likes: prev[reviewId]?.likes || []
                }
            }));
        } catch (error) {
            console.error('Error al dar like:', error);
            alert(error.response?.data?.message || 'Error al dar like');
        }
    };

    const handleToggleReplyLike = async (replyId) => {
        try {
            const response = await API.post(`/reviews/replies/${replyId}/like`);
            const isLiked = response.data.liked;
            setReplyLikes(prev => ({
                ...prev,
                [replyId]: {
                    count: response.data.likes_count,
                    isLiked: isLiked
                }
            }));
        } catch (error) {
            console.error('Error al dar like a respuesta:', error);
        }
    };

    const handleReply = (reviewId) => {
        setReplyingTo(reviewId);
        setReplyText('');
    };

    const handleSendReply = async (reviewId) => {
        if (!replyText.trim()) {
            alert('Escribe una respuesta');
            return;
        }

        try {
            await API.post(`/reviews/${reviewId}/replies`, {
                comment: replyText
            });
            
            // Actualizar respuestas
            const response = await API.get(`/reviews/${reviewId}/replies`);
            setReviewReplies(prev => ({
                ...prev,
                [reviewId]: response.data.replies
            }));

            setReplyingTo(null);
            setReplyText('');
            alert('Respuesta enviada correctamente');
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            alert(error.response?.data?.message || 'Error al enviar respuesta');
        }
    };

    const handleSendNestedReply = async (parentReplyId, reviewId) => {
        if (!isLoggedIn) {
            alert('Debes estar logueado para responder');
            return;
        }

        if (!nestedReplyText.trim()) {
            alert('Escribe una respuesta');
            return;
        }

        try {
            await API.post(`/reviews/${reviewId}/replies`, {
                comment: nestedReplyText,
                parent_reply_id: parentReplyId
            });
            
            // Actualizar respuestas
            const response = await API.get(`/reviews/${reviewId}/replies`);
            setReviewReplies(prev => ({
                ...prev,
                [reviewId]: response.data.replies
            }));

            setReplyingToReply(null);
            setNestedReplyText('');
            alert('Respuesta enviada correctamente');
        } catch (error) {
            console.error('Error al enviar respuesta:', error);
            alert(error.response?.data?.message || 'Error al enviar respuesta');
        }
    };

    const handleShare = (reviewId) => {
        const review = model.reviews.find(r => r.id === reviewId);
        const text = `Reseña de ${review.user.name}: "${review.comment}" (${review.rating} ⭐) - ${window.location.href}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Reseña en ArchiMarket3D',
                text: text
            });
        } else {
            // Copiar al portapapeles
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ Reseña copiada al portapapeles');
            });
        }
    };

    const handleDeleteReply = async (replyId, reviewId) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta respuesta?')) {
            return;
        }

        try {
            await API.delete(`/reviews/replies/${replyId}`);
            // Actualizar respuestas
            const response = await API.get(`/reviews/${reviewId}/replies`);
            setReviewReplies(prev => ({
                ...prev,
                [reviewId]: response.data.replies
            }));
            alert('Respuesta eliminada correctamente');
        } catch (error) {
            console.error('Error al eliminar respuesta:', error);
            alert(error.response?.data?.message || 'Error al eliminar respuesta');
        }
    };

    const getLikeCount = (reviewId) => {
        return reviewLikes[reviewId]?.count || 0;
    };

    const isLikedByUser = (reviewId) => {
        return reviewLikes[reviewId]?.isLiked || false;
    };

    const getReplyLikeCount = (replyId) => {
        return replyLikes[replyId]?.count || 0;
    };

    const isReplyLikedByUser = (replyId) => {
        return replyLikes[replyId]?.isLiked || false;
    };

    const getReplies = (reviewId) => {
        return reviewReplies[reviewId] || [];
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
            padding: '0.5rem 1rem',
            borderRadius: '30px',
            transition: 'all 0.2s',
            ':hover': {
                backgroundColor: colors.primary + '10'
            }
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? '2rem' : '3rem',
            marginBottom: '3rem'
        },
        // Panel izquierdo - Visor 3D
        previewSection: {
            backgroundColor: 'white',
            borderRadius: '32px',
            padding: isMobile ? '1rem' : '1.5rem',
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.03)',
            border: '1px solid #f0f0f0'
        },
        mainImage: {
            width: '100%',
            height: isMobile ? '350px' : '450px',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginBottom: '1rem'
        },
        thumbnailGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.8rem'
        },
        thumbnail: {
            height: '80px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            overflow: 'hidden',
            border: '2px solid transparent',
            ':hover': {
                transform: 'scale(1.05)',
                borderColor: colors.primary
            }
        },
        thumbnailImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        watermark: {
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(5px)',
            color: colors.dark,
            padding: '0.6rem 1.2rem',
            borderRadius: '30px',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.5)'
        },
        // Panel derecho - Información
        infoSection: {
            padding: isMobile ? '0' : '1rem'
        },
        title: {
            fontSize: isMobile ? '2rem' : '2.8rem',
            fontWeight: '700',
            color: colors.dark,
            marginBottom: '1rem',
            lineHeight: '1.2'
        },
        // Autor mejorado
        authorCard: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}03 100%)`,
            borderRadius: '20px',
            border: `1px solid ${colors.primary}10`
        },
        authorAvatar: {
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '1.5rem'
        },
        authorInfo: {
            flex: 1
        },
        authorName: {
            fontWeight: '600',
            color: colors.dark,
            fontSize: '1.1rem',
            marginBottom: '0.25rem'
        },
        authorBio: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        // Métricas
        metrics: {
            display: 'flex',
            gap: '2rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
        },
        metricItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#64748b',
            background: '#f8fafc',
            padding: '0.5rem 1rem',
            borderRadius: '30px'
        },
        // Rating mejorado
        ratingContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '20px'
        },
        ratingScore: {
            fontSize: '2.5rem',
            fontWeight: '700',
            color: colors.primary
        },
        ratingStars: {
            display: 'flex',
            gap: '0.2rem'
        },
        // Precios y licencias
        priceCard: {
            background: `linear-gradient(135deg, ${colors.primary}08 0%, ${colors.primary}03 100%)`,
            borderRadius: '24px',
            padding: '2rem',
            marginBottom: '2rem',
            border: `1px solid ${colors.primary}20`
        },
        priceHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
        },
        priceLabel: {
            fontSize: '0.9rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        priceAmount: {
            fontSize: '3rem',
            fontWeight: '700',
            color: colors.primary,
            lineHeight: '1'
        },
        priceNote: {
            fontSize: '0.85rem',
            color: '#94a3b8',
            marginTop: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        licenseSelector: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
        },
        licenseOption: {
            border: `2px solid #e2e8f0`,
            borderRadius: '20px',
            padding: '1.2rem',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backgroundColor: 'white'
        },
        licenseSelected: {
            borderColor: colors.primary,
            backgroundColor: colors.primary + '05',
            boxShadow: `0 10px 20px ${colors.primary}20`
        },
        licenseName: {
            fontWeight: '600',
            fontSize: '1.1rem',
            marginBottom: '0.5rem',
            color: colors.dark
        },
        licensePrice: {
            fontSize: '1.3rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '0.5rem'
        },
        licenseMultiplier: {
            fontSize: '0.8rem',
            color: '#94a3b8'
        },
        actions: {
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            flexDirection: isMobile ? 'column' : 'row'
        },
        primaryButton: {
            flex: 1,
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s',
            boxShadow: `0 10px 20px ${colors.primary}30`
        },
        secondaryButton: {
            flex: 1,
            backgroundColor: 'white',
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            borderRadius: '20px',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s'
        },
        favoriteButton: {
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            background: 'white',
            border: 'none',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            color: '#94a3b8',
            zIndex: 10,
            transition: 'all 0.2s'
        },
        // Tabs mejorados
        tabs: {
            display: 'flex',
            gap: '2rem',
            borderBottom: `2px solid #e2e8f0`,
            marginBottom: '2rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
        },
        tab: {
            padding: '1rem 0',
            cursor: 'pointer',
            borderBottom: '3px solid transparent',
            transition: 'all 0.3s',
            color: '#64748b',
            fontWeight: '500',
            whiteSpace: 'nowrap'
        },
        tabActive: {
            borderBottomColor: colors.primary,
            color: colors.primary,
            fontWeight: '600'
        },
        tabContent: {
            padding: isMobile ? '1.5rem' : '2rem',
            backgroundColor: '#f8fafc',
            borderRadius: '24px',
            lineHeight: '1.8',
            minHeight: '300px'
        },
        // Características
        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1rem'
        },
        featureItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
        },
        featureIcon: {
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.2rem'
        },
        // Reseñas mejoradas
        reviewsSummary: {
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            marginBottom: '2rem',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '20px',
            flexWrap: 'wrap'
        },
        reviewCard: {
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '20px',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0',
            transition: 'all 0.2s'
        },
        reviewHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem'
        },
        reviewAvatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: colors.primary + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontWeight: '600',
            fontSize: '1.2rem'
        },
        reviewRating: {
            display: 'flex',
            gap: '0.2rem',
            marginBottom: '0.25rem'
        },
        reviewDate: {
            fontSize: '0.85rem',
            color: '#94a3b8'
        },
        reviewComment: {
            color: '#334155',
            lineHeight: '1.6',
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            marginTop: '0.5rem'
        },
        reviewActions: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1rem'
        },
        reviewActionButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.85rem',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: colors.primary,
                color: colors.primary
            }
        },
        reviewActionButtonDanger: {
            borderColor: '#ef4444',
            color: '#ef4444'
        },
        emptyReviews: {
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'white',
            borderRadius: '20px'
        },
        loading: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem',
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
                <div style={styles.loading}>
                    <div style={styles.spinner} />
                    <p>Cargando modelo...</p>
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <HiOutlineCube size={80} color={colors.primary + '40'} />
                    <p style={{ marginTop: '1rem', color: '#64748b' }}>Modelo no encontrado</p>
                </div>
            </div>
        );
    }

    const basePrice = model.price || 99.99;

    return (
        <div style={styles.container}>
            {/* Botón volver */}
            <motion.button
                style={styles.backButton}
                onClick={() => navigate(-1)}
                whileHover={{ x: -5, backgroundColor: colors.primary + '10' }}
                whileTap={{ scale: 0.95 }}
            >
                <FiArrowLeft /> Volver a modelos
            </motion.button>

            {/* Grid principal */}
            <div style={styles.grid}>
                {/* Panel izquierdo - Visor 3D */}
                <motion.div
                    style={styles.previewSection}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <button
                        style={styles.favoriteButton}
                        onClick={() => setIsFavorite(!isFavorite)}
                    >
                        <FiHeart color={isFavorite ? colors.primary : '#94a3b8'} fill={isFavorite ? colors.primary : 'none'} />
                    </button>

                    <div style={styles.mainImage}>
                        <SketchfabViewer model={model} />
                    </div>

                    {model.files && model.files.filter(f => f.file_type === 'preview').length > 1 && (
                        <div style={styles.thumbnailGrid}>
                            {model.files
                                .filter(f => f.file_type === 'preview')
                                .slice(0, 4)
                                .map((file, index) => (
                                    <motion.div
                                        key={index}
                                        style={styles.thumbnail}
                                        whileHover={{ scale: 1.05 }}
                                        onClick={() => setSelectedImage(file.file_url)}
                                    >
                                        <img
                                            src={getImageUrl(file.file_url)}
                                            alt={`Vista previa ${index + 1}`}
                                            style={styles.thumbnailImage}
                                        />
                                    </motion.div>
                                ))}
                        </div>
                    )}

                    <div style={styles.watermark}>
                        <FiEye /> Vista 3D interactiva
                    </div>
                </motion.div>

                {/* Panel derecho - Información */}
                <motion.div
                    style={styles.infoSection}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 style={styles.title}>{model.name}</h1>

                    {/* Autor */}
                    {model.author && model.author.name && (
                        <div style={styles.authorCard}>
                            {model.author.avatar ? (
                                <img
                                    src={model.author.avatar}
                                    alt={model.author.name}
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={styles.authorAvatar}>
                                    {model.author.name.charAt(0)}
                                </div>
                            )}
                            <div style={styles.authorInfo}>
                                <div style={styles.authorName}>{model.author.name}</div>
                                <div style={styles.authorBio}>{model.author.bio || 'Creador profesional'}</div>
                            </div>
                        </div>
                    )}

                    {/* Métricas */}
                    <div style={styles.metrics}>
                        <div style={styles.metricItem}>
                            <FiBox /> {model.format || 'GLTF'}
                        </div>
                        <div style={styles.metricItem}>
                            <FiDownload /> {model.size_mb || '0'} MB
                        </div>
                        <div style={styles.metricItem}>
                            <FiCalendar /> {formatDate(model.publication_date)}
                        </div>
                    </div>

                    {/* Rating */}
                    <div style={styles.ratingContainer}>
                        <span style={styles.ratingScore}>
                            {model.stats?.average_rating?.toFixed(1) || '0.0'}
                        </span>
                        <div>
                            <div style={styles.ratingStars}>
                                {[1, 2, 3, 4, 5].map(i => (
                                    <FiStar
                                        key={i}
                                        size={20}
                                        fill={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : 'none'}
                                        color={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : '#d1d5db'}
                                    />
                                ))}
                            </div>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                                {model.stats?.total_reviews || 0} reseñas
                            </div>
                        </div>
                    </div>

                    {/* Precios */}
                    <div style={styles.priceCard}>
                        <div style={styles.priceHeader}>
                            <span style={styles.priceLabel}>Precio base</span>
                            <span style={styles.priceLabel}>Licencia seleccionada</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={styles.priceAmount}>${basePrice.toFixed(2)}</span>
                            </div>
                            <div>
                                <span style={{ ...styles.priceAmount, color: colors.primary }}>
                                    ${getLicensePrice(basePrice, selectedLicense).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div style={styles.priceNote}>
                            <FiInfo /> El precio varía según la licencia seleccionada
                        </div>
                    </div>

                    {/* Selector de licencias */}
                    <div style={styles.licenseSelector}>
                        {['personal', 'business', 'unlimited'].map(license => (
                            <motion.div
                                key={license}
                                style={{
                                    ...styles.licenseOption,
                                    ...(selectedLicense === license ? styles.licenseSelected : {})
                                }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedLicense(license)}
                            >
                                <div style={styles.licenseName}>
                                    {license === 'personal' && 'Personal'}
                                    {license === 'business' && 'Empresarial'}
                                    {license === 'unlimited' && 'Ilimitada'}
                                </div>
                                <div style={styles.licensePrice}>
                                    ${getLicensePrice(basePrice, license).toFixed(2)}
                                </div>
                                <div style={styles.licenseMultiplier}>
                                    {multipliers[license]}x del precio base
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Acciones */}
                    <div style={styles.actions}>
                        <motion.button
                            style={styles.primaryButton}
                            onClick={handleBuyNow}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiShoppingCart /> Comprar ahora
                        </motion.button>
                        <motion.button
                            style={styles.secondaryButton}
                            onClick={handleAddToCart}
                            whileHover={{ scale: 1.02, backgroundColor: colors.primary + '05' }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Agregar al carrito
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Tabs de información */}
            <div style={{ marginTop: '3rem' }}>
                <div style={styles.tabs}>
                    {['description', 'features', 'reviews'].map(tab => (
                        <div
                            key={tab}
                            style={{
                                ...styles.tab,
                                ...(activeTab === tab ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'description' && 'Descripción'}
                            {tab === 'features' && 'Características'}
                            {tab === 'reviews' && `Reseñas (${model.stats?.total_reviews || 0})`}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        style={styles.tabContent}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Descripción */}
                        {activeTab === 'description' && (
                            <div>
                                {model.description ? (
                                    <div style={{ lineHeight: '1.8' }}>
                                        {model.description.split('\n').map((paragraph, idx) => (
                                            <p key={idx} style={{ marginBottom: '1rem', color: '#334155' }}>
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                                        No hay descripción disponible para este modelo
                                    </div>
                                )}

                                {/* Detalles adicionales */}
                                <div style={{
                                    marginTop: '2rem',
                                    padding: '1.5rem',
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <h4 style={{ fontWeight: '600', marginBottom: '1rem', color: colors.dark }}>
                                        Detalles del modelo
                                    </h4>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '1rem'
                                    }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Formato</div>
                                            <div style={{ fontWeight: '500' }}>{model.format}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Tamaño</div>
                                            <div style={{ fontWeight: '500' }}>{model.size_mb} MB</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Publicado</div>
                                            <div style={{ fontWeight: '500' }}>{formatDate(model.publication_date)}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>ID Sketchfab</div>
                                            <div style={{ fontWeight: '500', fontSize: '0.8rem' }}>{model.sketchfab_id || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Características */}
                        {activeTab === 'features' && (
                            <div>
                                <h3 style={{ fontWeight: '600', marginBottom: '1.5rem', color: colors.dark }}>
                                    Características técnicas
                                </h3>
                                <div style={styles.featuresGrid}>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiBox /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Formato</div>
                                            <div style={{ fontWeight: '600' }}>{model.format}</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiDownload /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Tamaño</div>
                                            <div style={{ fontWeight: '600' }}>{model.size_mb} MB</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiTag /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Texturas</div>
                                            <div style={{ fontWeight: '600' }}>Incluidas (4K)</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiTrendingUp /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Polígonos</div>
                                            <div style={{ fontWeight: '600' }}>{model.polygon_count || '45,000'}</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiStar /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Materiales</div>
                                            <div style={{ fontWeight: '600' }}>{model.material_count || '5'}</div>
                                        </div>
                                    </div>
                                    <div style={styles.featureItem}>
                                        <div style={styles.featureIcon}><FiEye /></div>
                                        <div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Animaciones</div>
                                            <div style={{ fontWeight: '600' }}>{model.has_animations ? 'Sí' : 'No'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reseñas */}
                        {activeTab === 'reviews' && (
                            <div>
                                {/* Resumen de reseñas */}
                                <div style={styles.reviewsSummary}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '4rem', fontWeight: '700', color: colors.primary }}>
                                            {model.stats?.average_rating?.toFixed(1) || '0.0'}
                                        </div>
                                        <div style={{ color: '#64748b' }}>de 5.0</div>
                                    </div>
                                    <div>
                                        <div style={styles.ratingStars}>
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <FiStar
                                                    key={i}
                                                    size={28}
                                                    fill={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : 'none'}
                                                    color={i <= (model.stats?.average_rating || 0) ? '#fbbf24' : '#d1d5db'}
                                                />
                                            ))}
                                        </div>
                                        <div style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                            <strong>{model.stats?.total_reviews || 0}</strong> reseñas
                                        </div>
                                    </div>
                                    {model?.access?.can_review && (
                                        <motion.button
                                            style={{
                                                marginLeft: 'auto',
                                                padding: '0.75rem 1.5rem',
                                                backgroundColor: colors.primary,
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '30px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                        >
                                            <FiMessageCircle />
                                            {showReviewForm ? 'Cancelar' : 'Escribir reseña'}
                                        </motion.button>
                                    )}
                                </div>

                                {/* Formulario de reseña */}
                                {showReviewForm && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        style={{
                                            backgroundColor: 'white',
                                            padding: '2rem',
                                            borderRadius: '20px',
                                            marginBottom: '2rem',
                                            border: '1px solid #e2e8f0'
                                        }}
                                    >
                                        <h4 style={{ marginBottom: '1rem', color: colors.dark }}>Escribe tu reseña</h4>

                                        {/* Selector de estrellas */}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>
                                                Calificación
                                            </label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            fontSize: '2rem',
                                                            color: star <= newReview.rating ? '#fbbf24' : '#d1d5db'
                                                        }}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Comentario */}
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#64748b' }}>
                                                Comentario (opcional)
                                            </label>
                                            <textarea
                                                rows="4"
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                placeholder="Comparte tu experiencia con este modelo..."
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '12px',
                                                    fontSize: '1rem',
                                                    outline: 'none',
                                                    transition: 'border-color 0.2s'
                                                }}
                                                onFocus={(e) => e.target.style.borderColor = colors.primary}
                                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                            />
                                        </div>

                                        {/* Botones */}
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <motion.button
                                                style={{
                                                    padding: '0.8rem 2rem',
                                                    backgroundColor: colors.primary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '30px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleSubmitReview}
                                                disabled={submittingReview}
                                            >
                                                {submittingReview ? 'Enviando...' : 'Enviar reseña'}
                                            </motion.button>
                                            <motion.button
                                                style={{
                                                    padding: '0.8rem 2rem',
                                                    backgroundColor: 'white',
                                                    color: colors.dark,
                                                    border: '2px solid #e2e8f0',
                                                    borderRadius: '30px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowReviewForm(false)}
                                            >
                                                Cancelar
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Lista de reseñas */}
                                {model.reviews && model.reviews.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        {model.reviews.map(review => (
                                            <motion.div
                                                key={review.id}
                                                style={styles.reviewCard}
                                                whileHover={{ y: -2, boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}
                                            >
                                                <div style={styles.reviewHeader}>
                                                    <div style={styles.reviewAvatar}>
                                                        {review.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                                                            {review.user?.name || 'Usuario'}
                                                        </div>
                                                        <div style={styles.reviewRating}>
                                                            {[1, 2, 3, 4, 5].map(i => (
                                                                <FiStar
                                                                    key={i}
                                                                    size={14}
                                                                    fill={i <= (review.rating || 0) ? '#fbbf24' : 'none'}
                                                                    color={i <= (review.rating || 0) ? '#fbbf24' : '#d1d5db'}
                                                                />
                                                            ))}
                                                        </div>
                                                        <div style={styles.reviewDate}>
                                                            {formatDate(review.created_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={styles.reviewComment}>
                                                    {editingReviewId === review.id ? (
                                                        <div style={{ marginBottom: '1rem' }}>
                                                            <div style={{ marginBottom: '1rem' }}>
                                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                                    Calificación
                                                                </label>
                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                    {[1, 2, 3, 4, 5].map(star => (
                                                                        <button
                                                                            key={star}
                                                                            onClick={() => setEditingRating(star)}
                                                                            style={{
                                                                                background: 'none',
                                                                                border: 'none',
                                                                                cursor: 'pointer',
                                                                                fontSize: '1.5rem',
                                                                                color: star <= editingRating ? '#fbbf24' : '#d1d5db'
                                                                            }}
                                                                        >
                                                                            ★
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <textarea
                                                                value={editingComment}
                                                                onChange={(e) => setEditingComment(e.target.value)}
                                                                rows="3"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.75rem',
                                                                    border: '2px solid #e2e8f0',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.95rem',
                                                                    fontFamily: 'inherit'
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        review.comment
                                                    )}
                                                </div>

                                                {/* Sección de respuestas */}
                                                {getReplies(review.id).length > 0 && (
                                                    <div style={{ marginTop: '1.5rem', paddingLeft: '2rem', borderLeft: `2px solid ${colors.primary}20` }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: colors.primary, marginBottom: '1rem' }}>
                                                            💬 Respuestas ({getReplies(review.id).length})
                                                        </div>
                                                        {getReplies(review.id).map((reply) => (
                                                            <div key={reply.id} style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                                    <div>
                                                                        <div style={{ fontWeight: '600', color: colors.dark }}>
                                                                            {reply.user?.name || 'Usuario'}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                                            {new Date(reply.created_at).toLocaleDateString('es-MX')}
                                                                        </div>
                                                                    </div>
                                                                    {/* Botones editar/eliminar solo para el propietario */}
                                                                    {currentUser?.id === reply.user_id && (
                                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                            {editingReplyId === reply.id ? (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => handleSaveEditReply(reply.id, review.id)}
                                                                                        style={{
                                                                                            padding: '0.3rem 0.6rem',
                                                                                            backgroundColor: colors.primary,
                                                                                            color: 'white',
                                                                                            border: `1px solid ${colors.primary}`,
                                                                                            borderRadius: '4px',
                                                                                            cursor: 'pointer',
                                                                                            fontSize: '0.8rem'
                                                                                        }}
                                                                                    >
                                                                                        💾
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => setEditingReplyId(null)}
                                                                                        style={{
                                                                                            padding: '0.3rem 0.6rem',
                                                                                            backgroundColor: 'transparent',
                                                                                            color: '#64748b',
                                                                                            border: '1px solid #d1d5db',
                                                                                            borderRadius: '4px',
                                                                                            cursor: 'pointer',
                                                                                            fontSize: '0.8rem'
                                                                                        }}
                                                                                    >
                                                                                        ✕
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <button
                                                                                        onClick={() => handleEditReply(reply)}
                                                                                        style={{
                                                                                            padding: '0.3rem 0.6rem',
                                                                                            backgroundColor: 'transparent',
                                                                                            color: colors.primary,
                                                                                            border: `1px solid ${colors.primary}`,
                                                                                            borderRadius: '4px',
                                                                                            cursor: 'pointer',
                                                                                            fontSize: '0.8rem'
                                                                                        }}
                                                                                    >
                                                                                        ✏️
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleDeleteReply(reply.id, review.id)}
                                                                                        style={{
                                                                                            padding: '0.3rem 0.6rem',
                                                                                            backgroundColor: 'transparent',
                                                                                            color: '#ef4444',
                                                                                            border: '1px solid #ef4444',
                                                                                            borderRadius: '4px',
                                                                                            cursor: 'pointer',
                                                                                            fontSize: '0.8rem'
                                                                                        }}
                                                                                    >
                                                                                        🗑️
                                                                                    </button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div style={{ color: colors.dark, lineHeight: '1.5', marginBottom: '0.75rem' }}>
                                                                    {editingReplyId === reply.id ? (
                                                                        <textarea
                                                                            value={editingReplyComment}
                                                                            onChange={(e) => setEditingReplyComment(e.target.value)}
                                                                            rows="3"
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '0.75rem',
                                                                                border: '2px solid #e2e8f0',
                                                                                borderRadius: '8px',
                                                                                fontSize: '0.95rem',
                                                                                fontFamily: 'inherit'
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        reply.comment
                                                                    )}
                                                                </div>
                                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                                    <button
                                                                        onClick={() => handleToggleReplyLike(reply.id)}
                                                                        style={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '0.3rem',
                                                                            padding: '0.4rem 0.8rem',
                                                                            backgroundColor: isReplyLikedByUser(reply.id) ? colors.primary + '20' : 'transparent',
                                                                            borderColor: isReplyLikedByUser(reply.id) ? colors.primary : '#d1d5db',
                                                                            border: '1px solid',
                                                                            borderRadius: '4px',
                                                                            cursor: 'pointer',
                                                                            fontSize: '0.8rem',
                                                                            color: isReplyLikedByUser(reply.id) ? colors.primary : '#64748b',
                                                                            fontWeight: '500'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            if (!isReplyLikedByUser(reply.id)) {
                                                                                e.target.style.backgroundColor = '#f8fafc';
                                                                                e.target.style.borderColor = colors.primary;
                                                                                e.target.style.color = colors.primary;
                                                                            }
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            if (!isReplyLikedByUser(reply.id)) {
                                                                                e.target.style.backgroundColor = 'transparent';
                                                                                e.target.style.borderColor = '#d1d5db';
                                                                                e.target.style.color = '#64748b';
                                                                            }
                                                                        }}
                                                                        title={reply.user_id === currentUser?.id ? 'No puedes dar like a tu propia respuesta' : ''}
                                                                    >
                                                                        <FiThumbsUp size={14} /> {getReplyLikeCount(reply.id)}
                                                                    </button>
                                                                    {isLoggedIn && (
                                                                        <button
                                                                            onClick={() => setReplyingToReply(replyingToReply === reply.id ? null : reply.id)}
                                                                            style={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: '0.3rem',
                                                                                padding: '0.4rem 0.8rem',
                                                                                backgroundColor: replyingToReply === reply.id ? colors.primary + '20' : 'transparent',
                                                                                borderColor: replyingToReply === reply.id ? colors.primary : '#d1d5db',
                                                                                border: '1px solid',
                                                                                borderRadius: '4px',
                                                                                cursor: 'pointer',
                                                                                fontSize: '0.8rem',
                                                                                color: replyingToReply === reply.id ? colors.primary : '#64748b',
                                                                                fontWeight: '500'
                                                                            }}
                                                                            onMouseEnter={(e) => {
                                                                                if (replyingToReply !== reply.id) {
                                                                                    e.target.style.backgroundColor = '#f8fafc';
                                                                                    e.target.style.borderColor = colors.primary;
                                                                                    e.target.style.color = colors.primary;
                                                                                }
                                                                            }}
                                                                            onMouseLeave={(e) => {
                                                                                if (replyingToReply !== reply.id) {
                                                                                    e.target.style.backgroundColor = 'transparent';
                                                                                    e.target.style.borderColor = '#d1d5db';
                                                                                    e.target.style.color = '#64748b';
                                                                                }
                                                                            }}
                                                                        >
                                                                            <FiMessageCircle size={14} /> Responder
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                {replyingToReply === reply.id && isLoggedIn && (
                                                                    <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: colors.primary + '08', borderRadius: '6px' }}>
                                                                        <textarea
                                                                            value={nestedReplyText}
                                                                            onChange={(e) => setNestedReplyText(e.target.value)}
                                                                            placeholder={`Responder a ${reply.user?.name}...`}
                                                                            rows="2"
                                                                            style={{
                                                                                width: '100%',
                                                                                padding: '0.5rem',
                                                                                border: '1px solid #e2e8f0',
                                                                                borderRadius: '4px',
                                                                                fontSize: '0.85rem',
                                                                                fontFamily: 'inherit',
                                                                                marginBottom: '0.5rem'
                                                                            }}
                                                                        />
                                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                            <button
                                                                                onClick={() => handleSendNestedReply(reply.id, review.id)}
                                                                                style={{
                                                                                    padding: '0.4rem 0.8rem',
                                                                                    backgroundColor: colors.primary,
                                                                                    color: 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '4px',
                                                                                    cursor: 'pointer',
                                                                                    fontSize: '0.8rem',
                                                                                    fontWeight: '600'
                                                                                }}
                                                                            >
                                                                                Enviar
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setReplyingToReply(null);
                                                                                    setNestedReplyText('');
                                                                                }}
                                                                                style={{
                                                                                    padding: '0.4rem 0.8rem',
                                                                                    backgroundColor: 'transparent',
                                                                                    color: colors.dark,
                                                                                    border: '1px solid #e2e8f0',
                                                                                    borderRadius: '4px',
                                                                                    cursor: 'pointer',
                                                                                    fontSize: '0.8rem'
                                                                                }}
                                                                            >
                                                                                Cancelar
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Formulario de respuesta */}
                                                {replyingTo === review.id && (
                                                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: colors.primary + '05', borderRadius: '8px' }}>
                                                        <div style={{ marginBottom: '1rem' }}>
                                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: colors.dark }}>
                                                                Tu respuesta
                                                            </label>
                                                            <textarea
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder="Escribe una respuesta..."
                                                                rows="3"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.75rem',
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '8px',
                                                                    fontSize: '0.95rem',
                                                                    fontFamily: 'inherit'
                                                                }}
                                                            />
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                onClick={() => handleSendReply(review.id)}
                                                                style={{
                                                                    padding: '0.6rem 1.5rem',
                                                                    backgroundColor: colors.primary,
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                Enviar respuesta
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                style={{
                                                                    padding: '0.6rem 1.5rem',
                                                                    backgroundColor: 'white',
                                                                    color: colors.dark,
                                                                    border: '1px solid #e2e8f0',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '600'
                                                                }}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div style={styles.reviewActions}>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleToggleLike(review.id)}
                                                            style={{
                                                                ...styles.reviewActionButton,
                                                                backgroundColor: isLikedByUser(review.id) ? colors.primary + '20' : 'transparent',
                                                                borderColor: isLikedByUser(review.id) ? colors.primary : '#e2e8f0',
                                                                color: isLikedByUser(review.id) ? colors.primary : '#64748b'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isLikedByUser(review.id)) {
                                                                    e.target.style.backgroundColor = '#f8fafc';
                                                                    e.target.style.borderColor = colors.primary;
                                                                    e.target.style.color = colors.primary;
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isLikedByUser(review.id)) {
                                                                    e.target.style.backgroundColor = 'transparent';
                                                                    e.target.style.borderColor = '#e2e8f0';
                                                                    e.target.style.color = '#64748b';
                                                                }
                                                            }}
                                                            title={review.user_id === currentUser?.id ? "No puedes dar like a tu propio comentario" : ""}
                                                        >
                                                            <FiThumbsUp size={16} /> Útil ({getLikeCount(review.id)})
                                                        </button>
                                                        <button
                                                            onClick={() => handleReply(review.id)}
                                                            style={{
                                                                ...styles.reviewActionButton,
                                                                backgroundColor: replyingTo === review.id ? colors.primary + '20' : 'transparent',
                                                                borderColor: replyingTo === review.id ? colors.primary : '#e2e8f0',
                                                                color: replyingTo === review.id ? colors.primary : '#64748b'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (replyingTo !== review.id) {
                                                                    e.target.style.backgroundColor = '#f8fafc';
                                                                    e.target.style.borderColor = colors.primary;
                                                                    e.target.style.color = colors.primary;
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (replyingTo !== review.id) {
                                                                    e.target.style.backgroundColor = 'transparent';
                                                                    e.target.style.borderColor = '#e2e8f0';
                                                                    e.target.style.color = '#64748b';
                                                                }
                                                            }}
                                                        >
                                                            <FiMessageCircle size={16} /> Responder ({getReplies(review.id).length})
                                                        </button>
                                                        <button
                                                            onClick={() => handleShare(review.id)}
                                                            style={{
                                                                ...styles.reviewActionButton,
                                                                backgroundColor: 'transparent',
                                                                borderColor: '#e2e8f0',
                                                                color: '#64748b'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.target.style.backgroundColor = '#f8fafc';
                                                                e.target.style.borderColor = colors.primary;
                                                                e.target.style.color = colors.primary;
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.target.style.backgroundColor = 'transparent';
                                                                e.target.style.borderColor = '#e2e8f0';
                                                                e.target.style.color = '#64748b';
                                                            }}
                                                        >
                                                            <FiShare2 size={16} /> Compartir
                                                        </button>
                                                    </div>

                                                    {/* Botones de editar/eliminar solo si es el propietario */}
                                                    {(() => {
                                                        console.log('🔐 Verificación de propietario:');
                                                        console.log('  - currentUser?.id:', currentUser?.id);
                                                        console.log('  - review.user_id:', review.user_id);
                                                        console.log('  - ¿Es propietario?:', currentUser?.id === review.user_id);
                                                        return currentUser?.id === review.user_id;
                                                    })() && (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {editingReviewId === review.id ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleSaveEditReview(review.id)}
                                                                        style={{
                                                                            ...styles.reviewActionButton,
                                                                            backgroundColor: colors.primary,
                                                                            borderColor: colors.primary,
                                                                            color: 'white'
                                                                        }}
                                                                    >
                                                                        Guardar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingReviewId(null)}
                                                                        style={{
                                                                            ...styles.reviewActionButton,
                                                                            backgroundColor: 'transparent',
                                                                            borderColor: '#e2e8f0',
                                                                            color: '#64748b'
                                                                        }}
                                                                    >
                                                                        Cancelar
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditReview(review)}
                                                                        style={{
                                                                            ...styles.reviewActionButton,
                                                                            backgroundColor: 'transparent',
                                                                            borderColor: colors.primary,
                                                                            color: colors.primary
                                                                        }}
                                                                    >
                                                                        ✏️ Editar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteReview(review.id)}
                                                                        style={{
                                                                            ...styles.reviewActionButton,
                                                                            backgroundColor: 'transparent',
                                                                            borderColor: '#ef4444',
                                                                            color: '#ef4444'
                                                                        }}
                                                                    >
                                                                        🗑️ Eliminar
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={styles.emptyReviews}>
                                        <FiStar size={60} color={colors.primary + '30'} />
                                        <h4 style={{ marginTop: '1rem', color: colors.dark }}>
                                            No hay reseñas aún
                                        </h4>
                                        <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                                            ¿Compraste este modelo? ¡Comparte tu experiencia!
                                        </p>
                                        {model?.access?.can_review && (
                                            <motion.button
                                                style={{
                                                    marginTop: '1.5rem',
                                                    padding: '0.75rem 2rem',
                                                    backgroundColor: colors.primary,
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '30px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setShowReviewForm(true)}
                                            >
                                                Escribir primera reseña
                                            </motion.button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};


export default ModelDetail;