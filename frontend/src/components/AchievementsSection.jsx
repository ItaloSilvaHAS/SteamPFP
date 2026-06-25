import React from 'react';
import { motion } from 'framer-motion';

export default function AchievementsSection({ achievements = [], gameName, theme }) {
  if (!achievements || achievements.length === 0) return null;

  const earned = achievements.filter(a => a.achieved);
  const pct = Math.round((earned.length / achievements.length) * 100);
  const displayAchs = achievements.slice(0, 12);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="text-xs font-mono font-bold uppercase tracking-[0.2em] flex items-center gap-2"
          style={{ color: theme.textSecondary }}
        >
          <span style={{ color: theme.primary }}>//</span>
          Conquistas{gameName ? ` — ${gameName}` : ''}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-1 w-20 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, background: theme.primary }}
            />
          </div>
          <span
            className="text-[10px] font-mono tabular-nums"
            style={{ color: theme.textAccent }}
          >
            {pct}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {displayAchs.map((ach, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.04 * i, duration: 0.3 }}
            title={`${ach.name}${ach.description ? ` — ${ach.description}` : ''}`}
            className="flex flex-col items-center p-2 rounded-xl border cursor-default group"
            style={{
              background: theme.cardBg,
              borderColor: ach.achieved ? theme.cardBorder : 'rgba(255,255,255,0.04)',
              opacity: ach.achieved ? 1 : 0.45,
            }}
          >
            {ach.icon ? (
              <img
                src={ach.icon}
                alt=""
                className="w-9 h-9 rounded-lg mb-1.5 transition-transform duration-200 group-hover:scale-110"
                style={{
                  filter: ach.achieved ? 'none' : 'grayscale(100%) brightness(0.35)',
                  boxShadow: ach.achieved ? `0 0 8px rgba(${theme.glowColor}, 0.3)` : 'none',
                }}
              />
            ) : (
              <div
                className="w-9 h-9 rounded-lg mb-1.5 flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-slate-600">
                  <path d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
            )}
            <p
              className="text-[9px] font-mono text-center line-clamp-2 leading-tight"
              style={{ color: ach.achieved ? theme.textAccent : theme.textSecondary }}
            >
              {ach.name}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
