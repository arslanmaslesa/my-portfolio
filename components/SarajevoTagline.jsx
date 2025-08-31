'use client';

import React, { useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const SarajevoTagline = ({ text, scrollY = 0, refObj = null, triggerOffset }) => {
  const containerRef = useRef(null);
  const wordRefs = useRef([]);

  // NOTE: do NOT assign to refObj.current here — parent should own that ref.
  // refObj is only *read* if provided.

  const words = useMemo(() => text.split(' '), [text]);
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  // Determine fade start using absolute document offset (triggerOffset if provided)
  const top = (refObj && refObj.current && typeof refObj.current.offsetTop === 'number')
    ? refObj.current.offsetTop
    : (containerRef.current ? containerRef.current.offsetTop : 0);

  const startScroll = triggerOffset !== undefined ? triggerOffset : top;

  const ANIM_SCROLL_DURATION = viewportHeight * 0.8; // scroll distance for full fade

  // progress 0..1 based on absolute scrollY
  let progress = (scrollY - startScroll) / ANIM_SCROLL_DURATION;
  progress = Math.min(1, Math.max(0, progress));

  const lerpGrayToBlack = (t) => {
    const start = 210;
    const val = Math.round(start * (1 - t));
    return `rgb(${val}, ${val}, ${val})`;
  };

  const wordCount = words.length;
  const FADE_SPAN = 1 / Math.max(1, wordCount);

  return (
    <div
      ref={containerRef}
      className={`${poppins.className} max-w-[90vw] sm:max-w-[75vw] md:max-w-[60vw] lg:max-w-[50vw] text-center`}
      style={{ lineHeight: 1.05, pointerEvents: 'none' }}
    >
      <p
        className="text-[24px] xl:text-[24px] 2xl:text-[36px]  "
        style={{ lineHeight: 1.4, margin: 0 }}
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
  refObj: PropTypes.object,
  triggerOffset: PropTypes.number,
};

export default SarajevoTagline;
