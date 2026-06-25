import { supabase } from './supabase.js';
import express from 'express';
import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import session from 'express-session';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const isCrossOriginDeploy = clientUrl.startsWith('https://') && !clientUrl.includes('localhost');

const allowedOrigins = [
  clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// CORS manual — mais confiável atrás do proxy do Hugging Face
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'steampfp_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: isCrossOriginDeploy ? 'none' : 'lax',
    secure: isCrossOriginDeploy,
  },
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

passport.use(new SteamStrategy({
  returnURL: `${SERVER_URL}/api/auth/steam/return`,
  realm: SERVER_URL,
  apiKey: process.env.STEAM_API_KEY,
}, async (identifier, profile, done) => {
  try {
    const steamId = profile.id;
    const nickname = profile.displayName;
    const avatar = profile.photos?.[2]?.value || profile.photos?.[0]?.value || '';

    const defaultSlug = nickname.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

    const { data: existing } = await supabase.schema('public').from('profiles')
      .select('custom_slug').eq('id', steamId).single();

    await supabase.schema('public').from('profiles').upsert({
      id: steamId,
      nickname,
      avatar,
      custom_slug: existing?.custom_slug || defaultSlug || `user_${steamId.slice(-6)}`,
    }, { onConflict: 'id' });

    profile.identifier = identifier;
    return done(null, profile);
  } catch (err) {
    return done(err, null);
  }
}));

// ==========================================
// AUTH
// ==========================================

app.get('/api/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {});

app.get('/api/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => res.redirect(process.env.CLIENT_URL || 'http://localhost:5173')
);

app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) res.json({ success: true, user: req.user });
  else res.status(401).json({ success: false });
});

app.get('/api/auth/logout', (req, res) => {
  req.logout(() => res.redirect(process.env.CLIENT_URL || 'http://localhost:5173'));
});

// ==========================================
// PROFILE/ME — fresh from Supabase (fixes state persistence)
// ==========================================

app.get('/api/profile/me', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ success: false });

  const { data, error } = await supabase.schema('public').from('profiles')
    .select('id, nickname, avatar, custom_slug, theme, bio, bg_effect, avatar_frame, music_url, is_vip, featured_games, goty_appid, goty_note, show_achievements, show_status, hide_hours, card_style, layout_style, profile_banner_url, accent_color, show_total_games')
    .eq('id', req.user.id).single();

  if (error || !data) return res.status(404).json({ success: false, message: 'Perfil não encontrado.' });
  res.json({ success: true, profile: data });
});

// ==========================================
// SALVAR CUSTOMIZAÇÕES
// ==========================================

app.post('/api/profile/save', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ success: false, message: 'Não autorizado.' });

  const steamId = req.user.id;
  const {
    theme, custom_slug, bio, bg_effect, avatar_frame, music_url,
    featured_games, goty_appid, goty_note,
    show_achievements, show_status, hide_hours,
    card_style, layout_style, profile_banner_url, accent_color, show_total_games,
  } = req.body;

  if (!custom_slug) return res.status(400).json({ success: false, message: 'Slug obrigatório.' });

  const cleanSlug = custom_slug.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

  const updateData = {
    id: steamId,
    custom_slug: cleanSlug,
    nickname: req.user.displayName || '',
    avatar: req.user.photos?.[2]?.value || req.user.photos?.[0]?.value || '',
  };

  const optionalFields = {
    theme, bio, bg_effect, avatar_frame, music_url,
    featured_games: featured_games ? JSON.stringify(featured_games) : undefined,
    goty_appid, goty_note,
    show_achievements, show_status, hide_hours,
    card_style, layout_style, profile_banner_url, accent_color, show_total_games,
  };

  Object.entries(optionalFields).forEach(([k, v]) => {
    if (v !== undefined) updateData[k] = v;
  });

  try {
    const { error } = await supabase.schema('public').from('profiles')
      .upsert(updateData, { onConflict: 'id' });

    if (error) {
      if (error.code === '23505' || error.message?.includes('profiles_custom_slug_key')) {
        return res.status(400).json({ success: false, message: 'Este link já está em uso por outro jogador!' });
      }
      throw error;
    }

    res.json({ success: true, message: 'Salvo!', actual_slug: cleanSlug });
  } catch (err) {
    console.error('Erro ao salvar:', err.message);
    res.status(500).json({ success: false, message: 'Erro interno ao salvar.' });
  }
});

// ==========================================
// STEAM DATA (DASHBOARD)
// ==========================================

app.get('/api/steam/profile/:steamId', async (req, res) => {
  const { steamId } = req.params;
  const key = process.env.STEAM_API_KEY;
  try {
    const [pRes, lRes] = await Promise.all([
      axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`),
      axios.get(`https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${key}&steamid=${steamId}`),
    ]);
    const p = pRes.data.response.players[0];
    res.json({
      success: true,
      data: {
        nickname: p.personaname,
        avatar: p.avatarfull,
        profileUrl: p.profileurl,
        timeCreated: p.timecreated,
        level: lRes.data.response.player_level,
        personastate: p.personastate,
        gameextrainfo: p.gameextrainfo || null,
        gameid: p.gameid || null,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao obter dados da Steam.' });
  }
});

// Biblioteca completa do usuário (para seletor de jogos)
app.get('/api/steam/games/:steamId', async (req, res) => {
  if (!req.isAuthenticated() || req.user.id !== req.params.steamId) {
    return res.status(401).json({ success: false, message: 'Não autorizado.' });
  }
  const key = process.env.STEAM_API_KEY;
  try {
    const gRes = await axios.get(
      `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${req.params.steamId}&format=json&include_appinfo=true&include_played_free_games=true`
    );
    const games = (gRes.data.response.games || [])
      .sort((a, b) => b.playtime_forever - a.playtime_forever)
      .map(g => ({
        appId: g.appid,
        name: g.name,
        playtime: Math.round(g.playtime_forever / 60),
        iconUrl: g.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
          : null,
        headerUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      }));
    res.json({ success: true, games });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erro ao buscar biblioteca.' });
  }
});

// ==========================================
// PERFIL PÚBLICO
// ==========================================

app.get('/api/profile/public/:slug', async (req, res) => {
  const { slug } = req.params;
  const key = process.env.STEAM_API_KEY;

  try {
    const { data: profile, error } = await supabase.schema('public').from('profiles')
      .select('id, nickname, avatar, theme, custom_slug, bio, bg_effect, avatar_frame, music_url, is_vip, featured_games, goty_appid, goty_note, show_achievements, show_status, hide_hours, card_style, layout_style, profile_banner_url, accent_color, show_total_games')
      .eq('custom_slug', slug).single();

    if (error || !profile) {
      return res.status(404).json({ success: false, message: 'Jogador não encontrado no SteamPFP.' });
    }

    const steamId = profile.id;
    const featuredIds = profile.featured_games ? JSON.parse(profile.featured_games) : null;

    const [pRes, lRes, gRes] = await Promise.all([
      axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`),
      axios.get(`https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${key}&steamid=${steamId}`),
      axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${key}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`),
    ]);

    const steamData = pRes.data.response.players[0];
    const level = lRes.data.response.player_level;
    const allGames = gRes.data.response.games || [];
    const totalGames = gRes.data.response.game_count || allGames.length;

    const mapGame = g => ({
      appId: g.appid,
      name: g.name,
      playtime: Math.round(g.playtime_forever / 60),
      iconUrl: g.img_icon_url
        ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
        : null,
      recentHours: g.playtime_2weeks ? Math.round(g.playtime_2weeks / 60) : null,
    });

    let topGames;
    if (featuredIds && featuredIds.length > 0) {
      topGames = featuredIds
        .map(id => allGames.find(g => String(g.appid) === String(id)))
        .filter(Boolean)
        .map(mapGame);
    } else {
      const maxGames = profile.is_vip ? 10 : 5;
      topGames = allGames
        .sort((a, b) => b.playtime_forever - a.playtime_forever)
        .slice(0, maxGames)
        .map(mapGame);
    }

    // Achievements for featured or most played game
    let achievements = [];
    let achievementsGame = null;
    const achievementsEnabled = profile.show_achievements !== false;
    if (achievementsEnabled && topGames.length > 0) {
      const targetAppId = topGames[0].appId;
      try {
        const achRes = await axios.get(
          `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${targetAppId}&key=${key}&steamid=${steamId}`
        );
        if (achRes.data.playerstats?.achievements) {
          const schemaRes = await axios.get(
            `https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v0002/?key=${key}&appid=${targetAppId}&l=portuguese`
          ).catch(() => null);

          const schema = schemaRes?.data?.game?.availableGameStats?.achievements || [];
          const schemaMap = Object.fromEntries(schema.map(a => [a.name, a]));

          achievements = achRes.data.playerstats.achievements
            .sort((a, b) => b.unlocktime - a.unlocktime)
            .slice(0, 12)
            .map(a => {
              const s = schemaMap[a.apiname] || {};
              return {
                name: s.displayName || a.apiname,
                description: s.description || '',
                icon: a.achieved ? s.icon : s.icongray,
                achieved: !!a.achieved,
              };
            });
          achievementsGame = topGames[0].name;
        }
      } catch (_) {}
    }

    // GOTY data
    let goty = null;
    if (profile.goty_appid) {
      const gotyGame = allGames.find(g => String(g.appid) === String(profile.goty_appid));
      goty = {
        appId: profile.goty_appid,
        name: gotyGame?.name || 'Meu GOTY',
        note: profile.goty_note || null,
      };
    }

    res.json({
      success: true,
      profile: {
        steamId,
        nickname: steamData.personaname,
        avatar: steamData.avatarfull,
        profileUrl: steamData.profileurl,
        level,
        timeCreated: steamData.timecreated,
        personastate: steamData.personastate,
        gameextrainfo: steamData.gameextrainfo || null,
        gameid: steamData.gameid || null,
        theme: profile.theme,
        custom_slug: profile.custom_slug,
        bio: profile.bio || null,
        bg_effect: profile.bg_effect || 'none',
        avatar_frame: profile.avatar_frame || 'none',
        music_url: profile.music_url || null,
        is_vip: profile.is_vip || false,
        card_style: profile.card_style || 'default',
        layout_style: profile.layout_style || 'standard',
        profile_banner_url: profile.profile_banner_url || null,
        accent_color: profile.accent_color || null,
        show_status: profile.show_status !== false,
        hide_hours: profile.hide_hours || false,
        show_total_games: profile.show_total_games !== false,
        topGames,
        totalGames,
        achievements,
        achievementsGame,
        goty,
      },
    });
  } catch (err) {
    console.error('Erro no perfil público:', err.message);
    res.status(500).json({ success: false, message: 'Erro interno.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SteamPFP Backend na porta ${PORT}`);
});
