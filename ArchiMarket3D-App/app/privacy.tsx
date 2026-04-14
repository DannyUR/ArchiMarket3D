// app/privacy.tsx
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function PrivacyScreen() {
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const sections = [
        {
            id: 1,
            title: 'Información que recopilamos',
            icon: 'shield-checkmark-outline',
            color: '#3b82f6',
            content: 'Recopilamos la siguiente información para proporcionar nuestros servicios de manera óptima y segura:',
            bullets: [
                'Nombre y correo electrónico para identificación',
                'Información de pago (procesada de forma segura por PayPal)',
                'Historial de compras y descargas',
                'Datos de uso de la plataforma'
            ]
        },
        {
            id: 2,
            title: 'Uso de la información',
            icon: 'analytics-outline',
            color: '#10b981',
            content: 'Tu información es utilizada exclusivamente para:',
            bullets: [
                'Procesar tus compras y entregar los modelos digitales',
                'Mejorar continuamente nuestros servicios',
                'Comunicarte sobre actualizaciones y ofertas relevantes',
                'Mantener la seguridad e integridad de la plataforma'
            ]
        },
        {
            id: 3,
            title: 'Protección de datos',
            icon: 'lock-closed-outline',
            color: '#8b5cf6',
            content: 'Implementamos medidas de seguridad de última generación para proteger tu información personal. Tus datos se almacenan en servidores seguros con encriptación SSL y solo se accede a ellos cuando es estrictamente necesario para la prestación del servicio.'
        },
        {
            id: 4,
            title: 'Cookies y tecnologías similares',
            icon: 'cafe-outline',
            color: '#f59e0b',
            content: 'Utilizamos cookies para mejorar tu experiencia, recordar tus preferencias y analizar el uso de la plataforma. Puedes controlar las cookies desde tu navegador en cualquier momento. Las cookies esenciales no pueden ser desactivadas ya que son necesarias para el funcionamiento básico.'
        },
        {
            id: 5,
            title: 'Compartición de datos',
            icon: 'people-outline',
            color: '#ef4444',
            content: 'No vendemos ni compartimos tu información personal con terceros. Las únicas excepciones son:',
            bullets: [
                'Procesamiento de pagos a través de PayPal (certificado PCI DSS)',
                'Cuando la ley nos obligue a hacerlo',
                'Con tu consentimiento explícito y documentado'
            ]
        },
        {
            id: 6,
            title: 'Tus derechos',
            icon: 'document-text-outline',
            color: '#06b6d4',
            content: 'Como usuario, tienes derechos garantizados sobre tus datos personales:',
            bullets: [
                'Acceder a toda tu información almacenada',
                'Rectificar cualquier dato incorrecto',
                'Solicitar la eliminación de tu cuenta y datos',
                'Oponerte al procesamiento de tus datos',
                'Portabilidad de tus datos a otro servicio'
            ]
        },
        {
            id: 7,
            title: 'Retención de datos',
            icon: 'time-outline',
            color: '#6366f1',
            content: 'Conservamos tus datos mientras tu cuenta esté activa. Si eliminas tu cuenta, eliminaremos tus datos personales en un plazo máximo de 30 días, excepto aquellos necesarios para cumplir con obligaciones legales o fiscales que requieran conservación por períodos específicos.'
        },
        {
            id: 8,
            title: 'Menores de edad',
            icon: 'people-circle-outline',
            color: '#ec4899',
            content: 'Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos conscientemente información de menores. Si eres padre/tutor y crees que tu hijo nos ha proporcionado información, contáctanos inmediatamente para eliminar dichos datos.'
        },
        {
            id: 9,
            title: 'Cambios a esta política',
            icon: 'refresh-circle-outline',
            color: '#14b8a6',
            content: 'Actualizaremos esta política periódicamente para reflejar cambios en nuestras prácticas. Te notificaremos sobre cambios significativos a través de la plataforma o por correo electrónico con al menos 30 días de anticipación cuando sea posible.'
        },
        {
            id: 10,
            title: 'Contacto',
            icon: 'mail-outline',
            color: '#2563eb',
            content: 'Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tus datos, contáctanos:',
            email: 'privacidad@archimarket3d.com',
            phone: '+52 (55) 1234-5678'
        }
    ];

    const toggleSection = (id: number) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e40af" />
            
            {/* Header con gradiente */}
            <LinearGradient
                colors={['#1e40af', '#3b82f6', '#60a5fa']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#fff" />
                    <Text style={styles.headerTitle}>Política de Privacidad</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            {/* Badge de seguridad */}
            <View style={styles.securityBadge}>
                <LinearGradient
                    colors={['#10b981', '#059669']}
                    style={styles.securityBadgeGradient}
                >
                    <Ionicons name="shield-checkmark" size={16} color="#fff" />
                    <Text style={styles.securityBadgeText}>Datos protegidos por SSL</Text>
                </LinearGradient>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Tarjeta de compromiso */}
                <LinearGradient
                    colors={['#1e40af', '#2563eb']}
                    style={styles.commitmentCard}
                >
                    <View style={styles.commitmentIcon}>
                        <Ionicons name="heart" size={32} color="#fff" />
                    </View>
                    <Text style={styles.commitmentTitle}>Tu privacidad es nuestra prioridad</Text>
                    <Text style={styles.commitmentText}>
                        En ArchiMarket3D nos comprometemos a proteger tus datos personales 
                        y a ser transparentes sobre cómo los utilizamos.
                    </Text>
                </LinearGradient>

                {/* Secciones expandibles */}
                {sections.map((section) => (
                    <View key={section.id} style={styles.sectionCard}>
                        <TouchableOpacity 
                            style={styles.sectionHeader}
                            onPress={() => toggleSection(section.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.sectionIcon, { backgroundColor: section.color + '15' }]}>
                                <Ionicons name={section.icon as any} size={24} color={section.color} />
                            </View>
                            <View style={styles.sectionTitleContainer}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionNumber}>Artículo {section.id}</Text>
                            </View>
                            <Ionicons 
                                name={expandedSection === section.id ? 'chevron-up' : 'chevron-down'} 
                                size={20} 
                                color="#94a3b8" 
                            />
                        </TouchableOpacity>

                        {expandedSection === section.id && (
                            <View style={styles.sectionContent}>
                                <Text style={styles.sectionText}>{section.content}</Text>
                                {section.bullets && (
                                    <View style={styles.bulletList}>
                                        {section.bullets.map((bullet, idx) => (
                                            <View key={idx} style={styles.bulletItem}>
                                                <View style={[styles.bulletDot, { backgroundColor: section.color }]} />
                                                <Text style={styles.bulletText}>{bullet}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                {section.email && (
                                    <TouchableOpacity style={styles.contactCard}>
                                        <LinearGradient
                                            colors={['#f8fafc', '#f1f5f9']}
                                            style={styles.contactGradient}
                                        >
                                            <View style={styles.contactRow}>
                                                <Ionicons name="mail-outline" size={20} color="#2563eb" />
                                                <Text style={styles.contactEmail}>{section.email}</Text>
                                            </View>
                                            {section.phone && (
                                                <View style={styles.contactRow}>
                                                    <Ionicons name="call-outline" size={20} color="#2563eb" />
                                                    <Text style={styles.contactPhone}>{section.phone}</Text>
                                                </View>
                                            )}
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                ))}

                {/* Certificaciones */}
                <View style={styles.certifications}>
                    <Text style={styles.certTitle}>Certificaciones y cumplimiento</Text>
                    <View style={styles.certGrid}>
                        <View style={styles.certItem}>
                            <Ionicons name="shield-checkmark" size={24} color="#10b981" />
                            <Text style={styles.certText}>GDPR Compliant</Text>
                        </View>
                        <View style={styles.certItem}>
                            <Ionicons name="lock-closed" size={24} color="#10b981" />
                            <Text style={styles.certText}>SSL Secure</Text>
                        </View>
                        <View style={styles.certItem}>
                            <Ionicons name="business" size={24} color="#10b981" />
                            <Text style={styles.certText}>PCI DSS</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        © 2024 ArchiMarket3D. Todos los derechos reservados.
                    </Text>
                    <Text style={styles.footerSubtext}>
                        Arquitectura 3D para profesionales
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    securityBadge: {
        alignItems: 'center',
        marginTop: -12,
        marginBottom: 16,
    },
    securityBadgeGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 30,
    },
    securityBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#fff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    commitmentCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    commitmentIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    commitmentTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
        textAlign: 'center',
    },
    commitmentText: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        lineHeight: 18,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    sectionIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitleContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1e293b',
    },
    sectionNumber: {
        fontSize: 11,
        color: '#94a3b8',
        marginTop: 2,
    },
    sectionContent: {
        padding: 16,
        paddingTop: 0,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    sectionText: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 22,
        marginBottom: 12,
    },
    bulletList: {
        marginTop: 8,
        gap: 10,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        color: '#475569',
        lineHeight: 20,
    },
    contactCard: {
        marginTop: 16,
        borderRadius: 16,
        overflow: 'hidden',
    },
    contactGradient: {
        padding: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    contactEmail: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '500',
    },
    contactPhone: {
        fontSize: 13,
        color: '#1e293b',
        fontWeight: '500',
    },
    certifications: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginTop: 8,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    certTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: 16,
    },
    certGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    certItem: {
        alignItems: 'center',
        gap: 8,
    },
    certText: {
        fontSize: 11,
        fontWeight: '500',
        color: '#64748b',
    },
    footer: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 16,
    },
    footerText: {
        fontSize: 12,
        color: '#94a3b8',
    },
    footerSubtext: {
        fontSize: 11,
        color: '#cbd5e1',
        marginTop: 4,
    },
});