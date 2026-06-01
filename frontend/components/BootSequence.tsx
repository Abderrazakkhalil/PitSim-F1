'use client';

import { motion } from 'framer-motion';
import { bootSequence } from '@/lib/motionVariants';

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  return (
    <motion.div
      className="fixed inset-0 bg-[var(--bg-void)] z-[999] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.3 }}
      onAnimationComplete={onComplete}
    >
      {/* Scan line */}
      <motion.div
        className="absolute inset-0 w-full h-1 bg-gradient-to-b from-transparent via-[var(--accent-cyan)] to-transparent"
        initial={{ y: '-100%' }}
        animate={{ y: '100vh' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Frame 1-2: Wordmark with oscilloscope effect */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          className="text-6xl font-black tracking-[0.2em]"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.08, delayChildren: 0.3 }}
        >
          {['P', 'I', 'T', 'S', 'I', 'M'].map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, letterSpacing: '-0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.1em' }}
              transition={{ duration: 0.4 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
        <motion.div
          className="text-3xl mt-2 text-[var(--accent-red)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          -F1
        </motion.div>
      </motion.div>

      {/* Frame 2: Telemetry readout (atmospheric) */}
      <motion.div
        className="text-xs font-mono tracking-wider text-[var(--text-muted)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div className="flex gap-8">
          <div>RPM <span className="text-[var(--accent-red)]">12,847</span></div>
          <div>G-FORCE <span className="text-[var(--accent-yellow)]">4.2</span></div>
          <div>TIRE TEMP <span className="text-[var(--accent-cyan)]">98°C</span></div>
        </div>
      </motion.div>

      {/* Skip button */}
      <motion.button
        className="absolute top-8 right-8 text-sm tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
        onClick={onComplete}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        [▶ SKIP]
      </motion.button>
    </motion.div>
  );
}
