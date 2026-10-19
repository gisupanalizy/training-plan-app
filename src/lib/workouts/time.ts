import type { WorkoutRow, WorkoutSummary } from "./contracts";

/** Projekcja zgodna z SQL workout_local_date. Date-only nie zmienia dnia ze strefą. */
export function projectWorkoutTime(row: Pick<WorkoutRow, "performed_on" | "performed_at">, timeZone: string) {
  if (!row.performed_at) return { performedOn: row.performed_on, performedAt: null, timeZone, timeKnown: false };
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date(row.performed_at));
  const part = (type: string) => parts.find((p) => p.type === type)!.value;
  return { performedOn: `${part("year")}-${part("month")}-${part("day")}`, performedAt: row.performed_at, timeZone, timeKnown: true };
}
export function workoutSummary(row: WorkoutRow): WorkoutSummary {
  return { id: row.id, name: row.name ?? "Trening", status: row.status, revision: row.revision,
    ...projectWorkoutTime(row, row.time_zone ?? "Europe/Warsaw") };
}
/** Koniec zakresu jest wyłączny; porównujemy daty projekcji, nie UTC ani created_at. */
export function inWorkoutDateRange(date: string, from?: string, until?: string) {
  return (!from || date >= from) && (!until || date < until);
}
