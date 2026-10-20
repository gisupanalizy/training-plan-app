import { createClient } from "@/lib/supabase/server";
import type { PlanEditorDocument, PlanEditorExercise } from "@/lib/domain/plan-editor";
import type { PlannedSetInput, OneRepMaxRecord } from "@/lib/domain/model";

export async function getPlanList() {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  const { data, error } = await client.from("plans").select("id,name,status,current_version_id,created_at")
    .eq("owner_id", auth.user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPlanDocument(planId: string, requestedVersionId?: string) {
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(planId) || (requestedVersionId && !uuid.test(requestedVersionId))) return null;
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  const { data: plan, error: planError } = await client.from("plans")
    .select("id,name,current_version_id,status").eq("id", planId).eq("owner_id", auth.user.id).maybeSingle();
  if (planError) throw planError;
  if (!plan || !plan.current_version_id) return null;
  const { data: version, error: versionError } = await client.from("plan_versions")
    .select("id,version_number,published_at").eq("id", requestedVersionId ?? plan.current_version_id)
    .eq("plan_id", plan.id).eq("owner_id", auth.user.id).eq("state", "published").maybeSingle();
  if (versionError) throw versionError;
  if (!version) return null;
  const { data: sessions, error: sessionsError } = await client.from("plan_sessions")
    .select("id,week_number,day_label,position,note").eq("plan_version_id", version.id).eq("owner_id", auth.user.id).order("position");
  if (sessionsError) throw sessionsError;
  const sessionIds = sessions.map((item) => item.id);
  const { data: exercises, error: exercisesError } = sessionIds.length ? await client.from("planned_exercises")
    .select("id,plan_session_id,exercise_id,original_name,is_optional,display_name,review_id,source_ref,set_count_min,set_count_max,set_count_source,prescription_group,position,superset_group,note")
    .in("plan_session_id", sessionIds).eq("owner_id", auth.user.id).order("position") : { data: [], error: null };
  if (exercisesError) throw exercisesError;
  const exerciseIds = exercises.map((item) => item.id);
  const { data: sets, error: setsError } = exerciseIds.length ? await client.from("planned_sets")
    .select("planned_exercise_id,review_id,source_ref,is_optional,target_kg_max,duration_seconds_max,rest_seconds_max,position,set_kind,reps_min,reps_max,is_amrap,load_type,target_kg,target_percent,bodyweight_adjustment,bodyweight_delta_kg,dumbbell_basis,duration_seconds,distance_meters,rest_seconds,tempo,target_rpe,target_rir,note")
    .in("planned_exercise_id", exerciseIds).eq("owner_id", auth.user.id).order("position") : { data: [], error: null };
  if (setsError) throw setsError;
  const { data: catalog, error: catalogError } = await client.from("exercises")
    .select("id,variant,equipment,identity_id").eq("owner_id", auth.user.id);
  if (catalogError) throw catalogError;
  const { data: identities, error: identityError } = await client.from("exercise_identities")
    .select("id,canonical_key,asset_file,display_name").eq("owner_id", auth.user.id);
  if (identityError) throw identityError;
  const identityById = new Map((identities ?? []).map((item) => [item.id, item]));
  const details = new Map(catalog.map((item) => [item.id, item]));
  const document: PlanEditorDocument = { name: plan.name, sessions: sessions.map((session) => ({
    weekNumber: session.week_number, dayLabel: session.day_label, note: session.note,
    exercises: exercises.filter((exercise) => exercise.plan_session_id === session.id).map((exercise): PlanEditorExercise => ({
      exerciseId: exercise.exercise_id, name: exercise.display_name ?? exercise.original_name, originalName: exercise.original_name, isOptional: exercise.is_optional,
      reviewId: exercise.review_id ?? exercise.id, sourceRef: exercise.source_ref, setCountMin: exercise.set_count_min, setCountMax: exercise.set_count_max, setCountSource: exercise.set_count_source, prescriptionGroup: exercise.prescription_group,
      variant: details.get(exercise.exercise_id)?.variant ?? null,
      equipment: details.get(exercise.exercise_id)?.equipment ?? null,
      identityId: details.get(exercise.exercise_id)?.identity_id ?? null,
      canonicalKey: identityById.get(details.get(exercise.exercise_id)?.identity_id ?? "")?.canonical_key ?? null,
      assetFile: identityById.get(details.get(exercise.exercise_id)?.identity_id ?? "")?.asset_file ?? null,
      assignment: identityById.get(details.get(exercise.exercise_id)?.identity_id ?? "")?.canonical_key ? "exact" : details.get(exercise.exercise_id)?.identity_id ? "custom" : null,
      supersetGroup: exercise.superset_group, note: exercise.note,
      sets: sets.filter((set) => set.planned_exercise_id === exercise.id).map((set): PlannedSetInput => ({
        reviewId: set.review_id ?? undefined, sourceRef: set.source_ref, isOptional: set.is_optional, targetKgMax: set.target_kg_max, durationSecondsMax: set.duration_seconds_max, restSecondsMax: set.rest_seconds_max,
        position: set.position, kind: set.set_kind as PlannedSetInput["kind"], repsMin: set.reps_min,
        repsMax: set.reps_max, isAmrap: set.is_amrap, loadType: set.load_type as PlannedSetInput["loadType"],
        targetKg: set.target_kg, targetPercent: set.target_percent,
        bodyweightAdjustment: set.bodyweight_adjustment as PlannedSetInput["bodyweightAdjustment"],
        bodyweightDeltaKg: set.bodyweight_delta_kg, dumbbellBasis: set.dumbbell_basis as PlannedSetInput["dumbbellBasis"],
        durationSeconds: set.duration_seconds, distanceMeters: set.distance_meters, restSeconds: set.rest_seconds,
        tempo: set.tempo, targetRpe: set.target_rpe, targetRir: set.target_rir, note: set.note,
      })),
    })),
  })) };
  return { plan, version, document, sessionIds: sessions.map((session) => session.id) };
}

export async function getPlanVersions(planId: string) {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  const { data, error } = await client.from("plan_versions").select("id,version_number,published_at")
    .eq("plan_id", planId).eq("owner_id", auth.user.id).eq("state", "published")
    .order("version_number", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getOneRepMaxData() {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) throw new Error("Sesja wygasła.");
  const { data: profile, error: profileError } = await client.from("profiles")
    .select("rounding_increment_kg,time_zone").eq("id", auth.user.id).single();
  if (profileError) throw profileError;
  const { data: exercises, error: exerciseError } = await client.from("exercises")
    .select("id,name,variant,equipment,identity_id,created_at").eq("owner_id", auth.user.id).order("created_at");
  if (exerciseError) throw exerciseError;
  const { data: identities, error: identityError } = await client.from("exercise_identities")
    .select("id,display_name,variant,equipment,canonical_key").eq("owner_id", auth.user.id);
  if (identityError) throw identityError;
  const identityById = new Map((identities ?? []).map((item) => [item.id, item]));
  const grouped = new Map<string, typeof exercises[number]>();
  for (const exercise of exercises) {
    const key = exercise.identity_id ?? exercise.id;
    if (grouped.has(key)) continue;
    const identity = exercise.identity_id ? identityById.get(exercise.identity_id) : undefined;
    grouped.set(key, identity ? { ...exercise, name: identity.display_name, variant: identity.variant, equipment: identity.equipment } : exercise);
  }
  const visibleExercises = [...grouped.values()].sort((a, b) => a.name.localeCompare(b.name, "pl"));
  const { data: records, error: recordsError } = await client.from("one_rep_max_records")
    .select("id,exercise_id,value_kg,effective_on,created_at,note")
    .eq("owner_id", auth.user.id).order("effective_on", { ascending: false }).order("created_at", { ascending: false });
  if (recordsError) throw recordsError;
  const idsByIdentity = new Map<string, string[]>();
  for (const exercise of exercises) {
    if (!exercise.identity_id) continue;
    idsByIdentity.set(exercise.identity_id, [...(idsByIdentity.get(exercise.identity_id) ?? []), exercise.id]);
  }
  const visibleRecords = records.flatMap((record) => {
    const owner = exercises.find((exercise) => exercise.id === record.exercise_id);
    const ids = owner?.identity_id ? idsByIdentity.get(owner.identity_id) ?? [record.exercise_id] : [record.exercise_id];
    return ids.map((exerciseId) => ({ ...record, exercise_id: exerciseId }));
  });
  return { profile, exercises: visibleExercises.map((exercise) => ({ ...exercise, identityId: exercise.identity_id ?? null, canonicalKey: identityById.get(exercise.identity_id ?? "")?.canonical_key ?? null })), records: visibleRecords.map((record): OneRepMaxRecord & { note: string | null } => ({
    id: record.id, exerciseId: record.exercise_id, valueKg: record.value_kg,
    effectiveOn: record.effective_on, createdAt: record.created_at, note: record.note,
  })) };
}
