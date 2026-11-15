import { SEV_VAR, type Dict } from '@/lib/i18n';
import { grade } from '@/lib/score';

export function ScoreGauge({ score, t }: { score: number; t: Dict }) {
  const g = grade(score);
  const color = SEV_VAR[g.severity];
  const len = Math.PI * 70;
  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="112" viewBox="0 0 200 112" role="img" aria-label={`${t.score}: ${score} ${t.of}`}>
        <path d="M30 100a70 70 0 0 1 140 0" fill="none" stroke="var(--color-line)" strokeWidth="14" strokeLinecap="round" />
        <path d="M30 100a70 70 0 0 1 140 0" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(len * score) / 100} ${len}`} />
        <text x="26" y="111" fill="var(--color-muted)" fontSize="10" fontFamily="var(--font-mono)">0</text>
        <text x="162" y="111" fill="var(--color-muted)" fontSize="10" fontFamily="var(--font-mono)">100</text>
      </svg>
      <div className="-mt-[62px] text-center">
        <div className="tabular text-[46px] font-bold leading-none">{score}</div>
        <div className="text-[13px] text-muted">{t.of}</div>
      </div>
      <div className="mt-3 rounded-sm border px-2.5 py-0.5 text-[13px] font-semibold" style={{ color, borderColor: color }}>
        {t[g.key]}
      </div>
    </div>
  );
}
