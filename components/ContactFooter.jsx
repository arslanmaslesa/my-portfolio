'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
    window.location.href = `mailto:${socials.email}?subject=Lets%20talk`;
  };

  return (
    <footer
      style={{ fontFamily: "'Poppins', sans-serif" }}
      className="absolute z-100 bg-white text-slate-900 h-screen w-screen flex flex-col"
    >
      {/* Load Poppins */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
        rel="stylesheet"
      />

      {/* Main content */}
      <div className="flex-1 max-w-6xl mx-auto px-6 flex flex-col justify-center">
        {/* Headline */}
        <div className="w-full flex justify-center mb-20">
          <motion.button
            onClick={handlePrimary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.995 }}
            className="focus:outline-none"
            aria-label="Lets Talk"
          >
            <motion.h1
              initial={{ y: 0 }}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="select-none whitespace-nowrap font-normal leading-none text-[6.5rem] sm:text-[8rem] md:text-[9.5rem] lg:text-[10.5rem] text-center tracking-tight text-black"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
              }}
            >
              Lets&nbsp;Talk
            </motion.h1>
          </motion.button>
        </div>

        {/* Footer columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-base text-slate-700 max-w-3xl mx-auto">
          {/* Contact */}
          <div>
            <h4 className="uppercase text-xs text-slate-500 tracking-wider mb-3">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a href={`mailto:${socials.email}`} className="hover:underline">
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
            <p className="space-x-6">
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
            </p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="border-t border-slate-200 px-6 py-6 text-sm flex flex-col md:flex-row items-center justify-between text-slate-500">
        <div>© {year} Arslan Maslesa — Designed & built by me.</div>
        <div className="flex gap-6 mt-2 md:mt-0">
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <a href="#top" className="hover:underline">
            Back to top
          </a>
        </div>
      </div>

      {/* Hover shadow for Lets Talk */}
      <style jsx>{`
        footer h1:hover {
          text-shadow: 0 20px 50px rgba(0, 0, 0, 0.08),
            0 8px 25px rgba(0, 0, 0, 0.06);
        }
      `}</style>
    </footer>
  );
}
