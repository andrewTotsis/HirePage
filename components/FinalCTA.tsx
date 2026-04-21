import { FORM_URL } from './CTAButton';

export default function FinalCTA() {
  return (
    <section className="section">
      <div className="container-pro">
        <div className="relative overflow-hidden rounded-3xl bg-ink text-white px-6 py-14 md:py-20 md:px-14">
          <div
            className="absolute inset-0 opacity-[0.08]"
            aria-hidden="true"
            style={{
              backgroundImage:
                'radial-gradient(800px 300px at 50% 0%, rgba(255,255,255,0.5), transparent 60%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-30"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '52px 52px',
              maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
            }}
          />

          <div className="relative max-w-2xl mx-auto text-center">
            <h2
              className="text-3xl md:text-5xl font-semibold tracking-tight"
              style={{ letterSpacing: '-0.035em' }}
            >
              Your resume deserves more than a PDF.
            </h2>
            <p className="mt-4 text-white/70 text-base md:text-lg">
              Join early users using HirePage to stand out, get noticed, and get hired.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-ink px-5 py-3 rounded-xl font-semibold transition-transform hover:-translate-y-0.5 shadow-soft"
                aria-label="Create My HirePage"
              >
                Create My HirePage
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </a>
              <a
                href="#pricing"
                className="text-sm text-white/75 hover:text-white px-3 py-2"
              >
                See pricing →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
