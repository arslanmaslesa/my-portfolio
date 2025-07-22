import Image from "next/image";
import { Poppins } from 'next/font/google';
import { useEffect, useState } from "react";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const newScrollY = window.scrollY;
      setScrollY(newScrollY);

      const maxWidth = window.innerWidth / 4;
      const initialWidth = window.innerWidth - 24;
      const maxScale = maxWidth / initialWidth;
      const newScale = Math.max(1 - newScrollY / 800, maxScale);
      setScale(newScale);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // run on first render

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const textOpacity = scale < 0.75 ? 0 : 1;

  return (
    <main className="bg-white min-h-[200vh]">
      {/* Shrinking GIF */}
      <div
        className="fixed top-3 left-3 right-3 z-30 rounded-[12px] overflow-hidden"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top right",
          transition: "transform 0.3s ease-out",
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
      <div className="pt-[124vh] pl-3 pr-103 pb-20 z-10 relative">
        <p className={`text-left text-[48px] font-medium text-gray-700 ${poppins.className} tracking-[-0.04em] leading-[58px]`}>
          Sarajevo-based product designer, turning complex ideas into simple experiences.
        </p>
        <div className="h-[1200px]" />
      </div>
    </main>
  );
}
