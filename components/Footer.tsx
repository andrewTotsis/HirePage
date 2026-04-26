import Link from 'next/link';
import Logo from './Logo';
import { FORM_URL } from './CTAButton';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-black/5 bg-white">
      <div className="container-pro py-12">
        <div className="grid md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-ink/60 max-w-xs">
              Professional personal websites for students, graduates, and job seekers.
            </p>
            <a
              href="mailto:support@hirepage.app"
              className="mt-3 inline-block text-sm text-ink/70 hover:text-ink"
            >
              support@hirepage.app
            </a>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-ink/45">Product</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="#how" className="text-ink/75 hover:text-ink">How it works</a></li>
              <li><a href="#pricing" className="text-ink/75 hover:text-ink">Pricing</a></li>
              <li><a href="#examples" className="text-ink/75 hover:text-ink">Examples</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-ink/45">Company</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/privacy" className="text-ink/75 hover:text-ink">Privacy</Link></li>
              <li><Link href="/terms" className="text-ink/75 hover:text-ink">Terms</Link></li>
              <li><a href="#faq" className="text-ink/75 hover:text-ink">FAQ</a></li>
            </ul>
          </div>

          <div>
            <div className="text-xs uppercase tracking-widest text-ink/45">Get started</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href={FORM_URL}
                  className="text-ink/75 hover:text-ink"
                >
                  Create My HirePage
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 hairline" />

        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="text-xs text-ink/50">© {year} HirePage. All rights reserved.</div>
          <div className="text-xs text-ink/50">Built for the next generation of hires.</div>
        </div>
      </div>
    </footer>
  );
}
