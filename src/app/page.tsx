import Link from 'next/link';
import { AppShell, DemoNotice } from '@/components/app-shell';
import { demoDays } from '@/lib/demo-plan';
import { getPlanDocument, getPlanList } from '@/lib/plans/repository';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { getActiveWorkouts } from '@/lib/workouts/repository';
import { Icon } from '@/components/ui';
import styles from '@/components/plan-workout.module.css';

export default async function HomePage() {
  const configured = Boolean(getSupabaseConfig());
  const [plans, active] = configured ? await Promise.all([getPlanList(), getActiveWorkouts()]) : [[], []];
  const plan = plans.find(item => item.current_version_id);
  const loaded = plan ? await getPlanDocument(plan.id) : null;
  return <AppShell section="Trening"><div className={styles.surface}>
    <div className={styles.heading}><div><h1>Twój trening</h1><p>{active.length ? 'Masz rozpoczęty trening. Wróć do zapisanych serii.' : 'Wybierz jednostkę z planu.'}</p></div></div>
    {!configured && <DemoNotice />}
    {active.map(workout => <Link className={styles.row} href={`/trening/${workout.id}`} key={workout.id}><span className={styles.letter}><Icon name="training" /></span><div><strong>Wznów trening · {workout.name}</strong><small>{workout.performedOn} · {workout.performedAt ? new Intl.DateTimeFormat('pl-PL', { timeZone: workout.timeZone, hour: '2-digit', minute: '2-digit' }).format(new Date(workout.performedAt)) : 'godzina nieznana'}</small></div><Icon name="chevronRight" /></Link>)}
    {(!configured || loaded) && <><section className={styles.hero}><h2>{loaded?.document.name ?? 'Fundament siły'}</h2><p>{loaded?.document.sessions.length ?? demoDays.length} treningi do wyboru{!configured ? ' · przykład' : ''}</p><Link className={styles.primary} href={plan ? `/plany/${plan.id}` : '/plany/a'}>Otwórz plan<Icon name="chevronRight" size={18} /></Link></section><h2 className={styles.sectionTitle}>Wybierz trening</h2>
      {loaded ? loaded.document.sessions.map((session, position) => <Link className={styles.row} href={`/plany/${plan!.id}?session=${loaded.sessionIds[position]}`} key={loaded.sessionIds[position]}><span className={styles.letter}>{position + 1}</span><div><strong>{session.dayLabel}</strong><small>{session.exercises.length} ćwiczeń · {session.exercises.reduce((sum, exercise) => sum + exercise.sets.length, 0)} serii</small></div><Icon name="chevronRight" /></Link>) : demoDays.map(day => <Link className={styles.row} href={`/plany/${day.id}`} key={day.id}><span className={styles.letter}>{day.id.toUpperCase()}</span><div><strong>{day.title}</strong><small>{day.exercises.length} ćwiczenia · {day.focus}</small></div><Icon name="chevronRight" /></Link>)}
    </>}
    {configured && !loaded && <section className={styles.empty}><h2>Twój pierwszy plan</h2><p>Wpisz ćwiczenia ręcznie lub zaimportuj plan, a potem wybierz trening.</p><Link className={styles.primary} href="/plany/edytor">Utwórz plan</Link></section>}
    {configured && <><Link className={styles.row} href="/plany/import"><span className={styles.letter}><Icon name="upload" /></span><div><strong>Importuj kolejny plan</strong><small>Plik, zdjęcie, tekst lub dyktowanie</small></div><Icon name="chevronRight" /></Link><Link className={styles.back} href="/plany">Wszystkie plany<Icon name="arrowRight" size={18} /></Link></>}
  </div></AppShell>;
}
