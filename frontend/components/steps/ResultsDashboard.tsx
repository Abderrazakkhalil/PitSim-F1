'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cardEntrance, spring } from '@/lib/motionVariants';
import type { TeamTheme } from '@/lib/teamThemes';

const mockDegradationData = [
  { lap: 1, soft: 100, medium: 100, hard: 100 },
  { lap: 10, soft: 85, medium: 95, hard: 98 },
  { lap: 18, soft: 60, medium: 88, hard: 96 },
  { lap: 20, soft: 65, medium: 100, hard: 96 },
  { lap: 30, soft: 65, medium: 85, hard: 94 },
  { lap: 40, soft: 65, medium: 70, hard: 88 },
  { lap: 50, soft: 65, medium: 70, hard: 75 },
  { lap: 53, soft: 65, medium: 70, hard: 70 },
];

interface ResultsDashboardProps {
  team: TeamTheme;
  circuit: { id: number; name: string; country: string };
  tires: string[];
}

export function ResultsDashboard({ team, circuit, tires }: ResultsDashboardProps) {
  return (
    <div className="w-full h-full px-8 py-16 overflow-y-auto">
      {/* Title */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-black tracking-wider mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          RACE STRATEGY ANALYSIS
        </h1>
        <p className="text-[var(--text-secondary)]">
          {team.name} · {circuit.name} · {tires.join(' → ')}
        </p>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Degradation chart */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardEntrance}
          className="col-span-2 rounded-xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)]"
        >
          <h3 className="text-lg font-bold tracking-wider mb-4 text-[var(--accent-cyan)]">LAP-BY-LAP DEGRADATION</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockDegradationData}>
              <defs>
                <linearGradient id="colorSoft" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF1E1E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF1E1E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorHard" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E8E8E8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E8E8E8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="lap" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)' }} />
              <Area type="monotone" dataKey="soft" stroke="#FF1E1E" fillOpacity={1} fill="url(#colorSoft)" />
              <Area type="monotone" dataKey="medium" stroke="#FFD700" fillOpacity={1} fill="url(#colorMedium)" />
              <Area type="monotone" dataKey="hard" stroke="#E8E8E8" fillOpacity={1} fill="url(#colorHard)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Strategy summary */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardEntrance}
          className="rounded-xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)]"
        >
          <h3 className="text-lg font-bold tracking-wider mb-6 text-[var(--accent-cyan)]">STRATEGY SUMMARY</h3>
          <div className="space-y-6">
            <div>
              <div className="text-xs text-[var(--text-secondary)] tracking-wider uppercase mb-1">Total Time</div>
              <div className="text-3xl font-bold font-mono text-[var(--accent-cyan)]">1:18:42.337</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] tracking-wider uppercase mb-1">Pit Stops</div>
              <div className="text-3xl font-bold">2</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] tracking-wider uppercase mb-1">Best Lap</div>
              <div className="text-2xl font-bold font-mono">1:21.046</div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-secondary)] tracking-wider uppercase mb-1">Tire Delta</div>
              <div className="text-xl font-bold text-[var(--accent-green)]">+3.2s vs Alt</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Pit stop timeline */}
      <motion.div
        custom={2}
        initial="hidden"
        animate="visible"
        variants={cardEntrance}
        className="rounded-xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)] mb-8"
      >
        <h3 className="text-lg font-bold tracking-wider mb-4 text-[var(--accent-cyan)]">PIT STOP TIMELINE</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-12 font-mono text-sm">LAP 1</span>
            <div className="flex-1 relative h-12 rounded bg-[var(--bg-primary)] overflow-hidden flex items-center">
              <div className="absolute left-0 right-0 h-full flex">
                <div className="flex-1 bg-[#FF1E1E] bg-opacity-30 flex items-center px-3">
                  <span className="text-xs font-bold">SOFT ▓▓▓▓▓▓▓</span>
                </div>
              </div>
              <div className="absolute left-[33%] top-0 bottom-0 w-1 bg-[var(--accent-cyan)]" />
              <span className="absolute left-[33%] -bottom-6 text-xs text-[var(--text-muted)]">[PIT L18]</span>
            </div>
            <span className="w-12 font-mono text-sm text-right">18</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="w-12 font-mono text-sm">20</span>
            <div className="flex-1 relative h-12 rounded bg-[var(--bg-primary)] overflow-hidden flex items-center">
              <div className="absolute left-0 right-0 h-full flex">
                <div className="flex-1 bg-[#FFD700] bg-opacity-30 flex items-center px-3">
                  <span className="text-xs font-bold">MEDIUM ▓▓▓▓▓▓</span>
                </div>
              </div>
              <div className="absolute left-[72%] top-0 bottom-0 w-1 bg-[var(--accent-cyan)]" />
              <span className="absolute left-[72%] -bottom-6 text-xs text-[var(--text-muted)]">[PIT L38]</span>
            </div>
            <span className="w-12 font-mono text-sm text-right">38</span>
          </div>

          <div className="flex items-center gap-4 pt-6">
            <span className="w-12 font-mono text-sm">39</span>
            <div className="flex-1 relative h-12 rounded bg-[var(--bg-primary)] overflow-hidden flex items-center">
              <div className="absolute left-0 right-0 h-full flex">
                <div className="flex-1 bg-[#E8E8E8] bg-opacity-30 flex items-center px-3">
                  <span className="text-xs font-bold">HARD ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓</span>
                </div>
              </div>
            </div>
            <span className="w-12 font-mono text-sm text-right">53</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom panels */}
      <div className="grid grid-cols-3 gap-6">
        <motion.div custom={3} initial="hidden" animate="visible" variants={cardEntrance} className="rounded-xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <h4 className="text-sm font-bold tracking-wider mb-4 text-[var(--accent-cyan)]">VS ALTERNATIVE</h4>
          <p className="text-xs text-[var(--text-secondary)]">Soft → Hard strategy saves 2.1s vs Medium → Hard</p>
        </motion.div>

        <motion.div custom={4} initial="hidden" animate="visible" variants={cardEntrance} className="rounded-xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <h4 className="text-sm font-bold tracking-wider mb-4 text-[var(--accent-orange)]">RISK ASSESSMENT</h4>
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-[var(--border-default)] rounded-full overflow-hidden">
              <div className="w-7/10 h-full bg-[var(--accent-orange)]" />
            </div>
            <span className="text-sm font-bold">7/10</span>
          </div>
        </motion.div>

        <motion.div custom={5} initial="hidden" animate="visible" variants={cardEntrance} className="rounded-xl p-6 bg-[var(--bg-elevated)] border border-[var(--border-default)]">
          <h4 className="text-sm font-bold tracking-wider mb-4 text-[var(--accent-cyan)]">WEATHER DELTA</h4>
          <p className="text-xs text-[var(--text-secondary)]">+1.8s if rain after lap 30</p>
        </motion.div>
      </div>

      {/* Export panel */}
      <motion.div
        className="flex gap-4 mt-12 justify-center pb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button className="px-6 py-3 rounded-lg bg-[var(--accent-cyan)] bg-opacity-20 border border-[var(--accent-cyan)] text-[var(--accent-cyan)] font-bold uppercase tracking-wider hover:bg-opacity-30 transition-all">
          📊 EXPORT PDF
        </button>
        <button className="px-6 py-3 rounded-lg bg-[var(--accent-green)] bg-opacity-20 border border-[var(--accent-green)] text-[var(--accent-green)] font-bold uppercase tracking-wider hover:bg-opacity-30 transition-all">
          📋 COPY STRATEGY
        </button>
        <button className="px-6 py-3 rounded-lg bg-[var(--accent-red)] bg-opacity-20 border border-[var(--accent-red)] text-[var(--accent-red)] font-bold uppercase tracking-wider hover:bg-opacity-30 transition-all">
          🔄 RUN AGAIN
        </button>
      </motion.div>
    </div>
  );
}
