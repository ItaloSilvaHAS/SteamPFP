import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getTheme } from './themes';
import BackgroundEffect from './components/BackgroundEffect';
import StatusBadge from './components/StatusBadge';
import AvatarDisplay from './components/AvatarDisplay';
import GameBentoGrid from './components/GameBentoGrid';
import MusicPlayer from './components/MusicPlayer';
import AchievementsSection from './components/AchievementsSection';
import GotySection from './components/GotySection';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function StatPill({ label, value, theme: t }) {
  return (
    <div className="flex flex-col items-center px-5 py-3 rounded-2xl border"
      style={{ background: t.cardBg, borderColor: t.cardBorder }}>
      <p className="text-[9px] font-mono uppercase tracking-widest mb-1" style={{ color: t.textSecondary }}>{label}</p>
      <p className="text-lg font-black font-mono tabular-nums" style={{ color: t.textAccent }}>{value}</p>
    </div>
  );
}

function CurrentlyPlaying({ game, gameid, theme: t }) {
  if (!game) return null;
  const bannerUrl = gameid ? `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameid}/header.jpg` : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border"
      style={{ borderColor: '#22c55e40', background: 'rgba(34,197,94,0.04)' }}
    >
      {bannerUrl && (
        <div className="absolute inset-0">
          <img src={bannerUrl} alt="" className="w-full h-full object-cover opacity-10"
            onError={e => e.target.style.display = 'none'} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(2,10,2,0.95), rgba(2,10,2,0.7))' }} />
        </div>
      )}
      <div className="relative z-10 flex items-center gap-4 px-5 py-3.5">
        <div className="relative flex-shrink-0">
          <span className="status-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-[0.2em] text-green-400/70 mb-0.5">Jogando agora</p>
          <p className="text-sm font-bold text-green-300 truncate">{game}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const clean = slug ? slug.toLowerCase().trim() : '';
    axios.get(`${API}/api/profile/public/${clean}`)
      .then(res => {
        if (res.data.success && res.data.profile) setProfile(res.data.profile);
        else setError(res.data.message || 'Perfil não encontrado.');
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Erro ao conectar com o servidor.');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 rounded-full border border-white/5" />
            <div className="absolute inset-0 rounded-full border-t border-white/30 animate-spin" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/20">Carregando</span>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#050508] p-4 text-center">
        <p className="text-5xl mb-5 select-none">☁️</p>
        <h1 className="text-2xl font-black font-display text-white mb-2">Perfil não encontrado</h1>
        <p className="text-sm text-slate-500 mb-8 max-w-sm">{error}</p>
        <Link to="/" className="text-xs border px-4 py-2 rounded-lg transition-all font-mono"
          style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => e.target.style.color = '#fff'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
        >
          ← Voltar ao início
        </Link>
      </div>
    );
  }

  const baseTheme = getTheme(profile.theme);
  const effectiveAccent = profile.accent_color || null;
  const t = effectiveAccent ? {
    ...baseTheme,
    primary: effectiveAccent,
    accent: effectiveAccent,
    textAccent: effectiveAccent,
    glowColor: hexToRgb(effectiveAccent) || baseTheme.glowColor,
    headerLine: `linear-gradient(90deg, transparent, ${effectiveAccent}, transparent)`,
  } : baseTheme;

  const bgEffect   = profile.bg_effect || 'none';
  const avatarFrame = profile.avatar_frame || 'none';
  const cardStyle  = profile.card_style || 'default';
  const layout     = profile.layout_style || 'standard';
  const isPlaying  = profile.personastate >= 1 && !!profile.gameextrainfo;
  const bgClass    = bgEffect === 'scanlines' ? 'bg-scanlines' : bgEffect === 'crt' ? 'bg-crt' : '';
  const maxWidth   = layout === 'wide' ? 'max-w-3xl' : layout === 'compact' ? 'max-w-lg' : 'max-w-2xl';

  const cardClass = cardStyle === 'glass' ? 'card-style-glass'
    : cardStyle === 'minimal' ? 'card-style-minimal'
    : cardStyle === 'solid' ? 'card-style-solid'
    : '';

  return (
    <div className={`min-h-screen relative ${bgClass}`} style={{ background: t.bg }}>
      <BackgroundEffect type={bgEffect} theme={t} customBgUrl={profile.custom_bg_url} />

      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: t.headerLine }} />

      {/* PROFILE BANNER (VIP) */}
      {profile.profile_banner_url && (
        <div className="relative w-full h-40 sm:h-52 overflow-hidden">
          <img
            src={profile.profile_banner_url}
            alt=""
            className="w-full h-full object-cover"
            onError={e => e.target.parentElement.style.display = 'none'}
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 40%, ${t.bg} 100%)` }} />
        </div>
      )}

      <div className={`relative z-10 ${maxWidth} mx-auto px-4 py-12 space-y-8`}>

        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={layout === 'centered' ? 'text-center' : ''}
        >
          <div className={`flex ${layout === 'centered' ? 'flex-col items-center' : 'flex-col sm:flex-row items-center sm:items-start'} gap-6`}>
            <div className={layout !== 'centered' ? 'flex-shrink-0' : ''}>
              <div style={{ '--glow': `rgba(${t.glowColor}, 0.5)`, '--frame-color': t.primary }}>
                <AvatarDisplay
                  src={profile.avatar}
                  frame={avatarFrame}
                  theme={t}
                  size={layout === 'compact' ? 80 : 104}
                />
              </div>
            </div>

            <div className={`flex-1 min-w-0 ${layout === 'centered' ? 'text-center' : ''}`}>
              <h1 className="text-3xl sm:text-4xl font-black font-display tracking-wide leading-tight" style={{ color: t.textPrimary }}>
                {profile.nickname}
              </h1>

              {profile.show_status !== false && (
                <div className={`mt-2 ${layout === 'centered' ? 'flex justify-center' : ''}`}>
                  <StatusBadge personastate={profile.personastate} gameextrainfo={profile.gameextrainfo} accentColor={t.primary} />
                </div>
              )}

              {profile.bio && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3 text-sm leading-relaxed italic max-w-md"
                  style={{ color: t.textSecondary }}
                >
                  "{profile.bio}"
                </motion.p>
              )}

              <div className={`flex flex-wrap gap-3 mt-4 ${layout === 'centered' ? 'justify-center' : ''}`}>
                <StatPill label="Nível Steam" value={profile.level ?? 0} theme={t} />
                <StatPill label="Membro desde" value={profile.timeCreated ? new Date(profile.timeCreated * 1000).getFullYear() : 'N/A'} theme={t} />
                {profile.show_total_games !== false && profile.totalGames > 0 && (
                  <StatPill label="Jogos" value={profile.totalGames} theme={t} />
                )}
              </div>
            </div>
          </div>

          {/* Currently playing */}
          {isPlaying && (
            <div className="mt-5">
              <CurrentlyPlaying game={profile.gameextrainfo} gameid={profile.gameid} theme={t} />
            </div>
          )}
        </motion.section>

        {/* GOTY */}
        {profile.goty && (
          <GotySection goty={profile.goty} theme={t} />
        )}

        {/* GAMES */}
        {profile.topGames && profile.topGames.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-xs font-mono font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-2"
              style={{ color: t.textSecondary }}>
              <span style={{ color: t.primary }}>//</span>
              {profile.topGames.length === 1 ? 'Jogo em Destaque' : 'Jogos em Destaque'}
            </div>
            <GameBentoGrid games={profile.topGames} theme={t} hideHours={profile.hide_hours} cardClass={cardClass} />
          </motion.section>
        )}

        {/* ACHIEVEMENTS */}
        {profile.show_achievements !== false && profile.achievements && profile.achievements.length > 0 && (
          <AchievementsSection achievements={profile.achievements} gameName={profile.achievementsGame} theme={t} />
        )}

        {/* FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4 pb-8"
        >
          <div className="h-px mb-6" style={{ background: `linear-gradient(90deg, transparent, ${t.cardBorder}, transparent)` }} />
          <Link to="/"
            className="text-xs font-mono transition-colors"
            style={{ color: t.textSecondary }}
            onMouseEnter={e => e.target.style.color = t.textAccent}
            onMouseLeave={e => e.target.style.color = t.textSecondary}
          >
            Crie sua vitrine em SteamPFP →
          </Link>
        </motion.footer>
      </div>

      {profile.music_url && <MusicPlayer musicUrl={profile.music_url} theme={t} />}
    </div>
  );
}

function hexToRgb(hex) {
  if (!hex || !hex.startsWith('#')) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return `${r}, ${g}, ${b}`;
}
