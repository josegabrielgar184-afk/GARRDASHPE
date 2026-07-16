export interface CharacterDef {
  id: string;
  name: string;
  color: string;
  glow: string;
  skill: string;
  skillDesc: string;
  speedMult: number;
  shieldFirstHit: boolean;
  magnetMeds: boolean;
  scoreMult: number;
  shotgunDmgMult: number;
}

export interface ShipDef {
  id: string;
  name: string;
  color: string;
  glow: string;
  skill: string;
  skillDesc: string;
  speedMult: number;
  shieldFirstHit: boolean;
  fireRateMult: number;
  damageMult: number;
  scoreMult: number;
}

export interface ZombieCharDef {
  id: string;
  name: string;
  color: string;
  glow: string;
  skill: string;
  skillDesc: string;
  speedMult: number;
  shieldFirstHit: boolean;
  magnetMeds: boolean;
  scoreMult: number;
  shotgunDmgMult: number;
  maxHp: number;
  damageMult: number;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'alpha',
    name: 'Alpha',
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.6)',
    skill: '+15% Velocidad de movimiento',
    skillDesc: 'Alpha es un piloto experimentado que se mueve un 15% más rápido en todos los modos de juego, ideal para esquivar asteroides y hordas zombies.',
    speedMult: 1.15,
    shieldFirstHit: false,
    magnetMeds: false,
    scoreMult: 1,
    shotgunDmgMult: 1,
  },
  {
    id: 'beta',
    name: 'Beta',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.6)',
    skill: 'Escudo contra el primer impacto',
    skillDesc: 'Beta comienza cada partida con un escudo energético que absorbe el primer impacto recibido sin perder vida. Perfecto para jugadores agresivos.',
    speedMult: 1,
    shieldFirstHit: true,
    magnetMeds: false,
    scoreMult: 1,
    shotgunDmgMult: 1,
  },
  {
    id: 'garr',
    name: 'Garr',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.6)',
    skill: 'Imán para atraer botiquines',
    skillDesc: 'Garr tiene un campo magnético que atrae los botiquines rojos desde el doble de distancia, curándote sin necesidad de ir directamente encima de ellos.',
    speedMult: 1,
    shieldFirstHit: false,
    magnetMeds: true,
    scoreMult: 1,
    shotgunDmgMult: 1,
  },
  {
    id: 'delta',
    name: 'Delta',
    color: '#f87171',
    glow: 'rgba(248,113,113,0.6)',
    skill: 'Doble puntuación por baja',
    skillDesc: 'Delta acumula el doble de puntos por cada enemigo eliminado y por cada segundo de supervivencia. La elección óptima para subir en el ranking global.',
    speedMult: 1,
    shieldFirstHit: false,
    magnetMeds: false,
    scoreMult: 2,
    shotgunDmgMult: 1,
  },
  {
    id: 'omega',
    name: 'Omega',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.6)',
    skill: '+50% daño de escopeta',
    skillDesc: 'Omega es el especialista en armas pesadas: su escopeta hace un 50% más de daño por pellet, eliminando zombies con un solo disparo a corta distancia.',
    speedMult: 1,
    shieldFirstHit: false,
    magnetMeds: false,
    scoreMult: 1,
    shotgunDmgMult: 1.5,
  },
];

export const SHIPS: ShipDef[] = [
  {
    id: 'alpha',
    name: 'Nave Alpha',
    color: '#38bdf8',
    glow: 'rgba(56,189,248,0.7)',
    skill: '+15% Velocidad y agilidad',
    skillDesc: 'Nave de combate ligera con propulsores de neón cian. Su gran velocidad permite esquivar asteroides y fuego enemigo con movimientos fluidos.',
    speedMult: 1.15,
    shieldFirstHit: false,
    fireRateMult: 1,
    damageMult: 1,
    scoreMult: 1,
  },
  {
    id: 'phoenix',
    name: 'Nave Phoenix',
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.7)',
    skill: 'Escudo de flamas inicial',
    skillDesc: 'Forjada con plasma ígneo, la Phoenix arranca cada misión con un escudo térmico que absorbe el primer impacto. Sus llamas anaranjadas dejan estela al moverse.',
    speedMult: 1,
    shieldFirstHit: true,
    fireRateMult: 1,
    damageMult: 1,
    scoreMult: 1,
  },
  {
    id: 'vanguard',
    name: 'Nave Vanguard',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.7)',
    skill: '+30% cadencia de disparo',
    skillDesc: 'La Vanguard es una nave de asalto púrpura con cañones de neón de disparo rápido. Su elevada cadencia compensa el menor daño por disparo individual.',
    speedMult: 1,
    shieldFirstHit: false,
    fireRateMult: 1.3,
    damageMult: 0.85,
    scoreMult: 1,
  },
];

export const ZOMBIE_CHARACTERS: ZombieCharDef[] = [
  {
    id: 'soldier',
    name: 'Soldado de Élite',
    color: '#34d399',
    glow: 'rgba(52,211,153,0.6)',
    skill: '+25% Salud máxima',
    skillDesc: 'Veterano de fuerzas especiales con armadura táctica verde. Su resistencia aumentada le otorga 125 HP base, ideal para aguantar emboscadas zombie.',
    speedMult: 1,
    shieldFirstHit: false,
    magnetMeds: false,
    scoreMult: 1,
    shotgunDmgMult: 1,
    maxHp: 125,
    damageMult: 1,
  },
  {
    id: 'cyberpunk',
    name: 'Cazadora Cyberpunk',
    color: '#22d3ee',
    glow: 'rgba(34,211,238,0.6)',
    skill: '+20% Velocidad de movimiento',
    skillDesc: 'Cazadora con implantes neón cian que aumentan su velocidad un 20%. Perfecta para kitear hordas y reubicarse rápidamente por el escenario isométrico.',
    speedMult: 1.2,
    shieldFirstHit: false,
    magnetMeds: false,
    scoreMult: 1,
    shotgunDmgMult: 1,
    maxHp: 100,
    damageMult: 1,
  },
  {
    id: 'warrior',
    name: 'Guerrero con Armadura',
    color: '#fbbf24',
    glow: 'rgba(251,191,36,0.6)',
    skill: 'Escudo inicial +15% daño',
    skillDesc: 'Tanque con armadura pesada dorada que comienza cada partida con escudo energético y sus disparos hacen un 15% más de daño. Equilibrio entre defensa y ataque.',
    speedMult: 0.95,
    shieldFirstHit: true,
    magnetMeds: false,
    scoreMult: 1,
    shotgunDmgMult: 1,
    maxHp: 110,
    damageMult: 1.15,
  },
];

export function getCharacter(id: string): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
}

export function getShip(id: string): ShipDef {
  return SHIPS.find((s) => s.id === id) ?? SHIPS[0];
}

export function getZombieCharacter(id: string): ZombieCharDef {
  return ZOMBIE_CHARACTERS.find((c) => c.id === id) ?? ZOMBIE_CHARACTERS[0];
}
