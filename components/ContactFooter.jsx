'use client';
import React, { useRef, useEffect, useState } from 'react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

export default function ContactFooter({
  socials = {
    email: 'hello@example.com',
    phone: '+1234567890',
    linkedin: 'https://www.linkedin.com/in/yourname',
    github: 'https://github.com/yourname',
    instagram: 'https://instagram.com/yourname',
    cv: '/cv/Arslan_Maslesa_CV.pdf',
  },
  onPrimaryClick,
}) {
  const year = new Date().getFullYear();
  const primaryText = "Let’s talk";
  const letters = Array.from(primaryText);
  const letterCount = letters.length;

  const [wrapWidth, setWrapWidth] = useState(0);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (wrapRef.current) {
      const resize = () => setWrapWidth(wrapRef.current.offsetWidth);
      resize();
      window.addEventListener("resize", resize);
      return () => window.removeEventListener("resize", resize);
    }
  }, []);

  const handlePrimary = () => {
    if (typeof onPrimaryClick === 'function') return onPrimaryClick();
    window.location.href = `mailto:${socials.email}?subject=Let’s%20Talk`;
  };

  const links = [
    { label: "Email", href: `mailto:${socials.email}` },
    { label: "Phone", href: `tel:${socials.phone}` },
    { label: "Instagram", href: socials.instagram },
    { label: "LinkedIn", href: socials.linkedin },
    { label: "GitHub", href: socials.github },
    { label: "Download CV", href: socials.cv, download: true },
  ];

  return (
    <footer
      className={`${poppins.className} relative z-[100] bg-black text-white w-full flex flex-col p-3 min-h-screen`}
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <div
          className="letsWrap inline-flex flex-col items-center gap-8 select-none cursor-pointer"
          onClick={handlePrimary}
          role="button"
          aria-label="Let's Talk"
          tabIndex={0}
        >
          <div
            ref={wrapRef}
            className="headlineWrap relative inline-flex flex-col items-center"
          >
            <div className="inline-flex items-baseline gap-6">
              <h1
                className="letsText m-0 text-white"
                style={{
                  fontSize: 'clamp(3rem, 12vw, 16rem)',
                  fontWeight: 200,
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
                <span className="bubble w-10 h-10 rounded-full bg-white" style={{ ['--i']: letterCount + 0 }} />
                <span className="bubble w-10 h-10 rounded-full bg-white" style={{ ['--i']: letterCount + 1 }} />
                <span className="bubble w-10 h-10 rounded-full bg-white" style={{ ['--i']: letterCount + 2 }} />
              </div>
            </div>

            {/* Underline bar */}
            <span className="underlineAnim absolute bottom-[-12px] left-0 h-1 bg-white rounded"></span>
          </div>

          {/* Links row: distributed evenly across width */}
          <nav
            className="linksRow"
            aria-label="contact links"
            style={{ width: wrapWidth ? `${wrapWidth}px` : "auto" }}
          >
            <ul className="flex w-full justify-between text-md">
              {links.map((link, i) => (
                <li key={i} className="whitespace-nowrap">
                  <a
                    href={link.href}
                    {...(link.download ? { download: true } : {})}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Footer bottom text */}
      <div className="flex-none px-6 text-sm flex items-center justify-center">
        <div className="text-center">
          © {year} Arslan Maslesa — Designed and built by me with ❤️
        </div>
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
          transform-origin: center bottom;
          animation: loopRipple var(--cycle) cubic-bezier(0.35, 0, 0.25, 1) infinite;
          animation-delay: calc(var(--i) * var(--stagger));
        }

        @keyframes loopRipple {
          0%   { transform: translateY(0) scale(1); }
          20%  { transform: translateY(calc(var(--pop-translate) * -1)) scale(var(--pop-scale)); }
          50%  { transform: translateY(2px) scale(0.99); }
          100% { transform: translateY(0) scale(1); }
        }

        .bubbles { transform: translateY(-0.06em); }

        .headlineWrap .underlineAnim {
          width: 0%;
          transform-origin: right;
          transition: width 0.4s ease, transform 0.4s ease;
        }
        .headlineWrap:hover .underlineAnim {
          width: 100%;
          transform-origin: left;
        }

        .linksRow a {
          color: #fff;
          text-decoration: none;
          display: inline-block;
          padding: 4px;
        }
        .linksRow a:hover {
          text-decoration: underline;
        }
      `}</style>
    </footer>
  );
}
