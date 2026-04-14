// app/terms.tsx
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function TermsScreen() {
    const [expandedSection, setExpandedSection] = useState<number | null>(null);

    const sections = [
        {
            id: 1,
            title: 'Aceptación de los términos',
            icon: 'checkmark-circle-outline',
            content: 'Al acceder y utilizar ArchiMarket3D, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio. Nos reservamos el derecho de modificar estos términos en cualquier momento.'
        },
        {
            id: 2,
            title: 'Licencias de modelos 3D',
            icon: 'cube-outline',
            content: 'Los modelos 3D se venden bajo tres tipos de licencia:',
            bullets: [
                'Personal: Uso individual, 1 proyecto simultáneo',
                'Empresarial: Hasta 5 usuarios, proyectos ilimitados',
                'Ilimitada: Usuarios ilimitados, proyectos ilimitados'
            ]
        },
        {
            id: 3,
            title: 'Propiedad intelectual',
            icon: 'shield-outline',
            content: 'Todos los modelos 3D son propiedad de sus respectivos creadores. No se permite la redistribución, reventa o uso no autorizado de los modelos. Al descargar un modelo, obtienes una licencia de uso, no la propiedad del archivo.'
        },
        {
            id: 4,
            title: 'Pagos y reembolsos',
            icon: 'card-outline',
            content: 'Los pagos se procesan de forma segura a través de PayPal. No se ofrecen reembolsos después de la descarga del modelo, ya que los productos digitales son de acceso inmediato. Todas las transacciones están protegidas por encriptación SSL.'
        },
        {
            id: 5,
            title: 'Descargas y formatos',
            icon: 'download-outline',
            content: 'Los modelos descargados están disponibles en múltiples formatos (GLTF, FBX, OBJ, USDZ). Eres responsable de mantener la seguridad de tus descargas y credenciales de acceso. Los archivos están disponibles por tiempo ilimitado después de la compra.'
        },
        {
            id: 6,
            title: 'Responsabilidad',
            icon: 'warning-outline',
            content: 'ArchiMarket3D no se hace responsable por el uso que se dé a los modelos descargados. El usuario es el único responsable de cumplir con las leyes aplicables y de verificar la compatibilidad de los modelos con su software.'
        },
        {
            id: 7,
            title: 'Modificaciones del servicio',
            icon: 'refresh-outline',
            content: 'Nos reservamos el derecho de modificar, suspender o discontinuar cualquier aspecto del servicio en cualquier momento. Te notificaremos con anticipación sobre cambios significativos que puedan afectar tu uso de la plataforma.'
        },
        {
            id: 8,
            title: 'Contacto',
            icon: 'mail-outline',
            content: 'Para preguntas sobre estos términos, contáctanos en: soporte@archimarket3d.com',
            email: 'soporte@archimarket3d.com'
        }
    ];

    const toggleSection = (id: number) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const getIconColor = (id: number) => {
        const colors = {
            1: '#10b981',
            2: '#3b82f6',
            3: '#8b5cf6',
            4: '#f59e0b',
            5: '#06b6d4',
            6: '#ef4444',
            7: '#6366f1',
            8: '#2563eb'
        };
        return colors[id as keyof typeof colors] || '#2563eb';
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
                    <Ionicons name="document-text-outline" size={28} color="#fff" />
                    <Text style={styles.headerTitle}>Términos y Condiciones</Text>
                </View>
                <View style={{ width: 40 }} />
            </LinearGradient>

            {/* Fecha de actualización */}
            <View style={styles.updateBadge}>
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text style={styles.updateText}>Última actualización: 1 de abril de 2024</Text>
            </View>

            <ScrollView 
                style={styles.content} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Introducción */}
                <LinearGradient
                    colors={['#eff6ff', '#dbeafe']}
                    style={styles.introCard}
                >
                    <Ionicons name="information-circle-outline" size={40} color="#2563eb" />
                    <Text style={styles.introTitle}>Bienvenido a ArchiMarket3D</Text>
                    <Text style={styles.introText}>
                        Por favor, lee detenidamente estos términos y condiciones antes de utilizar nuestros servicios. 
                        Al acceder a nuestra plataforma, aceptas cumplir con todas las disposiciones aquí establecidas.
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
                            <View style={[styles.sectionIcon, { backgroundColor: getIconColor(section.id) + '15' }]}>
                                <Ionicons name={section.icon as any} size={24} color={getIconColor(section.id)} />
                            </View>
                            <View style={styles.sectionTitleContainer}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <Text style={styles.sectionNumber}>Sección {section.id}</Text>
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
                                                <View style={[styles.bulletDot, { backgroundColor: getIconColor(section.id) }]} />
                                                <Text style={styles.bulletText}>{bullet}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                                {section.email && (
                                    <TouchableOpacity style={styles.emailButton}>
                                        <LinearGradient
                                            colors={['#2563eb', '#1d4ed8']}
                                            style={styles.emailGradient}
                                        >
                                            <Ionicons name="mail-outline" size={18} color="#fff" />
                                            <Text style={styles.emailText}>{section.email}</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                    </View>
                ))}

                {/* Aceptación */}
                <LinearGradient
                    colors={['#f0fdf4', '#dcfce7']}
                    style={styles.acceptanceCard}
                >
                    <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                    <Text style={styles.acceptanceTitle}>Al usar ArchiMarket3D</Text>
                    <Text style={styles.acceptanceText}>
                        Aceptas automáticamente todos los términos y condiciones aquí descritos.
                        Si no estás de acuerdo, por favor no utilices nuestros servicios.
                    </Text>
                </LinearGradient>

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
    updateBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
    },
    updateText: {
        fontSize: 12,
        color: '#64748b',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    introCard: {
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#bfdbfe',
    },
    introTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1e293b',
        marginTop: 12,
        marginBottom: 8,
    },
    introText: {
        fontSize: 14,
        color: '#475569',
        textAlign: 'center',
        lineHeight: 20,
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
    emailButton: {
        marginTop: 16,
        borderRadius: 40,
        overflow: 'hidden',
    },
    emailGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
    emailText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#fff',
    },
    acceptanceCard: {
        borderRadius: 20,
        padding: 20,
        marginTop: 8,
        marginBottom: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#bbf7d0',
    },
    acceptanceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#166534',
        marginTop: 8,
        marginBottom: 4,
    },
    acceptanceText: {
        fontSize: 13,
        color: '#166534',
        textAlign: 'center',
        lineHeight: 18,
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