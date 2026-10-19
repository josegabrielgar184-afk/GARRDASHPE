'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { MiniGameOverModal } from '@/components/game/MiniGameOverModal';
import { ArrowLeft, Pause, Play, RotateCcw, Trophy, Sparkles, Coins } from 'lucide-react';
import { getMiniGameStats, recordMiniGameResult, hasSeenInstructions, markInstructionsSeen } from '@/lib/minigame-stats';
import { requestArcadeCredit, newSessionId, estimateTowerCoins, type RewardStatus } from '@/lib/arcade-credit';
import { playHit, playPickup, playGameOver, playCoin, startGameMusic, stopGameMusic, setGameMusicIntensity, initAudio } from '@/lib/audio';

const W = 360;
const H = 480;
const GAME_ID = 'tower';
const BLOCK_H = 26;
const BASE_Y = H - 30;
const PERFECT_TOLERANCE = 5;

interface Block {
  x: number;
  w: number;
  y: number;
  hue: number;
  perfect: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export function TowerPerfecta() {
  const { setScreen, userRole, vip, addCoins } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [heightBlocks, setHeightBlocks] = useState(0);
  const [paused, setPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showStartHint, setShowStartHint] = useState(true);
  const [stats, setStats] = useState(() => getMiniGameStats(GAME_ID));
  const [powerMsg, setPowerMsg] = useState('');

  const towerRef = useRef<Block[]>([]);
  const movingRef = useRef<{ x: number; w: number; dir: number; speed: number; hue: number } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const fallingRef = useRef<Block[]>([]);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const blocksPlacedRef = useRef(0);
  const perfectsRef = useRef(0);
  const rewardCreditedRef = useRef(false);
  const pendingRewardRef = useRef(0);
  const rewardCreditedFsRef = useRef(false);
  const sessionIdRef = useRef(newSessionId());
  const [pendingReward, setPendingReward] = useState(0);
  const [rewardCreditedFs, setRewardCreditedFs] = useState(false);
  const [rewardStatus, setRewardStatus] = useState<RewardStatus>('idle');
  const [liveCoins, setLiveCoins] = useState(0);
  const stabilizeUsedRef = useRef(false);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const cameraRef = useRef(0); // desplazamiento vertical de camara
  const spawnSideRef = useRef(1);
  const showInstructionsRef = useRef(false);
  const continueUsedRef = useRef(false);
  const screenMsgUntilRef = useRef(0);

  const towerTopY = useCallback(() => {
    const top = towerRef.current[towerRef.current.length - 1];
    return top ? top.y : BASE_Y;
  }, []);

  const spawnMovingBlock = useCallback(() => {
    const top = towerRef.current[towerRef.current.length - 1];
    const topW = top ? top.w : 90;
    const y = towerTopY() - BLOCK_H;
    const dir = spawnSideRef.current;
    const speed = 1.8 + Math.min(3.2, towerRef.current.length * 0.12);
    movingRef.current = {
      x: dir > 0 ? -topW : W,
      w: topW,
      dir,
      speed,
      hue: (Date.now() / 40) % 360,
    };
    spawnSideRef.current *= -1;
  }, [towerTopY]);

  const initGame = useCallback(() => {
    towerRef.current = [{ x: W / 2 - 45, w: 90, y: BASE_Y, hue: 190, perfect: false }];
    fallingRef.current = [];
    particlesRef.current = [];
    movingRef.current = null;
    scoreRef.current = 0;
    comboRef.current = 0;
    blocksPlacedRef.current = 0;
    perfectsRef.current = 0;
    rewardCreditedRef.current = false;
    pendingRewardRef.current = 0;
    sessionIdRef.current = newSessionId();
    setPendingReward(0);
    setRewardStatus('idle');
    setRewardCreditedFs(false);
    setLiveCoins(0);
    stabilizeUsedRef.current = false;
    continueUsedRef.current = false;
    gameOverRef.current = false;
    cameraRef.current = 0;
    startTimeRef.current = Date.now();
    setScore(0);
    setCombo(0);
    setHeightBlocks(0);
    setGameOver(false);
    setPowerMsg('');
    spawnMovingBlock();
  }, [spawnMovingBlock]);

  useEffect(() => {
    initGame();
    setShowStartHint(true);
    if (!hasSeenInstructions(GAME_ID)) {
      setShowInstructions(true);
      markInstructionsSeen(GAME_ID);
    }
  }, [initGame]);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { showInstructionsRef.current = showInstructions; }, [showInstructions]);

  useEffect(() => {
    return () => { stopGameMusic(); };
  }, []);

  const createSparks = (x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1.5, color, life: 1 });
    }
  };

  const flashPower = (msg: string) => {
    setPowerMsg(msg);
    screenMsgUntilRef.current = Date.now() + 1800;
    setTimeout(() => {
      if (Date.now() >= screenMsgUntilRef.current) setPowerMsg('');
    }, 1900);
  };

  // Aprobacion de recompensa en el servidor (registro idempotente con tope diario).
  // Sin backend autorizado para Firestore, la aprobacion NO se abona al saldo:
  // el monto aprobado se muestra como pendiente de acreditacion.
  const creditReward = useCallback(async () => {
    if (rewardCreditedRef.current) return;
    rewardCreditedRef.current = true;
    setRewardStatus('loading');
    const result = await requestArcadeCredit('tower', sessionIdRef.current, {
      blocks_placed: blocksPlacedRef.current,
      perfects: perfectsRef.current,
    });
    if (result.credited > 0) {
      pendingRewardRef.current = result.credited;
      rewardCreditedFsRef.current = result.firestore_credited === true;
      setPendingReward(result.credited);
      setRewardCreditedFs(result.firestore_credited === true);
      setRewardStatus(result.firestore_credited === true ? 'credited' : 'pending');
    } else if (result.duplicate || result.capped) {
      setRewardStatus('none');
    } else {
      setRewardStatus('failed');
    }
  }, []);

  const triggerGameOver = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    stopGameMusic();
    playGameOver();
    void creditReward();
    const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setStats(recordMiniGameResult(GAME_ID, scoreRef.current, dur));
    setGameOver(true);
  }, [creditReward]);

  const dropBlock = useCallback(() => {
    const moving = movingRef.current;
    if (!moving || gameOverRef.current || pausedRef.current) return;

    const top = towerRef.current[towerRef.current.length - 1];
    if (!top) return;

    // Solapamiento con el bloque superior
    const movingLeft = moving.x - moving.w / 2;
    const movingRight = moving.x + moving.w / 2;
    const topLeft = top.x - top.w / 2;
    const topRight = top.x + top.w / 2;

    const overlapLeft = Math.max(movingLeft, topLeft);
    const overlapRight = Math.min(movingRight, topRight);
    const overlapW = overlapRight - overlapLeft;

    if (overlapW <= 2) {
      // Falló completamente: el bloque cae entero
      playGameOver();
      fallingRef.current.push({ x: moving.x, w: moving.w, y: top.y - BLOCK_H, hue: moving.hue, perfect: false });
      movingRef.current = null;
      triggerGameOver();
      return;
    }

    const offset = Math.abs(moving.x - top.x);
    const perfect = offset <= PERFECT_TOLERANCE;

    if (perfect) {
      // Perfecto: bloque completo, centrado, combo crece
      comboRef.current += 1;
      perfectsRef.current += 1;
      blocksPlacedRef.current += 1;
      setCombo(comboRef.current);
      const bonus = 50 + Math.min(150, (comboRef.current - 1) * 25);
      scoreRef.current += 100 + bonus;
      playCoin();
      playPickup();
      createSparks(moving.x, top.y - BLOCK_H, '#ffb700', 16);
      flashPower(comboRef.current > 1 ? `¡PERFECTO x${comboRef.current}!` : '¡PERFECTO!');
      towerRef.current.push({ x: top.x, w: top.w, y: top.y - BLOCK_H, hue: moving.hue, perfect: true });
    } else {
      // Recorte: la parte sobresaliente se cae
      comboRef.current = 0;
      setCombo(0);
      const newW = overlapW;
      const newX = (overlapLeft + overlapRight) / 2;
      const trim = moving.w - newW;
      scoreRef.current += Math.round(20 + (newW / moving.w) * 40);
      playHit();
      // Partes cortadas que caen
      const cutLeft = movingLeft < topLeft;
      const cutW = trim;
      const cutX = cutLeft
        ? movingLeft + cutW / 2
        : movingRight - cutW / 2;
      fallingRef.current.push({ x: cutX, w: cutW, y: top.y - BLOCK_H, hue: moving.hue, perfect: false });
      createSparks(cutX, top.y - BLOCK_H, '#00f3ff', 8);
      towerRef.current.push({ x: newX, w: newW, y: top.y - BLOCK_H, hue: moving.hue, perfect: false });
      blocksPlacedRef.current += 1;
    }

    setScore(scoreRef.current);
    setHeightBlocks(towerRef.current.length - 1);
    setLiveCoins(estimateTowerCoins(blocksPlacedRef.current, perfectsRef.current));
    // Intensidad musical y ciudad segun altura real de la torre
    setGameMusicIntensity(Math.min(1, towerRef.current.length / 40));

    // Camara sigue a la torre
    const topY = towerRef.current[towerRef.current.length - 1].y;
    if (topY < H * 0.45) {
      cameraRef.current += BLOCK_H;
    }

    // Poder de estabilizacion cada 8 bloques perfectos acumulados
    if (!stabilizeUsedRef.current && comboRef.current >= 8) {
      stabilizeUsedRef.current = true;
      // Estabiliza: alinea el proximo bloque al centro del tope
      flashPower('ESTABILIZADO: próximo bloque centrado');
      const nextTop = towerRef.current[towerRef.current.length - 1];
      spawnSideRef.current = 1;
      movingRef.current = {
        x: -nextTop.w,
        w: nextTop.w,
        dir: 1,
        speed: 1.8 + Math.min(3.2, towerRef.current.length * 0.12),
        hue: (Date.now() / 40) % 360,
      };
      return;
    }

    spawnMovingBlock();
  }, [spawnMovingBlock, triggerGameOver]);

  // ── Bucle principal ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = (time: number) => {
      const dt = Math.min(32, time - lastTimeRef.current) / 16.67;
      lastTimeRef.current = time;

      const isPaused = pausedRef.current || gameOverRef.current || showInstructionsRef.current;

      if (!isPaused) {
        const moving = movingRef.current;
        if (moving) {
          moving.x += moving.dir * moving.speed * dt;
          // Rebote horizontal
          if (moving.x + moving.w / 2 > W - 4) { moving.x = W - 4 - moving.w / 2; moving.dir = -1; }
          if (moving.x - moving.w / 2 < 4) { moving.x = 4 + moving.w / 2; moving.dir = 1; }
        }
      }

      // ── Render ──
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      // Fondo: cuadricula tenue
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }

      // Fondo: degradado del cielo segun altura de camara
      const alt = Math.floor(cameraRef.current / BLOCK_H);
      const skyT = Math.min(1, alt / 60);
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, `rgba(${Math.round(10 + skyT * 40)},${Math.round(14 + skyT * 10)},${Math.round(23 + skyT * 60)},1)`);
      grad.addColorStop(1, 'rgba(10,14,23,1)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Ciudad nocturna: edificios fijos con ventanas, se desplazan con la camara
      const bSeed = (n: number) => { const x = Math.sin(n * 91.7) * 14357.31; return x - Math.floor(x); };
      ctx.save();
      const cityScroll = (cameraRef.current * 0.35) % 90;
      for (let b = -1; b < 14; b++) {
        const bw = 26 + bSeed(b) * 22;
        const bx = b * 28 - 10 + bSeed(b + 7) * 8;
        const bh = 46 + bSeed(b + 3) * 92;
        const by = H - bh + cityScroll * 0.6;
        ctx.fillStyle = 'rgba(12,18,32,0.85)';
        ctx.fillRect(bx, by, bw, bh);
        // Ventanas encendidas
        ctx.fillStyle = `rgba(255,183,0,${0.10 + skyT * 0.08})`;
        for (let wx = 3; wx < bw - 3; wx += 7) {
          for (let wy = 6; wy < bh - 6; wy += 10) {
            if (bSeed(b * 31 + wx * 7 + wy * 13) > 0.55) ctx.fillRect(bx + wx, by + wy, 3, 4);
          }
        }
      }
      ctx.restore();

      const cam = cameraRef.current;

      // Torre
      for (const block of towerRef.current) {
        const sy = block.y + cam;
        if (sy < -BLOCK_H || sy > H + BLOCK_H) continue;
        const color = block.perfect ? '#ffb700' : '#00f3ff';
        ctx.fillStyle = `hsl(${block.hue}, 70%, 55%)`;
        ctx.shadowColor = color;
        ctx.shadowBlur = block.perfect ? 12 : 6;
        ctx.fillRect(block.x - block.w / 2, sy, block.w, BLOCK_H - 2);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.strokeRect(block.x - block.w / 2, sy, block.w, BLOCK_H - 2);
      }

      // Bloque en movimiento
      const moving = movingRef.current;
      if (moving) {
        const sy = (towerTopY() - BLOCK_H) + cam;
        ctx.fillStyle = `hsl(${moving.hue}, 70%, 60%)`;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 10;
        ctx.fillRect(moving.x - moving.w / 2, sy, moving.w, BLOCK_H - 2);
        ctx.shadowBlur = 0;
      }

      // Bloques cortados cayendo
      for (let i = fallingRef.current.length - 1; i >= 0; i--) {
        const b = fallingRef.current[i];
        b.y += 3.5 * dt;
        b.x += (b.x < W / 2 ? -0.8 : 0.8) * dt;
        const sy = b.y + cam;
        if (sy > H + BLOCK_H) { fallingRef.current.splice(i, 1); continue; }
        ctx.fillStyle = `hsl(${b.hue}, 60%, 45%)`;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(b.x - b.w / 2, sy, b.w, BLOCK_H - 2);
        ctx.globalAlpha = 1;
      }

      // Linea guia del centro del tope
      const top = towerRef.current[towerRef.current.length - 1];
      if (top && moving) {
        ctx.strokeStyle = 'rgba(255,183,0,0.35)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(top.x, 20);
        ctx.lineTo(top.x, H);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Particulas
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.1 * dt;
        p.life -= 0.04 * dt;
        if (p.life <= 0) { particlesRef.current.splice(i, 1); continue; }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y + cam, 3, 3);
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); stopGameMusic(); };
  }, [towerTopY]);

  // ── Controles ──
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    if (gameOverRef.current || pausedRef.current || showInstructionsRef.current) return;
    initAudio();
    if (showStartHint) {
      setShowStartHint(false);
      startGameMusic('tower');
    }
    dropBlock();
  };

  // Teclado (web): espacio coloca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameOverRef.current || pausedRef.current || showInstructionsRef.current) return;
        dropBlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dropBlock]);

  const handleRestart = () => {
    initGame();
    startGameMusic('tower');
  };

  // Continuacion unica: estabiliza y otorga un bloque de gracia
  const handleContinue = () => {
    gameOverRef.current = false;
    setGameOver(false);
    comboRef.current = 0;
    setCombo(0);
    // Estado seguro: el bloque que falló se elimina y el proximo entra alineado
    fallingRef.current = [];
    const top = towerRef.current[towerRef.current.length - 1];
    if (top) {
      spawnSideRef.current = 1;
      movingRef.current = {
        x: -top.w,
        w: top.w,
        dir: 1,
        speed: 1.8 + Math.min(3.2, towerRef.current.length * 0.12),
        hue: (Date.now() / 40) % 360,
      };
    }
    startGameMusic('tower');
  };

  const durationSec = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      {/* Header */}
      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#00f3ff]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => { stopGameMusic(); setScreen('arcade'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#00f3ff]" /> Salir
        </button>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-bold text-[#ffb700]">
            <Trophy className="w-3.5 h-3.5" /> {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Barra de estado */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-bold">
        <span className="text-[#00f3ff]">ALTURA: {heightBlocks}</span>
        <span className={combo >= 2 ? 'text-amber-400 animate-pulse' : 'text-white/40'}>
          {combo >= 2 ? `PERFECTOS x${combo}` : 'COMBO 0'}
        </span>
        <span className="flex items-center gap-1 text-amber-400">
          <Coins className="w-3 h-3" /> {liveCoins}
        </span>
        <span className="text-white/50">RÉCORD: {stats.highScore.toLocaleString()}</span>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-2 touch-none">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={handlePointerDown}
            className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[60vh] object-contain bg-black/50 touch-none"
          />

          {/* Botones de pausa / reinicio */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            {!paused && !gameOver && (
              <button
                onClick={(e) => { e.stopPropagation(); setPaused(true); stopGameMusic(); }}
                className="w-9 h-9 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center active:scale-95"
                aria-label="Pausa"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            )}
            {paused && !gameOver && (
              <button
                onClick={(e) => { e.stopPropagation(); setPaused(false); startGameMusic('tower'); }}
                className="w-9 h-9 rounded-lg bg-black/60 border border-[#00f3ff]/40 flex items-center justify-center active:scale-95"
                aria-label="Reanudar"
              >
                <Play className="w-4 h-4 text-[#00f3ff]" />
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); setPaused(false); initGame(); startGameMusic('tower'); }}
              className="w-9 h-9 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center active:scale-95"
              aria-label="Reiniciar"
            >
              <RotateCcw className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Mensaje flotante: toca para colocar */}
          {!gameOver && !paused && score === 0 && combo === 0 && showStartHint && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-xl bg-black/70 border border-[#00f3ff]/30 text-center">
                <p className="text-[#00f3ff] font-black text-sm">TOCA PARA COLOCAR</p>
                <p className="text-white/50 text-[11px] mt-0.5">El bloque se mueve solo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones primera vez */}
      {showInstructions && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-[#00f3ff]/30 p-6 text-center animate-scale-in">
            <p className="text-[#00f3ff] font-black text-xl mb-3">TORRE PERFECTA</p>
            <ul className="text-left text-white/70 text-xs space-y-2 mb-5">
              <li>- Un toque coloca el bloque en movimiento.</li>
              <li>- Lo que sobresalga se recorta y cae: el bloque se vuelve más angosto.</li>
              <li>- Colocar el bloque centrado es PERFECTO: mantiene el ancho y suma combo con bono extra.</li>
              <li>- Cada 8 perfectos seguidos obtienes una estabilización que centra el siguiente bloque.</li>
              <li>- Si el bloque no toca la torre, la partida termina.</li>
              <li>- La velocidad aumenta con la altura.</li>
            </ul>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-3 rounded-xl bg-[#00f3ff]/20 border border-[#00f3ff]/40 text-[#00f3ff] font-bold text-sm active:scale-95"
            >
              ¡A jugar!
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de poder */}
      {powerMsg && !gameOver && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 animate-pulse">
          <span className="text-amber-400 text-xs font-black flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> {powerMsg}
          </span>
        </div>
      )}

      <MiniGameOverModal
        open={gameOver && !paused}
        score={score}
        highScore={stats.highScore}
        gamesPlayed={stats.gamesPlayed}
        durationSec={durationSec}
        onRestart={handleRestart}
        onExit={() => { stopGameMusic(); setScreen('arcade'); }}
        canContinue
        onContinue={handleContinue}
        continueText="Ver anuncio para continuar"
        userRole={userRole}
        vip={vip}
        rewardStatus={rewardStatus}
        rewardAmount={pendingReward}
      />
    </div>
  );
}
