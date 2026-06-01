'use client';

import { useEffect, useRef } from 'react';

export function BackgroundSystem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const xPct = (clientX / window.innerWidth - 0.5) * 2;
      const yPct = (clientY / window.innerHeight - 0.5) * 2;

      const layer1 = container.querySelector('[data-parallax="1"]') as HTMLElement;
      const layer2 = container.querySelector('[data-parallax="2"]') as HTMLElement;

      if (layer1) {
        layer1.style.transform = `translate(${xPct * 8}px, ${yPct * 5}px)`;
      }
      if (layer2) {
        layer2.style.transform = `translate(${xPct * 14}px, ${yPct * 9}px)`;
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden bg-[var(--bg-void)]">
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-void)] to-[var(--bg-primary)]" />

      {/* Parallax layer 1 - slow */}
      <div
        data-parallax="1"
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.15) 0%, transparent 50%)',
          filter: 'blur(120px)',
          willChange: 'transform',
        }}
      />

      {/* Parallax layer 2 - medium */}
      <div
        data-parallax="2"
        className="absolute inset-0 opacity-6"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255, 30, 30, 0.1) 0%, transparent 40%)',
          filter: 'blur(140px)',
          willChange: 'transform',
        }}
      />

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Noise texture */}
      <div className="noise-texture" />

      {/* Vignette overlay */}
      <div className="vignette-overlay" />
    </div>
  );
}
