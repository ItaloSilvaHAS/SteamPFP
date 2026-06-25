import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import PublicProfile from './PublicProfile';
import { THEMES, AVATAR_FRAMES, BG_EFFECTS, getTheme } from './themes';
import AvatarDisplay from './components/AvatarDisplay';
import SnowCanvas from './components/SnowCanvas';

axios.defaults.withCredentials = true;
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ======================== SVG ICONS ========================
const Ic = ({ d, size = 16, stroke = true }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    fill={stroke ? 'none' : 'currentColor'}
    stroke={stroke ? 'currentColor' : 'none'}
    strokeWidth={stroke ? 1.6 : 0}
    strokeLinecap="round" strokeLinejoin="round"
  >
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  user:    () => <Ic d={["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 3a4 4 0 100 8 4 4 0 000-8z"]} />,
  palette: () => <Ic d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10c0 1.657-1.343 3-3 3h-1.5a1.5 1.5 0 000 3H19c.58 0 1 .42 1 1 0 2.21-3.582 3-8 3zM7 13a1 1 0 100-2 1 1 0 000 2zm3-4a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2zm3 4a1 1 0 100-2 1 1 0 000 2z" />,
  layers:  () => <Ic d={["M12 2L2 7l10 5 10-5-10-5","M2 17l10 5 10-5","M2 12l10 5 10-5"]} />,
  frame:   () => <Ic d={["M21 3H3v18h18V3z","M8 8h8v8H8z"]} />,
  gamepad: () => <Ic d={["M6 12h4","M8 10v4","M16 11h2","M17 10v2","M2 6a2 2 0 012-2h16a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"]} />,
  trophy:  () => <Ic d={["M6 9H4.5a2.5 2.5 0 010-5H6","M18 9h1.5a2.5 2.5 0 000-5H18","M4 22h16","M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22","M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22","M18 2H6v7a6 6 0 0012 0V2z"]} />,
  eye:     () => <Ic d={["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8","M12 9a3 3 0 100 6 3 3 0 000-6z"]} />,
  music:   () => <Ic d={["M9 18V5l12-2v13","M6 18a3 3 0 100-6 3 3 0 000 6z","M18 16a3 3 0 100-6 3 3 0 000 6z"]} />,
  star:    () => <Ic d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
  search:  () => <Ic d={["M11 19a8 8 0 100-16 8 8 0 000 16z","M21 21l-4.35-4.35"]} />,
  check:   () => <Ic d="M20 6L9 17l-5-5" />,
  x:       () => <Ic d={["M18 6L6 18","M6 6l12 12"]} />,
  steam:   () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .007c-4.437 0-8.22 2.92-9.43 6.94l4.28 1.763c.483-.34 1.072-.544 1.71-.544.755 0 1.442.284 1.968.752L14.71 6.55c.038-1.524 1.285-2.748 2.825-2.748 1.56 0 2.83 1.27 2.83 2.83s-1.27 2.83-2.83 2.83c-1.393 0-2.55-1.01-2.785-2.34l-4.113 2.373c.033.16.058.324.058.495 0 1.56-1.27 2.83-2.83 2.83-.878 0-1.662-.403-2.184-1.034L1.756 10.37C1.914 16.89 7.34 22.007 14 22.007c6.627 0 12-5.373 12-12S20.627.007 14 .007z"/>
    </svg>
  ),
  arrow:   () => <Ic d="M12 5v14M5 12l7 7 7-7" />,
};

const TABS = [
  { id: 'perfil',     label: 'Perfil',      Icon: ICONS.user },
  { id: 'tema',       label: 'Tema',         Icon: ICONS.palette },
  { id: 'fundo',      label: 'Fundo',        Icon: ICONS.layers },
  { id: 'moldura',    label: 'Moldura',      Icon: ICONS.frame },
  { id: 'jogos',      label: 'Jogos',        Icon: ICONS.gamepad },
  { id: 'display',    label: 'Display',      Icon: ICONS.eye },
  { id: 'musica',     label: 'Música',       Icon: ICONS.music, vip: true },
];

function VipTag() {
  return (
    <span className="vip-badge-shine text-[8px] font-black uppercase tracking-widest text-black px-1.5 py-0.5 rounded-full inline-flex flex-shrink-0">
      VIP
    </span>
  );
}
function SLabel({ children }) {
  return <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-slate-500 mb-2">{children}</p>;
}

export default function App() {
  const [user, setUser]               = useState(null);
  const [steamData, setSteamData]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadingProfile, setLP]       = useState(false);
  const [activeTab, setActiveTab]     = useState('perfil');

  // Persisted state — all loaded fresh from /api/profile/me
  const [theme, setTheme]             = useState('cyberpunk');
  const [customSlug, setCustomSlug]   = useState('');
  const [bio, setBio]                 = useState('');
  const [bgEffect, setBgEffect]       = useState('none');
  const [avatarFrame, setAvatarFrame] = useState('none');
  const [musicUrl, setMusicUrl]       = useState('');
  const [featuredGames, setFeaturedGames] = useState([]);
  const [gotyAppId, setGotyAppId]     = useState('');
  const [gotyNote, setGotyNote]       = useState('');
  const [showAchievements, setShowAchievements] = useState(true);
  const [showStatus, setShowStatus]   = useState(true);
  const [hideHours, setHideHours]     = useState(false);
  const [cardStyle, setCardStyle]     = useState('default');
  const [layoutStyle, setLayoutStyle] = useState('standard');
  const [profileBannerUrl, setProfileBannerUrl] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [showTotalGames, setShowTotalGames] = useState(true);

  const [isSaving, setIsSaving]       = useState(false);
  const [feedback, setFeedback]       = useState({ type: '', message: '' });
  const userIsVip = user?.is_vip || false;
  const activeTheme = getTheme(theme);

  const applyProfile = useCallback((p) => {
    setCustomSlug(p.custom_slug || '');
    if (p.theme) setTheme(p.theme);
    if (p.bio) setBio(p.bio);
    if (p.bg_effect) setBgEffect(p.bg_effect);
    if (p.avatar_frame) setAvatarFrame(p.avatar_frame);
    if (p.music_url) setMusicUrl(p.music_url);
    if (p.featured_games) {
      try { setFeaturedGames(JSON.parse(p.featured_games)); } catch (_) {}
    }
    if (p.goty_appid) setGotyAppId(p.goty_appid);
    if (p.goty_note) setGotyNote(p.goty_note);
    setShowAchievements(p.show_achievements !== false);
    setShowStatus(p.show_status !== false);
    setHideHours(!!p.hide_hours);
    if (p.card_style) setCardStyle(p.card_style);
    if (p.layout_style) setLayoutStyle(p.layout_style);
    if (p.profile_banner_url) setProfileBannerUrl(p.profile_banner_url);
    if (p.accent_color) setAccentColor(p.accent_color);
    setShowTotalGames(p.show_total_games !== false);
  }, []);

  useEffect(() => {
    axios.get(`${API}/api/auth/user`)
      .then(res => {
        if (!res.data.success) { setLoading(false); return null; }
        setUser(res.data.user);
        return axios.get(`${API}/api/profile/me`);
      })
      .then(profileRes => {
        if (!profileRes) return;
        if (profileRes.data.success) {
          applyProfile(profileRes.data.profile);
          fetchSteam(profileRes.data.profile.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [applyProfile]);

  const fetchSteam = (steamId) => {
    setLP(true);
    axios.get(`${API}/api/steam/profile/${steamId}`)
      .then(r => { if (r.data.success) setSteamData(r.data.data); })
      .finally(() => setLP(false));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await axios.post(`${API}/api/profile/save`, {
        theme, custom_slug: customSlug, bio,
        bg_effect: bgEffect, avatar_frame: avatarFrame, music_url: musicUrl,
        featured_games: featuredGames, goty_appid: gotyAppId, goty_note: gotyNote,
        show_achievements: showAchievements, show_status: showStatus, hide_hours: hideHours,
        card_style: cardStyle, layout_style: layoutStyle,
        profile_banner_url: profileBannerUrl, accent_color: accentColor,
        show_total_games: showTotalGames,
      });
      if (res.data.success) {
        setFeedback({ type: 'success', message: 'Salvo com sucesso!' });
        setCustomSlug(res.data.actual_slug);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Erro ao salvar.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050508]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border border-white/5" />
            <div className="absolute inset-0 rounded-full border-t border-white/40 animate-spin" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-white/20">
            Loading
          </span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/:slug" element={<PublicProfile />} />
      <Route path="/" element={
        !user
          ? <LandingPage onLogin={() => { window.location.href = `${API}/api/auth/steam`; }} />
          : <Dashboard
              user={user} steamData={steamData} loadingProfile={loadingProfile}
              activeTab={activeTab} setActiveTab={setActiveTab}
              theme={theme} setTheme={setTheme} activeTheme={activeTheme}
              customSlug={customSlug} setCustomSlug={setCustomSlug}
              bio={bio} setBio={setBio}
              bgEffect={bgEffect} setBgEffect={setBgEffect}
              avatarFrame={avatarFrame} setAvatarFrame={setAvatarFrame}
              musicUrl={musicUrl} setMusicUrl={setMusicUrl}
              featuredGames={featuredGames} setFeaturedGames={setFeaturedGames}
              gotyAppId={gotyAppId} setGotyAppId={setGotyAppId}
              gotyNote={gotyNote} setGotyNote={setGotyNote}
              showAchievements={showAchievements} setShowAchievements={setShowAchievements}
              showStatus={showStatus} setShowStatus={setShowStatus}
              hideHours={hideHours} setHideHours={setHideHours}
              cardStyle={cardStyle} setCardStyle={setCardStyle}
              layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle}
              profileBannerUrl={profileBannerUrl} setProfileBannerUrl={setProfileBannerUrl}
              accentColor={accentColor} setAccentColor={setAccentColor}
              showTotalGames={showTotalGames} setShowTotalGames={setShowTotalGames}
              isSaving={isSaving} feedback={feedback}
              userIsVip={userIsVip}
              onSave={handleSave}
              onLogout={() => { window.location.href = `${API}/api/auth/logout`; }}
            />
      } />
    </Routes>
  );
}

// ======================== LANDING PAGE ========================
function LandingPage({ onLogin }) {
  const features = [
    {
      icon: ICONS.palette,
      title: '13 Temas',
      desc: 'De Cyberpunk a Aurora Boreal. Cada tema com paleta, glow e tipografia próprios.',
    },
    {
      icon: ICONS.frame,
      title: 'Molduras Animadas',
      desc: 'Fogo, gelo, arco-íris, glitch. Bordas do avatar que vivem e respiram.',
    },
    {
      icon: ICONS.layers,
      title: 'Efeitos de Fundo',
      desc: 'Matrix rain, partículas flutuantes, CRT scanlines ou sua própria imagem/GIF.',
    },
    {
      icon: ICONS.star,
      title: 'Game of the Year',
      desc: 'Destaque o jogo que mais marcou você com uma seção exclusiva no seu perfil.',
    },
    {
      icon: ICONS.gamepad,
      title: 'Vitrine Própria',
      desc: 'Escolha quais jogos aparecem em destaque. Não fica mais limitado ao top por horas.',
    },
    {
      icon: ICONS.trophy,
      title: 'Conquistas',
      desc: 'Mostra automaticamente as conquistas do seu jogo favorito.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-x-hidden">
      <SnowCanvas opacity={0.45} />

      {/* ── HERO ── */}
      <section className="relative z-10 h-screen flex flex-col items-center justify-center px-6 select-none">
        <p
          className="animate-fade-up animate-delay-1 text-[10px] font-mono uppercase tracking-[0.5em] text-center mb-10"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          Identidade gamer. Reimaginada.
        </p>

        <h1
          className="animate-fade-up animate-delay-2 font-display leading-none tracking-tight text-center"
          style={{ fontSize: 'clamp(72px, 13vw, 128px)' }}
        >
          <span className="text-white" style={{ fontWeight: 200 }}>Steam</span>
          <span className="text-white" style={{ fontWeight: 900 }}>PFP</span>
        </h1>

        <div
          className="animate-fade-up animate-delay-3 my-9"
          style={{ width: 48, height: 1, background: 'rgba(255,255,255,0.1)' }}
        />

        <div className="animate-fade-up animate-delay-4">
          <button
            onClick={onLogin}
            className="group flex items-center gap-3 px-7 py-3.5 rounded-full border text-sm font-medium cursor-pointer transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.7)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
            }}
          >
            <ICONS.steam />
            Entrar com a Steam
          </button>
        </div>

        <div
          className="absolute bottom-10 flex flex-col items-center gap-2.5 scroll-bounce"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase">scroll</span>
          <ICONS.arrow />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8 }}
            className="mb-16 text-center"
          >
            <p
              className="text-[10px] font-mono uppercase tracking-[0.4em] mb-4"
              style={{ color: 'rgba(255,255,255,0.2)' }}
            >
              O que você pode criar
            </p>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-white leading-tight">
              Cada perfil é<br />
              <span style={{ color: 'rgba(255,255,255,0.35)' }}>um universo.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="p-6 rounded-2xl border group"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  borderColor: 'rgba(255,255,255,0.06)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}
                >
                  <f.icon />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THEMES PREVIEW ── */}
      <section className="relative z-10 py-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] font-mono uppercase tracking-[0.4em] text-center mb-10"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            13 temas — 10 grátis · 3 VIP
          </motion.p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.values(THEMES).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 px-3 py-2 rounded-full border text-xs"
                style={{
                  background: t.previewGradient,
                  borderColor: t.cardBorder,
                  color: t.textAccent,
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.primary }} />
                {t.name}
                {t.vip && <span className="text-[8px] font-bold text-black vip-badge-shine px-1 rounded-full">VIP</span>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-display font-black text-white mb-6 leading-tight">
            Comece agora.<br />
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>É de graça.</span>
          </h2>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full border text-sm font-medium cursor-pointer transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderColor: 'rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.8)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
            }}
          >
            <ICONS.steam />
            Entrar com a Steam
          </button>
          <p className="mt-4 text-[10px] font-mono tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>
            Sem senha. Login via Steam OpenID.
          </p>
        </motion.div>
      </section>

      <footer className="relative z-10 border-t py-6 text-center" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        <p className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.1)' }}>
          SteamPFP — Não afiliado à Valve Corporation
        </p>
      </footer>
    </div>
  );
}

// ======================== DASHBOARD ========================
function Dashboard({
  user, steamData, loadingProfile, activeTab, setActiveTab,
  theme, setTheme, activeTheme, customSlug, setCustomSlug,
  bio, setBio, bgEffect, setBgEffect, avatarFrame, setAvatarFrame,
  musicUrl, setMusicUrl, featuredGames, setFeaturedGames,
  gotyAppId, setGotyAppId, gotyNote, setGotyNote,
  showAchievements, setShowAchievements, showStatus, setShowStatus,
  hideHours, setHideHours, cardStyle, setCardStyle, layoutStyle, setLayoutStyle,
  profileBannerUrl, setProfileBannerUrl, accentColor, setAccentColor,
  showTotalGames, setShowTotalGames,
  isSaving, feedback, userIsVip, onSave, onLogout,
}) {
  const t = activeTheme;

  return (
    <div className="min-h-screen flex flex-col bg-[#050508]">
      <nav
        className="flex items-center justify-between px-5 py-3.5 border-b sticky top-0 z-40"
        style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="font-display font-black text-lg tracking-wider select-none">
          <span className="text-white font-light">Steam</span>
          <span style={{ color: t.primary }}>PFP</span>
        </div>
        <div className="flex items-center gap-3">
          {steamData && (
            <div className="hidden sm:flex items-center gap-2.5">
              <img src={steamData.avatar} alt="" className="w-7 h-7 rounded-lg object-cover opacity-90" />
              <span className="text-sm text-slate-300 font-medium truncate max-w-[130px]">{steamData.nickname}</span>
            </div>
          )}
          <a
            href={`/${customSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] px-3 py-1.5 rounded-lg border transition-all font-mono"
            style={{ borderColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.target.style.color = '#fff'; e.target.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.target.style.color = 'rgba(255,255,255,0.4)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            Ver perfil ↗
          </a>
          <button onClick={onLogout} className="text-[11px] font-mono cursor-pointer transition-colors" style={{ color: 'rgba(255,255,255,0.2)' }}
            onMouseEnter={e => e.target.style.color = '#f87171'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.2)'}
          >
            Sair
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* SIDEBAR */}
        <aside
          className="md:w-56 border-b md:border-b-0 md:border-r flex-shrink-0 p-4 flex flex-col"
          style={{ background: 'rgba(255,255,255,0.015)', borderColor: 'rgba(255,255,255,0.05)' }}
        >
          {/* User mini card */}
          {loadingProfile ? (
            <div className="mb-4 flex justify-center py-4">
              <div className="w-5 h-5 rounded-full border-t border-white/20 animate-spin" />
            </div>
          ) : steamData && (
            <div className="mb-4 p-3 rounded-xl border flex items-center gap-3"
              style={{ background: `rgba(${t.glowColor}, 0.05)`, borderColor: t.cardBorder }}>
              <AvatarDisplay src={steamData.avatar} frame={avatarFrame} theme={t} size={40} />
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">{steamData.nickname}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: t.textAccent }}>Lvl {steamData.level}</p>
              </div>
            </div>
          )}

          <nav className="space-y-0.5 flex-1">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer text-left"
                  style={active ? {
                    background: `rgba(${t.glowColor}, 0.1)`,
                    color: t.textAccent,
                    borderLeft: `2px solid ${t.primary}`,
                    paddingLeft: 10,
                  } : { color: 'rgba(255,255,255,0.3)' }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
                >
                  <span style={{ opacity: active ? 1 : 0.6 }}><tab.Icon /></span>
                  <span className="flex-1">{tab.label}</span>
                  {tab.vip && <VipTag />}
                </button>
              );
            })}
          </nav>

          {/* Save button */}
          <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <AnimatePresence>
              {feedback.message && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`text-xs p-2.5 rounded-lg border ${feedback.type === 'success' ? 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400' : 'bg-red-500/8 border-red-500/20 text-red-400'}`}
                >
                  {feedback.message}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
              style={{ background: isSaving ? 'rgba(255,255,255,0.05)' : t.primary, color: isSaving ? '#666' : '#000' }}
            >
              {isSaving ? 'Salvando...' : 'Salvar tudo'}
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-auto p-5 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
            >
              {activeTab === 'perfil'  && <TabPerfil customSlug={customSlug} setCustomSlug={setCustomSlug} bio={bio} setBio={setBio} steamData={steamData} avatarFrame={avatarFrame} activeTheme={t} />}
              {activeTab === 'tema'    && <TabTema theme={theme} setTheme={setTheme} userIsVip={userIsVip} />}
              {activeTab === 'fundo'   && <TabFundo bgEffect={bgEffect} setBgEffect={setBgEffect} profileBannerUrl={profileBannerUrl} setProfileBannerUrl={setProfileBannerUrl} activeTheme={t} userIsVip={userIsVip} />}
              {activeTab === 'moldura' && <TabMoldura avatarFrame={avatarFrame} setAvatarFrame={setAvatarFrame} steamData={steamData} activeTheme={t} userIsVip={userIsVip} />}
              {activeTab === 'jogos'   && <TabJogos user={user} steamData={steamData} featuredGames={featuredGames} setFeaturedGames={setFeaturedGames} gotyAppId={gotyAppId} setGotyAppId={setGotyAppId} gotyNote={gotyNote} setGotyNote={setGotyNote} activeTheme={t} userIsVip={userIsVip} />}
              {activeTab === 'display' && <TabDisplay showAchievements={showAchievements} setShowAchievements={setShowAchievements} showStatus={showStatus} setShowStatus={setShowStatus} hideHours={hideHours} setHideHours={setHideHours} cardStyle={cardStyle} setCardStyle={setCardStyle} layoutStyle={layoutStyle} setLayoutStyle={setLayoutStyle} accentColor={accentColor} setAccentColor={setAccentColor} showTotalGames={showTotalGames} setShowTotalGames={setShowTotalGames} activeTheme={t} userIsVip={userIsVip} />}
              {activeTab === 'musica'  && <TabMusica musicUrl={musicUrl} setMusicUrl={setMusicUrl} userIsVip={userIsVip} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// ======================== TAB: PERFIL ========================
function TabPerfil({ customSlug, setCustomSlug, bio, setBio, steamData, avatarFrame, activeTheme: t }) {
  return (
    <div className="max-w-lg space-y-7">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Seu Perfil</h2>
        <p className="text-xs text-slate-500">Link e bio da sua vitrine pública.</p>
      </div>

      <div>
        <SLabel>Link personalizado</SLabel>
        <div className="flex items-center rounded-xl border p-3 font-mono text-sm"
          style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }}>
          <span className="text-slate-500 flex-shrink-0 select-none">steampfp.com/</span>
          <input type="text" value={customSlug} onChange={e => setCustomSlug(e.target.value)}
            className="bg-transparent text-slate-200 focus:outline-none flex-1 min-w-0 ml-1" placeholder="seu_nick" />
        </div>
        <p className="text-[10px] font-mono text-slate-600 mt-1.5">Letras, números e underscore.</p>
      </div>

      <div>
        <SLabel>Bio</SLabel>
        <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={200} rows={3}
          placeholder="Uma frase sobre você ou seu estilo de jogo..."
          className="w-full rounded-xl border p-3 text-sm text-slate-200 focus:outline-none resize-none transition-colors"
          style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }} />
        <p className="text-[10px] font-mono text-slate-600 mt-1 text-right">{bio.length}/200</p>
      </div>

      {steamData && (
        <div className="rounded-xl border p-4" style={{ background: t.cardBg, borderColor: t.cardBorder }}>
          <SLabel>Preview</SLabel>
          <div className="flex items-center gap-4">
            <AvatarDisplay src={steamData.avatar} frame={avatarFrame} theme={t} size={60} />
            <div>
              <p className="font-bold text-white font-display text-lg leading-tight">{steamData.nickname}</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: t.textAccent }}>
                Nível {steamData.level} · Desde {steamData.timeCreated ? new Date(steamData.timeCreated * 1000).getFullYear() : 'N/A'}
              </p>
              {bio && <p className="text-xs text-slate-400 mt-1.5 italic line-clamp-2">"{bio}"</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ======================== TAB: TEMA ========================
function TabTema({ theme, setTheme, userIsVip }) {
  return (
    <div className="max-w-2xl space-y-7">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Temas</h2>
        <p className="text-xs text-slate-500">10 grátis · 3 exclusivos VIP</p>
      </div>

      {[false, true].map(isVip => (
        <div key={String(isVip)}>
          <SLabel>{isVip ? 'Exclusivos VIP' : 'Grátis para todos'}</SLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(THEMES).filter(t => t.vip === isVip).map(t => {
              const locked = t.vip && !userIsVip;
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => !locked && setTheme(t.id)}
                  disabled={locked}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all w-full ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'}`}
                  style={{
                    background: t.previewGradient,
                    borderColor: selected ? t.primary : 'rgba(255,255,255,0.07)',
                    outline: selected ? `2px solid ${t.primary}` : 'none',
                    boxShadow: selected ? `0 0 16px rgba(${t.glowColor}, 0.25)` : 'none',
                  }}
                >
                  <div className="flex items-center gap-1.5 w-full mb-2">
                    <span className="text-xs font-bold text-white truncate flex-1">{t.name}</span>
                    {t.vip && <VipTag />}
                  </div>
                  <div className="flex gap-1.5">
                    {[t.primary, t.secondary, t.accent].map((c, i) => (
                      <span key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ background: c }} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ======================== TAB: FUNDO ========================
function TabFundo({ bgEffect, setBgEffect, profileBannerUrl, setProfileBannerUrl, activeTheme: t, userIsVip }) {
  const effectMeta = {
    none: { label: 'Nenhum', icon: ICONS.x },
    scanlines: { label: 'Scanlines TV', icon: ICONS.layers },
    particles: { label: 'Partículas', icon: ICONS.star },
    matrix: { label: 'Matrix Rain', icon: ICONS.eye, vip: true },
    crt: { label: 'CRT Static', icon: ICONS.layers, vip: true },
    custom: { label: 'GIF / Imagem', icon: ICONS.frame, vip: true },
  };

  return (
    <div className="max-w-lg space-y-7">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Efeito de Fundo</h2>
        <p className="text-xs text-slate-500">Aparece atrás do perfil público.</p>
      </div>

      <div>
        <SLabel>Efeito</SLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BG_EFFECTS.map(effect => {
            const meta = effectMeta[effect.id] || {};
            const locked = effect.vip && !userIsVip;
            const selected = bgEffect === effect.id;
            const IconComp = meta.icon || ICONS.layers;
            return (
              <button
                key={effect.id}
                onClick={() => !locked && setBgEffect(effect.id)}
                disabled={locked}
                className={`flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-all cursor-pointer ${locked ? 'opacity-40 cursor-not-allowed' : ''}`}
                style={{
                  background: selected ? `rgba(${t.glowColor}, 0.1)` : 'rgba(255,255,255,0.02)',
                  borderColor: selected ? t.primary : 'rgba(255,255,255,0.07)',
                  outline: selected ? `1px solid ${t.primary}` : 'none',
                }}
              >
                <span style={{ color: selected ? t.primary : 'rgba(255,255,255,0.3)' }}><IconComp /></span>
                <span className="flex-1 font-medium text-slate-200">{meta.label || effect.name}</span>
                {effect.vip && <VipTag />}
              </button>
            );
          })}
        </div>
      </div>

      {bgEffect === 'custom' && (
        <div>
          <SLabel>URL do GIF ou Imagem (Fundo)</SLabel>
          <input type="url" placeholder="https://i.imgur.com/seu-gif.gif"
            className="w-full rounded-xl border p-3 text-sm text-slate-200 focus:outline-none font-mono"
            style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }} />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <SLabel>Banner do Perfil (topo)</SLabel>
          <VipTag />
        </div>
        {!userIsVip ? (
          <LockedFeature label="Banner personalizado no topo do perfil." />
        ) : (
          <>
            <input type="url" value={profileBannerUrl} onChange={e => setProfileBannerUrl(e.target.value)}
              placeholder="https://i.imgur.com/seu-banner.gif"
              className="w-full rounded-xl border p-3 text-sm text-slate-200 focus:outline-none font-mono"
              style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }} />
            <p className="text-[10px] text-slate-600 mt-1.5 font-mono">GIF/imagem que aparece no topo do perfil. Ideal: 1400×350px.</p>
          </>
        )}
      </div>
    </div>
  );
}

// ======================== TAB: MOLDURA ========================
function TabMoldura({ avatarFrame, setAvatarFrame, steamData, activeTheme: t, userIsVip }) {
  return (
    <div className="max-w-lg space-y-7">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Moldura do Avatar</h2>
        <p className="text-xs text-slate-500">Bordas animadas que dão vida ao seu avatar.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {AVATAR_FRAMES.map(f => {
          const locked = f.vip && !userIsVip;
          const selected = avatarFrame === f.id;
          return (
            <button
              key={f.id}
              onClick={() => !locked && setAvatarFrame(f.id)}
              disabled={locked}
              className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              style={{
                background: selected ? `rgba(${t.glowColor}, 0.1)` : 'rgba(255,255,255,0.02)',
                borderColor: selected ? t.primary : 'rgba(255,255,255,0.07)',
                outline: selected ? `1px solid ${t.primary}` : 'none',
              }}
            >
              <div style={{ '--glow': `rgba(${t.glowColor}, 0.5)`, '--frame-color': t.primary }}>
                <AvatarDisplay src={steamData?.avatar} frame={f.id} theme={t} size={48} />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-slate-200">{f.name}</span>
                {f.vip && <VipTag />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ======================== TAB: JOGOS ========================
function TabJogos({ user, steamData, featuredGames, setFeaturedGames, gotyAppId, setGotyAppId, gotyNote, setGotyNote, activeTheme: t, userIsVip }) {
  const [library, setLibrary] = useState([]);
  const [loadingLib, setLoadingLib] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setLoadingLib(true);
    axios.get(`${API}/api/steam/games/${user.id}`)
      .then(r => { if (r.data.success) setLibrary(r.data.games); })
      .finally(() => setLoadingLib(false));
  }, [user]);

  const maxFeatured = userIsVip ? 10 : 5;
  const filtered = library.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  const toggleFeatured = (appId) => {
    const id = String(appId);
    setFeaturedGames(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= maxFeatured) return prev;
      return [...prev, id];
    });
  };

  const gotyGame = library.find(g => String(g.appId) === String(gotyAppId));

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Jogos em Destaque</h2>
        <p className="text-xs text-slate-500">Escolha quais jogos aparecem no seu perfil público. Máx: {maxFeatured}.</p>
      </div>

      {loadingLib ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 rounded-full border-t border-white/20 animate-spin" style={{ borderTopColor: t.primary }} />
        </div>
      ) : (
        <>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <SLabel>Selecionados ({featuredGames.length}/{maxFeatured})</SLabel>
              {featuredGames.length > 0 && (
                <button onClick={() => setFeaturedGames([])} className="text-[10px] font-mono text-slate-500 hover:text-red-400 transition-colors">
                  Limpar
                </button>
              )}
            </div>

            {featuredGames.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {featuredGames.map(id => {
                  const g = library.find(g => String(g.appId) === id);
                  if (!g) return null;
                  return (
                    <div key={id} className="flex items-center gap-1.5 pl-2 pr-1 py-1 rounded-lg border text-xs"
                      style={{ background: `rgba(${t.glowColor}, 0.08)`, borderColor: t.cardBorder, color: t.textAccent }}>
                      {g.iconUrl && <img src={g.iconUrl} alt="" className="w-4 h-4 rounded" onError={e => e.target.style.display='none'} />}
                      <span className="max-w-[100px] truncate">{g.name}</span>
                      <button onClick={() => toggleFeatured(id)} className="ml-1 opacity-50 hover:opacity-100 transition-opacity" style={{ color: t.primary }}>
                        <ICONS.x />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="relative mb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><ICONS.search /></span>
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar na biblioteca..."
                className="w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none font-mono"
                style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }} />
            </div>

            <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
              {filtered.slice(0, 50).map(g => {
                const id = String(g.appId);
                const selected = featuredGames.includes(id);
                const disabled = !selected && featuredGames.length >= maxFeatured;
                return (
                  <button
                    key={id}
                    onClick={() => !disabled && toggleFeatured(id)}
                    disabled={disabled}
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{
                      background: selected ? `rgba(${t.glowColor}, 0.08)` : 'rgba(255,255,255,0.02)',
                      borderColor: selected ? t.primary : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {g.iconUrl ? (
                      <img src={g.iconUrl} alt="" className="w-8 h-8 rounded flex-shrink-0" onError={e => e.target.style.display='none'} />
                    ) : (
                      <div className="w-8 h-8 rounded flex-shrink-0 bg-white/5" />
                    )}
                    <span className="flex-1 text-sm text-slate-200 truncate">{g.name}</span>
                    <span className="text-[10px] font-mono text-slate-500 flex-shrink-0">{g.playtime}h</span>
                    {selected && <span style={{ color: t.primary }}><ICONS.check /></span>}
                  </button>
                );
              })}
              {filtered.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-6 font-mono">Nenhum jogo encontrado</p>
              )}
            </div>
          </div>

          {/* GOTY */}
          <div>
            <SLabel>Game of the Year</SLabel>
            <p className="text-xs text-slate-500 mb-3">Um destaque especial na sua vitrine.</p>

            {gotyGame ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border mb-3"
                style={{ background: `rgba(${t.glowColor}, 0.06)`, borderColor: t.cardBorder }}>
                <img src={gotyGame.headerUrl} alt="" className="w-20 h-12 object-cover rounded-lg"
                  onError={e => e.target.style.display='none'} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{gotyGame.name}</p>
                  <p className="text-[10px] font-mono mt-0.5" style={{ color: t.textAccent }}>{gotyGame.playtime}h registradas</p>
                </div>
                <button onClick={() => setGotyAppId('')} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"><ICONS.x /></button>
              </div>
            ) : (
              <div className="relative mb-3">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><ICONS.star /></span>
                <select
                  value={gotyAppId}
                  onChange={e => setGotyAppId(e.target.value)}
                  className="w-full rounded-xl border pl-9 pr-3 py-2.5 text-sm text-slate-200 focus:outline-none appearance-none cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <option value="">— Escolher GOTY —</option>
                  {library.slice(0, 100).map(g => (
                    <option key={g.appId} value={g.appId}>{g.name} ({g.playtime}h)</option>
                  ))}
                </select>
              </div>
            )}

            <textarea value={gotyNote} onChange={e => setGotyNote(e.target.value)} maxLength={150} rows={2}
              placeholder='Por que esse jogo foi especial para você...'
              className="w-full rounded-xl border p-3 text-sm text-slate-200 focus:outline-none resize-none"
              style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }} />
            <p className="text-[10px] font-mono text-slate-600 text-right mt-1">{gotyNote.length}/150</p>
          </div>
        </>
      )}
    </div>
  );
}

// ======================== TAB: DISPLAY ========================
function TabDisplay({
  showAchievements, setShowAchievements, showStatus, setShowStatus,
  hideHours, setHideHours, cardStyle, setCardStyle, layoutStyle, setLayoutStyle,
  accentColor, setAccentColor, showTotalGames, setShowTotalGames,
  activeTheme: t, userIsVip,
}) {
  const Toggle = ({ label, desc, value, onChange }) => (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div>
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-11 h-6 rounded-full transition-all cursor-pointer flex-shrink-0 ml-4"
        style={{ background: value ? t.primary : 'rgba(255,255,255,0.1)' }}
      >
        <span className="absolute top-0.5 transition-all duration-200 w-5 h-5 rounded-full bg-white shadow-sm"
          style={{ left: value ? '1.375rem' : '0.125rem' }} />
      </button>
    </div>
  );

  const cardStyles = [
    { id: 'default', label: 'Padrão' },
    { id: 'glass', label: 'Glass', vip: true },
    { id: 'minimal', label: 'Minimal' },
    { id: 'solid', label: 'Sólido' },
  ];
  const layoutStyles = [
    { id: 'standard', label: 'Padrão' },
    { id: 'centered', label: 'Centralizado' },
    { id: 'compact', label: 'Compacto' },
  ];

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">Display</h2>
        <p className="text-xs text-slate-500">O que aparece e como aparece no seu perfil.</p>
      </div>

      <div>
        <SLabel>Visibilidade</SLabel>
        <Toggle label="Status Online" desc="Mostra se você está online, ausente ou jogando." value={showStatus} onChange={setShowStatus} />
        <Toggle label="Conquistas" desc="Exibe conquistas do seu jogo mais jogado." value={showAchievements} onChange={setShowAchievements} />
        <Toggle label="Total de Jogos" desc="Exibe contador total de jogos na Steam." value={showTotalGames} onChange={setShowTotalGames} />
        <Toggle label="Esconder Horas" desc="Oculta as horas jogadas de cada jogo." value={hideHours} onChange={setHideHours} />
      </div>

      <div>
        <SLabel>Estilo dos Cards</SLabel>
        <div className="grid grid-cols-2 gap-2">
          {cardStyles.map(cs => {
            const locked = cs.vip && !userIsVip;
            const selected = cardStyle === cs.id;
            return (
              <button key={cs.id} onClick={() => !locked && setCardStyle(cs.id)} disabled={locked}
                className={`p-3 rounded-xl border text-sm text-left transition-all ${locked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  background: selected ? `rgba(${t.glowColor}, 0.1)` : 'rgba(255,255,255,0.02)',
                  borderColor: selected ? t.primary : 'rgba(255,255,255,0.07)',
                }}>
                <span className="font-medium text-slate-200">{cs.label}</span>
                {cs.vip && <VipTag />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SLabel>Layout</SLabel>
        <div className="grid grid-cols-3 gap-2">
          {layoutStyles.map(ls => (
            <button key={ls.id} onClick={() => setLayoutStyle(ls.id)}
              className="p-3 rounded-xl border text-sm text-center transition-all cursor-pointer"
              style={{
                background: layoutStyle === ls.id ? `rgba(${t.glowColor}, 0.1)` : 'rgba(255,255,255,0.02)',
                borderColor: layoutStyle === ls.id ? t.primary : 'rgba(255,255,255,0.07)',
                color: layoutStyle === ls.id ? t.textAccent : 'rgba(255,255,255,0.5)',
              }}>
              {ls.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <SLabel>Cor de Destaque Personalizada</SLabel>
          <VipTag />
        </div>
        {!userIsVip ? (
          <LockedFeature label="Sobrescreva a cor de destaque do tema com qualquer cor." />
        ) : (
          <div className="flex items-center gap-3">
            <input type="color" value={accentColor || t.primary} onChange={e => setAccentColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
            <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)}
              placeholder={t.primary}
              className="flex-1 rounded-xl border p-2.5 text-sm text-slate-200 focus:outline-none font-mono"
              style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }} />
            {accentColor && <button onClick={() => setAccentColor('')} className="text-slate-500 hover:text-red-400 transition-colors"><ICONS.x /></button>}
          </div>
        )}
      </div>
    </div>
  );
}

// ======================== TAB: MUSICA ========================
function TabMusica({ musicUrl, setMusicUrl, userIsVip }) {
  return (
    <div className="max-w-lg space-y-7">
      <div>
        <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
          Player de Música
          <VipTag />
        </h2>
        <p className="text-xs text-slate-500">Quem visitar seu perfil pode tocar a música.</p>
      </div>

      {!userIsVip ? (
        <LockedFeature label="Adicione uma música de fundo ao seu perfil. Suporte a YouTube e links de áudio direto." />
      ) : (
        <div>
          <SLabel>Link do YouTube ou URL de Áudio</SLabel>
          <input type="url" value={musicUrl} onChange={e => setMusicUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full rounded-xl border p-3 text-sm text-slate-200 focus:outline-none font-mono"
            style={{ background: 'rgba(0,0,0,0.4)', borderColor: 'rgba(255,255,255,0.08)' }} />
          <p className="text-[10px] text-slate-600 mt-1.5 font-mono">YouTube · SoundCloud embed · link .mp3 direto</p>
        </div>
      )}
    </div>
  );
}

// ======================== HELPERS ========================
function LockedFeature({ label }) {
  return (
    <div className="rounded-xl border p-5 text-center" style={{ background: 'rgba(217,119,6,0.04)', borderColor: 'rgba(217,119,6,0.15)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-3"
        style={{ background: 'rgba(217,119,6,0.1)', color: '#d97706' }}>
        <ICONS.trophy />
      </div>
      <p className="text-sm font-bold text-yellow-400 mb-1.5">Recurso VIP</p>
      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">{label}</p>
      <p className="mt-4 text-[10px] font-mono text-yellow-400/40 border border-yellow-500/15 inline-block px-3 py-1.5 rounded-full">
        Em breve: steampfp.com/vip
      </p>
    </div>
  );
}
