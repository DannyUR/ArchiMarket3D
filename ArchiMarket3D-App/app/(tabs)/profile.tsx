// app/(tabs)/profile.tsx
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Alert, StyleSheet, Switch, RefreshControl,
    Modal, Platform, Linking
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../api/client';

interface License {
    id: number;
    license_type: string;
    purchase_date: string;
    expires_at: string;
    price_paid: number;
    is_active: boolean;
    is_expired: boolean;
    model: {
        id: number;
        name: string;
    };
}

interface PurchaseModel {
    id: number;
    name: string;
    format: string;
    size_mb: number;
    price?: number;
    pivot: {
        license_type: string;
        unit_price: number;
    };
}

interface Purchase {
    id: number;
    total: number;
    status: string;
    purchase_date: string;
    payment_method?: string;
    transaction_id?: string;
    models: PurchaseModel[];
}

interface DownloadFormat {
    format: string;
    size_bytes: number;
    url: string;
}

interface DownloadInfo {
    is_downloadable: boolean;
    available_formats: DownloadFormat[];
    total_size_mb: number;
}

export default function ProfileScreen() {
    const { user, logout, updateProfile } = useAuth();
    const { settings, updateSetting } = useSettings();
    const [activeTab, setActiveTab] = useState<'profile' | 'licenses' | 'purchases' | 'settings'>('profile');
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Estados para licencias
    const [licenses, setLicenses] = useState<License[]>([]);
    const [licensesLoading, setLicensesLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ active: 0, expired: 0, total: 0 });

    // Estados para compras
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [purchasesLoading, setPurchasesLoading] = useState(true);

    // Estado para modal de detalles de compra
    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Estado para modal de formatos de descarga
    const [downloadModalVisible, setDownloadModalVisible] = useState(false);
    const [selectedModel, setSelectedModel] = useState<PurchaseModel | null>(null);
    const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
    const [downloadingFormats, setDownloadingFormats] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Formulario de edición - SIN BIOGRAFÍA
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
    });

    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [qualityModalVisible, setQualityModalVisible] = useState(false);

    // Cambiar idioma
    const changeLanguage = async (locale: string) => {
        await updateSetting('language', locale);
        setLanguageModalVisible(false);
    };

    // Cambiar calidad de descarga
    const changeDownloadQuality = async (quality: 'high' | 'medium' | 'low') => {
        await updateSetting('downloadQuality', quality);
        setQualityModalVisible(false);
    };

    // Enviar correo de soporte
    const sendSupportEmail = () => {
        const subject = encodeURIComponent('Soporte ArchiMarket3D');
        const body = encodeURIComponent(`Usuario: ${user?.email || 'No especificado'}\n\nPor favor describe tu problema:\n\n`);
        const emailUrl = `mailto:soporte@archimarket3d.com?subject=${subject}&body=${body}`;

        Linking.openURL(emailUrl).catch(() => {
            Alert.alert(
                'Error',
                'No se pudo abrir el cliente de correo. Por favor, escribe a soporte@archimarket3d.com'
            );
        });
    };

    // Exportar datos
    const exportUserData = async () => {
        try {
            Alert.alert('Exportar datos', 'Preparando tus datos para exportación...');

            const userData = {
                user: user,
                purchases: purchases,
                licenses: licenses,
                settings: settings,
                exportDate: new Date().toISOString(),
            };

            const jsonString = JSON.stringify(userData, null, 2);
            const fileName = `archimarket3d_data_${Date.now()}.json`;

            if (Platform.OS === 'web') {
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                link.remove();
                URL.revokeObjectURL(url);
                Alert.alert('Éxito', 'Tus datos han sido exportados');
            } else {
                const fileUri = FileSystem.documentDirectory + fileName;
                await FileSystem.writeAsStringAsync(fileUri, jsonString);
                await Sharing.shareAsync(fileUri);
            }
        } catch (error) {
            console.error('Error exporting data:', error);
            Alert.alert('Error', 'No se pudieron exportar los datos');
        }
    };

    // Eliminar cuenta
    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            '⚠️ ADVERTENCIA: Esta acción eliminará tu cuenta permanentemente y no se puede deshacer.\n\n¿Estás seguro de que deseas continuar?'
        );

        if (!confirmed) return;

        const finalConfirm = window.confirm(
            'Por favor confirma una última vez que deseas ELIMINAR tu cuenta.'
        );

        if (!finalConfirm) return;

        try {
            console.log('🗑️ Eliminando cuenta...');
            await api.delete('/user/account');
            console.log('✅ Cuenta eliminada');

            // Limpiar sesión
            await AsyncStorage.multiRemove(['@auth_token', '@user_data', '@user_settings']);

            // Logout
            await logout();

            // Navegar a registro
            setTimeout(() => {
                router.replace('/(auth)/register');
            }, 500);

            Alert.alert('Éxito', 'Tu cuenta ha sido eliminada');
        } catch (error: any) {
            console.error('❌ Error al eliminar cuenta:', error);
            Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar la cuenta');
        }
    };

    // Cargar datos del usuario - SIN BIOGRAFÍA
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                company: user.company || '',
            });
        }
    }, [user]);

    // Cargar licencias cuando se activa el tab
    useEffect(() => {
        if (activeTab === 'licenses') {
            fetchLicenses();
        }
    }, [activeTab]);

    // Cargar compras cuando se activa el tab
    useEffect(() => {
        if (activeTab === 'purchases') {
            fetchPurchases();
        }
    }, [activeTab]);

    const fetchLicenses = async () => {
        setLicensesLoading(true);
        try {
            const response = await api.get('/my-licenses');
            const userLicenses = response.data?.data?.licenses || [];
            setLicenses(userLicenses);
            const active = userLicenses.filter((l: License) => l.is_active && !l.is_expired).length;
            const expired = userLicenses.filter((l: License) => l.is_expired).length;
            setStats({ active, expired, total: userLicenses.length });
        } catch (error: any) {
            console.error('Error fetching licenses:', error);
            if (error.response?.status === 401) {
                Alert.alert('Sesión expirada', 'Por favor, inicia sesión nuevamente', [
                    { text: 'Ir a login', onPress: () => { logout(); router.replace('/auth/login'); } }
                ]);
            }
        } finally {
            setLicensesLoading(false);
        }
    };

    const calculateTotalSpent = (): string => {
        try {
            if (!Array.isArray(purchases)) return '0.00';
            const total = purchases.reduce((acc, p) => acc + (p?.total || 0), 0);
            return total.toFixed(2);
        } catch (e) {
            return '0.00';
        }
    };

    const getCompletedPurchasesCount = (): number => {
        try {
            if (!Array.isArray(purchases)) return 0;
            return purchases.filter(p => p?.status === 'completed').length;
        } catch (e) {
            return 0;
        }
    };

    const getTotalModelsCount = (): number => {
        try {
            if (!Array.isArray(purchases)) return 0;
            return purchases.reduce((acc, p) => acc + (p.models?.length || 0), 0);
        } catch (e) {
            return 0;
        }
    };

    const fetchPurchases = async () => {
        setPurchasesLoading(true);
        try {
            const response = await api.get('/purchases');
            let purchasesData = [];

            if (response.data?.data) {
                purchasesData = Array.isArray(response.data.data) ? response.data.data :
                    (Array.isArray(response.data.data?.data) ? response.data.data.data : []);
            } else if (Array.isArray(response.data)) {
                purchasesData = response.data;
            }

            const validatedPurchases = purchasesData.map((p: any) => ({
                id: p?.id || 0,
                total: parseFloat(p?.total || '0'),
                status: p?.status || 'pending',
                purchase_date: p?.purchase_date || new Date().toISOString(),
                payment_method: p?.payment_method || 'PayPal',
                transaction_id: p?.transaction_id || `TRX-${p?.id || '000'}`,
                models: Array.isArray(p?.models) ? p.models : []
            }));

            setPurchases(validatedPurchases);
        } catch (error) {
            console.error('Error fetching purchases:', error);
            setPurchases([]);
        } finally {
            setPurchasesLoading(false);
        }
    };

    const fetchDownloadInfo = async (modelId: number) => {
        setDownloadingFormats(true);
        try {
            const response = await api.get(`/models/${modelId}/formats`);
            const availableFormats = response.data?.data || [];

            const formats: DownloadFormat[] = availableFormats.map((format: any) => ({
                format: typeof format === 'string' ? format : (format.format || 'Desconocido'),
                size_bytes: format.size_bytes || 0,
                url: ''
            }));

            setDownloadInfo({
                is_downloadable: formats.length > 0,
                available_formats: formats,
                total_size_mb: formats.reduce((acc, f) => acc + (f.size_bytes / 1024 / 1024), 0)
            });

            if (formats.length > 0) {
                setSelectedFormat(formats[0].format);
            }
        } catch (error) {
            console.error('Error fetching download info:', error);
            setDownloadInfo({ is_downloadable: false, available_formats: [], total_size_mb: 0 });
        } finally {
            setDownloadingFormats(false);
        }
    };

    const handleDownload = async () => {
        if (!selectedFormat || !downloadInfo || !selectedModel) {
            Alert.alert('Error', 'Selecciona un formato para descargar');
            return;
        }

        setIsDownloading(true);
        try {
            const downloadUrl = `/models/${selectedModel.id}/download?format=${selectedFormat}`;
            const response = await api.get(downloadUrl, { responseType: 'blob', timeout: 60000 });

            if (!response.data || response.data.size === 0) {
                Alert.alert('Error', 'El archivo está vacío');
                return;
            }

            const fileName = `${selectedModel.name.replace(/[^a-z0-9]/gi, '_')}.${selectedFormat.toLowerCase()}`;

            if (Platform.OS === 'web') {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                Alert.alert('Descarga completada', `${selectedModel.name} descargado correctamente`);
            } else {
                const downloadUri = FileSystem.documentDirectory + fileName;
                const reader = new FileReader();
                reader.onload = async () => {
                    const base64 = reader.result;
                    if (typeof base64 === 'string') {
                        await FileSystem.writeAsStringAsync(downloadUri, base64.split(',')[1], {
                            encoding: FileSystem.EncodingType.Base64
                        });
                        if (await Sharing.isAvailableAsync()) {
                            await Sharing.shareAsync(downloadUri);
                        }
                    }
                };
                reader.readAsDataURL(new Blob([response.data]));
            }

            setDownloadModalVisible(false);
            setSelectedModel(null);
            setDownloadInfo(null);
        } catch (error: any) {
            console.error('Download error:', error);
            Alert.alert('Error', 'No se pudo completar la descarga');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleViewPurchaseDetails = (purchase: Purchase) => {
        setSelectedPurchase(purchase);
        setModalVisible(true);
    };

    const handleDownloadModel = async (model: PurchaseModel) => {
        setSelectedModel(model);
        await fetchDownloadInfo(model.id);
        setDownloadModalVisible(true);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        if (activeTab === 'licenses') await fetchLicenses();
        if (activeTab === 'purchases') await fetchPurchases();
        setRefreshing(false);
    }, [activeTab]);

    // app/(tabs)/profile.tsx - Mejorar handleUpdateProfile
    const handleUpdateProfile = async () => {
        if (!formData.name?.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }

        setLoading(true);
        try {
            console.log('📝 Actualizando perfil con datos:', formData);

            // Actualizar perfil
            const updatedUser = await updateProfile(formData);

            console.log('✅ Perfil actualizado:', updatedUser);

            // ✅ Actualizar el formData con los datos actualizados
            if (updatedUser) {
                setFormData({
                    name: updatedUser.name || '',
                    email: updatedUser.email || '',
                    phone: updatedUser.phone || '',
                    company: updatedUser.company || '',
                });
            }

            // Mostrar mensaje de éxito
            Alert.alert('Éxito', 'Perfil actualizado correctamente');

            // ✅ Solo salir del modo edición, NO redirigir
            setEditMode(false);

        } catch (error: any) {
            console.error('❌ Error actualizando perfil:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Error al actualizar perfil'
            );
        } finally {
            setLoading(false);
        }
    };

    // app/(tabs)/profile.tsx
    const handleLogout = async () => {
        // En web, usar confirm nativo de React Native
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
            if (!confirmed) return;
        } else {
            // Para móvil, usar Alert
            return new Promise((resolve) => {
                Alert.alert(
                    'Cerrar Sesión',
                    '¿Estás seguro de que deseas cerrar sesión?',
                    [
                        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                        {
                            text: 'Cerrar Sesión',
                            style: 'destructive',
                            onPress: async () => {
                                try {
                                    // Limpiar settings
                                    await AsyncStorage.removeItem('@user_settings');
                                    // Ejecutar logout
                                    await logout();
                                    resolve(true);
                                } catch (error) {
                                    console.error('Error en logout:', error);
                                    Alert.alert('Error', 'No se pudo cerrar sesión');
                                    resolve(false);
                                }
                            }
                        }
                    ]
                );
            });
        }

        // Para web, ejecutar directamente
        if (Platform.OS === 'web') {
            try {
                await AsyncStorage.removeItem('@user_settings');
                await logout();
            } catch (error) {
                console.error('Error en logout:', error);
                Alert.alert('Error', 'No se pudo cerrar sesión');
            }
        }
    };


    const getLicenseTypeLabel = (type: string) => {
        const labels: Record<string, string> = { personal: 'Personal', business: 'Empresarial', unlimited: 'Ilimitada' };
        return labels[type] || type;
    };

    const getLicenseTypeColor = (type: string): string => {
        const colors: Record<string, string> = { personal: '#3b82f6', business: '#8b5cf6', unlimited: '#10b981' };
        return colors[type] || '#64748b';
    };

    const getFormatIcon = (format: string): string => {
        const ext = format.toLowerCase();
        if (ext === 'obj') return '📦';
        if (ext === 'fbx') return '📁';
        if (ext === 'gltf' || ext === 'glb') return '🔷';
        return '💾';
    };

    const getFormatColor = (format: string): string => {
        const ext = format.toLowerCase();
        if (ext === 'obj') return '#3b82f6';
        if (ext === 'fbx') return '#8b5cf6';
        if (ext === 'gltf' || ext === 'glb') return '#10b981';
        return '#2563eb';
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const formatShortDate = (dateString: string) => {
        if (!dateString) return 'Sin fecha';
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const getInitials = (name: string): string => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const formatSize = (bytes: number): string => {
        if (bytes === 0) return '0 MB';
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={['#1e40af', '#3b82f6', '#60a5fa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
                <View style={styles.profileInfo}>
                    <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>{getInitials(formData.name)}</Text>
                    </LinearGradient>
                    {editMode ? (
                        <TextInput style={styles.editNameInput} value={formData.name} onChangeText={(text) => setFormData({ ...formData, name: text })} placeholder="Tu nombre" placeholderTextColor="#94a3b8" />
                    ) : (
                        <Text style={styles.profileName}>{formData.name}</Text>
                    )}
                    <Text style={styles.profileEmail}>{formData.email}</Text>
                    <View style={styles.roleBadge}>
                        <LinearGradient colors={['#3b82f6', '#1d4ed8']} style={styles.roleBadgeGradient}>
                            <Ionicons name="star" size={12} color="#fff" />
                            <Text style={styles.roleText}>{user?.role === 'architect' ? 'Arquitecto' : user?.role === 'engineer' ? 'Ingeniero' : user?.role === 'company' ? 'Empresa' : 'Usuario'}</Text>
                        </LinearGradient>
                    </View>
                </View>
            </LinearGradient>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {[
                    { key: 'profile', label: 'Perfil', icon: 'person-outline' },
                    { key: 'licenses', label: 'Licencias', icon: 'document-text-outline' },
                    { key: 'purchases', label: 'Compras', icon: 'cart-outline' },
                    { key: 'settings', label: 'Ajustes', icon: 'settings-outline' }
                ].map((tab) => (
                    <TouchableOpacity key={tab.key} style={[styles.tab, activeTab === tab.key && styles.tabActive]} onPress={() => setActiveTab(tab.key as any)}>
                        <Ionicons name={tab.icon as any} size={22} color={activeTab === tab.key ? '#2563eb' : '#94a3b8'} />
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                        {activeTab === tab.key && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
                <View>
                    {/* TAB PERFIL - VERSIÓN CORREGIDA */}
                    {activeTab === 'profile' && (
                        <View style={styles.section}>
                            {!editMode ? (
                                <>
                                    <View style={styles.infoCard}>
                                        <View style={styles.infoCardHeader}>
                                            <Ionicons name="person-circle-outline" size={24} color="#2563eb" />
                                            <Text style={styles.infoCardTitle}>Información de cuenta</Text>
                                        </View>

                                        {/* Nombre */}
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="person-outline" size={18} color="#2563eb" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Nombre completo</Text>
                                                <Text style={styles.infoValue}>{formData.name || 'No especificado'}</Text>
                                            </View>
                                        </View>

                                        {/* Email */}
                                        <View style={styles.infoRow}>
                                            <View style={styles.infoIcon}>
                                                <Ionicons name="mail-outline" size={18} color="#2563eb" />
                                            </View>
                                            <View style={styles.infoContent}>
                                                <Text style={styles.infoLabel}>Correo electrónico</Text>
                                                <Text style={styles.infoValue}>{formData.email || 'No especificado'}</Text>
                                            </View>
                                        </View>

                                        {/* Teléfono (opcional) */}
                                        {formData.phone ? (
                                            <View style={styles.infoRow}>
                                                <View style={styles.infoIcon}>
                                                    <Ionicons name="call-outline" size={18} color="#2563eb" />
                                                </View>
                                                <View style={styles.infoContent}>
                                                    <Text style={styles.infoLabel}>Teléfono</Text>
                                                    <Text style={styles.infoValue}>{formData.phone}</Text>
                                                </View>
                                            </View>
                                        ) : null}

                                        {/* Empresa (opcional) */}
                                        {formData.company ? (
                                            <View style={styles.infoRow}>
                                                <View style={styles.infoIcon}>
                                                    <Ionicons name="business-outline" size={18} color="#2563eb" />
                                                </View>
                                                <View style={styles.infoContent}>
                                                    <Text style={styles.infoLabel}>Empresa</Text>
                                                    <Text style={styles.infoValue}>{formData.company}</Text>
                                                </View>
                                            </View>
                                        ) : null}
                                    </View>

                                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                                        <LinearGradient colors={['#2563eb', '#1d4ed8']} style={styles.editButtonGradient}>
                                            <Ionicons name="create-outline" size={20} color="#fff" />
                                            <Text style={styles.editButtonText}>Editar perfil</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.editForm}>
                                    {/* Nombre completo - OBLIGATORIO */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Nombre completo <Text style={styles.required}>*</Text></Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.name}
                                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                                            placeholder="Tu nombre completo"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    </View>

                                    {/* Email - NO EDITABLE */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Correo electrónico</Text>
                                        <TextInput
                                            style={[styles.input, styles.inputDisabled]}
                                            value={formData.email}
                                            editable={false}
                                            placeholder="tu@email.com"
                                            placeholderTextColor="#94a3b8"
                                        />
                                        <Text style={styles.inputHelper}>El email no se puede modificar</Text>
                                    </View>

                                    {/* Teléfono - OPCIONAL */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Teléfono <Text style={styles.optional}>(Opcional)</Text></Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.phone}
                                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                            placeholder="+52 123 456 7890"
                                            keyboardType="phone-pad"
                                            placeholderTextColor="#94a3b8"
                                        />
                                    </View>

                                    {/* Empresa - OPCIONAL */}
                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Empresa <Text style={styles.optional}>(Opcional)</Text></Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.company}
                                            onChangeText={(text) => setFormData({ ...formData, company: text })}
                                            placeholder="Nombre de tu empresa"
                                            placeholderTextColor="#94a3b8"
                                        />
                                        <Text style={styles.inputHelper}>Requerido solo para licencias empresariales</Text>
                                    </View>

                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity
                                            style={styles.cancelButton}
                                            onPress={() => {
                                                setEditMode(false);
                                                if (user) {
                                                    setFormData({
                                                        name: user.name || '',
                                                        email: user.email || '',
                                                        phone: user.phone || '',
                                                        company: user.company || '',
                                                    });
                                                }
                                            }}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                                            onPress={handleUpdateProfile}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <ActivityIndicator color="#fff" size="small" />
                                            ) : (
                                                <>
                                                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                                                    <Ionicons name="checkmark" size={18} color="#fff" />
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

                    {/* TAB LICENCIAS */}
                    {activeTab === 'licenses' && (
                        <View style={styles.section}>
                            <View style={styles.statsGrid}>
                                <View style={styles.statCard}>
                                    <Ionicons name="checkmark-circle" size={28} color="#10b981" />
                                    <Text style={styles.statValue}>{stats.active}</Text>
                                    <Text style={styles.statLabel}>Licencias activas</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Ionicons name="close-circle" size={28} color="#ef4444" />
                                    <Text style={styles.statValue}>{stats.expired}</Text>
                                    <Text style={styles.statLabel}>Licencias expiradas</Text>
                                </View>
                                <View style={styles.statCard}>
                                    <Ionicons name="document-text" size={28} color="#2563eb" />
                                    <Text style={styles.statValue}>{stats.total}</Text>
                                    <Text style={styles.statLabel}>Total de licencias</Text>
                                </View>
                            </View>
                            {licensesLoading ? (
                                <View style={styles.centerContainer}>
                                    <ActivityIndicator size="large" color="#2563eb" />
                                    <Text style={styles.loadingText}>Cargando licencias...</Text>
                                </View>
                            ) : licenses.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
                                    <Text style={styles.emptyTitle}>No tienes licencias aún</Text>
                                    <Text style={styles.emptyText}>Realiza tu primera compra para obtener licencias</Text>
                                    <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/explore')}>
                                        <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.licensesGrid}>
                                    {licenses.map((license) => {
                                        const color = getLicenseTypeColor(license.license_type);
                                        return (
                                            <TouchableOpacity key={license.id} style={styles.licenseCard} onPress={() => router.push(`/models/${license.model.id}`)} activeOpacity={0.7}>
                                                <View style={styles.licenseHeader}>
                                                    <View style={[styles.licenseIcon, { backgroundColor: color + '15' }]}>
                                                        <Ionicons name="cube-outline" size={24} color={color} />
                                                    </View>
                                                    <View style={styles.licenseTitle}>
                                                        <Text style={styles.licenseModelName}>{license.model.name}</Text>
                                                        <View style={[styles.licenseTypeBadge, { backgroundColor: color }]}>
                                                            <Text style={styles.licenseTypeText}>{getLicenseTypeLabel(license.license_type)}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={styles.licenseBody}>
                                                    <View style={styles.licenseRow}>
                                                        <View style={styles.licenseRowLeft}>
                                                            <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                                            <Text style={styles.licenseRowLabel}>Fecha de compra</Text>
                                                        </View>
                                                        <Text style={styles.licenseRowValue}>{new Date(license.purchase_date).toLocaleDateString()}</Text>
                                                    </View>
                                                    <View style={styles.licenseRow}>
                                                        <View style={styles.licenseRowLeft}>
                                                            <Ionicons name="time-outline" size={14} color="#64748b" />
                                                            <Text style={styles.licenseRowLabel}>Expiración</Text>
                                                        </View>
                                                        <Text style={styles.licenseRowValue}>{formatDate(license.expires_at)}</Text>
                                                    </View>
                                                    <View style={styles.licenseRow}>
                                                        <View style={styles.licenseRowLeft}>
                                                            <Ionicons name="cash-outline" size={14} color="#64748b" />
                                                            <Text style={styles.licenseRowLabel}>Precio pagado</Text>
                                                        </View>
                                                        <Text style={styles.licenseRowValue}>${license.price_paid}</Text>
                                                    </View>
                                                    <View style={styles.licenseRow}>
                                                        <View style={styles.licenseRowLeft}>
                                                            <Ionicons name="information-circle-outline" size={14} color="#64748b" />
                                                            <Text style={styles.licenseRowLabel}>Estado</Text>
                                                        </View>
                                                        <View style={[styles.licenseStatusBadge, { backgroundColor: license.is_active && !license.is_expired ? '#10b98115' : '#ef444415' }]}>
                                                            <Ionicons name={license.is_active && !license.is_expired ? "checkmark-circle" : "close-circle"} size={12} color={license.is_active && !license.is_expired ? '#10b981' : '#ef4444'} />
                                                            <Text style={[styles.licenseStatusText, { color: license.is_active && !license.is_expired ? '#10b981' : '#ef4444' }]}>
                                                                {license.is_active && !license.is_expired ? 'Activa' : 'Expirada'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={styles.licenseFooter}>
                                                    <LinearGradient colors={[color, color + 'dd']} style={styles.viewModelButton}>
                                                        <Ionicons name="eye-outline" size={18} color="#fff" />
                                                        <Text style={styles.viewModelButtonText}>Ver modelo</Text>
                                                    </LinearGradient>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}

                    {/* TAB MIS COMPRAS */}
                    {activeTab === 'purchases' && (
                        <View style={styles.section}>
                            {purchasesLoading ? (
                                <View style={styles.centerContainer}>
                                    <ActivityIndicator size="large" color="#2563eb" />
                                    <Text style={styles.loadingText}>Cargando tus compras...</Text>
                                </View>
                            ) : purchases.length === 0 ? (
                                <View style={styles.emptyPurchases}>
                                    <Ionicons name="cart-outline" size={64} color="#cbd5e1" />
                                    <Text style={styles.emptyTitle}>No tienes compras aún</Text>
                                    <Text style={styles.emptyText}>Realiza tu primera compra para ver tu historial</Text>
                                    <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/explore')}>
                                        <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.statsGrid}>
                                        <View style={styles.statCard}>
                                            <View style={styles.statIcon}>
                                                <Ionicons name="cash-outline" size={24} color="#2563eb" />
                                            </View>
                                            <View style={styles.statContent}>
                                                <Text style={styles.statValue}>${calculateTotalSpent()} MXN</Text>
                                                <Text style={styles.statLabel}>Total gastado</Text>
                                            </View>
                                        </View>
                                        <View style={styles.statCard}>
                                            <View style={styles.statIcon}>
                                                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                            </View>
                                            <View style={styles.statContent}>
                                                <Text style={styles.statValue}>{getCompletedPurchasesCount()}</Text>
                                                <Text style={styles.statLabel}>Compras completadas</Text>
                                            </View>
                                        </View>
                                        <View style={styles.statCard}>
                                            <View style={styles.statIcon}>
                                                <Ionicons name="cube-outline" size={24} color="#f59e0b" />
                                            </View>
                                            <View style={styles.statContent}>
                                                <Text style={styles.statValue}>{getTotalModelsCount()}</Text>
                                                <Text style={styles.statLabel}>Modelos adquiridos</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={styles.purchasesList}>
                                        {purchases.map((purchase) => (
                                            <TouchableOpacity key={purchase.id} style={styles.purchaseCard} activeOpacity={0.7} onPress={() => handleViewPurchaseDetails(purchase)}>
                                                <View style={styles.purchaseHeader}>
                                                    <View style={styles.purchaseId}>
                                                        <Text style={styles.purchaseNumber}>Compra #{purchase.id}</Text>
                                                        <View style={[styles.purchaseStatus, purchase.status === 'completed' && styles.purchaseStatusCompleted, purchase.status === 'pending' && styles.purchaseStatusPending]}>
                                                            <Ionicons name={purchase.status === 'completed' ? 'checkmark-circle' : 'time-outline'} size={14} color={purchase.status === 'completed' ? '#10b981' : '#f59e0b'} />
                                                            <Text style={[styles.purchaseStatusText, purchase.status === 'completed' && { color: '#10b981' }, purchase.status === 'pending' && { color: '#f59e0b' }]}>{purchase.status === 'completed' ? 'Completada' : 'Pendiente'}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.purchaseDate}>
                                                        <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                                        <Text style={styles.purchaseDateText}>{formatShortDate(purchase.purchase_date)}</Text>
                                                    </View>
                                                </View>
                                                <View style={styles.purchaseItems}>
                                                    {purchase.models?.slice(0, 3).map((model) => (
                                                        <View key={model.id} style={styles.itemPreview}>
                                                            <Ionicons name="cube-outline" size={16} color="#2563eb" />
                                                            <Text style={styles.itemName} numberOfLines={1}>{model.name}</Text>
                                                            <View style={styles.itemLicense}>
                                                                <Text style={styles.itemLicenseText}>{model.pivot?.license_type || 'Personal'}</Text>
                                                            </View>
                                                        </View>
                                                    ))}
                                                    {purchase.models?.length > 3 && (
                                                        <View style={styles.itemPreview}>
                                                            <Text style={styles.itemMore}>+{purchase.models.length - 3} más</Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={styles.purchaseFooter}>
                                                    <View>
                                                        <Text style={styles.purchaseFooterLabel}>Total pagado</Text>
                                                        <Text style={styles.purchaseTotal}>${purchase.total} MXN</Text>
                                                    </View>
                                                    <View style={styles.viewDetailsBadge}>
                                                        <Text style={styles.viewDetailsText}>Ver detalles</Text>
                                                        <Ionicons name="arrow-forward" size={14} color="#2563eb" />
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* TAB AJUSTES - CORREGIDO */}
                    {activeTab === 'settings' && (
                        <View style={styles.section}>
                            {/* Descargas */}
                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="download-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingsGroupTitle}>Descargas</Text>
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Descarga automática</Text>
                                        <Text style={styles.settingDescription}>Descargar modelos automáticamente al comprar</Text>
                                    </View>
                                    <Switch
                                        value={settings.autoDownload}
                                        onValueChange={(value) => updateSetting('autoDownload', value)}
                                        trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                                        thumbColor={settings.autoDownload ? '#fff' : '#fff'}
                                    />
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Guardar en galería</Text>
                                        <Text style={styles.settingDescription}>Guardar previsualizaciones en la galería</Text>
                                    </View>
                                    <Switch
                                        value={settings.saveToGallery}
                                        onValueChange={(value) => updateSetting('saveToGallery', value)}
                                        trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                                        thumbColor={settings.saveToGallery ? '#fff' : '#fff'}
                                    />
                                </View>
                                <TouchableOpacity style={styles.settingSelectRow} onPress={() => setQualityModalVisible(true)}>
                                    <View>
                                        <Text style={styles.settingLabel}>Calidad de descarga</Text>
                                        <Text style={styles.settingDescription}>{settings.downloadQuality === 'high' ? 'Alta calidad' : settings.downloadQuality === 'medium' ? 'Calidad media' : 'Calidad baja'}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            {/* Notificaciones */}
                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="notifications-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingsGroupTitle}>Notificaciones</Text>
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Notificaciones por email</Text>
                                        <Text style={styles.settingDescription}>Recibe ofertas y novedades</Text>
                                    </View>
                                    <Switch
                                        value={settings.emailNotifications}
                                        onValueChange={(value) => updateSetting('emailNotifications', value)}
                                        trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                                        thumbColor={settings.emailNotifications ? '#fff' : '#fff'}
                                    />
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Notificaciones push</Text>
                                        <Text style={styles.settingDescription}>Alertas en tu dispositivo</Text>
                                    </View>
                                    <Switch
                                        value={settings.pushNotifications}
                                        onValueChange={(value) => updateSetting('pushNotifications', value)}
                                        trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                                        thumbColor={settings.pushNotifications ? '#fff' : '#fff'}
                                    />
                                </View>
                            </View>

                            {/* Apariencia */}
                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="color-palette-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingsGroupTitle}>Apariencia</Text>
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Modo oscuro</Text>
                                        <Text style={styles.settingDescription}>Cambia el tema de la app (requiere reinicio)</Text>
                                    </View>
                                    <Switch
                                        value={settings.darkMode}
                                        onValueChange={(value) => {
                                            updateSetting('darkMode', value);
                                            Alert.alert('Modo oscuro', value ? 'Reinicia la app para aplicar el modo oscuro' : 'Reinicia la app para aplicar el modo claro');
                                        }}
                                        trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                                        thumbColor={settings.darkMode ? '#fff' : '#fff'}
                                    />
                                </View>
                                <TouchableOpacity style={styles.settingSelectRow} onPress={() => setLanguageModalVisible(true)}>
                                    <View>
                                        <Text style={styles.settingLabel}>Idioma</Text>
                                        <Text style={styles.settingDescription}>{settings.language === 'es' ? 'Español' : 'English'}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            {/* Seguridad */}
                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="shield-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingsGroupTitle}>Seguridad</Text>
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Autenticación de dos factores</Text>
                                        <Text style={styles.settingDescription}>Mayor seguridad para tu cuenta</Text>
                                    </View>
                                    <Switch
                                        value={settings.twoFactorAuth}
                                        onValueChange={(value) => {
                                            updateSetting('twoFactorAuth', value);
                                            if (value) {
                                                Alert.alert('Próximamente', 'La autenticación de dos factores estará disponible pronto');
                                            }
                                        }}
                                        trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                                        thumbColor={settings.twoFactorAuth ? '#fff' : '#fff'}
                                    />
                                </View>
                                <TouchableOpacity style={styles.settingButton} onPress={() => Alert.alert('Cambiar contraseña', 'Esta funcionalidad estará disponible próximamente')}>
                                    <Ionicons name="key-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingButtonText}>Cambiar contraseña</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.settingButton} onPress={exportUserData}>
                                    <Ionicons name="download-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingButtonText}>Exportar mis datos</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            {/* Soporte */}
                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingsGroupTitle}>Soporte</Text>
                                </View>

                                <TouchableOpacity style={styles.settingButton} onPress={sendSupportEmail}>
                                    <Ionicons name="mail-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingButtonText}>Contactar a soporte</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/terms')}>
                                    <Ionicons name="document-text-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingButtonText}>Términos y condiciones</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.settingButton} onPress={() => router.push('/privacy')}>
                                    <Ionicons name="lock-closed-outline" size={20} color="#2563eb" />
                                    <Text style={styles.settingButtonText}>Política de privacidad</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            {/* Zona peligrosa */}
                            <View style={styles.dangerZone}>
                                <View style={styles.dangerZoneHeader}>
                                    <Ionicons name="warning-outline" size={20} color="#ef4444" />
                                    <Text style={styles.dangerZoneTitle}>Zona peligrosa</Text>
                                </View>
                                <Text style={styles.dangerZoneDescription}>Estas acciones son irreversibles. Ten cuidado.</Text>
                                <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                    <Text style={styles.dangerButtonText}>Eliminar cuenta</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Cerrar sesión */}
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.logoutButtonGradient}>
                                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* MODAL DE DETALLE DE COMPRA */}
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Detalle de Compra</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseButton}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        {selectedPurchase && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Información de compra</Text>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Número de compra:</Text>
                                        <Text style={styles.modalInfoValue}>#{selectedPurchase.id}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Fecha:</Text>
                                        <Text style={styles.modalInfoValue}>{formatDate(selectedPurchase.purchase_date)}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Estado:</Text>
                                        <View style={[styles.modalStatusBadge, selectedPurchase.status === 'completed' && styles.modalStatusCompleted, selectedPurchase.status === 'pending' && styles.modalStatusPending]}>
                                            <Text style={[styles.modalStatusText, selectedPurchase.status === 'completed' && { color: '#10b981' }, selectedPurchase.status === 'pending' && { color: '#f59e0b' }]}>
                                                {selectedPurchase.status === 'completed' ? 'Completada' : 'Pendiente'}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Método de pago:</Text>
                                        <Text style={styles.modalInfoValue}>{selectedPurchase.payment_method || 'PayPal'}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>ID de transacción:</Text>
                                        <Text style={styles.modalInfoValue}>{selectedPurchase.transaction_id || 'N/A'}</Text>
                                    </View>
                                </View>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Resumen financiero</Text>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Total pagado:</Text>
                                        <Text style={styles.modalTotalValue}>${selectedPurchase.total.toFixed(2)} MXN</Text>
                                    </View>
                                </View>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Modelos adquiridos ({selectedPurchase.models?.length || 0})</Text>
                                    {selectedPurchase.models?.map((model) => (
                                        <View key={model.id} style={styles.modalModelItem}>
                                            <View style={styles.modalModelInfo}>
                                                <Text style={styles.modalModelName}>{model.name}</Text>
                                                <View style={styles.modalModelMeta}>
                                                    <Text style={styles.modalModelMetaText}>📦 {model.format}</Text>
                                                    <Text style={styles.modalModelMetaText}>💾 {model.size_mb} MB</Text>
                                                    <Text style={styles.modalModelMetaText}>📜 {getLicenseTypeLabel(model.pivot?.license_type)}</Text>
                                                </View>
                                            </View>
                                            <View style={styles.modalModelPrice}>
                                                <Text style={styles.modalModelPriceText}>${model.pivot?.unit_price || model.price} MXN</Text>
                                                {selectedPurchase.status === 'completed' && (
                                                    <TouchableOpacity style={styles.modalDownloadButton} onPress={() => handleDownloadModel(model)}>
                                                        <Ionicons name="cloud-download-outline" size={18} color="#2563eb" />
                                                        <Text style={styles.modalDownloadButtonText}>Descargar</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                        <TouchableOpacity style={styles.modalCloseFooterButton} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseFooterText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL DE FORMATOS DE DESCARGA */}
            <Modal visible={downloadModalVisible} animationType="fade" transparent={true} onRequestClose={() => setDownloadModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.formatModalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleContainer}>
                                <Text style={styles.modalTitleIcon}>📥</Text>
                                <Text style={styles.modalTitle}>Descargar Modelo</Text>
                            </View>
                            <TouchableOpacity onPress={() => setDownloadModalVisible(false)} style={styles.modalCloseButton}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        {downloadingFormats ? (
                            <View style={styles.centerContainer}>
                                <ActivityIndicator size="large" color="#2563eb" />
                                <Text style={styles.loadingText}>Cargando formatos...</Text>
                            </View>
                        ) : downloadInfo?.is_downloadable && downloadInfo.available_formats?.length > 0 ? (
                            <>
                                {selectedModel && (
                                    <View style={styles.modelInfoCard}>
                                        <Text style={styles.modelInfoName}>{selectedModel.name}</Text>
                                        <View style={styles.modelInfoMeta}>
                                            <Text style={styles.modelInfoMetaText}>📦 {selectedModel.format || 'GLTF'}</Text>
                                            <Text style={styles.modelInfoMetaText}>💾 {selectedModel.size_mb || 0} MB</Text>
                                        </View>
                                    </View>
                                )}
                                <Text style={styles.formatModalSubtitle}>Formatos disponibles ({downloadInfo.available_formats.length})</Text>
                                <ScrollView style={styles.formatList} showsVerticalScrollIndicator={false}>
                                    {downloadInfo.available_formats.map((item, index) => {
                                        const isSelected = selectedFormat === item.format;
                                        const formatColor = getFormatColor(item.format);
                                        const formatIcon = getFormatIcon(item.format);
                                        return (
                                            <TouchableOpacity key={index} style={[styles.formatItem, isSelected && { borderColor: formatColor, backgroundColor: formatColor + '08' }]} onPress={() => setSelectedFormat(item.format)}>
                                                <View style={styles.formatItemLeft}>
                                                    <View style={[styles.formatIcon, { backgroundColor: formatColor + '15' }]}>
                                                        <Text style={[styles.formatIconText, { color: formatColor }]}>{formatIcon}</Text>
                                                    </View>
                                                    <View>
                                                        <Text style={styles.formatName}>{item.format.toUpperCase()}</Text>
                                                        <Text style={styles.formatSize}>{formatSize(item.size_bytes)}</Text>
                                                    </View>
                                                </View>
                                                {isSelected && <Ionicons name="checkmark-circle" size={22} color={formatColor} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                                <View style={styles.infoBox}>
                                    <Ionicons name="information-circle-outline" size={20} color="#92400e" />
                                    <Text style={styles.infoBoxText}>Los archivos se descargarán en su formato original. Asegúrate de tener el software compatible.</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.emptyFormats}>
                                <Ionicons name="alert-circle-outline" size={48} color="#cbd5e1" />
                                <Text style={styles.emptyFormatsTitle}>Formatos no disponibles</Text>
                                <Text style={styles.emptyFormatsText}>Los formatos de descarga para este modelo estarán disponibles próximamente.</Text>
                            </View>
                        )}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelFooterButton} onPress={() => setDownloadModalVisible(false)}>
                                <Text style={styles.cancelFooterButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.downloadFooterButton, (!selectedFormat || isDownloading) && styles.downloadFooterButtonDisabled]} onPress={handleDownload} disabled={!selectedFormat || isDownloading}>
                                {isDownloading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="download-outline" size={18} color="#fff" />
                                        <Text style={styles.downloadFooterButtonText}>Descargar</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL IDIOMA */}
            <Modal visible={languageModalVisible} animationType="fade" transparent={true} onRequestClose={() => setLanguageModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSmallContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar idioma</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.modalOption, settings.language === 'es' && styles.modalOptionSelected]} onPress={() => changeLanguage('es')}>
                            <Text style={styles.modalOptionText}>🇪🇸 Español</Text>
                            {settings.language === 'es' && <Ionicons name="checkmark-circle" size={22} color="#2563eb" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, settings.language === 'en' && styles.modalOptionSelected]} onPress={() => changeLanguage('en')}>
                            <Text style={styles.modalOptionText}>🇺🇸 English</Text>
                            {settings.language === 'en' && <Ionicons name="checkmark-circle" size={22} color="#2563eb" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL CALIDAD */}
            <Modal visible={qualityModalVisible} animationType="fade" transparent={true} onRequestClose={() => setQualityModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalSmallContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Calidad de descarga</Text>
                            <TouchableOpacity onPress={() => setQualityModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.modalOption, settings.downloadQuality === 'high' && styles.modalOptionSelected]} onPress={() => changeDownloadQuality('high')}>
                            <View>
                                <Text style={styles.modalOptionText}>🎨 Alta calidad</Text>
                                <Text style={styles.modalOptionDesc}>Mejor calidad, mayor tamaño</Text>
                            </View>
                            {settings.downloadQuality === 'high' && <Ionicons name="checkmark-circle" size={22} color="#2563eb" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, settings.downloadQuality === 'medium' && styles.modalOptionSelected]} onPress={() => changeDownloadQuality('medium')}>
                            <View>
                                <Text style={styles.modalOptionText}>⚖️ Calidad media</Text>
                                <Text style={styles.modalOptionDesc}>Balance entre calidad y tamaño</Text>
                            </View>
                            {settings.downloadQuality === 'medium' && <Ionicons name="checkmark-circle" size={22} color="#2563eb" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, settings.downloadQuality === 'low' && styles.modalOptionSelected]} onPress={() => changeDownloadQuality('low')}>
                            <View>
                                <Text style={styles.modalOptionText}>📦 Calidad baja</Text>
                                <Text style={styles.modalOptionDesc}>Menor calidad, archivo más pequeño</Text>
                            </View>
                            {settings.downloadQuality === 'low' && <Ionicons name="checkmark-circle" size={22} color="#2563eb" />}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    header: { paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    profileInfo: { alignItems: 'center', paddingHorizontal: 24 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white' },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: 'white' },
    editNameInput: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingVertical: 4, minWidth: 200 },
    profileName: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 12 },
    profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    roleBadge: { marginTop: 12 },
    roleBadgeGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 30 },
    roleText: { fontSize: 12, color: 'white', fontWeight: '600' },
    tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, marginTop: -20, marginHorizontal: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
    tabActive: { backgroundColor: 'transparent' },
    tabText: { fontSize: 12, color: '#94a3b8', fontWeight: '500', marginTop: 4 },
    tabTextActive: { color: '#2563eb' },
    tabIndicator: { position: 'absolute', bottom: -8, width: 24, height: 3, backgroundColor: '#2563eb', borderRadius: 2 },
    contentContainer: { flex: 1, padding: 16 },
    section: { gap: 16 },
    infoCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 3 },
    infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    infoCardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#94a3b8', marginBottom: 2 },
    infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
    editButton: { borderRadius: 40, overflow: 'hidden' },
    editButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    editButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    editForm: { backgroundColor: '#fff', borderRadius: 24, padding: 20, gap: 16 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    required: { color: '#ef4444', fontSize: 12 },
    optional: { color: '#94a3b8', fontSize: 12, fontWeight: 'normal' },
    inputDisabled: { backgroundColor: '#f1f5f9', color: '#94a3b8' },
    inputHelper: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
    saveButtonDisabled: { opacity: 0.7 },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelButton: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 14, borderRadius: 40, alignItems: 'center' },
    cancelButtonText: { color: '#64748b', fontWeight: '500' },
    saveButton: { flex: 2, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 40 },
    saveButtonText: { color: '#fff', fontWeight: '600' },
    centerContainer: { padding: 40, alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    statValue: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginTop: 8 },
    statLabel: { fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center' },
    statIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    statContent: { flex: 1 },
    licensesGrid: { gap: 12 },
    licenseCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    licenseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    licenseIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    licenseTitle: { flex: 1 },
    licenseModelName: { fontSize: 15, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    licenseTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
    licenseTypeText: { fontSize: 11, fontWeight: '600', color: 'white' },
    licenseBody: { padding: 16, gap: 10 },
    licenseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    licenseRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    licenseRowLabel: { fontSize: 12, color: '#64748b' },
    licenseRowValue: { fontSize: 13, fontWeight: '500', color: '#1e293b' },
    licenseStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    licenseStatusText: { fontSize: 11, fontWeight: '500' },
    licenseFooter: { padding: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    viewModelButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12 },
    viewModelButtonText: { color: 'white', fontWeight: '600', fontSize: 13 },
    emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 20 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 12 },
    emptyText: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center', marginBottom: 16 },
    exploreButton: { backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 40 },
    exploreButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    purchasesList: { gap: 12 },
    purchaseCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    purchaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 },
    purchaseId: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
    purchaseNumber: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    purchaseStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    purchaseStatusCompleted: { backgroundColor: '#10b98115' },
    purchaseStatusPending: { backgroundColor: '#f59e0b15' },
    purchaseStatusText: { fontSize: 11, fontWeight: '600' },
    purchaseDate: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    purchaseDateText: { fontSize: 12, color: '#64748b' },
    purchaseItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    itemPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 30, borderWidth: 1, borderColor: '#e2e8f0' },
    itemName: { fontSize: 13, fontWeight: '500', color: '#1e293b', maxWidth: 120 },
    itemLicense: { backgroundColor: '#2563eb15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
    itemLicenseText: { fontSize: 9, fontWeight: '600', color: '#2563eb' },
    itemMore: { fontSize: 12, color: '#64748b' },
    purchaseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    purchaseFooterLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 2 },
    purchaseTotal: { fontSize: 18, fontWeight: '700', color: '#2563eb' },
    viewDetailsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 30 },
    viewDetailsText: { fontSize: 12, fontWeight: '500', color: '#2563eb' },
    emptyPurchases: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    settingsGroup: { backgroundColor: '#fff', borderRadius: 20, padding: 16, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    settingsGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    settingsGroupTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    settingLabel: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
    settingDescription: { fontSize: 12, color: '#64748b', marginTop: 2 },
    settingSelectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    settingButton: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    settingButtonText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1e293b' },
    dangerZone: { backgroundColor: '#fef2f2', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#fecaca' },
    dangerZoneHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    dangerZoneTitle: { fontSize: 16, fontWeight: '600', color: '#dc2626' },
    dangerZoneDescription: { fontSize: 12, color: '#991b1b', marginBottom: 16, lineHeight: 16 },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444', marginTop: 8 },
    dangerButtonText: { color: '#ef4444', fontWeight: '500' },
    logoutButton: { borderRadius: 40, overflow: 'hidden', marginBottom: 20 },
    logoutButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
    logoutButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    // Modales
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', borderRadius: 28, width: '90%', maxHeight: '85%', overflow: 'hidden' },
    modalSmallContainer: { backgroundColor: '#fff', borderRadius: 28, width: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    modalTitleIcon: { fontSize: 24 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
    modalCloseButton: { padding: 4 },
    modalSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalSectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 16 },
    modalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    modalInfoLabel: { fontSize: 14, color: '#64748b' },
    modalInfoValue: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
    modalStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    modalStatusCompleted: { backgroundColor: '#10b98115' },
    modalStatusPending: { backgroundColor: '#f59e0b15' },
    modalStatusText: { fontSize: 12, fontWeight: '600' },
    modalTotalValue: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
    modalModelItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalModelInfo: { flex: 1 },
    modalModelName: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
    modalModelMeta: { flexDirection: 'row', gap: 12 },
    modalModelMetaText: { fontSize: 11, color: '#64748b' },
    modalModelPrice: { alignItems: 'flex-end', gap: 8 },
    modalModelPriceText: { fontSize: 14, fontWeight: '700', color: '#2563eb' },
    modalDownloadButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#eff6ff', borderRadius: 20 },
    modalDownloadButtonText: { fontSize: 11, fontWeight: '500', color: '#2563eb' },
    modalCloseFooterButton: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    modalCloseFooterText: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalOptionSelected: { backgroundColor: '#eff6ff' },
    modalOptionText: { fontSize: 15, fontWeight: '500', color: '#1e293b' },
    modalOptionDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
    // Format modal
    formatModalContainer: { backgroundColor: '#fff', borderRadius: 28, width: '85%', maxHeight: '80%', overflow: 'hidden' },
    modelInfoCard: { margin: 20, marginBottom: 0, padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    modelInfoName: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
    modelInfoMeta: { flexDirection: 'row', gap: 16 },
    modelInfoMetaText: { fontSize: 13, color: '#64748b' },
    formatModalSubtitle: { fontSize: 14, color: '#64748b', paddingHorizontal: 20, marginBottom: 12, marginTop: 16 },
    formatList: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
    formatItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0' },
    formatItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    formatIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
    formatIconText: { fontSize: 24 },
    formatName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    formatSize: { fontSize: 12, color: '#64748b', marginTop: 2 },
    infoBox: { flexDirection: 'row', gap: 12, margin: 20, marginTop: 0, padding: 12, backgroundColor: '#fef3c7', borderRadius: 12, borderWidth: 1, borderColor: '#fcd34d' },
    infoBoxText: { flex: 1, fontSize: 13, color: '#92400e', lineHeight: 18 },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    cancelFooterButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', backgroundColor: '#fff' },
    cancelFooterButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    downloadFooterButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: '#2563eb' },
    downloadFooterButtonDisabled: { backgroundColor: '#93c5fd', opacity: 0.7 },
    downloadFooterButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    emptyFormats: { alignItems: 'center', padding: 40 },
    emptyFormatsTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 12 },
    emptyFormatsText: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 },
});