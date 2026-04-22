const stats = [
  {
    value: '7%',
    label: 'of candidates have a personal career website',
    sub: 'A clear way to differentiate from the resume pile.',
  },
  {
    value: '56%',
    label: 'of recruiters say they’re impressed by candidates who do',
    sub: 'A signal of intent, taste, and follow-through.',
  },
  {
    value: 'Seconds',
    label: 'is all it takes to form a first impression online',
    sub: 'Make those seconds work in your favor.',
  },
  {
    value: 'Beyond PDF',
    label: 'a website helps you stand out far past a resume',
    sub: 'Showcase work, story, and links in one place.',
  },
];

export default function Stats() {
  return (
    <section className="section bg-white">
      <div className="container-pro">
        <div className="max-w-2xl">
          <span className="eyebrow">Market insight</span>
          <h2
            className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gradient"
            style={{ letterSpacing: '-0.03em' }}
          >
            A small upgrade. A big edge.
          </h2>
          <p className="mt-3 text-ink/65 text-base md:text-lg">
            The job market rewards candidates who feel intentional. A personal website is one of the
            fastest ways to do that — and almost no one does it.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-6">
              <div
                className="text-3xl md:text-4xl font-semibold tracking-tight text-ink"
                style={{ letterSpacing: '-0.03em' }}
              >
                {s.value}
              </div>
              <div className="mt-2 text-sm font-medium text-ink/85 leading-snug">{s.label}</div>
              <div className="mt-2 text-xs text-ink/55 leading-relaxed">{s.sub}</div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-ink/45">
          Figures reflect general market insight on candidate differentiation; not a survey by HirePage.
        </p>
      </div>
    </section>
  );
}
