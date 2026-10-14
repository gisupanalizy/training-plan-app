import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { interpretPlan, interpretWorkout, reserveVoice } from "@/lib/voice/openai";
import { readJsonObject } from "@/lib/imports/http";

export const maxDuration = 60;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await readJsonObject(request, 16 * 1024); } catch { return NextResponse.json({ error: "Niepoprawne lub za duże żądanie." }, { status: 400 }); }
  if (typeof body.text !== "string" || !body.text.trim() || body.text.length > 3000)
    return NextResponse.json({ error: "Podaj krótką transkrypcję." }, { status: 400 });
  let target: Record<string, unknown> | null = null;
  if (body.scope === "workout") {
    if (typeof body.workoutId !== "string" || !uuid.test(body.workoutId) ||
      !Number.isSafeInteger(body.revision) || !["set", "comment", "exercise"].includes(body.intent as string))
      return NextResponse.json({ error: "Niepoprawny cel treningu." }, { status: 400 });
    const { data: workout } = await client.from("workout_sessions").select("id,revision,status")
      .eq("id", body.workoutId).eq("owner_id", auth.user.id).maybeSingle();
    if (!workout) return NextResponse.json({ error: "Nie znaleziono własnego treningu." }, { status: 404 });
    if (workout.revision !== body.revision) return NextResponse.json({ error: "Trening zmienił się. Odśwież dane." }, { status: 409 });
    if (body.intent !== "set" && workout.status !== "in_progress") return NextResponse.json({ error: "Trening jest zakończony." }, { status: 409 });
    target = { workoutId: workout.id, revision: workout.revision };
    if (body.intent === "set") {
      if (typeof body.setId !== "string" || !uuid.test(body.setId)) return NextResponse.json({ error: "Wybierz serię." }, { status: 400 });
      const { data: set } = await client.from("performed_sets").select("id,performed_exercise_id,position,actual_reps,actual_kg")
        .eq("id", body.setId).eq("owner_id", auth.user.id).maybeSingle();
      if (!set) return NextResponse.json({ error: "Nie znaleziono własnej serii." }, { status: 404 });
      const { data: exercise } = await client.from("performed_exercises").select("id,target_name_snapshot,workout_session_id")
        .eq("id", set.performed_exercise_id).eq("owner_id", auth.user.id).eq("workout_session_id", workout.id).maybeSingle();
      if (!exercise) return NextResponse.json({ error: "Seria nie należy do tego treningu." }, { status: 404 });
      target = { ...target, setId: set.id, exerciseName: exercise.target_name_snapshot, position: set.position,
        previousReps: set.actual_reps, previousKg: set.actual_kg };
    }
  } else if (body.scope !== "plan") return NextResponse.json({ error: "Niepoprawny zakres." }, { status: 400 });
  try {
    await reserveVoice(auth.user.id);
    const result = body.scope === "plan" ? await interpretPlan(body.text, AbortSignal.timeout(45_000)) :
      await interpretWorkout(body.text, body.intent as "set" | "comment" | "exercise", AbortSignal.timeout(45_000));
    return NextResponse.json({ transcript: body.text, proposal: result, target }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return NextResponse.json({ error: (error as Error).message }, { status: 503 }); }
}
