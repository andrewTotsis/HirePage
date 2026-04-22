const faqs = [
  {
    q: 'What is HirePage?',
    a: 'HirePage is a done-for-you service that turns your resume into a custom personal website built to help you stand out and get hired.',
  },
  {
    q: 'How fast is delivery?',
    a: 'Most HirePages are designed and delivered within 24 hours of receiving your form submission.',
  },
  {
    q: 'Do I need design skills?',
    a: 'Not at all. We handle the design, copy, and build. You just submit the form with your details.',
  },
  {
    q: 'Can I request edits?',
    a: 'Yes. Choose Monthly Edits for ongoing updates, or Unlimited Edits for priority turnaround whenever you need changes.',
  },
  {
    q: 'Can I use my own domain?',
    a: 'Yes. You can connect a custom domain — just let us know in the form and we will help you get it set up.',
  },
  {
    q: 'Is it mobile friendly?',
    a: 'Every HirePage is fully responsive and looks polished on phones, tablets, and laptops.',
  },
  {
    q: 'Who is this for?',
    a: 'Students, recent graduates, and job seekers who want to stand out in applications, on LinkedIn, and in recruiter conversations.',
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="section bg-[#fafafa] border-y border-black/5">
      <div className="container-pro">
        <div className="grid md:grid-cols-[1fr_2fr] gap-10">
          <div>
            <span className="eyebrow">FAQ</span>
            <h2
              className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gradient"
              style={{ letterSpacing: '-0.03em' }}
            >
              Questions, answered.
            </h2>
            <p className="mt-3 text-ink/65">
              Still curious? Submit the form and we’ll personally reply.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className="card p-5 group"
                {...(i === 0 ? { open: true } : {})}
              >
                <summary className="flex items-start justify-between gap-6">
                  <span className="text-base font-medium tracking-tight text-ink">{f.q}</span>
                  <span
                    className="accordion-icon mt-1 inline-flex w-7 h-7 items-center justify-center rounded-full border border-black/10 text-ink transition-transform"
                    aria-hidden="true"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-sm text-ink/65 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
