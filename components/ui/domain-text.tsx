import * as React from 'react';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Renders text with the assessed domain highlighted, and any subdomain labels in front of it
 * (`tms-stage` in `tms-stage.telkom.co.id`) in a second tint, so hosts are readable at a glance.
 */
export function DomainText({ text, domain }: { text: string; domain: string }) {
  if (!domain) return <>{text}</>;
  const re = new RegExp(`((?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+)?(${esc(domain)})`, 'gi');
  const out: React.ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > last) out.push(<React.Fragment key={k++}>{text.slice(last, start)}</React.Fragment>);
    if (m[1]) {
      out.push(
        <React.Fragment key={k++}>
          <span className="sub-hl">{m[1].slice(0, -1)}</span>.
        </React.Fragment>,
      );
    }
    out.push(
      <span key={k++} className="domain-hl">
        {m[2]}
      </span>,
    );
    last = start + m[0].length;
  }
  if (last < text.length) out.push(<React.Fragment key={k++}>{text.slice(last)}</React.Fragment>);
  return <>{out}</>;
}
