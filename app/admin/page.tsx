import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  if (!isAdminFromCookies(cookies())) {
    redirect('/admin/login');
  }
  return <AdminDashboard hasBackend={storage.hasBackend()} />;
}
