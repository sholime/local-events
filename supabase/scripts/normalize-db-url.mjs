// Rebuilds a Postgres connection string so the password is percent-encoded exactly once.
// Passwords pasted into a URL often contain characters such as @ # / ? % that must be
// encoded; this keeps the deploy working whether or not they already are. It prints only
// safe hints about the password (never the password itself) and writes the fixed URL to
// the file named by GITHUB_ENV as SUPABASE_DB_URL_NORMALIZED.
import { appendFileSync } from 'node:fs';

const raw = (process.env.SUPABASE_DB_URL ?? '').trim().replace(/^["']|["']$/g, '');
const match = raw.match(/^(postgres(?:ql)?:\/\/)(.*)@([^@]+)$/s);
if (!match) {
  console.log('::error::SUPABASE_DB_URL does not look like postgresql://user:password@host:port/db');
  process.exit(1);
}
const [, scheme, userInfo, hostPart] = match;
const colon = userInfo.indexOf(':');
if (colon < 0) {
  console.log('::error::SUPABASE_DB_URL has no password (expected user:password before @).');
  process.exit(1);
}
const user = userInfo.slice(0, colon);
let password = userInfo.slice(colon + 1);
try {
  password = decodeURIComponent(password);
} catch {
  // Not valid percent-encoding, so it is a raw password; use it as it is.
}

const hints = [`password length ${password.length}`];
if (/YOUR-PASSWORD/i.test(password)) hints.push('still contains the [YOUR-PASSWORD] placeholder');
if (/^\[.*\]$/.test(password)) hints.push('is wrapped in [ ] brackets');
if (/\s/.test(password)) hints.push('contains whitespace');
if (/[^A-Za-z0-9]/.test(password)) hints.push('contains special characters (now encoded)');
console.log(`User ${user}, host ${hostPart}; ${hints.join(', ')}.`);

const encoded = encodeURIComponent(password);
console.log(`::add-mask::${encoded}`);
appendFileSync(process.env.GITHUB_ENV, `SUPABASE_DB_URL_NORMALIZED=${scheme}${user}:${encoded}@${hostPart}\n`);
