import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import SequenceBuilder from '@/components/outreach/SequenceBuilder';

export const dynamic = 'force-dynamic';

export default function SequenceDetailPage({ params }: { params: { id: string } }) {
  if (!isAdminFromCookies(cookies())) redirect('/admin/login');
  return <SequenceBuilder id={params.id} />;
}
