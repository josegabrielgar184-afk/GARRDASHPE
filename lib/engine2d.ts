export interface Vec2 { x: number; y: number; }

export interface Particle2D {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export function spawnParticles2D(
  list: Particle2D[],
  x: number, y: number,
  count: number,
  color: string,
  speed: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const s = speed * (0.3 + Math.random() * 0.7);
    list.push({
      pos: { x, y },
      vel: { x: Math.cos(angle) * s, y: Math.sin(angle) * s },
      life: 20 + Math.random() * 20,
      maxLife: 40,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}

export function updateParticles2D(particles: Particle2D[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.vel.x *= 0.92;
    p.vel.y *= 0.92;
    p.life -= dt;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function drawParticles2D(ctx: CanvasRenderingContext2D, particles: Particle2D[]) {
  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawCrosshair2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  color: string,
  radius = 22,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.25, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - radius - 6, y); ctx.lineTo(x - radius * 0.4, y);
  ctx.moveTo(x + radius * 0.4, y); ctx.lineTo(x + radius + 6, y);
  ctx.moveTo(x, y - radius - 6); ctx.lineTo(x, y - radius * 0.4);
  ctx.moveTo(x, y + radius * 0.4); ctx.lineTo(x, y + radius + 6);
  ctx.stroke();
  ctx.restore();
}

export function drawShip2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  color: string,
  size = 20,
  shielded = false,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  // Main body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.6, -size * 0.7);
  ctx.lineTo(-size * 0.3, 0);
  ctx.lineTo(-size * 0.6, size * 0.7);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(size * 0.2, 0, size * 0.3, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing details
  ctx.strokeStyle = `${color}88`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.5);
  ctx.lineTo(-size * 0.5, -size * 0.6);
  ctx.moveTo(-size * 0.2, size * 0.5);
  ctx.lineTo(-size * 0.5, size * 0.6);
  ctx.stroke();

  // Engine glow
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(-size * 0.5, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  if (shielded) {
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawMeteor2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  rotation: number,
  hp: number,
  maxHp: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  // Main body - irregular rock shape
  const sides = 8;
  const verts: number[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const r = size * (0.7 + Math.sin(i * 2.3) * 0.3);
    verts.push(Math.cos(a) * r, Math.sin(a) * r);
  }

  ctx.fillStyle = '#6b5b4a';
  ctx.beginPath();
  ctx.moveTo(verts[0], verts[1]);
  for (let i = 2; i < verts.length; i += 2) ctx.lineTo(verts[i], verts[i + 1]);
  ctx.closePath();
  ctx.fill();

  // Crater details
  ctx.fillStyle = '#4a3f35';
  for (let i = 0; i < 3; i++) {
    const cx = (Math.sin(i * 3.7) * size * 0.4);
    const cy = (Math.cos(i * 2.1) * size * 0.4);
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Edge highlight
  ctx.strokeStyle = '#8a7a6a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(verts[0], verts[1]);
  for (let i = 2; i < verts.length; i += 2) ctx.lineTo(verts[i], verts[i + 1]);
  ctx.closePath();
  ctx.stroke();

  // Damage cracks
  if (hp < maxHp) {
    ctx.strokeStyle = '#ef444488';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.2);
    ctx.lineTo(size * 0.2, size * 0.1);
    ctx.lineTo(size * 0.1, size * 0.4);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawSoldier2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  walkCycle: number,
  color: string,
  shielded = false,
  weaponType: string = 'pistol',
) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(angle);

  const legSwing = Math.sin(walkCycle) * 5;

  // Tactical boots
  ctx.fillStyle = '#1a1a18';
  ctx.fillRect(-5, -3 + legSwing, 5, 4);
  ctx.fillRect(1, 3 - legSwing, 5, 4);

  // Legs with knee pads
  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-4, -2 + legSwing, 4, 8);
  ctx.fillRect(1, 2 - legSwing, 4, 8);
  // Knee pads
  ctx.fillStyle = '#1a2a0a';
  ctx.fillRect(-4, 2 + legSwing, 4, 3);
  ctx.fillRect(1, 2 - legSwing, 4, 3);

  // Backpack
  ctx.fillStyle = '#1a2812';
  ctx.fillRect(-7, -7, 14, 6);
  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-5, -6, 10, 4);
  // Backpack straps
  ctx.strokeStyle = '#0a1a02';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-4, -7); ctx.lineTo(-4, 2);
  ctx.moveTo(4, -7); ctx.lineTo(4, 2);
  ctx.stroke();

  // Body torso with plate carrier
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Plate carrier vest
  ctx.fillStyle = '#1a2a0a';
  ctx.fillRect(-7, -5, 14, 10);
  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-6, -4, 12, 8);
  // MOLLE webbing lines
  ctx.strokeStyle = '#0a1a02';
  ctx.lineWidth = 0.5;
  for (let i = -3; i <= 3; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i, -4); ctx.lineTo(i, 4);
    ctx.stroke();
  }
  // Neon chest line
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.fillRect(-5, -1, 10, 1.5);
  ctx.shadowBlur = 0;

  // Head
  ctx.fillStyle = '#c4a574';
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  // Tactical helmet
  ctx.fillStyle = '#1a2a0a';
  ctx.beginPath();
  ctx.arc(0, -1, 7.5, Math.PI, 0);
  ctx.fill();
  // Helmet rim
  ctx.fillStyle = '#0a1a02';
  ctx.fillRect(-7.5, -1, 15, 1.5);
  // Night vision goggles mount
  ctx.fillStyle = '#333';
  ctx.fillRect(-2, -7.5, 4, 2);
  ctx.fillStyle = '#555';
  ctx.fillRect(-1.5, -7, 3, 1);
  // Neon visor strip
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 4;
  ctx.fillRect(-4, -2, 8, 1.5);
  ctx.shadowBlur = 0;

  // Weapon pointing forward
  ctx.fillStyle = '#2a2a2a';
  if (weaponType === 'pistol') {
    ctx.fillRect(8, -2, 11, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(8, 1, 4, 5);
    ctx.fillStyle = '#555';
    ctx.fillRect(17, -1, 2, 2);
  } else if (weaponType === 'rifle') {
    ctx.fillRect(8, -2, 20, 3);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(12, 1, 5, 7);
    ctx.fillStyle = '#333';
    ctx.fillRect(6, -3, 4, 2);
    ctx.fillStyle = '#555';
    ctx.fillRect(26, -1, 3, 2);
  } else if (weaponType === 'shotgun') {
    ctx.fillRect(8, -2, 18, 5);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(8, 3, 8, 3);
    ctx.fillStyle = '#555';
    ctx.fillRect(24, -1, 3, 2);
  } else if (weaponType === 'grenade') {
    ctx.fillRect(8, -3, 16, 7);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(4, -2, 5, 5);
    ctx.fillStyle = '#666';
    ctx.fillRect(22, -4, 5, 9);
  }

  ctx.restore();

  if (shielded) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

export function drawZombie2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  walkCycle: number,
  size: number,
  color: string,
  isMutant: boolean,
  isTank: boolean,
) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 5, size * 0.75, size * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(angle);

  // Lurching walk — more aggressive stagger
  const lurch = Math.sin(walkCycle * 1.3) * (size * 0.08);
  const legSwing = Math.sin(walkCycle) * (size * 0.18);

  // Legs with tattered pants
  ctx.fillStyle = isTank ? '#5a1a1a' : isMutant ? '#3a2a4a' : '#2a3a1a';
  ctx.fillRect(-size * 0.22, -size * 0.15 + legSwing, size * 0.16, size * 0.5);
  ctx.fillRect(size * 0.06, size * 0.15 - legSwing, size * 0.16, size * 0.5);
  // Exposed bone on one leg
  ctx.fillStyle = isTank ? '#8a3a2a' : isMutant ? '#6a4a5a' : '#5a5a3a';
  ctx.fillRect(-size * 0.2, size * 0.2 + legSwing, size * 0.04, size * 0.15);

  // Hunched body — tilted forward
  ctx.save();
  ctx.translate(lurch, 0);
  ctx.rotate(0.15);

  // Body torso
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.48, size * 0.58, 0, 0, Math.PI * 2);
  ctx.fill();

  // Exposed ribcage
  ctx.strokeStyle = isTank ? '#8a3a2a' : isMutant ? '#6a4a5a' : '#5a5a3a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const ry = -size * 0.1 + i * size * 0.12;
    ctx.beginPath();
    ctx.moveTo(-size * 0.2, ry);
    ctx.lineTo(size * 0.2, ry);
    ctx.stroke();
  }

  // Torn clothing
  ctx.fillStyle = isTank ? '#4a0a0a' : isMutant ? '#2a1a3a' : '#1a2a0a';
  ctx.fillRect(-size * 0.3, -size * 0.25, size * 0.6, size * 0.2);
  // Torn edges
  ctx.fillStyle = isTank ? '#3a0808' : isMutant ? '#1a0a2a' : '#0a1a08';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(-size * 0.3 + i * size * 0.16, -size * 0.08, size * 0.06, size * 0.06);
  }

  // Arms reaching forward — aggressive claws
  ctx.fillStyle = color;
  const armReach = isTank ? size * 0.85 : isMutant ? size * 0.7 : size * 0.6;
  // Upper arm
  ctx.fillRect(size * 0.15, -size * 0.4, armReach * 0.6, size * 0.13);
  ctx.fillRect(size * 0.15, size * 0.27, armReach * 0.6, size * 0.13);
  // Forearm with claw
  ctx.fillStyle = isTank ? '#8a2a2a' : isMutant ? '#6a3a6a' : '#4a5a2a';
  ctx.fillRect(size * 0.15 + armReach * 0.6, -size * 0.38, armReach * 0.4, size * 0.1);
  ctx.fillRect(size * 0.15 + armReach * 0.6, size * 0.29, armReach * 0.4, size * 0.1);
  // Claws
  ctx.fillStyle = isTank ? '#dc2626' : isMutant ? '#a855f7' : '#65a30d';
  ctx.beginPath();
  ctx.moveTo(size * 0.15 + armReach, -size * 0.35);
  ctx.lineTo(size * 0.15 + armReach + size * 0.12, -size * 0.33);
  ctx.lineTo(size * 0.15 + armReach + size * 0.1, -size * 0.38);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15 + armReach, size * 0.32);
  ctx.lineTo(size * 0.15 + armReach + size * 0.12, size * 0.34);
  ctx.lineTo(size * 0.15 + armReach + size * 0.1, size * 0.29);
  ctx.closePath();
  ctx.fill();

  // Blood drips from arms
  ctx.fillStyle = 'rgba(139,0,0,0.6)';
  ctx.fillRect(size * 0.15 + armReach * 0.7, -size * 0.28, size * 0.03, size * 0.12);
  ctx.fillRect(size * 0.15 + armReach * 0.8, size * 0.38, size * 0.025, size * 0.1);

  // Head — tilted, menacing
  ctx.fillStyle = isTank ? '#b02020' : isMutant ? '#8a3aa0' : '#558010';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // Jaw torn open
  ctx.fillStyle = isTank ? '#5a0a0a' : isMutant ? '#3a1a4a' : '#2a3a0a';
  ctx.beginPath();
  ctx.arc(size * 0.08, size * 0.05, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  // Teeth
  ctx.fillStyle = '#ddd';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(size * 0.02 + i * size * 0.05, size * 0.02, size * 0.03, size * 0.05);
  }

  // Glowing eyes — intense predator stare
  const eyeColor = isTank ? '#fbbf24' : isMutant ? '#c084fc' : '#ef4444';
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(size * 0.1, -size * 0.1, size * 0.07, 0, Math.PI * 2);
  ctx.arc(size * 0.1, size * 0.1, size * 0.07, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow trail
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(size * 0.05, -size * 0.1, size * 0.12, 0, Math.PI * 2);
  ctx.arc(size * 0.05, size * 0.1, size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  ctx.restore();

  // Tank extra details — pulsing aura
  if (isTank) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
    ctx.stroke();
    // Spikes on back
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * size * 0.5, Math.sin(a) * size * 0.5);
      ctx.lineTo(Math.cos(a) * size * 0.7, Math.sin(a) * size * 0.7);
      ctx.lineTo(Math.cos(a + 0.15) * size * 0.5, Math.sin(a + 0.15) * size * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Mutant extra — pulsing veins
  if (isMutant) {
    ctx.strokeStyle = 'rgba(192,132,252,0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.3, -size * 0.2 + i * size * 0.15);
      ctx.lineTo(size * 0.1, -size * 0.1 + i * size * 0.15);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

export function drawEnemyShip2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  color: string,
  size = 18,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI);
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(-size * 0.5, -size * 0.6);
  ctx.lineTo(-size * 0.2, 0);
  ctx.lineTo(-size * 0.5, size * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(size * 0.2, 0, size * 0.2, size * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawBossShip2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  color: string,
  size = 50,
  hp: number,
  maxHp: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI);

  ctx.shadowColor = color;
  ctx.shadowBlur = 15;

  // Main hull
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(size, 0);
  ctx.lineTo(size * 0.3, -size * 0.7);
  ctx.lineTo(-size * 0.5, -size * 0.5);
  ctx.lineTo(-size * 0.7, 0);
  ctx.lineTo(-size * 0.5, size * 0.5);
  ctx.lineTo(size * 0.3, size * 0.7);
  ctx.closePath();
  ctx.fill();

  // Core
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Weapon pods
  ctx.fillStyle = '#333';
  ctx.fillRect(-size * 0.3, -size * 0.6, size * 0.15, size * 0.3);
  ctx.fillRect(-size * 0.3, size * 0.3, size * 0.15, size * 0.3);

  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawWeaponPickup2D(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  weaponType: string,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 0.003) * 4);

  const colors: Record<string, string> = {
    rifle: '#22d3ee', shotgun: '#fb923c', grenade: '#ef4444',
  };
  const color = colors[weaponType] || '#fbbf24';

  // Blinking neon halo circle
  const blink = 0.5 + 0.5 * Math.sin(time * 0.006);
  ctx.shadowColor = color;
  ctx.shadowBlur = 18 * blink + 6;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.8 * blink + 0.2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 0.3 * blink;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  // Draw real weapon sprite
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  if (weaponType === 'rifle') {
    // Tactical assault rifle
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-14, -3, 28, 6); // body
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-14, -3, 10, 6); // barrel
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-8, 3, 6, 5); // magazine
    ctx.fillStyle = '#555';
    ctx.fillRect(-16, -1, 3, 2); // muzzle
    ctx.fillStyle = color;
    ctx.fillRect(-2, -5, 8, 2); // sight rail
  } else if (weaponType === 'shotgun') {
    // Pump shotgun
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(-15, -2, 30, 5); // wooden body
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(-15, 1, 12, 4); // pump grip
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-18, -1, 4, 3); // barrel
    ctx.fillStyle = '#555';
    ctx.fillRect(-8, -4, 6, 2); // rear sight
  } else if (weaponType === 'grenade') {
    // Rocket launcher
    ctx.fillStyle = '#2a3a2a';
    ctx.fillRect(-16, -4, 32, 8); // tube body
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(-20, -3, 5, 6); // rear vent
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(12, -5, 6, 10); // muzzle front
    ctx.fillStyle = color;
    ctx.fillRect(-4, -6, 8, 2); // sight
  }
  ctx.shadowBlur = 0;

  ctx.restore();
}

export function drawMedKit2D(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 0.003) * 3);
  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.rect(-10, -10, 20, 20);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.fillRect(-2, -7, 4, 14);
  ctx.fillRect(-7, -2, 14, 4);
  ctx.shadowBlur = 0;
  ctx.restore();
}

export interface Star {
  x: number; y: number; z: number; size: number;
}

export function makeStars(count: number, w: number, h: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      z: Math.random() * 3 + 0.5,
      size: Math.random() * 2 + 0.5,
    });
  }
  return stars;
}

export function drawParallaxStars(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  dt: number,
  w: number,
  h: number,
  speed: number = 1,
) {
  for (const s of stars) {
    s.y += s.z * speed * dt;
    if (s.y > h) {
      s.y = 0;
      s.x = Math.random() * w;
    }
    const alpha = s.z / 3.5;
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(s.x, s.y, s.size, s.size);
  }
}

export function drawWarzoneBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollY: number,
) {
  // Night sky gradient — dark blue to black
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#0a0e1a');
  skyGrad.addColorStop(0.4, '#0d1220');
  skyGrad.addColorStop(0.7, '#0a0a12');
  skyGrad.addColorStop(1, '#080810');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Moonlight glow — top right
  const moonGrad = ctx.createRadialGradient(w * 0.8, h * 0.1, 0, w * 0.8, h * 0.1, h * 0.6);
  moonGrad.addColorStop(0, 'rgba(180,200,255,0.08)');
  moonGrad.addColorStop(0.5, 'rgba(120,140,200,0.03)');
  moonGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = moonGrad;
  ctx.fillRect(0, 0, w, h);

  // Ground texture noise — rubble and debris
  ctx.fillStyle = 'rgba(50,50,55,0.2)';
  for (let i = 0; i < 120; i++) {
    const x = (i * 37 + scrollY * 0.1) % w;
    const y = (i * 53 + scrollY * 0.05) % h;
    ctx.fillRect(x, y, 2, 2);
  }
  // Larger debris chunks
  ctx.fillStyle = 'rgba(40,40,45,0.3)';
  for (let i = 0; i < 20; i++) {
    const x = (i * 91 + scrollY * 0.08) % w;
    const y = (i * 67 + scrollY * 0.04) % h;
    ctx.fillRect(x, y, 4, 3);
  }

  // Craters with depth shadow
  const craters = [
    { x: w * 0.15, y: h * 0.35, r: 35 }, { x: w * 0.6, y: h * 0.55, r: 28 },
    { x: w * 0.85, y: h * 0.25, r: 22 }, { x: w * 0.35, y: h * 0.75, r: 30 },
  ];
  for (const c of craters) {
    const cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.r);
    cg.addColorStop(0, 'rgba(10,8,5,0.7)');
    cg.addColorStop(0.6, 'rgba(20,15,10,0.4)');
    cg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
    // Crater rim highlight
    ctx.strokeStyle = 'rgba(60,55,45,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Road cracks — shattered asphalt
  ctx.strokeStyle = 'rgba(30,30,35,0.5)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 7; i++) {
    const x = (i * w) / 7;
    ctx.beginPath();
    ctx.moveTo(x + 20, 0);
    ctx.lineTo(x - 30, h);
    ctx.stroke();
  }

  // Destroyed building silhouettes — distant skyline
  ctx.fillStyle = 'rgba(8,8,12,0.8)';
  const buildings = [
    { x: w * 0.05, bw: 40, bh: 60 }, { x: w * 0.12, bw: 30, bh: 40 },
    { x: w * 0.7, bw: 50, bh: 70 }, { x: w * 0.82, bw: 35, bh: 50 },
    { x: w * 0.92, bw: 28, bh: 35 },
  ];
  for (const b of buildings) {
    ctx.fillRect(b.x, 0, b.bw, b.bh);
    // Broken top edges
    ctx.fillStyle = 'rgba(5,5,8,0.9)';
    ctx.fillRect(b.x + b.bw * 0.3, 0, b.bw * 0.15, b.bh * 0.6);
    ctx.fillStyle = 'rgba(8,8,12,0.8)';
  }

  // Emergency flare lights — distant red/blue glow
  const flarePulse = 0.5 + 0.5 * Math.sin(scrollY * 0.01);
  const redFlare = ctx.createRadialGradient(w * 0.1, h * 0.15, 0, w * 0.1, h * 0.15, 60);
  redFlare.addColorStop(0, `rgba(255,30,30,${0.15 * flarePulse})`);
  redFlare.addColorStop(1, 'rgba(255,0,0,0)');
  ctx.fillStyle = redFlare;
  ctx.fillRect(0, 0, w * 0.3, h * 0.4);

  const blueFlare = ctx.createRadialGradient(w * 0.9, h * 0.2, 0, w * 0.9, h * 0.2, 60);
  blueFlare.addColorStop(0, `rgba(30,80,255,${0.12 * (1 - flarePulse)})`);
  blueFlare.addColorStop(1, 'rgba(0,0,255,0)');
  ctx.fillStyle = blueFlare;
  ctx.fillRect(w * 0.7, 0, w * 0.3, h * 0.4);

  // Barricades at borders — sandbag style
  ctx.fillStyle = '#2a2820';
  ctx.strokeStyle = '#3a3828';
  ctx.lineWidth = 1.5;
  for (let bx = 20; bx < w; bx += 80) {
    // Sandbag stack
    ctx.beginPath();
    ctx.roundRect(bx, 5, 50, 12, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3a3528';
    ctx.fillRect(bx + 5, 7, 18, 8);
    ctx.fillRect(bx + 28, 7, 18, 8);
    ctx.fillStyle = '#2a2820';
  }
  for (let bx = 20; bx < w; bx += 80) {
    ctx.beginPath();
    ctx.roundRect(bx, h - 17, 50, 12, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#3a3528';
    ctx.fillRect(bx + 5, h - 15, 18, 8);
    ctx.fillRect(bx + 28, h - 15, 18, 8);
    ctx.fillStyle = '#2a2820';
  }

  // Barbed wire between barricades
  ctx.strokeStyle = 'rgba(100,100,100,0.3)';
  ctx.lineWidth = 0.8;
  for (let bx = 70; bx < w; bx += 80) {
    ctx.beginPath();
    ctx.moveTo(bx, 11);
    for (let s = 0; s < 10; s++) {
      ctx.lineTo(bx + s * 1, 11 + Math.sin(s * 2) * 2);
    }
    ctx.stroke();
  }

  // Blood stains — darker, pooled
  ctx.fillStyle = 'rgba(60,8,8,0.35)';
  const stains = [
    { x: w * 0.2, y: h * 0.3, r: 28 }, { x: w * 0.7, y: h * 0.6, r: 22 },
    { x: w * 0.4, y: h * 0.8, r: 30 }, { x: w * 0.85, y: h * 0.2, r: 18 },
    { x: w * 0.55, y: h * 0.45, r: 25 },
  ];
  for (const s of stains) {
    const sg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
    sg.addColorStop(0, 'rgba(80,10,10,0.4)');
    sg.addColorStop(0.7, 'rgba(50,5,5,0.2)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fog layer — drifting mist at bottom
  const fogGrad = ctx.createLinearGradient(0, h * 0.6, 0, h);
  fogGrad.addColorStop(0, 'rgba(30,35,45,0)');
  fogGrad.addColorStop(1, 'rgba(25,30,40,0.25)');
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, h * 0.6, w, h * 0.4);

  // Vignette
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

// ─── Isometric 2.5D helpers ────────────────────────────────────────────────
// Convert world (x, y, z=0 ground) to screen with an isometric projection.
// The ground plane uses a 2:1 diamond ratio; z gives vertical lift for height.
export function isoProject(x: number, y: number, z: number, originX: number, originY: number, tileW: number, tileH: number) {
  return {
    sx: originX + (x - y) * (tileW / 2),
    sy: originY + (x + y) * (tileH / 2) - z,
  };
}

export function drawIsoGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollY: number,
) {
  // Dark asphalt base
  ctx.fillStyle = '#15171c';
  ctx.fillRect(0, 0, w, h);

  // Isometric grid lines
  const tileW = 64;
  const tileH = 32;
  const ox = w / 2;
  const oy = h * 0.18;

  ctx.strokeStyle = 'rgba(70,80,100,0.18)';
  ctx.lineWidth = 1;

  // Determine grid extent
  const maxR = 40;
  for (let r = -maxR; r <= maxR; r++) {
    // x = r, y varies
    const p1 = isoProject(r, -maxR, 0, ox, oy + (scrollY % tileH), tileW, tileH);
    const p2 = isoProject(r, maxR, 0, ox, oy + (scrollY % tileH), tileW, tileH);
    ctx.beginPath();
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.stroke();
    // y = r, x varies
    const q1 = isoProject(-maxR, r, 0, ox, oy + (scrollY % tileH), tileW, tileH);
    const q2 = isoProject(maxR, r, 0, ox, oy + (scrollY % tileH), tileW, tileH);
    ctx.beginPath();
    ctx.moveTo(q1.sx, q1.sy);
    ctx.lineTo(q2.sx, q2.sy);
    ctx.stroke();
  }

  // Scattered barricade crates (static positions, pseudo-random)
  ctx.fillStyle = '#2d2a22';
  ctx.strokeStyle = '#4a463a';
  ctx.lineWidth = 1.5;
  const crates: Array<[number, number]> = [
    [3, 2], [-4, 5], [6, -3], [-2, -6], [5, 6], [-6, -2], [1, 7], [-7, 3],
  ];
  for (const [gx, gy] of crates) {
    const base = isoProject(gx, gy, 0, ox, oy + (scrollY % tileH), tileW, tileH);
    const top = isoProject(gx, gy, 22, ox, oy + (scrollY % tileH), tileW, tileH);
    // Left face
    ctx.fillStyle = '#2a261e';
    ctx.beginPath();
    ctx.moveTo(base.sx - tileW / 2, base.sy);
    ctx.lineTo(base.sx, base.sy - tileH / 2);
    ctx.lineTo(base.sx, top.sy);
    ctx.lineTo(base.sx - tileW / 2, base.sy - tileH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right face
    ctx.fillStyle = '#3a3528';
    ctx.beginPath();
    ctx.moveTo(base.sx + tileW / 2, base.sy);
    ctx.lineTo(base.sx, base.sy - tileH / 2);
    ctx.lineTo(base.sx, top.sy);
    ctx.lineTo(base.sx + tileW / 2, base.sy - tileH / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Top face
    ctx.fillStyle = '#4a4636';
    ctx.beginPath();
    ctx.moveTo(base.sx, top.sy - tileH / 2);
    ctx.lineTo(base.sx + tileW / 2, base.sy - tileH / 2 + (top.sy - base.sy));
    ctx.lineTo(base.sx, top.sy);
    ctx.lineTo(base.sx - tileW / 2, base.sy - tileH / 2 + (top.sy - base.sy));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Blood stains on the ground
  ctx.fillStyle = 'rgba(80,15,15,0.22)';
  const stains: Array<[number, number]> = [[2, 3], [-3, 1], [4, -2], [-1, -4]];
  for (const [gx, gy] of stains) {
    const p = isoProject(gx, gy, 0, ox, oy + (scrollY % tileH), tileW, tileH);
    ctx.beginPath();
    ctx.ellipse(p.sx, p.sy, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vignette
  const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

// ─── Night Forest Isometric 2.5D Background ─────────────────────────────────

export function drawIsoForestGround(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scrollY: number,
) {
  const tileW = 64;
  const tileH = 32;
  const ox = w / 2;
  const oy = h * 0.15;
  const offsetY = scrollY % tileH;

  // Deep night-forest base
  ctx.fillStyle = '#0a1a0e';
  ctx.fillRect(0, 0, w, h);

  // Draw grass tiles (dark green) with a central dirt path
  const maxR = 30;
  for (let gx = -maxR; gx <= maxR; gx++) {
    for (let gy = -maxR; gy <= maxR; gy++) {
      const p = isoProject(gx, gy, 0, ox, oy + offsetY, tileW, tileH);
      if (p.sy < -tileH || p.sy > h + tileH) continue;

      // Central dirt path (ocres/brown) vs side grass (dark green)
      const onPath = Math.abs(gx) <= 1;
      let baseColor: string;
      let topColor: string;
      if (onPath) {
        baseColor = '#3d2f1a';
        topColor = '#4a3a22';
      } else {
        // Grass with slight variation
        const variation = ((gx * 7 + gy * 13) % 3 + 3) % 3;
        baseColor = variation === 0 ? '#14301a' : variation === 1 ? '#16361c' : '#12301a';
        topColor = variation === 0 ? '#1a3a22' : variation === 1 ? '#1c4028' : '#18381e';
      }

      // Left face (darker)
      ctx.fillStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(p.sx - tileW / 2, p.sy);
      ctx.lineTo(p.sx, p.sy + tileH / 2);
      ctx.lineTo(p.sx, p.sy + tileH);
      ctx.lineTo(p.sx - tileW / 2, p.sy + tileH / 2);
      ctx.closePath();
      ctx.fill();

      // Right face (mid)
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(p.sx + tileW / 2, p.sy);
      ctx.lineTo(p.sx, p.sy + tileH / 2);
      ctx.lineTo(p.sx, p.sy + tileH);
      ctx.lineTo(p.sx + tileW / 2, p.sy + tileH / 2);
      ctx.closePath();
      ctx.fill();

      // Top face (lighter)
      ctx.fillStyle = onPath ? '#5a4628' : '#1e4428';
      ctx.beginPath();
      ctx.moveTo(p.sx, p.sy - tileH / 2);
      ctx.lineTo(p.sx + tileW / 2, p.sy);
      ctx.lineTo(p.sx, p.sy + tileH / 2);
      ctx.lineTo(p.sx - tileW / 2, p.sy);
      ctx.closePath();
      ctx.fill();

      // Subtle tile outline
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(p.sx, p.sy - tileH / 2);
      ctx.lineTo(p.sx + tileW / 2, p.sy);
      ctx.lineTo(p.sx, p.sy + tileH / 2);
      ctx.lineTo(p.sx - tileW / 2, p.sy);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Grass blade details on side tiles
  ctx.fillStyle = '#2a5a32';
  const bladePositions: Array<[number, number]> = [
    [3, 2], [-4, 5], [5, -3], [-3, -5], [4, 4], [-5, -1], [2, 6], [-2, -4],
  ];
  for (const [gx, gy] of bladePositions) {
    const p = isoProject(gx, gy, 0, ox, oy + offsetY, tileW, tileH);
    for (let i = 0; i < 4; i++) {
      const bx = p.sx + (Math.sin(i * 2.3) * 10);
      const by = p.sy + 4 + (Math.cos(i * 1.7) * 6);
      ctx.fillRect(bx, by - 4, 1.5, 4);
    }
  }
}

export function drawIsoTree(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  ox: number,
  oy: number,
  tileW: number,
  tileH: number,
) {
  const base = isoProject(gx, gy, 0, ox, oy, tileW, tileH);
  const trunkH = 20;
  const trunkTop = isoProject(gx, gy, trunkH, ox, oy, tileW, tileH);
  const crownH = 36;

  // Trunk — left face (dark)
  ctx.fillStyle = '#2a1a0e';
  ctx.beginPath();
  ctx.moveTo(base.sx - 6, base.sy);
  ctx.lineTo(base.sx, base.sy + tileH / 2);
  ctx.lineTo(base.sx, trunkTop.sy + tileH / 2);
  ctx.lineTo(base.sx - 6, trunkTop.sy);
  ctx.closePath();
  ctx.fill();

  // Trunk — right face (lighter)
  ctx.fillStyle = '#3a2818';
  ctx.beginPath();
  ctx.moveTo(base.sx + 6, base.sy);
  ctx.lineTo(base.sx, base.sy + tileH / 2);
  ctx.lineTo(base.sx, trunkTop.sy + tileH / 2);
  ctx.lineTo(base.sx + 6, trunkTop.sy);
  ctx.closePath();
  ctx.fill();

  // Crown — three stacked diamond shapes (illuminated front, shaded sides)
  const crownBase = isoProject(gx, gy, trunkH, ox, oy, tileW, tileH);
  for (let layer = 0; layer < 3; layer++) {
    const cz = trunkH + layer * 12;
    const cTop = isoProject(gx, gy, cz + 14, ox, oy, tileW, tileH);
    const cMid = isoProject(gx, gy, cz, ox, oy, tileW, tileH);
    const cw = 20 - layer * 3;

    // Left face (dark green)
    ctx.fillStyle = '#0d2e14';
    ctx.beginPath();
    ctx.moveTo(cMid.sx - cw, cMid.sy);
    ctx.lineTo(cMid.sx, cMid.sy + tileH / 2);
    ctx.lineTo(cMid.sx, cTop.sy + tileH / 2);
    ctx.lineTo(cTop.sx - cw, cTop.sy);
    ctx.closePath();
    ctx.fill();

    // Right face (mid green)
    ctx.fillStyle = '#143d1c';
    ctx.beginPath();
    ctx.moveTo(cMid.sx + cw, cMid.sy);
    ctx.lineTo(cMid.sx, cMid.sy + tileH / 2);
    ctx.lineTo(cMid.sx, cTop.sy + tileH / 2);
    ctx.lineTo(cTop.sx + cw, cTop.sy);
    ctx.closePath();
    ctx.fill();

    // Top face (lighter green — illuminated)
    ctx.fillStyle = '#1a4a22';
    ctx.beginPath();
    ctx.moveTo(cTop.sx, cTop.sy - tileH / 2);
    ctx.lineTo(cTop.sx + cw, cTop.sy);
    ctx.lineTo(cTop.sx, cTop.sy + tileH / 2);
    ctx.lineTo(cTop.sx - cw, cTop.sy);
    ctx.closePath();
    ctx.fill();
  }
}

export function drawIsoRock(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  ox: number,
  oy: number,
  tileW: number,
  tileH: number,
) {
  const base = isoProject(gx, gy, 0, ox, oy, tileW, tileH);
  const rockH = 16;
  const top = isoProject(gx, gy, rockH, ox, oy, tileW, tileH);
  const rw = 18;

  // Left face (dark granite)
  ctx.fillStyle = '#2a2a30';
  ctx.beginPath();
  ctx.moveTo(base.sx - rw, base.sy);
  ctx.lineTo(base.sx, base.sy + tileH / 2);
  ctx.lineTo(base.sx, top.sy + tileH / 2);
  ctx.lineTo(top.sx - rw, top.sy);
  ctx.closePath();
  ctx.fill();

  // Right face (mid granite)
  ctx.fillStyle = '#3a3a42';
  ctx.beginPath();
  ctx.moveTo(base.sx + rw, base.sy);
  ctx.lineTo(base.sx, base.sy + tileH / 2);
  ctx.lineTo(base.sx, top.sy + tileH / 2);
  ctx.lineTo(top.sx + rw, top.sy);
  ctx.closePath();
  ctx.fill();

  // Top face (illuminated granite)
  ctx.fillStyle = '#4a4a52';
  ctx.beginPath();
  ctx.moveTo(top.sx, top.sy - tileH / 2);
  ctx.lineTo(top.sx + rw, top.sy);
  ctx.lineTo(top.sx, top.sy + tileH / 2);
  ctx.lineTo(top.sx - rw, top.sy);
  ctx.closePath();
  ctx.fill();

  // Crack detail
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(top.sx - 4, top.sy - 2);
  ctx.lineTo(top.sx + 2, top.sy + 3);
  ctx.lineTo(top.sx - 1, top.sy + 6);
  ctx.stroke();
}

// Flashlight cone around the player — drawn as an overlay after the scene
export function drawFlashlight(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const radius = Math.min(w, h) * 0.28;
  const grad = ctx.createRadialGradient(px, py, 10, px, py, radius);
  grad.addColorStop(0, `${color}55`);
  grad.addColorStop(0.4, `${color}22`);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(px, py, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Dark penumbra on far corners
  ctx.save();
  const vgrad = ctx.createRadialGradient(px, py, radius, px, py, Math.max(w, h));
  vgrad.addColorStop(0, 'rgba(0,0,0,0)');
  vgrad.addColorStop(1, 'rgba(0,0,0,0.7)');
  ctx.fillStyle = vgrad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function drawIsoSoldier(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  walkCycle: number,
  color: string,
  shielded = false,
  weaponType: string = 'pistol',
  muzzleFlash = 0,
) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow on the ground
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 18, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(angle);

  const legSwing = Math.sin(walkCycle) * 4;

  // Tactical boots
  ctx.fillStyle = '#1a1a18';
  ctx.fillRect(-6, -3 + legSwing, 6, 5);
  ctx.fillRect(1, 3 - legSwing, 6, 5);

  // Legs with knee pads
  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-5, -2 + legSwing, 5, 10);
  ctx.fillRect(1, 2 - legSwing, 5, 10);
  // Knee pads
  ctx.fillStyle = '#1a2a0a';
  ctx.fillRect(-5, 3 + legSwing, 5, 3);
  ctx.fillRect(1, 3 - legSwing, 5, 3);

  // Tactical backpack
  ctx.fillStyle = '#1a2812';
  ctx.fillRect(-8, -8, 16, 7);
  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-6, -7, 12, 5);
  // Backpack straps
  ctx.strokeStyle = '#0a1a02';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-5, -8); ctx.lineTo(-5, 3);
  ctx.moveTo(5, -8); ctx.lineTo(5, 3);
  ctx.stroke();
  // Antenna
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-6, -8); ctx.lineTo(-8, -14);
  ctx.stroke();

  // Body torso with plate carrier
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 13, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Plate carrier vest
  ctx.fillStyle = '#1a2a0a';
  ctx.fillRect(-8, -6, 16, 12);
  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-7, -5, 14, 10);
  // MOLLE webbing
  ctx.strokeStyle = '#0a1a02';
  ctx.lineWidth = 0.5;
  for (let i = -4; i <= 4; i += 2) {
    ctx.beginPath();
    ctx.moveTo(i, -5); ctx.lineTo(i, 5);
    ctx.stroke();
  }
  // Neon chest line
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 6;
  ctx.fillRect(-6, -1, 12, 2);
  ctx.shadowBlur = 0;

  // Head
  ctx.fillStyle = '#c4a574';
  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();

  // Tactical helmet
  ctx.fillStyle = '#1a2a0a';
  ctx.beginPath();
  ctx.arc(0, -1, 8.5, Math.PI, 0);
  ctx.fill();
  // Helmet rim
  ctx.fillStyle = '#0a1a02';
  ctx.fillRect(-8.5, -1, 17, 2);
  // Night vision goggles
  ctx.fillStyle = '#333';
  ctx.fillRect(-2.5, -8, 5, 2.5);
  ctx.fillStyle = '#555';
  ctx.fillRect(-2, -7.5, 4, 1.5);
  // Neon visor strip
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  ctx.fillRect(-5, -2, 10, 2);
  ctx.shadowBlur = 0;

  // Weapon pointing forward
  ctx.fillStyle = '#2a2a2a';
  if (weaponType === 'pistol') {
    ctx.fillRect(10, -2.5, 13, 5);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(10, 2, 5, 6);
    ctx.fillStyle = '#555';
    ctx.fillRect(21, -1, 2, 2);
  } else if (weaponType === 'rifle') {
    ctx.fillRect(10, -2, 24, 4);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(14, 2, 6, 8);
    ctx.fillStyle = '#333';
    ctx.fillRect(6, -3, 5, 2.5);
    ctx.fillStyle = '#555';
    ctx.fillRect(32, -1, 3, 2);
  } else if (weaponType === 'shotgun') {
    ctx.fillRect(10, -3, 22, 6);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(10, 3, 9, 4);
    ctx.fillStyle = '#555';
    ctx.fillRect(30, -1, 3, 2);
  } else if (weaponType === 'grenade') {
    ctx.fillRect(10, -3.5, 18, 8);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(4, -2, 6, 6);
    ctx.fillStyle = '#666';
    ctx.fillRect(26, -5, 6, 11);
  }

  // Muzzle flash neon
  if (muzzleFlash > 0) {
    const flashSize = 6 + muzzleFlash * 4;
    ctx.fillStyle = '#fff';
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(34, 0, flashSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(34, 0, flashSize * 1.5, 0, Math.PI * 2);
    ctx.fill();
    // Flash spikes
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(34 + flashSize, 0); ctx.lineTo(34 + flashSize * 2, 0);
    ctx.moveTo(34, -flashSize); ctx.lineTo(34, -flashSize * 1.8);
    ctx.moveTo(34, flashSize); ctx.lineTo(34, flashSize * 1.8);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();

  if (shielded) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.stroke();
    // Shield hex pattern
    ctx.globalAlpha = 0.15;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

export function drawIsoZombie(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  walkCycle: number,
  size: number,
  color: string,
  isMutant: boolean,
  isTank: boolean,
) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.ellipse(0, 6, size * 0.75, size * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(angle);

  // Lurching stagger
  const lurch = Math.sin(walkCycle * 1.3) * (size * 0.06);
  const legSwing = Math.sin(walkCycle) * (size * 0.15);

  // Legs with tattered pants
  ctx.fillStyle = isTank ? '#4a0a0a' : isMutant ? '#2a1a3a' : '#1a2a08';
  ctx.fillRect(-size * 0.24, -size * 0.15 + legSwing, size * 0.17, size * 0.55);
  ctx.fillRect(size * 0.07, size * 0.15 - legSwing, size * 0.17, size * 0.55);
  // Exposed bone
  ctx.fillStyle = isTank ? '#7a3a2a' : isMutant ? '#5a4a5a' : '#4a4a3a';
  ctx.fillRect(-size * 0.22, size * 0.2 + legSwing, size * 0.04, size * 0.18);

  // Hunched body
  ctx.save();
  ctx.translate(lurch, 0);
  ctx.rotate(0.12);

  // Torso
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.52, size * 0.62, 0, 0, Math.PI * 2);
  ctx.fill();

  // Exposed ribcage
  ctx.strokeStyle = isTank ? '#7a3a2a' : isMutant ? '#5a4a5a' : '#4a4a3a';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    const ry = -size * 0.1 + i * size * 0.13;
    ctx.beginPath();
    ctx.moveTo(-size * 0.22, ry);
    ctx.lineTo(size * 0.22, ry);
    ctx.stroke();
  }

  // Torn clothing
  ctx.fillStyle = isTank ? '#2a0808' : isMutant ? '#1a0a2a' : '#0a1a08';
  ctx.fillRect(-size * 0.35, -size * 0.28, size * 0.7, size * 0.22);
  // Torn edges
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-size * 0.3 + i * size * 0.14, -size * 0.08, size * 0.06, size * 0.07);
  }

  // Arms reaching forward — aggressive claws
  ctx.fillStyle = color;
  const armReach = isTank ? size * 0.9 : isMutant ? size * 0.75 : size * 0.6;
  // Upper arms
  ctx.fillRect(size * 0.15, -size * 0.42, armReach * 0.55, size * 0.14);
  ctx.fillRect(size * 0.15, size * 0.28, armReach * 0.55, size * 0.14);
  // Forearms
  ctx.fillStyle = isTank ? '#7a2a2a' : isMutant ? '#5a3a5a' : '#3a4a2a';
  ctx.fillRect(size * 0.15 + armReach * 0.55, -size * 0.4, armReach * 0.45, size * 0.11);
  ctx.fillRect(size * 0.15 + armReach * 0.55, size * 0.3, armReach * 0.45, size * 0.11);
  // Claws
  ctx.fillStyle = isTank ? '#dc2626' : isMutant ? '#a855f7' : '#65a30d';
  ctx.beginPath();
  ctx.moveTo(size * 0.15 + armReach, -size * 0.37);
  ctx.lineTo(size * 0.15 + armReach + size * 0.14, -size * 0.35);
  ctx.lineTo(size * 0.15 + armReach + size * 0.12, -size * 0.42);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(size * 0.15 + armReach, size * 0.33);
  ctx.lineTo(size * 0.15 + armReach + size * 0.14, size * 0.35);
  ctx.lineTo(size * 0.15 + armReach + size * 0.12, size * 0.28);
  ctx.closePath();
  ctx.fill();

  // Blood drips
  ctx.fillStyle = 'rgba(139,0,0,0.6)';
  ctx.fillRect(size * 0.15 + armReach * 0.65, -size * 0.3, size * 0.035, size * 0.14);
  ctx.fillRect(size * 0.15 + armReach * 0.75, size * 0.4, size * 0.03, size * 0.12);

  // Head — menacing, jaw torn
  ctx.fillStyle = isTank ? '#902020' : isMutant ? '#6a2a8a' : '#448010';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.37, 0, Math.PI * 2);
  ctx.fill();

  // Jaw
  ctx.fillStyle = isTank ? '#3a0808' : isMutant ? '#2a103a' : '#1a2a08';
  ctx.beginPath();
  ctx.arc(size * 0.1, size * 0.06, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
  // Teeth
  ctx.fillStyle = '#ddd';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(size * 0.03 + i * size * 0.06, size * 0.03, size * 0.035, size * 0.06);
  }

  // Glowing eyes — predator stare
  const eyeColor = isTank ? '#fbbf24' : isMutant ? '#c084fc' : '#ef4444';
  ctx.fillStyle = eyeColor;
  ctx.shadowColor = eyeColor;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(size * 0.12, -size * 0.12, size * 0.08, 0, Math.PI * 2);
  ctx.arc(size * 0.12, size * 0.12, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // Eye glow trail
  ctx.globalAlpha = 0.3;
  ctx.beginPath();
  ctx.arc(size * 0.06, -size * 0.12, size * 0.14, 0, Math.PI * 2);
  ctx.arc(size * 0.06, size * 0.12, size * 0.14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  ctx.restore();

  // Tank aura — pulsing with spikes
  if (isTank) {
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2);
    ctx.stroke();
    // Back spikes
    ctx.fillStyle = '#fbbf24';
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * size * 0.52, Math.sin(a) * size * 0.52);
      ctx.lineTo(Math.cos(a) * size * 0.75, Math.sin(a) * size * 0.75);
      ctx.lineTo(Math.cos(a + 0.15) * size * 0.52, Math.sin(a + 0.15) * size * 0.52);
      ctx.closePath();
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  // Mutant — pulsing veins
  if (isMutant) {
    ctx.strokeStyle = 'rgba(192,132,252,0.4)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 5;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-size * 0.3, -size * 0.2 + i * size * 0.15);
      ctx.lineTo(size * 0.1, -size * 0.1 + i * size * 0.15);
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// ─── Screen Shake ───────────────────────────────────────────────────────────

export class ScreenShake {
  private intensity = 0;
  private duration = 0;
  private maxDuration = 0;

  trigger(intensity: number, duration: number) {
    this.intensity = Math.max(this.intensity, intensity);
    this.duration = Math.max(this.duration, duration);
    this.maxDuration = this.duration;
  }

  update(dt: number) {
    if (this.duration > 0) {
      this.duration -= dt;
      if (this.duration <= 0) { this.intensity = 0; this.duration = 0; }
    }
  }

  getOffset(): { x: number; y: number } {
    if (this.duration <= 0) return { x: 0, y: 0 };
    const decay = this.duration / this.maxDuration;
    const mag = this.intensity * decay;
    return {
      x: (Math.random() - 0.5) * mag * 2,
      y: (Math.random() - 0.5) * mag * 2,
    };
  }

  get active() { return this.duration > 0; }
}

// ─── Muzzle Flash ─────────────────────────────────────────────────────────────

export interface MuzzleFlash {
  x: number; y: number; angle: number; color: string; life: number; maxLife: number; size: number;
}

export function spawnMuzzleFlash(list: MuzzleFlash[], x: number, y: number, angle: number, color: string, size = 20) {
  list.push({ x, y, angle, color, life: 8, maxLife: 8, size });
}

export function updateMuzzleFlashes(list: MuzzleFlash[], dt: number) {
  for (let i = list.length - 1; i >= 0; i--) {
    list[i].life -= dt;
    if (list[i].life <= 0) list.splice(i, 1);
  }
}

export function drawMuzzleFlashes(ctx: CanvasRenderingContext2D, list: MuzzleFlash[]) {
  for (const f of list) {
    const alpha = f.life / f.maxLife;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);
    ctx.globalAlpha = alpha;
    ctx.shadowColor = f.color;
    ctx.shadowBlur = 20 * alpha;
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(f.size * alpha, -f.size * 0.3 * alpha);
    ctx.lineTo(f.size * 1.2 * alpha, 0);
    ctx.lineTo(f.size * alpha, f.size * 0.3 * alpha);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, f.size * 0.3 * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

// ─── Metallic Coin & Faceted Diamond ────────────────────────────────────────

export function drawMetallicCoin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  spin: number = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  const w = Math.abs(Math.cos(spin)) * r + 1;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 8;

  const grad = ctx.createLinearGradient(-w, -r, w, r);
  grad.addColorStop(0, '#92520a');
  grad.addColorStop(0.3, '#f59e0b');
  grad.addColorStop(0.5, '#fde68a');
  grad.addColorStop(0.7, '#f59e0b');
  grad.addColorStop(1, '#7a4408');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, r, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#7a4408';
  ctx.lineWidth = 1;
  ctx.stroke();

  if (w > r * 0.4) {
    ctx.strokeStyle = '#92520a';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.65, r * 0.65, 0, 0, Math.PI * 2);
    ctx.stroke();

    if (w > r * 0.6) {
      ctx.fillStyle = '#7a4408';
      ctx.font = `bold ${Math.floor(r * 0.9)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 1);
    }

    const hl = ctx.createLinearGradient(-w, -r, -w * 0.3, -r * 0.2);
    hl.addColorStop(0, 'rgba(255,255,255,0.5)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = hl;
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.3, w * 0.7, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function drawFacetedDiamond(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  glow: number = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 8 + glow * 6;

  const h = size * 1.2;
  const w = size * 0.8;

  const topGrad = ctx.createLinearGradient(0, -h, 0, 0);
  topGrad.addColorStop(0, '#67e8f9');
  topGrad.addColorStop(0.5, '#22d3ee');
  topGrad.addColorStop(1, '#0891b2');
  ctx.fillStyle = topGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, h * 0.15);
  ctx.lineTo(-w, 0);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#155e75';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.15);
  ctx.lineTo(w, 0);
  ctx.lineTo(0, h);
  ctx.lineTo(-w, 0);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(0, h);
  ctx.moveTo(-w, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();

  const facetGrad = ctx.createLinearGradient(-w * 0.5, -h * 0.5, 0, 0);
  facetGrad.addColorStop(0, 'rgba(255,255,255,0.5)');
  facetGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = facetGrad;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(-w * 0.5, -h * 0.4);
  ctx.lineTo(0, h * 0.15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ─── Neon Glow Helpers ──────────────────────────────────────────────────────

export function drawNeonCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, glow = 15) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function drawNeonRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, glow = 12) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = glow;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Haptic Feedback ────────────────────────────────────────────────────────

export function hapticFeedback(duration = 30) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(duration); } catch {}
  }
}

export function hapticPattern(pattern: number | number[]) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch {}
  }
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// ─── Space Scene: Nebulas, Planets, Asteroids ──────────────────────────────

export function drawNebula(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  color: string,
  alpha: number = 0.15,
) {
  ctx.save();
  const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
  grad.addColorStop(0, color);
  grad.addColorStop(0.4, color + '80');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawLavaPlanet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number,
  time: number,
) {
  ctx.save();
  ctx.shadowColor = '#ff4500';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#2a1a0a';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.clip();
  ctx.shadowBlur = 0;
  const cracks = 7;
  for (let i = 0; i < cracks; i++) {
    const a = (i / cracks) * Math.PI * 2 + time * 0.0002;
    const x1 = x + Math.cos(a) * r * 0.3;
    const y1 = y + Math.sin(a) * r * 0.3;
    const x2 = x + Math.cos(a) * r * 0.9;
    const y2 = y + Math.sin(a) * r * 0.9;
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.003 + i);
    ctx.strokeStyle = `rgba(255,${80 + pulse * 60},0,${0.6 + pulse * 0.4})`;
    ctx.lineWidth = 2 + pulse * 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,100,0,0.15)';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawRockyPlanet(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  r: number,
) {
  ctx.save();
  ctx.fillStyle = '#4a4a52';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3a3a42';
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const cx = x + Math.cos(a) * r * 0.5;
    const cy = y + Math.sin(a) * r * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawAsteroid(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const sides = 7;
  ctx.fillStyle = '#5a5a5a';
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2;
    const r = size * (0.7 + Math.sin(i * 3.1) * 0.25);
    if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#7a7a7a';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#3a3a3a';
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.arc(Math.sin(i * 4.2) * size * 0.3, Math.cos(i * 2.7) * size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ─── Mechanical Beetle Enemy ───────────────────────────────────────────────

export function drawBeetleEnemy(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  angle: number,
  size: number,
  oscillation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI);
  ctx.shadowColor = '#84cc16';
  ctx.shadowBlur = 6;

  const wing = Math.sin(oscillation) * 0.15;
  ctx.fillStyle = '#3a4a1a';
  ctx.beginPath();
  ctx.ellipse(-size * 0.3, -size * 0.5 * (1 + wing), size * 0.4, size * 0.6, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-size * 0.3, size * 0.5 * (1 + wing), size * 0.4, size * 0.6, 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5a6a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#84cc16';
  ctx.beginPath();
  ctx.arc(size * 0.3, 0, size * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 5;
  ctx.beginPath();
  ctx.arc(size * 0.4, -size * 0.1, size * 0.06, 0, Math.PI * 2);
  ctx.arc(size * 0.4, size * 0.1, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2a3a0a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -size * 0.2);
  ctx.lineTo(size * 0.8, -size * 0.3);
  ctx.moveTo(size * 0.5, size * 0.2);
  ctx.lineTo(size * 0.8, size * 0.3);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Green Double-Shot Powerup ──────────────────────────────────────────────

export function drawDoubleShotPowerup(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y + Math.sin(time * 0.003) * 4);
  const blink = 0.5 + 0.5 * Math.sin(time * 0.006);
  ctx.shadowColor = '#22c55e';
  ctx.shadowBlur = 15 * blink + 5;
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7 * blink + 0.3;
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.fillStyle = '#22c55e';
  ctx.shadowBlur = 6;
  ctx.fillRect(-10, -3, 20, 6);
  ctx.fillStyle = '#86efac';
  ctx.fillRect(-8, -2, 16, 4);
  ctx.fillStyle = '#fff';
  ctx.fillRect(-6, -1, 3, 2);
  ctx.fillRect(3, -1, 3, 2);
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Nuclear Special Icon ───────────────────────────────────────────────────

export function drawNuclearIcon(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  glow: number = 0,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 10 + glow * 10;
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.8, a - 0.4, a + 0.4);
    ctx.stroke();
  }
  ctx.shadowBlur = 0;
  ctx.restore();
}

// ─── Post-Apocalyptic Scenery ───────────────────────────────────────────────

export function drawSchoolBus(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#3a3a1a';
  ctx.fillRect(-60, -30, 120, 40);
  ctx.fillStyle = '#5a5a2a';
  ctx.fillRect(-55, -25, 110, 30);
  ctx.fillStyle = 'rgba(100,150,200,0.3)';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(-48 + i * 20, -22, 14, 12);
  }
  ctx.fillStyle = '#2a2a0a';
  ctx.beginPath();
  ctx.arc(-35, 12, 10, 0, Math.PI * 2);
  ctx.arc(35, 12, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a1a0a';
  ctx.beginPath();
  ctx.arc(-35, 12, 5, 0, Math.PI * 2);
  ctx.arc(35, 12, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#4a4a1a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-60, -10);
  ctx.lineTo(60, -10);
  ctx.stroke();
  ctx.restore();
}

export function drawAmbulance(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#2a3a3a';
  ctx.fillRect(-50, -35, 100, 45);
  ctx.fillStyle = '#4a5a5a';
  ctx.fillRect(-45, -30, 90, 35);
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(-20, -20, 40, 20);
  ctx.fillStyle = '#ef4444';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('+', 0, -8);
  ctx.fillStyle = '#1a2a2a';
  ctx.beginPath();
  ctx.arc(-30, 12, 8, 0, Math.PI * 2);
  ctx.arc(30, 12, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCrane(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#3a3a2a';
  ctx.fillRect(-15, -60, 30, 80);
  ctx.fillStyle = '#5a5a3a';
  ctx.fillRect(-40, -50, 80, 15);
  ctx.strokeStyle = '#5a5a3a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(50, -80);
  ctx.stroke();
  ctx.strokeStyle = '#3a3a2a';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, -45 + i * 8);
    ctx.lineTo(50, -80 + i * 8);
    ctx.stroke();
  }
  ctx.strokeStyle = '#4a4a2a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, -80);
  ctx.lineTo(50, -30);
  ctx.stroke();
  ctx.fillStyle = '#2a2a1a';
  ctx.fillRect(-25, 15, 50, 10);
  ctx.restore();
}

export function drawTaxi(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  scale: number,
  rotation: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#3a3a0a';
  ctx.fillRect(-45, -20, 90, 30);
  ctx.fillStyle = '#5a5a1a';
  ctx.fillRect(-40, -15, 80, 20);
  ctx.fillStyle = 'rgba(200,200,100,0.4)';
  ctx.fillRect(-30, -12, 25, 12);
  ctx.fillRect(5, -12, 25, 12);
  ctx.fillStyle = '#1a1a0a';
  ctx.beginPath();
  ctx.arc(-25, 12, 8, 0, Math.PI * 2);
  ctx.arc(25, 12, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Ally Units: Cowgirl + Soldier ──────────────────────────────────────────

export function drawCowgirl(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  walkCycle: number,
  muzzleFlash: number,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const legSwing = Math.sin(walkCycle) * 3;
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(-5, -2 + legSwing, 4, 12);
  ctx.fillRect(1, 2 - legSwing, 4, 12);

  ctx.fillStyle = '#8b5a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d4a574';
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8b6a3a';
  ctx.beginPath();
  ctx.ellipse(0, -5, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#6b4a2a';
  ctx.fillRect(-7, -6, 14, 3);

  ctx.fillStyle = '#444';
  ctx.fillRect(8, -2, 20, 3);
  ctx.fillStyle = '#666';
  ctx.fillRect(6, 1, 6, 6);

  if (muzzleFlash > 0) {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(30, -1, 5 + muzzleFlash * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

export function drawAllySoldier(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  walkCycle: number,
  muzzleFlash: number,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(0, 4, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const legSwing = Math.sin(walkCycle) * 3;
  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-5, -2 + legSwing, 5, 12);
  ctx.fillRect(1, 2 - legSwing, 5, 12);

  ctx.fillStyle = '#3a4a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2a3a1a';
  ctx.fillRect(-7, -5, 14, 10);

  ctx.fillStyle = '#d4a574';
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2a3a1a';
  ctx.beginPath();
  ctx.arc(0, -1, 7, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#333';
  ctx.fillRect(8, -2, 14, 4);
  ctx.fillRect(12, 2, 4, 6);

  if (muzzleFlash > 0) {
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(24, 0, 4 + muzzleFlash * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

// ─── Boss Bomber Zombie with Axe ─────────────────────────────────────────────

export function drawBossBomber(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  walkCycle: number,
  size: number,
  axeSwing: number,
  time: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, 6, size * 0.7, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  const legSwing = Math.sin(walkCycle) * (size * 0.1);
  ctx.fillStyle = '#3a1a0a';
  ctx.fillRect(-size * 0.2, -size * 0.15 + legSwing, size * 0.16, size * 0.5);
  ctx.fillRect(size * 0.04, size * 0.15 - legSwing, size * 0.16, size * 0.5);

  ctx.fillStyle = '#5a2a0a';
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.5, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3a1a0a';
  ctx.fillRect(-size * 0.35, -size * 0.25, size * 0.7, size * 0.35);

  ctx.fillStyle = '#7a3a1a';
  ctx.fillRect(size * 0.15, -size * 0.4, size * 0.5, size * 0.12);
  ctx.fillRect(size * 0.15, size * 0.28, size * 0.5, size * 0.12);

  ctx.fillStyle = '#8a1a0a';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(size * 0.1, -size * 0.1, size * 0.08, 0, Math.PI * 2);
  ctx.arc(size * 0.1, size * 0.1, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.save();
  ctx.translate(size * 0.4, -size * 0.3);
  ctx.rotate(Math.sin(axeSwing) * 0.6);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(0, -2, size * 0.6, 4);
  ctx.fillStyle = '#8a8a8a';
  ctx.beginPath();
  ctx.moveTo(size * 0.5, -8);
  ctx.lineTo(size * 0.7, -2);
  ctx.lineTo(size * 0.5, 8);
  ctx.lineTo(size * 0.45, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#aaa';
  ctx.fillRect(size * 0.5, -6, size * 0.15, 12);
  ctx.restore();

  ctx.restore();
}

// ─── Blood Splatter ──────────────────────────────────────────────────────────

export function drawBloodSplatter(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  size: number,
  alpha: number = 0.6,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#8b0000';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const d = size * (0.3 + Math.random() * 0.7);
    const r = size * (0.1 + Math.random() * 0.2);
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Debug Footer ────────────────────────────────────────────────────────────

export function drawDebugFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  fps: number,
) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, h - 20, w, 20);
  ctx.fillStyle = '#22d3ee';
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`6.88 ID: 508404245 Server: GS02  |  FPS: ${fps}`, 8, h - 7);
  ctx.restore();
}
