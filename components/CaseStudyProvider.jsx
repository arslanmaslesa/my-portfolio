'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import CaseStudyContent from './CaseStudyContent';

/*
  CASE STUDY PROVIDER — overlay functionality only
  - Context / provider
  - Body lock helpers (iOS-safe + non-iOS)
  - Portal creation
  - --vh handling for mobile
  - Lenis pause/resume
  - ESC to close
  - Overlay shell with wheel / touch / click handlers
  - Presentation delegated to CaseStudyContent
*/

const CaseStudyContext = createContext(null);
export const useCaseStudy = () => {
  const ctx = useContext(CaseStudyContext);
  if (!ctx) throw new Error('useCaseStudy must be used inside CaseStudyProvider');
  return ctx;
};

// --- small helper to detect iOS devices reliably enough for this use-case
const isIOS = () => {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  // covers iPhone/iPad/iPod and iPadOS (which sometimes reports Mac)
  return /iP(ad|hone|od)/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
};

// --- body lock helpers
let _savedScrollY = 0;
const lockBody = () => {
  try {
    _savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;

    if (isIOS()) {
      // On iOS: avoid position:fixed pitfalls — hide overflow and mark a helper class.
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.classList.add('case-study-open-ios');
    } else {
      // Non-iOS: use position:fixed approach to preserve scroll pos
      document.body.style.position = 'fixed';
      document.body.style.top = `-${_savedScrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.classList.add('case-study-open');
    }
  } catch (e) {
    // noop
  }
};
const unlockBody = () => {
  try {
    if (isIOS()) {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.classList.remove('case-study-open-ios');
      window.scrollTo(0, _savedScrollY || 0);
      _savedScrollY = 0;
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.classList.remove('case-study-open');
      window.scrollTo(0, _savedScrollY || 0);
      _savedScrollY = 0;
    }
  } catch (e) {
    // noop
  }
};

export const CaseStudyProvider = ({ children, lenis = null }) => {
  const [open, setOpen] = useState(false);
  const [project, setProject] = useState(null);

  const openCaseStudy = (proj) => {
    setProject(proj || null);
    setOpen(true);
    if (typeof document !== 'undefined') lockBody();
    if (typeof window !== 'undefined') window.__CASE_STUDY_OPEN = true;
  };

  const closeCaseStudy = () => {
    setOpen(false);
    setTimeout(() => setProject(null), 180);
    if (typeof document !== 'undefined') unlockBody();
    if (typeof window !== 'undefined') window.__CASE_STUDY_OPEN = false;
  };

  return (
    <CaseStudyContext.Provider value={{ open, project, openCaseStudy, closeCaseStudy }}>
      {children}
      {open && <CaseStudyOverlay project={project} onClose={closeCaseStudy} lenis={lenis} />}
    </CaseStudyContext.Provider>
  );
};

export default CaseStudyProvider;

/* ---------------- CaseStudyOverlay (overlay shell + handlers) ---------------- */
const CaseStudyOverlay = ({ project = {}, onClose, lenis = null }) => {
  const portalRef = useRef(null);
  const overlayRef = useRef(null); // overlay scroll container
  const panelRef = useRef(null); // the card/panel inside overlay
  const lenisPaused = useRef(false);

  // used to avoid closing when user is scrolling via touch (with threshold)
  const touchMovedRef = useRef(false);
  const touchStartY = useRef(0);
  const TOUCH_MOVE_THRESHOLD = 8; // px

  // create portal root synchronously (client-only)
  if (typeof document !== 'undefined' && !portalRef.current) {
    let el = document.getElementById('case-study-root');
    if (!el) {
      el = document.createElement('div');
      el.id = 'case-study-root';
      document.body.appendChild(el);
    }
    portalRef.current = el;
  }

  // -- vh fallback for iOS: set --vh to 1% of window.innerHeight
  useEffect(() => {
    const setVh = () => {
      try {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
      } catch (e) {}
    };
    setVh();
    window.addEventListener('resize', setVh, { passive: true });
    window.addEventListener('orientationchange', setVh, { passive: true });
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  // Focus overlay and install a document touchmove blocker that allows scrolling inside the overlay
  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;

    try { el.focus(); } catch (e) {}

    const preventBodyTouch = (ev) => {
      // When user is touching outside the overlay, block default to stop background scrolling.
      // If touch is inside overlay, do nothing and allow overlay scroll.
      if (!el.contains(ev.target)) {
        ev.preventDefault();
      }
    };

    document.addEventListener('touchmove', preventBodyTouch, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventBodyTouch, { passive: false });
    };
  }, []);

  // Pause lenis when overlay opens
  useEffect(() => {
    try {
      if (lenis && typeof lenis.stop === 'function') {
        lenis.stop();
        lenisPaused.current = true;
      } else if (lenis && typeof lenis.pause === 'function') {
        lenis.pause();
        lenisPaused.current = true;
      }
    } catch (e) {
      lenisPaused.current = false;
    }

    return () => {
      try {
        if (lenis && lenisPaused.current) {
          if (typeof lenis.start === 'function') lenis.start();
          else if (typeof lenis.resume === 'function') lenis.resume();
        }
      } catch (e) {}
    };
  }, [lenis]);

  // ESC to close
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', onKey, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!portalRef.current) return null;

  // content will receive the refs so it can stop propagation when needed
  const content = (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={project.title || 'Case study'}
      className="fixed inset-0 z-50 bg-black/80"
      style={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'auto',
        overscrollBehavior: 'contain',
        position: 'fixed',
        inset: 0,
      }}
      // Ensure overlay itself can receive focus which helps with some mobile scrolling focus quirks
      tabIndex={-1}

      // Desktop: safe onWheel fallback to ensure wheel/trackpad scrolls overlay when required
      onWheel={(e) => {
        try {
          const el = overlayRef.current;
          if (!el) return;
          const canScroll = el.scrollHeight > el.clientHeight;
          if (canScroll) {
            el.scrollBy({ top: e.deltaY, left: e.deltaX || 0, behavior: 'auto' });
            // stop page from scrolling behind
            e.preventDefault();
          }
        } catch (err) {}
      }}

      // Click handler for mouse click/tap-end (desktop & quick taps)
      onClick={(e) => {
        // if click/tap target is inside the panel, ignore
        if (panelRef.current && panelRef.current.contains(e.target)) return;
        // If this was a touch-driven scroll (user moved), don't treat it as a tap.
        if (touchMovedRef.current) {
          // reset for next interaction
          touchMovedRef.current = false;
          return;
        }
        onClose();
      }}

      // Track touch movement to avoid closing when user scrolls (mobile)
      onTouchStart={(e) => {
        touchMovedRef.current = false;
        if (e.touches && e.touches[0]) touchStartY.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        if (e.touches && e.touches[0]) {
          const delta = Math.abs(e.touches[0].clientY - (touchStartY.current || 0));
          if (delta > TOUCH_MOVE_THRESHOLD) touchMovedRef.current = true;
        }
      }}
      onTouchEnd={(e) => {
        // If user tapped without meaningful move, check if target is outside panel and then close.
        if (!touchMovedRef.current) {
          if (panelRef.current && panelRef.current.contains(e.target)) return;
          onClose();
        }
        touchMovedRef.current = false;
        touchStartY.current = 0;
      }}
    >
      {/* Inline font loader (presentation-related but kept here to ensure fonts are present even if presentation file is lazy loaded) */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" />

      {/* Panel flow: delegate all content/markup/styling to CaseStudyContent */}
      <div className="relative z-40">
        <div className="mx-6 my-6 md:mx-28" style={{ marginBottom: '3rem' }}>
          <CaseStudyContent project={project} onClose={onClose} panelRef={panelRef} />
        </div>
      </div>

      {/* Small runtime styles to help iOS body-lock case without a global stylesheet */}
      <style>{`
        /* When we lock on iOS we add a helper class to body. Keep this minimal and scoped. */
        body.case-study-open-ios { -webkit-overflow-scrolling: touch; }
        /* ensure overlays can't accidentally allow background touch-through */
        #case-study-root { pointer-events: auto; }
      `}</style>
    </div>
  );

  return createPortal(content, portalRef.current);
};
