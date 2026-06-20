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
const PORT = process.env.PORT || 5000;

// ==========================================
// 1. CONFIGURAÇÕES INICIAIS (MIDDLEWARES)
// ==========================================

// Permite que o frontend (Vite/React) acesse o backend sem problemas de CORS
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));

app.use(express.json());

// Configuração da sessão (necessária para o Passport manter o login do usuário)
app.use(session({
    secret: process.env.SESSION_SECRET || 'cybersteam_secret_key_123',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // Mantém logado por 1 dia
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
// 2. CONFIGURAÇÃO DO PASSPORT STEAM (OPENID)
// ==========================================

passport.use(new SteamStrategy({
    returnURL: `${process.env.SERVER_URL}/api/auth/steam/return`,
    realm: process.env.SERVER_URL,
    apiKey: process.env.STEAM_API_KEY
}, (identifier, profile, done) => {
    // Aqui a Steam retorna o perfil do usuário autenticado de forma segura
    process.nextTick(() => {
        profile.identifier = identifier;
        return done(null, profile);
    });
}));

// ==========================================
// 3. ROTAS DE AUTENTICAÇÃO (LOGIN / LOGOUT)
// ==========================================

// Rota inicial que o usuário clica para ir até a página de login oficial da Steam
app.get('/api/auth/steam', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {
    // Redirecionamento automático gerenciado pelo Passport
});

// Rota de retorno que a Steam chama após o usuário logar com sucesso lá no site deles
app.get('/api/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/' }), (req, res) => {
    // Redireciona de volta para a nossa plataforma (Frontend)
    res.redirect(process.env.CLIENT_URL);
});

// Rota para verificar se o usuário está logado e mandar os dados dele para o Frontend
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

// Rota para deslogar
app.get('/api/auth/logout', (req, res) => {
    req.logout(() => {
        res.redirect(process.env.CLIENT_URL);
    });
});

// ==========================================
// 4. ROTA DE CONSUMO DIRETO DA STEAM API (TESTE)
// ==========================================
// Exemplo de rota que puxa as informações detalhadas e o nível da conta usando o ID da Steam
app.get('/api/steam/profile/:steamId', async (req, res) => {
    const { steamId } = req.params;
    const apiKey = process.env.STEAM_API_KEY;

    try {
        // Puxa o sumário do perfil (nome, avatar, status online, etc)
        const profileResponse = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}`);
        
        // Puxa o nível da conta Steam do jogador
        const levelResponse = await axios.get(`http://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${steamId}`);

        const profileData = profileResponse.data.response.players[0];
        const levelData = levelResponse.data.response.player_level;

        // Junta tudo e responde com as informações limpas e unificadas
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

// Inicialização do servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor CYBERSTEAM rodando na porta ${PORT}`);
});