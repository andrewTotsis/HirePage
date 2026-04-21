function AbstractAvatar() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-full bg-gradient-to-br from-sky-200/70 via-sky-100/40 to-transparent blur-2xl"
      />
      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#dbeafe] via-[#eff6ff] to-white ring-4 ring-white md:h-44 md:w-44">
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          <defs>
            <radialGradient id="heroMockupBg" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#bfdbfe" />
              <stop offset="60%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#ffffff" />
            </radialGradient>
            <linearGradient id="heroMockupFig" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#heroMockupBg)" />
          <g fill="url(#heroMockupFig)">
            <circle cx="50" cy="40" r="15" />
            <path d="M20 95 C20 70, 35 60, 50 60 C65 60, 80 70, 80 95 Z" />
          </g>
        </svg>
      </div>
      <span className="absolute bottom-1 right-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-700 shadow-sm md:bottom-2 md:right-2">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Open to BDR roles
      </span>
    </div>
  );
}

export default function HeroMockup() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="window">
        <div className="window-bar">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
          <div className="ml-3 flex-1">
            <div className="mx-auto max-w-md text-center text-[11px] text-white/50 bg-white/5 rounded-md py-1 px-3 border border-white/5">
              hirepage.com/alex-parker
            </div>
          </div>
        </div>

        <div className="bg-white">
          {/* Hero */}
          <div
            className="relative px-7 pt-8 pb-7 md:px-10 md:pt-12 md:pb-10"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12), transparent 70%)',
            }}
          >
            <div className="grid items-center gap-6 md:grid-cols-[1.2fr_auto] md:gap-10">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dbeafe] bg-[#eff6ff] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[#1d4ed8]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#3b82f6]" />
                  Available for BDR / SDR roles · Toronto
                </span>

                <h3
                  className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-[#0f172a]"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Alex Parker
                </h3>

                <p className="mt-2 text-sm md:text-base font-medium text-[#1d4ed8]">
                  Business Development Representative
                </p>

                <p className="mt-3 max-w-lg text-sm md:text-[15px] text-[#64748b] leading-relaxed">
                  Sales professional with{' '}
                  <span className="font-semibold text-[#0f172a]">3+ years</span>{' '}
                  driving outbound pipeline, closing deals, and generating
                  revenue across insurance, recruiting, and e-commerce — most
                  recently influencing{' '}
                  <span className="font-semibold text-[#0f172a]">
                    $1.1M+ in insurance premiums
                  </span>
                  .
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f172a] px-3 py-1.5 text-[11px] font-semibold text-white">
                    Get in touch →
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f172a]">
                    LinkedIn
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#0f172a]">
                    View experience
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#64748b]">
                  <span>alex.parker@email.com</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span>(647) 555-0199</span>
                  <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
                  <span>Toronto, ON</span>
                </div>
              </div>

              <div className="flex justify-center md:justify-end">
                <AbstractAvatar />
              </div>
            </div>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-200 bg-slate-50/70 px-7 py-5 md:grid-cols-4 md:gap-6 md:px-10 md:py-6">
            {[
              { v: '$1.1M+', k: 'Insurance premiums influenced' },
              { v: '1,500+', k: 'Client territory managed' },
              { v: '15+', k: 'Daily outbound calls' },
              { v: '3+ yrs', k: 'Across BDR & inside sales' },
            ].map((s) => (
              <div key={s.k}>
                <div
                  className="text-xl md:text-2xl font-semibold tracking-tight text-[#0f172a]"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {s.v}
                </div>
                <div className="mt-0.5 text-[10px] md:text-[11px] text-[#64748b] leading-tight">
                  {s.k}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-ink/45">
        A glimpse of what your HirePage could look like.
      </div>
    </div>
  );
}
