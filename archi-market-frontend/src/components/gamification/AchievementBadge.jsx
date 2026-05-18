// components/gamification/AchievementBadge.jsx
import React from 'react';
import { FiCheckCircle, FiLock, FiClock } from 'react-icons/fi';
import { colors } from '../../styles/theme';

export function AchievementBadge({ icon, name, description, unlocked, unlockedAt }) {
    return (
        <div style={{
            position: 'relative',
            padding: '1rem',
            borderRadius: '16px',
            background: unlocked 
                ? `linear-gradient(135deg, ${colors.primary}10, transparent)`
                : '#f8fafc',
            border: `1px solid ${unlocked ? colors.primary + '30' : '#e2e8f0'}`,
            opacity: unlocked ? 1 : 0.6,
            transition: 'all 0.3s',
            cursor: 'default'
        }}>
            {/* Icono */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
                <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '28px',
                    background: unlocked ? `${colors.primary}20` : '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    margin: '0 auto'
                }}>
                    {icon}
                </div>
                {unlocked && (
                    <div style={{
                        position: 'absolute',
                        bottom: '-4px',
                        right: '-4px',
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: colors.success,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid white`
                    }}>
                        <FiCheckCircle size={12} color="white" />
                    </div>
                )}
            </div>

            {/* Título */}
            <h4 style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: unlocked ? colors.dark : '#64748b',
                textAlign: 'center',
                marginBottom: '0.25rem'
            }}>
                {name}
            </h4>

            {/* Descripción */}
            <p style={{
                fontSize: '0.7rem',
                color: '#94a3b8',
                textAlign: 'center',
                lineHeight: '1.4'
            }}>
                {description}
            </p>

            {/* Fecha de desbloqueo */}
            {unlocked && unlockedAt && (
                <p style={{
                    fontSize: '0.6rem',
                    color: '#cbd5e1',
                    marginTop: '0.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem'
                }}>
                    <FiClock size={10} /> {new Date(unlockedAt).toLocaleDateString('es-MX')}
                </p>
            )}

            {/* Candado para bloqueados */}
            {!unlocked && (
                <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem'
                }}>
                    <FiLock size={14} color="#cbd5e1" />
                </div>
            )}
        </div>
    );
}