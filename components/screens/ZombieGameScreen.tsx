'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { Joystick } from '@/components/game/Joystick';
import { RewardAdModal } from '@/components/game/RewardAdModal';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Heart, Coins, Crosshair, Target, Zap, Bomb, Video } from 'lucide-react';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import {
  type Particle2D,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  drawCrosshair2D,
  drawIsoGround, drawIsoSoldier, drawIsoZombie,
  drawWeaponPickup2D, drawMedKit2D,
  drawFlashlight,
  clamp, dist, rand,
} from '@/lib/engine2d';
import { playShoot, playShotgun, playExplosion, playBossAlert, playCoin, playHit, playPickup, initAudio } from '@/lib/audio';
import { MAX_COINS_PER_GAME } from '@/lib/security';

type WeaponType = 'pistol' | 'rifle' | 'shotgun' | 'grenade';

type ZombieType = 'normal' | 'fast' | 'giant';

interface Zombie { x: number; y: number; vx: number; vy: number; angle: number; walkCycle: number; hp: number; maxHp: number; size: number; color: string; type: ZombieType; hitFlash: number; }
interface MedKit { x: number; y: number; }
interface WeaponPickup { x: number; y: number; weapon: WeaponType; }
interface Bullet { x: number; y: number; vx: number; vy: number; life: number; damage: number; color: string; }

export function ZombieGameScreen() {
  const { setScreen, addCoins, getZombieCharacter, lives, setLives, upgrades, submitZombieScore, isOnline, bloodEnabled, canShowInterstitial, recordInterstitial, vip, reportSuspiciousActivity } = useGame();
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
  const [showInterstitial, setShowInterstitial] = useState(false);

  const playerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, angle: 0, walkCycle: 0, muzzleFlash: 0 });
  const zombiesRef = useRef<Zombie[]>([]);
  const medkitsRef = useRef<MedKit[]>([]);
  const weaponPickupsRef = useRef<WeaponPickup[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle2D[]>([]);
  const moveRef = useRef({ dx: 0, dy: 0 });
  const crosshairRef = useRef({ x: 0, y: 0, active: false });
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
  const tankRef = useRef<Zombie | null>(null);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const scrollYRef = useRef(0);
  const bloodEnabledRef = useRef(true);
  const isFiringRef = useRef(false);
  const whiteFlashRef = useRef(0);
  const gameCoinsRef = useRef(0);
  const interstitialCheckedRef = useRef(false);

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

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    const { w, h } = canvasSizeRef.current;
    playerRef.current = { x: w / 2, y: h * 0.65, vx: 0, vy: 0, angle: -Math.PI / 2, walkCycle: 0, muzzleFlash: 0 };
    zombiesRef.current = []; medkitsRef.current = []; weaponPickupsRef.current = [];
    bulletsRef.current = []; particlesRef.current = []; tankRef.current = null;
    scoreRef.current = 0; killCountRef.current = 0;
    hpRef.current = char.maxHp; maxHpRef.current = char.maxHp;
    livesRef.current = 3;
    shieldRef.current = char.shieldFirstHit || upgrades.superShield > 0;
    gameOverRef.current = false; weaponRef.current = 'pistol'; setWeapon('pistol');
    spawnTimerRef.current = 0; weaponPickupTimerRef.current = 0; medkitTimerRef.current = 0;
    difficultyRef.current = 1; miniBossThresholdRef.current = 500; finalBossThresholdRef.current = 1500;
    finalBossDefeatedRef.current = false; scrollYRef.current = 0;
    whiteFlashRef.current = 0; gameCoinsRef.current = 0; interstitialCheckedRef.current = false;
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

  const handleMove = useCallback((dx: number, dy: number) => { moveRef.current = { dx, dy }; }, []);

  const addFloatText = (text: string, x: number, y: number, color = '#fbbf24') => {
    const id = Date.now() + Math.random();
    setFloatTexts((prev) => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setFloatTexts((prev) => prev.filter((f) => f.id !== id)), 1000);
  };

  const getFireRate = () => Math.max(6, 18 - fireRateLevelRef.current * 2);
  const getDamage = () => (40 + damageLevelRef.current * 15) * damageMultRef.current;

  const safeAddCoins = (amount: number) => {
    if (gameCoinsRef.current + amount > MAX_COINS_PER_GAME) {
      reportSuspiciousActivity('coin_cap_exceeded', `Attempted to add ${amount} coins, total would be ${gameCoinsRef.current + amount} (max ${MAX_COINS_PER_GAME})`);
      return;
    }
    addCoins(amount);
    gameCoinsRef.current += amount;
    setCoinsEarned(gameCoinsRef.current);
  };

  const shoot = useCallback(() => {
    if (gameOverRef.current || shootCooldownRef.current > 0) return;
    initAudio();
    const p = playerRef.current;
    const aimAngle = crosshairRef.current.active
      ? Math.atan2(crosshairRef.current.y - p.y, crosshairRef.current.x - p.x)
      : p.angle;
    p.angle = aimAngle;
    p.muzzleFlash = 1;
    const speed = 10;

    if (weaponRef.current === 'pistol') {
      bulletsRef.current.push({ x: p.x + Math.cos(aimAngle) * 30, y: p.y + Math.sin(aimAngle) * 30, vx: Math.cos(aimAngle) * speed, vy: Math.sin(aimAngle) * speed, life: 50, damage: getDamage(), color: '#fbbf24' });
      shootCooldownRef.current = getFireRate(); playShoot();
    } else if (weaponRef.current === 'rifle') {
      bulletsRef.current.push({ x: p.x + Math.cos(aimAngle) * 30, y: p.y + Math.sin(aimAngle) * 30, vx: Math.cos(aimAngle) * 14, vy: Math.sin(aimAngle) * 14, life: 50, damage: getDamage() * 0.7, color: '#22d3ee' });
      shootCooldownRef.current = Math.max(4, getFireRate() - 8); playShoot();
    } else if (weaponRef.current === 'shotgun') {
      for (let i = -1; i <= 1; i++) {
        const sa = aimAngle + i * 0.2;
        bulletsRef.current.push({ x: p.x + Math.cos(sa) * 30, y: p.y + Math.sin(sa) * 30, vx: Math.cos(sa) * 9, vy: Math.sin(sa) * 9, life: 45, damage: getDamage() * 0.8 * shotgunDmgMultRef.current, color: '#f87171' });
      }
      shootCooldownRef.current = getFireRate() + 8; playShotgun();
    } else if (weaponRef.current === 'grenade') {
      bulletsRef.current.push({ x: p.x + Math.cos(aimAngle) * 30, y: p.y + Math.sin(aimAngle) * 30, vx: Math.cos(aimAngle) * 6, vy: Math.sin(aimAngle) * 6, life: 60, damage: getDamage() * 3, color: '#fb923c' });
      shootCooldownRef.current = getFireRate() + 20; playExplosion();
    }
  }, []);

  const spawnZombie = useCallback((side?: number) => {
    const { w } = canvasSizeRef.current;
    const r = Math.random();
    let type: ZombieType = 'normal';
    if (difficultyRef.current > 1.5 && r < 0.15) type = 'fast';
    else if (difficultyRef.current > 2 && r < 0.25) type = 'giant';

    let hp: number, size: number, color: string, speed: number;
    if (type === 'fast') {
      hp = 50; size = 13; color = '#ef4444'; speed = 3.5;
    } else if (type === 'giant') {
      hp = 300; size = 30; color = '#7c3aed'; speed = 1.2;
    } else {
      hp = 100; size = 16; color = '#65a30d'; speed = 1.8;
    }

    const x = rand(40, w - 40);
    const y = -20 - Math.random() * 40;
    zombiesRef.current.push({
      x, y, vx: 0, vy: 0, angle: Math.PI / 2, walkCycle: Math.random() * 10,
      hp, maxHp: hp, size, color, type, hitFlash: 0,
    });
  }, []);

  const spawnTank = useCallback(() => {
    const { w } = canvasSizeRef.current;
    const hp = 2000;
    const tank: Zombie = {
      x: w / 2, y: -50, vx: 0, vy: 0, angle: Math.PI / 2, walkCycle: 0,
      hp, maxHp: hp, size: 40, color: '#dc2626', type: 'giant', hitFlash: 0,
    };
    tankRef.current = tank;
    zombiesRef.current.push(tank);
    setBossActive(true); setBossHp(hp); setBossMaxHp(hp);
    playBossAlert();
    addFloatText('¡TANK!', w / 2, canvasSizeRef.current.h / 3, '#dc2626');
  }, []);

  const spawnWeaponPickup = useCallback(() => {
    const { w, h } = canvasSizeRef.current;
    const weapons: WeaponType[] = ['rifle', 'shotgun', 'grenade'];
    weaponPickupsRef.current.push({ x: rand(50, w - 50), y: rand(h * 0.3, h - 80), weapon: weapons[Math.floor(Math.random() * 3)] });
  }, []);

  const spawnMedKit = useCallback(() => {
    const { w, h } = canvasSizeRef.current;
    medkitsRef.current.push({ x: rand(50, w - 50), y: rand(h * 0.3, h - 80) });
  }, []);

  useEffect(() => { weaponRef.current = weapon; }, [weapon]);

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

      scrollYRef.current += dt * 0.5;
      drawIsoGround(ctx, w, h, scrollYRef.current);

      if (!gameOverRef.current) {
        const p = playerRef.current;
        p.vx = moveRef.current.dx * 4 * speedMultRef.current;
        p.vy = moveRef.current.dy * 4 * speedMultRef.current;
        p.x = clamp(p.x + p.vx * dt, 30, w - 30);
        p.y = clamp(p.y + p.vy * dt, h * 0.35, h - 40);
        if (Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1) {
          if (!crosshairRef.current.active) p.angle = Math.atan2(p.vy, p.vx);
          p.walkCycle += dt * 0.3;
        }
        if (p.muzzleFlash > 0) p.muzzleFlash = Math.max(0, p.muzzleFlash - dt * 0.15);
        if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;

        // Auto-fire on hold
        if (isFiringRef.current && shootCooldownRef.current <= 0) {
          shoot();
        }

        difficultyRef.current = 1 + scoreRef.current / 500;

        if (!tankRef.current) {
          spawnTimerRef.current += dt;
          const interval = Math.max(15, 35 - difficultyRef.current * 3);
          if (spawnTimerRef.current > interval) { spawnZombie(); spawnTimerRef.current = 0; }
          if (scoreRef.current >= miniBossThresholdRef.current) {
            for (let i = 0; i < 2; i++) {
              spawnZombie();
              const last = zombiesRef.current[zombiesRef.current.length - 1];
              last.type = 'giant'; last.hp = 200; last.maxHp = 200; last.size = 26; last.color = '#a855f7';
            }
            miniBossThresholdRef.current += 500;
            addFloatText('¡Mutantes!', w / 2, h / 3, '#a855f7');
          }
          if (scoreRef.current >= finalBossThresholdRef.current && !finalBossDefeatedRef.current) spawnTank();
        }

        weaponPickupTimerRef.current += dt;
        if (weaponPickupTimerRef.current > 300) { spawnWeaponPickup(); weaponPickupTimerRef.current = 0; }
        medkitTimerRef.current += dt;
        if (medkitTimerRef.current > 250) { spawnMedKit(); medkitTimerRef.current = 0; }

        // Update zombies
        for (let i = zombiesRef.current.length - 1; i >= 0; i--) {
          const z = zombiesRef.current[i];
          const dx = p.x - z.x;
          const dy = p.y - z.y;
          const d = Math.max(Math.hypot(dx, dy), 1);
          let speed: number;
          if (z.type === 'fast') speed = 3.5;
          else if (z.type === 'giant') speed = z === tankRef.current ? 2.5 : 1.2;
          else speed = 1.8 + Math.random() * 0.3;
          z.x += (dx / d) * speed * dt;
          z.y += (dy / d) * speed * dt;
          z.angle = Math.atan2(dy, dx);
          z.walkCycle += dt * 0.35;
          if (z.hitFlash > 0) z.hitFlash = Math.max(0, z.hitFlash - dt * 0.1);

          if (d < z.size + 16) {
            if (z === tankRef.current) {
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
              zombiesRef.current.splice(i, 1);
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

        // Update medkits
        for (let i = medkitsRef.current.length - 1; i >= 0; i--) {
          const m = medkitsRef.current[i];
          const d = dist(m.x, m.y, p.x, p.y);
          const range = magnetRef.current ? 80 : 40;
          if (d < range) {
            medkitsRef.current.splice(i, 1);
            hpRef.current = Math.min(maxHpRef.current, hpRef.current + 30); setHp(hpRef.current);
            playPickup(); addFloatText('+30 HP', w / 2, h / 2, '#34d399');
          }
          if (magnetRef.current && d < 120) { m.x += (p.x - m.x) * 0.05 * dt; m.y += (p.y - m.y) * 0.05 * dt; }
        }

        // Update weapon pickups
        for (let i = weaponPickupsRef.current.length - 1; i >= 0; i--) {
          const wp = weaponPickupsRef.current[i];
          if (dist(wp.x, wp.y, p.x, p.y) < 28) {
            weaponPickupsRef.current.splice(i, 1);
            setWeapon(wp.weapon); weaponRef.current = wp.weapon;
            playPickup(); addFloatText(wp.weapon.toUpperCase(), w / 2, h / 2, '#22d3ee');
          }
        }

        // Update bullets
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
          const b = bulletsRef.current[i];
          b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
          if (b.life <= 0 || b.x < 0 || b.x > w || b.y < 0 || b.y > h) { bulletsRef.current.splice(i, 1); continue; }
          for (let j = zombiesRef.current.length - 1; j >= 0; j--) {
            const z = zombiesRef.current[j];
            if (dist(b.x, b.y, z.x, z.y) < z.size + 6) {
              z.hp -= b.damage; z.hitFlash = 1; bulletsRef.current.splice(i, 1);
              spawnParticles2D(particlesRef.current, b.x, b.y, 5, b.color, 3);
              whiteFlashRef.current = Math.max(whiteFlashRef.current, 0.3);
              if (z.hp <= 0) {
                zombiesRef.current.splice(j, 1);
                const bloodColor = bloodEnabledRef.current ? z.color : '#64748b';
                if (z === tankRef.current) {
                  tankRef.current = null; setBossActive(false); finalBossDefeatedRef.current = true;
                  safeAddCoins(30);
                  scoreRef.current += 5000 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, 50, bloodColor, 8);
                  addFloatText('¡+30 monedas!', w / 2, h / 3, '#fbbf24');
                  finalBossThresholdRef.current += 3000;
                } else if (z.type === 'giant') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 500 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  safeAddCoins(10);
                  playExplosion(); playCoin();
                  spawnParticles2D(particlesRef.current, z.x, z.y, 25, bloodColor, 6);
                  addFloatText('+10 pts', z.x, z.y - 20, '#a855f7');
                } else if (z.type === 'fast') {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 150 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  safeAddCoins(2);
                  playExplosion();
                  spawnParticles2D(particlesRef.current, z.x, z.y, 12, bloodColor, 5);
                  addFloatText('+10 pts', z.x, z.y - 15, '#ef4444');
                } else {
                  killCountRef.current++; setZombiesKilled(killCountRef.current);
                  scoreRef.current += 100 * scoreMultRef.current; setScore(Math.floor(scoreRef.current));
                  if (killCountRef.current % 3 === 0) { safeAddCoins(1); playCoin(); }
                  spawnParticles2D(particlesRef.current, z.x, z.y, 10, bloodColor, 4);
                  addFloatText('+10 pts', z.x, z.y - 15, '#65a30d');
                }
              }
              break;
            }
          }
        }

        for (const m of medkitsRef.current) drawMedKit2D(ctx, m.x, m.y, now);
        for (const wp of weaponPickupsRef.current) drawWeaponPickup2D(ctx, wp.x, wp.y, wp.weapon, now);

        const sortedZ = [...zombiesRef.current].sort((a, b) => a.y - b.y);
        for (const z of sortedZ) {
          drawIsoZombie(ctx, z.x, z.y, z.angle, z.walkCycle, z.size, z.color, z.type === 'giant', z === tankRef.current);
          // White flash overlay on hit
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

        for (const b of bulletsRef.current) {
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

        // Flashlight effect
        drawFlashlight(ctx, p.x, p.y, w, h, char.color);
      }

      updateParticles2D(particlesRef.current, dt);
      drawParticles2D(ctx, particlesRef.current);

      // White flash overlay
      if (whiteFlashRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = whiteFlashRef.current;
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
        whiteFlashRef.current = Math.max(0, whiteFlashRef.current - dt * 0.08);
      }

      if (crosshairRef.current.active && !gameOverRef.current) {
        drawCrosshair2D(ctx, crosshairRef.current.x, crosshairRef.current.y, char.color, 24);
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [addCoins, setLives, char, submitZombieScore, weapon, shoot, spawnZombie, spawnTank, spawnWeaponPickup, spawnMedKit]);

  // Crosshair input — right side aims, hold to auto-fire
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
    const onTouchStart = (e: TouchEvent) => {
      initAudio();
      isFiringRef.current = true;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const rect = canvas.getBoundingClientRect();
        if (t.clientX - rect.left > rect.width * 0.35) { update(t.clientX, t.clientY); break; }
      }
    };
    const onTouchEnd = () => { isFiringRef.current = false; };
    const onMouse = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onMouseDown = (e: MouseEvent) => { initAudio(); isFiringRef.current = true; update(e.clientX, e.clientY); };
    const onMouseUp = () => { isFiringRef.current = false; };
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouch, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchend', onTouchEnd);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('mousedown', onMouseDown);
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
          <p className="text-center text-red-400 text-xs font-bold mb-1 animate-pulse">TANK</p>
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
          <div className="absolute bottom-20 left-4 z-10"><Joystick onMove={handleMove} size={120} /></div>
          <div className="absolute bottom-28 right-6 z-10 flex flex-col items-center gap-1 pointer-events-none">
            <div className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center backdrop-blur" style={{ borderColor: `${char.color}66` }}>
              <Crosshair className="w-6 h-6" style={{ color: char.color }} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/50" style={{ color: char.color }}>MANTENER PARA DISPARAR</span>
          </div>
        </>
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
      <RewardAdModal open={showReviveReward} onClose={() => setShowReviveReward(false)} onReward={() => { livesRef.current = 3; hpRef.current = maxHpRef.current; shieldRef.current = true; setLives(3); setHp(maxHpRef.current); gameOverRef.current = false; setGameOver(false); safeAddCoins(10); }} title="Revivir" rewardText="¡Has revivido con vida completa, escudo y 10 monedas extra!" />
      <MuteButton />
    </div>
  );
}
