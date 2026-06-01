'use client';

import { motion } from 'framer-motion';
import { TEAMS } from '@/lib/teamThemes';
import type { TeamTheme } from '@/lib/teamThemes';
import { hoverLift, cardEntrance } from '@/lib/motionVariants';

interface TeamSelectionStepProps {
  onSelect: (team: TeamTheme) => void;
}

export function TeamSelectionStep({ onSelect }: TeamSelectionStepProps) {
  return (
    <div className="w-full h-full px-8 py-16 flex flex-col items-center justify-center gap-16">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-black tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          SELECT YOUR CONSTRUCTOR
        </h1>
        <p className="text-[var(--text-secondary)] text-lg" style={{ fontFamily: 'var(--font-ui)' }}>
          2024 SEASON
        </p>
      </motion.div>

      {/* Team carousel */}
      <motion.div
        className="flex gap-8 items-center justify-center flex-wrap max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {TEAMS.map((team, i) => (
          <TeamCard key={team.id} team={team} index={i} onSelect={onSelect} />
        ))}
      </motion.div>
    </div>
  );
}

interface TeamCardProps {
  team: TeamTheme;
  index: number;
  onSelect: (team: TeamTheme) => void;
}

function TeamCard({ team, index, onSelect }: TeamCardProps) {
  return (
    <motion.button
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardEntrance}
      whileHover={hoverLift}
      onClick={() => onSelect(team)}
      className="relative w-64 h-80 rounded-2xl overflow-hidden group focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        backgroundColor: `${team.primaryColor}15`,
        borderColor: team.primaryColor,
        borderWidth: '2px',
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(135deg, ${team.primaryColor}, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative h-full p-6 flex flex-col justify-between z-10">
        {/* Logo */}
        <div
          className="text-5xl text-white text-opacity-90 mb-4"
          style={{
            textShadow: `0 0 20px ${team.primaryColor}`,
          }}
        >
          {team.logo}
        </div>

        {/* Team name and country */}
        <div>
          <div
            className="text-2xl font-black tracking-wider mb-1"
            style={{
              fontFamily: 'var(--font-display)',
              color: team.primaryColor,
            }}
          >
            {team.name}
          </div>
          <p className="text-xs text-[var(--text-secondary)] tracking-wider uppercase">{team.country}</p>

          {/* Divider */}
          <div className="h-px bg-[var(--border-default)] my-4" />

          {/* Stats */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] w-20">PACE</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i < team.pace ? team.primaryColor : 'var(--border-default)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] w-20">TIRE MGMT</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i < team.tireMgmt ? team.primaryColor : 'var(--border-default)',
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-secondary)] w-20">PIT SPEED</span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: i < team.pitSpeed ? team.primaryColor : 'var(--border-default)',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Season stats */}
          <div className="mt-4 pt-4 border-t border-[var(--border-default)]">
            <p className="text-[var(--accent-cyan)]">
              [{team.season}] P3 · {team.points} pts
            </p>
          </div>
        </div>
      </div>

      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
        style={{
          boxShadow: `0 0 40px ${team.primaryColor}66`,
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
