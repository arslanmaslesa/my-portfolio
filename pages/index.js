'use client';

import { useEffect, useState, useRef } from "react";
import Navbar from '../components/Navbar';
import { Poppins } from 'next/font/google';
import Image from 'next/image';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

/* ------------------- Project Section ------------------- */
const ProjectCard = ({ image, title }) => (
  <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-neutral-100">
    <Image
      src={image}
      alt={title}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover"
      priority={false}
    />
  </div>
);

const ProjectSection = () => {
  const itemHeight = "[height:calc(100vw-108px)] md:[height:calc((100vw-64px)/2-44px)]";

  return (
    <section className="px-3 pb-12">
      <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
        {[1, 2, 3, 4, 5].map(id => (
          <div
            key={id}
            className={`w-full ${id === 3 ? 'col-span-1 md:col-span-2' : ''} ${itemHeight}`}
          >
            <ProjectCard image={`/proj${id}.png`} title={`Project ${id}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

/* ------------------- Hero Video ------------------- */
const HeroVideo = ({ scale }) => (
  <div className="h-[190vh] relative z-30 px-3 2xl:px-6">
    <div className="sticky top-3 2xl:top-6">
      <div
        className="rounded-[12px] overflow-hidden"
        style={{ transform: `scale(${scale})`, transformOrigin: "top right" }}
      >
        <div className="relative w-full h-[calc(100vh-24px)] 2xl:h-[calc(100vh-48px)] overflow-hidden rounded-[12px]">
          <video
            src="/hero1.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover block"
          />
        </div>
      </div>
    </div>
  </div>
);

/* ------------------- Top (ARSLAN MASLESA) Tagline ------------------- */
const Tagline = ({ scale }) => {
  const opacity = scale < 0.75 ? 0 : 1;

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-40 pointer-events-none px-6.5 2xl:px-13 ${poppins.className}`}
      style={{ opacity, transition: "opacity 0.3s ease-out" }}
    >
      <div className="flex flex-col md:flex-row h-full items-center justify-center md:justify-between">
        <p className="text-white text-[18px] 2xl:text-[32px] font-medium tracking-[-0.01em] text-center md:text-left md:w-1/2">
          ARSLAN MASLESA
        </p>
        <div className="h-30 md:hidden" />
        <p className="text-white text-[18px] 2xl:text-[32px] font-medium tracking-[-0.01em] text-center md:text-left md:w-1/2">
          PRODUCT DESIGNER
        </p>
      </div>
    </div>
  );
};

/* ------------------- Sarajevo Tagline ------------------- */
const SarajevoTagline = ({ text, scrollY, refObj }) => {
  const LETTER_FADE_START = 440;
  const LETTER_FADE_DISTANCE = 60;

  const getLetterColor = (index) => {
    const relScroll = scrollY - LETTER_FADE_START - index * 5;

    if (relScroll <= 0) return 'rgba(0,0,0,0.1)';
    if (relScroll >= LETTER_FADE_DISTANCE) return 'rgba(0,0,0,1)';

    const opacity = 0.1 + (0.9 * relScroll / LETTER_FADE_DISTANCE);
    return `rgba(0,0,0,${opacity.toFixed(2)})`;
  };

  let globalIdx = 0;

  return (
    <div
      ref={refObj}
      className={`text-left font-medium
        text-[32px] leading-[44px] 
        sm:text-[48px] sm:leading-[56px] 
        2xl:text-[92px] 2xl:leading-[108px] 
        tracking-[-0.04em] ${poppins.className}`}
    >
      {text.split(' ').map((word, wIdx) => (
        <span
          key={wIdx}
          className="inline-block whitespace-nowrap mr-[0.25ch]"
        >
          {word.split('').map((ch, cIdx) => {
            const color = getLetterColor(globalIdx);
            globalIdx += 1;
            return (
              <span
                key={`${wIdx}-${cIdx}`}
                style={{ color, transition: 'color 0.1s linear', display: 'inline-block' }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

/* ------------------- Page ------------------- */
export default function Home() {
  const taglineText =
    "Product designer based in Sarajevo, turning complex ideas into simple experiences.";

  const taglineRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [scrollY, setScrollY] = useState(0);
  const [taglineHeight, setTaglineHeight] = useState(0);
  const [stickyTop, setStickyTop] = useState(0);
  const [extra, setExtra] = useState(0); // 30vh for normal screens, 0 for tall
  const [vh, setVh] = useState(0);

  // Lenis + scroll/resize handling (client-only)
  useEffect(() => {
    let lenis;

    const start = async () => {
      const { default: Lenis } = await import('@studio-freight/lenis');

      lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
      });

      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      const handle = () => {
        const y = window.scrollY;
        const vw = window.innerWidth;
        const _vh = window.innerHeight;
        setVh(_vh);

        const maxScale = (vw / 4) / (vw - 24);
        setScale(Math.max(1 - y / 800, maxScale));
        setScrollY(y);

        // 30vh on normal screens, 0 on tall ones
        const isTallScreen = _vh > vw * 1.2;
        setExtra(isTallScreen ? 0 : _vh * 0.3);

        if (taglineRef.current) {
          const h = taglineRef.current.offsetHeight;
          setTaglineHeight(h);
          setStickyTop(Math.max(0, _vh - h - 60));
        }
      };

      handle();
      window.addEventListener("scroll", handle);
      window.addEventListener("resize", handle);

      return () => {
        window.removeEventListener("scroll", handle);
        window.removeEventListener("resize", handle);
      };
    };

    start();

    return () => {
      if (lenis) lenis.destroy?.();
    };
  }, []);

  // Fade / height logic (same behaviour as before)
  const FADE_START = 350;
  const FADE_DISTANCE = 60;
  const fadeEndScroll = FADE_START + FADE_DISTANCE + taglineText.length * 5;

  const computedHeight =
    scrollY >= fadeEndScroll
      ? fadeEndScroll + extra + taglineHeight
      : (vh ? vh * 2 : 2000);

  return (
    <main className="bg-white min-h-[300vh] relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Navbar />
      </div>

      {/* Hero Video & top tagline */}
      <HeroVideo scale={scale} />
      <Tagline scale={scale} />

      {/* Sarajevo tagline with dynamic sticky top, initial push by 50vh */}
      <div
        className="relative z-10 mt-[-110vh] sm:mt-[-125vh] md:mt-[-125vh] lg:mt-[-125vh] bg-white px-3"
        style={{
          height: `${computedHeight}px`,
          paddingRight: "calc(25vw + 0.75rem)",
          transition: 'height 0.1s ease',
          paddingTop: '50vh',
        }}
      >
        <div className="sticky pb-[60px]" style={{ top: `${stickyTop}px` }}>
          <SarajevoTagline
            text={taglineText}
            scrollY={scrollY}
            refObj={taglineRef}
          />
        </div>
      </div>

      {/* Projects */}
      <ProjectSection />
    </main>
  );
}
