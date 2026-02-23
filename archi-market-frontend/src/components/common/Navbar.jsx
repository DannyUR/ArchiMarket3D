import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome,
    FiGrid,
    FiShoppingCart,
    FiUser,
    FiLogIn,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronDown,
    FiSettings,
    FiDownload,
    FiHeart,
    FiFileText,
    FiSearch,
    FiBell,
    FiPackage,
    FiCreditCard,
    FiStar
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';
import InstallButton from './InstallButton';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Detectar scroll
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Detectar móvil
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setIsLoggedIn(true);
            setUser(JSON.parse(userData));
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Cerrar menús al cambiar de ruta
    useEffect(() => {
        setIsOpen(false);
        setUserMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setUserMenuOpen(false);
        navigate('/');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Detectar si estamos en LandingPage
    const isLandingPage = location.pathname === '/';

    // Estilos
    const styles = {
        navbar: {
            backgroundColor: isLandingPage && !scrolled ? 'transparent' : 'rgba(255,255,255,0.98)',
            backdropFilter: scrolled || !isLandingPage ? 'blur(10px)' : 'none',
            boxShadow: scrolled || !isLandingPage ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
            padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
            position: 'fixed', // Cambia de 'sticky' a 'fixed'
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderBottom: scrolled || !isLandingPage ? `1px solid ${colors.primary}10` : 'none',
            transition: 'all 0.3s ease'
        },
        container: {
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: isMobile ? '1.2rem' : '1.5rem',
            fontWeight: '700',
            color: scrolled || !isLandingPage ? colors.primary : 'white',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'color 0.3s ease'
        },
        logoIcon: {
            color: scrolled || !isLandingPage ? colors.primary : 'white',
            transition: 'color 0.3s ease'
        },
        menuIcon: {
            display: isMobile ? 'block' : 'none',
            fontSize: '1.8rem',
            cursor: 'pointer',
            color: scrolled || !isLandingPage ? colors.dark : 'white',
            zIndex: 1001,
            transition: 'color 0.3s ease'
        },
        desktopNav: {
            display: isMobile ? 'none' : 'flex',
            alignItems: 'center',
            gap: '2rem'
        },
        mobileNav: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            zIndex: 999,
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            padding: '80px 1.5rem 2rem', // ← Ajustado el padding superior
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch', // ← Scroll suave en iOS
            height: '100vh', // ← Altura completa
            width: '100vw', // ← Ancho completo
            boxSizing: 'border-box'
        },
        link: {
            color: scrolled || !isLandingPage ? colors.dark : 'white',
            textDecoration: 'none',
            fontWeight: '500',
            fontSize: '1rem',
            padding: '0.5rem 0',
            position: 'relative',
            transition: 'all 0.3s',
            opacity: 0.8,
            ':hover': {
                opacity: 1
            }
        },
        linkActive: {
            color: colors.primary,
            opacity: 1,
            fontWeight: '600'
        },
        linkUnderline: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: colors.primary,
            borderRadius: '2px'
        },
        // Botones de landing
        landingButtons: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        landingLoginBtn: {
            color: scrolled || !isLandingPage ? colors.primary : 'white',
            textDecoration: 'none',
            fontWeight: '600',
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            transition: 'all 0.3s',
            opacity: 0.9
        },
        landingRegisterBtn: {
            background: scrolled || !isLandingPage ? colors.primary : 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.6rem 1.5rem',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1rem',
            border: scrolled || !isLandingPage ? 'none' : '1px solid rgba(255,255,255,0.3)',
            backdropFilter: 'blur(5px)',
            transition: 'all 0.3s'
        },
        // Botón de usuario
        userButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: scrolled || !isLandingPage
                ? colors.primary + '10'
                : 'rgba(255,255,255,0.1)',
            border: scrolled || !isLandingPage
                ? `1px solid ${colors.primary}20`
                : '1px solid rgba(255,255,255,0.2)',
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            color: scrolled || !isLandingPage ? colors.dark : 'white'
        },
        userAvatar: {
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: scrolled || !isLandingPage
                ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`
                : 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        userName: {
            fontWeight: '500',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        // Dropdown - VERSIÓN MEJORADA
        dropdownOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'transparent',
            zIndex: 999
        },
        dropdownMenu: {
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: isMobile ? '1rem' : 0,
            width: isMobile ? 'calc(100% - 2rem)' : '320px',
            background: 'rgba(255,255,255,0.98)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            overflow: 'hidden',
            zIndex: 1000,
            border: '1px solid rgba(255,255,255,0.2)'
        },
        dropdownHeader: {
            padding: '1.5rem',
            background: `linear-gradient(135deg, ${colors.primary}10 0%, ${colors.primary}05 100%)`,
            borderBottom: '1px solid #f0f0f0'
        },
        userFullName: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.25rem'
        },
        userEmail: {
            fontSize: '0.9rem',
            color: '#64748b'
        },
        dropdownSection: {
            padding: '0.5rem'
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            color: colors.dark,
            textDecoration: 'none',
            margin: '0.25rem 0'
        },
        dropdownItemIcon: {
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: colors.primary + '10',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.primary,
            fontSize: '1.1rem'
        },
        dropdownItemContent: {
            flex: 1
        },
        dropdownItemTitle: {
            fontWeight: '600',
            fontSize: '0.95rem',
            marginBottom: '0.2rem'
        },
        dropdownItemSubtitle: {
            fontSize: '0.8rem',
            color: '#94a3b8'
        },
        dropdownDivider: {
            height: '1px',
            background: '#f0f0f0',
            margin: '0.5rem 0'
        },
        logoutItem: {
            color: colors.danger
        }
    };

    // Items del menú para dropdown
    const menuItems = [
        {
            icon: <FiUser />,
            title: 'Mi Perfil',
            subtitle: 'Ver y editar tu información',
            path: '/profile'
        },
        {
            icon: <FiPackage />,
            title: 'Mis Compras',
            subtitle: 'Historial de tus pedidos',
            path: '/purchases'
        },
        {
            icon: <FiDownload />,
            title: 'Descargas',
            subtitle: 'Modelos adquiridos',
            path: '/downloads'
        },
        {
            icon: <FiShoppingCart />,
            title: 'Carrito',
            subtitle: 'Productos pendientes',
            path: '/cart'
        }
    ];

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <HiOutlineCube size={isMobile ? 28 : 32} style={styles.logoIcon} />
                    <span>ArchiMarket3D</span>
                </Link>

                {/* Versión Desktop */}
                {!isMobile && (
                    <div style={styles.desktopNav}>
                        {/* Links normales (solo si no es landing) */}
                        {!isLandingPage && (
                            <>
                                <Link
                                    to="/models"
                                    style={{
                                        ...styles.link,
                                        ...(location.pathname === '/models' ? styles.linkActive : {})
                                    }}
                                >
                                    Modelos
                                    {location.pathname === '/models' && (
                                        <motion.div
                                            layoutId="underline"
                                            style={styles.linkUnderline}
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                                <Link
                                    to="/categories"
                                    style={{
                                        ...styles.link,
                                        ...(location.pathname === '/categories' ? styles.linkActive : {})
                                    }}
                                >
                                    Categorías
                                    {location.pathname === '/categories' && (
                                        <motion.div
                                            layoutId="underline"
                                            style={styles.linkUnderline}
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                                <Link
                                    to="/licenses"
                                    style={{
                                        ...styles.link,
                                        ...(location.pathname === '/licenses' ? styles.linkActive : {})
                                    }}
                                >
                                    Licencias
                                    {location.pathname === '/licenses' && (
                                        <motion.div
                                            layoutId="underline"
                                            style={styles.linkUnderline}
                                            initial={false}
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            </>
                        )}

                        {/* Botones de landing o usuario */}
                        {isLandingPage ? (
                            <div style={styles.landingButtons}>
                                {!isLoggedIn ? (
                                    <>
                                        <Link to="/login" style={styles.landingLoginBtn}>
                                            Iniciar Sesión
                                        </Link>
                                        <Link to="/register" style={styles.landingRegisterBtn}>
                                            Registrarse
                                        </Link>
                                    </>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <motion.div
                                            style={styles.userButton}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        >
                                            <div style={styles.userAvatar}>
                                                {getInitials(user?.name || 'Usuario')}
                                            </div>
                                            <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
                                            <FiChevronDown size={16} />
                                        </motion.div>

                                        <AnimatePresence>
                                            {userMenuOpen && (
                                                <>
                                                    <motion.div
                                                        style={styles.dropdownOverlay}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        onClick={() => setUserMenuOpen(false)}
                                                    />
                                                    <motion.div
                                                        style={styles.dropdownMenu}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div style={styles.dropdownHeader}>
                                                            <div style={styles.userFullName}>{user?.name}</div>
                                                            <div style={styles.userEmail}>{user?.email}</div>
                                                        </div>
                                                        <div style={styles.dropdownSection}>
                                                            {menuItems.map((item, index) => (
                                                                <Link
                                                                    key={index}
                                                                    to={item.path}
                                                                    style={styles.dropdownItem}
                                                                    onClick={() => setUserMenuOpen(false)}
                                                                >
                                                                    <div style={styles.dropdownItemIcon}>
                                                                        {item.icon}
                                                                    </div>
                                                                    <div style={styles.dropdownItemContent}>
                                                                        <div style={styles.dropdownItemTitle}>
                                                                            {item.title}
                                                                        </div>
                                                                        <div style={styles.dropdownItemSubtitle}>
                                                                            {item.subtitle}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                            <div style={styles.dropdownDivider} />
                                                            <div
                                                                style={{ ...styles.dropdownItem, ...styles.logoutItem }}
                                                                onClick={handleLogout}
                                                            >
                                                                <div style={styles.dropdownItemIcon}>
                                                                    <FiLogOut />
                                                                </div>
                                                                <div style={styles.dropdownItemContent}>
                                                                    <div style={styles.dropdownItemTitle}>
                                                                        Cerrar Sesión
                                                                    </div>
                                                                    <div style={styles.dropdownItemSubtitle}>
                                                                        Salir de tu cuenta
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // No es landing page
                            <>
                                {!isLoggedIn ? (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <InstallButton />
                                        <Link to="/login" style={styles.link}>Iniciar Sesión</Link>
                                        <Link to="/register" style={{
                                            ...styles.link,
                                            background: colors.primary,
                                            color: 'white',
                                            padding: '0.6rem 1.5rem',
                                            borderRadius: '30px'
                                        }}>Registrarse</Link>
                                    </div>
                                ) : (
                                    <div style={{ position: 'relative' }}>
                                        <motion.div
                                            style={styles.userButton}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        >
                                            <div style={styles.userAvatar}>
                                                {getInitials(user?.name || 'Usuario')}
                                            </div>
                                            <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
                                            <FiChevronDown size={16} color={colors.primary} />
                                        </motion.div>

                                        <AnimatePresence>
                                            {userMenuOpen && (
                                                <>
                                                    <motion.div
                                                        style={styles.dropdownOverlay}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        onClick={() => setUserMenuOpen(false)}
                                                    />
                                                    <motion.div
                                                        style={styles.dropdownMenu}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        transition={{ duration: 0.2 }}
                                                    >
                                                        <div style={styles.dropdownHeader}>
                                                            <div style={styles.userFullName}>{user?.name}</div>
                                                            <div style={styles.userEmail}>{user?.email}</div>
                                                        </div>
                                                        <div style={styles.dropdownSection}>
                                                            {menuItems.map((item, index) => (
                                                                <Link
                                                                    key={index}
                                                                    to={item.path}
                                                                    style={styles.dropdownItem}
                                                                    onClick={() => setUserMenuOpen(false)}
                                                                >
                                                                    <div style={styles.dropdownItemIcon}>
                                                                        {item.icon}
                                                                    </div>
                                                                    <div style={styles.dropdownItemContent}>
                                                                        <div style={styles.dropdownItemTitle}>
                                                                            {item.title}
                                                                        </div>
                                                                        <div style={styles.dropdownItemSubtitle}>
                                                                            {item.subtitle}
                                                                        </div>
                                                                    </div>
                                                                </Link>
                                                            ))}
                                                            <div style={styles.dropdownDivider} />
                                                            <div
                                                                style={{ ...styles.dropdownItem, ...styles.logoutItem }}
                                                                onClick={handleLogout}
                                                            >
                                                                <div style={styles.dropdownItemIcon}>
                                                                    <FiLogOut />
                                                                </div>
                                                                <div style={styles.dropdownItemContent}>
                                                                    <div style={styles.dropdownItemTitle}>
                                                                        Cerrar Sesión
                                                                    </div>
                                                                    <div style={styles.dropdownItemSubtitle}>
                                                                        Salir de tu cuenta
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Versión Móvil */}
                {isMobile && (
                    <>
                        <div style={styles.menuIcon} onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <FiX /> : <FiMenu />}
                        </div>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    style={styles.mobileNav}
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 20 }}
                                >

                                    {/* Logo en móvil */}
                                    <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                        <HiOutlineCube size={60} color={colors.primary} />
                                        <h2 style={{ color: colors.dark, marginTop: '0.5rem', fontSize: '1.5rem' }}>ArchiMarket3D</h2>
                                    </div>

                                    {/* Links móvil */}
                                    {!isLandingPage && (
                                        <div style={{ width: '100%' }}>
                                            <Link
                                                to="/models"
                                                style={{
                                                    display: 'block',
                                                    color: colors.dark,
                                                    fontSize: '1.2rem',
                                                    padding: '1rem',
                                                    textDecoration: 'none',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Modelos
                                            </Link>
                                            <Link
                                                to="/categories"
                                                style={{
                                                    display: 'block',
                                                    color: colors.dark,
                                                    fontSize: '1.2rem',
                                                    padding: '1rem',
                                                    textDecoration: 'none',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Categorías
                                            </Link>
                                            <Link
                                                to="/licenses"
                                                style={{
                                                    display: 'block',
                                                    color: colors.dark,
                                                    fontSize: '1.2rem',
                                                    padding: '1rem',
                                                    textDecoration: 'none',
                                                    borderBottom: '1px solid #f0f0f0',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Licencias
                                            </Link>
                                        </div>
                                    )}

                                    {/* Usuario en móvil */}
                                    {isLoggedIn ? (
                                        <div style={{ width: '100%', marginTop: '1rem' }}>
                                            {/* Tarjeta de usuario mejorada */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1rem',
                                                padding: '1rem',
                                                background: colors.primary + '10',
                                                borderRadius: '15px',
                                                marginBottom: '1.5rem',
                                                border: `1px solid ${colors.primary}20`
                                            }}>
                                                <div style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '50%',
                                                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                    fontSize: '1.5rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {getInitials(user?.name)}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: colors.dark, fontSize: '1.1rem' }}>{user?.name}</div>
                                                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{user?.email}</div>
                                                </div>
                                            </div>

                                            {/* Items del menú */}
                                            {menuItems.map((item, index) => (
                                                <Link
                                                    key={index}
                                                    to={item.path}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        padding: '1rem',
                                                        textDecoration: 'none',
                                                        color: colors.dark,
                                                        borderBottom: '1px solid #f0f0f0',
                                                        width: '100%',
                                                        boxSizing: 'border-box'
                                                    }}
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        background: colors.primary + '10',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: colors.primary
                                                    }}>
                                                        {item.icon}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{item.title}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.subtitle}</div>
                                                    </div>
                                                </Link>
                                            ))}

                                            {/* Botón de logout */}
                                            <button
                                                onClick={handleLogout}
                                                style={{
                                                    width: '100%',
                                                    padding: '1rem',
                                                    marginTop: '1.5rem',
                                                    background: colors.danger + '10',
                                                    border: `1px solid ${colors.danger}20`,
                                                    borderRadius: '12px',
                                                    color: colors.danger,
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                <FiLogOut /> Cerrar Sesión
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{
                                            marginTop: '2rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            width: '100%'
                                        }}>
                                            <InstallButton />
                                            <Link
                                                to="/login"
                                                style={{
                                                    padding: '1rem',
                                                    background: 'none',
                                                    border: `2px solid ${colors.primary}`,
                                                    borderRadius: '12px',
                                                    color: colors.primary,
                                                    textDecoration: 'none',
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Iniciar Sesión
                                            </Link>
                                            <Link
                                                to="/register"
                                                style={{
                                                    padding: '1rem',
                                                    background: colors.primary,
                                                    borderRadius: '12px',
                                                    color: 'white',
                                                    textDecoration: 'none',
                                                    textAlign: 'center',
                                                    fontWeight: '600',
                                                    width: '100%',
                                                    boxSizing: 'border-box'
                                                }}
                                                onClick={() => setIsOpen(false)}
                                            >
                                                Registrarse
                                            </Link>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;