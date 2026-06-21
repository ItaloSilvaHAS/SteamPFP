import { supabase } from './supabase.js';
import express from 'express';
import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import session from 'express-session';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// IMPORTANTE PARA DEPLOY: Hugging Face Spaces e Replit exigem process.env.PORT
const PORT = process.env.PORT || 5000;

// Configuração obrigatória para rodar atrás de proxies reversos na nuvem (Hugging Face / Cloudflare / Vercel)
app.set('trust proxy', 1);

// ==========================================
// 1. CONFIGURAÇÕES INICIAIS (MIDDLEWARES)
// ==========================================

// Permite que o frontend (Vercel) acesse o backend sem problemas de CORS
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
    origin: function (origin, callback) {
        // Permite requisições sem origem (como aplicativos mobile ou curl) ou que estejam na lista permitida
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Bloqueado pelo CORS do CyberSteam'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Configuração da sessão adaptada para HTTPS/Nuvem de forma segura
app.use(session({
    secret: process.env.SESSION_SECRET || 'cybersteam_secret_key_123',
    resave: false, 
    saveUninitialized: false, 
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // Mantém logado por 1 dia
        httpOnly: true, 
        // Se estiver rodando em ambiente de produção (HTTPS), ajusta os parâmetros para evitar rejeição de cookie cross-site
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', 
        secure: process.env.NODE_ENV === 'production' // Ativa true automaticamente se estiver na nuvem com HTTPS
    }
}));

// Inicializa o Passport no servidor
app.use(passport.initialize());
app.use(passport.session());

// Serialization do usuário para a sessão
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// ==========================================
// 2. CONFIGURAÇÃO DO PASSPORT STEAM (OPENID + SUPABASE)
// ==========================================

const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

passport.use(new SteamStrategy({
    returnURL: `${SERVER_URL}/api/auth/steam/return`,
    realm: SERVER_URL,
    apiKey: process.env.STEAM_API_KEY
}, async (identifier, profile, done) => {
    try {
        const steamId = profile.id;
        const nickname = profile.displayName;
        const avatar = profile.photos?.[2]?.value || profile.photos?.[0]?.value || '';

        // Cria um slug limpo
        const defaultSlug = nickname.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") 
            .replace(/[^a-z0-9_]/g, '_')     
            .replace(/_+/g, '_')            
            .replace(/^_+|_+$/g, '');        

        // Salva ou atualiza os dados no schema público (CORRIGIDO: Sem .usingAnonymously())
        const { error } = await supabase
            .schema('public')
            .from('profiles')
            .upsert({ 
                id: steamId, 
                nickname: nickname, 
                avatar: avatar,
                custom_slug: defaultSlug || `user_${steamId.slice(-6)}` 
            }, { onConflict: 'id' });

        if (error) {
            console.error("❌ Erro ao persistir dados no Supabase:", error.message);
        } else {
            console.log(`✅ Usuário ${nickname} sincronizado com o banco de dados!`);
        }

        profile.identifier = identifier;
        return done(null, profile);
    } catch (err) {
        console.error("❌ Erro interno no processo de sincronização de login:", err.message);
        return done(err, null);
    }
}));

// ==========================================
// 3. ROTAS DE AUTENTICAÇÃO (LOGIN / LOGOUT)
// ==========================================

app.get('/api/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {});

app.get('/api/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {
    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(CLIENT_URL);
});

app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({
            success: true,
            user: req.user
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Usuário não autenticado."
        });
    }
});

app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
        const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
        res.redirect(CLIENT_URL);
    });
});

// ==========================================
// 4. ROTA PARA SALVAR CUSTOMIZAÇÕES DO PERFIL
// ==========================================
app.post('/api/profile/save', async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ success: false, message: "Não autorizado." });
    }

    const steamId = req.user.id;
    const { theme, custom_slug } = req.body;

    if (!theme || !custom_slug) {
        return res.status(400).json({ success: false, message: "Dados incompletos." });
    }

    const cleanSlug = custom_slug.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9_]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');

    try {
        const { error } = await supabase
            .schema('public')
            .from('profiles')
            .upsert({ 
                id: steamId,
                theme: theme, 
                custom_slug: cleanSlug,
                nickname: req.user.displayName || '',
                avatar: req.user.photos?.[2]?.value || req.user.photos?.[0]?.value || ''
            }, { onConflict: 'id' });

        if (error) {
            if (error.code === '23505' || error.message?.includes('profiles_custom_slug_key')) { 
                return res.status(400).json({ 
                    success: false, 
                    message: "Este link personalizado já está sendo usado por outro jogador!" 
                });
            }
            throw error;
        }

        res.json({ success: true, message: "Customização salva com sucesso!", actual_slug: cleanSlug });

    } catch (error) {
        console.error("❌ Erro ao salvar customização:", error.message);
        res.status(500).json({ success: false, message: "Erro interno ao salvar no banco de dados." });
    }
});

// ==========================================
// 5. ROTA DE CONSUMO DIRETO DA STEAM API
// ==========================================
app.get('/api/steam/profile/:steamId', async (req, res) => {
    const { steamId } = req.params;
    const apiKey = process.env.STEAM_API_KEY;

    try {
        const profileResponse = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`);
        const levelResponse = await axios.get(`https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamId}`);

        const profileData = profileResponse.data.response.players[0];
        const levelData = levelResponse.data.response.player_level;

        res.json({
            success: true,
            data: {
                nickname: profileData.personaname,
                avatar: profileData.avatarfull,
                profileUrl: profileData.profileurl,
                timeCreated: profileData.timecreated,
                level: levelData
            }
        });

    } catch (error) {
        console.error("Erro ao consumir a API da Steam:", error.message);
        res.status(500).json({
            success: false,
            message: "Erro ao obter dados do perfil da Steam."
        });
    }
});

// ==========================================
// 6. ROTA PÚBLICA: BUSCAR PERFIL + JOGOS + CONQUISTAS
// ==========================================
app.get('/api/profile/public/:slug', async (req, res) => {
    const { slug } = req.params;
    const apiKey = process.env.STEAM_API_KEY;

    try {
        const { data: profile, error } = await supabase
            .schema('public')
            .from('profiles')
            .select('id, nickname, avatar, theme, custom_slug')
            .eq('custom_slug', slug)
            .single();

        if (error || !profile) {
            return res.status(404).json({ 
                success: false, 
                message: "Jogador não encontrado no banco de dados do CyberSteam." 
            });
        }

        const steamId = profile.id;

        const [profileResponse, levelResponse, gamesResponse] = await Promise.all([
            axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`),
            axios.get(`https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamId}`),
            axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`)
        ]);

        const steamData = profileResponse.data.response.players[0];
        const levelData = levelResponse.data.response.player_level;
        
        const allGames = gamesResponse.data.response.games || [];
        const topGames = allGames
            .sort((a, b) => b.playtime_forever - a.playtime_forever)
            .slice(0, 5)
            .map(game => ({
                appId: game.appid,
                name: game.name,
                playtime: Math.round(game.playtime_forever / 60), 
                iconUrl: `https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`
            }));

        res.json({
            success: true,
            profile: {
                steamId: profile.id,
                nickname: steamData.personaname,
                avatar: steamData.avatarfull,
                profileUrl: steamData.profileurl,
                level: levelData,
                timeCreated: steamData.timecreated,
                theme: profile.theme,
                custom_slug: profile.custom_slug,
                topGames: topGames 
            }
        });

    } catch (error) {
        console.error("❌ Erro ao renderizar perfil público:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "Erro interno ao buscar dados públicos do jogador." 
        });
    }
});

// OBRIGATÓRIO PARA CLOUD DEPLOYS: Ouvir em '0.0.0.0'
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor CYBERSTEAM rodando na porta ${PORT}`);
});