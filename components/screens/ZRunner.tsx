'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Heart, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const W = 360;
const H = 540;

// Posiciones X para los 3 carriles
const LANES = [70, 180, 290];
const PLAYER_Y = 440;
const PLAYER_SIZE = 28;

interface Obstacle {
  lane: number;
  y: number;
  type: 'zombie' | 'laser';
  hasCoin?: boolean;
  coinCollected?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export function ZRunner() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [lives, setLives] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Estados del Jugador
  const laneRef = useRef(1); // Empieza en el carril central (1)
  const playerXRef = useRef(LANES[1]);
  const isJumpingRef = useRef(false);
  const jumpOffsetRef = useRef(0);
  const jumpVelocityRef = useRef(0);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const gameSpeedRef = useRef(4.5);
  const spawnTimerRef = useRef(0);

  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gameOverRef = useRef(false);
  const gameStartedRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);

  const initGame = useCallback(() => {
    laneRef.current = 1;
    playerXRef.current = LANES[1];
    isJumpingRef.current = false;
    jumpOffsetRef.current = 0;
    jumpVelocityRef.current = 0;

    obstaclesRef.current = [];
    particlesRef.current = [];
    gameSpeedRef.current = 4.5;
    spawnTimerRef.current = 0;

    scoreRef.current = 0;
    coinsRef.current = 0;
    gameOverRef.current = false;
    gameStartedRef.current = false;

    setScore(0);
    setCoinsEarned(0);
    setLives(1);
    setGameOver(false);
    setGameStarted(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const moveLeft = useCallback(() => {
    if (laneRef.current > 0) laneRef.current -= 1;
  }, []);

  const moveRight = useCallback(() => {
    if (laneRef.current < 2) laneRef.current += 1;
  }, []);

  const jump = useCallback(() => {
    if (!isJumpingRef.current) {
      isJumpingRef.current = true;
      jumpVelocityRef.current = -11;
    }
  }, []);

  const handleStartGame = useCallback(() => {
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      setGameStarted(true);
    }
  }, []);

  // Controles por Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleStartGame();
      if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft();
      if (e.key === 'ArrowRight' || e.key === 'd') moveRight();
      if (e.key === 'ArrowUp' || e.key === 'w' || e.code === 'Space') jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, jump, handleStartGame]);

  // Controles por Deslizamiento táctil (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    handleStartGame();
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 25) {
        if (dx > 0) moveRight();
        else moveLeft();
      }
    } else {
      if (dy < -25) jump();
    }
    touchStartRef.current = null;
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

  // Bucle Principal
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

      // Fondo Cyberpunk
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      // Dibujar Carriles y Pistas Neón
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(125, 0); ctx.lineTo(125, H);
      ctx.moveTo(235, 0); ctx.lineTo(235, H);
      ctx.stroke();

      if (gameStartedRef.current) {
        // Movimiento suave del jugador hacia su carril objetivo
        const targetX = LANES[laneRef.current];
        playerXRef.current += (targetX - playerXRef.current) * 0.25;

        // Física del Salto
        if (isJumpingRef.current) {
          jumpOffsetRef.current += jumpVelocityRef.current;
          jumpVelocityRef.current += 0.65; // Gravedad

          if (jumpOffsetRef.current >= 0) {
            jumpOffsetRef.current = 0;
            isJumpingRef.current = false;
          }
        }

        // Incrementar puntuación y velocidad
        scoreRef.current += 1;
        setScore(Math.floor(scoreRef.current / 5));
        gameSpeedRef.current += 0.0008;

        // Generar Obstáculos en los 3 carriles
        spawnTimerRef.current++;
        if (spawnTimerRef.current > 42) {
          spawnTimerRef.current = 0;
          const randomLane = Math.floor(Math.random() * 3);
          const type = Math.random() < 0.6 ? 'zombie' : 'laser';

          obstaclesRef.current.push({
            lane: randomLane,
            y: -40,
            type,
            hasCoin: Math.random() < 0.7,
          });
        }

        // Actualizar Obstáculos
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.y += gameSpeedRef.current;

          const obsX = LANES[obs.lane];

          // Recoger Moneda
          if (obs.hasCoin && !obs.coinCollected && Math.abs(obs.y - PLAYER_Y) < 30) {
            if (laneRef.current === obs.lane) {
              obs.coinCollected = true;
              coinsRef.current += 1;
              setCoinsEarned(coinsRef.current);
              createSparks(obsX, PLAYER_Y, '#ffb700', 8);
            }
          }

          // Detección de Colisión
          if (Math.abs(obs.y - PLAYER_Y) < 22 && laneRef.current === obs.lane) {
            // El salto esquiva únicamente los obstáculos tipo láser/barrera
            const isSafeByJump = obs.type === 'laser' && jumpOffsetRef.current < -18;

            if (!isSafeByJump) {
              createSparks(playerXRef.current, PLAYER_Y, '#ef4444', 20);
              gameOverRef.current = true;
              setGameOver(true);
              if (coinsRef.current > 0) addCoins(coinsRef.current);
            }
          }

          if (obs.y > H + 40) {
            obstaclesRef.current.splice(i, 1);
          }
        }
      }

      // Dibujar Obstáculos y Monedas
      for (const obs of obstaclesRef.current) {
        const ox = LANES[obs.lane];

        if (obs.type === 'zombie') {
          // Zombi Rojo Neón
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;
          ctx.fillRect(ox - 14, obs.y - 14, 28, 28);
          ctx.fillStyle = '#0a0e17';
          ctx.fillRect(ox - 8, obs.y - 8, 5, 5);
          ctx.fillRect(ox + 3, obs.y - 8, 5, 5);
        } else {
          // Láser Neón Bajo
          ctx.fillStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 12;
          ctx.fillRect(ox - 25, obs.y - 6, 50, 12);
        }

        // Moneda
        if (obs.hasCoin && !obs.coinCollected) {
          ctx.fillStyle = '#ffb700';
          ctx.shadowColor = '#ffb700';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(ox, obs.y - 35, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // Dibujar Jugador
      const px = playerXRef.current;
      const py = PLAYER_Y + jumpOffsetRef.current;

      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 16;
      ctx.fillRect(px - PLAYER_SIZE / 2, py - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);

      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(px - 6, py - 6, 4, 4);
      ctx.fillRect(px + 2, py - 6, 4, 4);
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
    obstaclesRef.current = obstaclesRef.current.filter((o) => Math.abs(o.y - PLAYER_Y) > 120);
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

      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[#00f3ff] font-black text-lg animate-bounce tracking-widest">
            ¡DESLIZA PARA MOVERTE Y SALTAR!
          </p>
          <p className="text-white/50 text-xs mt-1">Esquiva zombis y barreras neón</p>
        </div>
      )}

      {/* Canvas */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex items-center justify-center p-2 touch-none"
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[62vh] object-contain bg-black/50"
        />
      </div>

      {/* Botones virtuales abajo para celular */}
      <div className="pb-6 px-8 flex items-center justify-between gap-4">
        <button
          onClick={moveLeft}
          className="flex-1 py-3 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-xl text-[#00f3ff] flex justify-center items-center active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={jump}
          className="flex-1 py-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-400 font-bold text-xs flex justify-center items-center gap-1 active:scale-95"
        >
          <ChevronUp className="w-5 h-5" /> SALTAR
        </button>
        <button
          onClick={moveRight}
          className="flex-1 py-3 bg-[#00f3ff]/15 border border-[#00f3ff]/40 rounded-xl text-[#00f3ff] flex justify-center items-center active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
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
