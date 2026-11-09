import Breadcrumbs, { type Crumb } from './Breadcrumbs';

interface PageHeaderProps {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  description?: string;
  meta?: React.ReactNode;
}

export default function PageHeader({ crumbs, eyebrow, title, description, meta }: PageHeaderProps) {
  return (
    <header className="space-y-5">
      <Breadcrumbs items={crumbs} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
          )}
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-[2.75rem] sm:leading-[1.08]">
            {title}
          </h1>
          {description && <p className="mt-3 text-base leading-relaxed text-copy-secondary">{description}</p>}
        </div>
        {meta && <div className="shrink-0 text-sm text-copy-muted">{meta}</div>}
      </div>
    </header>
  );
}
