import { notFound } from 'next/navigation';
import { ReportView } from '@/components/report-view';
import { prisma } from '@/lib/db';
import { toScanDTO } from '@/lib/run-scan';

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await prisma.scan.findUnique({ where: { id }, include: { assets: true } });
  if (!scan || scan.status !== 'completed') notFound();
  return <ReportView scan={toScanDTO(scan)} />;
}
