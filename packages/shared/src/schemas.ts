// Shapes of the data sent between the app and the database layer.
//
// Each schema does two jobs:
//   1. At runtime it validates data, e.g. `Language.parse(body.language)`.
//   2. At compile time it gives a TypeScript type, e.g. `Id`.
//
// Field names are camelCase because this is JSON. The database uses snake_case;
// only the db/ layer converts between the two.
// Times are ISO 8601 strings in UTC, e.g. "2026-11-27T19:30:00Z".

import { z } from 'zod';
import {
  EVENT_STATUSES,
  EVENT_TYPES,
  LANGUAGES,
  PARTICIPANT_KINDS,
  RESERVATION_MODES,
  RESERVATION_STATUSES,
  ROLES,
  SCOPE_TYPES,
  TABLE_SHAPES,
  TOURNAMENT_FORMATS,
} from './enums.ts';

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

/** Every row's id is a UUID version 7, which starts with the time it was made. */
export const Id = z.uuid({ version: 'v7' });
export type Id = z.infer<typeof Id>;

export const Timestamp = z.iso.datetime();
export type Timestamp = z.infer<typeof Timestamp>;

// Schemas for the fixed lists in enums.ts. They end in "Schema" because
// enums.ts already uses the plain names for the TypeScript types.
export const LanguageSchema = z.enum(LANGUAGES);
export const RoleSchema = z.enum(ROLES);
export const ScopeTypeSchema = z.enum(SCOPE_TYPES);
export const EventTypeSchema = z.enum(EVENT_TYPES);
export const EventStatusSchema = z.enum(EVENT_STATUSES);
export const ReservationModeSchema = z.enum(RESERVATION_MODES);
export const ReservationStatusSchema = z.enum(RESERVATION_STATUSES);
export const TableShapeSchema = z.enum(TABLE_SHAPES);
export const TournamentFormatSchema = z.enum(TOURNAMENT_FORMATS);
export const ParticipantKindSchema = z.enum(PARTICIPANT_KINDS);
