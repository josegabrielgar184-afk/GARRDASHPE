export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint {
  sx: number;
  sy: number;
  scale: number;
  visible: boolean;
}

export interface Camera {
  fov: number;
  near: number;
  far: number;
  width: number;
  height: number;
}

export function makeCamera(width: number, height: number): Camera {
  return { fov: 800, near: 1, far: 2000, width, height };
}

export function project(p: Vec3, cam: Camera): ProjectedPoint {
  if (p.z <= cam.near) return { sx: 0, sy: 0, scale: 0, visible: false };
  if (p.z > cam.far) return { sx: 0, sy: 0, scale: 0, visible: false };
  const scale = cam.fov / p.z;
  const sx = cam.width / 2 + p.x * scale;
  const sy = cam.height / 2 - p.y * scale;
  return { sx, sy, scale, visible: true };
}

export function projectTo(p: Vec3, cam: Camera, out: ProjectedPoint): void {
  if (p.z <= cam.near || p.z > cam.far) {
    out.visible = false;
    out.scale = 0;
    return;
  }
  const scale = cam.fov / p.z;
  out.sx = cam.width / 2 + p.x * scale;
  out.sy = cam.height / 2 - p.y * scale;
  out.scale = scale;
  out.visible = true;
}

export interface CubeMesh {
  verts: Vec3[];
  edges: [number, number][];
  faces: [number, number, number, number][];
}

export function makeCube(size: number): CubeMesh {
  const s = size / 2;
  return {
    verts: [
      { x: -s, y: -s, z: -s },
      { x: s, y: -s, z: -s },
      { x: s, y: s, z: -s },
      { x: -s, y: s, z: -s },
      { x: -s, y: -s, z: s },
      { x: s, y: -s, z: s },
      { x: s, y: s, z: s },
      { x: -s, y: s, z: s },
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ],
    faces: [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [1, 2, 6, 5],
      [0, 3, 7, 4],
    ],
  };
}

export function rotateY(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.z * s, y: p.y, z: p.x * s + p.z * c };
}

export function rotateX(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c };
}

export function rotateZ(p: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: p.x * c - p.y * s, y: p.x * s + p.y * c, z: p.z };
}

export function rotateAll(p: Vec3, ax: number, ay: number, az: number): Vec3 {
  let r = rotateX(p, ax);
  r = rotateY(r, ay);
  r = rotateZ(r, az);
  return r;
}

export function drawCubeWire(
  ctx: CanvasRenderingContext2D,
  mesh: CubeMesh,
  pos: Vec3,
  rot: Vec3,
  cam: Camera,
  color: string,
  lineWidth: number,
  fillStyle?: string,
): void {
  const projected: ProjectedPoint[] = [];
  for (let i = 0; i < mesh.verts.length; i++) {
    const rotated = rotateAll(mesh.verts[i], rot.x, rot.y, rot.z);
    const world: Vec3 = { x: rotated.x + pos.x, y: rotated.y + pos.y, z: rotated.z + pos.z };
    const pp: ProjectedPoint = { sx: 0, sy: 0, scale: 0, visible: false };
    projectTo(world, cam, pp);
    projected.push(pp);
  }

  if (fillStyle) {
    const sortedFaces = [...mesh.faces].sort((a, b) => {
      let za = 0, zb = 0;
      for (const idx of a) za += projected[idx].scale;
      for (const idx of b) zb += projected[idx].scale;
      return zb - za;
    });
    for (const face of sortedFaces) {
      const p0 = projected[face[0]];
      if (!p0.visible) continue;
      ctx.beginPath();
      for (let i = 0; i < face.length; i++) {
        const pp = projected[face[i]];
        if (i === 0) ctx.moveTo(pp.sx, pp.sy);
        else ctx.lineTo(pp.sx, pp.sy);
      }
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  for (const [a, b] of mesh.edges) {
    const pa = projected[a];
    const pb = projected[b];
    if (!pa.visible || !pb.visible) continue;
    ctx.moveTo(pa.sx, pa.sy);
    ctx.lineTo(pb.sx, pb.sy);
  }
  ctx.stroke();
}

export function drawCubeWireframe(
  ctx: CanvasRenderingContext2D,
  mesh: CubeMesh,
  pos: Vec3,
  rot: Vec3,
  cam: Camera,
  color: string,
  lineWidth: number,
  fillStyle?: string,
): void {
  drawCubeWire(ctx, mesh, pos, rot, cam, color, lineWidth, fillStyle);
}

export function drawBillboard(
  ctx: CanvasRenderingContext2D,
  pos: Vec3,
  cam: Camera,
  drawFn: (scale: number) => void,
): boolean {
  const pp = project(pos, cam);
  if (!pp.visible) return false;
  ctx.save();
  ctx.translate(pp.sx, pp.sy);
  drawFn(pp.scale);
  ctx.restore();
  return true;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

export function dist2D(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by);
}

export interface Particle {
  pos: Vec3;
  vel: Vec3;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export function spawnParticles(
  list: Particle[],
  pos: Vec3,
  count: number,
  color: string,
  speed: number,
) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const elev = (Math.random() - 0.5) * Math.PI;
    const s = speed * (0.5 + Math.random() * 0.5);
    list.push({
      pos: { x: pos.x, y: pos.y, z: pos.z },
      vel: {
        x: Math.cos(angle) * Math.cos(elev) * s,
        y: Math.sin(elev) * s,
        z: Math.sin(angle) * Math.cos(elev) * s,
      },
      life: 30 + Math.random() * 20,
      maxLife: 50,
      color,
      size: 2 + Math.random() * 4,
    });
  }
}

export function updateParticles(particles: Particle[], dt: number) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.pos.x += p.vel.x * dt;
    p.pos.y += p.vel.y * dt;
    p.pos.z += p.vel.z * dt;
    p.vel.x *= 0.95;
    p.vel.y *= 0.95;
    p.vel.z *= 0.95;
    p.life -= dt;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  cam: Camera,
) {
  for (const p of particles) {
    const pp = project(p.pos, cam);
    if (!pp.visible) continue;
    const alpha = Math.max(0, p.life / p.maxLife);
    const r = Math.max(p.size * pp.scale, 1);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(pp.sx, pp.sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawCrosshair(
  ctx: CanvasRenderingContext2D,
  sx: number,
  sy: number,
  color: string,
  radius: number = 25,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(sx, sy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx, sy, radius * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(sx - radius - 5, sy);
  ctx.lineTo(sx - radius * 0.5, sy);
  ctx.moveTo(sx + radius * 0.5, sy);
  ctx.lineTo(sx + radius + 5, sy);
  ctx.moveTo(sx, sy - radius - 5);
  ctx.lineTo(sx, sy - radius * 0.5);
  ctx.moveTo(sx, sy + radius * 0.5);
  ctx.lineTo(sx, sy + radius + 5);
  ctx.stroke();
  ctx.shadowBlur = 0;
}
