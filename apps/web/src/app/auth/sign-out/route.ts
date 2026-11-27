// Signs the person out and returns them to the home page.
import { NextResponse, type NextRequest } from 'next/server';
import { siteOrigin } from '@/lib/origin';
import { createClient } from '@/lib/supabase/server';

export async function POST(_request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', await siteOrigin()), { status: 303 });
}
