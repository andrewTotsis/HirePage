'use client';

import { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
};

export default function StepShell({ eyebrow, title, subtitle, children }: Props) {
  return (
    <div className="mx-auto w-full max-w-xl">
      {eyebrow ? (
        <div className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-ink/50">
          {eyebrow}
        </div>
      ) : null}
      <h1
        className="text-3xl md:text-4xl font-semibold text-ink leading-tight"
        style={{ letterSpacing: '-0.03em' }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-3 text-base md:text-lg text-ink/60 leading-relaxed">{subtitle}</p>
      ) : null}
      <div className="mt-8">{children}</div>
    </div>
  );
}
