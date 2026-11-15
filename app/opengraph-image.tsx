import { ImageResponse } from 'next/og';

export const alt = 'Craton EASM: see your company the way an attacker does';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BLUE = '#2d72d2';

/** Link preview card shown when the site is shared on LinkedIn, WhatsApp, Slack or X. */
export default function OpengraphImage() {
  const bar = (w: number, o: number) => <div style={{ width: w, height: 22, borderRadius: 5, background: BLUE, opacity: o }} />;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#111418', color: '#f6f7f9', padding: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bar(110, 1)}
            {bar(78, 0.7)}
            {bar(110, 0.4)}
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 8 }}>CRATON</div>
          <div style={{ fontSize: 30, letterSpacing: 5, color: '#8f99a8', borderLeft: '2px solid #2f343c', paddingLeft: 24 }}>EASM</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>See your company the way an attacker does</div>
          <div style={{ fontSize: 30, color: '#abb3bf', maxWidth: 980, lineHeight: 1.4 }}>
            Forgotten subdomains, exposed services, takeover risks, leaked code and open storage, with a bilingual brief on what to fix first.
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#8f99a8' }}>security.digitalstrategy.id</div>
      </div>
    ),
    size,
  );
}
