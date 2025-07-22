// pages/index.tsx or index.jsx
import Image from "next/image";
import { Poppins } from 'next/font/google';
import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';
import Lenis from '@studio-freight/lenis';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Home() {
  const [scale, setScale] = useState(1);
  const [maxScale, setMaxScale] = useState(0.25);

  useEffect(() => {
    const lenis = new Lenis({
    duration: 1.15, // Adjust for scroll speed (higher = slower)
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

  const textOpacity = scale < 0.75 ? 0 : 1;

  return (
    <main className="bg-white min-h-[300vh] relative">
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
      <div className="relative mt-[-125vh] z-10">
        <div
          className="sticky top-0 pl-3 pb-20 bg-white pt-[calc(100vh-260px)]"
          style={{ paddingRight: "calc(25vw + 0.75rem)" }}
        >
          <p
            className={`text-left text-[48px] font-medium text-gray-700 ${poppins.className} tracking-[-0.04em] leading-[58px]`}
          >
            Sarajevo-based product designer, turning complex ideas into simple experiences.
          </p>
        </div>

        {/* Scroll space */}
        <div className="h-[1200px]" />
      </div>
    </main>
  );
}
