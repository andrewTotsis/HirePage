import CTAButton from './CTAButton';
import HeroMockup from './HeroMockup';

export default function Hero() {
  return (
    <section className="relative overflow-hidden hero-glow">
      {/* Soft background */}
      <div className="absolute inset-0 -z-10 bg-dots opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-x-0 top-0 -z-10 h-[520px]"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(15,23,42,0.08), rgba(255,255,255,0) 70%)',
        }}
      />

      <div className="container-pro pt-20 md:pt-28 pb-16 md:pb-24 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 reveal">
            <span className="eyebrow">
              <span className="dot" />
              Now accepting early customers
            </span>
          </div>

          <h1
            className="mt-6 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] reveal reveal-delay-1"
            style={{ letterSpacing: '-0.035em' }}
          >
            <span className="text-gradient">Stand Out.</span>{' '}
            <span className="text-gradient">Get Noticed.</span>{' '}
            <span className="block sm:inline text-ink">Get Hired.</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-ink/65 leading-relaxed reveal reveal-delay-2">
            We turn your resume into a professional personal website that helps recruiters
            instantly understand your value.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 reveal reveal-delay-3">
            <CTAButton />
            <CTAButton href="/onboarding" variant="secondary">
              Create My HirePage (Guided)
            </CTAButton>
          </div>

          <div className="mt-6 flex items-center justify-center gap-3 text-xs text-ink/55 reveal reveal-delay-4">
            <div className="flex -space-x-2">
              {['#0a0a0b', '#1f2937', '#334155', '#475569'].map((c, i) => (
                <span
                  key={i}
                  className="inline-block w-6 h-6 rounded-full border-2 border-white"
                  style={{ background: c }}
                  aria-hidden="true"
                />
              ))}
            </div>
            <span>Built for students, graduates &amp; job seekers</span>
          </div>
        </div>

        <div className="mt-14 md:mt-20 relative reveal reveal-delay-4">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
