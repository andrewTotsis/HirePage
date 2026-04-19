const examples = [
  {
    title: 'Business Student',
    role: 'Finance · Class of 2025',
    accent: 'from-zinc-900 to-zinc-600',
  },
  {
    title: 'Software Engineer',
    role: 'Full-stack · Open to roles',
    accent: 'from-slate-900 to-slate-500',
  },
  {
    title: 'Marketing Graduate',
    role: 'Growth · Brand · Content',
    accent: 'from-neutral-900 to-neutral-500',
  },
];

export default function Examples() {
  return (
    <section id="examples" className="section bg-[#fafafa] border-y border-black/5">
      <div className="container-pro">
        <div className="max-w-2xl">
          <span className="eyebrow">Examples</span>
          <h2
            className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight text-gradient"
            style={{ letterSpacing: '-0.03em' }}
          >
            See what your HirePage can look like.
          </h2>
          <p className="mt-3 text-ink/65 text-base md:text-lg">
            A preview of three sample profiles we’re putting together. Real live examples coming soon.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {examples.map((e) => (
            <article key={e.title} className="card overflow-hidden group">
              <div className={`relative h-44 bg-gradient-to-br ${e.accent}`}>
                <div className="absolute inset-0 opacity-30 bg-grid" />
                <div className="absolute inset-0 flex items-end p-5 text-white">
                  <div>
                    <div className="text-xs uppercase tracking-widest opacity-80">Example</div>
                    <div className="text-lg font-semibold tracking-tight">{e.title}</div>
                  </div>
                </div>
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-widest bg-white/15 backdrop-blur px-2 py-1 rounded text-white border border-white/10">
                  Coming Soon
                </span>
              </div>
              <div className="p-5">
                <div className="text-sm font-medium text-ink">{e.title} Example</div>
                <div className="text-xs text-ink/55 mt-0.5">{e.role}</div>
                <div className="mt-4 inline-flex items-center gap-1 text-xs text-ink/50">
                  Preview link <span aria-hidden="true">→</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
