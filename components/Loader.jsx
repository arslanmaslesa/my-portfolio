'use client';
import { useEffect } from "react";

const Loader = ({ progress, done }) => {
  const radius = 12;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-white transition-opacity duration-500 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <svg
        className="animate-spin"
        style={{ animationDuration: '3s' }}
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
      >
        <circle cx="20" cy="20" r={radius} stroke="#ddd" strokeWidth="3" fill="none" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="black"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.3s ease' }}
        />
      </svg>
    </div>
  );
};

export default Loader;
