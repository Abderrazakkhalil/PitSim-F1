'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DotRating } from '@/components/common/DotRating';

const COMPOUNDS = [
  {
    id: 'H',
    name: 'Hard',
    fullName: 'C1 Hard',
    color: '#E8E8E8',
    glowColor: 'rgba(232,232,232,0.3)',
    grip: 4,
    deg: 2,
    stint: '25-35',
    tempRange: '75C - 90C',
    strategy: 'Lowest degradation. Long stints or low-temp conditions.',
    imagePath: '/tires/tire-hard.png',
  },
  {
    id: 'M',
    name: 'Medium',
    fullName: 'C3 Medium',
    color: '#FFD700',
    glowColor: 'rgba(255,215,0,0.3)',
    grip: 6,
    deg: 5,
    stint: '18-25',
    tempRange: '85C - 105C',
    strategy: 'Balanced compound. Optimal for most circuits.',
    imagePath: '/tires/tire-medium.png',
  },
  {
    id: 'S',
    name: 'Soft',
    fullName: 'C5 Soft',
    color: '#FF1E1E',
    glowColor: 'rgba(255,30,30,0.3)',
    grip: 9,
    deg: 8,
    stint: '10-18',
    tempRange: '95C - 115C',
    strategy: 'Best qualifying pace. Short-stint advantage.',
    imagePath: '/tires/tire-soft.png',
  },
  {
    id: 'I',
    name: 'Intermediate',
    fullName: 'Intermediate',
    color: '#39B54A',
    glowColor: 'rgba(57,181,74,0.3)',
    grip: 6,
    deg: 3,
    stint: '20-40',
    tempRange: '12C - 25C',
    strategy: 'Wet conditions bridge between slicks and full wets.',
    imagePath: '/tires/tire-intermediate.png',
  },
  {
    id: 'W',
    name: 'Wet',
    fullName: 'Full Wet',
    color: '#0067FF',
    glowColor: 'rgba(0,103,255,0.3)',
    grip: 5,
    deg: 2,
    stint: '30-50',
    tempRange: '5C - 15C',
    strategy: 'Heavy rain only. Maximum water evacuation.',
    imagePath: '/tires/tire-wet.png',
  },
];

type Compound = (typeof COMPOUNDS)[number];

interface TireSelectionStepProps {
  onSelect: (tires: string[]) => void;
}

export function TireSelectionStep({ onSelect }: TireSelectionStepProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    setTimeout(() => onSelect([id]), 800);
  };

  const conditionMap: Record<string, string> = {
    H: 'Dry Condition',
    M: 'Dry Condition',
    S: 'Dry Condition',
    I: 'Wet Condition',
    W: 'Extreme Wet',
  };

  return (
    <div
      className="w-full overflow-hidden flex flex-col"
      style={{ minHeight: 'calc(100vh - var(--header-height))' }}
    >
      {/* Title Section */}
      <motion.div
        className="px-8 pt-12 pb-6 text-center shrink-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-hero mb-3">SELECT STARTING COMPOUND</h1>
        <p className="text-label" style={{ letterSpacing: '0.18em' }}>
          SELECT YOUR OPENING COMPOUND
        </p>
      </motion.div>

      {/* MAIN PAGE WRAPPER: Centers everything vertically */}
      <div className="w-full flex-1 flex flex-col justify-center items-center py-12">
        
        {/* CARD ROW: gap-8 ensures distinct separation between pillars */}
        <div className="flex flex-row flex-wrap justify-center items-center gap-6 w-full max-w-[1400px] mx-auto mt-8">
          
          {/* MAP OVER TIRES HERE. Exact Card Skeleton: */}
          {COMPOUNDS.map((tire, index) => {
            const isSelected = selected === tire.id;
            const condition = conditionMap[tire.id];
            
            return (
              <motion.div 
                key={tire.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, y: isSelected ? -24 : 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(tire.id)}
                whileHover={{ y: -24, transition: { duration: 0.3, ease: "easeOut" } }}
                className={`group relative w-[240px] h-[480px] flex flex-col justify-between p-6 rounded-2xl backdrop-blur-xl bg-zinc-950/80 border border-white/10 cursor-pointer overflow-hidden z-10 hover:z-30 shadow-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] hover:bg-zinc-900/90 pointer-events-auto ${isSelected ? 'border-white/40 shadow-[0_20px_40px_rgba(0,0,0,0.5)] bg-zinc-900/90 z-30' : ''}`}
                style={{
                  borderColor: isSelected ? tire.color : undefined,
                  boxShadow: isSelected ? `inset 0 0 50px ${tire.color}25, 0 0 20px ${tire.color}40` : undefined,
                }}
              >
                
                {/* Dynamic Hover Glow using the tire.color */}
                <div 
                  className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} 
                  style={{ background: `radial-gradient(circle at center, ${tire.color}25 0%, transparent 70%)` }} 
                />

                {/* TOP: Condition (Increased Font Size) */}
                <div className="text-center w-full relative z-10 shrink-0 mb-4">
                  <span className="text-xs text-zinc-400 tracking-widest uppercase font-bold">{condition}</span>
                </div>

                {/* MIDDLE: Image & Titles */}
                <div className="flex flex-col items-center justify-center flex-1 w-full relative z-10">
                  
                  {/* TIRE IMAGE (No hover animation here, just the blend mode) */}
                  <div className="relative w-40 h-40 mb-8 flex items-center justify-center z-20">
                    <img 
                      src={tire.imagePath} 
                      alt={tire.name} 
                      className="relative w-full h-full object-contain mix-blend-lighten drop-shadow-2xl"
                    />
                  </div>

                  {/* Titles (Increased Font Size) */}
                  <h3 className="text-3xl font-black text-white tracking-wider uppercase mb-3">{tire.name}</h3>
                  <span 
                    className="text-xs font-mono px-4 py-1.5 rounded-full bg-zinc-900 border border-white/20 tracking-widest uppercase" 
                    style={{ color: tire.color }}
                  >
                    {tire.fullName}
                  </span>
                </div>

                {/* BOTTOM: Description (Increased Font Size & Readable Font) */}
                <div className="w-full pt-6 border-t border-white/10 relative z-10 shrink-0 min-h-[100px] flex items-center justify-center">
                  <p className="text-sm text-zinc-300 text-center leading-relaxed font-sans normal-case tracking-normal">
                    {tire.strategy}
                  </p>
                </div>

              </motion.div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
