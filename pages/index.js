'use client';

import { useEffect, useState, useRef } from "react";
import Navbar from '../components/Navbar';
import Lenis from '@studio-freight/lenis';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

function ProjectCard({ image, title }) {
  return (
    <div className="w-full h-full rounded-[12px] overflow-hidden bg-neutral-100">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
  );
}

function ProjectSection() {
  const itemHeight = "[height:calc(100vw-108px)] md:[height:calc((100vw-64px)/2-44px)]";

  return (
    <section className="px-[12px] pb-12">
      <div className="grid gap-[12px] grid-cols-1 md:grid-cols-2">
        {[1, 2, 3, 4, 5].map((id) => (
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
}

function Tagline({ text, scale, scrollY }) {
  const textOpacity = scale < 0.75 ? 0 : 1;

  const getLetterColor = (index) => {
    const fadeStart = 440;
    const fadeDistance = 60;
    const relScroll = scrollY - fadeStart - index * 5;

    if (relScroll <= 0) return 'rgba(0,0,0,0.1)';
    if (relScroll >= fadeDistance) return 'rgba(0,0,0,1)';

    const opacity = 0.1 + (0.9 * relScroll / fadeDistance);
    return `rgba(0,0,0,${opacity.toFixed(2)})`;
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full h-full z-40 flex justify-between items-center pointer-events-none ${poppins.className}`}
      style={{ padding: "26px", opacity: textOpacity, transition: "opacity 0.3s ease-out" }}
    >
      <p className="text-white text-[17px] font-medium tracking-[-0.01em] w-1/2 text-left">
        ARSLAN MASLESA
      </p>
      <p className="text-white text-[17px] font-medium tracking-[-0.01em] w-1/2 text-left">
        PRODUCT DESIGNER
      </p>
    </div>
  );
}

function HeroVideo({ scale }) {
  return (
    <div className="h-[190vh] px-3 relative z-30">
      <div className="sticky top-3">
        <div
          className="rounded-[12px] overflow-hidden"
          style={{ transform: `scale(${scale})`, transformOrigin: "top right" }}
        >
          <div className="relative w-full h-[calc(100vh-24px)] overflow-hidden rounded-[12px]">
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
}

export default function Home() {
  const tagline = "Sarajevo-based product designer, turning complex ideas into simple experiences.";

  const [scale, setScale] = useState(1);
  const [maxScale, setMaxScale] = useState(0.25);
  const [scrollY, setScrollY] = useState(0);
  const [paddingTop, setPaddingTop] = useState(0);

  const taglineRef = useRef(null);
  const mainRef = useRef(null);
  const bottomPadding = 60;

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    const raf = time => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    const updateMaxScale = () => {
      const maxWidth = window.innerWidth / 4;
      const initialWidth = window.innerWidth - 24;
      setMaxScale(maxWidth / initialWidth);
    };

    const handleScroll = () => {
      const newScrollY = window.scrollY;
      const max = window.innerWidth / 4 / (window.innerWidth - 24);
      const newScale = Math.max(1 - newScrollY / 800, max);

      setScale(newScale);
      setScrollY(newScrollY);
    };

    updateMaxScale();
    handleScroll();

    window.addEventListener("resize", updateMaxScale);
    window.addEventListener("scroll", handleScroll);

    return () => {
      lenis.destroy();
      window.removeEventListener("resize", updateMaxScale);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const updatePadding = () => {
      if (!taglineRef.current) return;
      const viewportHeight = window.innerHeight;
      const textHeight = taglineRef.current.offsetHeight;
      setPaddingTop(Math.max(0, viewportHeight - textHeight - bottomPadding));
    };

    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, [taglineRef.current]);

  useEffect(() => {
    const updateTaglineHeightCSSVar = () => {
      if (!taglineRef.current || !mainRef.current) return;
      const textHeight = taglineRef.current.offsetHeight;
      mainRef.current.style.setProperty('--tagline-height', `${textHeight}px`);
    };

    updateTaglineHeightCSSVar();
    window.addEventListener("resize", updateTaglineHeightCSSVar);
    return () => window.removeEventListener("resize", updateTaglineHeightCSSVar);
  }, []);

  const fadeStart = 350;
  const fadeDistance = 60;
  const fadeEndScroll = fadeStart + fadeDistance + tagline.length * 5;

  const containerHeight = scrollY >= fadeEndScroll
    ? `calc(${fadeEndScroll}px + 30vh + var(--tagline-height))`
    : '800vh';

  const getLetterColor = (index) => {
    const fadeStart = 440;
    const fadeDistance = 60;
    const relScroll = scrollY - fadeStart - index * 5;

    if (relScroll <= 0) return 'rgba(0,0,0,0.1)';
    if (relScroll >= fadeDistance) return 'rgba(0,0,0,1)';

    const opacity = 0.1 + (0.9 * relScroll / fadeDistance);
    return `rgba(0,0,0,${opacity.toFixed(2)})`;
  };

  return (
    <main
      ref={mainRef}
      className="bg-white min-h-[300vh] relative"
      style={{ '--tagline-height': '0px' }}
    >
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Navbar />
      </div>

      <HeroVideo scale={scale} />

      <Tagline text={tagline} scale={scale} scrollY={scrollY} />

      <div
        className="relative mt-[-125vh] z-10"
        style={{ height: containerHeight, transition: 'height 0.1s ease' }}
      >
        <div
          className="sticky top-0 pb-16 bg-white px-3"
          style={{
            paddingTop,
            paddingRight: "calc(25vw + 0.75rem)",
          }}
        >
          <div
            ref={taglineRef}
            className={`text-left text-[48px] font-medium leading-[58px] tracking-[-0.04em] ${poppins.className}`}
          >
            {tagline.split(' ').map((word, wordIdx) => (
              <span
                key={wordIdx}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  marginRight: '0.25ch',
                }}
              >
                {word.split('').map((letter, letterIdx) => {
                  const globalIdx =
                    tagline.split(' ').slice(0, wordIdx).join(' ').length +
                    wordIdx +
                    letterIdx;

                  return (
                    <span
                      key={letterIdx}
                      style={{
                        color: getLetterColor(globalIdx),
                        transition: 'color 0.1s linear',
                        display: 'inline-block',
                      }}
                    >
                      {letter}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>
        </div>

        <div className="h-[1200px]" />
      </div>

      <ProjectSection />
    </main>
  );
}
