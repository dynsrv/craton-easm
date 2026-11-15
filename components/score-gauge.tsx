import { SEV_VAR, type Dict } from '@/lib/i18n';
import { grade } from '@/lib/score';

export function ScoreGauge({ score, t }: { score: number; t: Dict }) {
  const g = grade(score);
  const color = SEV_VAR[g.severity];
  const len = Math.PI * 80;
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="208" height="114" viewBox="0 0 208 114" role="img" aria-label={`${t.score}: ${score} ${t.of}`}>
          <path d="M24 104a80 80 0 0 1 160 0" fill="none" stroke="var(--color-panel2)" strokeWidth="14" strokeLinecap="round" />
          {score > 0 && (
            <path d="M24 104a80 80 0 0 1 160 0" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(len * score) / 100} ${len}`} />
          )}
        </svg>
        <div className="absolute inset-x-0 bottom-0 text-center">
          <div className="tabular text-[44px] font-semibold leading-none tracking-tight">{score}</div>
          <div className="mt-1 text-xs text-muted">{t.of}</div>
        </div>
      </div>
      <div className="mt-4 inline-flex h-6 items-center rounded-sm border px-2.5 text-xs font-medium" style={{ color, borderColor: color }}>
        {t[g.key]}
      </div>
    </div>
  );
}
