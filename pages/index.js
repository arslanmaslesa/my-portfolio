import Image from "next/image";
import { Poppins } from 'next/font/google';
import { useEffect, useState } from "react";
import Navbar from '../components/Navbar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Home() {
  const [scale, setScale] = useState(1);
  const [maxScale, setMaxScale] = useState(0.25);

  useEffect(() => {
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
      window.removeEventListener("resize", updateMaxScale);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const textOpacity = scale < 0.75 ? 0 : 1;

  return (
    <main className="bg-white min-h-[300vh] relative">
      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full z-[9999]">
        <Navbar />
      </div>

      {/* Sticky GIF inside scrollable container */}
      <div className="h-[192vh] px-3 relative z-30">
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

      {/* Top Text */}
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
      <div className="mt-[-68vh] pl-3 pr-10 pb-20 z-10 absolute">
        <p
          className={`text-left text-[48px] font-medium text-gray-700 ${poppins.className} tracking-[-0.04em] leading-[58px]`}
        >
          Sarajevo-based product designer, turning complex ideas into simple experiences.
        </p>
        <div className="h-[1200px]" />
      </div>
    </main>
  );
}
