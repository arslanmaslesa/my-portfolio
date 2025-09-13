'use client';
import React, { useEffect, useState, useRef } from "react";

export default function SkillRotator({
  skills = ["Skill One", "Skill Two", "Skill Three"],
  switchInterval = 3000,
}) {
  const skillImages = [
    "https://picsum.photos/200/140?random=1",
    "https://picsum.photos/200/140?random=2",
    "https://picsum.photos/200/140?random=3",
  ];

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("in");
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef(null);
  const lastPointerRef = useRef({ x: -9999, y: -9999 });
  const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });
  const lagPos = useRef({ x: -9999, y: -9999 });

  const fadeDuration = switchInterval * 0.25;
  const visibleDuration = switchInterval * 0.5;
  const LAG_SPEED = 0.08;

  // Load font
  useEffect(() => {
    const id = "poppins-font-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Skill switch timer
  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), visibleDuration);
    const t2 = setTimeout(() => {
      setIndex((i) => (i + 1) % skills.length);
      setPhase("in");
    }, visibleDuration + fadeDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [index, skills.length, visibleDuration, fadeDuration]);

  // Pointer tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      lastPointerRef.current = { x, y };

      const rect = container.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        setHovering(true);
        setCursorPos({ x, y });
      }
    };

    const onMouseEnter = () => {
      const { x, y } = lastPointerRef.current;
      setHovering(true);
      setCursorPos({ x, y });
    };

    const onMouseLeave = () => {
      setHovering(false);
      setCursorPos({ x: -9999, y: -9999 });
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const { x, y } = lastPointerRef.current;
      const inside = x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      setHovering(inside);
      if (inside) setCursorPos({ x, y });
      else setCursorPos({ x: -9999, y: -9999 });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Shoot positions even if mouse stops
  useEffect(() => {
    const interval = setInterval(() => {
      if (hovering) {
        const { x, y } = lastPointerRef.current;
        setCursorPos({ x, y });
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [hovering]);

  // Smooth lag animation
  useEffect(() => {
    let animationFrame;
    const animate = () => {
      lagPos.current.x += (cursorPos.x - lagPos.current.x) * LAG_SPEED;
      lagPos.current.y += (cursorPos.y - lagPos.current.y) * LAG_SPEED;
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [cursorPos]);

  return (
    <section
      ref={containerRef}
      className="w-screen h-screen flex items-center justify-center relative p-3 overflow-hidden"
    >
      {/* Skill text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`skill-text text-center select-none pointer-events-none ${
            phase === "in" ? "anim-in" : "anim-out"
          }`}
          aria-live="polite"
        >
          {skills[index]}
        </div>
      </div>

      {/* Bottom indicators */}
      <div className="absolute left-0 right-0 bottom-3 translate-y-1/2 flex justify-center gap-3">
        {skills.map((_, i) => {
          const isActive = phase === "in" && i === index;
          return (
            <div
              key={i}
              className="h-1 w-12 rounded-full transition-all ease-out"
              style={{
                backgroundColor: isActive ? "#000" : "#d1d5db",
                transform: isActive ? "scale(1.05)" : "scale(1)",
                transition: `background-color ${fadeDuration}ms ease, transform ${fadeDuration}ms ease`,
              }}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Hovering image */}
      {hovering && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: lagPos.current.x,
            top: lagPos.current.y,
            width: 200,
            height: 140,
            transform: "translate(-50%, -50%)",
            borderRadius: 12,
            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
            overflow: "hidden",
            transition: "box-shadow 0.2s ease",
          }}
        >
          <img
            src={skillImages[index]}
            alt={skills[index]}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Styles */}
      <style>{`
        .skill-text {
          font-family: 'Poppins', system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          font-weight: 400;
          font-size: 72px;
          line-height: 1;
          letter-spacing: -0.04em;
          transition: opacity ${fadeDuration}ms ease, transform ${fadeDuration}ms ease;
          color: #000;
        }

        .anim-in { opacity: 1; transform: translateY(0); }
        .anim-out { opacity: 0; transform: translateY(-16px); }

        @media (max-width: 520px) {
          .skill-text { font-size: 40px; }
        }
      `}</style>
    </section>
  );
}
