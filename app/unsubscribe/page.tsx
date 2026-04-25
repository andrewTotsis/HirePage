import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Unsubscribed · HirePage',
  robots: { index: false, follow: false },
};

export default function UnsubscribePage({ searchParams }: { searchParams: { ok?: string; t?: string } }) {
  const ok = searchParams.ok !== '0';
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-20">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/12 text-[#16a34a]">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {ok ? "You're unsubscribed" : 'Unsubscribe link not recognized'}
        </h1>
        <p className="mt-3 text-ink/60">
          {ok
            ? "You won't receive any further outreach emails from us. Thanks for letting us know."
            : "We couldn't find a contact for this link. It may have expired."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        >
          Back to HirePage
        </Link>
      </div>
    </main>
  );
}
