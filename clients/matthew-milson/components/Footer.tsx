export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container-pro flex flex-col items-start justify-between gap-4 py-10 md:flex-row md:items-center">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-[11px] font-semibold text-white">
            MM
          </span>
          <span className="text-sm text-ink-muted">
            © {year} Matthew Milson. All rights reserved.
          </span>
        </div>

        <div className="flex items-center gap-5 text-sm">
          <a
            href="mailto:matthewmilson55@gmail.com"
            className="text-ink-muted hover:text-ink"
          >
            Email
          </a>
          <a
            href="https://www.linkedin.com/in/matthewmilson/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-muted hover:text-ink"
          >
            LinkedIn
          </a>
          <a href="tel:+16475326010" className="text-ink-muted hover:text-ink">
            (647) 532-6010
          </a>
        </div>
      </div>
    </footer>
  );
}
