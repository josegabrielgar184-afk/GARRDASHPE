'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/hooks/use-game';
import { makeCamera, makeCube, drawCubeWireframe, rotateAll, project, type Vec3, type Camera } from '@/lib/engine3d';

interface Ship {
  pos: Vec3;
  vel: Vec3;
  rot: Vec3;
  rotVel: Vec3;
  size: number;
  color: string;
  shooting: boolean;
  shotTimer: number;
}

interface Laser {
  pos: Vec3;
  vel: Vec3;
  life: number;
  color: string;
}

export function IntroScreen() {
  const { setScreen } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const cam: Camera = makeCamera(canvas.width, canvas.height);
    const cube = makeCube(1);

    const ships: Ship[] = [
      { pos: { x: -200, y: 50, z: 500 }, vel: { x: 1.5, y: -0.3, z: -3 }, rot: { x: 0, y: 0, z: 0 }, rotVel: { x: 0.02, y: 0.03, z: 0 }, size: 30, color: '#38bdf8', shooting: false, shotTimer: 0 },
      { pos: { x: 200, y: -30, z: 600 }, vel: { x: -1.2, y: 0.4, z: -3.5 }, rot: { x: 0, y: 0, z: 0 }, rotVel: { x: 0.03, y: -0.02, z: 0 }, size: 25, color: '#f87171', shooting: false, shotTimer: 0 },
      { pos: { x: 0, y: 100, z: 700 }, vel: { x: 0.8, y: -0.5, z: -4 }, rot: { x: 0, y: 0, z: 0 }, rotVel: { x: 0.01, y: 0.04, z: 0 }, size: 20, color: '#fbbf24', shooting: false, shotTimer: 0 },
    ];

    const lasers: Laser[] = [];

    const stars: { x: number; y: number; z: number; size: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000 + 100,
        size: Math.random() * 2 + 0.5,
      });
    }

    let lastTime = performance.now();
    startTimeRef.current = lastTime;

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;
      const elapsed = (now - startTimeRef.current) / 1000;

      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars
      for (const star of stars) {
        star.z -= 2 * dt;
        if (star.z <= 1) {
          star.x = (Math.random() - 0.5) * 2000;
          star.y = (Math.random() - 0.5) * 2000;
          star.z = 2000;
        }
        const pp = project(star, cam);
        if (pp.visible) {
          ctx.fillStyle = `rgba(255,255,255,${Math.min(pp.scale * 2, 0.8)})`;
          ctx.fillRect(pp.sx, pp.sy, star.size, star.size);
        }
      }

      // Ships
      for (const ship of ships) {
        ship.pos.x += ship.vel.x * dt;
        ship.pos.y += ship.vel.y * dt;
        ship.pos.z += ship.vel.z * dt;
        ship.rot.x += ship.rotVel.x * dt;
        ship.rot.y += ship.rotVel.y * dt;

        if (ship.pos.z < 50) {
          ship.pos.z = 800 + Math.random() * 200;
          ship.pos.x = (Math.random() - 0.5) * 600;
          ship.pos.y = (Math.random() - 0.5) * 300;
        }

        ship.shotTimer -= dt * 16.67;
        if (ship.shotTimer <= 0) {
          ship.shooting = true;
          ship.shotTimer = 800 + Math.random() * 1000;
          lasers.push({
            pos: { x: ship.pos.x, y: ship.pos.y, z: ship.pos.z - 20 },
            vel: { x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2, z: -15 },
            life: 60,
            color: ship.color,
          });
        }

        drawCubeWireframe(ctx, cube, ship.pos, ship.rot, cam, ship.color, 2, `${ship.color}33`);
      }

      // Lasers
      for (let i = lasers.length - 1; i >= 0; i--) {
        const laser = lasers[i];
        laser.pos.x += laser.vel.x * dt;
        laser.pos.y += laser.vel.y * dt;
        laser.pos.z += laser.vel.z * dt;
        laser.life -= dt;
        if (laser.life <= 0 || laser.pos.z < 10) {
          lasers.splice(i, 1);
          continue;
        }
        const pp = project(laser.pos, cam);
        if (pp.visible) {
          const r = Math.max(2 * pp.scale, 1);
          ctx.fillStyle = laser.color;
          ctx.beginPath();
          ctx.arc(pp.sx, pp.sy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = `${laser.color}44`;
          ctx.beginPath();
          ctx.arc(pp.sx, pp.sy, r * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Title blinking
      const blink = Math.floor(elapsed * 2) % 2 === 0;
      const titleScale = Math.min(elapsed / 2, 1);
      const fadeOut = elapsed > 3.5 ? Math.max(0, 1 - (elapsed - 3.5) / 0.5) : 1;

      ctx.save();
      ctx.globalAlpha = fadeOut;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(titleScale, titleScale);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.min(canvas.width * 0.1, 48)}px Inter, sans-serif`;
      ctx.fillStyle = blink ? '#38bdf8' : '#1e3a5f';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 30;
      ctx.fillText('Garrdashpe 3D', 0, 0);
      ctx.shadowBlur = 0;

      ctx.font = `${Math.min(canvas.width * 0.03, 14)}px Inter, sans-serif`;
      ctx.fillStyle = '#ffffff80';
      ctx.fillText('Juego 3D Espacial y Apocalipsis Zombie', 0, 40);
      ctx.restore();

      if (elapsed > 4) {
        cancelAnimationFrame(rafRef.current);
        setScreen('login');
        return;
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [setScreen]);

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
      <div className="absolute bottom-8 left-0 right-0 text-center text-white/40 text-xs animate-pulse">
        Cargando...
      </div>
    </div>
  );
}
