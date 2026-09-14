'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Heart, Zap, Rocket } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const W = 360;
const H = 540;

interface Bullet {
  x: number;
  y: number;
  vy: number;
}

interface Enemy {
  x: number;
  y: number;
  radius: number;
  speed: number;
  hp: number;
  maxHp: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

export function GarrFly() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [lives, setLives] = useState(3);
  const [specialEnergy, setSpecialEnergy] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const playerXRef = useRef(W / 2);
  const targetXRef = useRef(W / 2);
  const bulletsRef = useRef<Bullet[]>([]);
  const enemiesRef = useRef<Enemy[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const livesRef = useRef(3);
  const specialRef = useRef(0);
  const frameCountRef = useRef(0);
  const gameOverRef = useRef(false);
  const rafRef = useRef<number>(0);

  const initGame = useCallback(() => {
    playerXRef.current = W / 2;
    targetXRef.current = W / 2;
    bulletsRef.current = [];
    enemiesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    coinsRef.current = 0;
    livesRef.current = 3;
    specialRef.current = 0;
    frameCountRef.current = 0;
    gameOverRef.current = false;

    setScore(0);
    setCoinsEarned(0);
    setLives(3);
    setSpecialEnergy(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const createExplosion = (x: number, y: number, color: string, count = 16) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 4 + 2,
        life: 1.0,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (gameOverRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touchX = e.clientX - rect.left;
    targetXRef.current = Math.max(20, Math.min(W - 20, (touchX / rect.width) * W));
  };

  const handleUseSpecial = () => {
    if (specialRef.current < 100 || gameOverRef.current) return;
    specialRef.current = 0;
    setSpecialEnergy(0);

    for (const enemy of enemiesRef.current) {
      createExplosion(enemy.x, enemy.y, enemy.color, 15);
      scoreRef.current += 100;
    }
    enemiesRef.current = [];
    coinsRef.current += 10;
    setScore(scoreRef.current);
    setCoinsEarned(coinsRef.current);
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

      frameCountRef.current++;

      // Suavizado de movimiento de nave
      playerXRef.current += (targetXRef.current - playerXRef.current) * 0.25;

      // Fondo Espacial Cyberpunk
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      // Rejilla Neón de Fondo
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }

      // Generar Disparos Automáticos
      if (frameCountRef.current % 8 === 0) {
        bulletsRef.current.push({ x: playerXRef.current - 8, y: H - 60, vy: -12 });
        bulletsRef.current.push({ x: playerXRef.current + 8, y: H - 60, vy: -12 });
      }

      // Generar Enemigos Zombis Espaciales
      if (frameCountRef.current % 35 === 0) {
        const randColor = Math.random() < 0.5 ? '#ef4444' : '#a855f7';
        enemiesRef.current.push({
          x: Math.random() * (W - 40) + 20,
          y: -20,
          radius: 14 + Math.random() * 8,
          speed: 1.8 + Math.random() * 1.5,
          hp: 2,
          maxHp: 2,
          color: randColor,
        });
      }

      // Mover y Dibujar Disparos
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.y += b.vy;
        ctx.fillRect(b.x - 2, b.y, 4, 12);

        if (b.y < -10) bulletsRef.current.splice(i, 1);
      }
      ctx.shadowBlur = 0;

      // Mover y Dibujar Enemigos
      for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
        const e = enemiesRef.current[i];
        e.y += e.speed;

        // Dibujar Enemigo Neón
        ctx.fillStyle = e.color;
        ctx.shadowColor = e.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Impacto de Balas con Enemigos
        for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
          const b = bulletsRef.current[j];
          const dist = Math.hypot(b.x - e.x, b.y - e.y);

          if (dist < e.radius + 4) {
            e.hp -= 1;
            bulletsRef.current.splice(j, 1);
            createExplosion(b.x, b.y, '#00f3ff', 4);

            if (e.hp <= 0) {
              createExplosion(e.x, e.y, e.color, 14);
              scoreRef.current += 50;
              specialRef.current = Math.min(100, specialRef.current + 8);
              
              if (Math.random() < 0.35) {
                coinsRef.current += 1;
              }

              setScore(scoreRef.current);
              setCoinsEarned(coinsRef.current);
              setSpecialEnergy(specialRef.current);
              enemiesRef.current.splice(i, 1);
              break;
            }
          }
        }

        // Impacto con el Jugador
        const playerDist = Math.hypot(playerXRef.current - e.x, (H - 50) - e.y);
        if (playerDist < e.radius + 16) {
          createExplosion(e.x, e.y, '#ef4444', 18);
          enemiesRef.current.splice(i, 1);
          livesRef.current -= 1;
          setLives(livesRef.current);

          if (livesRef.current <= 0) {
            gameOverRef.current = true;
            setGameOver(true);
            if (coinsRef.current > 0) addCoins(coinsRef.current);
          }
        } else if (e.y > H + 20) {
          enemiesRef.current.splice(i, 1);
        }
      }

      // Dibujar Partículas de Explosión
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04;

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
      }

      // Dibujar Nave Jugador
      const px = playerXRef.current;
      const py = H - 50;

      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.moveTo(px, py - 18);
      ctx.lineTo(px - 16, py + 14);
      ctx.lineTo(px, py + 6);
      ctx.lineTo(px + 16, py + 14);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins]);

  const handleRevive = () => {
    livesRef.current = 2;
    setLives(2);
    gameOverRef.current = false;
    setGameOver(false);
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none touch-none"
    >
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
          <span className="flex items-center gap-1 bg-black/60 border border-red-500/30 rounded-full px-3 py-1">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 text-xs font-bold">{lives}</span>
          </span>
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
      <div className="flex-1 flex items-center justify-center p-2 relative">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[65vh] object-contain bg-black/40"
        />

        {/* Botón de Bomba Especial */}
        <button
          onClick={handleUseSpecial}
          disabled={specialEnergy < 100}
          className={`absolute bottom-6 right-6 p-4 rounded-full border flex items-center justify-center transition-all ${
            specialEnergy >= 100
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 border-white text-white shadow-lg shadow-purple-500/50 animate-bounce active:scale-90'
              : 'bg-black/60 border-white/10 text-white/20 cursor-not-allowed'
          }`}
        >
          <Rocket className="w-6 h-6" />
        </button>
      </div>

      <p className="text-white/40 text-[10px] font-bold pb-4 text-center uppercase tracking-widest">
        Desliza el dedo abajo para mover la nave
      </p>

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
