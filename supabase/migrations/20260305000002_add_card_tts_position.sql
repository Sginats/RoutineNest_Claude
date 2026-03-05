-- RoutineNest — STEP 15: Add tts_text and position columns to cards table
-- tts_text: text spoken by TTS engine (AAC cards); falls back to label if null
-- position: explicit ordering for the parent card list / reorder buttons

alter table public.cards add column tts_text text;
alter table public.cards add column position integer not null default 0;
