export const spring = {
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 25 },
  floaty: { type: 'spring' as const, stiffness: 80, damping: 15 },
  carousel: { type: 'spring' as const, stiffness: 280, damping: 32 },
};

export const cardEntrance = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ...spring.smooth, delay: i * 0.07 },
  }),
};

export const stepTransition = {
  enter: { opacity: 0, scale: 0.96, filter: 'blur(8px)' },
  center: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 200, damping: 28 },
  },
  exit: {
    opacity: 0,
    scale: 1.04,
    filter: 'blur(4px)',
    transition: { duration: 0.25 },
  },
};

export const carouselCardVariants = {
  inactive: {
    scale: 0.72,
    filter: 'blur(1.5px) brightness(0.38)',
    opacity: 0.5,
  },
  active: {
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    opacity: 1,
    transition: { type: 'spring' as const, stiffness: 280, damping: 32 },
  },
};

export const bootSequence = {
  scanLine: {
    initial: { y: '-100%' },
    animate: { y: '100vh', transition: { duration: 0.8, ease: 'easeInOut' } },
  },
  wordmark: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        delay: 0.2,
        staggerChildren: 0.05,
      },
    },
  },
  letter: {
    hidden: { opacity: 0, letterSpacing: '-0.1em' },
    visible: { opacity: 1, letterSpacing: '0.1em' },
  },
  telemetry: {
    hidden: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: 0.8 },
  },
  gridSnapIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 1.8 } },
  },
};

export const hoverLift = {
  scale: 1.04,
  y: -8,
  transition: spring.smooth,
};

// Fixed: panelStagger is now a proper Framer Motion variant object
// that works with the `custom` prop, not a function
export const panelStagger = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.12,
      type: 'spring' as const,
      stiffness: 240,
      damping: 30,
    },
  }),
};

export const glowPulse = {
  animate: {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 3, repeat: Infinity },
  },
};

export const selectPulse = {
  boxShadow: [
    '0 0 0px rgba(255,30,30,0)',
    '0 0 20px rgba(255,30,30,0.5)',
    '0 0 10px rgba(255,30,30,0.3)',
  ],
};
