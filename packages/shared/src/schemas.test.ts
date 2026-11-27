import { describe, expect, it } from 'vitest';
import { EventTypeSchema, Id, LanguageSchema, Timestamp } from './schemas.ts';

describe('schemas', () => {
  it('accepts a UUID version 7 id and refuses other versions', () => {
    expect(Id.safeParse('019a9a3c-6b1e-7000-8000-000000000001').success).toBe(true);
    expect(Id.safeParse('6f1c2b1e-1d2a-4c3b-8a9d-0e1f2a3b4c5d').success).toBe(false);
  });

  it('accepts only known languages and event types', () => {
    expect(LanguageSchema.safeParse('sr').success).toBe(true);
    expect(LanguageSchema.safeParse('hu').success).toBe(false);
    expect(EventTypeSchema.safeParse('tournament').success).toBe(true);
    expect(EventTypeSchema.safeParse('quiz').success).toBe(false);
  });

  it('accepts UTC times', () => {
    expect(Timestamp.safeParse('2026-11-27T19:30:00Z').success).toBe(true);
    expect(Timestamp.safeParse('27.11.2026.').success).toBe(false);
  });
});
