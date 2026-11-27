// Tells next-intl which language and messages to use for each request.
import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LANGUAGE_COOKIE, resolveLanguage } from './config';

export default getRequestConfig(async () => {
  const locale = resolveLanguage(
    (await cookies()).get(LANGUAGE_COOKIE)?.value,
    (await headers()).get('accept-language'),
  );
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
