// Sign-in page.
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/current-user';
import { safeRedirectPath } from '@/lib/safe-redirect';
import { SignInForm } from './sign-in-form';

const ERRORS = ['failed', 'linkExpired'] as const;

export default async function SignInPage({ searchParams }: PageProps<'/sign-in'>) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === 'string' ? safeRedirectPath(next) : undefined;
  if (await getCurrentUser()) redirect((nextPath ?? '/') as never);

  const t = await getTranslations('signIn');
  const errorKey = ERRORS.find((key) => key === error);
  return (
    <section className="stack">
      <h1>{t('title')}</h1>
      <p className="muted">{t('intro')}</p>
      {errorKey && <p className="notice error" role="alert">{t(errorKey)}</p>}
      <SignInForm next={nextPath} />
    </section>
  );
}
