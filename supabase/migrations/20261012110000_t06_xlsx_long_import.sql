-- T06: natywny XLSX i dłuższa dzierżawa dla dużych planów.
alter table public.imports drop constraint imports_source_kind_check;
alter table public.imports add constraint imports_source_kind_check check (source_kind in ('pdf','xlsx','image','text'));
alter table public.imports drop constraint imports_check1;
alter table public.imports add constraint imports_source_path_check check (
  source_path is null or source_path = owner_id::text || '/imports/' || id::text || '/source.' ||
  case source_kind when 'pdf' then 'pdf' when 'xlsx' then 'xlsx'
    else case mime_type when 'image/png' then 'png' else 'jpg' end end
);

update storage.buckets set allowed_mime_types=array[
  'application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/png','image/jpeg'
] where id='training-imports';

create or replace function public.create_import_job(p_owner uuid, p_id uuid, p_kind text, p_mime text, p_size integer, p_text text)
returns public.imports language plpgsql security invoker set search_path = '' as $$
declare v public.imports;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_owner::text));
  if (select count(*) from public.imports where owner_id=p_owner and created_at>now()-interval '1 day') >= 10 then
    raise exception 'daily_limit' using errcode='P0001';
  end if;
  if (select count(*) from public.imports where owner_id=p_owner and status in ('upload_pending','uploaded','processing')) >= 2 then
    raise exception 'concurrency_limit' using errcode='P0001';
  end if;
  insert into public.imports(id,owner_id,source_kind,mime_type,byte_size,source_text,source_path,status)
  values(p_id,p_owner,p_kind,p_mime,p_size,p_text,
    case when p_kind='text' then null else p_owner::text||'/imports/'||p_id::text||'/source.'||
      case when p_kind='pdf' then 'pdf' when p_kind='xlsx' then 'xlsx' when p_mime='image/png' then 'png' else 'jpg' end end,
    case when p_kind='text' then 'uploaded' else 'upload_pending' end) returning * into v;
  return v;
end $$;

create or replace function public.claim_import_job(p_owner uuid, p_id uuid, p_model text, p_prompt text, p_schema integer, p_budget_usd numeric)
returns public.imports language plpgsql security invoker set search_path = '' as $$
declare v public.imports; t uuid := gen_random_uuid();
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('t06-global-import-budget'));
  if p_model <> 'mock' then
    if p_budget_usd is null or p_budget_usd < 0.05 or
      (select count(*) from public.import_attempts where model<>'mock' and started_at>now()-interval '1 day') * 0.05 + 0.05 > p_budget_usd then
      raise exception 'daily_budget' using errcode='P0001';
    end if;
  end if;
  select * into v from public.imports where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'not_found' using errcode='P0002'; end if;
  if v.expires_at <= now() then raise exception 'import_expired' using errcode='P0001'; end if;
  if v.status='processing' and v.lease_until <= now() then
    update public.import_attempts set status='timed_out',ended_at=now(),error_code='timeout' where import_id=p_id and lease_token=v.lease_token and status='processing';
  elsif v.status not in ('uploaded','failed') then
    raise exception 'invalid_state' using errcode='P0001';
  end if;
  if v.attempt_number >= 3 then raise exception 'retry_limit' using errcode='P0001'; end if;
  update public.imports set status='processing',attempt_number=attempt_number+1,lease_token=t,
    lease_until=now()+interval '180 seconds',updated_at=now(),error_code=null
  where id=p_id returning * into v;
  insert into public.import_attempts(owner_id,import_id,number,lease_token,status,model,prompt_version,schema_version)
  values(p_owner,p_id,v.attempt_number,t,'processing',p_model,p_prompt,p_schema);
  return v;
end $$;
