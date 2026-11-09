'use client';

import { MotionConfig } from 'framer-motion';
import { WishlistProvider } from './WishlistContext';

/**
 * Client providers. `reducedMotion="user"` makes every Framer Motion
 * animation honour the OS "reduce motion" setting automatically.
 */
export default function Providers({ children, accountKey }: { children: React.ReactNode; accountKey: string | null }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <WishlistProvider accountKey={accountKey}>{children}</WishlistProvider>
    </MotionConfig>
  );
}
