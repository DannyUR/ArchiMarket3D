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

    // Precio base de ejemplo
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
            borderColor: '#3b82f6',
            iconColor: '#3b82f6',
            multiplierColor: '#3b82f6',
            multiplierBg: '#3b82f610',
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
            borderColor: '#8b5cf6',
            iconColor: '#8b5cf6',
            multiplierColor: '#8b5cf6',
            multiplierBg: '#8b5cf610',
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
            borderColor: '#10b981',
            iconColor: '#10b981',
            multiplierColor: '#10b981',
            multiplierBg: '#10b98110',
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
            {/* Header - sin botón de regresar */}
            <LinearGradient
                colors={['#1e40af', '#3b82f6', '#60a5fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Planes y Licencias</Text>
                <Text style={styles.headerSubtitle}>
                    Conoce las licencias disponibles para cada modelo
                </Text>
            </LinearGradient>

            {/* Nota explicativa */}
            <View style={styles.noteCard}>
                <View style={styles.noteTitle}>
                    <Ionicons name="flash-outline" size={20} color="#2563eb" />
                    <Text style={styles.noteTitleText}>¿Cómo funcionan los precios?</Text>
                </View>
                <Text style={styles.noteText}>
                    Cada modelo 3D tiene su propio precio base. El costo final se calcula 
                    multiplicando ese precio base por el multiplicador de la licencia elegida.
                </Text>
                <View style={styles.noteExample}>
                    <Text style={styles.noteExampleText}>
                        💡 Ejemplo: Un modelo de ${exampleBasePrice} MXN costaría:
                    </Text>
                    <Text style={styles.noteExamplePrices}>
                        Personal ${(exampleBasePrice * multipliers.personal).toFixed(2)} MXN · 
                        Empresarial ${(exampleBasePrice * multipliers.business).toFixed(2)} MXN · 
                        Ilimitada ${(exampleBasePrice * multipliers.unlimited).toFixed(2)} MXN
                    </Text>
                </View>
            </View>

            {/* Grid de licencias */}
            <View style={styles.grid}>
                {licenses.map((license) => (
                    <View key={license.id}>
                        <LinearGradient
                            colors={['#fff', '#fff']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[
                                styles.licenseCard,
                                license.popular && styles.licenseCardPopular,
                                { borderColor: license.borderColor }
                            ]}
                        >
                            {license.popular && (
                                <View style={[styles.popularBadge, { backgroundColor: license.borderColor }]}>
                                    <Ionicons name="star" size={12} color="#fff" />
                                    <Text style={styles.popularBadgeText}>MÁS POPULAR</Text>
                                </View>
                            )}

                            <View style={styles.cardHeader}>
                                <View style={[styles.iconWrapper, { backgroundColor: license.iconColor + '15' }]}>
                                    <Ionicons name={license.icon as any} size={32} color={license.iconColor} />
                                </View>
                                <Text style={[styles.licenseName, license.popular && { color: license.borderColor }]}>
                                    {license.name}
                                </Text>
                                <View style={styles.priceContainer}>
                                    <Text style={[styles.licensePrice, { color: license.borderColor }]}>
                                        ${license.price.toFixed(2)} MXN
                                    </Text>
                                    <Text style={styles.pricePeriod}>/modelo</Text>
                                </View>
                                <View style={[styles.multiplier, { backgroundColor: license.multiplierBg }]}>
                                    <Text style={[styles.multiplierText, { color: license.multiplierColor }]}>
                                        Multiplicador: {license.multiplier}x
                                    </Text>
                                </View>
                                <Text style={styles.description}>{license.description}</Text>
                            </View>

                            <View style={styles.featuresList}>
                                {license.features.map((feature, i) => (
                                    <View key={i} style={styles.featureItem}>
                                        <Ionicons name="checkmark-circle" size={18} color={license.iconColor} />
                                        <Text style={styles.featureText}>{feature}</Text>
                                    </View>
                                ))}
                            </View>
                        </LinearGradient>
                    </View>
                ))}
            </View>

            {/* Tabla comparativa */}
            <View style={styles.comparisonSection}>
                <Text style={styles.comparisonTitle}>Comparativa de precios</Text>
                <View style={styles.comparisonGrid}>
                    <View style={styles.comparisonCard}>
                        <Text style={styles.comparisonCardTitle}>Modelo Básico</Text>
                        <Text style={styles.comparisonPrice}>$19.99</Text>
                        <Text style={styles.comparisonText}>Personal: $19.99</Text>
                        <Text style={styles.comparisonText}>Empresarial: $49.97</Text>
                        <Text style={styles.comparisonText}>Ilimitada: $99.95</Text>
                        <Text style={styles.comparisonNote}>*Modelos simples de baja complejidad</Text>
                    </View>
                    <View style={styles.comparisonCard}>
                        <Text style={styles.comparisonCardTitle}>Modelo Estándar</Text>
                        <Text style={styles.comparisonPrice}>$49.99</Text>
                        <Text style={styles.comparisonText}>Personal: $49.99</Text>
                        <Text style={styles.comparisonText}>Empresarial: $124.97</Text>
                        <Text style={styles.comparisonText}>Ilimitada: $249.95</Text>
                        <Text style={styles.comparisonNote}>*Modelos de complejidad media</Text>
                    </View>
                    <View style={styles.comparisonCard}>
                        <Text style={styles.comparisonCardTitle}>Modelo Premium</Text>
                        <Text style={styles.comparisonPrice}>$99.99</Text>
                        <Text style={styles.comparisonText}>Personal: $99.99</Text>
                        <Text style={styles.comparisonText}>Empresarial: $249.97</Text>
                        <Text style={styles.comparisonText}>Ilimitada: $499.95</Text>
                        <Text style={styles.comparisonNote}>*Modelos complejos con detalles avanzados</Text>
                    </View>
                </View>
            </View>

            {/* FAQ Section */}
            <View style={styles.faqSection}>
                <View style={styles.faqTitle}>
                    <Ionicons name="help-circle-outline" size={28} color="#2563eb" />
                    <Text style={styles.faqTitleText}>Preguntas frecuentes</Text>
                </View>
                <View style={styles.faqGrid}>
                    {faqs.map((faq, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.faqItem}
                            activeOpacity={0.8}
                            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        >
                            <View style={styles.faqQuestion}>
                                <Ionicons name="help-circle-outline" size={20} color="#2563eb" />
                                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                                <Ionicons 
                                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} 
                                    size={20} 
                                    color="#64748b" 
                                />
                            </View>
                            {expandedFaq === index && (
                                <Text style={styles.faqAnswer}>{faq.answer}</Text>
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
    header: {
        paddingTop: 60,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
        lineHeight: 20,
    },
    noteCard: {
        backgroundColor: '#eff6ff',
        borderRadius: 20,
        padding: 20,
        margin: 16,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    noteTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    noteTitleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e40af',
    },
    noteText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
        marginBottom: 12,
    },
    noteExample: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
    },
    noteExampleText: {
        fontSize: 12,
        color: '#64748b',
        marginBottom: 4,
    },
    noteExamplePrices: {
        fontSize: 13,
        fontWeight: '500',
        color: '#2563eb',
    },
    grid: {
        padding: 16,
        gap: 20,
    },
    licenseCard: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 20,
        borderWidth: 2,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    licenseCardPopular: {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 6,
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
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    cardHeader: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconWrapper: {
        width: 70,
        height: 70,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    licenseName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: 12,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    licensePrice: {
        fontSize: 32,
        fontWeight: '700',
    },
    pricePeriod: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 4,
    },
    multiplier: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 30,
        marginBottom: 12,
    },
    multiplierText: {
        fontSize: 12,
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    featuresList: {
        gap: 12,
        marginBottom: 8,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    featureText: {
        fontSize: 14,
        color: '#334155',
        flex: 1,
    },
    comparisonSection: {
        backgroundColor: '#f1f5f9',
        margin: 16,
        marginTop: 8,
        padding: 20,
        borderRadius: 24,
    },
    comparisonTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 20,
    },
    comparisonGrid: {
        gap: 16,
    },
    comparisonCard: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    comparisonCardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 12,
    },
    comparisonPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2563eb',
        marginBottom: 12,
    },
    comparisonText: {
        fontSize: 13,
        color: '#475569',
        marginBottom: 4,
    },
    comparisonNote: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 8,
        fontStyle: 'italic',
    },
    faqSection: {
        backgroundColor: 'white',
        margin: 16,
        marginTop: 8,
        marginBottom: 32,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    faqTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    faqTitleText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
    },
    faqGrid: {
        gap: 12,
    },
    faqItem: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    faqQuestionText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    faqAnswer: {
        marginTop: 12,
        fontSize: 14,
        color: '#64748b',
        lineHeight: 20,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
});