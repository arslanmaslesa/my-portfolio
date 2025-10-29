'use client';
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const OFFSCREEN = { x: -9999, y: -9999 };

// Basic Safari detection (desktop & iOS)
const detectSafari = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // exclude Chrome on iOS (CriOS), Firefox iOS (FxiOS), etc.
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|FxiOS|OPR|Edg/.test(ua);
  const vendorIsApple = navigator.vendor && navigator.vendor.indexOf('Apple') > -1;
  return isSafari || !!vendorIsApple;
};

const ProjectCard = ({
  project = null,
  image,
  title,
  video,
  subtitles,
  showSoundButton = true,
  skills = [],
  onOpen = null,
  locked = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const [muted, setMuted] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Labeled cursor state refs
  const targetRef = useRef(OFFSCREEN); // immediate pointer target (clientX/Y)
  const lagRef = useRef(OFFSCREEN); // lagged position for smooth following
  const [tick, setTick] = useState(0); // forces re-render
  const [labelVisible, setLabelVisible] = useState(false);

  // tuning
  const INIT_OFFSET = 18;
  const LAG_SPEED = 0.18; // 0..1 (larger = snappier)
  const FADE_MS = 160;

  const projectData = project || { id: title, title, image, video, subtitles, skills };
  const isLocked = (project && project.locked) ?? locked ?? false;

  // overlay guard — CaseStudyProvider adds body.class 'case-study-open' and window.__CASE_STUDY_OPEN
  const isOverlayOpen = () => {
    if (typeof window === 'undefined') return false;
    if (typeof document !== 'undefined' && document.body && document.body.classList.contains('case-study-open')) return true;
    return !!window.__CASE_STUDY_OPEN;
  };

  useEffect(() => {
    setIsTouchDevice(
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
    setIsSafari(detectSafari());
  }, []);

  // video play/pause on hover (unchanged)
  useEffect(() => {
    if (!videoRef.current || isTouchDevice) return;
    if (hovered) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [hovered, isTouchDevice]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (videoRef.current && videoRef.current.textTracks.length > 0) {
      const track = videoRef.current.textTracks[0];
      track.mode = captionsOn ? "showing" : "hidden";
    }
  }, [captionsOn]);

  const handleClick = () => {
    if (isLocked) return;
    if (onOpen) onOpen(projectData);
  };

  const handleKeyDown = (e) => {
    if (isLocked) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  // clear label and reset refs
  const clearLabel = () => {
    setLabelVisible(false);
    targetRef.current = OFFSCREEN;
    lagRef.current = OFFSCREEN;
    setTick(t => t + 1);
  };

  // MutationObserver to clear when overlay opens (keeps parity with your provider)
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const mo = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === 'class') {
          const open = body.classList.contains('case-study-open');
          if (open) clearLabel();
        }
      }
    });
    mo.observe(body, { attributes: true, attributeFilter: ['class'] });
    if (isOverlayOpen()) clearLabel();
    return () => mo.disconnect();
  }, []);

  // RAF loop that lags lagRef toward targetRef, re-rendering while moving or visible
  useEffect(() => {
    let raf = 0;
    const step = () => {
      // stop/clear if overlay opened
      if (isOverlayOpen()) {
        if (labelVisible) clearLabel();
        raf = requestAnimationFrame(step);
        return;
      }

      const t = targetRef.current;
      const l = lagRef.current;

      // if lag is initialized (not OFFSCREEN), move it toward target
      if (!(l.x === OFFSCREEN.x && l.y === OFFSCREEN.y)) {
        l.x += (t.x - l.x) * LAG_SPEED;
        l.y += (t.y - l.y) * LAG_SPEED;
      }

      // re-render while label visible or while movement ongoing
      if (
        labelVisible ||
        Math.abs(t.x - l.x) > 0.5 ||
        Math.abs(t.y - l.y) > 0.5
      ) {
        setTick((t) => t + 1);
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [labelVisible]);

  // Pointer handlers attached to container element itself — this ensures updates only while pointer is inside
  const onPointerEnter = (e) => {
    if (isTouchDevice) return;
    setHovered(true);

    if (isOverlayOpen()) return; // don't show if overlay open
    if (!isLocked) return;

    const x = e.clientX;
    const y = e.clientY;

    // immediate target + initialize lag pos (so it doesn't jump)
    targetRef.current = { x, y };
    if (lagRef.current.x < -9000 && lagRef.current.y < -9000) {
      lagRef.current = { x: x - INIT_OFFSET, y: y - INIT_OFFSET };
    }
    setLabelVisible(true);
    setTick(t => t + 1);
  };

  const onPointerMove = (e) => {
    if (isTouchDevice) return;
    if (isOverlayOpen()) {
      if (labelVisible) clearLabel();
      return;
    }
    if (!isLocked) return;

    targetRef.current = { x: e.clientX, y: e.clientY };
    setTick(t => t + 1); // ensure immediate update
  };

  const onPointerLeave = () => {
    setHovered(false);
    setLabelVisible(false);
    targetRef.current = OFFSCREEN;
    lagRef.current = OFFSCREEN;
    setTick(t => t + 1);
  };

  // derived position to render (use lag if initialized; fallback to target so it never sticks)
  const renderPos = (lagRef.current.x < -9000) ? targetRef.current : lagRef.current;

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`relative w-full h-full rounded-[8px] overflow-hidden bg-neutral-100 group ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label={isLocked ? `${projectData.title} (locked)` : `Open case study for ${projectData.title}`}
      aria-disabled={isLocked}
    >
      {/* Image */}
      <Image
        src={image || projectData.image}
        alt={title || projectData.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className={`absolute inset-0 object-cover transform transition-all duration-700 ease-in-out opacity-100 group-hover:scale-105 ${
          (video || projectData.video) && !isTouchDevice ? 'group-hover:opacity-0' : ''
        }`}
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Video (disabled on touch devices)
          - On Safari, render an <img> using the video URL instead of <video>
          - On other browsers, render the <video> as before
      */}
      {(video || projectData.video) && !isTouchDevice && (
        <div
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${hovered ? 'opacity-100' : 'opacity-0'}`}
          style={{ willChange: 'opacity' }}
          aria-hidden={!hovered}
        >
          {isSafari ? (
            // Safari: render an <img> for the hover preview (uses the video URL as src)
            <img
              src={video || projectData.video}
              alt={title || projectData.title}
              className="w-full h-full object-cover"
              style={{ display: 'block' }}
            />
          ) : (
            // Non-Safari: render actual <video>
            <video
              ref={videoRef}
              src={video || projectData.video}
              loop
              playsInline
              muted={muted}
              preload="metadata"
              className="w-full h-full object-cover"
            >
              {(subtitles || projectData.subtitles) && (
                <track src={subtitles || projectData.subtitles} kind="subtitles" srcLang="en" label="English" />
              )}
            </video>
          )}

          <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 200px rgba(0,0,0,0.1)", borderRadius: "12px" }} />

          {/* Controls (sound / captions) */}
          <div className="absolute top-3 right-3 z-30 flex flex-col gap-3">
            {showSoundButton && (
              <button
                onClick={(e) => { e.stopPropagation(); setMuted(!muted); }}
                className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/60 transition-colors duration-300"
                aria-label={muted ? "Unmute video" : "Mute video"}
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
            )}

            {(subtitles || projectData.subtitles) && (
              <button
                onClick={(e) => { e.stopPropagation(); setCaptionsOn(!captionsOn); }}
                className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center hover:bg-black/80 transition-colors duration-300"
                aria-pressed={captionsOn}
                aria-label={captionsOn ? "Hide captions" : "Show captions"}
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
            )}
          </div>
        </div>
      )}

      {/* Title + skills wrapper */}
      <div className="absolute left-3 2xl:left-6 bottom-3 2xl:bottom-6 z-20">
        <div className="relative">
          {skills && skills.length > 0 && (
            <div className="relative left-0 z-0 pointer-events-none bottom-2" aria-hidden={!hovered}>
              <div className="flex flex-col items-start">
                {skills.map((s, i) => {
                  const delay = (skills.length - 1 - i) * 60;
                  return (
                    <span
                      key={i}
                      className={`mt-2 inline-block bg-black text-white text-[12px] font-medium px-4 py-2 rounded-[8px] transform opacity-0 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ${poppins.className}`}
                      style={{ transitionDelay: `${delay}ms`, willChange: 'transform, opacity' }}
                    >
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <div className={`pl-4 2xl:pl-12 pr-2 2xl:pr-4 py-2 2xl:py-4 gap-4 inline-flex items-center w-fit h-fit rounded-[8px] bg-white z-10 ${poppins.className}`}>
            <p className="text-black text-[16px] 2xl:text-[24px] font-medium leading-none whitespace-nowrap">
              {title || projectData.title}
            </p>

            <div className={`h-9 w-9 2xl:h-16 2xl:w-16 rounded-full flex items-center justify-center ${isLocked ? 'bg-gray-100 opacity-90' : 'bg-gray-100 transition-colors duration-500 group-hover:bg-black'}`}>
              {isLocked ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24" className="h-4 w-4 text-gray-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 10V7a4 4 0 0 0-8 0v3M5 10h14v10H5V10z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="h-4 w-4 text-black transition-colors duration-300 group-hover:text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Coming soon label */}
      {isLocked && !isTouchDevice && labelVisible && !isOverlayOpen() && (
        <div
          className={`${poppins.className} pointer-events-none fixed z-[19] select-none`}
          style={{
            left: `${renderPos.x}px`,
            top: `${renderPos.y}px`,
            transform: 'translate(-50%, -50%)',
            transition: `opacity ${FADE_MS}ms ease, transform 60ms linear`,
            opacity: labelVisible ? 1 : 0,
            color: '#fff',
            fontSize: 16,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            textShadow: '0 1px 6px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }}
        >
          Coming soon
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
