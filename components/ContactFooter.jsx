'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function ContactFooter({
  socials = {
    email: 'arslanm.design@gmail.com',
    linkedin: 'https://www.linkedin.com/in/arslan-maslesa-a96a54322/',
    github: 'https://github.com/arslanmaslesa',
    instagram: 'https://www.instagram.com/arslan_maslesa/',
    cv: '/Arslan_Maslesa_CV.pdf',
  },
  onPrimaryClick,
}) {
  const year = new Date().getFullYear();
  const primaryText = "Let’s talk";
  const letters = Array.from(primaryText);
  const letterCount = letters.length;

  const [wrapWidth, setWrapWidth] = useState(0);
  const [isVertical, setIsVertical] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [bubbleCount, setBubbleCount] = useState(3);

  const wrapRef = useRef(null);
  const linksRef = useRef(null);
  const measureTimerRef = useRef(null);
  const lastIsVerticalRef = useRef(isVertical);

  // Detect touch devices and set bubble count
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const touchSupported =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
      setIsTouch(touchSupported);

      const updateBubbles = () => {
        setBubbleCount(window.innerWidth < 640 ? 1 : 3);
      };
      updateBubbles();
      window.addEventListener('resize', updateBubbles);
      return () => window.removeEventListener('resize', updateBubbles);
    }
  }, []);

  useEffect(() => {
    if (!wrapRef.current || !linksRef.current) return;

    const HYSTERESIS = 8; 
    const DEBOUNCE = 80; 

    const measure = () => {
      window.requestAnimationFrame(() => {
        if (!wrapRef.current || !linksRef.current) return;
        const wrapW = Math.round(wrapRef.current.clientWidth);
        const linksW = Math.round(linksRef.current.scrollWidth);

        setWrapWidth(wrapW);

        const wantsVertical = lastIsVerticalRef.current
          ? linksW > wrapW - HYSTERESIS
          : linksW > wrapW + HYSTERESIS;

        if (wantsVertical !== lastIsVerticalRef.current) {
          lastIsVerticalRef.current = wantsVertical;
          setIsVertical(wantsVertical);
        }
      });
    };

    const scheduleMeasure = () => {
      if (measureTimerRef.current) clearTimeout(measureTimerRef.current);
      measureTimerRef.current = setTimeout(measure, DEBOUNCE);
    };

    measure();

    const onResize = () => scheduleMeasure();
    window.addEventListener('resize', onResize);

    const ro = new ResizeObserver(() => scheduleMeasure());
    ro.observe(wrapRef.current);
    ro.observe(linksRef.current);

    const fontFallbackTimer = setTimeout(() => scheduleMeasure(), 350);

    return () => {
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      if (measureTimerRef.current) clearTimeout(measureTimerRef.current);
      clearTimeout(fontFallbackTimer);
    };
  }, []); 

  const handlePrimary = () => {
    if (typeof onPrimaryClick === 'function') return onPrimaryClick();
    window.location.href = `mailto:${socials.email}?subject=Let’s%20Talk`;
  };

  const links = [
    { label: 'arslanm.design@gmail.com', href: `mailto:${socials.email}` },
    { label: 'Instagram', href: socials.instagram },
    { label: 'LinkedIn', href: socials.linkedin },
    { label: 'GitHub', href: socials.github },
    { label: 'Download CV', href: socials.cv, download: true },
  ];

  return (
    <footer
      className={`${poppins.className} relative z-[100] bg-white text-black w-full flex flex-col p-3 min-h-screen ${
        isTouch ? 'touch' : ''
      }`}
    >
      {/* Parent container adjusted for mobile left alignment */}
      <div className={`flex-1 flex flex-col justify-center w-full ${bubbleCount === 1 ? 'items-start' : 'items-center'}`}>
        {/* Let's Talk segment */}
        <div
          className={`letsWrap inline-flex flex-col gap-8 select-none cursor-pointer 
            ${bubbleCount === 1 ? 'items-start text-left w-full' : 'items-center text-center w-auto'}`}
          onClick={handlePrimary}
          role="button"
          aria-label="Let's Talk"
          tabIndex={0}
        >
          <div
            ref={wrapRef}
            className="headlineWrap relative inline-flex flex-col"
          >
            <div
              className={`inline-flex items-baseline gap-3 
                ${bubbleCount === 1 ? 'justify-start w-full' : 'justify-center'}`}
            >
              <h1
                className="letsText m-0 text-black"
                style={{
                  fontSize: 'clamp(3rem, 11vw, 16rem)',
                  fontWeight: 300,
                  lineHeight: 1,
                  letterSpacing: '-0.08em',
                  margin: 0,
                  display: 'inline-block',
                }}
              >
                {letters.map((ch, i) => (
                  <span
                    key={i}
                    className={`char ${ch === ' ' ? 'space' : ''}`}
                    style={{ ['--i']: i }}
                  >
                    {ch === ' ' ? '\u00A0' : ch}
                  </span>
                ))}
              </h1>

              <div className="bubbles inline-flex items-baseline pl-3 gap-3" aria-hidden>
                {Array.from({ length: bubbleCount }).map((_, n) => (
                  <span
                    key={n}
                    className="bubble w-12 h-12 rounded-full bg-[#eaeaea]"
                    style={{ ['--i']: letterCount + n }}
                  >
                    <span className="svgWrap" aria-hidden>
                      <svg viewBox="0 0 12 14" width="22" height="22" aria-hidden focusable="false">
                        <path
                          d="M3 2.5 L8.5 7 L3 11.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </svg>
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Links row */}
        <nav
          className="linksRow mt-8 w-full"
          aria-label="contact links"
          style={{ width: wrapWidth && bubbleCount !== 1 ? `${wrapWidth}px` : 'auto' }}
        >
          <ul
            ref={linksRef}
            className={`flex w-full gap-2 ${
              isVertical
                ? 'flex-col items-start text-[20px]'
                : bubbleCount === 1
                  ? 'justify-end text-base'
                  : 'justify-between text-base'
            }`}
          >
            {links.map((link, i) => (
              <li key={i} className={`${isVertical ? '' : 'whitespace-nowrap'}`}>
                <a
                  href={link.href}
                  {...(link.download ? { download: true } : {})}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="inline-block px-2 py-1"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Footer bottom */}
      <div className="flex-none px-6 text-sm flex items-center justify-center mt-8">
        <div className="text-center">© {year} Arslan Maslesa — Designed and built by me with ❤️</div>
      </div>

      <style jsx>{`
        .letsWrap {
          --stagger: 70ms;
          --pop-translate: 14px;
          --pop-scale: 1.05;
          --cycle: 1800ms;
        }

        .letsText .char {
          display: inline-block;
          line-height: 1;
          animation: loopRipple var(--cycle) cubic-bezier(0.35, 0, 0.25, 1) infinite;
          animation-delay: calc(var(--i) * var(--stagger));
        }

        .bubble {
          display: inline-block;
          vertical-align: baseline;
          transform-origin: center bottom;
          animation: loopRipple var(--cycle) cubic-bezier(0.35, 0, 0.25, 1) infinite;
          animation-delay: calc(var(--i) * var(--stagger));
          position: relative;
          overflow: visible;
          transition: background-color 0.25s ease, color 0.25s ease;
          color: #000;
        }

        .svgWrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .svgWrap svg {
          display: block;
          width: 22px;
          height: 22px;
        }

        /* Hover for desktop */
        .letsWrap:hover .bubble {
          background-color: #000;
          color: #fff;
        }
        .linksRow a:hover {
          text-decoration: underline;
        }

        /* Default hover state for touch devices */
        .touch .letsWrap .bubble {
          background-color: #000;
          color: #fff;
        }
        .touch .linksRow a {
          text-decoration: underline;
        }

        @keyframes loopRipple {
          0%   { transform: translateY(0) scale(1); }
          20%  { transform: translateY(calc(var(--pop-translate) * -1)) scale(var(--pop-scale)); }
          50%  { transform: translateY(2px) scale(0.99); }
          100% { transform: translateY(0) scale(1); }
        }

        .bubbles { transform: translateY(-0.06em); }

        .letsWrap:focus { outline: none; }
      `}</style>
    </footer>
  );
}
