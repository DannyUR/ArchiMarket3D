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
import { useGamification } from '../../context/GamificationContext';
import { LevelProgressBar } from '../../components/gamification/LevelProgressBar';
import { AchievementBadge } from '../../components/gamification/AchievementBadge';

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
    const [activeTab, setActiveTab] = useState<'profile' | 'licenses' | 'purchases' | 'settings' | 'achievements'>('profile');
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const [licenses, setLicenses] = useState<License[]>([]);
    const [licensesLoading, setLicensesLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ active: 0, expired: 0, total: 0 });

    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [purchasesLoading, setPurchasesLoading] = useState(true);

    const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const [downloadModalVisible, setDownloadModalVisible] = useState(false);
    const [selectedModel, setSelectedModel] = useState<PurchaseModel | null>(null);
    const [downloadInfo, setDownloadInfo] = useState<DownloadInfo | null>(null);
    const [downloadingFormats, setDownloadingFormats] = useState(false);
    const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
    });

    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    const [qualityModalVisible, setQualityModalVisible] = useState(false);

    const { data: gamification, loading: gamificationLoading, refresh: refreshGamification } = useGamification();
    const [showAllAchievements, setShowAllAchievements] = useState(false);

    const changeLanguage = async (locale: string) => {
        await updateSetting('language', locale);
        setLanguageModalVisible(false);
    };

    const changeDownloadQuality = async (quality: 'high' | 'medium' | 'low') => {
        await updateSetting('downloadQuality', quality);
        setQualityModalVisible(false);
    };

    const sendSupportEmail = () => {
        const subject = encodeURIComponent('Soporte ArchiMarket3D');
        const body = encodeURIComponent(`Usuario: ${user?.email || 'No especificado'}\n\nPor favor describe tu problema:\n\n`);
        const emailUrl = `mailto:soporte@archimarket3d.com?subject=${subject}&body=${body}`;
        Linking.openURL(emailUrl).catch(() => {
            Alert.alert('Error', 'No se pudo abrir el cliente de correo');
        });
    };

    const exportUserData = async () => {
        try {
            Alert.alert('Exportar datos', 'Preparando tus datos...');
            const userData = { user, purchases, licenses, settings, exportDate: new Date().toISOString() };
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

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm('⚠️ ADVERTENCIA: Esta acción eliminará tu cuenta permanentemente. ¿Estás seguro?');
        if (!confirmed) return;

        const finalConfirm = window.confirm('Por favor confirma una última vez que deseas ELIMINAR tu cuenta.');
        if (!finalConfirm) return;

        try {
            await api.delete('/user/account');
            await AsyncStorage.multiRemove(['@auth_token', '@user_data', '@user_settings']);
            await logout();
            setTimeout(() => router.replace('/auth/register'), 500);
            Alert.alert('Éxito', 'Tu cuenta ha sido eliminada');
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'No se pudo eliminar la cuenta');
        }
    };

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

    useEffect(() => {
        if (activeTab === 'licenses') fetchLicenses();
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'purchases') fetchPurchases();
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
            if (formats.length > 0) setSelectedFormat(formats[0].format);
        } catch (error) {
            setDownloadInfo({ is_downloadable: false, available_formats: [], total_size_mb: 0 });
        } finally {
            setDownloadingFormats(false);
        }
    };

    const handleDownload = async () => {
        if (!selectedFormat || !downloadInfo || !selectedModel) return;
        setIsDownloading(true);
        try {
            const downloadUrl = `/models/${selectedModel.id}/download?format=${selectedFormat}`;
            const response = await api.get(downloadUrl, { responseType: 'blob', timeout: 60000 });
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
                        await FileSystem.writeAsStringAsync(downloadUri, base64.split(',')[1], { encoding: FileSystem.EncodingType.Base64 });
                        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(downloadUri);
                    }
                };
                reader.readAsDataURL(new Blob([response.data]));
            }
            setDownloadModalVisible(false);
        } catch (error) {
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
        await refreshGamification();
        setRefreshing(false);
    }, [activeTab]);

    const handleUpdateProfile = async () => {
        if (!formData.name?.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio');
            return;
        }
        setLoading(true);
        try {
            const updatedUser = await updateProfile(formData);
            if (updatedUser) {
                setFormData({
                    name: updatedUser.name || '',
                    email: updatedUser.email || '',
                    phone: updatedUser.phone || '',
                    company: updatedUser.company || '',
                });
            }
            Alert.alert('Éxito', 'Perfil actualizado correctamente');
            setEditMode(false);
            await refreshGamification();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Error al actualizar perfil');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            const confirmed = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
            if (!confirmed) return;
            await AsyncStorage.removeItem('@user_settings');
            await logout();
        } else {
            Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Cerrar Sesión', style: 'destructive', onPress: async () => { await AsyncStorage.removeItem('@user_settings'); await logout(); } }
            ]);
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

    const unlockedAchievements = gamification?.achievements?.filter(a => a.unlocked_at) || [];
    const totalAchievements = gamification?.achievements?.length || 0;

    return (
        <View style={styles.container}>
            {/* Header con gradiente */}
            <LinearGradient
                colors={['#4f46e5', '#7c3aed', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.profileInfo}>
                    <LinearGradient
                        colors={['#ffffff30', '#ffffff10']}
                        style={styles.avatarBorder}
                    >
                        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{getInitials(formData.name)}</Text>
                        </LinearGradient>
                    </LinearGradient>
                    {editMode ? (
                        <TextInput
                            style={styles.editNameInput}
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                            placeholder="Tu nombre"
                            placeholderTextColor="#c7d2fe"
                        />
                    ) : (
                        <Text style={styles.profileName}>{formData.name}</Text>
                    )}
                    <Text style={styles.profileEmail}>{formData.email}</Text>
                    <View style={styles.roleBadge}>
                        <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.roleBadgeGradient}>
                            <Ionicons name="star" size={12} color="#fff" />
                            <Text style={styles.roleText}>
                                {user?.role === 'architect' ? 'Arquitecto' : user?.role === 'engineer' ? 'Ingeniero' : user?.role === 'company' ? 'Empresa' : 'Usuario'}
                            </Text>
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
                    { key: 'settings', label: 'Ajustes', icon: 'settings-outline' },
                    { key: 'achievements', label: 'Logros', icon: 'trophy-outline' }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key as any)}
                    >
                        <View style={[styles.tabIcon, activeTab === tab.key && styles.tabIconActive]}>
                            <Ionicons name={tab.icon as any} size={20} color={activeTab === tab.key ? '#4f46e5' : '#94a3b8'} />
                        </View>
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                        {activeTab === tab.key && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
            >
                <View style={styles.contentInner}>
                    {/* TAB PERFIL */}
                    {activeTab === 'profile' && (
                        <View style={styles.section}>
                            {!editMode ? (
                                <>
                                    <View style={styles.infoCard}>
                                        <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.infoCardGradient}>
                                            <View style={styles.infoCardHeader}>
                                                <Ionicons name="person-circle" size={24} color="#4f46e5" />
                                                <Text style={styles.infoCardTitle}>Información de cuenta</Text>
                                            </View>

                                            <View style={styles.infoRow}>
                                                <View style={styles.infoIcon}>
                                                    <Ionicons name="person" size={18} color="#4f46e5" />
                                                </View>
                                                <View style={styles.infoContent}>
                                                    <Text style={styles.infoLabel}>Nombre completo</Text>
                                                    <Text style={styles.infoValue}>{formData.name || 'No especificado'}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.infoRow}>
                                                <View style={styles.infoIcon}>
                                                    <Ionicons name="mail" size={18} color="#4f46e5" />
                                                </View>
                                                <View style={styles.infoContent}>
                                                    <Text style={styles.infoLabel}>Correo electrónico</Text>
                                                    <Text style={styles.infoValue}>{formData.email || 'No especificado'}</Text>
                                                </View>
                                            </View>

                                            {formData.phone && (
                                                <View style={styles.infoRow}>
                                                    <View style={styles.infoIcon}>
                                                        <Ionicons name="call" size={18} color="#4f46e5" />
                                                    </View>
                                                    <View style={styles.infoContent}>
                                                        <Text style={styles.infoLabel}>Teléfono</Text>
                                                        <Text style={styles.infoValue}>{formData.phone}</Text>
                                                    </View>
                                                </View>
                                            )}

                                            {formData.company && (
                                                <View style={styles.infoRow}>
                                                    <View style={styles.infoIcon}>
                                                        <Ionicons name="business" size={18} color="#4f46e5" />
                                                    </View>
                                                    <View style={styles.infoContent}>
                                                        <Text style={styles.infoLabel}>Empresa</Text>
                                                        <Text style={styles.infoValue}>{formData.company}</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </LinearGradient>
                                    </View>

                                    <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
                                        <LinearGradient
                                            colors={['#4f46e5', '#7c3aed']}
                                            style={styles.editButtonGradient}
                                        >
                                            <Ionicons name="create" size={18} color="#fff" />
                                            <Text style={styles.editButtonText}>Editar perfil</Text>
                                            <Ionicons name="arrow-forward" size={16} color="#fff" />
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <View style={styles.editForm}>
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

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Correo electrónico</Text>
                                        <TextInput
                                            style={[styles.input, styles.inputDisabled]}
                                            value={formData.email}
                                            editable={false}
                                        />
                                        <Text style={styles.inputHelper}>El email no se puede modificar</Text>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Teléfono <Text style={styles.optional}>(Opcional)</Text></Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.phone}
                                            onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                            placeholder="+52 123 456 7890"
                                            keyboardType="phone-pad"
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={styles.label}>Empresa <Text style={styles.optional}>(Opcional)</Text></Text>
                                        <TextInput
                                            style={styles.input}
                                            value={formData.company}
                                            onChangeText={(text) => setFormData({ ...formData, company: text })}
                                            placeholder="Nombre de tu empresa"
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
                                            <LinearGradient
                                                colors={['#4f46e5', '#7c3aed']}
                                                style={styles.saveButtonGradient}
                                            >
                                                {loading ? (
                                                    <ActivityIndicator color="#fff" size="small" />
                                                ) : (
                                                    <>
                                                        <Text style={styles.saveButtonText}>Guardar cambios</Text>
                                                        <Ionicons name="checkmark" size={18} color="#fff" />
                                                    </>
                                                )}
                                            </LinearGradient>
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
                                <LinearGradient colors={['#10b981', '#059669']} style={styles.statCard}>
                                    <Ionicons name="checkmark-circle" size={28} color="#fff" />
                                    <Text style={styles.statValueLight}>{stats.active}</Text>
                                    <Text style={styles.statLabelLight}>Activas</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.statCard}>
                                    <Ionicons name="close-circle" size={28} color="#fff" />
                                    <Text style={styles.statValueLight}>{stats.expired}</Text>
                                    <Text style={styles.statLabelLight}>Expiradas</Text>
                                </LinearGradient>
                                <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.statCard}>
                                    <Ionicons name="document-text" size={28} color="#fff" />
                                    <Text style={styles.statValueLight}>{stats.total}</Text>
                                    <Text style={styles.statLabelLight}>Total</Text>
                                </LinearGradient>
                            </View>

                            {licensesLoading ? (
                                <View style={styles.centerContainer}>
                                    <ActivityIndicator size="large" color="#4f46e5" />
                                    <Text style={styles.loadingText}>Cargando licencias...</Text>
                                </View>
                            ) : licenses.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.emptyIconBg}>
                                        <Ionicons name="document-text-outline" size={48} color="#94a3b8" />
                                    </LinearGradient>
                                    <Text style={styles.emptyTitle}>No tienes licencias aún</Text>
                                    <Text style={styles.emptyText}>Realiza tu primera compra para obtener licencias</Text>
                                    <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/models')}>
                                        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.exploreButtonGradient}>
                                            <Ionicons name="search" size={18} color="#fff" />
                                            <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.licensesGrid}>
                                    {licenses.map((license) => {
                                        const color = getLicenseTypeColor(license.license_type);
                                        return (
                                            <TouchableOpacity
                                                key={license.id}
                                                style={styles.licenseCard}
                                                onPress={() => router.push(`/models/${license.model.id}`)}
                                                activeOpacity={0.7}
                                            >
                                                <LinearGradient
                                                    colors={[color + '15', color + '05']}
                                                    style={styles.licenseCardGradient}
                                                >
                                                    <View style={styles.licenseHeader}>
                                                        <View style={[styles.licenseIcon, { backgroundColor: color + '20' }]}>
                                                            <Ionicons name="cube" size={24} color={color} />
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
                                                            <Ionicons name="calendar" size={14} color="#64748b" />
                                                            <Text style={styles.licenseRowLabel}>Compra: {new Date(license.purchase_date).toLocaleDateString()}</Text>
                                                        </View>
                                                        <View style={styles.licenseRow}>
                                                            <Ionicons name="time" size={14} color="#64748b" />
                                                            <Text style={styles.licenseRowLabel}>Expira: {formatDate(license.expires_at)}</Text>
                                                        </View>
                                                        <View style={styles.licenseRow}>
                                                            <Ionicons name="cash" size={14} color="#64748b" />
                                                            <Text style={styles.licenseRowLabel}>Pagado: ${license.price_paid}</Text>
                                                        </View>
                                                        <View style={styles.licenseStatus}>
                                                            <View style={[styles.licenseStatusDot, { backgroundColor: license.is_active && !license.is_expired ? '#10b981' : '#ef4444' }]} />
                                                            <Text style={[styles.licenseStatusText, { color: license.is_active && !license.is_expired ? '#10b981' : '#ef4444' }]}>
                                                                {license.is_active && !license.is_expired ? 'Activa' : 'Expirada'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    )}

                    {/* TAB COMPRAS */}
                    {activeTab === 'purchases' && (
                        <View style={styles.section}>
                            {purchasesLoading ? (
                                <View style={styles.centerContainer}>
                                    <ActivityIndicator size="large" color="#4f46e5" />
                                    <Text style={styles.loadingText}>Cargando tus compras...</Text>
                                </View>
                            ) : purchases.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.emptyIconBg}>
                                        <Ionicons name="cart-outline" size={48} color="#94a3b8" />
                                    </LinearGradient>
                                    <Text style={styles.emptyTitle}>No tienes compras aún</Text>
                                    <Text style={styles.emptyText}>Realiza tu primera compra para ver tu historial</Text>
                                    <TouchableOpacity style={styles.exploreButton} onPress={() => router.push('/(tabs)/models')}>
                                        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.exploreButtonGradient}>
                                            <Ionicons name="search" size={18} color="#fff" />
                                            <Text style={styles.exploreButtonText}>Explorar modelos</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.statsGrid}>
                                        <View style={styles.statCardSimple}>
                                            <Ionicons name="cash" size={24} color="#4f46e5" />
                                            <Text style={styles.statValueSmall}>${calculateTotalSpent()}</Text>
                                            <Text style={styles.statLabelSmall}>Gastado</Text>
                                        </View>
                                        <View style={styles.statCardSimple}>
                                            <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                                            <Text style={styles.statValueSmall}>{getCompletedPurchasesCount()}</Text>
                                            <Text style={styles.statLabelSmall}>Compras</Text>
                                        </View>
                                        <View style={styles.statCardSimple}>
                                            <Ionicons name="cube" size={24} color="#f59e0b" />
                                            <Text style={styles.statValueSmall}>{getTotalModelsCount()}</Text>
                                            <Text style={styles.statLabelSmall}>Modelos</Text>
                                        </View>
                                    </View>

                                    <View style={styles.purchasesList}>
                                        {purchases.map((purchase) => (
                                            <TouchableOpacity
                                                key={purchase.id}
                                                style={styles.purchaseCard}
                                                activeOpacity={0.7}
                                                onPress={() => handleViewPurchaseDetails(purchase)}
                                            >
                                                <LinearGradient
                                                    colors={['#fff', '#f8fafc']}
                                                    style={styles.purchaseCardGradient}
                                                >
                                                    <View style={styles.purchaseHeader}>
                                                        <View style={styles.purchaseId}>
                                                            <Text style={styles.purchaseNumber}>#{purchase.id}</Text>
                                                            <View style={[
                                                                styles.purchaseStatus,
                                                                purchase.status === 'completed' && styles.purchaseStatusCompleted,
                                                                purchase.status === 'pending' && styles.purchaseStatusPending
                                                            ]}>
                                                                <Ionicons
                                                                    name={purchase.status === 'completed' ? 'checkmark-circle' : 'time'}
                                                                    size={12}
                                                                    color={purchase.status === 'completed' ? '#10b981' : '#f59e0b'}
                                                                />
                                                                <Text style={[
                                                                    styles.purchaseStatusText,
                                                                    purchase.status === 'completed' && { color: '#10b981' },
                                                                    purchase.status === 'pending' && { color: '#f59e0b' }
                                                                ]}>
                                                                    {purchase.status === 'completed' ? 'Completada' : 'Pendiente'}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        <View style={styles.purchaseDate}>
                                                            <Ionicons name="calendar" size={14} color="#64748b" />
                                                            <Text style={styles.purchaseDateText}>{formatShortDate(purchase.purchase_date)}</Text>
                                                        </View>
                                                    </View>
                                                    <View style={styles.purchaseItems}>
                                                        {purchase.models?.slice(0, 2).map((model) => (
                                                            <View key={model.id} style={styles.itemPreview}>
                                                                <Ionicons name="cube" size={14} color="#4f46e5" />
                                                                <Text style={styles.itemName} numberOfLines={1}>{model.name}</Text>
                                                                <View style={styles.itemLicense}>
                                                                    <Text style={styles.itemLicenseText}>
                                                                        {model.pivot?.license_type === 'personal' ? 'Personal' : model.pivot?.license_type === 'business' ? 'Empresarial' : 'Ilimitada'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        ))}
                                                        {purchase.models?.length > 2 && (
                                                            <Text style={styles.itemMore}>+{purchase.models.length - 2} más</Text>
                                                        )}
                                                    </View>
                                                    <View style={styles.purchaseFooter}>
                                                        <Text style={styles.purchaseTotal}>${purchase.total.toFixed(2)} MXN</Text>
                                                        <View style={styles.viewDetailsBadge}>
                                                            <Text style={styles.viewDetailsText}>Ver detalles</Text>
                                                            <Ionicons name="arrow-forward" size={14} color="#4f46e5" />
                                                        </View>
                                                    </View>
                                                </LinearGradient>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </>
                            )}
                        </View>
                    )}

                    {/* TAB AJUSTES */}
                    {activeTab === 'settings' && (
                        <View style={styles.section}>
                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="download" size={20} color="#4f46e5" />
                                    <Text style={styles.settingsGroupTitle}>Descargas</Text>
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Descarga automática</Text>
                                        <Text style={styles.settingDescription}>Descargar al comprar</Text>
                                    </View>
                                    <Switch
                                        value={settings.autoDownload}
                                        onValueChange={(value) => updateSetting('autoDownload', value)}
                                        trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                                        thumbColor={settings.autoDownload ? '#fff' : '#fff'}
                                    />
                                </View>
                                <TouchableOpacity style={styles.settingSelectRow} onPress={() => setQualityModalVisible(true)}>
                                    <View>
                                        <Text style={styles.settingLabel}>Calidad de descarga</Text>
                                        <Text style={styles.settingDescription}>
                                            {settings.downloadQuality === 'high' ? 'Alta calidad' : settings.downloadQuality === 'medium' ? 'Calidad media' : 'Calidad baja'}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="notifications" size={20} color="#4f46e5" />
                                    <Text style={styles.settingsGroupTitle}>Notificaciones</Text>
                                </View>
                                <View style={styles.settingRow}>
                                    <View>
                                        <Text style={styles.settingLabel}>Correos electrónicos</Text>
                                        <Text style={styles.settingDescription}>Recibe ofertas y novedades</Text>
                                    </View>
                                    <Switch
                                        value={settings.emailNotifications}
                                        onValueChange={(value) => updateSetting('emailNotifications', value)}
                                        trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                                        thumbColor={settings.emailNotifications ? '#fff' : '#fff'}
                                    />
                                </View>
                            </View>

                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="color-palette" size={20} color="#4f46e5" />
                                    <Text style={styles.settingsGroupTitle}>Apariencia</Text>
                                </View>
                                <TouchableOpacity style={styles.settingSelectRow} onPress={() => setLanguageModalVisible(true)}>
                                    <View>
                                        <Text style={styles.settingLabel}>Idioma</Text>
                                        <Text style={styles.settingDescription}>{settings.language === 'es' ? 'Español' : 'English'}</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="shield" size={20} color="#4f46e5" />
                                    <Text style={styles.settingsGroupTitle}>Seguridad</Text>
                                </View>
                                <TouchableOpacity style={styles.settingButton} onPress={exportUserData}>
                                    <Ionicons name="download" size={20} color="#4f46e5" />
                                    <Text style={styles.settingButtonText}>Exportar mis datos</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.settingsGroup}>
                                <View style={styles.settingsGroupHeader}>
                                    <Ionicons name="help-circle" size={20} color="#4f46e5" />
                                    <Text style={styles.settingsGroupTitle}>Soporte</Text>
                                </View>
                                <TouchableOpacity style={styles.settingButton} onPress={sendSupportEmail}>
                                    <Ionicons name="mail" size={20} color="#4f46e5" />
                                    <Text style={styles.settingButtonText}>Contactar a soporte</Text>
                                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.dangerZone}>
                                <View style={styles.dangerZoneHeader}>
                                    <Ionicons name="warning" size={20} color="#ef4444" />
                                    <Text style={styles.dangerZoneTitle}>Zona peligrosa</Text>
                                </View>
                                <Text style={styles.dangerZoneDescription}>Estas acciones son irreversibles.</Text>
                                <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                                    <Ionicons name="trash" size={20} color="#ef4444" />
                                    <Text style={styles.dangerButtonText}>Eliminar cuenta</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <LinearGradient colors={['#ef4444', '#dc2626']} style={styles.logoutButtonGradient}>
                                    <Ionicons name="log-out" size={20} color="#fff" />
                                    <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* TAB LOGROS */}
                    {activeTab === 'achievements' && (
                        <View style={styles.section}>
                            <View style={styles.achievementsHeader}>
                                <Text style={styles.sectionTitle}>
                                    <Ionicons name="trophy" size={20} color="#4f46e5" /> Mis Logros
                                </Text>
                                <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.achievementsCountBadge}>
                                    <Text style={styles.achievementsCount}>{unlockedAchievements.length}/{totalAchievements}</Text>
                                </LinearGradient>
                            </View>

                            {gamificationLoading ? (
                                <View style={styles.centerContainer}>
                                    <ActivityIndicator size="large" color="#4f46e5" />
                                    <Text style={styles.loadingText}>Cargando logros...</Text>
                                </View>
                            ) : !gamification || gamification.achievements?.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <LinearGradient colors={['#f1f5f9', '#e2e8f0']} style={styles.emptyIconBg}>
                                        <Ionicons name="trophy-outline" size={48} color="#94a3b8" />
                                    </LinearGradient>
                                    <Text style={styles.emptyTitle}>No hay logros aún</Text>
                                    <Text style={styles.emptyText}>Completa compras y escribe reseñas para desbloquear logros</Text>
                                </View>
                            ) : (
                                <>
                                    <LevelProgressBar
                                        level={gamification.level}
                                        levelIcon={gamification.level_icon}
                                        levelTitle={gamification.level_title}
                                        progress={gamification.progress}
                                        currentXP={gamification.xp}
                                        nextXP={gamification.xp_next_level}
                                        discount={gamification.discount}
                                    />

                                    <View style={styles.achievementsGrid}>
                                        {(showAllAchievements ? gamification.achievements : gamification.achievements.slice(0, 6)).map((achievement, index) => (
                                            <AchievementBadge
                                                key={`${achievement.id}-${achievement.unlocked_at ? 'unlocked' : 'locked'}-${index}`}
                                                icon={achievement.icon}
                                                name={achievement.name}
                                                description={achievement.description}
                                                unlocked={!!achievement.unlocked_at}
                                                unlockedAt={achievement.unlocked_at}
                                            />
                                        ))}
                                    </View>

                                    {gamification.achievements.length > 6 && (
                                        <TouchableOpacity
                                            style={styles.viewAllButton}
                                            onPress={() => setShowAllAchievements(!showAllAchievements)}
                                        >
                                            <Text style={styles.viewAllButtonText}>
                                                {showAllAchievements ? 'Ver menos' : 'Ver todos los logros'}
                                            </Text>
                                            <Ionicons name={showAllAchievements ? 'chevron-up' : 'chevron-down'} size={16} color="#4f46e5" />
                                        </TouchableOpacity>
                                    )}

                                    <View style={styles.nextLevelContainer}>
                                        <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.nextLevelIcon}>
                                            <Ionicons name="trending-up" size={20} color="#4f46e5" />
                                        </LinearGradient>
                                        <Text style={styles.nextLevelText}>Nivel {gamification.level + 1}</Text>
                                        <Text style={styles.nextLevelXp}>{Math.ceil(gamification.xp_next_level - gamification.xp)} XP para subir</Text>
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* MODALES (sin cambios) */}
            {/* Modal de detalle de compra */}
            <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <LinearGradient colors={['#fff', '#f8fafc']} style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleContainer}>
                                <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.modalTitleIcon}>
                                    <Ionicons name="cart" size={20} color="#fff" />
                                </LinearGradient>
                                <Text style={styles.modalTitle}>Detalle de compra</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        {selectedPurchase && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Información</Text>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Número:</Text>
                                        <Text style={styles.modalInfoValue}>#{selectedPurchase.id}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Fecha:</Text>
                                        <Text style={styles.modalInfoValue}>{formatDate(selectedPurchase.purchase_date)}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Estado:</Text>
                                        <View style={[styles.modalStatusBadge, selectedPurchase.status === 'completed' && styles.modalStatusCompleted]}>
                                            <Text style={styles.modalStatusText}>{selectedPurchase.status === 'completed' ? 'Completada' : 'Pendiente'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Método:</Text>
                                        <Text style={styles.modalInfoValue}>{selectedPurchase.payment_method || 'PayPal'}</Text>
                                    </View>
                                    <View style={styles.modalInfoRow}>
                                        <Text style={styles.modalInfoLabel}>Total:</Text>
                                        <Text style={styles.modalTotalValue}>${selectedPurchase.total.toFixed(2)} MXN</Text>
                                    </View>
                                </View>

                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Modelos ({selectedPurchase.models?.length || 0})</Text>
                                    {selectedPurchase.models?.map((model) => (
                                        <View key={model.id} style={styles.modalModelItem}>
                                            <View style={styles.modalModelInfo}>
                                                <Text style={styles.modalModelName}>{model.name}</Text>
                                                <Text style={styles.modalModelMeta}>
                                                    {model.format} • {model.size_mb} MB • {getLicenseTypeLabel(model.pivot?.license_type)}
                                                </Text>
                                            </View>
                                            <View style={styles.modalModelPrice}>
                                                <Text style={styles.modalModelPriceText}>${model.pivot?.unit_price || model.price}</Text>
                                                {selectedPurchase.status === 'completed' && (
                                                    <TouchableOpacity
                                                        style={styles.modalDownloadButton}
                                                        onPress={() => handleDownloadModel(model)}
                                                    >
                                                        <Ionicons name="download" size={14} color="#4f46e5" />
                                                        <Text style={styles.modalDownloadButtonText}>Descargar</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </ScrollView>
                        )}
                        <TouchableOpacity style={styles.modalCloseFooter} onPress={() => setModalVisible(false)}>
                            <Text style={styles.modalCloseFooterText}>Cerrar</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>

            {/* Modal de formatos de descarga */}
            <Modal visible={downloadModalVisible} animationType="fade" transparent={true} onRequestClose={() => setDownloadModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <LinearGradient colors={['#fff', '#f8fafc']} style={styles.formatModalContainer}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleContainer}>
                                <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.modalTitleIcon}>
                                    <Ionicons name="download" size={20} color="#fff" />
                                </LinearGradient>
                                <Text style={styles.modalTitle}>Descargar modelo</Text>
                            </View>
                            <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        {downloadingFormats ? (
                            <View style={styles.centerContainer}>
                                <ActivityIndicator size="large" color="#4f46e5" />
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
                                <Text style={styles.formatModalSubtitle}>Formatos disponibles</Text>
                                <ScrollView style={styles.formatList} showsVerticalScrollIndicator={false}>
                                    {downloadInfo.available_formats.map((item, index) => {
                                        const isSelected = selectedFormat === item.format;
                                        const formatColor = getFormatColor(item.format);
                                        const formatIcon = getFormatIcon(item.format);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.formatItem, isSelected && { borderColor: formatColor }]}
                                                onPress={() => setSelectedFormat(item.format)}
                                            >
                                                <View style={styles.formatItemLeft}>
                                                    <View style={[styles.formatIcon, { backgroundColor: formatColor + '15' }]}>
                                                        <Text style={styles.formatIconText}>{formatIcon}</Text>
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
                            </>
                        ) : (
                            <View style={styles.emptyFormats}>
                                <Ionicons name="alert-circle-outline" size={48} color="#cbd5e1" />
                                <Text style={styles.emptyFormatsTitle}>Formatos no disponibles</Text>
                                <Text style={styles.emptyFormatsText}>Los formatos estarán disponibles próximamente.</Text>
                            </View>
                        )}
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelFooterButton} onPress={() => setDownloadModalVisible(false)}>
                                <Text style={styles.cancelFooterButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.downloadFooterButton, (!selectedFormat || isDownloading) && styles.downloadFooterButtonDisabled]}
                                onPress={handleDownload}
                                disabled={!selectedFormat || isDownloading}
                            >
                                <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.downloadFooterButtonGradient}>
                                    {isDownloading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <>
                                            <Ionicons name="download" size={18} color="#fff" />
                                            <Text style={styles.downloadFooterButtonText}>Descargar</Text>
                                        </>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </Modal>

            {/* Modal de idioma */}
            <Modal visible={languageModalVisible} animationType="fade" transparent={true} onRequestClose={() => setLanguageModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <LinearGradient colors={['#fff', '#f8fafc']} style={styles.modalSmallContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar idioma</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.modalOption, settings.language === 'es' && styles.modalOptionSelected]} onPress={() => changeLanguage('es')}>
                            <Text style={styles.modalOptionText}>🇪🇸 Español</Text>
                            {settings.language === 'es' && <Ionicons name="checkmark-circle" size={22} color="#4f46e5" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, settings.language === 'en' && styles.modalOptionSelected]} onPress={() => changeLanguage('en')}>
                            <Text style={styles.modalOptionText}>🇺🇸 English</Text>
                            {settings.language === 'en' && <Ionicons name="checkmark-circle" size={22} color="#4f46e5" />}
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>

            {/* Modal de calidad */}
            <Modal visible={qualityModalVisible} animationType="fade" transparent={true} onRequestClose={() => setQualityModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <LinearGradient colors={['#fff', '#f8fafc']} style={styles.modalSmallContainer}>
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
                            {settings.downloadQuality === 'high' && <Ionicons name="checkmark-circle" size={22} color="#4f46e5" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, settings.downloadQuality === 'medium' && styles.modalOptionSelected]} onPress={() => changeDownloadQuality('medium')}>
                            <View>
                                <Text style={styles.modalOptionText}>⚖️ Calidad media</Text>
                                <Text style={styles.modalOptionDesc}>Balance calidad y tamaño</Text>
                            </View>
                            {settings.downloadQuality === 'medium' && <Ionicons name="checkmark-circle" size={22} color="#4f46e5" />}
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, settings.downloadQuality === 'low' && styles.modalOptionSelected]} onPress={() => changeDownloadQuality('low')}>
                            <View>
                                <Text style={styles.modalOptionText}>📦 Calidad baja</Text>
                                <Text style={styles.modalOptionDesc}>Menor calidad, archivo pequeño</Text>
                            </View>
                            {settings.downloadQuality === 'low' && <Ionicons name="checkmark-circle" size={22} color="#4f46e5" />}
                        </TouchableOpacity>
                    </LinearGradient>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    // Header
    header: { paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    profileInfo: { alignItems: 'center', paddingHorizontal: 24 },
    avatarBorder: { width: 110, height: 110, borderRadius: 55, padding: 3 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: 'white' },
    editNameInput: { fontSize: 24, fontWeight: 'bold', color: 'white', textAlign: 'center', marginTop: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingVertical: 4, minWidth: 200 },
    profileName: { fontSize: 24, fontWeight: 'bold', color: 'white', marginTop: 12 },
    profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    roleBadge: { marginTop: 12 },
    roleBadgeGradient: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 30 },
    roleText: { fontSize: 12, color: '#fff', fontWeight: '600' },
    // Tabs
    tabsContainer: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 8, marginTop: -20, marginHorizontal: 16, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 8, position: 'relative' },
    tabIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
    tabIconActive: { backgroundColor: '#e0e7ff' },
    tabText: { fontSize: 11, color: '#94a3b8', fontWeight: '500' },
    tabTextActive: { color: '#4f46e5' },
    tabIndicator: { position: 'absolute', bottom: -8, width: 30, height: 3, backgroundColor: '#4f46e5', borderRadius: 2, alignSelf: 'center' },
    contentContainer: { flex: 1 },
    contentInner: { padding: 16, gap: 16 },
    section: { gap: 16 },
    // Tarjetas de información
    infoCard: { borderRadius: 24, overflow: 'hidden' },
    infoCardGradient: { padding: 20, gap: 16 },
    infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    infoCardTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    infoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 12, color: '#64748b', marginBottom: 2 },
    infoValue: { fontSize: 14, color: '#1e293b', fontWeight: '500' },
    editButton: { borderRadius: 40, overflow: 'hidden' },
    editButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    editButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    editForm: { backgroundColor: '#fff', borderRadius: 24, padding: 20, gap: 16 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '500', color: '#1e293b' },
    input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
    required: { color: '#ef4444', fontSize: 12 },
    optional: { color: '#94a3b8', fontSize: 12, fontWeight: 'normal' },
    inputDisabled: { backgroundColor: '#f1f5f9', color: '#94a3b8' },
    inputHelper: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
    buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    cancelButton: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 14, borderRadius: 40, alignItems: 'center' },
    cancelButtonText: { color: '#64748b', fontWeight: '500' },
    saveButton: { flex: 2, borderRadius: 40, overflow: 'hidden' },
    saveButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    saveButtonText: { color: '#fff', fontWeight: '600' },
    saveButtonDisabled: { opacity: 0.7 },
    // Stats
    statsGrid: { flexDirection: 'row', gap: 12 },
    statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
    statCardSimple: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
    statValueLight: { fontSize: 28, fontWeight: '700', color: '#fff', marginTop: 8 },
    statLabelLight: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
    statValueSmall: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginTop: 4 },
    statLabelSmall: { fontSize: 10, color: '#64748b' },
    // Licencias
    licensesGrid: { gap: 12 },
    licenseCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff' },
    licenseCardGradient: { padding: 16, gap: 12 },
    licenseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    licenseIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    licenseTitle: { flex: 1 },
    licenseModelName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    licenseTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 6 },
    licenseTypeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
    licenseBody: { gap: 8, paddingTop: 4 },
    licenseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    licenseRowLabel: { fontSize: 12, color: '#64748b' },
    licenseStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    licenseStatusDot: { width: 8, height: 8, borderRadius: 4 },
    licenseStatusText: { fontSize: 12, fontWeight: '500' },
    // Compras
    purchasesList: { gap: 12 },
    purchaseCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#e2e8f0' },
    purchaseCardGradient: { padding: 16, gap: 12 },
    purchaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
    purchaseId: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    purchaseNumber: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    purchaseStatus: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    purchaseStatusCompleted: { backgroundColor: '#10b98115' },
    purchaseStatusPending: { backgroundColor: '#f59e0b15' },
    purchaseStatusText: { fontSize: 10, fontWeight: '600' },
    purchaseDate: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
    purchaseDateText: { fontSize: 11, color: '#64748b' },
    purchaseItems: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    itemPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    itemName: { fontSize: 12, fontWeight: '500', color: '#1e293b', maxWidth: 120 },
    itemLicense: { backgroundColor: '#e0e7ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 20 },
    itemLicenseText: { fontSize: 9, fontWeight: '600', color: '#4f46e5' },
    itemMore: { fontSize: 11, color: '#64748b', paddingVertical: 5 },
    purchaseFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    purchaseTotal: { fontSize: 16, fontWeight: '700', color: '#4f46e5' },
    viewDetailsBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    viewDetailsText: { fontSize: 11, fontWeight: '500', color: '#4f46e5' },
    // Ajustes
    settingsGroup: { backgroundColor: '#fff', borderRadius: 20, padding: 16, gap: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    settingsGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    dangerZoneDescription: { fontSize: 12, color: '#991b1b', marginBottom: 12 },
    dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ef4444' },
    dangerButtonText: { color: '#ef4444', fontWeight: '500' },
    logoutButton: { borderRadius: 40, overflow: 'hidden' },
    logoutButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
    logoutButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
    // Estados vacíos
    centerContainer: { padding: 40, alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14, color: '#64748b' },
    emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0' },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 12 },
    emptyText: { fontSize: 13, color: '#64748b', marginTop: 4, textAlign: 'center', marginBottom: 16 },
    exploreButton: { borderRadius: 40, overflow: 'hidden' },
    exploreButtonGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 10 },
    exploreButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
    // Logros
    achievementsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
    achievementsCountBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    achievementsCount: { fontSize: 12, fontWeight: '600', color: '#fff' },
    achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
    viewAllButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, marginTop: 8 },
    viewAllButtonText: { color: '#4f46e5', fontSize: 13, fontWeight: '500' },
    nextLevelContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    nextLevelIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    nextLevelText: { fontSize: 13, color: '#64748b', flex: 1 },
    nextLevelXp: { fontSize: 11, color: '#94a3b8' },
    // Modales
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', borderRadius: 28, width: '90%', maxHeight: '85%', overflow: 'hidden' },
    modalSmallContainer: { backgroundColor: '#fff', borderRadius: 28, width: '80%', overflow: 'hidden' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    modalTitleIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    modalTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
    modalSection: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalSectionTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 12 },
    modalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    modalInfoLabel: { fontSize: 13, color: '#64748b' },
    modalInfoValue: { fontSize: 13, fontWeight: '500', color: '#1e293b' },
    modalStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    modalStatusCompleted: { backgroundColor: '#10b98115' },
    modalStatusText: { fontSize: 11, fontWeight: '600', color: '#10b981' },
    modalTotalValue: { fontSize: 18, fontWeight: '700', color: '#4f46e5' },
    modalModelItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalModelInfo: { flex: 1 },
    modalModelName: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    modalModelMeta: { fontSize: 11, color: '#64748b', marginTop: 2 },
    modalModelPrice: { alignItems: 'flex-end', gap: 6 },
    modalModelPriceText: { fontSize: 13, fontWeight: '700', color: '#4f46e5' },
    modalDownloadButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#e0e7ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
    modalDownloadButtonText: { fontSize: 10, fontWeight: '500', color: '#4f46e5' },
    modalCloseFooter: { padding: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    modalCloseFooterText: { fontSize: 16, fontWeight: '600', color: '#4f46e5' },
    // Format modal
    formatModalContainer: { backgroundColor: '#fff', borderRadius: 28, width: '85%', maxHeight: '80%', overflow: 'hidden' },
    modelInfoCard: { margin: 20, marginBottom: 0, padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    modelInfoName: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 6 },
    modelInfoMeta: { flexDirection: 'row', gap: 12 },
    modelInfoMetaText: { fontSize: 12, color: '#64748b' },
    formatModalSubtitle: { fontSize: 14, color: '#64748b', paddingHorizontal: 20, marginBottom: 12, marginTop: 16 },
    formatList: { paddingHorizontal: 20, gap: 12, marginBottom: 20 },
    formatItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#e2e8f0' },
    formatItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    formatIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    formatIconText: { fontSize: 24 },
    formatName: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    formatSize: { fontSize: 12, color: '#64748b', marginTop: 2 },
    emptyFormats: { alignItems: 'center', padding: 40 },
    emptyFormatsTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginTop: 12 },
    emptyFormatsText: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4 },
    modalFooter: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    cancelFooterButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
    cancelFooterButtonText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    downloadFooterButton: { flex: 1, borderRadius: 12, overflow: 'hidden' },
    downloadFooterButtonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
    downloadFooterButtonDisabled: { opacity: 0.6 },
    downloadFooterButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
    modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    modalOptionSelected: { backgroundColor: '#e0e7ff' },
    modalOptionText: { fontSize: 15, fontWeight: '500', color: '#1e293b' },
    modalOptionDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
});