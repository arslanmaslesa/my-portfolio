'use client';

import { useEffect, useState, useRef } from "react";
import Navbar from '../components/Navbar';
import { Poppins } from 'next/font/google';
import Image from 'next/image';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

/* ------------------- Loader (circle fill, no %) ------------------- */
const Loader = ({ progress, done }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-white transition-opacity duration-500 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <svg
        className="animate-spin"
        style={{ animationDuration: '3s' }}
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
      >
        {/* Track */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="#ddd"
          strokeWidth="3"
          fill="none"
        />
        {/* Progress */}
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="black"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
    </div>
  );
};

/* ------------------- Project Section ------------------- */
const ProjectCard = ({ image, title }) => (
  <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-neutral-100 group">
    <Image
      src={image}
      alt={title}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      className="object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105"
      priority={false}
    />

    <div className={`absolute bottom-3 2xl:bottom-6 left-3 2xl:left-6 pl-6 2xl:pl-12 pr-2 2xl:pr-4 py-2 2xl:py-4 gap-3 2xl:gap-6 inline-flex items-center w-fit h-fit rounded-[8px] bg-white ${poppins.className}`}>
      <p className="text-black text-[16px] 2xl:text-[24px] font-semibold leading-none whitespace-nowrap">
        {title}
      </p>

      <div className="h-9 w-9 2xl:h-16 2xl:w-16 rounded-full bg-[#E6E6E6] flex items-center justify-center transition-colors duration-500 group-hover:bg-black">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="3"
          stroke="currentColor"
          className="h-4 w-4 text-black transition-colors duration-300 group-hover:text-white"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
);


// utils/cn (optional helper)
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Data you can grow easily
const PROJECTS = [
  { id: 1, image: '/proj1.png', title: 'Appo Landing Page' },
  { id: 2, image: '/proj2.png', title: 'Appo' },
  { id: 3, image: '/proj3.png', title: 'Appo for Business', featured: true }, // spans 2 cols on md+
  { id: 4, image: '/proj4.png', title: 'Book Covers' },
  { id: 5, image: '/proj5.png', title: 'Kapetanovina Visit Card' },
];

// Keep your height logic in one place
const itemHeight =
  'h-[calc(100vw-108px)] md:h-[calc((100vw-64px)/2-44px)]';

const ProjectSection = ({ projects = PROJECTS }) => {
  return (
    <section className="px-3 2xl:px-6 pb-3 2xl:pb-6">
      <div className="grid gap-3 2xl:gap-6 grid-cols-1 md:grid-cols-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className={cn(
              'w-full',
              itemHeight,
              p.featured && 'md:col-span-2'
            )}
          >
            <ProjectCard image={p.image} title={p.title} />
          </div>
        ))}
      </div>
    </section>
  );
};

export { ProjectSection };


/* ------------------- Hero Video ------------------- */
const INTRO_DURATION = 1200; // ms           // video expand duration
const TAGLINE_TO_BLACK_DURATION = 1000;       // ms (text fade-to-black step)

/**
 * The goal:
 * 1) After loader -> pause scrolling.
 * 2) Tagline runs first and "fades to black".
 * 3) Immediately after that, video expand animation plays (INTRO_DURATION).
 *    During this expand, tagline text turns white (to blend over video).
 * 4) When video expand ends, resume scrolling.
 */
const HeroVideo = ({ scale, onVideoReady, introPlaying, introDone }) => {
  const [introScale, setIntroScale] = useState(0);

  useEffect(() => {
    if (introPlaying) {
      const id = requestAnimationFrame(() => setIntroScale(1));
      return () => cancelAnimationFrame(id);
    }
  }, [introPlaying]);

  const isIntro = !introDone;
  const effectiveScale = isIntro ? introScale : scale;
  const transition = isIntro
    ? `transform ${INTRO_DURATION}ms cubic-bezier(0.215, 0.61, 0.355, 1)`
    : 'none';
  const origin = isIntro ? 'top left' : 'top right';

  return (
    <div className="h-[190vh] relative z-30 px-3 2xl:px-6">
      <div className="sticky top-3 2xl:top-6" style={{ willChange: 'transform' }}>
        <div
          className="rounded-[12px] overflow-hidden"
          style={{
            transform: `scale(${effectiveScale})`,
            transformOrigin: origin,
            transition,
          }}
        >
          <div className="relative w-full h-[calc(100vh-24px)] 2xl:h-[calc(100vh-48px)] overflow-hidden rounded-[12px]">
            <video
              src="/hero1.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover block"
              onCanPlayThrough={onVideoReady}
              onLoadedData={() => {
                onVideoReady?.();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------- Top (ARSLAN MASLESA) Tagline ------------------- */
const Tagline = ({ scale, phase }) => {
  // phase: 'idle' | 'intro' (black) | 'done' (white)
  const [showName, setShowName] = useState(false);
  const [showRole, setShowRole] = useState(false);

  useEffect(() => {
    if (phase === 'intro') {
      setShowName(true);
      const t = setTimeout(() => setShowRole(true), 350);
      return () => clearTimeout(t);
    }
    if (phase === 'done') {
      setShowName(true);
      setShowRole(true);
    }
  }, [phase]);

  const wrapperOpacity = phase === 'intro' ? 1 : (scale < 0.75 ? 0 : 1);
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
            text-[18px] 2xl:text-[32px] font-medium tracking-[-0.01em] text-center md:text-left md:w-1/2
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
            text-[18px] 2xl:text-[32px] font-medium tracking-[-0.01em] text-center md:text-left md:w-1/2
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

  // Refs (no re-render)
  const lastScrollYRef = useRef(0);
  const vwRef = useRef(0);
  const vhRef = useRef(0);
  const taglineHeightRef = useRef(0);
  const extraRef = useRef(0);
  const lenisRef = useRef(null); // StrictMode guard
  const sequenceStartedRef = useRef(false);

  // Loader flags + progress (for the blue fill)
  const [domReady, setDomReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalSteps = 2; // DOM + video

  // Intro (video expand) animation state
  const [intro, setIntro] = useState({ playing: false, done: false });

  // Intro phases for the tagline
  // 'idle' -> (loader) ... then 'intro' (black) -> video expand kicks in and we switch to 'done' (white)
  const [taglinePhase, setTaglinePhase] = useState('idle'); // 'idle' | 'intro' | 'done'

  // React state
  const [ui, setUi] = useState({
    scale: 1,
    scrollY: 0,
    stickyTop: 0,
    computedHeight: 2000,
  });

  const FADE_START = 350;
  const FADE_DISTANCE = 60;
  const fadeEndScroll = FADE_START + FADE_DISTANCE + taglineText.length * 5;

  // progress update
  useEffect(() => {
    let steps = 0;
    if (domReady) steps += 1;
    if (videoReady) steps += 1;
    setProgress((steps / totalSteps) * 100);
  }, [domReady, videoReady]);

  const isLoaded = progress >= 100;

  // Mark DOM loaded (all resources)
  useEffect(() => {
    const done = () => setDomReady(true);
    if (document.readyState === 'complete') {
      done();
    } else {
      window.addEventListener('load', done);
      return () => window.removeEventListener('load', done);
    }
  }, []);

  // Fallback for video
  useEffect(() => {
    if (domReady && !videoReady) {
      const t = setTimeout(() => setVideoReady(true), 2500);
      return () => clearTimeout(t);
    }
  }, [domReady, videoReady]);

  /**
   * NEW: Orchestrate the full "tagline -> video expand" sequence and keep scrolling paused
   * for the entire duration.
   */
  useEffect(() => {
    if (!isLoaded || sequenceStartedRef.current) return;

    sequenceStartedRef.current = true;

    const stopLenis = () => {
      if (lenisRef.current) lenisRef.current.stop();
    };
    const startLenis = () => {
      if (lenisRef.current) lenisRef.current.start();
    };

    // 1) Immediately pause scroll & start tagline fade-to-black phase
    stopLenis();
    setTaglinePhase('intro');

    const t1 = setTimeout(() => {
      // 2) When tagline fade-to-black is over, switch tagline to white and start video expand
      setTaglinePhase('done');
      setIntro({ playing: true, done: false });

      const t2 = setTimeout(() => {
        // 3) End sequence, resume scrolling
        setIntro({ playing: false, done: true });
        startLenis();
      }, INTRO_DURATION);

      return () => clearTimeout(t2);
    }, TAGLINE_TO_BLACK_DURATION);

    return () => clearTimeout(t1);
  }, [isLoaded]);

  // Measure stuff
  useEffect(() => {
    const recomputeStaticThings = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      vwRef.current = vw;
      vhRef.current = vh;

      const isTallScreen = vh > vw * 1.2;
      extraRef.current = isTallScreen ? 0 : vh * 0.3;

      if (taglineRef.current) {
        taglineHeightRef.current = taglineRef.current.offsetHeight;
        const stickyTop = Math.max(0, vh - taglineHeightRef.current - 60);
        setUi(prev => ({ ...prev, stickyTop }));
      }
    };

    recomputeStaticThings();
    window.addEventListener('resize', recomputeStaticThings);
    return () => window.removeEventListener('resize', recomputeStaticThings);
  }, []);

  // Lenis
  useEffect(() => {
    if (lenisRef.current) return; // prevent double init in StrictMode

    let rafId = null;

    const commitScrollState = () => {
      const y = lastScrollYRef.current;
      const vw = vwRef.current;
      const vh = vhRef.current;

      const maxScale = (vw / 4) / (vw - 24);
      const scale = Math.max(1 - y / 800, maxScale);

      const computedHeight =
        y >= fadeEndScroll
          ? fadeEndScroll + extraRef.current + taglineHeightRef.current
          : vh ? vh * 2 : 2000;

      setUi(prev => ({
        ...prev,
        scale,
        scrollY: y,
        computedHeight,
      }));

      rafId = null;
    };

    (async () => {
      const { default: Lenis } = await import('@studio-freight/lenis');
      const lenis = new Lenis({
        lerp: 0.1,
        smooth: true,
        smoothWheel: true,
        smoothTouch: true,
      });

      lenisRef.current = lenis;

      lenis.on('scroll', ({ scroll }) => {
        lastScrollYRef.current = scroll;
        if (rafId === null) {
          rafId = requestAnimationFrame(commitScrollState);
        }
      });

      const raf = (time) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    })();

    return () => {
      lenisRef.current?.destroy?.();
      lenisRef.current = null;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [fadeEndScroll]);

  return (
    <main className="bg-white min-h-[300vh] relative">
      {/* Loader Overlay */}
      <Loader progress={progress} done={isLoaded} />

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Navbar />
      </div>

      {/* Hero Video & top tagline */}
      <HeroVideo
        scale={ui.scale}
        introPlaying={intro.playing}
        introDone={intro.done}
        onVideoReady={() => setVideoReady(true)}
      />
      <Tagline scale={ui.scale} phase={taglinePhase} />

      {/* Sarajevo tagline with dynamic sticky top, initial push by 50vh */}
      <div
        className="relative z-10 mt-[-120vh] sm:mt-[-125vh] md:mt-[-125vh] 2xl:mt-[-135vh] bg-white px-3 2xl:px-6"
        style={{
          height: `${ui.computedHeight}px`,
          paddingRight: "calc(25vw + 0.75rem)",
          transition: 'height 0.1s ease',
          paddingTop: '50vh',
        }}
      >
        <div className="sticky pb-[60px]" style={{ top: `${ui.stickyTop}px` }}>
          <SarajevoTagline
            text={taglineText}
            scrollY={ui.scrollY}
            refObj={taglineRef}
          />
        </div>
      </div>

      {/* Projects */}
      <ProjectSection />
    </main>
  );
}
