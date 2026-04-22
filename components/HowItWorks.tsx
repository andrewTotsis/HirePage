import CTAButton from './CTAButton';

const steps = [
  {
    n: '01',
    title: 'Fill out our quick form',
    desc: 'Send us your resume, links, and goals. Takes about 5 minutes.',
  },
  {
    n: '02',
    title: 'We build your custom website',
    desc: 'Our team designs and builds a personal site tailored to your story.',
  },
  {
    n: '03',
    title: 'Receive your HirePage and start sharing',
    desc: 'Get your link within 24 hours. Add it to LinkedIn, email, and applications.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section bg-white">
      <div className="container-pro">
        <div className="max-w-2xl">
          <span className="eyebrow">How it works</span>
          <h2
            className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gradient"
            style={{ letterSpacing: '-0.03em' }}
          >
            Three steps. No design skills required.
          </h2>
          <p className="mt-3 text-ink/65 text-base md:text-lg">
            We do the design, copy, and build. You stay focused on landing the role.
          </p>
        </div>

        <div className="mt-10 relative">
          <div className="hidden md:block absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" aria-hidden="true" />
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.n} className="card p-7 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ink text-white inline-flex items-center justify-center text-sm font-semibold">
                    {s.n}
                  </div>
                  <div className="text-xs uppercase tracking-widest text-ink/50">Step</div>
                </div>
                <h3
                  className="mt-5 text-lg font-semibold tracking-tight"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-ink/60 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <CTAButton />
        </div>
      </div>
    </section>
  );
}
