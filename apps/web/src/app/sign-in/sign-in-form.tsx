'use client';
// Sign-in form: email link and Google button.
import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { signInWithEmail, signInWithGoogle, type SignInState } from './actions';

export function SignInForm({ next }: { next?: string }) {
  const t = useTranslations('signIn');
  const [state, action, pending] = useActionState<SignInState, FormData>(signInWithEmail, { status: 'idle' });

  if (state.status === 'sent') {
    return <p className="notice">{t('linkSent', { email: state.email })}</p>;
  }
  return (
    <div className="stack">
      <form action={action} className="stack">
        <label className="stack">
          <span>{t('email')}</span>
          <input type="email" name="email" autoComplete="email" required />
        </label>
        {next && <input type="hidden" name="next" value={next} />}
        {state.status === 'error' && <p className="notice error" role="alert">{t(state.error)}</p>}
        <button className="button" type="submit" disabled={pending}>{pending ? t('sending') : t('sendLink')}</button>
      </form>
      <p className="divider">{t('or')}</p>
      <form action={signInWithGoogle}>
        {next && <input type="hidden" name="next" value={next} />}
        <button className="button secondary" type="submit" style={{ width: '100%' }}>{t('google')}</button>
      </form>
    </div>
  );
}
