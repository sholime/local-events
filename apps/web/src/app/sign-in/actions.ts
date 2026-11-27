'use server';
// Server actions for signing in: an emailed one-time link, or Google.
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { siteOrigin } from '@/lib/origin';
import { safeRedirectPath } from '@/lib/safe-redirect';

export type SignInState =
  | { status: 'idle' }
  | { status: 'sent'; email: string }
  | { status: 'error'; error: 'invalidEmail' | 'failed' };

const EmailForm = z.object({ email: z.email(), next: z.string().optional() });

function callbackUrl(origin: string, next: string | undefined): string {
  return `${origin}/auth/callback?next=${encodeURIComponent(safeRedirectPath(next))}`;
}

export async function signInWithEmail(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = EmailForm.safeParse({ email: formData.get('email'), next: formData.get('next') ?? undefined });
  if (!parsed.success) return { status: 'error', error: 'invalidEmail' };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: callbackUrl(await siteOrigin(), parsed.data.next) },
  });
  if (error) return { status: 'error', error: 'failed' };
  return { status: 'sent', email: parsed.data.email };
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = formData.get('next');
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: callbackUrl(await siteOrigin(), typeof next === 'string' ? next : undefined) },
  });
  if (error || !data.url) redirect('/sign-in?error=failed');
  redirect(data.url as never);
}
