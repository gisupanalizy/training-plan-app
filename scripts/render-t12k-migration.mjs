import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const src = readFileSync("src/lib/exercises/names.ts", "utf8");
const slice = src.slice(src.indexOf("export const exerciseNames"));
const arrayText = slice.slice(slice.indexOf("["), slice.lastIndexOf("];") + 1);
const entry = (key, pl, en, aliases = [], equipment, variant) => ({ key, pl, en, aliases, equipment: equipment ?? null, variant: variant ?? null });
const exerciseNames = new Function("entry", `return ${arrayText}`)(entry);
const normalize = (name) => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ł/g, "l").toLowerCase().replace(/[*]/g, "").replace(/[-–]/g, " ").replace(/\s+/g, " ").trim();
const quote = (value) => value == null ? "null" : `'${String(value).replaceAll("'", "''")}'`;

const aliases = new Map();
for (const item of exerciseNames) {
  for (const name of [item.pl, item.en, ...item.aliases]) {
    const normalized = normalize(name);
    const previous = aliases.get(normalized);
    if (previous && previous !== item.key) throw new Error(`Alias ${normalized} wskazuje ${previous} i ${item.key}`);
    aliases.set(normalized, item.key);
  }
}

const catalog = exerciseNames.map((item) => `  (${quote(item.key)}, ${quote(item.pl)}, ${quote(item.variant)}, ${quote(item.equipment)})`).join(",\n");
const aliasRows = [...aliases.entries()].map(([name, key]) => `  (${quote(key)}, ${quote(name)})`).join(",\n");
const files = readdirSync("public/exercise-assets").filter((file) => /\.(svg|png)$/.test(file) && file !== "generic.png").sort();
const assetRows = files.map((file) => `  (${quote(file)})`).join(",\n");

const sql = `-- T12-K: prywatna tożsamość ruchu. Nie przepisuje historycznych FK ani snapshotów.
create table public.exercise_catalog (
  canonical_key text primary key,
  display_name text not null,
  variant text,
  equipment text
);
create table public.exercise_catalog_aliases (
  canonical_key text not null references public.exercise_catalog(canonical_key),
  normalized_name text primary key
);
create table public.exercise_asset_allowlist (
  file_name text primary key
);
insert into public.exercise_catalog (canonical_key, display_name, variant, equipment) values
${catalog};
insert into public.exercise_catalog_aliases (canonical_key, normalized_name) values
${aliasRows};
insert into public.exercise_asset_allowlist (file_name) values
${assetRows};

create table public.exercise_identities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  canonical_key text references public.exercise_catalog(canonical_key),
  display_name text not null check (length(btrim(display_name)) > 0),
  variant text,
  equipment text,
  asset_file text references public.exercise_asset_allowlist(file_name),
  created_at timestamptz not null default now(),
  unique (id, owner_id)
);
create unique index exercise_identities_owner_key on public.exercise_identities (owner_id, canonical_key) where canonical_key is not null;

create table public.exercise_aliases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  identity_id uuid not null,
  normalized_name text not null check (length(normalized_name) > 0),
  variant text,
  equipment text,
  variant_norm text generated always as (coalesce(variant, '')) stored,
  equipment_norm text generated always as (coalesce(equipment, '')) stored,
  created_at timestamptz not null default now(),
  foreign key (identity_id, owner_id) references public.exercise_identities(id, owner_id),
  unique (owner_id, normalized_name, variant_norm, equipment_norm)
);

alter table public.exercises add column identity_id uuid;
alter table public.exercises add constraint exercises_identity_owner_fk
  foreign key (identity_id, owner_id) references public.exercise_identities(id, owner_id);

alter table public.exercise_catalog enable row level security;
alter table public.exercise_catalog_aliases enable row level security;
alter table public.exercise_asset_allowlist enable row level security;
alter table public.exercise_identities enable row level security;
alter table public.exercise_aliases enable row level security;
revoke all on table public.exercise_catalog, public.exercise_catalog_aliases, public.exercise_asset_allowlist,
  public.exercise_identities, public.exercise_aliases from anon, authenticated;
grant select on table public.exercise_catalog, public.exercise_catalog_aliases, public.exercise_asset_allowlist,
  public.exercise_identities, public.exercise_aliases to authenticated;
create policy exercise_catalog_read on public.exercise_catalog for select to authenticated using (true);
create policy exercise_catalog_aliases_read on public.exercise_catalog_aliases for select to authenticated using (true);
create policy exercise_asset_allowlist_read on public.exercise_asset_allowlist for select to authenticated using (true);
create policy exercise_identities_select_owner on public.exercise_identities for select to authenticated using (owner_id = (select auth.uid()));
create policy exercise_aliases_select_owner on public.exercise_aliases for select to authenticated using (owner_id = (select auth.uid()));

create function public.normalize_exercise_alias(p_name text) returns text
language plpgsql immutable strict set search_path = '' as $$
declare s text := replace(p_name, 'ł', 'l');
begin
  s := translate(lower(s), 'ąćęńóśźż', 'aecnoszz');
  s := replace(replace(replace(s, '*', ''), '-', ' '), '–', ' ');
  s := btrim(regexp_replace(s, '\\s+', ' ', 'g'));
  return s;
end $$;

create function public.exercise_context_conflicts(p_catalog_variant text, p_catalog_equipment text, p_variant text, p_equipment text)
returns boolean language sql immutable set search_path = '' as $$
  select (nullif(btrim(coalesce(p_variant, '')), '') is not null and (
      nullif(btrim(coalesce(p_catalog_variant, '')), '') is null
      or public.normalize_exercise_alias(p_variant) is distinct from public.normalize_exercise_alias(p_catalog_variant)))
    or (nullif(btrim(coalesce(p_equipment, '')), '') is not null and (
      nullif(btrim(coalesce(p_catalog_equipment, '')), '') is null
      or public.normalize_exercise_alias(p_equipment) is distinct from public.normalize_exercise_alias(p_catalog_equipment)))
$$;

create function public.same_identity_exercise_ids(p_owner uuid, p_exercise_id uuid)
returns setof uuid language sql stable security definer set search_path = '' as $$
  select e.id from public.exercises e
  join public.exercises source on source.id = p_exercise_id and source.owner_id = p_owner
  where e.owner_id = p_owner and (
    (source.identity_id is not null and e.identity_id = source.identity_id)
    or (source.identity_id is null and e.id = source.id))
$$;

create function public.resolve_owned_exercise(p_owner uuid, p_exercise jsonb) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_key text := nullif(btrim(p_exercise->>'canonicalKey'), '');
  v_identity uuid := nullif(p_exercise->>'identityId', '')::uuid;
  v_existing uuid := nullif(p_exercise->>'exerciseId', '')::uuid;
  v_name text := btrim(coalesce(p_exercise->>'name', ''));
  v_variant text := nullif(btrim(coalesce(p_exercise->>'variant', '')), '');
  v_equipment text := nullif(btrim(coalesce(p_exercise->>'equipment', '')), '');
  v_original text := nullif(btrim(coalesce(p_exercise->>'originalName', '')), '');
  v_asset text := case when p_exercise ? 'assetFile' then nullif(btrim(p_exercise->>'assetFile'), '') else null end;
  v_asset_present boolean := p_exercise ? 'assetFile';
  v_record_alias boolean := coalesce((p_exercise->>'recordAlias')::boolean, false);
  v_catalog public.exercise_catalog%rowtype;
  v_identity_row public.exercise_identities%rowtype;
  v_exercise_id uuid;
  v_norm text;
begin
  if p_owner is null then raise exception 'unauthorized' using errcode = '28000'; end if;
  if v_asset is not null and not exists (select 1 from public.exercise_asset_allowlist where file_name = v_asset) then
    raise exception 'asset not allowed' using errcode = '22023';
  end if;
  if v_key is not null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text || ':key:' || v_key, 0));
    select * into v_catalog from public.exercise_catalog where canonical_key = v_key;
    if not found then raise exception 'unknown exercise key' using errcode = '22023'; end if;
    if public.exercise_context_conflicts(v_catalog.variant, v_catalog.equipment, v_variant, v_equipment) then
      raise exception 'identity mismatch' using errcode = '22023';
    end if;
    insert into public.exercise_identities as identity (owner_id, canonical_key, display_name, variant, equipment, asset_file)
      values (p_owner, v_catalog.canonical_key, v_catalog.display_name, v_catalog.variant, v_catalog.equipment, v_asset)
      on conflict (owner_id, canonical_key) where canonical_key is not null
      do update set asset_file = coalesce(excluded.asset_file, identity.asset_file)
      returning * into v_identity_row;
    if v_asset_present and v_asset is null then
      update public.exercise_identities set asset_file = null where id = v_identity_row.id and owner_id = p_owner returning * into v_identity_row;
    end if;
    select id into v_exercise_id from public.exercises
      where owner_id = p_owner and identity_id = v_identity_row.id and name = v_catalog.display_name
      order by created_at, id limit 1;
    if v_exercise_id is null then
      insert into public.exercises(owner_id, name, variant, equipment, is_custom, identity_id)
        values (p_owner, v_catalog.display_name, v_catalog.variant, v_catalog.equipment, false, v_identity_row.id)
        returning id into v_exercise_id;
    end if;
    if v_record_alias and v_original is not null then
      v_norm := public.normalize_exercise_alias(v_original);
      if v_norm <> '' and v_norm is distinct from public.normalize_exercise_alias(v_catalog.display_name) then
        insert into public.exercise_aliases(owner_id, identity_id, normalized_name, variant, equipment)
          values (p_owner, v_identity_row.id, v_norm, v_catalog.variant, v_catalog.equipment)
          on conflict (owner_id, normalized_name, variant_norm, equipment_norm) do nothing;
      end if;
    end if;
  elsif v_identity is not null then
    select * into v_identity_row from public.exercise_identities where id = v_identity and owner_id = p_owner;
    if not found then raise exception 'identity not found' using errcode = 'P0002'; end if;
    if v_identity_row.canonical_key is not null then
      if public.exercise_context_conflicts(v_identity_row.variant, v_identity_row.equipment, v_variant, v_equipment)
        or public.normalize_exercise_alias(v_name) is distinct from public.normalize_exercise_alias(v_identity_row.display_name) then
        raise exception 'identity mismatch' using errcode = '22023';
      end if;
    elsif public.normalize_exercise_alias(v_name) is distinct from public.normalize_exercise_alias(v_identity_row.display_name)
      or public.normalize_exercise_alias(coalesce(v_variant, '')) is distinct from public.normalize_exercise_alias(coalesce(v_identity_row.variant, ''))
      or public.normalize_exercise_alias(coalesce(v_equipment, '')) is distinct from public.normalize_exercise_alias(coalesce(v_identity_row.equipment, '')) then
      raise exception 'identity mismatch' using errcode = '22023';
    end if;
    if v_asset_present then
      update public.exercise_identities set asset_file = v_asset where id = v_identity_row.id and owner_id = p_owner;
    end if;
    select id into v_exercise_id from public.exercises
      where owner_id = p_owner and identity_id = v_identity_row.id and name = v_identity_row.display_name
      order by created_at, id limit 1;
    if v_exercise_id is null then
      insert into public.exercises(owner_id, name, variant, equipment, is_custom, identity_id)
        values (p_owner, v_identity_row.display_name, v_identity_row.variant, v_identity_row.equipment, v_identity_row.canonical_key is null, v_identity_row.id)
        returning id into v_exercise_id;
    end if;
  elsif v_existing is not null then
    select id into v_exercise_id from public.exercises where id = v_existing and owner_id = p_owner;
    if v_exercise_id is null then raise exception 'exercise not found' using errcode = 'P0002'; end if;
  else
    if length(v_name) < 1 or length(v_name) > 120 then raise exception 'invalid exercise'; end if;
    v_norm := public.normalize_exercise_alias(v_name);
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text || ':custom:' || v_norm || ':' || coalesce(v_variant, '') || ':' || coalesce(v_equipment, ''), 0));
    select * into v_identity_row from public.exercise_identities
      where owner_id = p_owner and canonical_key is null
        and public.normalize_exercise_alias(display_name) = v_norm
        and public.normalize_exercise_alias(coalesce(variant, '')) = public.normalize_exercise_alias(coalesce(v_variant, ''))
        and public.normalize_exercise_alias(coalesce(equipment, '')) = public.normalize_exercise_alias(coalesce(v_equipment, ''))
      order by created_at, id limit 1;
    if not found then
      insert into public.exercise_identities(owner_id, display_name, variant, equipment, asset_file)
        values (p_owner, v_name, v_variant, v_equipment, v_asset)
        returning * into v_identity_row;
    elsif v_asset_present then
      update public.exercise_identities set asset_file = v_asset where id = v_identity_row.id and owner_id = p_owner returning * into v_identity_row;
    end if;
    select id into v_exercise_id from public.exercises
      where owner_id = p_owner and identity_id = v_identity_row.id and name = v_identity_row.display_name
      order by created_at, id limit 1;
    if v_exercise_id is null then
      insert into public.exercises(owner_id, name, variant, equipment, is_custom, identity_id)
        values (p_owner, v_identity_row.display_name, v_variant, v_equipment, true, v_identity_row.id)
        returning id into v_exercise_id;
    end if;
  end if;
  if v_existing is not null and (v_key is not null or v_identity is not null) and v_exercise_id is distinct from v_existing then
    raise exception 'exercise not found' using errcode = 'P0002';
  end if;
  return v_exercise_id;
end $$;

revoke all on function public.normalize_exercise_alias(text), public.exercise_context_conflicts(text, text, text, text),
  public.same_identity_exercise_ids(uuid, uuid), public.resolve_owned_exercise(uuid, jsonb) from public, anon, authenticated;

-- Jednoznaczne dokładne nazwy dostają wspólną tożsamość. Reszta zostaje bez identity_id.
insert into public.exercise_identities (owner_id, canonical_key, display_name, variant, equipment)
select distinct e.owner_id, c.canonical_key, c.display_name, c.variant, c.equipment
from public.exercises e
join public.exercise_catalog_aliases a on a.normalized_name = public.normalize_exercise_alias(e.name)
join public.exercise_catalog c on c.canonical_key = a.canonical_key
where e.identity_id is null
  and public.exercise_context_conflicts(c.variant, c.equipment, e.variant, e.equipment) = false
on conflict (owner_id, canonical_key) where canonical_key is not null do nothing;

update public.exercises e
set identity_id = i.id
from public.exercise_catalog_aliases a
join public.exercise_catalog c on c.canonical_key = a.canonical_key
join public.exercise_identities i on i.canonical_key = c.canonical_key
where e.identity_id is null
  and i.owner_id = e.owner_id
  and a.normalized_name = public.normalize_exercise_alias(e.name)
  and public.exercise_context_conflicts(c.variant, c.equipment, e.variant, e.equipment) = false;

create or replace function public.save_manual_plan(
  p_operation_id uuid, p_plan_id uuid, p_expected_version_id uuid, p_document jsonb
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_owner uuid := auth.uid();
  v_hash text;
  v_receipt public.plan_save_receipts%rowtype;
  v_plan public.plans%rowtype;
  v_plan_id uuid;
  v_version_id uuid;
  v_version_number integer;
  v_session jsonb;
  v_exercise jsonb;
  v_set jsonb;
  v_session_id uuid;
  v_exercise_id uuid;
  v_planned_exercise_id uuid;
  v_day_position integer;
  v_exercise_position integer;
  v_set_position integer;
  v_display_name text;
  v_canonical text;
  v_identity_name text;
begin
  if v_owner is null then raise exception 'unauthorized' using errcode = '28000'; end if;
  if p_operation_id is null or p_document is null or jsonb_typeof(p_document->'sessions') <> 'array'
    or jsonb_array_length(p_document->'sessions') < 1 or jsonb_array_length(p_document->'sessions') > 52
    or length(btrim(p_document->>'name')) not between 1 and 120 then
    raise exception 'invalid plan';
  end if;
  v_hash := encode(extensions.digest(jsonb_build_array(p_plan_id, p_expected_version_id, p_document)::text, 'sha256'), 'hex');
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_owner::text || p_operation_id::text, 0));
  select * into v_receipt from public.plan_save_receipts
    where owner_id = v_owner and operation_id = p_operation_id;
  if found then
    if v_receipt.payload_hash <> v_hash then raise exception 'operation conflict' using errcode = '23505'; end if;
    return jsonb_build_object('planId', v_receipt.plan_id, 'versionId', v_receipt.version_id);
  end if;

  if p_plan_id is null then
    if p_expected_version_id is not null then raise exception 'invalid expected version'; end if;
    insert into public.plans(owner_id, name, status)
      values (v_owner, btrim(p_document->>'name'), 'draft') returning id into v_plan_id;
    v_version_number := 1;
  else
    select * into v_plan from public.plans where id = p_plan_id and owner_id = v_owner for update;
    if not found then raise exception 'plan not found' using errcode = 'P0002'; end if;
    if v_plan.status = 'archived' or v_plan.current_version_id is distinct from p_expected_version_id then
      raise exception 'plan version conflict' using errcode = 'PT409';
    end if;
    v_plan_id := v_plan.id;
    select coalesce(max(version_number), 0) + 1 into v_version_number
      from public.plan_versions where plan_id = v_plan_id and owner_id = v_owner;
  end if;
  insert into public.plan_versions(owner_id, plan_id, version_number, state, source_kind)
    values (v_owner, v_plan_id, v_version_number, 'draft', 'manual') returning id into v_version_id;

  v_day_position := 0;
  for v_session in select value from jsonb_array_elements(p_document->'sessions') loop
    v_day_position := v_day_position + 1;
    if jsonb_typeof(v_session->'exercises') <> 'array' or jsonb_array_length(v_session->'exercises') < 1
      or jsonb_array_length(v_session->'exercises') > 50 then raise exception 'invalid day'; end if;
    insert into public.plan_sessions(owner_id, plan_version_id, week_number, day_label, position, note)
      values (v_owner, v_version_id, (v_session->>'weekNumber')::integer,
        btrim(v_session->>'dayLabel'), v_day_position, nullif(btrim(v_session->>'note'), ''))
      returning id into v_session_id;
    v_exercise_position := 0;
    for v_exercise in select value from jsonb_array_elements(v_session->'exercises') loop
      v_exercise_position := v_exercise_position + 1;
      if jsonb_typeof(v_exercise->'sets') <> 'array' or jsonb_array_length(v_exercise->'sets') < 1
        or jsonb_array_length(v_exercise->'sets') > 30 then raise exception 'invalid exercise'; end if;
      if (v_exercise->>'setCountMin') is not null or (v_exercise->>'setCountMax') is not null then
        if (v_exercise->>'setCountMin')::integer not between 1 and 30 or
          (v_exercise->>'setCountMax')::integer < (v_exercise->>'setCountMin')::integer or
          (v_exercise->>'setCountMax')::integer <> jsonb_array_length(v_exercise->'sets') then raise exception 'invalid set count range'; end if;
      end if;
      if (v_exercise->>'setCountMin') is not null and not coalesce((v_exercise->>'isOptional')::boolean,false) and
        (select count(*) from jsonb_array_elements(v_exercise->'sets') with ordinality as item(value,position)
          where not coalesce((item.value->>'isOptional')::boolean,item.position > (v_exercise->>'setCountMin')::integer,false)) <> (v_exercise->>'setCountMin')::integer then
        raise exception 'invalid required set count';
      end if;
      v_exercise_id := public.resolve_owned_exercise(v_owner, v_exercise);
      select e.name, i.canonical_key, i.display_name into v_display_name, v_canonical, v_identity_name
        from public.exercises e
        left join public.exercise_identities i on i.id = e.identity_id and i.owner_id = e.owner_id
        where e.id = v_exercise_id and e.owner_id = v_owner;
      if v_canonical is not null then v_display_name := v_identity_name; else v_display_name := btrim(v_exercise->>'name'); end if;
      insert into public.planned_exercises(owner_id, plan_session_id, exercise_id, original_name,
        position, superset_group, note, display_name, review_id, source_ref, set_count_min, set_count_max, set_count_source, prescription_group, is_optional)
        values (v_owner, v_session_id, v_exercise_id, coalesce(nullif(btrim(v_exercise->>'originalName'),''),btrim(v_exercise->>'name')),
          v_exercise_position, nullif(btrim(v_exercise->>'supersetGroup'), ''),
          nullif(btrim(v_exercise->>'note'), ''),v_display_name,v_exercise->>'reviewId',v_exercise->>'sourceRef', (v_exercise->>'setCountMin')::integer,(v_exercise->>'setCountMax')::integer,v_exercise->>'setCountSource',v_exercise->>'prescriptionGroup',coalesce((v_exercise->>'isOptional')::boolean,false)) returning id into v_planned_exercise_id;
      v_set_position := 0;
      for v_set in select value from jsonb_array_elements(v_exercise->'sets') loop
        v_set_position := v_set_position + 1;
        insert into public.planned_sets(owner_id, planned_exercise_id, position, set_kind, reps_min, reps_max,
          is_amrap, load_type, target_kg, target_percent, bodyweight_adjustment, bodyweight_delta_kg,
          dumbbell_basis, duration_seconds, distance_meters, rest_seconds, tempo, target_rpe, target_rir, note, review_id, source_ref, is_optional, target_kg_max, duration_seconds_max, rest_seconds_max)
          values (v_owner, v_planned_exercise_id, v_set_position, v_set->>'kind',
            (v_set->>'repsMin')::integer, (v_set->>'repsMax')::integer,
            (v_set->>'isAmrap')::boolean, v_set->>'loadType', (v_set->>'targetKg')::numeric,
            (v_set->>'targetPercent')::numeric, v_set->>'bodyweightAdjustment',
            (v_set->>'bodyweightDeltaKg')::numeric, v_set->>'dumbbellBasis',
            (v_set->>'durationSeconds')::integer, (v_set->>'distanceMeters')::numeric,
            (v_set->>'restSeconds')::integer, v_set->>'tempo', (v_set->>'targetRpe')::numeric,
            (v_set->>'targetRir')::numeric, v_set->>'note', v_set->>'reviewId',v_set->>'sourceRef',coalesce((v_exercise->>'isOptional')::boolean,false) or coalesce((v_set->>'isOptional')::boolean,v_set_position > (v_exercise->>'setCountMin')::integer,false),(v_set->>'targetKgMax')::numeric,(v_set->>'durationSecondsMax')::integer,(v_set->>'restSecondsMax')::integer);
      end loop;
    end loop;
  end loop;
  update public.plan_versions set state = 'published', published_at = now() where id = v_version_id and owner_id = v_owner;
  update public.plans set name = btrim(p_document->>'name'), status = 'active', current_version_id = v_version_id
    where id = v_plan_id and owner_id = v_owner;
  insert into public.plan_save_receipts(owner_id, operation_id, payload_hash, plan_id, version_id)
    values (v_owner, p_operation_id, v_hash, v_plan_id, v_version_id);
  return jsonb_build_object('planId', v_plan_id, 'versionId', v_version_id);
end $$;

do $patch$
declare def text; original text;
begin
  original := pg_get_functiondef('public.apply_workout_command(uuid,uuid,integer,text,jsonb)'::regprocedure);
  def := replace(original, 'r.exercise_id = pe.exercise_id', 'r.exercise_id in (select public.same_identity_exercise_ids(v_owner, pe.exercise_id))');
  def := replace(def,
    'insert into public.exercises(owner_id,name,variant) values(v_owner,btrim(p_payload->>''name''),nullif(btrim(p_payload->>''variant''),'''')) returning id into v_catalog_exercise_id;',
    'v_catalog_exercise_id := public.resolve_owned_exercise(v_owner, p_payload);');
  if def = original then raise exception 'apply_workout_command patch missed'; end if;
  execute def;
end $patch$;

do $limits$
declare constraint_name name;
begin
  select conname into constraint_name from pg_constraint
    where conrelid = 'public.imports'::regclass and pg_get_constraintdef(oid) ilike '%byte_size%';
  if constraint_name is not null then execute format('alter table public.imports drop constraint %I', constraint_name); end if;
end $limits$;
alter table public.imports add constraint imports_byte_size_check check (byte_size between 1 and 10000000);
alter table public.imports drop constraint imports_status_check;
alter table public.imports add constraint imports_status_check check (status in ('upload_pending','uploaded','processing','partial','needs_review','failed','cancelled','committed'));
update storage.buckets set file_size_limit = 10000000 where id = 'training-imports';

create table public.import_parts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  import_id uuid not null,
  part_index integer not null check (part_index >= 0),
  page_from integer not null,
  page_to integer not null,
  status text not null check (status in ('pending','succeeded','failed')),
  draft jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  unique (import_id, part_index),
  foreign key (import_id, owner_id) references public.imports(id, owner_id)
);
alter table public.import_parts enable row level security;
revoke all on table public.import_parts from anon, authenticated;
grant select on table public.import_parts to authenticated;
create policy import_parts_select_owner on public.import_parts for select to authenticated using (owner_id = (select auth.uid()));

create or replace function public.create_import_job(p_owner uuid, p_id uuid, p_kind text, p_mime text, p_size integer, p_text text)
returns public.imports language plpgsql security invoker set search_path = '' as $$
declare v public.imports;
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_owner::text));
  if (select count(*) from public.imports where owner_id=p_owner and created_at>now()-interval '1 day') >= 10 then
    raise exception 'daily_limit' using errcode='P0001';
  end if;
  if (select count(*) from public.imports where owner_id=p_owner and status in ('upload_pending','uploaded','processing','partial')) >= 2 then
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
  if v.status = 'partial' then
    update public.imports set status='processing', lease_token=t, lease_until=now()+interval '180 seconds', updated_at=now(), error_code=null
      where id=p_id returning * into v;
    update public.import_attempts set lease_token=t where import_id=p_id and status='processing';
    return v;
  end if;
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
`;

writeFileSync("supabase/migrations/20261020170000_t12k_exercise_identity.sql", sql);
console.log(`catalog ${exerciseNames.length}, aliases ${aliases.size}, assets ${files.length}`);
