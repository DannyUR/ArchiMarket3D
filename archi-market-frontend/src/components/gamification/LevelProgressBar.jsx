// components/gamification/LevelProgressBar.jsx
import React from 'react';

export function LevelProgressBar({ level, levelIcon, levelTitle, progress, currentXP, nextXP, discount }) {
    return (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-700 px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="text-2xl">{levelIcon}</span>
                        <span className="text-white font-bold">Nivel {level}</span>
                    </div>
                    <div className="text-yellow-400 font-medium">
                        {levelTitle}
                    </div>
                </div>
                
                {discount > 0 && (
                    <div className="bg-green-500/20 px-3 py-1 rounded-full">
                        <span className="text-green-400 text-sm font-medium">
                            {discount}% OFF
                        </span>
                    </div>
                )}
            </div>

            <div className="mb-3">
                <div className="flex justify-between text-sm text-slate-400 mb-1">
                    <span>Progreso al siguiente nivel</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <div className="flex justify-between text-sm">
                <span className="text-slate-400">
                    XP actual: <span className="text-white font-medium">{currentXP}</span>
                </span>
                <span className="text-slate-400">
                    XP necesarias: <span className="text-white font-medium">{nextXP}</span>
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-700">
                <div className="text-center">
                    <div className="text-2xl font-bold text-white">{level}</div>
                    <div className="text-xs text-slate-400">Nivel actual</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{Math.round(progress)}%</div>
                    <div className="text-xs text-slate-400">Progreso</div>
                </div>
            </div>
        </div>
    );
}