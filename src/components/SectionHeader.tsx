import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export default function SectionHeader({ id, eyebrow, title, description, href, linkLabel = 'View all' }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">{eyebrow}</p>
        )}
        <h2 id={id} className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[2rem] sm:leading-tight">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm text-copy-secondary sm:text-[0.9375rem]">{description}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="group inline-flex min-h-[44px] shrink-0 items-center gap-1.5 self-start text-sm font-semibold text-brand-700 hover:text-brand-800 sm:self-auto"
        >
          <span className="bg-gradient-to-r from-current to-current bg-[length:0%_1.5px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover:bg-[length:100%_1.5px]">
            {linkLabel}
          </span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out-expo group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
