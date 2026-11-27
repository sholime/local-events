// Loads the signed-in person's profile, or null when nobody is signed in.
import { createClient } from './supabase/server';

export type CurrentUser = { id: string; email: string; displayName: string };

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('users').select('display_name').eq('id', user.id).maybeSingle();
  return { id: user.id, email: user.email ?? '', displayName: profile?.display_name ?? user.email ?? '' };
}
