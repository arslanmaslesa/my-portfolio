'use client';
import { useState, useEffect } from "react";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

/**
 * Tagline overlay (ARSLAN MASLESA / PRODUCT DESIGNER)
 * @param {string} phase - 'idle' | 'intro' | 'done'
 * @param {number} scrollY - current scroll from Lenis
 * @param {number} videoHeight - height of the hero video
 */
const Tagline = ({ phase, scrollY, videoHeight }) => {
  const [showName, setShowName] = useState(false);
  const [showRole, setShowRole] = useState(false);

  useEffect(() => {
    if (phase === 'intro') {
      setShowName(true);
      const t = setTimeout(() => setShowRole(true), 400);
      return () => clearTimeout(t);
    }
    if (phase === 'done') {
      setShowName(true);
      setShowRole(true);
    }
  }, [phase]);

  // Fade out once scrollY > 35% of hero video height
  const fadeStart = videoHeight * 0.30;
  const wrapperOpacity =
    phase === 'intro'
      ? 1
      : scrollY >= fadeStart
      ? 0
      : 1;

  const baseColor = phase === 'intro' ? 'text-black' : 'text-white';

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-40 pointer-events-none px-6.5 2xl:px-13 ${poppins.className}`}
      style={{ opacity: wrapperOpacity, transition: "opacity 0.3s ease-out" }}
    >
      <div className="flex flex-col md:flex-row h-full items-center justify-center md:justify-between">
        {/* NAME */}
        <p
          className={`
            ${baseColor}
            text-[18px] 2xl:text-[32px] font-medium tracking-[-0.01em]
            text-center md:text-left md:w-1/2
            transition-all duration-500
            ${showName ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          ARSLAN MASLESA
        </p>

        <div className="h-30 md:hidden" />

        {/* ROLE */}
        <p
          className={`
            ${baseColor}
            text-[18px] 2xl:text-[32px] font-medium tracking-[-0.01em]
            text-center md:text-left md:w-1/2
            transition-all duration-500
            ${showRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          PRODUCT DESIGNER
        </p>
      </div>
    </div>
  );
};

export default Tagline;
