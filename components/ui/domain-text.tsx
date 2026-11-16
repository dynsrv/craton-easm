import * as React from 'react';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Renders text with the assessed domain highlighted, together with any subdomain labels in front of it
 * (`tms-stage.telkom.co.id`), as one continuous highlight so hosts read as a unit.
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
    out.push(
      <span key={k++} className="domain-hl">
        {m[0]}
      </span>,
    );
    last = start + m[0].length;
  }
  if (last < text.length) out.push(<React.Fragment key={k++}>{text.slice(last)}</React.Fragment>);
  return <>{out}</>;
}
