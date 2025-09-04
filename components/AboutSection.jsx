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

  // keep last-known global pointer so scroll/enter can re-evaluate without movement
  const lastPointerRef = useRef({ x: -9999, y: -9999 });

  // Detect touch devices once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }
  }, []);

  // ------------------------------------------------------------------
  // Global pointer tracking: keep the last pointer coordinates (viewport/client)
  // This runs on the window so we always have the latest pointer coords,
  // even if the pointer moved outside the section previously.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isTouchDevice) return;

    const onPointerMove = (e) => {
      // Use clientX/Y so coordinates are viewport-relative
      const x = e.clientX ?? -9999;
      const y = e.clientY ?? -9999;
      lastPointerRef.current = { x, y };

      // If pointer is currently over our section (or we already hover), update state
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      // Update cursorPos only if inside OR if we were already hovering (keeps cursor following)
      if (inside || hovering) {
        setCursorPos({ x, y });
      }
    };

    // Use pointermove for broader support (mouse/touch/stylus) but only for non-touch logic.
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [isTouchDevice, hovering]);

  // ------------------------------------------------------------------
  // Section-level pointer enter/leave/move so we can set hover state
  // and update cursorPos immediately when the pointer enters the section.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isTouchDevice) return;
    const section = sectionRef.current;
    if (!section) return;

    const onEnter = (e) => {
      // if we have a last-known pointer, use that; otherwise use event coords
      const last = lastPointerRef.current;
      const x = last.x > -9000 ? last.x : (e.clientX ?? -9999);
      const y = last.y > -9000 ? last.y : (e.clientY ?? -9999);
      setHovering(true);
      setCursorPos({ x, y });
    };

    const onLeave = () => {
      setHovering(false);
      // hide cursor by moving it off-screen (keeps clampedPos stable)
      setCursorPos({ x: -9999, y: -9999 });
    };

    // if user moves pointer specifically inside the section, update (keeps smoother)
    const onMove = (e) => setCursorPos({ x: e.clientX, y: e.clientY });

    section.addEventListener('mouseenter', onEnter);
    section.addEventListener('mouseleave', onLeave);
    section.addEventListener('mousemove', onMove);

    return () => {
      section.removeEventListener('mouseenter', onEnter);
      section.removeEventListener('mouseleave', onLeave);
      section.removeEventListener('mousemove', onMove);
    };
  }, [isTouchDevice]);

  // ------------------------------------------------------------------
  // Scroll/resize/visualViewport handler:
  // When the user scrolls into the section, we check the last-known pointer
  // position and, if it's over the section, immediately show & clamp the cursor.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isTouchDevice) return;

    const updatePointerInside = () => {
      const section = sectionRef.current;
      if (!section) return;

      const last = lastPointerRef.current;
      const x = last.x;
      const y = last.y;

      // If we don't have a valid pointer, bail early
      if (x < -9000 || y < -9000) return;

      const rect = section.getBoundingClientRect();
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      if (inside) {
        // pointer is over the section after scroll/resize -> set hover + clamp immediately
        setHovering(true);
        setCursorPos({ x, y });

        // compute clamped coords (use viewport dimensions so cursor won't overflow)
        const clampX = Math.min(Math.max(x, EDGE_PADDING), window.innerWidth - EDGE_PADDING);
        const clampY = Math.min(Math.max(y, EDGE_PADDING), window.innerHeight - EDGE_PADDING);
        setClampedPos({ x: clampX, y: clampY });
      } else {
        // If the pointer is outside the section after scrolling, hide the cursor
        setHovering(false);
        setCursorPos({ x: -9999, y: -9999 });
        setClampedPos({ x: -9999, y: -9999 });
      }
    };

    // Use both window scroll + visualViewport resize/scroll for mobile address-bar changes
    window.addEventListener('scroll', updatePointerInside, { passive: true });
    window.addEventListener('resize', updatePointerInside, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updatePointerInside, { passive: true });
      window.visualViewport.addEventListener('scroll', updatePointerInside, { passive: true });
    }

    // also run once on mount so if you're already scrolled into the section we pick it up
    updatePointerInside();

    return () => {
      window.removeEventListener('scroll', updatePointerInside);
      window.removeEventListener('resize', updatePointerInside);
      if (window.visualViewport) {
        try {
          window.visualViewport.removeEventListener('resize', updatePointerInside);
          window.visualViewport.removeEventListener('scroll', updatePointerInside);
        } catch {}
      }
    };
  }, [isTouchDevice]);

  // ------------------------------------------------------------------
  // Clamp cursor position safely on the client whenever cursorPos changes
  // ------------------------------------------------------------------
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
      style={{ height: '400vh', cursor: hovering && !isTouchDevice ? 'none' : 'auto' }}
    >
      {/* Sticky image overlay */}
      <div className="sticky top-0 h-0 z-20 pointer-events-none">
        <div
          className="absolute top-0 left-0 w-screen h-screen"
          style={{ pointerEvents: isTouchDevice ? 'none' : 'auto' }}
        >
          {/* pass clampedPos to CanvasImagePile (your Canvas component should accept it) */}
          <CanvasImagePile mousePos={clampedPos} interactions={!isTouchDevice} />
        </div>
      </div>

      {/* About sections */}
      {aboutTexts.map((text, idx) => {
        // Default height 200vh, but make the second (idx === 1) last 300vh
        const sectionHeight = idx === 1 ? '300vh' : '200vh';

        return (
          <div
            key={idx}
            className="relative"
            style={{ height: sectionHeight, zIndex: 10 }}
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
        );
      })}

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
