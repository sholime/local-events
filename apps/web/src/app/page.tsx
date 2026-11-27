// Home page. Will list the venue's upcoming events; for now it greets the person.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/current-user';

export default async function HomePage() {
  const t = await getTranslations('home');
  const user = await getCurrentUser();
  return (
    <section className="stack">
      <h1>{t('title')}</h1>
      <p className="muted">{t('intro')}</p>
      {user ? (
        <p>{t('signedInAs', { name: user.displayName })}</p>
      ) : (
        <p><Link href="/sign-in" className="button">{t('signIn')}</Link></p>
      )}
    </section>
  );
}
