// Checks that every fixed value has a non-empty label in every language.

import { describe, expect, it } from 'vitest';
import { LANGUAGES } from './enums.ts';
import { LABELS } from './labels.ts';

describe('labels', () => {
  for (const language of LANGUAGES) {
    it(`has a label for every value in ${language}`, () => {
      for (const [group, values] of Object.entries(LABELS[language])) {
        for (const [value, label] of Object.entries(values)) {
          expect(label.trim(), `${language}.${group}.${value}`).not.toBe('');
        }
      }
    });
  }

  it('has the same values in every language', () => {
    const keys = (language: (typeof LANGUAGES)[number]) =>
      Object.entries(LABELS[language]).map(([group, values]) => [group, Object.keys(values).sort()]);
    expect(keys('en')).toEqual(keys('sr'));
  });
});
