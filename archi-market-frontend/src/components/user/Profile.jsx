import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUser, FiMail, FiBriefcase, FiShoppingBag, FiDownload,
    FiEdit2, FiSave, FiX, FiCalendar, FiDollarSign, FiPackage,
    FiChevronRight, FiEye, FiCheckCircle, FiFileText, FiXCircle,
    FiAward, FiTrendingUp, FiLock, FiClock, FiStar, FiGrid, FiList
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';
import { AchievementBadge } from '../gamification/AchievementBadge';

// Componente de tarjeta de estadística mejorada
const StatCard = ({ icon, value, label, color }) => (
    <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        style={{
            background: colors.white,
            borderRadius: '20px',
            padding: '1.2rem',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #eef2f6',
            transition: 'all 0.2s'
        }}
    >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
        <div style={{ fontSize: '1.8rem', fontWeight: '700', color: colors.dark }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{label}</div>
    </motion.div>
);

// Componente de barra de progreso de nivel mejorada
const LevelCard = ({ level, levelIcon, levelTitle, progress, currentXP, nextXP, discount }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
            background: `linear-gradient(135deg, ${colors.primary}08, ${colors.white})`,
            borderRadius: '24px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `1px solid ${colors.primary}15`
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}80)`,
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    boxShadow: `0 4px 12px ${colors.primary}30`
                }}>{levelIcon}</div>
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: colors.dark }}>Nivel {level}</div>
                    <div style={{ color: colors.primary, fontSize: '0.85rem', fontWeight: '500' }}>{levelTitle}</div>
                </div>
            </div>
            {discount > 0 && (
                <div style={{ background: `linear-gradient(135deg, #f59e0b, #d97706)`, padding: '0.35rem 1rem', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 'bold', color: 'white' }}>
                    🔥 {discount}% de descuento
                </div>
            )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
                <span>Progreso al siguiente nivel</span>
                <span style={{ color: colors.primary, fontWeight: '600' }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    style={{ height: '100%', background: `linear-gradient(90deg, ${colors.primary}, #60a5fa)`, borderRadius: '10px' }}
                />
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
            <span>✨ {currentXP} XP acumulados</span>
            <span>🎯 {nextXP - currentXP} XP para nivel {level + 1}</span>
        </div>
    </motion.div>
);

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [formData, setFormData] = useState({ name: '', company: '' });
    const [purchases, setPurchases] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({ totalSpent: 0, totalPurchases: 0, totalDownloads: 0, memberSince: '' });
    const [userLicenses, setUserLicenses] = useState([]);
    const { showSuccess, showError } = useNotification();
    const [gamification, setGamification] = useState(null);
    const [gamificationLoading, setGamificationLoading] = useState(true);
    const [showAllAchievements, setShowAllAchievements] = useState(false);
    
    // ✅ Calcular la altura del navbar dinámicamente
    const [navbarHeight, setNavbarHeight] = useState(82); // Altura por defecto

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // ✅ Obtener la altura real del navbar
        const getNavbarHeight = () => {
            const navbar = document.querySelector('nav');
            if (navbar) {
                setNavbarHeight(navbar.offsetHeight);
            }
        };
        
        getNavbarHeight();
        window.addEventListener('resize', getNavbarHeight);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('resize', getNavbarHeight);
        };
    }, []);

    useEffect(() => {
        const fetchAllData = async () => {
            await Promise.all([fetchUserData(), fetchPurchases(), fetchUserLicenses(), fetchGamification()]);
        };
        fetchAllData();
    }, []);

    const fetchGamification = async () => {
        try {
            setGamificationLoading(true);
            const response = await API.get('/user/gamification');
            if (response.data.success) setGamification(response.data.data);
        } catch (error) { console.error('Error:', error); }
        finally { setGamificationLoading(false); }
    };

    const fetchUserLicenses = async () => {
        try {
            const response = await API.get('/my-licenses');
            setUserLicenses(response.data?.data?.licenses || []);
        } catch (error) { console.error('Error:', error); setUserLicenses([]); }
    };

    const fetchUserData = async () => {
        try {
            const response = await API.get('/profile');
            const userData = response.data?.data?.user;
            if (userData) {
                setUser(userData);
                setFormData({ name: userData.name || '', company: userData.company || '' });
                setStats({
                    totalSpent: response.data?.data?.stats?.total_spent || 0,
                    totalPurchases: response.data?.data?.stats?.total_purchases || 0,
                    totalDownloads: response.data?.data?.stats?.total_downloads || userData.total_downloads || 0,
                    memberSince: userData.created_at ? new Date(userData.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Fecha no disponible'
                });
            }
        } catch (error) { console.error('Error:', error); }
        finally { setLoading(false); }
    };

    const fetchPurchases = async () => {
        try {
            const response = await API.get('/profile/purchases');
            setPurchases(response.data?.data?.data || []);
        } catch (error) { console.error('Error:', error); setPurchases([]); }
    };

    const handleUpdateProfile = async () => {
        try {
            const response = await API.put('/profile', formData);
            setUser(response.data.data);
            setEditing(false);
            showSuccess('✅ Perfil actualizado');
            await fetchGamification();
            await fetchUserData();
        } catch (error) { showError('❌ Error al actualizar'); }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getLicenseTypeLabel = (type) => ({ personal: 'Personal', business: 'Empresarial', unlimited: 'Ilimitada' }[type] || type);
    const getLicenseTypeColor = (type) => ({ personal: '#3b82f6', business: '#8b5cf6', unlimited: '#10b981' }[type] || '#64748b');
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin expiración';

    const unlockedAchievements = gamification?.achievements?.filter(a => a.unlocked_at) || [];
    const lockedAchievements = gamification?.achievements?.filter(a => !a.unlocked_at) || [];

    const achievementsWithProgress = (gamification?.achievements || []).map(achievement => {
        if (achievement.unlocked_at) return { ...achievement, unlocked: true, progress: 100, required: achievement.condition_value };

        let progress = 0;
        const conditionValue = achievement.condition_value || 1;

        switch (achievement.condition_type) {
            case 'purchases':
                progress = Math.min(stats.totalPurchases, conditionValue);
                break;
            case 'reviews':
                progress = Math.min(stats.totalReviews || 0, conditionValue);
                break;
            case 'likes':
                progress = Math.min(stats.totalLikesReceived || 0, conditionValue);
                break;
            case 'level':
                progress = Math.min(gamification?.level || 1, conditionValue);
                break;
            default:
                progress = 0;
        }

        return { ...achievement, unlocked: false, progress, required: conditionValue };
    });

    const displayedAchievements = showAllAchievements ? achievementsWithProgress : achievementsWithProgress.slice(0, 9);

    if (loading) {
        return (
            <div style={{ 
                maxWidth: '1200px', 
                margin: '0 auto', 
                padding: `${navbarHeight + 20}px 2rem 2rem`,
                minHeight: '100vh', 
                backgroundColor: '#f8fafc', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
            }}>
                <div>
                    <div style={{ width: '40px', height: '40px', border: `3px solid ${colors.primary}20`, borderTop: `3px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                    <p style={{ color: colors.primary, marginTop: '1rem' }}>Cargando perfil...</p>
                </div>
                <style>{'@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }'}</style>
            </div>
        );
    }

    return (
        <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            padding: `${navbarHeight + 20}px 2rem 2rem`,
            minHeight: '100vh', 
            backgroundColor: '#f8fafc' 
        }}>
            {/* Header - Versión simplificada */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '32px',
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.dark})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: 'white'
                        }}>{getInitials(user?.name)}</div>
                        <div>
                            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: colors.dark, marginBottom: '0.25rem' }}>{user?.name || 'Usuario'}</h1>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiMail size={12} /> {user?.email}</span>
                                {user?.company && <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiBriefcase size={12} /> {user?.company}</span>}
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><FiCalendar size={12} /> Desde {stats.memberSince.split(' ')[0]}</span>
                            </div>
                        </div>
                    </div>
                    {!editing && (
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditing(true)} style={{ background: colors.primary, border: 'none', padding: '0.6rem 1.2rem', borderRadius: '30px', color: 'white', fontWeight: '500', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <FiEdit2 size={14} /> Editar perfil
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <StatCard icon="💰" value={`$${stats.totalSpent.toFixed(2)}`} label="Total gastado" />
                <StatCard icon="📦" value={stats.totalPurchases} label="Compras" />
                <StatCard icon="⬇️" value={stats.totalDownloads} label="Descargas" />
                <StatCard icon="🏆" value={gamification?.level || 1} label="Nivel" />
            </div>

            {/* Level Progress */}
            {!gamificationLoading && gamification && (
                <LevelCard 
                    level={gamification.level} 
                    levelIcon={gamification.level_icon} 
                    levelTitle={gamification.level_title} 
                    progress={gamification.progress} 
                    currentXP={gamification.xp} 
                    nextXP={gamification.xp_next_level} 
                    discount={gamification.discount} 
                />
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                {[
                    { id: 'overview', icon: <FiUser size={16} />, label: 'Resumen' },
                    { id: 'purchases', icon: <FiShoppingBag size={16} />, label: 'Compras' },
                    { id: 'licenses', icon: <FiFileText size={16} />, label: 'Licencias' },
                    { id: 'achievements', icon: <FiAward size={16} />, label: 'Logros' }
                ].map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ y: -2 }}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'transparent', color: activeTab === tab.id ? colors.primary : '#64748b', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${colors.primary}` : '2px solid transparent', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem', transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && !editing && (
                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #eef2f6' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.dark }}><FiUser size={16} /> Información personal</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Nombre completo</div><div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user?.name || 'No disponible'}</div></div>
                                <div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Correo electrónico</div><div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user?.email || 'No disponible'}</div></div>
                                {user?.company && <div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Empresa</div><div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{user?.company}</div></div>}
                                <div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Miembro desde</div><div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{stats.memberSince}</div></div>
                            </div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #eef2f6' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: colors.dark }}><FiPackage size={16} /> Últimas compras</h3>
                            {purchases.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.85rem' }}>No hay compras aún</p> : purchases.slice(0, 3).map(p => (
                                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid #f0f0f0' }}>
                                    <div><div style={{ fontWeight: '500', fontSize: '0.85rem' }}>Compra #{p.id}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : 'Fecha no disponible'}</div></div>
                                    <div style={{ fontWeight: 'bold', color: colors.primary, fontSize: '0.9rem' }}>${p.total || 0}</div>
                                </div>
                            ))}
                            {purchases.length > 0 && <motion.button whileHover={{ scale: 1.02 }} onClick={() => setActiveTab('purchases')} style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', background: 'transparent', border: `1px solid ${colors.primary}`, borderRadius: '30px', color: colors.primary, cursor: 'pointer', fontSize: '0.8rem' }}>Ver todas</motion.button>}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'overview' && editing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #eef2f6' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}>Editar perfil</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#64748b' }}>Nombre completo *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: `1px solid #e2e8f0`, borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }} placeholder="Tu nombre" /></div>
                            <div><label style={{ display: 'block', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#64748b' }}>Empresa (opcional)</label><input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} style={{ width: '100%', padding: '0.6rem', border: `1px solid #e2e8f0`, borderRadius: '10px', fontSize: '0.85rem', outline: 'none' }} placeholder="Nombre de la empresa" /></div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setEditing(false)} style={{ padding: '0.5rem 1.2rem', background: 'white', border: `1px solid #e2e8f0`, borderRadius: '30px', cursor: 'pointer', fontSize: '0.8rem' }}><FiX size={12} /> Cancelar</motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleUpdateProfile} style={{ padding: '0.5rem 1.2rem', background: colors.primary, border: 'none', borderRadius: '30px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}><FiSave size={12} /> Guardar</motion.button>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'purchases' && (
                    <motion.div key="purchases" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        {purchases.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}><FiPackage size={48} color="#cbd5e1" /><h3 style={{ marginTop: '0.75rem', fontSize: '1rem' }}>No hay compras aún</h3><p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Explora nuestro catálogo</p></div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {purchases.map(purchase => (
                                    <motion.div key={purchase.id} whileHover={{ x: 3 }} style={{ background: 'white', borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', border: '1px solid #eef2f6' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', background: `${colors.primary}10`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><HiOutlineCube /></div>
                                            <div><div style={{ fontWeight: '500', fontSize: '0.85rem' }}>Compra #{purchase.id}</div><div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString() : 'Fecha no disponible'} • {purchase.models?.length || 0} modelos</div></div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: colors.primary }}>${purchase.total || 0}</div>
                                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/purchases/${purchase.id}`)} style={{ background: colors.primary, border: 'none', padding: '0.4rem 0.8rem', borderRadius: '30px', color: 'white', cursor: 'pointer', fontSize: '0.7rem' }}><FiEye size={12} /> Ver</motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'licenses' && (
                    <motion.div key="licenses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        {!userLicenses || userLicenses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '20px' }}><FiFileText size={48} color="#cbd5e1" /><h3 style={{ marginTop: '0.75rem', fontSize: '1rem' }}>No tienes licencias</h3><p style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Compra tu primer modelo</p></div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                {userLicenses.map(license => {
                                    const color = getLicenseTypeColor(license.license_type);
                                    return (
                                        <motion.div key={license.id} whileHover={{ y: -2 }} onClick={() => navigate(`/models/${license.model?.id}`)} style={{ background: 'white', borderRadius: '16px', padding: '1rem', cursor: 'pointer', border: `1px solid ${color}20` }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}><HiOutlineCube /></div>
                                                <div><div style={{ fontWeight: '500', fontSize: '0.85rem' }}>{license.model?.name || 'Modelo'}</div><div style={{ background: color, display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 'bold', color: 'white' }}>{getLicenseTypeLabel(license.license_type)}</div></div>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.7rem' }}>
                                                <div><div style={{ color: '#94a3b8' }}>Precio</div><div>${license.price_paid || 0}</div></div>
                                                <div><div style={{ color: '#94a3b8' }}>Expiración</div><div>{formatDate(license.expires_at)}</div></div>
                                                <div><div style={{ color: license.is_active && !license.is_expired ? colors.success : colors.danger }}>{license.is_active && !license.is_expired ? '✓ Activa' : '✗ Expirada'}</div></div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'achievements' && (
                    <motion.div key="achievements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div><span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>🏆 Logros</span> <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>({unlockedAchievements.length}/{gamification?.achievements?.length || 0})</span></div>
                            {gamification?.achievements?.length > 9 && <button onClick={() => setShowAllAchievements(!showAllAchievements)} style={{ background: 'transparent', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: '0.75rem' }}>{showAllAchievements ? 'Ver menos' : 'Ver todos'} <FiChevronRight size={10} /></button>}
                        </div>

                        {gamificationLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><div style={{ width: '30px', height: '30px', border: `2px solid ${colors.primary}20`, borderTop: `2px solid ${colors.primary}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>
                        ) : !gamification || gamification.achievements?.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', background: 'white', borderRadius: '20px' }}>
                                <FiAward size={48} color="#cbd5e1" />
                                <h3 style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>No hay logros</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Completa acciones para desbloquear</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '0.75rem' }}>
                                    {displayedAchievements.map((achievement, index) => (
                                        <AchievementBadge
                                            key={`${achievement.id}-${achievement.unlocked_at ? 'unlocked' : 'locked'}-${index}`}
                                            icon={achievement.icon}
                                            name={achievement.name}
                                            description={achievement.description}
                                            unlocked={!!achievement.unlocked_at}
                                            unlockedAt={achievement.unlocked_at}
                                        />
                                    ))}
                                </div>
                                {!showAllAchievements && achievementsWithProgress.filter(a => !a.unlocked).length > 0 && (
                                    <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.7rem', color: '#94a3b8' }}>🔒 +{achievementsWithProgress.filter(a => !a.unlocked).length} logros por desbloquear</p>
                                )}
                                <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: `${colors.primary}05`, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                                    <FiTrendingUp style={{ color: colors.primary }} />
                                    <span style={{ color: '#64748b' }}>Siguiente nivel: {gamification.level + 1}</span>
                                    <span style={{ color: '#94a3b8' }}>🎯 {Math.ceil(gamification.xp_next_level - gamification.xp)} XP para subir</span>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;