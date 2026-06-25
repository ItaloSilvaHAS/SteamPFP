import React from 'react';
import { motion } from 'framer-motion';

function formatHours(h) {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}k hrs`;
  return `${h} hrs`;
}

function GameCardLarge({ game, theme, index, hideHours, cardClass }) {
  const bannerUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/header.jpg`;
  const fallback  = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appId}/capsule_184x69.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`game-card-hover relative overflow-hidden rounded-2xl border cursor-default group ${cardClass || ''}`}
      style={{ background: theme.cardBg, borderColor: theme.cardBorder, boxShadow: `0 4px 24px rgba(${theme.glowColor}, 0.06)` }}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={bannerUrl} alt={game.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={e => { e.target.src = fallback; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Recently played badge */}
        {game.recentHours > 0 && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {game.recentHours}h rec.
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-2">
            {game.iconUrl && (
              <img src={game.iconUrl} alt="" className="w-6 h-6 rounded bg-black/50"
                onError={e => e.target.style.display = 'none'} />
            )}
            <span className="text-sm font-bold text-white font-display leading-tight line-clamp-1">
              {game.name}
            </span>
          </div>
        </div>
      </div>

      {!hideHours && (
        <div className="px-3 py-2.5 flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Horas registradas</span>
          <span className="text-sm font-black font-mono" style={{ color: theme.textAccent }}>
            {formatHours(game.playtime)}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function GameCardSmall({ game, theme, index, hideHours, cardClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`game-card-hover flex items-center gap-3 p-3 rounded-xl border cursor-default group ${cardClass || ''}`}
      style={{ background: theme.cardBg, borderColor: theme.cardBorder }}
    >
      {game.iconUrl ? (
        <img src={game.iconUrl} alt="" className="w-10 h-10 rounded-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          onError={e => e.target.style.display = 'none'} />
      ) : (
        <div className="w-10 h-10 rounded-lg flex-shrink-0 bg-white/5" />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate leading-tight">{game.name}</p>
        {!hideHours && (
          <p className="text-xs font-mono mt-0.5" style={{ color: theme.textAccent }}>
            {formatHours(game.playtime)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {game.recentHours > 0 && (
          <span className="text-[9px] font-mono" style={{ color: '#86efac' }}>{game.recentHours}h rec.</span>
        )}
        <div className="w-0.5 h-7 rounded-full opacity-50" style={{ background: theme.primary }} />
      </div>
    </motion.div>
  );
}

export default function GameBentoGrid({ games = [], theme, hideHours = false, cardClass = '' }) {
  if (!games.length) {
    return (
      <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: theme.cardBorder }}>
        <p className="text-sm font-mono" style={{ color: theme.textSecondary }}>
          // Nenhum jogo público encontrado
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Verifique se seu perfil de jogos não está privado na Steam.
        </p>
      </div>
    );
  }

  const large = games.slice(0, Math.min(2, games.length));
  const small  = games.slice(2);

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${large.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {large.map((game, i) => (
          <GameCardLarge key={game.appId || i} game={game} theme={theme} index={i} hideHours={hideHours} cardClass={cardClass} />
        ))}
      </div>
      {small.length > 0 && (
        <div className="space-y-2">
          {small.map((game, i) => (
            <GameCardSmall key={game.appId || i} game={game} theme={theme} index={i + 2} hideHours={hideHours} cardClass={cardClass} />
          ))}
        </div>
      )}
    </div>
  );
}
