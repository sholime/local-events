// Top bar: app name, language picker and sign-in or sign-out.
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/current-user';
import { LanguagePicker } from './language-picker';

export async function Header() {
  const t = await getTranslations();
  const user = await getCurrentUser();
  return (
    <header className="container header">
      <Link href="/" className="brand">{t('app.name')}</Link>
      <nav>
        <LanguagePicker />
        {user ? (
          <form action="/auth/sign-out" method="post">
            <button className="button secondary" type="submit">{t('header.signOut')}</button>
          </form>
        ) : (
          <Link href="/sign-in" className="button secondary">{t('header.signIn')}</Link>
        )}
      </nav>
    </header>
  );
}
