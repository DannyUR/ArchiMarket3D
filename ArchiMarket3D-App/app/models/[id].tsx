// app/models/[id].tsx
import {
  View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator,
  Alert, StyleSheet, Modal, RefreshControl, Platform, TextInput
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import apiClient from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Importar WebView condicionalmente
let WebView: any = null;
if (Platform.OS !== 'web') {
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
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.placeholderViewer}
      >
        <Ionicons name="cube-outline" size={80} color="#475569" />
        <Text style={styles.placeholderText}>Vista previa no disponible</Text>
        {previewUrl && (
          <Image 
            source={{ uri: previewUrl }} 
            style={{ width: '100%', height: 200, marginTop: 10 }}
            resizeMode="contain"
          />
        )}
      </LinearGradient>
    );
  }

  if (Platform.OS === 'web') {
    if (iframeError) {
      return (
        <LinearGradient
          colors={['#1e293b', '#0f172a']}
          style={styles.placeholderViewer}
        >
          <Ionicons name="cube-outline" size={80} color="#475569" />
          <Text style={styles.placeholderText}>No se pudo cargar el visor 3D</Text>
          {previewUrl && (
            <Image 
              source={{ uri: previewUrl }} 
              style={{ width: '100%', height: 200, marginTop: 10 }}
              resizeMode="contain"
            />
          )}
        </LinearGradient>
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
          backgroundColor: '#0f172a'
        }}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        onError={() => setIframeError(true)}
      />
    );
  }

  if (!WebView) {
    return (
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.placeholderViewer}
      >
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.placeholderText}>Cargando visor...</Text>
      </LinearGradient>
    );
  }

  return (
    <WebView
      source={{ uri: embedUrl }}
      style={styles.webview}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsFullscreenVideo={true}
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

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/models');
    }
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
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando modelo...</Text>
      </View>
    );
  }

  if (!model) {
    return (
      <View style={styles.centered}>
        <Ionicons name="cube-outline" size={64} color="#cbd5e1" />
        <Text style={styles.errorText}>Modelo no encontrado</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
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
    <View style={styles.container}>
      {/* ========== HEADER PERSONALIZADO ========== */}
      <LinearGradient
        colors={['#4f46e5', '#7c3aed']}
        style={styles.customHeader}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButtonHeader} 
            onPress={handleGoBack}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {model.name}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </LinearGradient>

      {/* 🔥 SEPARADOR ENTRE HEADER Y VISOR */}
      <View style={styles.headerSpacer} />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f46e5" />}
        showsVerticalScrollIndicator={false}
      >
        {/* ========== VISOR 3D ========== */}
        <View style={styles.viewerContainer}>
          <ModelViewer embedUrl={model.embed_url} previewUrl={model.preview_url} />
        </View>

        {/* ========== INFORMACIÓN ========== */}
        <View style={styles.infoContainer}>
          {/* Precio flotante */}
          <LinearGradient
            colors={['#4f46e5', '#7c3aed']}
            style={styles.floatingPrice}
          >
            <Text style={styles.floatingPriceText}>
              ${(basePrice * multipliers[selectedLicense]).toFixed(2)}
            </Text>
          </LinearGradient>

          {/* Título */}
          <Text style={styles.title}>{model.name}</Text>

          {/* Autor */}
          {author && (
            <View style={styles.authorCard}>
              {author.avatar ? (
                <Image source={{ uri: author.avatar }} style={styles.authorAvatar} />
              ) : (
                <LinearGradient
                  colors={['#4f46e5', '#7c3aed']}
                  style={styles.authorAvatarPlaceholder}
                >
                  <Text style={styles.authorAvatarText}>{author.name.charAt(0)}</Text>
                </LinearGradient>
              )}
              <View style={styles.authorInfo}>
                <Text style={styles.authorName}>{author.name}</Text>
                <Text style={styles.authorBio}>{author.bio || 'Creador profesional de modelos 3D'}</Text>
              </View>
            </View>
          )}

          {/* Badges */}
          <View style={styles.badgesContainer}>
            {model.category && (
              <LinearGradient
                colors={['#e0e7ff', '#c7d2fe']}
                style={styles.categoryBadge}
              >
                <Ionicons name="folder-outline" size={12} color="#4f46e5" />
                <Text style={styles.categoryText}>{model.category.name}</Text>
              </LinearGradient>
            )}
            {model.featured && (
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.featuredBadge}
              >
                <Ionicons name="star" size={12} color="#d97706" />
                <Text style={styles.featuredText}>Destacado</Text>
              </LinearGradient>
            )}
          </View>

          {/* Métricas */}
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Ionicons name="cube-outline" size={16} color="#4f46e5" />
              <Text style={styles.metricText}>{model.format || 'GLTF'}</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="download-outline" size={16} color="#4f46e5" />
              <Text style={styles.metricText}>{model.size_mb || 0} MB</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="calendar-outline" size={16} color="#4f46e5" />
              <Text style={styles.metricText}>
                {model.publication_date ? new Date(model.publication_date).toLocaleDateString() : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingScoreContainer}>
              <Text style={styles.ratingScore}>{avgRating.toFixed(1)}</Text>
              <Text style={styles.ratingMax}>/5</Text>
            </View>
            <View style={styles.ratingDetails}>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Ionicons
                    key={i}
                    name={i <= avgRating ? 'star' : 'star-outline'}
                    size={18}
                    color={i <= avgRating ? '#fbbf24' : '#cbd5e1'}
                  />
                ))}
              </View>
              <Text style={styles.ratingCount}>{totalReviews} reseñas</Text>
            </View>
          </View>

          {/* Selector de licencias */}
          <Text style={styles.licenseTitle}>Selecciona tu licencia</Text>
          <View style={styles.licenseSelector}>
            {(['personal', 'business', 'unlimited'] as const).map(license => (
              <TouchableOpacity
                key={license}
                style={[
                  styles.licenseOption,
                  selectedLicense === license && styles.licenseSelected
                ]}
                onPress={() => setSelectedLicense(license)}
              >
                {selectedLicense === license && (
                  <View style={styles.licenseCheck}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
                <Text style={styles.licenseIcon}>
                  {license === 'personal' ? '👤' : license === 'business' ? '🏢' : '🌍'}
                </Text>
                <Text style={[
                  styles.licenseName,
                  selectedLicense === license && styles.licenseNameSelected
                ]}>
                  {license === 'personal' ? 'Personal' : license === 'business' ? 'Empresarial' : 'Ilimitada'}
                </Text>
                <Text style={styles.licensePrice}>
                  ${(basePrice * multipliers[license]).toFixed(2)}
                </Text>
                <Text style={styles.licenseMultiplier}>{multipliers[license]}x</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Botones de acción */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow}>
              <LinearGradient
                colors={['#4f46e5', '#7c3aed']}
                style={styles.buyButtonGradient}
              >
                <Ionicons name="cart-outline" size={20} color="white" />
                <Text style={styles.buyButtonText}>Comprar ahora</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
              <Ionicons name="add-circle-outline" size={20} color="#4f46e5" />
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
                {activeTab === tab && <View style={styles.tabIndicator} />}
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
                  <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.featureIcon}>
                    <Ionicons name="cube-outline" size={22} color="#4f46e5" />
                  </LinearGradient>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureLabel}>Formato</Text>
                    <Text style={styles.featureValue}>{model.format || 'GLTF'}</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.featureIcon}>
                    <Ionicons name="download-outline" size={22} color="#4f46e5" />
                  </LinearGradient>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureLabel}>Tamaño</Text>
                    <Text style={styles.featureValue}>{model.size_mb || 0} MB</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.featureIcon}>
                    <Ionicons name="calendar-outline" size={22} color="#4f46e5" />
                  </LinearGradient>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureLabel}>Publicado</Text>
                    <Text style={styles.featureValue}>
                      {model.publication_date ? new Date(model.publication_date).toLocaleDateString() : 'N/A'}
                    </Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <LinearGradient colors={['#e0e7ff', '#c7d2fe']} style={styles.featureIcon}>
                    <Ionicons name="pricetag-outline" size={22} color="#4f46e5" />
                  </LinearGradient>
                  <View style={styles.featureInfo}>
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
                  style={[styles.reviewButton, !reviewerStatus.canWrite && styles.reviewButtonDisabled]}
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
                          <Ionicons 
                            name={star <= newReview.rating ? 'star' : 'star-outline'} 
                            size={32} 
                            color="#fbbf24" 
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      style={styles.reviewInput}
                      placeholder="Comparte tu experiencia..."
                      placeholderTextColor="#94a3b8"
                      multiline
                      numberOfLines={4}
                      value={newReview.comment}
                      onChangeText={text => setNewReview({ ...newReview, comment: text })}
                    />
                    <View style={styles.reviewFormButtons}>
                      <TouchableOpacity 
                        style={styles.submitReviewButton} 
                        onPress={handleSubmitReview} 
                        disabled={submittingReview}
                      >
                        <LinearGradient
                          colors={['#4f46e5', '#7c3aed']}
                          style={styles.submitButtonGradient}
                        >
                          <Text style={styles.submitReviewText}>
                            {submittingReview ? 'Enviando...' : 'Enviar reseña'}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.cancelReviewButton} 
                        onPress={() => setShowReviewForm(false)}
                      >
                        <Text style={styles.cancelReviewText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {totalReviews === 0 && !showReviewForm ? (
                  <View style={styles.emptyReviews}>
                    <LinearGradient
                      colors={['#f1f5f9', '#e2e8f0']}
                      style={styles.emptyReviewsIcon}
                    >
                      <Ionicons name="star-outline" size={40} color="#94a3b8" />
                    </LinearGradient>
                    <Text style={styles.emptyReviewsText}>No hay reseñas aún</Text>
                    <Text style={styles.emptyReviewsSubtext}>¡Sé el primero en reseñar este modelo!</Text>
                  </View>
                ) : null}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* ========== MODALES ========== */}
      <Modal visible={showLicenseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#4f46e5', '#7c3aed']}
              style={styles.modalHeader}
            >
              <Ionicons name="cart-outline" size={32} color="#fff" />
              <Text style={styles.modalTitle}>Selecciona tu licencia</Text>
            </LinearGradient>
            {(['personal', 'business', 'unlimited'] as const).map(license => (
              <TouchableOpacity
                key={license}
                style={[
                  styles.modalLicenseOption,
                  selectedLicense === license && styles.modalLicenseSelected
                ]}
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
            <LinearGradient
              colors={['#f59e0b', '#d97706']}
              style={styles.modalHeader}
            >
              <Ionicons name="alert-circle-outline" size={32} color="#fff" />
              <Text style={styles.modalTitle}>Compra requerida</Text>
            </LinearGradient>
            <Text style={styles.modalText}>
              Para escribir una reseña, primero debes comprar este modelo.
            </Text>
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
    </View>
  );
}

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  // 🔥 HEADER
  customHeader: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  // 🔥 SEPARADOR ENTRE HEADER Y VISOR
  headerSpacer: {
    height: 12,
    backgroundColor: '#f8fafc',
  },
  viewerContainer: {
    height: 350,
    backgroundColor: '#0f172a',
    marginTop: 0,
  },
  webview: {
    flex: 1,
  },
  placeholderViewer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 12,
    color: '#64748b',
  },
  infoContainer: {
    padding: 20,
    position: 'relative',
  },
  floatingPrice: {
    position: 'absolute',
    top: -20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    zIndex: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingPriceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 16,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  authorAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: '600',
    color: '#1e293b',
    fontSize: 16,
  },
  authorBio: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '500',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  featuredText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '500',
  },
  metrics: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricText: {
    fontSize: 12,
    color: '#64748b',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  ratingScoreContainer: {
    alignItems: 'center',
  },
  ratingScore: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  ratingMax: {
    fontSize: 12,
    color: '#94a3b8',
  },
  ratingDetails: {
    flex: 1,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: '#64748b',
  },
  licenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  licenseSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  licenseOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  licenseSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#e0e7ff',
  },
  licenseCheck: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  licenseIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  licenseName: {
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 12,
  },
  licenseNameSelected: {
    color: '#4f46e5',
  },
  licensePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  licenseMultiplier: {
    fontSize: 10,
    color: '#94a3b8',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 24,
  },
  buyButton: {
    borderRadius: 40,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 40,
  },
  cartButtonText: {
    color: '#4f46e5',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    position: 'relative',
  },
  tabActive: {
    borderBottomWidth: 0,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 3,
    backgroundColor: '#4f46e5',
    borderRadius: 3,
  },
  tabText: {
    color: '#64748b',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descriptionText: {
    color: '#334155',
    lineHeight: 24,
  },
  featuresGrid: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  featureValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 40,
    marginBottom: 20,
  },
  reviewButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  reviewButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  reviewForm: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reviewFormTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 12,
    color: '#1e293b',
  },
  ratingSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
    color: '#1e293b',
  },
  reviewFormButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  submitReviewButton: {
    flex: 1,
    borderRadius: 40,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitReviewText: {
    color: 'white',
    fontWeight: '600',
  },
  cancelReviewButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: 'center',
  },
  cancelReviewText: {
    color: '#64748b',
  },
  emptyReviews: {
    alignItems: 'center',
    padding: 40,
  },
  emptyReviewsIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyReviewsText: {
    marginTop: 8,
    fontSize: 16,
    color: '#64748b',
  },
  emptyReviewsSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    width: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalText: {
    textAlign: 'center',
    color: '#64748b',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalLicenseOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modalLicenseSelected: {
    borderColor: '#4f46e5',
    backgroundColor: '#e0e7ff',
  },
  modalLicenseName: {
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalLicenseDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  modalLicensePrice: {
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#64748b',
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    borderRadius: 40,
    alignItems: 'center',
  },
  modalConfirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
});