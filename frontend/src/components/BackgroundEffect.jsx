import React, { useEffect, useRef } from 'react';

function MatrixRain({ color = '#00ff41' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ<>{}[]|/\\';
    const fontSize = 14;
    let cols = Math.floor(canvas.width / fontSize);
    let drops = Array(cols).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;
      cols = Math.floor(canvas.width / fontSize);
      if (drops.length !== cols) drops = Array(cols).fill(1);

      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity: 0.25, zIndex: 0 }}
    />
  );
}

function Particles({ color = '#00d4ff' }) {
  const count = 30;
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 6,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: color,
            opacity: 0.4,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
            animation: `particle-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function AuroraEffect({ primary, secondary }) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <div
        className="absolute w-[60vw] h-[60vh] rounded-full blur-[120px]"
        style={{
          background: `radial-gradient(circle, ${primary}44, transparent 70%)`,
          top: '10%',
          left: '10%',
          animation: 'aurora-move 12s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[50vw] h-[50vh] rounded-full blur-[100px]"
        style={{
          background: `radial-gradient(circle, ${secondary}33, transparent 70%)`,
          bottom: '10%',
          right: '10%',
          animation: 'aurora-move 15s ease-in-out 3s infinite reverse',
        }}
      />
    </div>
  );
}

export default function BackgroundEffect({ type, theme, customBgUrl }) {
  if (type === 'custom' && customBgUrl) {
    return (
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${customBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.3,
          zIndex: 0,
        }}
      />
    );
  }

  if (type === 'matrix') {
    return <MatrixRain color={theme?.primary || '#00ff41'} />;
  }

  if (type === 'particles') {
    return <Particles color={theme?.primary || '#00d4ff'} />;
  }

  if (type === 'aurora') {
    return <AuroraEffect primary={theme?.primary} secondary={theme?.secondary} />;
  }

  return null;
}
