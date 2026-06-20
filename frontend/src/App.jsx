import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [steamData, setSteamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/auth/user')
      .then(res => {
        if (res.data.success) {
          setUser(res.data.user);
          // Se o usuário está logado, puxa os dados estéticos detalhados da API da Valve
          fetchSteamAPIData(res.data.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const fetchSteamAPIData = (steamId) => {
    setLoadingProfile(true);
    axios.get(`http://localhost:5000/api/steam/profile/${steamId}`)
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

  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/steam';
  };

  const handleLogout = () => {
    window.location.href = 'http://localhost:5000/api/auth/logout';
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0c]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 selection:bg-blue-500/30 font-sans">
      {!user ? (
        // 1. LANDING PAGE (TELA DE LOGIN)
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
        // 2. DASHBOARD PRIVADO (PREVIEW DA VITRINE CYBERPUNK)
        <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
          
          {/* Header de Navegação */}
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
              
              {/* Painel Esquerdo: Menu de Controle da Estética */}
              <div className="bg-[#111115] border border-slate-800/80 rounded-2xl p-6 h-fit">
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4">Ajustes do Layout</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Seu link público gerado: <span className="text-slate-200 block font-mono mt-1 bg-black/40 p-2 rounded border border-slate-800">steampfp.com/{user.displayName?.toLowerCase()}</span>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-medium">Tema Ativo</label>
                    <select className="w-full bg-[#16161c] border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500">
                      <option>Cyberpunk Neon (Default)</option>
                      <option disabled>Goth Obscure (Premium)</option>
                      <option disabled>Vaporwave 1988 (Premium)</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <button className="w-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold uppercase tracking-wider py-3 rounded-lg transition-colors cursor-not-allowed text-slate-400">
                      Salvar Customização
                    </button>
                  </div>
                </div>
              </div>

              {/* Painel Direito (Ocupa 2 colunas): Preview em Tempo Real da Vitrine */}
              <div className="md:col-span-2 space-y-6">
                <span className="text-xs uppercase font-bold tracking-widest text-slate-500 block">Live Preview</span>
                
                {/* CARD PRINCIPAL ESTILO CYBERPUNK */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative overflow-hidden bg-gradient-to-b from-[#14141b] to-[#0d0d11] border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-950/20"
                >
                  {/* Linha Neon Estilizada no Topo do Card */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar com Borda Neon Emulada */}
                    <div className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
                      <img 
                        src={steamData.avatar} 
                        alt="Profile Avatar" 
                        className="relative w-24 h-24 rounded-xl object-cover border border-black"
                      />
                    </div>

                    {/* Dados Básicos */}
                    <div className="text-center sm:text-left flex-1">
                      <h2 className="text-2xl font-black text-white tracking-wide font-mono">{steamData.nickname}</h2>
                      <p className="text-xs text-blue-400/80 font-mono mt-1">SYSTEM STATUS // ONLINE</p>
                      
                      <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                        <div className="bg-[#171721] border border-slate-800 px-3 py-1.5 rounded-lg text-center min-w-[70px]">
                          <span className="block text-[10px] uppercase tracking-wider text-slate-500 font-bold">Nível</span>
                          <span className="text-sm font-black text-blue-400 font-mono">{steamData.level}</span>
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

                {/* Exemplo de Vitrine de Destaque Injetada */}
                <div className="bg-[#111115] border border-slate-800/80 rounded-2xl p-6">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 font-mono">// VITRINE_DE_EXIBIÇÃO</h4>
                  <div className="h-32 border border-dashed border-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500">
                    Na próxima etapa, vamos renderizar aqui a grade de fotos recortadas ou o grid de conquistas raras por cor.
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
  );
}

export default App;