// components/gamification/GamificationWidget.jsx
import React, { useState } from 'react';
import { useGamification } from '../../hooks/useGamification';
import { LevelProgressBar } from './LevelProgressBar';
import { AchievementBadge } from './AchievementBadge';
import { FiRefreshCw, FiTrophy, FiStar, FiShoppingBag, FiMessageSquare } from 'react-icons/fi';

export function GamificationWidget() {
    const { data, loading, error, refresh } = useGamification();
    const [showAllAchievements, setShowAllAchievements] = useState(false);

    if (loading) {
        return (
            <div className="bg-slate-800 rounded-2xl p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
                <p className="text-slate-400 mt-3">Cargando gamificación...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="bg-slate-800 rounded-2xl p-6 text-center">
                <p className="text-red-400">Error al cargar datos</p>
                <button
                    onClick={refresh}
                    className="mt-3 text-yellow-400 text-sm hover:underline"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    const unlockedAchievements = data.achievements?.filter(a => a.unlocked_at) || [];
    const lockedAchievements = data.achievements?.filter(a => !a.unlocked_at) || [];
    const displayedAchievements = showAllAchievements
        ? data.achievements || []
        : unlockedAchievements.slice(0, 4);

    return (
        <div className="space-y-5">
            <div className="flex justify-end">
                <button
                    onClick={refresh}
                    className="text-slate-400 hover:text-yellow-400 transition-colors"
                    title="Actualizar"
                >
                    <FiRefreshCw className="w-4 h-4" />
                </button>
            </div>

            <LevelProgressBar
                level={data.level}
                levelIcon={data.level_icon}
                levelTitle={data.level_title}
                progress={data.progress}
                currentXP={data.xp - data.xp_current_level}
                nextXP={data.xp_next_level - data.xp_current_level}
                discount={data.discount}
            />

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <FiShoppingBag className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{data.total_purchases}</div>
                    <div className="text-xs text-slate-400">Compras</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <FiMessageSquare className="w-5 h-5 text-green-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{data.total_reviews}</div>
                    <div className="text-xs text-slate-400">Reseñas</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 text-center">
                    <FiTrophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{data.level}</div>
                    <div className="text-xs text-slate-400">Nivel</div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FiTrophy className="w-5 h-5 text-yellow-400" />
                        <h3 className="text-white font-semibold">Logros</h3>
                        <span className="text-xs text-slate-400">
                            ({unlockedAchievements.length}/{data.achievements?.length || 0})
                        </span>
                    </div>
                    {data.achievements?.length > 4 && (
                        <button
                            onClick={() => setShowAllAchievements(!showAllAchievements)}
                            className="text-xs text-yellow-400 hover:underline"
                        >
                            {showAllAchievements ? 'Ver menos' : 'Ver todos'}
                        </button>
                    )}
                </div>

                <div style={styles.achievementsGrid}>
                    {displayedAchievements.map((achievement) => (
                        <AchievementBadge
                            key={`achievement-${achievement.id}-${achievement.unlocked_at ? 'done' : 'pending'}`} // ✅ Key única
                            icon={achievement.icon}
                            name={achievement.name}
                            description={achievement.description}
                            unlocked={!!achievement.unlocked_at}
                            unlockedAt={achievement.unlocked_at}
                            progress={achievement.progress}
                            required={achievement.required}
                        />
                    ))}
                </div>

                {lockedAchievements.length > 0 && !showAllAchievements && (
                    <div className="mt-3 text-center">
                        <p className="text-xs text-slate-500">
                            +{lockedAchievements.length} logros por desbloquear
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-slate-800/30 rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm">
                    <FiStar className="w-4 h-4 text-yellow-400" />
                    <span className="text-slate-300">
                        Siguiente nivel: {data.level + 1}
                    </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    {Math.ceil(data.xp_next_level - data.xp)} XP para subir de nivel
                </div>
            </div>
        </div>
    );
}