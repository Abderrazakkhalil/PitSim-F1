'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { panelStagger } from '@/lib/motionVariants';
import { DotRating } from '@/components/common/DotRating';
import type { TeamTheme } from '@/lib/teamThemes';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const mockDegradationData = [
  { lap: 1, soft: 100, medium: 100, hard: 100 },
  { lap: 5, soft: 96, medium: 99, hard: 100 },
  { lap: 10, soft: 85, medium: 95, hard: 98 },
  { lap: 15, soft: 72, medium: 91, hard: 97 },
  { lap: 18, soft: 60, medium: 88, hard: 96 },
  { lap: 20, soft: 55, medium: 100, hard: 96 },
  { lap: 25, soft: 55, medium: 92, hard: 95 },
  { lap: 30, soft: 55, medium: 85, hard: 94 },
  { lap: 35, soft: 55, medium: 78, hard: 92 },
  { lap: 38, soft: 55, medium: 72, hard: 100 },
  { lap: 40, soft: 55, medium: 72, hard: 95 },
  { lap: 45, soft: 55, medium: 72, hard: 88 },
  { lap: 50, soft: 55, medium: 72, hard: 78 },
  { lap: 53, soft: 55, medium: 72, hard: 72 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function formatTime(ms: number): { hours: string; m1: string; m2: string; s1: string; s2: string; millis: string } {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;

  const minStr = String(minutes).padStart(2, '0');
  const secStr = String(seconds).padStart(2, '0');
  const msStr = String(milliseconds).padStart(3, '0');

  return {
    hours: String(hours),
    m1: minStr[0],
    m2: minStr[1],
    s1: secStr[0],
    s2: secStr[1],
    millis: msStr,
  };
}

/* ------------------------------------------------------------------ */
/*  Custom Tooltip                                                     */
/* ------------------------------------------------------------------ */

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
  color: string;
}

function CustomChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(5,7,9,0.95)',
        border: '1px solid rgba(0,229,255,0.35)',
        borderRadius: '8px',
        padding: '16px',
        backdropFilter: 'blur(12px)',
        minWidth: 160,
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '13px',
          color: 'var(--accent-cyan)',
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        LAP {label}
      </p>
      {payload.map((entry) => (
        <div
          key={entry.dataKey}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              color: entry.color,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {entry.dataKey}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: '13px',
              color: 'white',
            }}
          >
            {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stint bar data                                                     */
/* ------------------------------------------------------------------ */

const stints = [
  { compound: 'SOFT', color: '#FF1E1E', startLap: 1, endLap: 18, totalLaps: 53 },
  { compound: 'MEDIUM', color: '#FFD700', startLap: 20, endLap: 38, totalLaps: 53 },
  { compound: 'HARD', color: '#E8E8E8', startLap: 39, endLap: 53, totalLaps: 53 },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface ResultsDashboardProps {
  team: TeamTheme;
  circuit: { id: number; name: string; country: string };
  tires: string[];
}

export function ResultsDashboard({ team, circuit, tires }: ResultsDashboardProps) {
  const [displayMs, setDisplayMs] = useState(0);
  const animStartRef = useRef<number | null>(null);

  /* Animated time counter ------------------------------------------ */
  useEffect(() => {
    const targetMs = 78 * 60000 + 42 * 1000 + 337; // 1:18:42.337
    const duration = 1800;
    let rafId: number;

    function tick(now: number) {
      if (animStartRef.current === null) animStartRef.current = now;
      const elapsed = now - animStartRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplayMs(Math.round(targetMs * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const time = formatTime(displayMs);

  return (
    <div className="w-full h-full overflow-y-auto">
      {/* ============================================================ */}
      {/* HEADER                                                       */}
      {/* ============================================================ */}
      <motion.div
        className="sticky top-0 z-20 px-8 pt-8 pb-10"
        style={{
          background: 'linear-gradient(to bottom, var(--bg-void) 60%, transparent 100%)',
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-hero mb-2">RACE STRATEGY ANALYSIS</h1>
        <p
          className="text-label"
          style={{ fontSize: 14 }}
        >
          {team.name}  /  {circuit.name}  /  Strategy: {tires.join(' - ')}
        </p>
      </motion.div>

      {/* ============================================================ */}
      {/* MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <div className="px-8 pb-8">
        {/* 2-Column split ------------------------------------------- */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* LEFT: Degradation Chart (col-span-2) */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={panelStagger}
            className="col-span-2 rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-default)]"
          >
            <div className="p-8">
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: team.primaryColor,
                  marginBottom: 24,
                }}
              >
                LAP DEGRADATION CURVES
              </h3>

              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={mockDegradationData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="gradSoft" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF1E1E" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#FF1E1E" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradMedium" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFD700" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradHard" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E8E8E8" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#E8E8E8" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines only */}
                    <XAxis
                      dataKey="lap"
                      stroke="rgba(255,255,255,0.25)"
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      style={{ fontSize: '11px', fontFamily: 'var(--font-data)' }}
                    />
                    <YAxis
                      domain={[60, 100]}
                      stroke="rgba(255,255,255,0.25)"
                      tickLine={false}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickFormatter={(v: number) => `${v}%`}
                      style={{ fontSize: '11px', fontFamily: 'var(--font-data)' }}
                    />

                    {/* Subtle horizontal gridlines via reference lines hack: use a custom CartesianGrid */}
                    {[60, 70, 80, 90, 100].map((v) => (
                      <line
                        key={v}
                        x1="0%"
                        x2="100%"
                        stroke="rgba(255,255,255,0.06)"
                        strokeDasharray="3 3"
                      />
                    ))}

                    <Tooltip
                      content={<CustomChartTooltip />}
                      cursor={{ stroke: 'rgba(0,229,255,0.2)', strokeWidth: 1 }}
                    />

                    <Area
                      type="monotone"
                      dataKey="soft"
                      stroke="#FF1E1E"
                      strokeWidth={2}
                      fill="url(#gradSoft)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="medium"
                      stroke="#FFD700"
                      strokeWidth={2}
                      fill="url(#gradMedium)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="hard"
                      stroke="#E8E8E8"
                      strokeWidth={2}
                      fill="url(#gradHard)"
                      isAnimationActive={true}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Custom legend (no Legend component) */}
              <div
                style={{
                  display: 'flex',
                  gap: 28,
                  marginTop: 16,
                  justifyContent: 'center',
                }}
              >
                {[
                  { label: 'Soft', color: '#FF1E1E' },
                  { label: 'Medium', color: '#FFD700' },
                  { label: 'Hard', color: '#E8E8E8' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: item.color,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Strategy Summary (col-span-1) */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={panelStagger}
            className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] p-8 flex flex-col"
          >
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: team.primaryColor,
                marginBottom: 28,
              }}
            >
              STRATEGY SUMMARY
            </h3>

            {/* TOTAL TIME */}
            <div style={{ marginBottom: 24 }}>
              <p className="text-label" style={{ marginBottom: 8 }}>
                TOTAL TIME
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-data)',
                  fontWeight: 700,
                  fontSize: 'clamp(36px, 5vw, 48px)',
                  color: 'white',
                  lineHeight: 1.1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {time.hours}
                <span className="colon-pulse">:</span>
                {time.m1}{time.m2}
                <span className="colon-pulse">:</span>
                {time.s1}{time.s2}
                <span style={{ fontSize: '0.6em', opacity: 0.7 }}>.{time.millis}</span>
              </p>
              <motion.p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  marginTop: 8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                Optimized Strategy
              </motion.p>
            </div>

            {/* Key metrics */}
            <div
              style={{
                borderTop: '1px solid var(--border-default)',
                paddingTop: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {/* PIT STOPS */}
              <div>
                <p className="text-label" style={{ marginBottom: 6 }}>PIT STOPS</p>
                <p
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 28,
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  2
                </p>
              </div>

              {/* BEST LAP */}
              <div>
                <p className="text-label" style={{ marginBottom: 6 }}>BEST LAP</p>
                <p
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  1:21.046
                </p>
              </div>

              {/* TIRE DELTA */}
              <div>
                <p className="text-label" style={{ marginBottom: 6 }}>TIRE DELTA</p>
                <p
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--accent-green)',
                  }}
                >
                  +3.2s
                </p>
              </div>
            </div>

            {/* RISK LEVEL */}
            <div
              style={{
                borderTop: '1px solid var(--border-default)',
                paddingTop: 20,
                marginTop: 20,
              }}
            >
              <p className="text-label" style={{ marginBottom: 10 }}>RISK LEVEL</p>
              <DotRating value={7} max={10} color="var(--accent-orange)" size="lg" />
            </div>

            {/* VS ALTERNATIVE */}
            <div
              style={{
                borderTop: '1px solid var(--border-default)',
                paddingTop: 20,
                marginTop: 'auto',
              }}
            >
              <p className="text-label" style={{ marginBottom: 12 }}>VS ALTERNATIVE</p>

              {/* +4.8s vs M-H-M (slower = up arrow, red-ish) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                {/* CSS triangle UP */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '8px solid var(--accent-red)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--accent-red)',
                  }}
                >
                  +4.8s
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}
                >
                  vs M-H-M
                </span>
              </div>

              {/* -1.2s vs S-M-H (faster = down arrow, green) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {/* CSS triangle DOWN */}
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '8px solid var(--accent-green)',
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--accent-green)',
                  }}
                >
                  -1.2s
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                  }}
                >
                  vs S-M-H
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ============================================================ */}
        {/* PIT STOP TIMELINE                                            */}
        {/* ============================================================ */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={panelStagger}
          className="rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] p-8 mb-8"
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: team.primaryColor,
              marginBottom: 24,
            }}
          >
            PIT STOP TIMELINE
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stints.map((stint, idx) => {
              const widthPct = ((stint.endLap - stint.startLap + 1) / stint.totalLaps) * 100;
              const isLast = idx === stints.length - 1;

              return (
                <div
                  key={stint.compound}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  {/* Left lap label */}
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      width: 40,
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    L{stint.startLap}
                  </span>

                  {/* Bar container */}
                  <div
                    style={{
                      flex: 1,
                      position: 'relative',
                      height: 48,
                      borderRadius: 6,
                      backgroundColor: 'var(--bg-primary)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Colored stint bar */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: `${widthPct}%`,
                        height: '100%',
                        backgroundColor: `${stint.color}40`,
                        borderTop: `2px solid ${team.primaryColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 16,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 13,
                          fontWeight: 700,
                          color: stint.color,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}
                      >
                        {stint.compound} ({stint.endLap - stint.startLap + 1}L)
                      </span>
                    </div>

                    {/* Pit stop divider (cyan vertical line) */}
                    {!isLast && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${widthPct}%`,
                          width: 2,
                          backgroundColor: 'var(--accent-cyan)',
                        }}
                      />
                    )}
                  </div>

                  {/* Right lap label */}
                  <span
                    style={{
                      fontFamily: 'var(--font-data)',
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      width: 40,
                      textAlign: 'left',
                      flexShrink: 0,
                    }}
                  >
                    L{stint.endLap}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ============================================================ */}
        {/* ACTION BUTTONS                                               */}
        {/* ============================================================ */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={panelStagger}
          className="flex gap-5 justify-center pb-12 pt-4"
        >
          {/* EXPORT PDF */}
          <button
            className="px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm transition-all cursor-pointer"
            style={{
              fontFamily: 'var(--font-ui)',
              backgroundColor: 'rgba(0,229,255,0.12)',
              border: '2px solid rgba(0,229,255,0.4)',
              color: 'var(--accent-cyan)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.25)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(0,229,255,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,229,255,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            EXPORT PDF
          </button>

          {/* COPY STRATEGY */}
          <button
            className="px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm transition-all cursor-pointer"
            style={{
              fontFamily: 'var(--font-ui)',
              backgroundColor: 'rgba(0,255,133,0.12)',
              border: '2px solid rgba(0,255,133,0.4)',
              color: 'var(--accent-green)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,255,133,0.25)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(0,255,133,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0,255,133,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            COPY STRATEGY
          </button>

          {/* RUN AGAIN */}
          <button
            className="px-8 py-3 rounded-lg font-black uppercase tracking-widest text-sm transition-all cursor-pointer"
            style={{
              fontFamily: 'var(--font-ui)',
              backgroundColor: 'rgba(255,30,30,0.12)',
              border: '2px solid rgba(255,30,30,0.4)',
              color: 'var(--accent-red)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,30,30,0.25)';
              e.currentTarget.style.boxShadow = '0 0 24px rgba(255,30,30,0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,30,30,0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            RUN AGAIN
          </button>
        </motion.div>
      </div>
    </div>
  );
}
