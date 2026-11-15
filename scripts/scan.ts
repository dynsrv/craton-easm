/**
 * Run the scanner from the terminal, without the web UI or the database:
 *   npm run scan -- company.co.id
 * Prints the triaged assets as JSON. Uses the LLM if a key is set in the environment, otherwise the rule engine.
 */
import { generateBrief, triageAssets } from '../lib/ai/triage';
import { discover } from '../lib/scanner';
import { normalizeDomain } from '../lib/scanner/domain';
import { surfaceScore } from '../lib/score';
import { envRuntimeConfig } from '../lib/settings';

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error('Usage: npm run scan -- <root-domain>');
    process.exit(1);
  }
  const domain = normalizeDomain(input);
  const cfg = envRuntimeConfig();
  const result = await discover(domain, (p) => console.error(p.message), { shodanKey: cfg.shodanKey });
  const triage = await triageAssets(cfg, domain, result.assets, (m) => console.error(m));
  const score = surfaceScore(triage.map((t) => t.severity));
  const brief = await generateBrief(cfg, domain, result.assets, triage, score);
  console.log(JSON.stringify({ domain, source: result.source, namesFound: result.namesFound, score, brief, assets: result.assets.map((a, i) => ({ ...a, triage: triage[i] })) }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
