import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PortalPageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  actions?: ReactNode;
  aside?: ReactNode;
}

export function PortalPageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  badge,
  actions,
  aside,
}: PortalPageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-[#13233A] text-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[58px] border-white/[0.04]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-red-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/3 top-0 h-full w-56 skew-x-[-18deg] bg-gradient-to-b from-teal-400/[0.06] to-transparent"
      />

      <div className="relative grid gap-7 px-5 py-8 sm:px-7 sm:py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
            <Icon className="h-3.5 w-3.5 text-teal-300" />
            {eyebrow}
          </div>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
            {description}
          </p>
          {badge && (
            <p className="mt-3 inline-flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-semibold text-teal-200 ring-1 ring-teal-300/20">
              {badge}
            </p>
          )}
          {actions && <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div>}
        </div>
        {aside && <div className="grid gap-3 sm:grid-cols-2 lg:w-80 lg:grid-cols-1">{aside}</div>}
      </div>
    </section>
  );
}
