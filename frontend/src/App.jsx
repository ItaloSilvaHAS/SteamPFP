import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import PublicProfile from './PublicProfile';

axios.defaults.withCredentials = true;

// Define a URL base do backend de forma dinâmica para funcionar localmente e na nuvem
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [steamData, setSteamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Estados para o formulário de customização (Valor padrão limpo para salvar no Supabase)
  const [theme, setTheme] = useState('cyberpunk');
  const [customSlug, setCustomSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/auth/user`)
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          setCustomSlug(res.data.user.custom_slug || res.data.user.displayName?.toLowerCase() || '');
          // Recupera o tema atual já salvo no banco para o select começar no lugar certo
          if (res.data.user.theme) {
            setTheme(res.data.user.theme);
          }
          fetchSteamAPIData(res.data.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchSteamAPIData = (steamId) => {
    setLoadingProfile(true);
    axios.get(`${API_BASE_URL}/api/steam/profile/${steamId}`)
      .then(res => {
        if (res.data.success) {
          setSteamData(res.data.data);
        }
        setLoading(false);
        setLoadingProfile(false);
      })
      .catch(() => {
        setLoading(false);
        setLoadingProfile(false);
      });
  };

  const handleSaveCustomization = async () => {
    setIsSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/profile/save`, {
        theme: theme,
        custom_slug: customSlug
      });

      if (response.data.success) {
        setFeedback({ type: 'success', message: 'Configurações salvas com sucesso!' });
        setCustomSlug(response.data.actual_slug);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Erro ao conectar ao servidor.';
      setFeedback({ type: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/steam`;
  };

  const handleLogout = () => {
    window.location.href = `${API_BASE_URL}/api/auth/logout`;
  };

  // Cores dinâmicas para o Live Preview baseadas no tema selecionado
  const themeStyles = {
    cyberpunk: {
      card: "border-blue-500/30 shadow-blue-950/20",
      line: "from-transparent via-blue-500 to-transparent",
      text: "text-blue-400"
    },
    goth: {
      card: "border-purple-900/50 shadow-none",
      line: "from-transparent via-purple-800 to-transparent",
      text: "text-purple-500"
    },
    vaporwave: {
      card: "border-pink-500/30 shadow-pink-950/10",
      line: "from-transparent via-pink-500 to-transparent",
      text: "text-pink-400"
    },
    matrix: {
      card: "border-green-500/30 shadow-green-950/20",
      line: "from-transparent via-green-500 to-transparent",
      text: "text-green-400"
    },
    blood: {
      card: "border-red-600/30 shadow-red-950/20",
      line: "from-transparent via-red-600 to-transparent",
      text: "text-red-500"
    }
  };

  const activeStyle = themeStyles[theme] || themeStyles.cyberpunk;

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ROTA DA VITRINE PÚBLICA */}
      <Route path="/:slug" element={<PublicProfile />} />

      {/* ROTA PRINCIPAL: DASHBOARD PRIVADO */}
      <Route path="/" element={
        <div className="min-h-screen bg-[#0a0a0c] text-slate-100 selection:bg-blue-500/30 font-sans">
          {!user ? (
            // 1. LANDING PAGE
            <div className="flex min-h-screen flex-col items-center justify-center px-4 relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="z-10 text-center max-w-xl"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Identity Showcase Platform
                </span>
                <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
                  STEAM<span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">PFP</span>
                </h1>
                <p className="mt-4 text-base text-slate-400 max-w-md mx-auto leading-relaxed">
                  Transforme suas conquistas e inventário da Steam em uma vitrine digital futurista de alta estética. Esqueça links genéricos.
                </p>
                <div className="mt-10">
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 0 25px rgba(59,130,246,0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-8 py-3.5 rounded-xl border border-blue-400/30 transition-all duration-200 flex items-center gap-3 mx-auto"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 .007c-4.437 0-8.22 2.92-9.43 6.94l4.28 1.763c.483-.34 1.072-.544 1.71-.544.755 0 1.442.284 1.968.752L14.71 6.55c.038-1.524 1.285-2.748 2.825-2.748 1.56 0 2.83 1.27 2.83 2.83s-1.27 2.83-2.83 2.83c-1.393 0-2.55-1.01-2.785-2.34l-4.113 2.373c.033.16.058.324.058.495 0 1.56-1.27 2.83-2.83 2.83-.878 0-1.662-.403-2.184-1.034L1.756 10.37C1.914 16.89 7.34 22.007 14 22.007c6.627 0 12-5.373 12-12S20.627.007 14 .007zm-5.44 9.155c0-.86.7-1.56 1.56-1.56s1.56.7 1.56 1.56-.7 1.56-1.56 1.56-1.56-.7-1.56-1.56z"/>
                    </svg>
                    Conectar com a Steam
                  </motion.button>
                </div>
              </motion.div>
            </div>
          ) : (
            // 2. DASHBOARD PRIVADO
            <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
              
              <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-5">
                <div className="text-xl font-black tracking-wider">STEAM<span className="text-blue-500">PFP</span></div>
                <button 
                  onClick={handleLogout}
                  className="cursor-pointer text-xs uppercase tracking-widest text-slate-400 hover:text-red-400 transition-colors"
                >
                  [ Desconectar ]
                </button>
              </div>

              {loadingProfile ? (
                <div className="text-center py-20 text-slate-500">Sincronizando com a Matrix da Valve...</div>
              ) : steamData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Painel Esquerdo: Menu de Controle */}
                  <div className="bg-[#111115] border border-slate-800/80 rounded-2xl p-6 h-fit">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4">Ajustes do Layout</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-2 font-medium">Seu Link Personalizado</label>
                        <div className="flex items-center bg-black/40 rounded-lg border border-slate-800 p-2.5 font-mono text-xs overflow-hidden w-full">
                          <span className="text-slate-500 flex-shrink-0 select-none">steampfp.com/</span>
                          <input 
                            type="text" 
                            value={customSlug} 
                            onChange={(e) => setCustomSlug(e.target.value)}
                            className="bg-transparent text-slate-200 focus:outline-none flex-1 font-mono min-w-0 ml-0.5 truncate"
                            placeholder="seu_link"
                          />
                        </div>
                      </div>
                      
                      {/* Seleção do Tema (Totalmente Liberado) */}
                      <div>
                        <label className="text-xs text-slate-400 block mb-2 font-medium">Tema Ativo</label>
                        <select 
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          className="w-full bg-[#16161c] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="cyberpunk">Cyberpunk Neon (Default)</option>
                          <option value="goth">Goth Obscure</option>
                          <option value="vaporwave">Vaporwave 1988</option>
                          <option value="matrix">Digital Matrix</option>
                          <option value="blood">Crimson Blood</option>
                        </select>
                      </div>

                      {feedback.message && (
                        <div className={`text-xs p-2.5 rounded border ${
                          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {feedback.message}
                        </div>
                      )}

                      <div className="pt-2">
                        <button 
                          onClick={handleSaveCustomization}
                          disabled={isSaving}
                          className={`w-full text-xs font-semibold uppercase tracking-wider py-3 rounded-lg transition-colors cursor-pointer text-white ${
                            isSaving ? 'bg-slate-700 cursor-wait' : 'bg-blue-600 hover:bg-blue-500'
                          }`}
                        >
                          {isSaving ? 'Salvando...' : 'Salvar Customização'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Painel Direito: Preview em Tempo Real */}
                  <div className="md:col-span-2 space-y-6">
                    <span className="text-xs uppercase font-bold tracking-widest text-slate-500 block">Live Preview</span>
                    
                    <motion.div 
                      key={theme} // Força uma leve animação ao trocar o tema
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      className={`relative overflow-hidden bg-gradient-to-b from-[#14141b] to-[#0d0d11] border rounded-2xl p-6 shadow-2xl transition-all duration-300 ${activeStyle.card}`}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${activeStyle.line}`} />
                      
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl blur opacity-40" />
                          <img 
                            src={steamData.avatar} 
                            alt="Profile Avatar" 
                            className="relative w-24 h-24 rounded-xl object-cover border border-black"
                          />
                        </div>

                        <div className="text-center sm:text-left flex-1">
                          <h2 className="text-2xl font-black text-white tracking-wide font-mono">{steamData.nickname}</h2>
                          <p className={`text-xs font-mono mt-1 ${activeStyle.text}`}>SYSTEM STATUS // ONLINE</p>
                          
                          <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                            <div className="bg-[#171721] border border-slate-800 px-3 py-1.5 rounded-lg text-center min-w-[70px]">
                              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Nível</span>
                              <span className={`text-sm font-black font-mono ${activeStyle.text}`}>{steamData.level}</span>
                            </div>
                            <div className="bg-[#171721] border border-slate-800 px-3 py-1.5 rounded-lg text-center">
                              <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Data de Criação</span>
                              <span className="text-sm font-medium text-slate-300 font-mono">
                                {steamData.timeCreated ? new Date(steamData.timeCreated * 1000).toLocaleDateString('pt-BR') : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    <div className="bg-[#111115] border border-slate-800/80 rounded-2xl p-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 font-mono">// VITRINE_DE_EXIBIÇÃO</h4>
                      <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                        Na página pública, os seus jogos e conquistas já serão carregados dinamicamente aqui!
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-red-400">Falha ao obter dados da Steam. Certifique-se de que seu perfil não está totalmente privado.</div>
              )}
            </div>
          )}
        </div>
      } />
    </Routes>
  );
}

export default App;