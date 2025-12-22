/**
 * Animation Configuration
 * -----------------------
 * Centralized motion variants for consistency across the application.
 * Uses framer-motion for performant, declarative animations.
 */

// Staggered container animation
export const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Item entry animation (Fade Up)
export const fadeInUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // Smooth ease-out
    },
  },
};

// Card hover effect
export const cardHoverVariants = {
  hover: {
    y: -4,
    transition: { type: "spring", stiffness: 400, damping: 20 },
  },
  tap: { scale: 0.98 },
};

// Simple fade in
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
};

// Chart content transition (saat switch tab)
export const chartContentVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 },
  },
};
