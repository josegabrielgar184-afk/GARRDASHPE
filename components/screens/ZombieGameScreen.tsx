'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { InterstitialAd } from '@/components/game/InterstitialAd';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Video, Radiation, Shield, Baby, Sparkles, Magnet, Zap, Pause, Play, RotateCcw, Home } from 'lucide-react';
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
import { getCampaignCoinReward } from '@/lib/config';
import { playShoot, playExplosion, playBossAlert, playCoin, playHit, playPickup, playBarrelHit, playWeaponEquip, initAudio } from '@/lib/audio';

type ZombieType = 'normal' | 'fast' | 'tank' | 'boss';
type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'minigun' | 'laser';
type PowerUpType = 'shield' | 'doubleShot' | 'coinMagnet';

interface Zombie { x: number; y: number; vy: number; vx: number; walkCycle: number; hp: number; maxHp: number; size: number; color: string; type: ZombieType; hitFlash: number; active: boolean; reset(): void; }
interface Bullet { x: number; y: number; vx: number; vy: number; life: number; damage: number; color: string; active: boolean; reset(): void; }
interface Barrel { x: number; y: number; vy: number; hp: number; maxHp: number; weapon: WeaponType; active: boolean; reset(): void; }
interface FloatingCoin { x: number; y: number; vx: number; vy: number; life: number; active: boolean; reset(): void; }
interface PowerUpDrop { x: number; y: number; vy: number; type: PowerUpType; active: boolean; reset(): void; }
interface BloodSplat { x: number; y: number; size: number; alpha: number; }

function makeZombie(): Zombie { return { x: 0, y: 0, vy: 0, vx: 0, walkCycle: 0, hp: 100, maxHp: 100, size: 22, color: '#65a30d', type: 'normal', hitFlash: 0, active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.vx = 0; this.walkCycle = 0; this.hp = 100; this.maxHp = 100; this.size = 22; this.color = '#65a30d'; this.type = 'normal'; this.hitFlash = 0; } }; }
function makeBullet(): Bullet { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, damage: 0, color: '', active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; this.damage = 0; this.color = ''; } }; }
const WEAPONS: WeaponType[] = ['rifle', 'shotgun', 'minigun', 'laser'];
function makeBarrel(): Barrel { return { x: 0, y: 0, vy: 0, hp: 44, maxHp: 44, weapon: 'rifle', active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.hp = 44; this.maxHp = 44; this.weapon = 'rifle'; } }; }
function makeFloatingCoin(): FloatingCoin { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; } }; }
function makePowerUpDrop(): PowerUpDrop { return { x: 0, y: 0, vy: 0, type: 'shield', active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.type = 'shield'; } }; }

const LANE_COUNT = 5;
const BARRICADE_Y_RATIO = 0.82;
const TURRET_Y_RATIO = 0.88;
const SPRITE_SCALE = 1.35;

const WEAPON_COLORS: Record<WeaponType, string> = {
  pistol: '#fbbf24', rifle: '#22d3ee', shotgun: '#f87171', minigun: '#f97316', laser: '#a855f7',
};
const WEAPON_FIRE_RATES: Record<WeaponType, number> = {
  pistol: 14, rifle: 8, shotgun: 20, minigun: 4, laser: 6,
};
const WEAPON_DAMAGES: Record<WeaponType, number> = {
  pistol: 40, rifle: 30, shotgun: 60, minigun: 20, laser: 50,
};
const MAX_ACTIVE_ZOMBIES_BASE = 5;
const MAX_ACTIVE_ZOMBIES_PER_LEVEL = 0.5;

const COLOR_THEMES = [
  { name: 'Verde Ácido', road: '#2a2a22', fog: 'rgba(100,200,50,0.12)', border: '#84cc16', dash: 'rgba(255,255,255,0.6)' },
  { name: 'Rosa Cyberpunk', road: '#2a1a2a', fog: 'rgba(255,100,200,0.12)', border: '#ec4899', dash: 'rgba(255,200,255,0.6)' },
  { name: 'Azul Neón', road: '#1a1a2a', fog: 'rgba(50,150,255,0.12)', border: '#3b82f6', dash: 'rgba(200,230,255,0.6)' },
  { name: 'Morado Oscuro', road: '#1a0a1a', fog: 'rgba(150,50,255,0.12)', border: '#7c3aed', dash: 'rgba(220,200,255,0.6)' },
];

const MILESTONES: Record<number, { title: string; coins?: number; shield?: boolean; scoreBoost?: boolean; color: string }> = {
  4: { title: '¡4 AÑOS DE AMOR ETERNO!', coins: 400, color: '#ec4899' },
  10: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true, color: '#60a5fa' },
  30: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true, color: '#60a5fa' },
};

function randomCoinCap(): number { return Math.floor(rand(70, 91)); }

export function ZombieGameScreen() {
  const { setScreen, addCoins, getZombieCharacter, lives, setLives, upgrades, submitZombieScore, isOnline, bloodEnabled, canShowInterstitial, recordInterstitial, vip, addPlayTime, startGameBatch, endGameBatch, campaignProgress, completeLevel, getCurrentCampaignLevel} = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [barricadeHp, setBarricadeHp] = useState(150);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showReviveReward, setShowReviveReward] = useState(false);
  const [floatTexts, setFloatTexts] = useState<Array<{ id: number; text: string; x: number; y: number; color: string; size?: number }>>([]);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossName, setBossName] = useState('');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const pendingExitRef = useRef(false);
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
  const [currentWeapon, setCurrentWeapon] = useState<WeaponType>('pistol');
  const [weaponTimer, setWeaponTimer] = useState(0);
  const [themeName, setThemeName] = useState(COLOR_THEMES[0].name);
  const [campaignLevel, setCampaignLevel] = useState(1);
  const [reviveShieldTimer, setReviveShieldTimer] = useState(0);

  const zombiePoolRef = useRef<ObjectPool<Zombie>>(new ObjectPool(makeZombie, 30));
  const bulletPoolRef = useRef<ObjectPool<Bullet>>(new ObjectPool(makeBullet, 80));
  const barrelPoolRef = useRef<ObjectPool<Barrel>>(new ObjectPool(makeBarrel, 8));
  const coinPoolRef = useRef<ObjectPool<FloatingCoin>>(new ObjectPool(makeFloatingCoin, 30));
  const powerUpPoolRef = useRef<ObjectPool<PowerUpDrop>>(new ObjectPool(makePowerUpDrop, 8));
  const bloodSplatsRef = useRef<BloodSplat[]>([]);
  const bossRef = useRef<Zombie | null>(null);
  const particlesRef = useRef<Particle2D[]>([]);
  const muzzleFlashesRef = useRef<MuzzleFlash[]>([]);
  const screenShakeRef = useRef(new ScreenShake());
  const touchTargetRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });
  const turretXRef = useRef(0);
  const scoreRef = useRef(0);
  const killCountRef = useRef(0);
  const livesRef = useRef(3);
  const barricadeHpRef = useRef(150);
  const barricadeMaxHpRef = useRef(150);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
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
  const overdriveRef = useRef(false);
  const overdriveTimerRef = useRef(0);
  const killStreakRef = useRef(0);
  const doubleShotRef = useRef(false);
  const doubleShotTimerRef = useRef(0);
  const coinMagnetRef = useRef(false);
  const coinMagnetTimerRef = useRef(0);
  const weaponRef = useRef<WeaponType>('pistol');
  const weaponTimerRef = useRef(0);
  const themeIndexRef = useRef(0);
  const themeTimerRef = useRef(0);
  const reviveShieldTimerRef = useRef(0);
  const campaignLevelRef = useRef(1);

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
    const base = WEAPON_FIRE_RATES[weaponRef.current] ?? 14;
    let rate = Math.max(3, base - fireRateLevelRef.current);
    if (overdriveRef.current) rate *= 0.5;
    return rate;
  };
  const getDamage = () => {
    const base = (WEAPON_DAMAGES[weaponRef.current] ?? 30) + damageLevelRef.current * 12;
    return base * damageMultRef.current * (nuclearActiveRef.current ? 2.5 : 1);
  };
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
    barricadeHpRef.current = 150; barricadeMaxHpRef.current = 150;
    gameOverRef.current = false;
    spawnTimerRef.current = 0; barrelTimerRef.current = 0;
    difficultyRef.current = Math.max(0.3, 0.3 + (campaignLevelRef.current - 1) * 0.05); miniBossThresholdRef.current = 500; finalBossThresholdRef.current = 1500;
    finalBossDefeatedRef.current = false; scrollYRef.current = 0;
    whiteFlashRef.current = 0; gameCoinsRef.current = 0; interstitialCheckedRef.current = false;
    coinCapRef.current = randomCoinCap();
    nuclearChargeRef.current = 0; nuclearActiveRef.current = false; nuclearTimerRef.current = 0;
    hasRevivedRef.current = false; setHasRevived(false);
    comboRef.current = 0; comboTimerRef.current = 0; setComboDisplay(0);
    playTimeRef.current = 0; lastPlayTimeSyncRef.current = 0;
    overdriveRef.current = false; setOverdriveActive(false); overdriveTimerRef.current = 0;
    killStreakRef.current = 0; setKillStreak(0);
    doubleShotRef.current = false; setDoubleShotActive(false); doubleShotTimerRef.current = 0;
    coinMagnetRef.current = false; setCoinMagnetActive(false); coinMagnetTimerRef.current = 0;
    weaponRef.current = 'pistol'; setCurrentWeapon('pistol'); weaponTimerRef.current = 0; setWeaponTimer(0);
    themeIndexRef.current = 0; themeTimerRef.current = 0; setThemeName(COLOR_THEMES[0].name);
    const cl = getCurrentCampaignLevel();
    campaignLevelRef.current = cl; setCampaignLevel(cl);
    reviveShieldTimerRef.current = 0; setReviveShieldTimer(0);
    setScore(0); setZombiesKilled(0); setCoinsEarned(0); setBarricadeHp(150); setGameOver(false); setBossActive(false);
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

  const shoot = useCallback(() => {
    if (gameOverRef.current || shootCooldownRef.current > 0) return;
    initAudio();
    const { w, h } = canvasSizeRef.current;
    const turretY = h * TURRET_Y_RATIO;
    const tx = turretXRef.current;
    const speed = 12;
    const dmg = getDamage();
    const color = WEAPON_COLORS[weaponRef.current] ?? '#fbbf24';

    const fire = (ox: number, vxMod: number) => {
      const b = bulletPoolRef.current.acquire();
      b.x = tx + ox; b.y = turretY - 30;
      b.vx = vxMod; b.vy = -speed;
      b.life = 80; b.damage = dmg; b.color = color;
    };
const weapon = weaponRef.current;

// Si aún está en enfriamiento, salimos para que no dispare como loco
if (shootCooldownRef.current > 0) {
  shootCooldownRef.current -= 1;
  return;
}

if (weapon === 'shotgun' || doubleShotRef.current) {
  fire(-12, -1.5); fire(0, 0); fire(12, 1.5);
  shootCooldownRef.current = 15; // Velocidad controlada
} else if (weapon === 'minigun') {
  fire(rand(-4, 4), rand(-1, 1));
  fire(0, 0);
  shootCooldownRef.current = 8;  // Más rápido por ser minigun
} else {
  fire(0, 0);
  shootCooldownRef.current = 20; // Velocidad normal
}
  fire(0, 0);
  shootCooldownRef.current = 10; // Dispara más rápido
} else {
  fire(0, 0);
  shootCooldownRef.current = 30; // Velocidad normal de pistola
}
  fire(0, 0);
  shootCooldownRef.current = 8;  // Más rápido por ser minigun
} else {
  fire(0, 0);
  shootCooldownRef.current = 20; // Velocidad normal
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

    const levelScale = Math.max(0.5, Math.min(1, 0.5 + (campaignLevelRef.current - 1) * 0.05));
    let zHp: number, size: number, color: string, vy: number;
    if (type === 'fast') { zHp = Math.floor(20 * levelScale); size = 14 * SPRITE_SCALE; color = '#84cc16'; vy = (0.7 + difficultyRef.current * 0.15) * levelScale; }
    else if (type === 'tank') { zHp = Math.floor(100 * levelScale); size = 26 * SPRITE_SCALE; color = '#4d7c0f'; vy = (0.3 + difficultyRef.current * 0.08) * levelScale; }
    else { zHp = Math.floor(30 * levelScale); size = 18 * SPRITE_SCALE; color = '#65a30d'; vy = (0.45 + difficultyRef.current * 0.1) * levelScale; }

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
    boss.hp = zHp; boss.maxHp = zHp; boss.size = 42 * SPRITE_SCALE; boss.color = '#65a30d'; boss.type = 'boss'; boss.hitFlash = 0;
    bossRef.current = boss;
    setBossActive(true); setBossHp(zHp); setBossMaxHp(zHp); setBossName('JEFE DE FÚTBOL GIGANTE');
    playBossAlert();
    addFloatText('¡JEFE DE FÚTBOL GIGANTE!', w / 2, canvasSizeRef.current.h / 3, '#dc2626', 18);
    screenShakeRef.current.trigger(6, 20);
    hapticFeedback(50);
  }, []);

  const spawnBarrel = useCallback(() => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const b = barrelPoolRef.current.acquire();
    b.x = getLaneX(lane); b.y = -20; b.vy = 0.8 + Math.random() * 0.4;
    const hpVal = Math.floor(rand(40, 70));
    b.hp = hpVal; b.maxHp = hpVal;
    b.weapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
  }, []);

  const spawnPowerUpDrop = (x: number, y: number) => {
    const types: PowerUpType[] = ['shield', 'doubleShot', 'coinMagnet'];
    const type = types[Math.floor(Math.random() * types.length)];
    const pu = powerUpPoolRef.current.acquire();
    pu.x = x; pu.y = y; pu.vy = 1.5; pu.type = type;
  };

  const equipWeapon = (weapon: WeaponType) => {
    weaponRef.current = weapon;
    setCurrentWeapon(weapon);
    weaponTimerRef.current = 600;
    setWeaponTimer(10);
    playWeaponEquip();
    hapticFeedback(50);
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
    const clearedCount = zombiePoolRef.current.getActive().length;
    for (const z of zombiePoolRef.current.getActive()) {
      spawnParticles2D(particlesRef.current, z.x, z.y, 12, '#fbbf24', 6);
      zombiePoolRef.current.release(z);
      scoreRef.current += 50 * getScoreMult();
      killCountRef.current++;
    }
    setScore(Math.floor(scoreRef.current)); setZombiesKilled(killCountRef.current);
    // Instant respawn - no empty screen after bomb
    for (let i = 0; i < Math.min(clearedCount, 6); i++) {
      setTimeout(() => spawnZombie(), i * 50);
    }
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

  // Cartoon zombie drawing
  const drawCartoonZombie = (ctx: CanvasRenderingContext2D, z: Zombie, now: number) => {
    ctx.save();
    ctx.translate(z.x, z.y);
    const wobble = Math.sin(z.walkCycle) * 4;
    const armSwing = Math.sin(z.walkCycle + Math.PI / 2) * 6;
    const s = z.size;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, s * 0.8, s * 0.7, s * 0.2, 0, 0, Math.PI * 2); ctx.fill();

    // Body (torn clothes)
    ctx.fillStyle = z.type === 'tank' ? '#3b5a1a' : z.type === 'fast' ? '#65a30d' : '#4d7c0f';
    ctx.beginPath();
    ctx.roundRect(-s * 0.5, wobble - s * 0.1, s, s * 0.7, 4);
    ctx.fill();
    // Torn shirt details
    ctx.fillStyle = '#3a5a1a';
    ctx.beginPath();
    ctx.moveTo(-s * 0.5, wobble + s * 0.1);
    ctx.lineTo(-s * 0.3, wobble + s * 0.2);
    ctx.lineTo(-s * 0.4, wobble + s * 0.3);
    ctx.lineTo(-s * 0.5, wobble + s * 0.25);
    ctx.fill();

    // Head (green cartoon)
    ctx.fillStyle = z.color;
    ctx.beginPath(); ctx.arc(0, wobble - s * 0.35, s * 0.4, 0, Math.PI * 2); ctx.fill();
    // Cheek shading
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath(); ctx.arc(-s * 0.15, wobble - s * 0.3, s * 0.12, 0, Math.PI * 2); ctx.fill();

    // Eyes (white sclera, red pupils)
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-s * 0.15, wobble - s * 0.4, s * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.15, wobble - s * 0.4, s * 0.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.arc(-s * 0.13, wobble - s * 0.38, s * 0.05, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.17, wobble - s * 0.38, s * 0.05, 0, Math.PI * 2); ctx.fill();

    // Mouth (zigzag teeth)
    ctx.strokeStyle = '#1a2a0a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, wobble - s * 0.2);
    for (let i = 0; i < 5; i++) {
      ctx.lineTo(-s * 0.2 + (i + 0.5) * s * 0.1, wobble - s * 0.2 + (i % 2 === 0 ? -3 : 0));
    }
    ctx.stroke();

    // Arms (swinging)
    ctx.strokeStyle = z.color;
    ctx.lineWidth = Math.max(2, s * 0.12);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, wobble + s * 0.1);
    ctx.lineTo(-s * 0.6, wobble + s * 0.3 + armSwing);
    ctx.moveTo(s * 0.4, wobble + s * 0.1);
    ctx.lineTo(s * 0.6, wobble + s * 0.3 - armSwing);
    ctx.stroke();

    // Legs
    ctx.strokeStyle = '#3b5a1a';
    ctx.lineWidth = Math.max(2, s * 0.1);
    ctx.beginPath();
    ctx.moveTo(-s * 0.25, wobble + s * 0.55);
    ctx.lineTo(-s * 0.25 + Math.sin(z.walkCycle) * 4, wobble + s * 0.85);
    ctx.moveTo(s * 0.25, wobble + s * 0.55);
    ctx.lineTo(s * 0.25 - Math.sin(z.walkCycle) * 4, wobble + s * 0.85);
    ctx.stroke();

    if (z.type === 'tank') {
      // Tank: bigger, armor plates
      ctx.fillStyle = '#5a4a1a';
      ctx.fillRect(-s * 0.55, wobble - s * 0.05, s * 1.1, s * 0.15);
      ctx.strokeStyle = '#7a6a2a';
      ctx.lineWidth = 1;
      ctx.strokeRect(-s * 0.55, wobble - s * 0.05, s * 1.1, s * 0.15);
    }

    if (z.type === 'boss') {
      // Football helmet (red)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, wobble - s * 0.35, s * 0.48, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-s * 0.48, wobble - s * 0.35, s * 0.96, s * 0.15);
      // Helmet stripe
      ctx.fillStyle = '#fff';
      ctx.fillRect(-s * 0.06, wobble - s * 0.7, s * 0.12, s * 0.4);
      // Facemask
      ctx.strokeStyle = '#7f1d1d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-s * 0.3, wobble - s * 0.25);
      ctx.lineTo(s * 0.3, wobble - s * 0.25);
      ctx.moveTo(-s * 0.25, wobble - s * 0.25);
      ctx.lineTo(-s * 0.25, wobble - s * 0.1);
      ctx.moveTo(0, wobble - s * 0.25);
      ctx.lineTo(0, wobble - s * 0.1);
      ctx.moveTo(s * 0.25, wobble - s * 0.25);
      ctx.lineTo(s * 0.25, wobble - s * 0.1);
      ctx.stroke();
      // Shoulder pads (red)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(-s * 0.65, wobble - s * 0.05, s * 0.3, s * 0.2, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(s * 0.35, wobble - s * 0.05, s * 0.3, s * 0.2, 3);
      ctx.fill();
      // Football
      ctx.fillStyle = '#7B4a1a';
      ctx.beginPath();
      ctx.ellipse(s * 0.7, wobble + s * 0.3 + armSwing, s * 0.15, s * 0.1, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(s * 0.65, wobble + s * 0.28 + armSwing);
      ctx.lineTo(s * 0.75, wobble + s * 0.32 + armSwing);
      ctx.stroke();
    }

    // Hit flash
    if (z.hitFlash > 0) {
      ctx.globalAlpha = z.hitFlash * 0.6;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(0, wobble, s + 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();

    // HP bar
    if (z.hp < z.maxHp) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(z.x - s, z.y - s - 10, s * 2, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(z.x - s, z.y - s - 10, s * 2 * (z.hp / z.maxHp), 4);
    }
  };

  // Cartoon barrel drawing with counter
  const drawBarrel = (ctx: CanvasRenderingContext2D, br: Barrel, now: number) => {
    ctx.save();
    ctx.translate(br.x, br.y);
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, 22, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
    // Wood barrel body
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.roundRect(-18, -20, 36, 40, 4);
    ctx.fill();
    // Metal bands
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(-18, -20, 36, 5);
    ctx.fillRect(-18, 15, 36, 5);
    // Wood planks
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, -15); ctx.lineTo(-10, 14);
    ctx.moveTo(0, -15); ctx.lineTo(0, 14);
    ctx.moveTo(10, -15); ctx.lineTo(10, 14);
    ctx.stroke();
    // Yellow badge with counter number
    const pulse = 1 + Math.sin(now * 0.008) * 0.08;
    ctx.save();
    ctx.scale(pulse, pulse);
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.ceil(br.hp)}`, 0, 1);
    ctx.restore();
    // Weapon icon floating above
    ctx.save();
    ctx.translate(0, -30);
    ctx.shadowColor = WEAPON_COLORS[br.weapon];
    ctx.shadowBlur = 8;
    ctx.fillStyle = WEAPON_COLORS[br.weapon];
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labels: Record<WeaponType, string> = { pistol: 'P', rifle: 'R', shotgun: 'S', minigun: 'M', laser: 'L' };
    ctx.fillText(labels[br.weapon], 0, 0);
    ctx.restore();
    ctx.restore();
  };

  // Cartoon survivor/turret drawing
  const drawSurvivor = (ctx: CanvasRenderingContext2D, x: number, y: number, now: number) => {
    ctx.save();
    ctx.translate(x, y);
    const s = 22 * SPRITE_SCALE;
    const breath = Math.sin(now * 0.003) * 1.5;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(0, s * 0.7, s * 0.6, s * 0.15, 0, 0, Math.PI * 2); ctx.fill();

    // Barricade base
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.roundRect(-s * 1.4, -2, s * 2.8, s * 0.8, 3); ctx.fill();
    ctx.fillStyle = '#2a1a0a';
    for (let i = -s * 1.3; i < s * 1.4; i += 8) { ctx.fillRect(i, -2, 4, s * 0.8); }
    ctx.strokeStyle = '#5a4a2a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-s * 1.4, -6);
    for (let i = -s * 1.3; i < s * 1.4; i += 10) { ctx.lineTo(i, -6 + (i % 20 === 0 ? -4 : 0)); }
    ctx.stroke();

    // Body
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.roundRect(-s * 0.4, breath - s * 0.1, s * 0.8, s * 0.6, 4);
    ctx.fill();

    // Head
    ctx.fillStyle = '#d4a574';
    ctx.beginPath(); ctx.arc(0, breath - s * 0.35, s * 0.3, 0, Math.PI * 2); ctx.fill();
    // Helmet
    ctx.fillStyle = char.color;
    ctx.beginPath();
    ctx.arc(0, breath - s * 0.38, s * 0.32, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(-s * 0.32, breath - s * 0.38, s * 0.64, s * 0.08);

    // Eyes (determined look)
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(-s * 0.1, breath - s * 0.3, s * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.1, breath - s * 0.3, s * 0.06, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath(); ctx.arc(-s * 0.1, breath - s * 0.3, s * 0.03, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(s * 0.1, breath - s * 0.3, s * 0.03, 0, Math.PI * 2); ctx.fill();

    // Arms holding gun up
    ctx.strokeStyle = '#d4a574';
    ctx.lineWidth = Math.max(2, s * 0.1);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.2, breath);
    ctx.lineTo(-s * 0.1, breath - s * 0.3);
    ctx.moveTo(s * 0.2, breath);
    ctx.lineTo(s * 0.1, breath - s * 0.3);
    ctx.stroke();

    // Gun barrel pointing up
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-s * 0.08, breath - s * 0.5, s * 0.16, s * 0.3);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-s * 0.06, breath - s * 0.55, s * 0.12, s * 0.1);
    // Muzzle glow when ready
    if (shootCooldownRef.current < 2) {
      ctx.shadowColor = WEAPON_COLORS[weaponRef.current] ?? '#fbbf24';
      ctx.shadowBlur = 15;
      ctx.fillStyle = WEAPON_COLORS[weaponRef.current] ?? '#fbbf24';
      ctx.fillRect(-s * 0.04, breath - s * 0.6, s * 0.08, s * 0.08);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

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
      const theme = COLOR_THEMES[themeIndexRef.current];

      screenShakeRef.current.update(dt);
      const shake = screenShakeRef.current.getOffset();

      scrollYRef.current += dt * (coinsCapped ? 3 : 1.5);

      // Theme cycling every 30s
      if (!gameOverRef.current && !pausedRef.current) {
        themeTimerRef.current += dt;
        if (themeTimerRef.current >= 1800) {
          themeTimerRef.current = 0;
          themeIndexRef.current = (themeIndexRef.current + 1) % COLOR_THEMES.length;
          setThemeName(COLOR_THEMES[themeIndexRef.current].name);
        }
      }

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

      // Urban road background
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1a1a1a');
      grad.addColorStop(0.3, theme.road);
      grad.addColorStop(0.7, theme.road);
      grad.addColorStop(1, '#0a0a0a');
      ctx.fillStyle = grad;
      ctx.fillRect(-20, -20, w + 40, h + 40);

      // Road perspective (converging lanes)
      ctx.strokeStyle = `${theme.border}22`;
      ctx.lineWidth = 1;
      for (let i = 0; i <= LANE_COUNT; i++) {
        const lx = (w / LANE_COUNT) * i;
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, barricadeY); ctx.stroke();
      }

      // Road edges (curbs)
      ctx.fillStyle = `${theme.border}44`;
      ctx.fillRect(0, 0, 3, barricadeY);
      ctx.fillRect(w - 3, 0, 3, barricadeY);

      // Dashed white center line
      ctx.fillStyle = theme.dash;
      for (let i = 0; i < h; i += 40) {
        const dashY = ((i + scrollYRef.current) % (h + 40)) - 20;
        if (dashY > 0 && dashY < barricadeY) {
          ctx.fillRect(w / 2 - 3, dashY, 6, 20);
        }
      }

      // Sewer grates
      for (let i = 0; i < 3; i++) {
        const grateY = ((i * 200 + scrollYRef.current * 0.8) % (h + 100)) - 50;
        if (grateY > 20 && grateY < barricadeY - 20) {
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath(); ctx.roundRect(w * 0.15, grateY, 30, 8, 2); ctx.fill();
          ctx.strokeStyle = '#3a3a3a';
          ctx.lineWidth = 1;
          for (let j = 0; j < 4; j++) {
            ctx.beginPath(); ctx.moveTo(w * 0.15 + 3 + j * 7, grateY + 1); ctx.lineTo(w * 0.15 + 3 + j * 7, grateY + 7); ctx.stroke();
          }
          ctx.beginPath(); ctx.roundRect(w * 0.8, grateY + 80, 30, 8, 2); ctx.fill();
          for (let j = 0; j < 4; j++) {
            ctx.beginPath(); ctx.moveTo(w * 0.8 + 3 + j * 7, grateY + 81); ctx.lineTo(w * 0.8 + 3 + j * 7, grateY + 87); ctx.stroke();
          }
        }
      }

      // Overhead cables
      ctx.strokeStyle = 'rgba(60,60,60,0.4)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, 20 + i * 15);
        ctx.quadraticCurveTo(w / 2, 25 + i * 15 + Math.sin(scrollYRef.current * 0.02 + i) * 3, w, 20 + i * 15);
        ctx.stroke();
      }

      // Fog overlay
      if (fpsMon.quality !== 'low') {
        const fogGrad = ctx.createLinearGradient(0, 0, 0, h * 0.4);
        fogGrad.addColorStop(0, theme.fog);
        fogGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, w, h * 0.4);
      }

      // Coins capped red flash
      if (coinsCapped) {
        ctx.fillStyle = `rgba(255,50,50,${0.04 + Math.sin(now * 0.01) * 0.02})`;
        ctx.fillRect(-20, -20, w + 40, h + 40);
      }

      if (!gameOverRef.current && !pausedRef.current) {

        // Touch-only horizontal movement (no auto-aim)
        if (touchTargetRef.current.active) {
          turretXRef.current = lerp(turretXRef.current, clamp(touchTargetRef.current.x, 30, w - 30), 0.25 * dt);
        }
        turretXRef.current = clamp(turretXRef.current, 30, w - 30);

        shoot();

        // Weapon timer countdown
        if (weaponRef.current !== 'pistol') {
          weaponTimerRef.current -= dt;
          setWeaponTimer(Math.ceil(weaponTimerRef.current / 60));
          if (weaponTimerRef.current <= 0) {
            weaponRef.current = 'pistol'; setCurrentWeapon('pistol');
          }
        }

        difficultyRef.current = 0.3 + scoreRef.current / 1000;
        if (coinsCapped) difficultyRef.current *= 1.3;

        // Simultaneous zombie + barrel spawning - no dead time (BLOCK 7)
        if (!bossRef.current) {
          spawnTimerRef.current += dt;
          const baseInterval = coinsCapped ? 25 : 40;
          const levelMultiplier = Math.max(1.5, 2.5 - (campaignLevelRef.current - 1) * 0.1);
          const interval = Math.max(12, baseInterval * levelMultiplier - difficultyRef.current * 2);
          const maxActive = Math.floor(MAX_ACTIVE_ZOMBIES_BASE + (campaignLevelRef.current - 1) * MAX_ACTIVE_ZOMBIES_PER_LEVEL);
          if (spawnTimerRef.current > interval && zombiePoolRef.current.getActive().length < maxActive) { spawnZombie(); spawnTimerRef.current = 0; }
          if (scoreRef.current >= miniBossThresholdRef.current) {
            for (let i = 0; i < 2; i++) {
              spawnZombie();
              const active = zombiePoolRef.current.getActive();
              const last = active[active.length - 1];
              if (last) { last.type = 'tank'; last.hp = 200; last.maxHp = 200; last.size = 26 * SPRITE_SCALE; last.color = '#4d7c0f'; last.vy *= 0.6; }
            }
            miniBossThresholdRef.current += 500;
            addFloatText('¡Mutantes!', w / 2, h / 3, '#a855f7', 16);
            screenShakeRef.current.trigger(4, 15);
          }
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current) spawnBoss();
          // Barrels spawn alongside zombies - always simultaneous
          barrelTimerRef.current += dt;
          if (barrelTimerRef.current > 200) { spawnBarrel(); barrelTimerRef.current = 0; }
        }

        if (reviveShieldTimerRef.current > 0) {
          reviveShieldTimerRef.current -= dt;
          setReviveShieldTimer(Math.ceil(reviveShieldTimerRef.current / 60));
          if (reviveShieldTimerRef.current <= 0) { addFloatText('¡Escudo agotado!', w / 2, h * 0.4, '#ef4444', 14); }
        }

        if (comboTimerRef.current > 0) {
          comboTimerRef.current -= dt;
          if (comboTimerRef.current <= 0) { comboRef.current = 0; setComboDisplay(0); }
        }

        if (shieldRef.current) { shieldTimerRef.current -= dt; if (shieldTimerRef.current <= 0) { shieldRef.current = false; setShieldActive(false); } }
        if (scoreBoostRef.current) { scoreBoostTimerRef.current -= dt; if (scoreBoostTimerRef.current <= 0) { scoreBoostRef.current = false; setScoreBoostActive(false); } }
        if (doubleShotRef.current) { doubleShotTimerRef.current -= dt; if (doubleShotTimerRef.current <= 0) { doubleShotRef.current = false; setDoubleShotActive(false); } }
        if (coinMagnetRef.current) { coinMagnetTimerRef.current -= dt; if (coinMagnetTimerRef.current <= 0) { coinMagnetRef.current = false; setCoinMagnetActive(false); } }
        if (overdriveRef.current) { overdriveTimerRef.current -= dt; if (overdriveTimerRef.current <= 0) { overdriveRef.current = false; setOverdriveActive(false); } }

        for (const z of zombiePoolRef.current.getActive()) {
          z.y += z.vy * dt;
          if (z.type === 'fast') z.x += z.vx * dt;
          if (z.x < 20 || z.x > w - 20) z.vx *= -1;
          z.walkCycle += dt * 0.3;
          if (z.hitFlash > 0) z.hitFlash = Math.max(0, z.hitFlash - dt * 0.1);

          if (z.y > barricadeY - z.size) {
            const dmg = z.type === 'tank' ? 25 : z.type === 'fast' ? 12 : z.type === 'boss' ? 30 : 15;
            if (shieldRef.current || reviveShieldTimerRef.current > 0) {
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
          if (coinMagnetRef.current || char.magnetMeds) {
            const dx = turretXRef.current - pu.x;
            const dy = turretY - pu.y;
            const d = Math.hypot(dx, dy);
            if (d < 200 && d > 5) { pu.x += (dx / d) * 3 * dt; pu.y += (dy / d) * 3 * dt; }
          }
          pu.y += pu.vy * dt;
          if (pu.y > barricadeY - 10) { powerUpPoolRef.current.release(pu); continue; }
          if (dist(pu.x, pu.y, turretXRef.current, turretY) < 35) {
            powerUpPoolRef.current.release(pu);
            if (pu.type === 'shield') { shieldRef.current = true; setShieldActive(true); shieldTimerRef.current = 360; addFloatText('¡ESCUDO NEÓN!', w / 2, h / 2, '#22d3ee', 16); }
            else if (pu.type === 'doubleShot') { doubleShotRef.current = true; setDoubleShotActive(true); doubleShotTimerRef.current = 480; addFloatText('¡DOBLE RÁFAGA!', w / 2, h / 2, '#fbbf24', 16); }
            else if (pu.type === 'coinMagnet') { coinMagnetRef.current = true; setCoinMagnetActive(true); coinMagnetTimerRef.current = 480; addFloatText('¡IMÁN DE MONEDAS!', w / 2, h / 2, '#fbbf24', 16); }
            playPickup(); hapticFeedback(40);
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
                  screenShakeRef.current.trigger(10, 25); hapticPattern([50, 30, 100]);
                  finalBossThresholdRef.current += 3000;
                } else if (z.type === 'tank') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 500 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  const tankCoins = Math.floor(rand(2, 4));
                  spawnFloatingCoins(z.x, z.y, tankCoins);
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(25), bloodColor, 6);
                  addFloatText('¡TANQUE!', z.x, z.y - 30, '#7c3aed', 14);
                  screenShakeRef.current.trigger(5, 15); hapticFeedback(30);
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
                  screenShakeRef.current.trigger(6, 20); hapticPattern([50, 30, 50, 30, 100]);
                }
                if (comboRef.current >= 3 && comboRef.current % 3 === 0) {
                  addFloatText(`COMBO x${comboRef.current}!`, z.x, z.y - 30, '#22d3ee', 16);
                }
                if (bloodEnabledRef.current) bloodSplatsRef.current.push({ x: z.x, y: z.y, size: z.size * 0.8, alpha: 0.5 });
              }
              break;
            }
          }
          if (!hit) for (const br of barrelPoolRef.current.getActive()) {
            if (dist(b.x, b.y, br.x, br.y) < 22) {
              br.hp -= b.damage; hit = true;
              playBarrelHit();
              spawnParticles2D(particlesRef.current, b.x, b.y, 5, '#fbbf24', 3);
              screenShakeRef.current.trigger(1, 5);
              if (br.hp <= 0) {
                barrelPoolRef.current.release(br);
                equipWeapon(br.weapon);
                const barrelCoins = Math.floor(rand(2, 4));
                spawnFloatingCoins(br.x, br.y, barrelCoins);
                addFloatText(`¡${br.weapon.toUpperCase()}!`, br.x, br.y - 30, WEAPON_COLORS[br.weapon], 18);
                addFloatText(`+${barrelCoins} MONEDAS`, br.x, br.y - 10, '#fbbf24', 14);
                playPickup();
                spawnParticles2D(particlesRef.current, br.x, br.y, 20, '#fbbf24', 6);
                screenShakeRef.current.trigger(5, 15); hapticFeedback(50);
              }
              break;
            }
          }
          if (hit) bulletPoolRef.current.release(b);
        }

        for (const c of coinPoolRef.current.getActive()) {
          if (coinMagnetRef.current || char.magnetMeds) {
            const dx = turretXRef.current - c.x;
            const dy = turretY - c.y;
            const d = Math.hypot(dx, dy);
            if (d > 5) { c.vx += (dx / d) * 0.5 * dt; c.vy += (dy / d) * 0.5 * dt; }
          } else { c.vy += 0.15 * dt; }
          c.x += c.vx * dt; c.y += c.vy * dt; c.life -= dt;
          if (c.life <= 0 || c.y > h + 20) { coinPoolRef.current.release(c); continue; }
          if (dist(c.x, c.y, turretXRef.current, turretY) < 30) {
            coinPoolRef.current.release(c);
            safeAddCoins(1); playCoin(); hapticFeedback(15);
          }
        }

        nuclearChargeRef.current += dt * 0.25;
        if (nuclearChargeRef.current >= 100 && !nuclearReady) setNuclearReady(true);
        if (nuclearActiveRef.current) { nuclearTimerRef.current -= dt; if (nuclearTimerRef.current <= 0) nuclearActiveRef.current = false; }

        playTimeRef.current += dt * 16.67;
        if (playTimeRef.current - lastPlayTimeSyncRef.current >= 5000) {
          if (isOnline) addPlayTime(playTimeRef.current - lastPlayTimeSyncRef.current);
          lastPlayTimeSyncRef.current = playTimeRef.current;
        }
      }

      // Blood splats
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

      // Draw zombies
      for (const z of zombiePoolRef.current.getActive()) drawCartoonZombie(ctx, z, now);

      // Draw barrels
      for (const br of barrelPoolRef.current.getActive()) drawBarrel(ctx, br, now);

      // Draw power-ups
      for (const pu of powerUpPoolRef.current.getActive()) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        const pulse = 1 + Math.sin(now * 0.01) * 0.15;
        ctx.scale(pulse, pulse);
        const colors: Record<PowerUpType, string> = { shield: '#22d3ee', doubleShot: '#fbbf24', coinMagnet: '#f97316' };
        const c = colors[pu.type];
        ctx.shadowColor = c; ctx.shadowBlur = 15;
        ctx.fillStyle = c;
        ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const labels: Record<PowerUpType, string> = { shield: 'S', doubleShot: 'D', coinMagnet: 'M' };
        ctx.fillText(labels[pu.type], 0, 0);
        ctx.restore();
      }

      // Barricade
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

      // Survivor
      const tx = turretXRef.current;
      drawSurvivor(ctx, tx, turretY, now);

      if (shieldRef.current) drawNeonCircle(ctx, tx, turretY - 15, 40, '#22d3ee', 20);

      // Floating coins
      for (const c of coinPoolRef.current.getActive()) {
        ctx.save();
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath(); ctx.arc(c.x, c.y, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.beginPath(); ctx.arc(c.x - 2, c.y - 2, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Bullets
      for (const b of bulletPoolRef.current.getActive()) {
        ctx.save();
        ctx.strokeStyle = b.color; ctx.lineWidth = 4;
        ctx.shadowColor = b.color; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + 16); ctx.stroke();
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
  }, [shoot, spawnZombie, spawnBoss, spawnBarrel, addPlayTime, isOnline, safeAddCoins, vip, checkKillStreakMilestone, char, equipWeapon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => { initAudio(); if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, active: true }; } };
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, active: true }; } };
    const onTouchEnd = () => { touchTargetRef.current.active = false; };
    const onMouseDown = (e: MouseEvent) => { initAudio(); const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, active: true }; };
    const onMouseMove = (e: MouseEvent) => { if (touchTargetRef.current.active) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, active: true }; } };
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
        <div className="flex items-center gap-2">
          <button onClick={() => { if (!vip && canShowInterstitial()) { recordInterstitial(); pendingExitRef.current = true; setShowInterstitial(true); } else setScreen('menu'); }} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
          <button onClick={() => { pausedRef.current = true; setPaused(true); setShowPauseModal(true); }} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70"><Pause className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            {Array.from({ length: 3 }).map((_, i) => <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-white/20'}`} />)}
          </div>
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-sm font-bold transition-colors" style={{ color: scoreColor }}>{score} pts</div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5"><Coins className="w-4 h-4 text-amber-400" /><span className="text-amber-400 text-sm font-bold">{coinsEarned}</span></div>
        </div>
      </div>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-56">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-white/60">BARRICADA</span>
          <div className="flex-1 h-3 rounded-full bg-black/50 border border-white/10 overflow-hidden">
            <div className="h-full transition-all duration-200" style={{ width: `${(barricadeHp / barricadeMaxHpRef.current) * 100}%`, background: barricadeHp > 75 ? '#22c55e' : barricadeHp > 38 ? '#eab308' : '#ef4444' }} />
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
        {currentWeapon !== 'pistol' && <div className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur border border-amber-400/50 text-amber-400 text-xs font-bold animate-pulse flex items-center gap-1"><Zap className="w-3 h-3" />{currentWeapon.toUpperCase()} {weaponTimer}s</div>}
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
      <div className="absolute top-32 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-white/40 border border-white/5">{themeName}</span>
      </div>
      {comboDisplay >= 3 && !gameOver && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <span className="text-cyan-400 font-black text-lg animate-pulse" style={{ textShadow: '0 0 15px rgba(34,211,238,0.8)' }}>COMBO x{comboDisplay}</span>
        </div>
      )}
      {floatTexts.map((ft) => <div key={ft.id} className="absolute z-20 font-bold animate-float-up pointer-events-none" style={{ left: ft.x, top: ft.y, transform: 'translate(-50%, -50%)', color: ft.color, fontSize: ft.size || 14 }}>{ft.text}</div>)}
      {reviveShieldTimer > 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-xl bg-cyan-500/20 backdrop-blur border border-cyan-400/50 text-cyan-400 font-bold text-sm animate-pulse flex items-center gap-2">
            <Shield className="w-4 h-4" /> Escudo de Inmunidad {reviveShieldTimer}s
          </div>
        </div>
      )}
      {campaignLevel > 0 && !gameOver && (
        <div className="absolute top-20 left-4 z-10 pointer-events-none">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">NIVEL {campaignLevel}</span>
        </div>
      )}
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
        <button onClick={activateNuclear} disabled={!nuclearReady} className={`absolute bottom-24 right-6 z-10 w-16 h-16 rounded-full flex items-center justify-center transition-all ${nuclearReady ? 'bg-amber-500/30 border-2 border-amber-400 animate-pulse shadow-lg shadow-amber-500/30' : 'bg-black/50 border border-white/10 opacity-40'}`}>
          <Radiation className={`w-7 h-7 ${nuclearReady ? 'text-amber-400' : 'text-white/30'}`} />
        </button>
      )}
      {!gameOver && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/50 text-white/50 border border-white/10">DESPLAZA PARA MOVER · AUTO-DISPARO</span>
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
            <button onClick={() => { if (!vip && canShowInterstitial()) { recordInterstitial(); pendingExitRef.current = true; setShowInterstitial(true); } else setScreen('menu'); }} className="w-full py-3 rounded-xl bg-card border border-border text-white font-bold hover:bg-secondary">Salir</button>
          </div>
        </div>
      )}
      {showInterstitial && (
        <InterstitialAd onDone={() => { setShowInterstitial(false); if (pendingExitRef.current) { pendingExitRef.current = false; setScreen('menu'); } }} />
      )}
      <RewardAdModal
        open={showReviveReward}
        onClose={() => setShowReviveReward(false)}
        onReward={() => {
          livesRef.current = 3; setLives(3);
          barricadeHpRef.current = barricadeMaxHpRef.current; setBarricadeHp(barricadeMaxHpRef.current);
          gameOverRef.current = false; setGameOver(false);
          hasRevivedRef.current = true; setHasRevived(true);
          reviveShieldTimerRef.current = 120; setReviveShieldTimer(2);
          safeAddCoins(3);
          const { w, h } = canvasSizeRef.current;
          for (const z of zombiePoolRef.current.getActive()) zombiePoolRef.current.release(z);
          addFloatText('¡ESCUDO DE INMUNIDAD 2s!', w / 2, h / 2, '#22d3ee', 18);
          hapticPattern([50, 30, 100]);
        }}
        title="Revivir"
        rewardText="¡Has revivido! Barricada reparada, vidas restauradas y 3 monedas extra."
      />
      <MuteButton />

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="rounded-2xl bg-card border border-cyan-500/30 p-6 w-72 shadow-2xl">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center"><Pause className="w-6 h-6 text-cyan-400" /></div>
            </div>
            <h2 className="text-white font-bold text-lg text-center mb-1">Juego en Pausa</h2>
            <p className="text-white/40 text-xs text-center mb-5">El juego está congelado</p>
            <div className="space-y-2">
              <button onClick={() => { pausedRef.current = false; setPaused(false); setShowPauseModal(false); }} className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-green-500/20"><Play className="w-4 h-4" /> Reanudar</button>
              <button onClick={() => { pausedRef.current = false; setPaused(false); setShowPauseModal(false); initGame(); }} className="w-full py-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/30"><RotateCcw className="w-4 h-4" /> Reiniciar Nivel</button>
              <button onClick={() => { pausedRef.current = false; setPaused(false); setShowPauseModal(false); setScreen('menu'); }} className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20"><Home className="w-4 h-4" /> Salir al Menú</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
