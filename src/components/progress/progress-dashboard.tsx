"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button, InfoPopover } from "@/components/ui";
import type { ExerciseAnalytics, Metric, ProgressPoint, SourceSet } from "@/lib/progress/analytics";
import { dateNumber, isoDay, moveRange, periodRange, resizeRange, type DateRange, type Period } from "@/lib/progress/ranges";
import styles from "./progress.module.css";

export const metricLabels: Record<Metric, string> = { estimatedMax: "Szacowany 1RM", maxWeight: "Max Ciężar", volume: "Objętość", maxReps: "Max Powtórzeń", totalReps: "Suma Powtórzeń", setCount: "Liczba serii" };
const shortDate = (value: string) => new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(dateNumber(value)));
const fullDate = (value: string) => new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(dateNumber(value)));
const statusName = (status: string) => status === "completed" ? "Zakończony" : status === "abandoned" ? "Przerwany" : "W toku";
export function formatMetric(value: number, metric: Metric) { return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: metric === "estimatedMax" ? 1 : metric === "maxWeight" || metric === "volume" ? 2 : 0 }).format(value); }
const unit = (metric: Metric) => ["estimatedMax", "maxWeight", "volume"].includes(metric) ? "kg" : metric === "setCount" ? "serii" : "powt.";
function pointTime(point: ProgressPoint) { return point.performedAt ? new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit", timeZone: point.timeZone }).format(new Date(point.performedAt)) : "godzina nieznana"; }
function seriesText(source: SourceSet) { return `${source.kg === null ? "bez wpisanego kg" : `${formatMetric(source.kg, "maxWeight")} kg`} · ${source.reps === null ? "brak powtórzeń" : `${source.reps} powt.`}`; }
function pointMoment(point: ProgressPoint) {
  if (!point.performedAt) return dateNumber(point.date) + 43200000;
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: point.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(point.performedAt));
  return dateNumber(point.date) + (Number(parts.find(p => p.type === "hour")?.value) * 60 + Number(parts.find(p => p.type === "minute")?.value)) * 60000;
}

function ProgressChart({ points, metric, range, onRangeChange, onReset, controls }: { points: ProgressPoint[]; metric: Metric; range: DateRange; onRangeChange: (value: DateRange) => void; onReset: () => void; controls: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const drag = useRef<{ x: number; range: DateRange; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const latest = useRef({ range, onRangeChange });
  latest.current = { range, onRangeChange };
  const from = dateNumber(range.from), until = dateNumber(range.to) + 86400000;
  const shown = points.filter(p => p.date >= range.from && p.date <= range.to);
  const values = shown.map(p => p.metrics[metric]?.value).filter((n): n is number => n !== undefined);
  const maximum = values.length ? Math.max(...values) : 0;
  const minimum = values.length ? Math.min(...values) : 0;
  const padding = Math.max(1, (maximum - minimum) * .15, maximum * .05);
  const low = Math.max(0, minimum - padding), high = maximum + padding;
  const x = (point: ProgressPoint) => 48 + (pointMoment(point) - from) / Math.max(86400000, until - from) * 284;
  const y = (value: number) => 174 - (value - low) / (high - low) * 146;
  let line = "", previous = false;
  for (const point of shown) {
    const measurement = point.metrics[metric];
    if (!measurement) { previous = false; continue; }
    line += `${previous ? "L" : "M"}${x(point)},${y(measurement.value)} `;
    previous = true;
  }
  const chosen = shown.find(p => p.id === selected);
  const measurement = chosen?.metrics[metric];
  useEffect(() => { setSelected(null); }, [metric, range.from, range.to, points]);
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!(event.target as Element).closest?.("[data-progress-point]")) setSelected(null); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let pinch: { distance: number; range: DateRange } | null = null;
    const distance = (event: TouchEvent) => Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
    const start = (event: TouchEvent) => {
      suppressClick.current = false;
      if (event.touches.length === 2) { event.preventDefault(); pinch = { distance: distance(event), range: latest.current.range }; setSelected(null); suppressClick.current = true; }
    };
    const move = (event: TouchEvent) => { if (event.touches.length === 2 && pinch) { event.preventDefault(); latest.current.onRangeChange(resizeRange(pinch.range, pinch.distance / Math.max(1, distance(event)))); } };
    const end = (event: TouchEvent) => { if (event.touches.length < 2) pinch = null; };
    const wheel = (event: WheelEvent) => { if (event.ctrlKey) { event.preventDefault(); setSelected(null); latest.current.onRangeChange(resizeRange(latest.current.range, event.deltaY > 0 ? 1.2 : .8)); } };
    element.addEventListener("touchstart", start, { passive: false }); element.addEventListener("touchmove", move, { passive: false }); element.addEventListener("touchend", end); element.addEventListener("wheel", wheel, { passive: false });
    return () => { element.removeEventListener("touchstart", start); element.removeEventListener("touchmove", move); element.removeEventListener("touchend", end); element.removeEventListener("wheel", wheel); };
  }, []);
  const activatePoint = (id: string, detail: number) => { if (!suppressClick.current || detail === 0) setSelected(id); };
  return <><div ref={root} className={styles.plot} data-testid="progress-plot" data-from={range.from} data-to={range.to} tabIndex={0} role="group" aria-label="Wykres postępu. Plus i minus przybliżają, strzałki przesuwają daty."
    onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "Home") { event.preventDefault(); onReset(); }
      if (["+", "=", "-", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault(); onRangeChange(event.key === "ArrowLeft" ? moveRange(range, -.2) : event.key === "ArrowRight" ? moveRange(range, .2) : resizeRange(range, event.key === "-" ? 1.5 : 2 / 3));
      }
    }}
    onPointerDown={event => { if (event.pointerType !== "touch" && event.button === 0) { suppressClick.current = false; drag.current = { x: event.clientX, range, moved: false }; } }}
    onPointerMove={event => {
      const start = drag.current;
      if (!start || event.pointerType === "touch") return;
      const delta = event.clientX - start.x;
      if (Math.abs(delta) > 6 || start.moved) {
        if (!start.moved) { start.moved = true; event.currentTarget.setPointerCapture(event.pointerId); }
        suppressClick.current = true; setSelected(null); onRangeChange(moveRange(start.range, -delta / event.currentTarget.clientWidth));
      }
    }}
    onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); }}
    onPointerCancel={() => { drag.current = null; }}
    onClick={event => { if (!(event.target as Element).closest("[data-progress-point]")) setSelected(null); }}>
    <svg viewBox="0 0 350 220" aria-hidden="true" className={styles.chart}>
      {[0, 1, 2].map(i => { const value = low + (high - low) * i / 2; return <g key={i}><path d={`M48 ${y(value)}H332`} className={styles.grid} /><text x="40" y={y(value) + 4} textAnchor="end">{formatMetric(value, metric)}</text></g>; })}
      <text x="8" y="15">{unit(metric)}</text>
      <path d={line} className={styles.line} />
      {shown.map(p => p.metrics[metric] && <circle key={p.id} cx={x(p)} cy={y(p.metrics[metric]!.value)} r="4" className={styles.dot} />)}
      {[0, .5, 1].map(fraction => <text key={fraction} x={48 + fraction * 284} y="205" textAnchor={fraction === 0 ? "start" : fraction === 1 ? "end" : "middle"}>{shortDate(isoDay(from + (until - from - 86400000) * fraction))}</text>)}
    </svg>
    {shown.map(point => { const value = point.metrics[metric]; return value && <button key={point.id} type="button" data-progress-point={point.id} data-chart-point="true" className={styles.point} style={{ left: `${x(point) / 350 * 100}%`, top: `${y(value.value) / 220 * 100}%` }} aria-label={`${fullDate(point.date)}, ${pointTime(point)}, ${statusName(point.status)}: ${metricLabels[metric]} ${formatMetric(value.value, metric)} ${unit(metric)}`} aria-expanded={selected === point.id} onClick={event => { event.stopPropagation(); activatePoint(point.id, event.detail); }} />; })}
    {!values.length && <p className={styles.noMeasurements}>Brak porównywalnych wyników w tym okresie</p>}
    {chosen && measurement && <output className={styles.pointNote} data-testid="point-note" aria-live="polite"><strong>{fullDate(chosen.date)} · {pointTime(chosen)}</strong><span>{statusName(chosen.status)} · {chosen.timeZone}</span><strong>{metricLabels[metric]}: {formatMetric(measurement.value, metric)} {unit(metric)}</strong><span>{measurement.sources.length === 1 ? `Seria ${measurement.sources[0].position ?? "bez pozycji"}: ${seriesText(measurement.sources[0])}` : `${measurement.sources.length} serii · źródła w szczegółach wyników poniżej`}</span>{shown.filter(p => p.date === chosen.date).length > 1 && <span>Punkt {shown.filter(p => p.date === chosen.date).findIndex(p => p.id === chosen.id) + 1} z {shown.filter(p => p.date === chosen.date).length} treningów tego dnia</span>}</output>}
  </div>{controls}<details className={styles.pointList} data-testid="progress-point-list"><summary>Wybierz punkt z listy treningów</summary><p>Także punkty o tej samej dacie i wartości są osobnymi treningami. Numer rozróżnia wpisy; nie nadaje im nieznanej godziny.</p>{shown.filter(p => p.metrics[metric]).map((point, index) => <button type="button" key={point.id} data-progress-point={point.id} aria-pressed={selected === point.id} onPointerDown={() => { suppressClick.current = false; }} onClick={event => activatePoint(point.id, event.detail)}>Punkt {index + 1} · {fullDate(point.date)} · {pointTime(point)}<span>{statusName(point.status)} · {formatMetric(point.metrics[metric]!.value, metric)} {unit(metric)}</span></button>)}</details></>;
}

export function ProgressDashboard({ analytics, today, initialExercise, initialRange }: { analytics: ExerciseAnalytics[]; today: string; initialExercise?: string; initialRange?: DateRange }) {
  const options = [...analytics].sort((a, b) => a.exercise.name.localeCompare(b.exercise.name, "pl") || (a.exercise.variant ?? "").localeCompare(b.exercise.variant ?? "", "pl"));
  const defaultExercise = options.find(a => a.exercise.id === initialExercise) ?? options.find(a => a.points.length) ?? options[0];
  const [exerciseId, setExerciseId] = useState(defaultExercise?.exercise.id ?? "");
  const selected = options.find(a => a.exercise.id === exerciseId) ?? defaultExercise;
  const [metric, setMetric] = useState<Metric>(selected?.mode === "bodyweight" ? "maxReps" : "estimatedMax");
  const [period, setPeriod] = useState<Period>(initialRange ? "custom" : "3m");
  const defaultRange = () => periodRange("3m", today, selected?.points[0]?.date);
  const [range, setRange] = useState<DateRange>(initialRange ?? defaultRange());
  const [dateError, setDateError] = useState("");
  const touchRangeChange = (value: DateRange) => { setRange(value); setPeriod("custom"); };
  const metrics: Metric[] = selected?.mode === "bodyweight" ? ["maxReps", "totalReps"] : ["estimatedMax", "maxWeight", "volume"];
  const activeMetric = metrics.includes(metric) ? metric : metrics[0];
  const shown = selected?.points.filter(p => p.date >= range.from && p.date <= range.to) ?? [];
  const last = [...shown].reverse().find(p => p.metrics[activeMetric]);
  const records: Metric[] = selected?.mode === "bodyweight" ? ["maxReps", "totalReps", "setCount"] : ["estimatedMax", "maxWeight", "volume"];
  const [detailsOpen, setDetailsOpen] = useState(false);
  if (!selected) return <div className={styles.empty}><h2>Brak zapisanych wyników</h2><p>Wykonaj trening, a jego rzeczywiste wyniki pojawią się tutaj.</p><Link className="button button-dark" href="/plany">Przejdź do planów</Link></div>;
  return <div className={styles.dashboard}>
    <label className={styles.exercise}><span className={styles.srOnly}>Ćwiczenie i wariant</span><select aria-label="Ćwiczenie i wariant" value={selected.exercise.id} onChange={event => { setExerciseId(event.target.value); setMetric(options.find(a => a.exercise.id === event.target.value)?.mode === "bodyweight" ? "maxReps" : "estimatedMax"); const url = new URL(window.location.href); url.searchParams.set("exercise", event.target.value); window.history.replaceState(null, "", url); }}>{options.map(({ exercise }) => <option key={exercise.id} value={exercise.id}>{exercise.name}{exercise.variant ? ` · ${exercise.variant}` : ""}{exercise.equipment ? ` (${exercise.equipment})` : ""}</option>)}</select></label>
    <div className={styles.metrics} style={{ gridTemplateColumns: `repeat(${metrics.length}, minmax(0, 1fr))` }} role="group" aria-label="Metryka wykresu">{metrics.map(name => <button type="button" key={name} aria-pressed={activeMetric === name} onClick={() => setMetric(name)}>{metricLabels[name]}</button>)}</div>
    <section aria-label={metricLabels[activeMetric]}>
      <div className={styles.reading}><div><strong>{last ? `${formatMetric(last.metrics[activeMetric]!.value, activeMetric)} ${unit(activeMetric)}` : "Brak danych"}</strong><span>{last ? `Ostatni wynik · ${shortDate(last.date)}` : "Zmień zakres lub zapisz wynik treningu"}</span></div>{activeMetric === "estimatedMax" && <InfoPopover label="Jak liczymy szacowany 1RM"><strong>Jak liczymy szacowany 1RM?</strong><p>Ciężar serii dzielimy przez współczynnik dla 1–10 powtórzeń. Jeden punkt to najwyższy szacunek z treningu.</p><p>100 kg × 3 powt.: 100 ÷ 0,94 ≈ 106,4 kg.</p><p>1: 100% · 2: 97% · 3: 94% · 4: 92% · 5: 89% · 6: 86% · 7: 83% · 8: 81% · 9: 78% · 10: 75%.</p><p>Poza tym zakresem, przy braku kg lub nieporównywalnym obciążeniu nie szacujemy. Metoda: reference-table-v1.</p><p>To szacunek. Nie zmienia rzeczywistego 1RM wpisanego w Profilu ani historycznych celów.</p></InfoPopover>}</div>
      <ProgressChart key={selected.exercise.id} points={selected.points} metric={activeMetric} range={range} onRangeChange={touchRangeChange} onReset={() => { setPeriod("3m"); setRange(defaultRange()); }} controls={<>
      <div className={styles.periods} role="group" aria-label="Zakres czasu">{([["1m", "1M"], ["3m", "3M"], ["6m", "6M"], ["1y", "1R"], ["all", "Wszystko"]] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={period === value} onClick={() => { setPeriod(value); setRange(periodRange(value, today, selected.points[0]?.date)); }}>{label}</button>)}</div>
      <p className={styles.pointKey}>Punkt = trening · dotknij punktu, aby zobaczyć wynik</p>
      </>} />
    </section>
    {selected.mode === "unsupported" && <p className={styles.explanation}>To ćwiczenie nie ma jednoznacznej semantyki porównywalnego obciążenia. Wyniki pozostają w historii; nie przypisujemy im kg ani powtórzeń innego wariantu.</p>}
    <div className={styles.recordsHeading}><h2>Rekordy osobiste</h2><span>Cała historia</span></div>
    <div className={styles.records} tabIndex={0} role="region" aria-label="Rekordy osobiste, przewijaj w poziomie" data-testid="progress-records" onKeyDown={event => { if (event.target === event.currentTarget && ["ArrowLeft", "ArrowRight"].includes(event.key)) { event.preventDefault(); event.currentTarget.scrollBy({ left: event.key === "ArrowRight" ? 170 : -170, behavior: "smooth" }); } }}>{records.map(name => { const record = selected.records[name]; return <article key={name} className={styles.record} data-metric={name}><span>{name === "setCount" ? "Najwięcej serii" : metricLabels[name]}{name === "estimatedMax" && <small>szacowany</small>}</span><strong>{record ? `${formatMetric(record.measurement.value, name)} ${unit(name)}` : "Brak danych"}</strong>{record && <><small>{name === "maxWeight" ? record.measurement.sources[0].reps === null ? "brak powtórzeń" : `${record.measurement.sources[0].reps} powt.` : `${record.measurement.sources.length} ${record.measurement.sources.length === 1 ? "seria" : "serii"}`}</small><time dateTime={record.point.date}>{fullDate(record.point.date)}</time></>}</article>; })}</div>
    <details className={styles.details} open={detailsOpen} onToggle={event => setDetailsOpen(event.currentTarget.open)}><summary>O wykresie, daty i wyniki treningów</summary>
      <p>Własne wykonane serie, również z treningów w toku i przerwanych. Linia łączy wpisy, nie dodaje pomiarów. Brak danych to przerwa, a zero jest wynikiem. Rekordy obejmują całą historię niezależnie od okna wykresu.</p><p>Objętość = suma kg × powtórzenia porównywalnych serii. Nie mieszamy masy ciała, asysty, ciężaru na hantel ani niejednoznacznych dodatków. Dla masy ciała uwzględniamy wyłącznie powtórzenia bez asysty i dodatkowego ciężaru.</p>
      <div className={styles.zoom}><Button variant="secondary" onClick={() => touchRangeChange(resizeRange(range, 2 / 3))}>Przybliż</Button><Button variant="secondary" onClick={() => touchRangeChange(resizeRange(range, 1.5))}>Oddal</Button><Button variant="secondary" onClick={() => touchRangeChange(moveRange(range, -.5))}>Wcześniej</Button><Button variant="secondary" onClick={() => touchRangeChange(moveRange(range, .5))}>Później</Button><Button variant="secondary" onClick={() => { setPeriod("3m"); setRange(defaultRange()); }}>Reset zakresu</Button></div>
      <p>Rozsuń dwa palce na wykresie, aby przybliżyć daty. Jeden palec przewija stronę. Myszą przeciągnij wykres; klawiaturą użyj +/− i strzałek.</p>
      <form className={styles.custom} key={`${range.from}:${range.to}`} onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); const from = String(data.get("from")), to = String(data.get("to")); if (!from || !to || from > to) { setDateError("Podaj obie daty. Data od musi poprzedzać datę do."); return; } setDateError(""); touchRangeChange({ from, to }); }}><label>Od daty<input type="date" name="from" required defaultValue={range.from} /></label><label>Do daty<input type="date" name="to" required defaultValue={range.to} /></label><Button type="submit">Ustaw daty</Button>{dateError && <p role="alert">{dateError}</p>}</form>
      <h3>Wyniki w oknie wykresu</h3><div className={styles.history} data-testid="analytics-history">{shown.length ? shown.map(point => <article key={point.id} data-workout-id={point.workoutId}><h4>{fullDate(point.date)} · {pointTime(point)}</h4><p>{statusName(point.status)} · {point.timeZone}</p><p>{point.metrics[activeMetric] ? `${metricLabels[activeMetric]}: ${formatMetric(point.metrics[activeMetric]!.value, activeMetric)} ${unit(activeMetric)}` : "Brak porównywalnego wyniku dla tej metryki"}</p><Link href={`/trening/${point.workoutId}`}>Otwórz trening</Link><details><summary>Serie źródłowe i identyfikatory</summary><p>Trening: {point.workoutId}<br />Ćwiczenie katalogu: {point.exerciseId}</p><ul>{point.sets.map(source => <li key={source.setId}>{seriesText(source)}<br /><small>Seria: {source.setId}<br />Wykonane ćwiczenie: {source.performedExerciseId}</small>{point.metrics[activeMetric]?.sources.some(s => s.setId === source.setId) && <strong> · źródło metryki</strong>}</li>)}</ul></details></article>) : <p>Brak wykonanych serii w tym okresie.</p>}</div>
    </details>
  </div>;
}
