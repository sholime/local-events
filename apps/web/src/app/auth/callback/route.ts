// Where the emailed link and Google send the person back: turns the one-time code into a session.
import { NextResponse, type NextRequest } from 'next/server';
import { siteOrigin } from '@/lib/origin';
import { createClient } from '@/lib/supabase/server';
import { safeRedirectPath } from '@/lib/safe-redirect';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  // Use the address the browser used, so the session cookie lands on the right host.
  const origin = await siteOrigin();
  const code = searchParams.get('code');
  const next = safeRedirectPath(searchParams.get('next'));
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL('/sign-in?error=linkExpired', origin));
}
