-- Publikacja planu wraz z katalogiem tylko przez save_manual_plan / approve_import_job.
-- RLS nadal ogranicza odczyt. SECURITY DEFINER istniejących komend zachowuje zapis.
-- Profile i dopisywane 1RM mają odrębne, używane przez aplikację ścieżki zapisu.
begin;
revoke insert, update, delete on table public.exercises, public.plans,
  public.plan_versions, public.plan_sessions, public.planned_exercises,
  public.planned_sets from authenticated;
commit;
