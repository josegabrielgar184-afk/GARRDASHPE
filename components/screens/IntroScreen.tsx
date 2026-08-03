'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/use-game';

interface Star { x: number; y: number; size: number; speed: number; tw: number; }

export function IntroScreen() {
  const { setScreen } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => { canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; };
    resize();
    window.addEventListener('resize', resize);

    const stars: Star[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 1.5 + 0.3, speed: Math.random() * 0.5 + 0.1, tw: Math.random() * Math.PI * 2 });
    }

    let lastTime = performance.now();
    startTimeRef.current = lastTime;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;
      const elapsed = (now - startTimeRef.current) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#020108';
      ctx.fillRect(0, 0, w, h);

      const bgGrad = ctx.createRadialGradient(w / 2, h * 0.35, 0, w / 2, h * 0.35, Math.max(w, h));
      bgGrad.addColorStop(0, '#0a0418');
      bgGrad.addColorStop(0.5, '#050210');
      bgGrad.addColorStop(1, '#000004');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.y += s.speed * dt;
        if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
        s.tw += dt * 0.05;
        const alpha = 0.3 + Math.sin(s.tw) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.globalAlpha = 1;

      const earthCx = w / 2;
      const earthCy = h * 0.35;
      const earthR = Math.min(w, h) * 0.18;

      ctx.save();
      ctx.shadowColor = 'rgba(168,85,247,0.4)';
      ctx.shadowBlur = 40;
      ctx.beginPath();
      ctx.arc(earthCx, earthCy, earthR, 0, Math.PI * 2);
      ctx.clip();

      const oceanGrad = ctx.createRadialGradient(earthCx - earthR * 0.3, earthCy - earthR * 0.3, 0, earthCx, earthCy, earthR);
      oceanGrad.addColorStop(0, '#1e3a5f');
      oceanGrad.addColorStop(0.6, '#0d1f3c');
      oceanGrad.addColorStop(1, '#050f1f');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(earthCx - earthR, earthCy - earthR, earthR * 2, earthR * 2);

      ctx.fillStyle = '#1a6b3a';
      ctx.beginPath();
      ctx.ellipse(earthCx - earthR * 0.3, earthCy - earthR * 0.1, earthR * 0.35, earthR * 0.2, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(earthCx + earthR * 0.2, earthCy + earthR * 0.15, earthR * 0.25, earthR * 0.15, -0.4, 0, Math.PI * 2);
      ctx.fill();

      const plaguePulse = 0.15 + Math.sin(elapsed * 2) * 0.08;
      ctx.fillStyle = `rgba(168,85,247,${plaguePulse})`;
      ctx.beginPath();
      ctx.arc(earthCx, earthCy, earthR, 0, Math.PI * 2);
      ctx.fill();

      const plagueGrad = ctx.createRadialGradient(earthCx, earthCy, 0, earthCx, earthCy, earthR);
      plagueGrad.addColorStop(0, 'rgba(34,197,94,0)');
      plagueGrad.addColorStop(0.5, 'rgba(34,197,94,0.05)');
      plagueGrad.addColorStop(0.8, 'rgba(168,85,247,0.15)');
      plagueGrad.addColorStop(1, 'rgba(168,85,247,0.3)');
      ctx.fillStyle = plagueGrad;
      ctx.fillRect(earthCx - earthR, earthCy - earthR, earthR * 2, earthR * 2);

      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + elapsed * 0.1;
        const px = earthCx + Math.cos(a) * earthR * 0.7;
        const py = earthCy + Math.sin(a) * earthR * 0.7;
        const sz = 2 + Math.sin(elapsed * 3 + i) * 1.5;
        ctx.fillStyle = `rgba(34,197,94,${0.4 + Math.sin(elapsed * 2 + i) * 0.3})`;
        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      ctx.save();
      ctx.shadowColor = 'rgba(168,85,247,0.6)';
      ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(168,85,247,0.3)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(earthCx, earthCy, earthR + 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // === ZOMBIE CHASING PLAYER ANIMATION ===
      // A survivor runs left-to-right, a zombie closely follows behind
      const animY = h * 0.62;
      const runSpeed = 1.5;
      const loopDuration = 4;
      const phase = (elapsed % loopDuration) / loopDuration;
      const playerX = w * 0.2 + phase * w * 0.6;
      const zombieX = playerX - 35;
      const bob = Math.sin(elapsed * 8) * 3;

      // Ground line
      ctx.strokeStyle = 'rgba(168,85,247,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, animY + 20);
      ctx.lineTo(w, animY + 20);
      ctx.stroke();

      // Player (survivor) - running right
      ctx.save();
      ctx.translate(playerX, animY + bob);
      const ps = 14;
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath(); ctx.arc(0, -ps * 0.6, ps * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath(); ctx.arc(0, -ps * 0.6, ps * 0.35, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#d4a574';
      ctx.beginPath(); ctx.arc(0, -ps * 0.35, ps * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath(); ctx.roundRect(-ps * 0.3, -ps * 0.15, ps * 0.6, ps * 0.5, 3); ctx.fill();
      // Legs running
      ctx.strokeStyle = '#0ea5e9'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      const legSwing = Math.sin(elapsed * 10) * 5;
      ctx.beginPath();
      ctx.moveTo(-ps * 0.15, ps * 0.35); ctx.lineTo(-ps * 0.15 + legSwing, ps * 0.7);
      ctx.moveTo(ps * 0.15, ps * 0.35); ctx.lineTo(ps * 0.15 - legSwing, ps * 0.7);
      ctx.stroke();
      // Arms
      ctx.beginPath();
      ctx.moveTo(-ps * 0.3, ps * 0.05); ctx.lineTo(-ps * 0.5, ps * 0.2 - legSwing);
      ctx.moveTo(ps * 0.3, ps * 0.05); ctx.lineTo(ps * 0.5, ps * 0.2 + legSwing);
      ctx.stroke();
      ctx.restore();

      // Zombie - chasing close behind
      ctx.save();
      ctx.translate(zombieX, animY + bob * 0.7);
      const zs = 13;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(0, zs * 0.75, zs * 0.5, zs * 0.12, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath(); ctx.roundRect(-zs * 0.35, -zs * 0.1, zs * 0.7, zs * 0.55, 3); ctx.fill();
      ctx.fillStyle = '#65a30d';
      ctx.beginPath(); ctx.arc(0, -zs * 0.35, zs * 0.3, 0, Math.PI * 2); ctx.fill();
      // Glowing red eyes
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(-zs * 0.12, -zs * 0.38, zs * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(zs * 0.12, -zs * 0.38, zs * 0.06, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      // Arms reaching forward
      ctx.strokeStyle = '#65a30d'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
      const reach = Math.sin(elapsed * 6) * 2;
      ctx.beginPath();
      ctx.moveTo(-zs * 0.3, zs * 0.1); ctx.lineTo(zs * 0.5 + reach, zs * 0.15);
      ctx.moveTo(zs * 0.3, zs * 0.1); ctx.lineTo(zs * 0.55 + reach, zs * 0.25);
      ctx.stroke();
      // Legs shambling
      const zlegSwing = Math.sin(elapsed * 6 + 1) * 4;
      ctx.beginPath();
      ctx.moveTo(-zs * 0.15, zs * 0.45); ctx.lineTo(-zs * 0.15 + zlegSwing, zs * 0.75);
      ctx.moveTo(zs * 0.15, zs * 0.45); ctx.lineTo(zs * 0.15 - zlegSwing, zs * 0.75);
      ctx.stroke();
      ctx.restore();

      // Dust particles behind zombie
      for (let i = 0; i < 3; i++) {
        const dustX = zombieX - 10 - i * 8;
        const dustAlpha = 0.3 - i * 0.1;
        ctx.fillStyle = `rgba(168,85,247,${dustAlpha})`;
        ctx.beginPath();
        ctx.arc(dustX, animY + 15 + Math.sin(elapsed * 5 + i) * 3, 2 + i, 0, Math.PI * 2);
        ctx.fill();
      }

      // Title
      const titleScale = Math.min(elapsed / 1, 1);
      const pulse = 1 + Math.sin(elapsed * 3) * 0.04;

      ctx.save();
      ctx.globalAlpha = titleScale;
      ctx.translate(w / 2, h * 0.85);
      ctx.scale(titleScale * pulse, titleScale * pulse);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.min(w * 0.12, 56);
      ctx.font = `900 ${fontSize}px Inter, sans-serif`;

      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#22d3ee';
      ctx.fillText('Garr', -fontSize * 0.55, 0);
      ctx.shadowColor = '#22c55e';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('Dash', fontSize * 0.45, 0);
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 5 + 1.5;
        if (next >= 100) { clearInterval(progressInterval); return 100; }
        return next;
      });
    }, 100);

    const doneTimeout = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      setScreen('login');
    }, 4000);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(progressInterval);
      clearTimeout(doneTimeout);
      window.removeEventListener('resize', resize);
    };
  }, [setScreen]);

  return (
    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 pointer-events-none">
        <h1
          className="font-black text-4xl sm:text-6xl tracking-tight select-none"
          style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}
        >
          <span style={{ color: '#22d3ee', textShadow: '0 0 25px rgba(168,85,247,1), 0 0 50px rgba(34,211,238,0.6)' }}>Garr</span>
          <span style={{ color: '#fbbf24', textShadow: '0 0 25px rgba(34,197,94,1), 0 0 50px rgba(251,191,36,0.6)' }}>Dash</span>
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-xs px-8 pb-16">
        <p className="text-center text-green-400/80 text-xs font-mono mb-2 tracking-wider">Cargando GarrDash...</p>
        <div
          className="h-4 bg-black border-2 border-green-500/50 overflow-hidden relative"
          style={{ boxShadow: '0 0 15px rgba(34,197,94,0.4), inset 0 0 8px rgba(0,0,0,0.8)' }}
        >
          <div
            className="h-full transition-all duration-100 ease-out relative"
            style={{
              width: `${progress}%`,
              background: 'repeating-linear-gradient(90deg, #22c55e 0px, #22c55e 8px, #16a34a 8px, #16a34a 12px)',
              boxShadow: '0 0 10px rgba(34,197,94,0.8)',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-green-400 font-mono text-[10px] font-bold tracking-wider">{Math.round(progress)}%</span>
          </div>
        </div>
        <div className="flex justify-between mt-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`w-1 h-2 ${i < Math.round(progress / 5) ? 'bg-green-400' : 'bg-green-500/10'}`} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 15px rgba(168,85,247,0.8)); }
          50% { filter: brightness(1.15) drop-shadow(0 0 30px rgba(168,85,247,1)); }
        }
      `}</style>
    </div>
  );
}
