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

    const stars: { x: number; y: number; z: number; size: number }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000 + 100,
        size: Math.random() * 2 + 0.5,
      });
    }

    let lastTime = performance.now();
    startTimeRef.current = lastTime;

    const cam = { fov: 500, x: 0, y: 0, w: canvas.width, h: canvas.height };

    const project = (x: number, y: number, z: number) => {
      const scale = cam.fov / Math.max(z, 1);
      return {
        sx: cam.w / 2 + x * scale,
        sy: cam.h / 2 + y * scale,
        scale,
      };
    };

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;
      const elapsed = (now - startTimeRef.current) / 1000;

      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const star of stars) {
        star.z -= 3 * dt;
        if (star.z <= 1) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = 2000;
        }
        const pp = project(star.x, star.y, star.z);
        ctx.fillStyle = `rgba(255,255,255,${Math.min(pp.scale * 2, 0.8)})`;
        ctx.fillRect(pp.sx, pp.sy, star.size, star.size);
      }

      const titleScale = Math.min(elapsed / 1.5, 1);
      const glowIntensity = 20 + Math.sin(elapsed * 3) * 10;

      ctx.save();
      ctx.globalAlpha = titleScale;
      ctx.translate(canvas.width / 2, canvas.height / 2 - 30);
      ctx.scale(titleScale, titleScale);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.min(canvas.width * 0.12, 64);
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;

      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = glowIntensity;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('Garr', -fontSize * 1.1, 0);

      ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Dash', fontSize * 0.9, 0);

      ctx.shadowBlur = 0;
      ctx.font = `${Math.min(canvas.width * 0.035, 14)}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillText('Juego Espacial y Apocalipsis Zombie', 0, fontSize * 0.8);
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8 + 2;
        if (next >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return next;
      });
    }, 120);

    const textInterval = setInterval(() => {
      setTextIndex((i) => (i + 1) % LOADING_TEXTS.length);
    }, 700);

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
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        <h1
          className="font-black text-5xl sm:text-6xl tracking-tight select-none"
          style={{
            color: '#fbbf24',
            textShadow: '0 0 20px rgba(34,211,238,0.8), 0 0 40px rgba(251,191,36,0.6)',
          }}
        >
          <span style={{ color: '#22d3ee', textShadow: '0 0 20px rgba(34,211,238,0.9)' }}>Garr</span>
          <span style={{ color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.9)' }}>Dash</span>
        </h1>
        <p className="text-white/40 text-sm mt-2">Juego Espacial y Apocalipsis Zombie</p>
      </div>

      <div className="relative z-10 w-full max-w-xs px-8 pb-12">
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden border border-cyan-500/20">
          <div
            className="h-full transition-all duration-150 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #22d3ee, #34d399, #fbbf24)',
              boxShadow: '0 0 10px rgba(34,211,238,0.6)',
            }}
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-white/50 text-xs animate-pulse">{LOADING_TEXTS[textIndex]}</p>
          <p className="text-cyan-400 font-mono text-xs font-bold">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
}
