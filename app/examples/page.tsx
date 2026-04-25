import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CTAButton, { FORM_URL } from '@/components/CTAButton';
import ExamplePreview from '@/components/ExamplePreview';
import { profiles, FULL_ORDER, type Profile } from '@/lib/profiles';

export const metadata = {
  title: 'Examples · HirePage',
  description:
    'See how HirePage turns resumes into personal websites — across seven kinds of students, graduates, and job seekers.',
};

const ordered: Profile[] = FULL_ORDER.map(
  (slug) => profiles.find((p) => p.slug === slug)!,
);

export default function ExamplesPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="bg-white">
        {/* Intro */}
        <section className="section pb-0">
          <div className="container-pro max-w-3xl">
            <span className="eyebrow">Examples</span>
            <h1
              className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight text-gradient"
              style={{ letterSpacing: '-0.035em' }}
            >
              Seven students. Seven upgrades.
            </h1>
            <p className="mt-4 text-ink/65 text-lg md:text-xl leading-relaxed">
              Most students have the same resume. A HirePage is what turns that resume into
              something a recruiter can remember. Below, seven real kinds of profiles — from
              &ldquo;I don&rsquo;t know what I want yet&rdquo; to &ldquo;I graduated and I need a
              job now&rdquo; — and what each one gets.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <CTAButton />
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-2 text-sm font-semibold text-ink/80 hover:text-ink"
              >
                See pricing <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Quick jump */}
          <div className="container-pro mt-12">
            <div className="rounded-2xl border border-black/5 bg-[#fafafa] p-4 md:p-5">
              <div className="text-[10px] uppercase tracking-widest text-ink/50 mb-3">
                Jump to an example
              </div>
              <div className="flex flex-wrap gap-2">
                {ordered.map((p, i) => (
                  <a
                    key={p.slug}
                    href={`#${p.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-ink/75 hover:border-black/30 hover:text-ink transition-colors"
                  >
                    <span className="text-ink/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {p.name} · {p.categoryLabel.split(' · ')[0]}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Examples list */}
        <div className="section pt-16 md:pt-24 space-y-20 md:space-y-28">
          {ordered.map((p, i) => (
            <ExampleRow key={p.slug} profile={p} index={i} />
          ))}
        </div>

        {/* Final CTA */}
        <section className="pb-24 md:pb-32">
          <div className="container-pro">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a0b] to-[#1f2937] p-10 md:p-14 text-white">
              <div className="max-w-2xl">
                <div className="text-[11px] uppercase tracking-widest text-white/55">
                  Yours, in 24 hours
                </div>
                <h2
                  className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  Your HirePage will look like one of these.
                </h2>
                <p className="mt-3 text-base md:text-lg text-white/70">
                  Custom-designed from your resume. Delivered within 24 hours. Designed so that
                  when a recruiter clicks, they remember you.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <CTAButton />
                  <Link
                    href="/#pricing"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    See pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ExampleRow({ profile, index }: { profile: Profile; index: number }) {
  const n = String(index + 1).padStart(2, '0');
  return (
    <section id={profile.slug} className="container-pro scroll-mt-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* Left: context */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center gap-3">
            <div
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: profile.site.accent.base }}
            >
              {n}
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-ink/50">
                Example {n} · {profile.categoryLabel}
              </div>
              <div className="text-base font-semibold text-ink">{profile.school}</div>
            </div>
          </div>

          <h2
            className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight text-gradient"
            style={{ letterSpacing: '-0.03em' }}
          >
            {profile.name} — {profile.targetRole}
          </h2>

          <p className="mt-3 text-ink/70 text-base md:text-lg leading-relaxed">
            {profile.context}
          </p>

          <div
            className="mt-6 rounded-2xl border p-5"
            style={{
              borderColor: profile.site.accent.ring,
              backgroundColor: profile.site.accent.soft,
            }}
          >
            <div
              className="text-[10px] uppercase tracking-widest font-semibold"
              style={{ color: profile.site.accent.base }}
            >
              Why this works
            </div>
            <p className="mt-2 text-sm md:text-[15px] text-ink/80 leading-relaxed">
              {profile.whyItWorks}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href={FORM_URL}
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: profile.site.accent.base }}
              aria-label={`Build a HirePage like ${profile.name}'s`}
            >
              Build yours <span aria-hidden="true">→</span>
            </Link>
            <Link
              href={FORM_URL}
              className="text-sm font-semibold text-ink/70 hover:text-ink"
            >
              Get a website like this →
            </Link>
          </div>
        </div>

        {/* Right: preview */}
        <div>
          <div className="overflow-hidden rounded-[20px] ring-1 ring-black/5 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
            <ExamplePreview profile={profile} variant="detailed" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-ink/45">
            <span>Preview of a custom HirePage</span>
            <span className="tabular-nums">hirepage.com/{profile.slug}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
