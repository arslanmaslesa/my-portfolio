'use client';
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const ProjectCard = ({ image, title, video, subtitles }) => {
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef(null);

  // Play / pause on hover
  useEffect(() => {
    if (videoRef.current) {
      if (hovered) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        // removed resetting currentTime → will continue from paused position
      }
    }
  }, [hovered]);

  // Sync muted state with video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  return (
    <div
      className="relative w-full h-full rounded-[12px] overflow-hidden bg-neutral-100 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className={`object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105
          absolute inset-0 transition-opacity duration-700 ${hovered && video ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Video */}
      {video && (
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
            hovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <video
            ref={videoRef}
            src={video}
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            {subtitles && (
              <track
                src={subtitles}
                kind="subtitles"
                srcLang="en"
                label="English"
                default
              />
            )}
          </video>

          {/* Inner shadow overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: "inset 0 0 200px rgba(0,0,0,0.1)",
              borderRadius: "12px",
            }}
          />

          {/* Mute / Unmute Button */}
          <button
            onClick={() => setMuted(!muted)}
            className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black transition-colors duration-300"
          >
            {muted ? (
              // Muted icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5L6 9H2v6h4l5 4V5zm6 0v14l5-5h2v-4h-2l-5-5z"
                />
              </svg>
            ) : (
              // Unmuted icon
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5L6 9H2v6h4l5 4V5zm5 7a4.5 4.5 0 01-4.5 4.5m4.5-4.5a4.5 4.5 0 00-4.5-4.5"
                />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Overlay info */}
      <div
        className={`absolute bottom-3 2xl:bottom-6 left-3 2xl:left-6 pl-6 2xl:pl-12 pr-2 2xl:pr-4 py-2 2xl:py-4 gap-3 2xl:gap-6 inline-flex items-center w-fit h-fit rounded-[8px] bg-white ${poppins.className}`}
      >
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
};

export default ProjectCard;
