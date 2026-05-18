// components/gamification/LevelProgressBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LevelProgressBarProps {
    level: number;
    levelIcon: string;
    levelTitle: string;
    progress: number;
    currentXP: number;
    nextXP: number;
    discount?: number;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
    level,
    levelIcon,
    levelTitle,
    progress,
    currentXP,
    nextXP,
    discount = 0,
}) => {
    return (
        <LinearGradient
            colors={['#1e293b', '#0f172a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.container}
        >
            <View style={styles.header}>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelIcon}>{levelIcon}</Text>
                    <Text style={styles.levelText}>Nivel {level}</Text>
                </View>
                <Text style={styles.levelTitle}>{levelTitle}</Text>
                {discount > 0 && (
                    <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>🔥 {discount}% OFF</Text>
                    </View>
                )}
            </View>

            <View style={styles.progressContainer}>
                <View style={styles.progressLabels}>
                    <Text style={styles.progressLabel}>Progreso al siguiente nivel</Text>
                    <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
                </View>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
            </View>

            <View style={styles.xpContainer}>
                <Text style={styles.xpText}>✨ {currentXP} XP</Text>
                <Text style={styles.xpText}>🎯 {nextXP - currentXP} XP para subir</Text>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        flexWrap: 'wrap',
        gap: 8,
    },
    levelBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#334155',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 30,
        gap: 6,
    },
    levelIcon: {
        fontSize: 16,
    },
    levelText: {
        color: '#facc15',
        fontWeight: 'bold',
        fontSize: 14,
    },
    levelTitle: {
        color: '#94a3b8',
        fontSize: 12,
    },
    discountBadge: {
        backgroundColor: '#f59e0b',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
    },
    discountText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    progressContainer: {
        marginBottom: 8,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    progressLabel: {
        color: '#94a3b8',
        fontSize: 11,
    },
    progressPercent: {
        color: '#facc15',
        fontSize: 11,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#334155',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#facc15',
        borderRadius: 3,
    },
    xpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    xpText: {
        color: '#64748b',
        fontSize: 10,
    },
});