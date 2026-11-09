import { OPTIMIZED_IMAGE_HOSTS } from './image-hosts.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Only these HTTPS hosts go through the server-side optimizer (see image-hosts.mjs).
    remotePatterns: OPTIMIZED_IMAGE_HOSTS.map((hostname) => ({ protocol: 'https', hostname })),
    // Keep the optimizer's disk cache bounded.
    minimumCacheTTL: 60 * 60 * 24,
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
