import Link from 'next/link';
import { AppShell, DemoNotice } from '@/components/app-shell';
import { demoDays } from '@/lib/demo-plan';
import { getPlanDocument, getPlanList } from '@/lib/plans/repository';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { PlanCarousel } from '@/components/plan-carousel';
import { Icon } from '@/components/ui';
import styles from '@/components/plan-workout.module.css';

export default async function PlansPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const configured = Boolean(getSupabaseConfig());
  const plans = configured ? await getPlanList() : [];
  const { plan: requested } = await searchParams;
  // Własność listy sprawdza repozytorium; obcy query nie jest przekazywany do odczytu dokumentu.
  const selected = plans.find(plan => plan.id === requested) ?? plans[0];
  const loaded = selected?.current_version_id ? await getPlanDocument(selected.id) : null;
  return <AppShell section="Plany"><div className={styles.surface}>
    <div className={styles.heading}><div><h1>Twoje plany</h1><p>{plans.length > 1 ? 'Przesuń w lewo lub w prawo, aby wybrać plan.' : 'Twój plan, gotowy do otwarcia.'}</p></div></div>
    {!configured && <><DemoNotice /><PlanCarousel plans={[{ id: 'demo', name: 'Fundament siły', status: 'active', href: '/plany/a' }]} selectedPlanId="demo" demo sessions={demoDays.map(day => ({ id: day.id, name: `${day.label} · ${day.title}`, count: day.exercises.length, href: `/plany/${day.id}` }))} /></>}
    {configured && (selected ? <PlanCarousel plans={plans} selectedPlanId={selected.id} sessions={loaded?.document.sessions.map((session, position) => ({ id: loaded.sessionIds[position], name: session.dayLabel, count: session.exercises.length, href: `/plany/${selected.id}?session=${loaded.sessionIds[position]}` })) ?? []} /> : <section className={styles.empty}><Icon name="plans" size={32} /><h2>Brak planów</h2><p>Utwórz pierwszy prywatny plan lub zaimportuj swój dokument.</p><Link className={styles.primary} href="/plany/edytor">Utwórz plan</Link></section>)}
    {configured && <div className={styles.split}><Link className={styles.secondary} href="/plany/import"><Icon name="upload" />Importuj plan</Link><Link className={styles.secondary} href="/plany/edytor"><Icon name="plus" />Nowy plan</Link></div>}
  </div></AppShell>;
}
