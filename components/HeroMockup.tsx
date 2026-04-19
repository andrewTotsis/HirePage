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
              hirepage.com/jordan-smith
            </div>
          </div>
        </div>

        <div className="bg-white">
          <div className="grid md:grid-cols-[260px_1fr]">
            {/* Left rail */}
            <aside className="hidden md:block bg-[#fafafa] border-r border-black/5 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-500" />
                <div>
                  <div className="text-sm font-semibold tracking-tight">Jordan Smith</div>
                  <div className="text-xs text-ink/55">Marketing Graduate</div>
                </div>
              </div>
              <div className="mt-6 space-y-2 text-xs text-ink/65">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Open to opportunities
                </div>
                <div>NYU · Class of 2025</div>
                <div>New York, NY</div>
              </div>
              <div className="mt-6 flex flex-wrap gap-1.5">
                {['SEO', 'Branding', 'Analytics', 'Content', 'Notion'].map((t) => (
                  <span
                    key={t}
                    className="text-[10px] px-2 py-1 rounded-md bg-white border border-black/10 text-ink/70"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </aside>

            {/* Main */}
            <div className="p-6 md:p-10">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-widest text-ink/45">Personal Site</div>
                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  Helping brands grow with clear, data-driven marketing.
                </h3>
                <p className="text-sm md:text-base text-ink/60 max-w-2xl">
                  Marketing graduate with 2+ years of internship experience across SaaS and consumer
                  brands. Currently exploring growth marketing roles in NYC.
                </p>
              </div>

              <div className="mt-6 grid sm:grid-cols-3 gap-3">
                {[
                  { k: 'Internships', v: '4' },
                  { k: 'Avg ROAS lift', v: '+38%' },
                  { k: 'Projects shipped', v: '12' },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-xl border border-black/8 bg-white p-4"
                  >
                    <div className="text-xl font-semibold tracking-tight">{s.v}</div>
                    <div className="text-xs text-ink/55">{s.k}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-3">
                {[
                  { t: 'Growth Internship · Acme SaaS', d: 'Drove 28% MQL growth via SEO & lifecycle' },
                  { t: 'Brand Project · Local Coffee', d: 'New identity + landing page that lifted CTR 41%' },
                ].map((p) => (
                  <div key={p.t} className="rounded-xl border border-black/8 p-4">
                    <div className="text-sm font-semibold tracking-tight">{p.t}</div>
                    <div className="text-xs text-ink/55 mt-1">{p.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2">
                <span className="inline-flex items-center gap-2 text-xs text-ink/60 px-3 py-1.5 rounded-md bg-[#fafafa] border border-black/8">
                  Resume
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-ink/60 px-3 py-1.5 rounded-md bg-[#fafafa] border border-black/8">
                  LinkedIn
                </span>
                <span className="inline-flex items-center gap-2 text-xs text-white px-3 py-1.5 rounded-md bg-ink">
                  Contact
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 text-center text-xs text-ink/45">
        A glimpse of what your HirePage could look like.
      </div>
    </div>
  );
}
