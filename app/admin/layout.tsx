import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HirePage CRM',
  description: 'Internal lead management.',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root min-h-screen bg-[#09090b] text-white">{children}</div>;
}
