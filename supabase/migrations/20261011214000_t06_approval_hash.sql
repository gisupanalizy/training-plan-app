-- Ponowienie zatwierdzenia z tym samym ID i zmienionym dokumentem musi być konfliktem.
alter table public.imports add column approved_payload_hash text;
create or replace function public.approve_import_job(p_id uuid,p_operation_id uuid,p_document jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_owner uuid := auth.uid(); v public.imports; r jsonb; v_hash text;
begin
  if v_owner is null then raise exception 'unauthorized' using errcode='28000'; end if;
  v_hash := pg_catalog.encode(extensions.digest(p_document::text,'sha256'),'hex');
  select * into v from public.imports where id=p_id and owner_id=v_owner for update;
  if not found then raise exception 'not_found' using errcode='P0002'; end if;
  if v.status='committed' then
    if v.approved_operation_id <> p_operation_id or v.approved_payload_hash <> v_hash then
      raise exception 'approval_conflict' using errcode='23505';
    end if;
    return jsonb_build_object('planId',v.committed_plan_id,'versionId',v.committed_version_id);
  end if;
  if v.status<>'needs_review' then raise exception 'invalid_state' using errcode='P0001'; end if;
  perform pg_catalog.set_config('app.import_approval',p_id::text,true);
  r := public.save_manual_plan(p_operation_id,null,null,p_document);
  perform pg_catalog.set_config('app.import_approval','',true);
  update public.imports set status='committed',approved_operation_id=p_operation_id,approved_payload_hash=v_hash,
    committed_plan_id=(r->>'planId')::uuid,committed_version_id=(r->>'versionId')::uuid,updated_at=now()
    where id=p_id and owner_id=v_owner;
  return r;
end $$;
