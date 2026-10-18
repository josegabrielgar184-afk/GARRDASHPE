'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { MuteButton } from '@/components/game/MuteButton';
import { ArrowLeft, Trophy, Pause, Play, RotateCcw, Circle, Coins, Zap, Volume2, VolumeX, Music, Music2 } from 'lucide-react';
import { startGameMusic, stopGameMusic, setGameMusicIntensity } from '@/lib/audio';

const W = 360;
const H = 480;
const MARBLE_R = 11;
const SPACING = MARBLE_R * 2 + 2;
const SHOT_SPEED = 420;
const CHAIN_CAP = 46;
const RUN_MIN = 3;
const COLORS = ['#00e5ff', '#ffb700', '#ff2d95', '#39ff88'];
const BASE_COLORS = 3;

interface Marble { color: number; dist: number; }
interface Shot { x: number; y: number; vx: number; vy: number; color: number; }
interface Particle { x: number; y: number; vx: number; vy: number; color: string; life: number; }
interface Shockwave { x: number; y: number; r: number; life: number; }

type Status = 'ready' | 'playing' | 'paused' | 'won' | 'lost';

interface Difficulty { speed: number; spawnEvery: number; nColors: number; label: string; }

// Fases: 0-40s facil (cadena lenta) | 40-90s normal | 90-150s dificil | 150s+ experto con rampa gradual acotada
function difficultyAt(t: number): Difficulty {
  if (t < 40) return { speed: 24, spawnEvery: 1.7, nColors: 3, label: 'FACIL' };
  if (t < 90) return { speed: 34, spawnEvery: 1.4, nColors: 3, label: 'NORMAL' };
  if (t < 150) return { speed: 48, spawnEvery: 1.15, nColors: 4, label: 'DIFICIL' };
  const over = t - 150;
  return {
    speed: Math.min(48 + (over / 90) * 24, 78),
    spawnEvery: Math.max(1.15 - (over / 90) * 0.2, 0.95),
    nColors: 4,
    label: 'EXPERTO',
  };
}

const fmtTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
};

const CX = W / 2;
const CY = H * 0.4;
const MAX_R = Math.min(W, H) * 0.44;

const pathPts: Array<{ x: number; y: number }> = [];
for (let i = 0; i <= 600; i++) {
  const t = i / 600;
  const angle = -Math.PI / 2 + t * Math.PI * 4.6;
  const radius = MAX_R * (1 - t * 0.86);
  pathPts.push({ x: CX + Math.cos(angle) * radius, y: CY + Math.sin(angle) * radius });
}
const pathCum: number[] = [0];
for (let i = 1; i < pathPts.length; i++) {
  pathCum[i] = pathCum[i - 1] + Math.hypot(pathPts[i].x - pathPts[i - 1].x, pathPts[i].y - pathPts[i - 1].y);
}
const PATH_LEN = pathCum[pathCum.length - 1];
const SHOOTER = { x: W / 2, y: H - 48 };

function pointAt(dist: number): { x: number; y: number } {
  const d = Math.max(0, Math.min(PATH_LEN, dist));
  let lo = 0;
  let hi = pathCum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (pathCum[mid] < d) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const seg = Math.max(1e-6, pathCum[i] - pathCum[i - 1]);
  const t = (d - pathCum[i - 1]) / seg;
  return {
    x: pathPts[i - 1].x + (pathPts[i].x - pathPts[i - 1].x) * t,
    y: pathPts[i - 1].y + (pathPts[i].y - pathPts[i - 1].y) * t,
  };
}

const HOLE = pointAt(PATH_LEN);

// Retroceso de la cadena al explotar (en pixeles de trayectoria)
const RECOIL_BASE = 15;
const RECOIL_BIG = 23;
const RECOIL_COMBO = 8;
const RECOIL_CAP = 60;
const RECOIL_RATE = 200;

// Sonidos generados con Web Audio API: sin archivos externos ni dependencias
class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private active = 0;
  private lastCoinAt = 0;
  enabled = true;

  unlock() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const Ctor = window.AudioContext
        ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      try {
        this.ctx = new Ctor();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.32;
        this.master.connect(this.ctx.destination);
      } catch {
        this.ctx = null;
        this.master = null;
      }
      return;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  private tone(freqStart: number, freqEnd: number, dur: number, type: OscillatorType, vol: number, delay = 0) {
    if (!this.ctx || !this.master || !this.enabled || this.active > 12) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(1, freqStart), t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    this.active++;
    osc.onended = () => { this.active--; };
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  shoot() { this.tone(480, 170, 0.08, 'square', 0.2); }
  explode() {
    this.tone(320, 70, 0.22, 'triangle', 0.5);
    this.tone(900, 1500, 0.1, 'sine', 0.16);
  }
  explodeBig() {
    this.tone(260, 48, 0.34, 'triangle', 0.6);
    this.tone(700, 1600, 0.16, 'sine', 0.22);
    this.tone(150, 40, 0.3, 'sawtooth', 0.18);
  }
  combo() {
    this.tone(520, 520, 0.07, 'square', 0.22, 0);
    this.tone(660, 660, 0.07, 'square', 0.22, 0.07);
    this.tone(880, 880, 0.11, 'square', 0.24, 0.14);
  }
  alert() {
    this.tone(620, 620, 0.09, 'sine', 0.28, 0);
    this.tone(620, 620, 0.09, 'sine', 0.28, 0.14);
  }
  win() {
    this.tone(523, 523, 0.12, 'sine', 0.38, 0);
    this.tone(659, 659, 0.12, 'sine', 0.38, 0.11);
    this.tone(784, 784, 0.12, 'sine', 0.38, 0.22);
    this.tone(1047, 1047, 0.22, 'sine', 0.42, 0.33);
  }
  lose() {
    this.tone(392, 392, 0.16, 'triangle', 0.38, 0);
    this.tone(311, 311, 0.16, 'triangle', 0.38, 0.15);
    this.tone(233, 110, 0.34, 'triangle', 0.42, 0.3);
  }
  coin() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    if (t - this.lastCoinAt < 0.07) return;
    this.lastCoinAt = t;
    this.tone(1250, 1600, 0.07, 'sine', 0.14);
  }
}

// Canica con volumen: base de color, sombra inferior, brillo superior y borde sutil
function drawMarble(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.arc(x + r * 0.26, y + r * 0.3, r * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(x - r * 0.34, y - r * 0.4, r * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x, y, r - 0.5, 0, Math.PI * 2);
  ctx.stroke();
}

export function CanicasExplosivas() {
  const { setScreen } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const timeHudRef = useRef<HTMLSpanElement>(null);
  const diffHudRef = useRef<HTMLSpanElement>(null);
  const coinsHudRef = useRef<HTMLSpanElement>(null);
  const explHudRef = useRef<HTMLSpanElement>(null);

  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<Status>('ready');
  const [endStats, setEndStats] = useState<{ duration: number; explosions: number; coins: number; score: number } | null>(null);
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('canicas_sfx') !== '0';
  });
  const [musicOn, setMusicOn] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('canicas_music') !== '0';
  });
  const musicOnRef = useRef(true);

  useEffect(() => {
    musicOnRef.current = musicOn;
    localStorage.setItem('canicas_music', musicOn ? '1' : '0');
  }, [musicOn]);

  useEffect(() => {
    localStorage.setItem('canicas_sfx', soundOn ? '1' : '0');
    if (sfxRef.current) sfxRef.current.enabled = soundOn;
  }, [soundOn]);

  const sfx = useCallback(() => {
    if (!sfxRef.current) sfxRef.current = new Sfx();
    return sfxRef.current;
  }, []);

  const marblesRef = useRef<Marble[]>([]);
  const shotRef = useRef<Shot | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const wavesRef = useRef<Shockwave[]>([]);
  const currentColorRef = useRef(0);
  const nextColorRef = useRef(1);
  const angleRef = useRef(-Math.PI / 2);
  const aimingRef = useRef(false);
  const scoreRef = useRef(0);
  const statusRef = useRef<Status>('ready');
  const coinsRef = useRef(0);
  const explosionsRef = useRef(0);
  const elapsedRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const recoilRef = useRef(0);
  const lastDiffRef = useRef('FACIL');
  const sfxRef = useRef<Sfx | null>(null);

  const setGameStatus = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
    if (s === 'playing') {
      if (musicOnRef.current) startGameMusic('canicas');
    } else {
      stopGameMusic();
    }
  }, []);

  const initGame = useCallback(() => {
    const marbles: Marble[] = [];
    // Sin triples iniciales: evita explosiones gratuitas al arrancar
    let p1 = -1;
    let p2 = -1;
    for (let i = 0; i < 28; i++) {
      let c = Math.floor(Math.random() * BASE_COLORS);
      while (c === p1 && c === p2) c = Math.floor(Math.random() * BASE_COLORS);
      p2 = p1;
      p1 = c;
      marbles.push({ color: c, dist: -i * SPACING });
    }
    marblesRef.current = marbles;
    shotRef.current = null;
    particlesRef.current = [];
    wavesRef.current = [];
    currentColorRef.current = Math.floor(Math.random() * BASE_COLORS);
    nextColorRef.current = Math.floor(Math.random() * BASE_COLORS);
    scoreRef.current = 0;
    coinsRef.current = 0;
    explosionsRef.current = 0;
    elapsedRef.current = 0;
    spawnTimerRef.current = 0;
    recoilRef.current = 0;
    lastDiffRef.current = 'FACIL';
    setScore(0);
    setEndStats(null);
    setGameStatus('ready');
  }, [setGameStatus]);

  useEffect(() => { initGame(); }, [initGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const spawnParticles = (x: number, y: number, color: string) => {
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = Math.random() * 90 + 30;
        particlesRef.current.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, color, life: 1 });
      }
    };

    // Explota todo grupo contiguo de >= 3 canicas del mismo color (incluye cascadas al cerrar huecos)
    const popGroups = () => {
      const marbles = marblesRef.current;
      let groups = 0;
      let found = true;
      while (found) {
        found = false;
        let i = 0;
        while (i < marbles.length) {
          let j = i;
          while (j + 1 < marbles.length && marbles[j + 1].color === marbles[i].color) j++;
          const run = j - i + 1;
          if (run >= RUN_MIN) {
            const removed = marbles.splice(i, run);
            groups++;
            scoreRef.current += run * 100 + (run - RUN_MIN) * 60;
            coinsRef.current += 1;
            explosionsRef.current += 1;
            let cx = 0;
            let cy = 0;
            let n = 0;
            for (const m of removed) {
              if (m.dist >= 0) {
                const p = pointAt(m.dist);
                spawnParticles(p.x, p.y, COLORS[m.color]);
                cx += p.x;
                cy += p.y;
                n++;
              }
            }
            if (n > 0) wavesRef.current.push({ x: cx / n, y: cy / n, r: MARBLE_R, life: 1 });
            let recoil = run >= 5 ? RECOIL_BIG : RECOIL_BASE;
            if (groups > 1) recoil += RECOIL_COMBO;
            recoilRef.current = Math.min(RECOIL_CAP, recoilRef.current + recoil);
            if (run >= 5) sfx().explodeBig(); else sfx().explode();
            sfx().coin();
            found = true;
          } else {
            i = j + 1;
          }
        }
      }
      if (groups > 0) setScore(scoreRef.current);
      if (groups > 0) setGameMusicIntensity(Math.min(1, explosionsRef.current / 12));
      if (groups > 1) sfx().combo();
      return groups;
    };

    const update = (dt: number) => {
      const marbles = marblesRef.current;
      elapsedRef.current += dt;
      const diff = difficultyAt(elapsedRef.current);

      if (marbles.length > 0) {
        marbles[0].dist += diff.speed * dt;
        if (marbles[0].dist >= PATH_LEN) {
          setEndStats({
            duration: elapsedRef.current,
            explosions: explosionsRef.current,
            coins: coinsRef.current,
            score: scoreRef.current,
          });
          setGameStatus('lost');
          sfx().lose();
          return;
        }
        for (let i = 1; i < marbles.length; i++) {
          const desired = marbles[i - 1].dist - SPACING;
          marbles[i].dist += (desired - marbles[i].dist) * Math.min(1, dt * 8);
        }
        if (recoilRef.current > 0) {
          const step = Math.min(recoilRef.current, RECOIL_RATE * dt);
          marbles[0].dist = Math.max(0, marbles[0].dist - step);
          recoilRef.current -= step;
        }
        spawnTimerRef.current += dt;
        if (spawnTimerRef.current >= diff.spawnEvery) {
          spawnTimerRef.current = 0;
          if (marbles.length < CHAIN_CAP) {
            const tail = marbles[marbles.length - 1];
            let c = Math.floor(Math.random() * diff.nColors);
            // Evita triples espontaneos al final de la cadena: solo explota lo que el jugador arma
            if (
              marbles.length >= 2 &&
              tail.color === c &&
              marbles[marbles.length - 2].color === c
            ) {
              c = (c + 1) % diff.nColors;
            }
            marbles.push({ color: c, dist: tail.dist - SPACING });
          }
        }
      }

      const shot = shotRef.current;
      if (shot) {
        shot.x += shot.vx * dt;
        shot.y += shot.vy * dt;
        if (shot.x < -60 || shot.x > W + 60 || shot.y < -60 || shot.y > H + 60) {
          shotRef.current = null;
        } else {
          for (let k = 0; k < marbles.length; k++) {
            if (marbles[k].dist < 0) break;
            const p = pointAt(marbles[k].dist);
            if (Math.hypot(shot.x - p.x, shot.y - p.y) < MARBLE_R * 2 - 4) {
              shotRef.current = null;
              marbles.splice(k, 0, { color: shot.color, dist: marbles[k].dist });
              break;
            }
          }
        }
      }

      popGroups();
      if (marbles.length === 0) {
        setEndStats({
          duration: elapsedRef.current,
          explosions: explosionsRef.current,
          coins: coinsRef.current,
          score: scoreRef.current,
        });
        setGameStatus('won');
        sfx().win();
        return;
      }

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.life -= dt * 1.8;
        if (p.life <= 0) particlesRef.current.splice(i, 1);
      }
      for (let i = wavesRef.current.length - 1; i >= 0; i--) {
        const wv = wavesRef.current[i];
        wv.r += 65 * dt;
        wv.life -= dt * 2.2;
        if (wv.life <= 0) wavesRef.current.splice(i, 1);
      }
    };

    const draw = (time: number) => {
      ctx.fillStyle = '#0a0e17';
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(0,243,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += 36) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y <= H; y += 36) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Camino luminoso: doble trazo (halo + nucleo) para claridad
      ctx.strokeStyle = 'rgba(0,243,255,0.10)';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(pathPts[0].x, pathPts[0].y);
      for (let i = 1; i < pathPts.length; i++) ctx.lineTo(pathPts[i].x, pathPts[i].y);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(0,243,255,0.30)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pathPts[0].x, pathPts[0].y);
      for (let i = 1; i < pathPts.length; i++) ctx.lineTo(pathPts[i].x, pathPts[i].y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0,243,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pathPts[0].x, pathPts[0].y, MARBLE_R + 3, 0, Math.PI * 2);
      ctx.stroke();

      const pulse = 3 + Math.sin(time / 200) * 2;
      ctx.fillStyle = '#ff2d95';
      ctx.shadowColor = '#ff2d95';
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(HOLE.x, HOLE.y, MARBLE_R + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      for (const m of marblesRef.current) {
        if (m.dist < 0) continue;
        const p = pointAt(m.dist);
        drawMarble(ctx, p.x, p.y, MARBLE_R, COLORS[m.color]);
      }

      const shot = shotRef.current;
      if (shot) drawMarble(ctx, shot.x, shot.y, MARBLE_R, COLORS[shot.color]);

      if (aimingRef.current && !shotRef.current) {
        const gx = SHOOTER.x + Math.cos(angleRef.current) * 150;
        const gy = SHOOTER.y + Math.sin(angleRef.current) * 150;
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(SHOOTER.x, SHOOTER.y);
        ctx.lineTo(gx, gy);
        ctx.stroke();
        ctx.setLineDash([]);
        // Vista previa del color exacto que se disparara
        drawMarble(ctx, gx, gy, 6, COLORS[currentColorRef.current]);
      }

      for (const p of particlesRef.current) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.life + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const wv of wavesRef.current) {
        ctx.globalAlpha = Math.max(0, wv.life);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(wv.x, wv.y, wv.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Anillo neutro del lanzador: no compite con ningun color de canica
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(SHOOTER.x, SHOOTER.y, 22, 0, Math.PI * 2);
      ctx.stroke();

      // Canica actual: exactamente el color que se dispara
      drawMarble(ctx, SHOOTER.x, SHOOTER.y, MARBLE_R, COLORS[currentColorRef.current]);
      // Proxima canica en cola
      ctx.globalAlpha = 0.7;
      drawMarble(ctx, SHOOTER.x + 32, SHOOTER.y, 7, COLORS[nextColorRef.current]);
      ctx.globalAlpha = 1;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (statusRef.current === 'playing') update(dt);
      if (progressRef.current && marblesRef.current.length > 0) {
        const pct = Math.min(100, (marblesRef.current[0].dist / PATH_LEN) * 100);
        progressRef.current.style.width = `${pct}%`;
      }
      const diff = difficultyAt(elapsedRef.current);
      if (diff.label !== lastDiffRef.current) {
        lastDiffRef.current = diff.label;
        if (statusRef.current === 'playing') sfx().alert();
      }
      if (timeHudRef.current) timeHudRef.current.textContent = fmtTime(elapsedRef.current);
      if (diffHudRef.current) diffHudRef.current.textContent = diff.label;
      if (coinsHudRef.current) coinsHudRef.current.textContent = String(coinsRef.current);
      if (explHudRef.current) explHudRef.current.textContent = String(explosionsRef.current);
      draw(now);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [setGameStatus, sfx]);

  const toCanvas = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * W,
      y: ((clientY - rect.top) / rect.height) * H,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    sfx().unlock();
    if (statusRef.current !== 'playing' || shotRef.current) return;
    aimingRef.current = true;
    const p = toCanvas(e.clientX, e.clientY);
    angleRef.current = Math.atan2(p.y - SHOOTER.y, p.x - SHOOTER.x);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!aimingRef.current) return;
    const p = toCanvas(e.clientX, e.clientY);
    angleRef.current = Math.atan2(p.y - SHOOTER.y, p.x - SHOOTER.x);
  };

  const handlePointerUp = () => {
    if (!aimingRef.current) return;
    aimingRef.current = false;
    if (statusRef.current !== 'playing' || shotRef.current) return;
    const a = angleRef.current;
    shotRef.current = {
      x: SHOOTER.x,
      y: SHOOTER.y,
      vx: Math.cos(a) * SHOT_SPEED,
      vy: Math.sin(a) * SHOT_SPEED,
      color: currentColorRef.current,
    };
    sfx().shoot();
    currentColorRef.current = nextColorRef.current;
    nextColorRef.current = Math.floor(Math.random() * difficultyAt(elapsedRef.current).nColors);
  };

  const handlePause = () => {
    if (statusRef.current === 'playing') {
      aimingRef.current = false;
      setGameStatus('paused');
    }
  };

  const handleRestart = () => {
    sfx().unlock();
    initGame();
    setGameStatus('playing');
  };

  const toggleSound = () => {
    const nv = !soundOn;
    setSoundOn(nv);
    if (sfxRef.current) sfxRef.current.enabled = nv;
    if (nv) sfx().unlock();
  };

  const toggleMusic = () => {
    const nv = !musicOn;
    setMusicOn(nv);
    musicOnRef.current = nv;
    if (!nv) {
      stopGameMusic();
    } else if (statusRef.current === 'playing') {
      startGameMusic('canicas');
    }
  };

  useEffect(() => {
    return () => stopGameMusic();
  }, []);

  const actionBtn =
    'px-6 py-3 rounded-2xl font-black text-sm tracking-wide active:scale-95 transition-transform';

  const endRows = endStats
    ? [
        { label: 'Duracion', value: fmtTime(endStats.duration) },
        { label: 'Explosiones validas', value: String(endStats.explosions) },
        { label: 'Puntuacion', value: endStats.score.toLocaleString() },
        { label: 'Monedas simuladas', value: String(endStats.coins) },
      ]
    : [];

  return (
    <div className="h-full flex flex-col bg-[#0a0e17] relative overflow-hidden select-none">
      <MuteButton />

      <div className="pt-14 px-4 pb-2 flex items-center justify-between border-b border-[#ff2d95]/10 bg-gradient-to-b from-[#0a0e17] to-transparent">
        <button
          onClick={() => setScreen('arcade')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-[#ff2d95]/30 text-white text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff2d95]" /> Salir
        </button>

        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 bg-black/60 border border-[#ffb700]/30 rounded-full px-2.5 py-1">
            <Trophy className="w-3.5 h-3.5 text-[#ffb700]" />
            <span className="text-[#ffb700] text-xs font-bold">{score.toLocaleString()}</span>
          </span>
          <span className="flex items-center gap-1 bg-black/60 border border-[#39ff88]/30 rounded-full px-2.5 py-1">
            <Coins className="w-3.5 h-3.5 text-[#39ff88]" />
            <span className="text-[#39ff88] text-[9px] font-bold uppercase tracking-wider">Sim</span>
            <span ref={coinsHudRef} className="text-[#39ff88] text-xs font-bold">0</span>
          </span>
          <span className="hidden min-[380px]:flex items-center gap-1 bg-black/60 border border-[#00e5ff]/30 rounded-full px-2.5 py-1">
            <Zap className="w-3.5 h-3.5 text-[#00e5ff]" />
            <span ref={explHudRef} className="text-[#00e5ff] text-xs font-bold">0</span>
          </span>
          <button
            onClick={toggleMusic}
            className="px-2.5 py-1.5 rounded-full bg-black/60 border border-white/20 active:scale-95"
            aria-label="Musica"
          >
            {musicOn ? <Music className="w-4 h-4 text-[#ffb700]" /> : <Music2 className="w-4 h-4 text-white/40" />}
          </button>
          <button
            onClick={toggleSound}
            className="px-2.5 py-1.5 rounded-full bg-black/60 border border-white/20 active:scale-95"
            aria-label="Sonido"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-[#39ff88]" /> : <VolumeX className="w-4 h-4 text-white/40" />}
          </button>
          {status === 'playing' && (
            <button
              onClick={handlePause}
              className="px-2.5 py-1.5 rounded-full bg-black/60 border border-[#00f3ff]/30 active:scale-95"
              aria-label="Pausar"
            >
              <Pause className="w-4 h-4 text-[#00f3ff]" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-2 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            ref={progressRef}
            className="h-full w-0 bg-gradient-to-r from-[#ff2d95] to-[#ffb700] transition-none"
          />
        </div>
        <span ref={timeHudRef} className="text-white/50 text-[10px] font-mono shrink-0">0:00</span>
        <span ref={diffHudRef} className="text-[#00f3ff] text-[9px] font-black tracking-wider shrink-0">FACIL</span>
      </div>

      <div className="flex-1 flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { aimingRef.current = false; }}
          onPointerLeave={() => { aimingRef.current = false; }}
          className="border border-[#ff2d95]/30 rounded-2xl shadow-2xl shadow-[#ff2d95]/10 max-h-[62vh] object-contain bg-black/50 touch-none"
        />
      </div>

      {status === 'ready' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-8 text-center">
          <Circle className="w-10 h-10 text-[#ff2d95] mb-2" />
          <h1
            className="text-[#ff2d95] font-black text-2xl tracking-wider"
            style={{ textShadow: '0 0 18px rgba(255,45,149,0.6)' }}
          >
            CANICAS EXPLOSIVAS
          </h1>
          <p className="text-white/60 text-sm mt-3 leading-relaxed">
            Arrastra para apuntar y suelta para disparar.<br />
            Junta 3 o más canicas iguales para explotarlas.<br />
            Vacía el camino antes de que llegue al hoyo.
          </p>
          <p className="text-white/30 text-[10px] mt-2">
            La cadena acelera con el tiempo: Facil → Normal → Dificil → Experto
          </p>
          <button
            onClick={() => { sfx().unlock(); setGameStatus('playing'); }}
            className={`${actionBtn} mt-6 bg-gradient-to-r from-[#ff2d95] to-[#ffb700] text-black`}
          >
            EMPEZAR
          </button>
        </div>
      )}

      {status === 'paused' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-8 text-center">
          <Pause className="w-12 h-12 text-[#00f3ff] mb-3" />
          <h2
            className="text-white font-black text-xl tracking-wider"
            style={{ textShadow: '0 0 15px rgba(0,243,255,0.5)' }}
          >
            PAUSA
          </h2>
          <p className="text-white/50 text-xs mt-1">
            Puntos: {score.toLocaleString()}
          </p>
          <div className="flex flex-col gap-3 mt-6 w-52">
            <button onClick={() => setGameStatus('playing')} className={`${actionBtn} bg-gradient-to-r from-[#00f3ff] to-cyan-400 text-black flex items-center justify-center gap-2`}>
              <Play className="w-4 h-4" /> REANUDAR
            </button>
            <button onClick={handleRestart} className={`${actionBtn} bg-black/60 border border-white/20 text-white flex items-center justify-center gap-2`}>
              <RotateCcw className="w-4 h-4" /> REINICIAR
            </button>
            <button onClick={() => setScreen('arcade')} className={`${actionBtn} bg-black/60 border border-white/20 text-white/70 flex items-center justify-center gap-2`}>
              <ArrowLeft className="w-4 h-4" /> SALIR
            </button>
          </div>
        </div>
      )}

      {(status === 'won' || status === 'lost') && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 px-8 text-center">
          {status === 'won' ? (
            <>
              <Trophy className="w-14 h-14 text-[#ffb700] mb-3" />
              <h2
                className="text-[#ffb700] font-black text-2xl tracking-wider"
                style={{ textShadow: '0 0 20px rgba(255,183,0,0.6)' }}
              >
                ¡VICTORIA!
              </h2>
              <p className="text-white/60 text-sm mt-2">
                Vaciaste todo el camino de canicas
              </p>
            </>
          ) : (
            <>
              <Circle className="w-14 h-14 text-[#ff2d95] mb-3" />
              <h2
                className="text-[#ff2d95] font-black text-2xl tracking-wider"
                style={{ textShadow: '0 0 20px rgba(255,45,149,0.6)' }}
              >
                ¡DERROTA!
              </h2>
              <p className="text-white/60 text-sm mt-2">
                Las canicas llegaron al hoyo
              </p>
            </>
          )}

          {endStats && (
            <div className="mt-4 w-60 rounded-2xl bg-black/60 border border-white/10 p-3 space-y-1.5">
              {endRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-white/40">{row.label}</span>
                  <span className="text-white font-bold font-mono">{row.value}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-white/30 text-[10px] mt-2 max-w-60">
            Monedas simuladas para evaluacion: no se acreditan monedas reales.
          </p>

          <div className="flex flex-col gap-3 mt-5 w-52">
            <button onClick={handleRestart} className={`${actionBtn} bg-gradient-to-r from-[#ff2d95] to-[#ffb700] text-black flex items-center justify-center gap-2`}>
              <RotateCcw className="w-4 h-4" /> REINICIAR
            </button>
            <button onClick={() => setScreen('arcade')} className={`${actionBtn} bg-black/60 border border-white/20 text-white/70 flex items-center justify-center gap-2`}>
              <ArrowLeft className="w-4 h-4" /> SALIR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
