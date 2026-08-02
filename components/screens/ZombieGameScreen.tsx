'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Zap, Bomb, Video, Radiation } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  type Particle2D,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  clamp, dist, rand,
} from '@/lib/engine2d';
import { ObjectPool, FPSMonitor } from '@/lib/game-performance';
import { playShoot, playExplosion, playBossAlert, playCoin, playHit, playPickup, initAudio } from '@/lib/audio';

type WeaponType = 'pistol' | 'rifle' | 'shotgun';
type ZombieType = 'normal' | 'fast' | 'giant';

interface Zombie { x: number; y: number; vy: number; walkCycle: number; hp: number; maxHp: number; size: number; color: string; type: ZombieType; hitFlash: number; active: boolean; reset(): void; }
interface Bullet { x: number; y: number; vx: number; vy: number; life: number; damage: number; color: string; active: boolean; reset(): void; }
interface Barrel { x: number; y: number; vy: number; hp: number; id: number; active: boolean; reset(): void; }
interface BloodSplat { x: number; y: number; size: number; alpha: number; }

function makeZombie(): Zombie { return { x: 0, y: 0, vy: 0, walkCycle: 0, hp: 100, maxHp: 100, size: 16, color: '#65a30d', type: 'normal', hitFlash: 0, active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.walkCycle = 0; this.hp = 100; this.maxHp = 100; this.size = 16; this.color = '#65a30d'; this.type = 'normal'; this.hitFlash = 0; } }; }
function makeBullet(): Bullet { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, damage: 0, color: '', active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; this.damage = 0; this.color = ''; } }; }
let barrelIdCounter = 0;
function makeBarrel(): Barrel { return { x: 0, y: 0, vy: 0, hp: 50, id: 0, active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.hp = 50; this.id = 0; } }; }

const LANE_COUNT = 5;
const BARRICADE_Y_RATIO = 0.82;
const TURRET_Y_RATIO = 0.88;

export function ZombieGameScreen() {
  const { setScreen, addCoins, getZombieCharacter, lives, setLives, upgrades, submitZombieScore, isOnline, bloodEnabled, canShowInterstitial, recordInterstitial, vip, addPlayTime, startGameBatch, endGameBatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [weapon, setWeapon] = useState<WeaponType>('pistol');
  const [barricadeHp, setBarricadeHp] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  const [showReviveReward, setShowReviveReward] = useState(false);
  const [floatTexts, setFloatTexts] = useState<Array<{ id: number; text: string; x: number; y: number; color: string }>>([]);
  const [bossActive, setBossActive] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossName, setBossName] = useState('');
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [nuclearReady, setNuclearReady] = useState(false);
  const [hasRevived, setHasRevived] = useState(false);

  const zombiePoolRef = useRef<ObjectPool<Zombie>>(new ObjectPool(makeZombie, 30));
  const bulletPoolRef = useRef<ObjectPool<Bullet>>(new ObjectPool(makeBullet, 50));
  const barrelPoolRef = useRef<ObjectPool<Barrel>>(new ObjectPool(makeBarrel, 8));
  const bloodSplatsRef = useRef<BloodSplat[]>([]);
  const bossRef = useRef<Zombie | null>(null);
  const particlesRef = useRef<Particle2D[]>([]);
  const touchTargetRef = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });
  const scoreRef = useRef(0);
  const killCountRef = useRef(0);
  const livesRef = useRef(3);
  const barricadeHpRef = useRef(100);
  const barricadeMaxHpRef = useRef(100);
  const gameOverRef = useRef(false);
  const weaponRef = useRef<WeaponType>('pistol');
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

  const char = getZombieCharacter();

  useEffect(() => {
    speedMultRef.current = char.speedMult;
    scoreMultRef.current = char.scoreMult;
    damageMultRef.current = char.damageMult;
    fireRateLevelRef.current = upgrades.fireRate;
    damageLevelRef.current = upgrades.damage;
  }, [char, upgrades]);

  useEffect(() => { bloodEnabledRef.current = bloodEnabled; }, [bloodEnabled]);

  const MAX_GAME_COINS = vip ? 15 : 10;

  const safeAddCoins = useCallback((amount: number) => {
    if (gameCoinsRef.current >= MAX_GAME_COINS) return;
    const toAdd = Math.min(amount, MAX_GAME_COINS - gameCoinsRef.current);
    if (toAdd <= 0) return;
    addCoins(toAdd);
    gameCoinsRef.current += toAdd;
    setCoinsEarned(gameCoinsRef.current);
  }, [addCoins, MAX_GAME_COINS]);

  const getFireRate = () => Math.max(5, 16 - fireRateLevelRef.current * 2);
  const getDamage = () => (30 + damageLevelRef.current * 12) * damageMultRef.current;

  const addFloatText = (text: string, x: number, y: number, color = '#fbbf24') => {
    const id = Date.now() + Math.random();
    setFloatTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatTexts((prev) => prev.filter((f) => f.id !== id)), 1000);
  };

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    zombiePoolRef.current.releaseAll();
    bulletPoolRef.current.releaseAll();
    barrelPoolRef.current.releaseAll();
    bloodSplatsRef.current = [];
    bossRef.current = null;
    particlesRef.current = [];
    scoreRef.current = 0; killCountRef.current = 0;
    livesRef.current = 3;
    barricadeHpRef.current = 100; barricadeMaxHpRef.current = 100;
    gameOverRef.current = false; weaponRef.current = 'pistol'; setWeapon('pistol');
    spawnTimerRef.current = 0; barrelTimerRef.current = 0;
    difficultyRef.current = 1; miniBossThresholdRef.current = 500; finalBossThresholdRef.current = 1500;
    finalBossDefeatedRef.current = false; scrollYRef.current = 0;
    whiteFlashRef.current = 0; gameCoinsRef.current = 0; interstitialCheckedRef.current = false;
    nuclearChargeRef.current = 0; nuclearActiveRef.current = false; nuclearTimerRef.current = 0;
    hasRevivedRef.current = false; setHasRevived(false);
    playTimeRef.current = 0; lastPlayTimeSyncRef.current = 0;
    setScore(0); setZombiesKilled(0); setCoinsEarned(0); setBarricadeHp(100); setGameOver(false); setBossActive(false);
    setNuclearReady(false);
    startGameBatch();
  }, [upgrades, startGameBatch]);

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
    const speed = 12;
    const dmg = getDamage() * (nuclearActiveRef.current ? 2.5 : 1);

    const fire = (ox: number, vxMod: number) => {
      const b = bulletPoolRef.current.acquire();
      b.x = w / 2 + ox; b.y = turretY - 20;
      b.vx = vxMod; b.vy = -speed;
      b.life = 80; b.damage = dmg; b.color = weaponRef.current === 'shotgun' ? '#f87171' : weaponRef.current === 'rifle' ? '#22d3ee' : '#fbbf24';
    };

    if (weaponRef.current === 'pistol') { fire(0, 0); shootCooldownRef.current = getFireRate(); playShoot(); }
    else if (weaponRef.current === 'rifle') { fire(0, 0); shootCooldownRef.current = Math.max(4, getFireRate() - 6); playShoot(); }
    else if (weaponRef.current === 'shotgun') { fire(-8, -1.5); fire(0, 0); fire(8, 1.5); shootCooldownRef.current = getFireRate() + 6; playShoot(); }
  }, []);

  const spawnZombie = useCallback(() => {
    const { w } = canvasSizeRef.current;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const r = Math.random();
    let type: ZombieType = 'normal';
    if (difficultyRef.current > 1.5 && r < 0.15) type = 'fast';
    else if (difficultyRef.current > 2 && r < 0.22) type = 'giant';

    let zHp: number, size: number, color: string, vy: number;
    if (type === 'fast') { zHp = 50; size = 13; color = '#ef4444'; vy = 1.8 + difficultyRef.current * 0.2; }
    else if (type === 'giant') { zHp = 300; size = 28; color = '#7c3aed'; vy = 0.8 + difficultyRef.current * 0.1; }
    else { zHp = 100; size = 16; color = '#65a30d'; vy = 1.2 + difficultyRef.current * 0.15; }

    const z = zombiePoolRef.current.acquire();
    z.x = getLaneX(lane); z.y = -20;
    z.vy = vy * speedMultRef.current; z.walkCycle = Math.random() * 10;
    z.hp = zHp; z.maxHp = zHp; z.size = size; z.color = color; z.type = type; z.hitFlash = 0;
  }, []);

  const spawnBoss = useCallback(() => {
    const { w } = canvasSizeRef.current;
    const zHp = 2000;
    const boss = zombiePoolRef.current.acquire();
    boss.x = w / 2; boss.y = -50; boss.vy = 0.6; boss.walkCycle = 0;
    boss.hp = zHp; boss.maxHp = zHp; boss.size = 42; boss.color = '#dc2626'; boss.type = 'giant'; boss.hitFlash = 0;
    bossRef.current = boss;
    setBossActive(true); setBossHp(zHp); setBossMaxHp(zHp); setBossName('GIANT FOOTBALL ZOMBIE');
    playBossAlert();
    addFloatText('¡GIANT FOOTBALL ZOMBIE!', w / 2, canvasSizeRef.current.h / 3, '#dc2626');
  }, []);

  const spawnBarrel = useCallback(() => {
    const { w } = canvasSizeRef.current;
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const b = barrelPoolRef.current.acquire();
    b.x = getLaneX(lane); b.y = -15; b.vy = 0.8 + Math.random() * 0.4;
    b.hp = 50; b.id = ++barrelIdCounter;
  }, []);

  const activateNuclear = () => {
    if (!nuclearReady || gameOverRef.current) return;
    nuclearActiveRef.current = true;
    nuclearTimerRef.current = 180;
    nuclearChargeRef.current = 0;
    setNuclearReady(false);
    const { w, h } = canvasSizeRef.current;
    addFloatText('¡NUKE!', w / 2, h / 2, '#fbbf24');
    playExplosion();
    whiteFlashRef.current = 1;
    for (const z of zombiePoolRef.current.getActive()) {
      spawnParticles2D(particlesRef.current, z.x, z.y, 12, '#fbbf24', 6);
      zombiePoolRef.current.release(z);
      scoreRef.current += 50 * scoreMultRef.current;
      killCountRef.current++;
    }
    setScore(Math.floor(scoreRef.current)); setZombiesKilled(killCountRef.current);
  };

  useEffect(() => { weaponRef.current = weapon; }, [weapon]);

  useEffect(() => {
    if (gameOver && !interstitialCheckedRef.current) {
      interstitialCheckedRef.current = true;
      endGameBatch();
      submitZombieScore(killCountRef.current);
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

      scrollYRef.current += dt * 1.5;

      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#1a1505');
      grad.addColorStop(0.4, '#2a2010');
      grad.addColorStop(0.7, '#1a1510');
      grad.addColorStop(1, '#0a0805');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = 'rgba(80,60,30,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < LANE_COUNT; i++) {
        const lx = (w / LANE_COUNT) * i;
        ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, barricadeY); ctx.stroke();
      }
      ctx.beginPath(); ctx.moveTo(0, barricadeY); ctx.lineTo(w, barricadeY); ctx.stroke();

      ctx.fillStyle = '#2a2520';
      for (let i = 0; i < w; i += 6) {
        const dashY = ((i * 2 + scrollYRef.current) % 40);
        if (dashY < barricadeY) { ctx.fillRect(w / 2 - 2 + Math.sin(i * 0.1) * 1, dashY, 4, 20); }
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
        shoot();

        difficultyRef.current = 1 + scoreRef.current / 500;

        if (!bossRef.current) {
          spawnTimerRef.current += dt;
          const interval = Math.max(12, 30 - difficultyRef.current * 2.5);
          if (spawnTimerRef.current > interval) { spawnZombie(); spawnTimerRef.current = 0; }
          if (scoreRef.current >= miniBossThresholdRef.current) {
            for (let i = 0; i < 2; i++) {
              spawnZombie();
              const active = zombiePoolRef.current.getActive();
              const last = active[active.length - 1];
              if (last) { last.type = 'giant'; last.hp = 200; last.maxHp = 200; last.size = 26; last.color = '#a855f7'; last.vy *= 0.6; }
            }
            miniBossThresholdRef.current += 500;
            addFloatText('¡Mutantes!', w / 2, h / 3, '#a855f7');
          }
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current) spawnBoss();
        }

        barrelTimerRef.current += dt;
        if (barrelTimerRef.current > 200) { spawnBarrel(); barrelTimerRef.current = 0; }

        for (const z of zombiePoolRef.current.getActive()) {
          z.y += z.vy * dt;
          z.walkCycle += dt * 0.3;
          if (z.hitFlash > 0) z.hitFlash = Math.max(0, z.hitFlash - dt * 0.1);

          if (z.y > barricadeY - z.size) {
            const dmg = z.type === 'giant' ? 25 : z.type === 'fast' ? 12 : 15;
            barricadeHpRef.current -= dmg; setBarricadeHp(Math.max(0, barricadeHpRef.current));
            playHit();
            addFloatText(`-${dmg}`, z.x, barricadeY - 20, '#ef4444');
            spawnParticles2D(particlesRef.current, z.x, barricadeY, 8, '#ef4444', 4);
            if (z === bossRef.current) { bossRef.current = null; setBossActive(false); }
            zombiePoolRef.current.release(z);
            if (barricadeHpRef.current <= 0) {
              livesRef.current--; setLives(livesRef.current);
              if (livesRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
              else {
                barricadeHpRef.current = barricadeMaxHpRef.current; setBarricadeHp(barricadeMaxHpRef.current);
                addFloatText('¡Barricada reparada!', w / 2, h / 2, '#34d399');
              }
            }
          }
        }

        for (const b of barrelPoolRef.current.getActive()) {
          b.y += b.vy * dt;
          if (b.y > barricadeY - 10) { barrelPoolRef.current.release(b); }
        }

        for (const b of bulletPoolRef.current.getActive()) {
          b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
          if (b.life <= 0 || b.y < -10) { bulletPoolRef.current.release(b); continue; }

          let hit = false;
          for (const z of zombiePoolRef.current.getActive()) {
            if (dist(b.x, b.y, z.x, z.y) < z.size + 6) {
              z.hp -= b.damage; z.hitFlash = 1; hit = true;
              spawnParticles2D(particlesRef.current, b.x, b.y, fpsMon.scaleParticleCount(4), b.color, 3);
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
                  safeAddCoins(2); playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(25), bloodColor, 6);
                } else if (z.type === 'fast') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 150 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(12), bloodColor, 5);
                } else {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 100 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  if (killCountRef.current % 5 === 0) { safeAddCoins(1); playCoin(); }
                  spawnParticles2D(particlesRef.current, z.x, z.y, fpsMon.scaleParticleCount(10), bloodColor, 4);
                }
                if (bloodEnabledRef.current) {
                  bloodSplatsRef.current.push({ x: z.x, y: z.y, size: z.size * 0.8, alpha: 0.5 });
                }
              }
              break;
            }
          }
          if (!hit) for (const br of barrelPoolRef.current.getActive()) {
            if (dist(b.x, b.y, br.x, br.y) < 20) {
              br.hp -= b.damage; hit = true;
              spawnParticles2D(particlesRef.current, b.x, b.y, 5, '#fbbf24', 3);
              if (br.hp <= 0) {
                barrelPoolRef.current.release(br);
                const r = Math.random();
                if (r < 0.4) {
                  const newW: WeaponType = Math.random() < 0.5 ? 'rifle' : 'shotgun';
                  setWeapon(newW); weaponRef.current = newW;
                  addFloatText(newW.toUpperCase(), br.x, br.y - 20, '#22d3ee');
                } else if (r < 0.7) {
                  safeAddCoins(2); playCoin();
                  addFloatText('+2 monedas', br.x, br.y - 20, '#fbbf24');
                } else {
                  scoreRef.current += 200 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  addFloatText('+200 pts', br.x, br.y - 20, '#34d399');
                }
                playPickup();
                spawnParticles2D(particlesRef.current, br.x, br.y, 15, '#fbbf24', 5);
              }
              break;
            }
          }
          if (hit) bulletPoolRef.current.release(b);
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
        const bobY = Math.sin(z.walkCycle) * 2;
        ctx.fillStyle = z.color;
        ctx.beginPath(); ctx.arc(0, bobY, z.size, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a2a0a';
        ctx.fillRect(-z.size * 0.35, bobY - z.size * 0.25, z.size * 0.2, z.size * 0.15);
        ctx.fillRect(z.size * 0.15, bobY - z.size * 0.25, z.size * 0.2, z.size * 0.15);
        ctx.strokeStyle = '#3a5a1a';
        ctx.lineWidth = Math.max(1, z.size * 0.08);
        ctx.beginPath();
        ctx.moveTo(-z.size * 0.5, bobY + z.size * 0.3);
        ctx.lineTo(-z.size * 0.3, bobY + z.size * 0.7);
        ctx.moveTo(z.size * 0.5, bobY + z.size * 0.3);
        ctx.lineTo(z.size * 0.3, bobY + z.size * 0.7);
        ctx.stroke();
        if (z.type === 'giant') {
          ctx.fillStyle = '#4a3a1a';
          ctx.fillRect(-z.size * 0.6, bobY - z.size * 0.8, z.size * 1.2, z.size * 0.3);
        }
        if (z.hitFlash > 0) {
          ctx.globalAlpha = z.hitFlash * 0.6;
          ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(0, bobY, z.size + 4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();

        if (z.hp < z.maxHp) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(z.x - z.size, z.y - z.size - 8, z.size * 2, 3);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(z.x - z.size, z.y - z.size - 8, z.size * 2 * (z.hp / z.maxHp), 3);
        }
      }

      for (const br of barrelPoolRef.current.getActive()) {
        ctx.save();
        ctx.translate(br.x, br.y);
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(-14, -16, 28, 32);
        ctx.fillStyle = '#a0522d';
        ctx.fillRect(-14, -16, 28, 4);
        ctx.fillRect(-14, 12, 28, 4);
        ctx.fillStyle = '#654321';
        ctx.fillRect(-12, -8, 24, 2);
        ctx.fillRect(-12, 4, 24, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${br.id}`, 0, 2);
        ctx.restore();
      }

      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(0, barricadeY, w, 8);
      ctx.fillStyle = '#2a1a0a';
      for (let i = 0; i < w; i += 12) { ctx.fillRect(i, barricadeY, 6, 8); }
      ctx.strokeStyle = '#5a4a2a';
      ctx.lineWidth = 2;
      for (let i = 0; i < w; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, barricadeY - 5);
        for (let j = 0; j < 30; j += 5) { ctx.lineTo(i + j, barricadeY - 5 + (j % 10 === 0 ? -4 : 0)); }
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(w / 2, turretY);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(-25, -10, 50, 20);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-20, -8, 40, 16);
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(-8, -25, 16, 20);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(-6, -28, 12, 6);
      if (shootCooldownRef.current < 2) {
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fillRect(-2, -32, 4, 8);
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GARRDASH', 0, 5);
      ctx.restore();

      ctx.save();
      ctx.translate(w / 2 - 40, turretY);
      ctx.fillStyle = '#3a3a2a';
      ctx.beginPath(); ctx.arc(0, -5, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d4a574';
      ctx.beginPath(); ctx.arc(0, -12, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8b6b3a';
      ctx.fillRect(-10, -14, 20, 4);
      ctx.fillStyle = '#5a4a2a';
      ctx.fillRect(-6, -10, 4, 8);
      ctx.restore();

      ctx.save();
      ctx.translate(w / 2 + 40, turretY);
      ctx.fillStyle = '#3a3a2a';
      ctx.beginPath(); ctx.arc(0, -5, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#d4a574';
      ctx.beginPath(); ctx.arc(0, -12, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#8b6b3a';
      ctx.fillRect(-10, -14, 20, 4);
      ctx.fillStyle = '#5a4a2a';
      ctx.fillRect(2, -10, 4, 8);
      ctx.restore();

      for (const b of bulletPoolRef.current.getActive()) {
        ctx.save();
        ctx.strokeStyle = b.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.lineTo(b.x, b.y + 12);
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      updateParticles2D(particlesRef.current, dt);
      drawParticles2D(ctx, particlesRef.current);

      if (whiteFlashRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = whiteFlashRef.current;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        whiteFlashRef.current = Math.max(0, whiteFlashRef.current - dt * 0.05);
      }

      if (nuclearActiveRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.1 + Math.sin(now * 0.02) * 0.05;
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shoot, spawnZombie, spawnBoss, spawnBarrel, addPlayTime, isOnline, safeAddCoins, vip]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchStart = (e: TouchEvent) => { initAudio(); if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, active: true }; } };
    const onTouchMove = (e: TouchEvent) => { if (e.touches.length > 0) { const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top, active: true }; } };
    const onTouchEnd = () => { touchTargetRef.current.active = false; };
    const onMouseDown = (e: MouseEvent) => { initAudio(); const rect = canvas.getBoundingClientRect(); touchTargetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, active: true }; };
    const onMouseUp = () => { touchTargetRef.current.active = false; };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const weaponIcons: Record<WeaponType, typeof Zap> = { pistol: Zap, rifle: Zap, shotgun: Bomb };
  const WeaponIcon = weaponIcons[weapon];

  return (
    <div className="absolute inset-0 bg-black flex flex-col">
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
        <div className="w-12 h-12 rounded-xl bg-black/50 backdrop-blur border border-cyan-400/30 flex items-center justify-center text-cyan-400"><WeaponIcon className="w-5 h-5" /></div>
      </div>
      {floatTexts.map((ft) => <div key={ft.id} className="absolute z-20 font-bold text-sm animate-float-up pointer-events-none" style={{ left: ft.x, top: ft.y, transform: 'translate(-50%, -50%)', color: ft.color }}>{ft.text}</div>)}
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
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-black/50 text-white/50 border border-white/10">AUTO-DISPARO · TOCA PARA APUNTAR</span>
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
          addFloatText('¡REVIVIDO!', w / 2, h / 2, '#34d399');
        }}
        title="Revivir"
        rewardText="¡Has revivido! Barricada reparada, vidas restauradas y 3 monedas extra."
      />
      <MuteButton />
    </div>
  );
}
