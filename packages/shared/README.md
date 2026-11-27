# @local-events/shared

Common TypeScript types, validation schemas and translations used by the Local Events apps.

## What is in here

| File | What it holds |
| --- | --- |
| `src/enums.ts` | Fixed lists of values: languages, roles, event types and statuses, reservation modes, table shapes |
| `src/schemas.ts` | Validation schemas built with [Zod](https://zod.dev): one schema gives a runtime check and a TypeScript type |
| `src/labels.ts` | Serbian (Latin) and English words for every fixed value |
| `src/index.ts` | Exports everything above |

```ts
import { EventTypeSchema, LABELS } from '@local-events/shared';

const type = EventTypeSchema.parse(input); // throws if invalid
const label = LABELS.sr.eventType[type]; // e.g. "Turnir"
```

Apps import the TypeScript source directly (no build step), because it lives in the same repository.

## Adding a new value (for example an event type)

1. Add it to the list in `src/enums.ts`.
2. Add its Serbian and English label in `src/labels.ts`. TypeScript reports an error until you do.
3. Run `npm test` and `npm run typecheck` from the repository root.
