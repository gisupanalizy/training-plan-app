-- T06: prywatne szkice i trwałe, dzierżawione próby. Publikacja planu pozostaje w save_manual_plan.
create table public.imports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_kind text not null check (source_kind in ('pdf','image','text')),
  mime_type text not null,
  source_path text,
  source_text text,
  byte_size integer not null check (byte_size between 1 and 2097152),
  status text not null default 'upload_pending' check (status in ('upload_pending','uploaded','processing','needs_review','failed','cancelled')),
  attempt_number integer not null default 0 check (attempt_number between 0 and 3),
  lease_token uuid,
  lease_until timestamptz,
  draft jsonb,
  validation_issues jsonb not null default '[]'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  check ((source_kind = 'text' and source_text is not null and source_path is null and status <> 'upload_pending') or
    (source_kind <> 'text' and source_text is null and source_path is not null)),
  check (source_path is null or source_path = owner_id::text || '/imports/' || id::text || '/source.' || case source_kind when 'pdf' then 'pdf' else case mime_type when 'image/png' then 'png' else 'jpg' end end)
);
create index imports_owner_created on public.imports(owner_id, created_at desc);
create index imports_expiry on public.imports(expires_at);
alter table public.imports add constraint imports_id_owner_unique unique (id, owner_id);

create table public.import_attempts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  import_id uuid not null,
  number integer not null check (number between 1 and 3),
  lease_token uuid not null unique,
  status text not null check (status in ('processing','succeeded','failed','timed_out','cancelled')),
  model text not null,
  prompt_version text not null,
  schema_version integer not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  input_tokens integer,
  output_tokens integer,
  error_code text,
  unique (import_id, number),
  foreign key (import_id, owner_id) references public.imports(id, owner_id) on delete cascade
);
alter table public.imports enable row level security;
alter table public.import_attempts enable row level security;
create policy imports_read_owner on public.imports for select to authenticated using (owner_id = (select auth.uid()));
create policy attempts_read_owner on public.import_attempts for select to authenticated using (owner_id = (select auth.uid()));
grant select on public.imports, public.import_attempts to authenticated;
revoke all on public.imports, public.import_attempts from anon;
-- Mutacje wykonuje tylko serwer po auth.getUser; klucz service_role nigdy nie trafia do klienta.
revoke insert, update, delete on public.imports, public.import_attempts from authenticated;

create function public.create_import_job(p_owner uuid, p_id uuid, p_kind text, p_mime text, p_size integer, p_text text)
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
    case when p_kind='text' then null else p_owner::text||'/imports/'||p_id::text||'/source.'||case when p_kind='pdf' then 'pdf' when p_mime='image/png' then 'png' else 'jpg' end end,
    case when p_kind='text' then 'uploaded' else 'upload_pending' end) returning * into v;
  return v;
end $$;

create function public.claim_import_job(p_owner uuid, p_id uuid, p_model text, p_prompt text, p_schema integer)
returns public.imports language plpgsql security invoker set search_path = '' as $$
declare v public.imports; t uuid := gen_random_uuid();
begin
  select * into v from public.imports where id=p_id and owner_id=p_owner for update;
  if not found then raise exception 'not_found' using errcode='P0002'; end if;
  if v.status='processing' and v.lease_until <= now() then
    update public.import_attempts set status='timed_out',ended_at=now(),error_code='timeout' where import_id=p_id and lease_token=v.lease_token and status='processing';
  elsif v.status not in ('uploaded','failed') then
    raise exception 'invalid_state' using errcode='P0001';
  end if;
  if v.attempt_number >= 3 then raise exception 'retry_limit' using errcode='P0001'; end if;
  update public.imports set status='processing',attempt_number=attempt_number+1,lease_token=t,
    lease_until=now()+interval '45 seconds',updated_at=now(),error_code=null
  where id=p_id returning * into v;
  insert into public.import_attempts(owner_id,import_id,number,lease_token,status,model,prompt_version,schema_version)
  values(p_owner,p_id,v.attempt_number,t,'processing',p_model,p_prompt,p_schema);
  return v;
end $$;

create function public.finish_import_job(p_owner uuid,p_id uuid,p_token uuid,p_draft jsonb,p_issues jsonb,p_error text,p_input_tokens integer,p_output_tokens integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v public.imports;
begin
  select * into v from public.imports where id=p_id and owner_id=p_owner for update;
  if not found or v.status<>'processing' or v.lease_token<>p_token or v.lease_until<=now() then return false; end if;
  update public.imports set status=case when p_error is null then 'needs_review' else 'failed' end,
    draft=p_draft,validation_issues=coalesce(p_issues,'[]'::jsonb),error_code=p_error,
    lease_token=null,lease_until=null,updated_at=now() where id=p_id;
  update public.import_attempts set status=case when p_error is null then 'succeeded' else 'failed' end,
    ended_at=now(),error_code=p_error,input_tokens=p_input_tokens,output_tokens=p_output_tokens
    where import_id=p_id and lease_token=p_token;
  return true;
end $$;

revoke all on function public.create_import_job(uuid,uuid,text,text,integer,text) from public, anon, authenticated;
revoke all on function public.claim_import_job(uuid,uuid,text,text,integer) from public, anon, authenticated;
revoke all on function public.finish_import_job(uuid,uuid,uuid,jsonb,jsonb,text,integer,integer) from public, anon, authenticated;
grant execute on function public.create_import_job(uuid,uuid,text,text,integer,text), public.claim_import_job(uuid,uuid,text,text,integer), public.finish_import_job(uuid,uuid,uuid,jsonb,jsonb,text,integer,integer) to service_role;
