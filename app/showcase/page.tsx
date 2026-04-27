import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTAButton from '@/components/CTAButton';

export const metadata = {
  title: 'Talent Showcase — coming soon',
  description:
    'A curated directory of standout HirePage profiles, built for hiring managers and recruiters.',
};

const FAKE_PROFILES: { name: string; role: string; tags: string[]; gradient: string; initials: string }[] = [
  { name: 'Alex Parker', role: 'Software Engineer · New grad', tags: ['Python', 'React', 'FAANG-ready'], gradient: 'from-[#1f2937] to-[#0f172a]', initials: 'AP' },
  { name: 'Priya Shah', role: 'Investment Banking Intern', tags: ['Wharton ’26', 'Modeling', 'M&A'], gradient: 'from-[#1e3a8a] to-[#0c1838]', initials: 'PS' },
  { name: 'Marcus Lee', role: 'Product Manager · Mid', tags: ['B2B SaaS', 'Growth', 'Ex-Stripe'], gradient: 'from-[#0ea5e9] to-[#0369a1]', initials: 'ML' },
  { name: 'Jordan Reyes', role: 'Marketing Analyst', tags: ['Performance', 'SQL', 'Looker'], gradient: 'from-[#f97316] to-[#9a3412]', initials: 'JR' },
  { name: 'Sara Klein', role: 'Data Scientist', tags: ['ML', 'Causal', 'PyTorch'], gradient: 'from-[#a855f7] to-[#581c87]', initials: 'SK' },
  { name: 'Devon Wright', role: 'BDR / SDR', tags: ['Outbound', 'Mid-market', 'Tech'], gradient: 'from-[#22c55e] to-[#14532d]', initials: 'DW' },
  { name: 'Hannah Cho', role: 'Strategy Consultant', tags: ['Bain ’25', 'Healthcare', 'PE'], gradient: 'from-[#ec4899] to-[#831843]', initials: 'HC' },
  { name: 'Tomás Vega', role: 'Designer · Product', tags: ['Figma', 'Brand', 'Motion'], gradient: 'from-[#475569] to-[#1f2937]', initials: 'TV' },
  { name: 'Ravi Mehta', role: 'Quant Researcher', tags: ['HFT', 'Stat', 'C++'], gradient: 'from-[#dc2626] to-[#7f1d1d]', initials: 'RM' },
];

const ROLES = ['All roles', 'Engineering', 'Finance', 'Product', 'Marketing', 'Design', 'Data', 'Sales'];

export default function ShowcasePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <section className="relative isolate overflow-hidden">
          {/* Blurred placeholder content — gives the page weight + a believable
              "under development" feel rather than a blank coming-soon screen. */}
          <div aria-hidden className="pointer-events-none select-none blur-md opacity-70">
            <div className="container-pro pt-12 pb-20">
              <div className="text-xs uppercase tracking-[0.18em] text-ink/45">Talent Showcase</div>
              <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight tracking-tight" style={{ letterSpacing: '-0.035em' }}>
                Curated talent for serious hiring managers.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-ink/65">
                Browse standout HirePage profiles by role, intent, and stage. Reach out directly — no recruiter middlemen, no inflated bios.
              </p>

              {/* Filter chips */}
              <div className="mt-8 flex flex-wrap gap-2">
                {ROLES.map((r, i) => (
                  <span
                    key={r}
                    className={`rounded-full px-3.5 py-1.5 text-sm ring-1 ${
                      i === 0
                        ? 'bg-ink text-white ring-ink'
                        : 'bg-white text-ink/75 ring-black/10'
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>

              {/* Profile grid */}
              <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {FAKE_PROFILES.map((p) => (
                  <article
                    key={p.name}
                    className="group rounded-2xl border border-black/10 bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-22px_rgba(15,23,42,0.18)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient} text-sm font-semibold text-white`}
                      >
                        {p.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-base font-semibold text-ink">{p.name}</div>
                        <div className="truncate text-sm text-ink/60">{p.role}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-black/[0.04] px-2.5 py-0.5 text-xs text-ink/65"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between">
                      <span className="text-xs text-ink/40">View profile →</span>
                      <span className="rounded-full bg-[#22c55e]/15 px-2 py-0.5 text-[11px] font-medium text-[#16a34a]">
                        Open to work
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination dummy */}
              <div className="mt-10 flex items-center justify-center gap-2 text-sm text-ink/55">
                <span className="rounded-full border border-black/10 bg-white px-3 py-1.5">‹ Prev</span>
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={`h-8 w-8 rounded-full ${n === 1 ? 'bg-ink text-white' : 'bg-white text-ink/65 ring-1 ring-black/10'} flex items-center justify-center`}
                  >
                    {n}
                  </span>
                ))}
                <span className="rounded-full border border-black/10 bg-white px-3 py-1.5">Next ›</span>
              </div>
            </div>
          </div>

          {/* Soft white scrim so the blur reads as background, not foreground */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/40 via-white/55 to-white/85" />

          {/* Coming-soon overlay */}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="relative w-full max-w-xl rounded-3xl border border-black/10 bg-white/90 p-8 text-center shadow-[0_40px_120px_-40px_rgba(15,23,42,0.28)] backdrop-blur-sm md:p-10">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#16a34a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
                In development
              </span>
              <h2
                className="mt-4 text-3xl font-semibold leading-tight md:text-4xl"
                style={{ letterSpacing: '-0.03em' }}
              >
                Talent Showcase is coming soon.
              </h2>
              <p className="mt-3 text-base text-ink/65 md:text-lg">
                A curated directory of standout HirePage profiles — searchable by role, stage, and intent.
                Recruiters reach out directly. No middlemen, no inflated bios.
              </p>
              <p className="mt-4 text-sm text-ink/55">
                Want your page featured? Opt in during onboarding and you&rsquo;ll be in the first cohort.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <CTAButton className="!py-3 !px-5" />
                <a
                  href="mailto:support@hirepage.app?subject=Talent%20Showcase%20interest"
                  className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-ink/80 transition-all hover:border-black/25 hover:text-ink"
                >
                  Email me when it&rsquo;s live
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
