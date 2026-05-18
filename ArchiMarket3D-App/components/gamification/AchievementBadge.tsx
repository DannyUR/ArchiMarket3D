// components/gamification/AchievementBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AchievementBadgeProps {
    icon: string;
    name: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
    icon,
    name,
    description,
    unlocked,
    unlockedAt,
}) => {
    return (
        <View style={[styles.container, unlocked ? styles.unlocked : styles.locked]}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{icon}</Text>
                {unlocked && (
                    <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                )}
            </View>

            <Text style={[styles.name, unlocked ? styles.nameUnlocked : styles.nameLocked]}>
                {name}
            </Text>
            <Text style={styles.description} numberOfLines={2}>
                {description}
            </Text>

            {unlocked && unlockedAt && (
                <Text style={styles.date}>
                    {new Date(unlockedAt).toLocaleDateString('es-MX')}
                </Text>
            )}

            {!unlocked && (
                <View style={styles.lockOverlay}>
                    <Ionicons name="lock-closed" size={20} color="#94a3b8" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 12,
        width: 140,
        marginRight: 12,
        position: 'relative',
        overflow: 'hidden',
    },
    unlocked: {
        backgroundColor: '#fef3c7',
        borderWidth: 1,
        borderColor: '#fcd34d',
    },
    locked: {
        backgroundColor: '#f1f5f9',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        opacity: 0.7,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    icon: {
        fontSize: 24,
    },
    checkBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#10b981',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fef3c7',
    },
    name: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    nameUnlocked: {
        color: '#1e293b',
    },
    nameLocked: {
        color: '#94a3b8',
    },
    description: {
        fontSize: 10,
        color: '#64748b',
        lineHeight: 14,
    },
    date: {
        fontSize: 9,
        color: '#94a3b8',
        marginTop: 6,
    },
    lockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});