// Serbian (Latin) and English words for every fixed value in enums.ts, for showing in the app.
// The types below list every value, so TypeScript reports an error until each new value
// has a label in both languages.

import type {
  EventStatus,
  EventType,
  Language,
  ParticipantKind,
  ReservationMode,
  ReservationStatus,
  Role,
  TableShape,
  TournamentFormat,
} from './enums.ts';

export type Labels = {
  language: Record<Language, string>;
  role: Record<Role, string>;
  eventType: Record<EventType, string>;
  eventStatus: Record<EventStatus, string>;
  reservationMode: Record<ReservationMode, string>;
  reservationStatus: Record<ReservationStatus, string>;
  tableShape: Record<TableShape, string>;
  tournamentFormat: Record<TournamentFormat, string>;
  participantKind: Record<ParticipantKind, string>;
};

export const LABELS: Record<Language, Labels> = {
  sr: {
    language: { sr: 'Srpski', en: 'English' },
    role: {
      super_admin: 'Super Admin',
      platform_manager: 'Platform Manager',
      venue_admin: 'Venue Admin',
      event_manager: 'Event Manager',
    },
    eventType: { concert: 'Svirka', tournament: 'Turnir' },
    eventStatus: { draft: 'Nacrt', published: 'Objavljen', cancelled: 'Otkazan', finished: 'Završen' },
    reservationMode: { open: 'Slobodna rezervacija', on_request: 'Rezervacija na zahtev', closed: 'Bez rezervacija' },
    reservationStatus: {
      held: 'Zadržano',
      pending: 'Na čekanju',
      confirmed: 'Potvrđeno',
      rejected: 'Odbijeno',
      cancelled: 'Otkazano',
      no_show: 'Nije došao',
    },
    tableShape: { round: 'Okrugli', square: 'Kvadratni', rectangle: 'Pravougaoni' },
    tournamentFormat: { double_elimination: 'Repasaž' },
    participantKind: { individual: 'Pojedinac', team: 'Tim' },
  },
  en: {
    language: { sr: 'Srpski', en: 'English' },
    role: {
      super_admin: 'Super Admin',
      platform_manager: 'Platform Manager',
      venue_admin: 'Venue Admin',
      event_manager: 'Event Manager',
    },
    eventType: { concert: 'Concert', tournament: 'Tournament' },
    eventStatus: { draft: 'Draft', published: 'Published', cancelled: 'Cancelled', finished: 'Finished' },
    reservationMode: { open: 'Open reservations', on_request: 'Reservations on request', closed: 'No reservations' },
    reservationStatus: {
      held: 'Held',
      pending: 'Pending',
      confirmed: 'Confirmed',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      no_show: 'No-show',
    },
    tableShape: { round: 'Round', square: 'Square', rectangle: 'Rectangle' },
    tournamentFormat: { double_elimination: 'Double elimination' },
    participantKind: { individual: 'Individual', team: 'Team' },
  },
};
