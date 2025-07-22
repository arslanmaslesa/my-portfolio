import Image from "next/image";
import { Poppins } from 'next/font/google';
import { useEffect, useState, useRef } from "react";
import Navbar from '../components/Navbar';
import Lenis from '@studio-freight/lenis';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Home() {
  const [scale, setScale] = useState(1);
  const [maxScale, setMaxScale] = useState(0.25);
  const [scrollY, setScrollY] = useState(0);

  const tagline = "Sarajevo-based product designer, turning complex ideas into simple experiences.";

  const taglineRef = useRef(null);
  const mainRef = useRef(null);
  const [paddingTop, setPaddingTop] = useState(0);

  const bottomPadding = 60; // 60px bottom padding

  // Setup Lenis smooth scroll and scale logic
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const updateMaxScale = () => {
      const maxWidth = window.innerWidth / 4;
      const initialWidth = window.innerWidth - 24;
      const calculatedMaxScale = maxWidth / initialWidth;
      setMaxScale(calculatedMaxScale);
    };

    const handleScroll = () => {
      const newScrollY = window.scrollY;
      const maxWidth = window.innerWidth / 4;
      const initialWidth = window.innerWidth - 24;
      const max = maxWidth / initialWidth;
      const newScale = Math.max(1 - newScrollY / 800, max);
      setScale(newScale);
      setScrollY(newScrollY);
    };

    updateMaxScale();
    window.addEventListener("resize", updateMaxScale);
    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      lenis.destroy();
      window.removeEventListener("resize", updateMaxScale);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Dynamically calculate top padding so sticky container height = viewport height
  const updatePaddingTop = () => {
    if (!taglineRef.current) return;

    const viewportHeight = window.innerHeight;
    const textHeight = taglineRef.current.offsetHeight;

    let newPaddingTop = viewportHeight - textHeight - bottomPadding;

    if (newPaddingTop < 0) newPaddingTop = 0;

    setPaddingTop(newPaddingTop);
  };

  // Update padding top on mount and resize
  useEffect(() => {
    updatePaddingTop();
    window.addEventListener("resize", updatePaddingTop);
    return () => {
      window.removeEventListener("resize", updatePaddingTop);
    };
  }, [taglineRef.current]);

  // Set CSS variable --tagline-height for extra scroll space calculation
  useEffect(() => {
    function updateTaglineHeightCSSVar() {
      if (!taglineRef.current || !mainRef.current) return;

      const textHeight = taglineRef.current.offsetHeight;
      mainRef.current.style.setProperty('--tagline-height', `${textHeight}px`);
    }

    updateTaglineHeightCSSVar();
    window.addEventListener("resize", updateTaglineHeightCSSVar);

    return () => window.removeEventListener("resize", updateTaglineHeightCSSVar);
  }, []);

  const textOpacity = scale < 0.75 ? 0 : 1;

  // Fade to black effect per letter based on scrollY
  const getLetterColor = (index) => {
    const fadeStart = 350;  // scrollY where fade starts
    const fadeDistance = 60; // pixels over which fade happens
    const relativeScroll = scrollY - fadeStart - index * 5;

    if (relativeScroll <= 0) return 'rgba(0,0,0,0.1)';   // initial faded black
    if (relativeScroll >= fadeDistance) return 'rgba(0,0,0,1)';  // full black

    const opacity = 0.1 + (0.9 * (relativeScroll / fadeDistance));
    return `rgba(0,0,0,${opacity.toFixed(2)})`;
  };

  const fadeStart = 350;
  const fadeDistance = 60;
  const lettersCount = tagline.length;
  const fadeEndScroll = fadeStart + fadeDistance + lettersCount * 5;

  // Now containerHeight is dynamic using CSS var --tagline-height + 50vh
  // fallback to 800vh for initial scroll
  const containerHeight = scrollY >= fadeEndScroll
    ? `calc(${fadeEndScroll}px + 30vh + var(--tagline-height))`
    : '800vh';

  return (
    <main
      ref={mainRef}
      className="bg-white min-h-[300vh] relative"
      style={{
        // You can add a default value for --tagline-height to avoid issues before JS sets it:
        '--tagline-height': '0px',
      }}
    >
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Navbar />
      </div>

      {/* Sticky GIF */}
      <div className="h-[182vh] px-3 relative z-30">
        <div className="sticky top-3">
          <div
            className="rounded-[12px] overflow-hidden"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top right",
              transition: "transform 0.1s ease-out",
            }}
          >
            <div className="relative w-full h-[calc(100vh-24px)]">
              <Image
                src="/hero1.gif"
                alt="Hero background animation"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Text */}
      <div
        className={`fixed top-0 left-0 w-full h-full z-40 flex justify-between items-center pointer-events-none ${poppins.className}`}
        style={{
          padding: "26px",
          opacity: textOpacity,
          transition: "opacity 0.3s ease-out",
        }}
      >
        <p className="text-white text-[17px] font-medium tracking-[-0.01em] w-1/2 text-left">
          ARSLAN MASLESA
        </p>
        <p className="text-white text-[17px] font-medium tracking-[-0.01em] w-1/2 text-left">
          PRODUCT DESIGNER
        </p>
      </div>

      {/* Tagline Section */}
      <div
        className="relative mt-[-125vh] z-10"
        style={{
          height: containerHeight,
          transition: 'height 0.1s ease',
        }}
      >
        <div
          className="sticky top-0 pb-20 bg-white px-3"
          style={{
            paddingTop: paddingTop,
            paddingRight: "calc(25vw + 0.75rem)",
          }}
        >
          <div
            ref={taglineRef}
            className={`text-left text-[48px] font-medium leading-[58px] tracking-[-0.04em] ${poppins.className}`}
            style={{ whiteSpace: 'normal' }}
          >
            {tagline.split(' ').map((word, wordIndex) => (
              <span
                key={wordIndex}
                style={{
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                  marginRight: '0.25ch',
                }}
              >
                {word.split('').map((letter, letterIndex) => {
                  const globalIndex =
                    tagline
                      .split(' ')
                      .slice(0, wordIndex)
                      .join(' ').length +
                    wordIndex + // spaces count
                    letterIndex;

                  return (
                    <span
                      key={letterIndex}
                      style={{
                        color: getLetterColor(globalIndex),
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

        {/* Scroll space */}
        <div className="h-[1200px]" />
      </div>
    </main>
  );
}
