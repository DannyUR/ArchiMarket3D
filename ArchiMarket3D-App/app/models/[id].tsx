// app/models/[id].tsx
import {
  View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator,
  Alert, StyleSheet, Modal, RefreshControl, Platform, TextInput
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { useCart } from '../../context/CartContext'; // ✅ Cambiado
import { useAuth } from '../../context/AuthContext'; // ✅ Cambiado

// Importar WebView condicionalmente
let WebView: any = null;
if (Platform.OS !== 'web') {
  // Solo importar en móvil
  const { WebView: NativeWebView } = require('react-native-webview');
  WebView = NativeWebView;
}

// ==================== TIPOS ====================
interface Category {
  id: number;
  name: string;
}

interface Model {
  id: number;
  name: string;
  description: string;
  price: number;
  format?: string;
  size_mb?: number;
  publication_date?: string;
  embed_url?: string;
  preview_url?: string;
  category?: Category;
  author_name?: string;
  author_avatar?: string;
  author_bio?: string;
  featured?: boolean;
  avg_rating?: number;
  reviews_count?: number;
  downloads_count?: number;
  has_downloadable?: boolean;
}

interface Author {
  name: string;
  avatar: string;
  bio: string;
}

interface Stats {
  average_rating: number;
  total_reviews: number;
  purchases_count: number;
}

interface Access {
  can_download: boolean;
  can_preview: boolean;
  can_review: boolean;
  reviewer_status: string;
}

// ==================== COMPONENTE VISOR 3D ====================
const ModelViewer = ({ embedUrl, previewUrl }: { embedUrl: string | undefined; previewUrl: string | undefined }) => {
  const [iframeError, setIframeError] = useState(false);

  if (!embedUrl) {
    return (
      <View style={styles.placeholderViewer}>
        <Ionicons name="cube-outline" size={80} color="#cbd5e1" />
        <Text style={styles.placeholderText}>Vista previa no disponible</Text>
        {previewUrl && (
          <Image 
            source={{ uri: previewUrl }} 
            style={{ width: '100%', height: 200, marginTop: 10 }}
            resizeMode="contain"
          />
        )}
      </View>
    );
  }

  // WEB: usar iframe normal
  if (Platform.OS === 'web') {
    if (iframeError) {
      return (
        <View style={styles.placeholderViewer}>
          <Ionicons name="cube-outline" size={80} color="#cbd5e1" />
          <Text style={styles.placeholderText}>No se pudo cargar el visor 3D</Text>
          {previewUrl && (
            <Image 
              source={{ uri: previewUrl }} 
              style={{ width: '100%', height: 200, marginTop: 10 }}
              resizeMode="contain"
            />
          )}
        </View>
      );
    }

    return (
      <iframe
        title="3D Viewer"
        src={embedUrl}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          backgroundColor: '#1e293b'
        }}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        onError={() => setIframeError(true)}
      />
    );
  }

  // MÓVIL: usar WebView nativo
  if (!WebView) {
    return (
      <View style={styles.placeholderViewer}>
        <Ionicons name="cube-outline" size={80} color="#cbd5e1" />
        <Text style={styles.placeholderText}>Cargando visor...</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: embedUrl }}
      style={styles.webview}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsFullscreenVideo={true}
      onError={() => console.log('❌ WebView error')}
      onLoad={() => console.log('✅ WebView cargado')}
    />
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
export default function ModelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [model, setModel] = useState<Model | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [access, setAccess] = useState<Access | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'reviews'>('description');
  const [selectedLicense, setSelectedLicense] = useState<'personal' | 'business' | 'unlimited'>('personal');
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const multipliers = { personal: 1.0, business: 2.5, unlimited: 5.0 };

  const fetchModel = async () => {
    try {
      console.log('📦 Cargando modelo ID:', id);
      const response = await apiClient.get(`/models/${id}`);
      
      const apiData = response.data;
      if (apiData.success && apiData.data) {
        setModel(apiData.data.model);
        setAuthor(apiData.data.author);
        setStats(apiData.data.stats);
        setAccess(apiData.data.access);
        console.log('✅ Modelo:', apiData.data.model.name);
        console.log('🔗 embed_url:', apiData.data.model.embed_url);
      } else {
        console.error('❌ Estructura de respuesta inesperada');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('Error', 'No se pudo cargar el modelo');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchModel();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchModel();
  };

  const handleAddToCart = () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para agregar al carrito', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/auth/login') }
      ]);
      return;
    }
    setShowLicenseModal(true);
  };

  const confirmAddToCart = () => {
    if (!model) return;
    
    const finalPrice = model.price * multipliers[selectedLicense];
    
    // ✅ Usar el método addToCart del CartContext
    addToCart(
      { 
        id: model.id, 
        name: model.name, 
        price: model.price,
        description: model.description 
      }, 
      selectedLicense, 
      1
    );
    
    setShowLicenseModal(false);
    Alert.alert('Agregado', `${model.name} agregado al carrito`, [
      { text: 'Seguir comprando', style: 'cancel' },
      { text: 'Ver carrito', onPress: () => router.push('/(tabs)/cart') }
    ]);
  };

  const handleBuyNow = () => {
    if (!user) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para comprar', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/auth/login') }
      ]);
      return;
    }
    if (!model) return;
    
    const finalPrice = model.price * multipliers[selectedLicense];
    addToCart(
      { 
        id: model.id, 
        name: model.name, 
        price: model.price,
        description: model.description 
      }, 
      selectedLicense, 
      1
    );
    router.push('/(tabs)/cart');
  };

  const handleSubmitReview = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    if (!newReview.comment.trim()) {
      Alert.alert('Error', 'Escribe un comentario');
      return;
    }
    setSubmittingReview(true);
    try {
      await apiClient.post(`/reviews/models/${model?.id}`, newReview);
      Alert.alert('Éxito', 'Reseña enviada correctamente');
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
      fetchModel();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al enviar reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getReviewerStatus = () => {
    const status = access?.reviewer_status;
    switch (status) {
      case 'not_logged_in':
        return { canWrite: false, buttonText: 'Inicia sesión para reseñar', onClick: () => router.push('/auth/login') };
      case 'not_purchased':
        return { canWrite: false, buttonText: 'Necesitas comprar primero', onClick: () => setShowPurchaseModal(true) };
      case 'already_reviewed':
        return { canWrite: false, buttonText: 'Ya reseñaste este modelo', onClick: () => {} };
      case 'can_review':
        return { canWrite: true, buttonText: showReviewForm ? 'Cancelar' : 'Escribir reseña', onClick: () => setShowReviewForm(!showReviewForm) };
      default:
        return { canWrite: false, buttonText: 'Cargando...', onClick: () => {} };
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando modelo...</Text>
      </View>
    );
  }

  if (!model) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cube-outline" size={64} color="#d1d5db" />
        <Text style={styles.errorText}>Modelo no encontrado</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const basePrice = model.price || 99.99;
  const avgRating = stats?.average_rating || 0;
  const totalReviews = stats?.total_reviews || 0;
  const reviewerStatus = getReviewerStatus();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* ========== VISOR 3D ========== */}
      <View style={styles.viewerContainer}>
        <ModelViewer embedUrl={model.embed_url} previewUrl={model.preview_url} />
      </View>

      {/* ========== INFORMACIÓN ========== */}
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{model.name}</Text>

        {/* Autor */}
        {author && (
          <View style={styles.authorCard}>
            {author.avatar ? (
              <Image source={{ uri: author.avatar }} style={styles.authorAvatar} />
            ) : (
              <View style={styles.authorAvatarPlaceholder}>
                <Text style={styles.authorAvatarText}>{author.name.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{author.name}</Text>
              <Text style={styles.authorBio}>{author.bio || 'Creador profesional'}</Text>
            </View>
          </View>
        )}

        {/* Categoría */}
        {model.category && (
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryText}>{model.category.name}</Text>
          </View>
        )}

        {/* Métricas */}
        <View style={styles.metrics}>
          <View style={styles.metricItem}>
            <Ionicons name="cube-outline" size={16} color="#64748b" />
            <Text style={styles.metricText}>{model.format || 'GLTF'}</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="download-outline" size={16} color="#64748b" />
            <Text style={styles.metricText}>{model.size_mb || 0} MB</Text>
          </View>
          <View style={styles.metricItem}>
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
            <Text style={styles.metricText}>
              {model.publication_date ? new Date(model.publication_date).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingScore}>{avgRating.toFixed(1)}</Text>
          <View>
            <View style={styles.ratingStars}>
              {[1, 2, 3, 4, 5].map(i => (
                <Ionicons
                  key={i}
                  name={i <= avgRating ? 'star' : 'star-outline'}
                  size={20}
                  color={i <= avgRating ? '#fbbf24' : '#d1d5db'}
                />
              ))}
            </View>
            <Text style={styles.ratingCount}>{totalReviews} reseñas</Text>
          </View>
        </View>

        {/* Precio y licencias */}
        <View style={styles.priceCard}>
          <View style={styles.priceHeader}>
            <Text style={styles.priceLabel}>Precio base</Text>
            <Text style={styles.priceLabel}>Licencia seleccionada</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceAmount}>${basePrice.toFixed(2)} MXN</Text>
            <Text style={[styles.priceAmount, { color: '#2563eb' }]}>
              ${(basePrice * multipliers[selectedLicense]).toFixed(2)} MXN
            </Text>
          </View>
          <Text style={styles.priceNote}>El precio varía según la licencia seleccionada</Text>
        </View>

        {/* Selector de licencias */}
        <View style={styles.licenseSelector}>
          {(['personal', 'business', 'unlimited'] as const).map(license => (
            <TouchableOpacity
              key={license}
              style={[styles.licenseOption, selectedLicense === license && styles.licenseSelected]}
              onPress={() => setSelectedLicense(license)}
            >
              <Text style={styles.licenseName}>
                {license === 'personal' ? 'Personal' : license === 'business' ? 'Empresarial' : 'Ilimitada'}
              </Text>
              <Text style={styles.licensePrice}>${(basePrice * multipliers[license]).toFixed(2)} MXN</Text>
              <Text style={styles.licenseMultiplier}>{multipliers[license]}x del precio base</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
            <Ionicons name="cart-outline" size={20} color="white" />
            <Text style={styles.buyButtonText}>Comprar ahora</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>Agregar al carrito</Text>
          </TouchableOpacity>
        </View>

        {/* ========== TABS ========== */}
        <View style={styles.tabs}>
          {(['description', 'features', 'reviews'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'description' ? 'Descripción' : tab === 'features' ? 'Características' : `Reseñas (${totalReviews})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ========== TAB CONTENT ========== */}
        <View style={styles.tabContent}>
          {/* DESCRIPCIÓN */}
          {activeTab === 'description' && (
            <Text style={styles.descriptionText}>
              {model.description || 'No hay descripción disponible para este modelo.'}
            </Text>
          )}

          {/* CARACTERÍSTICAS */}
          {activeTab === 'features' && (
            <View style={styles.featuresGrid}>
              <View style={styles.featureItem}>
                <Ionicons name="cube-outline" size={24} color="#2563eb" />
                <View>
                  <Text style={styles.featureLabel}>Formato</Text>
                  <Text style={styles.featureValue}>{model.format || 'GLTF'}</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="download-outline" size={24} color="#2563eb" />
                <View>
                  <Text style={styles.featureLabel}>Tamaño</Text>
                  <Text style={styles.featureValue}>{model.size_mb || 0} MB</Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="calendar-outline" size={24} color="#2563eb" />
                <View>
                  <Text style={styles.featureLabel}>Publicado</Text>
                  <Text style={styles.featureValue}>
                    {model.publication_date ? new Date(model.publication_date).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="pricetag-outline" size={24} color="#2563eb" />
                <View>
                  <Text style={styles.featureLabel}>Categoría</Text>
                  <Text style={styles.featureValue}>{model.category?.name || 'Sin categoría'}</Text>
                </View>
              </View>
            </View>
          )}

          {/* RESEÑAS */}
          {activeTab === 'reviews' && (
            <View>
              <TouchableOpacity
                style={[styles.reviewButton, { backgroundColor: reviewerStatus.canWrite ? '#2563eb' : '#64748b' }]}
                onPress={reviewerStatus.onClick}
              >
                <Ionicons name="chatbubble-outline" size={18} color="white" />
                <Text style={styles.reviewButtonText}>{reviewerStatus.buttonText}</Text>
              </TouchableOpacity>

              {showReviewForm && (
                <View style={styles.reviewForm}>
                  <Text style={styles.reviewFormTitle}>Escribe tu reseña</Text>
                  <View style={styles.ratingSelector}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity key={star} onPress={() => setNewReview({ ...newReview, rating: star })}>
                        <Ionicons name={star <= newReview.rating ? 'star' : 'star-outline'} size={32} color="#fbbf24" />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={styles.reviewInput}
                    placeholder="Comparte tu experiencia..."
                    multiline
                    numberOfLines={4}
                    value={newReview.comment}
                    onChangeText={text => setNewReview({ ...newReview, comment: text })}
                  />
                  <View style={styles.reviewFormButtons}>
                    <TouchableOpacity style={styles.submitReviewButton} onPress={handleSubmitReview} disabled={submittingReview}>
                      <Text style={styles.submitReviewText}>{submittingReview ? 'Enviando...' : 'Enviar reseña'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelReviewButton} onPress={() => setShowReviewForm(false)}>
                      <Text style={styles.cancelReviewText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {totalReviews === 0 ? (
                <View style={styles.emptyReviews}>
                  <Ionicons name="star-outline" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyReviewsText}>No hay reseñas aún</Text>
                  <Text style={styles.emptyReviewsSubtext}>¡Sé el primero en reseñar este modelo!</Text>
                </View>
              ) : (
                <Text style={styles.comingSoonText}>Próximamente: lista de reseñas</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* ========== MODALES ========== */}
      <Modal visible={showLicenseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecciona licencia</Text>
            {(['personal', 'business', 'unlimited'] as const).map(license => (
              <TouchableOpacity
                key={license}
                style={[styles.modalLicenseOption, selectedLicense === license && styles.modalLicenseSelected]}
                onPress={() => setSelectedLicense(license)}
              >
                <View>
                  <Text style={styles.modalLicenseName}>
                    {license === 'personal' ? '📱 Personal' : license === 'business' ? '🏢 Empresarial' : '🌍 Ilimitada'}
                  </Text>
                  <Text style={styles.modalLicenseDesc}>
                    {license === 'personal' ? 'Uso individual, 1 proyecto' :
                     license === 'business' ? 'Hasta 5 usuarios' : 'Uso corporativo ilimitado'}
                  </Text>
                </View>
                <Text style={styles.modalLicensePrice}>${(basePrice * multipliers[license]).toFixed(2)}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowLicenseModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmAddToCart}>
                <Text style={styles.modalConfirmText}>Agregar al carrito</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPurchaseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="cart-outline" size={48} color="#2563eb" style={{ textAlign: 'center', marginBottom: 16 }} />
            <Text style={styles.modalTitle}>Necesitas comprar este modelo primero</Text>
            <Text style={styles.modalText}>Para escribir una reseña, primero debes comprar este modelo.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setShowPurchaseModal(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleBuyNow}>
                <Text style={styles.modalConfirmText}>Comprar ahora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' },
  loadingText: { marginTop: 12, color: '#6b7280' },
  errorText: { marginTop: 16, fontSize: 16, color: '#6b7280' },
  backButton: { marginTop: 20, backgroundColor: '#2563eb', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  backButtonText: { color: 'white', fontWeight: 'bold' },
  viewerContainer: { height: 350, backgroundColor: '#1e293b' },
  webview: { flex: 1 },
  placeholderViewer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f1f5f9' },
  placeholderText: { marginTop: 12, color: '#94a3b8' },
  infoContainer: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1e293b', marginBottom: 16 },
  authorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, padding: 12, backgroundColor: '#f1f5f9', borderRadius: 16 },
  authorAvatar: { width: 50, height: 50, borderRadius: 25 },
  authorAvatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
  authorAvatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  authorInfo: { flex: 1 },
  authorName: { fontWeight: '600', color: '#1e293b', fontSize: 16 },
  authorBio: { fontSize: 12, color: '#64748b', marginTop: 2 },
  categoryContainer: { marginBottom: 16 },
  categoryText: { fontSize: 14, color: '#2563eb', backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  metrics: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  metricItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f1f5f9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  metricText: { fontSize: 12, color: '#64748b' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20, backgroundColor: '#f1f5f9', padding: 12, borderRadius: 16 },
  ratingScore: { fontSize: 36, fontWeight: 'bold', color: '#2563eb' },
  ratingStars: { flexDirection: 'row', gap: 4 },
  ratingCount: { fontSize: 12, color: '#64748b', marginTop: 4 },
  priceCard: { backgroundColor: '#eff6ff', borderRadius: 20, padding: 20, marginBottom: 20 },
  priceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceAmount: { fontSize: 28, fontWeight: 'bold', color: '#1e293b' },
  priceNote: { fontSize: 11, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  licenseSelector: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  licenseOption: { flex: 1, backgroundColor: 'white', borderWidth: 2, borderColor: '#e2e8f0', borderRadius: 16, padding: 12, alignItems: 'center' },
  licenseSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  licenseName: { fontWeight: '600', marginBottom: 4 },
  licensePrice: { fontSize: 18, fontWeight: 'bold', color: '#2563eb', marginBottom: 2 },
  licenseMultiplier: { fontSize: 10, color: '#94a3b8' },
  actionButtons: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  buyButton: { flex: 1, backgroundColor: '#2563eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 40, gap: 8 },
  buyButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  cartButton: { flex: 1, backgroundColor: 'white', borderWidth: 2, borderColor: '#2563eb', paddingVertical: 14, borderRadius: 40, alignItems: 'center' },
  cartButtonText: { color: '#2563eb', fontWeight: 'bold', fontSize: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', marginBottom: 20 },
  tab: { paddingVertical: 12, paddingHorizontal: 16, marginRight: 8 },
  tabActive: { borderBottomWidth: 3, borderBottomColor: '#2563eb' },
  tabText: { color: '#64748b', fontWeight: '500' },
  tabTextActive: { color: '#2563eb', fontWeight: '600' },
  tabContent: { backgroundColor: '#f8fafc', borderRadius: 20, padding: 20, marginBottom: 40 },
  descriptionText: { color: '#334155', lineHeight: 24 },
  featuresGrid: { gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  featureLabel: { fontSize: 12, color: '#64748b' },
  featureValue: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  reviewButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 40, marginBottom: 20 },
  reviewButtonText: { color: 'white', fontWeight: '600' },
  reviewForm: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  reviewFormTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 12 },
  ratingSelector: { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'center' },
  reviewInput: { borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 12, minHeight: 100, textAlignVertical: 'top', marginBottom: 16 },
  reviewFormButtons: { flexDirection: 'row', gap: 12 },
  submitReviewButton: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 40, alignItems: 'center' },
  submitReviewText: { color: 'white', fontWeight: '600' },
  cancelReviewButton: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#e2e8f0', paddingVertical: 12, borderRadius: 40, alignItems: 'center' },
  cancelReviewText: { color: '#64748b' },
  emptyReviews: { alignItems: 'center', padding: 40 },
  emptyReviewsText: { marginTop: 12, fontSize: 16, color: '#64748b' },
  emptyReviewsSubtext: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  comingSoonText: { textAlign: 'center', color: '#94a3b8', padding: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: 'white', borderRadius: 24, padding: 20, width: '85%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  modalText: { textAlign: 'center', color: '#64748b', marginBottom: 20 },
  modalLicenseOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  modalLicenseSelected: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  modalLicenseName: { fontWeight: 'bold' },
  modalLicenseDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  modalLicensePrice: { fontWeight: 'bold', color: '#2563eb' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 40, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  modalCancelText: { color: '#64748b' },
  modalConfirm: { flex: 1, backgroundColor: '#2563eb', paddingVertical: 12, borderRadius: 40, alignItems: 'center' },
  modalConfirmText: { color: 'white', fontWeight: 'bold' },
});