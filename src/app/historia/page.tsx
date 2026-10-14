import Link from "next/link";
import { AppShell, DemoNotice } from "@/components/app-shell";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { getWorkoutList } from "@/lib/workouts/repository";

export default async function HistoryPage() {
  if (getSupabaseConfig()) {
    const workouts = await getWorkoutList();
    return <AppShell section="Historia"><div className="eyebrow">TWOJA PRZESTRZEŃ / HISTORIA</div><div className="page-heading"><div><h1>Historia<span className="accent">.</span></h1><p>Zapisane treningi i sesje do wznowienia.</p></div><Link className="button button-outline" href="/postep">Zobacz postęp ↗</Link></div>
      {workouts.length ? <div className="plan-list">{workouts.map((workout) => <Link className="plan-list-item" key={workout.id} href={`/trening/${workout.id}`}><span className="list-index">◷</span><span className="list-main"><strong>{workout.performed_on} · {workout.status === "completed" ? "Zakończony" : "W toku"}</strong><small>Rewizja {workout.revision}{workout.comment ? ` · ${workout.comment}` : ""}</small></span><span className="list-arrow">↗</span></Link>)}</div> : <div className="empty-state"><h2>Brak treningów</h2><p>Wybierz dzień w swoim planie i rozpocznij trening.</p><Link className="button button-dark" href="/plany">Przejdź do planów</Link></div>}</AppShell>;
  }
  return <AppShell section="Historia"><div className="eyebrow">TWOJA PRZESTRZEŃ / HISTORIA</div><div className="page-heading"><div><h1>Historia<span className="accent">.</span></h1><p>Tu pojawią się zapisane treningi po wdrożeniu tej funkcji.</p></div></div><DemoNotice /><section className="empty-state"><span className="empty-symbol">◷</span><div className="eyebrow">JESZCZE PUSTO</div><h2>Każdy trening<br />ma swoją historię.</h2><p>Prototyp nie przechowuje wyników. Możesz obejrzeć przykładowy plan i widok treningu.</p><Link className="button button-dark" href="/plany">Przejdź do planu ↗</Link></section></AppShell>;
}
