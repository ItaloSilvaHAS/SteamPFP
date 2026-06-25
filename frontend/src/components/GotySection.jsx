import React from 'react';
import { motion } from 'framer-motion';

export default function GotySection({ goty, theme }) {
  if (!goty || !goty.appId) return null;

  const bannerUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${goty.appId}/library_hero.jpg`;
  const headerUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${goty.appId}/header.jpg`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div
        className="text-xs font-mono font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
        style={{ color: theme.textSecondary }}
      >
        <span style={{ color: theme.primary }}>//</span>
        Game of the Year
      </div>

      <div
        className="relative overflow-hidden rounded-2xl border"
        style={{ borderColor: theme.cardBorder }}
      >
        <div className="absolute inset-0">
          <img
            src={bannerUrl}
            alt=""
            className="w-full h-full object-cover"
            onError={e => { e.target.src = headerUrl; }}
          />
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${theme.bg}f0, ${theme.bg}99 60%, ${theme.bg}cc)` }}
          />
        </div>

        <div className="relative z-10 p-6 flex items-center gap-5">
          <div className="flex-shrink-0">
            <img
              src={headerUrl}
              alt={goty.name}
              className="w-28 h-16 object-cover rounded-xl border"
              style={{ borderColor: theme.cardBorder }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="text-[10px] font-mono uppercase tracking-widest mb-1"
              style={{ color: theme.primary }}
            >
              ★ Meu GOTY
            </div>
            <h3 className="text-lg font-black font-display text-white leading-tight mb-2 truncate">
              {goty.name}
            </h3>
            {goty.note && (
              <p
                className="text-sm leading-relaxed italic line-clamp-2"
                style={{ color: theme.textSecondary }}
              >
                "{goty.note}"
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
