'use client';
import { useState, useEffect } from "react";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

/**
 * Tagline overlay (ARSLAN MASLESA / PRODUCT DESIGNER / Rotating Words)
 * @param {string} phase - 'idle' | 'intro' | 'done'
 * @param {number} scrollY - current scroll from Lenis
 * @param {number} videoHeight - height of the hero video
 */
const Tagline = ({ phase, scrollY, videoHeight }) => {
  const [showName, setShowName] = useState(false);
  const [showRole, setShowRole] = useState(false);
  const [showTag, setShowTag] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = ['USER-FOCUSED', 'CREATIVE', 'FUNCTIONAL', 'ELEGANT', 'IMPACTFUL'];

  // Handle word rotation every 2 seconds
  useEffect(() => {
    if (phase === 'intro' || phase === 'done') {
      const interval = setInterval(() => {
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Handle animation timing for each segment
  useEffect(() => {
    if (phase === 'intro') {
      setShowName(true);
      const roleTimer = setTimeout(() => setShowRole(true), 400);
      const tagTimer = setTimeout(() => setShowTag(true), 800);
      return () => {
        clearTimeout(roleTimer);
        clearTimeout(tagTimer);
      };
    }
    if (phase === 'done') {
      setShowName(true);
      setShowRole(true);
      setShowTag(true);
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
        {/* NAME (Left) */}
        <p
          className={`
            ${baseColor}
            text-[28px] 2xl:text-[32px] font-medium tracking-[-0.01em]
            text-center md:text-left md:w-1/3
            transition-all duration-500
            ${showName ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          ARSLAN MASLESA
        </p>

        {/* Spacer for mobile */}
        <div className="h-20 md:hidden" />

        {/* ROLE (Center) */}
        <p
          className={`
            ${baseColor}
            text-[28px] 2xl:text-[32px] font-medium tracking-[-0.01em]
            text-center md:w-1/3
            transition-all duration-500
            ${showRole ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          PRODUCT DESIGNER
        </p>

        {/* Spacer for mobile */}
        <div className="h-20 md:hidden" />

        {/* ROTATING TAG (Right) */}
        <p
          className={`
            ${baseColor}
            text-[28px] 2xl:text-[32px] font-medium tracking-[-0.01em]
            text-center md:text-right md:w-1/3
            transition-all duration-500
            ${showTag ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
          key={words[currentWordIndex]} // Ensure smooth transition for word change
        >
          {words[currentWordIndex]}
        </p>
      </div>
    </div>
  );
};

export default Tagline;