'use client';

import React, { useEffect, useRef, useState } from 'react';
import CanvasImagePile from './CanvasImagePile';
import SarajevoTagline from './SarajevoTagline';

export default function AboutSection({ aboutTexts, aboutRefs, aboutOffsets, ui }) {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);

  const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });
  const [clampedPos, setClampedPos] = useState({ x: -9999, y: -9999 });
  const [hovering, setHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const CURSOR_SIZE = 120;
  const EDGE_PADDING = CURSOR_SIZE / 2;
  const lastPointerRef = useRef({ x: -9999, y: -9999 });

  // follower physics
  const lagPos = useRef({ x: -9999, y: -9999 }); // circle
  const lagPosBubble = useRef({ x: -9999, y: -9999 }); // bubble

  const clampedPosRef = useRef(clampedPos);
  const hoveringRef = useRef(hovering);

  const LAG_SPEED = 0.15; // circle speed
  const BUBBLE_SPEED = 0.1; // bubble slower = wobble
  const INIT_OFFSET = 40;
  const RENDER_THRESHOLD = 0.5;

  const [, setTick] = useState(0);

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  // Detect touch devices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  // Pointer tracking
  useEffect(() => {
    if (isTouchDevice) return;

    const onPointerMove = (e) => {
      const rawX = e.clientX;
      const rawY = e.clientY;
      lastPointerRef.current = { x: rawX, y: rawY };

      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const inside =
        rawX >= rect.left &&
        rawX <= rect.right &&
        rawY >= rect.top &&
        rawY <= rect.bottom;

      const clampedX = clamp(rawX, EDGE_PADDING, window.innerWidth - EDGE_PADDING);
      const clampedY = clamp(rawY, EDGE_PADDING, window.innerHeight - EDGE_PADDING);

      if (lagPos.current.x < -9000 && lagPos.current.y < -9000) {
        lagPos.current.x = clampedX - INIT_OFFSET;
        lagPos.current.y = clampedY - INIT_OFFSET;
        lagPosBubble.current.x = clampedX + 55; // bubble start
        lagPosBubble.current.y = clampedY - 55;
        setTick((t) => t + 1);
      }

      if (inside) {
        setCursorPos({ x: rawX, y: rawY });
        setClampedPos({ x: clampedX, y: clampedY });
        setHovering(true);

        clampedPosRef.current = { x: clampedX, y: clampedY };
        hoveringRef.current = true;
      } else if (hoveringRef.current) {
        setHovering(false);
        hoveringRef.current = false;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [isTouchDevice]);

  // Scroll tracking
  useEffect(() => {
    if (isTouchDevice) return;
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const { x, y } = lastPointerRef.current;

      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (inside) {
        const clampedX = clamp(x, EDGE_PADDING, window.innerWidth - EDGE_PADDING);
        const clampedY = clamp(y, EDGE_PADDING, window.innerHeight - EDGE_PADDING);

        setCursorPos({ x, y });
        setClampedPos({ x: clampedX, y: clampedY });
        setHovering(true);

        clampedPosRef.current = { x: clampedX, y: clampedY };
        hoveringRef.current = true;

        if (lagPos.current.x < -9000 && lagPos.current.y < -9000) {
          lagPos.current.x = clampedX - INIT_OFFSET;
          lagPos.current.y = clampedY - INIT_OFFSET;
          lagPosBubble.current.x = clampedX + 55;
          lagPosBubble.current.y = clampedY - 55;
          setTick((t) => t + 1);
        }
      } else if (hoveringRef.current) {
        setHovering(false);
        hoveringRef.current = false;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isTouchDevice]);

  // Sync refs
  useEffect(() => {
    clampedPosRef.current = clampedPos;
  }, [clampedPos]);

  useEffect(() => {
    hoveringRef.current = hovering;
  }, [hovering]);

  // rAF loop
  useEffect(() => {
    let raf = 0;
    const animate = () => {
      const target = clampedPosRef.current;

      // circle follows fast
      lagPos.current.x += (target.x - lagPos.current.x) * LAG_SPEED;
      lagPos.current.y += (target.y - lagPos.current.y) * LAG_SPEED;

      // bubble follows slower, offset top-right but pushed slightly down+left
      const bubbleTarget = { x: target.x + 60, y: target.y - 60 };
      lagPosBubble.current.x += (bubbleTarget.x - lagPosBubble.current.x) * BUBBLE_SPEED;
      lagPosBubble.current.y += (bubbleTarget.y - lagPosBubble.current.y) * BUBBLE_SPEED;

      const dx = Math.abs(target.x - lagPos.current.x);
      const dy = Math.abs(target.y - lagPos.current.y);

      if (hoveringRef.current || dx > RENDER_THRESHOLD || dy > RENDER_THRESHOLD) {
        setTick((t) => t + 1);
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={containerRef} className="relative cursor-auto font-[Poppins]">
      <div style={{ height: `${aboutTexts.length * 200}vh`, position: 'relative' }}>
        <div className="sticky top-0 w-full h-screen z-30 pointer-events-none">
          <CanvasImagePile mousePos={clampedPos} interactions={!isTouchDevice} />
        </div>

        {aboutTexts.map((text, idx) => (
          <div key={idx} className="relative top-[-100vh]" style={{ height: '200vh', zIndex: 20 }}>
            <div
              ref={aboutRefs[idx]}
              className="sticky top-0 w-screen h-screen flex items-center justify-center"
            >
              <SarajevoTagline
                text={text}
                scrollY={ui.scrollY}
                refObj={aboutRefs[idx]}
                triggerOffset={aboutOffsets[idx] ?? undefined}
              />
            </div>
          </div>
        ))}
      </div>

      {!isTouchDevice && hovering && (
        <>
          {/* Circle cursor */}
          <div
            ref={cursorRef}
            className="fixed pointer-events-none z-50"
            style={{
              left: lagPos.current.x,
              top: lagPos.current.y,
              width: CURSOR_SIZE,
              height: CURSOR_SIZE,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              overflow: 'hidden',
              boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
              willChange: 'transform,left,top',
            }}
          >
            <img
              src="/me.png"
              alt="cursor"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Speech bubble */}
          <div
            className="fixed pointer-events-none z-50 px-4 py-2 bg-white font-medium text-black text-[16px] rounded-full shadow-lg"
            style={{
              left: lagPosBubble.current.x,
              top: lagPosBubble.current.y,
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Hi, I’m Arslan
            {/* Tail pointing bottom-left */}
            <span
              className="absolute bottom-[-6px] left-3 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"
            />
          </div>
        </>
      )}
    </div>
  );
}
