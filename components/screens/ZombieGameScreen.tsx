'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Zap, Bomb, Video, Radiation, Shield, Baby, Sparkles, Magnet } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  type Particle2D, type MuzzleFlash,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  spawnMuzzleFlash, updateMuzzleFlashes, drawMuzzleFlashes,
  drawNeonCircle,
  ScreenShake, hapticFeedback, hapticPattern,
  clamp, dist, rand, lerp,
} from '@/lib/engine2d';
import { ObjectPool, FPSMonitor } from '@/lib/game-performance';
import { playShoot, playExplosion, playBossAlert, playCoin, playHit, playPickup, initAudio } from '@/lib/audio';

type ZombieType = 'normal' | 'fast' | 'tank' | 'boss';
type PowerUpType = 'shield' | 'doubleShot' | 'coinMagnet' | 'weapon' | 'coins' | 'points';

interface Zombie { x: number; y: number; vy: number; vx: number; walkCycle: number; hp: number; maxHp: number; size: number; color: string; type: ZombieType; hitFlash: number; active: boolean; reset(): void; }
interface Bullet { x: number; y: number; vx: number; vy: number; life: number; damage: number; color: string; active: boolean; reset(): void; }
interface Barrel { x: number; y: number; vy: number; hp: number; id: number; active: boolean; reset(): void; }
interface FloatingCoin { x: number; y: number; vx: number; vy: number; life: number; active: boolean; reset(): void; }
interface PowerUpDrop { x: number; y: number; vy: number; type: PowerUpType; active: boolean; reset(): void; }
interface BloodSplat { x: number; y: number; size: number; alpha: number; }

function makeZombie(): Zombie { return { x: 0, y: 0, vy: 0, vx: 0, walkCycle: 0, hp: 100, maxHp: 100, size: 22, color: '#65a30d', type: 'normal', hitFlash: 0, active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.vx = 0; this.walkCycle = 0; this.hp = 100; this.maxHp = 100; this.size = 22; this.color = '#65a30d'; this.type = 'normal'; this.hitFlash = 0; } }; }
function makeBullet(): Bullet { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, damage: 0, color: '', active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; this.damage = 0; this.color = ''; } }; }
let barrelIdCounter = 0;
function makeBarrel(): Barrel { return { x: 0, y: 0, vy: 0, hp: 50, id: 0, active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.hp = 50; this.id = 0; } }; }
function makeFloatingCoin(): FloatingCoin { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; } }; }
function makePowerUpDrop(): PowerUpDrop { return { x: 0, y: 0, vy: 0, type: 'coins', active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.type = 'coins'; } }; }

const LANE_COUNT = 5;
const BARRICADE_Y_RATIO = 0.82;
const TURRET_Y_RATIO = 0.88;
const SPRITE_SCALE = 1.35;

const MILESTONES: Record<number, { title: string; coins?: number; shield?: boolean; scoreBoost?: boolean; color: string }> = {
  4: { title: '¡4 AÑOS DE AMOR ETERNO!', coins: 400, color: '#ec4899' },
  10: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true, color: '#60a5fa' },
  30: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true, color: '#60a5fa' },
};

function randomCoinCap(): number { return Math.floor(rand(70, 91)); }

export function ZombieGameScreen() {
  const { setScreen, addCoins, getZombieCharacter, lives, setLives, upgrades, submitZombieScore, isOnline, bloodEnabled, canShowInterstitial, recordInterstitial, vip, addPlayTime, startGameBatch, endGameBatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [barricadeHp, setBarricadeHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [showReviveReward, setShowReviveReward] = useState(false);
  const [floatTexts, setFloatTexts] = useState<Array<{ id: number; text: string; x: number; y: number; color: string; size?: number }>>([]);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossName, setBossName] = useState('');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [nuclearReady, setNuclearReady] = useState(false);
  const [hasRevived, setHasRevived] = useState(false);
  const [milestoneBanner, setMilestoneBanner] = useState<string | null>(null);
  const [comboDisplay, setComboDisplay] = useState(0);
  const [shieldActive, setShieldActive] = useState(false);
  const [scoreBoostActive, setScoreBoostActive] = useState(false);
  const [overdriveActive, setOverdriveActive] = useState(false);
  const [doubleShotActive, setDoubleShotActive] = useState(false);
  const [coinMagnetActive, setCoinMagnetActive] = useState(false);
  const [scoreColor, setScoreColor] = useState('#ffffff');
  const [killStreak, setKillStreak] = useState(0);

  const zombiePoolRef = useRef<ObjectPool<Zombie>>(new ObjectPool(makeZombie, 30));
  const bulletPoolRef = useRef<ObjectPool<Bullet>>(new ObjectPool(makeBullet, 60));
  const barrelPoolRef = useRef<ObjectPool<Barrel>>(new ObjectPool(makeBarrel, 8));
  const coinPoolRef = useRef<ObjectPool<FloatingCoin>>(new ObjectPool(makeFloatingCoin, 30));
  const powerUpPoolRef = useRef<ObjectPool<PowerUpDrop>>(new ObjectPool(makePowerUpDrop, 8));
  const bloodSplatsRef = useRef<BloodSplat[]>([]);
  const bossRef = useRef<Zombie | null>(null);
  const particlesRef = useRef<Particle2D[]>([]);
  const muzzleFlashesRef = useRef<MuzzleFlash[]>([]);
  const screenShakeRef = useRef(new ScreenShake());
  const touchTargetRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const turretXRef = useRef(0);
  const scoreRef = useRef(0);
  const killCountRef = useRef(0);
  const livesRef = useRef(3);
  const barricadeHpRef = useRef(100);
  const barricadeMaxHpRef = useRef(100);
  const gameOverRef = useRef(false);
  const shootCooldownRef = useRef(0);
  const fireRateLevelRef = useRef(0);
  const damageLevelRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const barrelTimerRef = useRef(0);
  const difficultyRef = useRef(1);
  const miniBossThresholdRef = useRef(500);
  const finalBossThresholdRef = useRef(1500);
  const finalBossDefeatedRef = useRef(false);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const scrollYRef = useRef(0);
  const bloodEnabledRef = useRef(true);
  const whiteFlashRef = useRef(0);
  const gameCoinsRef = useRef(0);
  const coinCapRef = useRef(80);
  const interstitialCheckedRef = useRef(false);
  const fpsMonitorRef = useRef<FPSMonitor>(new FPSMonitor());
  const playTimeRef = useRef(0);
  const lastPlayTimeSyncRef = useRef(0);
  const nuclearChargeRef = useRef(0);
  const nuclearActiveRef = useRef(false);
  const nuclearTimerRef = useRef(0);
  const hasRevivedRef = useRef(false);
  const scoreMultRef = useRef(1);
  const damageMultRef = useRef(1);
  const speedMultRef = useRef(1);
  const comboRef = useRef(0);
  const comboTimerRef = useRef(0);
  const shieldRef = useRef(false);
  const shieldTimerRef = useRef(0);
  const scoreBoostRef = useRef(false);
  const scoreBoostTimerRef = useRef(0);
  const alertFlashRef = useRef(0);
  const overdriveRef = useRef(false);
  const overdriveTimerRef = useRef(0);
  const killStreakRef = useRef(0);
  const doubleShotRef = useRef(false);
  const doubleShotTimerRef = useRef(0);
  const coinMagnetRef = useRef(false);
  const coinMagnetTimerRef = useRef(0);
  const coinHudXRef = useRef(0);
  const coinHudYRef = useRef(0);

  const char = getZombieCharacter();

  useEffect(() => {
    speedMultRef.current = char.speedMult;
    scoreMultRef.current = char.scoreMult;
    damageMultRef.current = char.damageMult;
    fireRateLevelRef.current = upgrades.fireRate;
    damageLevelRef.current = upgrades.damage;
  }, [char, upgrades]);

  useEffect(() => { bloodEnabledRef.current = bloodEnabled; }, [bloodEnabled]);

  const safeAddCoins = useCallback((amount: number) => {
    if (gameCoinsRef.current >= coinCapRef.current) return;
    const toAdd = Math.min(amount, coinCapRef.current - gameCoinsRef.current);
    if (toAdd <= 0) return;
    addCoins(toAdd);
    gameCoinsRef.current += toAdd;
    setCoinsEarned(gameCoinsRef.current);
  }, [addCoins]);

  const getFireRate = () => {
    let rate = Math.max(5, 16 - fireRateLevelRef.current * 2);
    if (overdriveRef.current) rate *= 0.5;
    return rate;
  };
  const getDamage = () => (30 + damageLevelRef.current * 12) * damageMultRef.current * (nuclearActiveRef.current ? 2.5 : 1);
  const getScoreMult = () => scoreMultRef.current * (scoreBoostRef.current ? 2 : 1) * (overdriveRef.current ? 1.5 : 1);

  const addFloatText = (text: string, x: number, y: number, color = '#fbbf24', size = 14) => {
    const id = Date.now() + Math.random();
    setFloatTexts((prev) => [...prev, { id, text, x, y, color, size }]);
    setTimeout(() => setFloatTexts((prev) => prev.filter((f) => f.id !== id)), 1000);
  };

  const spawnFloatingCoins = (x: number, y: number, count: number) => {
    for (let i = 0; i < count; i++) {
      if (gameCoinsRef.current >= coinCapRef.current) break;
      const c = coinPoolRef.current.acquire();
      c.x = x + rand(-15, 15); c.y = y + rand(-15, 15);
      c.vx = rand(-2, 2); c.vy = rand(-3, -1);
      c.life = 60;
    }
  };

  const checkMilestone = useCallback(() => {
    try {
      const raw = localStorage.getItem('garrdash_games_played');
      const played = raw ? parseInt(raw, 10) : 0;
      const next = played + 1;
      localStorage.setItem('garrdash_games_played', String(next));
      const ms = MILESTONES[next];
      if (ms) {
        setMilestoneBanner(ms.title);
        setScoreColor(ms.color);
        setTimeout(() => { setMilestoneBanner(null); setScoreColor('#ffffff'); }, 4000);
        if (ms.coins) {
          safeAddCoins(ms.coins);
          addFloatText(`+${ms.coins} MONEDAS`, canvasSizeRef.current.w / 2, canvasSizeRef.current.h / 2, '#fbbf24', 20);
          hapticPattern([50, 30, 50, 30, 100]);
        }
        if (ms.shield) {
          shieldRef.current = true; setShieldActive(true);
          shieldTimerRef.current = 600;
          hapticPattern([50, 30, 100]);
        }
        if (ms.scoreBoost) {
          scoreBoostRef.current = true; setScoreBoostActive(true);
          scoreBoostTimerRef.current = 600;
        }
      }
    } catch {}
  }, [safeAddCoins]);

  const checkKillStreakMilestone = useCallback((streak: number) => {
    if (streak === 4) { setScoreColor('#ec4899'); setTimeout(() => setScoreColor('#ffffff'), 3000); }
    else if (streak === 10 || streak === 30) { setScoreColor('#60a5fa'); setTimeout(() => setScoreColor('#ffffff'), 3000); }
  }, []);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    turretXRef.current = canvas.width / 2;
    zombiePoolRef.current.releaseAll();
    bulletPoolRef.current.releaseAll();
    barrelPoolRef.current.releaseAll();
    coinPoolRef.current.releaseAll();
    powerUpPoolRef.current.releaseAll();
    bloodSplatsRef.current = [];
    bossRef.current = null;
    particlesRef.current = [];
    muzzleFlashesRef.current = [];
    scoreRef.current = 0; killCountRef.current = 0;
    livesRef.current = 3;
    barricadeHpRef.current = 100; barricadeMaxHpRef.current = 100;
    gameOverRef.current = false;
    spawnTimerRef.current = 0; barrelTimerRef.current = 0;
    difficultyRef.current = 1; miniBossThresholdRef.current = 500; finalBossThresholdRef.current = 1500;
    finalBossDefeatedRef.current = false; scrollYRef.current = 0;
    whiteFlashRef.current = 0; gameCoinsRef.current = 0; interstitialCheckedRef.current = false;
    coinCapRef.current = randomCoinCap();
    nuclearChargeRef.current = 0; nuclearActiveRef.current = false; nuclearTimerRef.current = 0;
    hasRevivedRef.current = false; setHasRevived(false);
    comboRef.current = 0; comboTimerRef.current = 0; setComboDisplay(0);
    playTimeRef.current = 0; lastPlayTimeSyncRef.current = 0;
    alertFlashRef.current = 0;
    overdriveRef.current = false; setOverdriveActive(false); overdriveTimerRef.current = 0;
    killStreakRef.current = 0; setKillStreak(0);
    doubleShotRef.current = false; setDoubleShotActive(false); doubleShotTimerRef.current = 0;
    coinMagnetRef.current = false; setCoinMagnetActive(false); coinMagnetTimerRef.current = 0;
    setScore(0); setZombiesKilled(0); setCoinsEarned(0); setBarricadeHp(100); setGameOver(false); setBossActive(false);
    setNuclearReady(false); setScoreColor('#ffffff');
    startGameBatch();
    checkMilestone();
  }, [upgrades, startGameBatch, checkMilestone]);

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

  const getLaneX = (lane: number) => {
    const { w } = canvasSizeRef.current;
    return (w / LANE_COUNT) * (lane + 0.5);
  };

  const findNearestZombieX = (): number => {
    const { w, h } = canvasSizeRef.current;
    const barricadeY = h * BARRICADE_Y_RATIO;
    let nearestX = w / 2;
    let nearestY = -Infinity;
    for (const z of zombiePoolRef.current.getActive()) {
      if (z.y > nearestY && z.y < barricadeY) { nearestY = z.y; nearestX = z.x; }
    }
    if (bossRef.current && bossRef.current.y > nearestY) nearestX = bossRef.current.x;
    return nearestX;
  };

  const shoot = useCallback(() => {
    if (gameOverRef.current || shootCooldownRef.current > 0) return;
    initAudio();
    const { w, h } = canvasSizeRef.current;
    const turretY = h * TURRET_Y_RATIO;
    const tx = turretXRef.current;
    const speed = 12;
    const dmg = getDamage();
    const color = '#fbbf24';

    const fire = (ox: number, vxMod: number) => {
      const b = bulletPoolRef.current.acquire();
      b.x = tx + ox; b.y = turretY - 30;
      b.vx = vxMod; b.vy = -speed;
      b.life = 80; b.damage = dmg; b.color = color;
    };

    if (doubleShotRef.current) {
      fire(-12, -1); fire(12, 1);
      shootCooldownRef.current = getFireRate();
    } else {
      fire(0, 0);
      shootCooldownRef.current = getFireRate();
    }

    spawnMuzzleFlash(muzzleFlashesRef.current, tx, turretY - 30, -Math.PI / 2, color, 22 * SPRITE_SCALE);
    playShoot();
  }, []);

  const spawnZombie = useCallback(() => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const r = Math.random();
    let type: ZombieType = 'normal';
    if (difficultyRef.current > 1.5 && r < 0.15) type = 'fast';
    else if (difficultyRef.current > 2 && r < 0.22) type = 'tank';

    let zHp: number, size: number, color: string, vy: number;
    if (type === 'fast') { zHp = 50; size = 18 * SPRITE_SCALE; color = '#ef4444'; vy = 1.8 + difficultyRef.current * 0.2; }
    else if (type === 'tank') { zHp = 300; size = 28 * SPRITE_SCALE; color = '#7c3aed'; vy = 0.8 + difficultyRef.current * 0.1; }
    else { zHp = 100; size = 16 * SPRITE_SCALE; color = '#65a30d'; vy = 1.2 + difficultyRef.current * 0.15; }

    const z = zombiePoolRef.current.acquire();
    z.x = getLaneX(lane); z.y = -30;
    z.vx = type === 'fast' ? rand(-1.5, 1.5) : 0;
    z.vy = vy * speedMultRef.current; z.walkCycle = Math.random() * 10;
    z.hp = zHp; z.maxHp = zHp; z.size = size; z.color = color; z.type = type; z.hitFlash = 0;
  }, []);

  const spawnBoss = useCallback(() => {
    const { w } = canvasSizeRef.current;
    const zHp = 2000;
    const boss = zombiePoolRef.current.acquire();
    boss.x = w / 2; boss.y = -60; boss.vy = 0.6; boss.vx = 0; boss.walkCycle = 0;
    boss.hp = zHp; boss.maxHp = zHp; boss.size = 42 * SPRITE_SCALE; boss.color = '#dc2626'; boss.type = 'boss'; boss.hitFlash = 0;
    bossRef.current = boss;
    setBossActive(true); setBossHp(zHp); setBossMaxHp(zHp); setBossName('JEFE DE OLEADA');
    playBossAlert();
    addFloatText('¡JEFE DE OLEADA!', w / 2, canvasSizeRef.current.h / 3, '#dc2626', 18);
    screenShakeRef.current.trigger(6, 20);
    hapticFeedback(50);
  }, []);

  const spawnBarrel = useCallback(() => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const b = barrelPoolRef.current.acquire();
    b.x = getLaneX(lane); b.y = -20; b.vy = 0.8 + Math.random() * 0.4;
    b.hp = 50; b.id = ++barrelIdCounter;
  }, []);

  const spawnPowerUpDrop = (x: number, y: number) => {
    const types: PowerUpType[] = ['shield', 'doubleShot', 'coinMagnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    const pu = powerUpPoolRef.current.acquire();
    pu.x = x; pu.y = y; pu.vy = 1.5; pu.type = type;
  };

  const activateNuclear = () => {
    if (!nuclearReady || gameOverRef.current) return;
    nuclearActiveRef.current = true;
    nuclearTimerRef.current = 180;
    nuclearChargeRef.current = 0;
    setNuclearReady(false);
    const { w, h } = canvasSizeRef.current;
    addFloatText('¡NUKE!', w / 2, h / 2, '#fbbf24', 24);
    playExplosion();
    whiteFlashRef.current = 1;
    screenShakeRef.current.trigger(12, 30);
    hapticPattern([100, 50, 100, 50, 200]);
    for (const z of zombiePoolRef.current.getActive()) {
      spawnParticles2D(particlesRef.current, z.x, z.y, 12, '#fbbf24', 6);
      zombiePoolRef.current.release(z);
      scoreRef.current += 50 * getScoreMult();
      killCountRef.current++;
    }
    setScore(Math.floor(scoreRef.current)); setZombiesKilled(killCountRef.current);
  };

  useEffect(() => {
    if (gameOver && !interstitialCheckedRef.current) {
      interstitialCheckedRef.current = true;
      endGameBatch();
      submitZombieScore(killCountRef.current);
      hapticPattern([100, 50, 200]);
      if (!vip && canShowInterstitial()) { setShowInterstitial(true); recordInterstitial(); }
    }
  }, [gameOver, canShowInterstitial, recordInterstitial, vip, endGameBatch, submitZombieScore]);

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
      const barricadeY = h * BARRICADE_Y_RATIO;
      const turretY = h * TURRET_Y_RATIO;
      const coinsCapped = gameCoinsRef.current >= coinCapRef.current;

      screenShakeRef.current.update(dt);
      const shake = screenShakeRef.current.getOffset();

      scrollYRef.current += dt * (coinsCapped ? 3 : 1.5);
      if (alertFlashRef.current > 0) alertFlashRef.current = Math.max(0, alertFlashRef.current - dt * 0.05);

      ctx.save();
      ctx.translate(shake.x, shake.y);

      // Overdrive border
      if (overdriveRef.current) {
        const pulse = 0.3 + Math.sin(now * 0.01) * 0.2;
        ctx.strokeStyle = `rgba(255,215,0,${pulse})`;
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, w - 6, h - 6);
        ctx.strokeStyle = `rgba(255,100,0,${pulse * 0.5})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(8, 8, w - 16, h - 16);
      }

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1a1505');
      grad.addColorStop(0.4, '#2a2010');
      grad.addColorStop(0.7, '#1a1510');
      grad.addColorStop(1, '#0a0805');
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      if (coinsCapped) {
        ctx.fillStyle = `rgba(255,50,50,${0.04 + Math.sin(now * 0.01) * 0.02})`;
        ctx.fillRect(-20, -20, w + 40, h + 40);
      }

      if (alertFlashRef.current > 0) {
        ctx.fillStyle = `rgba(255,50,50,${alertFlashRef.current * 0.08})`;
        ctx.fillRect(-20, -20, w + 40, h + 40);
      }

      ctx.strokeStyle = 'rgba(80,60,30,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < LANE_COUNT; i++) {
        const lx = (w / LANE_COUNT) * i;
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, barricadeY); ctx.stroke();
      }

      ctx.fillStyle = 'rgba(100,80,50,0.15)';
      for (let i = 0; i < w; i += 3) {
        const dashY = ((i * 2 + scrollYRef.current) % 50);
        if (dashY < barricadeY) { ctx.fillRect(w / 2 - 2 + Math.sin(i * 0.1) * 1, dashY, 4, 24); }
      }

      ctx.fillStyle = 'rgba(30,25,20,0.4)';
      for (let i = 0; i < w; i += 40) {
        const cy = ((i * 0.5 + scrollYRef.current * 0.3) % 60);
        ctx.fillRect(i, cy, 3, 3);
        ctx.fillRect(i + 15, cy + 20, 2, 2);
      }

      if (fpsMon.quality !== 'low') {
        const fogGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        fogGrad.addColorStop(0, 'rgba(100,50,20,0.15)');
        fogGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, w, h * 0.4);
      }

      if (!gameOverRef.current) {
        if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;

        if (touchTargetRef.current.active) {
          turretXRef.current = lerp(turretXRef.current, clamp(touchTargetRef.current.x, 30, w - 30), 0.25 * dt);
        } else {
          const targetX = findNearestZombieX();
          turretXRef.current = lerp(turretXRef.current, targetX, 0.08 * dt);
        }
        turretXRef.current = clamp(turretXRef.current, 30, w - 30);

        shoot();

        difficultyRef.current = 1 + scoreRef.current / 500;
        if (coinsCapped) difficultyRef.current *= 1.5;

        if (!bossRef.current) {
          spawnTimerRef.current += dt;
          const interval = Math.max(8, (coinsCapped ? 20 : 30) - difficultyRef.current * 2.5);
          if (spawnTimerRef.current > interval) { spawnZombie(); spawnTimerRef.current = 0; }
          if (scoreRef.current >= miniBossThresholdRef.current) {
            for (let i = 0; i < 2; i++) {
              spawnZombie();
              const active = zombiePoolRef.current.getActive();
              const last = active[active.length - 1];
              if (last) { last.type = 'tank'; last.hp = 200; last.maxHp = 200; last.size = 26 * SPRITE_SCALE; last.color = '#a855f7'; last.vy *= 0.6; }
            }
            miniBossThresholdRef.current += 500;
            addFloatText('¡Mutantes!', w / 2, h / 3, '#a855f7', 16);
            screenShakeRef.current.trigger(4, 15);
          }
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current) spawnBoss();
        }

        barrelTimerRef.current += dt;
        if (barrelTimerRef.current > 200) { spawnBarrel(); barrelTimerRef.current = 0; }

        if (comboTimerRef.current > 0) {
          comboTimerRef.current -= dt;
          if (comboTimerRef.current <= 0) { comboRef.current = 0; setComboDisplay(0); }
        }

        if (shieldRef.current) {
          shieldTimerRef.current -= dt;
          if (shieldTimerRef.current <= 0) { shieldRef.current = false; setShieldActive(false); }
        }
        if (scoreBoostRef.current) {
          scoreBoostTimerRef.current -= dt;
          if (scoreBoostTimerRef.current <= 0) { scoreBoostRef.current = false; setScoreBoostActive(false); }
        }
        if (doubleShotRef.current) {
          doubleShotTimerRef.current -= dt;
          if (doubleShotTimerRef.current <= 0) { doubleShotRef.current = false; setDoubleShotActive(false); }
        }
        if (coinMagnetRef.current) {
          coinMagnetTimerRef.current -= dt;
          if (coinMagnetTimerRef.current <= 0) { coinMagnetRef.current = false; setCoinMagnetActive(false); }
        }
        if (overdriveRef.current) {
          overdriveTimerRef.current -= dt;
          if (overdriveTimerRef.current <= 0) { overdriveRef.current = false; setOverdriveActive(false); }
        }

        for (const z of zombiePoolRef.current.getActive()) {
          z.y += z.vy * dt;
          if (z.type === 'fast') z.x += z.vx * dt;
          z.walkCycle += dt * 0.3;
          if (z.hitFlash > 0) z.hitFlash = Math.max(0, z.hitFlash - dt * 0.1);

          if (z.y > barricadeY - z.size) {
            const dmg = z.type === 'tank' ? 25 : z.type === 'fast' ? 12 : z.type === 'boss' ? 30 : 15;
            if (shieldRef.current) {
              addFloatText('¡ESCUDO!', z.x, barricadeY - 30, '#22d3ee', 16);
              spawnParticles2D(particlesRef.current, z.x, barricadeY, 10, '#22d3ee', 5);
            } else {
              barricadeHpRef.current -= dmg; setBarricadeHp(Math.max(0, barricadeHpRef.current));
              playHit();
              addFloatText(`-${dmg}`, z.x, barricadeY - 20, '#ef4444');
              spawnParticles2D(particlesRef.current, z.x, barricadeY, 8, '#ef4444', 4);
              screenShakeRef.current.trigger(3, 10);
              killStreakRef.current = 0; setKillStreak(0);
            }
            if (z === bossRef.current) { bossRef.current = null; setBossActive(false); }
            zombiePoolRef.current.release(z);
            if (barricadeHpRef.current <= 0) {
              livesRef.current--; setLives(livesRef.current);
              if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
              else {
                barricadeHpRef.current = barricadeMaxHpRef.current; setBarricadeHp(barricadeMaxHpRef.current);
                addFloatText('¡Barricada reparada!', w / 2, h / 2, '#34d399', 16);
              }
            }
          }
        }

        for (const b of barrelPoolRef.current.getActive()) {
          b.y += b.vy * dt;
          if (b.y > barricadeY - 10) { barrelPoolRef.current.release(b); }
        }

        for (const pu of powerUpPoolRef.current.getActive()) {
          if (coinMagnetRef.current) {
            const dx = turretXRef.current - pu.x;
            const dy = turretY - pu.y;
            const d = Math.hypot(dx, dy);
            if (d < 200 && d > 5) { pu.x += (dx / d) * 3 * dt; pu.y += (dy / d) * 3 * dt; }
          }
          pu.y += pu.vy * dt;
          if (pu.y > barricadeY - 10) { powerUpPoolRef.current.release(pu); continue; }
          if (dist(pu.x, pu.y, turretXRef.current, turretY) < 35) {
            powerUpPoolRef.current.release(pu);
            if (pu.type === 'shield') {
              shieldRef.current = true; setShieldActive(true); shieldTimerRef.current = 360;
              addFloatText('¡ESCUDO NEÓN!', w / 2, h / 2, '#22d3ee', 16);
            } else if (pu.type === 'doubleShot') {
              doubleShotRef.current = true; setDoubleShotActive(true); doubleShotTimerRef.current = 480;
              addFloatText('¡DOBLE RÁFAGA!', w / 2, h / 2, '#fbbf24', 16);
            } else if (pu.type === 'coinMagnet') {
              coinMagnetRef.current = true; setCoinMagnetActive(true); coinMagnetTimerRef.current = 480;
              addFloatText('¡IMÁN DE MONEDAS!', w / 2, h / 2, '#fbbf24', 16);
            }
            playPickup();
            hapticFeedback(40);
          }
        }

        for (const b of bulletPoolRef.current.getActive()) {
          b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
          if (b.life <= 0 || b.y < -10) { bulletPoolRef.current.release(b); continue; }

          let hit = false;
          for (const z of zombiePoolRef.current.getActive()) {
            if (dist(b.x, b.y, z.x, z.y) < z.size + 6) {
              z.hp -= b.damage; z.hitFlash = 1; hit = true;
              spawnParticles2D(particlesRef.current, b.x, b.y, fpsMon.scaleParticleCount(4), b.color, 3);
              addFloatText(`${Math.floor(b.damage)}`, b.x, b.y - 10, '#fbbf24', 11);
              if (z.hp <= 0) {
                zombiePoolRef.current.release(z);
                const bloodColor = bloodEnabledRef.current ? z.color : '#64748b';
                comboRef.current++; comboTimerRef.current = 120;
                if (comboRef.current >= 3) setComboDisplay(comboRef.current);
                const comboBonus = comboRef.current >= 5 ? 1.5 : comboRef.current >= 3 ? 1.2 : 1;

                killStreakRef.current++; setKillStreak(killStreakRef.current);
                checkKillStreakMilestone(killStreakRef.current);

                if (z === bossRef.current) {
                  bossRef.current = null; setBossActive(false); finalBossDefeatedRef.current = true;
                  const bossCoins = Math.floor(rand(5, 9));
                  spawnFloatingCoins(z.x, z.y, bossCoins);
                  scoreRef.current += 5000 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(50), bloodColor, 8);
                  addFloatText(`+${bossCoins} MONEDAS`, w / 2, h / 3, '#fbbf24', 18);
                  addFloatText('¡JEFE ELIMINADO!', z.x, z.y - 40, '#dc2626', 16);
                  screenShakeRef.current.trigger(10, 25);
                  hapticPattern([50, 30, 100]);
                  finalBossThresholdRef.current += 3000;
                } else if (z.type === 'tank') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 500 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  const tankCoins = Math.floor(rand(2, 4));
                  spawnFloatingCoins(z.x, z.y, tankCoins);
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(25), bloodColor, 6);
                  addFloatText('¡TANQUE!', z.x, z.y - 30, '#7c3aed', 14);
                  screenShakeRef.current.trigger(5, 15);
                  hapticFeedback(30);
                } else if (z.type === 'fast') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 150 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  if (Math.random() < 0.18) spawnFloatingCoins(z.x, z.y, 1);
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(12), bloodColor, 5);
                } else {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 100 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  if (Math.random() < (0.15 + Math.random() * 0.05)) spawnFloatingCoins(z.x, z.y, 1);
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(10), bloodColor, 4);
                }

                if (killStreakRef.current === 15 && !overdriveRef.current) {
                  overdriveRef.current = true; setOverdriveActive(true); overdriveTimerRef.current = 600;
                  addFloatText('¡FRENESÍ!', w / 2, h * 0.35, '#fbbf24', 22);
                  screenShakeRef.current.trigger(6, 20);
                  hapticPattern([50, 30, 50, 30, 100]);
                }

                if (comboRef.current >= 3 && comboRef.current % 3 === 0) {
                  addFloatText(`COMBO x${comboRef.current}!`, z.x, z.y - 30, '#22d3ee', 16);
                }
                if (bloodEnabledRef.current) {
                  bloodSplatsRef.current.push({ x: z.x, y: z.y, size: z.size * 0.8, alpha: 0.5 });
                }
              }
              break;
            }
          }
          if (!hit) for (const br of barrelPoolRef.current.getActive()) {
            if (dist(b.x, b.y, br.x, br.y) < 22) {
              br.hp -= b.damage; hit = true;
              spawnParticles2D(particlesRef.current, b.x, b.y, 5, '#fbbf24', 3);
              if (br.hp <= 0) {
                barrelPoolRef.current.release(br);
                const r = Math.random();
                if (r < 0.5) {
                  spawnPowerUpDrop(br.x, br.y);
                  addFloatText('¡POWER-UP!', br.x, br.y - 20, '#22d3ee', 16);
                } else {
                  const barrelCoins = Math.floor(rand(2, 4));
                  spawnFloatingCoins(br.x, br.y, barrelCoins);
                  addFloatText(`+${barrelCoins} MONEDAS`, br.x, br.y - 20, '#fbbf24', 16);
                }
                playPickup();
                spawnParticles2D(particlesRef.current, br.x, br.y, 15, '#fbbf24', 5);
                screenShakeRef.current.trigger(4, 12);
                hapticFeedback(40);
              }
              break;
            }
          }
          if (hit) bulletPoolRef.current.release(b);
        }

        for (const c of coinPoolRef.current.getActive()) {
          if (coinMagnetRef.current) {
            const tx = turretXRef.current;
            const ty = turretY;
            const dx = tx - c.x;
            const dy = ty - c.y;
            const d = Math.hypot(dx, dy);
            if (d > 5) { c.vx += (dx / d) * 0.5 * dt; c.vy += (dy / d) * 0.5 * dt; }
          } else {
            c.vy += 0.15 * dt;
          }
          c.x += c.vx * dt; c.y += c.vy * dt; c.life -= dt;
          if (c.life <= 0 || c.y > h + 20) { coinPoolRef.current.release(c); continue; }
          if (dist(c.x, c.y, turretXRef.current, turretY) < 30) {
            coinPoolRef.current.release(c);
            safeAddCoins(1); playCoin();
            hapticFeedback(15);
          }
        }

        nuclearChargeRef.current += dt * 0.25;
        if (nuclearChargeRef.current >= 100 && !nuclearReady) setNuclearReady(true);
        if (nuclearActiveRef.current) {
          nuclearTimerRef.current -= dt;
          if (nuclearTimerRef.current <= 0) nuclearActiveRef.current = false;
        }

        playTimeRef.current += dt * 16.67;
        if (playTimeRef.current - lastPlayTimeSyncRef.current >= 5000) {
          if (isOnline) addPlayTime(playTimeRef.current - lastPlayTimeSyncRef.current);
          lastPlayTimeSyncRef.current = playTimeRef.current;
        }
      }

      const splats = bloodSplatsRef.current;
      for (let i = splats.length - 1; i >= 0; i--) {
        const bs = splats[i];
        ctx.save();
        ctx.globalAlpha = bs.alpha;
        ctx.fillStyle = '#65a30d';
        ctx.beginPath(); ctx.arc(bs.x, bs.y, bs.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        bs.alpha -= dt * 0.01;
        if (bs.alpha <= 0) splats.splice(i, 1);
      }

      for (const z of zombiePoolRef.current.getActive()) {
        ctx.save();
        ctx.translate(z.x, z.y);
        const bobY = Math.sin(z.walkCycle) * 3;
        ctx.shadowColor = z.color;
        ctx.shadowBlur = 8;
        ctx.fillStyle = z.color;
        ctx.beginPath(); ctx.arc(0, bobY, z.size, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#1a2a0a';
        ctx.fillRect(-z.size * 0.35, bobY - z.size * 0.25, z.size * 0.2, z.size * 0.15);
        ctx.fillRect(z.size * 0.15, bobY - z.size * 0.25, z.size * 0.2, z.size * 0.15);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(-z.size * 0.25, bobY - z.size * 0.15, z.size * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(z.size * 0.25, bobY - z.size * 0.15, z.size * 0.06, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3a5a1a';
        ctx.lineWidth = Math.max(1.5, z.size * 0.1);
        ctx.beginPath();
        ctx.moveTo(-z.size * 0.5, bobY + z.size * 0.3);
        ctx.lineTo(-z.size * 0.3, bobY + z.size * 0.7);
        ctx.moveTo(z.size * 0.5, bobY + z.size * 0.3);
        ctx.lineTo(z.size * 0.3, bobY + z.size * 0.7);
        ctx.stroke();
        if (z.type === 'tank' || z.type === 'boss') {
          ctx.fillStyle = '#4a3a1a';
          ctx.fillRect(-z.size * 0.6, bobY - z.size * 0.8, z.size * 1.2, z.size * 0.3);
          ctx.strokeStyle = '#6a5a2a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-z.size * 0.6, bobY - z.size * 0.8, z.size * 1.2, z.size * 0.3);
        }
        if (z.hitFlash > 0) {
          ctx.globalAlpha = z.hitFlash * 0.6;
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(0, bobY, z.size + 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        if (z.hp < z.maxHp) {
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(z.x - z.size, z.y - z.size - 10, z.size * 2, 4);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(z.x - z.size, z.y - z.size - 10, z.size * 2 * (z.hp / z.maxHp), 4);
        }
      }

      for (const br of barrelPoolRef.current.getActive()) {
        ctx.save();
        ctx.translate(br.x, br.y);
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-18, -20, 36, 40);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(-18, -20, 36, 5);
        ctx.fillRect(-18, 15, 36, 5);
        ctx.fillStyle = '#654321';
        ctx.fillRect(-16, -10, 32, 2);
        ctx.fillRect(-16, 5, 32, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${br.id}`, 0, 2);
        ctx.restore();
      }

      for (const pu of powerUpPoolRef.current.getActive()) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        const pulse = 1 + Math.sin(now * 0.01) * 0.15;
        ctx.scale(pulse, pulse);
        const colors: Record<PowerUpType, string> = { shield: '#22d3ee', doubleShot: '#fbbf24', coinMagnet: '#f97316', weapon: '#a855f7', coins: '#fbbf24', points: '#34d399' };
        const c = colors[pu.type];
        ctx.shadowColor = c;
        ctx.shadowBlur = 15;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const labels: Record<PowerUpType, string> = { shield: 'S', doubleShot: 'D', coinMagnet: 'M', weapon: 'W', coins: '$', points: 'P' };
        ctx.fillText(labels[pu.type], 0, 0);
        ctx.restore();
      }

      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(0, barricadeY, w, 10);
      ctx.fillStyle = '#2a1a0a';
      for (let i = 0; i < w; i += 14) { ctx.fillRect(i, barricadeY, 7, 10); }
      ctx.strokeStyle = '#5a4a2a';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < w; i += 35) {
        ctx.beginPath();
        ctx.moveTo(i, barricadeY - 6);
        for (let j = 0; j < 35; j += 6) { ctx.lineTo(i + j, barricadeY - 6 + (j % 12 === 0 ? -5 : 0)); }
        ctx.stroke();
      }

      const tx = turretXRef.current;
      ctx.save();
      ctx.translate(tx, turretY);
      ctx.shadowColor = overdriveRef.current ? '#ff6b00' : '#fbbf24';
      ctx.shadowBlur = overdriveRef.current ? 20 : 10;
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(-34, -14, 68, 27);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-28, -10, 56, 20);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(-11, -34, 22, 27);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(-8, -38, 16, 8);
      if (shootCooldownRef.current < 2) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.fillRect(-3, -42, 6, 10);
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GARRDASH', 0, 6);
      ctx.restore();

      if (shieldRef.current) {
        drawNeonCircle(ctx, tx, turretY - 15, 40, '#22d3ee', 20);
      }

      for (const c of coinPoolRef.current.getActive()) {
        ctx.save();
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.beginPath(); ctx.arc(c.x - 2, c.y - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      for (const b of bulletPoolRef.current.getActive()) {
        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y + 16);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(b.x, b.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      updateMuzzleFlashes(muzzleFlashesRef.current, dt);
      drawMuzzleFlashes(ctx, muzzleFlashesRef.current);

      updateParticles2D(particlesRef.current, dt);
      drawParticles2D(ctx, particlesRef.current);

      if (whiteFlashRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = whiteFlashRef.current;
        ctx.fillStyle = '#fff';
        ctx.fillRect(-20, -20, w + 40, h + 40);
        ctx.restore();
        whiteFlashRef.current = Math.max(0, whiteFlashRef.current - dt * 0.05);
      }

      if (nuclearActiveRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.1 + Math.sin(now * 0.02) * 0.05;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-20, -20, w + 40, h + 40);
        ctx.restore();
      }

      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shoot, spawnZombie, spawnBoss, spawnBarrel, addPlayTime, isOnline, safeAddCoins, vip, checkKillStreakMilestone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => { initAudio(); if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, active: true }; } };
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, active: true }; } };
    const onTouchEnd = () => { touchTargetRef.current.active = false; };
    const onMouseDown = (e: MouseEvent) => { initAudio(); const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }; };
    const onMouseMove = (e: MouseEvent) => { if (touchTargetRef.current.active) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }; } };
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
    <div className="absolute inset-0 bg-black flex flex-col">
      <OfflineBanner />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <button onClick={() => setScreen('menu')} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            {Array.from({ length: 3 }).map((_, i) => <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-white/20'}`} />)}
          </div>
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-sm font-bold transition-colors" style={{ color: scoreColor }}>{score} pts</div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5"><Coins className="w-4 h-4 text-amber-400" /><span className="text-amber-400 text-sm font-bold">{coinsEarned}/{coinCapRef.current}</span></div>
        </div>
      </div>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-56">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/60">BARRICADA</span>
          <div className="flex-1 h-3 rounded-full bg-black/50 border border-white/10 overflow-hidden">
            <div className="h-full transition-all duration-200" style={{ width: `${(barricadeHp / barricadeMaxHpRef.current) * 100}%`, background: barricadeHp > 50 ? '#22c55e' : barricadeHp > 25 ? '#eab308' : '#ef4444' }} />
          </div>
        </div>
      </div>
      {bossActive && bossMaxHp > 0 && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 w-72">
          <p className="text-center text-red-400 text-xs font-bold mb-1 animate-pulse">{bossName}</p>
          <div className="h-4 rounded-full bg-black/60 border-2 border-red-500/50 overflow-hidden shadow-lg shadow-red-500/30">
            <div className="h-full transition-all duration-200" style={{ width: `${(bossHp / bossMaxHp) * 100}%`, background: 'linear-gradient(90deg, #dc2626, #ef4444)' }} />
          </div>
        </div>
      )}
      <div className="absolute top-24 right-4 z-10 flex flex-col gap-2">
        {shieldActive && <div className="w-12 h-12 rounded-xl bg-cyan-500/20 backdrop-blur border border-cyan-400/50 flex items-center justify-center text-cyan-400 animate-pulse"><Shield className="w-5 h-5" /></div>}
        {doubleShotActive && <div className="w-12 h-12 rounded-xl bg-amber-500/20 backdrop-blur border border-amber-400/50 flex items-center justify-center text-amber-400 animate-pulse"><Zap className="w-5 h-5" /></div>}
        {coinMagnetActive && <div className="w-12 h-12 rounded-xl bg-orange-500/20 backdrop-blur border border-orange-400/50 flex items-center justify-center text-orange-400 animate-pulse"><Magnet className="w-5 h-5" /></div>}
        {scoreBoostActive && <div className="w-12 h-12 rounded-xl bg-blue-500/20 backdrop-blur border border-blue-400/50 flex items-center justify-center text-blue-400 animate-pulse"><span className="text-xs font-black">2x</span></div>}
        {overdriveActive && <div className="w-12 h-12 rounded-xl bg-red-500/20 backdrop-blur border border-red-400/50 flex items-center justify-center text-red-400 animate-pulse"><Sparkles className="w-5 h-5" /></div>}
      </div>
      {killStreak > 0 && !gameOver && (
        <div className="absolute top-32 left-4 z-20 pointer-events-none">
          <span className="text-white/60 font-bold text-xs">RACHA: {killStreak}</span>
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
      {!gameOver && (
        <button
          onClick={activateNuclear}
          disabled={!nuclearReady}
          className={`absolute bottom-24 right-6 z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all ${nuclearReady ? 'bg-amber-500/30 border-2 border-amber-400 animate-pulse shadow-lg shadow-amber-500/30' : 'bg-black/50 border border-white/10 opacity-40'}`}
        >
          <Radiation className={`w-7 h-7 ${nuclearReady ? 'text-amber-400' : 'text-white/30'}`} />
        </button>
      )}
      {!gameOver && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/50 text-white/50 border border-white/10">DESPLAZA PARA APUNTAR · AUTO-DISPARO</span>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-card/90 border border-red-500/30 p-6 text-center animate-scale-in shadow-2xl shadow-red-500/20">
            <h2 className="text-red-400 font-bold text-2xl mb-2" style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>Game Over</h2>
            <p className="text-white/60 text-sm mb-1">Zombies eliminados: {zombiesKilled}</p>
            <p className="text-white/60 text-sm mb-1">Puntuacion: {score}</p>
            <p className="text-amber-400 text-sm mb-6">Monedas ganadas: {coinsEarned}</p>
            {!hasRevived && isOnline && (
              <button onClick={() => setShowReviveReward(true)} className="w-full py-3 rounded-xl bg-green-500 text-white font-bold mb-2 hover:bg-green-400 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                <Video className="w-4 h-4" /> Revivir (Ver anuncio)
              </button>
            )}
            <button onClick={() => initGame()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold mb-2 hover:bg-primary/90 shadow-lg shadow-primary/20">Reiniciar</button>
            <button onClick={() => setScreen('menu')} className="w-full py-3 rounded-xl bg-card border border-border text-white font-bold hover:bg-secondary">Salir</button>
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
      <RewardAdModal
        open={showReviveReward}
        onClose={() => setShowReviveReward(false)}
        onReward={() => {
          livesRef.current = 3; setLives(3);
          barricadeHpRef.current = barricadeMaxHpRef.current; setBarricadeHp(barricadeMaxHpRef.current);
          gameOverRef.current = false; setGameOver(false);
          hasRevivedRef.current = true; setHasRevived(true);
          safeAddCoins(3);
          const { w, h } = canvasSizeRef.current;
          for (const z of zombiePoolRef.current.getActive()) zombiePoolRef.current.release(z);
          addFloatText('¡REVIVIDO!', w / 2, h / 2, '#34d399', 20);
          hapticPattern([50, 30, 100]);
        }}
        title="Revivir"
        rewardText="¡Has revivido! Barricada reparada, vidas restauradas y 3 monedas extra."
      />
      <MuteButton />
    </div>
  );
}
