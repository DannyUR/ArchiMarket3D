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
} from 'react-icons/fi';
import { HiOutlineCube } from 'react-icons/hi';
import { colors } from '../../styles/theme';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Detectar si estamos en LandingPage
    const isLandingPage = location.pathname === '/';

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

    const styles = {
        navbar: {
            backgroundColor: isLandingPage ? 'transparent' : colors.white,
            boxShadow: isLandingPage ? 'none' : '0 2px 10px rgba(0,0,0,0.05)',
            padding: isMobile ? '0.8rem 1rem' : '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderBottom: isLandingPage ? 'none' : `1px solid #e2e8f0`
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
            color: colors.primary,
            textDecoration: 'none',
            cursor: 'pointer'
        },
        menuIcon: {
            display: isMobile ? 'block' : 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: colors.dark,
            zIndex: 1001
        },
        navLinks: {
            display: isMobile ? (isOpen ? 'flex' : 'none') : 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            position: isMobile ? 'absolute' : 'static',
            top: isMobile ? '70px' : 'auto',
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            padding: isMobile ? '2rem' : 0,
            gap: isMobile ? '1rem' : '2rem',
            boxShadow: isMobile ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
            borderBottom: isMobile ? `1px solid #e2e8f0` : 'none',
            zIndex: 999,
            maxHeight: isMobile ? 'calc(100vh - 70px)' : 'none',
            overflowY: isMobile ? 'auto' : 'visible'
        },
        link: {
            color: colors.dark,
            textDecoration: 'none',
            fontWeight: '500',
            padding: isMobile ? '1rem' : '0.5rem 1rem',
            transition: 'all 0.3s',
            cursor: 'pointer',
            fontSize: isMobile ? '1.1rem' : '1rem',
            borderRadius: '5px',
            width: isMobile ? '100%' : 'auto',
            textAlign: isMobile ? 'center' : 'left',
            borderBottom: isMobile ? '1px solid #e2e8f0' : 'none'
        },
        // Versión simplificada para LandingPage
        landingLinks: {
            display: 'flex',
            gap: isMobile ? '1rem' : '2rem',
            alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            width: isMobile ? '100%' : 'auto'
        },
        landingLoginBtn: {
            color: colors.primary,
            textDecoration: 'none',
            fontWeight: '600',
            padding: isMobile ? '1rem' : '0.5rem 1rem',
            fontSize: isMobile ? '1.1rem' : '1rem',
            width: isMobile ? '100%' : 'auto',
            textAlign: 'center'
        },
        landingRegisterBtn: {
            backgroundColor: colors.primary,
            color: colors.white,
            padding: isMobile ? '1rem' : '0.6rem 1.5rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: isMobile ? '1.1rem' : '1rem',
            width: isMobile ? '100%' : 'auto',
            textAlign: 'center',
            border: 'none'
        },
        // Menú de usuario (solo para no-landing)
        userSection: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'center' : 'flex-start'
        },
        userButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: isMobile ? '1rem' : '0.5rem 1rem',
            backgroundColor: colors.primary + '10',
            border: `1px solid ${colors.primary}20`,
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            width: isMobile ? '100%' : 'auto',
            justifyContent: 'center'
        },
        userAvatar: {
            width: isMobile ? '32px' : '32px',
            height: isMobile ? '32px' : '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.9rem',
            fontWeight: '600'
        },
        userName: {
            fontWeight: '500',
            color: colors.dark,
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        dropdownMenu: {
            position: isMobile ? 'static' : 'absolute',
            top: isMobile ? 'auto' : '60px',
            right: 0,
            width: isMobile ? '100%' : '250px',
            backgroundColor: colors.white,
            borderRadius: isMobile ? '0' : '10px',
            boxShadow: isMobile ? 'none' : '0 10px 30px rgba(0,0,0,0.1)',
            border: isMobile ? 'none' : `1px solid #e2e8f0`,
            overflow: 'hidden',
            zIndex: 1000,
            marginTop: isMobile ? '1rem' : 0
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: isMobile ? '1rem' : '1rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            color: colors.dark,
            textDecoration: 'none',
            borderBottom: `1px solid #e2e8f0`
        },
        dropdownLogout: {
            color: colors.danger,
            borderBottom: 'none'
        },
        dropdownDivider: {
            height: '1px',
            backgroundColor: '#e2e8f0',
            margin: '0.5rem 0'
        },
        userStats: {
            padding: isMobile ? '1rem' : '1rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderBottom: `1px solid #e2e8f0`
        },
        statRow: {
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.9rem',
            color: '#64748b',
            marginBottom: '0.25rem'
        },
        statValue: {
            fontWeight: '600',
            color: colors.primary
        }
    };

    // Función para manejar hover
    const handleMouseEnter = (e) => {
        e.currentTarget.style.color = colors.primary;
        e.currentTarget.style.backgroundColor = colors.primary + '10';
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.color = colors.dark;
        e.currentTarget.style.backgroundColor = 'transparent';
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <HiOutlineCube size={isMobile ? 28 : 32} />
                    <span>ArchiMarket3D</span>
                </Link>

                {/* Menú hamburguesa (solo en móvil) */}
                {isMobile && (
                    <div style={styles.menuIcon} onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <FiX /> : <FiMenu />}
                    </div>
                )}

                {/* Enlaces de navegación */}
                <div style={styles.navLinks}>
                    {/* VERSIÓN LANDING PAGE (simplificada) */}
                    {isLandingPage ? (
                        <div style={styles.landingLinks}>
                            {!isLoggedIn ? (
                                <>
                                    <Link
                                        to="/login"
                                        style={styles.landingLoginBtn}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        to="/register"
                                        style={styles.landingRegisterBtn}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Registrarse
                                    </Link>
                                </>
                            ) : (
                                // Usuario logueado en LandingPage (también simplificado)
                                <div style={styles.userSection}>
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
                                            <motion.div
                                                style={styles.dropdownMenu}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div style={styles.userStats}>
                                                    <div style={styles.statRow}>
                                                        <span>Compras</span>
                                                        <span style={styles.statValue}>0</span>
                                                    </div>
                                                    <div style={styles.statRow}>
                                                        <span>Miembro desde</span>
                                                        <span style={styles.statValue}>2026</span>
                                                    </div>
                                                </div>

                                                <Link
                                                    to="/profile"
                                                    style={styles.dropdownItem}
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <FiUser /> Mi Perfil
                                                </Link>

                                                <Link
                                                    to="/purchases"
                                                    style={styles.dropdownItem}
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <FiShoppingCart /> Mis Compras
                                                </Link>

                                                <Link
                                                    to="/downloads"
                                                    style={styles.dropdownItem}
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <FiDownload /> Descargas
                                                </Link>

                                                <div style={styles.dropdownDivider} />

                                                <div
                                                    style={{ ...styles.dropdownItem, ...styles.dropdownLogout }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = colors.danger + '10';
                                                        e.currentTarget.style.color = colors.danger;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = colors.danger;
                                                    }}
                                                    onClick={handleLogout}
                                                >
                                                    <FiLogOut /> Cerrar Sesión
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* VERSIÓN NORMAL (para el resto de la app) */
                        <>

                            <Link
                                to="/models"
                                style={styles.link}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => setIsOpen(false)}
                            >
                                Modelos
                            </Link>

                            <Link
                                to="/categories"
                                style={styles.link}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => setIsOpen(false)}
                            >
                                Categorías
                            </Link>

                            <Link
                                to="/licenses"
                                style={styles.link}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                onClick={() => setIsOpen(false)}
                            >
                                Licencias
                            </Link>

                            {isLoggedIn ? (
                                <div style={styles.userSection}>
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
                                            <motion.div
                                                style={styles.dropdownMenu}
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div style={styles.userStats}>
                                                    <div style={styles.statRow}>
                                                        <span>Compras</span>
                                                        <span style={styles.statValue}>0</span>
                                                    </div>
                                                    <div style={styles.statRow}>
                                                        <span>Miembro desde</span>
                                                        <span style={styles.statValue}>2026</span>
                                                    </div>
                                                </div>

                                                <Link
                                                    to="/profile"
                                                    style={styles.dropdownItem}
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <FiUser /> Mi Perfil
                                                </Link>

                                                <Link
                                                    to="/purchases"
                                                    style={styles.dropdownItem}
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <FiShoppingCart /> Mis Compras
                                                </Link>

                                                <Link
                                                    to="/downloads"
                                                    style={styles.dropdownItem}
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <FiDownload /> Descargas
                                                </Link>

                                                <Link
                                                    to="/cart"
                                                    style={styles.dropdownItem}
                                                    onMouseEnter={handleMouseEnter}
                                                    onMouseLeave={handleMouseLeave}
                                                    onClick={() => {
                                                        setUserMenuOpen(false);
                                                        setIsOpen(false);
                                                    }}
                                                >
                                                    <FiShoppingCart /> Carrito
                                                </Link>

                                                <div style={styles.dropdownDivider} />

                                                <div
                                                    style={{ ...styles.dropdownItem, ...styles.dropdownLogout }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = colors.danger + '10';
                                                        e.currentTarget.style.color = colors.danger;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.color = colors.danger;
                                                    }}
                                                    onClick={handleLogout}
                                                >
                                                    <FiLogOut /> Cerrar Sesión
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '1rem', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
                                    <Link
                                        to="/login"
                                        style={styles.link}
                                        onMouseEnter={handleMouseEnter}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Iniciar Sesión
                                    </Link>
                                    <Link
                                        to="/register"
                                        style={{
                                            ...styles.link,
                                            backgroundColor: colors.primary,
                                            color: colors.white,
                                            textAlign: 'center'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = colors.dark;
                                            e.currentTarget.style.color = colors.white;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = colors.primary;
                                            e.currentTarget.style.color = colors.white;
                                        }}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Registrarse
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;