'use client';

import { SiteFooter } from '@/components/site-chrome';
import { ArrowLeft, Printer } from 'lucide-react';
import Link from 'next/link';
import { LangToggle, useLang } from '@/components/dashboard';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { sevName, SEV_PRINT, T } from '@/lib/i18n';
import { grade, SEVERITY_RANK } from '@/lib/score';
import { SEVERITIES, type ScanDTO, type Severity } from '@/lib/types';

const MAX_FINDINGS = 7; // keeps the brief on one A4 page

export function ReportView({ scan }: { scan: ScanDTO }) {
  const [lang, setLang] = useLang();
  const t = T[lang];
  const score = scan.score ?? 100;
  const g = grade(score);
  const color = SEV_PRINT[g.severity];

  const counts = Object.fromEntries(SEVERITIES.map((s) => [s, scan.assets.filter((a) => a.severity === s).length])) as Record<Severity, number>;
  const findings = scan.assets
    .filter((a) => a.severity === 'Critical' || a.severity === 'High')
    .sort((a, b) => SEVERITY_RANK[a.severity!] - SEVERITY_RANK[b.severity!] || a.hostname.localeCompare(b.hostname))
    .slice(0, MAX_FINDINGS);
  const date = new Date(scan.finishedAt ?? scan.createdAt).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="mx-auto flex max-w-[230mm] flex-col gap-5 px-4 py-6 print:max-w-none print:p-0">
      <div className="no-print flex flex-wrap items-center justify-between gap-2.5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
          <ArrowLeft className="size-4" />
          {t.back}
        </Link>
        <div className="flex items-center gap-2.5">
          <LangToggle lang={lang} setLang={setLang} />
          <ThemeToggle />
          <Button onClick={() => window.print()}>
            <Printer />
            {t.exportPdf}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto print:overflow-visible">
        <article className="sheet">
          <div className="flex items-start justify-between gap-[8mm] border-b-2 border-[#111418] pb-[4mm]">
            <div>
              <div className="text-[8.5pt] font-semibold tracking-[0.16em] text-[#2d72d2]">CRATON EASM</div>
              <h1 className="mt-[1mm] text-[20pt] font-semibold leading-tight tracking-tight">{t.rTitle}</h1>
            </div>
            <div className="text-right font-mono text-[9pt] text-[#5f6b7c]">
              {t.rFor}: <b className="text-[#111418]">{scan.domain}</b>
              <br />
              {t.rDate}: {date}
              <br />
              {t.rConf}
            </div>
          </div>

          <div className="grid grid-cols-[44mm_1fr] items-center gap-[8mm]">
            <div>
              <div className="tabular text-[40pt] font-semibold leading-none tracking-tight" style={{ color }}>
                {score}
                <span className="text-[13pt] text-[#5f6b7c]"> /100</span>
              </div>
              <div className="font-semibold" style={{ color }}>{t[g.key]}</div>
              <div className="text-[8pt] text-[#5f6b7c]">{t.score}</div>
            </div>
            <div>
              <p>{scan.brief?.summary[lang]}</p>
              <div className="mt-[3mm] grid grid-cols-5 gap-[2mm]">
                {SEVERITIES.map((s) => (
                  <div key={s} className="border-t-[3px] pt-[1mm] text-[8.5pt] text-[#5f6b7c]" style={{ borderColor: SEV_PRINT[s] }}>
                    <b className="tabular block text-[15pt] font-bold leading-tight text-[#111418]">{counts[s]}</b>
                    {sevName(s, lang)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {scan.brief && scan.brief.topFixes.length > 0 && (
            <div>
              <h2>{t.fixes}</h2>
              <ol className="flex list-decimal flex-col gap-[1.5mm] pl-[5mm]">
                {scan.brief.topFixes.map((f, i) => (
                  <li key={i}>
                    <b>{f.title[lang]}.</b> {f.detail[lang]}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {scan.attackPaths[0] && (
            <div>
              <h2>{lang === 'id' ? 'Jalur serangan paling mungkin' : 'Most likely attack path'}</h2>
              <p>
                <b>{scan.attackPaths[0].title[lang]}.</b> {scan.attackPaths[0].nodes.map((n) => n.label[lang]).join(' → ')}.{' '}
                <span style={{ color: '#1c6e42' }}>
                  <b>{lang === 'id' ? 'Putus rantai' : 'Break the chain'}:</b> {scan.attackPaths[0].chokePoint.action[lang]}
                </span>
              </p>
            </div>
          )}

          <div>
            <h2>{t.rFindings}</h2>
            {findings.length === 0 ? (
              <p>{t.rNoFindings}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>{t.cSev}</th>
                    <th>{t.cHost}</th>
                    <th>{t.rAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((a) => (
                    <tr key={a.id}>
                      <td className="whitespace-nowrap text-[8.5pt] font-semibold" style={{ color: SEV_PRINT[a.severity!] }}>
                        {sevName(a.severity!, lang)}
                      </td>
                      <td className="font-mono">{a.hostname}</td>
                      <td>{a.remediation?.[lang]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="rounded-[2mm] bg-[#eef4fc] px-[4mm] py-[3mm] text-[9.5pt]">{t.rCta}</div>

          <div className="mt-auto border-t border-[#d3d8de] pt-[3mm] text-[8.5pt] text-[#5f6b7c]">
            <b>{t.rMethod}.</b> {t.rMethodTxt}
          </div>
        </article>
      </div>
      <SiteFooter lang={lang} className="-mx-4 mt-2" />
    </div>
  );
}
