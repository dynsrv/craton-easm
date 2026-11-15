import { notFound } from 'next/navigation';
import { ReportView } from '@/components/report-view';
import { loadScanDTO } from '@/lib/run-scan';
import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await loadScanDTO(id);
  if (!scan || scan.status !== 'completed') notFound();
  return <ReportView scan={scan} />;
}
