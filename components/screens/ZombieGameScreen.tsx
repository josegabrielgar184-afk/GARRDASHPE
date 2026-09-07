'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { InterstitialAd } from '@/components/game/InterstitialAd';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Video, Radiation, Shield, Baby, Sparkles, Magnet, Zap, Pause, Play, RotateCcw, Home, Trophy } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  type Particle2D, type MuzzleFlash,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  spawnMuzzleFlash, updateMuzzleFlashes, drawMuzzleFlashes,
  drawNeonCircle, drawMetallicCoin,
  drawSoldier2D, drawZombie2D, drawTacticalArena, drawArenaTower, drawArenaCastle,
  getArenaLaneX, getArenaLaneBounds, getArenaTheme, type ArenaTheme,
  ScreenShake, hapticFeedback, hapticPattern,
  clamp, dist, rand, lerp,
} from '@/lib/engine2d';
import { ObjectPool, FPSMonitor } from '@/lib/game-performance';
import { getCampaignCoinReward } from '@/lib/config';

function randomCoinCap(level: number): number {
  const { min, max } = getCampaignCoinReward(level);
  return Math.floor(rand(min, max + 1));
}
import { playShoot, playExplosion, playBossAlert, playCoin, playHit, playPickup, playBarrelHit, playWeaponEquip, initAudio, startActionMusic, stopActionMusic } from '@/lib/audio';

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

const LANE_COUNT = 2;
const BARRICADE_Y_RATIO = 0.82;
const TURRET_Y_RATIO = 0.88;
const SPRITE_SCALE = 1.9;
const TOWER_MAX_HP = 350;
const CASTLE_MAX_HP = 500;

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

const BULLET_MAX_Y_RATIO = 0.28;

const MILESTONES: Record<number, { title: string; coins?: number; shield?: boolean; scoreBoost?: boolean; color: string }> = {
  4: { title: '¡4 AÑOS DE AMOR ETERNO!', coins: 15, color: '#ec4899' },
  10: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true, color: '#60a5fa' },
  30: { title: '¡GUARDIÁN DEL BEBÉ DE LA SUERTE!', shield: true, scoreBoost: true, color: '#60a5fa' },
};

const SPECIAL_LEVEL_THEMES: Record<number, Partial<ArenaTheme>> = {
  4: { name: 'Amor Eterno', ground: ['#2a1a2a', '#221220', '#1a0e18'], lane: ['#3a2a3a', '#4a3a4a', '#3a2a3a'], laneEdge: 'rgba(236,72,153,0.5)', laneDash: 'rgba(255,200,255,0.4)', center: ['#2a1a2a', '#322030', '#2a1a2a'], divider: 'rgba(236,72,153,0.2)', nest: '#3a1a2a', nestRing: 'rgba(236,72,153,0.4)', nestCore: 'rgba(236,72,153,0.18)' },
  10: { name: 'Bebé de la Suerte', ground: ['#1a1a2e', '#161628', '#101020'], lane: ['#2a2a3e', '#3a3a4e', '#2a2a3e'], laneEdge: 'rgba(96,165,250,0.5)', laneDash: 'rgba(200,220,255,0.4)', center: ['#1a1a2e', '#222238', '#1a1a2e'], divider: 'rgba(96,165,250,0.2)', nest: '#2a2a3e', nestRing: 'rgba(96,165,250,0.4)', nestCore: 'rgba(96,165,250,0.18)' },
  30: { name: 'Bebé de la Suerte', ground: ['#1a1a2e', '#161628', '#101020'], lane: ['#2a2a3e', '#3a3a4e', '#2a2a3e'], laneEdge: 'rgba(96,165,250,0.5)', laneDash: 'rgba(200,220,255,0.4)', center: ['#1a1a2e', '#222238', '#1a1a2e'], divider: 'rgba(96,165,250,0.2)', nest: '#2a2a3e', nestRing: 'rgba(96,165,250,0.4)', nestCore: 'rgba(96,165,250,0.18)' },
};


export function ZombieGameScreen() {
  const { setScreen, addCoins, spendCoins, getZombieCharacter, lives, setLives, upgrades, submitZombieScore, isOnline, bloodEnabled, canShowInterstitial, recordInterstitial, vip, addPlayTime, startGameBatch, endGameBatch, campaignProgress, completeLevel, getCurrentCampaignLevel, towerLevels, getTowerLevel} = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [barricadeHp, setBarricadeHp] = useState(150);
  const [leftTowerHp, setLeftTowerHp] = useState(TOWER_MAX_HP);
  const [rightTowerHp, setRightTowerHp] = useState(TOWER_MAX_HP);
  const [castleHp, setCastleHp] = useState(CASTLE_MAX_HP);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showReviveReward, setShowReviveReward] = useState(false);
  const adDebounceRef = useRef(0);
  const [floatTexts, setFloatTexts] = useState<Array<{ id: number; text: string; x: number; y: number; color: string; size?: number }>>([]);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossName, setBossName] = useState('');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [victory, setVictory] = useState(false);
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
  const leftTowerHpRef = useRef(TOWER_MAX_HP);
  const rightTowerHpRef = useRef(TOWER_MAX_HP);
  const castleHpRef = useRef(CASTLE_MAX_HP);
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
  const victoryTriggeredRef = useRef(false);
  const bossWavesRef = useRef(1);
  const bossWavesTotalRef = useRef(1);
  const bossWaveIndexRef = useRef(0);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const scrollYRef = useRef(0);
  const bloodEnabledRef = useRef(true);
  const whiteFlashRef = useRef(0);
  const gameCoinsRef = useRef(0);
  const coinCapRef = useRef(15);
  const interstitialCheckedRef = useRef(false);
  const fpsMonitorRef = useRef<FPSMonitor>(new FPSMonitor());
  const playTimeRef = useRef(0);
  const lastPlayTimeSyncRef = useRef(0);
  const nuclearChargeRef = useRef(0);
  const nuclearActiveRef = useRef(false);
  const nuclearTimerRef = useRef(0);
  const nuclearUsesRef = useRef(0);
  const [nuclearUsesLeft, setNuclearUsesLeft] = useState(2);
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
  const arenaThemeRef = useRef<ArenaTheme>(getArenaTheme(1));

  // Companion refs
  const companionBulletPoolRef = useRef<ObjectPool<Bullet>>(new ObjectPool(makeBullet, 40));
  const sniperCooldownRef = useRef(0);
  const droneCooldownRef = useRef(0);
  const medicCooldownRef = useRef(0);
  const towerLevelsRef = useRef({ turret: 0, drone: 0, medic: 0 });

  useEffect(() => { towerLevelsRef.current = towerLevels; }, [towerLevels]);

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

  // Abandonment penalty: discard all coins/points earned during this run
  const abandonGame = useCallback(() => {
    if (gameCoinsRef.current > 0) {
      spendCoins(gameCoinsRef.current);
      gameCoinsRef.current = 0;
      setCoinsEarned(0);
    }
    setScreen('menu');
  }, [spendCoins, setScreen]);

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
    companionBulletPoolRef.current.releaseAll();
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
    leftTowerHpRef.current = TOWER_MAX_HP;
    rightTowerHpRef.current = TOWER_MAX_HP;
    castleHpRef.current = CASTLE_MAX_HP;
    gameOverRef.current = false;
    spawnTimerRef.current = 0; barrelTimerRef.current = 0;
    difficultyRef.current = Math.max(0.3, 0.3 + (campaignLevelRef.current - 1) * 0.05); miniBossThresholdRef.current = 500; finalBossThresholdRef.current = 1500;
    finalBossDefeatedRef.current = false; victoryTriggeredRef.current = false; setVictory(false); scrollYRef.current = 0;
    // Multiple bosses: more bosses at higher levels (1 boss per 10 levels, min 1, max 4)
    bossWavesTotalRef.current = Math.min(4, Math.max(1, Math.floor(campaignLevelRef.current / 10) + 1));
    bossWaveIndexRef.current = 0;
    bossWavesRef.current = 1;
    whiteFlashRef.current = 0; gameCoinsRef.current = 0; interstitialCheckedRef.current = false;
    coinCapRef.current = randomCoinCap(campaignLevelRef.current);
    nuclearChargeRef.current = 0; nuclearActiveRef.current = false; nuclearTimerRef.current = 0; nuclearUsesRef.current = 0; setNuclearUsesLeft(2);
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
    const specialTheme = SPECIAL_LEVEL_THEMES[cl];
    arenaThemeRef.current = specialTheme ? { ...getArenaTheme(cl), ...specialTheme } : getArenaTheme(cl);
    reviveShieldTimerRef.current = 0; setReviveShieldTimer(0);
    setScore(0); setZombiesKilled(0); setCoinsEarned(0); setBarricadeHp(150); setLeftTowerHp(TOWER_MAX_HP); setRightTowerHp(TOWER_MAX_HP); setCastleHp(CASTLE_MAX_HP); setGameOver(false); setBossActive(false);
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
    return getArenaLaneX(lane, w);
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
      // Bullet range limit: dissipate above the bridges (river is at ~0.42h, bridges slightly above)
      // life is in frames; at speed 12 and turretY ~0.88h, we want bullets to reach ~0.40h
      // distance = turretY - 0.40h ≈ 0.48h pixels; frames = distance / speed
      const bulletRangeY = h * BULLET_MAX_Y_RATIO;
      const maxBulletLife = Math.max(20, (turretY - bulletRangeY) / speed);
      b.life = Math.min(b.life, maxBulletLife);
    };

    const weapon = weaponRef.current;
    if (weapon === 'shotgun' || doubleShotRef.current) {
      fire(-12, -1.5); fire(0, 0); fire(12, 1.5);
      shootCooldownRef.current = getFireRate();
    } else if (weapon === 'minigun') {
      fire(rand(-4, 4), rand(-1, 1));
      shootCooldownRef.current = getFireRate();
    } else if (weapon === 'laser') {
      fire(0, 0);
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

    const levelScale = 0.5 + (campaignLevelRef.current - 1) * 0.08;
    let zHp: number, size: number, color: string, vy: number;
    if (type === 'fast') { zHp = Math.floor(20 * levelScale); size = 14 * SPRITE_SCALE; color = '#84cc16'; vy = (0.7 + difficultyRef.current * 0.15) * Math.min(2, levelScale); }
    else if (type === 'tank') { zHp = Math.floor(100 * levelScale); size = 26 * SPRITE_SCALE; color = '#4d7c0f'; vy = (0.3 + difficultyRef.current * 0.08) * Math.min(1.5, levelScale); }
    else { zHp = Math.floor(30 * levelScale); size = 18 * SPRITE_SCALE; color = '#65a30d'; vy = (0.45 + difficultyRef.current * 0.1) * Math.min(2, levelScale); }

    const { w: sw } = canvasSizeRef.current;
    const z = zombiePoolRef.current.acquire();
    z.x = sw / 2; z.y = -30;
    z.vx = lane === 0 ? -1.5 : 1.5;
    z.vy = vy * speedMultRef.current; z.walkCycle = Math.random() * 10;
    z.hp = zHp; z.maxHp = zHp; z.size = size; z.color = color; z.type = type; z.hitFlash = 0;
  }, []);

  const spawnBoss = useCallback(() => {
    const { w } = canvasSizeRef.current;
    const level = campaignLevelRef.current;
    const waveIdx = bossWaveIndexRef.current;
    // Each subsequent boss in the wave is tougher
    const waveMult = 1 + waveIdx * 0.35;
    const zHp = Math.floor((2000 + (level - 1) * 500) * waveMult);
    const boss = zombiePoolRef.current.acquire();
    const bossLane = Math.random() < 0.5 ? 0 : 1;
    boss.x = w / 2; boss.y = -60; boss.vy = Math.max(0.3, 0.6 - level * 0.02) * (1 + waveIdx * 0.15); boss.vx = bossLane === 0 ? -1.5 : 1.5; boss.walkCycle = 0;
    boss.hp = zHp; boss.maxHp = zHp; boss.size = 42 * SPRITE_SCALE; boss.color = '#65a30d'; boss.type = 'boss'; boss.hitFlash = 0;
    bossRef.current = boss;
    setBossActive(true); setBossHp(zHp); setBossMaxHp(zHp);
    setBossName(`JEFE NIVEL ${level} - OLEADA ${waveIdx + 1}/${bossWavesTotalRef.current}`);
    playBossAlert();
    addFloatText(`¡JEFE ${waveIdx + 1}/${bossWavesTotalRef.current}!`, w / 2, canvasSizeRef.current.h / 3, '#dc2626', 18);
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
    if (!nuclearReady || gameOverRef.current || nuclearUsesRef.current >= 2) return;
    nuclearUsesRef.current++;
    setNuclearUsesLeft(2 - nuclearUsesRef.current);
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
      stopActionMusic();
      hapticPattern([100, 50, 200]);
      if (!vip && canShowInterstitial()) { setShowInterstitial(true); recordInterstitial(); }
    }
  }, [gameOver, canShowInterstitial, recordInterstitial, vip, endGameBatch, submitZombieScore]);

  // Aggressive military zombie drawing (delegates to engine2d)
  const drawCartoonZombie = (ctx: CanvasRenderingContext2D, z: Zombie, now: number) => {
    const isTank = z.type === 'tank' || z.type === 'boss';
    const isMutant = z.type === 'fast';
    const angle = Math.PI / 2;
    drawZombie2D(ctx, z.x, z.y, angle, z.walkCycle, z.size, z.color, isMutant, isTank);

    // Boss overlay: football helmet
    if (z.type === 'boss') {
      ctx.save();
      ctx.translate(z.x, z.y);
      const wobble = Math.sin(z.walkCycle) * 4;
      const s = z.size;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(0, wobble - s * 0.35, s * 0.48, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-s * 0.48, wobble - s * 0.35, s * 0.96, s * 0.15);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-s * 0.06, wobble - s * 0.7, s * 0.12, s * 0.4);
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
      ctx.restore();
    }

    // Hit flash
    if (z.hitFlash > 0) {
      ctx.save();
      ctx.globalAlpha = z.hitFlash * 0.6;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(z.x, z.y, z.size + 4, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // HP bar
    if (z.hp < z.maxHp) {
      const s = z.size;
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

  // Tactical soldier drawing (delegates to engine2d)
  const drawSurvivor = (ctx: CanvasRenderingContext2D, x: number, y: number, now: number) => {
    const s = 22 * SPRITE_SCALE;
    const breath = Math.sin(now * 0.003) * 1.5;

    // Barricade base (sandbag style)
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = '#2a2820';
    ctx.beginPath(); ctx.roundRect(-s * 1.4, -2, s * 2.8, s * 0.8, 3); ctx.fill();
    ctx.fillStyle = '#3a3528';
    for (let i = -s * 1.3; i < s * 1.4; i += 8) { ctx.fillRect(i, 0, 7, s * 0.7); }
    ctx.strokeStyle = '#4a4636';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-s * 1.4, -6);
    for (let i = -s * 1.3; i < s * 1.4; i += 10) { ctx.lineTo(i, -6 + (i % 20 === 0 ? -4 : 0)); }
    ctx.stroke();
    ctx.restore();

    // Tactical soldier sprite (facing up)
    const walkCycle = now * 0.003;
    drawSoldier2D(ctx, x, y + breath, -Math.PI / 2, walkCycle, char.color, shieldRef.current, weaponRef.current);

    // Muzzle glow when ready
    if (shootCooldownRef.current < 2) {
      ctx.save();
      ctx.translate(x, y + breath);
      ctx.shadowColor = WEAPON_COLORS[weaponRef.current] ?? '#fbbf24';
      ctx.shadowBlur = 15;
      ctx.fillStyle = WEAPON_COLORS[weaponRef.current] ?? '#fbbf24';
      ctx.fillRect(-s * 0.04, -s * 0.6, s * 0.08, s * 0.08);
      ctx.shadowBlur = 0;
      ctx.restore();
    }
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

      // Tactical arena background (themed)
      drawTacticalArena(ctx, w, h, scrollYRef.current, arenaThemeRef.current);

      // Draw towers and castle
      const leftTowerX = w * 0.15;
      const rightTowerX = w * 0.85;
      const castleX = w * 0.5;
      const structureY = h * 0.93;
      drawArenaTower(ctx, leftTowerX, structureY, leftTowerHpRef.current, TOWER_MAX_HP, 'left');
      drawArenaTower(ctx, rightTowerX, structureY, rightTowerHpRef.current, TOWER_MAX_HP, 'right');
      drawArenaCastle(ctx, castleX, structureY, castleHpRef.current, CASTLE_MAX_HP);

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

        if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;
        shoot();

        // === Companions ===
        const tl = towerLevelsRef.current;
        const companionBullets = companionBulletPoolRef.current;
        const activeZombies = zombiePoolRef.current.getActive();

        // Francotirador: shoots straight up, high damage, slow fire rate
        if (tl.turret > 0) {
          sniperCooldownRef.current -= dt;
          if (sniperCooldownRef.current <= 0) {
            const compX = turretXRef.current;
            const b = companionBullets.acquire();
            b.x = compX - 25; b.y = turretY - 30; b.vx = 0; b.vy = -8;
            b.damage = 25 + tl.turret * 15; b.color = '#f97316'; b.life = 120;
            const b2 = companionBullets.acquire();
            b2.x = compX + 25; b2.y = turretY - 30; b2.vx = 0; b2.vy = -8;
            b2.damage = 25 + tl.turret * 15; b2.color = '#f97316'; b2.life = 120;
            spawnMuzzleFlash(muzzleFlashesRef.current, compX - 25, turretY - 30, -Math.PI / 2, '#f97316', 14 * SPRITE_SCALE);
            spawnMuzzleFlash(muzzleFlashesRef.current, compX + 25, turretY - 30, -Math.PI / 2, '#f97316', 14 * SPRITE_SCALE);
            sniperCooldownRef.current = Math.max(20, 60 - tl.turret * 5);
          }
        }

        // Dron: targets nearest zombie, medium damage, faster fire rate
        if (tl.drone > 0) {
          droneCooldownRef.current -= dt;
          if (droneCooldownRef.current <= 0 && activeZombies.length > 0) {
            const targets = activeZombies.slice(0, Math.min(1 + tl.drone, 3));
            for (const z of targets) {
              const b = companionBullets.acquire();
              b.x = turretXRef.current; b.y = turretY - 40;
              const dx = z.x - b.x; const dy = z.y - b.y; const d = Math.hypot(dx, dy) || 1;
              b.vx = (dx / d) * 7; b.vy = (dy / d) * 7;
              b.damage = 15 + tl.drone * 8; b.color = '#ef4444'; b.life = 100;
            }
            spawnMuzzleFlash(muzzleFlashesRef.current, turretXRef.current, turretY - 40, -Math.PI / 2, '#ef4444', 12 * SPRITE_SCALE);
            droneCooldownRef.current = Math.max(15, 45 - tl.drone * 3);
          }
        }

        // Médico: repairs barricade periodically
        if (tl.medic > 0) {
          medicCooldownRef.current -= dt;
          if (medicCooldownRef.current <= 0 && barricadeHpRef.current < barricadeMaxHpRef.current) {
            const heal = 10 + tl.medic * 8;
            barricadeHpRef.current = Math.min(barricadeMaxHpRef.current, barricadeHpRef.current + heal);
            setBarricadeHp(barricadeHpRef.current);
            addFloatText(`+${heal}`, turretXRef.current + 30, turretY - 20, '#34d399', 12);
            medicCooldownRef.current = Math.max(60, 180 - tl.medic * 15);
          }
        }

        // Weapon timer countdown
        if (weaponRef.current !== 'pistol') {
          weaponTimerRef.current -= dt;
          setWeaponTimer(Math.ceil(weaponTimerRef.current / 60));
          if (weaponTimerRef.current <= 0) {
            weaponRef.current = 'pistol'; setCurrentWeapon('pistol');
          }
        }

        // Progressive difficulty: increases over time (score-based) + per-level base
        const timeMinutes = playTimeRef.current / 60000;
        difficultyRef.current = 0.3 + scoreRef.current / 1000 + timeMinutes * 0.15;
        if (coinsCapped) difficultyRef.current *= 1.3;

        // Continuous zombie + barrel spawning - never pauses, even during boss or ulti (BLOCK 7)
        if (!victoryTriggeredRef.current && !victory) {
          spawnTimerRef.current += dt;
          const baseInterval = coinsCapped ? 18 : 30;
          const levelMultiplier = Math.max(1.0, 2.0 - (campaignLevelRef.current - 1) * 0.06);
          const interval = Math.max(8, baseInterval * levelMultiplier - difficultyRef.current * 2);
          const maxActive = Math.floor(MAX_ACTIVE_ZOMBIES_BASE + (campaignLevelRef.current - 1) * MAX_ACTIVE_ZOMBIES_PER_LEVEL);
          if (spawnTimerRef.current > interval && zombiePoolRef.current.getActive().length < maxActive) { spawnZombie(); spawnTimerRef.current = 0; }
          if (scoreRef.current >= miniBossThresholdRef.current) {
            for (let i = 0; i < 2; i++) {
              spawnZombie();
              const active = zombiePoolRef.current.getActive();
              const last = active[active.length - 1];
              if (last) { last.type = 'tank'; last.hp = 200 + campaignLevelRef.current * 20; last.maxHp = last.hp; last.size = 26 * SPRITE_SCALE; last.color = '#4d7c0f'; last.vy *= 0.6; }
            }
            miniBossThresholdRef.current += 500;
            addFloatText('¡Mutantes!', w / 2, h / 3, '#a855f7', 16);
            screenShakeRef.current.trigger(4, 15);
          }
          // Boss waves: spawn next boss when score threshold reached and not all waves defeated
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current && !bossRef.current) spawnBoss();
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
          z.walkCycle += dt * 0.45;
          if (z.hitFlash > 0) z.hitFlash = Math.max(0, z.hitFlash - dt * 0.1);
          // Bifurcation: steer toward assigned lane from center spawn
          if (z.vx !== 0) {
            z.x += z.vx * dt;
            const targetX = getArenaLaneX(z.vx < 0 ? 0 : 1, w);
            if ((z.vx < 0 && z.x <= targetX) || (z.vx > 0 && z.x >= targetX)) {
              z.x = targetX;
              z.vx = 0;
            }
          } else {
            const bounds = getArenaLaneBounds(z.x < w / 2 ? 0 : 1, w);
            z.x = clamp(z.x, bounds.min, bounds.max);
          }

          if (z.y > barricadeY - z.size) {
            const dmg = z.type === 'tank' ? 25 : z.type === 'fast' ? 12 : z.type === 'boss' ? 30 : 15;
            const leftTowerX = w * 0.15;
            const rightTowerX = w * 0.85;
            const castleX = w * 0.5;
            const towerRange = w * 0.18;
            const castleRange = w * 0.15;

            if (shieldRef.current || reviveShieldTimerRef.current > 0) {
              addFloatText('¡ESCUDO!', z.x, barricadeY - 30, '#22d3ee', 16);
              spawnParticles2D(particlesRef.current, z.x, barricadeY, 10, '#22d3ee', 5);
              zombiePoolRef.current.release(z);
              if (z === bossRef.current) { bossRef.current = null; setBossActive(false); }
            } else if (Math.abs(z.x - leftTowerX) < towerRange && leftTowerHpRef.current > 0) {
              leftTowerHpRef.current = Math.max(0, leftTowerHpRef.current - dmg);
              setLeftTowerHp(leftTowerHpRef.current);
              playHit();
              addFloatText(`-${dmg}`, z.x, barricadeY - 20, '#ef4444');
              screenShakeRef.current.trigger(3, 10);
              killStreakRef.current = 0; setKillStreak(0);
              if (z === bossRef.current) { bossRef.current = null; setBossActive(false); }
              zombiePoolRef.current.release(z);
            } else if (Math.abs(z.x - rightTowerX) < towerRange && rightTowerHpRef.current > 0) {
              rightTowerHpRef.current = Math.max(0, rightTowerHpRef.current - dmg);
              setRightTowerHp(rightTowerHpRef.current);
              playHit();
              addFloatText(`-${dmg}`, z.x, barricadeY - 20, '#ef4444');
              screenShakeRef.current.trigger(3, 10);
              killStreakRef.current = 0; setKillStreak(0);
              if (z === bossRef.current) { bossRef.current = null; setBossActive(false); }
              zombiePoolRef.current.release(z);
            } else if (Math.abs(z.x - castleX) < castleRange) {
              castleHpRef.current = Math.max(0, castleHpRef.current - dmg);
              setCastleHp(castleHpRef.current);
              playHit();
              addFloatText(`-${dmg}`, z.x, barricadeY - 20, '#ef4444');
              spawnParticles2D(particlesRef.current, z.x, barricadeY, 8, '#ef4444', 4);
              screenShakeRef.current.trigger(3, 10);
              killStreakRef.current = 0; setKillStreak(0);
              if (z === bossRef.current) { bossRef.current = null; setBossActive(false); }
              zombiePoolRef.current.release(z);
              if (castleHpRef.current <= 0) {
                livesRef.current--; setLives(livesRef.current);
                if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
                else {
                  castleHpRef.current = CASTLE_MAX_HP; setCastleHp(CASTLE_MAX_HP);
                  addFloatText('¡Castillo reparado!', w / 2, h / 2, '#34d399', 16);
                }
              }
            } else {
              barricadeHpRef.current -= dmg; setBarricadeHp(Math.max(0, barricadeHpRef.current));
              playHit();
              addFloatText(`-${dmg}`, z.x, barricadeY - 20, '#ef4444');
              spawnParticles2D(particlesRef.current, z.x, barricadeY, 8, '#ef4444', 4);
              screenShakeRef.current.trigger(3, 10);
              killStreakRef.current = 0; setKillStreak(0);
              if (z === bossRef.current) { bossRef.current = null; setBossActive(false); }
              zombiePoolRef.current.release(z);
              if (barricadeHpRef.current <= 0 && leftTowerHpRef.current <= 0 && rightTowerHpRef.current <= 0) {
                livesRef.current--; setLives(livesRef.current);
                if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
                else {
                  barricadeHpRef.current = barricadeMaxHpRef.current; setBarricadeHp(barricadeMaxHpRef.current);
                  addFloatText('¡Defensas reparadas!', w / 2, h / 2, '#34d399', 16);
                }
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
          // Bullets dissipate at the river line (just above bridges)
          const bulletMaxY = h * BULLET_MAX_Y_RATIO;
          if (b.life <= 0 || b.y < -10 || b.y < bulletMaxY) {
            // Spawn small dissipate particle when bullet fades at range
            if (b.y >= bulletMaxY - 5 && b.y <= bulletMaxY + 5) {
              spawnParticles2D(particlesRef.current, b.x, b.y, 3, b.color, 2);
            }
            bulletPoolRef.current.release(b); continue;
          }

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
                  bossRef.current = null; setBossActive(false);
                  const bossCoins = Math.floor(rand(5, 9));
                  spawnFloatingCoins(z.x, z.y, bossCoins);
                  scoreRef.current += 5000 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(50), bloodColor, 8);
                  addFloatText(`+${bossCoins} MONEDAS`, w / 2, h / 3, '#fbbf24', 18);
                  addFloatText('¡JEFE ELIMINADO!', z.x, z.y - 40, '#dc2626', 16);
                  screenShakeRef.current.trigger(10, 25); hapticPattern([50, 30, 100]);
                  bossWaveIndexRef.current++;
                  // Check if more boss waves remain
                  if (bossWaveIndexRef.current < bossWavesTotalRef.current) {
                    finalBossThresholdRef.current += 1000;
                    addFloatText(`¡OLEADA ${bossWaveIndexRef.current + 1}/${bossWavesTotalRef.current} ENTRANTE!`, w / 2, h / 3, '#dc2626', 20);
                  } else {
                    // All bosses defeated - trigger victory
                    finalBossDefeatedRef.current = true;
                    victoryTriggeredRef.current = true;
                    for (const zz of zombiePoolRef.current.getActive()) zombiePoolRef.current.release(zz);
                    setTimeout(() => { if (victoryTriggeredRef.current) { victoryTriggeredRef.current = false; setVictory(true); stopActionMusic(); } }, 1500);
                  }
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
                  if (Math.random() < 0.20) spawnFloatingCoins(z.x, z.y, 1);
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(12), bloodColor, 5);
                } else {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 100 * getScoreMult() * comboBonus; setScore(Math.floor(scoreRef.current));
                  if (Math.random() < 0.20) spawnFloatingCoins(z.x, z.y, 1);
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

        // Companion bullets update + collision
        for (const b of companionBulletPoolRef.current.getActive()) {
          b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
          const bulletMaxY = h * BULLET_MAX_Y_RATIO;
          if (b.life <= 0 || b.y < -10 || b.y > h + 10 || b.x < -10 || b.x > w + 10 || b.y < bulletMaxY) {
            if (b.y >= bulletMaxY - 5 && b.y <= bulletMaxY + 5) {
              spawnParticles2D(particlesRef.current, b.x, b.y, 2, b.color, 2);
            }
            companionBulletPoolRef.current.release(b); continue;
          }
          let hit = false;
          for (const z of zombiePoolRef.current.getActive()) {
            if (dist(b.x, b.y, z.x, z.y) < z.size + 6) {
              z.hp -= b.damage; z.hitFlash = 1; hit = true;
              spawnParticles2D(particlesRef.current, b.x, b.y, fpsMon.scaleParticleCount(3), b.color, 3);
              if (z.hp <= 0) {
                zombiePoolRef.current.release(z);
                const bloodColor = bloodEnabledRef.current ? z.color : '#64748b';
                killCountRef.current++; setZombiesKilled(killCountRef.current);
                scoreRef.current += 80 * getScoreMult(); setScore(Math.floor(scoreRef.current));
                if (Math.random() < 0.20) spawnFloatingCoins(z.x, z.y, 1);
                spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(8), bloodColor, 4);
              }
              break;
            }
          }
          if (hit) companionBulletPoolRef.current.release(b);
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
            safeAddCoins(1); playCoin(); hapticFeedback(15); // 1 coin per pickup - but cap is very low
          }
        }

        nuclearChargeRef.current += dt * 0.25;
        if (nuclearChargeRef.current >= 100 && !nuclearReady && nuclearUsesRef.current < 2) setNuclearReady(true);
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

      // Draw companions next to survivor
      const tl = towerLevelsRef.current;
      if (tl.turret > 0) {
        const sx = tx - 55; const sy = turretY;
        ctx.save();
        ctx.shadowColor = '#f97316'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#f97316';
        ctx.beginPath(); ctx.arc(sx, sy - 15, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fb923c';
        ctx.fillRect(sx - 5, sy - 5, 10, 20);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(sx - 2, sy - 17, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(sx + 2, sy - 17, 2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#f97316'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(sx, sy - 22); ctx.lineTo(sx, sy - 35); ctx.stroke();
        ctx.restore();
      }
      if (tl.drone > 0) {
        const dx = tx + 55; const dy = turretY - 50 + Math.sin(now * 0.005) * 5;
        ctx.save();
        ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 10;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.ellipse(dx, dy, 12, 6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath(); ctx.arc(dx, dy, 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(dx - 12, dy); ctx.lineTo(dx - 18, dy + 8);
        ctx.moveTo(dx + 12, dy); ctx.lineTo(dx + 18, dy + 8); ctx.stroke();
        ctx.restore();
      }
      if (tl.medic > 0) {
        const mx = tx + 40; const my = turretY;
        ctx.save();
        ctx.shadowColor = '#34d399'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#34d399';
        ctx.beginPath(); ctx.arc(mx, my - 15, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(mx - 5, my - 5, 10, 20);
        ctx.fillStyle = '#fff';
        ctx.fillRect(mx - 1, my - 18, 2, 6); ctx.fillRect(mx - 3, my - 16, 6, 2);
        ctx.restore();
      }

      // Floating coins
      for (const c of coinPoolRef.current.getActive()) {
        const spin = (c.life * 0.15);
        drawMetallicCoin(ctx, c.x, c.y, 7, spin);
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

      // Companion bullets
      for (const b of companionBulletPoolRef.current.getActive()) {
        ctx.save();
        ctx.fillStyle = b.color; ctx.shadowColor = b.color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(b.x, b.y, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, Math.PI * 2); ctx.fill();
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
    return () => { cancelAnimationFrame(rafRef.current); stopActionMusic(); };
  }, [shoot, spawnZombie, spawnBoss, spawnBarrel, addPlayTime, isOnline, safeAddCoins, vip, checkKillStreakMilestone, char, equipWeapon]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => { initAudio(); startActionMusic(); if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, active: true }; } };
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, active: true }; } };
    const onTouchEnd = () => { touchTargetRef.current.active = false; };
    const onMouseDown = (e: MouseEvent) => { initAudio(); startActionMusic(); const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, active: true }; };
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
          <button onClick={() => { if (!vip && canShowInterstitial()) { recordInterstitial(); pendingExitRef.current = true; setShowInterstitial(true); } else abandonGame(); }} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
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
          <span className="text-[10px] font-bold text-white/60">CASTILLO</span>
          <div className="flex-1 h-3 rounded-full bg-black/50 border border-white/10 overflow-hidden">
            <div className="h-full transition-all duration-200" style={{ width: `${(castleHp / CASTLE_MAX_HP) * 100}%`, background: castleHp > 50 ? '#22c55e' : castleHp > 25 ? '#eab308' : '#ef4444' }} />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-bold text-white/60">TORRES</span>
          <div className="flex-1 h-2 rounded-full bg-black/50 border border-white/10 overflow-hidden">
            <div className="h-full transition-all duration-200" style={{ width: `${((leftTowerHp + rightTowerHp) / (TOWER_MAX_HP * 2)) * 100}%`, background: '#8a9b50' }} />
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
        <div className="absolute bottom-24 right-6 z-10 flex flex-col items-center gap-1">
          <button onClick={activateNuclear} disabled={!nuclearReady} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${nuclearReady ? 'bg-amber-500/30 border-2 border-amber-400 animate-pulse shadow-lg shadow-amber-500/30' : 'bg-black/50 border border-white/10 opacity-40'}`}>
            <Radiation className={`w-7 h-7 ${nuclearReady ? 'text-amber-400' : 'text-white/30'}`} />
          </button>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/60 text-amber-400/80 border border-amber-500/30">{nuclearUsesLeft}/2</span>
        </div>
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
            <button onClick={() => { if (!vip && canShowInterstitial()) { recordInterstitial(); pendingExitRef.current = true; setShowInterstitial(true); } else abandonGame(); }} className="w-full py-3 rounded-xl bg-card border border-border text-white font-bold hover:bg-secondary">Salir</button>
          </div>
        </div>
      )}
      {victory && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-3xl bg-gradient-to-br from-amber-900/40 via-card to-card border-2 border-amber-500/50 p-6 text-center animate-scale-in shadow-2xl shadow-amber-500/30">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4" style={{ boxShadow: '0 0 25px rgba(245,158,11,0.5)' }}>
              <Trophy className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-amber-400 font-bold text-2xl mb-1" style={{ textShadow: '0 0 20px rgba(245,158,11,0.6)' }}>¡Nivel {campaignLevel} Completado!</h2>
            <p className="text-white/60 text-sm mb-4">Has derrotado al jefe del nivel</p>
            <div className="space-y-1 mb-6">
              <p className="text-white/60 text-sm">Zombies eliminados: {zombiesKilled}</p>
              <p className="text-white/60 text-sm">Puntuacion: {score}</p>
              <p className="text-amber-400 text-sm font-bold">Monedas ganadas: {coinsEarned}</p>
            </div>
            <button
              onClick={() => {
                endGameBatch();
                submitZombieScore(killCountRef.current);
                const lvlCoins = randomCoinCap(campaignLevel);
                completeLevel(campaignLevel, campaignLevel * 6, lvlCoins);
                setVictory(false);
                setScreen('campaign');
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold mb-2 hover:opacity-90 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" /> Continuar
            </button>
            <button onClick={() => { setVictory(false); setScreen('menu'); }} className="w-full py-3 rounded-xl bg-card border border-border text-white font-bold hover:bg-secondary">Salir al Menu</button>
          </div>
        </div>
      )}
      {showInterstitial && (
        <InterstitialAd onDone={() => { setShowInterstitial(false); if (pendingExitRef.current) { pendingExitRef.current = false; abandonGame(); } }} />
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
          safeAddCoins(1); // revive gives 1 coin instead of 3
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
              <button onClick={() => { pausedRef.current = false; setPaused(false); setShowPauseModal(false); abandonGame(); }} className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-500/20"><Home className="w-4 h-4" /> Salir al Menú</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
