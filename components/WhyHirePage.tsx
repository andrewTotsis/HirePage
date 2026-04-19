const items = [
  {
    title: 'Look more professional',
    desc: 'A polished website signals you take your career seriously — instantly.',
    icon: (
      <path d="M12 2 4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4Z" />
    ),
  },
  {
    title: 'Stand out in applications',
    desc: 'Most applicants only send a PDF. Yours arrives with a story.',
    icon: <path d="M12 2v20M2 12h20" />,
  },
  {
    title: 'Easy to share anywhere',
    desc: 'One link for LinkedIn, email signatures, DMs, and applications.',
    icon: (
      <>
        <path d="M10 14a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
        <path d="M14 10a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
      </>
    ),
  },
  {
    title: 'Showcase projects & wins',
    desc: 'Highlight real work — internships, side projects, results, links.',
    icon: (
      <>
        <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
      </>
    ),
  },
  {
    title: 'Better personal brand',
    desc: 'Your name, your story, your taste — presented intentionally.',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  },
  {
    title: 'Mobile-friendly presence',
    desc: 'Looks sharp on every screen — recruiters scroll on phones too.',
    icon: <rect x="6" y="2" width="12" height="20" rx="2" />,
  },
  {
    title: 'More memorable than PDF',
    desc: 'Visuals, layout, and motion stick longer than a resume bullet list.',
    icon: <path d="M4 4h16v16H4zM4 9h16M9 4v16" />,
  },
  {
    title: 'Custom built for you',
    desc: 'Real, hand-crafted design — not a templated builder you have to learn.',
    icon: (
      <>
        <path d="M12 2 2 7l10 5 10-5-10-5Z" />
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
      </>
    ),
  },
];

export default function WhyHirePage() {
  return (
    <section className="section bg-[#fafafa] border-y border-black/5">
      <div className="container-pro">
        <div className="max-w-2xl">
          <span className="eyebrow">Why HirePage</span>
          <h2
            className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gradient"
            style={{ letterSpacing: '-0.03em' }}
          >
            Designed to make you the obvious hire.
          </h2>
          <p className="mt-3 text-ink/65 text-base md:text-lg">
            Every detail of your HirePage is built to turn casual readers into recruiters who reach out.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <div key={it.title} className="card p-6 group">
              <div className="w-10 h-10 rounded-lg bg-ink text-white inline-flex items-center justify-center transition-transform group-hover:-translate-y-0.5">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {it.icon}
                </svg>
              </div>
              <h3
                className="mt-4 text-base font-semibold tracking-tight"
                style={{ letterSpacing: '-0.015em' }}
              >
                {it.title}
              </h3>
              <p className="mt-1.5 text-sm text-ink/60 leading-relaxed">{it.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
