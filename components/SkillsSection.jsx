'use client';
import React, { useEffect, useState, useRef } from "react";

export default function SkillRotator({
  skills = ["UI & UX", "Illustration", "Branding", "3D", "Graphic Design"],
  switchInterval = 3000,
}) {
  const skillImages = [
  "/ui.png",
  "/illustration.png",
  "/branding.png",
  "/3d.png",
  "/graphic.png",
];

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("in");
  const [hovering, setHovering] = useState(false);
  const containerRef = useRef(null);
  const lastPointerRef = useRef({ x: -9999, y: -9999 });
  const [cursorPos, setCursorPos] = useState({ x: -9999, y: -9999 });
  const lagPos = useRef({ x: -9999, y: -9999 });

  const [, setTick] = useState(0);

  const fadeDuration = switchInterval * 0.25;
  const visibleDuration = switchInterval * 0.5;
  const LAG_SPEED = 0.15;
  const INIT_OFFSET = 40;

  const cursorPosRef = useRef(cursorPos);
  const hoveringRef = useRef(hovering);

  useEffect(() => {
    const id = "poppins-font-link";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

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

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onPointerMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      lastPointerRef.current = { x, y };

      const rect = container.getBoundingClientRect();
      const inside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      setHovering(inside);
      setCursorPos({ x, y });
      cursorPosRef.current = { x, y };

      if (lagPos.current.x < -9000 && lagPos.current.y < -9000) {
        lagPos.current.x = x - INIT_OFFSET;
        lagPos.current.y = y - INIT_OFFSET;
        setTick((t) => t + 1);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const { x, y } = lastPointerRef.current;
      const inside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

      setHovering(inside);

      if (inside) {
        setCursorPos({ x, y });
        cursorPosRef.current = { x, y };

        if (lagPos.current.x < -9000 && lagPos.current.y < -9000) {
          lagPos.current.x = x - INIT_OFFSET;
          lagPos.current.y = y - INIT_OFFSET;
          setTick((t) => t + 1);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    cursorPosRef.current = cursorPos;
  }, [cursorPos]);

  useEffect(() => {
    hoveringRef.current = hovering;
  }, [hovering]);

  useEffect(() => {
    let animationFrame = 0;
    const animate = () => {
      const target = cursorPosRef.current;
      lagPos.current.x += (target.x - lagPos.current.x) * LAG_SPEED;
      lagPos.current.y += (target.y - lagPos.current.y) * LAG_SPEED;

      const dx = Math.abs(target.x - lagPos.current.x);
      const dy = Math.abs(target.y - lagPos.current.y);

      if (hoveringRef.current || dx > 0.5 || dy > 0.5) {
        setTick((t) => t + 1);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

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

      {/* Indicators */}
      <div className="absolute left-0 right-0 bottom-3 translate-y-1/2 flex justify-center gap-3">
        {skills.map((_, i) => {
          const isActive = phase === "in" && i === index;
          return (
            <div
              key={i}
              className="h-3 w-3 rounded-full transition-all ease-out"
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

      {/* Hovering image with fade */}
      {hovering && (
        <div
          className={`fixed pointer-events-none z-50 image-wrapper ${
            phase === "in" ? "img-in" : "img-out"
          }`}
          style={{
            left: lagPos.current.x,
            top: lagPos.current.y,
            width: 320,
            height: 240,
            transform: "translate(-50%, -50%)",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            overflow: "hidden",
            transition: `opacity ${fadeDuration}ms ease`,
          }}
        >
          <img
            key={index} // ensures fade runs on every swap
            src={skillImages[index]}
            alt={skills[index]}
            className="w-full h-full object-cover"
          />
        </div>
      )}

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

        .img-in { opacity: 1; }
        .img-out { opacity: 0; }

        @media (max-width: 520px) {
          .skill-text { font-size: 40px; }
        }
      `}</style>
    </section>
  );
}
