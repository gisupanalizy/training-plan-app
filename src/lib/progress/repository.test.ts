import { beforeEach, describe, expect, it, vi } from "vitest";
const mocked = vi.hoisted(() => ({ createClient: vi.fn() }));
vi.mock("@/lib/supabase/server", () => mocked);
import { getProgress, validDate } from "./repository";

type Row = Record<string, unknown>;
const queries: { table: string; owner?: string; offset: number }[] = [];
function clientFixture(tables: Record<string, Row[]>, user: string | null = "owner-a") {
  return { auth: { getUser: async () => ({ data: { user: user ? { id: user } : null } }) }, from: (table: string) => {
    let rows = [...(tables[table] ?? [])], offset = 0, end = 499, owner: string | undefined;
    const query = {
      select: () => query, order: () => query,
      eq: (key: string, value: string) => { if (key === "owner_id") owner = value; rows = rows.filter(row => row[key] === value); return query; },
      in: (key: string, ids: string[]) => { expect(ids.length).toBeLessThanOrEqual(100); rows = rows.filter(row => ids.includes(String(row[key]))); return query; },
      range: (a: number, b: number) => { offset = a; end = b; return query; },
      then: (resolve: (value: unknown) => void) => { queries.push({ table, owner, offset }); resolve({ data: rows.slice(offset, end + 1), error: null }); },
    }; return query;
  } };
}
function fixture() {
  const workouts = Array.from({ length: 601 }, (_, index) => ({ owner_id: "owner-a", id: `w${index}`, performed_on: index === 600 ? "2020-01-01" : "2026-10-01", status: "completed", created_at: "2026-10-18", performed_at: null, time_zone: "Europe/Warsaw" }));
  const blocks = workouts.map(row => ({ owner_id: "owner-a", id: `p${row.id}`, workout_session_id: row.id, exercise_id: "e1", target_name_snapshot: "Przysiad", source_kind: "planned", position: 1 }));
  const sets = blocks.map((row, i) => ({ owner_id: "owner-a", id: `s${row.id}`, performed_exercise_id: row.id, source_kind: "planned", status: "completed", actual_kg: i === 600 ? 200 : 100, actual_reps: 3, target_kind_snapshot: "work", target_load_type_snapshot: "absolute", target_dumbbell_basis_snapshot: null }));
  // Jedna sesja z >500 bloków i jeden blok z >500 serii sprawdzają również stronicowanie dzieci.
  blocks.push(...Array.from({ length: 501 }, (_, i) => ({ ...blocks[0], id: `extra${i}` })));
  sets.push(...Array.from({ length: 501 }, (_, i) => ({ ...sets[0], id: `extra-set${i}` })));
  const exercises = Array.from({ length: 501 }, (_, i) => ({ owner_id: "owner-a", id: i === 0 ? "e1" : `unused${i}`, name: "Przysiad", variant: null, equipment: "sztanga", load_mode: "external" }));
  return { workout_read_model: workouts, performed_exercises: blocks, performed_sets: sets, exercises };
}
beforeEach(() => { queries.length = 0; mocked.createClient.mockReset(); });
describe("getProgress: pełny prywatny odczyt oraz zgodność zakresów T08", () => {
  it("stronicuje wszystkie tabele >500 i zachowuje PR spoza filtrowanych entries/sessions", async () => {
    mocked.createClient.mockResolvedValue(clientFixture(fixture()));
    const result = await getProgress("2026-10-01", "2026-10-01");
    expect(result.sessions).toHaveLength(600);
    expect(result.entries.every(e => e.date === "2026-10-01")).toBe(true);
    expect(result.analytics[0].points).toHaveLength(601);
    expect(result.analytics[0].records.maxWeight?.measurement.value).toBe(200);
    expect(result.analytics[0].records.maxWeight?.point.date).toBe("2020-01-01");
    expect(result.exercises).toHaveLength(501);
    for (const table of Object.keys(fixture())) expect(queries.some(q => q.table === table && q.offset >= 500)).toBe(true);
    expect(queries.every(q => q.owner === "owner-a")).toBe(true);
    expect(result.analytics[0].points.find(p => p.workoutId === "w0")?.sets).toHaveLength(502);
  });
  it("przyjmuje inkluzywne granice, bez filtra zwraca całą dawną historię", async () => {
    mocked.createClient.mockResolvedValue(clientFixture(fixture()));
    const result = await getProgress(); expect(result.sessions).toHaveLength(601);
    const old = await getProgress("2020-01-01", "2020-01-01"); expect(old.sessions.map(s => s.id)).toEqual(["w600"]);
    expect(validDate("2024-02-29")).toBe("2024-02-29"); expect(validDate("2026-02-29")).toBeUndefined();
  });
  it("B nie dostaje danych A, anon nie wykonuje zapytań", async () => {
    mocked.createClient.mockResolvedValue(clientFixture(fixture(), "owner-b"));
    const result = await getProgress(); expect(result.analytics).toEqual([]); expect(result.entries).toEqual([]);
    queries.length = 0; mocked.createClient.mockResolvedValue(clientFixture(fixture(), null));
    await expect(getProgress()).rejects.toThrow("Sesja wygasła."); expect(queries).toEqual([]);
  });
});
