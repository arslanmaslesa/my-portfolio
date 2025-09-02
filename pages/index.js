'use client';

import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import HeroVideo from "../components/HeroVideo";
import Tagline from "../components/Tagline";
import ProjectSection from "../components/ProjectSection";
import SarajevoTagline from "../components/SarajevoTagline";
import AboutSection from "../components/AboutSection";
import ContactFooter from "../components/ContactFooter";

export default function Home() {
  const taglineText =
    "Product designer based in Sarajevo, turning complex ideas into simple, intuitive, and lasting experiences.";

  const aboutTexts = [
    `Hi, I’m Arslan. I love immersing myself in architecture, film, music and culture, all of which inspire how I approach design.`,
    `I enjoy the energy of working with others, bouncing ideas around, shaping them together, and refining until the details feel just right.`,
  ];

  // stable refs
  const taglineRef = useRef(null);
  const aboutRefs = useRef(aboutTexts.map(() => React.createRef())).current;

  // offsets for about sections
  const [aboutOffsets, setAboutOffsets] = useState(() =>
    Array(aboutTexts.length).fill(null)
  );

  const lastScrollYRef = useRef(0);
  const vwRef = useRef(0);
  const vhRef = useRef(0);
  const lenisRef = useRef(null);
  const sequenceStartedRef = useRef(false);
  const needScrollResetRef = useRef(true);

  const [domReady, setDomReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalSteps = 2;

  const [intro, setIntro] = useState({ playing: false, done: false });
  const [clipScale, setClipScale] = useState(0);
  const [taglinePhase, setTaglinePhase] = useState("idle");

  const [ui, setUi] = useState({
    scale: 1,
    scrollY: 0,
    stickyTop: 0,
  });

  /* ---------------- Progress update ---------------- */
  useEffect(() => {
    let steps = 0;
    if (domReady) steps += 1;
    if (videoReady) steps += 1;
    setProgress((steps / totalSteps) * 100);
  }, [domReady, videoReady]);

  const isLoaded = progress >= 100;
  const shouldLockScroll = !isLoaded || !intro.done;

  /* ---------------- Scroll restoration ---------------- */
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, []);

  /* ---------------- Hard scroll lock ---------------- */
  useEffect(() => {
    const preventKeys = (e) => {
      const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40];
      if (keys.includes(e.keyCode)) e.preventDefault();
    };
    const prevent = (e) => e.preventDefault();

    const lock = () => {
      const body = document.body;
      const scrollY = window.scrollY;

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.overflow = "hidden";
      body.style.width = "100%";

      window.addEventListener("wheel", prevent, { passive: false });
      window.addEventListener("touchmove", prevent, { passive: false });
      window.addEventListener("keydown", preventKeys, { passive: false });
    };

    const unlock = () => {
      const body = document.body;
      body.style.position = "";
      body.style.top = "";
      body.style.left = "";
      body.style.right = "";
      body.style.overflow = "";
      body.style.width = "";

      window.removeEventListener("wheel", prevent);
      window.removeEventListener("touchmove", prevent);
      window.removeEventListener("keydown", preventKeys);
    };

    if (shouldLockScroll) {
      lock();
      if (lenisRef.current) lenisRef.current.stop();
    } else {
      unlock();
      if (lenisRef.current) lenisRef.current.start();
    }

    return () => {
      unlock();
    };
  }, [shouldLockScroll]);

  /* ---------------- Reset to top after loader ---------------- */
  useEffect(() => {
    if (!isLoaded) return;

    const resetToTop = () => {
      lastScrollYRef.current = 0;
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      needScrollResetRef.current = false;
    };

    requestAnimationFrame(() => requestAnimationFrame(resetToTop));
  }, [isLoaded]);

  /* ---------------- DOM Ready ---------------- */
  useEffect(() => {
    const done = () => setDomReady(true);
    if (document.readyState === "complete") {
      done();
    } else {
      window.addEventListener("load", done);
      return () => window.removeEventListener("load", done);
    }
  }, []);

  /* ---------------- Video fallback ---------------- */
  useEffect(() => {
    if (domReady && !videoReady) {
      const t = setTimeout(() => setVideoReady(true), 2500);
      return () => clearTimeout(t);
    }
  }, [domReady, videoReady]);

  /* ---------------- Orchestrate intro sequence ---------------- */
  useEffect(() => {
    if (!isLoaded || sequenceStartedRef.current) return;

    sequenceStartedRef.current = true;

    setTaglinePhase("intro");
    const t1 = setTimeout(() => {
      setTaglinePhase("done");
      const t2 = setTimeout(() => {
        setIntro({ playing: true, done: false });
        setClipScale(1);
        const t3 = setTimeout(() => {
          setIntro({ playing: false, done: true });
        }, 900);
        return () => clearTimeout(t3);
      }, 300);
      return () => clearTimeout(t2);
    }, 1000);

    return () => clearTimeout(t1);
  }, [isLoaded]);

  /* ---------------- Measure layout ---------------- */
  useEffect(() => {
    const recomputeStaticThings = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      vwRef.current = vw;
      vhRef.current = vh;

      setUi((prev) => ({ ...prev, stickyTop: Math.max(0, vh - 120) }));
    };

    recomputeStaticThings();
    window.addEventListener("resize", recomputeStaticThings);
    return () => window.removeEventListener("resize", recomputeStaticThings);
  }, []);

  /* ---------------- Compute about section absolute offsets ---------------- */
  useEffect(() => {
    if (!domReady) return;

    const computeOffsets = () => {
      const offsets = aboutRefs.map((r) => {
        const el = r.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return Math.round(window.scrollY + rect.top);
      });
      setAboutOffsets(offsets);
    };

    const t = setTimeout(computeOffsets, 50);
    window.addEventListener("resize", computeOffsets);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", computeOffsets);
    };
  }, [domReady, aboutRefs]);

  /* ---------------- Lenis ---------------- */
  useEffect(() => {
    if (lenisRef.current) return;

    let rafId = null;

    const commitScrollState = () => {
      const y = lastScrollYRef.current;
      setUi((prev) => ({ ...prev, scale: 1, scrollY: y }));
      rafId = null;
    };

    (async () => {
      const { default: Lenis } = await import("lenis");
      const lenis = new Lenis({
        lerp: 0.1,
        smooth: true,
        smoothWheel: true,
        smoothTouch: true,
      });

      lenisRef.current = lenis;

      if (isLoaded && needScrollResetRef.current) {
        lenis.scrollTo(0, { immediate: true });
        needScrollResetRef.current = false;
      }

      lenis.on("scroll", ({ scroll }) => {
        lastScrollYRef.current = scroll;
        if (rafId === null) rafId = requestAnimationFrame(commitScrollState);
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
  }, [isLoaded]);

  return (
    <main className="bg-white min-h-[300vh] relative">
      <Loader progress={progress} done={isLoaded} />

      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Navbar />
      </div>

      <HeroVideo
        scale={ui.scale}
        introPlaying={intro.playing}
        introDone={intro.done}
        clipScale={clipScale}
        setClipScale={setClipScale}
        onVideoReady={() => setVideoReady(true)}
      />

      <Tagline
        phase={taglinePhase}
        scrollY={ui.scrollY}
        videoHeight={vhRef.current}
        clipScale={clipScale}
      />

      {/* Intro Sarajevo tagline */}
      <div className="relative z-0 bg-white" style={{ height: "300vh" }}>
        <div
          className="sticky top-0 w-screen h-screen flex items-center justify-center"
          style={{
            opacity: intro.done ? 1 : 0,
            transition: "opacity 0.45s ease",
            zIndex: 5,
          }}
        >
          <SarajevoTagline
            text={taglineText}
            scrollY={ui.scrollY}
            refObj={taglineRef}
            triggerOffset={vhRef.current}
          />
        </div>
      </div>

      <ProjectSection />

      <AboutSection
  aboutTexts={aboutTexts}
  aboutRefs={aboutRefs}
  aboutOffsets={aboutOffsets}
  ui={ui}
/>

<div className="relative h-screen">
  {/* content here — container is 100vh and positioned relative */}
</div>

<ContactFooter />

    </main>
  );
}
