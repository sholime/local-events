// Tests for safeRedirectPath.
import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './safe-redirect';

describe('safeRedirectPath', () => {
  it('keeps paths inside the app', () => {
    expect(safeRedirectPath('/events/1?tab=info')).toBe('/events/1?tab=info');
  });
  it('falls back for missing or outside targets', () => {
    for (const next of [null, undefined, '', 'https://evil.example', '//evil.example', '/\\evil.example']) {
      expect(safeRedirectPath(next)).toBe('/');
    }
  });
});
