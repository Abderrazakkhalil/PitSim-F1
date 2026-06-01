'use client';

import { motion } from 'framer-motion';

interface HeaderProps {
  currentStep: number;
  selectedTeam?: { name: string; slug: string; primaryColor: string };
  selectedCircuit?: { name: string; country: string };
  onStepClick?: (step: number) => void;
}

const STEP_LABELS = ['TEAM', 'CIRCUIT', 'TIRES', 'RESULT'];

export function Header({ currentStep, selectedTeam, selectedCircuit, onStepClick }: HeaderProps) {
  const teamColor = selectedTeam?.primaryColor || 'var(--accent-cyan)';

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 w-full"
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'rgba(5, 7, 9, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-default)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full h-full px-[5%] flex items-center justify-between">
        {/* Left Section: Logo */}
        <div className="flex-1 flex justify-start items-center">
          <motion.div
            style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'baseline', gap: '4px' }}
          initial={{ opacity: 0, letterSpacing: '-0.1em' }}
          animate={{ opacity: 1, letterSpacing: '0.08em' }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span style={{ fontSize: '22px', fontWeight: 900, color: 'white' }}>PITSIM</span>
          <span style={{ fontSize: '22px', fontWeight: 900, color: teamColor, transition: 'color 600ms ease' }}>
            {' '}&middot; F1
          </span>
          </motion.div>
        </div>

        {/* Center Section: Navigation Pills */}
        <div className="shrink-0 flex justify-center items-center">
          <div className="flex gap-8 items-center justify-center">
            {STEP_LABELS.map((label, i) => {
              const isComplete = i < currentStep;
              const isActive = i === currentStep;
              const isPending = i > currentStep;
              const canClick = isComplete && onStepClick;

              return (
                <div key={i} className="flex items-center gap-3">
                  <motion.button
                    onClick={() => canClick && onStepClick(i)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                    style={{
                      cursor: canClick ? 'pointer' : 'default',
                      backgroundColor: isActive
                        ? `${teamColor}20`
                        : isComplete
                        ? `${teamColor}10`
                        : 'rgba(255,255,255,0.03)',
                      border: isActive
                        ? `1.5px solid ${teamColor}`
                        : isComplete
                        ? `1.5px solid ${teamColor}60`
                        : '1.5px solid rgba(255,255,255,0.08)',
                      transition: 'all 400ms ease',
                    }}
                    whileHover={canClick ? { scale: 1.05 } : {}}
                  >
                    {/* Step indicator */}
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontFamily: 'var(--font-data)',
                        fontWeight: 700,
                        backgroundColor: isComplete
                          ? teamColor
                          : isActive
                          ? `${teamColor}40`
                          : 'rgba(255,255,255,0.06)',
                        color: isComplete ? '#000' : isActive ? 'white' : 'rgba(255,255,255,0.3)',
                        transition: 'all 400ms ease',
                      }}
                    >
                      {isComplete ? (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>

                    {/* Label */}
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: isActive
                          ? 'white'
                          : isComplete
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(255,255,255,0.25)',
                        transition: 'color 400ms ease',
                      }}
                    >
                      {label}
                    </span>
                  </motion.button>

                  {/* Connector line between steps */}
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      style={{
                        width: 32,
                        height: 1,
                        backgroundColor: isComplete ? `${teamColor}60` : 'rgba(255,255,255,0.08)',
                        transition: 'background-color 400ms ease',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section: Breadcrumb Pills & Run Button */}
        <div className="flex-1 flex flex-row justify-end items-center shrink-0" style={{ gap: '16px' }}>
          {selectedTeam && (
            <motion.div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: `${selectedTeam.primaryColor}15`,
                border: `1px solid ${selectedTeam.primaryColor}40`,
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: selectedTeam.primaryColor,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {selectedTeam.name.split(' ').pop()?.toUpperCase()}
              </span>
            </motion.div>
          )}

          {selectedCircuit && (
            <motion.div
              className="flex items-center gap-2 px-4 py-1.5 rounded-full shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: 'rgba(0, 229, 255, 0.08)',
                border: '1px solid rgba(0, 229, 255, 0.25)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {selectedCircuit.name.toUpperCase()}
              </span>
            </motion.div>
          )}

          {/* Run Sim Button */}
          <motion.button
            className="px-6 py-2 rounded-md shrink-0 whitespace-nowrap"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              fontWeight: 900,
              letterSpacing: '0.1em',
              backgroundColor: currentStep >= 3 ? teamColor : 'rgba(255,255,255,0.06)',
              color: currentStep >= 3 ? '#000' : 'rgba(255,255,255,0.25)',
              cursor: currentStep >= 3 ? 'pointer' : 'not-allowed',
              border: currentStep >= 3 ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: currentStep >= 3 ? `0 0 20px ${teamColor}40` : 'none',
              transition: 'all 400ms ease',
            }}
            whileHover={currentStep >= 3 ? { scale: 1.05, boxShadow: `0 0 30px ${teamColor}60` } : {}}
            whileTap={currentStep >= 3 ? { scale: 0.98 } : {}}
            animate={
              currentStep >= 3
                ? {
                    boxShadow: [
                      `0 0 20px ${teamColor}40`,
                      `0 0 35px ${teamColor}60`,
                      `0 0 20px ${teamColor}40`,
                    ],
                  }
                : {}
            }
            transition={currentStep >= 3 ? { duration: 2, repeat: Infinity } : {}}
          >
            RUN SIM
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
