'use client';

import { motion } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
      style={{ backgroundColor: 'var(--bg-void)' }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 2.3 }}
      onAnimationComplete={onComplete}
    >
      {/* Scan line */}
      <motion.div
        className="absolute inset-x-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
          boxShadow: '0 0 20px var(--accent-cyan)',
        }}
        initial={{ y: '-100vh' }}
        animate={{ y: '100vh' }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      />

      {/* Wordmark */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 8vw, 72px)',
            fontWeight: 900,
            letterSpacing: '0.2em',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.08, delayChildren: 0.3 }}
        >
          {['P', 'I', 'T', 'S', 'I', 'M'].map((letter, i) => (
            <motion.span
              key={i}
              className="inline-block"
              style={{ color: 'white' }}
              initial={{ opacity: 0, letterSpacing: '-0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.1em' }}
              transition={{ duration: 0.4 }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
        <motion.div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            marginTop: '4px',
            color: 'var(--accent-red)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.8 }}
        >
          F1
        </motion.div>
      </motion.div>

      {/* Telemetry readout */}
      <motion.div
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: '13px',
          letterSpacing: '0.1em',
          color: 'var(--text-muted)',
        }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      >
        <div className="flex gap-8">
          <div>
            RPM <span style={{ color: 'var(--accent-red)' }}>12,847</span>
          </div>
          <div>
            G-FORCE <span style={{ color: 'var(--accent-yellow)' }}>4.2</span>
          </div>
          <div>
            TIRE TEMP <span style={{ color: 'var(--accent-cyan)' }}>98 C</span>
          </div>
        </div>
      </motion.div>

      {/* Skip button */}
      <motion.button
        className="absolute top-8 right-8 px-4 py-2 rounded-md"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: 'var(--text-secondary)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          cursor: 'pointer',
        }}
        onClick={onComplete}
        whileHover={{
          scale: 1.05,
          color: 'var(--accent-cyan)',
          borderColor: 'rgba(0,229,255,0.3)',
        }}
        whileTap={{ scale: 0.95 }}
      >
        SKIP
      </motion.button>
    </motion.div>
  );
}
