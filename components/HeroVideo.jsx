'use client';
import React, { useEffect, useState } from 'react';

const INTRO_DURATION = 1100; // slightly longer for more cinematic feel

// simple Safari check (works on desktop Safari and iOS Safari; avoids Chrome/Chromium)
const detectSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // exclude Chrome on iOS (CriOS), Firefox iOS (FxiOS), etc.
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|OPR|Edg/.test(ua);
  // Safari on macOS has vendor 'Apple Computer, Inc.' which is another hint
  const vendorIsApple = navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
  return isSafari || vendorIsApple;
};

const HeroVideo = ({ onVideoReady = () => {}, introPlaying, introDone, clipScale = 1, poster = '/hero1.png', src = '/hero1.mp4' }) => {
  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(detectSafari());
  }, []);

  const isIntro = !introDone;
  const effectiveScale = isIntro ? clipScale : 1;
  const transition = isIntro
    ? `clip-path ${INTRO_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
    : 'none';

  return (
    <section className="absolute w-full h-screen px-3 py-3 2xl:px-6 2xl:py-6 z-30 pointer-events-none">
      <div
        className="w-full h-full rounded-[12px] overflow-hidden will-change-[clip-path]"
        style={{
          clipPath: `inset(0 ${(1 - effectiveScale) * 100}% ${(1 - effectiveScale) * 100}% 0 round 12px)`,
          transition,
        }}
      >
        {/* On Safari render an image (poster) — avoids blank / codec issues */}
        {isSafari ? (
          <img
            src={src}
            alt="Hero"
            className="w-full h-full object-cover block"
            onLoad={() => {
              // signal readiness (keeps parity with onLoadedData / onCanPlayThrough)
              try {
                onVideoReady();
              } catch (e) {}
            }}
            style={{ display: 'block' }}
          />
        ) : (
          <video
            src={src}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover block"
            onCanPlayThrough={onVideoReady}
            onLoadedData={onVideoReady}
            // safety attributes
            preload="metadata"
            crossOrigin="anonymous"
            // ensure iOS has the attribute too (some browsers respect attribute presence)
            // React will pass playsInline above; for webkit sometimes attribute needs to be present as string
            // we add it using an attribute hack via a refless prop is OK in modern React (playsInline already set)
          />
        )}
      </div>
    </section>
  );
};

export default HeroVideo;
