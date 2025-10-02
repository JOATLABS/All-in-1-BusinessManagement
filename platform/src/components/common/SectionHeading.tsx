import { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function SectionHeading({ eyebrow, title, description, actions }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--accent-primary)] opacity-80">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
        {description ? <p className="max-w-2xl text-base text-white/70 md:text-lg">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3 text-sm text-white/80">{actions}</div> : null}
    </div>
  );
}
