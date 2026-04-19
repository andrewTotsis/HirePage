'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import CTAButton from './CTAButton';

const links = [
  { href: '#how', label: 'How It Works' },
  { href: '#examples', label: 'Examples' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled
          ? 'bg-white/85 backdrop-blur-md border-b border-black/5'
          : 'bg-white/0 border-b border-transparent'
      }`}
    >
      <div className="container-pro flex h-16 items-center justify-between">
        <Link href="/" aria-label="HirePage home" className="flex items-center">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          <Link
            href="/"
            className="px-3 py-2 text-sm text-ink/75 hover:text-ink rounded-md transition-colors"
          >
            Home
          </Link>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-ink/75 hover:text-ink rounded-md transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <CTAButton className="!py-2.5 !px-4 text-sm" />
        </div>

        <button
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-black/10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-black/5 bg-white">
          <div className="container-pro py-4 flex flex-col gap-2">
            <Link
              href="/"
              className="px-2 py-2 text-sm text-ink/80"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-2 py-2 text-sm text-ink/80"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div className="pt-2">
              <CTAButton className="w-full justify-center" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
