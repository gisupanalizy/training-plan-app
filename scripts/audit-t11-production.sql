select jsonb_build_object(
 'tables', (select jsonb_agg(jsonb_build_object('name',c.relname,'rls',c.relrowsecurity) order by c.relname) from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r'),
 'dml_grants', (select coalesce(jsonb_agg(jsonb_build_object('table',table_name,'role',grantee,'privilege',privilege_type)), '[]'::jsonb) from information_schema.role_table_grants where table_schema='public' and table_name in ('exercises','plans','plan_versions','plan_sessions','planned_exercises','planned_sets','workout_sessions','performed_exercises','performed_sets','mutation_receipts','workout_revisions','plan_save_receipts') and grantee in ('anon','authenticated') and privilege_type in ('INSERT','UPDATE','DELETE')),
 'buckets', (select jsonb_agg(jsonb_build_object('id',id,'public',public,'file_size_limit',file_size_limit,'allowed_mime_types',allowed_mime_types)) from storage.buckets),
 'migrations', (select jsonb_agg(version order by version) from supabase_migrations.schema_migrations)
) as audit;
