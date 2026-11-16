import * as React from 'react';

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Renders text with every occurrence of the assessed domain lightly highlighted. */
export function DomainText({ text, domain }: { text: string; domain: string }) {
  if (!domain) return <>{text}</>;
  const parts = text.split(new RegExp(`(${esc(domain)})`, 'gi'));
  return (
    <>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} className="domain-hl">{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>))}
    </>
  );
}
