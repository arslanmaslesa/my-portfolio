'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const SarajevoTagline = ({ text, scrollY = 0, refObj = null, triggerOffset }) => {
  const containerRef = useRef(null);
  const wordRefs = useRef([]);
  const [viewportHeight, setViewportHeight] = useState(800);
  const startTopRef = useRef(null);

  // update viewport height on mount and resize
  useEffect(() => {
    const updateVH = () => setViewportHeight(window.innerHeight || 800);
    updateVH();
    window.addEventListener('resize', updateVH);
    return () => window.removeEventListener('resize', updateVH);
  }, []);

  // compute element absolute top when refObj or DOM changes (used only if triggerOffset not provided)
  useEffect(() => {
    const computeStartTop = () => {
      if (typeof window === 'undefined') return;
      if (typeof triggerOffset === 'number') {
        startTopRef.current = triggerOffset;
        return;
      }
      const target = (refObj && refObj.current) ? refObj.current : containerRef.current;
      if (!target) {
        startTopRef.current = 0;
        return;
      }
      const rect = target.getBoundingClientRect();
      startTopRef.current = Math.round(window.scrollY + rect.top);
    };

    // compute after a tick so layout settles
    const t = setTimeout(computeStartTop, 50);
    window.addEventListener('resize', computeStartTop);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', computeStartTop);
    };
  }, [refObj, triggerOffset, containerRef.current]);

  const words = useMemo(() => text.split(' '), [text]);

  const ANIM_SCROLL_DURATION = viewportHeight * 0.8; // scroll distance for full fade

  const startScroll = (typeof triggerOffset === 'number')
    ? triggerOffset
    : (startTopRef.current ?? 0);

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
        className="text-[24px] xl:text-[24px] 2xl:text-[36px]"
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
