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
  vy: number;
  radius: number;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  collected: boolean;
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

  const pxRef = useRef(40);
  const pyRef = useRef(H - 50);
  const vxRef = useRef(0);
  const vyRef = useRef(0);
  const isGroundedRef = useRef(true);
  const isOnLadderRef = useRef(false);

  // Control de cobro único para evitar duplicados incorrectos
  const baseCoinsAddedRef = useRef(false);
  const doubledRef = useRef(false);

  const platforms: Platform[] = [
    { x: 0, y: H - 30, w: W, h: 15 },
    { x: 0, y: H - 130, w: 270, h: 12 },
    { x: 90, y: H - 230, w: 270, h: 12 },
    { x: 0, y: H - 330, w: 270, h: 12 },
    { x: 90, y: H - 430, w: 270, h: 12 },
  ];

  const ladders: Ladder[] = [
    { x: 210, y: H - 130, w: 24, h: 100 },
    { x: 110, y: H - 230, w: 24, h: 100 },
    { x: 210, y: H - 330, w: 24, h: 100 },
    { x: 110, y: H - 430, w: 24, h: 100 },
  ];

  const initialCoins: Coin[] = [
    { id: 1, x: 150, y: H - 45, collected: false },
    { id: 2, x: 50, y: H - 145, collected: false },
    { id: 3, x: 160, y: H - 145, collected: false },
    { id: 4, x: 140, y: H - 245, collected: false },
    { id: 5, x: 280, y: H - 245, collected: false },
    { id: 6, x: 60, y: H - 345, collected: false },
    { id: 7, x: 180, y: H - 345, collected: false },
    { id: 8, x: 150, y: H - 445, collected: false },
    { id: 9, x: 270, y: H - 445, collected: false },
  ];

  const coinsRef = useRef<Coin[]>(JSON.parse(JSON.stringify(initialCoins)));
  const barrelsRef = useRef<Barrel[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const spawnTimerRef = useRef(0);

  const scoreRef = useRef(0);
  const coinsEarnedRef = useRef(0);
  const gameOverRef = useRef(false);
  const rafRef = useRef<number>(0);

  const resetCoins = () => {
    coinsRef.current = JSON.parse(JSON.stringify(initialCoins));
  };

  const initGame = useCallback(() => {
    pxRef.current = 40;
    pyRef.current = H - 50;
    vxRef.current = 0;
    vyRef.current = 0;
    isGroundedRef.current = true;
    isOnLadderRef.current = false;

    barrelsRef.current = [];
    particlesRef.current = [];
    spawnTimerRef.current = 0;

    scoreRef.current = 0;
    coinsEarnedRef.current = 0;
    gameOverRef.current = false;
    baseCoinsAddedRef.current = false;
    doubledRef.current = false;

    resetCoins();
    setScore(0);
    setCoinsEarned(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const moveLeft = () => { vxRef.current = -3.2; };
  const moveRight = () => { vxRef.current = 3.2; };
  const stopX = () => { vxRef.current = 0; };

  const jumpOrClimbUp = () => {
    if (isOnLadderRef.current) {
      pyRef.current -= 4;
    } else if (isGroundedRef.current) {
      vyRef.current = -8.2;
      isGroundedRef.current = false;
    }
  };

  const climbDown = () => {
    if (isOnLadderRef.current) {
      pyRef.current += 4;
    }
  };

  const createSparks = (x: number, y: number, color: string, count = 10) => {
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

  const triggerGameOver = () => {
    if (!gameOverRef.current) {
      gameOverRef.current = true;
      setGameOver(true);
      if (coinsEarnedRef.current > 0 && !baseCoinsAddedRef.current) {
        baseCoinsAddedRef.current = true;
        addCoins(coinsEarnedRef.current);
      }
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

      ctx.strokeStyle = 'rgba(0, 243, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }

      spawnTimerRef.current++;
      if (spawnTimerRef.current > 140 && barrelsRef.current.length < 3) {
        spawnTimerRef.current = 0;
        barrelsRef.current.push({
          x: 100,
          y: H - 445,
          vx: 2.2,
          vy: 0,
          radius: 10,
        });
      }

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

      for (const coin of coinsRef.current) {
        if (coin.collected) continue;

        ctx.fillStyle = '#ffb700';
        ctx.shadowColor = '#ffb700';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const distToPlayer = Math.hypot(pxRef.current - coin.x, pyRef.current - coin.y);
        if (distToPlayer < 18) {
          coin.collected = true;
          coinsEarnedRef.current += 1;
          scoreRef.current += 50;
          setCoinsEarned(coinsEarnedRef.current);
          setScore(scoreRef.current);
          createSparks(coin.x, coin.y, '#ffb700', 10);
        }
      }

      let nearLadder = false;
      for (const l of ladders) {
        if (
          pxRef.current + 10 > l.x &&
          pxRef.current - 10 < l.x + l.w &&
          pyRef.current > l.y - 10 &&
          pyRef.current < l.y + l.h + 10
        ) {
          nearLadder = true;
          break;
        }
      }
      isOnLadderRef.current = nearLadder;

      pxRef.current += vxRef.current;
      pxRef.current = Math.max(12, Math.min(W - 12, pxRef.current));

      if (!isOnLadderRef.current) {
        vyRef.current += 0.45;
        pyRef.current += vyRef.current;

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

      if (pyRef.current < H - 440) {
        createSparks(pxRef.current, pyRef.current, '#00f3ff', 20);
        scoreRef.current += 300;
        coinsEarnedRef.current += 3;
        setScore(scoreRef.current);
        setCoinsEarned(coinsEarnedRef.current);

        resetCoins();
        pxRef.current = 40;
        pyRef.current = H - 50;
      }

      for (let i = barrelsRef.current.length - 1; i >= 0; i--) {
        const b = barrelsRef.current[i];

        let onPlatform = false;
        for (const p of platforms) {
          if (
            b.x >= p.x &&
            b.x <= p.x + p.w &&
            b.y + b.radius >= p.y &&
            b.y + b.radius <= p.y + p.h + 4
          ) {
            onPlatform = true;
            b.y = p.y - b.radius;
            b.vy = 0;
            break;
          }
        }

        if (onPlatform) {
          b.x += b.vx;
          if (b.x > W - 15) {
            b.x = W - 15;
            b.vx = -Math.abs(b.vx);
          } else if (b.x < 15) {
            b.x = 15;
            b.vx = Math.abs(b.vx);
          }
        } else {
          b.vy += 0.35;
          b.y += b.vy;
        }

        if (b.y >= H - 30 - b.radius && (b.x <= 25 || b.x >= W - 25)) {
          createSparks(b.x, b.y, '#ef4444', 8);
          barrelsRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        const dist = Math.hypot(pxRef.current - b.x, pyRef.current - b.y);
        if (dist < b.radius + 10) {
          createSparks(pxRef.current, pyRef.current, '#ef4444', 18);
          triggerGameOver();
        }
      }

      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 14;
      ctx.fillRect(pxRef.current - 12, pyRef.current - 14, 24, 28);
      ctx.shadowBlur = 0;

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
    pyRef.current = H - 50;
    pxRef.current = 40;
  };

  const handleDoubleCoins = () => {
    if (coinsEarnedRef.current > 0 && !doubledRef.current) {
      doubledRef.current = true;
      addCoins(coinsEarnedRef.current); // Agrega exactamente el bono extra una sola vez
      // Dejamos que GameOverModal multiplique visualmente la base * 2
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

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

      <div className="flex-1 flex flex-col items-center justify-center p-2 relative touch-none">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[62vh] object-contain bg-black/50"
        />
      </div>

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
