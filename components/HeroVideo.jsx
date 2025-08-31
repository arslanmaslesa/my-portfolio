'use client';
import { useEffect } from "react";

const INTRO_DURATION = 1100; // slightly longer for more cinematic feel

const HeroVideo = ({ onVideoReady, introPlaying, introDone, clipScale }) => {
  const isIntro = !introDone;
  const effectiveScale = isIntro ? clipScale : 1;
  const transition = isIntro
    ? `clip-path ${INTRO_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
    : "none";

  return (
    <section className="absolute w-full h-screen px-3 py-3 2xl:px-6 2xl:py-6 z-30">
      <div
        className="w-full h-full rounded-[12px] overflow-hidden will-change-[clip-path]"
        style={{
          clipPath: `inset(0 ${(1 - effectiveScale) * 100}% ${(1 - effectiveScale) * 100}% 0 round 12px)`,
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
