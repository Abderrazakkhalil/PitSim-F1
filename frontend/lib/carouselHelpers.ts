// Carousel helpers and utilities for 3-card focal layout

export type CarouselPosition = 'previous' | 'active' | 'next' | 'hidden';

export function getCarouselPosition(itemIndex: number, activeIndex: number, totalItems: number): CarouselPosition {
  if (itemIndex === activeIndex) return 'active';
  
  const prevIndex = (activeIndex - 1 + totalItems) % totalItems;
  if (itemIndex === prevIndex) return 'previous';
  
  const nextIndex = (activeIndex + 1) % totalItems;
  if (itemIndex === nextIndex) return 'next';
  
  return 'hidden';
}

export const carouselPositionVariants = {
  previous: {
    x: '-55%',
    scale: 0.72,
    filter: 'blur(1.5px) brightness(0.38)',
    opacity: 0.5,
    zIndex: 1,
  },
  active: {
    x: 0,
    scale: 1,
    filter: 'blur(0px) brightness(1)',
    opacity: 1,
    zIndex: 10,
  },
  next: {
    x: '55%',
    scale: 0.72,
    filter: 'blur(1.5px) brightness(0.38)',
    opacity: 0.5,
    zIndex: 1,
  },
  hidden: {
    x: 0,
    scale: 0,
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 0,
  },
};

export const carouselTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 32,
};
