import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { demoDays } from "@/lib/demo-plan";
import { getPlanList } from "@/lib/plans/repository";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getWorkoutList } from "@/lib/workouts/repository";

export default async function HomePage() {
  if (getSupabaseConfig()) {
    const [plans, workouts] = await Promise.all([getPlanList(), getWorkoutList()]);
    const active = workouts.find((workout) => workout.status === "in_progress");
    return <AppShell section="Trening"><div className="eyebrow">TWOJA PRZESTRZEŃ / TRENING</div>
      <section className="hero"><div className="hero-copy"><div className="hero-kicker">TWOJE PLANY</div><h1>Twój plan.<br /><em>Twój rytm.</em></h1><p>{active ? "Masz rozpoczęty trening. Możesz go wznowić." : plans.length ? "Otwórz prywatny plan i wybierz dzień treningowy." : "Zacznij od utworzenia prywatnego planu A/B."}</p><Link className="button button-light" href={active ? `/trening/${active.id}` : plans.length ? "/plany" : "/plany/edytor"}>{active ? "Wznów trening" : plans.length ? "Otwórz plany" : "Utwórz plan"} ↗</Link></div><div className="hero-art" aria-hidden="true"><span className="hero-ring ring-one" /><span className="hero-ring ring-two" /><span className="hero-monogram">F.</span></div></section></AppShell>;
  }
  return <AppShell section="Trening">
    <div className="eyebrow">TWOJA PRZESTRZEŃ / TRENING</div>
    <section className="hero">
      <div className="hero-copy"><div className="hero-kicker"><span className="status-dot" /> GOTOWY DO DZIAŁANIA?</div><h1>Zacznij od<br /><em>pierwszej serii.</em></h1><p>Wybierz dzień z przykładowego planu i zobacz, jak będzie wyglądał Twój trening.</p><Link className="button button-light" href="/trening/a">Zobacz trening A <span aria-hidden="true">↗</span></Link></div>
      <div className="hero-art" aria-hidden="true"><span className="hero-ring ring-one" /><span className="hero-ring ring-two" /><span className="hero-monogram">F.</span><span className="hero-art-caption">RUCH ZACZYNA SIĘ TUTAJ</span></div>
    </section>
    <DemoNotice />
    <div className="section-heading"><div><div className="eyebrow">PLAN W PIGUŁCE</div><h2>Wybierz swój dzień</h2></div><Link className="text-link" href="/plany">Cały plan <span aria-hidden="true">↗</span></Link></div>
    <div className="day-grid">{demoDays.map((day, index) => <Link href={`/plany/${day.id}`} className="day-card" key={day.id}><div className="day-card-top"><span className="day-number">0{index + 1}</span><span className="day-badge">{day.label}</span></div><div><h3>{day.title}</h3><p>{day.focus}</p></div><div className="day-card-footer"><span>{day.exercises.length} ćwiczenia · {day.duration}</span><span className="circle-arrow" aria-hidden="true">↗</span></div></Link>)}</div>
  </AppShell>;
}
