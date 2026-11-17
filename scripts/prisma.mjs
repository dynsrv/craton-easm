// Picks the Prisma schema that matches DATABASE_URL, then runs `prisma generate` or `prisma db push`.
//   file:...      -> SQLite copy of prisma/schema.prisma (local, zero config)
//   postgres://   -> prisma/schema.prisma as is (Vercel, Neon, Supabase)
//   not set       -> generate only (so a build without a database still succeeds)
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const mode = process.argv[2];
if (mode !== 'generate' && mode !== 'push') {
  console.error('Usage: node scripts/prisma.mjs <generate|push>');
  process.exit(1);
}

function fromDotEnv(key) {
  if (!existsSync('.env')) return undefined;
  const line = readFileSync('.env', 'utf8').split('\n').find((l) => l.trim().startsWith(`${key}=`));
  return line?.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '');
}

const url = process.env.DATABASE_URL || fromDotEnv('DATABASE_URL');
let schema = 'prisma/schema.prisma';
if (url?.startsWith('file:')) {
  schema = 'prisma/schema.sqlite.prisma';
  writeFileSync(schema, readFileSync('prisma/schema.prisma', 'utf8').replace('provider = "postgresql"', 'provider = "sqlite"'));
}

const env = { ...process.env };
let args = ['prisma', 'generate', '--schema', schema];
if (mode === 'push') {
  if (!url) {
    console.log('[craton] DATABASE_URL is not set: skipping schema push.');
    process.exit(0);
  }
  // Schema changes need a direct connection, not a pooler (Neon and Supabase expose both).
  if (!url.startsWith('file:')) env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED || process.env.POSTGRES_URL_NON_POOLING || url;
  args = ['prisma', 'db', 'push', '--schema', schema, '--skip-generate'];
}
const res = spawnSync('npx', args, { stdio: 'inherit', env, shell: process.platform === 'win32' });
process.exit(res.status ?? 1);
