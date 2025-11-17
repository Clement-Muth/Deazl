"use client";

import React, { useEffect, useState } from "react";

export const GridBackground = React.memo(() => {
  const [offset, setOffset] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let rafId: number;
    let lastScrollY = window.scrollY;
    let currentOffset = 0;

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const scrollDelta = window.scrollY - lastScrollY;
        currentOffset = currentOffset + scrollDelta * 0.15; // Reduced speed for smoother parallax
        setOffset(currentOffset);
        lastScrollY = window.scrollY;
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 60;
        const y = (e.clientY / window.innerHeight - 0.5) * 60;
        setMousePosition({ x, y });
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute top-0 inset-0 h-full overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* Primary grid - moves on scroll */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, .7) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, .7) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
          transform: `translate3d(${mousePosition.x}px, ${offset + mousePosition.y}px, 0) scale(1.1)`,
          transition: "transform 0.8s cubic-bezier(0.2, 1, 0.3, 1)",
          opacity: 0.2,
          backgroundBlendMode: "multiply",
          willChange: "transform"
        }}
      />

      {/* Secondary grid - static */}
      <div
        className="absolute inset-0 -z-10 transition-opacity duration-300"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: "12px 12px",
          opacity: 0.15,
          backgroundBlendMode: "multiply"
        }}
      />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 z-[-5] bg-gradient-to-b from-transparent via-white to-white dark:via-gray-900 dark:to-gray-900 opacity-75 transition-opacity duration-500" />
    </div>
  );
});
