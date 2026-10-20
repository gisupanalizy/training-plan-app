"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { Icon } from "@/components/ui/icon";
import type { WorkoutSummary } from "@/lib/workouts/contracts";
import { calendarDateLabel, calendarDays, calendarSelection, calendarTimeLabel, calendarWorkoutHref, shiftCalendarDay, shiftCalendarMonth } from "@/lib/workouts/calendar";
import styles from "./history-calendar.module.css";

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"] as const;
const WEEKDAY_NAMES = ["Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"];

type Props = { completed: WorkoutSummary[]; active: WorkoutSummary[]; today: string; timeZone: string; initialMonth?: string | string[]; initialDay?: string | string[] };

function dayTitle(day: string) {
  const label = calendarDateLabel(day, { weekday: "long", day: "numeric", month: "long" });
  return label.charAt(0).toLocaleUpperCase("pl-PL") + label.slice(1);
}

export function HistoryCalendar({ completed, active, today, timeZone, initialMonth, initialDay }: Props) {
  const [selection, setSelection] = useState(() => calendarSelection(initialMonth, initialDay, today));
  const grid = useRef<HTMLDivElement>(null);
  const { month, day } = selection;
  useEffect(() => {
    const restore = () => {
      const query = new URLSearchParams(window.location.search);
      setSelection(calendarSelection(query.getAll("month").length === 1 ? query.get("month") : null, query.getAll("day").length === 1 ? query.get("day") : null, today));
    };
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [today]);
  const choose = (next: string | null, focus = false) => {
    if (!next) return;
    const nextMonth = next.slice(0, 7);
    setSelection({ month: nextMonth, day: next });
    window.history.replaceState(null, "", `/historia?month=${nextMonth}&day=${next}`);
    if (focus) requestAnimationFrame(() => grid.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus());
  };
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, value: string) => {
    const index = (new Date(`${value}T12:00:00Z`).getUTCDay() + 6) % 7;
    const shifts: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -index, End: 6 - index };
    if (event.key in shifts) { event.preventDefault(); choose(shiftCalendarDay(value, shifts[event.key]), true); }
    else if (event.key === "PageUp" || event.key === "PageDown") { event.preventDefault(); choose(shiftCalendarMonth(value, event.key === "PageUp" ? -1 : 1), true); }
  };
  const selected = completed.filter(row => row.performedOn === day);
  const count = new Map<string, number>();
  for (const row of completed) count.set(row.performedOn, (count.get(row.performedOn) ?? 0) + 1);
  const entry = (row: WorkoutSummary, ongoing: boolean) => {
    const when = row.performedOn === today ? "Dzisiaj" : calendarDateLabel(row.performedOn);
    const time = calendarTimeLabel(row);
    return <li key={row.id}><Link className={ongoing ? styles.resume : styles.entry} href={calendarWorkoutHref(row.id, month, day)}>{ongoing && <span className={styles.resumeMark}><Icon name="training" size={18} /></span>}<span className={styles.entryText}><strong>{row.name}</strong><small>{ongoing ? `${when} · ${time} · w toku` : `${time} · zakończony`}</small></span>{ongoing ? <span className={styles.resumeAction}>Wznów</span> : <span className={styles.openAction}>Otwórz trening<Icon name="chevronRight" size={18} /></span>}</Link></li>;
  };
  return <div className={styles.page}>
    <header className={styles.heading}><p className={styles.eyebrow}>Dziennik</p><h1>Historia</h1></header>
    <section aria-label="Kalendarz treningów">
      <div className={styles.toolbar}><button className={styles.iconButton} type="button" aria-label="Poprzedni miesiąc" disabled={!shiftCalendarMonth(day, -1)} onClick={() => choose(shiftCalendarMonth(day, -1))}><Icon name="chevronLeft" /></button><h2 aria-live="polite">{calendarDateLabel(`${month}-01`, { month: "long", year: "numeric" })}</h2><button className={styles.iconButton} type="button" aria-label="Następny miesiąc" disabled={!shiftCalendarMonth(day, 1)} onClick={() => choose(shiftCalendarMonth(day, 1))}><Icon name="chevronRight" /></button></div>
      <div className={styles.grid} ref={grid}>{WEEKDAYS.map((label, index) => <span key={label} className={styles.weekday} aria-label={WEEKDAY_NAMES[index]}>{label}</span>)}{calendarDays(month).map((value, index) => value ? <button key={value} type="button" data-day={value} className={styles.day} tabIndex={value === day ? 0 : -1} aria-pressed={value === day} aria-current={value === today ? "date" : undefined} aria-label={`${calendarDateLabel(value, { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · zakończone treningi: ${count.get(value) ?? 0}`} onClick={() => choose(value)} onKeyDown={event => onKey(event, value)}>{Number(value.slice(-2))}{count.has(value) && <span className={styles.marker} aria-hidden="true">{count.get(value)}</span>}</button> : <span key={`empty-${index}`} aria-hidden="true" />)}</div>
      <p className={styles.legend}>Liczba pod datą oznacza zakończone treningi.</p>
    </section>
    <section aria-labelledby="selected-history-day">
      <div className={styles.sectionHead}><h2 id="selected-history-day">{dayTitle(day)}</h2><button className={styles.today} type="button" onClick={() => choose(today, true)}>Dzisiaj</button></div>
      <div aria-live="polite">{selected.length ? <ul className={styles.list}>{selected.map(row => entry(row, false))}</ul> : <EmptyState title="Brak zakończonych treningów tego dnia.">Wybierz inny dzień albo rozpocznij trening z planu.</EmptyState>}</div>
    </section>
    {active.length > 0 && <section aria-labelledby="active-history"><h2 id="active-history">Do wznowienia</h2><ul className={styles.list}>{active.map(row => entry(row, true))}</ul></section>}
    <p className={styles.timeZone}>Daty i godziny w strefie {timeZone}. Starsze wpisy bez godziny zachowują zapisaną datę.</p>
    <Link href="/postep" className={styles.progress}>Zobacz postęp<Icon name="arrowRight" size={18} /></Link>
  </div>;
}
