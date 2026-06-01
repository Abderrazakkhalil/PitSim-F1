export const spring = {
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 25 },
  floaty: { type: 'spring' as const, stiffness: 80, damping: 15 },
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
  enter: { opacity: 0, x: 60 },
  center: { opacity: 1, x: 0, transition: spring.smooth },
  exit: { opacity: 0, x: -40, transition: { duration: 0.2 } },
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

export const selectPulse = {
  boxShadow: [
    '0 0 0px rgba(255,30,30,0)',
    '0 0 20px rgba(255,30,30,0.5)',
    '0 0 10px rgba(255,30,30,0.3)',
  ],
};
