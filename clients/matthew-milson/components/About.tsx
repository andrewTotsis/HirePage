export default function About() {
  return (
    <section id="about" className="section bg-slate-50/70 border-y border-slate-200">
      <div className="container-pro">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="eyebrow">About</span>
            <h2 className="section-title mt-5">Built for outbound.</h2>
            <div className="mt-6 space-y-5 text-lg leading-relaxed text-ink-soft">
              <p>
                I&apos;m a Toronto-based sales professional with a track record
                of turning cold outreach into real revenue. Whether it&apos;s{' '}
                <span className="font-semibold text-ink">
                  1,500+ insurance clients
                </span>{' '}
                at RBC or <span className="font-semibold text-ink">$20K+</span>{' '}
                in placements at GTA Search, I&apos;ve consistently hit activity
                benchmarks while building genuine relationships that convert.
              </p>
              <p>
                I thrive in high-volume environments, enjoy being coached, and
                take ownership of the pipeline I&apos;m handed — whether
                that&apos;s a list of 15 prospects or a full territory. My goal
                is to land a BDR/SDR seat on a high-growth team where hustle
                and process both win.
              </p>
            </div>
          </div>

          <aside className="card">
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-deep">
              At a glance
            </h3>
            <dl className="mt-5 divide-y divide-slate-100">
              <div className="flex items-center justify-between py-3 text-sm">
                <dt className="text-ink-muted">Based in</dt>
                <dd className="font-medium text-ink">Toronto, ON</dd>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <dt className="text-ink-muted">Target role</dt>
                <dd className="font-medium text-ink">BDR · SDR</dd>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <dt className="text-ink-muted">Status</dt>
                <dd className="font-medium text-emerald-700">
                  Actively interviewing
                </dd>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <dt className="text-ink-muted">Languages</dt>
                <dd className="font-medium text-ink">English (fluent)</dd>
              </div>
              <div className="flex items-center justify-between py-3 text-sm">
                <dt className="text-ink-muted">Interests</dt>
                <dd className="font-medium text-ink">Hockey · Golf · Fitness</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </section>
  );
}
