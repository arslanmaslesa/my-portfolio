'use client';
import { useState, useEffect } from "react";

const INTRO_DURATION = 1200;

const HeroVideo = ({ onVideoReady, introPlaying, introDone }) => {
  const [introScale, setIntroScale] = useState(0);

  useEffect(() => {
    if (introPlaying) {
      const id = requestAnimationFrame(() => setIntroScale(1));
      return () => cancelAnimationFrame(id);
    }
  }, [introPlaying]);

  const isIntro = !introDone;
  const effectiveScale = isIntro ? introScale : 1;
  const transition = isIntro
    ? `transform ${INTRO_DURATION}ms cubic-bezier(0.215, 0.61, 0.355, 1)`
    : "none";

  return (
    <section className="absolute w-full h-screen px-3 py-3 2xl:px-6 2xl:py-6 z-30">
      <div
        className="w-full h-full rounded-[12px] overflow-hidden"
        style={{
          transform: `scale(${effectiveScale})`,
          transformOrigin: "top left",
          transition,
        }}
      >
        <video
          src="/hero1.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover block"
          onCanPlayThrough={onVideoReady}
          onLoadedData={onVideoReady}
        />
      </div>
    </section>
  );
};

export default HeroVideo;
