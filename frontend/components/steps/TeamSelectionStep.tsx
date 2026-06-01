'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { TEAMS } from '@/lib/teamThemes';
import { DotRating } from '@/components/common/DotRating';
import { getCarouselPosition, carouselPositionVariants, carouselTransition } from '@/lib/carouselHelpers';
import type { TeamTheme } from '@/lib/teamThemes';

/* ── headquarters lookup (for "MARANELLO · ITALY" style) ── */
const HQ_MAP: Record<string, string> = {
  'ferrari': 'MARANELLO',
  'mercedes': 'BRACKLEY',
  'red-bull': 'MILTON KEYNES',
  'mclaren': 'WOKING',
  'aston-martin': 'SILVERSTONE',
  'alpine': 'ENSTONE',
  'rb': 'FAENZA',
  'haas': 'KANNAPOLIS',
  'williams': 'GROVE',
  'sauber': 'HINWIL',
};

/* ── extract team initials from name ── */
function getTeamInitials(name: string): string {
  const words = name.replace(/[-]/g, ' ').split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
  return words
    .filter((w) => w.length > 1)
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/* ════════════════════════════════════════════════════════
   TeamSelectionStep
   ════════════════════════════════════════════════════════ */

interface TeamSelectionStepProps {
  onSelect: (team: TeamTheme) => void;
}

export function TeamSelectionStep({ onSelect }: TeamSelectionStepProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lockAnimation, setLockAnimation] = useState(false);

  const activeTeam = TEAMS[activeIndex];

  /* lock-on timer: fires 400ms after landing on a team */
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

  const handleNext = () => navigateTo((activeIndex + 1) % TEAMS.length);
  const handlePrev = () => navigateTo((activeIndex - 1 + TEAMS.length) % TEAMS.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
  };

  const handleCardClick = (team: TeamTheme, idx: number) => {
    const pos = getCarouselPosition(idx, activeIndex, TEAMS.length);
    if (pos === 'active') {
      onSelect(team);
    } else if (pos === 'previous') {
      handlePrev();
    } else if (pos === 'next') {
      handleNext();
    }
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center px-4 focus:outline-none"
      style={{ height: 'calc(100vh - 72px)' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* ── TITLE ── */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-hero">SELECT YOUR CONSTRUCTOR</h1>
        <p
          className="text-label mt-2"
          style={{ fontSize: 14 }}
        >
          2024 FORMULA 1 SEASON
        </p>
      </motion.div>

      {/* ── CAROUSEL ── */}
      <div className="relative w-full max-w-5xl h-[500px] flex items-center justify-center">
        {/* Cards */}
        <div className="relative w-full h-full flex items-center justify-center">
          <AnimatePresence initial={false}>
            {TEAMS.map((team, idx) => {
              const position = getCarouselPosition(idx, activeIndex, TEAMS.length);
              if (position === 'hidden') return null;

              return (
                <motion.div
                  key={team.id}
                  custom={position}
                  variants={carouselPositionVariants}
                  initial={position}
                  animate={position}
                  exit="hidden"
                  transition={carouselTransition}
                  className="absolute rounded-2xl overflow-hidden backdrop-blur-md bg-zinc-900/80 transition-all duration-500"
                  style={{
                    width: '100%',
                    maxWidth: 600,
                    minHeight: 460,
                    cursor: 'pointer',
                    border: `1px solid ${team.primaryColor}80`,
                    boxShadow: position === 'active' ? `0 0 30px ${team.primaryColor}50, inset 0 0 20px ${team.primaryColor}30, 0 20px 40px rgba(0,0,0,0.8)` : '0 10px 30px rgba(0,0,0,0.5)',
                    transform: position === 'active' ? 'scale(1.05)' : undefined,
                  }}
                  onClick={() => handleCardClick(team, idx)}
                >
                  <TeamCard
                    team={team}
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
            borderColor: activeTeam.primaryColor, 
            color: activeTeam.primaryColor,
            boxShadow: `0 0 16px ${activeTeam.primaryColor}40`
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Previous team"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </motion.button>

        <div className="flex gap-3 items-center">
          {TEAMS.map((_, idx) => (
            <motion.button
              key={idx}
              aria-label={`Go to team ${idx + 1}`}
              onClick={() => navigateTo(idx)}
              style={{ border: 'none', padding: 0, borderRadius: '2px' }}
              animate={{
                width: idx === activeIndex ? 36 : 12,
                height: 4,
                backgroundColor:
                  idx === activeIndex
                    ? activeTeam.primaryColor
                    : 'rgba(255,255,255,0.15)',
                boxShadow:
                  idx === activeIndex
                    ? `0 0 12px ${activeTeam.primaryColor}`
                    : 'none',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              whileHover={{
                backgroundColor: activeTeam.primaryColor,
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
            borderColor: activeTeam.primaryColor, 
            color: activeTeam.primaryColor,
            boxShadow: `0 0 16px ${activeTeam.primaryColor}40`
          }}
          whileTap={{ scale: 0.95 }}
          aria-label="Next team"
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
   TeamCard (internal)
   ════════════════════════════════════════════════════════ */

interface TeamCardProps {
  team: TeamTheme;
  isActive: boolean;
  isLocked: boolean;
}

function TeamCard({ team, isActive, isLocked }: TeamCardProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getTeamInitials(team.name);
  const hq = HQ_MAP[team.slug] ?? '';
  const locationLine = hq
    ? `${hq} \u00B7 ${team.country.toUpperCase()}`
    : team.country.toUpperCase();

  const stats: { label: string; value: number }[] = [
    { label: 'PACE', value: team.pace },
    { label: 'TIRE MGMT', value: team.tireMgmt },
    { label: 'PIT SPEED', value: team.pitSpeed },
  ];

  return (
    <div className="relative w-full" style={{ minHeight: 460 }}>
      {/* Layer 1 — Background Image */}
      <div className="absolute inset-0 opacity-30 mix-blend-overlay">
        {!imageError ? (
          <Image
            src={team.backgroundImage}
            alt={team.name}
            fill
            className="object-cover grayscale"
            onError={() => setImageError(true)}
            priority={isActive}
          />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: team.backgroundFallback }}
          />
        )}
      </div>

      {/* Layer 2 — Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.6) 45%, rgba(0,0,0,0.1) 100%)',
        }}
      />

      {/* Layer 3 — Team Color Atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${team.primaryColor}20 0%, transparent 65%)`,
        }}
      />

      {/* Layer 4 — Lock Animation Border */}
      {isLocked && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            border: `3px solid ${team.primaryColor}`,
            boxShadow: `0 0 40px ${team.primaryColor}40, inset 0 0 40px ${team.primaryColor}20`,
            zIndex: 30,
          }}
          initial={{ clipPath: 'polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)' }}
          animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}

      {/* Layer 5 — Content */}
      <div
        className="absolute inset-0 flex flex-col justify-end"
        style={{ padding: 32, zIndex: 10 }}
      >
        {/* Team Logo */}
        <div
          style={{
            height: 80,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: team.primaryColor,
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            marginBottom: 16,
            width: 'fit-content',
          }}
        >
          <img
            src={team.logoPath}
            alt={`${team.name} logo`}
            className="h-full w-auto object-contain"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }}
          />
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            backgroundColor: team.primaryColor,
            opacity: 0.4,
            marginBottom: 16,
          }}
        />

        {/* Team Name */}
        <h2 className="text-card-title" style={{ marginBottom: 4 }}>
          {team.name}
        </h2>

        {/* Country / HQ */}
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: '#8b95a3',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          {locationLine}
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: '#8b95a3',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  width: 112,
                  flexShrink: 0,
                }}
              >
                {stat.label}
              </span>
              {/* High-Tech LED Segmented Dashboard Skill Bar */}
              <div style={{ display: 'flex', gap: '4px', flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: '8px',
                      flex: 1,
                      backgroundColor: i < stat.value ? team.primaryColor : 'rgba(255,255,255,0.03)',
                      boxShadow: i < stat.value ? `0 0 10px ${team.primaryColor}90` : 'none',
                      borderRadius: '1px',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Season Data */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.12)',
            paddingTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              color: '#8b95a3',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
            }}
          >
            2024 SEASON
          </span>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 14,
              color: 'white',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            P{team.position} {'\u00B7'} {team.points} PTS
          </span>
        </div>
      </div>
    </div>
  );
}
