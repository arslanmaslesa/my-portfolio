'use client';

import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const SarajevoTagline = ({ text, scrollY = 0, videoHeight = 0, refObj = null }) => {
  const containerRef = useRef(null);
  const wordRefs = useRef([]);

  if (refObj && typeof refObj === 'object') {
    refObj.current = containerRef.current;
  }

  const words = useMemo(() => text.split(' '), [text]);

  // Use a safe viewport height fallback
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Total animation scroll distance
  const ANIM_SCROLL_DURATION = (videoHeight || viewportHeight) - 100;

  // Progress of animation (0..1)
  let progress = (scrollY - (videoHeight || 0)) / ANIM_SCROLL_DURATION;
  progress = Math.min(1, Math.max(0, progress));

  const lerpGrayToBlack = (t) => {
    const start = 210;
    const val = Math.round(start * (1 - t));
    return `rgb(${val}, ${val}, ${val})`;
  };

  // Each word gets a fraction of the total progress
  const wordCount = words.length;
  const FADE_SPAN = 1 / wordCount;

  return (
    <div
      ref={containerRef}
      className={`${poppins.className} max-w-[90vw] sm:max-w-[75vw] md:max-w-[60vw] lg:max-w-[80vw] text-center`}
      style={{ lineHeight: 1.05, pointerEvents: 'none' }}
    >
      <p
        className="text-[36px] xl:text-[56px] 2xl:text-[100px] font-medium tracking-[-0.01em] leading-tight"
        style={{ margin: 0 }}
      >
        {words.map((w, i) => {
          const startProgress = i * FADE_SPAN;
          let wordProgress = (progress - startProgress) / FADE_SPAN;
          wordProgress = Math.min(1, Math.max(0, wordProgress));

          const color = lerpGrayToBlack(wordProgress);

          return (
            <span
              key={`${w}-${i}`}
              ref={(el) => (wordRefs.current[i] = el)}
              style={{ color, transition: 'color 180ms linear' }}
            >
              {w + ' '}
            </span>
          );
        })}
      </p>
    </div>
  );
};

SarajevoTagline.propTypes = {
  text: PropTypes.string.isRequired,
  scrollY: PropTypes.number,
  videoHeight: PropTypes.number,
  refObj: PropTypes.object,
};

export default SarajevoTagline;
