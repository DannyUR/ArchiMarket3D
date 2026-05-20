// app/(tabs)/index.tsx
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import api from '../../api/client';

const { width } = Dimensions.get('window');

// Tipos
interface Model {
    id: number;
    name: string;
    price: number;
    category?: { id: number; name: string; };
    format?: string;
    featured?: boolean;
}

interface Category {
    id: number;
    name: string;
    models_count: number;
}

export default function HomeScreen() {
    const { user, isLoading } = useAuth();
    const [featuredModels, setFeaturedModels] = useState<Model[]>([]);
    const [trendingCategories, setTrendingCategories] = useState<Category[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('🌅 Buenos días');
        else if (hour < 19) setGreeting('☀️ Buenas tardes');
        else setGreeting('🌙 Buenas noches');

        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        fetchData();

        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        try {
            const [featuredRes, categoriesRes] = await Promise.all([
                api.get('/models/featured?limit=8').catch(() => ({ data: { data: [] } })),
                api.get('/categories').catch(() => ({ data: { data: [] } }))
            ]);

            setFeaturedModels(featuredRes.data.data || []);
            
            const allCats = categoriesRes.data.data || [];
            const topCats = allCats
                .filter((cat: Category) => cat.models_count > 0)
                .sort((a: Category, b: Category) => b.models_count - a.models_count)
                .slice(0, 3);
            setTrendingCategories(topCats);
        } catch (error) {
            console.error('Error fetching home data:', error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const getCategoryEmoji = (categoryName: string): string => {
        const icons: Record<string, string> = {
            'Arquitectura Residencial': '🏠',
            'Arquitectura Comercial': '🏢',
            'Mobiliario de Oficina': '🪑',
            'Mobiliario Residencial': '🛋️',
            'Estructuras de Acero': '🏗️',
            'Estructuras de Concreto': '🏗️',
            'Vegetación': '🌳',
            'Paisajismo': '🌿',
            'Iluminación': '💡',
            'Texturas': '🎨',
            'Instalaciones': '🔧',
        };
        return icons[categoryName] || '📦';
    };

    const getCategoryColor = (categoryName: string): string[] => {
        const colors: Record<string, string[]> = {
            'Arquitectura Residencial': ['#4f46e5', '#7c3aed'],
            'Arquitectura Comercial': ['#4f46e5', '#7c3aed'],
            'Mobiliario': ['#ea580c', '#f97316'],
            'Vegetación': ['#16a34a', '#22c55e'],
            'Iluminación': ['#ca8a04', '#eab308'],
            'Texturas': ['#7e22ce', '#a855f7'],
            'Instalaciones': ['#4b5563', '#6b7280'],
        };
        return colors[categoryName] || ['#4f46e5', '#7c3aed'];
    };

    const formatPrice = (price: number) => {
        if (!price) return '$0';
        return `$${price.toFixed(2)}`;
    };

    if (isLoading || !isClient) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Cargando...</Text>
            </View>
        );
    }

    if (!user) {
        return <UnauthenticatedHome />;
    }

    return <AuthenticatedHome 
        user={user} 
        featuredModels={featuredModels}
        trendingCategories={trendingCategories}
        greeting={greeting}
        currentTime={currentTime}
        onRefresh={onRefresh}
        refreshing={refreshing}
        getCategoryEmoji={getCategoryEmoji}
        getCategoryColor={getCategoryColor}
        formatPrice={formatPrice}
    />;
}

// 🎯 PANTALLA PARA USUARIOS AUTENTICADOS
function AuthenticatedHome({ 
    user, featuredModels, trendingCategories, greeting, currentTime, onRefresh, refreshing,
    getCategoryEmoji, getCategoryColor, formatPrice
}: any) {
    const firstName = (user?.name || user?.email || 'Usuario').split(' ')[0];
    const userRole = user?.role || user?.user_type || 'usuario';

    const getRoleText = (role: string) => {
        switch(role) {
            case 'architect': return 'Arquitecto';
            case 'engineer': return 'Ingeniero';
            case 'company': return 'Empresa';
            default: return 'Usuario';
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('es-MX', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    };

    return (
        <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
        >
            {/* 🔥 HEADER CON MÁS PADDING SUPERIOR */}
            <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <SafeAreaView>
                    <View style={styles.headerContent}>
                        <View style={styles.welcomeSection}>
                            <Text style={styles.greeting}>{greeting}</Text>
                            <Text style={styles.userName}>{firstName}</Text>
                            <View style={styles.roleBadge}>
                                <Ionicons name="star" size={12} color="#fbbf24" />
                                <Text style={styles.roleText}>{getRoleText(userRole)}</Text>
                            </View>
                        </View>
                        <View style={styles.dateTimeSection}>
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="calendar-outline" size={14} color="#c7d2fe" />
                                <Text style={styles.dateTimeText}>{formatDate()}</Text>
                            </View>
                            <View style={styles.dateTimeDivider} />
                            <View style={styles.dateTimeItem}>
                                <Ionicons name="time-outline" size={14} color="#c7d2fe" />
                                <Text style={styles.dateTimeText}>{formatTime(currentTime)} hrs</Text>
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* Banner principal - con margen superior para separarlo del header */}
            <LinearGradient
                colors={['#1e1b4b', '#312e81']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mainBanner}
            >
                <View style={styles.bannerContent}>
                    <View style={styles.bannerTag}>
                        <Ionicons name="sparkles" size={14} color="#fbbf24" />
                        <Text style={styles.bannerTagText}>CURADOS PARA TI</Text>
                    </View>
                    <Text style={styles.bannerTitle}>
                        Modelos <Text style={styles.bannerHighlight}>Destacados</Text>
                    </Text>
                    <Text style={styles.bannerText}>
                        Nuestro equipo selecciona los mejores modelos para garantizar calidad en tus proyectos.
                    </Text>
                    <View style={styles.bannerStats}>
                        <View style={styles.bannerStat}>
                            <Text style={styles.bannerStatNumber}>{featuredModels.length}+</Text>
                            <Text style={styles.bannerStatLabel}>Destacados</Text>
                        </View>
                        <View style={styles.bannerStatDivider} />
                        <View style={styles.bannerStat}>
                            <Text style={styles.bannerStatNumber}>236</Text>
                            <Text style={styles.bannerStatLabel}>Modelos totales</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.bannerButton} onPress={() => router.push('/(tabs)/models')}>
                        <LinearGradient
                            colors={['#fbbf24', '#f59e0b']}
                            style={styles.bannerButtonGradient}
                        >
                            <Text style={styles.bannerButtonText}>Explorar catálogo</Text>
                            <Ionicons name="arrow-forward" size={18} color="#1e1b4b" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* Categorías populares */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitle}>
                        <View style={styles.sectionIconBg}>
                            <Ionicons name="compass" size={20} color="#4f46e5" />
                        </View>
                        <Text style={styles.sectionTitleText}>Categorías populares</Text>
                    </View>
                    <TouchableOpacity style={styles.viewAllLink} onPress={() => router.push('/(tabs)/models')}>
                        <Text style={styles.viewAllText}>Ver todas</Text>
                        <Ionicons name="arrow-forward" size={14} color="#4f46e5" />
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    {trendingCategories.length > 0 ? (
                        trendingCategories.map((cat: any) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={styles.categoryCard}
                                onPress={() => router.push(`/(tabs)/models?category=${cat.name}`)}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={getCategoryColor(cat.name)}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.categoryGradient}
                                >
                                    <Text style={styles.categoryEmoji}>{getCategoryEmoji(cat.name)}</Text>
                                    <Text style={styles.categoryName}>{cat.name}</Text>
                                    <Text style={styles.categoryCount}>{cat.models_count} modelos</Text>
                                    <View style={styles.categoryTrend}>
                                        <Ionicons name="trending-up" size={12} color="#fff" />
                                        <Text style={styles.categoryTrendText}>Popular</Text>
                                    </View>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))
                    ) : (
                        [1, 2, 3].map(i => (
                            <View key={i} style={styles.skeletonCategory} />
                        ))
                    )}
                </View>
            </View>

            {/* Modelos Destacados */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitle}>
                        <View style={styles.sectionIconBg}>
                            <Ionicons name="trophy" size={20} color="#4f46e5" />
                        </View>
                        <Text style={styles.sectionTitleText}>Modelos Destacados</Text>
                    </View>
                    <TouchableOpacity style={styles.viewAllLink} onPress={() => router.push('/(tabs)/models')}>
                        <Text style={styles.viewAllText}>Ver todos</Text>
                        <Ionicons name="arrow-forward" size={14} color="#4f46e5" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modelsScroll}>
                    {featuredModels.length > 0 ? (
                        featuredModels.slice(0, 8).map((model: any) => {
                            const categoryName = typeof model.category === 'object' 
                                ? model.category?.name || 'Modelo 3D' 
                                : model.category || 'Modelo 3D';
                            const emoji = getCategoryEmoji(categoryName);

                            return (
                                <TouchableOpacity
                                    key={model.id}
                                    style={styles.modelCard}
                                    onPress={() => router.push(`/models/${model.id}`)}
                                    activeOpacity={0.8}
                                >
                                    <LinearGradient
                                        colors={['#f8fafc', '#f1f5f9']}
                                        style={styles.modelImage}
                                    >
                                        <Text style={styles.modelEmoji}>{emoji}</Text>
                                        <View style={styles.featuredBadge}>
                                            <Ionicons name="flash" size={10} color="#fff" />
                                            <Text style={styles.featuredBadgeText}>Destacado</Text>
                                        </View>
                                    </LinearGradient>
                                    <View style={styles.modelInfo}>
                                        <Text style={styles.modelCategory}>{categoryName}</Text>
                                        <Text style={styles.modelName} numberOfLines={2}>{model.name}</Text>
                                        <View style={styles.modelMeta}>
                                            <View style={styles.modelFormatBadge}>
                                                <Ionicons name="cube-outline" size={10} color="#6b7280" />
                                                <Text style={styles.modelFormat}>{model.format || 'GLTF'}</Text>
                                            </View>
                                            <Text style={styles.modelPrice}>{formatPrice(model.price)}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })
                    ) : (
                        <View style={styles.emptyModels}>
                            <LinearGradient
                                colors={['#f8fafc', '#f1f5f9']}
                                style={styles.emptyModelsGradient}
                            >
                                <Ionicons name="sparkles" size={48} color="#c7d2fe" />
                                <Text style={styles.emptyTitle}>Próximamente modelos destacados</Text>
                                <Text style={styles.emptyText}>Explora nuestro catálogo completo</Text>
                                <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/models')}>
                                    <Text style={styles.emptyButtonText}>Explorar catálogo</Text>
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Banner de licencias */}
            <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.promoBanner}
            >
                <View style={styles.promoContent}>
                    <View style={styles.promoIcon}>
                        <Ionicons name="rocket" size={28} color="#fbbf24" />
                    </View>
                    <View style={styles.promoTextContent}>
                        <Text style={styles.promoTitle}>🚀 ¿Buscas algo específico?</Text>
                        <Text style={styles.promoText}>Accede a todos los modelos con una licencia profesional</Text>
                    </View>
                    <TouchableOpacity style={styles.promoButton} onPress={() => router.push('/(tabs)/licenses')}>
                        <Text style={styles.promoButtonText}>Ver licencias</Text>
                        <Ionicons name="arrow-forward" size={16} color="#fbbf24" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </ScrollView>
    );
}

// 🎯 PANTALLA PARA INVITADOS
function UnauthenticatedHome() {
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#4f46e5', '#7c3aed', '#c026d3']} style={styles.heroSection}>
                <Text style={styles.heroBadge}>✨ Plataforma profesional</Text>
                <Text style={styles.heroTitle}>
                    Modelos 3D para{' '}
                    <Text style={styles.heroTitleAccent}>arquitectura</Text>
                </Text>
                <Text style={styles.heroDescription}>
                    Descarga modelos de alta calidad para tus proyectos. 
                    Más de 236 modelos organizados en 24 categorías.
                </Text>
                
                <View style={styles.heroButtons}>
                    <TouchableOpacity style={styles.heroPrimaryButton} onPress={() => router.push('/auth/register')}>
                        <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.heroPrimaryGradient}>
                            <Text style={styles.heroPrimaryText}>Comenzar gratis</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.heroSecondaryButton} onPress={() => router.push('/auth/login')}>
                        <Text style={styles.heroSecondaryText}>Iniciar sesión</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.featuresGrid}>
                {[
                    { title: '236+ modelos', desc: 'Arquitectura, mobiliario, vegetación y más', icon: 'cube-outline', color: '#4f46e5', bg: '#e0e7ff' },
                    { title: 'Descarga real', desc: 'Archivos GLB, GLTF, USDZ listos para usar', icon: 'cloud-download-outline', color: '#ea580c', bg: '#fff7ed' },
                    { title: 'Licencias flexibles', desc: 'Personal, empresarial e ilimitada', icon: 'document-text-outline', color: '#16a34a', bg: '#f0fdf4' },
                    { title: 'Calificaciones reales', desc: 'Reseñas verificadas de usuarios', icon: 'star-outline', color: '#ca8a04', bg: '#fefce8' }
                ].map((feature, i) => (
                    <View key={i} style={[styles.featureItem, { backgroundColor: feature.bg }]}>
                        <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                            <Ionicons name={feature.icon as any} size={28} color={feature.color} />
                        </View>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDesc}>{feature.desc}</Text>
                    </View>
                ))}
            </View>

            <LinearGradient colors={['#fbbf24', '#f59e0b', '#ea580c']} style={styles.ctaSection}>
                <Text style={styles.ctaTitle}>✨ ¿Listo para empezar?</Text>
                <Text style={styles.ctaText}>Únete a más de 500 profesionales que ya usan ArchiMarket3D</Text>
                <TouchableOpacity style={styles.ctaButton} onPress={() => router.push('/auth/register')}>
                    <Text style={styles.ctaButtonText}>Crear cuenta gratuita</Text>
                    <Ionicons name="arrow-forward" size={16} color="#1e1b4b" />
                </TouchableOpacity>
            </LinearGradient>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
    loadingText: { fontSize: 16, color: '#4f46e5', marginTop: 12 },
    
    // 🔥 HEADER CON MÁS ESPACIO
    headerGradient: {
        paddingTop: 20,
        paddingBottom: 28,
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 20,
    },
    welcomeSection: {
        flex: 1,
    },
    greeting: {
        fontSize: 14,
        color: '#c7d2fe',
        marginBottom: 4,
    },
    userName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    roleText: {
        fontSize: 12,
        color: '#fbbf24',
        fontWeight: '500',
    },
    dateTimeSection: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
        alignItems: 'center',
    },
    dateTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 4,
    },
    dateTimeText: {
        fontSize: 11,
        color: '#c7d2fe',
    },
    dateTimeDivider: {
        height: 1,
        width: '100%',
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 4,
    },
    
    // Banner principal - CON MARGEN SUPERIOR
    mainBanner: {
        marginHorizontal: 16,
        marginTop: 20,
        marginBottom: 28,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    bannerContent: {
        padding: 24,
    },
    bannerTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 30,
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    bannerTagText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fbbf24',
    },
    bannerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
        lineHeight: 36,
    },
    bannerHighlight: {
        color: '#fbbf24',
    },
    bannerText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 20,
        lineHeight: 20,
    },
    bannerStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    bannerStat: {
        alignItems: 'center',
    },
    bannerStatNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
    },
    bannerStatLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.6)',
    },
    bannerStatDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    bannerButton: {
        alignSelf: 'flex-start',
    },
    bannerButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 40,
    },
    bannerButtonText: {
        color: '#1e1b4b',
        fontWeight: '600',
        fontSize: 14,
    },
    
    // Secciones
    section: {
        paddingHorizontal: 16,
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionIconBg: {
        width: 32,
        height: 32,
        backgroundColor: '#e0e7ff',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitleText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
    },
    viewAllLink: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    viewAllText: {
        fontSize: 13,
        color: '#4f46e5',
        fontWeight: '500',
    },
    
    // Categorías
    categoriesGrid: {
        gap: 12,
    },
    categoryCard: {
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    categoryGradient: {
        padding: 20,
        alignItems: 'center',
    },
    categoryEmoji: {
        fontSize: 44,
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
        textAlign: 'center',
    },
    categoryCount: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
    },
    categoryTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 30,
    },
    categoryTrendText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    skeletonCategory: {
        height: 140,
        backgroundColor: '#f1f5f9',
        borderRadius: 20,
    },
    
    // Modelos destacados
    modelsScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    modelCard: {
        width: 160,
        marginRight: 14,
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
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
    featuredBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#4f46e5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    featuredBadgeText: {
        fontSize: 9,
        fontWeight: '600',
        color: '#fff',
    },
    modelInfo: {
        padding: 12,
    },
    modelCategory: {
        fontSize: 10,
        color: '#4f46e5',
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    modelName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 8,
        lineHeight: 16,
    },
    modelMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modelFormatBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    modelFormat: {
        fontSize: 9,
        color: '#6b7280',
    },
    modelPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#4f46e5',
    },
    emptyModels: {
        width: width - 32,
        alignItems: 'center',
        overflow: 'hidden',
        borderRadius: 20,
    },
    emptyModelsGradient: {
        alignItems: 'center',
        padding: 40,
        width: '100%',
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginTop: 16,
        marginBottom: 4,
    },
    emptyText: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 20,
    },
    emptyButton: {
        backgroundColor: '#4f46e5',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 40,
    },
    emptyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
    
    // Banner promocional
    promoBanner: {
        marginHorizontal: 16,
        marginBottom: 32,
        borderRadius: 24,
        padding: 20,
    },
    promoContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
    },
    promoIcon: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    promoTextContent: {
        flex: 1,
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    promoText: {
        fontSize: 13,
        color: '#cbd5e1',
        lineHeight: 18,
    },
    promoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(251, 191, 36, 0.15)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 40,
    },
    promoButtonText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#fbbf24',
    },
    
    // Hero invitados
    heroSection: {
        paddingTop: 80,
        paddingBottom: 60,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    heroBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 40,
        fontSize: 12,
        color: '#fbbf24',
        fontWeight: '500',
        alignSelf: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 36,
        fontWeight: '700',
        color: 'white',
        textAlign: 'center',
        lineHeight: 48,
        marginBottom: 16,
    },
    heroTitleAccent: {
        color: '#fbbf24',
    },
    heroDescription: {
        fontSize: 15,
        color: '#c7d2fe',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 20,
    },
    heroButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'center',
    },
    heroPrimaryButton: {
        borderRadius: 40,
        overflow: 'hidden',
    },
    heroPrimaryGradient: {
        paddingVertical: 12,
        paddingHorizontal: 28,
    },
    heroPrimaryText: {
        color: '#1e1b4b',
        fontWeight: '600',
        fontSize: 14,
    },
    heroSecondaryButton: {
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    heroSecondaryText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 24,
        gap: 16,
        marginVertical: 48,
    },
    featureItem: {
        width: (width - 64) / 2,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    featureIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0f172a',
        marginBottom: 4,
    },
    featureDesc: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 18,
    },
    ctaSection: {
        margin: 24,
        marginBottom: 40,
        borderRadius: 32,
        padding: 32,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e1b4b',
        marginBottom: 8,
    },
    ctaText: {
        fontSize: 14,
        color: '#422006',
        textAlign: 'center',
        marginBottom: 24,
    },
    ctaButton: {
        flexDirection: 'row',
        backgroundColor: '#1e1b4b',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 40,
        alignItems: 'center',
        gap: 8,
    },
    ctaButtonText: {
        color: '#fbbf24',
        fontWeight: '600',
        fontSize: 14,
    },
});