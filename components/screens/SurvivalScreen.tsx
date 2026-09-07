'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { OfflineBanner } from '@/components/game/OfflineBanner';
import { ArrowLeft, Skull, Clock, Coins, Trophy } from 'lucide-react';
import {
  type Particle2D, type MuzzleFlash,
  spawnParticles2D, updateParticles2D, drawParticles2D,
  spawnMuzzleFlash, updateMuzzleFlashes, drawMuzzleFlashes,
  drawNeonCircle,
  drawSoldier2D, drawZombie2D, drawTacticalArena, drawArenaTower, drawArenaCastle,
  getArenaLaneX, getArenaLaneBounds, getArenaTheme, type ArenaTheme,
  ScreenShake, hapticFeedback, hapticPattern,
  clamp, dist, rand, lerp,
} from '@/lib/engine2d';
import { ObjectPool, FPSMonitor } from '@/lib/game-performance';
import { playShoot, playExplosion, playCoin, playHit, playBarrelHit, playPickup, initAudio } from '@/lib/audio';

type ZombieType = 'normal' | 'fast' | 'tank';

interface Zombie { x: number; y: number; vy: number; vx: number; walkCycle: number; hp: number; maxHp: number; size: number; color: string; type: ZombieType; hitFlash: number; active: boolean; reset(): void; }
interface Bullet { x: number; y: number; vx: number; vy: number; life: number; damage: number; color: string; active: boolean; reset(): void; }
interface SupplyCrate { x: number; y: number; vy: number; hp: number; maxHp: number; coins: number; active: boolean; reset(): void; }
interface FloatingCoin { x: number; y: number; vx: number; vy: number; life: number; active: boolean; reset(): void; }

function makeZombie(): Zombie { return { x: 0, y: 0, vy: 0, vx: 0, walkCycle: 0, hp: 100, maxHp: 100, size: 22, color: '#65a30d', type: 'normal', hitFlash: 0, active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.vx = 0; this.walkCycle = 0; this.hp = 100; this.maxHp = 100; this.size = 22; this.color = '#65a30d'; this.type = 'normal'; this.hitFlash = 0; } }; }
function makeBullet(): Bullet { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, damage: 0, color: '', active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; this.damage = 0; this.color = ''; } }; }
function makeCrate(): SupplyCrate { return { x: 0, y: 0, vy: 0, hp: 30, maxHp: 30, coins: 2, active: false, reset() { this.x = 0; this.y = 0; this.vy = 0; this.hp = 30; this.maxHp = 30; this.coins = 2; } }; }
function makeFloatingCoin(): FloatingCoin { return { x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false, reset() { this.x = 0; this.y = 0; this.vx = 0; this.vy = 0; this.life = 0; } }; }

const LANE_COUNT = 2;
const BARRICADE_Y_RATIO = 0.82;
const TURRET_Y_RATIO = 0.88;
const SPRITE_SCALE = 1.9;
const TOWER_MAX_HP = 350;
const CASTLE_MAX_HP = 500;

export function SurvivalScreen() {
  const { setScreen, addCoins, getZombieCharacter, submitSurvivalScore, survivalBestTime, isOnline, startGameBatch, endGameBatch } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [survivalTime, setSurvivalTime] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [barricadeHp, setBarricadeHp] = useState(100);
  const [leftTowerHp, setLeftTowerHp] = useState(TOWER_MAX_HP);
  const [rightTowerHp, setRightTowerHp] = useState(TOWER_MAX_HP);
  const [castleHp, setCastleHp] = useState(CASTLE_MAX_HP);

  const zombiePoolRef = useRef<ObjectPool<Zombie>>(new ObjectPool(makeZombie, 40));
  const bulletPoolRef = useRef<ObjectPool<Bullet>>(new ObjectPool(makeBullet, 100));
  const cratePoolRef = useRef<ObjectPool<SupplyCrate>>(new ObjectPool(makeCrate, 10));
  const coinPoolRef = useRef<ObjectPool<FloatingCoin>>(new ObjectPool(makeFloatingCoin, 40));
  const particlesRef = useRef<Particle2D[]>([]);
  const muzzleFlashesRef = useRef<MuzzleFlash[]>([]);
  const screenShakeRef = useRef(new ScreenShake());
  const touchTargetRef = useRef<{ x: number; active: boolean }>({ x: 0, active: false });
  const turretXRef = useRef(0);
  const survivalTimeRef = useRef(0);
  const survivalCoinTimerRef = useRef(0);
  const coinsEarnedRef = useRef(0);
  const zombieKillsRef = useRef(0);
  const barricadeHpRef = useRef(100);
  const leftTowerHpRef = useRef(TOWER_MAX_HP);
  const rightTowerHpRef = useRef(TOWER_MAX_HP);
  const castleHpRef = useRef(CASTLE_MAX_HP);
  const gameOverRef = useRef(false);
  const shootCooldownRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const crateTimerRef = useRef(0);
  const difficultyRef = useRef(1);
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const scrollYRef = useRef(0);
  const arenaThemeRef = useRef<ArenaTheme>(getArenaTheme(1));
  const fpsMonitorRef = useRef<FPSMonitor>(new FPSMonitor());
  const startTimeRef = useRef(0);

  const char = getZombieCharacter();

  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvasSizeRef.current = { w: canvas.width, h: canvas.height };
    turretXRef.current = canvas.width / 2;
    zombiePoolRef.current.releaseAll();
    bulletPoolRef.current.releaseAll();
    cratePoolRef.current.releaseAll();
    coinPoolRef.current.releaseAll();
    particlesRef.current = [];
    muzzleFlashesRef.current = [];
    survivalTimeRef.current = 0; coinsEarnedRef.current = 0; zombieKillsRef.current = 0;
    barricadeHpRef.current = 100;
    leftTowerHpRef.current = TOWER_MAX_HP;
    rightTowerHpRef.current = TOWER_MAX_HP;
    castleHpRef.current = CASTLE_MAX_HP;
    gameOverRef.current = false;
    spawnTimerRef.current = 0; crateTimerRef.current = 0;
    difficultyRef.current = 1;
    setSurvivalTime(0); setCoinsEarned(0); setBarricadeHp(100); setLeftTowerHp(TOWER_MAX_HP); setRightTowerHp(TOWER_MAX_HP); setCastleHp(CASTLE_MAX_HP); setGameOver(false);
    startTimeRef.current = performance.now();
    startGameBatch();
  }, [startGameBatch]);

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
    const b = bulletPoolRef.current.acquire();
    b.x = tx; b.y = turretY - 30;
    b.vx = 0; b.vy = -12;
    b.life = 80; b.damage = 30 + 12; b.color = '#fbbf24';
    shootCooldownRef.current = 8;
    spawnMuzzleFlash(muzzleFlashesRef.current, tx, turretY - 30, -Math.PI / 2, '#fbbf24', 22 * SPRITE_SCALE);
    playShoot();
  }, []);

  const spawnZombie = useCallback(() => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const r = Math.random();
    let type: ZombieType = 'normal';
    if (difficultyRef.current > 1.5 && r < 0.15) type = 'fast';
    else if (difficultyRef.current > 2 && r < 0.22) type = 'tank';

    let zHp: number, size: number, color: string, vy: number;
    if (type === 'fast') { zHp = 50; size = 14 * SPRITE_SCALE; color = '#84cc16'; vy = 1.8 + difficultyRef.current * 0.2; }
    else if (type === 'tank') { zHp = 300; size = 26 * SPRITE_SCALE; color = '#4d7c0f'; vy = 0.8 + difficultyRef.current * 0.1; }
    else { zHp = 100; size = 18 * SPRITE_SCALE; color = '#65a30d'; vy = 1.2 + difficultyRef.current * 0.15; }

    const { w: sw } = canvasSizeRef.current;
    const z = zombiePoolRef.current.acquire();
    z.x = sw / 2; z.y = -30;
    z.vx = lane === 0 ? -1.5 : 1.5;
    z.vy = vy * char.speedMult; z.walkCycle = Math.random() * 10;
    z.hp = zHp; z.maxHp = zHp; z.size = size; z.color = color; z.type = type; z.hitFlash = 0;
  }, [char]);

  const spawnCrate = useCallback(() => {
    const lane = Math.floor(Math.random() * LANE_COUNT);
    const c = cratePoolRef.current.acquire();
    c.x = getLaneX(lane); c.y = -20; c.vy = 0.8 + Math.random() * 0.4;
    c.hp = 30; c.maxHp = 30;
    c.coins = 1;
  }, []);

  useEffect(() => {
    if (gameOver) {
      endGameBatch();
      submitSurvivalScore(survivalTimeRef.current);
      hapticPattern([100, 50, 200]);
    }
  }, [gameOver, endGameBatch, submitSurvivalScore]);

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

      screenShakeRef.current.update(dt);
      const shake = screenShakeRef.current.getOffset();
      scrollYRef.current += dt * 1.5;

      if (!gameOverRef.current) {
        survivalTimeRef.current += dt * 16.67;
        setSurvivalTime(Math.floor(survivalTimeRef.current / 1000));
        difficultyRef.current = 1 + survivalTimeRef.current / 30000;

        if (shootCooldownRef.current > 0) shootCooldownRef.current -= dt;

        if (touchTargetRef.current.active) {
          turretXRef.current = lerp(turretXRef.current, clamp(touchTargetRef.current.x, 30, w - 30), 0.25 * dt);
        }
        turretXRef.current = clamp(turretXRef.current, 30, w - 30);

        shoot();

        // Simultaneous zombie + crate spawning - no dead time
        spawnTimerRef.current += dt;
        const interval = Math.max(6, 25 - difficultyRef.current * 2);
        if (spawnTimerRef.current > interval) {
          spawnZombie();
          spawnTimerRef.current = 0;
        }
        // Crates spawn alongside zombies - integrated
        crateTimerRef.current += dt;
        if (crateTimerRef.current > 150) {
          spawnCrate();
          crateTimerRef.current = 0;
        }

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
            const dmg = z.type === 'tank' ? 25 : z.type === 'fast' ? 12 : 15;
            // Determine which structure to damage based on x position
            const { w } = canvasSizeRef.current;
            const leftTowerX = w * 0.15;
            const rightTowerX = w * 0.85;
            const castleX = w * 0.5;
            const towerRange = w * 0.18;
            const castleRange = w * 0.15;

            if (Math.abs(z.x - leftTowerX) < towerRange && leftTowerHpRef.current > 0) {
              leftTowerHpRef.current = Math.max(0, leftTowerHpRef.current - dmg);
              setLeftTowerHp(leftTowerHpRef.current);
              playHit();
              screenShakeRef.current.trigger(3, 10);
              zombiePoolRef.current.release(z);
            } else if (Math.abs(z.x - rightTowerX) < towerRange && rightTowerHpRef.current > 0) {
              rightTowerHpRef.current = Math.max(0, rightTowerHpRef.current - dmg);
              setRightTowerHp(rightTowerHpRef.current);
              playHit();
              screenShakeRef.current.trigger(3, 10);
              zombiePoolRef.current.release(z);
            } else if (Math.abs(z.x - castleX) < castleRange) {
              castleHpRef.current = Math.max(0, castleHpRef.current - dmg);
              setCastleHp(castleHpRef.current);
              playHit();
              screenShakeRef.current.trigger(3, 10);
              zombiePoolRef.current.release(z);
              if (castleHpRef.current <= 0) { gameOverRef.current = true; setGameOver(true); }
            } else {
              // Falls through to barricade
              barricadeHpRef.current -= dmg; setBarricadeHp(Math.max(0, barricadeHpRef.current));
              playHit();
              screenShakeRef.current.trigger(3, 10);
              zombiePoolRef.current.release(z);
              if (barricadeHpRef.current <= 0 && leftTowerHpRef.current <= 0 && rightTowerHpRef.current <= 0) {
                gameOverRef.current = true; setGameOver(true);
              }
            }
          }
        }

        for (const c of cratePoolRef.current.getActive()) {
          c.y += c.vy * dt;
          if (c.y > barricadeY - 10) { cratePoolRef.current.release(c); }
        }

        for (const b of bulletPoolRef.current.getActive()) {
          b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
          if (b.life <= 0 || b.y < -10 || b.y < h * 0.28) { bulletPoolRef.current.release(b); continue; }

          let hit = false;
          for (const z of zombiePoolRef.current.getActive()) {
            if (dist(b.x, b.y, z.x, z.y) < z.size + 6) {
              z.hp -= b.damage; z.hitFlash = 1; hit = true;
              spawnParticles2D(particlesRef.current, b.x, b.y, 4, b.color, 3);
              if (z.hp <= 0) {
                zombiePoolRef.current.release(z);
                zombieKillsRef.current += 1;
                if (zombieKillsRef.current >= 4) {
                  zombieKillsRef.current = 0;
                  coinsEarnedRef.current += 1; setCoinsEarned(coinsEarnedRef.current);
                  addCoins(1);
                  playCoin();
                }
                spawnParticles2D(particlesRef.current, z.x, z.y, 10, z.color, 4);
              }
              break;
            }
          }
          if (!hit) for (const c of cratePoolRef.current.getActive()) {
            if (dist(b.x, b.y, c.x, c.y) < 22) {
              c.hp -= b.damage; hit = true;
              playBarrelHit();
              spawnParticles2D(particlesRef.current, b.x, b.y, 5, '#fbbf24', 3);
              if (c.hp <= 0) {
                cratePoolRef.current.release(c);
                const halfCoins = Math.ceil(c.coins * 0.5);
                coinsEarnedRef.current += halfCoins; setCoinsEarned(coinsEarnedRef.current);
                addCoins(halfCoins); playPickup();
                spawnParticles2D(particlesRef.current, c.x, c.y, 15, '#fbbf24', 5);
              }
              break;
            }
          }
          if (hit) bulletPoolRef.current.release(b);
        }
      }

      // Draw
      ctx.save();
      ctx.translate(shake.x, shake.y);

      // Background
      drawTacticalArena(ctx, w, h, scrollYRef.current, arenaThemeRef.current);

      // Draw towers and castle
      const leftTowerX = w * 0.15;
      const rightTowerX = w * 0.85;
      const castleX = w * 0.5;
      const structureY = h * 0.93;
      drawArenaTower(ctx, leftTowerX, structureY, leftTowerHpRef.current, TOWER_MAX_HP, 'left');
      drawArenaTower(ctx, rightTowerX, structureY, rightTowerHpRef.current, TOWER_MAX_HP, 'right');
      drawArenaCastle(ctx, castleX, structureY, castleHpRef.current, CASTLE_MAX_HP);

      // Draw zombies (aggressive military zombies via engine2d)
      for (const z of zombiePoolRef.current.getActive()) {
        const isTank = z.type === 'tank';
        const isMutant = z.type === 'fast';
        drawZombie2D(ctx, z.x, z.y, Math.PI / 2, z.walkCycle, z.size, z.color, isMutant, isTank);
        if (z.hitFlash > 0) {
          ctx.save();
          ctx.globalAlpha = z.hitFlash * 0.6; ctx.fillStyle = '#fff';
          ctx.beginPath(); ctx.arc(z.x, z.y, z.size + 4, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        if (z.hp < z.maxHp) {
          const s = z.size;
          ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(z.x - s, z.y - s - 10, s * 2, 4);
          ctx.fillStyle = '#ef4444'; ctx.fillRect(z.x - s, z.y - s - 10, s * 2 * (z.hp / z.maxHp), 4);
        }
      }

      // Draw crates
      for (const c of cratePoolRef.current.getActive()) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 22, 20, 5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8b4513'; ctx.beginPath(); ctx.roundRect(-18, -20, 36, 40, 4); ctx.fill();
        ctx.fillStyle = '#a0522d'; ctx.fillRect(-18, -20, 36, 5); ctx.fillRect(-18, 15, 36, 5);
        const pulse = 1 + Math.sin(now * 0.008) * 0.08;
        ctx.save(); ctx.scale(pulse, pulse);
        ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = '#1a1a1a';
        ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.ceil(c.hp)}`, 0, 1);
        ctx.restore();
        ctx.restore();
      }

      // Barricade (sandbag style between towers)
      ctx.fillStyle = '#2a2820'; ctx.fillRect(0, barricadeY, w, 10);
      ctx.fillStyle = '#3a3528'; for (let i = 0; i < w; i += 14) { ctx.fillRect(i, barricadeY, 7, 10); }

      // Survivor (tactical soldier via engine2d)
      const tx = turretXRef.current;
      const breath = Math.sin(now * 0.003) * 1.5;
      drawSoldier2D(ctx, tx, turretY + breath, -Math.PI / 2, now * 0.003, char.color, false, 'pistol');

      // Bullets
      for (const b of bulletPoolRef.current.getActive()) {
        ctx.save();
        ctx.strokeStyle = b.color; ctx.lineWidth = 4;
        ctx.shadowColor = b.color; ctx.shadowBlur = 15;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x, b.y + 16); ctx.stroke();
        ctx.restore();
      }

      updateMuzzleFlashes(muzzleFlashesRef.current, dt);
      drawMuzzleFlashes(ctx, muzzleFlashesRef.current);
      updateParticles2D(particlesRef.current, dt);
      drawParticles2D(ctx, particlesRef.current);

      ctx.restore();
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [shoot, spawnZombie, spawnCrate, addCoins, char, endGameBatch]);

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
        <button onClick={() => setScreen('campaign')} className="w-9 h-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm font-bold">{survivalTime}s</span>
          </div>
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur rounded-full px-3 py-1.5">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-bold">{coinsEarned}</span>
          </div>
        </div>
      </div>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 text-center">
        <p className="text-red-400 font-black text-sm flex items-center gap-1"><Skull className="w-4 h-4" /> EL CAMINO DEL VICIO</p>
        <p className="text-white/40 text-[10px]">Mejor tiempo: {Math.floor(survivalBestTime / 1000)}s</p>
      </div>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 w-56 mt-8">
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
      {gameOver && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xs mx-4 rounded-2xl bg-card/90 border border-red-500/30 p-6 text-center animate-scale-in shadow-2xl shadow-red-500/20">
            <Skull className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h2 className="text-red-400 font-bold text-2xl mb-2">Fin de la Supervivencia</h2>
            <p className="text-white/60 text-sm mb-1">Tiempo: {survivalTime}s</p>
            <p className="text-amber-400 text-sm mb-6">Monedas ganadas: {coinsEarned}</p>
            <button onClick={() => initGame()} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold mb-2 hover:bg-primary/90">Reiniciar</button>
            <button onClick={() => setScreen('campaign')} className="w-full py-3 rounded-xl bg-card border border-border text-white font-bold hover:bg-secondary">Salir</button>
          </div>
        </div>
      )}
      <MuteButton />
    </div>
  );
}
