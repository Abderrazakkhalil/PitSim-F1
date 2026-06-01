'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { CIRCUITS } from '@/lib/teamThemes';
import { DotRating } from '@/components/common/DotRating';
import { getCarouselPosition, carouselPositionVariants, carouselTransition } from '@/lib/carouselHelpers';
import type { CircuitTheme } from '@/lib/teamThemes';

/* ────────────────────────────────────────────
   Circuit Type Config
   ──────────────────────────────────────────── */
const circuitTypeConfig: Record<
  CircuitTheme['circuitType'],
  { color: string; label: string }
> = {
  power: { color: '#FF1E1E', label: 'POWER CIRCUIT' },
  street: { color: '#00E5FF', label: 'STREET CIRCUIT' },
  technical: { color: '#FFD500', label: 'TECHNICAL CIRCUIT' },
  classic: { color: '#00FF85', label: 'CLASSIC CIRCUIT' },
};

/* ────────────────────────────────────────────
   Generic SVG track outlines (placeholder paths)
   Each is sized for a 200x200 viewBox.
   ──────────────────────────────────────────── */
const circuitPaths: Record<number, string> = {
  1: 'M40,100 Q40,30 100,30 Q160,30 160,70 L140,90 Q140,110 120,120 L100,130 Q80,140 80,160 Q80,180 60,180 Q40,180 40,140 Z',
  2: 'M30,170 L30,60 Q30,30 60,30 L170,30 Q190,30 190,60 L190,100 Q190,120 170,120 L100,120 Q80,120 80,140 L80,170 Q80,190 60,190 L50,190 Q30,190 30,170 Z',
  3: 'M50,150 Q30,120 50,80 Q60,60 90,50 Q120,40 150,50 Q170,60 175,90 Q180,120 160,140 Q140,160 110,165 Q80,170 50,150 Z',
  4: 'M80,170 L60,130 Q50,100 70,80 L90,60 Q100,50 120,50 L140,55 Q160,60 160,80 L155,110 Q150,130 130,150 L110,170 Q100,180 80,170 Z',
  5: 'M30,100 Q30,40 70,40 L100,40 Q120,40 130,60 L140,80 Q150,100 170,100 Q190,100 190,80 Q190,50 170,40 L160,38 Q145,38 140,55 M30,100 Q30,160 70,160 L120,160 Q160,160 170,140 L180,120',
  6: 'M40,140 Q30,100 60,70 L100,40 Q130,25 155,40 L170,55 Q185,70 170,90 L140,120 Q125,140 100,150 L70,165 Q45,170 40,140 Z',
  7: 'M30,150 L30,60 Q30,30 60,30 L100,35 Q130,40 140,65 L150,100 Q155,120 175,125 Q190,130 190,150 Q190,175 165,175 L60,175 Q30,175 30,150 Z',
  8: 'M50,180 L40,80 Q40,40 70,40 L140,40 Q170,40 170,70 L170,90 Q170,110 150,110 L110,110 Q90,110 90,130 L90,150 Q90,170 70,170 L50,180 Z',
  9: 'M40,140 L40,60 Q40,30 70,30 L160,30 Q190,30 190,60 L190,80 Q190,100 170,100 L80,100 Q60,100 60,120 L60,160 Q60,180 40,180 L40,140 Z',
  10: 'M60,170 Q30,140 40,100 L55,70 Q70,40 100,35 Q140,30 160,55 L170,80 Q180,110 160,140 Q140,165 110,170 Q80,175 60,170 Z',
};

/* ────────────────────────────────────────────
   Descriptor helpers for dot rating text
   ──────────────────────────────────────────── */
function tireWearDescriptor(val: number): string {
  if (val <= 3) return 'LOW';
  if (val <= 6) return 'MODERATE';
  return 'HIGH';
}

function overtakingDescriptor(val: number): string {
  if (val <= 3) return 'DIFFICULT';
  if (val <= 6) return 'MODERATE';
  return 'EASY';
}

function difficultyDescriptor(val: number): string {
  if (val <= 3) return 'EASY';
  if (val <= 6) return 'MODERATE';
  return 'DEMANDING';
}

/* ════════════════════════════════════════════
   CircuitSelectionStep  —  main export
   ════════════════════════════════════════════ */
interface CircuitSelectionStepProps {
  onSelect: (circuit: { id: number; name: string; country: string }) => void;
}

export function CircuitSelectionStep({ onSelect }: CircuitSelectionStepProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lockAnimation, setLockAnimation] = useState(false);

  const activeCircuit = CIRCUITS[activeIndex];

  /* lock-on timer: fires 400ms after landing on a circuit */
  useEffect(() => {
    setLockAnimation(false);
    const timer = setTimeout(() => setLockAnimation(true), 400);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const navigateTo = (index: number) => {
    if (index === activeIndex) return;
    setLockAnimation(false);
    setActiveIndex(index);
  };

  const handleNext = () => navigateTo((activeIndex + 1) % CIRCUITS.length);
  const handlePrev = () => navigateTo((activeIndex - 1 + CIRCUITS.length) % CIRCUITS.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
  };

  const handleCardClick = (circuit: CircuitTheme, idx: number) => {
    const pos = getCarouselPosition(idx, activeIndex, CIRCUITS.length);
    if (pos === 'active') {
      onSelect(circuit);
    } else if (pos === 'previous') {
      handlePrev();
    } else if (pos === 'next') {
      handleNext();
    }
  };

  return (
    <div
      className="w-full min-h-[calc(100vh-80px)] flex flex-col items-center justify-between py-8 focus:outline-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* ── TITLE ── */}
      <motion.div
        className="text-center mt-12 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-hero">CIRCUIT INTELLIGENCE</h1>
        <p
          className="text-label mt-2"
          style={{ fontSize: 14 }}
        >
          FORMULA 1 GRAND PRIX LOCATIONS
        </p>
      </motion.div>

      {/* ── CAROUSEL ── */}
      <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center">
        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence initial={false}>
            {CIRCUITS.map((circuit, idx) => {
              const position = getCarouselPosition(idx, activeIndex, CIRCUITS.length);
              if (position === 'hidden') return null;

              const config = circuitTypeConfig[circuit.circuitType] || circuitTypeConfig['technical'];

              return (
                <motion.div
                  key={circuit.id}
                  custom={position}
                  variants={carouselPositionVariants}
                  initial={position}
                  animate={position}
                  exit="hidden"
                  transition={carouselTransition}
                  className="absolute rounded-xl overflow-hidden backdrop-blur-lg bg-zinc-950/80 border border-white/10 transition-all duration-500"
                  style={{
                    width: '100%',
                    maxWidth: 400,
                    height: 520,
                    cursor: 'pointer',
                    boxShadow: position === 'active' ? `0 0 30px ${config.color}50, inset 0 0 20px ${config.color}30, 0 20px 40px rgba(0,0,0,0.8)` : '0 10px 30px rgba(0,0,0,0.5)',
                    transform: position === 'active' ? 'scale(1.05)' : undefined,
                  }}
                  onClick={() => handleCardClick(circuit, idx)}
                >
                  <CircuitCard
                    circuit={circuit}
                    isActive={position === 'active'}
                    isLocked={position === 'active' && lockAnimation}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── PAGINATION & NAVIGATION ── */}
      <motion.div
        className="flex gap-10 justify-center items-center mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={handlePrev}
          className="flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 44,
            height: 44,
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.4)',
            backgroundColor: 'transparent',
          }}
          whileHover={{ 
            scale: 1.05, 
            borderColor: circuitTypeConfig[activeCircuit.circuitType].color, 
            color: circuitTypeConfig[activeCircuit.circuitType].color,
            boxShadow: `0 0 16px ${circuitTypeConfig[activeCircuit.circuitType].color}40`
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous circuit"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        <div className="flex gap-3 items-center">
          {CIRCUITS.map((_, idx) => (
            <motion.button
              key={idx}
              aria-label={`Go to circuit ${idx + 1}`}
              onClick={() => navigateTo(idx)}
              style={{ border: 'none', padding: 0, borderRadius: '2px' }}
              animate={{
                width: idx === activeIndex ? 36 : 12,
                height: 4,
                backgroundColor:
                  idx === activeIndex
                    ? circuitTypeConfig[activeCircuit.circuitType].color
                    : 'rgba(255,255,255,0.15)',
                boxShadow:
                  idx === activeIndex
                    ? `0 0 12px ${circuitTypeConfig[activeCircuit.circuitType].color}`
                    : 'none',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              whileHover={{
                backgroundColor: circuitTypeConfig[activeCircuit.circuitType].color,
                scale: 1.1,
              }}
            />
          ))}
        </div>

        <motion.button
          onClick={handleNext}
          className="flex items-center justify-center rounded-full transition-colors"
          style={{
            width: 44,
            height: 44,
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.4)',
            backgroundColor: 'transparent',
          }}
          whileHover={{ 
            scale: 1.05, 
            borderColor: circuitTypeConfig[activeCircuit.circuitType].color, 
            color: circuitTypeConfig[activeCircuit.circuitType].color,
            boxShadow: `0 0 16px ${circuitTypeConfig[activeCircuit.circuitType].color}40`
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next circuit"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </motion.button>
      </motion.div>

      {/* ── HINT ── */}
      <motion.p
        className="text-center mt-6"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        USE ARROW KEYS OR CLICK TO NAVIGATE
      </motion.p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   CircuitCard (internal)
   ════════════════════════════════════════════════════════ */

interface CircuitCardProps {
  circuit: CircuitTheme;
  isActive: boolean;
  isLocked?: boolean;
}

function CircuitCard({ circuit, isActive, isLocked }: CircuitCardProps) {
  const [imageError, setImageError] = useState(false);
  const config = circuitTypeConfig[circuit.circuitType] || circuitTypeConfig['technical'];
  
  const stats: { label: string; value: number }[] = [
    { label: 'TIRE WEAR', value: circuit.tireWear },
    { label: 'OVERTAKING', value: circuit.overtaking },
    { label: 'DIFFICULTY', value: circuit.difficulty },
  ];

  return (
    <div 
      className="relative w-full max-w-[400px] h-[520px] p-8 rounded-xl backdrop-blur-lg bg-zinc-950/90 border flex flex-col justify-between overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]"
      style={{ borderColor: `${config.color}50`, boxShadow: `0 0 30px ${config.color}20` }}
    >
      
      {/* Background layers */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay -z-10">
        {!imageError ? (
          <Image
            src={circuit.backgroundImage}
            alt={circuit.name}
            fill
            className="object-cover grayscale"
            onError={() => setImageError(true)}
            priority={isActive}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: circuit.backgroundFallback }}
          />
        )}
      </div>

      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${config.color}20 0%, transparent 65%)`,
        }}
      />

      {isLocked && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none z-20"
          style={{
            border: `3px solid ${config.color}`,
            boxShadow: `0 0 40px ${config.color}40, inset 0 0 40px ${config.color}20`,
          }}
          initial={{ clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }}
          animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}

      {/* 1. TOP ZONE: Header & Identity */}
      <div className="flex flex-col items-center shrink-0 w-full relative z-10">
        {/* FLAG */}
        <img src={`https://flagcdn.com/w80/${circuit.countryCode}.png`} alt={`${circuit.country} flag`} className="w-16 h-auto object-contain rounded-sm mb-3 drop-shadow-md" />
        {/* TITLE & SUBTITLE */}
        <h2 className="text-xl font-bold text-white text-center tracking-wide mb-1">{circuit.fullName}</h2>
        <p className="text-[10px] text-zinc-400 tracking-widest uppercase text-center mb-4">
          {circuit.name} {'\u00B7'} {circuit.country.toUpperCase()}
        </p>
      </div>

      {/* 2. MIDDLE ZONE: Telemetry & Sliders */}
      <div className="flex flex-col items-center shrink-0 w-full mb-2 relative z-10">
        {/* 3-COLUMN STATS */}
        <div className="grid grid-cols-3 w-full border-y border-white/10 py-3 mb-4">
          <div className="flex flex-col items-center"><span className="text-[9px] text-zinc-500 uppercase tracking-widest">Length</span><span className="text-sm text-white">{circuit.length.toFixed(3)}KM</span></div>
          <div className="flex flex-col items-center border-x border-white/10"><span className="text-[9px] text-zinc-500 uppercase tracking-widest">Turns</span><span className="text-sm text-white">{circuit.corners}</span></div>
          <div className="flex flex-col items-center"><span className="text-[9px] text-zinc-500 uppercase tracking-widest">Zones</span><span className="text-sm text-white">{circuit.drsZones} DRS</span></div>
        </div>

        {/* SLIDERS - RIGID GRID TO PREVENT COLLAPSE */}
        <div className="flex flex-col gap-2 w-full max-w-[280px]">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center justify-between w-full">
              <span className="text-[10px] text-zinc-400 w-24 text-left uppercase">{stat.label}</span>
              <div className="flex-1 flex justify-center">
                <DotRating value={stat.value} max={10} color={config.color} size="md" />
              </div>
            </div>
          ))}
        </div>

        {/* BADGE */}
        <div className="mt-4 flex justify-center w-full">
          <span 
            className="px-3 py-1 border rounded-full text-[9px] tracking-widest uppercase"
            style={{ borderColor: `${config.color}50`, color: config.color, backgroundColor: `${config.color}10` }}
          >
            {config.label}
          </span>
        </div>
      </div>

      {/* 3. BOTTOM ZONE: Map & Footer */}
      {/* Map Canvas - flex-1 allows it to fill remaining space safely */}
      <div className="flex-1 w-full relative flex items-center justify-center shrink min-h-[80px] overflow-hidden z-10">
        <img 
          src={circuit.mapPath} 
          alt="Map" 
          className="max-w-full max-h-full object-contain mix-blend-screen drop-shadow-lg" 
          style={{ filter: 'contrast(1.2) drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 w-full pt-4 mt-2 border-t border-white/10 flex justify-between items-center z-10">
        <span className="text-[10px] text-zinc-500 tracking-widest uppercase">Circuit Specs</span>
        <span className="text-xs text-white font-mono tracking-wider">{circuit.laps} LAPS &bull; {circuit.length.toFixed(3)} KM</span>
      </div>

    </div>
  );
}

/* ────────────────────────────────────────────
   CircuitTrace  —  animated SVG path overlay
   ──────────────────────────────────────────── */
function CircuitTrace({
  circuitId,
  isActive,
}: {
  circuitId: number;
  isActive: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  const d = circuitPaths[circuitId] ?? circuitPaths[1];

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLength(len);
      // Reset stroke-dashoffset immediately, then animate
      pathRef.current.style.transition = 'none';
      pathRef.current.style.strokeDasharray = `${len}`;
      pathRef.current.style.strokeDashoffset = `${len}`;

      if (isActive) {
        // Force reflow to apply reset before animating
        void pathRef.current.getBoundingClientRect();
        pathRef.current.style.transition = 'stroke-dashoffset 1400ms ease-in-out';
        pathRef.current.style.strokeDashoffset = '0';
      }
    }
  }, [isActive, circuitId, d]);

  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{
        opacity: isActive ? 1 : 0.4,
        transition: 'opacity 400ms ease',
      }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full max-w-[200px] max-h-[200px]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          ref={pathRef}
          d={d}
          stroke="var(--accent-cyan)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          }}
        />
      </svg>
    </div>
  );
}
