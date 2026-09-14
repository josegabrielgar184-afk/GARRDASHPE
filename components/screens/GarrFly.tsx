'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Heart } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const W = 360;
const H = 540;
const GROUND_Y = 430;
const CUBE_SIZE = 28;
const GRAVITY = 0.65;
const JUMP_FORCE = -11.5;
const GAME_SPEED = 4.2;

interface Obstacle {
  x: number;
  type: 'spike' | 'block';
  width: number;
  height: number;
  hasCoin?: boolean;
  coinY?: number;
  coinCollected?: boolean;
  passed?: boolean;
}

export function GarrFly() {
  const { setScreen, addCoins, userRole, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [lives, setLives] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const playerYRef = useRef(GROUND_Y - CUBE_SIZE);
  const velocityYRef = useRef(0);
  const isGroundedRef = useRef(true);
  const angleRef = useRef(0);

  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameCountRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gameOverRef = useRef(false);
  const gameStartedRef = useRef(false);
  const rafRef = useRef<number>(0);

  const initGame = useCallback(() => {
    playerYRef.current = GROUND_Y - CUBE_SIZE;
    velocityYRef.current = 0;
    isGroundedRef.current = true;
    angleRef.current = 0;
    obstaclesRef.current = [];
    frameCountRef.current = 0;
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

  const handleJump = useCallback(() => {
    if (gameOverRef.current) return;
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      setGameStarted(true);
    }

    if (isGroundedRef.current) {
      velocityYRef.current = JUMP_FORCE;
      isGroundedRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

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

      // Fondo oscuro estilo Cyberpunk
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      // Rejilla Neón de Fondo
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }
      for (let j = 0; j < H; j += 30) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(W, j); ctx.stroke();
      }

      // Suelo Brillante
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (gameStartedRef.current) {
        frameCountRef.current++;
        spawnTimerRef.current++;

        // Física del Cubo
        velocityYRef.current += GRAVITY;
        playerYRef.current += velocityYRef.current;

        if (playerYRef.current >= GROUND_Y - CUBE_SIZE) {
          playerYRef.current = GROUND_Y - CUBE_SIZE;
          velocityYRef.current = 0;
          isGroundedRef.current = true;
          // Alinear el giro del cubo al suelo
          angleRef.current = Math.round(angleRef.current / (Math.PI / 2)) * (Math.PI / 2);
        } else {
          // Rotación continua durante el salto
          angleRef.current += 0.15;
        }

        // Generar Obstáculos (Pinchos / Bloques / Monedas)
        if (spawnTimerRef.current > 70) {
          spawnTimerRef.current = 0;
          const rand = Math.random();

          if (rand < 0.5) {
            // Pincho simple
            obstaclesRef.current.push({
              x: W + 20,
              type: 'spike',
              width: 26,
              height: 28,
              hasCoin: Math.random() < 0.7,
              coinY: GROUND_Y - 60,
            });
          } else if (rand < 0.8) {
            // Bloque bajo con moneda encima
            obstaclesRef.current.push({
              x: W + 20,
              type: 'block',
              width: 32,
              height: 32,
              hasCoin: true,
              coinY: GROUND_Y - 32 - 35,
            });
          } else {
            // Doble pincho
            obstaclesRef.current.push({
              x: W + 20,
              type: 'spike',
              width: 48,
              height: 28,
              hasCoin: true,
              coinY: GROUND_Y - 65,
            });
          }
        }

        const playerX = 60;

        // Mover y procesar obstáculos
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.x -= GAME_SPEED;

          // Sumar puntos por superar obstáculos
          if (!obs.passed && obs.x + obs.width < playerX) {
            obs.passed = true;
            scoreRef.current += 10;
            setScore(scoreRef.current);
          }

          // Recolectar Moneda
          if (obs.hasCoin && !obs.coinCollected) {
            const coinX = obs.x + obs.width / 2;
            const coinY = obs.coinY || GROUND_Y - 50;
            const dx = (playerX + CUBE_SIZE / 2) - coinX;
            const dy = (playerYRef.current + CUBE_SIZE / 2) - coinY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 22) {
              obs.coinCollected = true;
              coinsRef.current += 1;
              setCoinsEarned(coinsRef.current);
            }
          }

          // Detección de Colisiones (Hitbox)
          const pLeft = playerX + 4;
          const pRight = playerX + CUBE_SIZE - 4;
          const pBottom = playerYRef.current + CUBE_SIZE;
          const pTop = playerYRef.current + 4;

          const oLeft = obs.x;
          const oRight = obs.x + obs.width;
          const oTop = GROUND_Y - obs.height;

          if (pRight > oLeft && pLeft < oRight && pBottom > oTop) {
            gameOverRef.current = true;
            setGameOver(true);
            if (coinsRef.current > 0) addCoins(coinsRef.current);
          }

          // Eliminar del array cuando salgan de pantalla
          if (obs.x < -60) {
            obstaclesRef.current.splice(i, 1);
          }
        }
      }

      // Dibujar Obstáculos y Monedas
      for (const obs of obstaclesRef.current) {
        if (obs.type === 'spike') {
          // Pinchos Rojos Neón
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(obs.x, GROUND_Y);
          ctx.lineTo(obs.x + obs.width / 2, GROUND_Y - obs.height);
          ctx.lineTo(obs.x + obs.width, GROUND_Y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Bloques Azules Neón
          ctx.fillStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 10;
          ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.strokeRect(obs.x + 3, GROUND_Y - obs.height + 3, obs.width - 6, obs.height - 6);
        }

        // Dibujar Moneda Dorada
        if (obs.hasCoin && !obs.coinCollected) {
          const coinX = obs.x + obs.width / 2;
          const coinY = obs.coinY || GROUND_Y - 50;
          ctx.fillStyle = '#ffb700';
          ctx.shadowColor = '#ffb700';
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(coinX, coinY, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.shadowBlur = 0;

      // Dibujar Cubo (Jugador) con Rotación
      const px = 60 + CUBE_SIZE / 2;
      const py = playerYRef.current + CUBE_SIZE / 2;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angleRef.current);

      ctx.fillStyle = '#ffb700';
      ctx.shadowColor = '#ffb700';
      ctx.shadowBlur = 16;
      ctx.fillRect(-CUBE_SIZE / 2, -CUBE_SIZE / 2, CUBE_SIZE, CUBE_SIZE);

      // Ojos estilo icono del cubo
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(-CUBE_SIZE / 4, -CUBE_SIZE / 4, 6, 6);
      ctx.fillRect(CUBE_SIZE / 8, -CUBE_SIZE / 4, 6, 6);
      ctx.restore();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins]);

  const handleRevive = () => {
    gameOverRef.current = false;
    setGameOver(false);
    playerYRef.current = GROUND_Y - CUBE_SIZE;
    velocityYRef.current = JUMP_FORCE;
    obstaclesRef.current = obstaclesRef.current.filter((o) => o.x < 20 || o.x > 180);
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  const handleClose = () => {
    setScreen('arcade');
  };

  return (
    <div
      onClick={handleJump}
      className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none cursor-pointer"
    >
      <MuteButton />

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-3 pb-2 bg-gradient-to-b from-[#0a0e17] to-transparent pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setScreen('arcade');
          }}
          className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-sm font-bold active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-[#00f3ff]" /> Salir
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-red-500/30 rounded-full px-3 py-1.5">
            <Heart className="w-3.5 h-3.5 text-red-400" />
            <span className="text-red-400 text-xs font-bold">{lives}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-500/30 rounded-full px-3 py-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-400/30 rounded-full px-3 py-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold">{coinsEarned}</span>
          </span>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[#00f3ff] font-black text-xl animate-bounce tracking-widest">
            ¡TOCA PARA SALTAR!
          </p>
          <p className="text-white/50 text-xs mt-1">Esquiva pinchos y junta monedas</p>
        </div>
      )}

      {/* Canvas principal */}
      <div className="flex-1 flex items-center justify-center pt-14 pb-6 text-center">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="touch-none border border-[#00f3ff]/20 rounded-xl shadow-lg shadow-[#00f3ff]/10 max-h-[70vh]"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      <GameOverModal
        open={gameOver}
        onClose={handleClose}
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
