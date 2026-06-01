'use client';

import { useEffect, useRef } from 'react';

interface BackgroundSystemProps {
  teamColor?: string;
  children?: React.ReactNode;
}

export function BackgroundSystem({ teamColor, children }: BackgroundSystemProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

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

  // Update CSS custom property for team ambient color
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--team-ambient',
      teamColor || 'transparent'
    );
  }, [teamColor]);

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-void)' }}>
      {/* Locked Background Sandbox Container */}
      <div 
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          width: '100vw',
          height: '100vh',
          position: 'fixed',
          backgroundImage: `linear-gradient(rgba(10, 10, 12, 0.92), rgba(10, 10, 12, 0.92)), url('/marc-kleen-fJjtt4kHews-unsplash.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        
        {/* Team ambient orb */}
        <div className="background-orb pointer-events-none" />

        {/* Parallax layer 1 - slow */}
        <div
          data-parallax="1"
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.08,
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0, 229, 255, 0.15) 0%, transparent 50%)',
            filter: 'blur(120px)',
            willChange: 'transform',
          }}
        />

        {/* Parallax layer 2 - medium */}
        <div
          data-parallax="2"
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.06,
            backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255, 30, 30, 0.1) 0%, transparent 40%)',
            filter: 'blur(140px)',
            willChange: 'transform',
          }}
        />

        {/* Grid overlay */}
        <div className="grid-overlay absolute inset-0 z-10 pointer-events-none" />

        {/* Noise texture */}
        <div className="noise-texture pointer-events-none" />

        {/* Vignette overlay */}
        <div className="vignette-overlay pointer-events-none" />
      </div>

      {/* Elevated Content Tier */}
      <div className="relative w-full min-h-screen z-10 pointer-events-auto">
        {children}
      </div>
    </div>
  );
}
