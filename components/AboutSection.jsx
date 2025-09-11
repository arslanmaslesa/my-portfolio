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

  const CURSOR_SIZE = 80;
  const EDGE_PADDING = CURSOR_SIZE / 2;
  const lastPointerRef = useRef({ x: -9999, y: -9999 });

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
      const x = e.clientX ?? -9999;
      const y = e.clientY ?? -9999;
      lastPointerRef.current = { x, y };
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      if (inside || hovering) setCursorPos({ x, y });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [isTouchDevice, hovering]);

  // Section pointer events
  useEffect(() => {
    if (isTouchDevice) return;
    const container = containerRef.current;
    if (!container) return;

    const onEnter = (e) => {
      const last = lastPointerRef.current;
      const x = last.x > -9000 ? last.x : (e.clientX ?? -9999);
      const y = last.y > -9000 ? last.y : (e.clientY ?? -9999);
      setHovering(true);
      setCursorPos({ x, y });
    };

    const onLeave = () => {
      setHovering(false);
      setCursorPos({ x: -9999, y: -9999 });
    };

    const onMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });

    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('mousemove', onMove);

    return () => {
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      container.removeEventListener('mousemove', onMove);
    };
  }, [isTouchDevice]);

  // Scroll activation for cursor
  useEffect(() => {
    if (isTouchDevice) return;
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const last = lastPointerRef.current;
      const inside =
        last.x >= rect.left &&
        last.x <= rect.right &&
        last.y >= rect.top &&
        last.y <= rect.bottom;
      if (inside) {
        setHovering(true);
        setCursorPos({ x: last.x, y: last.y });
      } else if (hovering) {
        setHovering(false);
        setCursorPos({ x: -9999, y: -9999 });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isTouchDevice, hovering]);

  // Clamp cursor position
  useEffect(() => {
    if (isTouchDevice || typeof window === 'undefined') return;
    setClampedPos({
      x: Math.min(Math.max(cursorPos.x, EDGE_PADDING), window.innerWidth - EDGE_PADDING),
      y: Math.min(Math.max(cursorPos.y, EDGE_PADDING), window.innerHeight - EDGE_PADDING),
    });
  }, [cursorPos, isTouchDevice]);

  return (
    <div ref={containerRef} className="relative cursor-auto">
      {/* Tall parent for sticky image pile */}
      <div style={{ height: `${aboutTexts.length * 200}vh`, position: 'relative' }}>
        {/* Sticky image pile for full scroll */}
        <div className="sticky top-0 w-full h-screen z-30 pointer-events-none">
          <CanvasImagePile mousePos={clampedPos} interactions={!isTouchDevice} />
        </div>

        {/* About sections */}
        {aboutTexts.map((text, idx) => (
          <div key={idx} className="relative top-[-100vh]" style={{ height: '200vh', zIndex: 20 }}>
            <div
              ref={aboutRefs[idx]}
              className="sticky top-0 w-screen h-screen flex items-center justify-center"
              style={{ opacity: 1, transition: 'opacity 0.45s ease' }}
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

      {/* Custom cursor */}
      {!isTouchDevice && hovering && (
        <div
          ref={cursorRef}
          className="fixed pointer-events-none z-50 w-20 h-20"
          style={{
            left: clampedPos.x,
            top: clampedPos.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img src="/me.png" alt="cursor" className="w-full h-full rounded-full object-cover" />
        </div>
      )}
    </div>
  );
}
