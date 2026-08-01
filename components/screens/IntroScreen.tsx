'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/use-game';

const LOADING_TEXTS = [
  'Cargando recursos...',
  'Conectando con servidores...',
  'Sincronizando ranking...',
  'Preparando personajes...',
  'Iniciando...',
];

export function IntroScreen() {
  const { setScreen } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars: { x: number; y: number; z: number; size: number; color: string }[] = [];
    const colors = ['#22d3ee', '#fbbf24', '#ffffff', '#34d399', '#f472b6'];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000 + 100,
        size: Math.random() * 2.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let lastTime = performance.now();
    startTimeRef.current = lastTime;

    const cam = { fov: 500, w: canvas.width, h: canvas.height };

    const project = (x: number, y: number, z: number) => {
      const scale = cam.fov / Math.max(z, 1);
      return { sx: cam.w / 2 + x * scale, sy: cam.h / 2 + y * scale, scale };
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;
      const elapsed = (now - startTimeRef.current) / 1000;

      const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(0.5, '#050510');
      bgGrad.addColorStop(1, '#000005');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.3, canvas.width / 2, canvas.height / 2, canvas.height * 0.8);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      for (const star of stars) {
        star.z -= 5 * dt;
        if (star.z <= 1) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = 2000;
        }
        const pp = project(star.x, star.y, star.z);
        const alpha = Math.min(pp.scale * 2.5, 0.9);
        const trailLen = Math.min(pp.scale * 8, 20);
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = alpha * 0.3;
        ctx.lineWidth = star.size;
        ctx.beginPath();
        ctx.moveTo(pp.sx, pp.sy);
        ctx.lineTo(pp.sx, pp.sy + trailLen);
        ctx.stroke();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.color;
        ctx.fillRect(pp.sx - star.size / 2, pp.sy - star.size / 2, star.size, star.size);
      }
      ctx.globalAlpha = 1;

      const titleScale = Math.min(elapsed / 1.2, 1);
      const pulse = 1 + Math.sin(elapsed * 4) * 0.05;
      const glowIntensity = 25 + Math.sin(elapsed * 3) * 15;

      ctx.save();
      ctx.globalAlpha = titleScale;
      ctx.translate(canvas.width / 2, canvas.height / 2 - 40);
      ctx.scale(titleScale * pulse, titleScale * pulse);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.min(canvas.width * 0.13, 72);
      ctx.font = `900 ${fontSize}px Inter, sans-serif`;

      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = glowIntensity;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('Garr', -fontSize * 1.1, 0);

      ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Dash', fontSize * 0.9, 0);

      ctx.shadowBlur = 0;
      ctx.font = `600 ${Math.min(canvas.width * 0.04, 16)}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Juegos 2D & Recompensas', 0, fontSize * 0.85);
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 6 + 2;
        if (next >= 100) { clearInterval(progressInterval); return 100; }
        return next;
      });
    }, 100);

    const textInterval = setInterval(() => {
      setTextIndex((i) => (i + 1) % LOADING_TEXTS.length);
    }, 600);

    const doneTimeout = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      setScreen('login');
    }, 3500);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(progressInterval);
      clearInterval(textInterval);
      clearTimeout(doneTimeout);
      window.removeEventListener('resize', resize);
    };
  }, [setScreen]);

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 pointer-events-none">
        <h1
          className="font-black text-5xl sm:text-7xl tracking-tight select-none"
          style={{
            color: '#fbbf24',
            textShadow: '0 0 30px rgba(34,211,238,0.9), 0 0 60px rgba(251,191,36,0.7)',
            animation: 'pulse-glow 2s ease-in-out infinite',
          }}
        >
          <span style={{ color: '#22d3ee', textShadow: '0 0 30px rgba(34,211,238,1), 0 0 60px rgba(34,211,238,0.5)' }}>Garr</span>
          <span style={{ color: '#fbbf24', textShadow: '0 0 30px rgba(251,191,36,1), 0 0 60px rgba(251,191,36,0.5)' }}>Dash</span>
        </h1>
        <p className="text-white/50 text-sm sm:text-base mt-3 font-medium tracking-widest uppercase">Juegos 2D & Recompensas</p>
      </div>

      <div className="relative z-10 w-full max-w-xs px-8 pb-16">
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden border border-cyan-500/30 shadow-lg shadow-cyan-500/20">
          <div
            className="h-full transition-all duration-100 ease-out rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #22d3ee, #34d399, #fbbf24)',
              boxShadow: '0 0 15px rgba(34,211,238,0.8), 0 0 30px rgba(251,191,36,0.4)',
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-white/40 text-xs animate-pulse font-mono">{LOADING_TEXTS[textIndex]}</p>
          <p className="text-cyan-400 font-mono text-xs font-bold">{Math.round(progress)}%</p>
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(34,211,238,0.8)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 40px rgba(34,211,238,1)); }
        }
      `}</style>
    </div>
  );
}
