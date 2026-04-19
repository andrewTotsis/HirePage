import CTAButton from './CTAButton';

const plans = [
  {
    name: 'Basic',
    price: '$50',
    cadence: 'one-time',
    desc: 'Professional personal website built from your resume.',
    features: [
      'Custom-designed personal site',
      'Mobile-friendly & fast',
      'Built from your resume',
      'Delivered ready to share',
    ],
    highlighted: false,
  },
  {
    name: 'Monthly Edits',
    price: '$50',
    cadence: '+ $5 / month',
    desc: 'Website + ongoing monthly edits to keep it current.',
    features: [
      'Everything in Basic',
      'Monthly content edits',
      'Ongoing minor design tweaks',
      'Cancel anytime',
    ],
    highlighted: true,
  },
  {
    name: 'Unlimited Edits',
    price: '$50',
    cadence: '+ $10 / month',
    desc: 'Priority support and unlimited updates whenever you need.',
    features: [
      'Everything in Monthly',
      'Unlimited edit requests',
      'Priority turnaround',
      'Dedicated point of contact',
    ],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section bg-white">
      <div className="container-pro">
        <div className="max-w-2xl">
          <span className="eyebrow">Pricing</span>
          <h2
            className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gradient"
            style={{ letterSpacing: '-0.03em' }}
          >
            Simple, honest pricing.
          </h2>
          <p className="mt-3 text-ink/65 text-base md:text-lg">
            Start with a one-time build. Add edits later if you want it to grow with you.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`card p-7 relative ${
                p.highlighted ? 'ring-1 ring-ink/90 shadow-card' : ''
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-7 text-[10px] uppercase tracking-widest bg-ink text-white px-2.5 py-1 rounded-full">
                  Most popular
                </span>
              )}
              <div className="text-sm font-medium text-ink/70">{p.name}</div>
              <div className="mt-2 flex items-baseline gap-2">
                <div
                  className="text-4xl font-semibold tracking-tight"
                  style={{ letterSpacing: '-0.03em' }}
                >
                  {p.price}
                </div>
                <div className="text-sm text-ink/55">{p.cadence}</div>
              </div>
              <p className="mt-3 text-sm text-ink/65">{p.desc}</p>

              <ul className="mt-5 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-ink/80">
                    <svg
                      className="mt-0.5 shrink-0"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <CTAButton
                  variant={p.highlighted ? 'primary' : 'secondary'}
                  className="w-full justify-center"
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-ink/45">
          Have a custom request? Mention it in the form — we’re flexible.
        </p>
      </div>
    </section>
  );
}
