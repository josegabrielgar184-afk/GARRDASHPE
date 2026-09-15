'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const W = 360;
const H = 540;

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Ladder {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Barrel {
  x: number;
  y: number;
  vx: number;
  radius: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export function GarrBlade() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Posición del Jugador
  const pxRef = useRef(40);
  const pyRef = useRef(H - 60);
  const vxRef = useRef(0);
  const vyRef = useRef(0);
  const isGroundedRef = useRef(true);
  const isOnLadderRef = useRef(false);

  // Plataformas y Escaleras fijas
  const platforms: Platform[] = [
    { x: 0, y: H - 30, w: W, h: 15 },
    { x: 0, y: H - 130, w: 280, h: 12 },
    { x: 80, y: H - 230, w: 280, h: 12 },
    { x: 0, y: H - 330, w: 280, h: 12 },
    { x: 80, y: H - 430, w: 280, h: 12 },
  ];

  const ladders: Ladder[] = [
    { x: 220, y: H - 130, w: 24, h: 100 },
    { x: 100, y: H - 230, w: 24, h: 100 },
    { x: 220, y: H - 330, w: 24, h: 100 },
    { x: 100, y: H - 430, w: 24, h: 100 },
  ];

  const barrelsRef = useRef<Barrel[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const spawnTimerRef = useRef(0);

  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gameOverRef = useRef(false);
  const rafRef = useRef<number>(0);

  const initGame = useCallback(() => {
    pxRef.current = 40;
    pyRef.current = H - 60;
    vxRef.current = 0;
    vyRef.current = 0;
    isGroundedRef.current = true;
    isOnLadderRef.current = false;

    barrelsRef.current = [];
    particlesRef.current = [];
    spawnTimerRef.current = 0;

    scoreRef.current = 0;
    coinsRef.current = 0;
    gameOverRef.current = false;

    setScore(0);
    setCoinsEarned(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const moveLeft = () => { vxRef.current = -3.5; };
  const moveRight = () => { vxRef.current = 3.5; };
  const stopX = () => { vxRef.current = 0; };

  const jumpOrClimbUp = () => {
    if (isOnLadderRef.current) {
      pyRef.current -= 4;
    } else if (isGroundedRef.current) {
      vyRef.current = -8.5;
      isGroundedRef.current = false;
    }
  };

  const climbDown = () => {
    if (isOnLadderRef.current) {
      pyRef.current += 4;
    }
  };

  const createSparks = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        life: 1.0,
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      if (gameOverRef.current) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      // Rejilla Neón de Fondo
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }

      // Generar Barriles desde la cima
      spawnTimerRef.current++;
      if (spawnTimerRef.current > 110) {
        spawnTimerRef.current = 0;
        barrelsRef.current.push({
          x: 100,
          y: H - 445,
          vx: 2.2,
          radius: 10,
        });
      }

      // Dibujar Escaleras Neón
      ctx.strokeStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.lineWidth = 3;
      for (const l of ladders) {
        ctx.strokeRect(l.x, l.y, l.w, l.h);
        for (let y = l.y + 12; y < l.y + l.h; y += 16) {
          ctx.beginPath(); ctx.moveTo(l.x, y); ctx.lineTo(l.x + l.w, y); ctx.stroke();
        }
      }

      // Dibujar Plataformas Neón
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#ffb700';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 10;
      for (const p of platforms) {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      }
      ctx.shadowBlur = 0;

      // Verificar si el jugador está en escalera
      let nearLadder = false;
      for (const l of ladders) {
        if (
          pxRef.current + 10 > l.x &&
          pxRef.current - 10 < l.x + l.w &&
          pyRef.current > l.y &&
          pyRef.current < l.y + l.h + 20
        ) {
          nearLadder = true;
          break;
        }
      }
      isOnLadderRef.current = nearLadder;

      // Física del Jugador
      pxRef.current += vxRef.current;
      pxRef.current = Math.max(12, Math.min(W - 12, pxRef.current));

      if (!isOnLadderRef.current) {
        vyRef.current += 0.45; // Gravedad
        pyRef.current += vyRef.current;

        // Detección de colisión con plataformas
        isGroundedRef.current = false;
        for (const p of platforms) {
          if (
            pxRef.current + 8 > p.x &&
            pxRef.current - 8 < p.x + p.w &&
            pyRef.current + 14 >= p.y &&
            pyRef.current + 14 <= p.y + p.h + 6 &&
            vyRef.current >= 0
          ) {
            pyRef.current = p.y - 14;
            vyRef.current = 0;
            isGroundedRef.current = true;
            break;
          }
        }
      }

      // Si llega a la meta arriba -> Puntos y reinicio a la base
      if (pyRef.current < H - 440) {
        createSparks(pxRef.current, pyRef.current, '#00f3ff', 25);
        scoreRef.current += 300;
        coinsRef.current += 3;
        setScore(scoreRef.current);
        setCoinsEarned(coinsRef.current);

        pxRef.current = 40;
        pyRef.current = H - 60;
      }

      // Mover y Dibujar Barriles
      for (let i = barrelsRef.current.length - 1; i >= 0; i--) {
        const b = barrelsRef.current[i];
        b.x += b.vx;

        // Rebotar barriles en bordes de pared
        if (b.x > W - 15 || b.x < 15) b.vx *= -1;

        // Caer al piso inferior
        let barrelOnPlatform = false;
        for (const p of platforms) {
          if (b.x > p.x && b.x < p.x + p.w && Math.abs(b.y + b.radius - p.y) < 6) {
            barrelOnPlatform = true;
            break;
          }
        }

        if (!barrelOnPlatform) {
          b.y += 3;
        }

        // Dibujar Barril Rojo Neón
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Choque del Jugador con Barril -> GameOver
        const dist = Math.hypot(pxRef.current - b.x, pyRef.current - b.y);
        if (dist < b.radius + 12) {
          createSparks(pxRef.current, pyRef.current, '#ef4444', 20);
          gameOverRef.current = true;
          setGameOver(true);
          if (coinsRef.current > 0) addCoins(coinsRef.current);
        }

        if (b.y > H + 20) barrelsRef.current.splice(i, 1);
      }

      // Dibujar Jugador
      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 16;
      ctx.fillRect(pxRef.current - 12, pyRef.current - 14, 24, 28);
      ctx.shadowBlur = 0;

      // Partículas
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1.0;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins]);

  const handleRevive = () => {
    gameOverRef.current = false;
    setGameOver(false);
    barrelsRef.current = [];
    pyRef.current = Math.min(H - 60, pyRef.current + 80);
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      {/* Header */}
      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#00f3ff]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => setScreen('arcade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#00f3ff]" /> Salir
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-amber-500/30 rounded-full px-3 py-1">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-400/30 rounded-full px-3 py-1">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{coinsEarned}</span>
          </span>
        </div>
      </div>

      {/* Canvas Principal */}
      <div className="flex-1 flex flex-col items-center justify-center p-2 relative touch-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[62vh] object-contain bg-black/50"
        />
      </div>

      {/* Controles de Juego */}
      <div className="pb-6 px-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onTouchStart={moveLeft}
            onTouchEnd={stopX}
            onMouseDown={moveLeft}
            onMouseUp={stopX}
            className="p-4 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-2xl text-[#00f3ff] active:scale-90"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            onTouchStart={moveRight}
            onTouchEnd={stopX}
            onMouseDown={moveRight}
            onMouseUp={stopX}
            className="p-4 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-2xl text-[#00f3ff] active:scale-90"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={climbDown}
            className="p-4 bg-purple-500/15 border border-purple-500/40 rounded-2xl text-purple-400 active:scale-90"
          >
            <ChevronDown className="w-7 h-7" />
          </button>
          <button
            onClick={jumpOrClimbUp}
            className="px-6 py-4 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400 font-black text-xs flex items-center gap-1 active:scale-90"
          >
            <ChevronUp className="w-6 h-6" /> SUBIR / SALTAR
          </button>
        </div>
      </div>

      <GameOverModal
        open={gameOver}
        onClose={() => setScreen('arcade')}
        score={score}
        coinsEarned={coinsEarned}
        onRevive={handleRevive}
        onDoubleCoins={handleDoubleCoins}
        userRole={userRole}
        vip={vip}
      />
    </div>
  );
}
