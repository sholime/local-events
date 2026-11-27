// Works out this site's public address, used for links in sign-in emails and OAuth redirects.
import { headers } from 'next/headers';

export async function siteOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? (host?.startsWith('localhost') || host?.startsWith('127.') ? 'http' : 'https');
  return `${proto}://${host}`;
}
