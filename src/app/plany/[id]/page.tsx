import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getDemoDay } from "@/lib/demo-plan";
import { getPlanDocument, getPlanVersions, getOneRepMaxData } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { PlanPreview } from "@/components/plan-preview";
import { Icon, Notice } from "@/components/ui";
import { DemoPlanPreview } from "@/components/training-preview";
import styles from "@/components/plan-workout.module.css";
import { getActiveWorkoutForDay } from "@/lib/workouts/repository";

function todayInZone(zone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default async function PlanDayPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ version?: string; session?: string }> }) {
  const { id } = await params;
  if (!getSupabaseConfig()) {
    const day = getDemoDay(id);
    if (!day) notFound();
    return <AppShell section="Plany"><div className={`${styles.surface} ${styles.planPage} ${styles.screen}`}><Link className={styles.back} href="/plany"><Icon name="arrowLeft" size={18} />Wróć do planów</Link><div className={styles.heading}><div><p className={styles.eyebrow}>Plan demonstracyjny</p><h1>Fundament siły</h1><p>{day.label}</p></div></div><Notice tone="warning" title="Dane demonstracyjne">Ten ekran pokazuje dane syntetyczne. Wpisy w podglądzie treningu nie są zapisywane.</Notice><DemoPlanPreview day={day} /></div></AppShell>;
  }
  const { version: requestedVersionId, session: initialSessionId } = await searchParams;
  const loaded = await getPlanDocument(id, requestedVersionId);
  if (!loaded) notFound();
  const [maxData, versions] = await Promise.all([getOneRepMaxData(), getPlanVersions(id)]);
  const date = todayInZone(maxData.profile.time_zone);
  const active = await Promise.all(loaded.sessionIds.map((sessionId) => getActiveWorkoutForDay(sessionId)));
  const current = loaded.version.id === loaded.plan.current_version_id;
  return <AppShell section="Plany"><div className={`plan-preview-page ${styles.surface} ${styles.planPage} ${styles.screen}`}>
    <div className={styles.nav}><Link className={styles.back} href="/plany"><Icon name="arrowLeft" size={18} />Wróć do planów</Link><details className={styles.version}><summary>Wersja {loaded.version.version_number}{current ? " · aktualna" : " · archiwalna"}</summary><nav className="version-list" aria-label="Wersje planu">{versions.map((version) => <Link key={version.id} href={version.id === loaded.plan.current_version_id ? `/plany/${id}` : `/plany/${id}?version=${version.id}`} aria-current={version.id === loaded.version.id ? "page" : undefined}>Wersja {version.version_number}{version.id === loaded.plan.current_version_id ? " · aktualna" : ""}</Link>)}</nav></details></div>
    <div className={styles.heading}><div><p className={styles.eyebrow}>{current ? "Aktywny plan" : "Wersja archiwalna"}</p><h1>{loaded.document.name}</h1><p>Opublikowano {new Date(loaded.version.published_at).toLocaleDateString("pl-PL")}. Cele procentowe pokazano według 1RM obowiązującego {date}.</p></div><Link className={styles.secondary} href={`/plany/edytor?plan=${id}`}><Icon name="edit" size={18} />Edytuj plan</Link></div>
    <PlanPreview initialSessionId={initialSessionId} planId={id} versionId={loaded.version.id} document={loaded.document} sessionIds={loaded.sessionIds}
      current={current} active={active}
      context={{ date, records: maxData.records, increment: maxData.profile.rounding_increment_kg }} />
  </div></AppShell>;
}
