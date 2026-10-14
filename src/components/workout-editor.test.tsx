import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WorkoutEditor } from "./workout-editor";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

test("ręczny zapis po utracie odpowiedzi ponawia ten sam identyfikator i rewizję", async () => {
  const fetchMock = vi.fn().mockRejectedValue(new Error("Przerwane połączenie"));
  vi.stubGlobal("fetch", fetchMock);
  const loaded = { workout: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", status: "in_progress", revision: 4,
    performed_on: "2026-10-11", comment: null }, exercises: [{ id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    exercise_id: "cccccccc-cccc-4ccc-8ccc-cccccccccccc", position: 1, source_kind: "planned",
    target_name_snapshot: "Przysiad", target_note_snapshot: null, superset_group_snapshot: null,
    previousResult: null, sets: [{ id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd", performed_exercise_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      position: 1, source_kind: "planned", status: "pending", target_amrap_snapshot: false,
      target_reps_min_snapshot: 6, target_reps_max_snapshot: null, target_duration_seconds_snapshot: null,
      target_load_type_snapshot: "percent_1rm", target_percent_snapshot: 75,
      rounded_target_kg_snapshot: null, target_note_snapshot: null, actual_reps: null, actual_kg: null,
      actual_duration_seconds: null, actual_distance_meters: null, actual_rpe: null, actual_rir: null, actual_note: null }] }] };
  render(<WorkoutEditor loaded={loaded as Parameters<typeof WorkoutEditor>[0]["loaded"]} />);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Powtórzenia" }), { target: { value: "6" } });
  fireEvent.click(screen.getByRole("button", { name: "Zapisz serię" }));
  await screen.findByText("Przerwane połączenie");
  fireEvent.click(screen.getByRole("button", { name: "Ponów tę samą operację" }));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  const first = JSON.parse(fetchMock.mock.calls[0][1].body);
  const second = JSON.parse(fetchMock.mock.calls[1][1].body);
  expect(second).toEqual(first);
  expect(first).toMatchObject({ expectedRevision: 4, action: "save_set", payload: { actualReps: 6, actualKg: null } });
});
