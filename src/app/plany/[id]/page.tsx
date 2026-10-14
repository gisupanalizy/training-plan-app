import Link from "next/link";
import { formatRange, setKindLabel } from "@/lib/domain/format";
import { notFound } from "next/navigation";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { getDemoDay } from "@/lib/demo-plan";
import { calculatePercentTarget, selectApplicableOneRepMax, type PlannedSetInput } from "@/lib/domain/model";
import { getPlanDocument, getPlanVersions, getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { WorkoutStart } from "@/components/workout-start";
import { getActiveWorkoutForDay } from "@/lib/workouts/repository";

function todayInZone(zone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
function formatTarget(set: PlannedSetInput, exerciseId: string, date: string, records: Awaited<ReturnType<typeof getOneRepMaxData>>["records"], increment: number) {
  if (set.loadType === "absolute") return `${formatRange(set.targetKg, set.targetKgMax)} kg`;
  if (set.loadType === "bodyweight") return set.bodyweightAdjustment === "additional" ? `Masa ciała + ${set.bodyweightDeltaKg} kg` : set.bodyweightAdjustment === "assistance" ? `Asysta ${set.bodyweightDeltaKg} kg` : "Masa ciała";
  if (set.loadType !== "percent_1rm") return "Nie podano";
  const maximum = selectApplicableOneRepMax(records, exerciseId, date);
  const target = calculatePercentTarget(set.targetPercent!, maximum, increment);
  return target.roundedTargetKg === null ? `${set.targetPercent}% 1RM · brak maksimum` : `${set.targetPercent}% 1RM = ${target.roundedTargetKg} kg`;
}

export default async function PlanDayPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ version?: string }> }) {
  const { id } = await params;
  if (!getSupabaseConfig()) {
    const day = getDemoDay(id);
    if (!day) notFound();
    return <AppShell section="Plany"><Link className="back-link" href="/plany">← Wróć do planów</Link><div className="eyebrow">FUNDAMENT SIŁY / {day.label.toUpperCase()}</div><div className="page-heading"><div><h1>{day.title}<span className="accent">.</span></h1><p>{day.focus} · {day.duration}</p></div><Link href={`/trening/${day.id}`} className="button button-dark">Zobacz trening ↗</Link></div><DemoNotice />
      <div className="section-heading"><div><div className="eyebrow">PRZEBIEG DNIA</div><h2>Ćwiczenia i serie</h2></div></div><div className="exercise-list">{day.exercises.map((exercise, index) => <section className="exercise-card" key={exercise.name}><div className="exercise-header"><span className="exercise-index">0{index + 1}</span><div><small>{exercise.category.toUpperCase()}</small><h3>{exercise.name}</h3></div><span className="set-count">{exercise.sets.length} SERIE</span></div><div className="set-table"><div className="set-row set-head"><span>SERIA</span><span>POWTÓRZENIA / CZAS</span><span>OBCIĄŻENIE</span></div>{exercise.sets.map((set, setIndex) => <div className="set-row" key={setIndex}><span>{String(setIndex + 1).padStart(2, "0")}</span><strong>{set.repetitions}</strong><strong>{set.load}</strong></div>)}</div>{exercise.note && <p className="exercise-note">{exercise.note}</p>}</section>)}</div>
    </AppShell>;
  }
  const { version: requestedVersionId } = await searchParams;
  const loaded = await getPlanDocument(id, requestedVersionId);
  if (!loaded) notFound();
  const [maxData, versions] = await Promise.all([getOneRepMaxData(), getPlanVersions(id)]);
  const date = todayInZone(maxData.profile.time_zone);
  const active = await Promise.all(loaded.sessionIds.map((sessionId) => getActiveWorkoutForDay(sessionId)));
  return <AppShell section="Plany"><Link className="back-link" href="/plany">← Wróć do planów</Link><div className="eyebrow">PRYWATNY PLAN / WERSJA {loaded.version.version_number}</div>
    <div className="page-heading"><div><h1>{loaded.document.name}<span className="accent">.</span></h1><p>Opublikowano {new Date(loaded.version.published_at).toLocaleDateString("pl-PL")}. Cele procentowe pokazano według 1RM obowiązującego {date}.</p></div><Link className="button button-dark" href={`/plany/edytor?plan=${id}`}>Edytuj plan</Link></div>
    <nav className="version-list" aria-label="Wersje planu">{versions.map((version) => <Link key={version.id} href={version.id === loaded.plan.current_version_id ? `/plany/${id}` : `/plany/${id}?version=${version.id}`} aria-current={version.id === loaded.version.id ? "page" : undefined}>Wersja {version.version_number}{version.id === loaded.plan.current_version_id ? " · aktualna" : ""}</Link>)}</nav>
    <div className="exercise-list">{loaded.document.sessions.map((session, sessionIndex) => <section key={sessionIndex}>
      <div className="section-heading"><div><div className="eyebrow">TYDZIEŃ {session.weekNumber}</div><h2>Dzień {session.dayLabel}</h2></div></div>{session.note && <p>{session.note}</p>}
      {loaded.version.id === loaded.plan.current_version_id && (active[sessionIndex] ?
        <Link className="button button-dark" href={`/trening/${active[sessionIndex]}`}>Wznów trening</Link> :
        <WorkoutStart planSessionId={loaded.sessionIds[sessionIndex]} today={date} />)}
      <div className="exercise-list">{session.exercises.map((exercise, exerciseIndex) => <div className="exercise-card" key={exerciseIndex}><div className="exercise-header"><span className="exercise-index">{String(exerciseIndex + 1).padStart(2, "0")}</span><div><small>{exercise.supersetGroup ? `SUPERSERIA ${exercise.supersetGroup}` : "ĆWICZENIE"}</small><h3>{exercise.name}</h3>{exercise.originalName && exercise.originalName !== exercise.name && <p className="source-original">{exercise.originalName}</p>}</div><span className="set-count">{formatRange(exercise.setCountMin ?? exercise.sets.length, exercise.setCountMax)} SERIE</span></div>
        <div className="set-table"><div className="set-row set-head"><span>SERIA</span><span>POWTÓRZENIA / CZAS</span><span>OBCIĄŻENIE</span></div>{exercise.sets.map((set, setIndex) => <div className="set-row" key={setIndex}><span>{setIndex + 1} · {set.isOptional ? "opcjonalna" : setKindLabel[set.kind]}</span><strong>{set.isAmrap ? "Maksimum powtórzeń" : set.repsMin === null ? set.durationSeconds === null ? "—" : `${formatRange(set.durationSeconds, set.durationSecondsMax)} s` : set.repsMax === null || set.repsMin === set.repsMax ? set.repsMin : `${set.repsMin}–${set.repsMax}`}</strong><strong>{formatTarget(set, exercise.exerciseId!, date, maxData.records, maxData.profile.rounding_increment_kg)}{set.restSeconds != null && <small className="import-source-ref">Przerwa: {formatRange(set.restSeconds, set.restSecondsMax)} s</small>}</strong></div>)}</div>
        {exercise.note && <p className="exercise-note">{exercise.note}</p>}</div>)}</div>
    </section>)}</div>
  </AppShell>;
}
