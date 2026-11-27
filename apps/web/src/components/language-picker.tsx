'use client';
// Lets the person switch between Serbian and English; the choice is saved in a cookie.
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LANGUAGES } from '@local-events/shared';
import { setLanguage } from '@/i18n/actions';

export function LanguagePicker() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select
      aria-label={t('language')}
      value={locale}
      disabled={pending}
      onChange={(event) => {
        const language = event.target.value;
        startTransition(async () => {
          await setLanguage(language);
          router.refresh();
        });
      }}
    >
      {LANGUAGES.map((language) => (
        <option key={language} value={language}>{language.toUpperCase()}</option>
      ))}
    </select>
  );
}
