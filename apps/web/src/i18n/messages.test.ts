// Checks that every language file has exactly the same keys, so no text is missing in either language.
import { describe, expect, it } from 'vitest';
import en from '../../messages/en.json';
import sr from '../../messages/sr.json';

function keys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
}

describe('translations', () => {
  it('sr and en have the same keys', () => {
    expect(keys(en).sort()).toEqual(keys(sr).sort());
  });
});
