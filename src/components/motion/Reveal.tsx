'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } },
};

/**
 * Section-level scroll reveal. Plays once; individual product cards are
 * intentionally not faded in on scroll (keeps grids scannable).
 */
export function Reveal({ children, delay = 0, ...rest }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -60px 0px' }}
      variants={revealVariants}
      transition={{ delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
};

/** Staggered entrance that plays on mount (used for the hero). */
export function StaggerGroup({ children, ...rest }: HTMLMotionProps<'div'>) {
  return (
    <motion.div initial="hidden" animate="visible" variants={groupVariants} {...rest}>
      {children}
    </motion.div>
  );
}

const slideOnlyVariants: Variants = {
  hidden: { y: 14 },
  visible: { y: 0, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
};

/**
 * `fade={false}` keeps the element visible from first paint (transform only),
 * so LCP candidates like the hero headline are never rendered at opacity 0.
 */
export function StaggerItem({ children, fade = true, ...rest }: HTMLMotionProps<'div'> & { fade?: boolean }) {
  return (
    <motion.div variants={fade ? itemVariants : slideOnlyVariants} {...rest}>
      {children}
    </motion.div>
  );
}
