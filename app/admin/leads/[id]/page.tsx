import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { isAdminFromCookies } from '@/lib/admin-auth';
import { getLead } from '@/lib/leads';
import LeadDetailView from '@/components/admin/LeadDetailView';
import { AdminLead } from '@/components/admin/types';

export const dynamic = 'force-dynamic';

export default async function LeadPage({ params }: { params: { id: string } }) {
  if (!isAdminFromCookies(cookies())) {
    redirect('/admin/login');
  }
  const lead = (await getLead(params.id)) as unknown as AdminLead | null;
  if (!lead) notFound();
  return <LeadDetailView initialLead={lead} />;
}
