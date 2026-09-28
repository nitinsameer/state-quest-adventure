/**
 * AnimationWrapper Component
 * 
 * Provides a safe wrapper for all Framer Motion animations.
 * Respects prefers-reduced-motion accessibility preference (WCAG 2.3.3).
 * 
 * Usage:
 * ```tsx
 * <AnimationWrapper
 *   initial={{ opacity: 0, y: 20 }}
 *   animate={{ opacity: 1, y: 0 }}
 *   transition={{ duration: 0.3 }}
 * >
 *   <div>Content</div>
 * </AnimationWrapper>
 * ```
 */

import { motion, type HTMLMotionProps } from 'framer-motion';
import { ReactNode, useMemo } from 'react';

interface AnimationWrapperProps {
  children: ReactNode;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  className?: string;
  style?: React.CSSProperties;
  as?: 'div' | 'span' | 'button' | 'p' | 'li' | 'section';
}

export function AnimationWrapper({
  children,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  exit = { opacity: 0 },
  transition = { duration: 0.3 },
  className = '',
  style = {},
  as = 'div',
}: AnimationWrapperProps) {
  // Check if user prefers reduced motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // If user prefers reduced motion, render without animations
  if (prefersReducedMotion) {
    const motionComponent = motion[as as keyof typeof motion] as any;
    return (
      <motionComponent className={className} style={style}>
        {children}
      </motionComponent>
    );
  }

  // Otherwise, render with full animations
  const motionComponent = motion[as as keyof typeof motion] as any;
  return (
    <motionComponent
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
      style={style}
    >
      {children}
    </motionComponent>
  );
}

/**
 * Common animation presets for kids app
 */

export const animationPresets = {
  // Page/Screen entrance (fade + slide)
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  // Stat card entrance (staggered for multiple cards)
  statCardEnter: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Modal entrance (fade + scale)
  modalEnter: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -10 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },

  // Badge pop-up (celebration)
  badgePopUp: {
    initial: { opacity: 0, scale: 0, rotate: -180 },
    animate: { opacity: 1, scale: 1, rotate: 0 },
    exit: { opacity: 0, scale: 0, rotate: 180 },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }, // spring
  },

  // Button tap feedback (scale + fade)
  buttonTap: {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileTap: { scale: 0.95 },
    whileHover: { scale: 1.02 },
  },

  // Loading pulse
  loadingPulse: {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },

  // Progress bar fill
  progressFill: {
    initial: { width: 0 },
    animate: { width: '100%' },
    transition: { duration: 0.8, ease: 'easeOut' },
  },

  // Celebration bounce (for rewards)
  celebrationBounce: {
    initial: { scale: 0.8, y: 0 },
    animate: {
      scale: [0.8, 1.1, 1],
      y: [0, -20, 0],
    },
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }, // spring
  },
};

/**
 * Container for staggered animations (multiple children)
 * Usage: Wrap multiple animated children to stagger their entrance
 */
interface StaggerContainerProps {
  children: ReactNode;
  delay?: number;
  delayBetween?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  delay = 0,
  delayBetween = 0.1,
  className = '',
}: StaggerContainerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: delayBetween,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
