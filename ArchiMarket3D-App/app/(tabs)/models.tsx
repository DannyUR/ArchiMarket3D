// app/(tabs)/models.tsx
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, 
    ActivityIndicator, StyleSheet, Dimensions, RefreshControl, FlatList
} from 'react-native';
import { useState, useEffect, useCallback, useRef } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../api/client';

const { width } = Dimensions.get('window');

interface Category {
    id: number;
    name: string;
    models_count: number;
    category_type?: string;
}

interface Model {
    id: number;
    name: string;
    price: number;
    format?: string;
    size_mb?: number;
    category?: Category;
    description?: string;
    downloads_count?: number;
    views_count?: number;
}

interface DownloadInfo {
    is_downloadable: boolean;
    available_formats: string[];
    total_size_mb: number;
}

export default function ExploreScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [categoryModels, setCategoryModels] = useState<Model[]>([]);
    const [downloadInfo, setDownloadInfo] = useState<Record<number, DownloadInfo>>({});
    const [loading, setLoading] = useState(true);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchCategories();
        fetchAllModels();
    }, []);

    useEffect(() => {
        if (selectedCategoryId !== 'all') {
            fetchCategoryModels(selectedCategoryId);
        }
    }, [selectedCategoryId]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            const categoriesData = response.data.data || response.data || [];
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Cargar TODOS los modelos usando paginación automática
    const fetchAllModels = async () => {
        setLoading(true);
        try {
            let allModelsList: Model[] = [];
            let currentPage = 1;
            let hasMore = true;
            const limit = 100;
            
            console.log('🔄 Iniciando carga de todos los modelos...');
            
            while (hasMore) {
                try {
                    const response = await api.get(`/models?page=${currentPage}&limit=${limit}`);
                    const modelsData = response.data.data?.data || response.data.data || [];
                    const pagination = response.data.data;
                    
                    if (modelsData.length > 0) {
                        allModelsList = [...allModelsList, ...modelsData];
                        console.log(`📦 Página ${currentPage}: cargados ${modelsData.length} modelos (total: ${allModelsList.length})`);
                        currentPage++;
                    } else {
                        hasMore = false;
                    }
                    
                    if (pagination && currentPage > pagination.last_page) {
                        hasMore = false;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (pageError) {
                    console.error(`Error cargando página ${currentPage}:`, pageError);
                    hasMore = false;
                }
            }
            
            console.log(`✅ Total modelos cargados: ${allModelsList.length}`);
            setAllModels(allModelsList);
            
            // Cargar información de descargas para todos los modelos
            await loadDownloadInfoForModels(allModelsList);
            
        } catch (error) {
            console.error('Error fetching all models:', error);
            setAllModels([]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar TODOS los modelos de una categoría
    const fetchCategoryModels = async (categoryId: number) => {
        setModelsLoading(true);
        try {
            let allCategoryModels: Model[] = [];
            let currentPage = 1;
            let hasMore = true;
            const limit = 100;
            
            console.log(`🔄 Iniciando carga de modelos para categoría ${categoryId}...`);
            
            while (hasMore) {
                try {
                    const response = await api.get(`/categories/${categoryId}/models?page=${currentPage}&limit=${limit}`);
                    const modelsData = response.data.data?.data || response.data.models || [];
                    const pagination = response.data.data;
                    
                    if (modelsData.length > 0) {
                        allCategoryModels = [...allCategoryModels, ...modelsData];
                        console.log(`📦 Página ${currentPage}: cargados ${modelsData.length} modelos (total: ${allCategoryModels.length})`);
                        currentPage++;
                    } else {
                        hasMore = false;
                    }
                    
                    if (pagination && currentPage > pagination.last_page) {
                        hasMore = false;
                    }
                    
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (pageError) {
                    console.error(`Error cargando página ${currentPage}:`, pageError);
                    hasMore = false;
                }
            }
            
            console.log(`✅ Total modelos categoría: ${allCategoryModels.length}`);
            setCategoryModels(allCategoryModels);
            
            // Cargar información de descargas para los modelos de la categoría
            await loadDownloadInfoForModels(allCategoryModels);
            
        } catch (error) {
            console.error('Error fetching category models:', error);
            setCategoryModels([]);
        } finally {
            setModelsLoading(false);
        }
    };

    // Cargar información de descargas para un array de modelos
    const loadDownloadInfoForModels = async (models: Model[]) => {
        if (models.length === 0) return;
        
        console.log(`📥 Cargando información de descargas para ${models.length} modelos...`);
        
        const batchSize = 10;
        const newDownloadInfo: Record<number, DownloadInfo> = { ...downloadInfo };
        
        for (let i = 0; i < models.length; i += batchSize) {
            const batch = models.slice(i, i + batchSize);
            const promises = batch.map(async (model) => {
                try {
                    const response = await api.get(`/models/${model.id}/download-info`);
                    const data = response.data;
                    newDownloadInfo[model.id] = {
                        is_downloadable: data?.is_downloadable || false,
                        available_formats: data?.available_formats || [],
                        total_size_mb: data?.total_size_mb || 0
                    };
                } catch (error) {
                    console.error(`Error loading download info for model ${model.id}:`, error);
                    newDownloadInfo[model.id] = {
                        is_downloadable: false,
                        available_formats: [],
                        total_size_mb: 0
                    };
                }
            });
            
            await Promise.all(promises);
        }
        
        setDownloadInfo(newDownloadInfo);
        console.log(`✅ Información de descargas cargada para ${Object.keys(newDownloadInfo).length} modelos`);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchCategories(),
            fetchAllModels(),
            selectedCategoryId !== 'all' && fetchCategoryModels(selectedCategoryId as number)
        ]);
        setRefreshing(false);
    }, [selectedCategoryId]);

    const getCategoryEmoji = (categoryName: string): string => {
        const icons: Record<string, string> = {
            'Estructuras de Acero': '🏗️',
            'Estructuras de Concreto': '🏗️',
            'Cimentaciones': '🏗️',
            'Elementos Portantes': '🏗️',
            'Arquitectura Residencial': '🏠',
            'Arquitectura Comercial': '🏢',
            'Fachadas y Cerramientos': '🏛️',
            'Cubiertas y Azoteas': '🏠',
            'Sistemas Eléctricos': '⚡',
            'Fontanería y Tuberías': '🔧',
            'HVAC (Climatización)': '❄️',
            'Protección Contra Incendios': '🔥',
            'Mobiliario de Oficina': '🪑',
            'Mobiliario Residencial': '🛋️',
            'Mobiliario Urbano': '🚏',
            'Equipamiento': '⚙️',
            'Equipo Pesado': '🏗️',
            'Maquinaria Industrial': '🏭',
            'Equipo de Construcción': '🚜',
            'Infraestructura Vial': '🛣️',
            'Espacios Públicos': '🏞️',
            'Paisajismo': '🌳',
            'Redes de Servicio': '🔌'
        };
        return icons[categoryName] || '📦';
    };

    const getCategoryColor = (categoryName: string): string => {
        const colorMap: Record<string, string> = {
            'Estructuras de Acero': '#3b82f6',
            'Estructuras de Concreto': '#3b82f6',
            'Cimentaciones': '#3b82f6',
            'Elementos Portantes': '#3b82f6',
            'Arquitectura Residencial': '#22c55e',
            'Arquitectura Comercial': '#22c55e',
            'Fachadas y Cerramientos': '#22c55e',
            'Cubiertas y Azoteas': '#22c55e',
            'Sistemas Eléctricos': '#eab308',
            'Fontanería y Tuberías': '#eab308',
            'HVAC (Climatización)': '#eab308',
            'Protección Contra Incendios': '#eab308',
            'Mobiliario de Oficina': '#a855f7',
            'Mobiliario Residencial': '#a855f7',
            'Mobiliario Urbano': '#a855f7',
            'Equipamiento': '#a855f7',
            'Equipo Pesado': '#ef4444',
            'Maquinaria Industrial': '#ef4444',
            'Equipo de Construcción': '#ef4444',
            'Infraestructura Vial': '#06b6d4',
            'Espacios Públicos': '#06b6d4',
            'Paisajismo': '#06b6d4',
            'Redes de Servicio': '#06b6d4'
        };
        return colorMap[categoryName] || '#2563eb';
    };

    // Get current display models based on selection
    const getCurrentModels = (): Model[] => {
        const models = selectedCategoryId === 'all' ? allModels : categoryModels;
        if (searchTerm === '') return models;
        
        return models.filter(model =>
            model.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            model.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const formatPrice = (price: number) => {
        if (!price) return '$0 MXN';
        return `$${price.toFixed(2)} MXN`;
    };

    const handleCategorySelect = (categoryId: number | 'all') => {
        setSelectedCategoryId(categoryId);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };

    const renderModelItem = ({ item, index }: { item: Model; index: number }) => {
        const categoryName = typeof item.category === 'object' 
            ? item.category?.name 
            : selectedCategoryId === 'all' ? 'Modelo 3D' : categories.find(c => c.id === selectedCategoryId)?.name;
        const categoryColor = getCategoryColor(categoryName || '');
        const emoji = getCategoryEmoji(categoryName || '');
        const modelDownloadInfo = downloadInfo[item.id];

        return (
            <TouchableOpacity
                style={styles.modelCard}
                onPress={() => router.push(`/models/${item.id}`)}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={[categoryColor + '15', categoryColor + '05']}
                    style={styles.modelImage}
                >
                    <Text style={styles.modelEmoji}>{emoji}</Text>
                    <View style={styles.modelBadge}>
                        <Ionicons name="eye-outline" size={10} color={categoryColor} />
                        <Text style={[styles.modelBadgeText, { color: categoryColor }]}>3D</Text>
                    </View>
                    
                    {/* ✅ Badge de descargas disponibles */}
                    {modelDownloadInfo && (
                        <View style={[
                            styles.downloadBadge,
                            modelDownloadInfo.is_downloadable ? styles.downloadBadgeAvailable : styles.downloadBadgeUnavailable
                        ]}>
                            <Ionicons 
                                name={modelDownloadInfo.is_downloadable ? "checkmark-circle" : "time-outline"} 
                                size={12} 
                                color={modelDownloadInfo.is_downloadable ? "#059669" : "#92400e"} 
                            />
                            <Text style={[
                                styles.downloadBadgeText,
                                modelDownloadInfo.is_downloadable ? styles.downloadBadgeTextAvailable : styles.downloadBadgeTextUnavailable
                            ]}>
                                {modelDownloadInfo.is_downloadable 
                                    ? `${modelDownloadInfo.available_formats?.length || 0} formato(s)` 
                                    : "Sin descargas"}
                            </Text>
                        </View>
                    )}
                </LinearGradient>
                <View style={styles.modelInfo}>
                    <Text style={[styles.modelCategory, { color: categoryColor }]}>
                        {categoryName || 'Modelo 3D'}
                    </Text>
                    <Text style={styles.modelName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <View style={styles.modelMeta}>
                        <View style={styles.modelMetaItem}>
                            <Ionicons name="cube-outline" size={12} color="#64748b" />
                            <Text style={styles.modelMetaText}>{item.format || 'GLTF'}</Text>
                        </View>
                        <View style={styles.modelMetaItem}>
                            <Ionicons name="download-outline" size={12} color="#64748b" />
                            <Text style={styles.modelMetaText}>{item.size_mb || 0} MB</Text>
                        </View>
                    </View>
                    <View style={styles.modelFooter}>
                        <Text style={styles.modelPrice}>{formatPrice(item.price)}</Text>
                        <View style={styles.modelStats}>
                            <Ionicons name="star" size={12} color="#fbbf24" />
                            <Text style={styles.modelStatsText}>4.5</Text>
                            <View style={styles.statsDivider} />
                            <Ionicons name="download-outline" size={10} color="#64748b" />
                            <Text style={styles.modelStatsText}>{item.downloads_count || 0}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const currentModels = getCurrentModels();
    const isLoading = selectedCategoryId === 'all' ? loading : modelsLoading;
    const currentCategoryName = selectedCategoryId === 'all' 
        ? 'Todos los modelos' 
        : categories.find(c => c.id === selectedCategoryId)?.name || 'Modelos';

    if (loading && categories.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#1e40af', '#3b82f6', '#60a5fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Explorar</Text>
                <Text style={styles.headerSubtitle}>
                    Descubre modelos 3D profesionales
                </Text>
            </LinearGradient>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search-outline" size={20} color="#94a3b8" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar modelos..."
                        placeholderTextColor="#94a3b8"
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {searchTerm !== '' && (
                        <TouchableOpacity onPress={() => setSearchTerm('')}>
                            <Ionicons name="close-circle" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Categories Horizontal Scroll */}
            <View style={styles.categoriesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesScroll}
                >
                    {/* "Todos" option */}
                    <TouchableOpacity
                        style={[
                            styles.horizontalCategoryChip,
                            selectedCategoryId === 'all' && styles.horizontalCategoryChipActive
                        ]}
                        onPress={() => handleCategorySelect('all')}
                    >
                        <Text style={styles.horizontalCategoryEmoji}>📦</Text>
                        <Text style={[
                            styles.horizontalCategoryName,
                            selectedCategoryId === 'all' && styles.horizontalCategoryNameActive
                        ]}>
                            Todos ({allModels.length})
                        </Text>
                        {selectedCategoryId === 'all' && <View style={styles.activeDot} />}
                    </TouchableOpacity>

                    {/* Individual Categories */}
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.horizontalCategoryChip,
                                selectedCategoryId === category.id && styles.horizontalCategoryChipActive
                            ]}
                            onPress={() => handleCategorySelect(category.id)}
                        >
                            <Text style={styles.horizontalCategoryEmoji}>
                                {getCategoryEmoji(category.name)}
                            </Text>
                            <Text style={[
                                styles.horizontalCategoryName,
                                selectedCategoryId === category.id && styles.horizontalCategoryNameActive
                            ]}>
                                {category.name.length > 12 ? category.name.substring(0, 10) + '...' : category.name}
                            </Text>
                            {selectedCategoryId === category.id && <View style={styles.activeDot} />}
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Models Grid */}
            <View style={styles.modelsContainer}>
                {isLoading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loadingText}>Cargando modelos...</Text>
                    </View>
                ) : currentModels.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="cube-outline" size={64} color="#cbd5e1" />
                        <Text style={styles.emptyTitle}>No hay modelos</Text>
                        <Text style={styles.emptyText}>
                            {searchTerm !== '' 
                                ? `No se encontraron resultados para "${searchTerm}"`
                                : `No hay modelos disponibles en ${currentCategoryName}`}
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={currentModels}
                        renderItem={renderModelItem}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={styles.columnWrapper}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        contentContainerStyle={styles.modelsList}
                        ListHeaderComponent={
                            searchTerm !== '' ? (
                                <View style={styles.searchResultHeader}>
                                    <Text style={styles.searchResultText}>
                                        {currentModels.length} resultados para "{searchTerm}"
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.categoryInfoHeader}>
                                    <Text style={styles.categoryInfoText}>
                                        {currentCategoryName} • {currentModels.length} modelos
                                    </Text>
                                </View>
                            )
                        }
                    />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginTop: -16,
        marginBottom: 12,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 40,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#1e293b',
    },
    categoriesContainer: {
        marginBottom: 8,
    },
    categoriesScroll: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    horizontalCategoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 40,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginRight: 8,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    horizontalCategoryChipActive: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    horizontalCategoryEmoji: {
        fontSize: 16,
    },
    horizontalCategoryName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#1e293b',
    },
    horizontalCategoryNameActive: {
        color: '#fff',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
        marginLeft: 2,
    },
    modelsContainer: {
        flex: 1,
        paddingHorizontal: 12,
    },
    modelsList: {
        paddingBottom: 20,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        gap: 12,
    },
    modelCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
    },
    modelImage: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    modelEmoji: {
        fontSize: 48,
    },
    modelBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    modelBadgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    downloadBadge: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
    },
    downloadBadgeAvailable: {
        backgroundColor: '#ecfdf5',
        borderWidth: 1,
        borderColor: '#a7f3d0',
    },
    downloadBadgeUnavailable: {
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    downloadBadgeText: {
        fontSize: 9,
        fontWeight: '600',
    },
    downloadBadgeTextAvailable: {
        color: '#059669',
    },
    downloadBadgeTextUnavailable: {
        color: '#92400e',
    },
    modelInfo: {
        padding: 12,
    },
    modelCategory: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    modelName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 18,
    },
    modelMeta: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    modelMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    modelMetaText: {
        fontSize: 10,
        color: '#64748b',
    },
    modelFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modelPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#2563eb',
    },
    modelStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f8fafc',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
    },
    modelStatsText: {
        fontSize: 10,
        color: '#64748b',
    },
    statsDivider: {
        width: 1,
        height: 10,
        backgroundColor: '#e2e8f0',
        marginHorizontal: 2,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 12,
    },
    emptyText: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
        textAlign: 'center',
    },
    searchResultHeader: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    searchResultText: {
        fontSize: 13,
        color: '#64748b',
    },
    categoryInfoHeader: {
        paddingVertical: 8,
        marginBottom: 8,
    },
    categoryInfoText: {
        fontSize: 13,
        color: '#64748b',
    },
});