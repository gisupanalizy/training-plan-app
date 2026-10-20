import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { demoDays } from "@/lib/demo-plan";
import { getPlanDocument, getPlanList } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getActiveWorkouts } from "@/lib/workouts/repository";
import type { WorkoutSummary } from "@/lib/workouts/contracts";
import { EmptyState, Icon, ListRow, Notice } from "@/components/ui";
import styles from "@/components/plan-workout.module.css";

type ListedPlan = { id: string; name: string; status: string; current_version_id: string | null };

function isFrameworkError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && typeof (error as { digest?: unknown }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_");
}

function countLabel(count: number, one: string, few: string, many: string) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return `1 ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${few}`;
  return `${count} ${many}`;
}

function workoutClock(workout: Pick<WorkoutSummary, "performedOn" | "performedAt" | "timeZone">) {
  if (!workout.performedAt) return `${workout.performedOn} · godzina nieznana`;
  try {
    const time = new Intl.DateTimeFormat("pl-PL", { timeZone: workout.timeZone, hour: "2-digit", minute: "2-digit" }).format(new Date(workout.performedAt));
    return `${workout.performedOn} · ${time}`;
  } catch {
    return `${workout.performedOn} · godzina zapisana`;
  }
}

function DominantLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className={`${styles.primary} ${styles.block}`} href={href}>{children}<Icon name="chevronRight" size={18} /></Link>;
}

function PlanSwitcher({ plans, selectedId }: { plans: ListedPlan[]; selectedId: string }) {
  if (plans.length < 2) return null;
  const index = Math.max(0, plans.findIndex((plan) => plan.id === selectedId));
  const previous = plans[index - 1];
  const next = plans[index + 1];
  const current = plans[index];
  return <div className={styles.switcher}>
    {previous ? <Link className={styles.iconButton} href={`/?plan=${encodeURIComponent(previous.id)}`} aria-label="Poprzedni plan"><Icon name="chevronLeft" /></Link> : <button type="button" className={styles.iconButton} aria-label="Poprzedni plan" disabled><Icon name="chevronLeft" /></button>}
    <p role="status"><strong>Plan {index + 1} z {plans.length}</strong>{current?.name}</p>
    {next ? <Link className={styles.iconButton} href={`/?plan=${encodeURIComponent(next.id)}`} aria-label="Następny plan"><Icon name="chevronRight" /></Link> : <button type="button" className={styles.iconButton} aria-label="Następny plan" disabled><Icon name="chevronRight" /></button>}
    <div className={styles.dots} aria-label="Wybierz plan">{plans.map((plan, position) => <Link key={plan.id} href={`/?plan=${encodeURIComponent(plan.id)}`} aria-current={plan.id === selectedId ? "true" : undefined} aria-label={`Pokaż plan ${position + 1}: ${plan.name}`}><span /></Link>)}</div>
  </div>;
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const configured = Boolean(getSupabaseConfig());
  const { plan: requested } = await searchParams;
  let failure: "session" | "read" | null = null;
  let plans: ListedPlan[] = [];
  let active: WorkoutSummary[] = [];
  let selected: ListedPlan | null = null;
  let loaded: Awaited<ReturnType<typeof getPlanDocument>> = null;
  if (configured) {
    try {
      const [listed, workouts] = await Promise.all([getPlanList(), getActiveWorkouts()]);
      plans = listed ?? [];
      active = workouts;
      selected = plans.find((plan) => plan.id === requested) ?? plans.find((plan) => plan.status !== "archived" && plan.current_version_id) ?? plans.find((plan) => plan.current_version_id) ?? plans[0] ?? null;
      loaded = selected?.current_version_id ? await getPlanDocument(selected.id) : null;
    } catch (error) {
      if (isFrameworkError(error)) throw error;
      failure = error instanceof Error && error.message === "Sesja wygasła." ? "session" : "read";
    }
  }

  const sessions = loaded ? loaded.document.sessions.map((session, position) => ({
    id: loaded.sessionIds[position],
    title: session.dayLabel,
    code: String(position + 1),
    meta: `${countLabel(session.exercises.length, "ćwiczenie", "ćwiczenia", "ćwiczeń")} · ${countLabel(session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0), "seria", "serie", "serii")}`,
    href: `/plany/${selected!.id}?session=${loaded.sessionIds[position]}`,
  })) : [];
  const firstSession = sessions[0];
  const archived = selected?.status === "archived";
  const canStart = !failure && !active.length && Boolean(selected && !archived && loaded && firstSession);
  const [resume, ...otherActive] = active;

  return <AppShell section="Trening"><div className={`${styles.surface} ${styles.screen}`}>
    {!configured && <Notice tone="warning" title="Dane demonstracyjne">Ten ekran pokazuje dane syntetyczne. Wpisy w podglądzie treningu nie są zapisywane.</Notice>}
    <div className={styles.heading}><div>
      <p className={styles.eyebrow}>Dzisiaj</p>
      <h1>Twój trening</h1>
      <p>{failure === "session" ? "Zaloguj się, aby wczytać prywatne plany." : failure === "read" ? "Odczyt się nie powiódł. To nie jest puste konto." : resume ? "Masz rozpoczęty trening." : selected ? "Wybierz jednostkę i zacznij." : "Dodaj plan, aby rozpocząć trening."}</p>
    </div></div>

    {failure === "session" && <div className={styles.stack}><Notice tone="warning" title="Sesja wygasła">Zaloguj się ponownie. Plany i zapisane treningi nie zostały usunięte.</Notice><DominantLink href="/logowanie">Zaloguj się</DominantLink></div>}
    {failure === "read" && <div className={styles.stack}><Notice tone="danger" title="Nie udało się wczytać planu">Sprawdź połączenie i spróbuj ponownie. Twoje dane nie zostały zmienione.</Notice><DominantLink href="/">Spróbuj ponownie</DominantLink></div>}

    {!configured && <section className={styles.hero}><p className={styles.eyebrow}>Plan demonstracyjny</p><h2>Fundament siły</h2><p>{countLabel(demoDays.length, "trening", "treningi", "treningów")} do wyboru · przykład</p><DominantLink href="/plany/a">Otwórz plan</DominantLink></section>}
    {!configured && <><h2 className={styles.sectionTitle}>Wybierz trening</h2><div className={styles.list}>{demoDays.map((day) => <ListRow key={day.id} code={day.id.toUpperCase()} title={day.title} meta={`${countLabel(day.exercises.length, "ćwiczenie", "ćwiczenia", "ćwiczeń")} · ${day.focus}`} href={`/plany/${day.id}`} />)}</div></>}

    {configured && !failure && resume && <section className={styles.hero}><p className={styles.eyebrow}>W toku</p><h2>{resume.name}</h2><p>{workoutClock(resume)}</p><DominantLink href={`/trening/${resume.id}`}>Wznów trening</DominantLink></section>}
    {configured && !failure && otherActive.length > 0 && <div className={styles.list}>{otherActive.map((workout) => <ListRow key={workout.id} title="Wznów trening" meta={`${workout.name} · ${workoutClock(workout)}`} href={`/trening/${workout.id}`} />)}</div>}

    {configured && !failure && !selected && <EmptyState title="Nie masz jeszcze planu" action={<DominantLink href="/plany/import">Utwórz lub zaimportuj plan</DominantLink>}>Wpisz go ręcznie albo zaimportuj dokument do sprawdzenia.</EmptyState>}

    {configured && !failure && selected && <>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{archived ? "Wersja archiwalna" : selected.status === "active" ? "Aktywny plan" : "Szkic"}</p>
        <h2>{loaded?.document.name ?? selected.name}</h2>
        <p>{loaded ? `${countLabel(loaded.document.sessions.length, "trening", "treningi", "treningów")}${firstSession ? ` · pierwsza jednostka: ${firstSession.title}` : ""}` : "Brak opublikowanej wersji"}</p>
        {canStart && firstSession && <DominantLink href={firstSession.href}>Rozpocznij {firstSession.title}</DominantLink>}
        {archived && <Notice tone="info" title="Archiwum">Tej wersji nie można rozpocząć.</Notice>}
        {!archived && !loaded && <DominantLink href={`/plany/edytor?plan=${selected.id}`}>Dokończ szkic</DominantLink>}
      </section>
      <PlanSwitcher plans={plans} selectedId={selected.id} />
      {loaded && <>
        <div className={styles.sectionHead}><h2 className={styles.sectionTitle}>Wybierz trening</h2><Link className={styles.inline} href={`/plany/${selected.id}`}>Otwórz plan</Link></div>
        {sessions.length ? <div className={styles.list}>{sessions.map((session) => <ListRow key={session.id} code={session.code} title={session.title} meta={session.meta} href={session.href} />)}</div> : <p className={styles.muted}>Ten plan nie ma jeszcze opublikowanych treningów.</p>}
      </>}
    </>}

    {configured && !failure && plans.length > 0 && <div className={styles.split}><Link className={styles.secondary} href="/plany/import"><Icon name="upload" />Importuj</Link><Link className={styles.secondary} href="/plany">Wszystkie plany</Link></div>}
  </div></AppShell>;
}
