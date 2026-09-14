'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Coins, Trophy, Heart, Zap, Shield, Swords } from 'lucide-react';
import { GameOverModal } from '@/components/game/GameOverModal';

const W = 360;
const H = 480;
const GROUND_Y = 380;

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

  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [specialEnergy, setSpecialEnergy] = useState(0);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Refs de estado interno de física y juego
  const playerXRef = useRef(80);
  const enemyXRef = useRef(260);
  const playerHpRef = useRef(100);
  const enemyHpRef = useRef(100);
  const specialRef = useRef(0);

  const playerStateRef = useRef<'idle' | 'punch' | 'kick' | 'block' | 'hit'>('idle');
  const enemyStateRef = useRef<'idle' | 'attack' | 'hit'>('idle');
  
  const stateTimerRef = useRef(0);
  const enemyTimerRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef(0);
  
  const scoreRef = useRef(0);
  const coinsRef = useRef(0);
  const gameOverRef = useRef(false);
  const rafRef = useRef<number>(0);

  const initGame = useCallback(() => {
    playerXRef.current = 80;
    enemyXRef.current = 260;
    playerHpRef.current = 100;
    enemyHpRef.current = 100;
    specialRef.current = 0;
    particlesRef.current = [];
    screenShakeRef.current = 0;
    scoreRef.current = 0;
    coinsRef.current = 0;
    gameOverRef.current = false;

    setPlayerHp(100);
    setEnemyHp(100);
    setSpecialEnergy(0);
    setScore(0);
    setCoinsEarned(0);
    setCombo(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  // Generador de chispas y partículas
  const createSparks = (x: number, y: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color,
        size: Math.random() * 4 + 2,
        life: 1.0,
      });
    }
  };

  // Acciones de Ataque del Jugador
  const handleAttack = (type: 'punch' | 'kick' | 'special') => {
    if (gameOverRef.current || playerStateRef.current !== 'idle') return;

    if (type === 'special') {
      if (specialRef.current < 100) return;
      specialRef.current = 0;
      setSpecialEnergy(0);
    }

    playerStateRef.current = type === 'special' ? 'punch' : type;
    stateTimerRef.current = 12;

    const dist = Math.abs(playerXRef.current - enemyXRef.current);
    if (dist < 70) {
      const damage = type === 'special' ? 40 : type === 'kick' ? 18 : 12;
      enemyHpRef.current = Math.max(0, enemyHpRef.current - damage);
      setEnemyHp(enemyHpRef.current);

      enemyStateRef.current = 'hit';
      screenShakeRef.current = type === 'special' ? 15 : 6;
      createSparks(enemyXRef.current, GROUND_Y - 50, type === 'special' ? '#ff0055' : '#00f3ff');

      // Cargar especial
      if (type !== 'special') {
        specialRef.current = Math.min(100, specialRef.current + 20);
        setSpecialEnergy(specialRef.current);
      }

      setCombo((prev) => prev + 1);
      scoreRef.current += 150;
      coinsRef.current = Math.floor(scoreRef.current / 100);
      setScore(scoreRef.current);
      setCoinsEarned(coinsRef.current);

      // Victoria / Siguiente Enemigo
      if (enemyHpRef.current <= 0) {
        setTimeout(() => {
          enemyHpRef.current = 100;
          setEnemyHp(100);
          enemyXRef.current = 260;
          scoreRef.current += 500;
          setScore(scoreRef.current);
        }, 600);
      }
    }
  };

  const handleBlock = () => {
    if (gameOverRef.current) return;
    playerStateRef.current = 'block';
    stateTimerRef.current = 15;
  };

  // Bucle Principal de Renderizado Canvas
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

      // Control del Screen Shake
      ctx.save();
      if (screenShakeRef.current > 0) {
        const dx = (Math.random() - 0.5) * screenShakeRef.current;
        const dy = (Math.random() - 0.5) * screenShakeRef.current;
        ctx.translate(dx, dy);
        screenShakeRef.current *= 0.85;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      // Fondo Cyberpunk Ring
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      // Malla Neón de Fondo
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < W; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke();
      }

      // Suelo del Ring
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(W, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Lógica de Estado de Jugador
      if (stateTimerRef.current > 0) {
        stateTimerRef.current--;
        if (stateTimerRef.current === 0) playerStateRef.current = 'idle';
      }

      // IA Enemiga (Ataques periódicos)
      enemyTimerRef.current++;
      if (enemyTimerRef.current > 70) {
        enemyTimerRef.current = 0;
        const dist = Math.abs(playerXRef.current - enemyXRef.current);
        if (dist < 70) {
          enemyStateRef.current = 'attack';
          setTimeout(() => {
            if (playerStateRef.current === 'block') {
              createSparks(playerXRef.current + 15, GROUND_Y - 40, '#ffb700', 6);
            } else {
              playerHpRef.current = Math.max(0, playerHpRef.current - 15);
              setPlayerHp(playerHpRef.current);
              playerStateRef.current = 'hit';
              stateTimerRef.current = 8;
              screenShakeRef.current = 8;
              createSparks(playerXRef.current, GROUND_Y - 40, '#ef4444', 10);
              setCombo(0);

              if (playerHpRef.current <= 0) {
                gameOverRef.current = true;
                setGameOver(true);
                if (coinsRef.current > 0) addCoins(coinsRef.current);
              }
            }
            enemyStateRef.current = 'idle';
          }, 200);
        } else {
          // Aproximarse
          enemyXRef.current -= 20;
        }
      }

      // DIBUJAR JUGADOR (Ciborg Neón Azul)
      const px = playerXRef.current;
      ctx.fillStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 14;

      // Cuerpo
      ctx.fillRect(px - 10, GROUND_Y - 60, 20, 40);
      // Cabeza
      ctx.beginPath();
      ctx.arc(px, GROUND_Y - 72, 10, 0, Math.PI * 2);
      ctx.fill();

      // Animación de Brazos/Piernas según estado
      if (playerStateRef.current === 'punch') {
        ctx.fillRect(px + 10, GROUND_Y - 52, 35, 8); // Puñetazo
      } else if (playerStateRef.current === 'kick') {
        ctx.fillRect(px + 10, GROUND_Y - 35, 38, 10); // Patada
      } else if (playerStateRef.current === 'block') {
        ctx.fillRect(px + 8, GROUND_Y - 62, 8, 30); // Escudo
      }

      // DIBUJAR ENEMIGO (Zombi Cibernético Rojo)
      const ex = enemyXRef.current;
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 14;

      ctx.fillRect(ex - 10, GROUND_Y - 60, 20, 40);
      ctx.beginPath();
      ctx.arc(ex, GROUND_Y - 72, 10, 0, Math.PI * 2);
      ctx.fill();

      if (enemyStateRef.current === 'attack') {
        ctx.fillRect(ex - 35, GROUND_Y - 52, 30, 8);
      }

      ctx.shadowBlur = 0;

      // DIBUJAR PARTÍCULAS
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

      ctx.restore();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins]);

  const handleRevive = () => {
    playerHpRef.current = 50;
    setPlayerHp(50);
    gameOverRef.current = false;
    setGameOver(false);
  };

  const handleDoubleCoins = () => {
    coinsRef.current *= 2;
    setCoinsEarned(coinsRef.current);
    if (coinsRef.current > 0) addCoins(coinsRef.current);
  };

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      {/* Header e Indicadores */}
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

      {/* Barras de HP y Super */}
      <div className="px-4 pt-3 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-[10px] text-[#00f3ff] font-bold mb-1">TÚ ({playerHp} HP)</p>
            <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-[#00f3ff]/40">
              <div
                className="h-full bg-gradient-to-r from-[#00f3ff] to-cyan-400 transition-all duration-200"
                style={{ width: `${playerHp}%` }}
              />
            </div>
          </div>
          <div className="flex-1 text-right">
            <p className="text-[10px] text-red-400 font-bold mb-1">ZOMBI CIBORG ({enemyHp} HP)</p>
            <div className="h-2.5 bg-black/60 rounded-full overflow-hidden border border-red-500/40">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                style={{ width: `${enemyHp}%` }}
              />
            </div>
          </div>
        </div>

        {/* Meter de Poder Especial */}
        <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-purple-500/30">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
            style={{ width: `${specialEnergy}%` }}
          />
        </div>
      </div>

      {/* Canvas del Ring */}
      <div className="flex-1 flex items-center justify-center p-2 relative">
        {combo > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-3 py-1 rounded-full bg-[#00f3ff]/20 border border-[#00f3ff] animate-bounce">
            <span className="text-[#00f3ff] font-black text-xs tracking-wider">{combo} COMBO! 🔥</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="border border-[#00f3ff]/30 rounded-2xl shadow-xl shadow-[#00f3ff]/10 max-h-[55vh] object-contain bg-black/40"
        />
      </div>

      {/* Controles de Pelea en Pantalla */}
      <div className="p-4 grid grid-cols-4 gap-2 bg-black/60 border-t border-[#00f3ff]/20 backdrop-blur-md">
        <button
          onClick={() => handleAttack('punch')}
          className="py-3 rounded-xl bg-[#00f3ff]/15 border border-[#00f3ff]/40 text-[#00f3ff] font-black text-xs active:scale-90 flex flex-col items-center justify-center gap-1"
        >
          <Swords className="w-4 h-4" /> PUÑO
        </button>
        <button
          onClick={() => handleAttack('kick')}
          className="py-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-400 font-black text-xs active:scale-90 flex flex-col items-center justify-center gap-1"
        >
          <Zap className="w-4 h-4" /> PATADA
        </button>
        <button
          onClick={handleBlock}
          className="py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-black text-xs active:scale-90 flex flex-col items-center justify-center gap-1"
        >
          <Shield className="w-4 h-4" /> BLOQUEO
        </button>
        <button
          onClick={() => handleAttack('special')}
          disabled={specialEnergy < 100}
          className={`py-3 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 transition-all ${
            specialEnergy >= 100
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/40 animate-pulse active:scale-90'
              : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
          }`}
        >
          <Heart className="w-4 h-4" /> SUPER
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
