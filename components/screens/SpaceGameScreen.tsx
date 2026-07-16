'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { Joystick } from '@/components/game/Joystick';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Crosshair, Rocket, Video } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  type Particle2D, type Star,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  drawCrosshair2D, drawShip2D, drawMeteor2D, drawEnemyShip2D, drawBossShip2D,
  makeStars, drawParallaxStars,
  clamp, dist, rand,
} from '@/lib/engine2d';
import { playShoot, playExplosion, playBossAlert, playCoin, playHit, initAudio } from '@/lib/audio';

interface Meteor { x: number; y: number; vx: number; vy: number; size: number; rot: number; rotVel: number; hp: number; maxHp: number; }
interface EnemyShip { x: number; y: number; vx: number; vy: number; angle: number; hp: number; maxHp: number; size: number; shootTimer: number; }
interface BossShip { x: number; y: number; vx: number; vy: number; angle: number; hp: number; maxHp: number; size: number; shootTimer: number; pattern: number; isMini: boolean; }
interface Laser { x: number; y: number; vx: number; vy: number; life: number; color: string; fromPlayer: boolean; damage: number; }

export function SpaceGameScreen() {
  const { setScreen, addCoins, getShip, lives, setLives, upgrades, submitSpaceScore, isOnline, canShowInterstitial, recordInterstitial, vip } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showReviveReward, setShowReviveReward] = useState(false);
  const [floatTexts, setFloatTexts] = useState<Array<{ id: number; text: string; x: number; y: number; color: string }>>([]);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossName, setBossName] = useState('');
  const [showInterstitial, setShowInterstitial] = useState(false);

  const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0 });
  const meteorsRef = useRef<Meteor[]>([]);
  const enemiesRef = useRef<EnemyShip[]>([]);
  const bossRef = useRef<BossShip | null>(null);
  const lasersRef = useRef<Laser[]>([]);
  const particlesRef = useRef<Particle2D[]>([]);
  const starsRef = useRef<Star[]>([]);
  const starsFarRef = useRef<Star[]>([]);
  const moveRef = useRef({ dx: 0, dy: 0 });
  const crosshairRef = useRef({ x: 0, y: 0, active: false });
  const scoreRef = useRef(0);
  const coinTimerRef = useRef(0);
  const commonKillCountRef = useRef(0);
  const livesRef = useRef(3);
  const shieldRef = useRef(false);
  const speedMultRef = useRef(1);
  const scoreMultRef = useRef(1);
  const gameOverRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const shootCooldownRef = useRef(0);
  const fireRateLevelRef = useRef(0);
  const damageLevelRef = useRef(0);
  const superShieldLevelRef = useRef(0);
  const miniBossThresholdRef = useRef(500);
  const finalBossThresholdRef = useRef(1500);
  const difficultyRef = useRef(1);
  const finalBossDefeatedRef = useRef(false);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const gameCoinsRef = useRef(0);
  const interstitialCheckedRef = useRef(false);

  const ship = getShip();

  useEffect(() => {
    speedMultRef.current = ship.speedMult;
    shieldRef.current = ship.shieldFirstHit || superShieldLevelRef.current > 0;
    scoreMultRef.current = ship.scoreMult;
    fireRateLevelRef.current = upgrades.fireRate;
    damageLevelRef.current = upgrades.damage;
    superShieldLevelRef.current = upgrades.superShield;
  }, [ship, upgrades]);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    const { w, h } = canvasSizeRef.current;
    playerRef.current = { x: w / 2, y: h * 0.75, vx: 0, vy: 0, angle: -Math.PI / 2 };
    meteorsRef.current = [];
    enemiesRef.current = [];
    bossRef.current = null;
    lasersRef.current = [];
    particlesRef.current = [];
    starsRef.current = makeStars(100, w, h);
    starsFarRef.current = makeStars(60, w, h);
    scoreRef.current = 0;
    coinTimerRef.current = 0;
    commonKillCountRef.current = 0;
    livesRef.current = 3;
    shieldRef.current = ship.shieldFirstHit || upgrades.superShield > 0;
    gameOverRef.current = false;
    spawnTimerRef.current = 0;
    shootCooldownRef.current = 0;
    miniBossThresholdRef.current = 500;
    finalBossThresholdRef.current = 1500;
    difficultyRef.current = 1;
    finalBossDefeatedRef.current = false;
    gameCoinsRef.current = 0;
    interstitialCheckedRef.current = false;
    setScore(0); setCoinsEarned(0); setGameOver(false); setBossActive(false);
  }, [ship, upgrades]);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    };
    resize();
    window.addEventListener('resize', resize);
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      return () => { ro.disconnect(); window.removeEventListener('resize', resize); };
    }
    return () => window.removeEventListener('resize', resize);
  }, []);

  const handleMove = useCallback((dx: number, dy: number) => { moveRef.current = { dx, dy }; }, []);

  const addFloatText = (text: string, x: number, y: number, color = '#22d3ee') => {
    const id = Date.now() + Math.random();
    setFloatTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatTexts((prev) => prev.filter((f) => f.id !== id)), 1000);
  };

  const getFireRate = () => Math.max(4, (18 - fireRateLevelRef.current * 2) / ship.fireRateMult);
  const getDamage = () => (25 + damageLevelRef.current * 15) * ship.damageMult;

  const playerShoot = () => {
    const p = playerRef.current;
    const cx = crosshairRef.current.active ? crosshairRef.current.x : p.x;
    const cy = crosshairRef.current.active ? crosshairRef.current.y : p.y - 100;
    const angle = Math.atan2(cy - p.y, cx - p.x);
    p.angle = angle;
    const speed = 12;
    lasersRef.current.push({
      x: p.x + Math.cos(angle) * 20, y: p.y + Math.sin(angle) * 20,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 60, color: '#22d3ee', fromPlayer: true, damage: getDamage(),
    });
    playShoot();
  };

  const spawnMeteor = () => {
    const { w } = canvasSizeRef.current;
    const size = 15 + Math.random() * 30;
    const speed = 1.5 + Math.random() * 2 + difficultyRef.current * 0.3;
    meteorsRef.current.push({
      x: Math.random() * w, y: -size,
      vx: (Math.random() - 0.5) * 1.5, vy: speed,
      size, rot: 0, rotVel: (Math.random() - 0.5) * 0.05,
      hp: size > 30 ? 2 : 1, maxHp: size > 30 ? 2 : 1,
    });
  };

  const spawnEnemy = () => {
    const { w } = canvasSizeRef.current;
    enemiesRef.current.push({
      x: Math.random() * w, y: -30,
      vx: (Math.random() - 0.5) * 2, vy: 1.5 + Math.random(),
      angle: Math.PI / 2, hp: 3, maxHp: 3, size: 18, shootTimer: 60 + Math.random() * 40,
    });
  };

  const spawnMiniBoss = () => {
    const { w } = canvasSizeRef.current;
    bossRef.current = {
      x: w / 2, y: -60, vx: 2, vy: 0.5, angle: Math.PI / 2,
      hp: 300, maxHp: 300, size: 35, shootTimer: 40, pattern: 0, isMini: true,
    };
    setBossActive(true); setBossHp(300); setBossMaxHp(300); setBossName('MINI JEFE');
    playBossAlert();
    addFloatText('¡MINI JEFE!', w / 2, canvasSizeRef.current.h / 3, '#f59e0b');
  };

  const spawnFinalBoss = () => {
    const { w } = canvasSizeRef.current;
    bossRef.current = {
      x: w / 2, y: -80, vx: 1.5, vy: 0.3, angle: Math.PI / 2,
      hp: 1500, maxHp: 1500, size: 55, shootTimer: 30, pattern: 0, isMini: false,
    };
    setBossActive(true); setBossHp(1500); setBossMaxHp(1500); setBossName('Nave Nodriza');
    playBossAlert();
    addFloatText('¡JEFE FINAL!', w / 2, canvasSizeRef.current.h / 3, '#ef4444');
  };

  // Interstitial ad on game over
  useEffect(() => {
    if (gameOver && !interstitialCheckedRef.current) {
      interstitialCheckedRef.current = true;
      if (!vip && canShowInterstitial()) {
        setShowInterstitial(true);
        recordInterstitial();
      }
    }
  }, [gameOver, canShowInterstitial, recordInterstitial, vip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;
      const { w, h } = canvasSizeRef.current;

      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, w, h);

      drawParallaxStars(ctx, starsFarRef.current, dt, w, h, 0.5);
      drawParallaxStars(ctx, starsRef.current, dt, w, h, 1.5);

      if (!gameOverRef.current) {
        const p = playerRef.current;
        p.vx = moveRef.current.dx * 5 * speedMultRef.current;
        p.vy = moveRef.current.dy * 5 * speedMultRef.current;
        p.x = clamp(p.x + p.vx * dt, 25, w - 25);
        p.y = clamp(p.y + p.vy * dt, 25, h - 25);

        if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;
        if (shootCooldownRef.current <= 0) {
          playerShoot();
          shootCooldownRef.current = getFireRate();
        }

        scoreRef.current += dt * 10 * scoreMultRef.current;
        setScore(Math.floor(scoreRef.current));
        difficultyRef.current = 1 + scoreRef.current / 1000;

        coinTimerRef.current += dt * 16.67;
        if (coinTimerRef.current >= 4000) {
          coinTimerRef.current = 0;
          addCoins(1); gameCoinsRef.current += 1; setCoinsEarned(gameCoinsRef.current); playCoin();
          addFloatText('+1 moneda', w / 2, h / 2 - 50, '#fbbf24');
        }

        if (!bossRef.current) {
          spawnTimerRef.current += dt;
          const interval = Math.max(12, 25 - difficultyRef.current * 2);
          if (spawnTimerRef.current > interval) {
            if (Math.random() < 0.3) spawnEnemy(); else spawnMeteor();
            spawnTimerRef.current = 0;
          }
          if (scoreRef.current >= miniBossThresholdRef.current) { spawnMiniBoss(); miniBossThresholdRef.current += 500; }
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current) { spawnFinalBoss(); }
        }

        for (let i = meteorsRef.current.length - 1; i >= 0; i--) {
          const m = meteorsRef.current[i];
          m.x += m.vx * dt; m.y += m.vy * dt; m.rot += m.rotVel * dt;
          if (m.y > h + m.size) { meteorsRef.current.splice(i, 1); continue; }
          if (dist(m.x, m.y, p.x, p.y) < m.size + 18) {
            meteorsRef.current.splice(i, 1);
            spawnParticles2D(particlesRef.current, m.x, m.y, 15, '#f59e0b', 6);
            playHit();
            if (shieldRef.current) { shieldRef.current = false; addFloatText('¡Escudo!', w / 2, h / 2, '#34d399'); continue; }
            livesRef.current--; setLives(livesRef.current);
            addFloatText('¡Impacto!', w / 2, h / 2, '#ef4444');
            if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); submitSpaceScore(Math.floor(scoreRef.current)); }
          }
        }

        for (let i = enemiesRef.current.length - 1; i >= 0; i--) {
          const e = enemiesRef.current[i];
          e.x += e.vx * dt; e.y += e.vy * dt;
          if (e.x < 20 || e.x > w - 20) e.vx *= -1;
          e.shootTimer -= dt;
          if (e.shootTimer <= 0 && e.y > 30 && e.y < h * 0.6) {
            e.shootTimer = 80 + Math.random() * 40;
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            lasersRef.current.push({ x: e.x, y: e.y, vx: Math.cos(angle) * 5, vy: Math.sin(angle) * 5, life: 100, color: '#f87171', fromPlayer: false, damage: 20 });
          }
          if (e.y > h + 30) { enemiesRef.current.splice(i, 1); continue; }
          if (dist(e.x, e.y, p.x, p.y) < e.size + 18) {
            enemiesRef.current.splice(i, 1);
            if (shieldRef.current) { shieldRef.current = false; continue; }
            livesRef.current--; setLives(livesRef.current); playHit();
            if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); submitSpaceScore(Math.floor(scoreRef.current)); }
          }
        }

        if (bossRef.current) {
          const b = bossRef.current;
          b.x = clamp(b.x + b.vx * dt, b.size, w - b.size);
          b.y = clamp(b.y + b.vy * dt, b.size, h * 0.4);
          if (b.x <= b.size || b.x >= w - b.size) b.vx *= -1;
          b.shootTimer -= dt;
          if (b.shootTimer <= 0) {
            b.shootTimer = b.isMini ? 50 : 25;
            b.pattern = (b.pattern + 1) % 3;
            const angle = Math.atan2(p.y - b.y, p.x - b.x);
            if (b.pattern === 0) {
              for (let a = -2; a <= 2; a++) {
                const sa = angle + a * 0.15;
                lasersRef.current.push({ x: b.x, y: b.y, vx: Math.cos(sa) * 5, vy: Math.sin(sa) * 5, life: 120, color: '#f59e0b', fromPlayer: false, damage: 20 });
              }
            } else if (b.pattern === 1) {
              for (let a = -1; a <= 1; a++) {
                const sa = angle + a * 0.1;
                lasersRef.current.push({ x: b.x, y: b.y, vx: Math.cos(sa) * 7, vy: Math.sin(sa) * 7, life: 120, color: '#fb923c', fromPlayer: false, damage: 20 });
              }
            } else {
              for (let a = 0; a < 8; a++) {
                const sa = (a / 8) * Math.PI * 2;
                lasersRef.current.push({ x: b.x, y: b.y, vx: Math.cos(sa) * 4, vy: Math.sin(sa) * 4, life: 120, color: '#f59e0b', fromPlayer: false, damage: 15 });
              }
            }
          }
          setBossHp(b.hp);
          if (dist(b.x, b.y, p.x, p.y) < b.size + 20) {
            if (shieldRef.current) { shieldRef.current = false; }
            else { livesRef.current--; setLives(livesRef.current); playHit(); if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); submitSpaceScore(Math.floor(scoreRef.current)); } }
          }
        }

        for (let i = lasersRef.current.length - 1; i >= 0; i--) {
          const l = lasersRef.current[i];
          l.x += l.vx * dt; l.y += l.vy * dt; l.life -= dt;
          if (l.life <= 0 || l.x < -10 || l.x > w + 10 || l.y < -10 || l.y > h + 10) { lasersRef.current.splice(i, 1); continue; }

          if (l.fromPlayer) {
            let hit = false;
            for (let j = meteorsRef.current.length - 1; j >= 0; j--) {
              const m = meteorsRef.current[j];
              if (dist(l.x, l.y, m.x, m.y) < m.size + 5) {
                m.hp -= l.damage; hit = true;
                if (m.hp <= 0) {
                  meteorsRef.current.splice(j, 1);
                  spawnParticles2D(particlesRef.current, m.x, m.y, 12, '#f59e0b', 5);
                  playExplosion();
                  scoreRef.current += 50 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  commonKillCountRef.current++;
                  if (commonKillCountRef.current % 3 === 0) { addCoins(1); gameCoinsRef.current += 1; setCoinsEarned(gameCoinsRef.current); playCoin(); }
                }
                break;
              }
            }
            if (!hit) for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
              const e = enemiesRef.current[j];
              if (dist(l.x, l.y, e.x, e.y) < e.size + 5) {
                e.hp -= l.damage; hit = true;
                if (e.hp <= 0) {
                  enemiesRef.current.splice(j, 1);
                  spawnParticles2D(particlesRef.current, e.x, e.y, 12, '#f87171', 5);
                  playExplosion();
                  scoreRef.current += 100 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  commonKillCountRef.current++;
                  if (commonKillCountRef.current % 3 === 0) { addCoins(1); gameCoinsRef.current += 1; setCoinsEarned(gameCoinsRef.current); playCoin(); }
                }
                break;
              }
            }
            if (!hit && bossRef.current) {
              const b = bossRef.current;
              if (dist(l.x, l.y, b.x, b.y) < b.size + 5) {
                b.hp -= l.damage; hit = true; setBossHp(b.hp);
                spawnParticles2D(particlesRef.current, l.x, l.y, 5, '#f59e0b', 3);
                if (b.hp <= 0) {
                  const reward = b.isMini ? 10 : 30;
                  addCoins(reward); gameCoinsRef.current += reward; setCoinsEarned(gameCoinsRef.current);
                  scoreRef.current += (b.isMini ? 1000 : 5000) * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, b.x, b.y, b.isMini ? 30 : 50, b.isMini ? '#f59e0b' : '#ef4444', 8);
                  addFloatText(`¡+${reward} monedas!`, w / 2, h / 3, '#fbbf24');
                  bossRef.current = null; setBossActive(false);
                  if (!b.isMini) { finalBossDefeatedRef.current = true; finalBossThresholdRef.current += 3000; }
                }
              }
            }
            if (hit) lasersRef.current.splice(i, 1);
          } else {
            if (dist(l.x, l.y, p.x, p.y) < 18) {
              lasersRef.current.splice(i, 1);
              if (shieldRef.current) { shieldRef.current = false; addFloatText('¡Escudo!', w / 2, h / 2, '#34d399'); continue; }
              livesRef.current--; setLives(livesRef.current); playHit();
              if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); submitSpaceScore(Math.floor(scoreRef.current)); }
            }
          }
        }

        for (const m of meteorsRef.current) drawMeteor2D(ctx, m.x, m.y, m.size, m.rot, m.hp, m.maxHp);
        for (const e of enemiesRef.current) drawEnemyShip2D(ctx, e.x, e.y, e.angle, '#f87171', e.size);
        if (bossRef.current) drawBossShip2D(ctx, bossRef.current.x, bossRef.current.y, bossRef.current.angle, bossRef.current.isMini ? '#f59e0b' : '#ef4444', bossRef.current.size, bossRef.current.hp, bossRef.current.maxHp);
        drawShip2D(ctx, p.x, p.y, p.angle, shieldRef.current ? '#34d399' : ship.color, 20, shieldRef.current);
      }

      updateParticles2D(particlesRef.current, dt);
      drawParticles2D(ctx, particlesRef.current);

      for (const l of lasersRef.current) {
        ctx.fillStyle = l.color;
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (crosshairRef.current.active && !gameOverRef.current) {
        drawCrosshair2D(ctx, crosshairRef.current.x, crosshairRef.current.y, '#22d3ee', 22);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins, setLives, ship, submitSpaceScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      crosshairRef.current = { x: cx - rect.left, y: cy - rect.top, active: true };
    };
    const onTouch = (e: TouchEvent) => {
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const rect = canvas.getBoundingClientRect();
        if (t.clientX - rect.left > rect.width * 0.35) { update(t.clientX, t.clientY); break; }
      }
    };
    const onMouse = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onMouseDown = (e: MouseEvent) => { initAudio(); update(e.clientX, e.clientY); };
    canvas.addEventListener('touchstart', onTouch, { passive: true });
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mousedown', onMouseDown);
    return () => {
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mousedown', onMouseDown);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-black flex flex-col" style={{ paddingTop: vip ? 0 : 'calc(var(--ad-banner-height) + env(safe-area-inset-top))' }}>
      <OfflineBanner />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <button onClick={() => setScreen('mode-select')} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            {Array.from({ length: 3 }).map((_, i) => <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-white/20'}`} />)}
          </div>
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-white text-sm font-bold">{score} pts</div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5"><Coins className="w-4 h-4 text-amber-400" /><span className="text-amber-400 text-sm font-bold">{coinsEarned}</span></div>
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-3 py-1.5"><Rocket className="w-4 h-4" style={{ color: ship.color }} /><span className="text-sm font-bold" style={{ color: ship.color }}>{ship.name}</span></div>
        </div>
      </div>
      {bossActive && bossMaxHp > 0 && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-72">
          <p className="text-center text-red-400 text-xs font-bold mb-1 animate-pulse">{bossName}</p>
          <div className="h-4 rounded-full bg-black/60 border-2 border-red-500/50 overflow-hidden shadow-lg shadow-red-500/30">
            <div className="h-full transition-all duration-200" style={{ width: `${(bossHp / bossMaxHp) * 100}%`, background: 'linear-gradient(90deg, #ef4444, #f87171)' }} />
          </div>
        </div>
      )}
      {floatTexts.map((ft) => <div key={ft.id} className="absolute z-20 font-bold text-sm animate-float-up pointer-events-none" style={{ left: ft.x, top: ft.y, transform: 'translate(-50%, -50%)', color: ft.color }}>{ft.text}</div>)}
      {!gameOver && (
        <>
          <div className="absolute bottom-20 left-4 z-10"><Joystick onMove={handleMove} size={120} /></div>
          <div className="absolute bottom-28 right-6 z-10 flex flex-col items-center gap-1 pointer-events-none">
            <div className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center backdrop-blur" style={{ borderColor: `${ship.color}66` }}>
              <Crosshair className="w-6 h-6" style={{ color: ship.color }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50" style={{ color: ship.color }}>AUTO-FIRE</span>
          </div>
        </>
      )}
      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-card/90 border border-red-500/30 p-6 text-center animate-scale-in shadow-2xl shadow-red-500/20">
            <h2 className="text-red-400 font-bold text-2xl mb-2" style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>Game Over</h2>
            <p className="text-white/60 text-sm mb-1">Puntuacion: {score}</p>
            <p className="text-amber-400 text-sm mb-6">Monedas ganadas: {coinsEarned}</p>
            <button onClick={() => setShowReviveReward(true)} disabled={!isOnline} className="w-full py-3 rounded-xl bg-green-500 text-white font-bold mb-2 hover:bg-green-400 shadow-lg shadow-green-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <Video className="w-4 h-4" />{isOnline ? 'Revivir: 1 vida + 10 Monedas' : 'Anuncios requieren conexión'}
            </button>
            <button onClick={() => initGame()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold mb-2 hover:bg-primary/90 shadow-lg shadow-primary/20">Reiniciar (De Nuevo)</button>
            <button onClick={() => setScreen('mode-select')} className="w-full py-3 rounded-xl bg-card border border-border text-white font-bold hover:bg-secondary">Salir</button>
          </div>
        </div>
      )}
      {/* Interstitial ad modal */}
      {showInterstitial && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 animate-fade-in">
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-primary/30 p-8 text-center">
            <Video className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-2">Anuncio Interstitial</p>
            <p className="text-white/50 text-sm mb-6">Anuncio publicitario - Cierra en 3 segundos...</p>
            <button onClick={() => setShowInterstitial(false)} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90">Cerrar ahora</button>
          </div>
        </div>
      )}
      <RewardAdModal open={showReviveReward} onClose={() => setShowReviveReward(false)} onReward={() => { livesRef.current = 3; shieldRef.current = true; setLives(3); gameOverRef.current = false; setGameOver(false); addCoins(10); gameCoinsRef.current += 10; setCoinsEarned(gameCoinsRef.current); }} title="Revivir" rewardText="¡Has revivido con vida completa, escudo y 10 monedas extra!" />
      <MuteButton />
    </div>
  );
}
