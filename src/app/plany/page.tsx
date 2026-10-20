import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { demoDays } from "@/lib/demo-plan";
import { getPlanDocument, getPlanList } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { PlanCarousel } from "@/components/plan-carousel";
import { EmptyState, Icon, Notice } from "@/components/ui";
import styles from "@/components/plan-workout.module.css";

function isFrameworkError(error: unknown) {
  return typeof error === "object" && error !== null && "digest" in error && typeof (error as { digest?: unknown }).digest === "string" && (error as { digest: string }).digest.startsWith("NEXT_");
}

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const configured = Boolean(getSupabaseConfig());
  const { plan: requested } = await searchParams;
  let failure: "session" | "read" | null = null;
  let plans: Awaited<ReturnType<typeof getPlanList>> = [];
  let selected: NonNullable<Awaited<ReturnType<typeof getPlanList>>>[number] | undefined;
  let loaded: Awaited<ReturnType<typeof getPlanDocument>> = null;
  if (configured) {
    try {
      plans = (await getPlanList()) ?? [];
      // Własność listy sprawdza repozytorium; obcy query nie jest przekazywany do odczytu dokumentu.
      selected = plans.find((plan) => plan.id === requested) ?? plans[0];
      loaded = selected?.current_version_id ? await getPlanDocument(selected.id) : null;
    } catch (error) {
      if (isFrameworkError(error)) throw error;
      failure = error instanceof Error && error.message === "Sesja wygasła." ? "session" : "read";
      plans = [];
      selected = undefined;
      loaded = null;
    }
  }
  return <AppShell section="Plany"><div className={`${styles.surface} ${styles.screen}`}>
    <div className={styles.heading}><div>
      <p className={styles.eyebrow}>Biblioteka</p>
      <h1>Twoje plany</h1>
      <p>{failure ? "Odczyt biblioteki się nie powiódł." : !configured ? "Przykładowa biblioteka, bez zapisu." : plans.length > 1 ? "Przesuń w lewo lub w prawo, aby wybrać plan." : plans.length === 1 ? "Twój plan, gotowy do otwarcia." : "Utwórz pierwszy prywatny plan albo zaimportuj dokument."}</p>
    </div></div>
    {!configured && <><Notice tone="warning" title="Dane demonstracyjne">Ten ekran pokazuje dane syntetyczne. Wpisy w podglądzie treningu nie są zapisywane.</Notice><PlanCarousel plans={[{ id: "demo", name: "Fundament siły", status: "active", href: "/plany/a" }]} selectedPlanId="demo" demo sessions={demoDays.map((day) => ({ id: day.id, name: `${day.label} · ${day.title}`, count: day.exercises.length, href: `/plany/${day.id}` }))} /></>}
    {failure === "session" && <div className={styles.stack}><Notice tone="warning" title="Sesja wygasła">Zaloguj się ponownie. Biblioteka planów nie została usunięta.</Notice><Link className={`${styles.primary} ${styles.block}`} href="/logowanie">Zaloguj się<Icon name="chevronRight" size={18} /></Link></div>}
    {failure === "read" && <div className={styles.stack}><Notice tone="danger" title="Nie udało się wczytać planów">Sprawdź połączenie i spróbuj ponownie. Twoje dane nie zostały zmienione.</Notice><Link className={`${styles.primary} ${styles.block}`} href="/plany">Spróbuj ponownie<Icon name="chevronRight" size={18} /></Link></div>}
    {configured && !failure && (selected ? <PlanCarousel plans={plans} selectedPlanId={selected.id} sessions={loaded?.document.sessions.map((session, position) => ({ id: loaded.sessionIds[position], name: session.dayLabel, count: session.exercises.length, href: `/plany/${selected.id}?session=${loaded.sessionIds[position]}` })) ?? []} /> : <EmptyState title="Pusta biblioteka" action={<Link className={`${styles.primary} ${styles.block}`} href="/plany/import">Utwórz lub zaimportuj plan<Icon name="chevronRight" size={18} /></Link>}>Utwórz pierwszy prywatny plan albo zaimportuj dokument.</EmptyState>)}
    {configured && !failure && Boolean(selected) && <div className={styles.split}><Link className={styles.secondary} href="/plany/import"><Icon name="upload" />Importuj</Link><Link className={styles.secondary} href="/plany/edytor"><Icon name="plus" />Nowy plan</Link></div>}
  </div></AppShell>;
}
