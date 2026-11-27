'use server';
// Server action that remembers the language the person picked.
import { cookies } from 'next/headers';
import { LANGUAGE_COOKIE, isLanguage } from './config';

export async function setLanguage(language: string): Promise<void> {
  if (!isLanguage(language)) return;
  (await cookies()).set(LANGUAGE_COOKIE, language, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
}
