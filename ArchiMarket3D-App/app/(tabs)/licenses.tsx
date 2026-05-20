// app/(tabs)/licenses.tsx
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LicensesScreen() {
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const exampleBasePrice = 99.99;

    const multipliers = {
        personal: 1.0,
        business: 2.5,
        unlimited: 5.0
    };

    const licenses = [
        {
            id: 'personal',
            name: 'Personal',
            icon: 'person-outline',
            price: exampleBasePrice * multipliers.personal,
            description: 'Ideal para profesionales independientes y pequeños proyectos',
            features: [
                'Uso individual',
                '1 proyecto simultáneo',
                'Soporte básico',
                'Actualizaciones por 1 año',
                'Formatos: OBJ, FBX'
            ],
            colors: ['#3b82f6', '#2563eb'],
            iconColor: '#3b82f6',
            multiplier: multipliers.personal,
            popular: false
        },
        {
            id: 'business',
            name: 'Empresarial',
            icon: 'business-outline',
            price: exampleBasePrice * multipliers.business,
            description: 'Perfecto para estudios de arquitectura y equipos de trabajo',
            features: [
                'Hasta 5 usuarios',
                'Proyectos ilimitados',
                'Soporte prioritario',
                'Actualizaciones por 3 años',
                'Todos los formatos',
                'Modelos BIM incluidos'
            ],
            colors: ['#8b5cf6', '#7c3aed'],
            iconColor: '#8b5cf6',
            multiplier: multipliers.business,
            popular: true
        },
        {
            id: 'unlimited',
            name: 'Ilimitada',
            icon: 'infinite-outline',
            price: exampleBasePrice * multipliers.unlimited,
            description: 'Para grandes empresas y uso corporativo sin restricciones',
            features: [
                'Usuarios ilimitados',
                'Proyectos ilimitados',
                'Soporte 24/7 dedicado',
                'Actualizaciones de por vida',
                'Todos los formatos premium',
                'Modelos personalizados',
                'API exclusiva'
            ],
            colors: ['#10b981', '#059669'],
            iconColor: '#10b981',
            multiplier: multipliers.unlimited,
            popular: false
        }
    ];

    const faqs = [
        {
            question: '¿Qué incluye cada licencia?',
            answer: 'Cada licencia incluye acceso a los modelos 3D, soporte técnico y actualizaciones según el plan seleccionado. Los modelos se pueden descargar en múltiples formatos.'
        },
        {
            question: '¿Cómo funcionan los multiplicadores?',
            answer: 'El precio base de cada modelo se multiplica por el factor de la licencia (1x para Personal, 2.5x para Empresarial, 5x para Ilimitada). Así, los modelos más caros mantienen la proporción.'
        },
        {
            question: '¿Puedo cambiar de licencia después?',
            answer: 'Sí, puedes actualizar tu licencia en cualquier momento. La diferencia se prorratea y solo pagas la diferencia.'
        },
        {
            question: '¿Las licencias son perpetuas?',
            answer: 'Las licencias Personal y Empresarial incluyen actualizaciones por tiempo limitado. La licencia Ilimitada incluye actualizaciones de por vida.'
        },
        {
            question: '¿Qué métodos de pago aceptan?',
            answer: 'Aceptamos tarjetas de crédito/débito, PayPal, transferencias bancarias y criptomonedas para empresas.'
        },
        {
            question: '¿Hay descuentos por volumen?',
            answer: 'Sí, para compras de múltiples modelos o licencias empresariales, contáctanos para obtener un presupuesto personalizado.'
        }
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header con gradiente */}
            <LinearGradient
                colors={['#4f46e5', '#7c3aed', '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Planes y Licencias</Text>
                    <Text style={styles.headerSubtitle}>
                        Elige la licencia que mejor se adapte a tus necesidades
                    </Text>
                </View>
            </LinearGradient>

            {/* Nota explicativa */}
            <LinearGradient
                colors={['#e0e7ff', '#c7d2fe']}
                style={styles.noteCard}
            >
                <View style={styles.noteIcon}>
                    <Ionicons name="flash" size={24} color="#4f46e5" />
                </View>
                <Text style={styles.noteTitle}>¿Cómo funcionan los precios?</Text>
                <Text style={styles.noteText}>
                    Cada modelo 3D tiene su propio precio base. El costo final se calcula 
                    multiplicando ese precio base por el multiplicador de la licencia elegida.
                </Text>
                <View style={styles.noteExample}>
                    <Text style={styles.noteExampleText}>
                        💡 Ejemplo: Un modelo de ${exampleBasePrice.toFixed(2)} MXN costaría:
                    </Text>
                    <View style={styles.noteExamplePrices}>
                        <View style={styles.noteExamplePrice}>
                            <Text style={styles.noteExampleLabel}>Personal</Text>
                            <Text style={styles.noteExampleValue}>${(exampleBasePrice * multipliers.personal).toFixed(2)}</Text>
                        </View>
                        <View style={styles.noteExamplePrice}>
                            <Text style={styles.noteExampleLabel}>Empresarial</Text>
                            <Text style={styles.noteExampleValue}>${(exampleBasePrice * multipliers.business).toFixed(2)}</Text>
                        </View>
                        <View style={styles.noteExamplePrice}>
                            <Text style={styles.noteExampleLabel}>Ilimitada</Text>
                            <Text style={styles.noteExampleValue}>${(exampleBasePrice * multipliers.unlimited).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Grid de licencias */}
            <View style={styles.grid}>
                {licenses.map((license) => (
                    <View key={license.id} style={styles.licenseCardWrapper}>
                        {license.popular && (
                            <View style={[styles.popularBadge, { backgroundColor: license.colors[0] }]}>
                                <Ionicons name="star" size={12} color="#fff" />
                                <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
                            </View>
                        )}
                        <LinearGradient
                            colors={[license.colors[0], license.colors[1]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.licenseCard}
                        >
                            <View style={styles.licenseContent}>
                                <View style={styles.licenseIcon}>
                                    <Ionicons name={license.icon as any} size={40} color="#fff" />
                                </View>
                                <Text style={styles.licenseName}>{license.name}</Text>
                                <View style={styles.priceRow}>
                                    <Text style={styles.licensePrice}>${license.price.toFixed(2)}</Text>
                                    <Text style={styles.licensePeriod}>/modelo</Text>
                                </View>
                                <View style={styles.multiplierBadge}>
                                    <Text style={styles.multiplierText}>Multiplicador {license.multiplier}x</Text>
                                </View>
                                <Text style={styles.licenseDescription}>{license.description}</Text>
                                <View style={styles.featuresList}>
                                    {license.features.map((feature, i) => (
                                        <View key={i} style={styles.featureItem}>
                                            <Ionicons name="checkmark-circle" size={18} color="#fff" />
                                            <Text style={styles.featureText}>{feature}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                ))}
            </View>

            {/* Tabla comparativa */}
            <View style={styles.comparisonSection}>
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.comparisonHeader}
                >
                    <Ionicons name="stats-chart" size={28} color="#fbbf24" />
                    <Text style={styles.comparisonTitle}>Comparativa de precios</Text>
                    <Text style={styles.comparisonSubtitle}>Ejemplos según el tipo de modelo</Text>
                </LinearGradient>
                
                <View style={styles.comparisonGrid}>
                    <View style={styles.comparisonCard}>
                        <View style={styles.comparisonCardIcon}>
                            <Ionicons name="cube-outline" size={24} color="#3b82f6" />
                        </View>
                        <Text style={styles.comparisonCardTitle}>Modelo Básico</Text>
                        <Text style={styles.comparisonPrice}>$19.99</Text>
                        <View style={styles.comparisonDivider} />
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Personal</Text>
                            <Text style={styles.comparisonValue}>$19.99</Text>
                        </View>
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Empresarial</Text>
                            <Text style={styles.comparisonValue}>$49.97</Text>
                        </View>
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Ilimitada</Text>
                            <Text style={styles.comparisonValue}>$99.95</Text>
                        </View>
                        <Text style={styles.comparisonNote}>*Modelos simples de baja complejidad</Text>
                    </View>

                    <View style={styles.comparisonCard}>
                        <View style={styles.comparisonCardIcon}>
                            <Ionicons name="layers-outline" size={24} color="#8b5cf6" />
                        </View>
                        <Text style={styles.comparisonCardTitle}>Modelo Estándar</Text>
                        <Text style={styles.comparisonPrice}>$49.99</Text>
                        <View style={styles.comparisonDivider} />
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Personal</Text>
                            <Text style={styles.comparisonValue}>$49.99</Text>
                        </View>
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Empresarial</Text>
                            <Text style={styles.comparisonValue}>$124.97</Text>
                        </View>
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Ilimitada</Text>
                            <Text style={styles.comparisonValue}>$249.95</Text>
                        </View>
                        <Text style={styles.comparisonNote}>*Modelos de complejidad media</Text>
                    </View>

                    <View style={styles.comparisonCard}>
                        <View style={styles.comparisonCardIcon}>
                            <Ionicons name="diamond-outline" size={24} color="#10b981" />
                        </View>
                        <Text style={styles.comparisonCardTitle}>Modelo Premium</Text>
                        <Text style={styles.comparisonPrice}>$99.99</Text>
                        <View style={styles.comparisonDivider} />
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Personal</Text>
                            <Text style={styles.comparisonValue}>$99.99</Text>
                        </View>
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Empresarial</Text>
                            <Text style={styles.comparisonValue}>$249.97</Text>
                        </View>
                        <View style={styles.comparisonRow}>
                            <Text style={styles.comparisonLabel}>Ilimitada</Text>
                            <Text style={styles.comparisonValue}>$499.95</Text>
                        </View>
                        <Text style={styles.comparisonNote}>*Modelos complejos con detalles avanzados</Text>
                    </View>
                </View>
            </View>

            {/* FAQ Section */}
            <View style={styles.faqSection}>
                <LinearGradient
                    colors={['#fff', '#f8fafc']}
                    style={styles.faqHeader}
                >
                    <View style={styles.faqTitle}>
                        <View style={styles.faqIconBg}>
                            <Ionicons name="help-circle" size={28} color="#4f46e5" />
                        </View>
                        <Text style={styles.faqTitleText}>Preguntas frecuentes</Text>
                    </View>
                    <Text style={styles.faqSubtitle}>¿Tienes dudas? Aquí encontrarás respuestas</Text>
                </LinearGradient>
                
                <View style={styles.faqGrid}>
                    {faqs.map((faq, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqItem}
                            activeOpacity={0.8}
                            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        >
                            <View style={styles.faqQuestion}>
                                <View style={styles.faqQuestionIcon}>
                                    <Ionicons name="help-circle-outline" size={20} color="#4f46e5" />
                                </View>
                                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                <Ionicons 
                                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color="#94a3b8" 
                                />
                            </View>
                            {expandedFaq === index && (
                                <View style={styles.faqAnswer}>
                                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    // Header
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Nota explicativa
    noteCard: {
        marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 24,
    },
    noteIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 8,
    },
    noteText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 16,
    },
    noteExample: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
    },
    noteExampleText: {
        fontSize: 13,
        color: '#64748b',
        marginBottom: 12,
    },
    noteExamplePrices: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    noteExamplePrice: {
        flex: 1,
        alignItems: 'center',
    },
    noteExampleLabel: {
        fontSize: 11,
        color: '#64748b',
        marginBottom: 4,
    },
    noteExampleValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4f46e5',
    },
    // Grid de licencias
    grid: {
        padding: 16,
        gap: 24,
    },
    licenseCardWrapper: {
        position: 'relative',
        marginBottom: 8,
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        left: '50%',
        transform: [{ translateX: -50 }],
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 30,
        zIndex: 10,
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    licenseCard: {
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    licenseContent: {
        padding: 24,
        alignItems: 'center',
    },
    licenseIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    licenseName: {
        fontSize: 26,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    licensePrice: {
        fontSize: 36,
        fontWeight: '700',
        color: '#fff',
    },
    licensePeriod: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginLeft: 4,
    },
    multiplierBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 12,
    },
    multiplierText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#fff',
    },
    licenseDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.85)',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    featuresList: {
        width: '100%',
        gap: 12,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        fontSize: 13,
        color: '#fff',
        flex: 1,
    },
    // Tabla comparativa
    comparisonSection: {
        margin: 16,
        marginTop: 8,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    comparisonHeader: {
        padding: 20,
        alignItems: 'center',
    },
    comparisonTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginTop: 8,
    },
    comparisonSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 4,
    },
    comparisonGrid: {
        padding: 16,
        gap: 16,
    },
    comparisonCard: {
        backgroundColor: '#f8fafc',
        borderRadius: 20,
        padding: 16,
    },
    comparisonCardIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    comparisonCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 4,
    },
    comparisonPrice: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    comparisonDivider: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 12,
    },
    comparisonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    comparisonLabel: {
        fontSize: 13,
        color: '#64748b',
    },
    comparisonValue: {
        fontSize: 13,
        fontWeight: '500',
        color: '#1e293b',
    },
    comparisonNote: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 12,
        fontStyle: 'italic',
    },
    // FAQ Section
    faqSection: {
        margin: 16,
        marginTop: 8,
        marginBottom: 32,
        backgroundColor: '#fff',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    faqHeader: {
        padding: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    faqIconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    faqTitle: {
        alignItems: 'center',
    },
    faqTitleText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    faqSubtitle: {
        fontSize: 13,
        color: '#64748b',
        marginTop: 4,
    },
    faqGrid: {
        padding: 16,
        gap: 12,
    },
    faqItem: {
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    faqQuestionIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e0e7ff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    faqAnswer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    faqAnswerText: {
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
    },
});