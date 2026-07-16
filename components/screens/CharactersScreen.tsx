'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { SHIPS, ZOMBIE_CHARACTERS } from '@/lib/characters';
import { MuteButton } from '@/components/game/MuteButton';
import { SuggestionButton, SuggestionModal } from '@/components/game/SuggestionModal';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Rocket, Skull, Heart, Gauge, Zap } from 'lucide-react';

type Tab = 'ships' | 'zombies';

export function CharactersScreen() {
  const { selectedShip, selectShip, selectedZombie, selectZombie, setScreen } = useGame();
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [tab, setTab] = useState<Tab>('ships');
  const [shipIndex, setShipIndex] = useState(Math.max(0, SHIPS.findIndex((s) => s.id === selectedShip)));
  const [zombieIndex, setZombieIndex] = useState(Math.max(0, ZOMBIE_CHARACTERS.findIndex((c) => c.id === selectedZombie)));

  const isShips = tab === 'ships';
  const index = isShips ? shipIndex : zombieIndex;
  const list = isShips ? SHIPS : ZOMBIE_CHARACTERS;
  const item = list[index];
  const selectedId = isShips ? selectedShip : selectedZombie;
  const isSelected = selectedId === item.id;
  const select = isShips ? selectShip : selectZombie;
  const setIndex = isShips ? setShipIndex : setZombieIndex;

  const prev = () => setIndex((i) => (i - 1 + list.length) % list.length);
  const next = () => setIndex((i) => (i + 1) % list.length);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-secondary/20">
      <MuteButton />
      <SuggestionButton onClick={() => setShowSuggestion(true)} />

      <div className="pt-16 px-6 pb-28 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setScreen('menu')} className="text-white/50 hover:text-white"><ArrowLeft className="w-6 h-6" /></button>
          <h1 className="text-white font-bold text-xl">Personajes</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('ships')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${isShips ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/20 border-2 border-cyan-400/60' : 'bg-card border border-border text-white/50'}`}>
            <Rocket className="w-4 h-4" />NAVES
          </button>
          <button onClick={() => setTab('zombies')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${!isShips ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/20 border-2 border-red-400/60' : 'bg-card border border-border text-white/50'}`}>
            <Skull className="w-4 h-4" />ZOMBIE
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full">
          {/* Carousel */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <button onClick={prev} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-white hover:bg-secondary shadow-lg active:scale-90 transition-transform"><ChevronLeft className="w-5 h-5" /></button>
            <div key={item.id} className="w-36 h-36 rounded-2xl flex items-center justify-center transition-all duration-300 animate-scale-in relative overflow-hidden" style={{ backgroundColor: `${item.color}15`, border: `3px solid ${item.color}`, boxShadow: `0 0 50px ${item.glow}` }}>
              {/* Neon glow backdrop */}
              <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at center, ${item.color}40, transparent 70%)` }} />
              {isShips ? (
                <ShipPreview color={item.color} />
              ) : (
                <ZombieCharPreview color={item.color} />
              )}
            </div>
            <button onClick={next} className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-white hover:bg-secondary shadow-lg active:scale-90 transition-transform"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {/* Dots */}
          <div className="flex gap-2 mb-6">
            {list.map((c, i) => (
              <button key={c.id} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'w-6' : 'w-2 bg-white/20'}`} style={i === index ? { backgroundColor: item.color } : {}} />
            ))}
          </div>

          {/* Info card */}
          <div key={item.id + '-info'} className="w-full rounded-2xl bg-card border p-5 animate-slide-up shadow-lg" style={{ borderColor: `${item.color}55` }}>
            <h2 className="text-white font-bold text-2xl mb-1" style={{ color: item.color, textShadow: `0 0 10px ${item.glow}` }}>{item.name}</h2>
            <div className="inline-block rounded-lg px-2 py-1 mb-3 text-xs font-bold" style={{ backgroundColor: `${item.color}20`, color: item.color }}>{item.skill}</div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">{item.skillDesc}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
              {isShips ? (
                <>
                  <StatChip icon={Gauge} label="Velocidad" value={`${(((item as typeof SHIPS[number]).speedMult - 1) * 100 + 100).toFixed(0)}%`} color={item.color} />
                  <StatChip icon={Zap} label="Cadencia" value={`${(((item as typeof SHIPS[number]).fireRateMult - 1) * 100 + 100).toFixed(0)}%`} color={item.color} />
                  <StatChip icon={Zap} label="Daño" value={`${(((item as typeof SHIPS[number]).damageMult - 1) * 100 + 100).toFixed(0)}%`} color={item.color} />
                  <StatChip icon={CheckCircle2} label="Escudo inicial" value={(item as typeof SHIPS[number]).shieldFirstHit ? 'Sí' : 'No'} color={item.color} />
                </>
              ) : (
                <>
                  <StatChip icon={Heart} label="Salud máx" value={(item as typeof ZOMBIE_CHARACTERS[number]).maxHp.toString()} color={item.color} />
                  <StatChip icon={Gauge} label="Velocidad" value={`${(((item as typeof ZOMBIE_CHARACTERS[number]).speedMult - 1) * 100 + 100).toFixed(0)}%`} color={item.color} />
                  <StatChip icon={Zap} label="Daño" value={`${(((item as typeof ZOMBIE_CHARACTERS[number]).damageMult - 1) * 100 + 100).toFixed(0)}%`} color={item.color} />
                  <StatChip icon={CheckCircle2} label="Escudo inicial" value={(item as typeof ZOMBIE_CHARACTERS[number]).shieldFirstHit ? 'Sí' : 'No'} color={item.color} />
                </>
              )}
            </div>

            {isSelected ? (
              <div className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-bold flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5" />Personaje seleccionado</div>
            ) : (
              <button onClick={() => select(item.id)} className="w-full py-3 rounded-xl font-bold transition-colors shadow-lg active:scale-95" style={{ backgroundColor: item.color, color: '#0a0e1a', boxShadow: `0 0 15px ${item.color}40` }}>Seleccionar {item.name}</button>
            )}
          </div>
        </div>
      </div>

      <SuggestionModal open={showSuggestion} onClose={() => setShowSuggestion(false)} />
    </div>
  );
}

function StatChip({ icon: Icon, label, value, color }: { icon: typeof Heart; label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg bg-background/40 p-2 flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
      <div className="min-w-0">
        <p className="text-white/40 text-[10px] leading-tight">{label}</p>
        <p className="text-white font-bold text-xs leading-tight">{value}</p>
      </div>
    </div>
  );
}

function ShipPreview({ color }: { color: string }) {
  const safeId = color.replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10">
      <defs>
        <linearGradient id={`shipBody-${safeId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="60%" stopColor={color} stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`shipWing-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0.15" />
        </linearGradient>
        <radialGradient id={`cockpit-${safeId}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </radialGradient>
        <linearGradient id={`thruster-${safeId}`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="40%" stopColor={color} stopOpacity="0.6" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Thruster trails (animated) */}
      <g className="thruster-flame">
        <ellipse cx="12" cy="44" rx="14" ry="3" fill={`url(#thruster-${safeId})`} />
        <ellipse cx="12" cy="56" rx="14" ry="3" fill={`url(#thruster-${safeId})`} />
        <ellipse cx="8" cy="50" rx="10" ry="2.5" fill={`url(#thruster-${safeId})`} opacity="0.7" />
      </g>

      {/* Lower cyber wings */}
      <path d="M 30 62 L 18 78 L 28 72 L 45 68 Z" fill={`url(#shipWing-${safeId})`} stroke={color} strokeWidth="1" opacity="0.8" />
      {/* Upper cyber wings */}
      <path d="M 30 38 L 18 22 L 28 28 L 45 32 Z" fill={`url(#shipWing-${safeId})`} stroke={color} strokeWidth="1" opacity="0.8" />

      {/* Wing neon edge lights */}
      <line x1="18" y1="22" x2="28" y2="28" stroke={color} strokeWidth="1.5" opacity="0.9" />
      <line x1="18" y1="78" x2="28" y2="72" stroke={color} strokeWidth="1.5" opacity="0.9" />

      {/* Main fuselage — sleek arrow shape */}
      <path d="M 25 50 L 50 38 L 82 50 L 50 62 Z" fill={`url(#shipBody-${safeId})`} stroke={color} strokeWidth="2" />

      {/* Fuselage center line */}
      <line x1="30" y1="50" x2="78" y2="50" stroke={color} strokeWidth="0.8" opacity="0.6" />

      {/* Crystal cockpit */}
      <ellipse cx="58" cy="50" rx="12" ry="6" fill={`url(#cockpit-${safeId})`} stroke={color} strokeWidth="1.5" />
      <ellipse cx="55" cy="47" rx="5" ry="2" fill="rgba(255,255,255,0.6)" />

      {/* Nose tip highlight */}
      <circle cx="82" cy="50" r="2" fill="rgba(255,255,255,0.8)" />

      {/* Side fin details */}
      <path d="M 35 42 L 42 36 L 48 40 Z" fill={color} opacity="0.4" stroke={color} strokeWidth="0.8" />
      <path d="M 35 58 L 42 64 L 48 60 Z" fill={color} opacity="0.4" stroke={color} strokeWidth="0.8" />

      {/* Engine exhaust ports */}
      <circle cx="28" cy="46" r="2.5" fill={color} opacity="0.8" />
      <circle cx="28" cy="54" r="2.5" fill={color} opacity="0.8" />
      <circle cx="28" cy="50" r="2" fill={color} opacity="0.6" />
    </svg>
  );
}

function ZombieCharPreview({ color }: { color: string }) {
  const safeId = color.replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10">
      <defs>
        <linearGradient id={`armor-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`helmet-${safeId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id={`visor-${safeId}`} cx="50%" cy="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </radialGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="50" cy="89" rx="20" ry="4" fill="rgba(0,0,0,0.5)" />

      {/* Legs — tactical pants with knee pads */}
      <rect x="42" y="62" width="7" height="24" fill="#2a3a1a" rx="2" stroke="#1a2a0a" strokeWidth="0.5" />
      <rect x="51" y="62" width="7" height="24" fill="#2a3a1a" rx="2" stroke="#1a2a0a" strokeWidth="0.5" />
      {/* Knee pads */}
      <ellipse cx="45.5" cy="74" rx="4" ry="2.5" fill={color} opacity="0.4" stroke={color} strokeWidth="0.5" />
      <ellipse cx="54.5" cy="74" rx="4" ry="2.5" fill={color} opacity="0.4" stroke={color} strokeWidth="0.5" />
      {/* Boots */}
      <rect x="41" y="83" width="9" height="5" fill="#1a1a1a" rx="1.5" />
      <rect x="50" y="83" width="9" height="5" fill="#1a1a1a" rx="1.5" />

      {/* Chest armor plate */}
      <path d="M 36 40 L 64 40 L 62 62 L 38 62 Z" fill={`url(#armor-${safeId})`} stroke={color} strokeWidth="1.5" />
      {/* Chest plate detail — tactical vest */}
      <rect x="44" y="44" width="12" height="16" fill="rgba(0,0,0,0.35)" rx="2" stroke={color} strokeWidth="0.5" />
      {/* Chest neon strip */}
      <line x1="40" y1="50" x2="60" y2="50" stroke={color} strokeWidth="1" opacity="0.8" />
      {/* Ammo pouches */}
      <rect x="39" y="54" width="4" height="5" fill="#1a1a1a" rx="1" stroke={color} strokeWidth="0.3" />
      <rect x="57" y="54" width="4" height="5" fill="#1a1a1a" rx="1" stroke={color} strokeWidth="0.3" />

      {/* Left arm (holding rifle) */}
      <rect x="28" y="42" width="7" height="18" rx="3" fill={color} opacity="0.75" stroke={color} strokeWidth="0.5" />
      {/* Shoulder pad */}
      <ellipse cx="31" cy="42" rx="5" ry="3.5" fill={color} opacity="0.5" stroke={color} strokeWidth="0.8" />
      {/* Right arm */}
      <rect x="65" y="42" width="7" height="18" rx="3" fill={color} opacity="0.75" stroke={color} strokeWidth="0.5" />
      <ellipse cx="69" cy="42" rx="5" ry="3.5" fill={color} opacity="0.5" stroke={color} strokeWidth="0.8" />

      {/* Assault rifle in hands */}
      <rect x="24" y="50" width="22" height="3" fill="#1a1a1a" rx="1" />
      <rect x="28" y="53" width="6" height="5" fill="#1a1a1a" rx="1" />
      {/* Rifle neon sight */}
      <line x1="35" y1="48" x2="35" y2="50" stroke={color} strokeWidth="1" opacity="0.9" />
      <circle cx="35" cy="47.5" r="1" fill={color} opacity="0.8" />

      {/* Neck */}
      <rect x="47" y="36" width="6" height="5" fill="#c4a474" />

      {/* Head */}
      <circle cx="50" cy="30" r="11" fill="#c4a474" stroke={color} strokeWidth="1" />

      {/* Combat helmet */}
      <path d="M 38 28 A 12 12 0 0 1 62 28 L 62 26 Q 50 18 38 26 Z" fill={`url(#helmet-${safeId})`} stroke={color} strokeWidth="1.5" />
      {/* Helmet rim */}
      <ellipse cx="50" cy="28" rx="12" ry="2.5" fill="none" stroke={color} strokeWidth="1" opacity="0.6" />
      {/* Helmet top ridge */}
      <line x1="50" y1="18" x2="50" y2="26" stroke={color} strokeWidth="0.8" opacity="0.5" />

      {/* Neon visor (animated glow) */}
      <rect x="42" y="29" width="16" height="4" rx="2" fill={`url(#visor-${safeId})`} className="visor-glow" />
      <rect x="44" y="30" width="12" height="1.5" rx="0.75" fill="rgba(255,255,255,0.7)" />

      {/* Antenna on helmet */}
      <line x1="58" y1="22" x2="62" y2="14" stroke="#1a1a1a" strokeWidth="1" />
      <circle cx="62" cy="14" r="1.5" fill={color} opacity="0.8" />
    </svg>
  );
}
