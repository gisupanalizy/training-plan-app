import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getProgress, validDate } from "@/lib/progress/repository";

export const dynamic = "force-dynamic";

export default async function ProgressPage({ searchParams }: { searchParams: Promise<{ exercise?: string; from?: string; to?: string }> }) {
  if (!getSupabaseConfig()) return <AppShell section="Postęp"><div className="eyebrow">TWOJA PRZESTRZEŃ / POSTĘP</div><h1>Postęp<span className="accent">.</span></h1><DemoNotice /><div className="empty-state"><h2>Brak zapisanych wyników</h2><p>Po skonfigurowaniu prywatnego konta wykonane treningi pojawią się tutaj.</p><Link className="button button-dark" href="/plany">Przejdź do planów</Link></div></AppShell>;
  const params = await searchParams;
  const from = validDate(params.from);
  const to = validDate(params.to);
  const { entries, sessions, exercises } = await getProgress(from, to);
  const options = exercises.sort((a, b) => a.name.localeCompare(b.name, "pl") || (a.variant ?? "").localeCompare(b.variant ?? "", "pl"));
  const selectedId = options.some((item) => item.id === params.exercise) ? params.exercise : "";
  const shown = selectedId ? entries.filter((entry) => entry.exerciseId === selectedId) : entries;
  const format = (value: number) => new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 2 }).format(value);
  return <AppShell section="Postęp"><div className="eyebrow">TWOJA PRZESTRZEŃ / POSTĘP</div><div className="page-heading"><div><h1>Postęp<span className="accent">.</span></h1><p>Wyniki Twoich treningów, liczone na nowo po każdej poprawce.</p></div></div>
    <form className="progress-filters editor-card" method="get" action="/postep">
      <label className="editor-field">Ćwiczenie i wariant<select name="exercise" defaultValue={selectedId}><option value="">Wszystkie ćwiczenia</option>{options.map((item) => <option key={item.id} value={item.id}>{item.name}{item.variant ? ` · ${item.variant}` : " · bez wariantu"}{item.equipment ? ` · ${item.equipment}` : ""}</option>)}</select></label>
      <label className="editor-field">Od daty<input name="from" type="date" defaultValue={from ?? ""} /></label>
      <label className="editor-field">Do daty<input name="to" type="date" defaultValue={to ?? ""} /></label>
      <button className="button button-dark" type="submit">Pokaż wyniki</button>
    </form>
    <p className="small-muted">Objętość = wykonane powtórzenia × wpisany ciężar. Pokazujemy ją tylko dla serii z jawnym obciążeniem zewnętrznym o porównywalnej jednostce. Masa ciała, asysta, wartość na jeden hantel, dodatkowe serie bez określonego typu oraz brakujące dane nie są sumowane. Wynik nie jest rekordem 1RM.</p>
    <section className="progress-section"><h2>Wykonanie planu</h2>{sessions.length ? <div className="plan-list">{sessions.map((item) => <Link key={item.id} className="plan-list-item" href={`/trening/${item.id}`}><span className="list-index">◷</span><span className="list-main"><strong>{item.performed_on} · {item.status === "completed" ? "Zakończony" : item.status === "abandoned" ? "Przerwany" : "W toku"}</strong><small>{item.completedPlanned} z {item.planned} zaplanowanych serii wykonano · {item.skipped} pominięto · {item.pending} oczekuje</small></span><span className="list-arrow">↗</span></Link>)}</div> : <p>Brak treningów w wybranym okresie.</p>}</section>
    <section className="progress-section"><h2>Historia ćwiczenia</h2>{shown.length ? <div className="progress-list">{shown.map((item, index) => <article className="editor-card" key={`${item.workoutId}-${item.exerciseId}-${index}`}><div className="editor-row"><div><h3>{item.name}{item.variant ? ` · ${item.variant}` : ""}</h3><p className="small-muted">{item.date} · {item.completed} wykonano · {item.skipped} pominięto · {item.pending} oczekuje</p></div><Link className="text-link" href={`/trening/${item.workoutId}`}>Otwórz trening ↗</Link></div><div className="progress-results">{item.results.length ? item.results.map((result, resultIndex) => <span className="outline-tag" key={resultIndex}>{result.reps === null ? "— powt." : `${result.reps} powt.`} · {result.kg === null ? "bez wpisanego kg" : `${format(result.kg)} kg`}</span>) : <span className="small-muted">Brak wykonanych serii</span>}</div><p className="progress-volume">Porównywalna objętość: {item.volumeSets ? `${format(item.volumeKg)} kg · ${item.volumeSets} ${item.volumeSets === 1 ? "seria" : "serii"}` : "brak porównywalnych serii"}</p></article>)}</div> : <div className="empty-state"><h3>Brak wyników dla wybranego filtra</h3><p>Zmień daty lub wariant ćwiczenia.</p></div>}</section>
  </AppShell>;
}
