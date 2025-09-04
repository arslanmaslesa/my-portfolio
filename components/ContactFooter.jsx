'use client';

import React from 'react';
import { Poppins } from 'next/font/google';

// Import Poppins with thin weights
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
    dribbble: 'https://dribbble.com/yourname',
    behance: 'https://behance.net/yourname',
  },
  onPrimaryClick,
}) {
  const year = new Date().getFullYear();

  const handlePrimary = () => {
    if (typeof onPrimaryClick === 'function') return onPrimaryClick();
    window.location.href = `mailto:${socials.email}?subject=Let’s%20Talk`;
  };

  return (
    <footer
      className={`relative z-[100] bg-white text-slate-900 w-full flex flex-col ${poppins.className}`}
      style={{
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      {/* Contact + Socials */}
      <div className="flex-1 max-w-6xl mx-auto flex flex-col justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 text-base text-slate-700 max-w-3xl mx-auto">
          {/* Contact */}
          <div>
            <h4 className="uppercase text-xs text-slate-500 tracking-wider mb-3">
              Contact
            </h4>
            <ul className="space-y-2 break-words">
              <li>
                <a
                  href={`mailto:${socials.email}`}
                  className="hover:underline break-words"
                >
                  {socials.email}
                </a>
              </li>
              <li>
                <a href={`tel:${socials.phone}`} className="hover:underline">
                  {socials.phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h4 className="uppercase text-xs text-slate-500 tracking-wider mb-3">
              Socials
            </h4>
            <div className="flex flex-wrap gap-4">
              {['linkedin','github','behance','dribbble'].map((s) => (
                <a
                  key={s}
                  href={socials[s]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-slate-200 px-6 py-6 text-sm flex flex-col md:flex-row items-center justify-between text-slate-500">
        <div className="break-words">
          © {year} Arslan Maslesa — Designed & built by me.
        </div>
        <div className="flex gap-6 mt-2 md:mt-0">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="#top" className="hover:underline">Back to top</a>
        </div>
      </div>

      {/* Final "Let’s Talk" headline with hugging text */}
      <div className="w-full flex items-end justify-between mt-16">
        <div className="relative inline-block">
          <h1
            onClick={handlePrimary}
            className="cursor-pointer text-black select-none"
            style={{
              fontSize: 'clamp(3rem, 18vw, 16rem)', // responsive
              fontWeight: 200,                      // thin
              lineHeight: 1,                        // hug text
              letterSpacing: '-0.08em',             // -8%
              textRendering: 'optimizeLegibility',
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            Let’s Talk
          </h1>
        </div>
        <div className="w-12 h-12 md:w-20 md:h-20 bg-black rounded-full ml-auto mb-2" />
      </div>
    </footer>
  );
}
