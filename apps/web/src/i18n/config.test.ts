// Tests for language selection.
import { describe, expect, it } from 'vitest';
import { resolveLanguage } from './config';

describe('resolveLanguage', () => {
  it('prefers the saved cookie', () => {
    expect(resolveLanguage('en', 'sr-RS,sr;q=0.9')).toBe('en');
  });
  it('uses the browser language when there is no valid cookie', () => {
    expect(resolveLanguage(undefined, 'de-DE,en-US;q=0.8')).toBe('en');
    expect(resolveLanguage('xx', 'sr-Latn-RS')).toBe('sr');
  });
  it('defaults to Serbian', () => {
    expect(resolveLanguage(undefined, null)).toBe('sr');
    expect(resolveLanguage(undefined, 'de')).toBe('sr');
  });
});
