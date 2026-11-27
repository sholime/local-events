// Root layout: language, translations and the header shared by every page.
import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import { Header } from '@/components/header';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('app');
  return { title: t('name'), description: t('description') };
}

export const viewport: Viewport = { themeColor: '#b4442c', width: 'device-width', initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <Header />
          <main className="container">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
