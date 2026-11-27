-- A UUID version 7 generator, used as the default id of every table.
-- Version 7 ids start with the time they were made (in milliseconds), so sorting by id
-- sorts by creation time, the same as the report ids in OdorMap.
-- Postgres 17 has no built-in uuidv7() yet (it arrives in Postgres 18).

create function public.uuid_v7()
returns uuid
language sql
volatile
set search_path = ''
as $$
  -- Take a random (version 4) UUID, put the current time in milliseconds in its first
  -- 6 bytes, and switch the version bits from 4 (0100) to 7 (0111).
  select encode(
    set_bit(
      set_bit(
        overlay(
          uuid_send(gen_random_uuid())
          placing substring(int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3)
          from 1 for 6
        ),
        52, 1
      ),
      53, 1
    ),
    'hex'
  )::uuid;
$$;

comment on function public.uuid_v7() is 'A new UUID version 7 (time-ordered), e.g. 019ac6f2-3b1e-7d4a-9c0b-5e2f8a1d3c47.';
