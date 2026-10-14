-- Zatwierdzenie jest jawne i atomowe z publikacją planu; ponowienie zwraca tę samą wersję.
alter table public.imports drop constraint imports_status_check;
alter table public.imports add constraint imports_status_check check (status in ('upload_pending','uploaded','processing','needs_review','failed','cancelled','committed'));
alter table public.imports add column approved_operation_id uuid, add column committed_plan_id uuid, add column committed_version_id uuid;
alter table public.imports add constraint imports_committed_consistency check (
  (status='committed') = (approved_operation_id is not null and committed_plan_id is not null and committed_version_id is not null));
alter table public.imports add constraint imports_committed_plan_fk foreign key (committed_plan_id,owner_id) references public.plans(id,owner_id);
alter table public.imports add constraint imports_committed_version_fk foreign key (committed_version_id,owner_id,committed_plan_id) references public.plan_versions(id,owner_id,plan_id);

create function public.mark_approved_import_source() returns trigger language plpgsql set search_path = '' as $$
begin
  if nullif(pg_catalog.current_setting('app.import_approval',true),'') is not null then new.source_kind := 'import'; end if;
  return new;
end $$;
create trigger mark_approved_import_source before insert on public.plan_versions
  for each row execute function public.mark_approved_import_source();

create function public.approve_import_job(p_id uuid,p_operation_id uuid,p_document jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v public.imports; r jsonb;
begin
  if v_owner is null then raise exception 'unauthorized' using errcode='28000'; end if;
  select * into v from public.imports where id=p_id and owner_id=v_owner for update;
  if not found then raise exception 'not_found' using errcode='P0002'; end if;
  if v.status='committed' then
    if v.approved_operation_id <> p_operation_id then raise exception 'approval_conflict' using errcode='23505'; end if;
    return jsonb_build_object('planId',v.committed_plan_id,'versionId',v.committed_version_id);
  end if;
  if v.status<>'needs_review' then raise exception 'invalid_state' using errcode='P0001'; end if;
  perform pg_catalog.set_config('app.import_approval',p_id::text,true);
  r := public.save_manual_plan(p_operation_id,null,null,p_document);
  perform pg_catalog.set_config('app.import_approval','',true);
  update public.imports set status='committed',approved_operation_id=p_operation_id,
    committed_plan_id=(r->>'planId')::uuid,committed_version_id=(r->>'versionId')::uuid,updated_at=now()
    where id=p_id and owner_id=v_owner;
  return r;
end $$;
revoke all on function public.approve_import_job(uuid,uuid,jsonb) from public, anon;
grant execute on function public.approve_import_job(uuid,uuid,jsonb) to authenticated;
