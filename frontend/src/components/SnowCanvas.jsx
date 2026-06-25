import React, { useEffect, useRef } from 'react';

export default function SnowCanvas({ opacity = 0.45 }) {
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

    const FLAKE_COUNT = 90;
    const flakes = Array.from({ length: FLAKE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.35 + 0.08,
      drift: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.45 + 0.15,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.008 + 0.003,
    }));

    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      flakes.forEach(f => {
        f.wobble += f.wobbleSpeed;
        f.y += f.speed;
        f.x += f.drift + Math.sin(f.wobble) * 0.18;

        if (f.y > canvas.height + 10) {
          f.y = -5;
          f.x = Math.random() * canvas.width;
        }
        if (f.x > canvas.width + 10) f.x = 0;
        if (f.x < -10) f.x = canvas.width;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.alpha})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ opacity, zIndex: 1 }}
    />
  );
}
