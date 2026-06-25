import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function getYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
  return match ? match[1] : null;
}

function EqBars({ color, playing }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            height: playing ? `${h * 100}%` : '30%',
            background: color,
            transition: `height ${0.2 + i * 0.05}s ease`,
            animation: playing ? `eq-bar-${i} ${0.5 + i * 0.1}s ease-in-out infinite alternate` : 'none',
          }}
        />
      ))}
      <style>{`
        @keyframes eq-bar-0 { to { height: 40%; } }
        @keyframes eq-bar-1 { to { height: 80%; } }
        @keyframes eq-bar-2 { to { height: 100%; } }
        @keyframes eq-bar-3 { to { height: 60%; } }
        @keyframes eq-bar-4 { to { height: 90%; } }
      `}</style>
    </div>
  );
}

export default function MusicPlayer({ musicUrl, theme }) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const ytId = getYouTubeId(musicUrl);

  if (!musicUrl) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-mono font-medium transition-all"
          style={{
            background: theme.cardBg,
            borderColor: theme.cardBorder,
            color: theme.textAccent,
            backdropFilter: 'blur(12px)',
            boxShadow: `0 4px 20px rgba(${theme.glowColor}, 0.2)`,
          }}
        >
          <EqBars color={theme.primary} playing={playing} />
          <span className="hidden sm:block text-xs">
            {open ? 'Fechar Player' : 'Tocar Música'}
          </span>
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-6 z-50 rounded-2xl border overflow-hidden shadow-2xl"
            style={{
              background: theme.bg,
              borderColor: theme.cardBorder,
              width: '320px',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: theme.cardBorder }}
            >
              <span className="text-xs font-mono font-bold" style={{ color: theme.textAccent }}>
                // PLAYER
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            {ytId ? (
              <div className="relative">
                <iframe
                  width="320"
                  height="180"
                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&controls=1`}
                  title="Music Player"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  onLoad={() => setPlaying(true)}
                />
              </div>
            ) : (
              <div className="p-4">
                <audio
                  controls
                  autoPlay
                  loop
                  src={musicUrl}
                  className="w-full"
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
