// Supported UI languages and how the current one is chosen.
import { LANGUAGES, type Language } from '@local-events/shared';

export const DEFAULT_LANGUAGE: Language = 'sr';
export const LANGUAGE_COOKIE = 'NEXT_LOCALE';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Picks the language: saved cookie first, then the browser's Accept-Language, then Serbian. */
export function resolveLanguage(cookieValue: string | undefined, acceptLanguage: string | null): Language {
  if (isLanguage(cookieValue)) return cookieValue;
  const preferred = (acceptLanguage ?? '')
    .split(',')
    .map((part) => part.split(';')[0].trim().slice(0, 2).toLowerCase());
  return preferred.find(isLanguage) ?? DEFAULT_LANGUAGE;
}
