'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundSystem } from '@/components/shell/BackgroundSystem';
import { Header } from '@/components/shell/Header';
import { BootSequence } from '@/components/BootSequence';
import { TeamSelectionStep } from '@/components/steps/TeamSelectionStep';
import { CircuitSelectionStep } from '@/components/steps/CircuitSelectionStep';
import { TireSelectionStep } from '@/components/steps/TireSelectionStep';
import { ResultsDashboard } from '@/components/steps/ResultsDashboard';
import { stepTransition } from '@/lib/motionVariants';
import type { TeamTheme } from '@/lib/teamThemes';

export default function Home() {
  const [showBoot, setShowBoot] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamTheme | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<{ id: number; name: string; country: string } | null>(null);
  const [selectedTires, setSelectedTires] = useState<string[] | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBoot(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleBootComplete = () => {
    setShowBoot(false);
  };

  const handleTeamSelect = (team: TeamTheme) => {
    setSelectedTeam(team);
    setCurrentStep(1);
  };

  const handleCircuitSelect = (circuit: { id: number; name: string; country: string }) => {
    setSelectedCircuit(circuit);
    setCurrentStep(2);
  };

  const handleTireSelect = (tires: string[]) => {
    setSelectedTires(tires);
    setCurrentStep(3);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <BackgroundSystem teamColor={selectedTeam?.primaryColor}>
      {/* Boot sequence overlay */}
      <AnimatePresence>
        {showBoot && <BootSequence onComplete={handleBootComplete} />}
      </AnimatePresence>

      {/* Main content */}
      <motion.div
        className="relative z-10 w-full h-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: showBoot ? 0.2 : 1 }}
        transition={{ duration: 0.3 }}
        style={{ pointerEvents: showBoot ? 'none' : 'auto' }}
      >
        {/* Header */}
        <Header
          currentStep={currentStep}
          selectedTeam={
            selectedTeam
              ? { name: selectedTeam.name, slug: selectedTeam.slug, primaryColor: selectedTeam.primaryColor }
              : undefined
          }
          selectedCircuit={selectedCircuit ? { name: selectedCircuit.name, country: selectedCircuit.country } : undefined}
          onStepClick={handleStepClick}
        />

        {/* Content area */}
        <main className="relative z-20 pointer-events-auto w-full h-screen overflow-hidden" style={{ paddingTop: 'var(--header-height)' }}>
          <AnimatePresence mode="wait">
            {/* Step 1: Team Selection */}
            {currentStep === 0 && (
              <motion.div
                key="team"
                className="w-full h-full"
                initial={stepTransition.enter}
                animate={stepTransition.center}
                exit={stepTransition.exit}
              >
                <TeamSelectionStep onSelect={handleTeamSelect} />
              </motion.div>
            )}

            {/* Step 2: Circuit Selection */}
            {currentStep === 1 && selectedTeam && (
              <motion.div
                key="circuit"
                className="w-full h-full"
                initial={stepTransition.enter}
                animate={stepTransition.center}
                exit={stepTransition.exit}
              >
                <CircuitSelectionStep onSelect={handleCircuitSelect} />
              </motion.div>
            )}

            {/* Step 3: Tire Selection */}
            {currentStep === 2 && selectedTeam && selectedCircuit && (
              <motion.div
                key="tires"
                className="w-full h-full"
                initial={stepTransition.enter}
                animate={stepTransition.center}
                exit={stepTransition.exit}
              >
                <TireSelectionStep onSelect={handleTireSelect} />
              </motion.div>
            )}

            {/* Step 4: Results */}
            {currentStep === 3 && selectedTeam && selectedCircuit && selectedTires && (
              <motion.div
                key="results"
                className="w-full h-full"
                initial={stepTransition.enter}
                animate={stepTransition.center}
                exit={stepTransition.exit}
              >
                <ResultsDashboard
                  team={selectedTeam}
                  circuit={selectedCircuit}
                  tires={selectedTires}
                  onReset={() => {
                    setCurrentStep(0);
                    setSelectedTeam(null);
                    setSelectedCircuit(null);
                    setSelectedTires(null);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </BackgroundSystem>
  );
}
