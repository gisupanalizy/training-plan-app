import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { demoDays } from "@/lib/demo-plan";
import { getPlanList } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";

export default async function PlansPage() {
  const configured = Boolean(getSupabaseConfig());
  const plans = configured ? await getPlanList() : [];
  return <AppShell section="Plany"><div className="eyebrow">TWOJA PRZESTRZEŃ / PLANY</div>
    <div className="page-heading"><div><h1>Twoje plany<span className="accent">.</span></h1><p>{configured ? "Prywatne plany zapisane na Twoim koncie." : "Jeden przykładowy plan, dwa dni treningowe."}</p></div>
      {configured && <div className="editor-actions"><Link className="button button-outline" href="/plany/import">Importuj plan</Link><Link className="button button-dark" href="/plany/edytor">+ Nowy plan</Link></div>}</div>
    {!configured && <><DemoNotice /><section className="plan-overview"><div className="plan-overview-top"><span className="label-small">PLAN DEMONSTRACYJNY / WERSJA POKAZOWA</span><span className="plan-icon">↗</span></div><h2>Fundament siły</h2><p>Prosty układ A/B z podstawowymi ćwiczeniami. Wszystkie wartości są syntetyczne.</p><div className="plan-meta"><span>02 dni treningowe</span><span>06 ćwiczeń</span><span>BEZ ZAPISU</span></div></section>
      <div className="section-heading"><div><div className="eyebrow">STRUKTURA PLANU</div><h2>Dni treningowe</h2></div></div><div className="plan-list">{demoDays.map((day, index) => <Link className="plan-list-item" href={`/plany/${day.id}`} key={day.id}><span className="list-index">0{index + 1}</span><span className="list-main"><strong>{day.label}: {day.title}</strong><small>{day.focus} · {day.exercises.length} ćwiczenia</small></span><span className="list-arrow" aria-hidden="true">↗</span></Link>)}</div></>}
    {configured && (plans.length ? <div className="plan-list">{plans.map((plan, index) => <Link className="plan-list-item" href={`/plany/${plan.id}`} key={plan.id}><span className="list-index">{String(index + 1).padStart(2, "0")}</span><span className="list-main"><strong>{plan.name}</strong><small>{plan.status === "active" ? "Aktywny plan" : "Szkic"}</small></span><span className="list-arrow" aria-hidden="true">↗</span></Link>)}</div> : <div className="empty-state"><span className="empty-symbol">▤</span><h2>Brak planów</h2><p>Utwórz pierwszy prywatny plan. Możesz zacząć od dni A/B i zmieniać parametry każdej serii.</p><Link className="button button-dark" href="/plany/edytor">Utwórz plan</Link></div>)}
  </AppShell>;
}
