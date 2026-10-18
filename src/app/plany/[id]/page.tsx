import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { getDemoDay } from "@/lib/demo-plan";
import { getPlanDocument, getPlanVersions, getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { PlanPreview } from "@/components/plan-preview";
import { getActiveWorkoutForDay } from "@/lib/workouts/repository";

function todayInZone(zone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
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
  return <AppShell section="Plany"><div className="plan-preview-page"><div className="preview-page-nav"><Link className="back-link" href="/plany">← Wróć do planów</Link><details className="preview-versions"><summary>Wersja {loaded.version.version_number}{loaded.version.id === loaded.plan.current_version_id ? " · aktualna" : " · archiwalna"}</summary><nav className="version-list" aria-label="Wersje planu">{versions.map((version) => <Link key={version.id} href={version.id === loaded.plan.current_version_id ? `/plany/${id}` : `/plany/${id}?version=${version.id}`} aria-current={version.id === loaded.version.id ? "page" : undefined}>Wersja {version.version_number}{version.id === loaded.plan.current_version_id ? " · aktualna" : ""}</Link>)}</nav></details></div>
    <div className="page-heading"><div><h1>{loaded.document.name}<span className="accent">.</span></h1><p>Opublikowano {new Date(loaded.version.published_at).toLocaleDateString("pl-PL")}. Cele procentowe pokazano według 1RM obowiązującego {date}.</p></div><Link className="button button-dark" href={`/plany/edytor?plan=${id}`}>Edytuj plan</Link></div>

    <PlanPreview planId={id} versionId={loaded.version.id} document={loaded.document} sessionIds={loaded.sessionIds}
      current={loaded.version.id === loaded.plan.current_version_id} active={active}
      context={{ date, records: maxData.records, increment: maxData.profile.rounding_increment_kg }} />
  </div></AppShell>;
}
