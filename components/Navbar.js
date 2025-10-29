'use client';

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

const links = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar({ lenis, introDone = true }) {
  const wrapperRef = useRef(null);
  const navRef = useRef(null);
  const navItemRefs = useRef({});
  const [activeId, setActiveId] = useState('home');

  // animated translucent box
  const [box, setBox] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const targetRef = useRef({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const rafRef = useRef(null);

  // visibility
  // Start hidden until introDone === true
  const [visible, setVisible] = useState(Boolean(introDone));
  const lastYRef = useRef(typeof window !== 'undefined' ? (window.pageYOffset || window.scrollY || 0) : 0);
  const tickingRef = useRef(false);

  // Keep a ref mirror of introDone so handlers can check synchronously
  const introDoneRef = useRef(Boolean(introDone));
  useEffect(() => {
    // when introDone transitions to true, show navbar and reset lastY to current scroll
    if (!introDoneRef.current && introDone) {
      introDoneRef.current = true;
      setVisible(true);
      lastYRef.current = typeof window !== 'undefined' ? (window.pageYOffset || window.scrollY || 0) : 0;

      // small safety: clear click-guard and programmatic locks so scroll logic works normally
      clickGuardRef.current = false;
      clearProgrammaticLock();
    } else {
      // keep the ref in sync for future checks
      introDoneRef.current = Boolean(introDone);
      if (!introDone) {
        // if intro re-starts / not done, hide navbar
        setVisible(false);
      }
    }
  }, [introDone]);

  const HIDE_BUFFER_PX = 12;
  const TRANSITION_MS = 420;
  const [hiddenOffset, setHiddenOffset] = useState(160);

  // click guard: prevents hiding while user clicked the nav
  const clickGuardRef = useRef(false);

  // programmatic lock: prevents scroll-based activeId changes while a nav-initiated scroll is in progress
  const programmaticLockRef = useRef(null); // stores id string or null
  const programmaticTimerRef = useRef(null);
  const PROGRAMMATIC_LOCK_MS = 950;

  // manual-input detection (to decide if a scroll is manual)
  const userInputTimestampRef = useRef(0);
  const MANUAL_WINDOW_MS = 350;

  const PADDING = 6;
  const LERP = 0.18;

  // ---------------- animated box helpers ----------------
  const computeTargetForId = (id) => {
    const navNode = navRef.current;
    const btn = navItemRefs.current[id];
    if (!navNode || !btn) return { left: 0, top: 0, width: 0, height: 0, opacity: 0 };

    const navRect = navNode.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    const left = btnRect.left - navRect.left - PADDING + navNode.scrollLeft;
    const top = btnRect.top - navRect.top - PADDING + navNode.scrollTop;
    const width = btnRect.width + PADDING * 2;
    const height = btnRect.height + PADDING * 2;

    return { left, top, width, height, opacity: 1 };
  };

  const startAnimation = () => {
    if (rafRef.current) return;

    const step = () => {
      const t = targetRef.current;
      setBox((curr) => {
        const nx = curr.left + (t.left - curr.left) * LERP;
        const ny = curr.top + (t.top - curr.top) * LERP;
        const nw = curr.width + (t.width - curr.width) * LERP;
        const nh = curr.height + (t.height - curr.height) * LERP;
        const no = curr.opacity + (t.opacity - curr.opacity) * LERP;

        const dist = Math.hypot(t.left - nx, t.top - ny, t.width - nw, t.height - nh, (t.opacity - no) * 100);

        if (dist < 0.5) {
          rafRef.current = null;
          return { left: t.left, top: t.top, width: t.width, height: t.height, opacity: t.opacity };
        }

        rafRef.current = requestAnimationFrame(step);
        return { left: nx, top: ny, width: nw, height: nh, opacity: no };
      });
    };

    rafRef.current = requestAnimationFrame(step);
  };

  const stopAnimation = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const updateTarget = (forId) => {
    const t = computeTargetForId(forId || activeId);
    // small optimization: avoid restarting animation if target hasn't moved meaningfully
    const prev = targetRef.current;
    const delta = Math.hypot(prev.left - t.left, prev.top - t.top, prev.width - t.width, prev.height - t.height);
    if (delta < 0.5 && Math.abs(prev.opacity - t.opacity) < 0.02) return;
    targetRef.current = t;
    startAnimation();
  };

  // ---------------- programmatic lock helpers ----------------
  const setProgrammaticLock = (id) => {
    programmaticLockRef.current = id;
    if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
    programmaticTimerRef.current = setTimeout(() => {
      programmaticLockRef.current = null;
      programmaticTimerRef.current = null;
    }, PROGRAMMATIC_LOCK_MS);
  };

  const clearProgrammaticLock = () => {
    programmaticLockRef.current = null;
    if (programmaticTimerRef.current) {
      clearTimeout(programmaticTimerRef.current);
      programmaticTimerRef.current = null;
    }
  };

  // ---------------- scroll-to handler ----------------
  const handleScrollTo = (id) => {
    // clicking keeps nav visible and locks activeId to the clicked id so the box doesn't jitter
    setVisible(true);
    clickGuardRef.current = true;
    setProgrammaticLock(id);

    setActiveId(id);
    updateTarget(id);

    const el = document.getElementById(id);
    if (!el) {
      if (id === 'home') {
        if (lenis && typeof lenis.scrollTo === 'function') lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // prefer lenis if provided
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(el);
    } else {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ---------------- active-section detection (no override during programmatic lock) ----------------
  useEffect(() => {
    let ticking = false;
    const sectionIds = links.map((l) => l.id);
    const getSections = () => sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    const computeActive = () => {
      // if programmatic lock is set, do not change activeId — keep the clicked id
      if (programmaticLockRef.current) return;

      const sections = getSections();
      if (!sections.length) {
        if (activeId !== 'home') setActiveId('home');
        return;
      }

      const viewportCenter = window.innerHeight / 2;

      let found = null;
      for (const s of sections) {
        const r = s.getBoundingClientRect();
        if (r.top <= viewportCenter && r.bottom >= viewportCenter) {
          found = s.id;
          break;
        }
      }

      if (!found) {
        let closest = null;
        let minDist = Infinity;
        for (const s of sections) {
          const r = s.getBoundingClientRect();
          const center = (r.top + r.bottom) / 2;
          const dist = Math.abs(center - viewportCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = s.id;
          }
        }

        const firstTop = sections[0].getBoundingClientRect().top;
        if (viewportCenter < firstTop - 20) found = 'home';
        else found = closest;
      }

      if (found && found !== activeId) {
        setActiveId(found);
        updateTarget(found);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          computeActive();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    const initial = setTimeout(() => {
      computeActive();
      updateTarget(document.getElementById(activeId) ? activeId : 'home');
    }, 80);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      clearTimeout(initial);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // ---------------- layout / box recompute ----------------
  useLayoutEffect(() => {
    updateTarget(activeId);

    const ro = new ResizeObserver(() => updateTarget(activeId));
    if (navRef.current) ro.observe(navRef.current);
    Object.values(navItemRefs.current).forEach((n) => n && ro.observe(n));

    const onWinResize = () => updateTarget(activeId);
    window.addEventListener('resize', onWinResize);

    return () => {
      ro.disconnect();
      stopAnimation();
      window.removeEventListener('resize', onWinResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------- compute hidden offset ----------------
  useLayoutEffect(() => {
    const computeHidden = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const wRect = wrapper.getBoundingClientRect();
      const distanceToBottom = wRect.top + wRect.height;
      setHiddenOffset(Math.ceil(distanceToBottom + 8));
    };

    computeHidden();
    window.addEventListener('resize', computeHidden);
    const t = setTimeout(computeHidden, 120);

    return () => {
      window.removeEventListener('resize', computeHidden);
      clearTimeout(t);
    };
  }, []);

  // ---------------- visibility: only manual downward scroll hides, clicks don't ----------------
  useEffect(() => {
    const now = () => Date.now();

    const handleVisibilityY = (y) => {
      // If intro hasn't finished, keep it hidden and do nothing
      if (!introDoneRef.current) {
        // keep nav hidden while intro runs
        if (visible) setVisible(false);
        lastYRef.current = y;
        return;
      }

      // click-guard prevents hiding while user intended the click
      if (clickGuardRef.current) {
        if (!visible) setVisible(true);
        lastYRef.current = y;
        return;
      }

      const last = lastYRef.current;

      if (y <= 40) {
        if (!visible) setVisible(true);
        lastYRef.current = y;
        return;
      }

      if (y === last) return;

      const delta = y - last;
      const isManual = now() - (userInputTimestampRef.current || 0) < MANUAL_WINDOW_MS;

      if (delta > 0) {
        // downward movement -> only hide for manual scrolls that exceed buffer
        if (isManual && Math.abs(delta) >= HIDE_BUFFER_PX) {
          if (visible) setVisible(false);
        }
      } else {
        // upward -> show immediately
        if (!visible) setVisible(true);
      }

      lastYRef.current = y;
    };

    const onWindowScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        handleVisibilityY(window.pageYOffset || window.scrollY || 0);
        tickingRef.current = false;
      });
    };

    const onUserInput = (ev) => {
      // any real input means manual; record timestamp and clear click/programmatic guards
      userInputTimestampRef.current = Date.now();
      if (clickGuardRef.current) clickGuardRef.current = false;
      if (programmaticLockRef.current) clearProgrammaticLock();
    };

    window.addEventListener('scroll', onWindowScroll, { passive: true });
    window.addEventListener('wheel', onUserInput, { passive: true });
    window.addEventListener('touchstart', onUserInput, { passive: true });
    window.addEventListener('keydown', onUserInput, { passive: true });

    // Lenis: treat its scroll events as scrolls, but manual detection still uses userInputTimestamp
    let lenisOff = null;
    if (lenis && typeof lenis.on === 'function') {
      const handler = (e) => {
        const y =
          typeof e === 'number'
            ? e
            : e && e.scroll && typeof e.scroll.y === 'number'
            ? e.scroll.y
            : typeof e.y === 'number'
            ? e.y
            : window.pageYOffset || window.scrollY || 0;
        handleVisibilityY(y);
      };
      lenis.on('scroll', handler);
      lenisOff = () => {
        if (lenis && typeof lenis.off === 'function') lenis.off('scroll', handler);
      };
    }

    return () => {
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('wheel', onUserInput);
      window.removeEventListener('touchstart', onUserInput);
      window.removeEventListener('keydown', onUserInput);
      if (lenisOff) lenisOff();
    };
  }, [lenis, visible]);

  // cleanup programmatic timer on unmount
  useEffect(() => {
    return () => {
      if (programmaticTimerRef.current) clearTimeout(programmaticTimerRef.current);
      programmaticLockRef.current = null;
    };
  }, []);

  const cssBoxStyle = {
    width: box.width ? `${Math.round(box.width)}px` : 0,
    height: box.height ? `${Math.round(box.height)}px` : 0,
    transform: `translate(${Math.round(box.left)}px, ${Math.round(box.top)}px)`,
    opacity: box.opacity,
  };

  return (
    <>
      {/* Poppins */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap"
      />

      <style>{`
        @keyframes ripple {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .nav-letter { display: inline-block; transition: color 0.26s ease; }
        .nav-link:hover .nav-letter { animation: ripple 0.6s ease forwards; }
      `}</style>

      <div
        ref={wrapperRef}
        className="absolute top-6 left-1/2 flex justify-center z-20 pointer-events-auto"
        style={{
          transform: visible
            ? 'translateX(-50%) translateY(0px)'
            : `translateX(-50%) translateY(-${hiddenOffset}px)`,
          transition: `transform ${TRANSITION_MS}ms cubic-bezier(.2,.9,.2,1)`,
          willChange: 'transform',
          fontFamily: "'Poppins', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue'",
        }}
        aria-hidden={!visible}
      >
        <nav
          ref={navRef}
          className="relative bg-black px-3 py-3 flex gap-3 rounded-[8px]"
          aria-label="Main navigation"
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              borderRadius: 8,
              background: 'rgba(255, 255, 255, 0.2)',
              pointerEvents: 'none',
              transition: 'opacity 160ms linear',
              transformOrigin: 'top left',
              zIndex: 0,
              ...cssBoxStyle,
            }}
            className="blur-none"
          />

          {links.map(({ id, label }) => (
            <button
              key={id}
              ref={(el) => (navItemRefs.current[id] = el)}
              onClick={() => handleScrollTo(id)}
              className={
                'nav-link relative z-10 text-xs font-normal cursor-pointer select-none bg-transparent border-none outline-none px-2 py-1 ' +
                (activeId === id ? 'text-white' : 'text-gray-400')
              }
              aria-current={activeId === id ? 'page' : undefined}
            >
              {label.split('').map((letter, i) => (
                <span key={i} className="nav-letter">{letter}</span>
              ))}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
