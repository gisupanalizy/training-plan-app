import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { ProgressDashboard } from "@/components/progress/progress-dashboard";
import styles from "@/components/progress/progress.module.css";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getProgress, validDate } from "@/lib/progress/repository";

export const dynamic = "force-dynamic";

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ exercise?: string; from?: string; to?: string }> }) {
  if (!getSupabaseConfig()) return <AppShell section="Postęp"><div className={styles.page}><h1>Postęp</h1><DemoNotice /><div className={styles.empty}><h2>Brak zapisanych wyników</h2><p>Po skonfigurowaniu prywatnego konta wykonane treningi pojawią się tutaj.</p><Link className="button button-dark" href="/plany">Przejdź do planów</Link></div></div></AppShell>;
  const params = await searchParams;
  const from = validDate(params.from), to = validDate(params.to);
  const { entries, sessions, analytics, timeZone } = await getProgress(from, to);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const today = `${parts.find(p => p.type === "year")!.value}-${parts.find(p => p.type === "month")!.value}-${parts.find(p => p.type === "day")!.value}`;
  const selectedId = analytics.some(row => row.exercise.id === params.exercise) ? params.exercise : undefined;
  const history = selectedId ? entries.filter(row => row.exerciseId === selectedId) : entries;
  const format = (value: number) => new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(value);
  const status = (value: string) => value === "completed" ? "Zakończony" : value === "abandoned" ? "Przerwany" : "W toku";
  return <AppShell section="Postęp"><div className={styles.page}><h1>Postęp</h1>
    <ProgressDashboard analytics={analytics} today={today} initialExercise={selectedId} initialRange={from || to ? { from: from ?? analytics.flatMap(row => row.points).map(p => p.date).sort()[0] ?? today, to: to ?? today } : undefined} />
    <details className={styles.legacy}><summary>Wykonanie planu i pełna historia serii</summary><section data-progress-history="true">
      <h2>Wykonanie planu</h2>{sessions.length ? sessions.map(item => <article key={item.id}><strong>{item.performed_on} · {status(item.status)}</strong><p>{item.completedPlanned} z {item.planned} zaplanowanych serii wykonano · {item.skipped} pominięto · {item.pending} oczekuje</p><Link href={`/trening/${item.id}`}>Otwórz trening</Link></article>) : <p>Brak treningów w wybranym okresie.</p>}
      <h2>Historia ćwiczenia</h2>{history.length ? history.map((item, index) => <article key={`${item.workoutId}:${index}`}><h3>{item.name}{item.variant ? ` · ${item.variant}` : ""}</h3><p>{item.date} · {status(item.status)} · {item.completed} wykonano · {item.skipped} pominięto · {item.pending} oczekuje</p>{item.results.map((result, i) => <p key={i}>{result.reps === null ? "brak powtórzeń" : `${result.reps} powt.`} · {result.kg === null ? "bez wpisanego kg" : `${format(result.kg)} kg`}</p>)}<p className="progress-volume">Porównywalna objętość: {item.volumeSets ? `${format(item.volumeKg)} kg · ${item.volumeSets} serii` : "brak porównywalnych serii"}</p><Link href={`/trening/${item.workoutId}`}>Otwórz trening</Link></article>) : <p>Brak wyników dla wybranego filtra.</p>}
    </section></details>
  </div></AppShell>;
}
