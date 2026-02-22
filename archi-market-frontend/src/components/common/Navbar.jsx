import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setUserMenuOpen(false);
        navigate('/');
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const styles = {
        navbar: {
            backgroundColor: colors.white,
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            padding: '1rem 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderBottom: `1px solid #e2e8f0`
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
            fontSize: '1.5rem',
            fontWeight: '700',
            color: colors.primary,
            textDecoration: 'none',
            cursor: 'pointer'
        },
        menuIcon: {
            display: isMobile ? 'block' : 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: colors.dark
        },
        navLinks: {
            display: isMobile ? (isOpen ? 'flex' : 'none') : 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            position: isMobile ? 'absolute' : 'static',
            top: '70px',
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            padding: isMobile ? '1.5rem' : 0,
            gap: '2rem',
            boxShadow: isMobile ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
            borderBottom: isMobile ? `1px solid #e2e8f0` : 'none',
            zIndex: 999
        },
        link: {
            color: colors.dark,
            textDecoration: 'none',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            transition: 'color 0.3s',
            cursor: 'pointer',
            fontSize: '1rem',
            borderRadius: '5px'
        },
        linkHover: {
            color: colors.primary,
            backgroundColor: colors.primary + '10'
        },
        // Menú de usuario
        userSection: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        userButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: colors.primary + '10',
            border: `1px solid ${colors.primary}20`,
            borderRadius: '30px',
            cursor: 'pointer',
            transition: 'all 0.3s'
        },
        userAvatar: {
            width: '32px',
            height: '32px',
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
            position: 'absolute',
            top: '60px',
            right: 0,
            width: '250px',
            backgroundColor: colors.white,
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: `1px solid #e2e8f0`,
            overflow: 'hidden',
            zIndex: 1000
        },
        dropdownItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem 1.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s',
            color: colors.dark,
            textDecoration: 'none',
            borderBottom: `1px solid #e2e8f0`
        },
        dropdownItemHover: {
            backgroundColor: colors.primary + '10',
            color: colors.primary
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
            padding: '1rem 1.5rem',
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
        },
        loginBtn: {
            backgroundColor: colors.primary,
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'background-color 0.3s'
        },
        registerBtn: {
            border: `2px solid ${colors.primary}`,
            color: colors.primary,
            padding: '0.5rem 1.5rem',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: '500'
        }
    };

    return (
        <nav style={styles.navbar}>
            <div style={styles.container}>
                {/* Logo */}
                <Link to="/" style={styles.logo}>
                    <HiOutlineCube size={32} />
                    <span>ArchiMarket3D</span>
                </Link>

                {/* Menú hamburguesa (móvil) */}
                <div style={styles.menuIcon} onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? <FiX /> : <FiMenu />}
                </div>

                {/* Enlaces de navegación */}
                <div style={styles.navLinks}>
                    <Link
                        to="/"
                        style={styles.link}
                        onMouseEnter={(e) => {
                            e.target.style.color = colors.primary;
                            e.target.style.backgroundColor = colors.primary + '10';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = colors.dark;
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        Inicio
                    </Link>

                    <Link
                        to="/models"
                        style={styles.link}
                        onMouseEnter={(e) => {
                            e.target.style.color = colors.primary;
                            e.target.style.backgroundColor = colors.primary + '10';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = colors.dark;
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        Modelos
                    </Link>

                    <Link
                        to="/categories"
                        style={styles.link}
                        onMouseEnter={(e) => {
                            e.target.style.color = colors.primary;
                            e.target.style.backgroundColor = colors.primary + '10';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = colors.dark;
                            e.target.style.backgroundColor = 'transparent';
                        }}
                    >
                        Categorías
                    </Link>

                    <Link
                        to="/licenses"
                        style={styles.link}
                        onMouseEnter={(e) => {
                            e.target.style.color = colors.primary;
                            e.target.style.backgroundColor = colors.primary + '10';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.color = colors.dark;
                            e.target.style.backgroundColor = 'transparent';
                        }}
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
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = colors.primary + '10';
                                                e.target.style.color = colors.primary;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = colors.dark;
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <FiUser /> Mi Perfil
                                        </Link>

                                        <Link
                                            to="/purchases"
                                            style={styles.dropdownItem}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = colors.primary + '10';
                                                e.target.style.color = colors.primary;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = colors.dark;
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <FiShoppingCart /> Mis Compras
                                        </Link>

                                        <Link
                                            to="/downloads"
                                            style={styles.dropdownItem}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = colors.primary + '10';
                                                e.target.style.color = colors.primary;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = colors.dark;
                                            }}
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <FiDownload /> Descargas
                                        </Link>

                                        <div style={styles.dropdownDivider} />

                                        <div
                                            style={{ ...styles.dropdownItem, ...styles.dropdownLogout }}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = colors.danger + '10';
                                                e.target.style.color = colors.danger;
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = colors.danger;
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
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link
                                to="/login"
                                style={styles.link}
                                onMouseEnter={(e) => {
                                    e.target.style.color = colors.primary;
                                    e.target.style.backgroundColor = colors.primary + '10';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = colors.dark;
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                style={styles.registerBtn}
                                onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = colors.primary + '10';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                }}
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;