'use client';

import React, { useEffect, useRef } from 'react';

const DEFAULT_IMAGES = Array.from({ length: 35 }).map((_, i) => `/proj${(i % 5) + 1}.png`);

export default function CanvasImagePile({ srcs = DEFAULT_IMAGES }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const objsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    let mounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = Math.max(1, window.devicePixelRatio || 1);

    const IMG_SIZE = 160;
    const DRAW_SIZE = 80;
    const CORNER_RADIUS = 8;
    const MOUSE_RADIUS = 300;
    const MOUSE_STRENGTH = 12000;
    const UPWARD_BIAS = 1.6;
    const GRAVITY = 1200;
    const RESTITUTION = 0.5;
    const COLLISION_E = 0.62;
    const CELL_SIZE = DRAW_SIZE * 1.4;
    const MAX_VEL = 2500;

    // Physics tuning
    const FIXED_STEP = 1 / 60; // seconds
    const MAX_SUB_STEPS = 4;
    const COLLISION_ITER = 3; // solver iterations
    const POS_CORRECTION_PERCENT = 0.2; // positional correction
    const POS_CORRECTION_SLOP = 0.01; // allowed slop before correction
    const SLEEP_VEL = 6; // threshold linear speed
    const SLEEP_ANG = 0.04; // threshold angular speed (rad/sec)
    const SLEEP_TIME = 0.5; // seconds stable before sleeping
    const ANGULAR_DAMPING = 0.92; // per-step (applied each physics step)
    const LINEAR_DAMPING = 0.995;

    // torque scaling for mouse: tweak if you want stronger/weaker rotation
    const TORQUE_SCALE = 0.0000009; // small number, combined with lever arm & force

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const len2 = (x, y) => x * x + y * y;

    const loadAndScale = (sources) =>
      Promise.all(
        sources.map(
          (src) =>
            new Promise((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = src;
              img.onload = () => {
                const off = document.createElement('canvas');
                off.width = IMG_SIZE;
                off.height = IMG_SIZE;
                const octx = off.getContext('2d');
                const iw = img.naturalWidth;
                const ih = img.naturalHeight;
                const ir = iw / ih;
                const or = 1;
                let sx = 0, sy = 0, sw = iw, sh = ih;
                if (ir > or) { sw = ih * or; sx = (iw - sw) / 2; } 
                else { sh = iw / or; sy = (ih - sh) / 2; }
                try { octx.drawImage(img, sx, sy, sw, sh, 0, 0, IMG_SIZE, IMG_SIZE); } 
                catch { octx.drawImage(img, 0, 0, IMG_SIZE, IMG_SIZE); }
                resolve(off);
              };
              img.onerror = () => {
                const fallback = document.createElement('canvas');
                fallback.width = IMG_SIZE;
                fallback.height = IMG_SIZE;
                const fctx = fallback.getContext('2d');
                fctx.fillStyle = '#ddd';
                fctx.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
                resolve(fallback);
              };
            })
        )
      );

    const resizeCanvas = () => {
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      canvas.width = Math.round(cssW * DPR);
      canvas.height = Math.round(cssH * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const onMouseMove = (e) => { mouseRef.current.x = e.clientX; mouseRef.current.y = e.clientY; };
    const onTouchMove = (e) => { if (e.touches[0]) { mouseRef.current.x = e.touches[0].clientX; mouseRef.current.y = e.touches[0].clientY; } };
    const onLeave = () => { mouseRef.current.x = -9999; mouseRef.current.y = -9999; };

    (async () => {
      const imgs = await loadAndScale(srcs);
      if (!mounted) return;

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas, { passive: true });
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('mouseleave', onLeave);
      window.addEventListener('mouseout', onLeave);

      const W = window.innerWidth;
      const H = window.innerHeight;

      objsRef.current = imgs.map((imgCanvas) => ({
        img: imgCanvas,
        x: Math.random() * (W - DRAW_SIZE) + DRAW_SIZE / 2,
        y: -20 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 40,
        angle: (Math.random() - 0.5) * Math.PI,
        va: (Math.random() - 0.5) * 1.8, // reduced initial spin
        w: DRAW_SIZE,
        h: DRAW_SIZE,
        r: DRAW_SIZE * 0.5,
        mass: 1 + Math.random() * 0.6,
        sleepTimer: 0,
        asleep: false,
      }));

      let lastTime = performance.now();
      let accumulator = 0;
      let grid = {};

      const clearGrid = () => { grid = {}; };
      const cellKey = (cx, cy) => `${cx}:${cy}`;
      const insertToGrid = (obj, idx) => {
        const minX = Math.floor((obj.x - obj.r) / CELL_SIZE);
        const maxX = Math.floor((obj.x + obj.r) / CELL_SIZE);
        const minY = Math.floor((obj.y - obj.r) / CELL_SIZE);
        const maxY = Math.floor((obj.y + obj.r) / CELL_SIZE);
        for (let gx = minX; gx <= maxX; gx++) {
          for (let gy = minY; gy <= maxY; gy++) {
            const key = cellKey(gx, gy);
            if (!grid[key]) grid[key] = [];
            grid[key].push(idx);
          }
        }
      };

      // Collision with positional correction and velocity impulse
      const collidePair = (A, B) => {
        if (A.asleep && B.asleep) return;

        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const dist = Math.hypot(dx, dy);
        const minDist = A.r + B.r;
        if (dist <= 0 || dist >= minDist) return;

        const nx = dx / dist;
        const ny = dy / dist;
        const penetration = minDist - dist;

        const totalMass = A.mass + B.mass;
        const correctionMag = Math.max(penetration - POS_CORRECTION_SLOP, 0) / totalMass * POS_CORRECTION_PERCENT;
        const correctionX = nx * correctionMag;
        const correctionY = ny * correctionMag;
        if (!A.asleep) { A.x -= correctionX * (B.mass); A.y -= correctionY * (B.mass); }
        if (!B.asleep) { B.x += correctionX * (A.mass); B.y += correctionY * (A.mass); }

        const rvx = B.vx - A.vx;
        const rvy = B.vy - A.vy;
        const relVel = rvx * nx + rvy * ny;

        if (relVel < 0) {
          const e = COLLISION_E;
          const j = -(1 + e) * relVel / (1 / A.mass + 1 / B.mass);
          const ix = j * nx;
          const iy = j * ny;
          if (!A.asleep) { A.vx -= ix / A.mass; A.vy -= iy / A.mass; }
          if (!B.asleep) { B.vx += ix / B.mass; B.vy += iy / B.mass; }
        }

        if (!A.asleep) { A.vx *= 0.995; A.vy *= 0.995; A.va *= 0.995; }
        if (!B.asleep) { B.vx *= 0.995; B.vy *= 0.995; B.va *= 0.995; }

        const torque = (penetration * 0.002) * (Math.random() - 0.5);
        if (!A.asleep) A.va += torque * (B.mass / totalMass);
        if (!B.asleep) B.va -= torque * (A.mass / totalMass);

        A.asleep = false;
        B.asleep = false;
        A.sleepTimer = 0;
        B.sleepTimer = 0;
      };

      // single fixed physics step
      const physicsStep = (dt) => {
        const objs = objsRef.current;
        const m = mouseRef.current;
        const Wc = window.innerWidth;
        const Hc = window.innerHeight;

        // Integrate forces -> velocities (semi-implicit Euler)
        for (let i = 0; i < objs.length; i++) {
          const o = objs[i];
          if (o.asleep) continue; // skip asleep objects

          // mouse force
          const dx = o.x - m.x;
          const dy = o.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS) {
            const nx = dist === 0 ? (Math.random() - 0.5) : dx / dist;
            const ny = dist === 0 ? (Math.random() - 0.5) : dy / dist;
            const falloff = 1 - dist / MOUSE_RADIUS;
            const force = (MOUSE_STRENGTH * falloff) / o.mass;

            // linear push (same direction as before)
            o.vx += (nx * force) * dt;
            o.vy += (ny * force * 0.95) * dt - (UPWARD_BIAS * 160 * falloff * dt);

            // rotational effect based on lever arm (mouse -> object)
            // compute lever arm vector from mouse to object
            const rx = o.x - m.x;
            const ry = o.y - m.y;
            // applied force vector
            const fx = nx * force;
            const fy = ny * force;
            // 2D torque (scalar) = r x F = rx * Fy - ry * Fx
            const rawTorque = (rx * fy - ry * fx);
            // scale & normalize by radius & mass so objects respond sensibly
            const torque = (rawTorque * TORQUE_SCALE) / (o.r * o.mass);
            // apply torque scaled by dt so it's time-consistent
            o.va += torque * dt;

            // small wake & reset sleep timer on mouse interaction
            o.sleepTimer = 0;
            o.asleep = false;
          }

          // gravity
          o.vy += GRAVITY * dt;

          // integrate velocity to position
          o.vx = clamp(o.vx, -MAX_VEL, MAX_VEL);
          o.vy = clamp(o.vy, -MAX_VEL, MAX_VEL);
          o.x += o.vx * dt;
          o.y += o.vy * dt;

          // angular integration (semi-implicit)
          o.va = clamp(o.va, -12, 12);
          o.angle += o.va * dt;

          // damping
          o.vx *= LINEAR_DAMPING;
          o.vy *= LINEAR_DAMPING;
          o.va *= ANGULAR_DAMPING;
        }

        // spatial grid & collision detection
        clearGrid();
        const objsArr = objsRef.current;
        for (let i = 0; i < objsArr.length; i++) insertToGrid(objsArr[i], i);

        // iterative solver to reduce jitter in stacks
        for (let iter = 0; iter < COLLISION_ITER; iter++) {
          for (const key in grid) {
            const cell = grid[key];
            for (let a = 0; a < cell.length; a++) {
              for (let b = a + 1; b < cell.length; b++) {
                collidePair(objsArr[cell[a]], objsArr[cell[b]]);
              }
            }
          }
        }

        // boundary constraints + resting logic
        for (let i = 0; i < objsArr.length; i++) {
          const o = objsArr[i];
          const halfW = o.w / 2;
          const halfH = o.h / 2;

          // bottom
          if (o.y + halfH > Hc) {
            o.y = Hc - halfH;
            if (o.vy > 0) o.vy = -o.vy * RESTITUTION;
            if (Math.abs(o.vy) < 20) {
              o.vx *= 0.85;
            } else {
              o.vx *= 0.985;
            }
            o.va *= 0.88;
          }

          // top
          if (o.y - halfH < 0) {
            o.y = halfH;
            if (o.vy < 0) o.vy = -o.vy * RESTITUTION;
            o.va *= 0.95;
          }

          // left/right
          if (o.x - halfW < 0) {
            o.x = halfW;
            if (o.vx < 0) o.vx = -o.vx * RESTITUTION;
            o.va *= 0.92;
          }
          if (o.x + halfW > Wc) {
            o.x = Wc - halfW;
            if (o.vx > 0) o.vx = -o.vx * RESTITUTION;
            o.va *= 0.92;
          }

          // sleeping check
          const speed2 = o.vx * o.vx + o.vy * o.vy;
          const angSpeed = Math.abs(o.va);
          if (speed2 < SLEEP_VEL * SLEEP_VEL && angSpeed < SLEEP_ANG) {
            o.sleepTimer += dt;
            if (o.sleepTimer >= SLEEP_TIME) {
              o.vx = 0;
              o.vy = 0;
              o.va = 0;
              o.asleep = true;
            }
          } else {
            o.sleepTimer = 0;
            o.asleep = false;
          }

          if (Math.abs(o.vx) < 0.02) o.vx = 0;
          if (Math.abs(o.vy) < 0.02) o.vy = 0;
          if (Math.abs(o.va) < 0.001) o.va = 0;

          if (o.angle > Math.PI * 4 || o.angle < -Math.PI * 4) {
            o.angle = ((o.angle + Math.PI * 4) % (Math.PI * 8)) - Math.PI * 4;
          }
        }
      };

      // render
      const render = () => {
        ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR);
        for (const o of objsRef.current) {
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.rotate(o.angle);

          // rounded corners
          ctx.beginPath();
          const x = -o.w / 2;
          const y = -o.h / 2;
          const r = CORNER_RADIUS;
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + o.w - r, y);
          ctx.quadraticCurveTo(x + o.w, y, x + o.w, y + r);
          ctx.lineTo(x + o.w, y + o.h - r);
          ctx.quadraticCurveTo(x + o.w, y + o.h, x + o.w - r, y + o.h);
          ctx.lineTo(x + r, y + o.h);
          ctx.quadraticCurveTo(x, y + o.h, x, y + o.h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(o.img, -o.w / 2, -o.h / 2, o.w, o.h);
          ctx.restore();
        }
      };

      // main loop with accumulator / fixed-step physics
      const loop = (now) => {
        const frameDt = Math.min((now - lastTime) / 1000, 0.25); // clamp huge frame deltas
        lastTime = now;
        accumulator += frameDt;

        let subSteps = 0;
        while (accumulator >= FIXED_STEP && subSteps < MAX_SUB_STEPS) {
          physicsStep(FIXED_STEP);
          accumulator -= FIXED_STEP;
          subSteps++;
        }

        if (accumulator >= FIXED_STEP) {
          physicsStep(FIXED_STEP);
          accumulator = 0;
        }

        render();
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    })();

    return () => {
      mounted = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('mouseout', onLeave);
    };
  }, [srcs]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100vw',
        height: '100vh',
        display: 'block',
        background: 'transparent',
        touchAction: 'none',
      }}
    />
  );
}
