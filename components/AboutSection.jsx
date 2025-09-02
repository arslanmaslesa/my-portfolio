'use client';

import React, { useEffect, useRef, useState } from 'react';
import CanvasImagePile from './CanvasImagePile';
import SarajevoTagline from './SarajevoTagline';

export default function AboutSection({ aboutTexts, aboutRefs, aboutOffsets, ui }) {
  const sectionRef = useRef(null);
  const cursorRef = useRef(null);

  const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });
  const [clampedPos, setClampedPos] = useState({ x: -9999, y: -9999 });
  const [hovering, setHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const CURSOR_SIZE = 80; // px
  const EDGE_PADDING = CURSOR_SIZE / 2; // safe padding from edges

  // Detect touch devices
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  // Mouse events (only on non-touch devices)
  useEffect(() => {
    if (isTouchDevice) return;

    const section = sectionRef.current;
    if (!section) return;

    const onMouseMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
    const onMouseEnter = () => setHovering(true);
    const onMouseLeave = () => setHovering(false);

    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseenter', onMouseEnter);
    section.addEventListener('mouseleave', onMouseLeave);

    return () => {
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseenter', onMouseEnter);
      section.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [isTouchDevice]);

  // Clamp cursor position safely on the client
  useEffect(() => {
    if (isTouchDevice || typeof window === 'undefined') return;

    const clampX = Math.min(Math.max(cursorPos.x, EDGE_PADDING), window.innerWidth - EDGE_PADDING);
    const clampY = Math.min(Math.max(cursorPos.y, EDGE_PADDING), window.innerHeight - EDGE_PADDING);

    setClampedPos({ x: clampX, y: clampY });
  }, [cursorPos, isTouchDevice]);

  return (
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: '300vh', cursor: hovering && !isTouchDevice ? 'none' : 'auto' }}
    >
      {/* Sticky image overlay - always rendered; CanvasImagePile will disable interactions on touch devices when passed the prop */}
      <div className="sticky top-0 h-0 z-20 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-screen h-screen"
          // If it's a touch device we force pointer-events:none on the overlay so taps go through to the page
          style={{ pointerEvents: isTouchDevice ? 'none' : 'auto' }}
        >
          {/* interactions prop: pass false on touch devices */}
          <CanvasImagePile mousePos={clampedPos} interactions={!isTouchDevice} />
        </div>
      </div>

      {/* About sections */}
      {aboutTexts.map((text, idx) => (
        <div
          key={idx}
          className="relative bg-white"
          style={{ height: '200vh', zIndex: 10 }}
        >
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

      {/* Custom cursor (desktop only) */}
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
          <img
            src="/me.png"
            alt="cursor"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
}