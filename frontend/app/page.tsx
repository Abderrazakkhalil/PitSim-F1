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
import { spring } from '@/lib/motionVariants';
import type { TeamTheme } from '@/lib/teamThemes';

export default function Home() {
  const [showBoot, setShowBoot] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState<TeamTheme | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<{ id: number; name: string; country: string } | null>(null);
  const [selectedTires, setSelectedTires] = useState<string[] | null>(null);

  useEffect(() => {
    // Automatically hide boot sequence after 2.5 seconds if not already skipped
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

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background system */}
      <BackgroundSystem />

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
          selectedTeam={selectedTeam ? { name: selectedTeam.name, slug: selectedTeam.slug, primaryColor: selectedTeam.primaryColor } : undefined}
          selectedCircuit={selectedCircuit ? { name: selectedCircuit.name, country: selectedCircuit.country } : undefined}
        />

        {/* Content area */}
        <main className="relative pt-[var(--header-height)] w-full h-screen overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Team Selection */}
            {currentStep === 0 && (
              <motion.div key="team" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={spring.smooth}>
                <TeamSelectionStep onSelect={handleTeamSelect} />
              </motion.div>
            )}

            {/* Step 2: Circuit Selection */}
            {currentStep === 1 && selectedTeam && (
              <motion.div key="circuit" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={spring.smooth}>
                <CircuitSelectionStep onSelect={handleCircuitSelect} />
              </motion.div>
            )}

            {/* Step 3: Tire Selection */}
            {currentStep === 2 && selectedTeam && selectedCircuit && (
              <motion.div key="tires" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={spring.smooth}>
                <TireSelectionStep onSelect={handleTireSelect} />
              </motion.div>
            )}

            {/* Step 4: Results */}
            {currentStep === 3 && selectedTeam && selectedCircuit && selectedTires && (
              <motion.div key="results" initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={spring.smooth}>
                <ResultsDashboard team={selectedTeam} circuit={selectedCircuit} tires={selectedTires} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}
