import Link from 'next/link';

interface LogoProps {
  tone?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
}

export function LogoMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="16" className="fill-brand-600" />
      <path
        d="M41.5 21.5c-2.4-2.6-5.7-4-9.6-4-5.9 0-10 3.3-10 8 0 4.6 3.6 6.6 9.3 7.9 4.6 1.1 6 2 6 3.9 0 2-2 3.4-5.2 3.4-3.4 0-6.2-1.5-8.3-4l-4 4.1c2.8 3.4 7 5.5 12.2 5.5 6.7 0 11.4-3.6 11.4-8.9 0-4.8-3.2-6.9-9.4-8.3-4.4-1-5.9-1.8-5.9-3.6 0-1.7 1.7-2.9 4.3-2.9 2.6 0 4.7 1 6.4 2.9l2.8-4z"
        fill="#fff"
      />
      <circle cx="47" cy="45" r="4" fill="#F2B33D" />
    </svg>
  );
}

export default function Logo({ tone = 'dark', showTagline = true, className = '' }: LogoProps) {
  const word = tone === 'dark' ? 'text-ink' : 'text-white';
  const accent = tone === 'dark' ? 'text-brand-600' : 'text-brand-300';
  const tag = tone === 'dark' ? 'text-copy-muted' : 'text-white/60';

  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label="SimpleXplore home">
      <LogoMark className="w-9 h-9 transition-transform duration-300 ease-out-expo group-hover:-rotate-6" />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.375rem] font-extrabold tracking-tightest ${word}`}>
          Simple<span className={accent}>Xplore</span>
        </span>
        {showTagline && (
          <span className={`mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.14em] sm:block ${tag}`}>
            Shop Smart • Explore More
          </span>
        )}
      </span>
    </Link>
  );
}
