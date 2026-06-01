'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { spring } from '@/lib/motionVariants';

const COMPOUNDS = [
  { id: 'H', name: 'Hard', color: '#E8E8E8', grip: 3, deg: 2, stint: '25-35' },
  { id: 'M', name: 'Medium', color: '#FFD700', grip: 4, deg: 3, stint: '18-25' },
  { id: 'S', name: 'Soft', color: '#FF1E1E', grip: 5, deg: 5, stint: '10-18' },
  { id: 'I', name: 'Intermediate', color: '#39B54A', grip: 4, deg: 2, stint: '20-40' },
  { id: 'W', name: 'Wet', color: '#0067FF', grip: 3, deg: 1, stint: '30-50' },
];

interface TireSelectionStepProps {
  onSelect: (tires: string[]) => void;
}

export function TireSelectionStep({ onSelect }: TireSelectionStepProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    const newSelected = selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id];
    setSelected(newSelected);

    // Auto-advance when 1 tire is selected (simplified for MVP)
    if (newSelected.length === 1) {
      setTimeout(() => onSelect(newSelected), 500);
    }
  };

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
          TIRE STRATEGY
        </h1>
        <p className="text-[var(--text-secondary)] text-lg">SELECT YOUR OPENING COMPOUND</p>
      </motion.div>

      {/* Tire dock */}
      <motion.div
        className="flex gap-6 justify-center flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {COMPOUNDS.map((compound, i) => (
          <TireCard
            key={compound.id}
            compound={compound}
            isSelected={selected.includes(compound.id)}
            onSelect={handleSelect}
            index={i}
          />
        ))}
      </motion.div>

      {/* Info */}
      <motion.p
        className="text-center text-[var(--text-secondary)] max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        The strategy optimizer will calculate pit stops based on your tire choice, circuit characteristics, and weather conditions.
      </motion.p>
    </div>
  );
}

function TireCard({
  compound,
  isSelected,
  onSelect,
  index,
}: {
  compound: { id: string; name: string; color: string; grip: number; deg: number; stint: string };
  isSelected: boolean;
  onSelect: (id: string) => void;
  index: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: isSelected ? 0 : -16, scale: 1.08 }}
      onClick={() => onSelect(compound.id)}
      className="relative w-40 rounded-xl overflow-hidden group focus:outline-none focus-visible:ring-2 transition-all"
      style={{
        backgroundColor: 'var(--bg-elevated)',
        borderColor: isSelected ? compound.color : 'var(--border-default)',
        borderWidth: '2px',
      }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0"
        animate={isSelected ? { opacity: 0.2 } : { opacity: 0 }}
        style={{ backgroundColor: compound.color }}
        transition={{ duration: 0.3 }}
      />

      {/* Content */}
      <div className="relative p-6 flex flex-col items-center gap-4 h-64 justify-between z-10">
        {/* Tire symbol */}
        <motion.div
          className="text-6xl"
          animate={isSelected ? { scale: 1.2 } : { scale: 1 }}
          style={{
            color: compound.color,
            textShadow: isSelected ? `0 0 20px ${compound.color}` : 'none',
          }}
        >
          🔴
        </motion.div>

        {/* Name */}
        <div className="text-center">
          <div
            className="text-xl font-black tracking-wider"
            style={{
              fontFamily: 'var(--font-display)',
              color: compound.color,
            }}
          >
            {compound.id}
          </div>
          <div className="text-xs text-[var(--text-secondary)]">{compound.name}</div>
        </div>

        {/* Stats */}
        <div className="space-y-1 text-xs w-full">
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">GRIP</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: i < compound.grip ? compound.color : 'var(--border-default)',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-secondary)]">DEG</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: i < compound.deg ? compound.color : 'var(--border-default)',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="text-center text-[var(--accent-cyan)] pt-2">
            {compound.stint}L
          </div>
        </div>
      </div>

      {/* Selection ring */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: isSelected ? `inset 0 0 0 2px ${compound.color}, 0 0 20px ${compound.color}66` : 'none',
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
}
