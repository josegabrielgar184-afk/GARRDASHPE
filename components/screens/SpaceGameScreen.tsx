'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Video, Pause, Play, Radiation, Shield, Baby, Magnet } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  type Particle2D, type Star, type MuzzleFlash,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  spawnMuzzleFlash, updateMuzzleFlashes, drawMuzzleFlashes,
  drawNeonCircle,
  drawShip2D, drawMeteor2D, drawBossShip2D,
  makeStars, drawParallaxStars,
  drawNebula, drawLavaPlanet, drawRockyPlanet, drawAsteroid,
  drawBeetleEnemy, drawDoubleShotPowerup,
  drawDebugFooter,
  ScreenShake, hapticFeedback, hapticPattern,
  clamp, dist, rand, lerp,
} from '@/lib/engine2d';
import { ObjectPool, FPSMonitor } from '@/lib/game-performance';
import { playShoot, playExplosion, playBossAlert, playCoin, playHit, playPickup, initAudio } from '@/lib/audio';
import { getRewardedAdId } from '@/lib/config';

interface Meteor { x: number; y: number; vx: number; vy: number; size: number; rot: number; rotVel: number; hp: number; maxHp: number; active: boolean; reset(): void; }
interface EnemyShip { x: number; y: number; vx: number; vy: number; angle: number; hp: number; maxHp: number; size: number; shootTimer: number; oscillation: number; active: boolean; reset(): void; }
interface BossShip { x: number; y: number; vx: number; vy: number; angle: number; hp: number; maxHp: number; size: number; shootTimer: number; pattern: number; isMini: boolean; }
interface Laser { x: number; y: number; vx: number; vy: number; life: number; color: string; fromPlayer: boolean; damage: number; active: boolean; reset(): void; }
interface PowerUp { x: number; y: number; vy: number; type: 'doubleShot' | 'coinMagnet'; active: boolean; reset(): void; }
interface Asteroid { x: number; y: number; vx: number; vy: number; size: number; rot: number; rotVel: number; active: boolean; reset(): void; }

function makeMeteor(): Meteor { return { x: 0, y: 0, vx: 0, vy: 0, size: 0, rot: 0, rotVel: 0, hp: 1, maxHp: 1, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.size = 0; this.rot = 0; this.rotVel = 0; this.hp = 1; this.maxHp = 1; } }; }
function makeEnemy(): EnemyShip { return { x: 0, y: 0, vx: 0, vy: 0, angle: 0, hp: 3, maxHp: 3, size: 24, shootTimer: 0, oscillation: 0, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.angle = 0; this.hp = 3; this.maxHp = 3; this.size = 24; this.shootTimer = 0; this.oscillation = 0; } }; }
function makeLaser(): Laser { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '', fromPlayer: false, damage: 0, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; this.color = ''; this.fromPlayer = false; this.damage = 0; } }; }
function makePowerUp(): PowerUp { return { x: 0, y: 0, vy: 0, type: 'doubleShot', active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; } }; }
function makeAsteroid(): Asteroid { return { x: 0, y: 0, vx: 0, vy: 0, size: 0, rot: 0, rotVel: 0, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.size = 0; this.rot = 0; this.rotVel = 0; } }; }

const SPRITE_SCALE = 1.35;
const SHIP_SIZE = 27;

const MILESTONES: Record<number, { title: string; coins?: number; shield?: boolean; scoreBoost?: boolean }> = {
  4: { title: '¡4 AÑOS DE AMOR ETERNO!', coins: 400 },
  10: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true },
  30: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true },
};

export function SpaceGameScreen() {
  const { setScreen, addCoins, getShip, lives, setLives, upgrades, submitSpaceScore, isOnline, canShowInterstitial, recordInterstitial, vip, userRole, addPlayTime, startGameBatch, endGameBatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showReviveReward, setShowReviveReward] = useState(false);
  const adDebounceRef = useRef(0);
  const [floatTexts, setFloatTexts] = useState<Array<{ id: number; text: string; x: number; y: number; color: string; size?: number }>>([]);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossName, setBossName] = useState('');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hasDoubleShot, setHasDoubleShot] = useState(false);
  const [hasCoinMagnet, setHasCoinMagnet] = useState(false);
  const [nuclearReady, setNuclearReady] = useState(false);
  const [milestoneBanner, setMilestoneBanner] = useState<string | null>(null);
  const [comboDisplay, setComboDisplay] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const [scoreBoostActive, setScoreBoostActive] = useState(false);
  const [hasRevived, setHasRevived] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);

  const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: -Math.PI / 2 });
  const meteorPoolRef = useRef<ObjectPool<Meteor>>(new ObjectPool(makeMeteor, 20));
  const enemyPoolRef = useRef<ObjectPool<EnemyShip>>(new ObjectPool(makeEnemy, 15));
  const bossRef = useRef<BossShip | null>(null);
  const laserPoolRef = useRef<ObjectPool<Laser>>(new ObjectPool(makeLaser, 40));
  const powerUpPoolRef = useRef<ObjectPool<PowerUp>>(new ObjectPool(makePowerUp, 5));
  const asteroidPoolRef = useRef<ObjectPool<Asteroid>>(new ObjectPool(makeAsteroid, 8));
  const particlesRef = useRef<Particle2D[]>([]);
  const muzzleFlashesRef = useRef<MuzzleFlash[]>([]);
  const screenShakeRef = useRef(new ScreenShake());
  const starsRef = useRef<Star[]>([]);
  const starsFarRef = useRef<Star[]>([]);
  const nebulaRef = useRef<Array<{ x: number; y: number; size: number; color: string; speed: number }>>([]);
  const lavaPlanetRef = useRef({ x: 0, y: 0, r: 0 });
  const rockyPlanetRef = useRef({ x: 0, y: 0, r: 0 });
  const touchTargetRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
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
  const fpsMonitorRef = useRef<FPSMonitor>(new FPSMonitor());
  const hasDoubleShotRef = useRef(false);
  const doubleShotTimerRef = useRef(0);
  const hasCoinMagnetRef = useRef(false);
  const coinMagnetTimerRef = useRef(0);
  const nuclearChargeRef = useRef(0);
  const nuclearActiveRef = useRef(false);
  const nuclearTimerRef = useRef(0);
  const playTimeRef = useRef(0);
  const lastPlayTimeSyncRef = useRef(0);
  const pausedRef = useRef(false);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);
  const milestoneShieldRef = useRef(false);
  const milestoneShieldTimerRef = useRef(0);
  const scoreBoostRef = useRef(false);
  const scoreBoostTimerRef = useRef(0);
  const hasRevivedRef = useRef(false);
  const thrustRef = useRef(0);

  const ship = getShip();

  useEffect(() => {
    speedMultRef.current = ship.speedMult;
    shieldRef.current = ship.shieldFirstHit || superShieldLevelRef.current > 0;
    scoreMultRef.current = ship.scoreMult;
    fireRateLevelRef.current = upgrades.fireRate;
    damageLevelRef.current = upgrades.damage;
    superShieldLevelRef.current = upgrades.superShield;
  }, [ship, upgrades]);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const MAX_GAME_COINS = vip ? 5 : 3;

  const safeAddCoins = useCallback((amount: number) => {
    if (gameCoinsRef.current >= MAX_GAME_COINS) return;
    const toAdd = Math.min(amount, MAX_GAME_COINS - gameCoinsRef.current);
    if (toAdd <= 0) return;
    addCoins(toAdd);
    gameCoinsRef.current += toAdd;
    setCoinsEarned(gameCoinsRef.current);
  }, [addCoins, MAX_GAME_COINS]);

  const addFloatText = (text: string, x: number, y: number, color = '#22d3ee', size = 14) => {
    const id = Date.now() + Math.random();
    setFloatTexts((prev) => [...prev, { id, text, x, y, color, size }]);
    setTimeout(() => setFloatTexts((prev) => prev.filter((f) => f.id !== id)), 1000);
  };

  const getScoreMult = () => scoreMultRef.current * (scoreBoostRef.current ? 2 : 1);

  const checkMilestone = useCallback(() => {
    try {
      const raw = localStorage.getItem('garrdash_games_played');
      const played = raw ? parseInt(raw, 10) : 0;
      const next = played + 1;
      localStorage.setItem('garrdash_games_played', String(next));
      const ms = MILESTONES[next];
      if (ms) {
        setMilestoneBanner(ms.title);
        setTimeout(() => setMilestoneBanner(null), 4000);
        if (ms.coins) {
          safeAddCoins(ms.coins);
          const { w, h } = canvasSizeRef.current;
          addFloatText(`+${ms.coins} MONEDAS`, w / 2, h / 2, '#fbbf24', 20);
          hapticPattern([50, 30, 50, 30, 100]);
        }
        if (ms.shield) {
          milestoneShieldRef.current = true; setShieldActive(true);
          milestoneShieldTimerRef.current = 600;
          hapticPattern([50, 30, 100]);
        }
        if (ms.scoreBoost) {
          scoreBoostRef.current = true; setScoreBoostActive(true);
          scoreBoostTimerRef.current = 600;
        }
      }
    } catch {}
  }, [safeAddCoins]);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    const { w, h } = canvasSizeRef.current;
    playerRef.current = { x: w / 2, y: h * 0.75, vx: 0, vy: 0, angle: -Math.PI / 2 };
    meteorPoolRef.current.releaseAll();
    enemyPoolRef.current.releaseAll();
    laserPoolRef.current.releaseAll();
    powerUpPoolRef.current.releaseAll();
    asteroidPoolRef.current.releaseAll();
    bossRef.current = null;
    particlesRef.current = [];
    muzzleFlashesRef.current = [];
    starsRef.current = makeStars(100, w, h);
    starsFarRef.current = makeStars(60, w, h);
    nebulaRef.current = [
      { x: w * 0.2, y: h * 0.3, size: 120, color: '#3b82f6', speed: 0.3 },
      { x: w * 0.8, y: h * 0.6, size: 150, color: '#8b5cf6', speed: 0.2 },
      { x: w * 0.5, y: h * 0.8, size: 100, color: '#6366f1', speed: 0.4 },
    ];
    lavaPlanetRef.current = { x: w * 0.15, y: h * 0.2, r: Math.min(w, h) * 0.08 };
    rockyPlanetRef.current = { x: w * 0.85, y: h * 0.15, r: Math.min(w, h) * 0.06 };
    scoreRef.current = 0; coinTimerRef.current = 0; commonKillCountRef.current = 0;
    livesRef.current = 3;
    shieldRef.current = ship.shieldFirstHit || upgrades.superShield > 0;
    gameOverRef.current = false;
    spawnTimerRef.current = 0; shootCooldownRef.current = 0;
    miniBossThresholdRef.current = 500; finalBossThresholdRef.current = 1500;
    difficultyRef.current = 1; finalBossDefeatedRef.current = false;
    gameCoinsRef.current = 0; interstitialCheckedRef.current = false;
    hasDoubleShotRef.current = false; setHasDoubleShot(false); doubleShotTimerRef.current = 0;
    hasCoinMagnetRef.current = false; setHasCoinMagnet(false); coinMagnetTimerRef.current = 0;
    nuclearChargeRef.current = 0; setNuclearReady(false); nuclearActiveRef.current = false; nuclearTimerRef.current = 0;
    playTimeRef.current = 0; lastPlayTimeSyncRef.current = 0;
    comboRef.current = 0; comboTimerRef.current = 0; setComboDisplay(0);
    milestoneShieldRef.current = false; setShieldActive(false); milestoneShieldTimerRef.current = 0;
    scoreBoostRef.current = false; setScoreBoostActive(false); scoreBoostTimerRef.current = 0;
    hasRevivedRef.current = false; setHasRevived(false);
    thrustRef.current = 0;
    setScore(0); setCoinsEarned(0); setGameOver(false); setBossActive(false); setPaused(false);
    startGameBatch();
    checkMilestone();
  }, [ship, upgrades, startGameBatch, checkMilestone]);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    setShowTutorial(true);
    const t = setTimeout(() => setShowTutorial(false), 3000);
    return () => clearTimeout(t);
  }, [initGame]);

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

  const getFireRate = () => Math.max(4, (18 - fireRateLevelRef.current * 2) / ship.fireRateMult);
  const getDamage = () => (25 + damageLevelRef.current * 15) * ship.damageMult;

  const playerShoot = () => {
    const p = playerRef.current;
    const angle = p.angle;
    const speed = 12;
    const dmg = getDamage() * (nuclearActiveRef.current ? 3 : 1);

    if (hasDoubleShotRef.current) {
      for (const offset of [-12, 12]) {
        const l = laserPoolRef.current.acquire();
        l.x = p.x + Math.cos(angle) * 20 + offset;
        l.y = p.y + Math.sin(angle) * 20;
        l.vx = Math.cos(angle) * speed; l.vy = Math.sin(angle) * speed;
        l.life = 60; l.color = '#22c55e'; l.fromPlayer = true; l.damage = dmg;
      }
    } else {
      const l = laserPoolRef.current.acquire();
      l.x = p.x + Math.cos(angle) * 20; l.y = p.y + Math.sin(angle) * 20;
      l.vx = Math.cos(angle) * speed; l.vy = Math.sin(angle) * speed;
      l.life = 60; l.color = '#22d3ee'; l.fromPlayer = true; l.damage = dmg;
    }
    spawnMuzzleFlash(muzzleFlashesRef.current, p.x + Math.cos(angle) * 20, p.y + Math.sin(angle) * 20, angle, '#22d3ee', 18 * SPRITE_SCALE);
    playShoot();
  };

  const spawnMeteor = () => {
    const { w } = canvasSizeRef.current;
    const m = meteorPoolRef.current.acquire();
    m.size = (15 + Math.random() * 30) * SPRITE_SCALE;
    m.x = Math.random() * w; m.y = -m.size;
    m.vx = (Math.random() - 0.5) * 1.5; m.vy = 1.5 + Math.random() * 2 + difficultyRef.current * 0.3;
    m.rot = 0; m.rotVel = (Math.random() - 0.5) * 0.05;
    m.hp = m.size > 40 ? 2 : 1; m.maxHp = m.hp;
  };

  const spawnEnemy = () => {
    const { w } = canvasSizeRef.current;
    const e = enemyPoolRef.current.acquire();
    e.x = Math.random() * w; e.y = -30;
    e.vx = (Math.random() - 0.5) * 2; e.vy = 1.5 + Math.random();
    e.angle = Math.PI / 2; e.hp = 3; e.maxHp = 3; e.size = 24 * SPRITE_SCALE;
    e.shootTimer = 60 + Math.random() * 40; e.oscillation = Math.random() * 10;
  };

  const spawnAsteroid = () => {
    const { w } = canvasSizeRef.current;
    const a = asteroidPoolRef.current.acquire();
    a.size = (8 + Math.random() * 15) * SPRITE_SCALE;
    a.x = Math.random() * w; a.y = -a.size;
    a.vx = (Math.random() - 0.5) * 0.5; a.vy = 0.5 + Math.random();
    a.rot = 0; a.rotVel = (Math.random() - 0.5) * 0.03;
  };

  const spawnPowerUp = () => {
    const { w } = canvasSizeRef.current;
    const pu = powerUpPoolRef.current.acquire();
    pu.x = rand(50, w - 50); pu.y = -20; pu.vy = 1.5;
    pu.type = Math.random() < 0.5 ? 'doubleShot' : 'coinMagnet';
  };

  const spawnMiniBoss = () => {
    const { w } = canvasSizeRef.current;
    bossRef.current = { x: w / 2, y: -60, vx: 2, vy: 0.5, angle: Math.PI / 2, hp: 300, maxHp: 300, size: 35 * SPRITE_SCALE, shootTimer: 40, pattern: 0, isMini: true };
    setBossActive(true); setBossHp(300); setBossMaxHp(300); setBossName('MINI JEFE');
    playBossAlert();
    addFloatText('¡MINI JEFE!', w / 2, canvasSizeRef.current.h / 3, '#f59e0b', 18);
    screenShakeRef.current.trigger(5, 15);
    hapticFeedback(40);
  };

  const spawnFinalBoss = () => {
    const { w } = canvasSizeRef.current;
    bossRef.current = { x: w / 2, y: -80, vx: 1.5, vy: 0.3, angle: Math.PI / 2, hp: 1500, maxHp: 1500, size: 55 * SPRITE_SCALE, shootTimer: 30, pattern: 0, isMini: false };
    setBossActive(true); setBossHp(1500); setBossMaxHp(1500); setBossName('Nave Nodriza');
    playBossAlert();
    addFloatText('¡JEFE FINAL!', w / 2, canvasSizeRef.current.h / 3, '#ef4444', 18);
    screenShakeRef.current.trigger(8, 20);
    hapticFeedback(50);
  };

  const activateNuclear = () => {
    if (!nuclearReady || gameOverRef.current || pausedRef.current) return;
    nuclearActiveRef.current = true;
    nuclearTimerRef.current = 180;
    nuclearChargeRef.current = 0;
    setNuclearReady(false);
    const { w, h } = canvasSizeRef.current;
    addFloatText('¡RADIACION NUCLEAR!', w / 2, h / 2, '#fbbf24', 20);
    playExplosion();
    screenShakeRef.current.trigger(12, 30);
    hapticPattern([100, 50, 100, 50, 200]);
    const meteors = meteorPoolRef.current.getActive();
    for (const m of meteors) {
      spawnParticles2D(particlesRef.current, m.x, m.y, 10, '#fbbf24', 5);
      meteorPoolRef.current.release(m);
      scoreRef.current += 50 * getScoreMult();
    }
    const enemies = enemyPoolRef.current.getActive();
    for (const e of enemies) {
      spawnParticles2D(particlesRef.current, e.x, e.y, 10, '#fbbf24', 5);
      enemyPoolRef.current.release(e);
      scoreRef.current += 100 * getScoreMult();
    }
    setScore(Math.floor(scoreRef.current));
  };

  useEffect(() => {
    if (gameOver && !interstitialCheckedRef.current) {
      interstitialCheckedRef.current = true;
      endGameBatch();
      submitSpaceScore(Math.floor(scoreRef.current));
      hapticPattern([100, 50, 200]);
      if (!vip && canShowInterstitial()) { setShowInterstitial(true); recordInterstitial(); }
    }
  }, [gameOver, canShowInterstitial, recordInterstitial, vip, endGameBatch, submitSpaceScore]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let lastTime = performance.now();
    let lastRenderTime = lastTime;

    const render = (now: number) => {
      const fpsMon = fpsMonitorRef.current;
      fpsMon.tick(now);
      if (!fpsMon.shouldRenderFrame(now, lastRenderTime)) { rafRef.current = requestAnimationFrame(render); return; }
      lastRenderTime = now;
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;
      const { w, h } = canvasSizeRef.current;

      screenShakeRef.current.update(dt);
      const shake = screenShakeRef.current.getOffset();

      ctx.save();
      ctx.translate(shake.x, shake.y);

      ctx.fillStyle = '#050810';
      ctx.fillRect(-20, -20, w + 40, h + 40);

      for (const neb of nebulaRef.current) {
        neb.y += neb.speed * dt;
        if (neb.y > h + neb.size) neb.y = -neb.size;
        drawNebula(ctx, neb.x, neb.y, neb.size, neb.color, fpsMon.quality === 'low' ? 0.08 : 0.15);
      }

      drawLavaPlanet(ctx, lavaPlanetRef.current.x, lavaPlanetRef.current.y + (now * 0.01) % h, lavaPlanetRef.current.r, now);
      drawRockyPlanet(ctx, rockyPlanetRef.current.x, rockyPlanetRef.current.y + (now * 0.005) % h, rockyPlanetRef.current.r);

      drawParallaxStars(ctx, starsFarRef.current, dt, w, h, 0.5);
      drawParallaxStars(ctx, starsRef.current, dt, w, h, 1.5);

      for (const a of asteroidPoolRef.current.getActive()) {
        if (!pausedRef.current && !gameOverRef.current) {
          a.x += a.vx * dt; a.y += a.vy * dt; a.rot += a.rotVel * dt;
          if (a.y > h + a.size) { asteroidPoolRef.current.release(a); continue; }
        }
        drawAsteroid(ctx, a.x, a.y, a.size, a.rot);
      }

      if (!gameOverRef.current && !pausedRef.current) {
        const p = playerRef.current;
        if (touchTargetRef.current.active) {
          const targetX = touchTargetRef.current.x;
          const targetY = touchTargetRef.current.y;
          p.x = lerp(p.x, clamp(targetX, 25, w - 25), 0.15 * dt);
          p.y = lerp(p.y, clamp(targetY, 25, h - 25), 0.15 * dt);
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          if (Math.hypot(dx, dy) > 5) p.angle = Math.atan2(dy, dx);
          thrustRef.current = Math.min(1, thrustRef.current + dt * 0.1);
        } else {
          thrustRef.current = Math.max(0, thrustRef.current - dt * 0.05);
        }

        if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;
        if (shootCooldownRef.current <= 0) {
          playerShoot();
          shootCooldownRef.current = getFireRate();
        }

        scoreRef.current += dt * 10 * getScoreMult();
        setScore(Math.floor(scoreRef.current));
        difficultyRef.current = 1 + scoreRef.current / 1000;

        coinTimerRef.current += dt * 16.67;
        if (coinTimerRef.current >= 8000 && gameCoinsRef.current < MAX_GAME_COINS) {
          coinTimerRef.current = 0;
          safeAddCoins(1); playCoin();
          addFloatText('+1 moneda', w / 2, h / 2 - 50, '#fbbf24');
        }

        if (hasDoubleShotRef.current) {
          doubleShotTimerRef.current -= dt;
          if (doubleShotTimerRef.current <= 0) { hasDoubleShotRef.current = false; setHasDoubleShot(false); }
        }
        if (hasCoinMagnetRef.current) {
          coinMagnetTimerRef.current -= dt;
          if (coinMagnetTimerRef.current <= 0) { hasCoinMagnetRef.current = false; setHasCoinMagnet(false); }
        }

        if (comboTimerRef.current > 0) {
          comboTimerRef.current -= dt;
          if (comboTimerRef.current <= 0) { comboRef.current = 0; setComboDisplay(0); }
        }

        if (milestoneShieldRef.current) {
          milestoneShieldTimerRef.current -= dt;
          if (milestoneShieldTimerRef.current <= 0) { milestoneShieldRef.current = false; setShieldActive(false); }
        }
        if (scoreBoostRef.current) {
          scoreBoostTimerRef.current -= dt;
          if (scoreBoostTimerRef.current <= 0) { scoreBoostRef.current = false; setScoreBoostActive(false); }
        }

        nuclearChargeRef.current += dt * 0.3;
        if (nuclearChargeRef.current >= 100 && !nuclearReady) { setNuclearReady(true); }
        if (nuclearActiveRef.current) {
          nuclearTimerRef.current -= dt;
          if (nuclearTimerRef.current <= 0) nuclearActiveRef.current = false;
        }

        playTimeRef.current += dt * 16.67;
        if (playTimeRef.current - lastPlayTimeSyncRef.current >= 5000) {
          if (isOnline) addPlayTime(playTimeRef.current - lastPlayTimeSyncRef.current);
          lastPlayTimeSyncRef.current = playTimeRef.current;
        }

        if (!bossRef.current) {
          spawnTimerRef.current += dt;
          const interval = Math.max(12, 25 - difficultyRef.current * 2);
          if (spawnTimerRef.current > interval) {
            if (Math.random() < 0.3) spawnEnemy(); else spawnMeteor();
            if (Math.random() < 0.1) spawnAsteroid();
            if (Math.random() < 0.02) spawnPowerUp();
            spawnTimerRef.current = 0;
          }
          if (scoreRef.current >= miniBossThresholdRef.current) { spawnMiniBoss(); miniBossThresholdRef.current += 500; }
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current) { spawnFinalBoss(); }
        }

        for (const m of meteorPoolRef.current.getActive()) {
          m.x += m.vx * dt; m.y += m.vy * dt; m.rot += m.rotVel * dt;
          if (m.y > h + m.size) { meteorPoolRef.current.release(m); continue; }
          if (dist(m.x, m.y, p.x, p.y) < m.size + 18) {
            meteorPoolRef.current.release(m);
            spawnParticles2D(particlesRef.current, m.x, m.y, fpsMon.scaleParticleCount(15), '#f59e0b', 6);
            playHit();
            screenShakeRef.current.trigger(4, 12);
            hapticFeedback(30);
            if (shieldRef.current || milestoneShieldRef.current) { shieldRef.current = false; addFloatText('¡Escudo!', w / 2, h / 2, '#34d399'); continue; }
            livesRef.current--; setLives(livesRef.current);
            addFloatText('¡Impacto!', w / 2, h / 2, '#ef4444');
            if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
          }
        }

        for (const e of enemyPoolRef.current.getActive()) {
          e.oscillation += dt * 0.08;
          e.x += (e.vx + Math.sin(e.oscillation) * 1.5) * dt; e.y += e.vy * dt;
          if (e.x < 20 || e.x > w - 20) e.vx *= -1;
          e.shootTimer -= dt;
          if (e.shootTimer <= 0 && e.y > 30 && e.y < h * 0.6) {
            e.shootTimer = 80 + Math.random() * 40;
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            const l = laserPoolRef.current.acquire();
            l.x = e.x; l.y = e.y; l.vx = Math.cos(angle) * 5; l.vy = Math.sin(angle) * 5;
            l.life = 100; l.color = '#f87171'; l.fromPlayer = false; l.damage = 20;
          }
          if (e.y > h + 30) { enemyPoolRef.current.release(e); continue; }
          if (dist(e.x, e.y, p.x, p.y) < e.size + 18) {
            enemyPoolRef.current.release(e);
            if (shieldRef.current || milestoneShieldRef.current) { shieldRef.current = false; continue; }
            livesRef.current--; setLives(livesRef.current); playHit();
            screenShakeRef.current.trigger(4, 12);
            hapticFeedback(30);
            if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
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
                const l = laserPoolRef.current.acquire();
                l.x = b.x; l.y = b.y; l.vx = Math.cos(sa) * 5; l.vy = Math.sin(sa) * 5;
                l.life = 120; l.color = '#f59e0b'; l.fromPlayer = false; l.damage = 20;
              }
            } else if (b.pattern === 1) {
              for (let a = -1; a <= 1; a++) {
                const sa = angle + a * 0.1;
                const l = laserPoolRef.current.acquire();
                l.x = b.x; l.y = b.y; l.vx = Math.cos(sa) * 7; l.vy = Math.sin(sa) * 7;
                l.life = 120; l.color = '#fb923c'; l.fromPlayer = false; l.damage = 20;
              }
            } else {
              for (let a = 0; a < 8; a++) {
                const sa = (a / 8) * Math.PI * 2;
                const l = laserPoolRef.current.acquire();
                l.x = b.x; l.y = b.y; l.vx = Math.cos(sa) * 4; l.vy = Math.sin(sa) * 4;
                l.life = 120; l.color = '#f59e0b'; l.fromPlayer = false; l.damage = 15;
              }
            }
          }
          setBossHp(b.hp);
          if (dist(b.x, b.y, p.x, p.y) < b.size + 20) {
            if (shieldRef.current || milestoneShieldRef.current) { shieldRef.current = false; }
            else { livesRef.current--; setLives(livesRef.current); playHit(); screenShakeRef.current.trigger(6, 15); hapticFeedback(40); if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); } }
          }
        }

        for (const pu of powerUpPoolRef.current.getActive()) {
          if (hasCoinMagnetRef.current && pu.type === 'coinMagnet') {
            const dx = p.x - pu.x;
            const dy = p.y - pu.y;
            const d = Math.hypot(dx, dy);
            if (d < 150 && d > 5) { pu.x += (dx / d) * 3 * dt; pu.y += (dy / d) * 3 * dt; }
          }
          pu.y += pu.vy * dt;
          if (pu.y > h + 20) { powerUpPoolRef.current.release(pu); continue; }
          if (dist(pu.x, pu.y, p.x, p.y) < 30) {
            powerUpPoolRef.current.release(pu);
            if (pu.type === 'doubleShot') {
              hasDoubleShotRef.current = true; setHasDoubleShot(true);
              doubleShotTimerRef.current = 600;
              addFloatText('¡DISPARO DOBLE!', w / 2, h / 2, '#22c55e', 16);
            } else {
              hasCoinMagnetRef.current = true; setHasCoinMagnet(true);
              coinMagnetTimerRef.current = 600;
              addFloatText('¡IMAN DE MONEDAS!', w / 2, h / 2, '#fbbf24', 16);
            }
            playPickup();
            hapticFeedback(40);
          }
        }

        for (const l of laserPoolRef.current.getActive()) {
          l.x += l.vx * dt; l.y += l.vy * dt; l.life -= dt;
          if (l.life <= 0 || l.x < -10 || l.x > w + 10 || l.y < -10 || l.y > h + 10) { laserPoolRef.current.release(l); continue; }

          if (l.fromPlayer) {
            let hit = false;
            for (const m of meteorPoolRef.current.getActive()) {
              if (dist(l.x, l.y, m.x, m.y) < m.size + 5) {
                m.hp -= l.damage; hit = true;
                if (m.hp <= 0) {
                  meteorPoolRef.current.release(m);
                  spawnParticles2D(particlesRef.current, m.x, m.y, fpsMon.scaleParticleCount(12), '#f59e0b', 5);
                  playExplosion();
                  comboRef.current++; comboTimerRef.current = 120;
                  if (comboRef.current >= 3) setComboDisplay(comboRef.current);
                  const comboBonus = comboRef.current >= 5 ? 1.5 : comboRef.current >= 3 ? 1.2 : 1;
                  scoreRef.current += 50 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  commonKillCountRef.current++;
                  if (commonKillCountRef.current % 5 === 0) { safeAddCoins(1); playCoin(); }
                  screenShakeRef.current.trigger(2, 8);
                }
                break;
              }
            }
            if (!hit) for (const e of enemyPoolRef.current.getActive()) {
              if (dist(l.x, l.y, e.x, e.y) < e.size + 5) {
                e.hp -= l.damage; hit = true;
                if (e.hp <= 0) {
                  enemyPoolRef.current.release(e);
                  spawnParticles2D(particlesRef.current, e.x, e.y, fpsMon.scaleParticleCount(12), '#f87171', 5);
                  playExplosion();
                  comboRef.current++; comboTimerRef.current = 120;
                  if (comboRef.current >= 3) setComboDisplay(comboRef.current);
                  const comboBonus = comboRef.current >= 5 ? 1.5 : comboRef.current >= 3 ? 1.2 : 1;
                  scoreRef.current += 100 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  commonKillCountRef.current++;
                  if (commonKillCountRef.current % 5 === 0) { safeAddCoins(1); playCoin(); }
                  screenShakeRef.current.trigger(3, 10);
                  hapticFeedback(20);
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
                  const reward = b.isMini ? 2 : 5;
                  safeAddCoins(reward);
                  scoreRef.current += (b.isMini ? 1000 : 5000) * getScoreMult(); setScore(Math.floor(scoreRef.current));
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, b.x, b.y, fpsMon.scaleParticleCount(b.isMini ? 30 : 50), b.isMini ? '#f59e0b' : '#ef4444', 8);
                  addFloatText(`+${reward} monedas`, w / 2, h / 3, '#fbbf24', 18);
                  bossRef.current = null; setBossActive(false);
                  screenShakeRef.current.trigger(b.isMini ? 8 : 12, 25);
                  hapticPattern([50, 30, 100]);
                  if (!b.isMini) { finalBossDefeatedRef.current = true; finalBossThresholdRef.current += 3000; }
                }
              }
            }
            if (hit) laserPoolRef.current.release(l);
          } else {
            if (dist(l.x, l.y, p.x, p.y) < 18) {
              laserPoolRef.current.release(l);
              if (shieldRef.current || milestoneShieldRef.current) { shieldRef.current = false; addFloatText('¡Escudo!', w / 2, h / 2, '#34d399'); continue; }
              livesRef.current--; setLives(livesRef.current); playHit();
              screenShakeRef.current.trigger(4, 12);
              hapticFeedback(30);
              if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
            }
          }
        }

        for (const m of meteorPoolRef.current.getActive()) drawMeteor2D(ctx, m.x, m.y, m.size, m.rot, m.hp, m.maxHp);
        for (const e of enemyPoolRef.current.getActive()) drawBeetleEnemy(ctx, e.x, e.y, e.angle, e.size, e.oscillation);
        if (bossRef.current) drawBossShip2D(ctx, bossRef.current.x, bossRef.current.y, bossRef.current.angle, bossRef.current.isMini ? '#f59e0b' : '#ef4444', bossRef.current.size, bossRef.current.hp, bossRef.current.maxHp);
        for (const pu of powerUpPoolRef.current.getActive()) {
          if (pu.type === 'doubleShot') drawDoubleShotPowerup(ctx, pu.x, pu.y, now);
          else {
            ctx.save();
            ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 15;
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(pu.x, pu.y, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('M', pu.x, pu.y);
            ctx.restore();
          }
        }

        if (thrustRef.current > 0 && !gameOverRef.current) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle + Math.PI / 2);
          ctx.shadowColor = '#22d3ee'; ctx.shadowBlur = 15;
          ctx.fillStyle = `rgba(34,211,238,${thrustRef.current * 0.6})`;
          ctx.beginPath();
          ctx.moveTo(-6, 15); ctx.lineTo(0, 15 + 12 * thrustRef.current); ctx.lineTo(6, 15);
          ctx.closePath(); ctx.fill();
          ctx.fillStyle = `rgba(255,255,255,${thrustRef.current * 0.4})`;
          ctx.beginPath();
          ctx.moveTo(-3, 15); ctx.lineTo(0, 15 + 8 * thrustRef.current); ctx.lineTo(3, 15);
          ctx.closePath(); ctx.fill();
          ctx.restore();
        }

        drawShip2D(ctx, p.x, p.y, p.angle, shieldRef.current ? '#34d399' : ship.color, SHIP_SIZE, shieldRef.current || milestoneShieldRef.current);

        if (milestoneShieldRef.current) {
          drawNeonCircle(ctx, p.x, p.y, SHIP_SIZE + 8, '#22d3ee', 20);
        }

        if (nuclearActiveRef.current) {
          ctx.save();
          ctx.globalAlpha = 0.15 + Math.sin(now * 0.02) * 0.05;
          ctx.fillStyle = '#fbbf24';
          ctx.fillRect(-20, -20, w + 40, h + 40);
          ctx.restore();
        }
      }

      updateParticles2D(particlesRef.current, dt);
      drawParticles2D(ctx, particlesRef.current);

      for (const l of laserPoolRef.current.getActive()) {
        ctx.save();
        const angle = Math.atan2(l.vy, l.vx);
        ctx.translate(l.x, l.y);
        ctx.rotate(angle);
        ctx.shadowColor = l.color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(-6, 0, 6, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.ellipse(-12, 0, 5, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(2, 0, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      updateMuzzleFlashes(muzzleFlashesRef.current, dt);
      drawMuzzleFlashes(ctx, muzzleFlashesRef.current);

      ctx.restore();

      drawDebugFooter(ctx, w, h, fpsMon.current);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins, setLives, ship, submitSpaceScore, isOnline, addPlayTime, vip, safeAddCoins]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const update = (cx: number, cy: number) => {
      const rect = canvas.getBoundingClientRect();
      touchTargetRef.current = { x: cx - rect.left, y: cy - rect.top, active: true };
    };
    const onTouchStart = (e: TouchEvent) => { initAudio(); if (e.touches.length > 0) update(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) update(e.touches[0].clientX, e.touches[0].clientY); };
    const onTouchEnd = () => { touchTargetRef.current.active = false; };
    const onMouseDown = (e: MouseEvent) => { initAudio(); update(e.clientX, e.clientY); };
    const onMouseMove = (e: MouseEvent) => { if (touchTargetRef.current.active) update(e.clientX, e.clientY); };
    const onMouseUp = () => { touchTargetRef.current.active = false; };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <div className="absolute inset-0 bg-black flex flex-col" style={{ paddingTop: vip ? 0 : 'calc(var(--ad-banner-height) + env(safe-area-inset-top))' }}>
      <OfflineBanner />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <button onClick={() => setScreen('mode-select')} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(!paused)} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-cyan-400 border border-cyan-400/30">
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            {Array.from({ length: 3 }).map((_, i) => <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-white/20'}`} />)}
          </div>
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-white text-sm font-bold">{score} pts</div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5"><Coins className="w-4 h-4 text-amber-400" /><span className="text-amber-400 text-sm font-bold">{coinsEarned}</span></div>
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
      {hasDoubleShot && (
        <div className="absolute top-14 right-4 z-10 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold animate-pulse">
          DISPARO DOBLE {Math.ceil(doubleShotTimerRef.current / 60)}s
        </div>
      )}
      {hasCoinMagnet && (
        <div className="absolute top-24 right-4 z-10 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold animate-pulse flex items-center gap-1">
          <Magnet className="w-3 h-3" /> IMAN {Math.ceil(coinMagnetTimerRef.current / 60)}s
        </div>
      )}
      {shieldActive && (
        <div className="absolute top-14 left-4 z-10 w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400 animate-pulse">
          <Shield className="w-5 h-5" />
        </div>
      )}
      {scoreBoostActive && (
        <div className="absolute top-24 left-4 z-10 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 animate-pulse">
          <span className="text-xs font-black">2x</span>
        </div>
      )}
      {comboDisplay >= 3 && !gameOver && (
        <div className="absolute top-32 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="text-cyan-400 font-black text-lg animate-pulse" style={{ textShadow: '0 0 15px rgba(34,211,238,0.8)' }}>COMBO x{comboDisplay}</span>
        </div>
      )}
      {floatTexts.map((ft) => <div key={ft.id} className="absolute z-20 font-bold animate-float-up pointer-events-none" style={{ left: ft.x, top: ft.y, transform: 'translate(-50%, -50%)', color: ft.color, fontSize: ft.size || 14 }}>{ft.text}</div>)}
      {milestoneBanner && (
        <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none animate-fade-in">
          <div className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-600/30 via-amber-400/30 to-amber-600/30 border-2 border-amber-400 shadow-2xl shadow-amber-500/40 backdrop-blur-md text-center" style={{ animation: 'pulse-glow 1s ease-in-out infinite' }}>
            <Baby className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <p className="text-amber-300 font-black text-lg tracking-wide" style={{ textShadow: '0 0 20px rgba(251,191,36,0.8)' }}>{milestoneBanner}</p>
            {shieldActive && <p className="text-cyan-400 text-xs mt-1 font-bold">Escudo Neón + 2x Puntos activados</p>}
          </div>
        </div>
      )}
      {!gameOver && !paused && showTutorial && (
        <>
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none animate-fade-in">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/50 text-cyan-400 border border-cyan-400/20">ARRASTRA PARA MOVER · AUTO-DISPARO</span>
          </div>
          <button
            onClick={activateNuclear}
            disabled={!nuclearReady}
            className={`absolute bottom-24 right-6 z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all ${nuclearReady ? 'bg-amber-500/30 border-2 border-amber-400 animate-pulse shadow-lg shadow-amber-500/30' : 'bg-black/50 border border-white/10 opacity-40'}`}
          >
            <Radiation className={`w-7 h-7 ${nuclearReady ? 'text-amber-400' : 'text-white/30'}`} />
          </button>
        </>
      )}
      {paused && !gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <Pause className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h2 className="text-white font-bold text-2xl mb-4">PAUSA</h2>
            <button onClick={() => setPaused(false)} className="px-8 py-3 rounded-xl bg-cyan-500 text-white font-bold hover:bg-cyan-400 flex items-center gap-2 mx-auto">
              <Play className="w-5 h-5" /> Continuar
            </button>
          </div>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-card/90 border border-red-500/30 p-6 text-center animate-scale-in shadow-2xl shadow-red-500/20">
            <h2 className="text-red-400 font-bold text-2xl mb-2" style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>Game Over</h2>
            <p className="text-white/60 text-sm mb-1">Puntuacion: {score}</p>
            <p className="text-amber-400 text-sm mb-6">Monedas ganadas: {coinsEarned}</p>
            {!hasRevived && isOnline && (
              <button onClick={() => {
                const now = Date.now();
                if (now - adDebounceRef.current < 4000) return;
                adDebounceRef.current = now;
                setShowReviveReward(true);
              }} className="w-full py-3 rounded-xl bg-green-500 text-white font-bold mb-2 hover:bg-green-400 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                <Video className="w-4 h-4" /> Revivir (Ver anuncio)
              </button>
            )}
            <button onClick={() => initGame()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold mb-2 hover:bg-primary/90 shadow-lg shadow-primary/20">Reiniciar</button>
            <button onClick={() => setScreen('mode-select')} className="w-full py-3 rounded-xl bg-card border border-border text-white font-bold hover:bg-secondary">Salir</button>
          </div>
        </div>
      )}
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
      <RewardAdModal open={showReviveReward} onClose={() => setShowReviveReward(false)} onReward={() => { livesRef.current = 3; shieldRef.current = true; setLives(3); gameOverRef.current = false; setGameOver(false); hasRevivedRef.current = true; setHasRevived(true); safeAddCoins(3); }} title="Revivir" rewardText="¡Has revivido con vida completa, escudo y 3 monedas extra!" userRole={userRole} vip={vip} adId={getRewardedAdId('revivir')} />
      <MuteButton />
    </div>
  );
}
