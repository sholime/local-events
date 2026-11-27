// Fixed lists of values used across Local Events.
// Each list is the single source of truth: the TypeScript types,
// the validation schemas and the translations are all built from it.
// To add a value, add it here and give it a label in labels.ts.
// Values are lowercase snake_case, the same as they are stored in the database.

/** UI languages, both in Latin script. */
export const LANGUAGES = ['sr', 'en'] as const;
export type Language = (typeof LANGUAGES)[number];

/**
 * Roles a user can be given. Each role is given for a scope (see SCOPE_TYPES):
 * a super admin for the whole platform, a platform manager or venue admin for one venue,
 * an event manager for one event. Everyone with an account is a plain user without a role.
 */
export const ROLES = ['super_admin', 'platform_manager', 'venue_admin', 'event_manager'] as const;
export type Role = (typeof ROLES)[number];

/** What a role is given for. */
export const SCOPE_TYPES = ['platform', 'venue', 'event'] as const;
export type ScopeType = (typeof SCOPE_TYPES)[number];

/** Kinds of event. New kinds are added in code, each with its own table of specific fields. */
export const EVENT_TYPES = ['concert', 'tournament'] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Where an event is in its life. A copied event starts as a draft. */
export const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'finished'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/**
 * How guests reserve tables at a concert: 'open' confirms at once,
 * 'on_request' waits for a venue admin or the event manager, 'closed' takes no reservations.
 */
export const RESERVATION_MODES = ['open', 'on_request', 'closed'] as const;
export type ReservationMode = (typeof RESERVATION_MODES)[number];

/** 'held' keeps a table for a few minutes while the guest finishes the reservation. */
export const RESERVATION_STATUSES = ['held', 'pending', 'confirmed', 'rejected', 'cancelled', 'no_show'] as const;
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

/** Table shapes offered in the floor plan editor. */
export const TABLE_SHAPES = ['round', 'square', 'rectangle'] as const;
export type TableShape = (typeof TABLE_SHAPES)[number];

/** Tournament formats. Double elimination is the "repasaž": a loss sends you to a second bracket. */
export const TOURNAMENT_FORMATS = ['double_elimination'] as const;
export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];

/** Who plays in a tournament: one person or a team. */
export const PARTICIPANT_KINDS = ['individual', 'team'] as const;
export type ParticipantKind = (typeof PARTICIPANT_KINDS)[number];
