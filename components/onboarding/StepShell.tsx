'use client';

import { ReactNode } from 'react';

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  width?: 'default' | 'wide';
};

export default function StepShell({ eyebrow, title, subtitle, children, width = 'default' }: Props) {
  const max = width === 'wide' ? 'max-w-4xl' : 'max-w-2xl';
  return (
    <div className={`mx-auto w-full ${max}`}>
      {eyebrow ? (
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/45">
          {eyebrow}
        </div>
      ) : null}
      <h1
        className="text-[26px] md:text-[32px] font-semibold text-ink leading-[1.15]"
        style={{ letterSpacing: '-0.03em' }}
      >
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-sm md:text-base text-ink/60 leading-relaxed">{subtitle}</p>
      ) : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}
