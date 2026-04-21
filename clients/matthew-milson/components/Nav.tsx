'use client';

import { useEffect, useState } from 'react';

const links = [
  { label: 'Experience', href: '#experience' },
  { label: 'Education', href: '#education' },
  { label: 'Skills', href: '#skills' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-colors ${
        scrolled
          ? 'border-slate-200 bg-white/85 backdrop-blur'
          : 'border-transparent bg-white/60 backdrop-blur'
      }`}
    >
      <div className="container-pro flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-[13px] font-semibold text-white">
            MM
          </span>
          <span className="text-sm font-semibold tracking-tight text-ink">
            Matthew Milson
          </span>
        </a>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <a
            href="https://www.linkedin.com/in/matthewmilson/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary !py-2 !px-4 text-sm"
          >
            Connect on LinkedIn
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 md:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d={open ? 'M3 3 L13 13 M13 3 L3 13' : 'M2 4 H14 M2 8 H14 M2 12 H14'}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="container-pro flex flex-col gap-1 py-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 text-sm text-ink-soft hover:bg-slate-50"
              >
                {l.label}
              </a>
            ))}
            <a
              href="https://www.linkedin.com/in/matthewmilson/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-2 text-sm"
            >
              Connect on LinkedIn
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
