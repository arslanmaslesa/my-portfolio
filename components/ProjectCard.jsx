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
  const [captionsOn, setCaptionsOn] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const videoRef = useRef(null);

  // Detect if device is touch-enabled
  useEffect(() => {
    setIsTouchDevice(
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  // Play / pause on hover (disabled for touch devices)
  useEffect(() => {
    if (!videoRef.current || isTouchDevice) return;

    if (hovered) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [hovered, isTouchDevice]);

  // Sync muted state with video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Sync captions state with video track
  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      const track = videoRef.current.textTracks[0];
      track.mode = captionsOn ? "showing" : "hidden";
    }
  }, [captionsOn]);

  return (
    <div
      className="relative w-full h-full rounded-[12px] overflow-hidden bg-neutral-100 group"
      onMouseEnter={() => !isTouchDevice && setHovered(true)}
      onMouseLeave={() => !isTouchDevice && setHovered(false)}
    >
      {/* Thumbnail Image */}
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className={`object-cover transform transition-transform duration-500 ease-in-out group-hover:scale-105
          absolute inset-0 transition-opacity duration-700 ${hovered && video && !isTouchDevice ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Video (disabled on touch devices) */}
      {video && !isTouchDevice && (
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

          {/* Controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-3">
            {/* Mute / Unmute */}
            <button
              onClick={() => setMuted(!muted)}
              className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors duration-300"
            >
              {muted ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" className="text-white">
                  <path fill="currentColor" fillRule="evenodd" d="M8 2.81v10.38c0 .67-.81 1-1.28.53L3 10H1c-.55 0-1-.45-1-1V7c0-.55.45-1 1-1h2l3.72-3.72C7.19 1.81 8 2.14 8 2.81zm7.53 3.22l-1.06-1.06-1.97 1.97-1.97-1.97-1.06 1.06L11.44 8 9.47 9.97l1.06 1.06 1.97-1.97 1.97 1.97 1.06-1.06L13.56 8l1.97-1.97z"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" className="text-white">
                  <path fill="currentColor" fillRule="evenodd" d="M12 8.02c0 1.09-.45 2.09-1.17 2.83l-.67-.67c.55-.56.89-1.31.89-2.16 0-.85-.34-1.61-.89-2.16l.67-.67A3.99 3.99 0 0 1 12 8.02zM7.72 2.28L4 6H2c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2l3.72 3.72c.47.47 1.28.14 1.28-.53V2.81c0-.67-.81-1-1.28-.53zm5.94.08l-.67.67a6.996 6.996 0 0 1 2.06 4.98c0 1.94-.78 3.7-2.06 4.98l.67.67A7.973 7.973 0 0 0 16 8c0-2.22-.89-4.22-2.34-5.66v.02zm-1.41 1.41l-.69.67a5.05 5.05 0 0 1 1.48 3.58c0 1.39-.56 2.66-1.48 3.56l.69.67A5.97 5.97 0 0 0 14 8.02c0-1.65-.67-3.16-1.75-4.25z"/>
                </svg>
              )}
            </button>

            {/* Captions */}
            <button
              onClick={() => setCaptionsOn(!captionsOn)}
              className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors duration-300"
            >
              {captionsOn ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-white" fill="currentColor">
                  <rect width="256" height="256" fill="none"></rect>
                  <path d="M216,40H40A16.01833,16.01833,0,0,0,24,56V200a16.01833,16.01833,0,0,0,16,16H216a16.01833,16.01833,0,0,0,16-16V56A16.01833,16.01833,0,0,0,216,40ZM96,148a19.85259,19.85259,0,0,0,14.28613-6.00293,7.99956,7.99956,0,0,1,11.42774,11.19727,36,36,0,1,1,0-50.38868,7.99956,7.99956,0,0,1-11.42774,11.19727A20.00012,20.00012,0,1,0,96,148Zm72,0a19.85259,19.85259,0,0,0,14.28613-6.00293,7.99956,7.99956,0,0,1,11.42774,11.19727,36,36,0,1,1,0-50.38868,7.99956,7.99956,0,0,1-11.42774,11.19727A20.00012,20.00012,0,1,0,168,148Z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="16">
                  <rect width="192" height="160" x="32" y="48" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" rx="8"></rect>
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" d="M116 147.59582a28 28 0 1 1 .00011-39.19153M188 147.59582a28 28 0 1 1 .00011-39.19153"></path>
                </svg>
              )}
            </button>
          </div>
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="h-4 w-4 text-black transition-colors duration-300 group-hover:text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
