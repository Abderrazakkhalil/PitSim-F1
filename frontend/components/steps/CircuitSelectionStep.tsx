'use client';

import { motion } from 'framer-motion';
import { cardEntrance, spring } from '@/lib/motionVariants';

const CIRCUITS = [
  { id: 1, name: 'BAHRAIN', country: 'BH', length: 5.412, laps: 57 },
  { id: 2, name: 'SAUDI ARABIA', country: 'SA', length: 6.174, laps: 50 },
  { id: 3, name: 'AUSTRALIA', country: 'AU', length: 5.303, laps: 58 },
  { id: 4, name: 'JAPAN', country: 'JP', length: 5.807, laps: 53 },
  { id: 5, name: 'CHINA', country: 'CN', length: 5.451, laps: 56 },
  { id: 6, name: 'MONACO', country: 'MC', length: 3.337, laps: 78 },
  { id: 7, name: 'CANADA', country: 'CA', length: 4.361, laps: 70 },
  { id: 8, name: 'SPAIN', country: 'ES', length: 4.655, laps: 66 },
  { id: 9, name: 'AUSTRIA', country: 'AT', length: 4.318, laps: 71 },
  { id: 10, name: 'UK', country: 'GB', length: 5.891, laps: 52 },
];

interface CircuitSelectionStepProps {
  onSelect: (circuit: { id: number; name: string; country: string }) => void;
}

export function CircuitSelectionStep({ onSelect }: CircuitSelectionStepProps) {
  return (
    <div className="w-full h-full px-8 py-16 flex flex-col items-center gap-12">
      {/* Title */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-5xl font-black tracking-wider mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          CIRCUIT INTELLIGENCE
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">23 ROUNDS · 2024</p>
      </motion.div>

      {/* Circuit grid */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {CIRCUITS.map((circuit, i) => (
          <CircuitCard key={circuit.id} circuit={circuit} index={i} onSelect={onSelect} />
        ))}
      </motion.div>
    </div>
  );
}

function CircuitCard({
  circuit,
  index,
  onSelect,
}: {
  circuit: { id: number; name: string; country: string; length: number; laps: number };
  index: number;
  onSelect: (circuit: { id: number; name: string; country: string }) => void;
}) {
  return (
    <motion.button
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardEntrance}
      whileHover={{ scale: 1.05, y: -4 }}
      onClick={() => onSelect(circuit)}
      className="relative h-64 rounded-xl overflow-hidden group focus:outline-none focus-visible:ring-2"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: 'var(--accent-cyan)',
        borderWidth: '2px',
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--bg-elevated)] opacity-10" />

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-between z-10">
        <div>
          <div className="text-2xl font-black tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            {circuit.name}
          </div>
          <div className="text-sm text-[var(--accent-cyan)] font-bold">[{circuit.country}]</div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="text-[var(--text-secondary)]">{circuit.length.toFixed(3)} km</div>
          <div className="text-[var(--text-secondary)]">{circuit.laps} LAPS</div>
          <div className="h-px bg-[var(--border-default)] my-2" />
          <div className="text-[var(--accent-cyan)]">▶ SELECT CIRCUIT</div>
        </div>
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
        style={{
          boxShadow: '0 0 20px rgba(0, 229, 255, 0.35)',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
