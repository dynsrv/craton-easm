import { notFound } from 'next/navigation';
import { ReportView } from '@/components/report-view';
import { loadScanDTO } from '@/lib/run-scan';

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await loadScanDTO(id);
  if (!scan || scan.status !== 'completed') notFound();
  return <ReportView scan={scan} />;
}
