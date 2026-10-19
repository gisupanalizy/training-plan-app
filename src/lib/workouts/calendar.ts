import type { WorkoutRow, WorkoutSummary } from "./contracts";
import { historyReturnHref } from "./presentation";
import { projectWorkoutTime } from "./time";

export function validCalendarDay(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const instant = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(instant.getTime()) && instant.toISOString().slice(0, 10) === value;
}
export function calendarSelection(month: unknown, day: unknown, today: string) {
  if (typeof month === "string" && typeof day === "string" && historyReturnHref(month, day) !== "/historia") return { month, day };
  return { month: today.slice(0, 7), day: today };
}
export function calendarDays(month: string): (string | null)[] {
  const first = `${month}-01`;
  if (!validCalendarDay(first)) return [];
  const date = new Date(`${first}T12:00:00Z`);
  const offset = (date.getUTCDay() + 6) % 7;
  const last = new Date(date); last.setUTCMonth(last.getUTCMonth() + 1); last.setUTCDate(0);
  return [...Array.from({ length: offset }, () => null), ...Array.from({ length: last.getUTCDate() }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`), ...Array.from({ length: (7 - (offset + last.getUTCDate()) % 7) % 7 }, () => null)];
}
export function shiftCalendarDay(day: string, amount: number): string | null {
  const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount);
  const next = date.toISOString().slice(0, 10);
  return validCalendarDay(next) ? next : null;
}
export function shiftCalendarMonth(day: string, amount: number): string | null {
  const date = new Date(`${day}T12:00:00Z`), oldDay = date.getUTCDate();
  date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() + amount);
  const end = new Date(date); end.setUTCMonth(end.getUTCMonth() + 1); end.setUTCDate(0);
  date.setUTCDate(Math.min(oldDay, end.getUTCDate()));
  const next = date.toISOString().slice(0, 10);
  return validCalendarDay(next) ? next : null;
}
export function historyCalendarData(rows: WorkoutRow[], timeZone: string) {
  const summaries: WorkoutSummary[] = rows.map(row => ({ id: row.id, name: row.name ?? "Trening", status: row.status, revision: row.revision, ...projectWorkoutTime(row, timeZone) }));
  const sort = (a: WorkoutSummary, b: WorkoutSummary) => a.performedOn.localeCompare(b.performedOn) || (a.performedAt ?? "~").localeCompare(b.performedAt ?? "~") || a.id.localeCompare(b.id);
  return { completed: summaries.filter(row => row.status === "completed").sort(sort), active: summaries.filter(row => row.status === "in_progress").sort(sort) };
}
export function calendarWorkoutHref(workoutId: string, month: string, day: string) {
  return `/trening/${encodeURIComponent(workoutId)}?historyMonth=${month}&historyDay=${day}`;
}
export function calendarDateLabel(day: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("pl-PL", { ...options, timeZone: "UTC" }).format(new Date(`${day}T12:00:00Z`));
}
export function calendarTimeLabel(row: WorkoutSummary) {
  return row.performedAt ? new Intl.DateTimeFormat("pl-PL", { timeZone: row.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(row.performedAt)) : "godzina nieznana";
}
