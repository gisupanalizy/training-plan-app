'use client';
import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/ui';
import styles from './plan-carousel.module.css';
import ui from './plan-workout.module.css';
export type PlanChoice = { id: string; name: string; status: string; href?: string };
export type PlanSessionChoice = { id: string; name: string; count: number; href: string };
export function PlanCarousel({ plans, selectedPlanId, sessions, demo = false }: { plans: PlanChoice[]; selectedPlanId: string; sessions: PlanSessionChoice[]; demo?: boolean }) {
  const router = useRouter();
  const track = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [index, setIndex] = useState(Math.max(0, plans.findIndex(plan => plan.id === selectedPlanId)));
  const aligned = useRef(false);
  const selectedRef = useRef(index); selectedRef.current = index;
  const drag = useRef<{ x: number; y: number; left: number } | null>(null);
  const dragged = useRef(false);
  const [pending, startTransition] = useTransition();
  function move(next: number, scroll = true) {
    next = Math.max(0, Math.min(plans.length - 1, next));
    if (scroll && track.current) track.current.scrollTo({ left: (track.current.children[next] as HTMLElement).offsetLeft, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    if (next === selectedRef.current) return;
    selectedRef.current = next; setIndex(next);
    if (!demo) startTransition(() => router.replace(`/plany?plan=${encodeURIComponent(plans[next].id)}`, { scroll: false }));
  }
  useEffect(() => {
    const next = Math.max(0, plans.findIndex(plan => plan.id === selectedPlanId));
    if (!aligned.current || next !== selectedRef.current) { aligned.current = true; selectedRef.current = next; setIndex(next); if (track.current) track.current.scrollLeft = (track.current.children[next] as HTMLElement).offsetLeft; }
  }, [selectedPlanId, plans]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const current = plans[index];
  if (!current) return null;
  return <>
    <div ref={track} className={styles.track} role="region" aria-roledescription="karuzela" aria-label="Twoje plany" tabIndex={0}
      onPointerDown={event => { dragged.current = false; if (event.pointerType === 'mouse' && event.button === 0) drag.current = { x: event.clientX, y: event.clientY, left: event.currentTarget.scrollLeft }; }}
      onPointerMove={event => { const start = drag.current; if (!start) return; const dx = event.clientX - start.x, dy = event.clientY - start.y; if (!dragged.current && Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) { dragged.current = true; event.currentTarget.setPointerCapture(event.pointerId); } if (dragged.current) { event.preventDefault(); event.currentTarget.scrollLeft = start.left - dx; } }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}
      onClickCapture={event => { if (dragged.current) { if (event.detail > 0) { event.preventDefault(); event.stopPropagation(); } dragged.current = false; } }}
      onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'Home' || event.key === 'End') { event.preventDefault(); move(event.key === 'Home' ? 0 : event.key === 'End' ? plans.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1)); } }}
      onScroll={() => { clearTimeout(timer.current); timer.current = setTimeout(() => { if (!track.current) return; const children = [...track.current.children] as HTMLElement[]; const nearest = children.reduce((best, item, i) => Math.abs(item.offsetLeft - track.current!.scrollLeft) < Math.abs(children[best].offsetLeft - track.current!.scrollLeft) ? i : best, 0); move(nearest, false); }, 140); }}>
      {plans.map((plan, position) => <section className={styles.slide} key={plan.id} aria-label={`${position + 1} z ${plans.length}: ${plan.name}`}><h2>{plan.name}</h2><p>{demo ? 'Plan demonstracyjny · dane syntetyczne' : plan.status === 'active' ? 'Prywatny plan · aktualna wersja' : 'Prywatny szkic'}</p><Link className={ui.primary} href={plan.href ?? `/plany/${plan.id}`}>Otwórz plan <Icon name="chevronRight" size={18} /></Link></section>)}
    </div>
    <div className={styles.bar}><button className={ui.iconButton} type="button" aria-label="Poprzedni plan" disabled={index === 0} onClick={() => move(index - 1)}><Icon name="chevronLeft" /></button><p role="status" aria-live="polite"><strong>Plan {index + 1} z {plans.length}</strong>{current.name}</p><button className={ui.iconButton} type="button" aria-label="Następny plan" disabled={index === plans.length - 1} onClick={() => move(index + 1)}><Icon name="chevronRight" /></button></div>
    {plans.length > 1 && <div className={styles.dots} aria-label="Wybierz plan">{plans.map((plan, position) => <button type="button" key={plan.id} aria-label={`Pokaż plan ${position + 1}: ${plan.name}`} aria-current={index === position} onClick={() => move(position)}><span /></button>)}</div>}
    <h2 className={ui.sectionTitle}>Treningi w planie</h2><div className={styles.sessions} aria-busy={pending || current.id !== selectedPlanId}>{current.id === selectedPlanId ? sessions.length ? sessions.map((session, position) => <Link key={session.id} className={ui.row} href={session.href}><span className={ui.letter}>{position + 1}</span><div><strong>{session.name}</strong><small>{session.count} ćwiczeń</small></div><Icon name="chevronRight" /></Link>) : <p className={ui.muted}>Ten plan nie ma jeszcze opublikowanych treningów.</p> : <p role="status" className={ui.muted}>Wczytywanie treningów…</p>}</div>
  </>;
}
