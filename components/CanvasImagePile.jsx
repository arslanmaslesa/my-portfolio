'use client';

import React, { useEffect, useRef } from 'react';

// Full set of 36 images; component uses up to MOBILE_COUNT on small screens.
const DEFAULT_IMAGES = Array.from({ length: 36 }).map((_, i) => `/interest${(i % 12) + 1}.png`);
const MOBILE_BREAKPOINT = 768; // px
const MOBILE_COUNT = 12; // use 12 images on mobile/smaller screens

export default function CanvasImagePile({ srcs = DEFAULT_IMAGES, interactions = true }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const objsRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  // Keep some "instance" refs for values that may change on re-init
  const mountedRef = useRef(false);
  const DPRRef = useRef(1);
  const isMobileRef = useRef(false);
  const allowInteractionRef = useRef(true);
  const resizeDebounceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // helper: responsive sizes based on viewport
    const getSizes = () => {
      const base = Math.min(window.innerWidth, window.innerHeight);
      if (base <= 768) return { DRAW_SIZE: 80, LOW_RES: 96, HIGH_RES: 160 };
      if (base <= 1440) return { DRAW_SIZE: 110, LOW_RES: 128, HIGH_RES: 220 };
      return { DRAW_SIZE: 140, LOW_RES: 160, HIGH_RES: 280 };
    };

    // physics / drawing constants
    const CORNER_RADIUS = 8;
    const MOUSE_RADIUS = 300;
    const MOUSE_STRENGTH = 12000;
    const UPWARD_BIAS = 1.6;
    const GRAVITY = 1200;
    const RESTITUTION = 0.5;
    const COLLISION_E = 0.62;
    const MAX_VEL = 2500;

    const FIXED_STEP = 1 / 60;
    const MAX_SUB_STEPS = 4;
    const COLLISION_ITER = 3;
    const POS_CORRECTION_PERCENT = 0.2;
    const POS_CORRECTION_SLOP = 0.01;
    const SLEEP_VEL = 6;
    const SLEEP_ANG = 0.04;
    const SLEEP_TIME = 0.5;
    const ANGULAR_DAMPING = 0.92;
    const LINEAR_DAMPING = 0.995;
    const TORQUE_SCALE = 0.0000009;

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const CONCURRENCY = 4;

    // --- image loading utilities ---
    const loadImageToCanvas = async (src, size) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        if (img.decode) await img.decode();
        else
          await new Promise((res) => {
            img.onload = res;
            img.onerror = () => res();
          });

        const off = document.createElement('canvas');
        off.width = size;
        off.height = size;
        const octx = off.getContext('2d');

        const iw = img.naturalWidth || size;
        const ih = img.naturalHeight || size;
        const ir = iw / ih;
        const or = 1;
        let sx = 0,
          sy = 0,
          sw = iw,
          sh = ih;
        if (ir > or) {
          sw = ih * or;
          sx = (iw - sw) / 2;
        } else {
          sh = iw / or;
          sy = (ih - sh) / 2;
        }

        try {
          octx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        } catch {
          octx.fillStyle = '#ddd';
          octx.fillRect(0, 0, size, size);
        }
        return off;
      } catch {
        const fallback = document.createElement('canvas');
        fallback.width = size;
        fallback.height = size;
        const fctx = fallback.getContext('2d');
        fctx.fillStyle = '#ddd';
        fctx.fillRect(0, 0, size, size);
        return fallback;
      }
    };

    const loadInBatches = async (sources, size) => {
      const results = new Array(sources.length);
      let i = 0;
      const workers = new Array(CONCURRENCY).fill(null).map(async () => {
        while (i < sources.length && mountedRef.current) {
          const cur = i++;
          results[cur] = await loadImageToCanvas(sources[cur], size);
        }
      });
      await Promise.all(workers);
      return results;
    };

    const runDuringIdle = (fn) => {
      if (!mountedRef.current) return;
      if ('requestIdleCallback' in window) window.requestIdleCallback(() => mountedRef.current && fn(), { timeout: 2000 });
      else setTimeout(() => mountedRef.current && fn(), 300);
    };

    // Stateful layout values
    let DRAW_SIZE = 110;
    let LOW_RES = 128;
    let HIGH_RES = 220;
    let IMG_SIZE = HIGH_RES;
    const CELL_SIZE = () => DRAW_SIZE * 1.4;

    // --- mouse/touch handlers; we will only attach these when interactions are allowed ---
    const getMousePosCSS = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onMouseMove = (e) => {
      const pos = getMousePosCSS(e.clientX, e.clientY);
      if (pos.x >= 0 && pos.x <= canvas.clientWidth && pos.y >= 0 && pos.y <= canvas.clientHeight) {
        mouseRef.current.x = pos.x;
        mouseRef.current.y = pos.y;
      } else {
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      }
    };

    const onTouchMove = (e) => {
      // NOTE: this will only be attached if interactions are allowed
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        const pos = getMousePosCSS(t.clientX, t.clientY);
        if (pos.x >= 0 && pos.x <= canvas.clientWidth && pos.y >= 0 && pos.y <= canvas.clientHeight) {
          mouseRef.current.x = pos.x;
          mouseRef.current.y = pos.y;
        } else {
          mouseRef.current.x = -9999;
          mouseRef.current.y = -9999;
        }
      }
    };

    const onLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    // Resize handling
    const resizeCanvas = () => {
      const cssW = window.innerWidth;
      const cssH = window.innerHeight;

      const s = getSizes();
      DRAW_SIZE = s.DRAW_SIZE;
      LOW_RES = s.LOW_RES;
      HIGH_RES = s.HIGH_RES;
      IMG_SIZE = HIGH_RES;

      // recompute DPR using mobile heuristic (limit DPR on mobile to avoid huge backing store)
      const rawDPR = Math.max(1, window.devicePixelRatio || 1);
      const isMobile = typeof window !== 'undefined' && (window.matchMedia ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches : window.innerWidth <= MOBILE_BREAKPOINT);
      isMobileRef.current = isMobile;
      DPRRef.current = isMobile ? Math.min(rawDPR, 1.5) : rawDPR;

      // CSS size and backing store
      canvas.style.width = cssW + 'px';
      canvas.style.height = cssH + 'px';
      canvas.width = Math.round(cssW * DPRRef.current);
      canvas.height = Math.round(cssH * DPRRef.current);

      // set transform so drawing uses CSS pixels
      ctx.setTransform(DPRRef.current, 0, 0, DPRRef.current, 0, 0);

      // update each object's geometry so drawing uses the new DRAW_SIZE
      for (let o of objsRef.current) {
        if (!o) continue;
        o.w = DRAW_SIZE;
        o.h = DRAW_SIZE;
        o.r = DRAW_SIZE * 0.5;
        // clamp positions to visible area (CSS pixels)
        o.x = Math.min(Math.max(o.x, o.w / 2), window.innerWidth - o.w / 2);
        o.y = Math.min(Math.max(o.y, o.h / 2), window.innerHeight - o.h / 2);
      }
    };

    // Reset objects positions
    const resetObjectsPositions = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      objsRef.current = (objsRef.current.length ? objsRef.current : []).map((o) => ({
        img: o && o.img ? o.img : null,
        x: Math.random() * (W - DRAW_SIZE) + DRAW_SIZE / 2,
        y: -20 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 40,
        angle: (Math.random() - 0.5) * Math.PI,
        va: (Math.random() - 0.5) * 1.8,
        w: DRAW_SIZE,
        h: DRAW_SIZE,
        r: DRAW_SIZE * 0.5,
        mass: 1 + Math.random() * 0.6,
        sleepTimer: 0,
        asleep: false,
      }));
    };

    // --- initialization function: load low-res, create objects, start loop ---
    let cancelLoop = false;
    const init = async () => {
      // detect allowInteraction: combine component prop with platform capability
      const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      allowInteractionRef.current = interactions && !isTouchDevice;

      // compute sizes & DPR and set canvas
      resizeCanvas();

      // choose sources (fewer on mobile)
      const selectedSrcs = isMobileRef.current ? srcs.slice(0, MOBILE_COUNT) : srcs;

      // load low-res first
      const lowResCanvases = await loadInBatches(selectedSrcs, LOW_RES);
      if (!mountedRef.current) return;

      // initial objects (use low res canvases for img)
      const W = window.innerWidth;
      const H = window.innerHeight;
      objsRef.current = lowResCanvases.map((imgCanvas) => ({
        img: imgCanvas,
        x: Math.random() * (W - DRAW_SIZE) + DRAW_SIZE / 2,
        y: -20 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 40,
        angle: (Math.random() - 0.5) * Math.PI,
        va: (Math.random() - 0.5) * 1.8,
        w: DRAW_SIZE,
        h: DRAW_SIZE,
        r: DRAW_SIZE * 0.5,
        mass: 1 + Math.random() * 0.6,
        sleepTimer: 0,
        asleep: false,
      }));

      // attach listeners (only when interactions allowed)
      if (allowInteractionRef.current) {
        canvas.addEventListener('mousemove', onMouseMove, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: true });
        canvas.addEventListener('mouseleave', onLeave, { passive: true });
      } else {
        // ensure mouse not active and let touches pass through
        mouseRef.current.x = -9999;
        mouseRef.current.y = -9999;
      }

      // upgrade to high-res when idle (and again on resizes/orientation)
      runDuringIdle(async () => {
        if (!mountedRef.current) return;
        const highResCanvases = await loadInBatches(selectedSrcs, HIGH_RES);
        if (!mountedRef.current) return;
        for (let k = 0; k < highResCanvases.length && mountedRef.current; k++) {
          if (objsRef.current[k]) objsRef.current[k].img = highResCanvases[k];
        }
      });

      // Physics + rendering
      let lastTime = performance.now();
      let accumulator = 0;
      let grid = {};

      const cellKey = (cx, cy) => `${cx}:${cy}`;

      const insertToGrid = (obj, idx) => {
        const minX = Math.floor((obj.x - obj.r) / CELL_SIZE());
        const maxX = Math.floor((obj.x + obj.r) / CELL_SIZE());
        const minY = Math.floor((obj.y - obj.r) / CELL_SIZE());
        const maxY = Math.floor((obj.y + obj.r) / CELL_SIZE());
        for (let gx = minX; gx <= maxX; gx++) {
          for (let gy = minY; gy <= maxY; gy++) {
            const key = cellKey(gx, gy);
            if (!grid[key]) grid[key] = [];
            grid[key].push(idx);
          }
        }
      };

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
        if (!A.asleep) { A.x -= correctionX * B.mass; A.y -= correctionY * B.mass; }
        if (!B.asleep) { B.x += correctionX * A.mass; B.y += correctionY * A.mass; }

        const rvx = B.vx - A.vx;
        const rvy = B.vy - A.vy;
        const relVel = rvx * nx + rvy * ny;

        if (relVel < 0) {
          const e = COLLISION_E;
          const j = (-(1 + e) * relVel) / (1 / A.mass + 1 / B.mass);
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

        A.asleep = false; B.asleep = false; A.sleepTimer = 0; B.sleepTimer = 0;
      };

      const physicsStep = (dt) => {
        const objs = objsRef.current;
        const m = mouseRef.current;
        const Wc = window.innerWidth; // CSS pixels
        const Hc = window.innerHeight;

        for (let i = 0; i < objs.length; i++) {
          const o = objs[i];
          if (o.asleep) continue;

          const dx = o.x - m.x;
          const dy = o.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < MOUSE_RADIUS) {
            const nx = dist === 0 ? (Math.random() - 0.5) : dx / dist;
            const ny = dist === 0 ? (Math.random() - 0.5) : dy / dist;
            const falloff = 1 - dist / MOUSE_RADIUS;
            const force = (MOUSE_STRENGTH * falloff) / o.mass;

            o.vx += (nx * force) * dt;
            o.vy += (ny * force * 0.95) * dt - (UPWARD_BIAS * 160 * falloff * dt);

            const rawTorque = (o.x - m.x) * (ny * force) - (o.y - m.y) * (nx * force);
            const torque = (rawTorque * TORQUE_SCALE) / (o.r * o.mass);
            o.va += torque * dt;

            o.sleepTimer = 0;
            o.asleep = false;
          }

          o.vy += GRAVITY * dt;
          o.vx = clamp(o.vx, -MAX_VEL, MAX_VEL);
          o.vy = clamp(o.vy, -MAX_VEL, MAX_VEL);
          o.x += o.vx * dt;
          o.y += o.vy * dt;

          o.va = clamp(o.va, -12, 12);
          o.angle += o.va * dt;

          o.vx *= LINEAR_DAMPING;
          o.vy *= LINEAR_DAMPING;
          o.va *= ANGULAR_DAMPING;

          // Boundaries + sleep
          const halfW = o.w / 2;
          const halfH = o.h / 2;

          if (o.y + halfH > Hc) {
            o.y = Hc - halfH;
            if (o.vy > 0) o.vy = -o.vy * RESTITUTION;
            if (Math.abs(o.vy) < 20) { o.vx *= 0.85; } else { o.vx *= 0.985; }
            o.va *= 0.88;
          }

          if (o.y - halfH < 0) {
            o.y = halfH;
            if (o.vy < 0) o.vy = -o.vy * RESTITUTION;
            o.va *= 0.95;
          }

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

          const speed2 = o.vx * o.vx + o.vy * o.vy;
          const angSpeed = Math.abs(o.va);
          if (speed2 < SLEEP_VEL * SLEEP_VEL && angSpeed < SLEEP_ANG) {
            o.sleepTimer += dt;
            if (o.sleepTimer >= SLEEP_TIME) {
              o.vx = 0; o.vy = 0; o.va = 0; o.asleep = true;
            }
          } else o.sleepTimer = 0;
        }

        grid = {};
        for (let i = 0; i < objs.length; i++) insertToGrid(objs[i], i);
        for (let iter = 0; iter < COLLISION_ITER; iter++) {
          for (const key in grid) {
            const cell = grid[key];
            for (let a = 0; a < cell.length; a++) {
              for (let b = a + 1; b < cell.length; b++) {
                collidePair(objs[cell[a]], objs[cell[b]]);
              }
            }
          }
        }
      };

      const render = () => {
        ctx.clearRect(0, 0, canvas.width / DPRRef.current, canvas.height / DPRRef.current);
        for (const o of objsRef.current) {
          if (!o || !o.img) continue;
          ctx.save();
          ctx.translate(o.x, o.y);
          ctx.rotate(o.angle);

          // rounded corners clipping
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

      const loop = (now) => {
        if (!mountedRef.current) return;
        const frameDt = Math.min((now - lastTime) / 1000, 0.25);
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

      // start loop
      rafRef.current = requestAnimationFrame(loop);
    }; // end init

    // Set up initial run
    init();

    // Debounced re-init / responsive handler:
    const handleResponsiveChange = () => {
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      resizeDebounceRef.current = setTimeout(() => {
        if (!mountedRef.current) return;

        // Recalculate sizes & DPR & resize canvas immediately
        resizeCanvas();

        // If interaction capability changed (touch vs non-touch) - re-init to attach/detach listeners properly
        const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
        const newAllowInteraction = interactions && !isTouchDevice;
        if (newAllowInteraction !== allowInteractionRef.current) {
          // full re-init: remove listeners + reset state then init again
          teardown();
          setTimeout(() => {
            if (!mountedRef.current) return;
            init();
          }, 40);
        } else {
          // Not changing interaction mode. We still should clamp positions and reload high-res canvases
          for (let o of objsRef.current) {
            if (!o) continue;
            o.w = DRAW_SIZE;
            o.h = DRAW_SIZE;
            o.r = DRAW_SIZE * 0.5;
            o.x = Math.min(Math.max(o.x, o.w / 2), window.innerWidth - o.w / 2);
            o.y = Math.min(Math.max(o.y, o.h / 2), window.innerHeight - o.h / 2);
          }

          runDuringIdle(async () => {
            const selectedSrcs = isMobileRef.current ? srcs.slice(0, MOBILE_COUNT) : srcs;
            const highResCanvases = await loadInBatches(selectedSrcs, HIGH_RES);
            if (!mountedRef.current) return;
            for (let k = 0; k < highResCanvases.length && mountedRef.current; k++) {
              if (objsRef.current[k]) objsRef.current[k].img = highResCanvases[k];
            }
          });
        }
      }, 120);
    };

    // teardown function to remove listeners and stop animation
    const teardown = () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      try {
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('mouseleave', onLeave);
      } catch (e) {}
    };

    // listen to resize and orientation
    window.addEventListener('resize', handleResponsiveChange, { passive: true });
    window.addEventListener('orientationchange', handleResponsiveChange, { passive: true });

    // cleanup on unmount
    return () => {
      mounted = false;
      mountedRef.current = false;
      if (resizeDebounceRef.current) clearTimeout(resizeDebounceRef.current);
      window.removeEventListener('resize', handleResponsiveChange);
      window.removeEventListener('orientationchange', handleResponsiveChange);
      teardown();
    };
  }, [srcs, interactions]);

  // When interactions are disabled we allow pointer events to pass through to the page and keep default touch behavior.
  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        background: 'transparent',
        touchAction: interactions ? 'none' : 'auto',
        pointerEvents: interactions ? 'auto' : 'none',
      }}
    />
  );
}