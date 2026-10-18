let audioCtx: AudioContext | null = null;
let sfxEnabled = true;

export function setSfxEnabled(enabled: boolean) {
  sfxEnabled = enabled;
}

export function isSfxEnabled() {
  return sfxEnabled;
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function initAudio() {
  getCtx();
}

export function pauseAudio() {
  if (audioCtx && audioCtx.state === 'running') {
    audioCtx.suspend().catch(() => {});
  }
}

export function resumeAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

export function playShoot() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playShotgun() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playExplosion() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const bufferSize = ctx.sampleRate * 0.4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(800, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}

export function playBossAlert() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime + i * 0.25);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + i * 0.25 + 0.1);
    osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + i * 0.25 + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.25 + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.25);
    osc.stop(ctx.currentTime + i * 0.25 + 0.25);
  }
}

export function playPickup() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(523, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1047, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

let coinVariant = 0;

export function playCoin() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const variant = coinVariant % 3;
  coinVariant++;

  const freqPairs = [
    [988, 1319],
    [880, 1175],
    [1047, 1397],
  ];
  const [f1, f2] = freqPairs[variant];

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(f1, ctx.currentTime);
  osc.frequency.setValueAtTime(f2, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.15);
}

export function playHit() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.12);
}

export function playBarrelHit() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export function playWeaponEquip() {
  if (!sfxEnabled) return;
  const ctx = getCtx();
  if (!ctx) return;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440 + i * 220, ctx.currentTime + i * 0.06);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.06);
    osc.stop(ctx.currentTime + i * 0.06 + 0.1);
  }
}

// ── Background action music (procedural, copyright-free) ──────────────────
let musicGain: GainNode | null = null;
let musicNodes: Array<{ osc: OscillatorNode; gain: GainNode }> = [];
let musicInterval: ReturnType<typeof setInterval> | null = null;
let musicPlaying = false;

const BASS_NOTES = [55, 55, 73.42, 65.41, 55, 55, 82.41, 73.42];
const LEAD_NOTES = [220, 261.63, 329.63, 261.63, 293.66, 349.23, 392, 329.63];
const DRUM_PATTERN = [1, 0, 0.5, 0, 1, 0, 0.5, 0.3];

export function startActionMusic() {
  const ctx = getCtx();
  if (!ctx || musicPlaying) return;
  musicPlaying = true;
  musicGain = ctx.createGain();
  musicGain.gain.setValueAtTime(0, ctx.currentTime);
  musicGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.5);
  musicGain.connect(ctx.destination);

  let step = 0;
  musicInterval = setInterval(() => {
    if (!musicGain || !ctx) return;
    const t = ctx.currentTime;
    const i = step % 8;

    // Bass line
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(BASS_NOTES[i], t);
    bassGain.gain.setValueAtTime(0.08, t);
    bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    bassOsc.connect(bassGain);
    bassGain.connect(musicGain);
    bassOsc.start(t);
    bassOsc.stop(t + 0.2);

    // Lead melody (every other step)
    if (i % 2 === 0) {
      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = 'square';
      leadOsc.frequency.setValueAtTime(LEAD_NOTES[i], t);
      leadGain.gain.setValueAtTime(0.04, t);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      leadOsc.connect(leadGain);
      leadGain.connect(musicGain);
      leadOsc.start(t);
      leadOsc.stop(t + 0.3);
    }

    // Drum (noise burst)
    if (DRUM_PATTERN[i] > 0) {
      const bufSize = ctx.sampleRate * 0.08;
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) d[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / bufSize, 2);
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const drumGain = ctx.createGain();
      drumGain.gain.setValueAtTime(DRUM_PATTERN[i] * 0.06, t);
      drumGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      noise.connect(filter);
      filter.connect(drumGain);
      drumGain.connect(musicGain);
      noise.start(t);
    }

    step++;
  }, 250);
}

export function stopActionMusic() {
  if (musicInterval) { clearInterval(musicInterval); musicInterval = null; }
  if (musicGain && audioCtx) {
    musicGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
  }
  musicNodes = [];
  musicGain = null;
  musicPlaying = false;
}

export function isMusicPlaying() {
  return musicPlaying;
}

// ── Musica de fondo por minijuego (procedural, sin archivos ni dependencias) ──
type MusicTrack = 'garrfly' | 'maze' | 'zrunner' | 'garrblade' | 'canicas';

interface TrackDef {
  stepMs: number;
  bass: number[];
  lead: number[];
  leadWave: OscillatorType;
  drums?: number[];
  volume: number;
}

// Frecuencia 0 = silencio (respiracion entre notas)
const TRACKS: Record<MusicTrack, TrackDef> = {
  // Culebrita: retro relajado
  garrfly: {
    stepMs: 300, leadWave: 'square', volume: 0.08,
    bass: [110, 0, 130.81, 0, 110, 0, 146.83, 130.81],
    lead: [440, 523.25, 659.25, 523.25, 587.33, 523.25, 440, 0],
  },
  // Laberinto: misterioso, grave y disperso
  maze: {
    stepMs: 360, leadWave: 'triangle', volume: 0.07,
    bass: [73.42, 0, 0, 82.41, 0, 73.42, 0, 69.3],
    lead: [293.66, 0, 311.13, 0, 293.66, 0, 261.63, 0],
  },
  // Z-Runner: dinamico, con percusion
  zrunner: {
    stepMs: 200, leadWave: 'sawtooth', volume: 0.07,
    bass: [55, 55, 82.41, 55, 65.41, 65.41, 82.41, 73.42],
    lead: [220, 261.63, 329.63, 392, 349.23, 329.63, 261.63, 220],
    drums: [1, 0, 0.6, 0, 1, 0, 0.6, 0.4],
  },
  // GarrBlade: pulso ritmico de precision
  garrblade: {
    stepMs: 230, leadWave: 'square', volume: 0.075,
    bass: [98, 0, 98, 0, 116.54, 0, 116.54, 0],
    lead: [392, 392, 0, 392, 466.16, 0, 466.16, 392],
    drums: [1, 0.5, 1, 0.5, 1, 0.5, 1, 0.5],
  },
  // Canicas: arcade alegre
  canicas: {
    stepMs: 260, leadWave: 'square', volume: 0.08,
    bass: [130.81, 130.81, 174.61, 130.81, 155.56, 155.56, 196, 174.61],
    lead: [523.25, 659.25, 783.99, 659.25, 622.25, 698.46, 783.99, 659.25],
  },
};

let currentTrack: MusicTrack | null = null;
let gameMusicTimer: ReturnType<typeof setInterval> | null = null;
let gameMusicGain: GainNode | null = null;

export function startGameMusic(track: MusicTrack) {
  const ctx = getCtx();
  if (!ctx) return;
  if (currentTrack === track && gameMusicTimer) return;
  stopGameMusic();
  currentTrack = track;
  const def = TRACKS[track];
  gameMusicGain = ctx.createGain();
  gameMusicGain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gameMusicGain.gain.linearRampToValueAtTime(def.volume, ctx.currentTime + 0.6);
  gameMusicGain.connect(ctx.destination);

  let step = 0;
  gameMusicTimer = setInterval(() => {
    if (!gameMusicGain || !ctx || !currentTrack) return;
    // Mientras el contexto este suspendido (app en segundo plano) no se agenda nada,
    // para evitar que todas las notas suenen de golpe al volver
    if (ctx.state !== 'running') return;
    const d = TRACKS[currentTrack];
    const t = ctx.currentTime;
    const i = step % 8;
    const noteLen = d.stepMs / 1000;

    if (d.bass[i] > 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(d.bass[i], t);
      g.gain.setValueAtTime(0.5, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.9);
      osc.connect(g);
      g.connect(gameMusicGain);
      osc.start(t);
      osc.stop(t + noteLen);
    }

    if (d.lead[i] > 0) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = d.leadWave;
      osc.frequency.setValueAtTime(d.lead[i], t);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + noteLen);
      osc.connect(g);
      g.connect(gameMusicGain);
      osc.start(t);
      osc.stop(t + noteLen);
    }

    if (d.drums && d.drums[i] > 0) {
      const bufSize = Math.max(256, Math.floor(ctx.sampleRate * 0.06));
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let j = 0; j < bufSize; j++) data[j] = (Math.random() * 2 - 1) * (1 - j / bufSize);
      const noise = ctx.createBufferSource();
      noise.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 220;
      const g = ctx.createGain();
      g.gain.setValueAtTime(d.drums[i] * 0.4, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
      noise.connect(filter);
      filter.connect(g);
      g.connect(gameMusicGain);
      noise.start(t);
    }

    step++;
  }, def.stepMs);
}

export function stopGameMusic() {
  if (gameMusicTimer) { clearInterval(gameMusicTimer); gameMusicTimer = null; }
  if (gameMusicGain && audioCtx) {
    try { gameMusicGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25); } catch {}
  }
  gameMusicGain = null;
  currentTrack = null;
}

export function currentGameMusic() {
  return currentTrack;
}

export function playVictory() {
  const ctx = getCtx();
  if (!ctx) return;
  const notes = [523, 659, 784, 1047];
  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(notes[i], ctx.currentTime + i * 0.1);
    gain.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.1);
    osc.stop(ctx.currentTime + i * 0.1 + 0.25);
  }
}

export function playGameOver() {
  const ctx = getCtx();
  if (!ctx) return;
  const notes = [440, 392, 349, 262];
  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(notes[i], ctx.currentTime + i * 0.12);
    gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + i * 0.12);
    osc.stop(ctx.currentTime + i * 0.12 + 0.3);
  }
}
