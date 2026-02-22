import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSettings,
    FiShield,
    FiCreditCard,
    FiMail,
    FiGlobe,
    FiBell,
    FiLock,
    FiUsers,
    FiDatabase,
    FiCloud,
    FiSliders,
    FiToggleLeft,
    FiToggleRight,
    FiSave,
    FiRefreshCw,
    FiAlertCircle,
    FiCheckCircle,
    FiXCircle,
    FiEye,
    FiEyeOff,
    FiKey,
    FiLink,
    FiDownload,
    FiUpload,
    FiTrash2
} from 'react-icons/fi';
import { colors } from '../../styles/theme';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const Settings = () => {
    const { showSuccess, showError, showInfo } = useNotification();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showApiKey, setShowApiKey] = useState({});
    const [settings, setSettings] = useState({
        general: {
            siteName: 'ArchiMarket3D',
            siteUrl: 'https://archimarket3d.com',
            adminEmail: 'admin@archimarket3d.com',
            supportEmail: 'soporte@archimarket3d.com',
            maintenanceMode: false,
            registrationEnabled: true,
            emailVerification: true
        },
        payments: {
            currency: 'USD',
            taxRate: 16,
            stripeEnabled: false,
            stripePublicKey: '',
            stripeSecretKey: '',
            paypalEnabled: false,
            paypalClientId: '',
            paypalSecret: '',
            mercadoPagoEnabled: false,
            mercadoPagoAccessToken: ''
        },
        email: {
            mailer: 'smtp',
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUsername: '',
            smtpPassword: '',
            smtpEncryption: 'tls',
            fromAddress: 'noreply@archimarket3d.com',
            fromName: 'ArchiMarket3D'
        },
        security: {
            twoFactorAuth: false,
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            requireUppercase: true,
            requireNumbers: true,
            requireSpecialChars: false,
            ipWhitelist: []
        },
        backup: {
            autoBackup: true,
            backupFrequency: 'daily',
            backupTime: '02:00',
            keepBackups: 7,
            lastBackup: '2026-02-20 02:00',
            backupSize: '1.2 GB'
        }
    });

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        loadSettings();
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Simular carga de configuración
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Aquí iría la llamada a la API
            // const response = await API.get('/admin/settings');
            // setSettings(response.data);
        } catch (error) {
            console.error('Error cargando configuración:', error);
            showError('Error al cargar la configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Simular guardado
            await new Promise(resolve => setTimeout(resolve, 1500));
            showSuccess('✅ Configuración guardada correctamente');
        } catch (error) {
            console.error('Error guardando configuración:', error);
            showError('❌ Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (section, field, value) => {
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [field]: value
            }
        });
    };

    const handleBackup = async () => {
        try {
            showInfo('📦 Creando respaldo...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            showSuccess('✅ Respaldo creado correctamente');
        } catch (error) {
            showError('❌ Error al crear respaldo');
        }
    };

    const handleRestore = async () => {
        try {
            showInfo('🔄 Restaurando respaldo...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            showSuccess('✅ Respaldo restaurado correctamente');
        } catch (error) {
            showError('❌ Error al restaurar respaldo');
        }
    };

    const toggleApiKey = (key) => {
        setShowApiKey({
            ...showApiKey,
            [key]: !showApiKey[key]
        });
    };

    const styles = {
        container: {
            padding: isMobile ? '1rem' : '1.5rem',
            width: '100%'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
        },
        title: {
            fontSize: isMobile ? '1.3rem' : '1.5rem',
            fontWeight: '600',
            color: colors.dark,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        saveButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: colors.primary,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.95rem',
            opacity: saving ? 0.7 : 1
        },
        // Tabs
        tabsContainer: {
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '0.5rem',
            marginBottom: '2rem',
            backgroundColor: '#f8fafc',
            padding: '0.5rem',
            borderRadius: '10px',
            border: `2px solid ${colors.primary}`
        },
        tab: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            color: '#64748b',
            flex: isMobile ? 'none' : 1,
            justifyContent: isMobile ? 'flex-start' : 'center'
        },
        tabActive: {
            backgroundColor: colors.white,
            color: colors.primary,
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        },
        // Contenido
        content: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: isMobile ? '1.5rem' : '2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            border: `2px solid ${colors.primary}`
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        formGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '1.5rem',
            marginBottom: '1.5rem'
        },
        formGroup: {
            marginBottom: '1.5rem'
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            color: colors.dark,
            fontWeight: '500'
        },
        input: {
            width: '100%',
            padding: '0.7rem 1rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            transition: 'border-color 0.3s',
            boxSizing: 'border-box',
            ':focus': {
                borderColor: colors.primary
            }
        },
        inputGroup: {
            display: 'flex',
            alignItems: 'center',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            overflow: 'hidden'
        },
        inputGroupField: {
            flex: 1,
            padding: '0.7rem 1rem',
            border: 'none',
            outline: 'none',
            fontSize: '0.95rem'
        },
        inputGroupAddon: {
            padding: '0.7rem 1rem',
            backgroundColor: '#f8fafc',
            borderLeft: '1px solid #e2e8f0',
            color: '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        select: {
            width: '100%',
            padding: '0.7rem 1rem',
            border: `2px solid ${colors.primary}`,
            borderRadius: '8px',
            fontSize: '0.95rem',
            outline: 'none',
            backgroundColor: '#fff'
        },
        checkboxGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
        },
        checkbox: {
            width: '18px',
            height: '18px',
            cursor: 'pointer'
        },
        checkboxLabel: {
            fontSize: '0.95rem',
            color: colors.dark,
            cursor: 'pointer'
        },
        // Tarjetas de configuración
        cardGrid: {
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem'
        },
        card: {
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '1rem',
            border: `2px solid ${colors.primary}`
        },
        cardTitle: {
            fontSize: '0.9rem',
            fontWeight: '600',
            color: colors.dark,
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        cardValue: {
            fontSize: '1.2rem',
            fontWeight: '700',
            color: colors.primary,
            marginBottom: '0.25rem'
        },
        cardLabel: {
            fontSize: '0.8rem',
            color: '#64748b'
        },
        // Sección de respaldos
        backupSection: {
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '1rem',
            marginTop: '1rem'
        },
        backupRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: '1px solid #e2e8f0'
        },
        backupInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        backupActions: {
            display: 'flex',
            gap: '0.5rem'
        },
        backupButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: `2px solid ${colors.primary}`,
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            color: colors.dark
        },
        dangerButton: {
            backgroundColor: colors.danger + '10',
            color: colors.danger,
            borderColor: colors.danger + '20'
        },
        warning: {
            backgroundColor: colors.warning + '10',
            color: colors.warning,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
        },
        success: {
            backgroundColor: colors.success + '10',
            color: colors.success,
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
        },
        loadingState: {
            textAlign: 'center',
            padding: '3rem',
            color: colors.primary
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingState}>
                    <div style={{ marginBottom: '1rem' }}>Cargando configuración...</div>
                    <div style={{ width: '50px', height: '50px', border: `3px solid ${colors.primary}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>

                <button
                    style={styles.saveButton}
                    onClick={handleSave}
                    disabled={saving}
                >
                    <FiSave />
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>

            {/* Tabs */}
            <div style={styles.tabsContainer}>
                {[
                    { id: 'general', icon: <FiSettings />, label: 'General' },
                    { id: 'payments', icon: <FiCreditCard />, label: 'Pagos' },
                    { id: 'email', icon: <FiMail />, label: 'Email' },
                    { id: 'security', icon: <FiShield />, label: 'Seguridad' },
                    { id: 'backup', icon: <FiDatabase />, label: 'Respaldos' }
                ].map(tab => (
                    <div
                        key={tab.id}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab.id ? styles.tabActive : {})
                        }}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </div>
                ))}
            </div>

            {/* Contenido */}
            <div style={styles.content}>
                <AnimatePresence mode="wait">
                    {/* General */}
                    {activeTab === 'general' && (
                        <motion.div
                            key="general"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h3 style={styles.sectionTitle}>
                                <FiGlobe /> Información general
                            </h3>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Nombre del sitio</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={settings.general.siteName}
                                        onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>URL del sitio</label>
                                    <input
                                        type="url"
                                        style={styles.input}
                                        value={settings.general.siteUrl}
                                        onChange={(e) => handleInputChange('general', 'siteUrl', e.target.value)}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email del administrador</label>
                                    <input
                                        type="email"
                                        style={styles.input}
                                        value={settings.general.adminEmail}
                                        onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Email de soporte</label>
                                    <input
                                        type="email"
                                        style={styles.input}
                                        value={settings.general.supportEmail}
                                        onChange={(e) => handleInputChange('general', 'supportEmail', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <div style={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        id="maintenanceMode"
                                        style={styles.checkbox}
                                        checked={settings.general.maintenanceMode}
                                        onChange={(e) => handleInputChange('general', 'maintenanceMode', e.target.checked)}
                                    />
                                    <label htmlFor="maintenanceMode" style={styles.checkboxLabel}>
                                        Modo mantenimiento
                                    </label>
                                </div>
                                <div style={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        id="registrationEnabled"
                                        style={styles.checkbox}
                                        checked={settings.general.registrationEnabled}
                                        onChange={(e) => handleInputChange('general', 'registrationEnabled', e.target.checked)}
                                    />
                                    <label htmlFor="registrationEnabled" style={styles.checkboxLabel}>
                                        Permitir registro de usuarios
                                    </label>
                                </div>
                                <div style={styles.checkboxGroup}>
                                    <input
                                        type="checkbox"
                                        id="emailVerification"
                                        style={styles.checkbox}
                                        checked={settings.general.emailVerification}
                                        onChange={(e) => handleInputChange('general', 'emailVerification', e.target.checked)}
                                    />
                                    <label htmlFor="emailVerification" style={styles.checkboxLabel}>
                                        Requerir verificación de email
                                    </label>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Pagos */}
                    {activeTab === 'payments' && (
                        <motion.div
                            key="payments"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h3 style={styles.sectionTitle}>
                                <FiCreditCard /> Configuración de pagos
                            </h3>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Moneda</label>
                                    <select
                                        style={styles.select}
                                        value={settings.payments.currency}
                                        onChange={(e) => handleInputChange('payments', 'currency', e.target.value)}
                                    >
                                        <option value="USD">USD - Dólar americano</option>
                                        <option value="MXN">MXN - Peso mexicano</option>
                                        <option value="EUR">EUR - Euro</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Tasa de impuesto (%)</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={settings.payments.taxRate}
                                        onChange={(e) => handleInputChange('payments', 'taxRate', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div style={styles.cardGrid}>
                                {/* Stripe */}
                                <div style={styles.card}>
                                    <div style={styles.cardTitle}>
                                        <FiCreditCard /> Stripe
                                    </div>
                                    <div style={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            id="stripeEnabled"
                                            style={styles.checkbox}
                                            checked={settings.payments.stripeEnabled}
                                            onChange={(e) => handleInputChange('payments', 'stripeEnabled', e.target.checked)}
                                        />
                                        <label htmlFor="stripeEnabled" style={styles.checkboxLabel}>
                                            Habilitado
                                        </label>
                                    </div>
                                    {settings.payments.stripeEnabled && (
                                        <>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Public Key</label>
                                                <div style={styles.inputGroup}>
                                                    <input
                                                        type={showApiKey.stripePublic ? 'text' : 'password'}
                                                        style={styles.inputGroupField}
                                                        value={settings.payments.stripePublicKey}
                                                        onChange={(e) => handleInputChange('payments', 'stripePublicKey', e.target.value)}
                                                    />
                                                    <div
                                                        style={styles.inputGroupAddon}
                                                        onClick={() => toggleApiKey('stripePublic')}
                                                    >
                                                        {showApiKey.stripePublic ? <FiEyeOff /> : <FiEye />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Secret Key</label>
                                                <div style={styles.inputGroup}>
                                                    <input
                                                        type={showApiKey.stripeSecret ? 'text' : 'password'}
                                                        style={styles.inputGroupField}
                                                        value={settings.payments.stripeSecretKey}
                                                        onChange={(e) => handleInputChange('payments', 'stripeSecretKey', e.target.value)}
                                                    />
                                                    <div
                                                        style={styles.inputGroupAddon}
                                                        onClick={() => toggleApiKey('stripeSecret')}
                                                    >
                                                        {showApiKey.stripeSecret ? <FiEyeOff /> : <FiEye />}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* PayPal */}
                                <div style={styles.card}>
                                    <div style={styles.cardTitle}>
                                        <FiCreditCard /> PayPal
                                    </div>
                                    <div style={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            id="paypalEnabled"
                                            style={styles.checkbox}
                                            checked={settings.payments.paypalEnabled}
                                            onChange={(e) => handleInputChange('payments', 'paypalEnabled', e.target.checked)}
                                        />
                                        <label htmlFor="paypalEnabled" style={styles.checkboxLabel}>
                                            Habilitado
                                        </label>
                                    </div>
                                    {settings.payments.paypalEnabled && (
                                        <>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Client ID</label>
                                                <div style={styles.inputGroup}>
                                                    <input
                                                        type={showApiKey.paypalClient ? 'text' : 'password'}
                                                        style={styles.inputGroupField}
                                                        value={settings.payments.paypalClientId}
                                                        onChange={(e) => handleInputChange('payments', 'paypalClientId', e.target.value)}
                                                    />
                                                    <div
                                                        style={styles.inputGroupAddon}
                                                        onClick={() => toggleApiKey('paypalClient')}
                                                    >
                                                        {showApiKey.paypalClient ? <FiEyeOff /> : <FiEye />}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={styles.formGroup}>
                                                <label style={styles.label}>Secret</label>
                                                <div style={styles.inputGroup}>
                                                    <input
                                                        type={showApiKey.paypalSecret ? 'text' : 'password'}
                                                        style={styles.inputGroupField}
                                                        value={settings.payments.paypalSecret}
                                                        onChange={(e) => handleInputChange('payments', 'paypalSecret', e.target.value)}
                                                    />
                                                    <div
                                                        style={styles.inputGroupAddon}
                                                        onClick={() => toggleApiKey('paypalSecret')}
                                                    >
                                                        {showApiKey.paypalSecret ? <FiEyeOff /> : <FiEye />}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* MercadoPago */}
                                <div style={styles.card}>
                                    <div style={styles.cardTitle}>
                                        <FiCreditCard /> MercadoPago
                                    </div>
                                    <div style={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            id="mercadopagoEnabled"
                                            style={styles.checkbox}
                                            checked={settings.payments.mercadoPagoEnabled}
                                            onChange={(e) => handleInputChange('payments', 'mercadoPagoEnabled', e.target.checked)}
                                        />
                                        <label htmlFor="mercadopagoEnabled" style={styles.checkboxLabel}>
                                            Habilitado
                                        </label>
                                    </div>
                                    {settings.payments.mercadoPagoEnabled && (
                                        <div style={styles.formGroup}>
                                            <label style={styles.label}>Access Token</label>
                                            <div style={styles.inputGroup}>
                                                <input
                                                    type={showApiKey.mpToken ? 'text' : 'password'}
                                                    style={styles.inputGroupField}
                                                    value={settings.payments.mercadoPagoAccessToken}
                                                    onChange={(e) => handleInputChange('payments', 'mercadoPagoAccessToken', e.target.value)}
                                                />
                                                <div
                                                    style={styles.inputGroupAddon}
                                                    onClick={() => toggleApiKey('mpToken')}
                                                >
                                                    {showApiKey.mpToken ? <FiEyeOff /> : <FiEye />}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Email */}
                    {activeTab === 'email' && (
                        <motion.div
                            key="email"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h3 style={styles.sectionTitle}>
                                <FiMail /> Configuración de email
                            </h3>

                            <div style={styles.warning}>
                                <FiAlertCircle /> Estos datos son sensibles. Asegúrate de guardarlos de forma segura.
                            </div>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Mailer</label>
                                    <select
                                        style={styles.select}
                                        value={settings.email.mailer}
                                        onChange={(e) => handleInputChange('email', 'mailer', e.target.value)}
                                    >
                                        <option value="smtp">SMTP</option>
                                        <option value="mailgun">Mailgun</option>
                                        <option value="ses">Amazon SES</option>
                                        <option value="sendmail">Sendmail</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SMTP Host</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={settings.email.smtpHost}
                                        onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SMTP Port</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={settings.email.smtpPort}
                                        onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SMTP Username</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={settings.email.smtpUsername}
                                        onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SMTP Password</label>
                                    <div style={styles.inputGroup}>
                                        <input
                                            type={showApiKey.smtpPassword ? 'text' : 'password'}
                                            style={styles.inputGroupField}
                                            value={settings.email.smtpPassword}
                                            onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                                        />
                                        <div
                                            style={styles.inputGroupAddon}
                                            onClick={() => toggleApiKey('smtpPassword')}
                                        >
                                            {showApiKey.smtpPassword ? <FiEyeOff /> : <FiEye />}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>SMTP Encryption</label>
                                    <select
                                        style={styles.select}
                                        value={settings.email.smtpEncryption}
                                        onChange={(e) => handleInputChange('email', 'smtpEncryption', e.target.value)}
                                    >
                                        <option value="tls">TLS</option>
                                        <option value="ssl">SSL</option>
                                        <option value="none">None</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>From Address</label>
                                    <input
                                        type="email"
                                        style={styles.input}
                                        value={settings.email.fromAddress}
                                        onChange={(e) => handleInputChange('email', 'fromAddress', e.target.value)}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>From Name</label>
                                    <input
                                        type="text"
                                        style={styles.input}
                                        value={settings.email.fromName}
                                        onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Seguridad */}
                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h3 style={styles.sectionTitle}>
                                <FiShield /> Configuración de seguridad
                            </h3>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Tiempo de sesión (minutos)</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={settings.security.sessionTimeout}
                                        onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Intentos máximos de login</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={settings.security.maxLoginAttempts}
                                        onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Longitud mínima de contraseña</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={settings.security.passwordMinLength}
                                        onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="twoFactorAuth"
                                    style={styles.checkbox}
                                    checked={settings.security.twoFactorAuth}
                                    onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                                />
                                <label htmlFor="twoFactorAuth" style={styles.checkboxLabel}>
                                    Requerir autenticación de dos factores para administradores
                                </label>
                            </div>

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="requireUppercase"
                                    style={styles.checkbox}
                                    checked={settings.security.requireUppercase}
                                    onChange={(e) => handleInputChange('security', 'requireUppercase', e.target.checked)}
                                />
                                <label htmlFor="requireUppercase" style={styles.checkboxLabel}>
                                    Requerir mayúsculas en contraseñas
                                </label>
                            </div>

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="requireNumbers"
                                    style={styles.checkbox}
                                    checked={settings.security.requireNumbers}
                                    onChange={(e) => handleInputChange('security', 'requireNumbers', e.target.checked)}
                                />
                                <label htmlFor="requireNumbers" style={styles.checkboxLabel}>
                                    Requerir números en contraseñas
                                </label>
                            </div>

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="requireSpecialChars"
                                    style={styles.checkbox}
                                    checked={settings.security.requireSpecialChars}
                                    onChange={(e) => handleInputChange('security', 'requireSpecialChars', e.target.checked)}
                                />
                                <label htmlFor="requireSpecialChars" style={styles.checkboxLabel}>
                                    Requerir caracteres especiales en contraseñas
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {/* Respaldos */}
                    {activeTab === 'backup' && (
                        <motion.div
                            key="backup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h3 style={styles.sectionTitle}>
                                <FiDatabase /> Respaldos de base de datos
                            </h3>

                            <div style={styles.success}>
                                <FiCheckCircle /> Último respaldo: {settings.backup.lastBackup} ({settings.backup.backupSize})
                            </div>

                            <div style={styles.formGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Frecuencia de respaldo</label>
                                    <select
                                        style={styles.select}
                                        value={settings.backup.backupFrequency}
                                        onChange={(e) => handleInputChange('backup', 'backupFrequency', e.target.value)}
                                    >
                                        <option value="hourly">Cada hora</option>
                                        <option value="daily">Diario</option>
                                        <option value="weekly">Semanal</option>
                                        <option value="monthly">Mensual</option>
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Hora del respaldo</label>
                                    <input
                                        type="time"
                                        style={styles.input}
                                        value={settings.backup.backupTime}
                                        onChange={(e) => handleInputChange('backup', 'backupTime', e.target.value)}
                                    />
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Mantener respaldos (días)</label>
                                    <input
                                        type="number"
                                        style={styles.input}
                                        value={settings.backup.keepBackups}
                                        onChange={(e) => handleInputChange('backup', 'keepBackups', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div style={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    id="autoBackup"
                                    style={styles.checkbox}
                                    checked={settings.backup.autoBackup}
                                    onChange={(e) => handleInputChange('backup', 'autoBackup', e.target.checked)}
                                />
                                <label htmlFor="autoBackup" style={styles.checkboxLabel}>
                                    Activar respaldos automáticos
                                </label>
                            </div>

                            <div style={styles.backupSection}>
                                <h4 style={{ marginBottom: '1rem', color: colors.dark }}>Acciones manuales</h4>
                                
                                <div style={styles.backupRow}>
                                    <div style={styles.backupInfo}>
                                        <FiDatabase /> Crear nuevo respaldo manual
                                    </div>
                                    <div style={styles.backupActions}>
                                        <button
                                            style={styles.backupButton}
                                            onClick={handleBackup}
                                        >
                                            <FiUpload /> Crear respaldo
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.backupRow}>
                                    <div style={styles.backupInfo}>
                                        <FiDownload /> Restaurar desde respaldo
                                    </div>
                                    <div style={styles.backupActions}>
                                        <button
                                            style={{ ...styles.backupButton, ...styles.dangerButton }}
                                            onClick={handleRestore}
                                        >
                                            <FiDownload /> Restaurar
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.backupRow}>
                                    <div style={styles.backupInfo}>
                                        <FiTrash2 /> Limpiar respaldos antiguos
                                    </div>
                                    <div style={styles.backupActions}>
                                        <button
                                            style={{ ...styles.backupButton, ...styles.dangerButton }}
                                            onClick={() => showInfo('🗑️ Respaldos limpiados')}
                                        >
                                            <FiTrash2 /> Limpiar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
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

export default Settings;