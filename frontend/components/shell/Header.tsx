'use client';

import { motion } from 'framer-motion';

interface HeaderProps {
  currentStep: number;
  selectedTeam?: { name: string; slug: string; primaryColor: string };
  selectedCircuit?: { name: string; country: string };
}

export function Header({ currentStep, selectedTeam, selectedCircuit }: HeaderProps) {
  const steps = ['Team Selection', 'Circuit Intelligence', 'Tire Strategy', 'Strategy Analysis'];

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 h-[var(--header-height)] bg-[var(--bg-primary)] border-b border-[var(--border-default)] backdrop-blur-sm z-50"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="h-full px-8 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="text-2xl font-bold tracking-widest"
          style={{ fontFamily: 'var(--font-display)' }}
          initial={{ opacity: 0, letterSpacing: '-0.1em' }}
          animate={{ opacity: 1, letterSpacing: '0.1em' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-[var(--accent-cyan)]">PIT</span>
          <span className="text-[var(--accent-red)]">SIM</span>
          <span className="text-[var(--text-primary)]">-F1</span>
        </motion.div>

        {/* Step indicator with progress */}
        <div className="flex-1 mx-16">
          <div className="flex gap-2 items-center">
            {steps.map((step, i) => (
              <motion.div key={i} className="flex-1 flex flex-col gap-1">
                <div
                  className="h-1 bg-[var(--border-default)] rounded-full overflow-hidden"
                  style={{ backgroundColor: i < currentStep ? 'var(--accent-cyan)' : 'var(--border-default)' }}
                >
                  <motion.div
                    className="h-full bg-[var(--accent-cyan)]"
                    initial={{ width: i < currentStep ? '100%' : '0%' }}
                    animate={{ width: i < currentStep ? '100%' : i === currentStep ? '50%' : '0%' }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span
                  className="text-xs uppercase tracking-wider text-[var(--text-secondary)] text-center"
                  style={{ fontSize: '0.6875rem', letterSpacing: '0.1em' }}
                >
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Breadcrumb pills */}
        <div className="flex gap-2 items-center">
          {selectedTeam && (
            <motion.div
              className="px-4 py-2 rounded-full border border-[var(--border-default)] text-sm"
              style={{
                backgroundColor: `${selectedTeam.primaryColor}20`,
                borderColor: selectedTeam.primaryColor,
                color: 'var(--text-primary)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ●{selectedTeam.name}
            </motion.div>
          )}
          {selectedCircuit && (
            <motion.div
              className="px-4 py-2 rounded-full border border-[var(--border-default)] text-sm"
              style={{
                backgroundColor: 'rgba(0, 229, 255, 0.1)',
                borderColor: 'var(--accent-cyan)',
                color: 'var(--text-primary)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {selectedCircuit.name}
            </motion.div>
          )}

          {/* Run simulation button */}
          <motion.button
            className="px-6 py-2 rounded-md font-bold uppercase tracking-wider text-sm btn-glow"
            style={{
              backgroundColor: currentStep === 3 ? 'var(--accent-red)' : 'var(--border-default)',
              color: 'var(--bg-void)',
              cursor: currentStep === 3 ? 'pointer' : 'not-allowed',
              opacity: currentStep === 3 ? 1 : 0.5,
            }}
            whileHover={currentStep === 3 ? { scale: 1.05 } : {}}
            whileTap={currentStep === 3 ? { scale: 0.98 } : {}}
          >
            ▶ Run
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
