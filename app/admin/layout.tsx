import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import AdminNav from '@/components/outreach/AdminNav';
import { isAdminFromCookies } from '@/lib/admin-auth';

export const metadata: Metadata = {
  title: 'HirePage CRM',
  description: 'Internal lead and outreach management.',
  robots: { index: false, follow: false, nocache: true, noarchive: true },
};

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdminFromCookies(cookies());
  return (
    <div className="admin-root min-h-screen bg-[#09090b] text-white">
      {authed ? <AdminNav /> : null}
      {children}
    </div>
  );
}
