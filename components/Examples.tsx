import Link from 'next/link';
import ExamplePreview from './ExamplePreview';
import { profiles, LANDING_SLUGS } from '@/lib/profiles';

const landingProfiles = LANDING_SLUGS.map(
  (slug) => profiles.find((p) => p.slug === slug)!,
);

export default function Examples() {
  return (
    <section id="examples" className="section bg-[#fafafa] border-y border-black/5">
      <div className="container-pro">
        <div className="max-w-2xl">
          <span className="eyebrow">Examples</span>
          <h2
            className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gradient"
            style={{ letterSpacing: '-0.03em' }}
          >
            Real students. Real upgrades.
          </h2>
          <p className="mt-3 text-ink/65 text-base md:text-lg">
            A resume blends in. A HirePage makes you easy to remember. Here&rsquo;s what that looks
            like across three kinds of students.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {landingProfiles.map((p) => (
            <article key={p.slug} className="card flex flex-col overflow-hidden">
              <div className="p-3 bg-gradient-to-b from-slate-50 to-white">
                <div className="overflow-hidden rounded-[14px] ring-1 ring-black/5">
                  <ExamplePreview profile={p} variant="compact" />
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5 pt-3">
                <div className="text-[10px] uppercase tracking-widest text-ink/45">
                  {p.categoryLabel}
                </div>
                <div className="mt-1.5 text-base font-semibold tracking-tight text-ink">
                  {p.name} · {p.targetRole}
                </div>
                <p className="mt-2 text-sm text-ink/65 leading-relaxed">{p.context}</p>
                <div className="mt-auto pt-4">
                  <Link
                    href={`/examples#${p.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:gap-2 transition-all"
                  >
                    View full example <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/examples"
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:border-black/30 hover:bg-[#fafafa] transition-colors"
          >
            See all examples <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
