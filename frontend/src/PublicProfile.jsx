import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

function PublicProfile() {
  const { slug } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/profile/public/${slug}`)
      .then(res => {
        if (res.data.success) {
          setProfileData(res.data.profile);
        } else {
          setError(res.data.message || 'Perfil não encontrado.');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Erro ao carregar vitrine.');
        setLoading(false);
      });
  }, [slug]);

  // Configuração de cores dinâmicas e efeitos visuais baseados no tema ativo
  const themeStyles = {
    cyberpunk: {
      card: "border-blue-500/30 shadow-blue-950/20",
      line: "from-transparent via-blue-500 to-transparent",
      text: "text-blue-400",
      glow: "from-blue-500 to-indigo-500"
    },
    goth: {
      card: "border-purple-900/50 shadow-none",
      line: "from-transparent via-purple-800 to-transparent",
      text: "text-purple-500",
      glow: "from-purple-900 to-zinc-800"
    },
    vaporwave: {
      card: "border-pink-500/30 shadow-pink-950/10",
      line: "from-transparent via-pink-500 to-transparent",
      text: "text-pink-400",
      glow: "from-pink-500 to-purple-500"
    },
    matrix: {
      card: "border-green-500/30 shadow-green-950/20",
      line: "from-transparent via-green-500 to-transparent",
      text: "text-green-400",
      glow: "from-green-500 to-emerald-600"
    },
    blood: {
      card: "border-red-600/30 shadow-red-950/20",
      line: "from-transparent via-red-600 to-transparent",
      text: "text-red-500",
      glow: "from-red-600 to-rose-700"
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0a0c] text-red-400 p-4 text-center font-mono">
        <h1 className="text-2xl font-black mb-2">404 // MATRIX_ERROR</h1>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  const activeStyle = themeStyles[profileData.theme] || themeStyles.cyberpunk;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans p-6 md:p-12 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* CARD PRINCIPAL COM TEMA DINÂMICO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative overflow-hidden bg-gradient-to-b from-[#14141b] to-[#0d0d11] border rounded-2xl p-6 shadow-2xl transition-all duration-300 ${activeStyle.card}`}
        >
          <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${activeStyle.line}`} />
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${activeStyle.glow} rounded-xl blur opacity-60`} />
              <img 
                src={profileData.avatar} 
                alt="Profile Avatar" 
                className="relative w-24 h-24 rounded-xl object-cover border border-black"
              />
            </div>

            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-black text-white tracking-wide font-mono">{profileData.nickname}</h2>
              <p className={`text-xs font-mono mt-1 ${activeStyle.text}`}>USER PROFILE // VERIFIED</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                <div className="bg-[#171721] border border-slate-800 px-3 py-1.5 rounded-lg text-center min-w-[70px]">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Nível</span>
                  <span className={`text-sm font-black font-mono ${activeStyle.text}`}>{profileData.level}</span>
                </div>
                <div className="bg-[#171721] border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Membro desde</span>
                  <span className="text-sm font-medium text-slate-300 font-mono">
                    {profileData.timeCreated ? new Date(profileData.timeCreated * 1000).toLocaleDateString('pt-BR') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* VITRINE DE EXIBIÇÃO: SEUS JOGOS EM ALTA ESTÉTICA */}
        <div className="bg-[#111115] border border-slate-800/80 rounded-2xl p-6">
          <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 font-mono">// VITRINE_DE_JOGOS_PRINCIPAIS</h4>
          
          <div className="space-y-3">
            {profileData.topGames && profileData.topGames.length > 0 ? (
              profileData.topGames.map((game, idx) => (
                <div key={idx} className="flex items-center justify-between bg-[#16161a] border border-slate-800/60 hover:border-slate-700/80 p-3 rounded-xl transition-all">
                  <div className="flex items-center gap-3">
                    {game.iconUrl && (
                      <img 
                        src={game.iconUrl} 
                        alt="" 
                        className="w-8 h-8 rounded bg-zinc-900 object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className="text-sm font-medium text-slate-200 font-mono">{game.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className={`text-xs font-bold ${activeStyle.text}`}>{game.playtime} hrs</span>
                    <span className="block text-[9px] text-slate-600 uppercase tracking-tighter">Registradas</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-24 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 text-center px-4">
                Nenhum jogo público localizado. Certifique-se de que seus detalhes de jogos na Steam não estão privados!
              </div>
            )}
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="text-xs text-slate-500 hover:text-blue-400 transition-colors font-mono">
            [ Crie sua própria vitrine no SteamPFP ]
          </a>
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;