-- Enable Row-Level Security on every public table.
--
-- Why: Supabase auto-exposes the `public` schema through its Data API (PostgREST)
-- using the public anon key. With RLS off, anyone could read/write these tables
-- directly, bypassing the app. Pickova connects via Prisma as the `postgres`
-- table-owner role, which BYPASSES RLS — so enabling RLS with no policies fully
-- locks the anon Data API while leaving the app untouched.
--
-- Run after any schema change that adds a new table:
--   npx prisma db execute --file prisma/rls.sql --schema prisma/schema.prisma

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
  END LOOP;
END $$;
