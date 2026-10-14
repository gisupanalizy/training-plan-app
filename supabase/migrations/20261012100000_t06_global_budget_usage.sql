-- Atomowy limit globalny w ruchomych 24 h; rezerwacja 0,05 USD/próbę nie zastępuje twardego limitu u dostawcy.
alter table public.import_attempts add column estimated_cost_usd numeric(12,6);
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

create or replace function public.finish_import_job(p_owner uuid,p_id uuid,p_token uuid,p_draft jsonb,p_issues jsonb,p_error text,p_input_tokens integer,p_output_tokens integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare v public.imports;
begin
  select * into v from public.imports where id=p_id and owner_id=p_owner for update;
  if not found or v.status<>'processing' or v.lease_token<>p_token or v.lease_until<=now() then return false; end if;
  update public.imports set status=case when p_error is null then 'needs_review' else 'failed' end,
    draft=p_draft,validation_issues=coalesce(p_issues,'[]'::jsonb),error_code=p_error,
    lease_token=null,lease_until=null,updated_at=now() where id=p_id;
  update public.import_attempts set status=case when p_error is null then 'succeeded' else 'failed' end,
    ended_at=now(),error_code=p_error,input_tokens=p_input_tokens,output_tokens=p_output_tokens,
    estimated_cost_usd=case when model<>'mock' and p_input_tokens is not null and p_output_tokens is not null
      then round((p_input_tokens::numeric*0.10+p_output_tokens::numeric*0.50)/1000000,6) else null end
    where import_id=p_id and lease_token=p_token;
  return true;
end $$;
