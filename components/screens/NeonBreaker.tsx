'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { MiniGameOverModal } from '@/components/game/MiniGameOverModal';
import { ArrowLeft, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import { getMiniGameStats, recordMiniGameResult, hasSeenInstructions, markInstructionsSeen } from '@/lib/minigame-stats';
import { neonBreakerCoins } from '@/lib/arcade-rewards';
import { playHit, playCoin, playPickup, playVictory, playGameOver, playBarrelHit, startGameMusic, stopGameMusic, setGameMusicIntensity, initAudio } from '@/lib/audio';

const W = 360;
const H = 480;
const GAME_ID = 'neonbreaker';

const BRICK_COLS = 10;
const BRICK_W = 34;
const BRICK_H = 16;
const BRICK_GAP = 2;
const BRICK_TOP = 42;

// '1' normal (1 golpe) | '2' resistente (2 golpes) | 'S' especial (suelta poder)
const LEVELS: string[][] = [
  [
    '1111111111',
    '11S11111S1',
    '1111111111',
  ],
  [
    '2222222222',
    '1S111111S1',
    '1111111111',
    '1111111111',
  ],
  [
    '2S2222S222',
    '2222222222',
    '111S11S111',
    '1111111111',
    '1111111111',
  ],
  [
    'S2S2S2S2S2',
    '2222222222',
    '2222222222',
    '1111111111',
    '1111111111',
    '1111111111',
  ],
  [
    'S22222222S',
    '22S2222S22',
    '2222222222',
    '2211111122',
    '1111SS1111',
    '1111111111',
    '1111111111',
  ],
];

type PowerType = 'wide' | 'slow' | 'shield';

interface Brick {
  col: number;
  row: number;
  hp: number;
  maxHp: number;
  special: boolean;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  stuck: boolean;
}

interface FallingPower {
  x: number;
  y: number;
  type: PowerType;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

const POWER_COLORS: Record<PowerType, string> = {
  wide: '#00f3ff',
  slow: '#34d399',
  shield: '#ffb700',
};

const POWER_LABELS: Record<PowerType, string> = {
  wide: 'PLATAFORMA ANCHA',
  slow: 'PELOTA LENTA',
  shield: 'ESCUDO',
};

export function NeonBreaker() {
  const { setScreen, userRole, vip, addCoins } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [running, setRunning] = useState(false); // pelota en juego tras el saque
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [powerMsg, setPowerMsg] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [stats, setStats] = useState(() => getMiniGameStats(GAME_ID));

  const bricksRef = useRef<Brick[]>([]);
  const ballsRef = useRef<Ball[]>([]);
  const powersRef = useRef<FallingPower[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const paddleXRef = useRef(W / 2);
  const paddleWRef = useRef(64);
  const basePaddleWRef = useRef(64);
  const shieldRef = useRef(false);
  const slowUntilRef = useRef(0);
  const wideUntilRef = useRef(0);
  const speedMulRef = useRef(1);
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const blocksDestroyedRef = useRef(0);
  const levelsClearedRef = useRef(0);
  const rewardCreditedRef = useRef(false);
  const pendingRewardRef = useRef(0);
  const [pendingReward, setPendingReward] = useState(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const startTimeRef = useRef(0);
  const pausedRef = useRef(false);
  const runningRef = useRef(false);
  const gameOverRef = useRef(false);
  const dragRef = useRef<{ active: boolean; lastX: number }>({ active: false, lastX: 0 });
  const continueUsedRef = useRef(false);
  const screenMsgUntilRef = useRef(0);

  const buildBricks = useCallback((lvl: number) => {
    const pattern = LEVELS[(lvl - 1) % LEVELS.length];
    const rows = Math.min(pattern.length, Math.floor((H - 160) / (BRICK_H + BRICK_GAP)));
    const bricks: Brick[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const ch = pattern[r][c] ?? '1';
        if (ch === '.') continue;
        const hp = ch === '2' ? 2 : 1;
        bricks.push({ col: c, row: r, hp, maxHp: hp, special: ch === 'S' });
      }
    }
    bricksRef.current = bricks;
  }, []);

  const launchBall = useCallback(() => {
    const ball = ballsRef.current[0];
    if (!ball) return;
    if (!ball.stuck) return;
    ball.stuck = false;
    const speed = 3.4 + (levelRef.current - 1) * 0.35;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    ball.dx = Math.cos(angle) * speed;
    ball.dy = Math.sin(angle) * speed;
    runningRef.current = true;
    setRunning(true);
  }, []);

  const resetBall = useCallback(() => {
    const speed = 3.4 + (levelRef.current - 1) * 0.35;
    ballsRef.current = [{
      x: paddleXRef.current,
      y: H - 34,
      dx: 0,
      dy: 0,
      stuck: true,
    }];
    speedMulRef.current = 1;
    ballsRef.current[0].dx = 0;
    ballsRef.current[0].dy = -speed;
    void speed;
  }, []);

  const startLevel = useCallback((lvl: number) => {
    levelRef.current = lvl;
    setLevel(lvl);
    buildBricks(lvl);
    powersRef.current = [];
    shieldRef.current = false;
    slowUntilRef.current = 0;
    wideUntilRef.current = 0;
    basePaddleWRef.current = 64;
    paddleWRef.current = 64;
    resetBall();
    comboRef.current = 0;
    setCombo(0);
    // Intensidad musical segun nivel (progreso real de la partida)
    setGameMusicIntensity(Math.min(1, (lvl - 1) / 4));
  }, [buildBricks, resetBall]);

  const initGame = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = 3;
    comboRef.current = 0;
    blocksDestroyedRef.current = 0;
    levelsClearedRef.current = 0;
    rewardCreditedRef.current = false;
    pendingRewardRef.current = 0;
    setPendingReward(0);
    continueUsedRef.current = false;
    setScore(0);
    setLives(3);
    setCombo(0);
    setGameOver(false);
    setVictory(false);
    gameOverRef.current = false;
    setPowerMsg('');
    startTimeRef.current = Date.now();
    startLevel(1);
  }, [startLevel]);

  useEffect(() => {
    initGame();
    if (!hasSeenInstructions(GAME_ID)) {
      setShowInstructions(true);
      markInstructionsSeen(GAME_ID);
    }
  }, [initGame]);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const flashPower = (type: PowerType) => {
    setPowerMsg(POWER_LABELS[type]);
    screenMsgUntilRef.current = Date.now() + 2000;
    setTimeout(() => {
      if (Date.now() >= screenMsgUntilRef.current) setPowerMsg('');
    }, 2100);
  };

  const collectPower = (type: PowerType) => {
    playPickup();
    flashPower(type);
    if (type === 'wide') {
      wideUntilRef.current = Date.now() + 20000;
      paddleWRef.current = basePaddleWRef.current * 1.5;
    } else if (type === 'slow') {
      slowUntilRef.current = Date.now() + 15000;
      for (const b of ballsRef.current) {
        b.dx *= 0.7;
        b.dy *= 0.7;
      }
    } else {
      shieldRef.current = true;
    }
  };

  const spawnPower = (x: number, y: number) => {
    const types: PowerType[] = ['wide', 'slow', 'shield'];
    powersRef.current.push({ x, y, type: types[Math.floor(Math.random() * types.length)] });
  };

  const createSparks = (x: number, y: number, color: string, count = 10) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1, color, life: 1 });
    }
  };

  const triggerGameOver = useCallback(() => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    stopGameMusic();
    playGameOver();
    // Recompensa por progreso: una sola vez por partida (bloques + niveles)
    if (!rewardCreditedRef.current) {
      rewardCreditedRef.current = true;
      const reward = neonBreakerCoins(blocksDestroyedRef.current, levelsClearedRef.current, levelRef.current);
      if (reward > 0) { addCoins(reward, 'gameplay'); pendingRewardRef.current = reward; }
    }
    const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setStats(recordMiniGameResult(GAME_ID, scoreRef.current, dur));
    setGameOver(true);
    setRunning(false);
    runningRef.current = false;
    setPendingReward(pendingRewardRef.current);
  }, [addCoins]);

  const triggerVictory = useCallback(() => {
    gameOverRef.current = true;
    stopGameMusic();
    playVictory();
    scoreRef.current += 1000;
    setScore(scoreRef.current);
    if (!rewardCreditedRef.current) {
      rewardCreditedRef.current = true;
      const reward = neonBreakerCoins(blocksDestroyedRef.current, levelsClearedRef.current, levelRef.current);
      if (reward > 0) { addCoins(reward, 'gameplay'); pendingRewardRef.current = reward; }
    }
    const dur = Math.floor((Date.now() - startTimeRef.current) / 1000);
    setStats(recordMiniGameResult(GAME_ID, scoreRef.current, dur));
    setVictory(true);
    setGameOver(true);
    setRunning(false);
    runningRef.current = false;
    setPendingReward(pendingRewardRef.current);
  }, [addCoins]);

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

      if (!isPaused && runningRef.current) {
        const paddleW = paddleWRef.current;
        const paddleH = 10;
        const paddleY = H - 22;
        const now = Date.now();

        if (wideUntilRef.current && now > wideUntilRef.current) {
          wideUntilRef.current = 0;
          paddleWRef.current = basePaddleWRef.current;
        }
        if (slowUntilRef.current && now > slowUntilRef.current) {
          slowUntilRef.current = 0;
        }

        // Poderes cayendo
        for (let i = powersRef.current.length - 1; i >= 0; i--) {
          const p = powersRef.current[i];
          p.y += 2.2 * dt;
          if (
            p.y > paddleY - 8 && p.y < paddleY + paddleH + 8 &&
            p.x > paddleXRef.current - paddleW / 2 - 8 &&
            p.x < paddleXRef.current + paddleW / 2 + 8
          ) {
            collectPower(p.type);
            createSparks(p.x, p.y, POWER_COLORS[p.type], 12);
            powersRef.current.splice(i, 1);
          } else if (p.y > H + 12) {
            powersRef.current.splice(i, 1);
          }
        }

        // Pelotas
        for (let bi = ballsRef.current.length - 1; bi >= 0; bi--) {
          const ball = ballsRef.current[bi];
          if (ball.stuck) {
            ball.x = paddleXRef.current;
            ball.y = paddleY - 8;
            continue;
          }

          ball.x += ball.dx * dt;
          ball.y += ball.dy * dt;

          if (ball.x < 6) { ball.x = 6; ball.dx = Math.abs(ball.dx); playBarrelHit(); }
          if (ball.x > W - 6) { ball.x = W - 6; ball.dx = -Math.abs(ball.dx); playBarrelHit(); }
          if (ball.y < 6) { ball.y = 6; ball.dy = Math.abs(ball.dy); playBarrelHit(); }

          // Plataforma
          if (
            ball.dy > 0 &&
            ball.y + 6 > paddleY &&
            ball.y - 6 < paddleY + paddleH &&
            ball.x > paddleXRef.current - paddleW / 2 - 4 &&
            ball.x < paddleXRef.current + paddleW / 2 + 4
          ) {
            ball.y = paddleY - 6;
            const hitPos = (ball.x - paddleXRef.current) / (paddleW / 2);
            const speed = Math.hypot(ball.dx, ball.dy);
            const angle = -Math.PI / 2 + hitPos * 1.05;
            ball.dx = Math.cos(angle) * speed;
            ball.dy = Math.sin(angle) * speed;
            comboRef.current = 0;
            setCombo(0);
            playBarrelHit();
          }

          // Escudo: salva una caida
          if (ball.y > H - 4) {
            if (shieldRef.current) {
              shieldRef.current = false;
              ball.y = H - 30;
              ball.dy = -Math.abs(ball.dy);
              createSparks(ball.x, H - 10, '#ffb700', 18);
              playPickup();
              flashPower('shield');
              continue;
            }
            ballsRef.current.splice(bi, 1);
            if (ballsRef.current.length === 0) {
              livesRef.current -= 1;
              setLives(livesRef.current);
              if (livesRef.current <= 0) {
                triggerGameOver();
              } else {
                resetBall();
                runningRef.current = false;
                setRunning(false);
                comboRef.current = 0;
                setCombo(0);
              }
            }
            continue;
          }

          // Bloques
          for (let i = bricksRef.current.length - 1; i >= 0; i--) {
            const brick = bricksRef.current[i];
            const bx = brick.col * (BRICK_W + BRICK_GAP) + 4;
            const by = brick.row * (BRICK_H + BRICK_GAP) + BRICK_TOP;

            if (
              ball.x + 6 > bx && ball.x - 6 < bx + BRICK_W &&
              ball.y + 6 > by && ball.y - 6 < by + BRICK_H
            ) {
              // Rebote por el lado mas cercano
              const overlapL = ball.x + 6 - bx;
              const overlapR = bx + BRICK_W - (ball.x - 6);
              const overlapT = ball.y + 6 - by;
              const overlapB = by + BRICK_H - (ball.y - 6);
              const minO = Math.min(overlapL, overlapR, overlapT, overlapB);
              if (minO === overlapL) { ball.dx = -Math.abs(ball.dx); ball.x = bx - 6; }
              else if (minO === overlapR) { ball.dx = Math.abs(ball.dx); ball.x = bx + BRICK_W + 6; }
              else if (minO === overlapT) { ball.dy = -Math.abs(ball.dy); ball.y = by - 6; }
              else { ball.dy = Math.abs(ball.dy); ball.y = by + BRICK_H + 6; }

              brick.hp -= 1;
              if (brick.hp <= 0) {
                const color = brick.special ? '#ffb700' : brick.maxHp > 1 ? '#00f3ff' : '#ef4444';
                createSparks(bx + BRICK_W / 2, by + BRICK_H / 2, color, brick.special ? 14 : 8);
                if (brick.special) {
                  spawnPower(bx + BRICK_W / 2, by + BRICK_H / 2);
                  playCoin();
                } else {
                  playHit();
                }
                bricksRef.current.splice(i, 1);
                blocksDestroyedRef.current += 1;

                comboRef.current += 1;
                setCombo(comboRef.current);
                const mult = Math.min(5, 1 + Math.floor(comboRef.current / 4));
                scoreRef.current += (brick.maxHp > 1 ? 30 : 10) * mult;
                setScore(scoreRef.current);
              } else {
                playBarrelHit();
                createSparks(bx + BRICK_W / 2, by + BRICK_H / 2, '#00f3ff', 5);
              }

              if (bricksRef.current.length === 0) {
                if (levelRef.current >= LEVELS.length) {
                  levelsClearedRef.current = LEVELS.length;
                  triggerVictory();
                } else {
                  levelsClearedRef.current = levelRef.current;
                  playVictory();
                  scoreRef.current += 250;
                  setScore(scoreRef.current);
                  startLevel(levelRef.current + 1);
                  runningRef.current = false;
                  setRunning(false);
                }
              }
              break;
            }
          }
        }
      }

      // ── Render ──
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      // Fondo espacial ligero: estrellas fijas (sin coste por frame)
      ctx.fillStyle = '#070b12';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      const starSeed = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
      for (let s = 0; s < 28; s++) {
        const sx = starSeed(s) * W;
        const sy = starSeed(s + 50) * H;
        ctx.fillRect(sx, sy, s % 7 === 0 ? 2 : 1, s % 7 === 0 ? 2 : 1);
      }
      // Nebulosa tenue fija
      const neb = ctx.createRadialGradient(W * 0.72, H * 0.25, 8, W * 0.72, H * 0.25, W * 0.5);
      neb.addColorStop(0, 'rgba(0,243,255,0.05)');
      neb.addColorStop(1, 'rgba(0,243,255,0)');
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, W, H);

      // Bloques
      for (const brick of bricksRef.current) {
        const bx = brick.col * (BRICK_W + BRICK_GAP) + 4;
        const by = brick.row * (BRICK_H + BRICK_GAP) + BRICK_TOP;
        let color: string;
        if (brick.special) color = '#ffb700';
        else if (brick.maxHp > 1) color = brick.hp > 1 ? '#00f3ff' : '#0e7490';
        else color = '#ef4444';
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = brick.special ? 10 : 6;
        ctx.fillRect(bx, by, BRICK_W, BRICK_H);
        ctx.shadowBlur = 0;
        if (brick.maxHp > 1 && brick.hp > 1) {
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.strokeRect(bx + 1.5, by + 1.5, BRICK_W - 3, BRICK_H - 3);
        }
      }

      // Poderes cayendo
      for (const p of powersRef.current) {
        ctx.fillStyle = POWER_COLORS[p.type];
        ctx.shadowColor = POWER_COLORS[p.type];
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Letra identificadoraa dentro del poder
        ctx.fillStyle = '#0a0e17';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(p.type === 'wide' ? 'W' : p.type === 'slow' ? 'S' : 'E', p.x, p.y + 3);
      }

      // Plataforma
      const pw = paddleWRef.current;
      ctx.fillStyle = shieldRef.current ? '#ffb700' : '#00f3ff';
      ctx.shadowColor = shieldRef.current ? '#ffb700' : '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.fillRect(paddleXRef.current - pw / 2, H - 22, pw, 10);
      ctx.shadowBlur = 0;
      // Bordes redondeados dibujados a mano (roundRect no existe en WebViews viejas)
      ctx.fillStyle = 'rgba(0,0,0,0)';
      ctx.strokeStyle = shieldRef.current ? '#ffb700' : '#00f3ff';
      ctx.lineWidth = 1;

      // Escudo en la base
      if (shieldRef.current) {
        ctx.strokeStyle = 'rgba(255,183,0,0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, H - 3);
        ctx.lineTo(W, H - 3);
        ctx.stroke();
      }

      // Pelotas
      for (const ball of ballsRef.current) {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Particulas
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.08 * dt;
        p.life -= 0.04 * dt;
        if (p.life <= 0) { particlesRef.current.splice(i, 1); continue; }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.globalAlpha = 1;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(rafRef.current); stopGameMusic(); };
  }, [resetBall, startLevel, triggerGameOver, triggerVictory]);

  const showInstructionsRef = useRef(false);
  useEffect(() => { showInstructionsRef.current = showInstructions; }, [showInstructions]);

  useEffect(() => {
    return () => { stopGameMusic(); };
  }, []);

  // ── Controles: arrastre del dedo mueve la plataforma ──
  const canvasPos = (clientX: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return paddleXRef.current;
    const rect = canvas.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * W;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    initAudio();
    if (!runningRef.current && !gameOverRef.current && !pausedRef.current) {
      startGameMusic('neonbreaker');
      launchBall();
    }
    dragRef.current = { active: true, lastX: canvasPos(e.clientX) };
    paddleXRef.current = clampPaddle(dragRef.current.lastX);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    paddleXRef.current = clampPaddle(canvasPos(e.clientX));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const clampPaddle = (x: number): number => {
    const half = paddleWRef.current / 2;
    return Math.max(half, Math.min(W - half, x));
  };

  // Teclado (web): flechas mueven, espacio saca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') paddleXRef.current = clampPaddle(paddleXRef.current - 24);
      if (e.key === 'ArrowRight') paddleXRef.current = clampPaddle(paddleXRef.current + 24);
      if (e.code === 'Space' && !runningRef.current && !gameOverRef.current) {
        startGameMusic('neonbreaker');
        launchBall();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [launchBall]);

  const handleRestart = () => {
    initGame();
    startGameMusic('neonbreaker');
    launchBall();
  };

  // Continuacion unica por partida: repone vidas, escudo y saca la pelota
  const handleContinue = () => {
    livesRef.current = 3;
    setLives(3);
    gameOverRef.current = false;
    setGameOver(false);
    resetBall();
    shieldRef.current = true;
    startGameMusic('neonbreaker');
    launchBall();
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
          <span className="flex items-center gap-1 bg-black/60 border border-[#00f3ff]/30 rounded-full px-3 py-1 text-xs font-bold text-[#00f3ff]">
            NIVEL {level}
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-amber-500/30 rounded-full px-3 py-1 text-xs font-bold text-[#ffb700]">
            <Trophy className="w-3.5 h-3.5" /> {score.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Barra de estado: vidas, combo, poder activo */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[10px] font-bold">
        <span className="text-red-400">
          {'❤'.repeat(Math.max(0, lives)) || 'SIN VIDAS'}
        </span>
        <span className={combo >= 4 ? 'text-amber-400 animate-pulse' : 'text-white/40'}>
          COMBO x{Math.min(5, 1 + Math.floor(combo / 4))} ({combo})
        </span>
        <span className="text-[#00f3ff]">{powerMsg || `RÉCORD: ${stats.highScore.toLocaleString()}`}</span>
      </div>

      {/* Canvas del juego */}
      <div className="flex-1 flex items-center justify-center p-2 touch-none">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="border border-[#00f3ff]/30 rounded-2xl shadow-2xl shadow-[#00f3ff]/10 max-h-[60vh] object-contain bg-black/50 touch-none"
          />

          {/* Botones de pausa / reanudar / reinicio sobre el canvas */}
          <div className="absolute top-2 right-2 flex gap-1.5">
            {!paused && !gameOver && (
              <button
                onClick={() => { setPaused(true); stopGameMusic(); }}
                className="w-9 h-9 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center active:scale-95"
                aria-label="Pausa"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            )}
            {paused && !gameOver && (
              <button
                onClick={() => { setPaused(false); startGameMusic('neonbreaker'); if (ballsRef.current[0]?.stuck === false) void 0; }}
                className="w-9 h-9 rounded-lg bg-black/60 border border-[#00f3ff]/40 flex items-center justify-center active:scale-95"
                aria-label="Reanudar"
              >
                <Play className="w-4 h-4 text-[#00f3ff]" />
              </button>
            )}
            <button
              onClick={() => { setPaused(false); initGame(); startGameMusic('neonbreaker'); launchBall(); }}
              className="w-9 h-9 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center active:scale-95"
              aria-label="Reiniciar"
            >
              <RotateCcw className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* Mensaje flotante: arrastra para mover / toca para sacar */}
          {!running && !gameOver && !paused && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="px-4 py-2 rounded-xl bg-black/70 border border-[#00f3ff]/30 text-center">
                <p className="text-[#00f3ff] font-black text-sm">NIVEL {level}</p>
                <p className="text-white/50 text-[11px] mt-0.5">Arrastra para mover - Toca para sacar</p>
              </div>
            </div>
          )}

          {/* Overlay de pausa */}
          {paused && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl z-10">
              <div className="text-center">
                <p className="text-white font-black text-xl mb-2">PAUSA</p>
                <button
                  onClick={() => { setPaused(false); startGameMusic('neonbreaker'); }}
                  className="px-6 py-2.5 rounded-xl bg-[#00f3ff]/20 border border-[#00f3ff]/40 text-[#00f3ff] font-bold text-sm active:scale-95"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instrucciones primera vez */}
      {showInstructions && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 px-6">
          <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-[#00f3ff]/30 p-6 text-center animate-scale-in">
            <p className="text-[#00f3ff] font-black text-xl mb-3">ROMPEBLOQUES NEÓN</p>
            <ul className="text-left text-white/70 text-xs space-y-2 mb-5">
              <li>- Arrastra el dedo para mover la plataforma.</li>
              <li>- Toca la pantalla para sacar la pelota.</li>
              <li>- Rompe todos los bloques para pasar de nivel.</li>
              <li>- Bloques dobles aguantan 2 golpes; los dorados sueltan poderes: W ancha, S lenta, E escudo.</li>
              <li>- Encadena combos sin tocar la plataforma para multiplicar puntos.</li>
              <li>- Tienes 3 vidas por partida.</li>
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

      <MiniGameOverModal
        open={gameOver && !paused}
        score={score}
        highScore={victory ? Math.max(stats.highScore, score) : stats.highScore}
        gamesPlayed={stats.gamesPlayed}
        durationSec={durationSec}
        onRestart={handleRestart}
        onExit={() => { stopGameMusic(); setScreen('arcade'); }}
        canContinue={!victory}
        onContinue={handleContinue}
        continueText={`Ver anuncio para continuar (+${Math.max(10, 30)}% vidas)`}
        userRole={userRole}
        vip={vip}
      />
      {pendingReward > 0 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-black/70 border border-amber-500/40">
          <span className="text-amber-400 text-xs font-black">Monedas por progreso: +{pendingReward}</span>
        </div>
      )}
    </div>
  );
}
