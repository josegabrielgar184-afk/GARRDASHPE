'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Crosshair, Target, Zap, Bomb, Video, Clock } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  type Particle2D,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  drawCrosshair2D,
  drawIsoSoldier, drawIsoZombie,
  drawWeaponPickup2D, drawMedKit2D,
  drawFlashlight,
  drawSchoolBus, drawAmbulance, drawCrane, drawTaxi,
  drawCowgirl, drawAllySoldier,
  drawBossBomber, drawBloodSplatter,
  drawDebugFooter,
  clamp, dist, rand,
} from '@/lib/engine2d';
import { ObjectPool, FPSMonitor } from '@/lib/game-performance';
import { playShoot, playShotgun, playExplosion, playBossAlert, playCoin, playHit, playPickup, initAudio } from '@/lib/audio';

type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'grenade';
type ZombieType = 'normal' | 'fast' | 'giant';

interface Zombie { x: number; y: number; vx: number; vy: number; angle: number; walkCycle: number; hp: number; maxHp: number; size: number; color: string; type: ZombieType; hitFlash: number; active: boolean; reset(): void; }
interface MedKit { x: number; y: number; active: boolean; reset(): void; }
interface WeaponPickup { x: number; y: number; weapon: WeaponType; active: boolean; reset(): void; }
interface Bullet { x: number; y: number; vx: number; vy: number; life: number; damage: number; color: string; active: boolean; reset(): void; }
interface BloodSplat { x: number; y: number; size: number; alpha: number; active: boolean; reset(): void; }

function makeZombie(): Zombie { return { x: 0, y: 0, vx: 0, vy: 0, angle: 0, walkCycle: 0, hp: 100, maxHp: 100, size: 16, color: '#65a30d', type: 'normal', hitFlash: 0, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.angle = 0; this.walkCycle = 0; this.hp = 100; this.maxHp = 100; this.size = 16; this.color = '#65a30d'; this.type = 'normal'; this.hitFlash = 0; } }; }
function makeMedKit(): MedKit { return { x: 0, y: 0, active: false, reset() { this.x = 0; this.y = 0; } }; }
function makeWeaponPickup(): WeaponPickup { return { x: 0, y: 0, weapon: 'rifle', active: false, reset() { this.x = 0; this.y = 0; this.weapon = 'rifle'; } }; }
function makeBullet(): Bullet { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, damage: 0, color: '', active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; this.damage = 0; this.color = ''; } }; }
function makeBloodSplat(): BloodSplat { return { x: 0, y: 0, size: 0, alpha: 0.6, active: false, reset() { this.x = 0; this.y = 0; this.size = 0; this.alpha = 0.6; } }; }

interface AllyUnit { x: number; y: number; type: 'cowgirl' | 'soldier'; walkCycle: number; muzzleFlash: number; shootTimer: number; hp: number; maxHp: number; deployed: boolean; }

export function ZombieGameScreen() {
  const { setScreen, addCoins, getZombieCharacter, lives, setLives, upgrades, submitZombieScore, isOnline, bloodEnabled, canShowInterstitial, recordInterstitial, vip, addPlayTime } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [weapon, setWeapon] = useState<WeaponType>('pistol');
  const [hp, setHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [showReviveReward, setShowReviveReward] = useState(false);
  const [floatTexts, setFloatTexts] = useState<Array<{ id: number; text: string; x: number; y: number; color: string }>>([]);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossName, setBossName] = useState('');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<'cowgirl' | 'soldier'>('cowgirl');
  const [allyCooldown, setAllyCooldown] = useState(0);

  const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0, walkCycle: 0, muzzleFlash: 0 });
  const zombiePoolRef = useRef<ObjectPool<Zombie>>(new ObjectPool(makeZombie, 20));
  const medkitPoolRef = useRef<ObjectPool<MedKit>>(new ObjectPool(makeMedKit, 5));
  const weaponPickupPoolRef = useRef<ObjectPool<WeaponPickup>>(new ObjectPool(makeWeaponPickup, 5));
  const bulletPoolRef = useRef<ObjectPool<Bullet>>(new ObjectPool(makeBullet, 40));
  const bloodPoolRef = useRef<ObjectPool<BloodSplat>>(new ObjectPool(makeBloodSplat, 15));
  const bossRef = useRef<Zombie | null>(null);
  const particlesRef = useRef<Particle2D[]>([]);
  const allyCooldownRef = useRef(0);
  const alliesRef = useRef<AllyUnit[]>([]);
  const touchTargetRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const isFiringRef = useRef(false);
  const scoreRef = useRef(0);
  const killCountRef = useRef(0);
  const hpRef = useRef(100);
  const maxHpRef = useRef(100);
  const livesRef = useRef(3);
  const shieldRef = useRef(false);
  const speedMultRef = useRef(1);
  const scoreMultRef = useRef(1);
  const shotgunDmgMultRef = useRef(1);
  const damageMultRef = useRef(1);
  const magnetRef = useRef(false);
  const gameOverRef = useRef(false);
  const weaponRef = useRef<WeaponType>('pistol');
  const shootCooldownRef = useRef(0);
  const fireRateLevelRef = useRef(0);
  const damageLevelRef = useRef(0);
  const coinMagnetLevelRef = useRef(0);
  const superShieldLevelRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const weaponPickupTimerRef = useRef(0);
  const medkitTimerRef = useRef(0);
  const difficultyRef = useRef(1);
  const miniBossThresholdRef = useRef(500);
  const finalBossThresholdRef = useRef(1500);
  const finalBossDefeatedRef = useRef(false);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const scrollYRef = useRef(0);
  const bloodEnabledRef = useRef(true);
  const whiteFlashRef = useRef(0);
  const gameCoinsRef = useRef(0);
  const interstitialCheckedRef = useRef(false);
  const fpsMonitorRef = useRef<FPSMonitor>(new FPSMonitor());
  const playTimeRef = useRef(0);
  const lastPlayTimeSyncRef = useRef(0);
  const selectedUnitRef = useRef<'cowgirl' | 'soldier'>('cowgirl');
  const cowgirlsDeployedRef = useRef(0);
  const soldiersDeployedRef = useRef(0);

  const char = getZombieCharacter();

  useEffect(() => {
    speedMultRef.current = char.speedMult;
    shieldRef.current = char.shieldFirstHit || superShieldLevelRef.current > 0;
    scoreMultRef.current = char.scoreMult;
    shotgunDmgMultRef.current = char.shotgunDmgMult;
    damageMultRef.current = char.damageMult;
    magnetRef.current = char.magnetMeds || coinMagnetLevelRef.current > 0;
    fireRateLevelRef.current = upgrades.fireRate;
    damageLevelRef.current = upgrades.damage;
    coinMagnetLevelRef.current = upgrades.coinMagnet;
    superShieldLevelRef.current = upgrades.superShield;
    maxHpRef.current = char.maxHp;
  }, [char, upgrades]);

  useEffect(() => { bloodEnabledRef.current = bloodEnabled; }, [bloodEnabled]);
  useEffect(() => { selectedUnitRef.current = selectedUnit; }, [selectedUnit]);
  useEffect(() => { allyCooldownRef.current = allyCooldown; }, [allyCooldown]);

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    const { w, h } = canvasSizeRef.current;
    playerRef.current = { x: w / 2, y: h * 0.65, vx: 0, vy: 0, angle: -Math.PI / 2, walkCycle: 0, muzzleFlash: 0 };
    zombiePoolRef.current.releaseAll();
    medkitPoolRef.current.releaseAll();
    weaponPickupPoolRef.current.releaseAll();
    bulletPoolRef.current.releaseAll();
    bloodPoolRef.current.releaseAll();
    bossRef.current = null;
    particlesRef.current = [];
    alliesRef.current = [];
    allyCooldownRef.current = 0; setAllyCooldown(0);
    scoreRef.current = 0; killCountRef.current = 0;
    hpRef.current = char.maxHp; maxHpRef.current = char.maxHp;
    livesRef.current = 3;
    shieldRef.current = char.shieldFirstHit || upgrades.superShield > 0;
    gameOverRef.current = false; weaponRef.current = 'pistol'; setWeapon('pistol');
    spawnTimerRef.current = 0; weaponPickupTimerRef.current = 0; medkitTimerRef.current = 0;
    difficultyRef.current = 1; miniBossThresholdRef.current = 500; finalBossThresholdRef.current = 1500;
    finalBossDefeatedRef.current = false; scrollYRef.current = 0;
    whiteFlashRef.current = 0; gameCoinsRef.current = 0; interstitialCheckedRef.current = false;
    cowgirlsDeployedRef.current = 0; soldiersDeployedRef.current = 0;
    playTimeRef.current = 0; lastPlayTimeSyncRef.current = 0;
    setScore(0); setZombiesKilled(0); setCoinsEarned(0); setHp(char.maxHp); setGameOver(false); setBossActive(false);
  }, [char, upgrades]);

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

  const addFloatText = (text: string, x: number, y: number, color = '#fbbf24') => {
    const id = Date.now() + Math.random();
    setFloatTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatTexts((prev) => prev.filter((f) => f.id !== id)), 1000);
  };

  const MAX_GAME_COINS = vip ? 15 : 10;

  const safeAddCoins = (amount: number) => {
    if (gameCoinsRef.current >= MAX_GAME_COINS) return;
    const toAdd = Math.min(amount, MAX_GAME_COINS - gameCoinsRef.current);
    if (toAdd <= 0) return;
    addCoins(toAdd);
    gameCoinsRef.current += toAdd;
    setCoinsEarned(gameCoinsRef.current);
  };

  const getFireRate = () => Math.max(6, 18 - fireRateLevelRef.current * 2);
  const getDamage = () => (40 + damageLevelRef.current * 15) * damageMultRef.current;

  const deployAlly = () => {
    const { w, h } = canvasSizeRef.current;
    if (allyCooldownRef.current > 0) return;
    const type = selectedUnitRef.current;
    alliesRef.current.push({
      x: w * 0.15, y: h * 0.5 + Math.random() * h * 0.2,
      type, walkCycle: 0, muzzleFlash: 0, shootTimer: 30 + Math.random() * 30,
      hp: 100, maxHp: 100, deployed: true,
    });
    allyCooldownRef.current = 600; setAllyCooldown(600);
  };

  const shoot = useCallback(() => {
    if (gameOverRef.current || shootCooldownRef.current > 0) return;
    initAudio();
    const p = playerRef.current;
    const aimAngle = touchTargetRef.current.active
      ? Math.atan2(touchTargetRef.current.y - p.y, touchTargetRef.current.x - p.x)
      : p.angle;
    p.angle = aimAngle;
    p.muzzleFlash = 1;
    const speed = 10;

    if (weaponRef.current === 'pistol') {
      const b = bulletPoolRef.current.acquire();
      b.x = p.x + Math.cos(aimAngle) * 30; b.y = p.y + Math.sin(aimAngle) * 30;
      b.vx = Math.cos(aimAngle) * speed; b.vy = Math.sin(aimAngle) * speed;
      b.life = 50; b.damage = getDamage(); b.color = '#fbbf24';
      shootCooldownRef.current = getFireRate(); playShoot();
    } else if (weaponRef.current === 'rifle') {
      const b = bulletPoolRef.current.acquire();
      b.x = p.x + Math.cos(aimAngle) * 30; b.y = p.y + Math.sin(aimAngle) * 30;
      b.vx = Math.cos(aimAngle) * 14; b.vy = Math.sin(aimAngle) * 14;
      b.life = 50; b.damage = getDamage() * 0.7; b.color = '#22d3ee';
      shootCooldownRef.current = Math.max(4, getFireRate() - 8); playShoot();
    } else if (weaponRef.current === 'shotgun') {
      for (let i = -1; i <= 1; i++) {
        const sa = aimAngle + i * 0.2;
        const b = bulletPoolRef.current.acquire();
        b.x = p.x + Math.cos(sa) * 30; b.y = p.y + Math.sin(sa) * 30;
        b.vx = Math.cos(sa) * 9; b.vy = Math.sin(sa) * 9;
        b.life = 45; b.damage = getDamage() * 0.8 * shotgunDmgMultRef.current; b.color = '#f87171';
      }
      shootCooldownRef.current = getFireRate() + 8; playShotgun();
    } else if (weaponRef.current === 'grenade') {
      const b = bulletPoolRef.current.acquire();
      b.x = p.x + Math.cos(aimAngle) * 30; b.y = p.y + Math.sin(aimAngle) * 30;
      b.vx = Math.cos(aimAngle) * 6; b.vy = Math.sin(aimAngle) * 6;
      b.life = 60; b.damage = getDamage() * 3; b.color = '#fb923c';
      shootCooldownRef.current = getFireRate() + 20; playExplosion();
    }
  }, []);

  const spawnZombie = useCallback((side?: number) => {
    const { w } = canvasSizeRef.current;
    const r = Math.random();
    let type: ZombieType = 'normal';
    if (difficultyRef.current > 1.5 && r < 0.15) type = 'fast';
    else if (difficultyRef.current > 2 && r < 0.25) type = 'giant';

    let zHp: number, size: number, color: string;
    if (type === 'fast') { zHp = 50; size = 13; color = '#ef4444'; }
    else if (type === 'giant') { zHp = 300; size = 30; color = '#7c3aed'; }
    else { zHp = 100; size = 16; color = '#65a30d'; }

    const z = zombiePoolRef.current.acquire();
    z.x = rand(40, w - 40); z.y = -20 - Math.random() * 40;
    z.vx = 0; z.vy = 0; z.angle = Math.PI / 2; z.walkCycle = Math.random() * 10;
    z.hp = zHp; z.maxHp = zHp; z.size = size; z.color = color; z.type = type; z.hitFlash = 0;
  }, []);

  const spawnBossBomber = useCallback(() => {
    const { w } = canvasSizeRef.current;
    const zHp = 2000;
    const boss = zombiePoolRef.current.acquire();
    boss.x = w / 2; boss.y = -50; boss.vx = 0; boss.vy = 0; boss.angle = Math.PI / 2; boss.walkCycle = 0;
    boss.hp = zHp; boss.maxHp = zHp; boss.size = 40; boss.color = '#dc2626'; boss.type = 'giant'; boss.hitFlash = 0;
    bossRef.current = boss;
    setBossActive(true); setBossHp(zHp); setBossMaxHp(zHp); setBossName('BOMBER ZOMBIE');
    playBossAlert();
    addFloatText('¡BOMBER ZOMBIE!', w / 2, canvasSizeRef.current.h / 3, '#dc2626');
  }, []);

  const spawnWeaponPickup = useCallback(() => {
    const { w, h } = canvasSizeRef.current;
    const weapons: WeaponType[] = ['rifle', 'shotgun', 'grenade'];
    const wp = weaponPickupPoolRef.current.acquire();
    wp.x = rand(50, w - 50); wp.y = rand(h * 0.3, h - 80); wp.weapon = weapons[Math.floor(Math.random() * 3)];
  }, []);

  const spawnMedKit = useCallback(() => {
    const { w, h } = canvasSizeRef.current;
    const m = medkitPoolRef.current.acquire();
    m.x = rand(50, w - 50); m.y = rand(h * 0.3, h - 80);
  }, []);

  useEffect(() => { weaponRef.current = weapon; }, [weapon]);

  useEffect(() => {
    if (gameOver && !interstitialCheckedRef.current) {
      interstitialCheckedRef.current = true;
      if (!vip && canShowInterstitial()) { setShowInterstitial(true); recordInterstitial(); }
    }
  }, [gameOver, canShowInterstitial, recordInterstitial, vip]);

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

      if (!fpsMon.shouldRenderFrame(now, lastRenderTime)) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      lastRenderTime = now;

      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;
      const { w, h } = canvasSizeRef.current;

      scrollYRef.current += dt * 0.5;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1a1a0a');
      grad.addColorStop(0.3, '#2a2a1a');
      grad.addColorStop(0.6, '#1a2a1a');
      grad.addColorStop(1, '#0a1a0a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (fpsMon.quality !== 'low') {
        const fogGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
        fogGrad.addColorStop(0, 'rgba(120,60,20,0.2)');
        fogGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, 0, w, h * 0.5);
      }

      for (let i = 0; i < 8; i++) {
        const tx = (i * 137 + scrollYRef.current * 0.3) % (w + 60) - 30;
        const ty = h * 0.1 + Math.sin(i * 2.3) * 20;
        ctx.fillStyle = '#1a2a0a';
        ctx.fillRect(tx, ty, 20, h * 0.35);
        ctx.fillStyle = '#2a3a1a';
        ctx.fillRect(tx + 2, ty - 10, 16, 25);
      }

      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(0, h * 0.75, w, h * 0.25);
      ctx.fillStyle = '#2a1a0a';
      for (let i = 0; i < w; i += 8) {
        ctx.fillRect(i, h * 0.75 + Math.sin(i * 0.1) * 3, 4, 6);
      }

      drawSchoolBus(ctx, w * 0.15, h * 0.7, 0.5);
      drawAmbulance(ctx, w * 0.75, h * 0.65, 0.4);
      drawCrane(ctx, w * 0.5, h * 0.5, 0.3);
      drawTaxi(ctx, w * 0.85, h * 0.78, 0.4, 0.3);

      if (!gameOverRef.current) {
        const p = playerRef.current;
        if (touchTargetRef.current.active) {
          const targetX = touchTargetRef.current.x;
          const targetY = touchTargetRef.current.y;
          const dx = targetX - p.x;
          const dy = targetY - p.y;
          const d = Math.hypot(dx, dy);
          if (d > 2) {
            const moveSpeed = Math.min(d * 0.2, 6) * speedMultRef.current;
            p.x = clamp(p.x + (dx / d) * moveSpeed * dt, 30, w - 30);
            p.y = clamp(p.y + (dy / d) * moveSpeed * dt, h * 0.3, h - 40);
            p.angle = Math.atan2(dy, dx);
            p.walkCycle += dt * 0.3;
          }
        }
        if (p.muzzleFlash > 0) p.muzzleFlash = Math.max(0, p.muzzleFlash - dt * 0.15);
        if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;
        if (touchTargetRef.current.active && shootCooldownRef.current <= 0) shoot();

        if (allyCooldownRef.current > 0) {
          allyCooldownRef.current -= dt;
          if (allyCooldownRef.current <= 0) setAllyCooldown(0);
        }

        for (const ally of alliesRef.current) {
          ally.walkCycle += dt * 0.2;
          ally.shootTimer -= dt;
          if (ally.shootTimer <= 0) {
            ally.shootTimer = 40 + Math.random() * 20;
            ally.muzzleFlash = 1;
            const target = zombiePoolRef.current.getActive().reduce((closest, z) => {
              const d = dist(ally.x, ally.y, z.x, z.y);
              return d < closest.d ? { z, d } : closest;
            }, { z: null as Zombie | null, d: Infinity });
            if (target.z) {
              const angle = Math.atan2(target.z.y - ally.y, target.z.x - ally.x);
              const b = bulletPoolRef.current.acquire();
              b.x = ally.x + Math.cos(angle) * 20; b.y = ally.y + Math.sin(angle) * 20;
              b.vx = Math.cos(angle) * 10; b.vy = Math.sin(angle) * 10;
              b.life = 50; b.damage = ally.type === 'cowgirl' ? 60 : 40; b.color = ally.type === 'cowgirl' ? '#fbbf24' : '#22d3ee';
            }
            playShoot();
          }
          if (ally.muzzleFlash > 0) ally.muzzleFlash = Math.max(0, ally.muzzleFlash - dt * 0.15);
        }

        difficultyRef.current = 1 + scoreRef.current / 500;

        if (!bossRef.current) {
          spawnTimerRef.current += dt;
          const interval = Math.max(15, 35 - difficultyRef.current * 3);
          if (spawnTimerRef.current > interval) { spawnZombie(); spawnTimerRef.current = 0; }
          if (scoreRef.current >= miniBossThresholdRef.current) {
            for (let i = 0; i < 2; i++) {
              spawnZombie();
              const last = zombiePoolRef.current.getActive()[zombiePoolRef.current.getActive().length - 1];
              if (last) { last.type = 'giant'; last.hp = 200; last.maxHp = 200; last.size = 26; last.color = '#a855f7'; }
            }
            miniBossThresholdRef.current += 500;
            addFloatText('¡Mutantes!', w / 2, h / 3, '#a855f7');
          }
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current) spawnBossBomber();
        }

        weaponPickupTimerRef.current += dt;
        if (weaponPickupTimerRef.current > 300) { spawnWeaponPickup(); weaponPickupTimerRef.current = 0; }
        medkitTimerRef.current += dt;
        if (medkitTimerRef.current > 250) { spawnMedKit(); medkitTimerRef.current = 0; }

        for (const z of zombiePoolRef.current.getActive()) {
          const dx = p.x - z.x;
          const dy = p.y - z.y;
          const d = Math.max(Math.hypot(dx, dy), 1);
          let speed: number;
          if (z.type === 'fast') speed = 4.5;
          else if (z.type === 'giant') speed = z === bossRef.current ? 3.5 : 2.0;
          else speed = 2.8 + Math.random() * 0.5;
          z.x += (dx / d) * speed * dt;
          z.y += (dy / d) * speed * dt;
          z.angle = Math.atan2(dy, dx);
          z.walkCycle += dt * 0.35;
          if (z.hitFlash > 0) z.hitFlash = Math.max(0, z.hitFlash - dt * 0.1);

          if (d < z.size + 16) {
            if (z === bossRef.current) {
              if (shieldRef.current) { shieldRef.current = false; }
              else {
                hpRef.current -= 30; setHp(hpRef.current); playHit();
                addFloatText('-30 HP', w / 2, h / 2, '#ef4444');
                if (hpRef.current <= 0) {
                  livesRef.current--; setLives(livesRef.current);
                  if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); submitZombieScore(killCountRef.current); }
                  else { hpRef.current = maxHpRef.current; setHp(maxHpRef.current); shieldRef.current = char.shieldFirstHit || superShieldLevelRef.current > 0; }
                }
              }
            } else {
              zombiePoolRef.current.release(z);
              if (shieldRef.current) { shieldRef.current = false; addFloatText('¡Escudo!', w / 2, h / 2, '#34d399'); continue; }
              const dmg = z.type === 'giant' ? 25 : 15;
              hpRef.current -= dmg; setHp(hpRef.current); playHit();
              addFloatText(`-${dmg} HP`, w / 2, h / 2, '#f87171');
              if (hpRef.current <= 0) {
                livesRef.current--; setLives(livesRef.current);
                if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); submitZombieScore(killCountRef.current); }
                else { hpRef.current = maxHpRef.current; setHp(maxHpRef.current); shieldRef.current = char.shieldFirstHit || superShieldLevelRef.current > 0; }
              }
            }
          }
        }

        for (const m of medkitPoolRef.current.getActive()) {
          const d = dist(m.x, m.y, p.x, p.y);
          const range = magnetRef.current ? 80 : 40;
          if (d < range) {
            medkitPoolRef.current.release(m);
            hpRef.current = Math.min(maxHpRef.current, hpRef.current + 30); setHp(hpRef.current);
            playPickup(); addFloatText('+30 HP', w / 2, h / 2, '#34d399');
          }
          if (magnetRef.current && d < 120) { m.x += (p.x - m.x) * 0.05 * dt; m.y += (p.y - m.y) * 0.05 * dt; }
        }

        for (const wp of weaponPickupPoolRef.current.getActive()) {
          if (dist(wp.x, wp.y, p.x, p.y) < 28) {
            weaponPickupPoolRef.current.release(wp);
            setWeapon(wp.weapon); weaponRef.current = wp.weapon;
            playPickup(); addFloatText(wp.weapon.toUpperCase(), w / 2, h / 2, '#22d3ee');
          }
        }

        for (const b of bulletPoolRef.current.getActive()) {
          b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
          if (b.life <= 0 || b.x < 0 || b.x > w || b.y < 0 || b.y > h) { bulletPoolRef.current.release(b); continue; }
          for (const z of zombiePoolRef.current.getActive()) {
            if (dist(b.x, b.y, z.x, z.y) < z.size + 6) {
              z.hp -= b.damage; z.hitFlash = 1; bulletPoolRef.current.release(b);
              spawnParticles2D(particlesRef.current, b.x, b.y, fpsMon.scaleParticleCount(5), b.color, 3);
              whiteFlashRef.current = Math.max(whiteFlashRef.current, 0.3);
              if (bloodEnabledRef.current) {
                const bs = bloodPoolRef.current.acquire();
                bs.x = z.x; bs.y = z.y; bs.size = z.size * 0.8; bs.alpha = 0.5;
              }
              if (z.hp <= 0) {
                zombiePoolRef.current.release(z);
                const bloodColor = bloodEnabledRef.current ? z.color : '#64748b';
                if (z === bossRef.current) {
                  bossRef.current = null; setBossActive(false); finalBossDefeatedRef.current = true;
                  safeAddCoins(5);
                  scoreRef.current += 5000 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(50), bloodColor, 8);
                  addFloatText('+5 monedas', w / 2, h / 3, '#fbbf24');
                  finalBossThresholdRef.current += 3000;
                } else if (z.type === 'giant') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 500 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  safeAddCoins(2);
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(25), bloodColor, 6);
                  addFloatText('+2 monedas', z.x, z.y - 20, '#fbbf24');
                } else if (z.type === 'fast') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 150 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(12), bloodColor, 5);
                  addFloatText('+10', z.x, z.y - 15, '#ef4444');
                } else {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 100 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  if (killCountRef.current % 5 === 0) { safeAddCoins(1); playCoin(); }
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(10), bloodColor, 4);
                  addFloatText('+10', z.x, z.y - 15, '#65a30d');
                }
              }
              break;
            }
          }
        }

        playTimeRef.current += dt * 16.67;
        if (playTimeRef.current - lastPlayTimeSyncRef.current >= 5000) {
          if (isOnline) addPlayTime(playTimeRef.current - lastPlayTimeSyncRef.current);
          lastPlayTimeSyncRef.current = playTimeRef.current;
        }

        for (const m of medkitPoolRef.current.getActive()) drawMedKit2D(ctx, m.x, m.y, now);
        for (const wp of weaponPickupPoolRef.current.getActive()) drawWeaponPickup2D(ctx, wp.x, wp.y, wp.weapon, now);

        for (const bs of bloodPoolRef.current.getActive()) {
          drawBloodSplatter(ctx, bs.x, bs.y, bs.size, bs.alpha);
          bs.alpha -= dt * 0.01;
          if (bs.alpha <= 0) bloodPoolRef.current.release(bs);
        }

        const sortedZ = zombiePoolRef.current.getActive().sort((a, b) => a.y - b.y);
        for (const z of sortedZ) {
          if (z === bossRef.current) {
            drawBossBomber(ctx, z.x, z.y, z.walkCycle, z.size, z.walkCycle * 3, now);
          } else {
            drawIsoZombie(ctx, z.x, z.y, z.angle, z.walkCycle, z.size, z.color, z.type === 'giant', false);
          }
          if (z.hitFlash > 0) {
            ctx.save();
            ctx.globalAlpha = z.hitFlash * 0.6;
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(z.x, z.y, z.size + 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        for (const ally of alliesRef.current) {
          if (ally.type === 'cowgirl') drawCowgirl(ctx, ally.x, ally.y, ally.walkCycle, ally.muzzleFlash, now);
          else drawAllySoldier(ctx, ally.x, ally.y, ally.walkCycle, ally.muzzleFlash, now);
        }

        for (const b of bulletPoolRef.current.getActive()) {
          ctx.save();
          ctx.strokeStyle = b.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = b.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
          ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        drawIsoSoldier(ctx, p.x, p.y, p.angle, p.walkCycle, shieldRef.current ? '#34d399' : char.color, shieldRef.current, weapon, p.muzzleFlash);
        drawFlashlight(ctx, p.x, p.y, w, h, char.color);
      }

      updateParticles2D(particlesRef.current, dt);
      drawParticles2D(ctx, particlesRef.current);

      if (whiteFlashRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = whiteFlashRef.current;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        whiteFlashRef.current = Math.max(0, whiteFlashRef.current - dt * 0.08);
      }

      if (touchTargetRef.current.active && !gameOverRef.current) {
        drawCrosshair2D(ctx, touchTargetRef.current.x, touchTargetRef.current.y, char.color, 24);
      }

      drawDebugFooter(ctx, w, h, fpsMon.current);

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins, setLives, char, submitZombieScore, weapon, shoot, spawnZombie, spawnBossBomber, spawnWeaponPickup, spawnMedKit, isOnline, addPlayTime, vip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => {
      initAudio();
      isFiringRef.current = true;
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        touchTargetRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, active: true };
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        touchTargetRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, active: true };
      }
    };
    const onTouchEnd = () => { isFiringRef.current = false; touchTargetRef.current.active = false; };
    const onMouseDown = (e: MouseEvent) => { initAudio(); isFiringRef.current = true; const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }; };
    const onMouseMove = (e: MouseEvent) => { if (touchTargetRef.current.active) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }; } };
    const onMouseUp = () => { isFiringRef.current = false; touchTargetRef.current.active = false; };
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
  }, [shoot]);

  const weaponIcons: Record<WeaponType, typeof Target> = { pistol: Target, rifle: Zap, shotgun: Crosshair, grenade: Bomb };
  const WeaponIcon = weaponIcons[weapon];

  return (
    <div className="absolute inset-0 bg-black flex flex-col" style={{ paddingTop: vip ? 0 : 'calc(var(--ad-banner-height) + env(safe-area-inset-top))' }}>
      <OfflineBanner />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <button onClick={() => setScreen('mode-select')} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            {Array.from({ length: 3 }).map((_, i) => <Heart key={i} className={`w-4 h-4 ${i < lives ? 'text-red-500 fill-red-500' : 'text-white/20'}`} />)}
          </div>
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1.5 text-white text-sm font-bold">{score} pts</div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5"><Coins className="w-4 h-4 text-amber-400" /><span className="text-amber-400 text-sm font-bold">{coinsEarned}</span></div>
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur rounded-full px-3 py-1.5"><span className="text-sm font-bold" style={{ color: char.color }}>{char.name}</span></div>
        </div>
      </div>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-48">
        <div className="h-3 rounded-full bg-black/50 border border-white/10 overflow-hidden">
          <div className="h-full transition-all duration-200" style={{ width: `${(hp / maxHpRef.current) * 100}%`, background: hp > 50 ? '#22c55e' : hp > 25 ? '#eab308' : '#ef4444' }} />
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
        <div className="w-12 h-12 rounded-xl bg-black/50 backdrop-blur border border-cyan-400/30 flex items-center justify-center text-cyan-400"><WeaponIcon className="w-5 h-5" /></div>
      </div>
      {floatTexts.map((ft) => <div key={ft.id} className="absolute z-20 font-bold text-sm animate-float-up pointer-events-none" style={{ left: ft.x, top: ft.y, transform: 'translate(-50%, -50%)', color: ft.color }}>{ft.text}</div>)}
      {!gameOver && (
        <>
          <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/50 text-white/50 border border-white/10">ARRASTRA PARA MOVER · SOSTIEN PARA DISPARAR</span>
          </div>
        </>
      )}
      {!gameOver && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2 pb-1">
          <button
            onClick={() => setSelectedUnit('cowgirl')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${selectedUnit === 'cowgirl' ? 'bg-amber-500/30 border border-amber-400/50 text-amber-400' : 'bg-black/50 border border-white/10 text-white/50'}`}
          >
            <span className="text-base">🤠</span>
            <span>Vaquera</span>
          </button>
          <button
            onClick={deployAlly}
            disabled={allyCooldown > 0}
            className="px-3 py-2 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center gap-0.5"
          >
            {allyCooldown > 0 ? <><Clock className="w-3 h-3" /><span>{Math.ceil(allyCooldown / 60)}s</span></> : <><span className="text-base">+</span><span>Desplegar</span></>}
          </button>
          <button
            onClick={() => setSelectedUnit('soldier')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 transition-all ${selectedUnit === 'soldier' ? 'bg-green-500/30 border border-green-400/50 text-green-400' : 'bg-black/50 border border-white/10 text-white/50'}`}
          >
            <span className="text-base">🪖</span>
            <span>Soldado</span>
          </button>
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-card/90 border border-red-500/30 p-6 text-center animate-scale-in shadow-2xl shadow-red-500/20">
            <h2 className="text-red-400 font-bold text-2xl mb-2" style={{ textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>Game Over</h2>
            <p className="text-white/60 text-sm mb-1">Zombies eliminados: {zombiesKilled}</p>
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
      <RewardAdModal open={showReviveReward} onClose={() => setShowReviveReward(false)} onReward={() => { livesRef.current = 3; hpRef.current = maxHpRef.current; shieldRef.current = true; setLives(3); setHp(maxHpRef.current); gameOverRef.current = false; setGameOver(false); safeAddCoins(3); }} title="Revivir" rewardText="¡Has revivido con vida completa, escudo y 3 monedas extra!" />
      <MuteButton />
    </div>
  );
}
