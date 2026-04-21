export default function Education() {
  return (
    <section id="education" className="section bg-slate-50/70 border-y border-slate-200">
      <div className="container-pro">
        <div className="max-w-3xl">
          <span className="eyebrow">Education & Certifications</span>
          <h2 className="section-title mt-5">Academic foundation</h2>
          <p className="section-kicker">
            Business and human-resources grounding paired with entrepreneurship
            training from one of Canada&apos;s top business schools.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <article className="card card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-deep">
                  Diploma Program
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  Centennial College
                </h3>
                <p className="mt-1 text-[15px] text-ink-soft">
                  Business Administration — Human Resources
                </p>
              </div>
              <div className="shrink-0 text-right text-sm text-ink-muted">
                <div className="font-medium text-ink-soft">
                  Sep 2021 — Feb 2022
                </div>
                <div>Scarborough, ON</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="chip">Business Fundamentals</span>
              <span className="chip">Organizational Behaviour</span>
              <span className="chip">Recruiting & HR</span>
              <span className="chip">Communications</span>
            </div>
          </article>

          <article className="card card-hover">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-sky-deep">
                  Certification
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  Ivey Business School
                </h3>
                <p className="mt-1 text-[15px] text-ink-soft">
                  The Founders Journey — An Entrepreneurial Process
                </p>
              </div>
              <div className="shrink-0 text-right text-sm text-ink-muted">
                <div className="font-medium text-ink-soft">Certificate</div>
                <div>Western University</div>
              </div>
            </div>
            <p className="mt-6 text-[15px] text-ink-muted">
              Case-based program covering opportunity identification, go-to-market,
              and building repeatable revenue motions — directly applicable to
              territory ownership and outbound strategy.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip">Go-to-Market</span>
              <span className="chip">Case Method</span>
              <span className="chip">Venture Building</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
