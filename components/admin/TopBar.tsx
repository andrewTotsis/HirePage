'use client';

type Props = {
  query: string;
  onQuery: (v: string) => void;
};

export default function TopBar({ query, onQuery }: Props) {
  return (
    <div className="border-b border-white/5 bg-[#0b0b0d]">
      <div className="mx-auto flex h-12 max-w-[1500px] items-center gap-4 px-6">
        <div className="relative flex-1 max-w-xl">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search leads by name, email, or role…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-1.5 text-sm text-white outline-none transition-all placeholder:text-white/35 focus:border-white/25 focus:bg-white/10"
          />
        </div>
      </div>
    </div>
  );
}
