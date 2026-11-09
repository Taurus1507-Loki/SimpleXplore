import NextImage, { type ImageProps } from 'next/image';
import { OPTIMIZED_IMAGE_HOSTS } from '../../image-hosts.mjs';

function hostAllowed(hostname: string): boolean {
  return OPTIMIZED_IMAGE_HOSTS.some((pattern) =>
    pattern.startsWith('*.') ? hostname.endsWith(pattern.slice(1)) && hostname !== pattern.slice(2) : hostname === pattern
  );
}

/** True when the server-side image optimizer may fetch this URL. */
export function isOptimizableImage(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return true; // static imports
  if (src.startsWith('/')) return !src.startsWith('/uploads/'); // runtime uploads are served as-is
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && hostAllowed(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Drop-in replacement for next/image: images from hosts outside the allow-list are
 * shown unoptimized (the browser loads them) so the server never fetches unknown URLs
 * and the page never crashes on an unlisted retailer CDN.
 */
export default function SafeImage(props: ImageProps) {
  return <NextImage {...props} unoptimized={props.unoptimized || !isOptimizableImage(props.src)} />;
}
