export type Period = "1m" | "3m" | "6m" | "1y" | "all" | "custom";
export type DateRange = { from: string; to: string };
export const dateNumber = (date: string) => Date.parse(`${date}T00:00:00Z`);
export const isoDay = (time: number) => new Date(time).toISOString().slice(0, 10);
/** Kalendarzowe miesiące z ograniczeniem np. 31 marca → 28/29 lutego. */
export function subtractMonths(date: string, months: number) {
  const parsed = new Date(dateNumber(date));
  const day = parsed.getUTCDate();
  parsed.setUTCDate(1); parsed.setUTCMonth(parsed.getUTCMonth() - months);
  const last = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth() + 1, 0)).getUTCDate();
  parsed.setUTCDate(Math.min(day, last));
  return isoDay(parsed.getTime());
}
export function periodRange(period: Exclude<Period, "custom">, today: string, firstDate?: string): DateRange {
  return { from: period === "all" ? firstDate ?? subtractMonths(today, 3) : subtractMonths(today, { "1m": 1, "3m": 3, "6m": 6, "1y": 12 }[period]), to: today };
}
export function resizeRange(range: DateRange, factor: number): DateRange {
  const from = dateNumber(range.from), to = dateNumber(range.to), center = (from + to) / 2;
  const half = Math.max(86400000, (to - from) * factor) / 2;
  return { from: isoDay(center - half), to: isoDay(center + half) };
}
export function moveRange(range: DateRange, fraction: number): DateRange {
  const shift = Math.round(Math.max(86400000, dateNumber(range.to) - dateNumber(range.from)) * fraction / 86400000) * 86400000;
  return { from: isoDay(dateNumber(range.from) + shift), to: isoDay(dateNumber(range.to) + shift) };
}
