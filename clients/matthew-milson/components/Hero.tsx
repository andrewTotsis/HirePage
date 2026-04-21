import Image from 'next/image';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-hero-wash">
      <div className="container-pro relative pt-16 pb-10 md:pt-24 md:pb-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.2fr_auto] md:gap-14">
          <div className="order-2 max-w-3xl animate-fade-up md:order-1">
            <span className="eyebrow">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-accent" />
              Available for BDR / SDR roles · Toronto
            </span>

            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-ink md:text-7xl">
              Matthew Milson
            </h1>

            <p className="mt-4 text-lg font-medium text-sky-deep md:text-xl">
              Business Development Representative
            </p>

            <p className="mt-6 max-w-2xl text-lg text-ink-muted md:text-xl">
              Sales professional with{' '}
              <span className="font-semibold text-ink">3+ years</span> driving
              outbound pipeline, closing deals, and generating revenue across
              insurance, recruiting, and e-commerce — most recently influencing{' '}
              <span className="font-semibold text-ink">
                $1.1M+ in insurance premiums
              </span>{' '}
              at RBC.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#contact"
                className="btn btn-primary"
                aria-label="Get in touch"
              >
                Get in touch
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7h8M7 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/matthewmilson/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                LinkedIn
              </a>
              <a href="#experience" className="btn btn-secondary">
                View experience
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
              <span className="inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1.5 3.5h11v7h-11z M1.5 3.5l5.5 4 5.5-4"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                matthewmilson55@gmail.com
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span className="inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3.5 1.5h2l1 3-1.5 1a7 7 0 0 0 3.5 3.5l1-1.5 3 1v2a1.5 1.5 0 0 1-1.5 1.5A10 10 0 0 1 2 3a1.5 1.5 0 0 1 1.5-1.5z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinejoin="round"
                  />
                </svg>
                (647) 532-6010
              </span>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:inline-block" />
              <span className="inline-flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1v12M1 7h12"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="7"
                    cy="7"
                    r="5.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                  />
                </svg>
                Toronto, ON
              </span>
            </div>
          </div>

          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="relative animate-fade-in">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-full bg-gradient-to-br from-sky-200/60 via-sky-100/40 to-transparent blur-2xl"
              />
              <div className="relative h-44 w-44 overflow-hidden rounded-full bg-white shadow-card ring-4 ring-white md:h-72 md:w-72 lg:h-80 lg:w-80">
                <Image
                  src="/matthew.jpg"
                  alt="Matthew Milson portrait"
                  fill
                  priority
                  sizes="(max-width: 768px) 176px, 320px"
                  className="object-cover"
                />
              </div>
              <span
                aria-hidden
                className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-ink-soft shadow-soft md:bottom-4 md:right-4"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Open to BDR roles
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
